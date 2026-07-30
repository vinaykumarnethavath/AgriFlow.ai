"""
Translation API — AI-powered multilingual translation using Hugging Face Inference API.

Uses Facebook's NLLB-200 (No Language Left Behind) model for high-quality
translation across 8 Regional Indian Languages. Results are cached in-memory
to minimize API calls.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import os
import hashlib
import httpx

router = APIRouter(prefix="/api/translate", tags=["translation"])

# ── Supported Languages ──────────────────────────────────────────────────────

SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
    "ta": "Tamil",
    "kn": "Kannada",
    "mr": "Marathi",
    "bn": "Bengali",
    "gu": "Gujarati",
    "pa": "Punjabi",
}

# NLLB-200 language codes (BCP-47 style used by the model)
NLLB_LANG_CODES = {
    "en": "eng_Latn",
    "hi": "hin_Deva",
    "te": "tel_Telu",
    "ta": "tam_Taml",
    "kn": "kan_Knda",
    "mr": "mar_Deva",
    "bn": "ben_Beng",
    "gu": "guj_Gujr",
    "pa": "pan_Guru",
}

# ── Request / Response Models ─────────────────────────────────────────────────

class TranslateRequest(BaseModel):
    texts: list[str] = Field(..., max_length=50, description="List of texts to translate (max 50)")
    target_lang: str = Field(..., description="Target language code (hi, te, ta, kn, mr, bn, gu, pa)")
    source_lang: str = Field(default="en", description="Source language code")

class TranslateResponse(BaseModel):
    translations: list[str]
    target_lang: str
    cached: bool = False

# ── In-Memory Cache ───────────────────────────────────────────────────────────

_translation_cache: dict[str, str] = {}
MAX_CACHE_SIZE = 5000

def _cache_key(text: str, source: str, target: str) -> str:
    """Generate a deterministic cache key."""
    raw = f"{source}:{target}:{text}"
    return hashlib.md5(raw.encode("utf-8")).hexdigest()

def _get_cached(text: str, source: str, target: str) -> Optional[str]:
    key = _cache_key(text, source, target)
    return _translation_cache.get(key)

def _set_cached(text: str, source: str, target: str, translation: str):
    if len(_translation_cache) >= MAX_CACHE_SIZE:
        # Evict oldest 20% when cache is full
        evict_count = MAX_CACHE_SIZE // 5
        keys_to_evict = list(_translation_cache.keys())[:evict_count]
        for k in keys_to_evict:
            del _translation_cache[k]
    key = _cache_key(text, source, target)
    _translation_cache[key] = translation

# ── Hugging Face Translation Engine ──────────────────────────────────────────

HF_API_URL = "https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M"

async def _translate_single_hf(text: str, source_lang: str, target_lang: str, api_key: str) -> str:
    """Translate a single text using Hugging Face Inference API with NLLB-200."""
    src_code = NLLB_LANG_CODES.get(source_lang, "eng_Latn")
    tgt_code = NLLB_LANG_CODES.get(target_lang, "hin_Deva")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "inputs": text,
        "parameters": {
            "src_lang": src_code,
            "tgt_lang": tgt_code,
        },
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(HF_API_URL, json=payload, headers=headers)

        if response.status_code == 503:
            # Model is loading — retry once after a short wait
            import asyncio
            estimated_time = response.json().get("estimated_time", 20)
            wait_time = min(estimated_time, 30)
            print(f"[translate] Model loading, waiting {wait_time}s...")
            await asyncio.sleep(wait_time)
            response = await client.post(HF_API_URL, json=payload, headers=headers)

        if response.status_code != 200:
            print(f"[translate] HF API error {response.status_code}: {response.text[:300]}")
            raise HTTPException(
                status_code=502,
                detail=f"Translation service error: {response.status_code}"
            )

        result = response.json()

        # HF API returns: [{"translation_text": "..."}]
        if isinstance(result, list) and len(result) > 0:
            return result[0].get("translation_text", text)
        
        return text


async def _translate_batch_hf(texts: list[str], source_lang: str, target_lang: str) -> list[str]:
    """Translate a batch of texts using Hugging Face Inference API."""
    api_key = os.getenv("HUGGINGFACE_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Translation service not configured (missing HUGGINGFACE_API_KEY)"
        )

    import asyncio

    # Process in parallel with concurrency limit
    semaphore = asyncio.Semaphore(5)  # Max 5 concurrent requests

    async def translate_with_limit(text: str) -> str:
        async with semaphore:
            try:
                return await _translate_single_hf(text, source_lang, target_lang, api_key)
            except Exception as e:
                print(f"[translate] Failed for '{text[:50]}...': {e}")
                return text  # Fallback to original on error

    tasks = [translate_with_limit(t) for t in texts]
    results = await asyncio.gather(*tasks)
    return list(results)


# ── API Endpoints ─────────────────────────────────────────────────────────────

@router.post("/", response_model=TranslateResponse)
async def translate_texts(req: TranslateRequest):
    """
    Translate a batch of texts to a target Indian language.
    Uses Hugging Face NLLB-200 model with in-memory caching.
    """
    # Validate target language
    if req.target_lang not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language: {req.target_lang}. Supported: {list(SUPPORTED_LANGUAGES.keys())}"
        )

    # If source == target, return as-is
    if req.source_lang == req.target_lang:
        return TranslateResponse(translations=req.texts, target_lang=req.target_lang, cached=True)

    # Validate text lengths
    for text in req.texts:
        if len(text) > 500:
            raise HTTPException(status_code=400, detail=f"Text exceeds 500 character limit: '{text[:50]}...'")

    # Check cache for each text
    results: list[Optional[str]] = []
    uncached_indices: list[int] = []
    uncached_texts: list[str] = []

    for i, text in enumerate(req.texts):
        cached = _get_cached(text, req.source_lang, req.target_lang)
        if cached is not None:
            results.append(cached)
        else:
            results.append(None)
            uncached_indices.append(i)
            uncached_texts.append(text)

    all_cached = len(uncached_texts) == 0

    # Translate uncached texts
    if uncached_texts:
        translations = await _translate_batch_hf(uncached_texts, req.source_lang, req.target_lang)

        # Store in cache and fill results
        for idx, (orig, trans) in enumerate(zip(uncached_texts, translations)):
            _set_cached(orig, req.source_lang, req.target_lang, trans)
            results[uncached_indices[idx]] = trans

    return TranslateResponse(
        translations=[r or t for r, t in zip(results, req.texts)],
        target_lang=req.target_lang,
        cached=all_cached,
    )


@router.get("/languages")
async def get_supported_languages():
    """Return list of supported languages for the UI."""
    return {
        "languages": [
            {"code": code, "name": name, "native_name": native}
            for code, name, native in [
                ("en", "English", "English"),
                ("hi", "Hindi", "हिन्दी"),
                ("te", "Telugu", "తెలుగు"),
                ("ta", "Tamil", "தமிழ்"),
                ("kn", "Kannada", "ಕನ್ನಡ"),
                ("mr", "Marathi", "मराठी"),
                ("bn", "Bengali", "বাংলা"),
                ("gu", "Gujarati", "ગુજરાતી"),
                ("pa", "Punjabi", "ਪੰਜਾਬੀ"),
            ]
        ]
    }

"""
YouTube Data API v3 service for the Learning Hub.

Fetches personalized agricultural videos based on farmer's crops, season,
and regional language. Includes aggressive in-memory caching (6hr TTL)
to stay well within the free 10,000 units/day quota.
"""

import os
import time
import httpx
import hashlib
import logging
import re
from typing import List, Dict, Optional, Any

logger = logging.getLogger(__name__)

# ─── Cache ────────────────────────────────────────────────────────────────────
CACHE_TTL_SECONDS = 6 * 60 * 60  # 6 hours
_cache: Dict[str, Dict[str, Any]] = {}  # {cache_key: {"data": [...], "ts": float}}


def _cache_key(query: str, language: str, max_results: int) -> str:
    raw = f"{query}|{language}|{max_results}"
    return hashlib.md5(raw.encode()).hexdigest()


def _get_cached(key: str) -> Optional[List[Dict]]:
    entry = _cache.get(key)
    if entry and (time.time() - entry["ts"]) < CACHE_TTL_SECONDS:
        return entry["data"]
    if entry:
        del _cache[key]
    return None


def _set_cache(key: str, data: List[Dict]):
    _cache[key] = {"data": data, "ts": time.time()}


def clear_cache():
    """Clear all cached results (used when ?refresh=true)."""
    _cache.clear()


# ─── State → Language mapping ─────────────────────────────────────────────────
STATE_LANGUAGE_MAP: Dict[str, str] = {
    "telangana": "te",
    "andhra pradesh": "te",
    "tamil nadu": "ta",
    "karnataka": "kn",
    "kerala": "ml",
    "maharashtra": "mr",
    "gujarat": "gu",
    "rajasthan": "hi",
    "madhya pradesh": "hi",
    "uttar pradesh": "hi",
    "bihar": "hi",
    "haryana": "hi",
    "punjab": "pa",
    "west bengal": "bn",
    "odisha": "or",
    "assam": "as",
    "jharkhand": "hi",
    "chhattisgarh": "hi",
    "uttarakhand": "hi",
}

# Language code → YouTube relevanceLanguage
YOUTUBE_LANG_MAP: Dict[str, str] = {
    "te": "te",
    "hi": "hi",
    "ta": "ta",
    "kn": "kn",
    "ml": "ml",
    "mr": "mr",
    "gu": "gu",
    "pa": "pa",
    "bn": "bn",
    "or": "or",
    "as": "as",
    "en": "en",
}


def get_language_for_state(state: Optional[str]) -> str:
    """Map farmer's state to a YouTube language code."""
    if not state:
        return "hi"  # Default to Hindi for Indian farmers
    return STATE_LANGUAGE_MAP.get(state.lower().strip(), "hi")


# ─── YouTube API ──────────────────────────────────────────────────────────────
YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"


async def search_youtube_videos(
    query: str,
    max_results: int = 6,
    language: str = "hi",
    api_key: Optional[str] = None,
) -> List[Dict]:
    """
    Search YouTube for videos matching the query.
    Returns a list of video dicts with id, title, thumbnail, channel, duration, description, view_count.
    """
    key = api_key or os.getenv("YOUTUBE_API_KEY", "")
    if not key:
        return []

    cache_k = _cache_key(query, language, max_results)
    cached = _get_cached(cache_k)
    if cached is not None:
        logger.info(f"[youtube] Cache hit for query: {query[:50]}")
        return cached

    yt_lang = YOUTUBE_LANG_MAP.get(language, "hi")

    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results,
        "regionCode": "IN",
        "relevanceLanguage": yt_lang,
        "safeSearch": "strict",
        "videoDuration": "medium",  # 4-20 minutes — ideal for tutorials
        "order": "relevance",
        "key": key,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(YOUTUBE_SEARCH_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        video_ids = []
        snippets = {}
        for item in data.get("items", []):
            vid = item.get("id", {}).get("videoId")
            if vid:
                video_ids.append(vid)
                snippets[vid] = item.get("snippet", {})

        if not video_ids:
            _set_cache(cache_k, [])
            return []

        # Fetch video details (duration, view count) — costs only 1 unit
        details = await _fetch_video_details(video_ids, key)

        results = []
        for vid in video_ids:
            snippet = snippets.get(vid, {})
            detail = details.get(vid, {})
            results.append({
                "id": vid,
                "title": snippet.get("title", ""),
                "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url",
                    f"https://img.youtube.com/vi/{vid}/hqdefault.jpg"),
                "channel": snippet.get("channelTitle", ""),
                "description": (snippet.get("description", "") or "")[:200],
                "duration": detail.get("duration", ""),
                "view_count": detail.get("view_count", ""),
            })

        _set_cache(cache_k, results)
        logger.info(f"[youtube] Fetched {len(results)} videos for: {query[:50]}")
        return results

    except httpx.HTTPStatusError as e:
        logger.error(f"[youtube] API error {e.response.status_code}: {e.response.text[:200]}")
        return []
    except Exception as e:
        logger.error(f"[youtube] Error: {e}")
        return []


async def _fetch_video_details(video_ids: List[str], api_key: str) -> Dict[str, Dict]:
    """Fetch duration and view count for a list of video IDs (1 unit per call)."""
    params = {
        "part": "contentDetails,statistics",
        "id": ",".join(video_ids),
        "key": api_key,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(YOUTUBE_VIDEOS_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        result = {}
        for item in data.get("items", []):
            vid = item.get("id")
            duration_iso = item.get("contentDetails", {}).get("duration", "")
            view_count = item.get("statistics", {}).get("viewCount", "0")
            result[vid] = {
                "duration": _parse_iso_duration(duration_iso),
                "view_count": _format_view_count(int(view_count)),
            }
        return result
    except Exception as e:
        logger.error(f"[youtube] Details fetch error: {e}")
        return {}


def _parse_iso_duration(iso: str) -> str:
    """Convert ISO 8601 duration (PT12M5S) to human readable (12:05)."""
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso)
    if not match:
        return ""
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    if hours:
        return f"{hours}:{minutes:02d}:{seconds:02d}"
    return f"{minutes}:{seconds:02d}"


def _format_view_count(count: int) -> str:
    """Format view count: 1500000 -> '15L', 50000 -> '50K'."""
    if count >= 10_000_000:
        return f"{count // 10_000_000 * 10}M"
    if count >= 1_000_000:
        cr = count / 10_00_000  # Indian Lakhs
        return f"{cr:.1f}L" if cr < 100 else f"{int(cr)}L"
    if count >= 1_000:
        return f"{count // 1000}K"
    return str(count)


# ─── Query Builder ────────────────────────────────────────────────────────────

def build_learning_categories(
    crop_names: List[str],
    season: Optional[str] = None,
    language: str = "hi",
) -> List[Dict[str, str]]:
    """
    Build a list of {category, query, emoji} dicts for YouTube searches,
    personalized to the farmer's crops and season.
    """
    # Language suffix for better regional results
    lang_suffix = {
        "te": "Telugu",
        "hi": "Hindi",
        "ta": "Tamil",
        "kn": "Kannada",
        "ml": "Malayalam",
        "mr": "Marathi",
        "gu": "Gujarati",
        "pa": "Punjabi",
        "bn": "Bengali",
    }.get(language, "")

    lang_tag = f" in {lang_suffix}" if lang_suffix else ""

    categories = []

    # 1. Crop-specific tips
    if crop_names:
        crops_str = " ".join(crop_names[:3])  # Limit to 3 crops in query
        categories.append({
            "category": "My Crops",
            "emoji": "🌾",
            "query": f"{crops_str} cultivation farming tips India{lang_tag}",
        })

        # 2. Fertilizer & nutrition for their crops
        categories.append({
            "category": "Fertilizers & Nutrition",
            "emoji": "🧪",
            "query": f"{crops_str} fertilizer schedule dosage India{lang_tag}",
        })

        # 3. Pest & disease control
        categories.append({
            "category": "Pest & Disease Control",
            "emoji": "🐛",
            "query": f"{crops_str} pest disease control spray India{lang_tag}",
        })

    # 4. Market & mandi analysis
    categories.append({
        "category": "Market & Mandi",
        "emoji": "📈",
        "query": f"agriculture mandi market price analysis India 2026{lang_tag}",
    })

    # 5. Government schemes
    categories.append({
        "category": "Government Schemes",
        "emoji": "🏛️",
        "query": f"government agriculture scheme subsidy farmer India 2026{lang_tag}",
    })

    # 6. New profitable crops
    season_tag = f" {season} season" if season else ""
    categories.append({
        "category": "New Crops to Grow",
        "emoji": "🌱",
        "query": f"profitable crops to grow{season_tag} India{lang_tag}",
    })

    # 7. Smart farming techniques
    categories.append({
        "category": "Smart Farming",
        "emoji": "🎓",
        "query": f"smart farming techniques modern agriculture India{lang_tag}",
    })

    # 8. Expert talks (agricultural officers, KVK, etc.)
    categories.append({
        "category": "Expert Talks",
        "emoji": "👨‍🌾",
        "query": f"agriculture officer farmer training KVK India{lang_tag}",
    })

    return categories

"""
YouTube Data API v3 service for the Learning Hub.

Fetches personalized agricultural videos based on farmer's crops, season,
and regional language. Includes in-memory caching (6hr TTL).

Quality & Relevance Strategy:
  - Strict language matching: English users get ONLY English tutorials (no Indic scripts,
    no Telugu/Hindi regional tags). Regional languages get native-script farming content.
  - View-count thresholding: Filters out low-view (< 5K) videos to ensure established,
    tested content from reputable farming channels.
  - Recency: Prioritizes videos published within the last 2-3 years.
  - Excludes non-tutorials: Filters out #shorts and competitive exam prep (UPSC/AFO).
  - Sorts by view count descending so top-quality guides surface first.
"""

import os
import time
import httpx
import hashlib
import logging
import re
from datetime import datetime, timedelta
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

# ─── Crop Native Name Translations ────────────────────────────────────────────
CROP_TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "paddy": {"te": "వరి", "hi": "धान", "ta": "நெல்", "kn": "ಭತ್ತ", "en": "Rice Paddy"},
    "rice": {"te": "వరి", "hi": "धान", "ta": "நெல்", "kn": "ಭತ್ತ", "en": "Rice Paddy"},
    "maize": {"te": "మొక్కజొన్న", "hi": "मक्का", "ta": "மக்காச்சோளம்", "kn": "ಮೆಕ್ಕೆಜೋಳ", "en": "Maize Corn"},
    "corn": {"te": "మొక్కజొన్న", "hi": "मक्का", "ta": "மக்காச்சோளம்", "kn": "ಮೆಕ್ಕೆಜೋಳ", "en": "Maize Corn"},
    "cotton": {"te": "పత్తి", "hi": "कपास", "ta": "பருத்தி", "kn": "ಹತ್ತಿ", "en": "Cotton"},
    "chilli": {"te": "మిరప", "hi": "मिर्च", "ta": "மிளகாய்", "kn": "ಮೆಣಸಿನಕಾಯಿ", "en": "Chilli"},
    "chili": {"te": "మిరప", "hi": "मिर्च", "ta": "மிளகாய்", "kn": "ಮೆಣಸಿನಕಾಯಿ", "en": "Chilli"},
    "wheat": {"te": "గోధుమ", "hi": "गेहूं", "ta": "கோதுமை", "kn": "ಗೋಧಿ", "en": "Wheat"},
    "sugarcane": {"te": "చెరకు", "hi": "गन्ना", "ta": "கரும்பு", "kn": "ಕಬ್ಬು", "en": "Sugarcane"},
    "soybean": {"te": "సోయాబీన్", "hi": "सोयाबीन", "ta": "சோயாபீன்", "kn": "ಸೋಯಾಬೀನ್", "en": "Soybean"},
    "groundnut": {"te": "వేరుశనగ", "hi": "मूंगफली", "ta": "வேர்க்கடலை", "kn": "ಕಡಲೆಕಾಯಿ", "en": "Groundnut"},
    "peanut": {"te": "వేరుశనగ", "hi": "मूंगफली", "ta": "வேர்க்கடலை", "kn": "ಕಡಲೆಕಾಯಿ", "en": "Groundnut"},
    "tomato": {"te": "టమోటా", "hi": "टमाटर", "ta": "தக்காளி", "kn": "ಟೊಮೆಟೊ", "en": "Tomato"},
    "onion": {"te": "ఉల్లిపాయ", "hi": "प्याज", "ta": "வெங்காயம்", "kn": "ಈರುಳ್ಳಿ", "en": "Onion"},
    "potato": {"te": "బంగాళాదుంప", "hi": "आलू", "ta": "உருளைக்கிழங்கு", "kn": "ಆಲೂಗಡ್ಡೆ", "en": "Potato"},
    "turmeric": {"te": "పసుపు", "hi": "हल्दी", "ta": "மஞ்சள்", "kn": "ಅರಿಶಿನ", "en": "Turmeric"},
    "ginger": {"te": "అల్లం", "hi": "अदरक", "ta": "இஞ்சி", "kn": "ಶುಂಠಿ", "en": "Ginger"},
    "mango": {"te": "మామిడి", "hi": "आम", "ta": "மாம்பழம்", "kn": "ಮಾವಿನ", "en": "Mango"},
    "banana": {"te": "అరటి", "hi": "केला", "ta": "வாழை", "kn": "ಬಾಳೆ", "en": "Banana"},
    "chana": {"te": "శనగలు", "hi": "चना", "ta": "கொண்டைக்கடலை", "kn": "ಕಡಲೆ", "en": "Chickpea Chana"},
    "gram": {"te": "శనగలు", "hi": "चना", "ta": "கொண்டைக்கடலை", "kn": "ಕಡಲೆ", "en": "Chickpea Chana"},
}

# ─── Scripts & Language Filter Regexes ────────────────────────────────────────
INDIC_SCRIPTS_REGEX = re.compile(r'[\u0900-\u0D7F]')
TELUGU_SCRIPT_REGEX = re.compile(r'[\u0C00-\u0C7F]')
DEVANAGARI_SCRIPT_REGEX = re.compile(r'[\u0900-\u097F]')
TAMIL_SCRIPT_REGEX = re.compile(r'[\u0B80-\u0BFF]')
KANNADA_SCRIPT_REGEX = re.compile(r'[\u0C80-\u0CFF]')
MALAYALAM_SCRIPT_REGEX = re.compile(r'[\u0D00-\u0D7F]')
BENGALI_SCRIPT_REGEX = re.compile(r'[\u0980-\u09FF]')
GURMUKHI_SCRIPT_REGEX = re.compile(r'[\u0A00-\u0A7F]')
GUJARATI_SCRIPT_REGEX = re.compile(r'[\u0A80-\u0AFF]')

REGIONAL_WORDS_REGEX = re.compile(
    r'\b(in hindi|in telugu|in tamil|in kannada|in malayalam|in marathi|in bengali|in punjabi|'
    r'ki kheti|kheti badi|sagu|vivasayam|saagu|krishi darshan|annadata|kisan bulletin|'
    r'rythu|raithu|kisan mitra)\b',
    re.IGNORECASE
)

IRRELEVANT_CONTENT_REGEX = re.compile(
    r'(#shorts|#short|\bshorts\b|\bshort\b|\bexam\b|\bupsc\b|\bias\b|\bibps\b|\bafo\b|\brrb\b|'
    r'\bjrf\b|\bars\b|syllabus|question paper|mock test|mcq|previous year question|'
    r'farming simulator|\bfs25\b|\bfs22\b|\bfs19\b|\bgameplay\b|\bgaming\b|\bplaythrough\b)',
    re.IGNORECASE
)

# ─── Quality thresholds ──────────────────────────────────────────────────────
MIN_VIEW_COUNT = 5_000         # Minimum views for high-quality content
RELAXED_VIEW_COUNT = 1_000     # Graceful fallback if fewer videos pass
PUBLISHED_WITHIN_YEARS = 3     # Show videos from the last 3 years


def get_language_for_state(state: Optional[str]) -> str:
    """Map farmer's state to a YouTube language code."""
    if not state:
        return "hi"
    return STATE_LANGUAGE_MAP.get(state.lower().strip(), "hi")


def matches_language_filter(title: str, channel: str, description: str, language: str) -> bool:
    """
    Strictly verify whether a video matches the user's selected language.
    Prevents Telugu/Hindi videos from leaking into English, and vice versa.
    """
    text = f"{title} {channel}".lower()

    # 1. Filter out shorts and exam preparation regardless of language
    if IRRELEVANT_CONTENT_REGEX.search(text):
        return False

    if language == "en":
        # English must NOT contain Indic scripts (Devanagari, Telugu, Tamil, etc.)
        if INDIC_SCRIPTS_REGEX.search(title):
            return False
        # English must NOT contain explicit regional tags like 'in telugu', 'ki kheti'
        if REGIONAL_WORDS_REGEX.search(text):
            return False
        return True

    elif language == "te":
        # Telugu must have Telugu characters or explicit 'telugu'/'sagu'/'rythu'
        if TELUGU_SCRIPT_REGEX.search(title) or "telugu" in text or "sagu" in text:
            return True
        # Reject non-Telugu Indic scripts
        if DEVANAGARI_SCRIPT_REGEX.search(title) or TAMIL_SCRIPT_REGEX.search(title) or KANNADA_SCRIPT_REGEX.search(title):
            return False
        return True

    elif language == "hi":
        # Hindi must have Devanagari script or explicit 'hindi'/'kisan'/'kheti'
        if DEVANAGARI_SCRIPT_REGEX.search(title) or "hindi" in text or "kisan" in text or "kheti" in text:
            return True
        # Reject non-Hindi Indic scripts
        if TELUGU_SCRIPT_REGEX.search(title) or TAMIL_SCRIPT_REGEX.search(title) or KANNADA_SCRIPT_REGEX.search(title):
            return False
        return True

    elif language == "ta":
        if TAMIL_SCRIPT_REGEX.search(title) or "tamil" in text or "vivasayam" in text:
            return True
        if DEVANAGARI_SCRIPT_REGEX.search(title) or TELUGU_SCRIPT_REGEX.search(title):
            return False
        return True

    elif language == "kn":
        if KANNADA_SCRIPT_REGEX.search(title) or "kannada" in text:
            return True
        if DEVANAGARI_SCRIPT_REGEX.search(title) or TELUGU_SCRIPT_REGEX.search(title):
            return False
        return True

    return True


# ─── YouTube API ──────────────────────────────────────────────────────────────
YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"


def _published_after_date() -> str:
    """ISO 8601 date string for 'published within the last N years'."""
    cutoff = datetime.utcnow() - timedelta(days=PUBLISHED_WITHIN_YEARS * 365)
    return cutoff.strftime("%Y-%m-%dT00:00:00Z")


async def search_youtube_videos(
    query: str,
    max_results: int = 6,
    language: str = "hi",
    api_key: Optional[str] = None,
) -> List[Dict]:
    """
    Search YouTube for high-quality, popular farming videos strictly in the selected language.

    Workflow:
      1. Query YouTube with medium duration (4-20 min tutorials) and language bias
      2. Fetch video details & statistics (viewCount, duration)
      3. Apply strict language filter (no Telugu/Hindi in English, etc.)
      4. Filter out shorts and exam prep
      5. Filter out low-view-count videos (< 5,000 views)
      6. Sort remaining candidates by view count descending (best content first)
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

    # Fetch 2.5x more candidates so we have sufficient quality results after filtering
    fetch_count = min(int(max_results * 2.5) + 6, 30)

    params: Dict[str, Any] = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": fetch_count,
        "relevanceLanguage": yt_lang,
        "safeSearch": "strict",
        "videoDuration": "medium",       # 4-20 minutes — ideal for comprehensive guides
        "order": "relevance",            # Matches relevant agricultural topic
        "publishedAfter": _published_after_date(),
        "key": key,
    }

    # For non-English languages, anchor to India for local farming context
    if language != "en":
        params["regionCode"] = "IN"

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
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

        # If strict date filter yielded too few candidates, retry without publishedAfter
        if len(video_ids) < 4:
            logger.info(f"[youtube] Only {len(video_ids)} recent results, retrying without date filter")
            params.pop("publishedAfter", None)
            async with httpx.AsyncClient(timeout=12.0) as client:
                resp = await client.get(YOUTUBE_SEARCH_URL, params=params)
                resp.raise_for_status()
                data = resp.json()

            for item in data.get("items", []):
                vid = item.get("id", {}).get("videoId")
                if vid and vid not in snippets:
                    video_ids.append(vid)
                    snippets[vid] = item.get("snippet", {})

        if not video_ids:
            _set_cache(cache_k, [])
            return []

        # Fetch video details (duration, view count) in a single batch call
        details = await _fetch_video_details(video_ids, key)

        candidates = []
        for vid in video_ids:
            snippet = snippets.get(vid, {})
            detail = details.get(vid, {})
            title = snippet.get("title", "")
            channel = snippet.get("channelTitle", "")
            description = snippet.get("description", "") or ""
            raw_views = detail.get("raw_view_count", 0)

            # 1. Strict language check
            if not matches_language_filter(title, channel, description, language):
                continue

            candidates.append({
                "id": vid,
                "title": title,
                "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url",
                    f"https://img.youtube.com/vi/{vid}/hqdefault.jpg"),
                "channel": channel,
                "description": description[:200],
                "duration": detail.get("duration", ""),
                "view_count": detail.get("view_count", ""),
                "raw_view_count": raw_views,
            })

        # If too few candidates passed strict filters, search without date filter to get top evergreen tutorials
        if len(candidates) < max_results and "publishedAfter" in params:
            logger.info(f"[youtube] Only {len(candidates)} candidates with date filter, fetching top evergreen tutorials")
            fallback_params = dict(params)
            fallback_params.pop("publishedAfter", None)
            fallback_params["maxResults"] = 25
            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    f_resp = await client.get(YOUTUBE_SEARCH_URL, params=fallback_params)
                    if f_resp.status_code == 200:
                        f_data = f_resp.json()
                        new_ids = []
                        for item in f_data.get("items", []):
                            vid = item.get("id", {}).get("videoId")
                            if vid and vid not in snippets:
                                new_ids.append(vid)
                                snippets[vid] = item.get("snippet", {})

                        if new_ids:
                            new_details = await _fetch_video_details(new_ids, key)
                            for vid in new_ids:
                                snip = snippets.get(vid, {})
                                det = new_details.get(vid, {})
                                t = snip.get("title", "")
                                ch = snip.get("channelTitle", "")
                                desc = snip.get("description", "") or ""
                                rv = det.get("raw_view_count", 0)

                                if not matches_language_filter(t, ch, desc, language):
                                    continue

                                candidates.append({
                                    "id": vid,
                                    "title": t,
                                    "thumbnail": snip.get("thumbnails", {}).get("high", {}).get("url",
                                        f"https://img.youtube.com/vi/{vid}/hqdefault.jpg"),
                                    "channel": ch,
                                    "description": desc[:200],
                                    "duration": det.get("duration", ""),
                                    "view_count": det.get("view_count", ""),
                                    "raw_view_count": rv,
                                })
            except Exception as e:
                logger.warning(f"[youtube] Evergreen fallback query error: {e}")

        # 2. Filter out low views (< 5,000)
        quality_results = [r for r in candidates if r["raw_view_count"] >= MIN_VIEW_COUNT]

        # 3. Graceful fallback to 1,000 views if too few results
        if len(quality_results) < max_results:
            quality_results = [r for r in candidates if r["raw_view_count"] >= RELAXED_VIEW_COUNT]

        # 4. If still under 2 results, use whatever matched the language
        if len(quality_results) < 2:
            quality_results = candidates

        # 5. Sort by views descending so top-performing, trusted videos surface first
        quality_results.sort(key=lambda x: x["raw_view_count"], reverse=True)

        # 6. Take top N requested
        final_results = quality_results[:max_results]

        # Clean internal field
        for r in final_results:
            r.pop("raw_view_count", None)

        _set_cache(cache_k, final_results)
        logger.info(f"[youtube] Fetched {len(final_results)} quality videos for lang={language}, query='{query[:40]}'")
        return final_results

    except httpx.HTTPStatusError as e:
        logger.error(f"[youtube] API error {e.response.status_code}: {e.response.text[:200]}")
        return []
    except Exception as e:
        logger.error(f"[youtube] Error: {type(e).__name__}: {e}")
        return []


async def _fetch_video_details(video_ids: List[str], api_key: str) -> Dict[str, Dict]:
    """Fetch duration and view count for a list of video IDs (1 quota unit per batch of 50)."""
    if not video_ids:
        return {}

    params = {
        "part": "contentDetails,statistics",
        "id": ",".join(video_ids[:50]),
        "key": api_key,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(YOUTUBE_VIDEOS_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        result = {}
        for item in data.get("items", []):
            vid = item.get("id")
            duration_iso = item.get("contentDetails", {}).get("duration", "")
            view_count = int(item.get("statistics", {}).get("viewCount", "0"))
            result[vid] = {
                "duration": _parse_iso_duration(duration_iso),
                "view_count": _format_view_count(view_count),
                "raw_view_count": view_count,
            }
        return result
    except Exception as e:
        logger.error(f"[youtube] Details fetch error: {type(e).__name__}: {e}")
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
    """
    Format view count with Indian (Lakh/Crore) and international conventions:
    10,000,000 -> 1.0Cr
    1,500,000  -> 15L
    150,000    -> 1.5L
    50,000     -> 50K
    """
    if count >= 10_000_000:
        cr = count / 10_000_000
        return f"{cr:.1f}Cr"
    if count >= 100_000:
        lakh = count / 100_000
        return f"{lakh:.1f}L" if lakh < 100 else f"{int(lakh)}L"
    if count >= 1_000:
        return f"{count // 1000}K"
    return str(count)


# ─── Query Builder ────────────────────────────────────────────────────────────

def _get_crop_term(crop: str, lang: str) -> str:
    """Get native name for a crop, or fallback to the English name."""
    clean = crop.lower().strip()
    entry = CROP_TRANSLATIONS.get(clean)
    if entry:
        if lang == "en" and "en" in entry:
            return entry["en"]
        if lang in entry:
            return f"{entry[lang]} {crop}"
    return crop


def build_learning_categories(
    crop_names: Optional[List[str]] = None,
    season: Optional[str] = None,
    language: str = "hi",
    farmer_context: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Build targeted agricultural search queries tailored to farmer's language, crops,
    growth stages, soil profile, health alerts, and real-time weather conditions.
    """
    current_year = datetime.now().year
    categories: List[Dict[str, Any]] = []
    crop_names = crop_names or []

    # Stage native labels
    stage_labels = {
        "Sowing & Seedling": {"te": "విత్తన లేదా నాటు దశ", "hi": "बुवाई अवस्था", "ta": "விதைப்பு நிலை"},
        "Vegetative": {"te": "శాఖీయ పెరుగుదల దశ", "hi": "बढ़वार अवस्था", "ta": "வளர்ச்சி நிலை"},
        "Flowering": {"te": "పూత మరియు పొట్ట దశ", "hi": "फूल और बालियां अवस्था", "ta": "பூக்கும் நிலை"},
        "Ripening": {"te": "గింజ పక్వ దశ", "hi": "दाना भराव अवस्था", "ta": "முதிர்வு நிலை"},
        "Harvest": {"te": "కోత మరియు నిల్వ", "hi": "कटाई और भंडारण", "ta": "அறுவடை நிலை"},
    }

    # Extract signals from farmer_context if available
    crops_info = []
    soil_labels = []
    health_alerts = []
    weather_alert = None

    if farmer_context:
        crops_info = farmer_context.get("crops", [])
        soil_labels = farmer_context.get("soil_labels", [])
        health_alerts = farmer_context.get("health_alerts", [])
        weather_alert = farmer_context.get("weather_alert")
        if not crop_names and crops_info:
            crop_names = [c["name"] for c in crops_info if "name" in c]

    # ─────────────────────────────────────────────────────────────────────────
    # 1. 🚨 HIGH PRIORITY: Crop Health & Pest Alerts
    # ─────────────────────────────────────────────────────────────────────────
    if health_alerts:
        for alert in health_alerts[:2]:
            c_name = alert.get("crop_name", "Crop")
            crop_term = _get_crop_term(c_name, language)
            c_status = alert.get("status", "issue")
            notes = alert.get("notes", "")

            if language == "en":
                pest_q = f"{c_name} pest disease management organic spray remedy {current_year}"
            elif language == "te":
                pest_q = f"{crop_term} పురుగులు తెగుళ్ల నివారణ మందులు telugu {current_year}"
            elif language == "hi":
                pest_q = f"{crop_term} कीट रोग नियंत्रण स्प्रे दवा hindi {current_year}"
            elif language == "ta":
                pest_q = f"{crop_term} பூச்சி நோய் கட்டுப்பாடு மருந்து tamil"
            else:
                pest_q = f"{c_name} pest disease control treatment"

            categories.append({
                "category": f"Pest Alert: {c_name}",
                "emoji": "🚨",
                "query": pest_q,
                "context_tag": f"Pest Alert · {c_name}",
                "recommendation_reason": f"Active {c_status} alert detected on your {c_name} plot ({notes[:40]}...)" if notes else f"Active {c_status} alert on {c_name}",
                "relevance_score": 98,
            })

    # ─────────────────────────────────────────────────────────────────────────
    # 2. 🌦️ HIGH PRIORITY: Real-Time Weather Advisory
    # ─────────────────────────────────────────────────────────────────────────
    if weather_alert:
        w_type = weather_alert.get("type", "weather")
        w_title = weather_alert.get("title", "Weather Advisory")
        w_advisory = weather_alert.get("advisory", "Advisory for current weather condition")

        if w_type == "rain_alert":
            if language == "en":
                w_query = f"farming tips heavy rain waterlogging field drainage crop protection {current_year}"
            elif language == "te":
                w_query = f"భారీ వర్షాలు పంటల రక్షణ నీటి మురుగు కాలువలు telugu {current_year}"
            elif language == "hi":
                w_query = f"भारी बारिश से फसल की सुरक्षा जल निकासी hindi {current_year}"
            else:
                w_query = "heavy rainfall agriculture field drainage crop protection"
        else:
            if language == "en":
                w_query = f"heat stress summer irrigation crop protection farming {current_year}"
            elif language == "te":
                w_query = f"ఎండ తీవ్రత పంటలకు నీటి యాజమాన్యం telugu {current_year}"
            elif language == "hi":
                w_query = f"अधिक तापमान फसल सिंचाई प्रबंधन गर्मी hindi {current_year}"
            else:
                w_query = "heat stress agriculture irrigation tips"

        categories.append({
            "category": "Weather Advisory",
            "emoji": "🌦️",
            "query": w_query,
            "context_tag": f"Weather · {w_title}",
            "recommendation_reason": w_advisory,
            "relevance_score": 96,
        })

    # ─────────────────────────────────────────────────────────────────────────
    # 3. 🌱 CONTEXT-AWARE: Crop Growth Stage Specific Guides
    # ─────────────────────────────────────────────────────────────────────────
    if crops_info:
        for c in crops_info[:2]:
            c_name = c.get("name", "Crop")
            c_stage = c.get("stage", "Vegetative")
            c_days = c.get("days_elapsed", 45)
            crop_term = _get_crop_term(c_name, language)
            stage_trans = stage_labels.get(c_stage, {}).get(language, c_stage)

            if language == "en":
                stage_query = f"{c_name} {c_stage} stage care fertilizer pest irrigation tips {current_year}"
            elif language == "te":
                stage_query = f"{crop_term} {stage_trans} యాజమాన్యం ఎరువులు telugu {current_year}"
            elif language == "hi":
                stage_query = f"{crop_term} {stage_trans} में खाद और देखभाल kheti hindi {current_year}"
            elif language == "ta":
                stage_query = f"{crop_term} {stage_trans} பராமரிப்பு tamil {current_year}"
            else:
                stage_query = f"{c_name} {c_stage} stage farming tips"

            categories.append({
                "category": f"{c_name} ({c_stage})",
                "emoji": "🌱",
                "query": stage_query,
                "context_tag": f"{c_name} · {c_stage} Stage",
                "recommendation_reason": f"Your {c_name} is currently at Day {c_days} ({c_stage} Stage)",
                "relevance_score": 94,
            })
    elif crop_names:
        for crop in crop_names[:2]:
            crop_term = _get_crop_term(crop, language)
            if language == "en":
                query = f"{crop_term} farming cultivation complete guide tutorial {current_year}"
            elif language == "te":
                query = f"{crop_term} సాగు పద్ధతులు farming guide telugu {current_year}"
            elif language == "hi":
                query = f"{crop_term} की खेती कैसे करें farming guide hindi {current_year}"
            elif language == "ta":
                query = f"{crop_term} விவசாயம் farming guide tamil"
            else:
                query = f"{crop} farming complete cultivation guide"

            categories.append({
                "category": "My Crops",
                "emoji": "🌾",
                "query": query,
                "context_tag": f"My Crops · {crop}",
                "recommendation_reason": f"Cultivation guide for your active {crop} crop",
                "relevance_score": 90,
            })

    # ─────────────────────────────────────────────────────────────────────────
    # 4. 🧪 CONTEXT-AWARE: Soil Management for Farmer's Soil Types
    # ─────────────────────────────────────────────────────────────────────────
    if soil_labels:
        primary_soil = soil_labels[0]
        soil_term_te = "నల్లరేగడి నేలలో" if "Black" in primary_soil else "ఎర్ర నేలల్లో"
        soil_term_hi = "काली मिट्टी में" if "Black" in primary_soil else "लाल दोमट मिट्टी में"

        if language == "en":
            soil_query = f"{primary_soil} management water drainage fertilizer crop yield {current_year}"
        elif language == "te":
            soil_query = f"{soil_term_te} పంటల సాగు నీటి యాజమాన్యం ఎరువులు telugu"
        elif language == "hi":
            soil_query = f"{soil_term_hi} खेती जल निकासी उर्वरक प्रबंधन kheti hindi"
        elif language == "ta":
            soil_query = f"{primary_soil} soil management agriculture tamil"
        else:
            soil_query = f"{primary_soil} soil management crop yield"

        categories.append({
            "category": "Soil Management",
            "emoji": "🧪",
            "query": soil_query,
            "context_tag": f"Soil Care · {primary_soil}",
            "recommendation_reason": f"Tailored specifically for your {primary_soil} plots",
            "relevance_score": 88,
        })

    # ─────────────────────────────────────────────────────────────────────────
    # 5. 🧪 Fertilizers & Nutrition
    # ─────────────────────────────────────────────────────────────────────────
    crops_str = " ".join([_get_crop_term(c, language) for c in crop_names[:2]]) if crop_names else "crops"
    if language == "en":
        fert_query = f"{' '.join(crop_names[:2])} fertilizer management NPK dosage guide" if crop_names else "crop fertilizer NPK micronutrients dosage guide"
    elif language == "te":
        fert_query = f"{crops_str} ఎరువుల యాజమాన్యం fertilizer management telugu"
    elif language == "hi":
        fert_query = f"{crops_str} खाद उर्वरक NPK प्रबंधन fertilizer hindi"
    elif language == "ta":
        fert_query = f"{crops_str} உரம் மேலாண்மை fertilizer tamil"
    else:
        fert_query = f"{' '.join(crop_names[:2])} fertilizer NPK dosage management" if crop_names else "crop fertilizer management"

    categories.append({
        "category": "Fertilizers & Nutrition",
        "emoji": "🧪",
        "query": fert_query,
        "context_tag": "Nutrient Care",
        "recommendation_reason": "Optimized NPK and micronutrient dosage for yield boost",
        "relevance_score": 84,
    })

    # ─────────────────────────────────────────────────────────────────────────
    # 6. 🐛 Pest & Disease Control (General / Preventive if no active alert)
    # ─────────────────────────────────────────────────────────────────────────
    if not health_alerts:
        if language == "en":
            pest_query = f"{' '.join(crop_names[:2])} pest disease control organic spray solution" if crop_names else "crop pest disease organic spray solution"
        elif language == "te":
            pest_query = f"{crops_str} పురుగులు తెగుళ్ల నివారణ pest control telugu"
        elif language == "hi":
            pest_query = f"{crops_str} कीट रोग नियंत्रण स्प्रे pest disease control hindi"
        elif language == "ta":
            pest_query = f"{crops_str} பூச்சி நோய் கட்டுப்பாடு pest control tamil"
        else:
            pest_query = f"{' '.join(crop_names[:2])} pest and disease control spray" if crop_names else "crop pest and disease control spray"

        categories.append({
            "category": "Pest & Disease Control",
            "emoji": "🐛",
            "query": pest_query,
            "context_tag": "Pest Defense",
            "recommendation_reason": "Preventive natural and organic pest protection guides",
            "relevance_score": 82,
        })

    # ─────────────────────────────────────────────────────────────────────────
    # 7. 📈 Market & Mandi Price Intelligence
    # ─────────────────────────────────────────────────────────────────────────
    if language == "en":
        mandi_query = f"agriculture market price mandi tips farmer India {current_year}"
    elif language == "te":
        mandi_query = f"వ్యవసాయ మార్కెట్ ధరలు mandi price market tips telugu {current_year}"
    elif language == "hi":
        mandi_query = f"मंडी भाव बाजार रेट kisan mandi rate update {current_year} hindi"
    elif language == "ta":
        mandi_query = f"மண்டி விலை market price agriculture tamil {current_year}"
    else:
        mandi_query = f"mandi market price agriculture farmer India {current_year}"

    categories.append({
        "category": "Market & Mandi",
        "emoji": "📈",
        "query": mandi_query,
        "context_tag": "Mandi Rates",
        "recommendation_reason": f"Real-time mandi market rates and selling strategies ({current_year})",
        "relevance_score": 79,
    })

    # ─────────────────────────────────────────────────────────────────────────
    # 8. 🏛️ Government Schemes & Subsidies
    # ─────────────────────────────────────────────────────────────────────────
    if language == "en":
        scheme_query = f"farmer government scheme subsidy apply agriculture India {current_year}"
    elif language == "te":
        scheme_query = f"రైతు పథకాలు ప్రభుత్వం సబ్సిడీ government schemes subsidy farmer telugu {current_year}"
    elif language == "hi":
        scheme_query = f"किसान सरकारी योजना सब्सिडी आवेदन PM kisan subsidy {current_year} hindi"
    elif language == "ta":
        scheme_query = f"விவசாய திட்டங்கள் அரசு மானியம் government schemes subsidy tamil {current_year}"
    else:
        scheme_query = f"government schemes subsidy farmer agriculture India {current_year}"

    categories.append({
        "category": "Government Schemes",
        "emoji": "🏛️",
        "query": scheme_query,
        "context_tag": "Govt Subsidies",
        "recommendation_reason": "Direct subsidy application guides and financial assistance schemes",
        "relevance_score": 76,
    })

    # ─────────────────────────────────────────────────────────────────────────
    # 9. 🎓 Smart Farming & Automation
    # ─────────────────────────────────────────────────────────────────────────
    if language == "en":
        smart_query = "smart modern agriculture technology drip irrigation automated farming guide"
    elif language == "te":
        smart_query = "ఆధునిక వ్యవసాయం బిందు సేద్యం smart farming technology drip telugu"
    elif language == "hi":
        smart_query = "आधुनिक कृषि तकनीक ड्रिप सिंचाई smart farming technology hindi"
    elif language == "ta":
        smart_query = "நவீன விவசாயம் சொட்டு நீர் பாசனம் smart farming tamil"
    else:
        smart_query = "modern smart farming technology drip irrigation agriculture"

    categories.append({
        "category": "Smart Farming",
        "emoji": "🎓",
        "query": smart_query,
        "context_tag": "Smart AgriTech",
        "recommendation_reason": "Drip irrigation, solar pumps, and drone automation for labor savings",
        "relevance_score": 73,
    })

    return categories

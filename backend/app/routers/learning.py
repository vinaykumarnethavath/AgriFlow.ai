"""
Learning Hub router — serves personalized YouTube video recommendations
based on the farmer's active crops, season, and regional language.
"""

import asyncio
import logging
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import List, Optional

from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from ..database import get_session
from ..deps import get_current_user
from ..models.user import User
from ..models.crop import Crop
from ..models.farmer import FarmerProfile
from ..services.youtube_service import (
    search_youtube_videos,
    build_learning_categories,
    get_language_for_state,
    clear_cache,
    YOUTUBE_LANG_MAP,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/learning", tags=["learning"])


# ─── Response Models ──────────────────────────────────────────────────────────

class Video(BaseModel):
    id: str
    title: str
    thumbnail: str
    category: str
    emoji: str = ""
    duration: str
    channel: str
    description: str = ""
    view_count: str = ""


class LearningResponse(BaseModel):
    categories: List[str]
    category_emojis: dict = {}
    videos: List[Video]
    personalized_for: List[str] = []
    language: str = "hi"


# ─── Hardcoded fallback (kept for when no API key is configured) ──────────────

CURATED_VIDEOS = [
    {
        "id": "dQw4w9WgXcQ",
        "title": "Complete Guide to Organic Farming in India – Step by Step",
        "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        "category": "My Crops",
        "emoji": "🌾",
        "duration": "14:20",
        "channel": "Agriculture India",
        "description": "Learn complete organic farming techniques with practical tips for Indian soil and climate conditions.",
        "view_count": "2.5L",
    },
    {
        "id": "J2kHSSFA4NU",
        "title": "Top 10 Most Profitable Crops in India 2026",
        "thumbnail": "https://img.youtube.com/vi/J2kHSSFA4NU/hqdefault.jpg",
        "category": "New Crops to Grow",
        "emoji": "🌱",
        "duration": "12:45",
        "channel": "Smart Farming India",
        "description": "Discover the most profitable crops with high demand and best returns for Indian farmers.",
        "view_count": "5.8L",
    },
    {
        "id": "3LopI4YeC4I",
        "title": "Drip Irrigation Setup – Complete Installation Guide",
        "thumbnail": "https://img.youtube.com/vi/3LopI4YeC4I/hqdefault.jpg",
        "category": "Smart Farming",
        "emoji": "🎓",
        "duration": "18:30",
        "channel": "Modern Kheti",
        "description": "Step-by-step drip irrigation system installation for maximum water efficiency and crop yield.",
        "view_count": "3.2L",
    },
    {
        "id": "mUyDhQ4jC0o",
        "title": "Government Subsidy Schemes for Farmers 2026 – How to Apply",
        "thumbnail": "https://img.youtube.com/vi/mUyDhQ4jC0o/hqdefault.jpg",
        "category": "Government Schemes",
        "emoji": "🏛️",
        "duration": "11:05",
        "channel": "Kisan Updates",
        "description": "All major government subsidies and schemes available for farmers in 2026 with application process.",
        "view_count": "8.1L",
    },
    {
        "id": "wJnBTPUQS5A",
        "title": "NPK Fertilizer Management – Complete Dosage Guide",
        "thumbnail": "https://img.youtube.com/vi/wJnBTPUQS5A/hqdefault.jpg",
        "category": "Fertilizers & Nutrition",
        "emoji": "🧪",
        "duration": "09:50",
        "channel": "Agri Doctor",
        "description": "Understanding NPK ratios, dosage calculation, and best practices for fertilizer application.",
        "view_count": "1.8L",
    },
    {
        "id": "LH5ay10RTGY",
        "title": "Pest & Disease Control Without Chemicals – Natural Solutions",
        "thumbnail": "https://img.youtube.com/vi/LH5ay10RTGY/hqdefault.jpg",
        "category": "Pest & Disease Control",
        "emoji": "🐛",
        "duration": "13:40",
        "channel": "Organic Farming Hub",
        "description": "Natural and organic pest control methods for all major crops in India.",
        "view_count": "4.5L",
    },
    {
        "id": "m1oX_-3bMA0",
        "title": "Mandi Prices Explained – How to Get the Best Rate",
        "thumbnail": "https://img.youtube.com/vi/m1oX_-3bMA0/hqdefault.jpg",
        "category": "Market & Mandi",
        "emoji": "📈",
        "duration": "08:15",
        "channel": "Kisan Mitra",
        "description": "Tips and tricks to get better prices at mandi and when to sell your crops for maximum profit.",
        "view_count": "2.1L",
    },
    {
        "id": "T-s0V1pCkgs",
        "title": "Agriculture Expert Panel – Soil Health & Crop Rotation Tips",
        "thumbnail": "https://img.youtube.com/vi/T-s0V1pCkgs/hqdefault.jpg",
        "category": "Expert Talks",
        "emoji": "👨‍🌾",
        "duration": "16:30",
        "channel": "ICAR Official",
        "description": "Panel of agriculture scientists from ICAR discussing soil health management and crop rotation strategies.",
        "view_count": "1.5L",
    },
]


def _build_fallback_response(language: str = "en") -> LearningResponse:
    """Return curated videos when no API key is set or no results found."""
    cats = list(dict.fromkeys(v["category"] for v in CURATED_VIDEOS))
    emojis = {v["category"]: v.get("emoji", "") for v in CURATED_VIDEOS}
    return LearningResponse(
        categories=cats,
        category_emojis=emojis,
        videos=[Video(**v) for v in CURATED_VIDEOS],
        personalized_for=[],
        language=language,
    )


# ─── Main Endpoint ────────────────────────────────────────────────────────────

@router.get("/videos", response_model=LearningResponse)
async def get_learning_videos(
    refresh: bool = Query(False, description="Force refresh cache"),
    lang: Optional[str] = Query(None, description="User's preferred language code (e.g. te, hi, ta). Overrides state-based language."),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Fetch personalized YouTube video recommendations for the farmer.
    Videos are selected based on:
    - Farmer's active crops (crop name + season)
    - Farmer's state (regional language)
    - Curated agricultural categories
    """
    import os
    api_key = os.getenv("YOUTUBE_API_KEY", "")
    if not api_key:
        logger.info("[learning] No YOUTUBE_API_KEY set, returning curated fallback")
        return _build_fallback_response()

    if refresh:
        clear_cache()

    # 1. Get farmer's active crops
    crop_names = []
    season = None
    try:
        result = await session.exec(
            select(Crop).where(
                Crop.user_id == current_user.id,
                Crop.status == "Growing",
            )
        )
        crops = result.all()
        crop_names = list(set(c.name for c in crops))
        # Use the most common season
        seasons = [c.season for c in crops if c.season]
        if seasons:
            season = max(set(seasons), key=seasons.count)
    except Exception as e:
        logger.warning(f"[learning] Could not fetch crops: {e}")

    # 2. Get farmer's state for language
    farmer_state = None
    try:
        result = await session.exec(
            select(FarmerProfile).where(FarmerProfile.user_id == current_user.id)
        )
        profile = result.first()
        if profile:
            farmer_state = profile.state
    except Exception as e:
        logger.warning(f"[learning] Could not fetch profile: {e}")

    # Prioritize user's explicit language preference over state-derived language
    if lang and lang in YOUTUBE_LANG_MAP:
        language = lang
    else:
        language = get_language_for_state(farmer_state)

    # 3. Build category queries
    category_defs = build_learning_categories(crop_names, season, language)

    # 4. Fetch videos for each category in parallel
    async def fetch_category(cat_def):
        videos = await search_youtube_videos(
            query=cat_def["query"],
            max_results=6,
            language=language,
            api_key=api_key,
        )
        return cat_def, videos

    tasks = [fetch_category(cd) for cd in category_defs]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # 5. Assemble response
    all_videos = []
    category_names = []
    category_emojis = {}

    for item in results:
        if isinstance(item, Exception):
            logger.error(f"[learning] Category fetch error: {item}")
            continue
        cat_def, videos = item
        cat_name = cat_def["category"]
        cat_emoji = cat_def.get("emoji", "")

        if videos:
            category_names.append(cat_name)
            category_emojis[cat_name] = cat_emoji
            for v in videos:
                all_videos.append(Video(
                    id=v["id"],
                    title=v["title"],
                    thumbnail=v["thumbnail"],
                    category=cat_name,
                    emoji=cat_emoji,
                    duration=v.get("duration", ""),
                    channel=v.get("channel", ""),
                    description=v.get("description", ""),
                    view_count=v.get("view_count", ""),
                ))

    # Deduplicate videos by ID (same video might appear in multiple categories)
    seen_ids = set()
    unique_videos = []
    for v in all_videos:
        if v.id not in seen_ids:
            seen_ids.add(v.id)
            unique_videos.append(v)

    # If no results at all, return fallback
    if not unique_videos:
        return _build_fallback_response(language)

    # Sort within each category by view count (highest first)
    def _parse_views(view_str: str) -> int:
        """Parse formatted view count back to int for sorting: '1.5Cr' -> 15000000, '15L' -> 1500000, '50K' -> 50000."""
        if not view_str:
            return 0
        s = view_str.strip().upper().replace(" ", "")
        try:
            if s.endswith("CR"):
                return int(float(s[:-2]) * 10_000_000)
            if s.endswith("L"):
                return int(float(s[:-1]) * 100_000)
            if s.endswith("M"):
                return int(float(s[:-1]) * 1_000_000)
            if s.endswith("K"):
                return int(float(s[:-1]) * 1_000)
            return int(s)
        except (ValueError, TypeError):
            return 0

    unique_videos.sort(key=lambda v: _parse_views(v.view_count), reverse=True)

    return LearningResponse(
        categories=list(dict.fromkeys(category_names)),
        category_emojis=category_emojis,
        videos=unique_videos,
        personalized_for=crop_names,
        language=language,
    )


# ─── Search Endpoint ──────────────────────────────────────────────────────────

class SearchResponse(BaseModel):
    videos: List[Video]
    query: str
    language: str


@router.get("/search", response_model=SearchResponse)
async def search_learning_videos(
    q: str = Query(..., min_length=1, description="Search query"),
    lang: Optional[str] = Query(None, description="User's preferred language code"),
    current_user: User = Depends(get_current_user),
):
    """
    Search YouTube for agriculture-related videos matching the user's query.
    Results are filtered strictly to the user's preferred language and sorted by views.
    """
    import os
    api_key = os.getenv("YOUTUBE_API_KEY", "")
    if not api_key:
        return SearchResponse(videos=[], query=q, language=lang or "en")

    # Use user's preferred language, default to English
    language = lang if (lang and lang in YOUTUBE_LANG_MAP) else "en"

    # Build language-tailored search query
    if language == "en":
        search_query = f"{q} agriculture farming complete guide tutorial"
    elif language == "te":
        search_query = f"{q} వ్యవసాయం సాగు farming guide telugu"
    elif language == "hi":
        search_query = f"{q} खेती किसान farming guide hindi"
    elif language == "ta":
        search_query = f"{q} விவசாயம் farming guide tamil"
    else:
        lang_name = {
            "kn": "Kannada", "ml": "Malayalam", "mr": "Marathi",
            "gu": "Gujarati", "pa": "Punjabi", "bn": "Bengali",
        }.get(language, "")
        search_query = f"{q} agriculture farming {lang_name}".strip()

    videos = await search_youtube_videos(
        query=search_query,
        max_results=12,
        language=language,
        api_key=api_key,
    )

    def _parse_views_search(view_str: str) -> int:
        if not view_str:
            return 0
        s = view_str.strip().upper().replace(" ", "")
        try:
            if s.endswith("CR"):
                return int(float(s[:-2]) * 10_000_000)
            if s.endswith("L"):
                return int(float(s[:-1]) * 100_000)
            if s.endswith("M"):
                return int(float(s[:-1]) * 1_000_000)
            if s.endswith("K"):
                return int(float(s[:-1]) * 1_000)
            return int(s)
        except (ValueError, TypeError):
            return 0

    result_videos = [
        Video(
            id=v["id"],
            title=v["title"],
            thumbnail=v["thumbnail"],
            category="Search Results",
            emoji="🔍",
            duration=v.get("duration", ""),
            channel=v.get("channel", ""),
            description=v.get("description", ""),
            view_count=v.get("view_count", ""),
        )
        for v in videos
    ]

    result_videos.sort(key=lambda v: _parse_views_search(v.view_count), reverse=True)

    return SearchResponse(
        videos=result_videos,
        query=q,
        language=language,
    )

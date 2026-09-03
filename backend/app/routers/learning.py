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
        "id": "7Q3vQ13-8gY",
        "title": "Smart Farming: The Future of Agriculture",
        "thumbnail": "https://img.youtube.com/vi/7Q3vQ13-8gY/hqdefault.jpg",
        "category": "Smart Farming",
        "emoji": "🎓",
        "duration": "12:05",
        "channel": "AgriTech Today",
        "description": "Explore how technology is transforming modern agriculture with smart farming techniques.",
        "view_count": "",
    },
    {
        "id": "q4vI8F3VDEc",
        "title": "How to Start Organic Farming in India",
        "thumbnail": "https://img.youtube.com/vi/q4vI8F3VDEc/hqdefault.jpg",
        "category": "My Crops",
        "emoji": "🌾",
        "duration": "15:30",
        "channel": "Farming Master",
        "description": "Complete guide on starting organic farming practices in India.",
        "view_count": "",
    },
    {
        "id": "l9wK80Wp1P4",
        "title": "Modern Tractors and Harvesters 2026",
        "thumbnail": "https://img.youtube.com/vi/l9wK80Wp1P4/hqdefault.jpg",
        "category": "Smart Farming",
        "emoji": "🎓",
        "duration": "08:45",
        "channel": "Farm Machinery Hub",
        "description": "Latest farm machinery and equipment for modern agriculture.",
        "view_count": "",
    },
    {
        "id": "1mQ8N8Z6jM0",
        "title": "Precision Irrigation: Drip & Sprinkler Systems",
        "thumbnail": "https://img.youtube.com/vi/1mQ8N8Z6jM0/hqdefault.jpg",
        "category": "Smart Farming",
        "emoji": "🎓",
        "duration": "10:20",
        "channel": "Water Smart Agri",
        "description": "Learn about drip and sprinkler irrigation systems for better water management.",
        "view_count": "",
    },
    {
        "id": "XbXhPqY0r4w",
        "title": "High Yield Tomato Cultivation Tips",
        "thumbnail": "https://img.youtube.com/vi/XbXhPqY0r4w/hqdefault.jpg",
        "category": "My Crops",
        "emoji": "🌾",
        "duration": "11:15",
        "channel": "Horticulture Guide",
        "description": "Tips and techniques for getting high yield from tomato cultivation.",
        "view_count": "",
    },
    {
        "id": "4jVdC_R3nBc",
        "title": "Drone Spraying for Pesticides",
        "thumbnail": "https://img.youtube.com/vi/4jVdC_R3nBc/hqdefault.jpg",
        "category": "Pest & Disease Control",
        "emoji": "🐛",
        "duration": "07:50",
        "channel": "Drone Agri",
        "description": "How drones are revolutionizing pesticide spraying in Indian agriculture.",
        "view_count": "",
    },
]


def _build_fallback_response() -> LearningResponse:
    """Return the curated hardcoded videos when no API key is set."""
    cats = list(dict.fromkeys(v["category"] for v in CURATED_VIDEOS))
    emojis = {v["category"]: v.get("emoji", "") for v in CURATED_VIDEOS}
    return LearningResponse(
        categories=cats,
        category_emojis=emojis,
        videos=[Video(**v) for v in CURATED_VIDEOS],
        personalized_for=[],
        language="en",
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
        return _build_fallback_response()

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
    Results are filtered to the user's preferred language.
    """
    import os
    api_key = os.getenv("YOUTUBE_API_KEY", "")
    if not api_key:
        return SearchResponse(videos=[], query=q, language=lang or "hi")

    # Use user's preferred language, default to Hindi
    language = lang if (lang and lang in YOUTUBE_LANG_MAP) else "hi"

    # Language suffix for better regional results
    lang_suffix = {
        "te": "Telugu", "hi": "Hindi", "ta": "Tamil",
        "kn": "Kannada", "ml": "Malayalam", "mr": "Marathi",
        "gu": "Gujarati", "pa": "Punjabi", "bn": "Bengali",
    }.get(language, "")
    lang_tag = f" in {lang_suffix}" if lang_suffix else ""

    # Build a search query with agriculture context + language
    search_query = f"{q} agriculture farming India{lang_tag}"

    videos = await search_youtube_videos(
        query=search_query,
        max_results=12,
        language=language,
        api_key=api_key,
    )

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

    return SearchResponse(
        videos=result_videos,
        query=q,
        language=language,
    )

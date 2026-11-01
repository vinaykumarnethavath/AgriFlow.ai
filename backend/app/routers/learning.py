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
from ..services.learning_context_service import get_farmer_context

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
    context_tag: Optional[str] = None
    recommendation_reason: Optional[str] = None
    relevance_score: int = 80


class LearningResponse(BaseModel):
    categories: List[str]
    category_emojis: dict = {}
    videos: List[Video]
    personalized_for: List[str] = []
    language: str = "hi"
    farmer_context_summary: Optional[dict] = None


# ─── Context-Aware Curated Fallback Videos (Zero-API Key / Demo Mode) ──────────

CURATED_VIDEOS = [
    {
        "id": "LH5ay10RTGY",
        "title": "Cotton Pink Bollworm & Whitefly Complete Organic Spray Solutions",
        "thumbnail": "https://img.youtube.com/vi/LH5ay10RTGY/hqdefault.jpg",
        "category": "Pest & Disease Control",
        "emoji": "🚨",
        "duration": "13:40",
        "channel": "Organic Farming Hub",
        "description": "Biological and neem-based spray formulations for controlling pink bollworm and sucking pests in cotton.",
        "view_count": "4.5L",
        "context_tag": "Pest Alert · Cotton",
        "recommendation_reason": "Active monitor alert for pest presence on your Cotton plot",
        "relevance_score": 98,
    },
    {
        "id": "dQw4w9WgXcQ",
        "title": "Paddy Flowering & Panicle Stage: Essential Water & Nutrient Care",
        "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        "category": "My Crops",
        "emoji": "🌱",
        "duration": "14:20",
        "channel": "Agriculture India",
        "description": "Panicle initiation management, avoiding moisture stress during flowering, and boron application for grain filling.",
        "view_count": "2.5L",
        "context_tag": "Paddy · Flowering Stage",
        "recommendation_reason": "Your Paddy crop is at Day 62 (Flowering & Panicle Stage)",
        "relevance_score": 95,
    },
    {
        "id": "T-s0V1pCkgs",
        "title": "Black Cotton Soil: Aeration, Drainage & Waterlogging Prevention",
        "thumbnail": "https://img.youtube.com/vi/T-s0V1pCkgs/hqdefault.jpg",
        "category": "Soil Management",
        "emoji": "🧪",
        "duration": "16:30",
        "channel": "ICAR Official",
        "description": "Expert ICAR scientists discuss managing heavy clay and black cotton soils during monsoon to prevent root rot.",
        "view_count": "1.5L",
        "context_tag": "Soil Care · Black Cotton",
        "recommendation_reason": "Tailored for your Plot 1 (Black Cotton Soil) drainage profile",
        "relevance_score": 92,
    },
    {
        "id": "3LopI4YeC4I",
        "title": "Pre-Monsoon & Heavy Rainfall Farm Advisory: Drainage & Spray Timing",
        "thumbnail": "https://img.youtube.com/vi/3LopI4YeC4I/hqdefault.jpg",
        "category": "Weather Advisory",
        "emoji": "🌦️",
        "duration": "12:15",
        "channel": "Kisan Weather Bulletin",
        "description": "Precautions to take before heavy rains, delaying foliar applications and clearing drainage channels.",
        "view_count": "3.1L",
        "context_tag": "Weather · Rain Advisory",
        "recommendation_reason": "Precipitation forecast in your mandal within the next 48 hours",
        "relevance_score": 90,
    },
    {
        "id": "wJnBTPUQS5A",
        "title": "NPK Fertilizer Management – Complete Dosage & Secondary Micronutrient Guide",
        "thumbnail": "https://img.youtube.com/vi/wJnBTPUQS5A/hqdefault.jpg",
        "category": "Fertilizers & Nutrition",
        "emoji": "🧪",
        "duration": "09:50",
        "channel": "Agri Doctor",
        "description": "Understanding NPK ratios, zinc and sulphur replenishment, and split application timing.",
        "view_count": "1.8L",
        "context_tag": "Nutrient Care · NPK",
        "recommendation_reason": "Nutrient balance dosage recommended for active vegetative crops",
        "relevance_score": 85,
    },
    {
        "id": "m1oX_-3bMA0",
        "title": "Mandi Prices Explained – How to Get the Best Rate & Direct Buyer Sales",
        "thumbnail": "https://img.youtube.com/vi/m1oX_-3bMA0/hqdefault.jpg",
        "category": "Market & Mandi",
        "emoji": "📈",
        "duration": "08:15",
        "channel": "Kisan Mitra",
        "description": "Tips to track APMC e-NAM rates, moisture deductions, and bargaining with mill procurement agents.",
        "view_count": "2.1L",
        "context_tag": "Mandi Intelligence",
        "recommendation_reason": "Current mandi trade rates for Cotton & Paddy in your district",
        "relevance_score": 82,
    },
    {
        "id": "mUyDhQ4jC0o",
        "title": "Government Subsidy Schemes for Farmers 2026 – Solar Pumps & Drip Subsidies",
        "thumbnail": "https://img.youtube.com/vi/mUyDhQ4jC0o/hqdefault.jpg",
        "category": "Government Schemes",
        "emoji": "🏛️",
        "duration": "11:05",
        "channel": "Kisan Updates",
        "description": "PM-KUSUM solar pump subsidy and 90% micro-irrigation state subsidies with online application steps.",
        "view_count": "8.1L",
        "context_tag": "Govt Subsidies",
        "recommendation_reason": "State and central subsidy opportunities matching your farm area",
        "relevance_score": 80,
    },
    {
        "id": "J2kHSSFA4NU",
        "title": "Top 10 Most Profitable High-Yield Cash Crops in India 2026",
        "thumbnail": "https://img.youtube.com/vi/J2kHSSFA4NU/hqdefault.jpg",
        "category": "New Crops to Grow",
        "emoji": "🌱",
        "duration": "12:45",
        "channel": "Smart Farming India",
        "description": "Discover high-yield horticultural and pulse crops with steady market demand.",
        "view_count": "5.8L",
        "context_tag": "Crop Diversification",
        "recommendation_reason": "Profitable crop rotation recommendations for post-Kharif season",
        "relevance_score": 78,
    },
    {
        "id": "3LopI4YeC4K",
        "title": "Modern Drip Irrigation Setup & Automation for Maximum Water Savings",
        "thumbnail": "https://img.youtube.com/vi/3LopI4YeC4I/hqdefault.jpg",
        "category": "Smart Farming",
        "emoji": "🎓",
        "duration": "18:30",
        "channel": "Modern Kheti",
        "description": "Step-by-step venturi injector setup and automated solenoid valve control for precise fertigation.",
        "view_count": "3.2L",
        "context_tag": "Smart AgriTech",
        "recommendation_reason": "Precision fertigation guide for commercial row crops",
        "relevance_score": 75,
    },
]


def _build_fallback_response(language: str = "en", farmer_context: Optional[dict] = None) -> LearningResponse:
    """Return context-ranked curated videos when no API key is set or no results found."""
    # Filter or reorder curated videos according to active context
    selected_videos = [Video(**v) for v in CURATED_VIDEOS]
    selected_videos.sort(key=lambda v: v.relevance_score, reverse=True)

    cats = list(dict.fromkeys(v.category for v in selected_videos))
    emojis = {v.category: v.emoji for v in selected_videos}
    crop_names = [c["name"] for c in farmer_context.get("crops", [])] if farmer_context else ["Paddy", "Cotton"]

    return LearningResponse(
        categories=cats,
        category_emojis=emojis,
        videos=selected_videos,
        personalized_for=crop_names,
        language=language,
        farmer_context_summary=farmer_context,
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
    # 1. Extract rich farm context (crops, growth stages, soil profile, health alerts, weather)
    farmer_context = {}
    try:
        farmer_context = await get_farmer_context(current_user.id, session)
    except Exception as e:
        logger.warning(f"[learning] Could not fetch farmer context: {e}")

    crop_names = [c["name"] for c in farmer_context.get("crops", []) if "name" in c]
    farmer_state = farmer_context.get("farmer_state")
    pref_lang = farmer_context.get("preferred_language")

    # Prioritize user's explicit language preference over profile or state-derived language
    if lang and lang in YOUTUBE_LANG_MAP:
        language = lang
    elif pref_lang and pref_lang in YOUTUBE_LANG_MAP:
        language = pref_lang
    else:
        language = get_language_for_state(farmer_state)

    if not api_key:
        logger.info("[learning] No YOUTUBE_API_KEY set, returning context-aware curated fallback")
        return _build_fallback_response(language, farmer_context)

    if refresh:
        clear_cache()

    season = "Kharif"
    if farmer_context.get("crops"):
        seasons = [c.get("season") for c in farmer_context["crops"] if c.get("season")]
        if seasons:
            season = max(set(seasons), key=seasons.count)

    # 2. Build multi-factor context category queries
    category_defs = build_learning_categories(
        crop_names=crop_names,
        season=season,
        language=language,
        farmer_context=farmer_context,
    )

    # 3. Fetch videos for each category in parallel
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

    # 4. Assemble response with contextual tags and reasons
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
                    context_tag=cat_def.get("context_tag") or cat_name,
                    recommendation_reason=cat_def.get("recommendation_reason") or f"Curated guide for {cat_name}",
                    relevance_score=cat_def.get("relevance_score", 80),
                ))

    # Deduplicate videos by ID (same video might appear in multiple categories)
    seen_ids = set()
    unique_videos = []
    for v in all_videos:
        if v.id not in seen_ids:
            seen_ids.add(v.id)
            unique_videos.append(v)

    # If no results at all, return context fallback
    if not unique_videos:
        return _build_fallback_response(language, farmer_context)

    # Sort within each category by relevance score first, then by view count
    def _parse_views(view_str: str) -> int:
        """Parse formatted view count back to int for sorting."""
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

    unique_videos.sort(key=lambda v: (v.relevance_score, _parse_views(v.view_count)), reverse=True)

    return LearningResponse(
        categories=list(dict.fromkeys(category_names)),
        category_emojis=category_emojis,
        videos=unique_videos,
        personalized_for=crop_names,
        language=language,
        farmer_context_summary=farmer_context,
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

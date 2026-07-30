from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List

from ..deps import get_current_user
from ..models.user import User

router = APIRouter(prefix="/learning", tags=["learning"])

class Video(BaseModel):
    id: str
    title: str
    thumbnail: str
    category: str
    duration: str
    channel: str

class LearningResponse(BaseModel):
    categories: List[str]
    videos: List[Video]

# A hardcoded curated list of high-quality agricultural YouTube videos
CURATED_VIDEOS = [
    {
        "id": "7Q3vQ13-8gY",
        "title": "Smart Farming: The Future of Agriculture",
        "thumbnail": "https://img.youtube.com/vi/7Q3vQ13-8gY/hqdefault.jpg",
        "category": "Smart Farming",
        "duration": "12:05",
        "channel": "AgriTech Today"
    },
    {
        "id": "q4vI8F3VDEc",
        "title": "How to Start Organic Farming in India",
        "thumbnail": "https://img.youtube.com/vi/q4vI8F3VDEc/hqdefault.jpg",
        "category": "Crop Techniques",
        "duration": "15:30",
        "channel": "Farming Master"
    },
    {
        "id": "l9wK80Wp1P4",
        "title": "Modern Tractors and Harvesters 2026",
        "thumbnail": "https://img.youtube.com/vi/l9wK80Wp1P4/hqdefault.jpg",
        "category": "Modern Machinery",
        "duration": "08:45",
        "channel": "Farm Machinery Hub"
    },
    {
        "id": "1mQ8N8Z6jM0",
        "title": "Precision Irrigation: Drip & Sprinkler Systems",
        "thumbnail": "https://img.youtube.com/vi/1mQ8N8Z6jM0/hqdefault.jpg",
        "category": "Smart Farming",
        "duration": "10:20",
        "channel": "Water Smart Agri"
    },
    {
        "id": "XbXhPqY0r4w",
        "title": "High Yield Tomato Cultivation Tips",
        "thumbnail": "https://img.youtube.com/vi/XbXhPqY0r4w/hqdefault.jpg",
        "category": "Crop Techniques",
        "duration": "11:15",
        "channel": "Horticulture Guide"
    },
    {
        "id": "4jVdC_R3nBc",
        "title": "Drone Spraying for Pesticides",
        "thumbnail": "https://img.youtube.com/vi/4jVdC_R3nBc/hqdefault.jpg",
        "category": "Modern Machinery",
        "duration": "07:50",
        "channel": "Drone Agri"
    }
]

@router.get("/videos", response_model=LearningResponse)
async def get_curated_videos(
    current_user: User = Depends(get_current_user)
):
    categories = list(set([v["category"] for v in CURATED_VIDEOS]))
    return LearningResponse(
        categories=categories,
        videos=[Video(**v) for v in CURATED_VIDEOS]
    )

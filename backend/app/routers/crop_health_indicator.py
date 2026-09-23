"""
Crop Health Indicator Router
==============================
Provides:
1. GET/PUT per-crop health status (🟢 Healthy / 🟡 Monitor / 🔴 Issue Detected)
2. GET /ai-suggestion — rule-based daily suggestion using weather + crop stage
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from datetime import datetime

from ..database import get_session
from ..deps import get_current_user
from ..models.user import User
from ..models.crop import Crop
from ..models.crop_health_indicator import (
    CropHealthStatus,
    CropHealthStatusCreate,
    CropHealthStatusRead,
    CropHealthStatusUpdate,
)

router = APIRouter(prefix="/crop-health-indicator", tags=["crop-health-indicator"])

# Valid health statuses
VALID_STATUSES = {"healthy", "monitor", "issue"}


@router.get("/crops", response_model=List[CropHealthStatusRead])
async def get_all_crop_health(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Get health status for all of the farmer's crops."""
    query = select(CropHealthStatus).where(CropHealthStatus.user_id == current_user.id)
    result = await session.exec(query)
    return result.all()


@router.get("/crop/{crop_id}", response_model=Optional[CropHealthStatusRead])
async def get_crop_health(
    crop_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Get health status for a specific crop."""
    # Verify crop ownership
    crop = await session.get(Crop, crop_id)
    if not crop or getattr(crop, "user_id", None) != current_user.id:
        raise HTTPException(status_code=404, detail="Crop not found")

    query = select(CropHealthStatus).where(
        CropHealthStatus.crop_id == crop_id,
        CropHealthStatus.user_id == current_user.id,
    )
    result = await session.exec(query)
    status = result.first()

    if not status:
        # Auto-calculate from crop stage if no manual status exists
        auto_status = _auto_calculate_health(crop)
        return CropHealthStatusRead(
            id=0,
            crop_id=crop_id,
            user_id=current_user.id,
            status=auto_status["status"],
            notes=auto_status["notes"],
            updated_at=datetime.utcnow(),
        )
    return status


@router.put("/crop/{crop_id}", response_model=CropHealthStatusRead)
async def update_crop_health(
    crop_id: int,
    data: CropHealthStatusUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Update or create health status for a crop."""
    # Verify crop ownership
    crop = await session.get(Crop, crop_id)
    if not crop or getattr(crop, "user_id", None) != current_user.id:
        raise HTTPException(status_code=404, detail="Crop not found")

    if data.status and data.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}",
        )

    # Find existing or create new
    query = select(CropHealthStatus).where(
        CropHealthStatus.crop_id == crop_id,
        CropHealthStatus.user_id == current_user.id,
    )
    result = await session.exec(query)
    existing = result.first()

    if existing:
        if data.status is not None:
            existing.status = data.status
        if data.notes is not None:
            existing.notes = data.notes
        existing.updated_at = datetime.utcnow()
        session.add(existing)
        await session.commit()
        await session.refresh(existing)
        return existing
    else:
        new_status = CropHealthStatus(
            crop_id=crop_id,
            user_id=current_user.id,
            status=data.status or "healthy",
            notes=data.notes,
            updated_at=datetime.utcnow(),
        )
        session.add(new_status)
        await session.commit()
        await session.refresh(new_status)
        return new_status


@router.get("/suggestion")
async def get_ai_suggestion(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Returns a smart AI suggestion based on:
    - Current weather conditions (if available)
    - Crop growth stages
    - Time of year
    
    Simple rule-based logic — no ML required.
    """
    # Get active crops
    query = select(Crop).where(
        Crop.user_id == current_user.id,
        Crop.status == "Growing",
    )
    result = await session.exec(query)
    active_crops = result.all()

    if not active_crops:
        return {
            "suggestion": "No active crops found. Consider planning your next sowing based on the upcoming season.",
            "category": "planning",
            "icon": "🌱",
        }

    suggestions = []

    for crop in active_crops:
        days_since_sowing = (datetime.utcnow() - crop.sowing_date).days
        crop_name = crop.name

        # Early stage (0-15 days) — germination
        if days_since_sowing <= 15:
            suggestions.append({
                "suggestion": f"Your {crop_name} is in germination stage ({days_since_sowing} days). Ensure consistent soil moisture and avoid waterlogging.",
                "category": "irrigation",
                "icon": "💧",
                "priority": 2,
            })

        # Seedling stage (15-30 days)
        elif days_since_sowing <= 30:
            suggestions.append({
                "suggestion": f"Your {crop_name} seedlings are {days_since_sowing} days old. This is a good time for first dose of nitrogen fertilizer (urea/DAP).",
                "category": "fertilizer",
                "icon": "🧪",
                "priority": 2,
            })

        # Vegetative stage (30-60 days)
        elif days_since_sowing <= 60:
            suggestions.append({
                "suggestion": f"{crop_name} is in active vegetative growth ({days_since_sowing} days). Monitor for pest attacks and consider preventive spraying.",
                "category": "pest_management",
                "icon": "🛡️",
                "priority": 1,
            })

        # Flowering/Reproductive (60-90 days)
        elif days_since_sowing <= 90:
            suggestions.append({
                "suggestion": f"{crop_name} is entering flowering stage ({days_since_sowing} days). Avoid excess nitrogen. Apply potash for better grain filling.",
                "category": "fertilizer",
                "icon": "🌸",
                "priority": 1,
            })

        # Maturity (90-120 days)
        elif days_since_sowing <= 120:
            suggestions.append({
                "suggestion": f"{crop_name} is maturing ({days_since_sowing} days). Reduce irrigation gradually. Start planning harvest logistics and market linkage.",
                "category": "harvest",
                "icon": "🌾",
                "priority": 1,
            })

        # Ready to harvest (120+ days)
        else:
            suggestions.append({
                "suggestion": f"{crop_name} is at {days_since_sowing} days. If not harvested yet, check crop maturity indicators and harvest promptly to avoid field losses.",
                "category": "harvest",
                "icon": "⚠️",
                "priority": 0,
            })

    # Season-based suggestions
    month = datetime.utcnow().month
    if month in (6, 7):  # June-July — monsoon start
        suggestions.append({
            "suggestion": "Monsoon season: ensure proper drainage in fields. Check bunds for leaks. Prepare for excess rainfall events.",
            "category": "weather",
            "icon": "🌧️",
            "priority": 3,
        })
    elif month in (11, 12):  # Rabi sowing
        suggestions.append({
            "suggestion": "Rabi season is here. Consider sowing wheat, mustard, or chickpea if land is available. Soil moisture from kharif harvest is ideal for Rabi sowing.",
            "category": "planning",
            "icon": "📅",
            "priority": 3,
        })
    elif month in (3, 4):  # Summer/Pre-Kharif
        suggestions.append({
            "suggestion": "Summer heat is increasing. Mulching can reduce soil moisture loss by 25-30%. Consider summer ploughing for pest control.",
            "category": "management",
            "icon": "☀️",
            "priority": 3,
        })

    # Sort by priority (lower = more urgent)
    suggestions.sort(key=lambda s: s.get("priority", 5))

    # Return top suggestion
    if suggestions:
        top = suggestions[0]
        return {
            "suggestion": top["suggestion"],
            "category": top["category"],
            "icon": top["icon"],
            "all_suggestions": suggestions[:5],  # Return top 5
        }

    return {
        "suggestion": "All crops are growing well. Keep monitoring regularly.",
        "category": "general",
        "icon": "✅",
    }


def _auto_calculate_health(crop: Crop) -> dict:
    """Auto-calculate health status from crop stage. Simple rule-based logic."""
    days_since_sowing = (datetime.utcnow() - crop.sowing_date).days

    # If crop is within expected timeline, healthy
    if crop.expected_harvest_date:
        days_to_harvest = (crop.expected_harvest_date - datetime.utcnow()).days
        if days_to_harvest < 0:
            # Overdue harvest
            return {
                "status": "issue",
                "notes": f"Harvest overdue by {abs(days_to_harvest)} days",
            }
        elif days_to_harvest <= 7:
            return {
                "status": "monitor",
                "notes": f"Harvest due in {days_to_harvest} days",
            }

    # General age-based heuristic
    if days_since_sowing <= 90:
        return {"status": "healthy", "notes": f"Day {days_since_sowing} — normal growth stage"}
    elif days_since_sowing <= 150:
        return {"status": "monitor", "notes": f"Day {days_since_sowing} — monitor for maturity signs"}
    else:
        return {"status": "issue", "notes": f"Day {days_since_sowing} — crop may be overdue for harvest"}

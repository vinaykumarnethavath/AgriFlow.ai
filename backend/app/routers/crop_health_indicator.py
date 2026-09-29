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
    Returns high-priority, actionable daily AI recommendations for TODAY based on:
    - Today's real-time weather & microclimate (rain, wind, heat, soil moisture)
    - Today's scheduled farm activities
    - Immediate daily field inspections and crop growth stage tasks
    """
    # Get active crops
    query = select(Crop).where(
        Crop.user_id == current_user.id,
        Crop.status == "Growing",
    )
    result = await session.exec(query)
    active_crops = result.all()

    suggestions = []
    today_date = datetime.utcnow().date()

    # 1. ── Today's Scheduled Farm Activities (Highest Priority if due today) ──
    try:
        from ..models.farm_calendar import FarmEvent
        event_query = select(FarmEvent).where(
            FarmEvent.user_id == current_user.id,
            FarmEvent.event_date == today_date,
            FarmEvent.is_completed == False,
        )
        today_events = (await session.exec(event_query)).all()
        for ev in today_events:
            suggestions.append({
                "suggestion": f"Today's scheduled task: {ev.title} ({ev.event_type.capitalize()}). Prioritize completing this task during morning farm hours.",
                "category": "schedule",
                "icon": "📋",
                "priority": 0,
            })
    except Exception as e:
        print(f"[AISuggestion] Calendar query skipped: {e}")

    # 2. ── Today's Live Weather Operations Advisory ──
    try:
        from ..models.farmer import FarmerProfile
        from .weather import get_forecast

        prof_res = await session.exec(select(FarmerProfile).where(FarmerProfile.user_id == current_user.id))
        f_prof = prof_res.first()

        lat, lon = 17.385, 78.4867
        if f_prof and getattr(f_prof, "district", None):
            try:
                from .weather import geocode
                geo = await geocode(f_prof.district)
                if geo.get("results"):
                    lat = geo["results"][0].get("latitude", lat)
                    lon = geo["results"][0].get("longitude", lon)
            except Exception:
                pass

        forecast_data = await get_forecast(lat=lat, lon=lon)
        current_w = forecast_data.get("current", {})
        daily_w = forecast_data.get("daily", [])
        today_d = daily_w[0] if daily_w else {}

        temp_max = today_d.get("temperature_2m_max") or current_w.get("temperature_2m", 30)
        precip = today_d.get("precipitation_sum") or current_w.get("precipitation", 0)
        rain_prob = today_d.get("precipitation_probability_max", 0)
        wind_spd = current_w.get("wind_speed_10m") or current_w.get("wind_speed", 10)
        sm_surface = current_w.get("soil_moisture_0_to_1cm") if current_w.get("soil_moisture_0_to_1cm") is not None else current_w.get("soil_moisture_0_to_7cm")

        if precip > 2.0 or rain_prob >= 40:
            suggestions.append({
                "suggestion": f"Rain expected today ({precip} mm, {rain_prob}% chance). Postpone fertilizer broadcasting and pesticide sprays today to prevent wash-off; ensure field drainage trenches are clear.",
                "category": "weather_action",
                "icon": "🌧️",
                "priority": 0,
            })
        elif wind_spd > 20:
            suggestions.append({
                "suggestion": f"Breezy conditions today ({round(wind_spd)} km/h). Delay chemical foliar spraying today to prevent spray drift onto neighboring rows or non-target plants.",
                "category": "weather_action",
                "icon": "💨",
                "priority": 1,
            })
        elif temp_max >= 35:
            suggestions.append({
                "suggestion": f"High temperature expected today (peak {round(temp_max)}°C). Complete field irrigation in early morning or after sunset to minimize heat stress and rapid evaporation.",
                "category": "weather_action",
                "icon": "☀️",
                "priority": 1,
            })
        elif sm_surface is not None and sm_surface < 0.12:
            suggestions.append({
                "suggestion": "Surface soil moisture is depleted today (<12%). Run an irrigation cycle this morning to keep root zones hydrated and maintain active nutrient uptake.",
                "category": "irrigation",
                "icon": "💧",
                "priority": 1,
            })
        else:
            suggestions.append({
                "suggestion": f"Clear weather today ({round(temp_max)}°C). Ideal window for morning field inspection, light weeding, or planned foliar nutrient application.",
                "category": "weather_action",
                "icon": "🌤️",
                "priority": 1,
            })
    except Exception as e:
        print(f"[AISuggestion] Weather evaluation fallback: {e}")

    # 3. ── Active Crops — Immediate Tasks for Today ──
    for crop in active_crops:
        days_since_sowing = (datetime.utcnow() - crop.sowing_date).days
        crop_name = crop.name

        # Early stage (0-15 days) — germination
        if days_since_sowing <= 15:
            suggestions.append({
                "suggestion": f"Today's field check: Inspect {crop_name} (day {days_since_sowing}) rows for uniform seedling emergence and maintain moist soil bed.",
                "category": "irrigation",
                "icon": "🌱",
                "priority": 1,
            })

        # Seedling stage (15-35 days)
        elif days_since_sowing <= 35:
            suggestions.append({
                "suggestion": f"Today's crop task: Check {crop_name} (day {days_since_sowing}) seedlings for early stem borer/damping-off; ideal time for first scheduled dose of nitrogen fertilizer.",
                "category": "fertilizer",
                "icon": "🧪",
                "priority": 1,
            })

        # Vegetative stage (35-65 days)
        elif days_since_sowing <= 65:
            suggestions.append({
                "suggestion": f"Today's scouting: Inspect underleaves of {crop_name} (day {days_since_sowing}) during early morning hours for aphids, caterpillars, or fungal leaf spots.",
                "category": "pest_management",
                "icon": "🛡️",
                "priority": 1,
            })

        # Flowering/Reproductive (65-95 days)
        elif days_since_sowing <= 95:
            suggestions.append({
                "suggestion": f"Today's priority: Maintain steady root moisture for {crop_name} (day {days_since_sowing}) during critical flowering stage; avoid water stress today.",
                "category": "fertilizer",
                "icon": "🌸",
                "priority": 1,
            })

        # Maturity / Approaching Harvest (95-125 days)
        elif days_since_sowing <= 125:
            suggestions.append({
                "suggestion": f"Today's harvest check: Check grain hardness and husk drying in {crop_name} (day {days_since_sowing}) to schedule threshing and harvest logistics.",
                "category": "harvest",
                "icon": "🌾",
                "priority": 2,
            })

        # Overdue / Past Normal Harvest (>125 days)
        else:
            suggestions.append({
                "suggestion": f"Record update: {crop_name} is recorded at {days_since_sowing} days. If harvest was completed, mark this crop completed in My Crops; if still standing, harvest promptly.",
                "category": "harvest",
                "icon": "⚠️",
                "priority": 5,  # Low priority so it does NOT displace today's actual daily operational advice!
            })

    if not suggestions:
        suggestions.append({
            "suggestion": "Today's farm routine: Scout field borders early in the day for pest movement and ensure irrigation drip lines/channels are free of silt.",
            "category": "management",
            "icon": "🔍",
            "priority": 2,
        })

    # Sort by priority (lower number = more urgent / relevant for TODAY)
    suggestions.sort(key=lambda s: s.get("priority", 5))

    top = suggestions[0]
    return {
        "suggestion": top["suggestion"],
        "category": top["category"],
        "icon": top["icon"],
        "all_suggestions": suggestions[:5],
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

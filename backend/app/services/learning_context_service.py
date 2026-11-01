"""
Farmer Farm Context Aggregator Service
======================================
Gathers comprehensive context for the farmer to drive personalized
recommendations in the Learning Hub:
  1. Active Crops & Computed Growth Stages (Sowing, Vegetative, Flowering, Ripening, Harvest)
  2. Plot Soil Profiles (Soil Types: Black Cotton, Red Loam, Alluvial, pH, NPK deficits)
  3. Crop Health Status & Pest/Disease Alerts
  4. Weather Alerts & Trends (Rainfall, Drought/Heatwave, Humidity)
"""

from datetime import datetime
import logging
from typing import Dict, List, Any, Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from ..models.crop import Crop
from ..models.soil_profile import SoilProfile
from ..models.crop_health_indicator import CropHealthStatus
from ..models.farmer import FarmerProfile

logger = logging.getLogger(__name__)

SOIL_LABEL_MAP = {
    "black_regur": "Black Cotton Soil",
    "black_cotton": "Black Cotton Soil",
    "red_loam": "Red Loamy Soil",
    "red_soil": "Red Soil",
    "alluvial": "Alluvial Soil",
    "clay_loam": "Clay Loam Soil",
    "sandy_loam": "Sandy Loam Soil",
    "laterite": "Laterite Soil",
    "silt_loam": "Silt Loam Soil",
}


def calculate_growth_stage(sowing_date: Optional[datetime], expected_harvest_date: Optional[datetime]) -> Dict[str, Any]:
    """Calculate the estimated biological growth stage and days elapsed."""
    now = datetime.utcnow()
    if not sowing_date:
        return {
            "stage": "Vegetative",
            "progress_percent": 35,
            "days_elapsed": 45,
            "stage_description": "Active vegetative growth and leaf development"
        }

    elapsed_days = max(0, (now - sowing_date).days)

    if expected_harvest_date and expected_harvest_date > sowing_date:
        total_days = max(1, (expected_harvest_date - sowing_date).days)
        progress = min(max(elapsed_days / total_days, 0.0), 1.25)
    else:
        # Default typical crop duration ~120 days
        total_days = 120
        progress = min(max(elapsed_days / total_days, 0.0), 1.25)

    progress_percent = int(progress * 100)

    if progress < 0.20:
        stage = "Sowing & Seedling"
        desc = "Nursery preparation, seed germination, and early root establishment"
    elif progress < 0.50:
        stage = "Vegetative"
        desc = "Tillering, foliage development, and active nutrient uptake"
    elif progress < 0.75:
        stage = "Flowering"
        desc = "Panicle initiation, flowering, and boll/fruit formation"
    elif progress <= 1.00:
        stage = "Ripening"
        desc = "Grain filling, pod maturation, and pre-harvest drying"
    else:
        stage = "Harvest"
        desc = "Ready for harvest, threshing, and post-harvest storage"

    return {
        "stage": stage,
        "progress_percent": progress_percent,
        "days_elapsed": elapsed_days,
        "stage_description": desc,
    }


async def get_farmer_context(user_id: int, session: AsyncSession) -> Dict[str, Any]:
    """
    Extract multi-factor farm signals for a given farmer:
    - Crops & growth stages
    - Soil types & nutrient deficits
    - Health alerts (pest/disease issues)
    - State & regional language
    - Weather alerts
    """
    crops_context: List[Dict[str, Any]] = []
    soil_types: List[str] = []
    soil_labels: List[str] = []
    health_alerts: List[Dict[str, Any]] = []
    farmer_state: Optional[str] = None
    preferred_language: Optional[str] = None

    # 1. Fetch Farmer Profile
    try:
        profile_res = await session.exec(
            select(FarmerProfile).where(FarmerProfile.user_id == user_id)
        )
        profile = profile_res.first()
        if profile:
            farmer_state = profile.state
            preferred_language = profile.preferred_language
    except Exception as e:
        logger.warning(f"[learning_context] Error fetching profile for user {user_id}: {e}")

    # 2. Fetch Active Crops
    crop_id_to_crop: Dict[int, Crop] = {}
    try:
        crop_res = await session.exec(
            select(Crop).where(
                Crop.user_id == user_id,
                Crop.status == "Growing",
            )
        )
        crops = crop_res.all()
        for c in crops:
            if c.id is not None:
                crop_id_to_crop[c.id] = c
            stage_info = calculate_growth_stage(c.sowing_date, c.expected_harvest_date)
            crops_context.append({
                "id": c.id,
                "name": c.name,
                "variety": c.variety or "",
                "season": c.season or "Kharif",
                "area_acres": c.area,
                "stage": stage_info["stage"],
                "progress_percent": stage_info["progress_percent"],
                "days_elapsed": stage_info["days_elapsed"],
                "stage_description": stage_info["stage_description"],
            })
    except Exception as e:
        logger.warning(f"[learning_context] Error fetching crops for user {user_id}: {e}")

    # Fallback default crop if farmer has none registered yet
    if not crops_context:
        crops_context.append({
            "id": 0,
            "name": "Paddy",
            "variety": "BPT-5204",
            "season": "Kharif",
            "area_acres": 3.5,
            "stage": "Flowering",
            "progress_percent": 60,
            "days_elapsed": 65,
            "stage_description": "Panicle initiation and flowering stage",
        })

    # 3. Fetch Soil Profiles
    try:
        soil_res = await session.exec(
            select(SoilProfile).where(SoilProfile.farmer_id == user_id)
        )
        soil_profiles = soil_res.all()
        for sp in soil_profiles:
            st = (sp.soil_type or "black_regur").lower().strip()
            if st not in soil_types:
                soil_types.append(st)
                label = SOIL_LABEL_MAP.get(st, st.replace("_", " ").title())
                if label not in soil_labels:
                    soil_labels.append(label)
    except Exception as e:
        logger.warning(f"[learning_context] Error fetching soil profiles: {e}")

    if not soil_labels:
        # Sensible defaults for Indian Deccan/Coastal regions
        soil_types = ["black_regur"]
        soil_labels = ["Black Cotton Soil"]

    # 4. Fetch Crop Health Alerts
    try:
        health_res = await session.exec(
            select(CropHealthStatus).where(CropHealthStatus.user_id == user_id)
        )
        health_statuses = health_res.all()
        for hs in health_statuses:
            if hs.status in ["issue", "monitor"]:
                crop_name = "Crop"
                if hs.crop_id in crop_id_to_crop:
                    crop_name = crop_id_to_crop[hs.crop_id].name
                health_alerts.append({
                    "crop_id": hs.crop_id,
                    "crop_name": crop_name,
                    "status": hs.status,
                    "notes": hs.notes or f"Active {hs.status} alert on {crop_name}",
                })
    except Exception as e:
        logger.warning(f"[learning_context] Error fetching crop health: {e}")

    # 5. Determine Weather Alerts (from weather cache or seasonal defaults)
    weather_alert = None
    try:
        from ..routers.weather import _weather_cache
        # Inspect active cache for precipitation or high temp
        for _, (_, weather_data) in _weather_cache.items():
            if isinstance(weather_data, dict):
                current = weather_data.get("current", {})
                daily = weather_data.get("daily", {})
                precip_sums = daily.get("precipitation_sum", [])
                if precip_sums and any(p and p > 15 for p in precip_sums[:3]):
                    weather_alert = {
                        "type": "rain_alert",
                        "severity": "high",
                        "title": "Heavy Rain Forecast",
                        "advisory": "Expected rainfall > 15mm. Check field drainage and delay foliar spraying."
                    }
                    break
                temp = current.get("temperature_2m", 30)
                if temp and temp > 38:
                    weather_alert = {
                        "type": "heatwave",
                        "severity": "medium",
                        "title": "High Heat Stress",
                        "advisory": "Temperatures exceeding 38°C. Ensure timely evening irrigation."
                    }
                    break
    except Exception as e:
        logger.debug(f"[learning_context] Weather check skipped: {e}")

    return {
        "farmer_state": farmer_state,
        "preferred_language": preferred_language,
        "crops": crops_context,
        "soil_types": soil_types,
        "soil_labels": soil_labels,
        "health_alerts": health_alerts,
        "weather_alert": weather_alert,
    }


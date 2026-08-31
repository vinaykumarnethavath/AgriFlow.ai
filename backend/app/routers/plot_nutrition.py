import os
import json
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import selectinload
from groq import AsyncGroq

from ..database import get_session
from ..deps import get_current_user
from ..models.user import User, UserRole
from ..models.farmer import FarmerProfile, LandRecord
from ..models.crop import Crop
from ..models.plot_nutrition import (
    PlotSoilData, PlotSoilDataCreate, PlotSoilDataRead,
    FertilizerApplication, FertilizerApplicationCreate, FertilizerApplicationRead,
)

router = APIRouter(prefix="/plot-nutrition", tags=["plot-nutrition"])


# ---------------------------------------------------------------------------
# Response / request helpers
# ---------------------------------------------------------------------------

class LiveSoilStatus(BaseModel):
    baseline: dict
    adjusted: dict
    deltas: dict
    added_nutrients: dict
    crop_absorbed: dict
    total_applications: int
    nutrient_balance: dict
    last_applied: Optional[str] = None


class PlotOverview(BaseModel):
    """Aggregated view of a land record + optional soil data + optional crop."""
    land_record_id: int
    serial_number: str
    area: float
    soil_data: Optional[PlotSoilDataRead] = None
    crop_name: Optional[str] = None
    crop_status: Optional[str] = None
    crop_id: Optional[int] = None
    live_adjusted: Optional[LiveSoilStatus] = None


class LinkCropRequest(BaseModel):
    crop_id: int


class FertilizerRec(BaseModel):
    name: str
    quantity: str
    timing: str
    application_method: str


class NutritionRecommendation(BaseModel):
    status: str
    soil_health_summary: str
    recommendations: list[FertilizerRec]
    additional_tips: list[str]


class ImpactAnalysis(BaseModel):
    overall_status: str
    nutrient_balance: dict  # { "nitrogen": "optimal", "phosphorus": "deficient", ... }
    estimated_levels: dict  # { "nitrogen": 160, "phosphorus": 40, ... }
    analysis_summary: str
    adjusted_recommendations: list[FertilizerRec]
    risk_alerts: list[str]



# ---------------------------------------------------------------------------
# Groq helpers
# ---------------------------------------------------------------------------

def _get_groq_client() -> Optional[AsyncGroq]:
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key or api_key == "your-groq-api-key-here":
        return None
    return AsyncGroq(api_key=api_key, timeout=20.0)


async def _call_groq(prompt: str, system_msg: str = "You are a helpful agronomist that returns only valid JSON.") -> dict:
    client = _get_groq_client()
    if client is None:
        return {}

    candidate_models = [
        os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b"),
        "openai/gpt-oss-20b",
        "openai/gpt-oss-120b",
    ]
    # Remove duplicates while preserving order
    models = list(dict.fromkeys(candidate_models))

    for model_name in models:
        try:
            response = await client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                max_tokens=1500,
            )
            raw_text = response.choices[0].message.content or ""
            json_text = raw_text.strip()
            # Remove reasoning / think tokens if model is a thinking model
            if "<think>" in json_text and "</think>" in json_text:
                json_text = json_text.split("</think>")[-1].strip()
            if json_text.startswith("```json"):
                json_text = json_text[7:]
            if json_text.startswith("```"):
                json_text = json_text[3:]
            if json_text.endswith("```"):
                json_text = json_text[:-3]
            json_text = json_text.strip()

            try:
                return json.loads(json_text)
            except json.JSONDecodeError:
                import re
                match = re.search(r'\{[\s\S]*\}', json_text)
                if match:
                    return json.loads(match.group(0))
        except Exception as e:
            print(f"[PlotNutrition] Groq attempt failed with {model_name}: {e}")
            continue

    return {}


def _generate_fallback_recommendation(soil: PlotSoilData, area: float, crop_name: str) -> NutritionRecommendation:
    status = "Good"
    recs = []
    tips = [
        f"For {crop_name}, maintain balanced soil moisture before and after fertilizer application.",
        "Add well-decomposed organic compost or farmyard manure (FYM) to improve soil organic carbon.",
        "Retest soil after crop harvest or 45-60 days to track nutrient replenishment.",
    ]

    # Nitrogen check (optimal: 140 - 280 kg/ha)
    if soil.nitrogen < 140:
        status = "Needs Improvement"
        urea_qty = max(10, round(45 * area))
        recs.append(FertilizerRec(
            name="Urea (46% N)",
            quantity=f"{urea_qty} kg for {area} acres",
            timing="Split: 50% basal at sowing, 50% at vegetative stage (30-40 DAS)",
            application_method="Broadcasting followed by light irrigation"
        ))
    elif soil.nitrogen > 300:
        tips.append("Soil nitrogen is elevated. Avoid excess urea to prevent vegetative overgrowth and pest susceptibility.")

    # Phosphorus check (optimal: 35 - 75 kg/ha)
    if soil.phosphorus < 40:
        status = "Needs Improvement" if status == "Good" else "Poor"
        dap_qty = max(10, round(30 * area))
        recs.append(FertilizerRec(
            name="DAP (18-46-0) or SSP",
            quantity=f"{dap_qty} kg for {area} acres",
            timing="Basal application at or before sowing",
            application_method="Band placement 4-5 cm below seed depth"
        ))

    # Potassium check (optimal: 150 - 300 kg/ha)
    if soil.potassium < 150:
        mop_qty = max(5, round(20 * area))
        recs.append(FertilizerRec(
            name="MOP (Muriate of Potash - 60% K2O)",
            quantity=f"{mop_qty} kg for {area} acres",
            timing="Basal dose or split at flowering stage",
            application_method="Broadcasting"
        ))

    # pH check
    if soil.ph_level < 6.0:
        status = "Poor"
        recs.append(FertilizerRec(
            name="Agricultural Lime (CaCO3)",
            quantity=f"{round(100 * area)} kg for {area} acres",
            timing="2-3 weeks prior to sowing",
            application_method="Broadcast and mix well into topsoil"
        ))
        tips.append("Soil is acidic (pH < 6.0), which restricts phosphorus uptake. Liming will normalize pH.")
    elif soil.ph_level > 8.0:
        status = "Needs Improvement" if status == "Good" else status
        recs.append(FertilizerRec(
            name="Gypsum (CaSO4·2H2O)",
            quantity=f"{round(80 * area)} kg for {area} acres",
            timing="Before land preparation",
            application_method="Broadcast and incorporate with irrigation"
        ))
        tips.append("Soil is alkaline (pH > 8.0). Gypsum application and zinc foliar spray are recommended.")

    if not recs:
        recs.append(FertilizerRec(
            name="Balanced NPK (19:19:19)",
            quantity=f"{round(15 * area)} kg for {area} acres",
            timing="Maintenance dose during vegetative growth",
            application_method="Foliar spray or fertigation"
        ))

    summary = (
        f"Plot ({area} acres) growing {crop_name}: Soil pH is {soil.ph_level} with NPK levels "
        f"({soil.nitrogen}, {soil.phosphorus}, {soil.potassium}) kg/ha. "
        f"{'Nutrient levels are generally optimal with maintenance recommended.' if status == 'Good' else 'Targeted nutrient supplementation is required for optimal crop performance.'}"
    )

    return NutritionRecommendation(
        status=status,
        soil_health_summary=summary,
        recommendations=recs,
        additional_tips=tips[:4]
    )


def compute_live_soil_dynamics(
    soil: PlotSoilData,
    area: float,
    crop: Optional[Crop],
    applications: List[FertilizerApplication]
) -> dict:
    """
    Computes real-time dynamic soil nutrient adjustments:
    1. Baseline lab test values (immutable ground truth)
    2. Fertilizer grade additions (converted to kg/ha active nutrients based on plot area)
    3. Application method efficiency factor (Fertigation 85%, Band placement 75%, Broadcasting 55%, Foliar 90%)
    4. Crop-specific nutrient uptake & absorption based on crop family
    5. Soil pH buffering & amendment shifts (Lime, Gypsum, organic matter, acidifying urea)
    """
    area_ha = max(area * 0.404686, 0.2)  # convert acres to hectares, minimum 0.2 ha

    # 1. Base values
    base_n = soil.nitrogen
    base_p = soil.phosphorus
    base_k = soil.potassium
    base_ph = soil.ph_level

    if not applications:
        return {
            "baseline": {
                "nitrogen": base_n,
                "phosphorus": base_p,
                "potassium": base_k,
                "ph_level": base_ph,
                "organic_carbon": soil.organic_carbon,
                "last_tested": soil.last_tested.isoformat() if soil.last_tested else None
            },
            "adjusted": {
                "nitrogen": base_n,
                "phosphorus": base_p,
                "potassium": base_k,
                "ph_level": base_ph,
            },
            "deltas": {
                "nitrogen": 0.0,
                "phosphorus": 0.0,
                "potassium": 0.0,
                "ph_level": 0.0,
            },
            "added_nutrients": {
                "nitrogen": 0.0,
                "phosphorus": 0.0,
                "potassium": 0.0,
            },
            "crop_absorbed": {
                "nitrogen": 0.0,
                "phosphorus": 0.0,
                "potassium": 0.0,
                "crop_name": crop.name if crop else "General Crop",
                "absorption_note": "No fertilizers applied yet. Current root zone reflects original baseline soil test."
            },
            "total_applications": 0,
            "nutrient_balance": {
                "nitrogen": "optimal" if 140 <= base_n <= 280 else ("deficient" if base_n < 140 else "excessive"),
                "phosphorus": "optimal" if 35 <= base_p <= 75 else ("deficient" if base_p < 35 else "excessive"),
                "potassium": "optimal" if 150 <= base_k <= 300 else ("deficient" if base_k < 150 else "excessive"),
                "ph": "optimal" if 6.2 <= base_ph <= 7.8 else ("acidic" if base_ph < 6.2 else "alkaline")
            },
            "last_applied": None
        }

    # 2. Calculate added nutrients per fertilizer
    total_added_n_kg = 0.0
    total_added_p_kg = 0.0
    total_added_k_kg = 0.0
    ph_shift = 0.0

    # Sort applications by date
    sorted_apps = sorted(applications, key=lambda a: a.application_date if a.application_date else datetime.min)

    for app in sorted_apps:
        name = (app.fertilizer_name or "").lower()
        qty = app.quantity
        if app.unit == "bags":
            qty *= 50.0  # standard 50kg bag
        elif app.unit == "tons":
            qty *= 1000.0

        # Method efficiency
        method = (app.application_method or "").lower()
        eff = 0.65  # default
        if "fertigation" in method or "drip" in method:
            eff = 0.85
        elif "band" in method or "placement" in method:
            eff = 0.75
        elif "foliar" in method or "spray" in method:
            eff = 0.90
        elif "broadcast" in method:
            eff = 0.55

        if "urea" in name:
            n_raw = qty * 0.46
            total_added_n_kg += n_raw * eff
            ph_shift -= 0.02 * (qty / max(area, 1.0))
        elif "dap" in name:
            n_raw = qty * 0.18
            p_raw = qty * 0.46 * 0.4364  # P2O5 to elemental P
            total_added_n_kg += n_raw * eff
            total_added_p_kg += p_raw * (eff * 0.45)
        elif "mop" in name or "potash" in name or "muriate" in name:
            k_raw = qty * 0.60 * 0.83  # K2O to elemental K
            total_added_k_kg += k_raw * eff
        elif "ssp" in name or "single super" in name:
            p_raw = qty * 0.16 * 0.4364
            total_added_p_kg += p_raw * (eff * 0.45)
        elif "19:19:19" in name or "npk" in name or "complex" in name:
            total_added_n_kg += qty * 0.19 * eff
            total_added_p_kg += qty * 0.19 * 0.4364 * (eff * 0.45)
            total_added_k_kg += qty * 0.19 * 0.83 * eff
        elif "ammonium sulphate" in name:
            total_added_n_kg += qty * 0.21 * eff
            ph_shift -= 0.03 * (qty / max(area, 1.0))
        elif "lime" in name or "calcium" in name:
            ph_shift += min(1.2, 0.015 * (qty / max(area, 1.0)))
        elif "gypsum" in name:
            if base_ph > 7.5:
                ph_shift -= min(0.8, 0.01 * (qty / max(area, 1.0)))
        elif "vermicompost" in name or "fym" in name or "manure" in name or "compost" in name:
            total_added_n_kg += qty * 0.015 * 0.8
            total_added_p_kg += qty * 0.008 * 0.8
            total_added_k_kg += qty * 0.012 * 0.8
            if base_ph < 6.5:
                ph_shift += 0.1
            elif base_ph > 7.5:
                ph_shift -= 0.1
        elif "neem" in name:
            total_added_n_kg += qty * 0.05 * eff
            total_added_p_kg += qty * 0.01 * eff
            total_added_k_kg += qty * 0.015 * eff

    # Convert added kg to kg/ha equivalent
    added_n_kgha = total_added_n_kg / area_ha
    added_p_kgha = total_added_p_kg / area_ha
    added_k_kgha = total_added_k_kg / area_ha

    # 3. Crop absorption dynamics based on crop type
    crop_name = (crop.name if crop else "").lower()
    crop_type = (crop.crop_type if crop else "").lower()

    if "cotton" in crop_name or "cotton" in crop_type:
        uptake_n_rate = 0.45
        uptake_p_rate = 0.35
        uptake_k_rate = 0.55  # Cotton is a heavy potassium absorber
    elif "rice" in crop_name or "paddy" in crop_name:
        uptake_n_rate = 0.50
        uptake_p_rate = 0.30
        uptake_k_rate = 0.35
    elif "wheat" in crop_name:
        uptake_n_rate = 0.42
        uptake_p_rate = 0.38
        uptake_k_rate = 0.35
    elif "maize" in crop_name or "corn" in crop_name:
        uptake_n_rate = 0.48
        uptake_p_rate = 0.40
        uptake_k_rate = 0.38
    elif "pulse" in crop_type or "gram" in crop_name or "soy" in crop_name or "moong" in crop_name:
        uptake_n_rate = 0.15  # Fixes biological nitrogen
        uptake_p_rate = 0.50  # High root nodulation demand
        uptake_k_rate = 0.30
    elif "sugar" in crop_name:
        uptake_n_rate = 0.55
        uptake_p_rate = 0.45
        uptake_k_rate = 0.50
    elif "chilli" in crop_name or "tomato" in crop_name or "potato" in crop_name or "onion" in crop_name or "veg" in crop_type:
        uptake_n_rate = 0.45
        uptake_p_rate = 0.45
        uptake_k_rate = 0.50
    else:
        uptake_n_rate = 0.40
        uptake_p_rate = 0.35
        uptake_k_rate = 0.40

    # Calculate actual crop absorption from available added nutrients
    absorbed_n_kgha = added_n_kgha * uptake_n_rate
    absorbed_p_kgha = added_p_kgha * uptake_p_rate
    absorbed_k_kgha = added_k_kgha * uptake_k_rate

    # Net retained in root zone soil solution (available to plant)
    net_n_kgha = added_n_kgha - absorbed_n_kgha
    net_p_kgha = added_p_kgha - absorbed_p_kgha
    net_k_kgha = added_k_kgha - absorbed_k_kgha

    # Adjusted soil test levels
    adj_n = round(max(10.0, base_n + net_n_kgha), 1)
    adj_p = round(max(5.0, base_p + net_p_kgha), 1)
    adj_k = round(max(20.0, base_k + net_k_kgha), 1)
    adj_ph = round(max(4.0, min(9.5, base_ph + ph_shift)), 2)

    return {
        "baseline": {
            "nitrogen": base_n,
            "phosphorus": base_p,
            "potassium": base_k,
            "ph_level": base_ph,
            "organic_carbon": soil.organic_carbon,
            "last_tested": soil.last_tested.isoformat() if soil.last_tested else None
        },
        "adjusted": {
            "nitrogen": adj_n,
            "phosphorus": adj_p,
            "potassium": adj_k,
            "ph_level": adj_ph,
        },
        "deltas": {
            "nitrogen": round(adj_n - base_n, 1),
            "phosphorus": round(adj_p - base_p, 1),
            "potassium": round(adj_k - base_k, 1),
            "ph_level": round(adj_ph - base_ph, 2),
        },
        "added_nutrients": {
            "nitrogen": round(added_n_kgha, 1),
            "phosphorus": round(added_p_kgha, 1),
            "potassium": round(added_k_kgha, 1),
        },
        "crop_absorbed": {
            "nitrogen": round(absorbed_n_kgha, 1),
            "phosphorus": round(absorbed_p_kgha, 1),
            "potassium": round(absorbed_k_kgha, 1),
            "crop_name": crop.name if crop else "General Crop",
            "absorption_note": f"{crop.name if crop else 'Crop'} has absorbed ~{round(absorbed_n_kgha, 1)} kg/ha N, ~{round(absorbed_p_kgha, 1)} kg/ha P, ~{round(absorbed_k_kgha, 1)} kg/ha K from applied fertilizers."
        },
        "total_applications": len(applications),
        "nutrient_balance": {
            "nitrogen": "optimal" if 140 <= adj_n <= 280 else ("deficient" if adj_n < 140 else "excessive"),
            "phosphorus": "optimal" if 35 <= adj_p <= 75 else ("deficient" if adj_p < 35 else "excessive"),
            "potassium": "optimal" if 150 <= adj_k <= 300 else ("deficient" if adj_k < 150 else "excessive"),
            "ph": "optimal" if 6.2 <= adj_ph <= 7.8 else ("acidic" if adj_ph < 6.2 else "alkaline")
        },
        "last_applied": sorted_apps[-1].application_date.isoformat() if sorted_apps and sorted_apps[-1].application_date else None
    }


def _generate_fallback_impact(soil: PlotSoilData, area: float, crop: Optional[Crop], applications: list) -> ImpactAnalysis:
    crop_name = crop.name if crop else "General Crop"
    dynamics = compute_live_soil_dynamics(soil, area, crop, applications)
    adj = dynamics["adjusted"]
    balance = dynamics["nutrient_balance"]
    deltas = dynamics["deltas"]

    adjusted_recs = []
    if balance["phosphorus"] == "deficient":
        adjusted_recs.append(FertilizerRec(
            name="SSP (Single Super Phosphate)",
            quantity=f"{round(25 * area)} kg",
            timing="Next 10-15 days",
            application_method="Band placement"
        ))
    if balance["nitrogen"] == "deficient":
        adjusted_recs.append(FertilizerRec(
            name="Urea (Top Dressing)",
            quantity=f"{round(20 * area)} kg",
            timing="Next vegetative irrigation",
            application_method="Broadcasting"
        ))
    if not adjusted_recs:
        adjusted_recs.append(FertilizerRec(
            name="Micronutrient Foliar Spray",
            quantity=f"{round(1.5 * area)} L in water",
            timing="During peak vegetative stage",
            application_method="Foliar spray"
        ))

    overall_status = "Optimal" if all(v == "optimal" for v in balance.values()) else "Needs Adjustment"

    return ImpactAnalysis(
        overall_status=overall_status,
        nutrient_balance=balance,
        estimated_levels={
            "nitrogen": adj["nitrogen"],
            "phosphorus": adj["phosphorus"],
            "potassium": adj["potassium"],
            "ph": adj["ph_level"],
        },
        analysis_summary=(
            f"After {len(applications)} recorded application(s) on {area} acres of {crop_name}, "
            f"effective soil levels are N={adj['nitrogen']} (Δ {deltas['nitrogen']:+0.1f}), "
            f"P={adj['phosphorus']} (Δ {deltas['phosphorus']:+0.1f}), "
            f"K={adj['potassium']} (Δ {deltas['potassium']:+0.1f}) kg/ha. "
            f"{dynamics['crop_absorbed']['absorption_note']}"
        ),
        adjusted_recommendations=adjusted_recs,
        risk_alerts=[
            "Ensure adequate soil moisture before subsequent fertilizer doses to prevent salt injury.",
            "Baseline soil test values remain safely preserved. Follow-up test recommended post-harvest.",
        ],
    )



# ---------------------------------------------------------------------------
# 1. GET /plot-nutrition/active-crops
# ---------------------------------------------------------------------------

@router.get("/active-crops")
async def get_active_crops(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Return all crops with status 'Growing' for the current user."""
    statement = select(Crop).where(Crop.user_id == current_user.id, Crop.status == "Growing")
    result = await session.exec(statement)
    crops = result.all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "area": c.area,
            "season": c.season,
            "variety": c.variety,
            "sowing_date": c.sowing_date.isoformat() if c.sowing_date else None,
            "expected_harvest_date": c.expected_harvest_date.isoformat() if c.expected_harvest_date else None,
            "crop_type": c.crop_type,
            "status": c.status,
        }
        for c in crops
    ]


# ---------------------------------------------------------------------------
# 2. GET /plot-nutrition/plots
# ---------------------------------------------------------------------------

@router.get("/plots", response_model=List[PlotOverview])
async def get_plots(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Return all land records as plots, with optional soil data, live adjusted values, and linked crop info."""
    # Get farmer profile with land records
    stmt = (
        select(FarmerProfile)
        .where(FarmerProfile.user_id == current_user.id)
        .options(selectinload(FarmerProfile.land_records))
    )
    result = await session.exec(stmt)
    profile = result.first()

    if not profile:
        raise HTTPException(status_code=404, detail="Farmer profile not found. Please set up your profile first.")

    plots: List[PlotOverview] = []
    for lr in profile.land_records:
        # Check for existing soil data
        soil_stmt = select(PlotSoilData).where(
            PlotSoilData.land_record_id == lr.id,
            PlotSoilData.user_id == current_user.id,
        )
        soil_result = await session.exec(soil_stmt)
        soil = soil_result.first()

        crop_name = None
        crop_status = None
        crop_id = None
        crop_obj = None
        if soil and soil.crop_id:
            crop_obj = await session.get(Crop, soil.crop_id)
            if crop_obj:
                crop_name = crop_obj.name
                crop_status = crop_obj.status
                crop_id = crop_obj.id

        live_adjusted_data = None
        if soil:
            fert_stmt = select(FertilizerApplication).where(FertilizerApplication.plot_soil_data_id == soil.id)
            fert_res = await session.exec(fert_stmt)
            apps = fert_res.all()
            live_status = compute_live_soil_dynamics(soil, lr.area, crop_obj, apps)
            live_adjusted_data = LiveSoilStatus(**live_status)

        plots.append(PlotOverview(
            land_record_id=lr.id,
            serial_number=lr.serial_number,
            area=lr.area,
            soil_data=PlotSoilDataRead.model_validate(soil) if soil else None,
            crop_name=crop_name,
            crop_status=crop_status,
            crop_id=crop_id,
            live_adjusted=live_adjusted_data,
        ))

    return plots


# ---------------------------------------------------------------------------
# GET /plot-nutrition/plots/{plot_soil_id}/live-status
# ---------------------------------------------------------------------------

@router.get("/plots/{plot_soil_id}/live-status", response_model=LiveSoilStatus)
async def get_plot_live_status(
    plot_soil_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Return real-time dynamic soil status (Baseline vs Live Adjusted with crop absorption)."""
    soil = await session.get(PlotSoilData, plot_soil_id)
    if not soil or soil.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Plot soil data not found")

    lr = await session.get(LandRecord, soil.land_record_id)
    area = lr.area if lr else 1.0

    crop = None
    if soil.crop_id:
        crop = await session.get(Crop, soil.crop_id)

    fert_stmt = select(FertilizerApplication).where(FertilizerApplication.plot_soil_data_id == soil.id)
    fert_res = await session.exec(fert_stmt)
    apps = fert_res.all()

    live_status = compute_live_soil_dynamics(soil, area, crop, apps)
    return LiveSoilStatus(**live_status)



# ---------------------------------------------------------------------------
# 3. POST /plot-nutrition/plots/{land_record_id}/soil
# ---------------------------------------------------------------------------

@router.post("/plots/{land_record_id}/soil", response_model=PlotSoilDataRead)
async def save_soil_data(
    land_record_id: int,
    data: PlotSoilDataCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Save or update soil test data for a specific plot (land record)."""
    # Verify land record belongs to user
    lr = await session.get(LandRecord, land_record_id)
    if not lr:
        raise HTTPException(status_code=404, detail="Land record not found")

    # Check ownership via farmer profile
    profile_stmt = select(FarmerProfile).where(FarmerProfile.user_id == current_user.id)
    profile_result = await session.exec(profile_stmt)
    profile = profile_result.first()
    if not profile or lr.farmer_profile_id != profile.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if soil data already exists for this land record
    existing_stmt = select(PlotSoilData).where(
        PlotSoilData.land_record_id == land_record_id,
        PlotSoilData.user_id == current_user.id,
    )
    existing_result = await session.exec(existing_stmt)
    existing = existing_result.first()

    if existing:
        # Update
        existing.nitrogen = data.nitrogen
        existing.phosphorus = data.phosphorus
        existing.potassium = data.potassium
        existing.ph_level = data.ph_level
        existing.organic_carbon = data.organic_carbon
        existing.notes = data.notes
        existing.last_tested = datetime.utcnow()
        existing.updated_at = datetime.utcnow()
        session.add(existing)
        await session.commit()
        await session.refresh(existing)
        return existing
    else:
        # Create new
        soil = PlotSoilData(
            land_record_id=land_record_id,
            user_id=current_user.id,
            nitrogen=data.nitrogen,
            phosphorus=data.phosphorus,
            potassium=data.potassium,
            ph_level=data.ph_level,
            organic_carbon=data.organic_carbon,
            notes=data.notes,
            last_tested=datetime.utcnow(),
        )
        session.add(soil)
        await session.commit()
        await session.refresh(soil)
        return soil


# ---------------------------------------------------------------------------
# 4. PUT /plot-nutrition/plots/{plot_soil_id}/link-crop
# ---------------------------------------------------------------------------

@router.put("/plots/{plot_soil_id}/link-crop", response_model=PlotSoilDataRead)
async def link_crop_to_plot(
    plot_soil_id: int,
    req: LinkCropRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Link an actively growing crop to a plot."""
    soil = await session.get(PlotSoilData, plot_soil_id)
    if not soil or soil.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Plot soil data not found")

    # Verify crop belongs to user and is growing
    crop = await session.get(Crop, req.crop_id)
    if not crop or crop.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Crop not found")

    soil.crop_id = req.crop_id
    soil.updated_at = datetime.utcnow()
    session.add(soil)
    await session.commit()
    await session.refresh(soil)
    return soil


# ---------------------------------------------------------------------------
# 5. POST /plot-nutrition/plots/{plot_soil_id}/recommend
# ---------------------------------------------------------------------------

RECOMMEND_PROMPT = """You are an expert Agronomist and Soil Scientist.
The farmer has the following plot and soil data:
- Plot Area: {area} acres
- Nitrogen (N): {n} kg/ha
- Phosphorus (P): {p} kg/ha
- Potassium (K): {k} kg/ha
- pH Level: {ph}
- Crop Growing: {crop_name} ({crop_type})
- Variety: {variety}
- Season: {season}
- Growth Stage: Sown on {sowing_date}
- Plot Area: {area} acres

Analyze the soil health for this specific plot and provide precise fertilizer recommendations.
Consider Indian agricultural context and fertilizers (e.g., Urea, DAP, MOP, SSP).
The recommendations should be specific to the plot area of {area} acres.

Respond strictly in JSON format:
{{
    "status": "Good / Needs Improvement / Poor",
    "soil_health_summary": "A brief 2-3 sentence analysis.",
    "recommendations": [
        {{
            "name": "Fertilizer Name",
            "quantity": "Amount for this plot area",
            "timing": "When to apply",
            "application_method": "How to apply"
        }}
    ],
    "additional_tips": ["Tip 1", "Tip 2"]
}}
"""


@router.post("/plots/{plot_soil_id}/recommend", response_model=NutritionRecommendation)
async def get_plot_recommendation(
    plot_soil_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Get AI fertilizer recommendations for a specific plot."""
    soil = await session.get(PlotSoilData, plot_soil_id)
    if not soil or soil.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Plot soil data not found")

    # Get land record for area
    lr = await session.get(LandRecord, soil.land_record_id)
    area = lr.area if lr else 1.0

    # Get crop info
    crop_name = "Not specified"
    crop_type = "General"
    variety = "Not specified"
    season = "Not specified"
    sowing_date = "Not specified"

    if soil.crop_id:
        crop = await session.get(Crop, soil.crop_id)
        if crop:
            crop_name = crop.name
            crop_type = crop.crop_type
            variety = crop.variety or "Not specified"
            season = crop.season or "Not specified"
            sowing_date = crop.sowing_date.strftime("%Y-%m-%d") if crop.sowing_date else "Not specified"

    prompt = RECOMMEND_PROMPT.format(
        area=area,
        n=soil.nitrogen,
        p=soil.phosphorus,
        k=soil.potassium,
        ph=soil.ph_level,
        crop_name=crop_name,
        crop_type=crop_type,
        variety=variety,
        season=season,
        sowing_date=sowing_date,
    )

    try:
        result = await _call_groq(prompt)
        if result and "recommendations" in result and "soil_health_summary" in result:
            return NutritionRecommendation(**result)
    except Exception as e:
        print(f"[PlotNutrition] AI recommendation error: {e}")

    # Seamless fallback to dynamic agronomic rule engine
    return _generate_fallback_recommendation(soil, area, crop_name)



# ---------------------------------------------------------------------------
# 6. POST /plot-nutrition/plots/{plot_soil_id}/apply-fertilizer
# ---------------------------------------------------------------------------

@router.post("/plots/{plot_soil_id}/apply-fertilizer", response_model=FertilizerApplicationRead)
async def apply_fertilizer(
    plot_soil_id: int,
    data: FertilizerApplicationCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Log a fertilizer application event for a plot."""
    soil = await session.get(PlotSoilData, plot_soil_id)
    if not soil or soil.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Plot soil data not found")

    app_data = data.model_dump() if hasattr(data, "model_dump") else data.dict()

    # Strip timezone if present
    if "application_date" in app_data and app_data["application_date"]:
        if hasattr(app_data["application_date"], "tzinfo") and app_data["application_date"].tzinfo:
            app_data["application_date"] = app_data["application_date"].replace(tzinfo=None)

    application = FertilizerApplication(
        **app_data,
        plot_soil_data_id=plot_soil_id,
        user_id=current_user.id,
        crop_id=soil.crop_id,
    )
    session.add(application)
    await session.commit()
    await session.refresh(application)
    return application


# ---------------------------------------------------------------------------
# GET /plot-nutrition/plots/{plot_soil_id}/fertilizer-history
# ---------------------------------------------------------------------------

@router.get("/plots/{plot_soil_id}/fertilizer-history", response_model=List[FertilizerApplicationRead])
async def get_fertilizer_history(
    plot_soil_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Get all fertilizer applications for a plot."""
    soil = await session.get(PlotSoilData, plot_soil_id)
    if not soil or soil.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Plot soil data not found")

    stmt = (
        select(FertilizerApplication)
        .where(FertilizerApplication.plot_soil_data_id == plot_soil_id)
        .order_by(FertilizerApplication.application_date.desc())
    )
    result = await session.exec(stmt)
    return result.all()


# ---------------------------------------------------------------------------
# 7. POST /plot-nutrition/plots/{plot_soil_id}/analyze-impact
# ---------------------------------------------------------------------------

IMPACT_PROMPT = """You are an expert Agronomist and Soil Scientist.
A farmer has a plot with the following details:

**Plot Info:**
- Area: {area} acres
- Crop: {crop_name} ({crop_type}), Variety: {variety}
- Season: {season}
- Sown: {sowing_date}

**Original Soil Test (before any fertilizer):**
- Nitrogen (N): {n} kg/ha
- Phosphorus (P): {p} kg/ha
- Potassium (K): {k} kg/ha
- pH Level: {ph}

**Fertilizers Applied So Far:**
{fertilizer_log}

Based on the original soil parameters AND all the fertilizers applied:
1. Estimate the current nutrient levels in the soil
2. Determine if each nutrient is deficient, optimal, or excessive for {crop_name}
3. Provide adjusted recommendations for what still needs to be applied
4. Flag any risks (over-fertilization, nutrient lockout, pH imbalance)

Respond strictly in JSON:
{{
    "overall_status": "Optimal / Needs Adjustment / At Risk",
    "nutrient_balance": {{
        "nitrogen": "deficient / optimal / excessive",
        "phosphorus": "deficient / optimal / excessive",
        "potassium": "deficient / optimal / excessive",
        "ph": "acidic / optimal / alkaline"
    }},
    "estimated_levels": {{
        "nitrogen": 160,
        "phosphorus": 55,
        "potassium": 180,
        "ph": 6.8
    }},
    "analysis_summary": "2-3 sentence overall analysis of current nutrition state.",
    "adjusted_recommendations": [
        {{
            "name": "Fertilizer Name",
            "quantity": "Amount needed",
            "timing": "When to apply",
            "application_method": "How to apply"
        }}
    ],
    "risk_alerts": ["Alert 1", "Alert 2"]
}}
"""


@router.post("/plots/{plot_soil_id}/analyze-impact", response_model=ImpactAnalysis)
async def analyze_fertilizer_impact(
    plot_soil_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Analyze the impact of all fertilizer applications on crop nutrition."""
    soil = await session.get(PlotSoilData, plot_soil_id)
    if not soil or soil.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Plot soil data not found")

    # Get land record
    lr = await session.get(LandRecord, soil.land_record_id)
    area = lr.area if lr else 1.0

    # Get crop info
    crop_name = "Not specified"
    crop_type = "General"
    variety = "Not specified"
    season = "Not specified"
    sowing_date = "Not specified"
    if soil.crop_id:
        crop = await session.get(Crop, soil.crop_id)
        if crop:
            crop_name = crop.name
            crop_type = crop.crop_type
            variety = crop.variety or "Not specified"
            season = crop.season or "Not specified"
            sowing_date = crop.sowing_date.strftime("%Y-%m-%d") if crop.sowing_date else "Not specified"

    # Get fertilizer history
    stmt = (
        select(FertilizerApplication)
        .where(FertilizerApplication.plot_soil_data_id == plot_soil_id)
        .order_by(FertilizerApplication.application_date.asc())
    )
    result = await session.exec(stmt)
    applications = result.all()

    if not applications:
        raise HTTPException(status_code=400, detail="No fertilizer applications found. Apply fertilizer first to analyze impact.")

    # Build fertilizer log string
    fert_lines = []
    for i, app in enumerate(applications, 1):
        date_str = app.application_date.strftime("%Y-%m-%d") if app.application_date else "Unknown"
        method = app.application_method or "Not specified"
        fert_lines.append(f"{i}. {app.fertilizer_name}: {app.quantity} {app.unit} on {date_str} via {method}")
    fertilizer_log = "\n".join(fert_lines)

    prompt = IMPACT_PROMPT.format(
        area=area,
        crop_name=crop_name,
        crop_type=crop_type,
        variety=variety,
        season=season,
        sowing_date=sowing_date,
        n=soil.nitrogen,
        p=soil.phosphorus,
        k=soil.potassium,
        ph=soil.ph_level,
        fertilizer_log=fertilizer_log,
    )

    try:
        result_data = await _call_groq(prompt)
        if result_data and "nutrient_balance" in result_data and "estimated_levels" in result_data:
            return ImpactAnalysis(**result_data)
    except Exception as e:
        logger.warning(f"Groq impact analysis failed, falling back to local heuristic: {e}")
    # Fallback calculated impact analysis
    return _generate_fallback_impact(soil, area, crop, applications)




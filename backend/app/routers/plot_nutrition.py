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

class PlotOverview(BaseModel):
    """Aggregated view of a land record + optional soil data + optional crop."""
    land_record_id: int
    serial_number: str
    area: float
    soil_data: Optional[PlotSoilDataRead] = None
    crop_name: Optional[str] = None
    crop_status: Optional[str] = None
    crop_id: Optional[int] = None


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


def _generate_fallback_impact(soil: PlotSoilData, area: float, crop_name: str, applications: list) -> ImpactAnalysis:
    n_added = sum(a.quantity * 0.46 for a in applications if "urea" in a.fertilizer_name.lower() or "dap" in a.fertilizer_name.lower())
    p_added = sum(a.quantity * 0.46 for a in applications if "dap" in a.fertilizer_name.lower() or "ssp" in a.fertilizer_name.lower() or "npk" in a.fertilizer_name.lower())
    k_added = sum(a.quantity * 0.60 for a in applications if "mop" in a.fertilizer_name.lower() or "potash" in a.fertilizer_name.lower())

    area_factor = max(area, 0.5)
    est_n = round(soil.nitrogen + (n_added / area_factor) * 0.7, 1)
    est_p = round(soil.phosphorus + (p_added / area_factor) * 0.5, 1)
    est_k = round(soil.potassium + (k_added / area_factor) * 0.6, 1)

    balance = {
        "nitrogen": "optimal" if est_n >= 140 else "deficient",
        "phosphorus": "optimal" if est_p >= 40 else "deficient",
        "potassium": "optimal" if est_k >= 150 else "deficient",
        "ph": "optimal" if 6.2 <= soil.ph_level <= 7.8 else ("acidic" if soil.ph_level < 6.2 else "alkaline"),
    }

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
            "nitrogen": est_n,
            "phosphorus": est_p,
            "potassium": est_k,
            "ph": soil.ph_level,
        },
        analysis_summary=f"After {len(applications)} recorded application(s) on {area} acres of {crop_name}, estimated soil NPK levels have shifted to N={est_n}, P={est_p}, K={est_k} kg/ha. Soil pH remains at {soil.ph_level}.",
        adjusted_recommendations=adjusted_recs,
        risk_alerts=[
            "Ensure adequate soil moisture before subsequent fertilizer doses to prevent salt injury.",
            "Schedule follow-up soil test after crop season for precise nutrient depletion assessment.",
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
    """Return all land records as plots, with optional soil data and linked crop info."""
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
        if soil and soil.crop_id:
            crop = await session.get(Crop, soil.crop_id)
            if crop:
                crop_name = crop.name
                crop_status = crop.status
                crop_id = crop.id

        plots.append(PlotOverview(
            land_record_id=lr.id,
            serial_number=lr.serial_number,
            area=lr.area,
            soil_data=PlotSoilDataRead.model_validate(soil) if soil else None,
            crop_name=crop_name,
            crop_status=crop_status,
            crop_id=crop_id,
        ))

    return plots


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
        print(f"[PlotNutrition] Impact analysis AI error: {e}")

    # Fallback calculated impact analysis
    return _generate_fallback_impact(soil, area, crop_name, applications)


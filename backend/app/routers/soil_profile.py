from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Optional
from datetime import date, datetime

from ..database import get_session
from ..deps import get_current_user
from ..models.user import User
from ..models.farmer import FarmerProfile, LandRecord
from ..models.soil_profile import (
    SoilProfile, SoilProfileCreate, SoilProfileRead, SoilProfileUpdate, SoilHealthSummary
)

router = APIRouter(prefix="/soil-profile", tags=["soil-profile"])

def _compute_profile_read(sp: SoilProfile) -> SoilProfileRead:
    # pH status
    if sp.ph_level < 6.0:
        ph_st = "acidic"
    elif sp.ph_level > 7.5:
        ph_st = "alkaline"
    else:
        ph_st = "neutral"

    # Macro status
    n_st = "low" if sp.nitrogen_kg_ha < 280 else ("high" if sp.nitrogen_kg_ha > 560 else "medium")
    p_st = "low" if sp.phosphorus_kg_ha < 10 else ("high" if sp.phosphorus_kg_ha > 25 else "medium")
    k_st = "low" if sp.potassium_kg_ha < 110 else ("high" if sp.potassium_kg_ha > 280 else "medium")

    # Health score
    score = 40
    if 6.0 <= sp.ph_level <= 7.5:
        score += 15
    elif 5.5 <= sp.ph_level <= 8.0:
        score += 8

    if sp.organic_carbon_percent >= 0.75:
        score += 15
    elif sp.organic_carbon_percent >= 0.5:
        score += 10
    else:
        score += 4

    if n_st == "medium":
        score += 10
    elif n_st == "high":
        score += 8
    else:
        score += 4

    if p_st == "medium":
        score += 10
    elif p_st == "high":
        score += 8
    else:
        score += 4

    if k_st == "medium":
        score += 10
    elif k_st == "high":
        score += 8
    else:
        score += 4

    score = min(100, max(10, score))

    if score >= 75:
        h_st = "optimal"
    elif score >= 50:
        h_st = "moderate"
    else:
        h_st = "needs_attention"

    days_since_test = (date.today() - sp.test_date).days
    is_overdue = days_since_test > 730

    data = sp.dict()
    data.update({
        "health_score": score,
        "health_status": h_st,
        "ph_status": ph_st,
        "nitrogen_status": n_st,
        "phosphorus_status": p_st,
        "potassium_status": k_st,
        "is_test_overdue": is_overdue,
    })
    return SoilProfileRead(**data)

@router.get("/", response_model=List[SoilProfileRead])
async def get_soil_profiles(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    stmt = select(SoilProfile).where(SoilProfile.farmer_id == current_user.id).order_by(SoilProfile.test_date.desc())
    res = await session.exec(stmt)
    profiles = res.all()
    return [_compute_profile_read(p) for p in profiles]

@router.get("/summary", response_model=SoilHealthSummary)
async def get_soil_health_summary(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    stmt = select(SoilProfile).where(SoilProfile.farmer_id == current_user.id)
    res = await session.exec(stmt)
    profiles = res.all()

    if not profiles:
        return SoilHealthSummary(
            total_profiles=0,
            dominant_soil_type="Clay Loam",
            avg_health_score=0,
            overall_fertility="No Tests Recorded",
            avg_ph=7.0,
            avg_organic_carbon=0.0,
            avg_n=0.0,
            avg_p=0.0,
            avg_k=0.0,
            overdue_tests_count=0,
            key_recommendation="Collect soil samples from your active plots and register a Soil Health Card (SHC) test to optimize fertilizer spend."
        )

    reads = [_compute_profile_read(p) for p in profiles]
    total = len(reads)
    avg_score = int(sum(r.health_score for r in reads) / total)
    avg_ph = round(sum(r.ph_level for r in reads) / total, 2)
    avg_oc = round(sum(r.organic_carbon_percent for r in reads) / total, 2)
    avg_n = round(sum(r.nitrogen_kg_ha for r in reads) / total, 1)
    avg_p = round(sum(r.phosphorus_kg_ha for r in reads) / total, 1)
    avg_k = round(sum(r.potassium_kg_ha for r in reads) / total, 1)
    overdue_count = sum(1 for r in reads if r.is_test_overdue)

    # Dominant type
    type_counts: dict = {}
    for p in profiles:
        type_counts[p.soil_type] = type_counts.get(p.soil_type, 0) + 1
    dominant_type = max(type_counts, key=type_counts.get).replace("_", " ").title()

    if avg_score >= 75:
        overall_fertility = "Optimal & Fertile"
        key_rec = "Soil health is well balanced. Maintain organic carbon levels by incorporating crop residues and compost."
    elif avg_score >= 50:
        overall_fertility = "Moderately Fertile"
        if avg_n < 280:
            key_rec = "Nitrogen level is sub-optimal. Apply split doses of Urea or Neem-coated urea and green manure crops (Dhaincha)."
        elif avg_p < 15:
            key_rec = "Phosphorus availability is low. Apply DAP or Single Super Phosphate (SSP) at basal sowing stage."
        elif avg_ph < 6.0:
            key_rec = "Soil is acidic. Apply agricultural lime (200-400 kg/ha) to restore ideal pH balance."
        else:
            key_rec = "Incorporate Farm Yard Manure (FYM) to boost microbial activity and organic carbon."
    else:
        overall_fertility = "Deficient / Needs Attention"
        key_rec = "Multiple nutrient deficiencies detected. Follow a targeted Soil Health Card reclamation protocol before next sowing."

    return SoilHealthSummary(
        total_profiles=total,
        dominant_soil_type=dominant_type,
        avg_health_score=avg_score,
        overall_fertility=overall_fertility,
        avg_ph=avg_ph,
        avg_organic_carbon=avg_oc,
        avg_n=avg_n,
        avg_p=avg_p,
        avg_k=avg_k,
        overdue_tests_count=overdue_count,
        key_recommendation=key_rec
    )

@router.get("/{profile_id}", response_model=SoilProfileRead)
async def get_soil_profile(
    profile_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    profile = await session.get(SoilProfile, profile_id)
    if not profile or profile.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Soil profile record not found")
    return _compute_profile_read(profile)

@router.post("/", response_model=SoilProfileRead, status_code=status.HTTP_201_CREATED)
async def create_soil_profile(
    data: SoilProfileCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    profile = SoilProfile(
        **data.dict(),
        farmer_id=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    session.add(profile)
    await session.commit()
    await session.refresh(profile)
    return _compute_profile_read(profile)

@router.put("/{profile_id}", response_model=SoilProfileRead)
async def update_soil_profile(
    profile_id: int,
    data: SoilProfileUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    profile = await session.get(SoilProfile, profile_id)
    if not profile or profile.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Soil profile record not found")

    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    profile.updated_at = datetime.utcnow()
    session.add(profile)
    await session.commit()
    await session.refresh(profile)
    return _compute_profile_read(profile)

@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_soil_profile(
    profile_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    profile = await session.get(SoilProfile, profile_id)
    if not profile or profile.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Soil profile record not found")

    await session.delete(profile)
    await session.commit()
    return None

@router.post("/seed-defaults", response_model=List[SoilProfileRead])
async def seed_default_soil_profiles(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """Auto-seeds benchmark soil profile if farmer has none."""
    stmt = select(SoilProfile).where(SoilProfile.farmer_id == current_user.id)
    existing = (await session.exec(stmt)).all()
    if existing:
        return [_compute_profile_read(p) for p in existing]

    # Create a realistic initial benchmark Soil Health Card
    sample = SoilProfile(
        farmer_id=current_user.id,
        plot_label="Plot 1 (Main Farmland)",
        soil_type="clay_loam",
        shc_number="SHC-2026-IND-8821",
        testing_lab="Krishi Vigyan Kendra (KVK) Central Lab",
        test_date=date.today(),
        ph_level=6.9,
        organic_carbon_percent=0.62,
        ec_ds_m=0.38,
        nitrogen_kg_ha=265.0,
        phosphorus_kg_ha=18.4,
        potassium_kg_ha=245.0,
        sulphur_ppm=14.2,
        zinc_ppm=0.82,
        iron_ppm=5.6,
        boron_ppm=0.58,
        notes="Soil sampled before sowing. Texture is well drained clay loam with good potassium reserve."
    )
    session.add(sample)
    await session.commit()
    await session.refresh(sample)
    return [_compute_profile_read(sample)]

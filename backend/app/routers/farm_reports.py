"""
Farm Reports Router
===================
Endpoints for generating and downloading official PDF farm reports:
- PDF Download for bank loans, KCC, and subsidies
- Report metadata preview
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from datetime import datetime

from ..database import get_session
from ..deps import get_current_user
from ..models.user import User
from ..models.farmer import FarmerProfile
from ..models.crop import Crop, CropExpense
from ..models.credit_loan import CreditLoan
from ..services.report_service import generate_farmer_report_pdf

router = APIRouter(prefix="/farm-reports", tags=["farm-reports"])

@router.get("/download")
async def download_farm_report_pdf(
    season: Optional[str] = Query(None, description="Optional season filter e.g. Kharif, Rabi, or All"),
    year: Optional[int] = Query(None, description="Optional year filter"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Generate and download the official PDF farm report."""
    # 1. Fetch farmer profile
    profile_stmt = select(FarmerProfile).where(FarmerProfile.user_id == current_user.id)
    profile_res = await session.execute(profile_stmt)
    profile = profile_res.scalars().first()

    farmer_name = current_user.full_name or "Farmer"
    farmer_id = profile.farmer_id if profile else f"FARMER-{current_user.id}"
    phone = profile.phone_number or current_user.phone_number or ""
    village = profile.village or ""
    district = profile.district or ""
    state = profile.state or ""
    total_land = profile.total_area if profile else 0.0

    # 2. Fetch crops
    crop_stmt = select(Crop).where(Crop.user_id == current_user.id)
    if season and season.lower() != "all":
        crop_stmt = crop_stmt.where(Crop.season == season)
    crop_res = await session.execute(crop_stmt)
    crops_raw = crop_res.scalars().all()

    crops_data = []
    for c in crops_raw:
        if year and c.sowing_date and c.sowing_date.year != year:
            continue
        profit = c.net_profit if c.net_profit is not None else ((c.total_revenue or 0.0) - (c.total_cost or 0.0))
        crops_data.append({
            "name": c.name,
            "variety": c.variety,
            "season": c.season,
            "area": c.area or 0.0,
            "sowing_date": c.sowing_date.strftime("%Y-%m-%d") if c.sowing_date else "",
            "actual_yield": c.actual_yield or 0.0,
            "total_cost": c.total_cost or 0.0,
            "total_revenue": c.total_revenue or 0.0,
            "net_profit": profit,
        })

    # 3. Fetch loans
    loan_stmt = select(CreditLoan).where(CreditLoan.farmer_id == current_user.id)
    loan_res = await session.execute(loan_stmt)
    loans_raw = loan_res.scalars().all()

    loans_data = []
    for l in loans_raw:
        remaining = max(0.0, float(l.principal_amount) - float(l.amount_paid))
        loans_data.append({
            "lender_name": l.lender_name,
            "source_type": l.source_type,
            "purpose": l.purpose,
            "principal_amount": l.principal_amount,
            "amount_paid": l.amount_paid,
            "remaining_balance": remaining,
            "status": l.status,
        })

    # 4. Generate PDF
    pdf_bytes = generate_farmer_report_pdf(
        farmer_name=farmer_name,
        farmer_id=farmer_id,
        phone=phone,
        village=village,
        district=district,
        state=state,
        total_land_area=total_land,
        crops=crops_data,
        expenses=[],
        loans=loans_data,
        season_filter=season
    )

    clean_season = (season or "All_Seasons").replace(" ", "_")
    filename = f"Farm_Report_{farmer_id}_{clean_season}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition",
        }
    )

@router.get("/preview-meta")
async def get_farm_report_preview_meta(
    season: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Retrieve fast summary metadata before PDF generation."""
    crop_stmt = select(Crop).where(Crop.user_id == current_user.id)
    if season and season.lower() != "all":
        crop_stmt = crop_stmt.where(Crop.season == season)
    crop_res = await session.execute(crop_stmt)
    crops_raw = crop_res.scalars().all()

    total_cost = sum(c.total_cost or 0.0 for c in crops_raw)
    total_rev = sum(c.total_revenue or 0.0 for c in crops_raw)
    total_yield = sum(c.actual_yield or 0.0 for c in crops_raw)
    total_profit = sum(c.net_profit if c.net_profit is not None else ((c.total_revenue or 0.0) - (c.total_cost or 0.0)) for c in crops_raw)

    return {
        "crops_count": len(crops_raw),
        "total_area_acres": round(sum(c.area or 0.0 for c in crops_raw), 2),
        "total_yield_quintals": round(total_yield, 2),
        "total_cost": round(total_cost, 2),
        "total_revenue": round(total_rev, 2),
        "net_profit": round(total_profit, 2),
        "eligible_uses": [
            "Kisan Credit Card (KCC) Loan Processing",
            "Government Input & Fertilizer Subsidy Claims",
            "PM-Fasal Bima Yojana (Crop Insurance)",
            "Income Certification for Gram Panchayat & Mandi"
        ]
    }

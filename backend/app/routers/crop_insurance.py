"""
Crop Insurance Router
=====================
CRUD endpoints for tracking PM-Fasal Bima Yojana (PMFBY) and other agricultural policies:
- Policy management (Sum insured, premium, crop, company)
- Claim filing lifecycle (Submission -> Survey -> Approval -> Direct Bank Settlement)
- Portfolio insurance metrics
- Step-by-step PMFBY disaster claim filing guidance
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from datetime import datetime, date

from ..database import get_session
from ..deps import get_current_user
from ..models.user import User
from ..models.crop_insurance import (
    CropInsurance,
    CropInsuranceCreate,
    CropInsuranceRead,
    CropInsuranceUpdate,
    CropInsuranceClaimRequest,
    CropInsuranceSummary,
)

router = APIRouter(prefix="/crop-insurance", tags=["crop-insurance"])

@router.get("/", response_model=List[CropInsuranceRead])
async def list_insurance_policies(
    policy_status: Optional[str] = Query(None, description="active, expired, claim_filed"),
    claim_status: Optional[str] = Query(None, description="none, submitted, under_survey, approved, settled, rejected"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """List all crop insurance policies for the logged-in farmer."""
    stmt = select(CropInsurance).where(CropInsurance.farmer_id == current_user.id)
    if policy_status:
        stmt = stmt.where(CropInsurance.policy_status == policy_status)
    if claim_status:
        stmt = stmt.where(CropInsurance.claim_status == claim_status)
    stmt = stmt.order_by(CropInsurance.application_date.desc(), CropInsurance.created_at.desc())

    result = await session.execute(stmt)
    return result.scalars().all()

@router.get("/summary", response_model=CropInsuranceSummary)
async def get_insurance_summary(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Aggregated portfolio summary of crop insurance coverage and claims."""
    stmt = select(CropInsurance).where(CropInsurance.farmer_id == current_user.id)
    result = await session.execute(stmt)
    policies = result.scalars().all()

    total_sum_insured = 0.0
    total_premium = 0.0
    active_count = 0
    pending_claims = 0
    settled_claims = 0
    total_claims_received = 0.0

    for p in policies:
        total_sum_insured += float(p.sum_insured)
        total_premium += float(p.farmer_premium_paid)
        if p.policy_status == "active" or p.policy_status == "claim_filed":
            active_count += 1
        
        if p.claim_status in ["submitted", "under_survey", "approved"]:
            pending_claims += 1
        elif p.claim_status == "settled":
            settled_claims += 1
            total_claims_received += float(p.claim_amount_approved or p.claim_amount_requested or 0.0)

    return CropInsuranceSummary(
        total_policies_count=len(policies),
        active_policies_count=active_count,
        total_sum_insured=round(total_sum_insured, 2),
        total_premium_paid=round(total_premium, 2),
        claims_pending_count=pending_claims,
        claims_settled_count=settled_claims,
        total_claims_received=round(total_claims_received, 2),
    )

@router.post("/", response_model=CropInsuranceRead, status_code=status.HTTP_201_CREATED)
async def create_insurance_policy(
    payload: CropInsuranceCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Add a new crop insurance policy."""
    policy = CropInsurance(
        farmer_id=current_user.id,
        scheme_name=payload.scheme_name,
        policy_number=payload.policy_number,
        insured_crop_name=payload.insured_crop_name,
        crop_id=payload.crop_id,
        season=payload.season,
        area_insured_acres=payload.area_insured_acres,
        sum_insured=payload.sum_insured,
        farmer_premium_paid=payload.farmer_premium_paid,
        gov_subsidy_amount=payload.gov_subsidy_amount,
        insurance_company=payload.insurance_company,
        application_date=payload.application_date,
        policy_status=payload.policy_status,
        claim_status=payload.claim_status,
        notes=payload.notes,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(policy)
    await session.commit()
    await session.refresh(policy)
    return policy

@router.get("/guidance/pmfby")
async def get_pmfby_claim_guidance():
    """Step-by-step institutional guidance for PMFBY disaster claims."""
    return {
        "scheme": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "helpline": {
            "toll_free": "14447",
            "kisan_call_center": "1800-180-1551",
            "official_portal": "https://pmfby.gov.in",
            "app_name": "Crop Insurance App (Kisan Suvidha)"
        },
        "critical_rule": "Loss must be reported within 72 hours of damage occurring for localized calamity / post-harvest loss.",
        "steps": [
            {
                "step": 1,
                "title": "72-Hour Loss Intimation",
                "description": "Report localized calamity (hailstorm, cloudburst, landslide, flood, or post-harvest cyclone damage) within 72 hours directly on PMFBY Portal, Kisan Suvidha App, or via Toll-free 14447."
            },
            {
                "step": 2,
                "title": "Loss Survey & Verification",
                "description": "An appointed joint committee (insurance company surveyor + state agriculture officer) will conduct a field survey within 10 days to assess percentage loss."
            },
            {
                "step": 3,
                "title": "Direct Benefit Transfer (DBT)",
                "description": "Approved claim compensation is credited directly into your Aadhaar-linked bank account within 30 days of survey completion."
            }
        ],
        "required_documents": [
            "Aadhaar Card",
            "Land Possession / RoR / Khasra Record",
            "Bank Account Passbook (IFSC & Account No.)",
            "Sowing Certificate from Village Agriculture Officer / Patwari",
            "Geo-tagged photos of crop field damage"
        ]
    }

@router.get("/{policy_id}", response_model=CropInsuranceRead)
async def get_insurance_policy(
    policy_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Retrieve details of a single insurance policy."""
    policy = await session.get(CropInsurance, policy_id)
    if not policy or policy.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Insurance policy not found")
    return policy

@router.put("/{policy_id}", response_model=CropInsuranceRead)
async def update_insurance_policy(
    policy_id: int,
    payload: CropInsuranceUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Update details of an existing policy."""
    policy = await session.get(CropInsurance, policy_id)
    if not policy or policy.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Insurance policy not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, val in update_data.items():
        setattr(policy, key, val)

    policy.updated_at = datetime.utcnow()
    session.add(policy)
    await session.commit()
    await session.refresh(policy)
    return policy

@router.post("/{policy_id}/file-claim", response_model=CropInsuranceRead)
async def file_insurance_claim(
    policy_id: int,
    payload: CropInsuranceClaimRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Submit a crop damage claim against an active policy."""
    policy = await session.get(CropInsurance, policy_id)
    if not policy or policy.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Insurance policy not found")

    policy.claim_status = "submitted"
    policy.policy_status = "claim_filed"
    policy.claim_amount_requested = payload.claim_amount_requested
    policy.claim_loss_reason = payload.claim_loss_reason
    policy.claim_filed_date = payload.claim_filed_date
    if payload.notes:
        policy.notes = f"{policy.notes or ''}\nClaim Note: {payload.notes}".strip()

    policy.updated_at = datetime.utcnow()
    session.add(policy)
    await session.commit()
    await session.refresh(policy)
    return policy

@router.patch("/{policy_id}/claim-status", response_model=CropInsuranceRead)
async def update_claim_status(
    policy_id: int,
    claim_status: str = Query(..., description="submitted, under_survey, approved, settled, rejected"),
    claim_amount_approved: Optional[float] = Query(None),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Update the status of a claim (e.g. Under Survey, Approved, Settled)."""
    policy = await session.get(CropInsurance, policy_id)
    if not policy or policy.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Insurance policy not found")

    policy.claim_status = claim_status
    if claim_amount_approved is not None:
        policy.claim_amount_approved = claim_amount_approved
    if claim_status == "settled":
        policy.policy_status = "expired"

    policy.updated_at = datetime.utcnow()
    session.add(policy)
    await session.commit()
    await session.refresh(policy)
    return policy

@router.delete("/{policy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_insurance_policy(
    policy_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Delete an insurance policy record."""
    policy = await session.get(CropInsurance, policy_id)
    if not policy or policy.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Insurance policy not found")

    await session.delete(policy)
    await session.commit()
    return None

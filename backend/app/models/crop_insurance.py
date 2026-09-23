"""
Crop Insurance Model
====================
SQLModel definitions for tracking farmer crop insurance policies and claims.
Focuses on:
- Pradhan Mantri Fasal Bima Yojana (PMFBY)
- Weather Based Crop Insurance Scheme (WBCIS)
- Commercial/Private Agricultural Insurance
- 72-hour loss notification and claim lifecycle tracking (Submitted -> Under Survey -> Approved -> Settled / Rejected)
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date

class CropInsuranceBase(SQLModel):
    scheme_name: str = Field(default="PM-Fasal Bima Yojana (PMFBY)", max_length=150)
    policy_number: str = Field(index=True, max_length=100)
    insured_crop_name: str = Field(index=True, max_length=100)
    crop_id: Optional[int] = Field(default=None, foreign_key="crop.id")
    season: str = Field(default="Kharif 2026", max_length=50) # e.g. Kharif 2026, Rabi 2026-27
    area_insured_acres: float = Field(gt=0)
    sum_insured: float = Field(gt=0, description="Total maximum insurance coverage in ₹")
    farmer_premium_paid: float = Field(default=0.0, ge=0, description="Farmer premium share (1.5% - 2%) in ₹")
    gov_subsidy_amount: Optional[float] = Field(default=0.0, ge=0, description="Central & State subsidy share in ₹")
    insurance_company: str = Field(default="Agriculture Insurance Company of India (AIC)", max_length=150)
    application_date: date = Field(default_factory=date.today)
    policy_status: str = Field(default="active", description="active, expired, claim_filed")
    
    # Claim tracking
    claim_status: str = Field(default="none", description="none, submitted, under_survey, approved, settled, rejected")
    claim_amount_requested: Optional[float] = Field(default=None, ge=0)
    claim_amount_approved: Optional[float] = Field(default=None, ge=0)
    claim_loss_reason: Optional[str] = Field(default=None, description="drought, excess_rainfall_flood, pest_attack, hailstorm, unseasonal_rains, post_harvest_loss, other")
    claim_filed_date: Optional[date] = Field(default=None)
    notes: Optional[str] = Field(default=None)

class CropInsurance(CropInsuranceBase, table=True):
    __tablename__ = "crop_insurances"

    id: Optional[int] = Field(default=None, primary_key=True)
    farmer_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CropInsuranceCreate(CropInsuranceBase):
    pass

class CropInsuranceRead(CropInsuranceBase):
    id: int
    farmer_id: int
    created_at: datetime
    updated_at: datetime

class CropInsuranceUpdate(SQLModel):
    scheme_name: Optional[str] = None
    policy_number: Optional[str] = None
    insured_crop_name: Optional[str] = None
    crop_id: Optional[int] = None
    season: Optional[str] = None
    area_insured_acres: Optional[float] = None
    sum_insured: Optional[float] = None
    farmer_premium_paid: Optional[float] = None
    gov_subsidy_amount: Optional[float] = None
    insurance_company: Optional[str] = None
    application_date: Optional[date] = None
    policy_status: Optional[str] = None
    claim_status: Optional[str] = None
    claim_amount_requested: Optional[float] = None
    claim_amount_approved: Optional[float] = None
    claim_loss_reason: Optional[str] = None
    claim_filed_date: Optional[date] = None
    notes: Optional[str] = None

class CropInsuranceClaimRequest(SQLModel):
    claim_amount_requested: float = Field(gt=0)
    claim_loss_reason: str = Field(description="drought, excess_rainfall_flood, pest_attack, hailstorm, unseasonal_rains, post_harvest_loss, other")
    claim_filed_date: date = Field(default_factory=date.today)
    notes: Optional[str] = None

class CropInsuranceSummary(SQLModel):
    total_policies_count: int
    active_policies_count: int
    total_sum_insured: float
    total_premium_paid: float
    claims_pending_count: int
    claims_settled_count: int
    total_claims_received: float

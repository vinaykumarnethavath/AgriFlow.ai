"""
Credit & Loan Tracker Model
===========================
SQLModel definitions for tracking farmer loans and credit purchases.
Includes support for:
- Bank loans (Kisan Credit Card, crop loans)
- Fertilizer / Seed shop credit purchases
- Trader / Arhatiya loans
- Cooperative loans
- Repayment records and payment history tracking
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date

class CreditLoanBase(SQLModel):
    source_type: str = Field(default="bank", description="bank, trader, fertilizer_shop, cooperative, relative_friend, other")
    lender_name: str = Field(index=True, max_length=150)
    purpose: str = Field(max_length=200, description="e.g. Kharif Fertilizer, Seed Purchase, Crop Loan")
    crop_id: Optional[int] = Field(default=None, foreign_key="crop.id")
    principal_amount: float = Field(gt=0)
    interest_rate_percent: float = Field(default=0.0, ge=0)
    interest_type: str = Field(default="annual", description="annual, monthly, flat, none")
    start_date: date = Field(default_factory=date.today)
    due_date: Optional[date] = Field(default=None)
    amount_paid: float = Field(default=0.0, ge=0)
    status: str = Field(default="active", description="active, paid_off, overdue")
    notes: Optional[str] = Field(default=None)

class CreditLoan(CreditLoanBase, table=True):
    __tablename__ = "credit_loans"

    id: Optional[int] = Field(default=None, primary_key=True)
    farmer_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    repayments: List["LoanRepayment"] = Relationship(
        back_populates="loan",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class CreditLoanCreate(CreditLoanBase):
    pass

class CreditLoanRead(CreditLoanBase):
    id: int
    farmer_id: int
    created_at: datetime
    updated_at: datetime
    remaining_balance: float = 0.0
    days_until_due: Optional[int] = None
    is_overdue: bool = False

class CreditLoanUpdate(SQLModel):
    source_type: Optional[str] = None
    lender_name: Optional[str] = None
    purpose: Optional[str] = None
    crop_id: Optional[int] = None
    principal_amount: Optional[float] = None
    interest_rate_percent: Optional[float] = None
    interest_type: Optional[str] = None
    start_date: Optional[date] = None
    due_date: Optional[date] = None
    amount_paid: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None

# Repayment Tracking
class LoanRepaymentBase(SQLModel):
    payment_date: date = Field(default_factory=date.today)
    amount: float = Field(gt=0)
    payment_mode: str = Field(default="cash", description="cash, upi, bank_transfer, harvest_crop, other")
    notes: Optional[str] = Field(default=None)

class LoanRepayment(LoanRepaymentBase, table=True):
    __tablename__ = "loan_repayments"

    id: Optional[int] = Field(default=None, primary_key=True)
    loan_id: int = Field(foreign_key="credit_loans.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    loan: Optional[CreditLoan] = Relationship(back_populates="repayments")

class LoanRepaymentCreate(LoanRepaymentBase):
    pass

class LoanRepaymentRead(LoanRepaymentBase):
    id: int
    loan_id: int
    created_at: datetime

# Summary Schema
class CreditSummaryRead(SQLModel):
    total_borrowed: float
    total_repaid: float
    total_outstanding: float
    active_loans_count: int
    paid_off_count: int
    overdue_count: int
    upcoming_due_loans: List[CreditLoanRead] = []

"""
Credit & Loan Router
====================
Endpoints for farmer credit and loan tracking:
- Get all loans with computed remaining balance and due status
- Summary stats (total borrowed, repaid, outstanding, overdue)
- Create, update, delete loans
- Repayment logging with automatic loan balance and status update
- Syncs loan due dates with Farm Calendar for unified reminders
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from datetime import datetime, date

from ..database import get_session
from ..deps import get_current_user
from ..models.user import User
from ..models.credit_loan import (
    CreditLoan,
    CreditLoanCreate,
    CreditLoanRead,
    CreditLoanUpdate,
    LoanRepayment,
    LoanRepaymentCreate,
    LoanRepaymentRead,
    CreditSummaryRead,
)
from ..models.farm_calendar import FarmEvent

router = APIRouter(prefix="/credit-loans", tags=["credit-loans"])

def _calculate_loan_fields(loan: CreditLoan) -> CreditLoanRead:
    """Helper to populate computed fields on CreditLoanRead."""
    today = date.today()
    remaining = max(0.0, float(loan.principal_amount) - float(loan.amount_paid))
    
    days_until_due = None
    is_overdue = False
    if loan.due_date:
        days_until_due = (loan.due_date - today).days
        is_overdue = days_until_due < 0 and loan.status != "paid_off"

    return CreditLoanRead(
        id=loan.id,
        farmer_id=loan.farmer_id,
        source_type=loan.source_type,
        lender_name=loan.lender_name,
        purpose=loan.purpose,
        crop_id=loan.crop_id,
        principal_amount=loan.principal_amount,
        interest_rate_percent=loan.interest_rate_percent,
        interest_type=loan.interest_type,
        start_date=loan.start_date,
        due_date=loan.due_date,
        amount_paid=loan.amount_paid,
        status="overdue" if is_overdue else loan.status,
        notes=loan.notes,
        created_at=loan.created_at,
        updated_at=loan.updated_at,
        remaining_balance=remaining,
        days_until_due=days_until_due,
        is_overdue=is_overdue,
    )

@router.get("/", response_model=List[CreditLoanRead])
async def list_loans(
    status_filter: Optional[str] = Query(None, description="active, paid_off, overdue"),
    source_type: Optional[str] = Query(None, description="bank, trader, fertilizer_shop, cooperative"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Retrieve all credit and loan records for the logged-in farmer."""
    query = select(CreditLoan).where(CreditLoan.farmer_id == current_user.id)
    
    if source_type:
        query = query.where(CreditLoan.source_type == source_type)
        
    query = query.order_by(CreditLoan.due_date.asc().nullslast(), CreditLoan.created_at.desc())
    result = await session.execute(query)
    loans = result.scalars().all()

    enriched: List[CreditLoanRead] = []
    for l in loans:
        enriched_loan = _calculate_loan_fields(l)
        if status_filter:
            if status_filter == "overdue" and not enriched_loan.is_overdue:
                continue
            elif status_filter != "overdue" and enriched_loan.status != status_filter:
                continue
        enriched.append(enriched_loan)

    return enriched

@router.get("/summary", response_model=CreditSummaryRead)
async def get_credit_summary(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Aggregated financial summary of the farmer's loans and credit."""
    query = select(CreditLoan).where(CreditLoan.farmer_id == current_user.id)
    result = await session.execute(query)
    loans = result.scalars().all()

    total_borrowed = 0.0
    total_repaid = 0.0
    active_count = 0
    paid_off_count = 0
    overdue_count = 0
    upcoming: List[CreditLoanRead] = []

    for l in loans:
        total_borrowed += float(l.principal_amount)
        total_repaid += float(l.amount_paid)
        read_obj = _calculate_loan_fields(l)

        if read_obj.is_overdue:
            overdue_count += 1
            active_count += 1
            upcoming.append(read_obj)
        elif read_obj.status == "paid_off":
            paid_off_count += 1
        else:
            active_count += 1
            if read_obj.days_until_due is not None and read_obj.days_until_due <= 30:
                upcoming.append(read_obj)

    total_outstanding = max(0.0, total_borrowed - total_repaid)

    # Sort upcoming by due date ascending
    upcoming.sort(key=lambda x: x.days_until_due if x.days_until_due is not None else 9999)

    return CreditSummaryRead(
        total_borrowed=round(total_borrowed, 2),
        total_repaid=round(total_repaid, 2),
        total_outstanding=round(total_outstanding, 2),
        active_loans_count=active_count,
        paid_off_count=paid_off_count,
        overdue_count=overdue_count,
        upcoming_due_loans=upcoming[:5],
    )

@router.post("/", response_model=CreditLoanRead, status_code=status.HTTP_201_CREATED)
async def create_loan(
    payload: CreditLoanCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Add a new loan or shop credit record."""
    status_val = payload.status
    if payload.due_date and payload.due_date < date.today() and status_val != "paid_off":
        status_val = "overdue"
    elif payload.amount_paid >= payload.principal_amount:
        status_val = "paid_off"

    loan = CreditLoan(
        farmer_id=current_user.id,
        source_type=payload.source_type,
        lender_name=payload.lender_name,
        purpose=payload.purpose,
        crop_id=payload.crop_id,
        principal_amount=payload.principal_amount,
        interest_rate_percent=payload.interest_rate_percent,
        interest_type=payload.interest_type,
        start_date=payload.start_date,
        due_date=payload.due_date,
        amount_paid=payload.amount_paid,
        status=status_val,
        notes=payload.notes,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(loan)
    await session.commit()
    await session.refresh(loan)

    # Auto-sync with Farm Calendar if due_date is provided
    if loan.due_date:
        calendar_event = FarmEvent(
            farmer_id=current_user.id,
            crop_id=loan.crop_id,
            title=f"Loan Due: {loan.lender_name} (₹{loan.principal_amount:,.0f})",
            event_type="loan",
            event_date=loan.due_date,
            description=f"Repayment due for {loan.purpose} to {loan.lender_name}. Outstanding: ₹{max(0.0, loan.principal_amount - loan.amount_paid):,.0f}",
            color="#ef4444",
            is_auto_generated=False,
            reminder_days_before=3,
        )
        session.add(calendar_event)
        await session.commit()

    return _calculate_loan_fields(loan)

@router.get("/{loan_id}", response_model=CreditLoanRead)
async def get_loan(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Retrieve details of a single loan."""
    loan = await session.get(CreditLoan, loan_id)
    if not loan or loan.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Loan not found")
    return _calculate_loan_fields(loan)

@router.put("/{loan_id}", response_model=CreditLoanRead)
async def update_loan(
    loan_id: int,
    payload: CreditLoanUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Update details of an existing loan."""
    loan = await session.get(CreditLoan, loan_id)
    if not loan or loan.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Loan not found")

    update_dict = payload.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(loan, field, val)

    # Check paid off status
    if loan.amount_paid >= loan.principal_amount:
        loan.status = "paid_off"
    elif loan.due_date and loan.due_date < date.today():
        loan.status = "overdue"
    elif loan.status == "paid_off" and loan.amount_paid < loan.principal_amount:
        loan.status = "active"

    loan.updated_at = datetime.utcnow()
    session.add(loan)
    await session.commit()
    await session.refresh(loan)

    return _calculate_loan_fields(loan)

@router.delete("/{loan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_loan(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Delete a loan record and associated repayments."""
    loan = await session.get(CreditLoan, loan_id)
    if not loan or loan.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Loan not found")

    await session.delete(loan)
    await session.commit()
    return None

# ─── Repayments Sub-router ──────────────────────────

@router.get("/{loan_id}/repayments", response_model=List[LoanRepaymentRead])
async def list_loan_repayments(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """List payment history for a specific loan."""
    loan = await session.get(CreditLoan, loan_id)
    if not loan or loan.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Loan not found")

    query = (
        select(LoanRepayment)
        .where(LoanRepayment.loan_id == loan_id)
        .order_by(LoanRepayment.payment_date.desc(), LoanRepayment.created_at.desc())
    )
    result = await session.execute(query)
    return result.scalars().all()

@router.post("/{loan_id}/repayments", response_model=LoanRepaymentRead, status_code=status.HTTP_201_CREATED)
async def record_loan_repayment(
    loan_id: int,
    payload: LoanRepaymentCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Record a repayment against a loan, automatically incrementing paid amount."""
    loan = await session.get(CreditLoan, loan_id)
    if not loan or loan.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Loan not found")

    repayment = LoanRepayment(
        loan_id=loan_id,
        payment_date=payload.payment_date,
        amount=payload.amount,
        payment_mode=payload.payment_mode,
        notes=payload.notes,
        created_at=datetime.utcnow(),
    )
    session.add(repayment)

    # Update loan amount_paid
    loan.amount_paid = float(loan.amount_paid) + float(payload.amount)
    if loan.amount_paid >= loan.principal_amount:
        loan.status = "paid_off"
    loan.updated_at = datetime.utcnow()
    session.add(loan)

    await session.commit()
    await session.refresh(repayment)
    return repayment

@router.delete("/{loan_id}/repayments/{repayment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_loan_repayment(
    loan_id: int,
    repayment_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Delete a repayment record and deduct amount from the loan's amount_paid."""
    loan = await session.get(CreditLoan, loan_id)
    if not loan or loan.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Loan not found")

    repayment = await session.get(LoanRepayment, repayment_id)
    if not repayment or repayment.loan_id != loan_id:
        raise HTTPException(status_code=404, detail="Repayment record not found")

    # Reverse amount
    loan.amount_paid = max(0.0, float(loan.amount_paid) - float(repayment.amount))
    if loan.amount_paid < loan.principal_amount and loan.status == "paid_off":
        if loan.due_date and loan.due_date < date.today():
            loan.status = "overdue"
        else:
            loan.status = "active"
    loan.updated_at = datetime.utcnow()
    session.add(loan)

    await session.delete(repayment)
    await session.commit()
    return None

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, col

from ..database import get_session
from ..models import (
    Crop, CropCreate, CropRead, User, CropUpdate,
    CropExpense, CropExpenseCreate, CropExpenseRead,
    FarmerProfile
)
from ..models.manufacturer import FarmerLoadPool, FarmerLoadPoolMember, MillProfile
from ..models.plot_nutrition import PlotSoilData, FertilizerApplication
from ..deps import get_current_user
from ..services.crop_service import recalculate_crop_financials
from ..services.nutrition_sync_service import sync_single_crop_expense, delete_synced_fertilizer_expense

router = APIRouter(prefix="/crops", tags=["crops"])

@router.get("/debug-env")
async def debug_env(session: AsyncSession = Depends(get_session)):
    from sqlmodel import text
    from ..database import DATABASE_URL
    cols = []
    db_name = ""
    try:
        r1 = await session.exec(text("SELECT current_database(), current_schema()"))
        row = r1.first()
        db_name = f"{row[0]} / {row[1]}" if row else "unknown"
        
        r2 = await session.exec(text("SELECT column_name FROM information_schema.columns WHERE table_name='crop'"))
        cols = [str(r[0]) for r in r2.all()]
    except Exception as e:
        cols = [str(e)]
    return {"DATABASE_URL": str(DATABASE_URL), "DB_INFO": db_name, "CROP_COLS": cols}

@router.get("/partner-lookup")
async def lookup_partner_farmer(
    query: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    q = (query or "").strip()
    if not q:
        return {"found": False, "message": "Query parameter is required"}
    
    # 1. Search FarmerProfile by farmer_id or phone
    fp_stmt = select(FarmerProfile, User).join(User, FarmerProfile.user_id == User.id).where(
        (FarmerProfile.farmer_id == q) |
        (FarmerProfile.phone_number == q) |
        (User.phone_number == q)
    )
    res = await session.exec(fp_stmt)
    row = res.first()
    if row:
        fp, u = row
        if u.id == current_user.id:
            return {"found": False, "message": "You cannot select yourself as a partner"}
        return {
            "found": True,
            "user_id": u.id,
            "farmer_id": fp.farmer_id,
            "full_name": u.full_name,
            "phone_number": u.phone_number,
            "village": fp.village,
            "district": fp.district
        }
    
    # 2. Check User table directly if role is FARMER
    u_stmt = select(User).where((User.phone_number == q) & (User.role == "FARMER"))
    u_res = await session.exec(u_stmt)
    u = u_res.first()
    if u:
        if u.id == current_user.id:
            return {"found": False, "message": "You cannot select yourself as a partner"}
        return {
            "found": True,
            "user_id": u.id,
            "farmer_id": f"FARM-{u.id}",
            "full_name": u.full_name,
            "phone_number": u.phone_number,
            "village": "Local Mandal",
            "district": "Anantapur"
        }

    return {"found": False, "message": "No registered farmer found with this ID or phone number"}

@router.post("/", response_model=CropRead)
async def create_crop(
    crop_in: CropCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    crop_data = crop_in.model_dump() if hasattr(crop_in, "model_dump") else crop_in.dict()
    
    # Strip timezones
    for date_field in ["sowing_date", "expected_harvest_date", "actual_harvest_date"]:
        if date_field in crop_data and crop_data[date_field]:
            if hasattr(crop_data[date_field], "tzinfo") and crop_data[date_field].tzinfo:
                crop_data[date_field] = crop_data[date_field].replace(tzinfo=None)
                
    # Set cultivator name
    if not crop_data.get("cultivator_name"):
        crop_data["cultivator_name"] = current_user.full_name

    # If rented, link landowner_id if landowner is a registered user
    if crop_data.get("land_ownership_type") == "rented" and crop_data.get("landowner_phone"):
        lo_phone = str(crop_data["landowner_phone"]).strip()
        lo_stmt = select(User).where(User.phone_number == lo_phone)
        lo_res = await session.exec(lo_stmt)
        lo_user = lo_res.first()
        if lo_user:
            crop_data["landowner_id"] = lo_user.id
            if not crop_data.get("landowner_name"):
                crop_data["landowner_name"] = lo_user.full_name

    # Collaborative "Together Cultivation" (Shared Farming)
    if crop_data.get("is_shared_cultivation"):
        crop_data["shared_status"] = "pending_acceptance"
        partner_code = str(crop_data.get("partner_farmer_code") or "").strip()
        partner_phone = str(crop_data.get("partner_phone") or "").strip()
        partner_user = None

        if partner_code:
            fp_stmt = select(FarmerProfile).where(FarmerProfile.farmer_id == partner_code)
            fp_res = await session.exec(fp_stmt)
            fp = fp_res.first()
            if fp:
                partner_user = await session.get(User, fp.user_id)

        if not partner_user and (partner_phone or partner_code):
            query_phone = partner_phone or partner_code
            u_stmt = select(User).where((User.phone_number == query_phone) & (User.role == "FARMER"))
            u_res = await session.exec(u_stmt)
            partner_user = u_res.first()

        if partner_user:
            crop_data["partner_farmer_id"] = partner_user.id
            if not crop_data.get("partner_name"):
                crop_data["partner_name"] = partner_user.full_name
            if not crop_data.get("partner_phone"):
                crop_data["partner_phone"] = partner_user.phone_number

        p_ratio = float(crop_data.get("partnership_share_ratio") or 0.50)
        crop_data["partnership_share_ratio"] = p_ratio
        crop_data["creator_share_ratio"] = round(1.0 - p_ratio, 2)

    db_crop = Crop(**crop_data, user_id=current_user.id)
    
    session.add(db_crop)
    await session.commit()
    await session.refresh(db_crop)

    # When land is rented for a particular amount, add that money in crop expenses
    if db_crop.land_ownership_type == "rented" and (db_crop.rent_amount or 0) > 0:
        sow_date = db_crop.sowing_date.isoformat() if db_crop.sowing_date else datetime.utcnow().isoformat()
        rent_expense = CropExpense(
            crop_id=db_crop.id,
            category="Land Lease",
            type=f"Land Lease / Koulu Rent ({db_crop.landowner_name or 'Landlord'})",
            quantity=1.0,
            unit="lease",
            unit_cost=float(db_crop.rent_amount),
            total_cost=float(db_crop.rent_amount),
            date=sow_date,
            payment_mode="Cash",
            stage="Land Prep",
            notes=f"Agreed tenancy rent to {db_crop.landowner_name or 'Landowner'}. {db_crop.lease_terms or ''}".strip(),
            duration="1 season",
            unit_size="1 plot",
            paid_by_user_id=current_user.id,
            paid_by_name=current_user.full_name
        )
        session.add(rent_expense)
        await session.commit()
        await recalculate_crop_financials(db_crop.id, session)
        await session.refresh(db_crop)

    return db_crop

@router.get("/", response_model=List[CropRead])
async def read_my_crops(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    user_phone = (current_user.phone_number or "").strip()
    if user_phone:
        statement = select(Crop).where(
            (Crop.user_id == current_user.id) |
            (Crop.partner_farmer_id == current_user.id) |
            (Crop.landowner_id == current_user.id) |
            (Crop.landowner_phone == user_phone) |
            (Crop.partner_phone == user_phone)
        ).order_by(Crop.sowing_date.desc())
    else:
        statement = select(Crop).where(
            (Crop.user_id == current_user.id) |
            (Crop.partner_farmer_id == current_user.id) |
            (Crop.landowner_id == current_user.id)
        ).order_by(Crop.sowing_date.desc())
    result = await session.exec(statement)
    return result.all()

@router.get("/market", response_model=List[CropRead])
async def read_market_crops(
    session: AsyncSession = Depends(get_session)
):
    # Available for manufacturers to see
    statement = select(Crop).where(Crop.status == "Harvested") 
    result = await session.exec(statement)
    return result.all()

@router.get("/{crop_id}", response_model=CropRead)
async def read_crop_detail(
    crop_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    crop = await session.get(Crop, crop_id)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")

    user_phone = (current_user.phone_number or "").strip()
    is_cultivator = crop.user_id == current_user.id
    is_landowner = (crop.landowner_id == current_user.id) or (user_phone and crop.landowner_phone == user_phone)
    is_partner = (crop.partner_farmer_id == current_user.id) or (user_phone and crop.partner_phone == user_phone)

    if not (is_cultivator or is_landowner or is_partner):
         raise HTTPException(status_code=403, detail="Not authorized to view this crop")
    return crop

@router.post("/{crop_id}/accept-collaboration", response_model=CropRead)
async def accept_collaboration(
    crop_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    crop = await session.get(Crop, crop_id)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    user_phone = (current_user.phone_number or "").strip()
    is_target_partner = (crop.partner_farmer_id == current_user.id) or (user_phone and crop.partner_phone == user_phone)
    if not is_target_partner:
        raise HTTPException(status_code=403, detail="You are not the invited partner for this crop")
    
    crop.shared_status = "accepted"
    if not crop.partner_farmer_id:
        crop.partner_farmer_id = current_user.id
    if not crop.partner_name:
        crop.partner_name = current_user.full_name
        
    session.add(crop)
    await session.commit()
    await session.refresh(crop)
    return crop

@router.post("/{crop_id}/decline-collaboration", response_model=CropRead)
async def decline_collaboration(
    crop_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    crop = await session.get(Crop, crop_id)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    user_phone = (current_user.phone_number or "").strip()
    is_target_partner = (crop.partner_farmer_id == current_user.id) or (user_phone and crop.partner_phone == user_phone)
    if not is_target_partner:
        raise HTTPException(status_code=403, detail="You are not the invited partner for this crop")
    
    crop.shared_status = "declined"
    session.add(crop)
    await session.commit()
    await session.refresh(crop)
    return crop

@router.get("/{crop_id}/settlement")
async def get_crop_settlement(
    crop_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    crop = await session.get(Crop, crop_id)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    
    user_phone = (current_user.phone_number or "").strip()
    is_cultivator = crop.user_id == current_user.id
    is_partner = (crop.partner_farmer_id == current_user.id) or (user_phone and crop.partner_phone == user_phone)
    is_landowner = (crop.landowner_id == current_user.id) or (user_phone and crop.landowner_phone == user_phone)
    if not (is_cultivator or is_partner or is_landowner):
        raise HTTPException(status_code=403, detail="Not authorized to view settlement")

    # Fetch expenses
    exp_stmt = select(CropExpense).where(CropExpense.crop_id == crop_id)
    exp_res = await session.exec(exp_stmt)
    expenses = exp_res.all()

    total_revenue = float(crop.total_revenue or 0.0)

    creator_user = await session.get(User, crop.user_id)
    creator_name = crop.cultivator_name or (creator_user.full_name if creator_user else "Farmer A")
    partner_name = crop.partner_name or "Partner Farmer"

    creator_spent = 0.0
    partner_spent = 0.0

    for exp in expenses:
        if exp.paid_by_user_id == crop.partner_farmer_id or (crop.partner_name and exp.paid_by_name == crop.partner_name):
            partner_spent += float(exp.total_cost or 0.0)
        else:
            creator_spent += float(exp.total_cost or 0.0)

    total_expenses = creator_spent + partner_spent
    net_profit = total_revenue - total_expenses

    p_share = float(crop.partnership_share_ratio if crop.partnership_share_ratio is not None else 0.50)
    c_share = float(crop.creator_share_ratio if crop.creator_share_ratio is not None else (1.0 - p_share))

    creator_profit_share = net_profit * c_share
    partner_profit_share = net_profit * p_share

    creator_final_payout = creator_spent + creator_profit_share
    partner_final_payout = partner_spent + partner_profit_share

    return {
        "crop_id": crop.id,
        "crop_name": crop.name,
        "is_shared_cultivation": bool(crop.is_shared_cultivation),
        "shared_status": crop.shared_status or "none",
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "net_profit": net_profit,
        "creator": {
            "name": creator_name,
            "user_id": crop.user_id,
            "share_percentage": round(c_share * 100, 1),
            "expenses_paid": creator_spent,
            "profit_share": creator_profit_share,
            "final_payout": creator_final_payout
        },
        "partner": {
            "name": partner_name,
            "user_id": crop.partner_farmer_id,
            "share_percentage": round(p_share * 100, 1),
            "expenses_paid": partner_spent,
            "profit_share": partner_profit_share,
            "final_payout": partner_final_payout
        }
    }

@router.put("/{crop_id}", response_model=CropRead)
async def update_crop(
    crop_id: int,
    crop_update: CropUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    db_crop = await session.get(Crop, crop_id)
    if not db_crop:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    user_phone = (current_user.phone_number or "").strip()
    is_cultivator = db_crop.user_id == current_user.id
    is_partner = (db_crop.partner_farmer_id == current_user.id) or (user_phone and db_crop.partner_phone == user_phone)
    if not (is_cultivator or (is_partner and db_crop.shared_status == "accepted")):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    crop_data = crop_update.dict(exclude_unset=True)
    
    # Strip timezones
    for date_field in ["sowing_date", "expected_harvest_date", "actual_harvest_date"]:
        if date_field in crop_data and crop_data[date_field]:
            if hasattr(crop_data[date_field], "tzinfo") and crop_data[date_field].tzinfo:
                crop_data[date_field] = crop_data[date_field].replace(tzinfo=None)
                
    for key, value in crop_data.items():
        setattr(db_crop, key, value)
        
    session.add(db_crop)
    await session.commit()
    await session.refresh(db_crop)

    # When land is rented or rent amount changes, synchronize the rent expense
    if any(k in crop_data for k in ["land_ownership_type", "rent_amount", "landowner_name", "lease_terms"]):
        rent_stmt = select(CropExpense).where(
            CropExpense.crop_id == db_crop.id,
            (CropExpense.category == "Land Lease") | (CropExpense.type.like("Land Lease%"))
        )
        rent_res = await session.exec(rent_stmt)
        existing_rent_exp = rent_res.first()

        if db_crop.land_ownership_type == "rented" and (db_crop.rent_amount or 0) > 0:
            if existing_rent_exp:
                existing_rent_exp.unit_cost = float(db_crop.rent_amount)
                existing_rent_exp.total_cost = float(db_crop.rent_amount)
                existing_rent_exp.type = f"Land Lease / Koulu Rent ({db_crop.landowner_name or 'Landlord'})"
                existing_rent_exp.notes = f"Agreed tenancy rent to {db_crop.landowner_name or 'Landowner'}. {db_crop.lease_terms or ''}".strip()
                session.add(existing_rent_exp)
            else:
                sow_date = db_crop.sowing_date.isoformat() if db_crop.sowing_date else datetime.utcnow().isoformat()
                new_rent_exp = CropExpense(
                    crop_id=db_crop.id,
                    category="Land Lease",
                    type=f"Land Lease / Koulu Rent ({db_crop.landowner_name or 'Landlord'})",
                    quantity=1.0,
                    unit="lease",
                    unit_cost=float(db_crop.rent_amount),
                    total_cost=float(db_crop.rent_amount),
                    date=sow_date,
                    payment_mode="Cash",
                    stage="Land Prep",
                    notes=f"Agreed tenancy rent to {db_crop.landowner_name or 'Landowner'}. {db_crop.lease_terms or ''}".strip(),
                    duration="1 season",
                    unit_size="1 plot",
                    paid_by_user_id=db_crop.user_id,
                    paid_by_name=db_crop.cultivator_name
                )
                session.add(new_rent_exp)
            await session.commit()
            await recalculate_crop_financials(db_crop.id, session)
            await session.refresh(db_crop)
        elif existing_rent_exp and (db_crop.land_ownership_type != "rented" or (db_crop.rent_amount or 0) == 0):
            await session.delete(existing_rent_exp)
            await session.commit()
            await recalculate_crop_financials(db_crop.id, session)
            await session.refresh(db_crop)

    return db_crop

# --- Expense Management ---

@router.post("/{crop_id}/expenses", response_model=CropExpenseRead)
async def add_crop_expense(
    crop_id: int,
    expense: CropExpenseCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    crop = await session.get(Crop, crop_id)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    user_phone = (current_user.phone_number or "").strip()
    is_cultivator = crop.user_id == current_user.id
    is_partner = (crop.partner_farmer_id == current_user.id) or (user_phone and crop.partner_phone == user_phone)
    if not (is_cultivator or (is_partner and crop.shared_status == "accepted")):
        raise HTTPException(status_code=403, detail="Not authorized to log expenses for this crop")

    expense_data = expense.model_dump() if hasattr(expense, "model_dump") else expense.dict()
    
    # Auto-attribute payer identity
    if not expense_data.get("paid_by_user_id"):
        expense_data["paid_by_user_id"] = current_user.id
    if not expense_data.get("paid_by_name"):
        expense_data["paid_by_name"] = current_user.full_name

    db_expense = CropExpense(**expense_data, crop_id=crop_id)
    
    if db_expense.total_cost == 0 and db_expense.quantity and db_expense.unit_cost:
        db_expense.total_cost = db_expense.quantity * db_expense.unit_cost
        
    session.add(db_expense)
    await session.commit()
    await session.refresh(db_expense)
    
    await recalculate_crop_financials(crop_id, session)
    
    try:
        await sync_single_crop_expense(session, db_expense, crop_id, current_user.id)
    except Exception as sync_err:
        print(f"[CropsRouter] Fertilizer sync error on create: {sync_err}")
    
    return db_expense

@router.get("/{crop_id}/expenses", response_model=List[CropExpenseRead])
async def get_crop_expenses(
    crop_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    crop = await session.get(Crop, crop_id)
    if not crop:
         raise HTTPException(status_code=404, detail="Crop not found")
    user_phone = (current_user.phone_number or "").strip()
    is_cultivator = crop.user_id == current_user.id
    is_landowner = (crop.landowner_id == current_user.id) or (user_phone and crop.landowner_phone == user_phone)
    is_partner = (crop.partner_farmer_id == current_user.id) or (user_phone and crop.partner_phone == user_phone)
    if not (is_cultivator or is_landowner or is_partner):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    statement = select(CropExpense).where(CropExpense.crop_id == crop_id).order_by(col(CropExpense.date).desc())
    result = await session.exec(statement)
    return result.all()

@router.delete("/{crop_id}/expenses/{expense_id}")
async def delete_crop_expense(
    crop_id: int,
    expense_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    crop = await session.get(Crop, crop_id)
    if not crop:
         raise HTTPException(status_code=404, detail="Crop not found")
         
    user_phone = (current_user.phone_number or "").strip()
    is_cultivator = crop.user_id == current_user.id
    is_partner = (crop.partner_farmer_id == current_user.id) or (user_phone and crop.partner_phone == user_phone)
    if not (is_cultivator or (is_partner and crop.shared_status == "accepted")):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    expense = await session.get(CropExpense, expense_id)
    if not expense or expense.crop_id != crop_id:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    if expense.paid_by_user_id and expense.paid_by_user_id != current_user.id and not is_cultivator:
        raise HTTPException(status_code=403, detail="Only the contributor who recorded this expense can delete it")
        
    try:
        await delete_synced_fertilizer_expense(session, expense_id)
    except Exception as sync_err:
        print(f"[CropsRouter] Fertilizer sync error on delete: {sync_err}")

    await session.delete(expense)
    await session.commit()
    
    await recalculate_crop_financials(crop.id, session)
    
    return {"ok": True}

# --- Yield & Profit ---

@router.post("/{crop_id}/harvest", response_model=CropRead)
async def record_harvest_sale(
    crop_id: int,
    yield_data: dict, # { "actual_yield": float, "selling_price_per_unit": float }
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    crop = await session.get(Crop, crop_id)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    user_phone = (current_user.phone_number or "").strip()
    is_cultivator = crop.user_id == current_user.id
    is_partner = (crop.partner_farmer_id == current_user.id) or (user_phone and crop.partner_phone == user_phone)
    if not (is_cultivator or (is_partner and crop.shared_status == "accepted")):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if "actual_yield" in yield_data:
        crop.actual_yield = float(yield_data["actual_yield"])
    if "selling_price_per_unit" in yield_data:
        crop.selling_price_per_unit = float(yield_data["selling_price_per_unit"])
        
    crop.status = "Harvested"
    updated_crop = await recalculate_crop_financials(crop.id, session)
    return updated_crop

# ─────────────────────────────────────────────────────────────────────────────
# Feature: Active Crop-Specific Collective Selling (Small Farmers Load Pooling)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{crop_id}/load-pools")
async def get_crop_load_pools(
    crop_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    crop = await session.get(Crop, crop_id)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    user_phone = (current_user.phone_number or "").strip()
    is_cultivator = crop.user_id == current_user.id
    is_partner = (crop.partner_farmer_id == current_user.id) or (user_phone and crop.partner_phone == user_phone)
    if not (is_cultivator or (is_partner and crop.shared_status == "accepted")):
        raise HTTPException(status_code=403, detail="Not authorized")

    # 1. Check if this crop is already enrolled in any pool
    enrolled_pool_res = None
    
    # Check pool created for this crop
    pool_stmt = select(FarmerLoadPool).where(FarmerLoadPool.crop_id == crop_id).where(FarmerLoadPool.status.in_(["open", "full", "submitted", "completed"]))
    created_pool = (await session.exec(pool_stmt)).first()
    
    enrolled_pool_obj = created_pool
    if not enrolled_pool_obj:
        # Check member table
        member_stmt = select(FarmerLoadPoolMember).where(FarmerLoadPoolMember.crop_id == crop_id)
        member_row = (await session.exec(member_stmt)).first()
        if member_row:
            enrolled_pool_obj = await session.get(FarmerLoadPool, member_row.pool_id)
            if enrolled_pool_obj and enrolled_pool_obj.status in ("cancelled",):
                enrolled_pool_obj = None

    if enrolled_pool_obj:
        # Fetch members
        m_stmt = select(FarmerLoadPoolMember).where(FarmerLoadPoolMember.pool_id == enrolled_pool_obj.id)
        members = (await session.exec(m_stmt)).all()
        creator = await session.get(User, enrolled_pool_obj.creator_id)
        fill_pct = round((enrolled_pool_obj.current_quantity / enrolled_pool_obj.target_quantity * 100), 1) if enrolled_pool_obj.target_quantity > 0 else 0.0
        enrolled_pool_res = {
            **enrolled_pool_obj.dict(),
            "creator_name": creator.full_name if creator else "Farmer",
            "member_count": len(members),
            "fill_percentage": fill_pct,
            "members": [m.dict() for m in members]
        }

    # 2. Search for matching open pools for this crop
    matching_pools_res = []
    crop_keywords = [k for k in [crop.crop_type, crop.name, (crop.name.split()[0] if crop.name else "")] if k]
    
    all_open_stmt = select(FarmerLoadPool).where(FarmerLoadPool.status.in_(["open", "full"]))
    all_open_pools = (await session.exec(all_open_stmt)).all()
    
    for p in all_open_pools:
        # Don't include the already enrolled pool
        if enrolled_pool_obj and p.id == enrolled_pool_obj.id:
            continue
            
        # Match crop name or crop type
        p_name = (p.crop_name or "").lower()
        matches_crop = any(kw.lower() in p_name or p_name in kw.lower() for kw in crop_keywords)
        if matches_crop:
            m_stmt = select(FarmerLoadPoolMember).where(FarmerLoadPoolMember.pool_id == p.id)
            p_members = (await session.exec(m_stmt)).all()
            p_creator = await session.get(User, p.creator_id)
            fill_pct = round((p.current_quantity / p.target_quantity * 100), 1) if p.target_quantity > 0 else 0.0
            matching_pools_res.append({
                **p.dict(),
                "creator_name": p_creator.full_name if p_creator else "Farmer",
                "member_count": len(p_members),
                "fill_percentage": fill_pct,
                "members": [m.dict() for m in p_members]
            })

    # Get farmer profile for default location
    fp_stmt = select(FarmerProfile).where(FarmerProfile.user_id == current_user.id)
    fp = (await session.exec(fp_stmt)).first()

    return {
        "crop_id": crop.id,
        "crop_name": crop.name,
        "crop_type": crop.crop_type or crop.name,
        "variety": crop.variety,
        "area": crop.area,
        "status": crop.status,
        "sowing_date": crop.sowing_date,
        "expected_harvest_date": crop.expected_harvest_date,
        "actual_yield": crop.actual_yield or 0.0,
        "village": fp.village if fp else "",
        "mandal": fp.mandal if fp else "",
        "district": fp.district if fp else "",
        "state": fp.state if fp else "Andhra Pradesh",
        "enrolled_pool": enrolled_pool_res,
        "matching_pools": matching_pools_res
    }

@router.post("/{crop_id}/create-pool")
async def create_crop_load_pool(
    crop_id: int,
    data: dict,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    crop = await session.get(Crop, crop_id)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    user_phone = (current_user.phone_number or "").strip()
    is_cultivator = crop.user_id == current_user.id
    is_partner = (crop.partner_farmer_id == current_user.id) or (user_phone and crop.partner_phone == user_phone)
    if not (is_cultivator or (is_partner and crop.shared_status == "accepted")):
        raise HTTPException(status_code=403, detail="Not authorized")

    fp_stmt = select(FarmerProfile).where(FarmerProfile.user_id == current_user.id)
    fp = (await session.exec(fp_stmt)).first()

    pref_mill_name = None
    pref_mill_id = data.get("preferred_mill_id")
    if pref_mill_id:
        mill_stmt = select(MillProfile).where(MillProfile.user_id == pref_mill_id)
        m_prof = (await session.exec(mill_stmt)).first()
        if m_prof:
            pref_mill_name = m_prof.mill_name

    target_qty = float(data.get("target_quantity", 100))
    my_qty = float(data.get("my_quantity", 20))
    delivery_dt = data.get("delivery_date") or crop.expected_harvest_date or datetime.utcnow().strftime("%Y-%m-%d")

    pool = FarmerLoadPool(
        creator_id=current_user.id,
        crop_id=crop.id,
        crop_name=crop.crop_type or crop.name,
        crop_variety=crop.variety,
        harvest_date=crop.expected_harvest_date,
        target_quantity=target_qty,
        current_quantity=my_qty,
        unit=data.get("unit", "quintal"),
        village=data.get("village") or (fp.village if fp else "Village"),
        mandal=data.get("mandal") or (fp.mandal if fp else ""),
        district=data.get("district") or (fp.district if fp else "District"),
        state=data.get("state") or (fp.state if fp else "Andhra Pradesh"),
        delivery_date=delivery_dt,
        preferred_mill_id=pref_mill_id,
        preferred_mill_name=pref_mill_name,
        min_quality_grade=data.get("min_quality_grade", "Grade A"),
        expected_price_per_unit=float(data.get("expected_price_per_unit", crop.selling_price_per_unit or 2400.0)),
        notes=data.get("notes", f"Collective pool for {crop.name} ({crop.variety}) harvest"),
        status="full" if my_qty >= target_qty else "open"
    )
    session.add(pool)
    await session.commit()
    await session.refresh(pool)

    member = FarmerLoadPoolMember(
        pool_id=pool.id,
        farmer_id=current_user.id,
        crop_id=crop.id,
        farmer_name=current_user.full_name or "Farmer",
        farmer_phone=current_user.phone_number or (fp.phone_number if fp else None),
        quantity=my_qty,
        unit=pool.unit,
        quality_grade=pool.min_quality_grade,
    )
    session.add(member)
    await session.commit()

    return {"ok": True, "pool_id": pool.id, "message": f"Collective pool #{pool.id} created for {crop.name}"}

@router.post("/{crop_id}/join-pool/{pool_id}")
async def join_crop_load_pool(
    crop_id: int,
    pool_id: int,
    data: dict,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    crop = await session.get(Crop, crop_id)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
        
    pool = await session.get(FarmerLoadPool, pool_id)
    if not pool:
        raise HTTPException(status_code=404, detail="Pool not found")
    if pool.status not in ("open", "full"):
        raise HTTPException(status_code=400, detail=f"Pool is {pool.status}, cannot join")

    m_stmt = select(FarmerLoadPoolMember).where(FarmerLoadPoolMember.pool_id == pool_id).where(FarmerLoadPoolMember.farmer_id == current_user.id)
    existing = (await session.exec(m_stmt)).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already joined this pool")

    qty = float(data.get("quantity", 15))
    fp_stmt = select(FarmerProfile).where(FarmerProfile.user_id == current_user.id)
    fp = (await session.exec(fp_stmt)).first()

    member = FarmerLoadPoolMember(
        pool_id=pool_id,
        farmer_id=current_user.id,
        crop_id=crop.id,
        farmer_name=current_user.full_name or "Farmer",
        farmer_phone=current_user.phone_number or (fp.phone_number if fp else None),
        quantity=qty,
        unit=pool.unit,
        quality_grade=data.get("quality_grade", pool.min_quality_grade),
    )
    session.add(member)
    pool.current_quantity += qty
    if pool.current_quantity >= pool.target_quantity:
        pool.status = "full"
    pool.updated_at = datetime.utcnow()
    session.add(pool)
    await session.commit()

    return {"ok": True, "message": f"Successfully enrolled {qty} {pool.unit} of {crop.name} into Pool #{pool_id}"}

@router.post("/{crop_id}/leave-pool/{pool_id}")
async def leave_crop_load_pool(
    crop_id: int,
    pool_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    crop = await session.get(Crop, crop_id)
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    pool = await session.get(FarmerLoadPool, pool_id)
    if not pool:
        raise HTTPException(status_code=404, detail="Pool not found")
    if pool.status in ("submitted", "completed"):
        raise HTTPException(status_code=400, detail="Cannot leave a pool that has already been submitted to the mill")

    if pool.creator_id == current_user.id:
        pool.status = "cancelled"
        session.add(pool)
        await session.commit()
        return {"ok": True, "message": "Pool cancelled by creator"}
    else:
        m_stmt = select(FarmerLoadPoolMember).where(FarmerLoadPoolMember.pool_id == pool_id).where(FarmerLoadPoolMember.farmer_id == current_user.id)
        member = (await session.exec(m_stmt)).first()
        if member:
            pool.current_quantity = max(0.0, pool.current_quantity - member.quantity)
            if pool.current_quantity < pool.target_quantity and pool.status == "full":
                pool.status = "open"
            session.add(pool)
            await session.delete(member)
            await session.commit()
            return {"ok": True, "message": "Successfully withdrawn from pool"}
        raise HTTPException(status_code=404, detail="Membership record not found")


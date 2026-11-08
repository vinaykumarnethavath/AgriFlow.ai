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

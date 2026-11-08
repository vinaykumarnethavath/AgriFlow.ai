from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, col

from ..database import get_session
from ..models import (
    Crop, CropCreate, CropRead, User, CropUpdate,
    CropExpense, CropExpenseCreate, CropExpenseRead
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
            unit_size="1 plot"
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
            (Crop.landowner_id == current_user.id) |
            (Crop.landowner_phone == user_phone)
        ).order_by(Crop.sowing_date.desc())
    else:
        statement = select(Crop).where(
            (Crop.user_id == current_user.id) |
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

    if not (is_cultivator or is_landowner):
         raise HTTPException(status_code=403, detail="Not authorized to view this crop")
    return crop

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
    if db_crop.user_id != current_user.id:
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
                    unit_size="1 plot"
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
    if crop.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    expense_data = expense.model_dump() if hasattr(expense, "model_dump") else expense.dict()
    db_expense = CropExpense(**expense_data, crop_id=crop_id)
    
    # Auto-calculate total cost if not provided (though frontend should ideally send it)
    if db_expense.total_cost == 0 and db_expense.quantity and db_expense.unit_cost:
        db_expense.total_cost = db_expense.quantity * db_expense.unit_cost
        
    session.add(db_expense)
    await session.commit()
    await session.refresh(db_expense)
    
    # Update Crop Financials
    await recalculate_crop_financials(crop_id, session)
    
    # Auto-sync to Fertilizer Impact Tracker / Live Soil Nutrition
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
    if not (is_cultivator or is_landowner):
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
    if crop.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    expense = await session.get(CropExpense, expense_id)
    if not expense or expense.crop_id != crop_id:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    # Remove synced fertilizer application if any
    try:
        await delete_synced_fertilizer_expense(session, expense_id)
    except Exception as sync_err:
        print(f"[CropsRouter] Fertilizer sync error on delete: {sync_err}")

    await session.delete(expense)
    await session.commit()
    
    # Update Crop Financials
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
    if crop.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update harvest data
    if "actual_yield" in yield_data:
        crop.actual_yield = float(yield_data["actual_yield"])
    if "selling_price_per_unit" in yield_data:
        crop.selling_price_per_unit = float(yield_data["selling_price_per_unit"])
        
    crop.status = "Harvested"
        
    # Recalculate everything
    # Recalculate everything
    updated_crop = await recalculate_crop_financials(crop.id, session)
    return updated_crop

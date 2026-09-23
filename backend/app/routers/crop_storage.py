"""
Crop Storage Router
===================
Endpoints for tracking produce in cold storage, warehouses, and godowns:
- Produce inventory (bags, quintals, facility, receipt/e-NWR)
- Real-time accumulated storage rent calculations
- Release reminders and peak-price sell alerts
- Auto-sync with Farm Calendar for storage release deadlines
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from datetime import datetime, date

from ..database import get_session
from ..deps import get_current_user
from ..models.user import User
from ..models.crop_storage import (
    CropStorage,
    CropStorageCreate,
    CropStorageRead,
    CropStorageUpdate,
    CropStorageReleaseRequest,
    CropStorageSummary,
)
from ..models.farm_calendar import FarmEvent

router = APIRouter(prefix="/crop-storage", tags=["crop-storage"])

def _calculate_storage_fields(item: CropStorage) -> CropStorageRead:
    """Compute days in storage, accumulated rent charges, and release countdowns."""
    today = date.today()
    days_stored = max(0, (today - item.deposit_date).days)
    
    # Calculate months in storage (fractions or round up to minimum 1 if > 0)
    months_stored = max(1, round(days_stored / 30.4)) if days_stored > 0 else 0
    monthly_rent = float(item.bags_count) * float(item.monthly_rent_per_bag)
    accumulated_rent = round(months_stored * monthly_rent, 2)

    days_until_release = None
    is_release_due = False
    if item.expected_release_date:
        days_until_release = (item.expected_release_date - today).days
        is_release_due = days_until_release <= 7 and item.status in ["stored", "partially_released"]

    status_val = item.status
    if is_release_due and days_until_release is not None and days_until_release < 0:
        status_val = "overdue_alert"

    return CropStorageRead(
        id=item.id,
        farmer_id=item.farmer_id,
        crop_name=item.crop_name,
        variety=item.variety,
        storage_type=item.storage_type,
        facility_name=item.facility_name,
        location=item.location,
        receipt_number=item.receipt_number,
        bags_count=item.bags_count,
        weight_quintals=item.weight_quintals,
        bag_weight_kg=item.bag_weight_kg,
        monthly_rent_per_bag=item.monthly_rent_per_bag,
        deposit_date=item.deposit_date,
        expected_release_date=item.expected_release_date,
        actual_release_date=item.actual_release_date,
        status=status_val,
        target_sell_price_per_quintal=item.target_sell_price_per_quintal,
        notes=item.notes,
        created_at=item.created_at,
        updated_at=item.updated_at,
        days_in_storage=days_stored,
        accumulated_rent=accumulated_rent,
        days_until_release=days_until_release,
        is_release_due=is_release_due,
    )

@router.get("/", response_model=List[CropStorageRead])
async def list_crop_storages(
    status_filter: Optional[str] = Query(None, description="stored, partially_released, fully_released, overdue_alert"),
    storage_type: Optional[str] = Query(None, description="cold_storage, warehouse_cwc_swc, private_godown"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Retrieve all crop storage records for the logged-in farmer."""
    stmt = select(CropStorage).where(CropStorage.farmer_id == current_user.id)
    if storage_type:
        stmt = stmt.where(CropStorage.storage_type == storage_type)
    stmt = stmt.order_by(CropStorage.deposit_date.desc(), CropStorage.created_at.desc())

    result = await session.execute(stmt)
    items = result.scalars().all()

    enriched = []
    for item in items:
        read_obj = _calculate_storage_fields(item)
        if status_filter:
            if status_filter == "overdue_alert" and not read_obj.is_release_due:
                continue
            elif status_filter != "overdue_alert" and read_obj.status != status_filter:
                continue
        enriched.append(read_obj)

    return enriched

@router.get("/summary", response_model=CropStorageSummary)
async def get_storage_summary(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Aggregated portfolio summary of active produce in storage."""
    stmt = select(CropStorage).where(CropStorage.farmer_id == current_user.id)
    result = await session.execute(stmt)
    items = result.scalars().all()

    total_bags = 0
    total_quintals = 0.0
    monthly_rent = 0.0
    accumulated_rent = 0.0
    active_facilities = set()
    release_due_count = 0

    for item in items:
        if item.status in ["stored", "partially_released"]:
            total_bags += item.bags_count
            total_quintals += float(item.weight_quintals)
            monthly_rent += float(item.bags_count) * float(item.monthly_rent_per_bag)
            active_facilities.add(item.facility_name.strip().lower())
            read_obj = _calculate_storage_fields(item)
            accumulated_rent += read_obj.accumulated_rent
            if read_obj.is_release_due:
                release_due_count += 1

    return CropStorageSummary(
        total_bags_stored=total_bags,
        total_quintals_stored=round(total_quintals, 2),
        monthly_rent_commitment=round(monthly_rent, 2),
        total_accumulated_rent=round(accumulated_rent, 2),
        active_facilities_count=len(active_facilities),
        release_due_count=release_due_count,
    )

@router.post("/", response_model=CropStorageRead, status_code=status.HTTP_201_CREATED)
async def create_crop_storage(
    payload: CropStorageCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Record new produce deposited in warehouse or cold storage."""
    item = CropStorage(
        farmer_id=current_user.id,
        crop_name=payload.crop_name,
        variety=payload.variety,
        storage_type=payload.storage_type,
        facility_name=payload.facility_name,
        location=payload.location,
        receipt_number=payload.receipt_number,
        bags_count=payload.bags_count,
        weight_quintals=payload.weight_quintals,
        bag_weight_kg=payload.bag_weight_kg,
        monthly_rent_per_bag=payload.monthly_rent_per_bag,
        deposit_date=payload.deposit_date,
        expected_release_date=payload.expected_release_date,
        actual_release_date=payload.actual_release_date,
        status=payload.status,
        target_sell_price_per_quintal=payload.target_sell_price_per_quintal,
        notes=payload.notes,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(item)
    await session.commit()
    await session.refresh(item)

    # Auto-sync release reminder into Farm Calendar if expected_release_date provided
    if item.expected_release_date:
        event = FarmEvent(
            farmer_id=current_user.id,
            title=f"Release {item.crop_name} from {item.facility_name}",
            event_type="custom",
            event_date=item.expected_release_date,
            description=f"Storage release window for {item.bags_count} bags ({item.weight_quintals} Qtl) of {item.crop_name} stored at {item.facility_name}.",
            color="#0ea5e9",
            reminder_days_before=3,
        )
        session.add(event)
        await session.commit()

    return _calculate_storage_fields(item)

@router.get("/{storage_id}", response_model=CropStorageRead)
async def get_crop_storage(
    storage_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Retrieve details of a single storage deposit."""
    item = await session.get(CropStorage, storage_id)
    if not item or item.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Storage record not found")
    return _calculate_storage_fields(item)

@router.put("/{storage_id}", response_model=CropStorageRead)
async def update_crop_storage(
    storage_id: int,
    payload: CropStorageUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Update details of an existing storage record."""
    item = await session.get(CropStorage, storage_id)
    if not item or item.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Storage record not found")

    update_dict = payload.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(item, k, v)

    item.updated_at = datetime.utcnow()
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return _calculate_storage_fields(item)

@router.post("/{storage_id}/release", response_model=CropStorageRead)
async def release_stored_crop(
    storage_id: int,
    payload: CropStorageReleaseRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Record withdrawal / release of bags from storage for selling."""
    item = await session.get(CropStorage, storage_id)
    if not item or item.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Storage record not found")

    if payload.bags_released > item.bags_count:
        raise HTTPException(status_code=400, detail="Cannot release more bags than currently stored")

    item.bags_count = item.bags_count - payload.bags_released
    # Proportionally adjust weight
    item.weight_quintals = round(item.bags_count * (item.bag_weight_kg / 100.0), 2)
    item.actual_release_date = payload.release_date

    if item.bags_count <= 0:
        item.status = "fully_released"
    else:
        item.status = "partially_released"

    if payload.notes:
        item.notes = f"{item.notes or ''}\nReleased {payload.bags_released} bags on {payload.release_date}: {payload.notes}".strip()

    item.updated_at = datetime.utcnow()
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return _calculate_storage_fields(item)

@router.delete("/{storage_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_crop_storage(
    storage_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Delete a storage deposit record."""
    item = await session.get(CropStorage, storage_id)
    if not item or item.farmer_id != current_user.id:
        raise HTTPException(status_code=404, detail="Storage record not found")

    await session.delete(item)
    await session.commit()
    return None

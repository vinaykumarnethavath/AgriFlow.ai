"""
Farm Calendar Router
====================
CRUD endpoints for farm activity calendar.
- Manual event creation (sowing, fertilizer, weeding, harvest, loan, custom)
- Auto-generates events from existing crop data (sowing dates, expected harvests)
- Filter events by month/year
- Upcoming events (next 7 days)
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from datetime import datetime, date, timedelta

from ..database import get_session
from ..deps import get_current_user
from ..models.user import User
from ..models.crop import Crop
from ..models.farm_calendar import (
    FarmEvent,
    FarmEventCreate,
    FarmEventRead,
    FarmEventUpdate,
)

router = APIRouter(prefix="/farm-calendar", tags=["farm-calendar"])

# Event type → default color mapping
EVENT_COLORS = {
    "sowing": "#22c55e",      # green-500
    "fertilizer": "#3b82f6",  # blue-500
    "weeding": "#a855f7",     # purple-500
    "harvest": "#eab308",     # yellow-500
    "loan": "#ef4444",        # red-500
    "irrigation": "#06b6d4",  # cyan-500
    "spraying": "#f97316",    # orange-500
    "custom": "#6b7280",      # gray-500
}


@router.get("/events", response_model=List[FarmEventRead])
async def get_events(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None, ge=2020, le=2050),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Get all farm events. Optionally filter by month/year.
    Also auto-generates events from crop sowing/harvest dates.
    """
    query = select(FarmEvent).where(FarmEvent.user_id == current_user.id)

    if month and year:
        # Filter for events in the specified month
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)
        query = query.where(
            FarmEvent.event_date >= start_date,
            FarmEvent.event_date < end_date,
        )
    elif year:
        start_date = date(year, 1, 1)
        end_date = date(year + 1, 1, 1)
        query = query.where(
            FarmEvent.event_date >= start_date,
            FarmEvent.event_date < end_date,
        )

    query = query.order_by(FarmEvent.event_date)
    result = await session.exec(query)
    manual_events = list(result.all())

    # Auto-generate events from crops (only for the filtered month/year)
    auto_events = await _generate_crop_events(current_user.id, session, month, year)

    # Merge: avoid duplicates by checking (event_type, event_date, crop_id)
    existing_keys = {
        (e.event_type, str(e.event_date), e.crop_id)
        for e in manual_events
    }

    all_events = list(manual_events)
    for auto_ev in auto_events:
        key = (auto_ev.event_type, str(auto_ev.event_date), auto_ev.crop_id)
        if key not in existing_keys:
            all_events.append(auto_ev)
            existing_keys.add(key)

    all_events.sort(key=lambda e: e.event_date)
    return all_events


@router.get("/upcoming", response_model=List[FarmEventRead])
async def get_upcoming_events(
    days: int = Query(7, ge=1, le=30),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Get events in the next N days (default 7)."""
    today = date.today()
    end_date = today + timedelta(days=days)

    query = (
        select(FarmEvent)
        .where(
            FarmEvent.user_id == current_user.id,
            FarmEvent.event_date >= today,
            FarmEvent.event_date <= end_date,
            FarmEvent.is_completed == False,
        )
        .order_by(FarmEvent.event_date)
    )
    result = await session.exec(query)
    manual_events = list(result.all())

    # Also get auto-generated upcoming events
    auto_events = await _generate_crop_events(
        current_user.id, session, None, None
    )
    upcoming_auto = [
        e for e in auto_events
        if today <= e.event_date <= end_date
    ]

    existing_keys = {
        (e.event_type, str(e.event_date), e.crop_id)
        for e in manual_events
    }

    all_events = list(manual_events)
    for auto_ev in upcoming_auto:
        key = (auto_ev.event_type, str(auto_ev.event_date), auto_ev.crop_id)
        if key not in existing_keys:
            all_events.append(auto_ev)
            existing_keys.add(key)

    all_events.sort(key=lambda e: e.event_date)
    return all_events


@router.post("/events", response_model=FarmEventRead)
async def create_event(
    event_in: FarmEventCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Create a new farm calendar event."""
    event_data = event_in.model_dump() if hasattr(event_in, "model_dump") else event_in.dict()

    # Auto-assign color based on event type if not provided
    if not event_data.get("color"):
        event_data["color"] = EVENT_COLORS.get(event_data.get("event_type", "custom"), EVENT_COLORS["custom"])

    db_event = FarmEvent(**event_data, user_id=current_user.id)
    session.add(db_event)
    await session.commit()
    await session.refresh(db_event)
    return db_event


@router.put("/events/{event_id}", response_model=FarmEventRead)
async def update_event(
    event_id: int,
    data: FarmEventUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Update a farm calendar event."""
    event = await session.get(FarmEvent, event_id)
    if not event or event.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = data.model_dump(exclude_unset=True) if hasattr(data, "model_dump") else data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(event, key, value)

    session.add(event)
    await session.commit()
    await session.refresh(event)
    return event


@router.delete("/events/{event_id}")
async def delete_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Delete a farm calendar event."""
    event = await session.get(FarmEvent, event_id)
    if not event or event.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Event not found")

    await session.delete(event)
    await session.commit()
    return {"message": "Event deleted successfully"}


@router.patch("/events/{event_id}/toggle")
async def toggle_event_completion(
    event_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Toggle the completion status of an event."""
    event = await session.get(FarmEvent, event_id)
    if not event or event.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Event not found")

    event.is_completed = not event.is_completed
    session.add(event)
    await session.commit()
    await session.refresh(event)
    return {"id": event.id, "is_completed": event.is_completed}


async def _generate_crop_events(
    user_id: int,
    session: AsyncSession,
    month: Optional[int],
    year: Optional[int],
) -> List[FarmEventRead]:
    """
    Auto-generate calendar events from the farmer's active crops.
    Creates events for:
    - Sowing date
    - Expected harvest date
    - Fertilizer reminders (30 days and 60 days after sowing)
    """
    query = select(Crop).where(Crop.user_id == user_id)
    result = await session.exec(query)
    crops = result.all()

    auto_events: List[FarmEventRead] = []
    now = datetime.utcnow()

    for crop in crops:
        crop_name = crop.name

        # Sowing date event
        sowing_date = crop.sowing_date.date() if isinstance(crop.sowing_date, datetime) else crop.sowing_date
        if _in_range(sowing_date, month, year):
            auto_events.append(FarmEventRead(
                id=0,
                user_id=user_id,
                title=f"Sowing: {crop_name}",
                event_type="sowing",
                event_date=sowing_date,
                description=f"Sowing date for {crop_name} ({crop.variety or 'N/A'}) on {crop.area} acres",
                crop_id=crop.id,
                crop_name=crop_name,
                reminder_days_before=1,
                is_completed=crop.status != "Growing" or (now - crop.sowing_date).days > 7,
                color=EVENT_COLORS["sowing"],
                created_at=crop.created_at if hasattr(crop, "created_at") else now,
            ))

        # Expected harvest date event
        if crop.expected_harvest_date:
            harvest_date = crop.expected_harvest_date.date() if isinstance(crop.expected_harvest_date, datetime) else crop.expected_harvest_date
            if _in_range(harvest_date, month, year):
                auto_events.append(FarmEventRead(
                    id=0,
                    user_id=user_id,
                    title=f"Harvest: {crop_name}",
                    event_type="harvest",
                    event_date=harvest_date,
                    description=f"Expected harvest for {crop_name} on {crop.area} acres",
                    crop_id=crop.id,
                    crop_name=crop_name,
                    reminder_days_before=3,
                    is_completed=crop.status == "Harvested" or crop.status == "Sold",
                    color=EVENT_COLORS["harvest"],
                    created_at=crop.created_at if hasattr(crop, "created_at") else now,
                ))

        # Auto fertilizer reminders: 30 and 60 days after sowing (for Growing crops)
        if crop.status == "Growing":
            for days_after, label in [(30, "1st Fertilizer"), (60, "2nd Fertilizer")]:
                fert_date = sowing_date + timedelta(days=days_after)
                if _in_range(fert_date, month, year):
                    auto_events.append(FarmEventRead(
                        id=0,
                        user_id=user_id,
                        title=f"{label}: {crop_name}",
                        event_type="fertilizer",
                        event_date=fert_date,
                        description=f"Recommended {label.lower()} application for {crop_name}",
                        crop_id=crop.id,
                        crop_name=crop_name,
                        reminder_days_before=2,
                        is_completed=(now.date() - fert_date).days > 7 if now.date() > fert_date else False,
                        color=EVENT_COLORS["fertilizer"],
                        created_at=crop.created_at if hasattr(crop, "created_at") else now,
                    ))

    return auto_events


def _in_range(d: date, month: Optional[int], year: Optional[int]) -> bool:
    """Check if a date falls within the specified month/year filter."""
    if month and year:
        return d.year == year and d.month == month
    elif year:
        return d.year == year
    return True

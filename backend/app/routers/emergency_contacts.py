"""
Emergency Contacts & SOS Directory Router
==========================================
Provides farmers with direct-dial emergency hotlines and local technician contacts:
- National helplines (Kisan Call Center 1551, PMFBY 14447, Disaster 1070, Electricity 1912, Vet 1962)
- Custom user-added contacts (Lineman, Veterinary Doctor, KVK Scientist, Harvester Driver, Input Shop)
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, or_
from datetime import datetime

from ..database import get_session
from ..deps import get_current_user
from ..models.user import User
from ..models.emergency_contact import (
    EmergencyContact, EmergencyContactCreate, EmergencyContactRead, EmergencyContactUpdate
)

router = APIRouter(prefix="/emergency-contacts", tags=["emergency-contacts"])

DEFAULT_SYSTEM_CONTACTS = [
    {
        "name": "Kisan Call Center (KCC)",
        "category": "national_helpline",
        "phone_number": "18001801551",
        "alternate_phone": "1551",
        "department_or_village": "Ministry of Agriculture & Farmers Welfare, GoI",
        "is_toll_free": True,
        "is_verified": True,
        "availability_hours": "06:00 AM - 10:00 PM (Daily)",
        "notes": "Direct expert answers on crop pests, fertilizer doses, weather, and MSP mandi rates in 22 languages."
    },
    {
        "name": "PM-Fasal Bima Yojana (Crop Loss Claim)",
        "category": "national_helpline",
        "phone_number": "14447",
        "alternate_phone": "18002005142",
        "department_or_village": "PMFBY Calamity Reporting Cell",
        "is_toll_free": True,
        "is_verified": True,
        "availability_hours": "24/7 Helpline",
        "notes": "Mandatory 72-hour disaster intimation hotline for localized waterlogging, hailstorms, and unseasonal rains."
    },
    {
        "name": "Rural Electricity & Transformer Emergency",
        "category": "electricity_power",
        "phone_number": "1912",
        "alternate_phone": "+91-9412019120",
        "department_or_village": "State Discom Rural Feeder Control",
        "is_toll_free": True,
        "is_verified": True,
        "availability_hours": "24/7 Breakdown Cell",
        "notes": "Report tube well power outages, burnt agricultural transformers, fallen HT lines, or phase imbalance."
    },
    {
        "name": "Veterinary & Livestock Emergency (MVU)",
        "category": "veterinary",
        "phone_number": "1962",
        "alternate_phone": None,
        "department_or_village": "Animal Husbandry Mobile Veterinary Unit",
        "is_toll_free": True,
        "is_verified": True,
        "availability_hours": "24/7 Ambulance",
        "notes": "Rapid response mobile veterinary clinic for acute cattle bloat, poisonous plant ingestion, or difficult calving."
    },
    {
        "name": "KVK District Agronomist Help Desk",
        "category": "kvk_agriculture_officer",
        "phone_number": "+919412089456",
        "alternate_phone": "05622268112",
        "department_or_village": "Krishi Vigyan Kendra (KVK)",
        "is_toll_free": False,
        "is_verified": True,
        "availability_hours": "09:30 AM - 05:30 PM (Mon-Sat)",
        "notes": "Local seed variety selection, plant pathology diagnostic clinic, and Soil Health Card consultations."
    },
    {
        "name": "Canal & Irrigation Emergency Cell",
        "category": "water_irrigation",
        "phone_number": "18001805145",
        "alternate_phone": None,
        "department_or_village": "State Water Resources & Minor Irrigation",
        "is_toll_free": True,
        "is_verified": True,
        "availability_hours": "08:00 AM - 08:00 PM",
        "notes": "Report canal breach, tail-end water shortage, or unauthorized bunding."
    },
    {
        "name": "National Disaster & Flood Relief",
        "category": "national_helpline",
        "phone_number": "1070",
        "alternate_phone": "1078",
        "department_or_village": "National Disaster Management Authority (NDMA)",
        "is_toll_free": True,
        "is_verified": True,
        "availability_hours": "24/7 Emergency",
        "notes": "Emergency flood rescue, cyclone shelters, and emergency fodder drops."
    },
    {
        "name": "All-India Emergency Helpline (ERSS)",
        "category": "national_helpline",
        "phone_number": "112",
        "alternate_phone": None,
        "department_or_village": "Police, Fire, Ambulance Universal SOS",
        "is_toll_free": True,
        "is_verified": True,
        "availability_hours": "24/7",
        "notes": "Immediate police, fire, or hospital ambulance dispatch."
    }
]

async def _ensure_system_contacts(session: AsyncSession):
    """Auto-seeds system contacts if none exist."""
    stmt = select(EmergencyContact).where(EmergencyContact.farmer_id.is_(None))
    existing = (await session.exec(stmt)).all()
    if not existing:
        for c_data in DEFAULT_SYSTEM_CONTACTS:
            sc = EmergencyContact(**c_data, farmer_id=None)
            session.add(sc)
        await session.commit()

@router.get("/", response_model=List[EmergencyContactRead])
async def get_emergency_contacts(
    category: Optional[str] = Query(None, description="Filter by category"),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    await _ensure_system_contacts(session)

    # Fetch both system contacts (farmer_id is None) and user's private contacts
    query = select(EmergencyContact).where(
        or_(
            EmergencyContact.farmer_id.is_(None),
            EmergencyContact.farmer_id == current_user.id
        )
    )

    if category and category != "all":
        query = query.where(EmergencyContact.category == category)

    res = await session.exec(query)
    contacts = res.all()

    # Sort system national helplines first, then user's local contacts
    sorted_contacts = sorted(contacts, key=lambda c: (0 if c.farmer_id is None else 1, c.name))
    
    result = []
    for c in sorted_contacts:
        read = EmergencyContactRead(
            **c.dict(),
            is_system_contact=(c.farmer_id is None)
        )
        result.append(read)

    return result

@router.post("/", response_model=EmergencyContactRead, status_code=status.HTTP_201_CREATED)
async def create_emergency_contact(
    data: EmergencyContactCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    contact = EmergencyContact(
        **data.dict(),
        farmer_id=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    session.add(contact)
    await session.commit()
    await session.refresh(contact)
    return EmergencyContactRead(**contact.dict(), is_system_contact=False)

@router.put("/{contact_id}", response_model=EmergencyContactRead)
async def update_emergency_contact(
    contact_id: int,
    data: EmergencyContactUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    contact = await session.get(EmergencyContact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    if contact.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot modify system contacts or other users' contacts")

    update_dict = data.dict(exclude_unset=True)
    for key, val in update_dict.items():
        setattr(contact, key, val)

    contact.updated_at = datetime.utcnow()
    session.add(contact)
    await session.commit()
    await session.refresh(contact)
    return EmergencyContactRead(**contact.dict(), is_system_contact=False)

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_emergency_contact(
    contact_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    contact = await session.get(EmergencyContact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    if contact.farmer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot delete system contacts or other users' contacts")

    await session.delete(contact)
    await session.commit()
    return None

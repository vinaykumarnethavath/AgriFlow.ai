"""
Emergency Contact & SOS Directory Model
========================================
Stores critical crisis hotlines and local support contacts for farmers:
- National Helplines (Kisan Call Center 1551, PMFBY 14447, Disaster Helpline)
- Local Power/Electricity Linemen (tube well power failures, transformer outages)
- Irrigation & Canal Officers
- Veterinary Doctors (cattle/livestock emergency)
- KVK Agronomists & Field Officers
- Harvester / Tractor Breakdown Mechanics
"""

from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class EmergencyContactBase(SQLModel):
    name: str = Field(max_length=150)
    category: str = Field(
        default="other",
        description="national_helpline, kvk_agriculture_officer, electricity_power, water_irrigation, veterinary, machinery_mechanic, input_retailer, other"
    )
    phone_number: str = Field(max_length=50)
    alternate_phone: Optional[str] = Field(default=None, max_length=50)
    department_or_village: Optional[str] = Field(default=None, max_length=150)
    is_toll_free: bool = Field(default=False)
    is_verified: bool = Field(default=True)
    availability_hours: str = Field(default="24/7", max_length=100)
    notes: Optional[str] = Field(default=None)

class EmergencyContact(EmergencyContactBase, table=True):
    __tablename__ = "emergency_contacts"

    id: Optional[int] = Field(default=None, primary_key=True)
    farmer_id: Optional[int] = Field(default=None, foreign_key="user.id", index=True, description="Null for system-wide national contacts")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class EmergencyContactCreate(EmergencyContactBase):
    pass

class EmergencyContactRead(EmergencyContactBase):
    id: int
    farmer_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    is_system_contact: bool = False

class EmergencyContactUpdate(SQLModel):
    name: Optional[str] = None
    category: Optional[str] = None
    phone_number: Optional[str] = None
    alternate_phone: Optional[str] = None
    department_or_village: Optional[str] = None
    is_toll_free: Optional[bool] = None
    availability_hours: Optional[str] = None
    notes: Optional[str] = None

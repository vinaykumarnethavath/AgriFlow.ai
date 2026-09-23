"""
Crop Storage Model
==================
SQLModel definitions for tracking post-harvest produce stored in cold storage,
warehouses (CWC/SWC), and private godowns.
Supports:
- Stored bags and quintals tracking
- Monthly rent calculation and accumulated storage charges
- Warehouse Receipts (e-NWR)
- Expected release dates to sell during price peaks
"""

from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date

class CropStorageBase(SQLModel):
    crop_name: str = Field(index=True, max_length=100)
    variety: Optional[str] = Field(default=None, max_length=100)
    storage_type: str = Field(default="cold_storage", description="cold_storage, warehouse_cwc_swc, private_godown, on_farm_silo, other")
    facility_name: str = Field(max_length=150)
    location: str = Field(max_length=150)
    receipt_number: Optional[str] = Field(default=None, max_length=100, description="Warehouse Receipt / e-NWR number")
    bags_count: int = Field(gt=0, description="Number of bags deposited")
    weight_quintals: float = Field(gt=0, description="Total weight in quintals")
    bag_weight_kg: float = Field(default=50.0, ge=1.0)
    monthly_rent_per_bag: float = Field(default=0.0, ge=0.0, description="Rent per bag per month in ₹")
    deposit_date: date = Field(default_factory=date.today)
    expected_release_date: Optional[date] = Field(default=None)
    actual_release_date: Optional[date] = Field(default=None)
    status: str = Field(default="stored", description="stored, partially_released, fully_released, overdue_alert")
    target_sell_price_per_quintal: Optional[float] = Field(default=None, ge=0)
    notes: Optional[str] = Field(default=None)

class CropStorage(CropStorageBase, table=True):
    __tablename__ = "crop_storages"

    id: Optional[int] = Field(default=None, primary_key=True)
    farmer_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CropStorageCreate(CropStorageBase):
    pass

class CropStorageRead(CropStorageBase):
    id: int
    farmer_id: int
    created_at: datetime
    updated_at: datetime
    days_in_storage: int = 0
    accumulated_rent: float = 0.0
    days_until_release: Optional[int] = None
    is_release_due: bool = False

class CropStorageUpdate(SQLModel):
    crop_name: Optional[str] = None
    variety: Optional[str] = None
    storage_type: Optional[str] = None
    facility_name: Optional[str] = None
    location: Optional[str] = None
    receipt_number: Optional[str] = None
    bags_count: Optional[int] = None
    weight_quintals: Optional[float] = None
    bag_weight_kg: Optional[float] = None
    monthly_rent_per_bag: Optional[float] = None
    deposit_date: Optional[date] = None
    expected_release_date: Optional[date] = None
    actual_release_date: Optional[date] = None
    status: Optional[str] = None
    target_sell_price_per_quintal: Optional[float] = None
    notes: Optional[str] = None

class CropStorageReleaseRequest(SQLModel):
    bags_released: int = Field(gt=0)
    release_date: date = Field(default_factory=date.today)
    selling_price_per_quintal: Optional[float] = None
    notes: Optional[str] = None

class CropStorageSummary(SQLModel):
    total_bags_stored: int
    total_quintals_stored: float
    monthly_rent_commitment: float
    total_accumulated_rent: float
    active_facilities_count: int
    release_due_count: int

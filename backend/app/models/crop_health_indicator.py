"""
Crop Health Indicator Models
=============================
Simple traffic-light health status per crop:
  🟢 Healthy
  🟡 Monitor
  🔴 Issue Detected

Stored per crop, can be updated manually by farmer or
auto-calculated from crop stage + weather conditions.
"""

from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime


class CropHealthStatusBase(SQLModel):
    crop_id: int = Field(foreign_key="crop.id", index=True)
    status: str = Field(default="healthy")  # healthy, monitor, issue
    notes: Optional[str] = None


class CropHealthStatus(CropHealthStatusBase, table=True):
    __tablename__ = "crop_health_status"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CropHealthStatusCreate(SQLModel):
    crop_id: int
    status: str = "healthy"  # healthy, monitor, issue
    notes: Optional[str] = None


class CropHealthStatusRead(CropHealthStatusBase):
    id: int
    user_id: int
    updated_at: datetime


class CropHealthStatusUpdate(SQLModel):
    status: Optional[str] = None  # healthy, monitor, issue
    notes: Optional[str] = None

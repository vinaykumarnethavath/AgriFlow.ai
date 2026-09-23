"""
Farm Calendar Models
====================
Farm activity calendar for planning and tracking:
- Sowing dates
- Fertilizer schedules
- Weeding dates
- Harvest reminders
- Loan repayment reminders
- Custom events
"""

from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime, date


class FarmEventBase(SQLModel):
    title: str
    event_type: str = "custom"  # sowing, fertilizer, weeding, harvest, loan, irrigation, spraying, custom
    event_date: date
    description: Optional[str] = None
    crop_id: Optional[int] = Field(default=None, foreign_key="crop.id")
    crop_name: Optional[str] = None
    reminder_days_before: int = Field(default=1)
    is_completed: bool = Field(default=False)
    color: Optional[str] = None  # hex color for display


class FarmEvent(FarmEventBase, table=True):
    __tablename__ = "farm_event"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class FarmEventCreate(FarmEventBase):
    pass


class FarmEventRead(FarmEventBase):
    id: int
    user_id: int
    created_at: datetime


class FarmEventUpdate(SQLModel):
    title: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[date] = None
    description: Optional[str] = None
    crop_id: Optional[int] = None
    crop_name: Optional[str] = None
    reminder_days_before: Optional[int] = None
    is_completed: Optional[bool] = None
    color: Optional[str] = None

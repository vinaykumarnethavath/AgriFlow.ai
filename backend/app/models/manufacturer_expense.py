from typing import Optional
from datetime import datetime, date
from sqlmodel import Field, SQLModel


class ManufacturerExpense(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    manufacturer_id: int = Field(index=True)
    category: str
    amount: float
    description: Optional[str] = None
    expense_date: date = Field(default_factory=date.today)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ManufacturerExpenseCreate(SQLModel):
    category: str
    amount: float
    description: Optional[str] = None
    expense_date: Optional[date] = None


class ManufacturerExpenseRead(SQLModel):
    id: int
    manufacturer_id: int
    category: str
    amount: float
    description: Optional[str] = None
    expense_date: date
    created_at: datetime

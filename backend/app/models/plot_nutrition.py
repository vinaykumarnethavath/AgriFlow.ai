from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime


# --- Plot Soil Data ---

class PlotSoilDataBase(SQLModel):
    land_record_id: int = Field(foreign_key="landrecord.id", index=True)
    nitrogen: float = 0.0        # kg/ha
    phosphorus: float = 0.0      # kg/ha
    potassium: float = 0.0       # kg/ha
    ph_level: float = 7.0
    organic_carbon: Optional[float] = None  # percentage
    crop_id: Optional[int] = Field(default=None, foreign_key="crop.id")
    last_tested: Optional[datetime] = None
    notes: Optional[str] = None


class PlotSoilData(PlotSoilDataBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PlotSoilDataCreate(SQLModel):
    nitrogen: float = 0.0
    phosphorus: float = 0.0
    potassium: float = 0.0
    ph_level: float = 7.0
    organic_carbon: Optional[float] = None
    notes: Optional[str] = None


class PlotSoilDataRead(PlotSoilDataBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


# --- Fertilizer Application ---

class FertilizerApplicationBase(SQLModel):
    plot_soil_data_id: int = Field(foreign_key="plotsoildata.id", index=True)
    fertilizer_name: str            # e.g. "Urea", "DAP", "MOP"
    quantity: float                 # amount applied
    unit: str = "kg"                # "kg", "liters", "bags"
    application_date: datetime
    application_method: Optional[str] = None  # "Broadcasting", "Fertigation", "Band placement"
    crop_id: Optional[int] = Field(default=None, foreign_key="crop.id")
    notes: Optional[str] = None


class FertilizerApplication(FertilizerApplicationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class FertilizerApplicationCreate(SQLModel):
    fertilizer_name: str
    quantity: float
    unit: str = "kg"
    application_date: datetime
    application_method: Optional[str] = None
    notes: Optional[str] = None


class FertilizerApplicationRead(FertilizerApplicationBase):
    id: int
    user_id: int
    created_at: datetime

"""
Soil Profile & Soil Health Card Model
======================================
Stores comprehensive physical and chemical soil testing parameters
pertaining to farmer land records.
Includes:
- Physical: Soil Type, Texture, Electrical Conductivity (EC)
- Macro Nutrients: Nitrogen (N), Phosphorus (P), Potassium (K)
- Reaction: pH Level, Organic Carbon (%)
- Micro Nutrients: Zinc (Zn), Iron (Fe), Sulphur (S), Boron (B)
- Testing metadata: Testing Lab (KVK / Soil Lab), SHC Number, Sample Date
- Automated rating: Health score (0-100), Status badge (Optimal, Moderate, Deficient)
"""

from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime, date

class SoilProfileBase(SQLModel):
    land_record_id: Optional[int] = Field(default=None, foreign_key="landrecord.id")
    plot_label: str = Field(default="Main Plot", max_length=120)
    soil_type: str = Field(default="clay_loam", description="alluvial, black_regur, red_loam, laterite, clay_loam, sandy_loam, silt_loam")
    shc_number: Optional[str] = Field(default=None, max_length=100, description="Government Soil Health Card (SHC) Number")
    testing_lab: Optional[str] = Field(default="Krishi Vigyan Kendra (KVK)", max_length=150)
    test_date: date = Field(default_factory=date.today)
    
    # Primary Chemical & Organic Metrics
    ph_level: float = Field(default=7.0, ge=3.0, le=11.0, description="Soil pH (6.5-7.5 is neutral/optimal)")
    organic_carbon_percent: float = Field(default=0.55, ge=0.0, le=5.0, description="Organic Carbon % (>0.75 is High)")
    ec_ds_m: Optional[float] = Field(default=0.45, ge=0.0, description="Electrical Conductivity dS/m (<1.0 is Normal)")
    
    # Primary Nutrients (kg/ha)
    nitrogen_kg_ha: float = Field(default=220.0, ge=0.0, description="Available N (<280 Low, 280-560 Med, >560 High)")
    phosphorus_kg_ha: float = Field(default=16.0, ge=0.0, description="Available P (<10 Low, 10-25 Med, >25 High)")
    potassium_kg_ha: float = Field(default=240.0, ge=0.0, description="Available K (<110 Low, 110-280 Med, >280 High)")
    
    # Secondary & Micronutrients (ppm)
    sulphur_ppm: Optional[float] = Field(default=12.0, ge=0.0, description="Sulphur ppm (<10 Low)")
    zinc_ppm: Optional[float] = Field(default=0.75, ge=0.0, description="Zinc ppm (<0.6 Low)")
    iron_ppm: Optional[float] = Field(default=5.2, ge=0.0, description="Iron ppm (<4.5 Low)")
    boron_ppm: Optional[float] = Field(default=0.55, ge=0.0, description="Boron ppm (<0.5 Low)")
    
    notes: Optional[str] = Field(default=None)

class SoilProfile(SoilProfileBase, table=True):
    __tablename__ = "soil_profiles"

    id: Optional[int] = Field(default=None, primary_key=True)
    farmer_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SoilProfileCreate(SoilProfileBase):
    pass

class SoilProfileRead(SoilProfileBase):
    id: int
    farmer_id: int
    created_at: datetime
    updated_at: datetime
    health_score: int = 75
    health_status: str = "optimal"  # optimal, moderate, needs_attention
    ph_status: str = "neutral"      # acidic, neutral, alkaline
    nitrogen_status: str = "medium" # low, medium, high
    phosphorus_status: str = "medium"
    potassium_status: str = "medium"
    is_test_overdue: bool = False

class SoilProfileUpdate(SQLModel):
    land_record_id: Optional[int] = None
    plot_label: Optional[str] = None
    soil_type: Optional[str] = None
    shc_number: Optional[str] = None
    testing_lab: Optional[str] = None
    test_date: Optional[date] = None
    ph_level: Optional[float] = None
    organic_carbon_percent: Optional[float] = None
    ec_ds_m: Optional[float] = None
    nitrogen_kg_ha: Optional[float] = None
    phosphorus_kg_ha: Optional[float] = None
    potassium_kg_ha: Optional[float] = None
    sulphur_ppm: Optional[float] = None
    zinc_ppm: Optional[float] = None
    iron_ppm: Optional[float] = None
    boron_ppm: Optional[float] = None
    notes: Optional[str] = None

class SoilHealthSummary(SQLModel):
    total_profiles: int
    dominant_soil_type: str
    avg_health_score: int
    overall_fertility: str          # Optimal, Moderate, Low
    avg_ph: float
    avg_organic_carbon: float
    avg_n: float
    avg_p: float
    avg_k: float
    overdue_tests_count: int
    key_recommendation: str

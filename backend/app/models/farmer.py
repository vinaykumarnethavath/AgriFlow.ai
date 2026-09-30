from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

class LandRecordBase(SQLModel):
    serial_number: str
    area: float

class LandRecord(LandRecordBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    farmer_profile_id: int = Field(foreign_key="farmerprofile.id")
    farmer_profile: "FarmerProfile" = Relationship(back_populates="land_records")

class FarmerProfileBase(SQLModel):
    farmer_id: str = Field(unique=True, index=True)
    father_husband_name: str
    phone_number: Optional[str] = None
    gender: Optional[str] = None  # "male" or "female"
    relation_type: Optional[str] = None  # "son_of" or "wife_of"
    
    # Detailed Address
    house_no: Optional[str] = None
    street: Optional[str] = None
    village: Optional[str] = None
    mandal: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: str = Field(default="India")
    pincode: Optional[str] = None
    
    total_area: float
    aadhaar_last_4: str
    bank_name: str
    account_number: str
    ifsc_code: str
    profile_picture_url: Optional[str] = None
    
    # Additional Farmer Details & Preferences
    upi_id: Optional[str] = None
    secondary_phone: Optional[str] = None
    irrigation_type: Optional[str] = None
    primary_crop: Optional[str] = None
    preferred_language: Optional[str] = None
    notification_preferences: Optional[str] = None

class FarmerProfile(FarmerProfileBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(unique=True, foreign_key="user.id")
    user: Optional["User"] = Relationship(back_populates="farmer_profile")
    land_records: List[LandRecord] = Relationship(back_populates="farmer_profile")

class FarmerProfileCreate(FarmerProfileBase):
    full_name: Optional[str] = None
    land_records: Optional[List[LandRecordBase]] = None

class FarmerProfileRead(FarmerProfileBase):
    id: int
    user_id: int
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    land_records: List[LandRecordBase] = []


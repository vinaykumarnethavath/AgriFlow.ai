from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
# from .user import User  # Removed circular import

# 1. Raw Material Purchase from Farmer
class ManufacturerPurchase(SQLModel, table=True):
    __tablename__ = "manufacturer_purchases"
    id: Optional[int] = Field(default=None, primary_key=True)
    manufacturer_id: int = Field(foreign_key="user.id")
    farmer_id: Optional[int] = Field(foreign_key="user.id", default=None) # Optional if buying from unknown source
    farmer_name: str 
    crop_name: str # e.g. Wheat, Sugarcane
    quantity: float # in kg/tons
    unit: str = "kg"
    price_per_unit: float
    total_cost: float
    transport_cost: float = 0.0
    quality_grade: Optional[str] = None # A, B, C
    payment_mode: Optional[str] = Field(default="Cash") # Cash, UPI, Bank Transfer
    batch_id: str # Created automatically -> M-PUR-{id}
    date: datetime = Field(default_factory=datetime.utcnow)

# 2. Production / Processing Batch
class ProductionBatch(SQLModel, table=True):
    __tablename__ = "production_batches"
    id: Optional[int] = Field(default=None, primary_key=True)
    manufacturer_id: int = Field(foreign_key="user.id")
    
    # Input
    input_product_id: int = Field(foreign_key="product.id") # Raw Material from Inventory
    input_qty: float
    
    # Output
    output_product_name: str # e.g. Wheat Flour
    output_qty: float 
    output_unit: str = "kg"
    
    processing_cost: float
    waste_qty: float = 0.0
    
    # Metrics
    efficiency: float # output / input * 100
    
    batch_number: str # Created automatically -> M-PROD-{id}
    date: datetime = Field(default_factory=datetime.utcnow)

# 3. Sales to Market/Shops
class ManufacturerSale(SQLModel, table=True):
    __tablename__ = "manufacturer_sales"
    id: Optional[int] = Field(default=None, primary_key=True)
    manufacturer_id: int = Field(foreign_key="user.id")
    
    buyer_type: str # "shop", "customer", "distributor"
    buyer_id: Optional[int] = Field(foreign_key="user.id", default=None)
    buyer_name: str
    
    product_id: int = Field(foreign_key="product.id") # Finished Good from Inventory
    quantity: float
    selling_price: float # Per unit
    discount: float = 0.0
    total_amount: float
    
    payment_mode: str = "cash"
    invoice_id: str # M-INV-{id}
    delivery_status: str = Field(default="pending")  # pending / dispatched / delivered
    date: datetime = Field(default_factory=datetime.utcnow)

# Pydantic Models for API
class ManufacturerPurchaseCreate(SQLModel):
    farmer_id: Optional[int] = None
    farmer_name: str
    crop_name: str
    quantity: float
    unit: str = "kg"
    price_per_unit: float
    transport_cost: float = 0.0
    quality_grade: Optional[str] = None
    payment_mode: Optional[str] = "Cash"

class ProductionBatchCreate(SQLModel):
    input_product_id: int
    input_qty: float
    output_product_name: str
    output_qty: float
    output_unit: str = "kg"
    processing_cost: float

class ManufacturerSaleCreate(SQLModel):
    buyer_type: str
    buyer_id: Optional[int] = None
    buyer_name: str
    product_id: int
    quantity: float
    selling_price: float
    discount: float = 0.0
    payment_mode: str = "cash"

# --- Mill Profile ---
class MillProfileBase(SQLModel):
    mill_name: str
    license_number: str
    mill_id: Optional[str] = None
    father_name: str
    relation_type: Optional[str] = "S/O"  # "S/O", "W/O", "D/O"
    owner_name: Optional[str] = None
    contact_number: Optional[str] = None
    phone_number: Optional[str] = None
    
    # Personal ID Details
    aadhaar_number: Optional[str] = None
    pan_number: Optional[str] = None
    hide_personal_details: bool = Field(default=False)
    
    # Detailed Address
    house_no: Optional[str] = None
    street: Optional[str] = None
    village: Optional[str] = None
    mandal: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    country: str = Field(default="India")
    pincode: Optional[str] = None
    
    location_text: Optional[str] = None # Physical location description
    
    # Permanent Address
    permanent_address: Optional[str] = None
    perm_house_no: Optional[str] = None
    perm_street: Optional[str] = None
    perm_village: Optional[str] = None
    perm_mandal: Optional[str] = None
    perm_district: Optional[str] = None
    perm_state: Optional[str] = None
    perm_pincode: Optional[str] = None
    
    bank_name: str
    account_number: str
    ifsc_code: str
    profile_picture_url: Optional[str] = None

    # Mill Marketplace Attributes
    mill_type: Optional[str] = Field(default="Rice Mill")
    crops_accepted: Optional[str] = Field(default="Paddy, Rice, Wheat")
    price_offered_text: Optional[str] = Field(default="₹2,200 - ₹2,500/Quintal")
    daily_capacity: Optional[str] = Field(default="100 Tons/Day")
    is_verified: bool = Field(default=True)
    rating: float = Field(default=4.8)

class MillProfile(MillProfileBase, table=True):
    __tablename__ = "mill_profiles"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(unique=True, foreign_key="user.id")
    user: Optional["User"] = Relationship(back_populates="mill_profile")
    
class MillProfileCreate(MillProfileBase):
    full_name: Optional[str] = None

class MillProfileRead(MillProfileBase):
    id: int
    user_id: int
    full_name: Optional[str] = None
    phone_number: Optional[str] = None


# --- Farmer-to-Mill Procurement & Direct Supply Requests ---
class MillProcurementRequestBase(SQLModel):
    mill_id: int = Field(index=True)
    crop_id: Optional[int] = Field(default=None, foreign_key="crop.id")
    crop_name: str
    quantity: float
    unit: str = "quintal"  # quintal, kg, ton
    expected_price_per_unit: float
    quality_grade: Optional[str] = "Grade A"  # Grade A, Grade B, Grade C, FAQ
    moisture_content: Optional[float] = None
    harvest_date: Optional[str] = None
    farmer_name: str
    farmer_phone: str
    farmer_location: Optional[str] = None
    notes: Optional[str] = None
    # Delivery Slot fields (optional, for gate pass booking)
    delivery_slot_date: Optional[str] = None  # YYYY-MM-DD
    delivery_slot_time: Optional[str] = None  # e.g., "10:00 AM - 12:00 PM"
    vehicle_type: Optional[str] = None  # Tractor, Truck, Bullock Cart, Auto
    vehicle_number: Optional[str] = None
    token_number: Optional[str] = None  # Generated on mill approval
    status: str = Field(default="pending", index=True)  # pending, accepted, rejected, completed
    offered_price_per_unit: Optional[float] = None
    rejection_reason: Optional[str] = None

class MillProcurementRequest(MillProcurementRequestBase, table=True):
    __tablename__ = "mill_procurement_requests"
    id: Optional[int] = Field(default=None, primary_key=True)
    farmer_id: int = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MillProcurementRequestCreate(SQLModel):
    mill_id: int
    crop_id: Optional[int] = None
    crop_name: str
    quantity: float
    unit: str = "quintal"
    expected_price_per_unit: float
    quality_grade: Optional[str] = "Grade A"
    moisture_content: Optional[float] = None
    harvest_date: Optional[str] = None
    notes: Optional[str] = None
    # Delivery Slot fields
    delivery_slot_date: Optional[str] = None
    delivery_slot_time: Optional[str] = None
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None

class MillProcurementRequestUpdate(SQLModel):
    status: Optional[str] = None
    offered_price_per_unit: Optional[float] = None
    rejection_reason: Optional[str] = None
    notes: Optional[str] = None
    token_number: Optional[str] = None
    delivery_slot_date: Optional[str] = None
    delivery_slot_time: Optional[str] = None

class MillProcurementRequestRead(MillProcurementRequestBase):
    id: int
    farmer_id: int
    created_at: datetime
    updated_at: datetime
    mill_name: Optional[str] = None
    mill_phone: Optional[str] = None
    mill_location: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# Feature A: Moisture & Fair Deduction Calculator
# ─────────────────────────────────────────────────────────────────────────────

# Standard moisture levels by crop (industry standard in India)
STANDARD_MOISTURE = {
    "paddy": 14.0, "rice": 14.0, "sona masoori": 14.0, "basmati": 14.0,
    "wheat": 12.0, "maize": 14.0, "corn": 14.0,
    "soybean": 12.0, "groundnut": 8.0, "mustard": 8.0, "sunflower": 9.0,
    "cotton": 8.0, "kapas": 8.0,
    "toor": 12.0, "chana": 12.0, "moong": 12.0, "urad": 12.0,
    "jowar": 12.0, "bajra": 12.0, "ragi": 12.0,
    "sugarcane": 70.0,
}

class MoistureDeductionLog(SQLModel, table=True):
    """Audit trail for transparent moisture/quality deductions at the mill gate."""
    __tablename__ = "moisture_deduction_logs"
    id: Optional[int] = Field(default=None, primary_key=True)
    purchase_id: Optional[int] = Field(default=None, foreign_key="manufacturer_purchases.id")
    procurement_request_id: Optional[int] = Field(default=None, foreign_key="mill_procurement_requests.id")
    crop_name: str
    original_weight: float
    unit: str = "quintal"
    actual_moisture: float  # Measured moisture %
    standard_moisture: float  # Industry standard moisture %
    moisture_excess: float  # actual - standard (can be negative if drier)
    weight_deduction: float  # Weight lost due to excess moisture
    adjusted_weight: float  # Weight after moisture deduction
    foreign_matter_pct: float = 0.0
    foreign_matter_deduction: float = 0.0
    damaged_grain_pct: float = 0.0
    damaged_grain_deduction: float = 0.0
    final_net_weight: float  # Final weight after all deductions
    price_per_unit: float
    total_value: float  # final_net_weight × price_per_unit
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: int = Field(foreign_key="user.id")

class MoistureCalculatorRequest(SQLModel):
    """Input schema for the moisture deduction calculator API."""
    crop_name: str
    original_weight: float
    unit: str = "quintal"
    actual_moisture: float
    foreign_matter_pct: float = 0.0
    damaged_grain_pct: float = 0.0
    price_per_unit: float
    purchase_id: Optional[int] = None
    procurement_request_id: Optional[int] = None
    save_log: bool = False  # If True, persist the calculation as an audit log

class MoistureCalculatorResponse(SQLModel):
    """Output schema returned by the moisture deduction calculator."""
    crop_name: str
    standard_moisture: float
    actual_moisture: float
    original_weight: float
    unit: str
    moisture_excess: float
    weight_deduction_moisture: float
    weight_after_moisture: float
    foreign_matter_pct: float
    foreign_matter_deduction: float
    damaged_grain_pct: float
    damaged_grain_deduction: float
    final_net_weight: float
    price_per_unit: float
    original_value: float
    adjusted_value: float
    total_deduction_value: float
    deduction_percentage: float
    is_fair: bool  # True if deduction matches standard formula
    log_id: Optional[int] = None  # ID if saved


# ─────────────────────────────────────────────────────────────────────────────
# Feature C: By-Product Batch Tracking
# ─────────────────────────────────────────────────────────────────────────────

class ByProduct(SQLModel, table=True):
    """Tracks by-products from a production batch (e.g., bran, husk, broken rice)."""
    __tablename__ = "by_products"
    id: Optional[int] = Field(default=None, primary_key=True)
    batch_id: int = Field(foreign_key="production_batches.id", index=True)
    manufacturer_id: int = Field(foreign_key="user.id")
    name: str  # e.g., Rice Bran, Rice Husk, Broken Rice, Molasses
    quantity: float
    unit: str = "kg"
    estimated_value_per_unit: float = 0.0
    total_value: float = 0.0
    sold_to: Optional[str] = None
    sold_price: Optional[float] = None
    sold_date: Optional[datetime] = None
    status: str = Field(default="in_stock")  # in_stock, sold, disposed
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ByProductCreate(SQLModel):
    batch_id: int
    name: str
    quantity: float
    unit: str = "kg"
    estimated_value_per_unit: float = 0.0

class ByProductUpdate(SQLModel):
    sold_to: Optional[str] = None
    sold_price: Optional[float] = None
    status: Optional[str] = None

class ByProductRead(SQLModel):
    id: int
    batch_id: int
    manufacturer_id: int
    name: str
    quantity: float
    unit: str
    estimated_value_per_unit: float
    total_value: float
    sold_to: Optional[str] = None
    sold_price: Optional[float] = None
    sold_date: Optional[datetime] = None
    status: str
    created_at: datetime


# ─────────────────────────────────────────────────────────────────────────────
# Feature D: Digital Weighment Slip (Parchi)
# ─────────────────────────────────────────────────────────────────────────────

class WeighmentSlip(SQLModel, table=True):
    """Digital weighbridge slip that replaces paper parchi at mill gates."""
    __tablename__ = "weighment_slips"
    id: Optional[int] = Field(default=None, primary_key=True)
    purchase_id: int = Field(foreign_key="manufacturer_purchases.id", index=True)
    slip_number: str = Field(unique=True)  # WS-XXXXXX

    # Weights (in same unit as purchase)
    gross_weight: float  # Vehicle + produce
    tare_weight: float  # Empty vehicle
    net_weight: float  # Gross - Tare

    # Quality parameters
    moisture_pct: float = 0.0
    foreign_matter_pct: float = 0.0
    damaged_grain_pct: float = 0.0
    quality_grade: str = "FAQ"  # FAQ, Grade A, Grade B, Grade C

    # Deductions
    moisture_deduction_kg: float = 0.0
    foreign_matter_deduction_kg: float = 0.0
    final_net_weight: float  # net_weight - all deductions

    # Pricing
    price_per_unit: float
    total_amount: float  # final_net_weight × price_per_unit
    msp_price: Optional[float] = None  # Government MSP for comparison
    msp_comparison: Optional[str] = None  # "Above MSP by ₹200"

    # Payment
    payment_mode: str = "bank_transfer"
    payment_status: str = "pending"  # pending, paid, partial
    transaction_ref: Optional[str] = None

    # Metadata
    farmer_name: str
    farmer_phone: Optional[str] = None
    crop_name: str
    unit: str = "quintal"
    vehicle_number: Optional[str] = None
    mill_name: str
    mill_location: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: int = Field(foreign_key="user.id")

class WeighmentSlipCreate(SQLModel):
    purchase_id: int
    gross_weight: float
    tare_weight: float
    moisture_pct: float = 0.0
    foreign_matter_pct: float = 0.0
    damaged_grain_pct: float = 0.0
    quality_grade: str = "FAQ"
    price_per_unit: float
    msp_price: Optional[float] = None
    payment_mode: str = "bank_transfer"
    vehicle_number: Optional[str] = None

class WeighmentSlipRead(SQLModel):
    id: int
    purchase_id: int
    slip_number: str
    gross_weight: float
    tare_weight: float
    net_weight: float
    moisture_pct: float
    foreign_matter_pct: float
    damaged_grain_pct: float
    quality_grade: str
    moisture_deduction_kg: float
    foreign_matter_deduction_kg: float
    final_net_weight: float
    price_per_unit: float
    total_amount: float
    msp_price: Optional[float] = None
    msp_comparison: Optional[str] = None
    payment_mode: str
    payment_status: str
    transaction_ref: Optional[str] = None
    farmer_name: str
    farmer_phone: Optional[str] = None
    crop_name: str
    unit: str
    vehicle_number: Optional[str] = None
    mill_name: str
    mill_location: Optional[str] = None
    created_at: datetime


# ─────────────────────────────────────────────────────────────────────────────
# Feature E: Small-Farmer Load Pooling (Collective Selling)
# ─────────────────────────────────────────────────────────────────────────────

class FarmerLoadPool(SQLModel, table=True):
    """A pool where small farmers combine produce to meet mill minimum order quantities."""
    __tablename__ = "farmer_load_pools"
    id: Optional[int] = Field(default=None, primary_key=True)
    creator_id: int = Field(foreign_key="user.id", index=True)
    crop_name: str
    target_quantity: float
    current_quantity: float = 0.0
    unit: str = "quintal"
    village: str
    mandal: Optional[str] = None
    district: str
    state: str
    delivery_date: str  # YYYY-MM-DD
    preferred_mill_id: Optional[int] = None
    preferred_mill_name: Optional[str] = None
    procurement_request_id: Optional[int] = Field(
        default=None, foreign_key="mill_procurement_requests.id"
    )
    status: str = Field(default="open")  # open, full, submitted, completed, cancelled
    min_quality_grade: str = "FAQ"
    expected_price_per_unit: float = 0.0
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FarmerLoadPoolMember(SQLModel, table=True):
    """Individual farmer contribution to a load pool."""
    __tablename__ = "farmer_load_pool_members"
    id: Optional[int] = Field(default=None, primary_key=True)
    pool_id: int = Field(foreign_key="farmer_load_pools.id", index=True)
    farmer_id: int = Field(foreign_key="user.id", index=True)
    farmer_name: str
    farmer_phone: Optional[str] = None
    quantity: float
    unit: str = "quintal"
    quality_grade: Optional[str] = "FAQ"
    joined_at: datetime = Field(default_factory=datetime.utcnow)

class FarmerLoadPoolCreate(SQLModel):
    crop_name: str
    target_quantity: float
    unit: str = "quintal"
    village: str
    mandal: Optional[str] = None
    district: str
    state: str
    delivery_date: str
    preferred_mill_id: Optional[int] = None
    min_quality_grade: str = "FAQ"
    expected_price_per_unit: float = 0.0
    notes: Optional[str] = None
    my_quantity: float  # Creator's own contribution

class FarmerLoadPoolJoin(SQLModel):
    quantity: float
    unit: str = "quintal"
    quality_grade: Optional[str] = "FAQ"

class FarmerLoadPoolRead(SQLModel):
    id: int
    creator_id: int
    creator_name: Optional[str] = None
    crop_name: str
    target_quantity: float
    current_quantity: float
    unit: str
    village: str
    mandal: Optional[str] = None
    district: str
    state: str
    delivery_date: str
    preferred_mill_id: Optional[int] = None
    preferred_mill_name: Optional[str] = None
    status: str
    min_quality_grade: str
    expected_price_per_unit: float
    notes: Optional[str] = None
    member_count: int = 0
    fill_percentage: float = 0.0
    members: List["FarmerLoadPoolMemberRead"] = []
    created_at: datetime
    updated_at: datetime

class FarmerLoadPoolMemberRead(SQLModel):
    id: int
    pool_id: int
    farmer_id: int
    farmer_name: str
    farmer_phone: Optional[str] = None
    quantity: float
    unit: str
    quality_grade: Optional[str] = None
    joined_at: datetime

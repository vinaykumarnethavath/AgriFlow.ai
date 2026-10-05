"""
Seed script to populate the AgriChain database with comprehensive dummy data.
Creates 4 user accounts (farmer, shop, manufacturer, customer) for:
  jonsnowjonny15@gmail.com  |  password: Test@1234

Covers ALL features:
  ✅ Users & Profiles (Farmer, Shop, Manufacturer, Customer)
  ✅ Crops + Expenses + Harvests + Sales
  ✅ Shop Inventory + Orders + Accounting
  ✅ Manufacturer Purchases + Production + Sales
  ✅ Customer Cart + Orders
  ✅ Plot Nutrition (Soil Data + Fertilizer Applications)
  ✅ Crop Health Indicators (traffic-light per crop)
  ✅ Farm Calendar (events across all types)
  ✅ Credit & Loans + Repayments
  ✅ Crop Insurance (PMFBY + claims)
  ✅ Crop Storage (cold storage, warehouses)
  ✅ Soil Profiles (Soil Health Cards)
  ✅ Emergency Contacts (national + custom)

Run:  python seed_data.py
"""

import asyncio
import os, sys

# Ensure imports resolve from repo root
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta, date
import json

# ── App imports ──────────────────────────────────────────────────────
from app.utils import get_password_hash
from app.models.user import User, UserRole
from app.models.farmer import FarmerProfile, LandRecord
from app.models.shop import ShopProfile
from app.models.manufacturer import MillProfile, ManufacturerPurchase, ProductionBatch, ManufacturerSale
from app.models.customer import CustomerProfile, Cart, CustomerOrder, CustomerOrderItem
from app.models.crop import Crop, CropExpense, CropHarvest
from app.models.trade import Product, ShopOrder, ShopOrderItem, TraceabilityEvent
from app.models.expense import ShopExpense
from app.models.shop_accounting import ShopAccountingExpense
from app.models.manufacturer_expense import ManufacturerExpense

# Latest feature models
from app.models.plot_nutrition import PlotSoilData, FertilizerApplication
from app.models.crop_health_indicator import CropHealthStatus
from app.models.farm_calendar import FarmEvent
from app.models.credit_loan import CreditLoan, LoanRepayment
from app.models.crop_insurance import CropInsurance
from app.models.crop_storage import CropStorage
from app.models.soil_profile import SoilProfile
from app.models.emergency_contact import EmergencyContact

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./agrichain.db")
if DATABASE_URL.startswith("sqlite"):
    engine = create_async_engine(DATABASE_URL, echo=False, future=True, connect_args={"check_same_thread": False})
else:
    engine = create_async_engine(DATABASE_URL, echo=False, future=True)

EMAIL = "jonsnowjonny15@gmail.com"
PASSWORD = "Test@1234"
PHONE = "9999900000"

now = datetime.utcnow()
today = date.today()


async def seed():
    from sqlmodel import SQLModel
    # Create all tables first (in case running standalone without FastAPI server)
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    print("[OK] Database tables created / verified.")

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # ──────────────────────────────────────────────────────────────
        # 0.  Check if seed data already exists
        # ──────────────────────────────────────────────────────────────
        existing = await session.exec(select(User).where(User.email == EMAIL))
        if existing.first():
            print("[WARN] Seed data already exists for this email. Skipping.")
            return

        hashed_pwd = get_password_hash(PASSWORD)

        # ──────────────────────────────────────────────────────────────
        # 1.  Create 4 user accounts (one per role)
        # ──────────────────────────────────────────────────────────────
        farmer = User(email=EMAIL, phone_number="9999900001", full_name="Jon Snow (Farmer)", role="farmer", hashed_password=hashed_pwd)
        shop   = User(email=EMAIL, phone_number="9999900002", full_name="Jon Snow (Shop)", role="shop", hashed_password=hashed_pwd)
        mfr    = User(email=EMAIL, phone_number="9999900003", full_name="Jon Snow (Manufacturer)", role="manufacturer", hashed_password=hashed_pwd)
        cust   = User(email=EMAIL, phone_number="9999900004", full_name="Jon Snow (Customer)", role="customer", hashed_password=hashed_pwd)

        session.add_all([farmer, shop, mfr, cust])
        await session.flush()  # IDs are now available

        print(f"[OK] Users created -- Farmer:{farmer.id}  Shop:{shop.id}  Mfr:{mfr.id}  Cust:{cust.id}")

        # ──────────────────────────────────────────────────────────────
        # 2.  Farmer Profile + Land Records
        # ──────────────────────────────────────────────────────────────
        farmer_profile = FarmerProfile(
            user_id=farmer.id,
            farmer_id="FRM-JS-001",
            father_husband_name="Ned Stark",
            gender="male",
            relation_type="son_of",
            house_no="12",
            street="Winter Lane",
            village="Winterfell",
            mandal="Karnal",
            district="Karnal",
            state="Haryana",
            pincode="132001",
            total_area=12.5,
            aadhaar_last_4="1234",
            bank_name="State Bank of India",
            account_number="12345678901234",
            ifsc_code="SBIN0001234",
            phone_number="9999900001",
            upi_id="jonsnow@sbi",
            irrigation_type="Canal + Tubewell",
            primary_crop="Wheat",
            preferred_language="hi",
        )
        session.add(farmer_profile)
        await session.flush()

        land1 = LandRecord(farmer_profile_id=farmer_profile.id, serial_number="KNL-101", area=7.5)
        land2 = LandRecord(farmer_profile_id=farmer_profile.id, serial_number="KNL-102", area=5.0)
        session.add_all([land1, land2])
        await session.flush()

        # ──────────────────────────────────────────────────────────────
        # 3.  Crops + Expenses + Harvests   (owned by farmer)
        # ──────────────────────────────────────────────────────────────
        crop1 = Crop(
            user_id=farmer.id, name="Wheat", area=5.0, season="Rabi", variety="PBW 343",
            sowing_date=now - timedelta(days=120), expected_harvest_date=now + timedelta(days=20),
            status="Growing", crop_type="Cereal",
            notes="Main winter crop", total_cost=22000, total_revenue=0, net_profit=0,
        )
        crop2 = Crop(
            user_id=farmer.id, name="Rice (Basmati)", area=4.0, season="Kharif", variety="Pusa 1121",
            sowing_date=now - timedelta(days=200), expected_harvest_date=now - timedelta(days=30),
            actual_harvest_date=now - timedelta(days=25),
            status="Harvested", crop_type="Cereal",
            actual_yield=32.0, selling_price_per_unit=3200, total_revenue=102400,
            total_cost=45000, net_profit=57400,
        )
        crop3 = Crop(
            user_id=farmer.id, name="Tomato", area=1.5, season="Kharif", variety="Hybrid",
            sowing_date=now - timedelta(days=90), expected_harvest_date=now + timedelta(days=10),
            status="Growing", crop_type="Vegetable",
            total_cost=8500, total_revenue=0, net_profit=0,
        )
        crop4 = Crop(
            user_id=farmer.id, name="Sugarcane", area=3.0, season="Year-round", variety="Co-0238",
            sowing_date=now - timedelta(days=300), expected_harvest_date=now - timedelta(days=60),
            actual_harvest_date=now - timedelta(days=55),
            status="Sold", crop_type="Commercial",
            actual_yield=150.0, selling_price_per_unit=350, total_revenue=52500,
            total_cost=30000, net_profit=22500,
        )
        session.add_all([crop1, crop2, crop3, crop4])
        await session.flush()

        # Expenses for crop1 (Wheat)
        expenses_wheat = [
            CropExpense(crop_id=crop1.id, category="Input", type="Seed", quantity=40, unit="kg",
                        unit_cost=60, total_cost=2400, date=now - timedelta(days=118),
                        payment_mode="cash", stage="Sowing"),
            CropExpense(crop_id=crop1.id, category="Input", type="DAP Fertilizer", quantity=100, unit="kg",
                        unit_cost=32, total_cost=3200, date=now - timedelta(days=100),
                        payment_mode="digital", stage="Sowing"),
            CropExpense(crop_id=crop1.id, category="Input", type="Urea", quantity=100, unit="kg",
                        unit_cost=26, total_cost=2600, date=now - timedelta(days=60),
                        payment_mode="cash", stage="Watering"),
            CropExpense(crop_id=crop1.id, category="Labor", type="Sowing Labor", quantity=3, unit="days",
                        unit_cost=500, total_cost=1500, date=now - timedelta(days=115),
                        payment_mode="cash", stage="Sowing", duration=3),
            CropExpense(crop_id=crop1.id, category="Irrigation", type="Motor + Canal", quantity=1, unit="hours",
                        unit_cost=4000, total_cost=4000, date=now - timedelta(days=80),
                        payment_mode="digital", stage="Watering"),
            CropExpense(crop_id=crop1.id, category="Input", type="Pesticide", quantity=2, unit="liter",
                        unit_cost=800, total_cost=1600, date=now - timedelta(days=40),
                        payment_mode="cash", stage="Flowering"),
            # Additional fertilizer expense for Wheat (MOP/Potash) — syncs with plot nutrition
            CropExpense(crop_id=crop1.id, category="Fertilizer", type="MOP (Muriate of Potash)", quantity=50, unit="kg",
                        unit_cost=18, total_cost=900, date=now - timedelta(days=75),
                        payment_mode="cash", stage="Watering",
                        notes="Potassium top dressing for root strength"),
        ]
        session.add_all(expenses_wheat)

        # Expenses for crop2 (Rice)
        expenses_rice = [
            CropExpense(crop_id=crop2.id, category="Input", type="Seed", quantity=30, unit="kg",
                        unit_cost=120, total_cost=3600, date=now - timedelta(days=198),
                        payment_mode="cash", stage="Sowing"),
            CropExpense(crop_id=crop2.id, category="Labor", type="Transplanting", quantity=8, unit="days",
                        unit_cost=600, total_cost=4800, date=now - timedelta(days=180),
                        payment_mode="cash", stage="Sowing", duration=8),
            CropExpense(crop_id=crop2.id, category="Input", type="NPK Fertilizer", quantity=150, unit="kg",
                        unit_cost=28, total_cost=4200, date=now - timedelta(days=150),
                        payment_mode="digital", stage="Watering"),
            CropExpense(crop_id=crop2.id, category="Machinery", type="Harvester", quantity=1, unit="hours",
                        unit_cost=5000, total_cost=5000, date=now - timedelta(days=28),
                        payment_mode="digital", stage="Harvesting"),
            # Zinc sulphate micronutrient spray for Rice — syncs with plot nutrition
            CropExpense(crop_id=crop2.id, category="Fertilizer", type="Zinc Sulphate", quantity=5, unit="kg",
                        unit_cost=90, total_cost=450, date=now - timedelta(days=140),
                        payment_mode="cash", stage="Watering",
                        notes="Foliar spray for zinc deficiency correction"),
        ]
        session.add_all(expenses_rice)

        # Expenses for crop3 (Tomato)
        expenses_tomato = [
            CropExpense(crop_id=crop3.id, category="Input", type="Seed", quantity=0.1, unit="kg",
                        unit_cost=3500, total_cost=350, date=now - timedelta(days=88),
                        payment_mode="cash", stage="Sowing"),
            CropExpense(crop_id=crop3.id, category="Fertilizer", type="Vermicompost", quantity=200, unit="kg",
                        unit_cost=8, total_cost=1600, date=now - timedelta(days=85),
                        payment_mode="cash", stage="Sowing",
                        notes="Organic base application before transplanting"),
            CropExpense(crop_id=crop3.id, category="Fertilizer", type="19:19:19 NPK", quantity=25, unit="kg",
                        unit_cost=120, total_cost=3000, date=now - timedelta(days=50),
                        payment_mode="digital", stage="Flowering",
                        notes="Fertigation through drip"),
            CropExpense(crop_id=crop3.id, category="Input", type="Fungicide (Mancozeb)", quantity=1, unit="liter",
                        unit_cost=650, total_cost=650, date=now - timedelta(days=30),
                        payment_mode="cash", stage="Flowering"),
        ]
        session.add_all(expenses_tomato)

        # Harvest records for crop2 (Rice)
        harvest1 = CropHarvest(
            crop_id=crop2.id, date=now - timedelta(days=28), stage="First Picking",
            quantity=20, unit="Quintals", quality="Grade A",
            selling_price_per_unit=3200, total_revenue=64000,
            buyer_type="Market", sold_to="Karnal Grain Market",
        )
        harvest2 = CropHarvest(
            crop_id=crop2.id, date=now - timedelta(days=25), stage="Final Harvest",
            quantity=12, unit="Quintals", quality="Grade A",
            selling_price_per_unit=3200, total_revenue=38400,
            buyer_type="Private", sold_to="Agarwal Traders",
        )
        session.add_all([harvest1, harvest2])
        await session.flush()

        # ──────────────────────────────────────────────────────────────
        # 4.  Shop Profile + Products (Inventory)
        # ──────────────────────────────────────────────────────────────
        shop_profile = ShopProfile(
            user_id=shop.id,
            shop_name="Snow Agri Mart",
            license_number="AGR-2024-8832",
            shop_id="SHOP-JS-001",
            father_name="Ned Stark",
            owner_name="Jon Snow",
            contact_number="9999900002",
            shop_address="Main Road, Karnal",
            district="Karnal",
            state="Haryana",
            pincode="132001",
            bank_name="Punjab National Bank",
            account_number="22334455667788",
            ifsc_code="PUNB0001234",
        )
        session.add(shop_profile)

        # Products in shop inventory
        prod1 = Product(
            user_id=shop.id, name="NPK 20-20-20 Fertilizer", short_name="NPK 20",
            category="fertilizer", brand="IFFCO", manufacturer="Indian Farmers Fertiliser Cooperative",
            price=680, cost_price=580, quantity=120, unit="bag", quantity_per_unit=50,
            measure_unit="kg", batch_number="SHP-B001",
            description="Balanced NPK fertilizer for all crops",
            low_stock_threshold=20, status="active",
        )
        prod2 = Product(
            user_id=shop.id, name="Urea 46-0-0", short_name="Urea",
            category="fertilizer", brand="NFCL", manufacturer="Nagarjuna Fertilizers",
            price=280, cost_price=240, quantity=200, unit="bag", quantity_per_unit=50,
            measure_unit="kg", batch_number="SHP-B002",
            description="High-nitrogen fertilizer", low_stock_threshold=30, status="active",
        )
        prod3 = Product(
            user_id=shop.id, name="Imidacloprid 17.8% SL", short_name="Imida",
            category="pesticide", brand="Bayer", manufacturer="Bayer CropScience",
            price=520, cost_price=420, quantity=80, unit="bottle", quantity_per_unit=1,
            measure_unit="L", batch_number="SHP-B003",
            description="Systemic insecticide for sucking pests",
            manufacture_date=now - timedelta(days=60),
            expiry_date=now + timedelta(days=700),
            low_stock_threshold=15, status="active",
        )
        prod4 = Product(
            user_id=shop.id, name="Hybrid Tomato Seeds", short_name="Tomato Seed",
            category="seeds", brand="Syngenta", manufacturer="Syngenta India",
            price=350, cost_price=280, quantity=50, unit="packet", quantity_per_unit=0.01,
            measure_unit="kg", batch_number="SHP-B004",
            description="High-yield hybrid tomato seeds (10g pack)",
            low_stock_threshold=10, status="active",
        )
        prod5 = Product(
            user_id=shop.id, name="DAP 18-46-0", short_name="DAP",
            category="fertilizer", brand="Coromandel", manufacturer="Coromandel International",
            price=1350, cost_price=1200, quantity=100, unit="bag", quantity_per_unit=50,
            measure_unit="kg", batch_number="SHP-B005",
            description="Di-ammonium phosphate",
            low_stock_threshold=15, status="active",
        )
        prod6 = Product(
            user_id=shop.id, name="Wheat Seeds PBW-343", short_name="PBW-343",
            category="seeds", brand="PAU",
            price=80, cost_price=60, quantity=0, unit="kg", quantity_per_unit=1,
            measure_unit="kg", batch_number="SHP-B006-DRAFT",
            description="High-yield wheat seed variety -- awaiting stock",
            low_stock_threshold=20, status="draft",
        )

        session.add_all([prod1, prod2, prod3, prod4, prod5, prod6])
        await session.flush()

        # Traceability events for active products
        for p in [prod1, prod2, prod3, prod4, prod5]:
            session.add(TraceabilityEvent(
                product_id=p.id, actor_id=shop.id,
                action="Product Listed",
                details=f"{p.name} added to inventory with batch {p.batch_number}",
                timestamp=now - timedelta(days=15),
            ))

        # ──────────────────────────────────────────────────────────────
        # 5.  Shop Orders (sales to farmers)
        # ──────────────────────────────────────────────────────────────
        order1 = ShopOrder(
            shop_id=shop.id, farmer_id=farmer.id, farmer_name="Jon Snow (Farmer)",
            total_amount=3210, discount=0, final_amount=3210,
            payment_mode="cash", payment_status="paid", status="completed",
            created_at=now - timedelta(days=10),
        )
        session.add(order1)
        await session.flush()

        oi1 = ShopOrderItem(order_id=order1.id, product_id=prod1.id, product_name=prod1.name, quantity=3, unit_price=680, subtotal=2040)
        oi2 = ShopOrderItem(order_id=order1.id, product_id=prod4.id, product_name=prod4.name, quantity=2, unit_price=350, subtotal=700)
        oi3 = ShopOrderItem(order_id=order1.id, product_id=prod3.id, product_name=prod3.name, quantity=1, unit_price=520, subtotal=520 - 50)
        session.add_all([oi1, oi2, oi3])

        exp1 = ShopExpense(order_id=order1.id, transportation=150, labour=200, other=0, notes="Local delivery")
        session.add(exp1)

        order2 = ShopOrder(
            shop_id=shop.id, farmer_id=None, farmer_name="Walk-in Customer",
            total_amount=1350, discount=50, final_amount=1300,
            payment_mode="upi", payment_status="paid", status="completed",
            created_at=now - timedelta(days=5),
        )
        session.add(order2)
        await session.flush()

        oi4 = ShopOrderItem(order_id=order2.id, product_id=prod5.id, product_name=prod5.name, quantity=1, unit_price=1350, subtotal=1350)
        session.add(oi4)

        order3 = ShopOrder(
            shop_id=shop.id, farmer_id=farmer.id, farmer_name="Jon Snow (Farmer)",
            total_amount=560, discount=0, final_amount=560,
            payment_mode="cash", payment_status="paid", status="completed",
            created_at=now - timedelta(days=2),
        )
        session.add(order3)
        await session.flush()

        oi5 = ShopOrderItem(order_id=order3.id, product_id=prod2.id, product_name=prod2.name, quantity=2, unit_price=280, subtotal=560)
        session.add(oi5)

        # ──────────────────────────────────────────────────────────────
        # 6.  Shop Accounting Expenses
        # ──────────────────────────────────────────────────────────────
        acct_expenses = [
            ShopAccountingExpense(shop_id=shop.id, category="rent", amount=8000,
                                  description="Monthly shop rent -- April", expense_date=today),
            ShopAccountingExpense(shop_id=shop.id, category="labour", amount=12000,
                                  description="2 helpers salary -- April", expense_date=today),
            ShopAccountingExpense(shop_id=shop.id, category="utilities", amount=2500,
                                  description="Electricity bill", expense_date=today - timedelta(days=5)),
            ShopAccountingExpense(shop_id=shop.id, category="transportation", amount=3500,
                                  description="Goods pickup truck hire", expense_date=today - timedelta(days=8)),
        ]
        session.add_all(acct_expenses)

        # ──────────────────────────────────────────────────────────────
        # 7.  Manufacturer (Mill) Profile + Purchases + Production
        # ──────────────────────────────────────────────────────────────
        mill_profile = MillProfile(
            user_id=mfr.id,
            mill_name="Snow Flour Mill",
            license_number="MILL-2024-5512",
            mill_id="MILL-JS-001",
            father_name="Ned Stark",
            owner_name="Jon Snow",
            contact_number="9999900003",
            village="Winterfell Industrial Area",
            district="Karnal",
            state="Haryana",
            pincode="132001",
            bank_name="HDFC Bank",
            account_number="55667788990011",
            ifsc_code="HDFC0001234",
        )
        session.add(mill_profile)

        # Raw Material Product for manufacturer inventory
        raw_wheat = Product(
            user_id=mfr.id, name="Raw Wheat (Purchased)", category="crop",
            price=2200, cost_price=2200, quantity=500, unit="kg",
            measure_unit="kg", batch_number="MFR-RAW-001",
            description="Wheat purchased from local farmers", status="active",
        )
        finished_flour = Product(
            user_id=mfr.id, name="Wheat Flour (Atta)", category="processed",
            brand="Snow Mills", price=45, cost_price=32, quantity=350, unit="kg",
            measure_unit="kg", batch_number="MFR-FIN-001",
            description="Stone-ground whole wheat flour", status="active",
        )
        session.add_all([raw_wheat, finished_flour])
        await session.flush()

        purchase1 = ManufacturerPurchase(
            manufacturer_id=mfr.id, farmer_id=farmer.id, farmer_name="Jon Snow (Farmer)",
            crop_name="Wheat", quantity=500, unit="kg", price_per_unit=22,
            total_cost=11000, transport_cost=800, quality_grade="A",
            batch_id="M-PUR-001", date=now - timedelta(days=20),
        )
        session.add(purchase1)

        prod_batch = ProductionBatch(
            manufacturer_id=mfr.id, input_product_id=raw_wheat.id, input_qty=400,
            output_product_name="Wheat Flour (Atta)", output_qty=350, output_unit="kg",
            processing_cost=2500, waste_qty=50, efficiency=87.5,
            batch_number="M-PROD-001", date=now - timedelta(days=15),
        )
        session.add(prod_batch)

        sale1 = ManufacturerSale(
            manufacturer_id=mfr.id, buyer_type="shop", buyer_id=shop.id,
            buyer_name="Snow Agri Mart", product_id=finished_flour.id,
            quantity=100, selling_price=45, discount=0, total_amount=4500,
            payment_mode="upi", invoice_id="M-INV-001",
            delivery_status="delivered", date=now - timedelta(days=10),
        )
        session.add(sale1)

        # Manufacturer expenses
        mfr_expenses = [
            ManufacturerExpense(manufacturer_id=mfr.id, category="electricity", amount=6000,
                                description="Monthly electricity for mill", expense_date=today - timedelta(days=2)),
            ManufacturerExpense(manufacturer_id=mfr.id, category="labour", amount=15000,
                                description="3 workers salary", expense_date=today),
            ManufacturerExpense(manufacturer_id=mfr.id, category="maintenance", amount=3500,
                                description="Grinding stone replacement", expense_date=today - timedelta(days=10)),
        ]
        session.add_all(mfr_expenses)

        # ──────────────────────────────────────────────────────────────
        # 8.  Customer Profile + Cart + Orders
        # ──────────────────────────────────────────────────────────────
        customer_profile = CustomerProfile(
            user_id=cust.id,
            father_name="Ned Stark",
            relation_type="S/O",
            id_number="ABCDE1234F",
            house_no="45",
            street="King's Road",
            village="Winterfell",
            district="Karnal",
            state="Haryana",
            pincode="132001",
            bank_name="ICICI Bank",
            account_number="99887766554433",
            ifsc_code="ICIC0001234",
        )
        session.add(customer_profile)

        # Cart items
        cart1 = Cart(customer_id=cust.id, product_id=prod1.id, quantity=2)
        cart2 = Cart(customer_id=cust.id, product_id=prod3.id, quantity=1)
        session.add_all([cart1, cart2])

        # Past customer order
        cust_order = CustomerOrder(
            customer_id=cust.id, total_amount=1880, status="delivered",
            created_at=now - timedelta(days=7),
        )
        session.add(cust_order)
        await session.flush()

        coi1 = CustomerOrderItem(
            order_id=cust_order.id, product_id=prod1.id, seller_id=shop.id,
            product_name=prod1.name, quantity=2, price=680,
        )
        coi2 = CustomerOrderItem(
            order_id=cust_order.id, product_id=prod3.id, seller_id=shop.id,
            product_name=prod3.name, quantity=1, price=520,
        )
        session.add_all([coi1, coi2])

        # ══════════════════════════════════════════════════════════════
        #  NEW FEATURES — Seed Data
        # ══════════════════════════════════════════════════════════════

        # ──────────────────────────────────────────────────────────────
        # 9.  Plot Nutrition — Soil Data + Fertilizer Applications
        # ──────────────────────────────────────────────────────────────
        print("[...] Seeding Plot Nutrition (Soil Data + Fertilizer Applications)...")

        # Plot soil data for land record 1 (7.5 acres — linked to Wheat crop)
        soil_data_1 = PlotSoilData(
            user_id=farmer.id,
            land_record_id=land1.id,
            crop_id=crop1.id,
            nitrogen=245.0,       # kg/ha — Medium
            phosphorus=18.5,      # kg/ha — Medium
            potassium=195.0,      # kg/ha — Medium
            ph_level=7.2,         # Slightly alkaline (normal for Haryana)
            organic_carbon=0.58,  # percentage — Moderate
            last_tested=now - timedelta(days=90),
            notes="Soil tested at KVK Karnal before Rabi sowing. Clay-loam texture.",
        )

        # Plot soil data for land record 2 (5.0 acres — linked to Rice crop)
        soil_data_2 = PlotSoilData(
            user_id=farmer.id,
            land_record_id=land2.id,
            crop_id=crop2.id,
            nitrogen=310.0,       # kg/ha — Medium-High (rice paddy residue)
            phosphorus=12.0,      # kg/ha — Medium
            potassium=160.0,      # kg/ha — Medium
            ph_level=6.8,         # Slightly acidic (waterlogged paddy)
            organic_carbon=0.72,  # percentage — Good for paddy
            last_tested=now - timedelta(days=180),
            notes="Post-Kharif rice harvest soil test. Needs potassium replenishment.",
        )

        session.add_all([soil_data_1, soil_data_2])
        await session.flush()

        # Fertilizer applications for Wheat plot (land1)
        fert_apps = [
            FertilizerApplication(
                user_id=farmer.id,
                plot_soil_data_id=soil_data_1.id,
                crop_id=crop1.id,
                fertilizer_name="DAP (Di-Ammonium Phosphate)",
                quantity=100.0, unit="kg",
                application_date=now - timedelta(days=100),
                application_method="Broadcasting",
                notes="Basal application at sowing — 18-46-0 NPK ratio",
            ),
            FertilizerApplication(
                user_id=farmer.id,
                plot_soil_data_id=soil_data_1.id,
                crop_id=crop1.id,
                fertilizer_name="Urea (46-0-0)",
                quantity=100.0, unit="kg",
                application_date=now - timedelta(days=60),
                application_method="Top dressing",
                notes="First split — CRI stage nitrogen top dressing",
            ),
            FertilizerApplication(
                user_id=farmer.id,
                plot_soil_data_id=soil_data_1.id,
                crop_id=crop1.id,
                fertilizer_name="MOP (Muriate of Potash)",
                quantity=50.0, unit="kg",
                application_date=now - timedelta(days=75),
                application_method="Broadcasting",
                notes="Potassium application for root and stem strengthening",
            ),
            FertilizerApplication(
                user_id=farmer.id,
                plot_soil_data_id=soil_data_1.id,
                crop_id=crop1.id,
                fertilizer_name="Urea (46-0-0)",
                quantity=50.0, unit="kg",
                application_date=now - timedelta(days=30),
                application_method="Top dressing",
                notes="Second split — flag leaf stage nitrogen boost for grain filling",
            ),
        ]
        session.add_all(fert_apps)

        # Fertilizer applications for Rice plot (land2)
        fert_apps_rice = [
            FertilizerApplication(
                user_id=farmer.id,
                plot_soil_data_id=soil_data_2.id,
                crop_id=crop2.id,
                fertilizer_name="NPK 20-20-20",
                quantity=150.0, unit="kg",
                application_date=now - timedelta(days=150),
                application_method="Broadcasting",
                notes="Basal mixed NPK for paddy — applied before puddling",
            ),
            FertilizerApplication(
                user_id=farmer.id,
                plot_soil_data_id=soil_data_2.id,
                crop_id=crop2.id,
                fertilizer_name="Zinc Sulphate (ZnSO4)",
                quantity=5.0, unit="kg",
                application_date=now - timedelta(days=140),
                application_method="Foliar spray",
                notes="Zinc deficiency correction — foliar spray at tillering stage",
            ),
        ]
        session.add_all(fert_apps_rice)

        # ──────────────────────────────────────────────────────────────
        # 10.  Crop Health Indicators
        # ──────────────────────────────────────────────────────────────
        print("[...] Seeding Crop Health Indicators...")

        health_statuses = [
            CropHealthStatus(
                user_id=farmer.id,
                crop_id=crop1.id,
                status="healthy",
                notes="Wheat is in flag leaf stage. Tillering was vigorous, no pest pressure observed.",
                updated_at=now - timedelta(days=2),
            ),
            CropHealthStatus(
                user_id=farmer.id,
                crop_id=crop2.id,
                status="healthy",
                notes="Rice harvested successfully. Final yield was above district average.",
                updated_at=now - timedelta(days=25),
            ),
            CropHealthStatus(
                user_id=farmer.id,
                crop_id=crop3.id,
                status="monitor",
                notes="Some early blight spots noticed on lower leaves. Applied Mancozeb spray. Monitoring closely.",
                updated_at=now - timedelta(days=5),
            ),
            CropHealthStatus(
                user_id=farmer.id,
                crop_id=crop4.id,
                status="healthy",
                notes="Sugarcane sold to mill. Final quality grade was A+. Good sugar recovery rate.",
                updated_at=now - timedelta(days=55),
            ),
        ]
        session.add_all(health_statuses)

        # ──────────────────────────────────────────────────────────────
        # 11.  Farm Calendar Events
        # ──────────────────────────────────────────────────────────────
        print("[...] Seeding Farm Calendar Events...")

        farm_events = [
            # Past events (completed)
            FarmEvent(
                user_id=farmer.id,
                title="Wheat Sowing",
                event_type="sowing",
                event_date=today - timedelta(days=120),
                description="Sow PBW-343 wheat on Plot KNL-101 (5 acres). Seed rate: 40 kg/acre.",
                crop_id=crop1.id, crop_name="Wheat",
                reminder_days_before=2,
                is_completed=True,
                color="#22c55e",
            ),
            FarmEvent(
                user_id=farmer.id,
                title="DAP Basal Application — Wheat",
                event_type="fertilizer",
                event_date=today - timedelta(days=100),
                description="Apply 100 kg DAP at sowing for Wheat. Method: Broadcasting.",
                crop_id=crop1.id, crop_name="Wheat",
                reminder_days_before=1,
                is_completed=True,
                color="#3b82f6",
            ),
            FarmEvent(
                user_id=farmer.id,
                title="Urea Top Dressing — Wheat (1st Split)",
                event_type="fertilizer",
                event_date=today - timedelta(days=60),
                description="Apply 100 kg Urea — CRI stage nitrogen top dressing for Wheat.",
                crop_id=crop1.id, crop_name="Wheat",
                reminder_days_before=1,
                is_completed=True,
                color="#3b82f6",
            ),
            FarmEvent(
                user_id=farmer.id,
                title="Irrigation Cycle #3 — Wheat",
                event_type="irrigation",
                event_date=today - timedelta(days=45),
                description="Third irrigation (heading stage). Canal water + tubewell backup.",
                crop_id=crop1.id, crop_name="Wheat",
                reminder_days_before=1,
                is_completed=True,
                color="#06b6d4",
            ),
            FarmEvent(
                user_id=farmer.id,
                title="Rice Harvesting Completed",
                event_type="harvest",
                event_date=today - timedelta(days=25),
                description="Harvested 32 quintals Pusa 1121 rice. Sold at Karnal mandi + Agarwal Traders.",
                crop_id=crop2.id, crop_name="Rice (Basmati)",
                reminder_days_before=3,
                is_completed=True,
                color="#eab308",
            ),
            FarmEvent(
                user_id=farmer.id,
                title="Mancozeb Spray — Tomato",
                event_type="spraying",
                event_date=today - timedelta(days=5),
                description="Applied Mancozeb fungicide for early blight on Tomato plot. 1 liter in 200L water.",
                crop_id=crop3.id, crop_name="Tomato",
                reminder_days_before=1,
                is_completed=True,
                color="#f97316",
            ),

            # Upcoming events (not completed)
            FarmEvent(
                user_id=farmer.id,
                title="Urea 2nd Split — Wheat (Flag Leaf)",
                event_type="fertilizer",
                event_date=today + timedelta(days=3),
                description="Apply 50 kg Urea for grain filling. Flag leaf stage nitrogen boost.",
                crop_id=crop1.id, crop_name="Wheat",
                reminder_days_before=2,
                is_completed=False,
                color="#3b82f6",
            ),
            FarmEvent(
                user_id=farmer.id,
                title="Tomato First Picking",
                event_type="harvest",
                event_date=today + timedelta(days=10),
                description="Expected first picking of hybrid tomatoes. Check ripeness color stage.",
                crop_id=crop3.id, crop_name="Tomato",
                reminder_days_before=2,
                is_completed=False,
                color="#eab308",
            ),
            FarmEvent(
                user_id=farmer.id,
                title="Wheat Harvest",
                event_type="harvest",
                event_date=today + timedelta(days=20),
                description="Expected wheat harvest. Arrange harvester combine and transport to mandi.",
                crop_id=crop1.id, crop_name="Wheat",
                reminder_days_before=5,
                is_completed=False,
                color="#eab308",
            ),
            FarmEvent(
                user_id=farmer.id,
                title="Kisan Credit Card EMI — SBI",
                event_type="loan",
                event_date=today + timedelta(days=15),
                description="Monthly KCC loan repayment ₹8,333 due at SBI Karnal branch.",
                crop_id=None, crop_name=None,
                reminder_days_before=3,
                is_completed=False,
                color="#ef4444",
            ),
            FarmEvent(
                user_id=farmer.id,
                title="Weeding — Tomato Plot",
                event_type="weeding",
                event_date=today + timedelta(days=5),
                description="Manual weeding needed in tomato plot. 2 laborers for 1 day.",
                crop_id=crop3.id, crop_name="Tomato",
                reminder_days_before=1,
                is_completed=False,
                color="#a855f7",
            ),
            FarmEvent(
                user_id=farmer.id,
                title="Soil Testing — Post Wheat Harvest",
                event_type="custom",
                event_date=today + timedelta(days=25),
                description="Collect soil samples from KNL-101 after wheat harvest. Send to KVK Karnal for SHC update.",
                crop_id=None, crop_name=None,
                reminder_days_before=3,
                is_completed=False,
                color="#6b7280",
            ),
        ]
        session.add_all(farm_events)

        # ──────────────────────────────────────────────────────────────
        # 12.  Credit & Loans + Repayments
        # ──────────────────────────────────────────────────────────────
        print("[...] Seeding Credit & Loans...")

        loan1 = CreditLoan(
            farmer_id=farmer.id,
            source_type="bank",
            lender_name="State Bank of India (KCC)",
            purpose="Kharif & Rabi crop loan — Seeds, Fertilizers, Labor",
            crop_id=None,  # General purpose
            principal_amount=100000.0,
            interest_rate_percent=4.0,
            interest_type="annual",
            start_date=today - timedelta(days=180),
            due_date=today + timedelta(days=185),
            amount_paid=35000.0,
            status="active",
            notes="Kisan Credit Card ₹1 lakh limit sanctioned. Subsidized interest under GoI scheme.",
        )
        loan2 = CreditLoan(
            farmer_id=farmer.id,
            source_type="fertilizer_shop",
            lender_name="Snow Agri Mart (Credit)",
            purpose="Kharif Fertilizer — DAP + Urea on credit",
            crop_id=crop1.id,
            principal_amount=6480.0,
            interest_rate_percent=0.0,
            interest_type="none",
            start_date=today - timedelta(days=100),
            due_date=today - timedelta(days=10),
            amount_paid=6480.0,
            status="paid_off",
            notes="Fertilizer purchased on credit from local shop. Paid off after rice sale.",
        )
        loan3 = CreditLoan(
            farmer_id=farmer.id,
            source_type="trader",
            lender_name="Agarwal Traders",
            purpose="Advance against Rabi wheat crop promise",
            crop_id=crop1.id,
            principal_amount=25000.0,
            interest_rate_percent=12.0,
            interest_type="annual",
            start_date=today - timedelta(days=45),
            due_date=today + timedelta(days=30),
            amount_paid=0.0,
            status="active",
            notes="Trader advance — to be adjusted against wheat sale at ₹2,200/qtl minimum.",
        )
        loan4 = CreditLoan(
            farmer_id=farmer.id,
            source_type="cooperative",
            lender_name="Karnal District Cooperative Bank",
            purpose="Drip irrigation setup for tomato plot",
            crop_id=crop3.id,
            principal_amount=40000.0,
            interest_rate_percent=7.0,
            interest_type="annual",
            start_date=today - timedelta(days=90),
            due_date=today + timedelta(days=275),
            amount_paid=10000.0,
            status="active",
            notes="Micro-irrigation subsidy loan under PMKSY. EMI ₹5,000/month.",
        )

        session.add_all([loan1, loan2, loan3, loan4])
        await session.flush()

        # Repayments for loan1 (KCC)
        repayments = [
            LoanRepayment(
                loan_id=loan1.id,
                payment_date=today - timedelta(days=150),
                amount=10000.0,
                payment_mode="bank_transfer",
                notes="First installment — deposited at SBI Karnal branch",
            ),
            LoanRepayment(
                loan_id=loan1.id,
                payment_date=today - timedelta(days=120),
                amount=10000.0,
                payment_mode="bank_transfer",
                notes="Second installment",
            ),
            LoanRepayment(
                loan_id=loan1.id,
                payment_date=today - timedelta(days=30),
                amount=15000.0,
                payment_mode="harvest_crop",
                notes="Paid from Basmati rice sale proceeds",
            ),
        ]
        # Repayment for loan2 (shop credit — paid off)
        repayments.append(
            LoanRepayment(
                loan_id=loan2.id,
                payment_date=today - timedelta(days=10),
                amount=6480.0,
                payment_mode="cash",
                notes="Cleared shop credit in full after rice mandi payment",
            ),
        )
        # Repayment for loan4 (cooperative)
        repayments.append(
            LoanRepayment(
                loan_id=loan4.id,
                payment_date=today - timedelta(days=60),
                amount=5000.0,
                payment_mode="upi",
                notes="EMI #1 via PhonePe to cooperative bank",
            ),
        )
        repayments.append(
            LoanRepayment(
                loan_id=loan4.id,
                payment_date=today - timedelta(days=30),
                amount=5000.0,
                payment_mode="upi",
                notes="EMI #2 via PhonePe to cooperative bank",
            ),
        )
        session.add_all(repayments)

        # ──────────────────────────────────────────────────────────────
        # 13.  Crop Insurance (PMFBY)
        # ──────────────────────────────────────────────────────────────
        print("[...] Seeding Crop Insurance Policies...")

        insurance1 = CropInsurance(
            farmer_id=farmer.id,
            scheme_name="PM-Fasal Bima Yojana (PMFBY)",
            policy_number="PMFBY-HR-2026-K-78432",
            insured_crop_name="Wheat",
            crop_id=crop1.id,
            season="Rabi 2026-27",
            area_insured_acres=5.0,
            sum_insured=125000.0,
            farmer_premium_paid=1875.0,  # 1.5% for Rabi
            gov_subsidy_amount=60625.0,
            insurance_company="Agriculture Insurance Company of India (AIC)",
            application_date=today - timedelta(days=115),
            policy_status="active",
            claim_status="none",
            notes="Wheat crop insurance under PMFBY Rabi 2026-27. Insured via CSC centre.",
        )
        insurance2 = CropInsurance(
            farmer_id=farmer.id,
            scheme_name="PM-Fasal Bima Yojana (PMFBY)",
            policy_number="PMFBY-HR-2026-K-52198",
            insured_crop_name="Rice (Basmati)",
            crop_id=crop2.id,
            season="Kharif 2026",
            area_insured_acres=4.0,
            sum_insured=160000.0,
            farmer_premium_paid=3200.0,  # 2% for Kharif
            gov_subsidy_amount=76800.0,
            insurance_company="Agriculture Insurance Company of India (AIC)",
            application_date=today - timedelta(days=195),
            policy_status="expired",
            claim_status="none",
            notes="Rice insurance — Kharif season concluded. No claim needed. Good yield.",
        )
        insurance3 = CropInsurance(
            farmer_id=farmer.id,
            scheme_name="Weather Based Crop Insurance Scheme (WBCIS)",
            policy_number="WBCIS-HR-2026-T-11024",
            insured_crop_name="Tomato",
            crop_id=crop3.id,
            season="Kharif 2026",
            area_insured_acres=1.5,
            sum_insured=75000.0,
            farmer_premium_paid=3750.0,  # 5% for commercial/horticulture
            gov_subsidy_amount=33750.0,
            insurance_company="ICICI Lombard General Insurance",
            application_date=today - timedelta(days=85),
            policy_status="claim_filed",
            claim_status="submitted",
            claim_amount_requested=22500.0,
            claim_loss_reason="unseasonal_rains",
            claim_filed_date=today - timedelta(days=8),
            notes="Filed claim for unseasonal October rains damage to tomato crop. 30% yield loss estimated.",
        )
        session.add_all([insurance1, insurance2, insurance3])

        # ──────────────────────────────────────────────────────────────
        # 14.  Crop Storage (Cold Storage / Warehouse)
        # ──────────────────────────────────────────────────────────────
        print("[...] Seeding Crop Storage Records...")

        storage1 = CropStorage(
            farmer_id=farmer.id,
            crop_name="Rice (Basmati)",
            variety="Pusa 1121",
            storage_type="cold_storage",
            facility_name="Karnal Cold Storage Pvt Ltd",
            location="GT Road, Karnal, Haryana",
            receipt_number="KCS-2026-R-4421",
            bags_count=24,
            weight_quintals=12.0,
            bag_weight_kg=50.0,
            monthly_rent_per_bag=8.0,
            deposit_date=today - timedelta(days=20),
            expected_release_date=today + timedelta(days=40),  # Wait for price peak
            status="stored",
            target_sell_price_per_quintal=3500.0,
            notes="Holding 12 qtl Basmati for Jan-Feb price peak. Current mandi rate ₹3,200 — target ₹3,500.",
        )
        storage2 = CropStorage(
            farmer_id=farmer.id,
            crop_name="Sugarcane (Raw)",
            variety="Co-0238",
            storage_type="private_godown",
            facility_name="Sharma Godown",
            location="Industrial Area Phase-2, Karnal",
            receipt_number=None,
            bags_count=30,
            weight_quintals=45.0,
            bag_weight_kg=150.0,  # Heavy bags for sugarcane
            monthly_rent_per_bag=5.0,
            deposit_date=today - timedelta(days=50),
            expected_release_date=today - timedelta(days=5),  # Already past due
            actual_release_date=None,
            status="stored",  # Will compute as overdue_alert
            target_sell_price_per_quintal=380.0,
            notes="Sugarcane stored temporarily before mill crushing season. Release overdue — mill slot pending.",
        )
        storage3 = CropStorage(
            farmer_id=farmer.id,
            crop_name="Wheat",
            variety="PBW 343",
            storage_type="warehouse_cwc_swc",
            facility_name="Central Warehousing Corporation (CWC) Karnal",
            location="Sector 12, Karnal, Haryana",
            receipt_number="CWC-NWR-2025-W-8891",
            bags_count=40,
            weight_quintals=20.0,
            bag_weight_kg=50.0,
            monthly_rent_per_bag=6.50,
            deposit_date=today - timedelta(days=200),  # From last season
            expected_release_date=today - timedelta(days=120),
            actual_release_date=today - timedelta(days=125),
            status="fully_released",
            target_sell_price_per_quintal=2400.0,
            notes="Last Rabi wheat — released and sold at MSP ₹2,275/qtl through e-NAM. e-NWR used for pledge loan.",
        )
        session.add_all([storage1, storage2, storage3])

        # ──────────────────────────────────────────────────────────────
        # 15.  Soil Profiles (Soil Health Cards)
        # ──────────────────────────────────────────────────────────────
        print("[...] Seeding Soil Profiles...")

        soil_profile_1 = SoilProfile(
            farmer_id=farmer.id,
            land_record_id=land1.id,
            plot_label="KNL-101 — Main Wheat Plot",
            soil_type="clay_loam",
            shc_number="SHC-HR-KNL-2026-44821",
            testing_lab="Krishi Vigyan Kendra (KVK), Karnal",
            test_date=today - timedelta(days=90),
            ph_level=7.2,
            organic_carbon_percent=0.58,
            ec_ds_m=0.42,
            nitrogen_kg_ha=245.0,
            phosphorus_kg_ha=18.5,
            potassium_kg_ha=195.0,
            sulphur_ppm=14.2,
            zinc_ppm=0.82,
            iron_ppm=5.8,
            boron_ppm=0.62,
            notes="Clay-loam texture. Good moisture retention. Needs organic carbon improvement through green manuring.",
        )
        soil_profile_2 = SoilProfile(
            farmer_id=farmer.id,
            land_record_id=land2.id,
            plot_label="KNL-102 — Paddy / Rotation Plot",
            soil_type="alluvial",
            shc_number="SHC-HR-KNL-2026-44822",
            testing_lab="Krishi Vigyan Kendra (KVK), Karnal",
            test_date=today - timedelta(days=180),
            ph_level=6.8,
            organic_carbon_percent=0.72,
            ec_ds_m=0.55,
            nitrogen_kg_ha=310.0,
            phosphorus_kg_ha=12.0,
            potassium_kg_ha=160.0,
            sulphur_ppm=9.5,
            zinc_ppm=0.55,
            iron_ppm=4.2,
            boron_ppm=0.45,
            notes="Alluvial paddy soil. Zinc and iron on lower side — recommend ZnSO4 foliar spray during next Kharif. Test overdue for renewal.",
        )
        session.add_all([soil_profile_1, soil_profile_2])

        # ──────────────────────────────────────────────────────────────
        # 16.  Emergency Contacts (Custom farmer-added contacts)
        # ──────────────────────────────────────────────────────────────
        print("[...] Seeding Emergency Contacts...")

        emergency_contacts = [
            EmergencyContact(
                farmer_id=farmer.id,
                name="Ramesh Kumar (Lineman)",
                category="electricity_power",
                phone_number="+919876543210",
                alternate_phone="+919876543211",
                department_or_village="UHBVN Feeder — Karnal Rural",
                is_toll_free=False,
                is_verified=True,
                availability_hours="06:00 AM - 10:00 PM",
                notes="Local power lineman for tubewell transformer area. Responds within 2 hours. WhatsApp available.",
            ),
            EmergencyContact(
                farmer_id=farmer.id,
                name="Dr. Suresh Yadav (Veterinary)",
                category="veterinary",
                phone_number="+919988776655",
                alternate_phone=None,
                department_or_village="Govt Veterinary Hospital, Karnal",
                is_toll_free=False,
                is_verified=True,
                availability_hours="09:00 AM - 05:00 PM (Mon-Sat)",
                notes="District veterinary doctor. For cattle emergencies after hours, call 1962 MVU hotline.",
            ),
            EmergencyContact(
                farmer_id=farmer.id,
                name="Manoj Singh (Harvester Driver)",
                category="machinery_mechanic",
                phone_number="+919112233445",
                alternate_phone="+919112233446",
                department_or_village="Winterfell Village",
                is_toll_free=False,
                is_verified=True,
                availability_hours="05:00 AM - 08:00 PM (Season)",
                notes="Operates John Deere combine harvester. Book 2-3 days in advance during peak season. ₹5,000/acre.",
            ),
            EmergencyContact(
                farmer_id=farmer.id,
                name="Snow Agri Mart (Input Shop)",
                category="input_retailer",
                phone_number="9999900002",
                alternate_phone=None,
                department_or_village="Main Road, Karnal",
                is_toll_free=False,
                is_verified=True,
                availability_hours="08:00 AM - 08:00 PM (Daily)",
                notes="Jon's own shop — for fertilizers, pesticides, seeds. Credit available.",
            ),
            EmergencyContact(
                farmer_id=farmer.id,
                name="Dr. Ajay Sharma (KVK Scientist)",
                category="kvk_agriculture_officer",
                phone_number="+919456789012",
                alternate_phone="05622268112",
                department_or_village="KVK Karnal, ICAR-CSSRI",
                is_toll_free=False,
                is_verified=True,
                availability_hours="09:30 AM - 05:30 PM (Mon-Sat)",
                notes="Subject Matter Specialist — Plant Protection. Consult for pest identification & IPM advisory.",
            ),
            EmergencyContact(
                farmer_id=farmer.id,
                name="Rajendra (Canal Patwari / Irrigation Officer)",
                category="water_irrigation",
                phone_number="+919334455667",
                alternate_phone=None,
                department_or_village="Irrigation Dept — Western Yamuna Canal Division, Karnal",
                is_toll_free=False,
                is_verified=True,
                availability_hours="10:00 AM - 04:00 PM (Mon-Fri)",
                notes="Contact for canal water release schedule and minor repair requests. Bring land records.",
            ),
        ]
        session.add_all(emergency_contacts)

        # ──────────────────────────────────────────────────────────────
        # 17.  Commit everything
        # ──────────────────────────────────────────────────────────────
        await session.commit()

        print()
        print("=" * 70)
        print("  SEED DATA INSERTED SUCCESSFULLY!")
        print("=" * 70)
        print(f"  Email   : {EMAIL}")
        print(f"  Password: {PASSWORD}")
        print()
        print("Accounts created:")
        print(f"   [FARMER]       (id={farmer.id})")
        print(f"   [SHOP]         (id={shop.id})")
        print(f"   [MANUFACTURER] (id={mfr.id})")
        print(f"   [CUSTOMER]     (id={cust.id})")
        print()
        print("Dummy data includes:")
        print("  ORIGINAL FEATURES:")
        print("   - 4 crops (Wheat, Rice, Tomato, Sugarcane) with expenses & harvests")
        print("   - 6 shop products (fertilizers, pesticides, seeds) — 5 active, 1 draft")
        print("   - 3 shop orders with items & expenses")
        print("   - 4 shop accounting entries (rent, labour, utilities, transport)")
        print("   - Manufacturer: 1 purchase, 1 production batch, 1 sale, 3 expenses")
        print("   - Customer: profile, 2 cart items, 1 past order (delivered)")
        print("   - Farmer & Shop & Mill & Customer profiles with addresses & bank details")
        print()
        print("  NEW FEATURES:")
        print(f"   - 2 Plot Soil Data records + 6 Fertilizer Applications")
        print(f"   - 4 Crop Health Indicators (healthy, healthy, monitor, healthy)")
        print(f"   - 12 Farm Calendar Events (6 completed + 6 upcoming)")
        print(f"   - 4 Credit & Loans + 6 Repayment records")
        print(f"   - 3 Crop Insurance Policies (1 active, 1 expired, 1 claim filed)")
        print(f"   - 3 Crop Storage records (1 stored, 1 overdue, 1 released)")
        print(f"   - 2 Soil Profiles (Soil Health Cards with NPK, pH, micronutrients)")
        print(f"   - 6 Emergency Contacts (lineman, vet, harvester, shop, KVK, irrigation)")
        print("=" * 70)


if __name__ == "__main__":
    asyncio.run(seed())

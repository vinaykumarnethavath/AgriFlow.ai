"""
5-Year Comprehensive Demo Data Generator for AgriChain (2021 - 2026)
Populates authentic, realistic multi-year agricultural, commercial, and financial records for:
  - Farmer:       demo@farmer.com       (Ravi Kumar Reddy)
  - Shop:         demo@shop.com         (Venkat Rao Potti / Krishna Agro Center)
  - Manufacturer: demo@manufacturer.com (Prasad Babu Reddy / Sri Venkateswara Mill)
  - Customer:     demo@customer.com     (Priya Sharma)

All accounts use password: demo123
"""

import os, sys
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

import asyncio
from datetime import datetime, timedelta, date
from sqlmodel import select, SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker

from app.utils import get_password_hash
from app.models.user import User
from app.models.farmer import FarmerProfile, LandRecord
from app.models.shop import ShopProfile
from app.models.manufacturer import MillProfile, ManufacturerPurchase, ProductionBatch, ManufacturerSale
from app.models.customer import CustomerProfile, Cart, CustomerOrder, CustomerOrderItem
from app.models.crop import Crop, CropExpense, CropHarvest
from app.models.trade import Product, ShopOrder, ShopOrderItem, TraceabilityEvent
from app.models.expense import ShopExpense
from app.models.shop_accounting import ShopAccountingExpense
from app.models.manufacturer_expense import ManufacturerExpense
from app.models.plot_nutrition import PlotSoilData, FertilizerApplication
from app.models.crop_health_indicator import CropHealthStatus
from app.models.farm_calendar import FarmEvent
from app.models.credit_loan import CreditLoan, LoanRepayment
from app.models.crop_insurance import CropInsurance
from app.models.crop_storage import CropStorage
from app.models.soil_profile import SoilProfile
from app.models.emergency_contact import EmergencyContact
from app.models.chat import ChatChannel, ChannelMember, ChatMessage, ChannelType

from app.database import engine

NOW = datetime.utcnow()
TODAY = date.today()

async def seed_5year_data():
    print("=" * 70)
    print("  SEEDING 5-YEAR COMPREHENSIVE DEMO DATA (2021 - 2026)")
    print("=" * 70)

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        hashed_pwd = get_password_hash("demo123")

        # ── 1. Create or Update Core Demo Users ───────────────────────
        role_configs = [
            ("demo@farmer.com", "Ravi Kumar Reddy", "farmer", "9876543210"),
            ("demo@shop.com", "Venkat Rao Potti", "shop", "9848012345"),
            ("demo@manufacturer.com", "Prasad Babu Reddy", "manufacturer", "9700012345"),
            ("demo@customer.com", "Priya Sharma", "customer", "9900112233"),
        ]

        users = {}
        for email, name, role, phone in role_configs:
            res = await session.exec(select(User).where(User.email == email, User.role == role))
            u = res.first()
            if not u:
                # Also check email without role
                res2 = await session.exec(select(User).where(User.email == email))
                u = res2.first()
            if not u:
                u = User(
                    email=email,
                    phone_number=phone,
                    full_name=name,
                    role=role,
                    is_active=True,
                    hashed_password=hashed_pwd,
                )
                session.add(u)
                await session.flush()
                print(f" [USER CREATED] {email} ({role}) -> ID {u.id}")
            else:
                u.full_name = name
                u.phone_number = phone
                u.role = role
                u.hashed_password = hashed_pwd
                session.add(u)
                await session.flush()
                print(f" [USER UPDATED] {email} ({role}) -> ID {u.id}")
            users[role] = u

        farmer = users["farmer"]
        shop = users["shop"]
        mfr = users["manufacturer"]
        cust = users["customer"]

        # ── 2. Farmer Profile & Land Records ─────────────────────────
        f_prof_res = await session.exec(select(FarmerProfile).where(FarmerProfile.user_id == farmer.id))
        f_prof = f_prof_res.first()
        if not f_prof:
            f_prof = FarmerProfile(
                user_id=farmer.id,
                farmer_id="FM-2021-00123",
                father_husband_name="Suresh Reddy",
                gender="male",
                relation_type="son_of",
                house_no="4-5/B",
                street="Nandanavanam Road",
                village="Kondapally",
                mandal="Nuzividu",
                district="Krishna",
                state="Andhra Pradesh",
                country="India",
                pincode="521111",
                total_area=7.20,
                aadhaar_last_4="8842",
                bank_name="State Bank of India",
                account_number="35420198765",
                ifsc_code="SBIN0003241",
                phone_number="9876543210",
                upi_id="ravikumar@sbi",
                irrigation_type="Borewell + Drip",
                primary_crop="Paddy",
                preferred_language="te",
            )
            session.add(f_prof)
            await session.flush()

        lr_res = await session.exec(select(LandRecord).where(LandRecord.farmer_profile_id == f_prof.id))
        if not lr_res.first():
            l1 = LandRecord(farmer_profile_id=f_prof.id, serial_number="KR/2021/001", area=3.10)
            l2 = LandRecord(farmer_profile_id=f_prof.id, serial_number="KR/2021/002", area=2.30)
            l3 = LandRecord(farmer_profile_id=f_prof.id, serial_number="KR/2021/003", area=1.80)
            session.add_all([l1, l2, l3])
            await session.flush()
            print(" [OK] Farmer Profile and 3 Land Records verified.")

        # ── 3. Shop Profile & 15+ Products ────────────────────────────
        s_prof_res = await session.exec(select(ShopProfile).where(ShopProfile.user_id == shop.id))
        s_prof = s_prof_res.first()
        if not s_prof:
            s_prof = ShopProfile(
                user_id=shop.id,
                shop_name="Krishna Agro Center",
                license_number="AP/AGR/2019/04521",
                shop_id="SHOP-KA-001",
                father_name="Subba Rao Potti",
                owner_name="Venkat Rao Potti",
                contact_number="9848012345",
                phone_number="9848012345",
                shop_address="Main Road, Near Bus Stand, Nuzividu",
                village="Nuzividu",
                mandal="Nuzividu",
                district="Krishna",
                state="Andhra Pradesh",
                country="India",
                pincode="521111",
                bank_name="State Bank of India",
                account_number="332211009988",
                ifsc_code="SBIN0003241",
            )
            session.add(s_prof)
            await session.flush()

        # Check existing products or seed 15 comprehensive agricultural products
        prods_res = await session.exec(select(Product).where(Product.user_id == shop.id))
        existing_prods = prods_res.all()
        prod_map = {p.short_name: p for p in existing_prods if p.short_name}

        if len(existing_prods) < 10:
            catalog = [
                # Fertilizers
                ("Urea 46-0-0 (50 kg)", "Urea", "fertilizer", "IFFCO", "IFFCO", 267.0, 240.0, 320, "bag", 50, "KAC-U01", "High-nitrogen synthetic fertilizer for vegetative growth"),
                ("DAP 18-46-0 (50 kg)", "DAP", "fertilizer", "Coromandel", "Coromandel", 1350.0, 1200.0, 140, "bag", 50, "KAC-D01", "Di-ammonium phosphate for root establishment"),
                ("MOP Potash (50 kg)", "MOP", "fertilizer", "IPL", "IPL", 1100.0, 980.0, 95, "bag", 50, "KAC-M01", "Muriate of potash for grain weight & disease resistance"),
                ("NPK 19:19:19 Foliar (1 kg)", "NPK 19:19:19", "fertilizer", "Mahadhan", "Deepak Fertilisers", 160.0, 130.0, 180, "packet", 1, "KAC-N01", "100% water soluble balanced NPK"),
                ("Zinc Sulphate 33% (5 kg)", "Zinc 33%", "fertilizer", "Aries Agro", "Aries", 420.0, 350.0, 85, "bag", 5, "KAC-Z01", "Chelated micronutrient for tillering in paddy"),
                ("Neem Cake Organic (50 kg)", "Neem Cake", "fertilizer", "Godrej", "Godrej Agrovet", 850.0, 720.0, 60, "bag", 50, "KAC-NC01", "Pure organic soil conditioner & nematode repellent"),
                
                # Pesticides & Fungicides
                ("Chlorpyriphos 20 EC (1L)", "Chlorpyriphos", "pesticide", "Dhanuka", "Dhanuka", 620.0, 510.0, 120, "bottle", 1, "KAC-P01", "Broad spectrum contact insecticide"),
                ("Imidacloprid 17.8 SL (250ml)", "Imidacloprid", "pesticide", "Bayer", "Bayer CropScience", 480.0, 390.0, 95, "bottle", 0.25, "KAC-P02", "Systemic insecticide for sucking pests like aphid & jassid"),
                ("Mancozeb 75 WP Fungicide (1 kg)", "Mancozeb", "pesticide", "UPL", "UPL Limited", 450.0, 370.0, 110, "packet", 1, "KAC-F01", "Protective fungicide for blight and leaf spots"),

                # Seeds
                ("BPT-5204 Certified Paddy Seed (10 kg)", "BPT-5204", "seeds", "AP State Seeds", "APSSC", 420.0, 340.0, 350, "bag", 10, "KAC-S01", "Samba Masoori premium superfine rice seeds"),
                ("Cotton Bunny BT Seeds (450g)", "Bunny BT", "seeds", "Rasi Seeds", "Rasi", 740.0, 640.0, 85, "packet", 0.45, "KAC-S02", "Bollgard II hybrid high-lint cotton seed"),
                ("Hybrid Maize Kaveri-55 (4 kg)", "Kaveri-55", "seeds", "Kaveri", "Kaveri Seed Co", 920.0, 780.0, 110, "bag", 4, "KAC-S03", "Drought tolerant orange flint hybrid maize seed"),
                ("Hybrid Tomato US-440 (10g)", "Tomato US-440", "seeds", "Seminis", "Bayer", 380.0, 310.0, 65, "packet", 0.01, "KAC-S04", "High firmness round red hybrid tomato seed"),

                # Equipment & Irrigation
                ("Drip Irrigation Inline Pipe 16mm (100m)", "Drip 16mm", "equipment", "Jain Irrigation", "Jain", 2800.0, 2300.0, 25, "roll", 100, "KAC-E01", "UV-stabilized inline drip tube 40cm emitter spacing"),
                ("16L Battery Knapsack Sprayer", "Battery Sprayer", "equipment", "Aspee", "Aspee", 2950.0, 2450.0, 18, "unit", 1, "KAC-E02", "12V 8Ah lithium-ion powered continuous pressure sprayer"),
            ]

            for name, short, cat, brand, mfr_name, price, cost, qty, unit, q_unit, batch, desc in catalog:
                if short not in prod_map:
                    p = Product(
                        user_id=shop.id,
                        name=name,
                        short_name=short,
                        category=cat,
                        brand=brand,
                        manufacturer=mfr_name,
                        price=price,
                        cost_price=cost,
                        quantity=qty,
                        unit=unit,
                        quantity_per_unit=q_unit,
                        measure_unit="kg" if cat in ("fertilizer", "seeds") else "L" if cat == "pesticide" else "unit",
                        batch_number=batch,
                        description=desc,
                        status="active",
                        low_stock_threshold=20,
                    )
                    session.add(p)
                    await session.flush()
                    prod_map[short] = p
            print(f" [OK] Shop verified with {len(prod_map)} diverse products.")

        # ── 4. Mill Profile for Manufacturer ─────────────────────────
        m_prof_res = await session.exec(select(MillProfile).where(MillProfile.user_id == mfr.id))
        m_prof = m_prof_res.first()
        if not m_prof:
            m_prof = MillProfile(
                user_id=mfr.id,
                mill_name="Sri Venkateswara Rice & Cotton Mill",
                license_number="AP/MILL/2018/00892",
                mill_id="MILL-SV-001",
                father_name="Venkata Narayana Reddy",
                owner_name="Prasad Babu Reddy",
                contact_number="9700012345",
                phone_number="9700012345",
                village="Nuzividu Industrial Estate",
                mandal="Nuzividu",
                district="Krishna",
                state="Andhra Pradesh",
                pincode="521111",
                bank_name="HDFC Bank",
                account_number="50200088991122",
                ifsc_code="HDFC0001842",
            )
            session.add(m_prof)
            await session.flush()

        # Mill raw & finished products
        mfr_prods_res = await session.exec(select(Product).where(Product.user_id == mfr.id))
        mfr_prods = {p.name: p for p in mfr_prods_res.all()}
        if "Raw Paddy Grain (Procured)" not in mfr_prods:
            mp1 = Product(user_id=mfr.id, name="Raw Paddy Grain (Procured)", category="crop", price=2200, cost_price=2200, quantity=12500, unit="kg", measure_unit="kg", batch_number="MFR-RAW-PAD", description="Raw paddy procured from farmer partners", status="active")
            mp2 = Product(user_id=mfr.id, name="Steamed Basmati Rice 25kg", category="processed", brand="SV Mills", price=1950, cost_price=1550, quantity=450, unit="bag", measure_unit="kg", quantity_per_unit=25, batch_number="MFR-FIN-STM", description="Silky steamed premium grain rice", status="active")
            mp3 = Product(user_id=mfr.id, name="Stone-Ground Whole Wheat Atta 10kg", category="processed", brand="SV Mills", price=420, cost_price=330, quantity=380, unit="bag", measure_unit="kg", quantity_per_unit=10, batch_number="MFR-FIN-ATT", description="100% whole grain chakki atta", status="active")
            session.add_all([mp1, mp2, mp3])
            await session.flush()
            mfr_prods = {"Raw Paddy Grain (Procured)": mp1, "Steamed Basmati Rice 25kg": mp2, "Stone-Ground Whole Wheat Atta 10kg": mp3}
            print(" [OK] Mill inventory products verified.")

        # ── 5. Customer Profile ──────────────────────────────────────
        c_prof_res = await session.exec(select(CustomerProfile).where(CustomerProfile.user_id == cust.id))
        c_prof = c_prof_res.first()
        if not c_prof:
            c_prof = CustomerProfile(
                user_id=cust.id,
                father_name="Ramesh Sharma",
                id_number="AADHAAR-88223344",
                phone_number="9900112233",
                bank_name="HDFC Bank",
                account_number="5010022334455",
                ifsc_code="HDFC0000456",
                house_no="Flat 402",
                street="Green Valley Apartments, KPHB Colony",
                village="Kukatpally",
                mandal="Kukatpally",
                district="Hyderabad",
                state="Telangana",
                country="India",
                pincode="500085",
            )
            session.add(c_prof)
            await session.flush()

        # ── 6. FARMER 5-YEAR CROPS, EXPENSES & HARVESTS (2021 - 2026) ─
        # Check existing crop count to avoid duplicate 5-year generation
        crop_count_res = await session.exec(select(Crop).where(Crop.user_id == farmer.id))
        existing_crops = crop_count_res.all()

        if len(existing_crops) < 10:
            print(" [...] Generating 14 seasonal crop cycles spanning 2021 through 2026...")
            
            # (name, area, season, variety, sowing_dt, harvest_dt, status, type, yield_qtl, price_qtl, revenue, cost, profit, notes, expenses_list)
            five_year_crops = [
                # ── YEAR 2021 ──
                ("Paddy (BPT-5204)", 3.10, "Kharif 2021", "BPT-5204 Samba Masoori", datetime(2021, 7, 10), datetime(2021, 11, 20), "Sold", "Cereal", 64.5, 1940.0, 125130.0, 42000.0, 83130.0, "Superfine grain grade A. Excellent monsoon season.", [
                    ("Input", "Seed", 30, "kg", 45, 1350, datetime(2021, 7, 12), "Sowing"),
                    ("Fertilizer", "DAP Fertilizer", 150, "kg", 24, 3600, datetime(2021, 7, 15), "Sowing"),
                    ("Labor", "Transplanting Labor", 8, "days", 450, 3600, datetime(2021, 7, 22), "Sowing"),
                    ("Fertilizer", "Urea 46%", 200, "kg", 5.3, 1060, datetime(2021, 8, 25), "Watering"),
                    ("Pesticide", "Chlorpyriphos", 2, "liter", 520, 1040, datetime(2021, 9, 15), "Flowering"),
                    ("Machinery", "Combine Harvester", 3.1, "hours", 1800, 5580, datetime(2021, 11, 19), "Harvesting"),
                ]),
                ("Maize (Kaveri-55)", 2.30, "Rabi 2021-22", "Kaveri Super-55", datetime(2021, 12, 5), datetime(2022, 4, 12), "Sold", "Cereal", 46.0, 1870.0, 86020.0, 27500.0, 58520.0, "Good cob weight with deep yellow kernels.", [
                    ("Input", "Seed", 16, "kg", 180, 2880, datetime(2021, 12, 7), "Sowing"),
                    ("Fertilizer", "DAP Fertilizer", 100, "kg", 24, 2400, datetime(2021, 12, 10), "Sowing"),
                    ("Irrigation", "Borewell Electricity", 1, "unit", 3200, 3200, datetime(2022, 1, 20), "Watering"),
                    ("Fertilizer", "Urea Top Dressing", 150, "kg", 5.3, 795, datetime(2022, 2, 15), "Watering"),
                    ("Labor", "Harvest & De-husking", 6, "days", 500, 3000, datetime(2022, 4, 10), "Harvesting"),
                ]),

                # ── YEAR 2022 ──
                ("Cotton (Bunny BT)", 2.50, "Kharif 2022", "Bunny BT Bollgard II", datetime(2022, 6, 20), datetime(2022, 11, 25), "Sold", "Fiber", 21.0, 6080.0, 127680.0, 44200.0, 83480.0, "High ginning out-turn. 3 pickings completed.", [
                    ("Input", "Seed", 5, "packet", 720, 3600, datetime(2022, 6, 22), "Sowing"),
                    ("Fertilizer", "NPK 19:19:19", 100, "kg", 26, 2600, datetime(2022, 7, 10), "Sowing"),
                    ("Labor", "Weeding & Interculture", 6, "days", 500, 3000, datetime(2022, 8, 5), "Watering"),
                    ("Pesticide", "Imidacloprid Spray", 3, "bottle", 420, 1260, datetime(2022, 9, 2), "Flowering"),
                    ("Labor", "First & Second Picking", 12, "days", 450, 5400, datetime(2022, 11, 15), "Harvesting"),
                ]),
                ("Wheat (PBW-343)", 3.00, "Rabi 2022-23", "PBW 343 High Yield", datetime(2022, 11, 15), datetime(2023, 3, 28), "Sold", "Cereal", 54.0, 2015.0, 108810.0, 31800.0, 77010.0, "Certified seed sown with seed-cum-fertilizer drill.", [
                    ("Input", "Seed", 120, "kg", 32, 3840, datetime(2022, 11, 18), "Sowing"),
                    ("Fertilizer", "DAP Fertilizer", 150, "kg", 26, 3900, datetime(2022, 11, 20), "Sowing"),
                    ("Irrigation", "First Crown Root Irrigation", 1, "unit", 2500, 2500, datetime(2022, 12, 12), "Watering"),
                    ("Fertilizer", "Urea First Split", 150, "kg", 5.3, 795, datetime(2023, 1, 5), "Watering"),
                    ("Machinery", "Harvester Combine", 3, "hours", 2000, 6000, datetime(2023, 3, 26), "Harvesting"),
                ]),

                # ── YEAR 2023 ──
                ("Paddy (BPT-5204)", 3.10, "Kharif 2023", "BPT-5204 Samba Masoori", datetime(2023, 7, 5), datetime(2023, 11, 18), "Sold", "Cereal", 68.0, 2183.0, 148444.0, 44500.0, 103944.0, "Highest seasonal yield achieved. Soil health improved.", [
                    ("Input", "Seed", 30, "kg", 48, 1440, datetime(2023, 7, 7), "Sowing"),
                    ("Fertilizer", "DAP Fertilizer", 150, "kg", 27, 4050, datetime(2023, 7, 12), "Sowing"),
                    ("Labor", "Mechanical Transplanting", 1, "unit", 4800, 4800, datetime(2023, 7, 20), "Sowing"),
                    ("Fertilizer", "Zinc Sulphate Foliar", 5, "kg", 85, 425, datetime(2023, 8, 18), "Watering"),
                    ("Fertilizer", "Urea Top Dressing", 200, "kg", 5.3, 1060, datetime(2023, 9, 2), "Watering"),
                    ("Machinery", "Harvester Combine", 3.1, "hours", 2100, 6510, datetime(2023, 11, 16), "Harvesting"),
                ]),
                ("Maize (Kaveri-55)", 2.30, "Rabi 2023-24", "Kaveri Super-55", datetime(2023, 12, 8), datetime(2024, 4, 15), "Sold", "Cereal", 51.5, 2090.0, 107635.0, 29800.0, 77835.0, "Sold directly to Sri Venkateswara Mill at MSP + bonus.", [
                    ("Input", "Seed", 16, "kg", 200, 3200, datetime(2023, 12, 10), "Sowing"),
                    ("Fertilizer", "NPK Complex 20:20:0:13", 100, "kg", 28, 2800, datetime(2023, 12, 15), "Sowing"),
                    ("Labor", "Earthing Up & Weeding", 4, "days", 550, 2200, datetime(2024, 1, 25), "Watering"),
                    ("Irrigation", "Drip Subsurface System", 1, "unit", 3500, 3500, datetime(2024, 2, 20), "Watering"),
                ]),
                ("Green Gram (Moong)", 1.80, "Zaid 2023", "IPM 02-03", datetime(2023, 3, 20), datetime(2023, 5, 25), "Sold", "Pulse", 11.5, 7755.0, 89182.0, 16500.0, 72682.0, "Short duration pulse crop. Excellent nitrogen fixation for subsequent paddy.", [
                    ("Input", "Seed", 15, "kg", 110, 1650, datetime(2023, 3, 22), "Sowing"),
                    ("Labor", "Spraying & Pod Picking", 5, "days", 500, 2500, datetime(2023, 5, 20), "Harvesting"),
                ]),

                # ── YEAR 2024 ──
                ("Cotton (Bunny BT)", 2.50, "Kharif 2024", "Bunny BT Bollgard II", datetime(2024, 6, 25), datetime(2024, 11, 28), "Sold", "Fiber", 24.5, 6620.0, 162190.0, 47500.0, 114690.0, "Premium long staple fiber sold to mill at spot premium.", [
                    ("Input", "Seed", 5, "packet", 740, 3700, datetime(2024, 6, 28), "Sowing"),
                    ("Fertilizer", "DAP + Neem Cake", 100, "kg", 30, 3000, datetime(2024, 7, 10), "Sowing"),
                    ("Pesticide", "Chlorpyriphos 20 EC", 3, "liter", 620, 1860, datetime(2024, 8, 20), "Watering"),
                    ("Labor", "Labor for 3 Pickings", 15, "days", 500, 7500, datetime(2024, 11, 20), "Harvesting"),
                ]),
                ("Wheat (PBW-343)", 3.00, "Rabi 2024-25", "PBW 343 High Yield", datetime(2024, 11, 10), datetime(2025, 3, 25), "Sold", "Cereal", 57.0, 2275.0, 129675.0, 34500.0, 95175.0, "Milled at local mill, high gluten quality.", [
                    ("Input", "Seed", 120, "kg", 35, 4200, datetime(2024, 11, 12), "Sowing"),
                    ("Fertilizer", "DAP Fertilizer", 150, "kg", 27, 4050, datetime(2024, 11, 16), "Sowing"),
                    ("Fertilizer", "Urea Top Dressing", 200, "kg", 5.4, 1080, datetime(2024, 12, 28), "Watering"),
                    ("Machinery", "Harvester Combine", 3, "hours", 2200, 6600, datetime(2025, 3, 23), "Harvesting"),
                ]),
                ("Tomato (Hybrid)", 1.50, "Zaid 2024", "US-440 Red Round", datetime(2024, 2, 10), datetime(2024, 5, 20), "Sold", "Vegetable", 145.0, 650.0, 94250.0, 24000.0, 70250.0, "Good summer market demand. Sold in 25kg crates at local mandi.", [
                    ("Input", "Seed", 2, "packet", 380, 760, datetime(2024, 2, 12), "Sowing"),
                    ("Fertilizer", "NPK 19:19:19 Drip", 50, "kg", 140, 7000, datetime(2024, 3, 15), "Watering"),
                    ("Labor", "Staking & Manual Picking", 8, "days", 550, 4400, datetime(2024, 5, 15), "Harvesting"),
                ]),

                # ── YEAR 2025 ──
                ("Paddy (BPT-5204)", 3.10, "Kharif 2025", "BPT-5204 Samba Masoori", datetime(2025, 7, 8), datetime(2025, 11, 22), "Sold", "Cereal", 71.0, 2300.0, 163300.0, 46000.0, 117300.0, "Superfine grain grade A. Held 40 qtl in cold storage before selling at high.", [
                    ("Input", "Seed", 30, "kg", 50, 1500, datetime(2025, 7, 10), "Sowing"),
                    ("Fertilizer", "DAP Fertilizer", 150, "kg", 27, 4050, datetime(2025, 7, 15), "Sowing"),
                    ("Labor", "Transplanting Labor", 8, "days", 550, 4400, datetime(2025, 7, 25), "Sowing"),
                    ("Fertilizer", "Urea Second Split", 200, "kg", 5.4, 1080, datetime(2025, 9, 10), "Watering"),
                    ("Machinery", "Combine Harvester", 3.1, "hours", 2300, 7130, datetime(2025, 11, 20), "Harvesting"),
                ]),
                ("Maize (Kaveri-55)", 2.30, "Rabi 2025-26", "Kaveri Super-55", datetime(2025, 12, 10), datetime(2026, 4, 18), "Sold", "Cereal", 53.0, 2225.0, 117925.0, 31000.0, 86925.0, "Good kernel quality, harvested and stored in Kondapally godown.", [
                    ("Input", "Seed", 16, "kg", 220, 3520, datetime(2025, 12, 12), "Sowing"),
                    ("Fertilizer", "DAP Fertilizer", 100, "kg", 27, 2700, datetime(2025, 12, 18), "Sowing"),
                    ("Fertilizer", "Urea Split", 150, "kg", 5.4, 810, datetime(2026, 2, 5), "Watering"),
                    ("Labor", "Harvest & Shelling", 7, "days", 600, 4200, datetime(2026, 4, 15), "Harvesting"),
                ]),

                # ── YEAR 2026 (CURRENT ACTIVE GROWING SEASONS) ──
                ("Paddy (BPT-5204)", 3.10, "Kharif 2026", "BPT-5204 Samba Masoori", NOW - timedelta(days=80), NOW + timedelta(days=40), "Growing", "Cereal", 0.0, 0.0, 0.0, 28500.0, 0.0, "Panicle emergence stage. Second urea split and bio-fertilizer applied. Crop is vigorous.", [
                    ("Input", "Seed", 30, "kg", 52, 1560, NOW - timedelta(days=78), "Sowing"),
                    ("Fertilizer", "DAP Fertilizer", 150, "kg", 27, 4050, NOW - timedelta(days=72), "Sowing"),
                    ("Labor", "Transplanting Labor", 8, "days", 600, 4800, NOW - timedelta(days=65), "Sowing"),
                    ("Fertilizer", "Urea Top Dressing", 200, "kg", 5.4, 1080, NOW - timedelta(days=35), "Watering"),
                ]),
                ("Cotton (Bunny BT)", 2.30, "Kharif 2026", "Bunny BT Bollgard II", NOW - timedelta(days=95), NOW + timedelta(days=30), "Growing", "Fiber", 0.0, 0.0, 0.0, 31200.0, 0.0, "Boll formation stage. Regularly monitored for whitefly and pink bollworm.", [
                    ("Input", "Seed", 5, "packet", 740, 3700, NOW - timedelta(days=92), "Sowing"),
                    ("Fertilizer", "DAP Fertilizer", 100, "kg", 27, 2700, NOW - timedelta(days=85), "Sowing"),
                    ("Pesticide", "Chlorpyriphos 20 EC", 3, "liter", 620, 1860, NOW - timedelta(days=25), "Watering"),
                    ("Labor", "Intercultivation Weeding", 5, "days", 600, 3000, NOW - timedelta(days=50), "Watering"),
                ]),
            ]

            for name, area, season, var, sow_dt, harv_dt, status, c_type, yield_q, pr_q, rev, cost, prof, notes, exp_items in five_year_crops:
                c = Crop(
                    user_id=farmer.id,
                    name=name,
                    area=area,
                    season=season,
                    variety=var,
                    sowing_date=sow_dt,
                    expected_harvest_date=harv_dt if status == "Growing" else None,
                    actual_harvest_date=harv_dt if status in ("Harvested", "Sold") else None,
                    status=status,
                    crop_type=c_type,
                    actual_yield=yield_q,
                    selling_price_per_unit=pr_q,
                    total_revenue=rev,
                    total_cost=cost,
                    net_profit=prof,
                    notes=notes,
                    created_at=sow_dt,
                )
                session.add(c)
                await session.flush()

                # Add expenses for this crop
                for cat, exp_type, qty, unit, u_cost, t_cost, e_date, stage in exp_items:
                    exp = CropExpense(
                        crop_id=c.id,
                        category=cat,
                        type=exp_type,
                        quantity=qty,
                        unit=unit,
                        unit_cost=u_cost,
                        total_cost=t_cost,
                        date=e_date,
                        payment_mode="cash" if "Labor" in cat else "digital",
                        stage=stage,
                    )
                    session.add(exp)

                # Add harvest record if completed
                if status == "Sold" and yield_q > 0:
                    h = CropHarvest(
                        crop_id=c.id,
                        date=harv_dt - timedelta(days=2),
                        stage="Final Harvest",
                        quantity=yield_q,
                        unit="Quintals",
                        quality="Grade A",
                        selling_price_per_unit=pr_q,
                        total_revenue=rev,
                        buyer_type="Market",
                        sold_to="APMC Mandi / Local Mill",
                        status="Sold",
                    )
                    session.add(h)

            await session.flush()
            print(" [OK] 14 crops across 5 years successfully seeded for Farmer!")

        # ── 7. FARMER CREDIT & LOANS (2021 - 2026) ───────────────────
        loan_res = await session.exec(select(CreditLoan).where(CreditLoan.farmer_id == farmer.id))
        if len(loan_res.all()) < 3:
            # 2021 KCC Loan - Paid off
            l1 = CreditLoan(
                farmer_id=farmer.id,
                source_type="bank",
                lender_name="State Bank of India (KCC 2021)",
                purpose="Kharif 2021 crop credit - Seeds & Fertilizers",
                principal_amount=100000.0,
                interest_rate_percent=4.0,
                interest_type="annual",
                start_date=date(2021, 6, 15),
                due_date=date(2022, 6, 15),
                amount_paid=100000.0,
                status="paid_off",
                notes="Cleared after paddy and maize harvests with subsidized interest.",
            )
            session.add(l1)
            await session.flush()

            session.add_all([
                LoanRepayment(loan_id=l1.id, payment_date=date(2021, 12, 1), amount=60000.0, payment_mode="harvest_crop", notes="First installment from Kharif paddy sale"),
                LoanRepayment(loan_id=l1.id, payment_date=date(2022, 5, 2), amount=40000.0, payment_mode="bank_transfer", notes="Final clearance from Rabi maize sale"),
            ])

            # 2023 PACS Loan - Paid off
            l2 = CreditLoan(
                farmer_id=farmer.id,
                source_type="cooperative",
                lender_name="Kondapally Primary Agri Society (PACS)",
                purpose="Micro-irrigation & Drip Line Setup",
                principal_amount=60000.0,
                interest_rate_percent=6.0,
                interest_type="annual",
                start_date=date(2023, 4, 10),
                due_date=date(2024, 4, 10),
                amount_paid=60000.0,
                status="paid_off",
                notes="PMKSY subsidized irrigation loan. Cleared in full.",
            )
            session.add(l2)
            await session.flush()

            session.add(LoanRepayment(loan_id=l2.id, payment_date=date(2024, 1, 15), amount=60000.0, payment_mode="bank_transfer", notes="Full settlement from Cotton harvest"))

            # 2025-2026 Active KCC Facility
            l3 = CreditLoan(
                farmer_id=farmer.id,
                source_type="bank",
                lender_name="State Bank of India (KCC Active)",
                purpose="Crop production credit (Scale of Finance 2025-26)",
                principal_amount=150000.0,
                interest_rate_percent=4.0,
                interest_type="annual",
                start_date=date(2025, 7, 1),
                due_date=TODAY + timedelta(days=240),
                amount_paid=62000.0,
                status="active",
                notes="KCC limit ₹1.50 Lakh. Subsidized interest rate 4% under central interest subvention scheme.",
            )
            session.add(l3)
            await session.flush()

            session.add_all([
                LoanRepayment(loan_id=l3.id, payment_date=date(2025, 12, 10), amount=35000.0, payment_mode="bank_transfer", notes="Installment from Kharif 2025 paddy harvest"),
                LoanRepayment(loan_id=l3.id, payment_date=date(2026, 5, 2), amount=27000.0, payment_mode="bank_transfer", notes="Installment from Rabi 2025 maize harvest"),
            ])
            print(" [OK] 5-Year Credit & Loan histories verified.")

        # ── 8. FARMER CROP INSURANCE ACROSS 5 YEARS (2021 - 2026) ────
        ins_res = await session.exec(select(CropInsurance).where(CropInsurance.farmer_id == farmer.id))
        if len(ins_res.all()) < 3:
            ins1 = CropInsurance(
                farmer_id=farmer.id,
                scheme_name="PM-Fasal Bima Yojana (PMFBY)",
                policy_number="PMFBY-AP-2022-C-44102",
                insured_crop_name="Cotton",
                season="Kharif 2022",
                area_insured_acres=2.50,
                sum_insured=150000.0,
                farmer_premium_paid=3000.0,
                gov_subsidy_amount=47000.0,
                insurance_company="Agriculture Insurance Company of India (AIC)",
                application_date=date(2022, 6, 25),
                policy_status="claim_settled",
                claim_status="approved",
                claim_amount_requested=35000.0,
                claim_amount_approved=28500.0,
                claim_loss_reason="excess_rainfall_flood",
                claim_filed_date=date(2022, 9, 15),
                claim_settled_date=date(2022, 11, 10),
                notes="Excess rain in September caused boll rot on 0.8 acre. AIC disbursed ₹28,500 direct to SBI account.",
            )
            ins2 = CropInsurance(
                farmer_id=farmer.id,
                scheme_name="PM-Fasal Bima Yojana (PMFBY)",
                policy_number="PMFBY-AP-2023-P-88190",
                insured_crop_name="Paddy (BPT-5204)",
                season="Kharif 2023",
                area_insured_acres=3.10,
                sum_insured=186000.0,
                farmer_premium_paid=3720.0,
                gov_subsidy_amount=58000.0,
                insurance_company="AIC of India",
                application_date=date(2023, 7, 10),
                policy_status="expired",
                claim_status="none",
                notes="Bumper crop. Season concluded without weather claim.",
            )
            ins3 = CropInsurance(
                farmer_id=farmer.id,
                scheme_name="Weather Based Crop Insurance (WBCIS)",
                policy_number="WBCIS-AP-2024-T-11094",
                insured_crop_name="Tomato",
                season="Zaid 2024",
                area_insured_acres=1.50,
                sum_insured=75000.0,
                farmer_premium_paid=3750.0,
                gov_subsidy_amount=24000.0,
                insurance_company="ICICI Lombard General Insurance",
                application_date=date(2024, 2, 15),
                policy_status="claim_settled",
                claim_status="approved",
                claim_amount_requested=22000.0,
                claim_amount_approved=18000.0,
                claim_loss_reason="hailstorm_heatwave",
                claim_filed_date=date(2024, 4, 12),
                claim_settled_date=date(2024, 5, 28),
                notes="Late April unseasonal hailstorm damage. Claim approved and credited.",
            )
            ins4 = CropInsurance(
                farmer_id=farmer.id,
                scheme_name="PM-Fasal Bima Yojana (PMFBY Active)",
                policy_number="PMFBY-AP-2026-P-99214",
                insured_crop_name="Paddy (BPT-5204)",
                season="Kharif 2026",
                area_insured_acres=3.10,
                sum_insured=192000.0,
                farmer_premium_paid=3840.0,
                gov_subsidy_amount=62000.0,
                insurance_company="Agriculture Insurance Company of India (AIC)",
                application_date=TODAY - timedelta(days=70),
                policy_status="active",
                claim_status="none",
                notes="Active insurance policy protecting against flood, dry spell, and pest outbreak for Kharif 2026.",
            )
            session.add_all([ins1, ins2, ins3, ins4])
            print(" [OK] 5-Year Crop Insurance policies with settled claims seeded.")

        # ── 9. FARMER BIENNIAL SOIL HEALTH CARDS (2021, 2023, 2025) ──
        soil_res = await session.exec(select(SoilProfile).where(SoilProfile.farmer_id == farmer.id))
        if len(soil_res.all()) < 3:
            s2021 = SoilProfile(
                farmer_id=farmer.id,
                plot_label="Plot 1 (Main Paddy Field) - Baseline 2021",
                soil_type="clay_loam",
                shc_number="SHC-AP-KRI-2021-0482",
                testing_lab="KVK Nuzividu Soil Testing Laboratory",
                test_date=date(2021, 6, 10),
                ph_level=7.8,
                organic_carbon_percent=0.42,
                ec_ds_m=0.38,
                nitrogen_kg_ha=210.0,
                phosphorus_kg_ha=14.5,
                potassium_kg_ha=175.0,
                sulphur_ppm=10.2,
                zinc_ppm=0.52,
                iron_ppm=4.8,
                boron_ppm=0.41,
                notes="Baseline test: Organic carbon low (0.42%). High pH. Zinc deficient. Advised green manuring & zinc sulphate.",
            )
            s2023 = SoilProfile(
                farmer_id=farmer.id,
                plot_label="Plot 1 (Main Paddy Field) - Mid-Term 2023",
                soil_type="clay_loam",
                shc_number="SHC-AP-KRI-2023-1184",
                testing_lab="KVK Nuzividu Soil Testing Laboratory",
                test_date=date(2023, 6, 12),
                ph_level=7.5,
                organic_carbon_percent=0.58,
                ec_ds_m=0.40,
                nitrogen_kg_ha=245.0,
                phosphorus_kg_ha=18.0,
                potassium_kg_ha=190.0,
                sulphur_ppm=12.5,
                zinc_ppm=0.78,
                iron_ppm=5.4,
                boron_ppm=0.55,
                notes="Post green manure cycle: Significant rise in Organic Carbon (+38%). Zinc deficiency corrected by basal spray.",
            )
            s2025 = SoilProfile(
                farmer_id=farmer.id,
                plot_label="Plot 1 (Main Paddy Field) - Recent 2025",
                soil_type="clay_loam",
                shc_number="SHC-AP-KRI-2025-2940",
                testing_lab="KVK Nuzividu Soil Testing Laboratory",
                test_date=date(2025, 6, 14),
                ph_level=7.2,
                organic_carbon_percent=0.74,
                ec_ds_m=0.42,
                nitrogen_kg_ha=285.0,
                phosphorus_kg_ha=21.0,
                potassium_kg_ha=215.0,
                sulphur_ppm=15.0,
                zinc_ppm=0.92,
                iron_ppm=6.1,
                boron_ppm=0.68,
                notes="Excellent soil health: Near-neutral pH (7.2), high organic carbon (0.74%), all macro & micronutrients in optimal range.",
            )
            session.add_all([s2021, s2023, s2025])
            print(" [OK] 3 Biennial Soil Health Cards (2021, 2023, 2025) verified.")

        # ── 10. SHOP 5-YEAR ORDERS (100+ ORDERS, ALL STATUSES) ─────────
        orders_cnt_res = await session.exec(select(ShopOrder).where(ShopOrder.shop_id == shop.id))
        order_count = len(orders_cnt_res.all())

        if order_count < 50:
            print(f" [...] Current shop orders: {order_count}. Generating multi-year order history across 2021 to 2026...")
            
            p_urea = prod_map.get("Urea")
            p_dap = prod_map.get("DAP")
            p_mop = prod_map.get("MOP")
            p_npk = prod_map.get("NPK 19:19:19")
            p_chlor = prod_map.get("Chlorpyriphos")
            p_imida = prod_map.get("Imidacloprid")
            p_bpt = prod_map.get("BPT-5204")
            p_cotton = prod_map.get("Bunny BT")
            p_drip = prod_map.get("Drip 16mm")

            years = [2021, 2022, 2023, 2024, 2025, 2026]
            months = [1, 3, 5, 6, 7, 8, 9, 10, 11, 12]

            sample_farmer_names = [
                "Ravi Kumar Reddy", "K. Venkatesh", "M. Nageswara Rao", "P. Anjaneyulu",
                "S. Srinivasa Rao", "B. Ramakrishna", "Walk-in Customer", "Walk-in Customer"
            ]

            statuses_cycle = [
                "completed", "completed", "completed", "completed", "confirmed",
                "dispatched", "completed", "pending", "cancelled", "rejected"
            ]

            order_idx = 1
            for yr in years:
                # Select months for this year (up to current month for 2026)
                m_list = [m for m in months if (yr < 2026 or m <= TODAY.month)]
                for m in m_list:
                    for day in [5, 18]:
                        if yr == 2026 and m == TODAY.month and day > TODAY.day:
                            continue

                        status = statuses_cycle[order_idx % len(statuses_cycle)]
                        # Never leave past years in pending/confirmed
                        if yr < 2026 and status in ("pending", "confirmed"):
                            status = "completed"

                        f_name = sample_farmer_names[order_idx % len(sample_farmer_names)]
                        is_our_farmer = (f_name == "Ravi Kumar Reddy")
                        f_id = farmer.id if is_our_farmer else None

                        pay_mode = "upi" if order_idx % 3 == 0 else "cash" if order_idx % 3 == 1 else "card"
                        pay_status = "paid" if status in ("completed", "dispatched") else "pending" if status == "pending" else "paid"

                        # Create order date
                        ord_dt = datetime(yr, m, day, 10 + (order_idx % 8), 15 + (order_idx * 3 % 45))

                        # Build items
                        order_items = []
                        if order_idx % 4 == 0 and p_dap and p_urea:
                            total = (p_dap.price * 3) + (p_urea.price * 4)
                            order_items = [
                                (p_dap.id, p_dap.name, 3, p_dap.price, p_dap.price * 3),
                                (p_urea.id, p_urea.name, 4, p_urea.price, p_urea.price * 4),
                            ]
                        elif order_idx % 4 == 1 and p_bpt and p_chlor:
                            total = (p_bpt.price * 2) + (p_chlor.price * 2)
                            order_items = [
                                (p_bpt.id, p_bpt.name, 2, p_bpt.price, p_bpt.price * 2),
                                (p_chlor.id, p_chlor.name, 2, p_chlor.price, p_chlor.price * 2),
                            ]
                        elif order_idx % 4 == 2 and p_cotton and p_npk:
                            total = (p_cotton.price * 4) + (p_npk.price * 5)
                            order_items = [
                                (p_cotton.id, p_cotton.name, 4, p_cotton.price, p_cotton.price * 4),
                                (p_npk.id, p_npk.name, 5, p_npk.price, p_npk.price * 5),
                            ]
                        else:
                            p_curr = p_mop or p_urea
                            total = p_curr.price * 3
                            order_items = [(p_curr.id, p_curr.name, 3, p_curr.price, total)]

                        discount = 50.0 if total > 3000 else 0.0
                        final_amt = total - discount

                        ord_entry = ShopOrder(
                            shop_id=shop.id,
                            farmer_id=f_id,
                            farmer_name=f_name,
                            total_amount=total,
                            discount=discount,
                            final_amount=final_amt,
                            payment_mode=pay_mode,
                            payment_status=pay_status,
                            status=status,
                            order_notes=f"Agricultural order #{order_idx} for season supplies",
                            total_expenses=150.0 if status == "completed" else 0.0,
                            profit=final_amt * 0.18 if status == "completed" else 0.0,
                            created_at=ord_dt,
                        )
                        session.add(ord_entry)
                        await session.flush()

                        for p_id, p_nm, q, u_p, s_t in order_items:
                            oi = ShopOrderItem(
                                order_id=ord_entry.id,
                                product_id=p_id,
                                product_name=p_nm,
                                quantity=q,
                                unit_price=u_p,
                                subtotal=s_t,
                            )
                            session.add(oi)

                        if status == "completed":
                            se = ShopExpense(
                                order_id=ord_entry.id,
                                transportation=80.0,
                                labour=70.0,
                                other=0.0,
                                notes="Dispatch handling & local loading",
                                created_at=ord_dt,
                            )
                            session.add(se)

                        order_idx += 1

            await session.flush()
            print(f" [OK] Seeded {order_idx - 1} Shop Orders across 2021-2026!")

        # ── 11. SHOP 60-MONTH ACCOUNTING EXPENSES (2021 - 2026) ──────
        acct_cnt_res = await session.exec(select(ShopAccountingExpense).where(ShopAccountingExpense.shop_id == shop.id))
        if len(acct_cnt_res.all()) < 20:
            print(" [...] Generating 60 months of Shop Accounting Expenses (2021 - 2026)...")
            acct_entries = []
            for yr in range(2021, 2027):
                end_month = TODAY.month if yr == 2026 else 12
                for m in range(1, end_month + 1):
                    exp_d = date(yr, m, 2)
                    rent_amt = 8000.0 if yr <= 2022 else 9000.0 if yr <= 2024 else 10000.0
                    salary_amt = 14000.0 if yr <= 2022 else 16000.0 if yr <= 2024 else 18000.0
                    elec_amt = 1800.0 + ((m * 120) % 800)
                    trans_amt = 2500.0 + ((m * 150) % 1200)

                    acct_entries.extend([
                        ShopAccountingExpense(shop_id=shop.id, category="rent", amount=rent_amt, description=f"Monthly shop premises rent - {exp_d.strftime('%b %Y')}", expense_date=exp_d),
                        ShopAccountingExpense(shop_id=shop.id, category="labour", amount=salary_amt, description=f"2 Shop Assistants monthly salary - {exp_d.strftime('%b %Y')}", expense_date=exp_d),
                        ShopAccountingExpense(shop_id=shop.id, category="utilities", amount=elec_amt, description=f"Electricity & commercial power bill - {exp_d.strftime('%b %Y')}", expense_date=date(yr, m, 10)),
                        ShopAccountingExpense(shop_id=shop.id, category="transportation", amount=trans_amt, description=f"Inward freight & warehouse transport - {exp_d.strftime('%b %Y')}", expense_date=date(yr, m, 18)),
                    ])

            session.add_all(acct_entries)
            await session.flush()
            print(f" [OK] Seeded {len(acct_entries)} monthly accounting expense entries (2021 - 2026).")

        # ── 12. MANUFACTURER 5-YEAR OPERATIONS (2021 - 2026) ─────────
        m_purch_res = await session.exec(select(ManufacturerPurchase).where(ManufacturerPurchase.manufacturer_id == mfr.id))
        if len(m_purch_res.all()) < 5:
            print(" [...] Generating 5 years of Mill Procurements, Batches, and Sales...")
            purchases = []
            batches = []
            mfr_sales = []
            mfr_expenses = []

            raw_paddy_prod = mfr_prods.get("Raw Paddy Grain (Procured)")
            rice_bag_prod = mfr_prods.get("Steamed Basmati Rice 25kg")
            atta_prod = mfr_prods.get("Stone-Ground Whole Wheat Atta 10kg")

            for yr in range(2021, 2027):
                end_m = TODAY.month if yr == 2026 else 12
                # Seasonal procurement in Nov (Paddy) and Apr (Wheat/Maize)
                for proc_m, crop, qty_kg, rate in [(11, "Paddy (BPT-5204)", 25000.0, 19.5 + (yr - 2021) * 0.8), (4, "Wheat (PBW-343)", 15000.0, 20.0 + (yr - 2021) * 0.7)]:
                    if yr == 2026 and proc_m > end_m:
                        continue
                    p_dt = datetime(yr, proc_m, 12, 11, 0)
                    purchases.append(ManufacturerPurchase(
                        manufacturer_id=mfr.id,
                        farmer_id=farmer.id if proc_m == 11 else None,
                        farmer_name="Ravi Kumar Reddy" if proc_m == 11 else "Nuzividu Farmer Producer Co",
                        crop_name=crop,
                        quantity=qty_kg,
                        unit="kg",
                        price_per_unit=rate,
                        total_cost=qty_kg * rate,
                        transport_cost=2500.0,
                        quality_grade="A",
                        payment_mode="Bank Transfer",
                        batch_id=f"M-PUR-{yr}-{proc_m:02d}",
                        date=p_dt,
                    ))

                    # Production batch following procurement
                    if raw_paddy_prod and rice_bag_prod and proc_m == 11:
                        batches.append(ProductionBatch(
                            manufacturer_id=mfr.id,
                            input_product_id=raw_paddy_prod.id,
                            input_qty=10000.0,
                            output_product_name="Steamed Basmati Rice 25kg",
                            output_qty=260.0, # 260 bags of 25kg = 6,500 kg (65% recovery)
                            output_unit="bag",
                            processing_cost=15000.0,
                            waste_qty=3500.0,
                            efficiency=65.0,
                            batch_number=f"M-BATCH-{yr}-PAD01",
                            date=p_dt + timedelta(days=5),
                        ))

                    # Finished sale to Shop Owner
                    if rice_bag_prod:
                        mfr_sales.append(ManufacturerSale(
                            manufacturer_id=mfr.id,
                            buyer_type="shop",
                            buyer_id=shop.id,
                            buyer_name="Krishna Agro Center",
                            product_id=rice_bag_prod.id,
                            quantity=80.0,
                            selling_price=rice_bag_prod.price,
                            discount=500.0,
                            total_amount=(rice_bag_prod.price * 80.0) - 500.0,
                            payment_mode="bank_transfer",
                            invoice_id=f"M-INV-{yr}-{proc_m:02d}",
                            delivery_status="delivered",
                            date=p_dt + timedelta(days=12),
                        ))

                # 60 Months of Mill Expenses
                for m in range(1, end_m + 1):
                    m_dt = date(yr, m, 5)
                    mfr_expenses.extend([
                        ManufacturerExpense(manufacturer_id=mfr.id, category="electricity", amount=14000.0 + (m * 200 % 1500), description=f"High Tension Industrial Power - {m_dt.strftime('%b %Y')}", expense_date=m_dt),
                        ManufacturerExpense(manufacturer_id=mfr.id, category="labour", amount=28000.0 + (yr - 2021) * 1000, description=f"Mill operators & loading team wages - {m_dt.strftime('%b %Y')}", expense_date=m_dt),
                        ManufacturerExpense(manufacturer_id=mfr.id, category="maintenance", amount=4500.0 + (m * 100 % 800), description=f"De-stoner, polisher & conveyor maintenance - {m_dt.strftime('%b %Y')}", expense_date=date(yr, m, 20)),
                    ])

            session.add_all(purchases)
            session.add_all(batches)
            session.add_all(mfr_sales)
            session.add_all(mfr_expenses)
            await session.flush()
            print(f" [OK] Seeded {len(purchases)} Mill Procurements, {len(batches)} Milling Batches, {len(mfr_sales)} Sales, and {len(mfr_expenses)} Operational Expenses.")

        # ── 13. CUSTOMER 5-YEAR PURCHASES (2021 - 2026) ───────────────
        cust_ord_res = await session.exec(select(CustomerOrder).where(CustomerOrder.customer_id == cust.id))
        if len(cust_ord_res.all()) < 15:
            print(" [...] Generating 5 years of Customer Purchases...")
            p_rice = mfr_prods.get("Steamed Basmati Rice 25kg") or list(prod_map.values())[0]
            p_atta = mfr_prods.get("Stone-Ground Whole Wheat Atta 10kg") or list(prod_map.values())[1]

            cust_orders = []
            for yr in range(2021, 2027):
                end_m = TODAY.month if yr == 2026 else 12
                # Bi-monthly household grocery purchases
                for m in [2, 4, 6, 8, 10, 12]:
                    if yr == 2026 and m > end_m:
                        continue
                    co_dt = datetime(yr, m, 8, 14, 30)
                    co = CustomerOrder(
                        customer_id=cust.id,
                        total_amount=p_rice.price + (p_atta.price * 2),
                        status="delivered",
                        created_at=co_dt,
                    )
                    session.add(co)
                    await session.flush()

                    coi1 = CustomerOrderItem(order_id=co.id, product_id=p_rice.id, seller_id=mfr.id, product_name=p_rice.name, quantity=1.0, price=p_rice.price)
                    coi2 = CustomerOrderItem(order_id=co.id, product_id=p_atta.id, seller_id=mfr.id, product_name=p_atta.name, quantity=2.0, price=p_atta.price)
                    session.add_all([coi1, coi2])

            print(" [OK] Multi-year Customer Orders verified.")

        # ── 14. Commit everything cleanly ─────────────────────────────
        await session.commit()

        print("\n" + "=" * 70)
        print("  🎉 5-YEAR COMPLETE DEMO DATA SEEDED SUCCESSFULLY!")
        print("=" * 70)
        print("Accounts & Passwords:")
        print("  🌾 Farmer:       demo@farmer.com       / demo123 (Ravi Kumar Reddy - 14 Crop Seasons)")
        print("  🏪 Shop Owner:   demo@shop.com         / demo123 (Venkat Rao Potti - 100+ Orders, 60 Mo Accounting)")
        print("  🏭 Manufacturer: demo@manufacturer.com / demo123 (Prasad Babu Reddy - 5-Yr Milling & Procurements)")
        print("  🛍️ Customer:     demo@customer.com     / demo123 (Priya Sharma - Multi-year Grocery & Farm Orders)")
        print("=" * 70 + "\n")

if __name__ == "__main__":
    asyncio.run(seed_5year_data())


"""
AgriFlow Database Loader
========================
Reads agriflow_seed_data.xlsx and inserts all users + profiles + transactional data
into the PostgreSQL database.

Run:  python seed_data/load_to_db.py
"""

import os
import sys
import random
import asyncio
from datetime import datetime, timedelta, date
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv
load_dotenv(str(Path(__file__).resolve().parent.parent / ".env"))

from openpyxl import load_workbook
import bcrypt
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, select

# Import all models
from app.models.user import User, UserRole
from app.models.farmer import FarmerProfile, LandRecord
from app.models.crop import Crop, CropExpense, CropHarvest, CropSale
from app.models.shop import ShopProfile
from app.models.manufacturer import MillProfile, ManufacturerPurchase, ProductionBatch, ManufacturerSale
from app.models.customer import CustomerProfile, CustomerOrder, CustomerOrderItem
from app.models.trade import Product, ShopOrder, ShopOrderItem
from app.models.expense import ShopExpense
from app.models.shop_accounting import ShopAccountingExpense
from app.models.manufacturer_expense import ManufacturerExpense

random.seed(42)

# ─── Crop data for generating realistic farming history ──────────────────────

CROPS_DATA = {
    "Kharif": [
        {"name": "Paddy", "type": "Cereal", "varieties": ["Sona Masuri", "BPT 5204", "IR-64", "Swarna", "Tellahamsa"], "yield_range": (15, 35), "price_range": (1800, 2500), "cost_per_acre": (12000, 22000)},
        {"name": "Maize", "type": "Cereal", "varieties": ["DHM-117", "Kaveri 50", "NK-6240"], "yield_range": (20, 40), "price_range": (1400, 2100), "cost_per_acre": (10000, 18000)},
        {"name": "Cotton", "type": "Commercial", "varieties": ["Bt Cotton", "Bunny", "Mallika"], "yield_range": (8, 18), "price_range": (5500, 7200), "cost_per_acre": (15000, 30000)},
        {"name": "Soybean", "type": "Oilseed", "varieties": ["JS-335", "JS-9560", "NRC-37"], "yield_range": (8, 15), "price_range": (3800, 5200), "cost_per_acre": (8000, 15000)},
        {"name": "Groundnut", "type": "Oilseed", "varieties": ["TMV-2", "JL-501", "Kadiri-6"], "yield_range": (10, 20), "price_range": (4500, 6500), "cost_per_acre": (12000, 20000)},
        {"name": "Chilli", "type": "Spice", "varieties": ["Teja", "Byadgi", "S-4"], "yield_range": (5, 15), "price_range": (8000, 18000), "cost_per_acre": (25000, 45000)},
        {"name": "Sugarcane", "type": "Commercial", "varieties": ["Co-86032", "CoC-671", "Co-0238"], "yield_range": (300, 500), "price_range": (280, 350), "cost_per_acre": (35000, 60000)},
        {"name": "Jowar", "type": "Cereal", "varieties": ["CSV-15", "CSH-16", "Maldandi"], "yield_range": (8, 18), "price_range": (2200, 3200), "cost_per_acre": (6000, 12000)},
    ],
    "Rabi": [
        {"name": "Wheat", "type": "Cereal", "varieties": ["PBW-343", "HD-2967", "Lok-1"], "yield_range": (15, 30), "price_range": (1900, 2600), "cost_per_acre": (10000, 18000)},
        {"name": "Chickpea", "type": "Pulse", "varieties": ["JG-11", "JAKI-9218", "Vijay"], "yield_range": (6, 12), "price_range": (4200, 5800), "cost_per_acre": (8000, 14000)},
        {"name": "Mustard", "type": "Oilseed", "varieties": ["Pusa Bold", "RH-749", "Bio-902"], "yield_range": (6, 12), "price_range": (4500, 6000), "cost_per_acre": (6000, 11000)},
        {"name": "Onion", "type": "Vegetable", "varieties": ["Nasik Red", "Bellary Red", "Pusa Ratnar"], "yield_range": (80, 150), "price_range": (800, 2500), "cost_per_acre": (30000, 50000)},
        {"name": "Potato", "type": "Vegetable", "varieties": ["Kufri Jyoti", "Kufri Pukhraj"], "yield_range": (80, 150), "price_range": (600, 1500), "cost_per_acre": (35000, 55000)},
        {"name": "Bengal Gram", "type": "Pulse", "varieties": ["JG-11", "JG-14", "KAK-2"], "yield_range": (5, 10), "price_range": (4500, 6200), "cost_per_acre": (7000, 12000)},
    ],
}

EXPENSE_TYPES = {
    "Input": [
        ("Seed", "kg", 5, 50, 30, 200),
        ("Fertilizer (DAP)", "bag", 1, 5, 1100, 1400),
        ("Fertilizer (Urea)", "bag", 1, 4, 250, 320),
        ("Fertilizer (MOP)", "bag", 1, 3, 800, 1050),
        ("Pesticide", "liter", 0.5, 3, 300, 900),
        ("Herbicide", "liter", 0.5, 2, 250, 700),
        ("Micronutrients", "kg", 1, 5, 40, 80),
    ],
    "Labor": [
        ("Ploughing Labour", "days", 2, 5, 400, 700),
        ("Sowing Labour", "days", 1, 3, 350, 600),
        ("Weeding Labour", "days", 2, 6, 300, 550),
        ("Spraying Labour", "days", 1, 3, 350, 500),
        ("Harvesting Labour", "days", 3, 8, 400, 700),
    ],
    "Machinery": [
        ("Tractor Hire", "hours", 3, 10, 500, 1000),
        ("Rotavator", "hours", 2, 5, 600, 1200),
        ("Harvester Hire", "hours", 2, 6, 800, 1500),
    ],
    "Irrigation": [
        ("Borewell Electricity", "months", 1, 5, 800, 2500),
        ("Diesel Pump Fuel", "liters", 10, 50, 85, 95),
    ],
}

EXPENSE_STAGES = ["Sowing", "Germination", "Vegetative", "Flowering", "Fruiting", "Harvesting", "Post-Harvest"]

SHOP_PRODUCTS_DATA = [
    {"name": "DAP Fertilizer", "category": "fertilizer", "brand": "IFFCO", "unit": "bag", "qty_per_unit": 50, "cost": 1150, "price": 1350},
    {"name": "Urea", "category": "fertilizer", "brand": "IFFCO", "unit": "bag", "qty_per_unit": 50, "cost": 266, "price": 300},
    {"name": "MOP Potash", "category": "fertilizer", "brand": "IPL", "unit": "bag", "qty_per_unit": 50, "cost": 850, "price": 1000},
    {"name": "NPK 20-20-0", "category": "fertilizer", "brand": "Coromandel", "unit": "bag", "qty_per_unit": 50, "cost": 1100, "price": 1280},
    {"name": "Imidacloprid 17.8 SL", "category": "pesticide", "brand": "Bayer", "unit": "liter", "qty_per_unit": 1, "cost": 800, "price": 1050},
    {"name": "Chlorpyriphos 20 EC", "category": "pesticide", "brand": "Dhanuka", "unit": "liter", "qty_per_unit": 1, "cost": 350, "price": 480},
    {"name": "Carbendazim 50 WP", "category": "pesticide", "brand": "BASF", "unit": "packet", "qty_per_unit": 0.5, "cost": 180, "price": 260},
    {"name": "Paddy Seed BPT-5204", "category": "seeds", "brand": "NSC", "unit": "kg", "qty_per_unit": 10, "cost": 45, "price": 65},
    {"name": "Maize Seed Hybrid", "category": "seeds", "brand": "Kaveri", "unit": "kg", "qty_per_unit": 5, "cost": 180, "price": 250},
    {"name": "Neem Oil", "category": "pesticide", "brand": "Multiplex", "unit": "liter", "qty_per_unit": 1, "cost": 200, "price": 300},
    {"name": "Vermicompost", "category": "fertilizer", "brand": "Organic Gold", "unit": "bag", "qty_per_unit": 50, "cost": 300, "price": 450},
    {"name": "Zinc Sulphate", "category": "fertilizer", "brand": "Tata", "unit": "kg", "qty_per_unit": 25, "cost": 40, "price": 55},
]

# ─── Password hashing ────────────────────────────────────────────────────────
# Pre-compute hashes for the 4 standard passwords
_hash_cache = {}
def get_hash(password: str) -> str:
    if password not in _hash_cache:
        salt = bcrypt.gensalt()
        _hash_cache[password] = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    return _hash_cache[password]


# ─── Database setup ──────────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set in .env")
    sys.exit(1)

engine = create_async_engine(DATABASE_URL, echo=False, pool_size=10, max_overflow=20)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


def rand_date_between(start: datetime, end: datetime) -> datetime:
    delta = (end - start).days
    if delta <= 0:
        return start
    return start + timedelta(days=random.randint(0, delta))


# ═══════════════════════════════════════════════════════════════════════════════
#                          LOAD DATA
# ═══════════════════════════════════════════════════════════════════════════════

async def load_all():
    xlsx_path = os.path.join(os.path.dirname(__file__), "agriflow_seed_data.xlsx")
    if not os.path.exists(xlsx_path):
        print(f"ERROR: {xlsx_path} not found. Run generate_excel.py first.")
        sys.exit(1)

    print("Loading Excel workbook...")
    wb = load_workbook(xlsx_path, read_only=True)
    
    print("Pre-computing password hashes...")
    farmer_hash = get_hash("Farmer@123")
    shop_hash = get_hash("Shop@123")
    mill_hash = get_hash("Mill@123")
    customer_hash = get_hash("Customer@123")

    # ─── 1. Load Farmers ──────────────────────────────────────────────────────
    ws = wb["farmers"]
    rows = list(ws.iter_rows(min_row=2, values_only=True))
    total_farmers = len(rows)
    print(f"\n{'='*60}")
    print(f"  LOADING {total_farmers} FARMERS")
    print(f"{'='*60}")

    farmer_user_ids = []
    batch_size = 500

    for batch_start in range(0, total_farmers, batch_size):
        batch_end = min(batch_start + batch_size, total_farmers)
        batch = rows[batch_start:batch_end]
        
        async with async_session() as session:
            for row in batch:
                (email, phone, password, full_name, farmer_id,
                 father_name, gender, relation_type,
                 house_no, street, village, mandal, district, state, pincode,
                 total_area, aadhaar_last_4, bank_name, account_number, ifsc_code,
                 land_serial_1, land_area_1, land_serial_2, land_area_2) = row

                # Create User
                user = User(
                    email=email,
                    phone_number=str(phone),
                    full_name=full_name,
                    role=UserRole.FARMER,
                    is_active=True,
                    hashed_password=farmer_hash,
                )
                session.add(user)
                await session.flush()

                # Create FarmerProfile
                profile = FarmerProfile(
                    user_id=user.id,
                    farmer_id=farmer_id,
                    father_husband_name=father_name,
                    phone_number=str(phone),
                    gender=gender,
                    relation_type=relation_type,
                    house_no=str(house_no) if house_no else None,
                    street=street,
                    village=village,
                    mandal=mandal,
                    district=district,
                    state=state,
                    pincode=str(pincode),
                    total_area=float(total_area),
                    aadhaar_last_4=str(aadhaar_last_4),
                    bank_name=bank_name,
                    account_number=str(account_number),
                    ifsc_code=ifsc_code,
                )
                session.add(profile)
                await session.flush()

                # Land Records
                if land_serial_1 and land_area_1:
                    lr1 = LandRecord(
                        farmer_profile_id=profile.id,
                        serial_number=str(land_serial_1),
                        area=float(land_area_1),
                    )
                    session.add(lr1)
                if land_serial_2 and land_area_2:
                    lr2 = LandRecord(
                        farmer_profile_id=profile.id,
                        serial_number=str(land_serial_2),
                        area=float(land_area_2),
                    )
                    session.add(lr2)

                farmer_user_ids.append(user.id)

            await session.commit()
        
        pct = int((batch_end / total_farmers) * 100)
        print(f"    Farmers: {batch_end}/{total_farmers} ({pct}%)")

    print(f"  [OK] {total_farmers} farmers + profiles + land records inserted")

    # ─── 2. Generate Crops + Expenses + Harvests + Sales for Farmers ──────────
    print(f"\n{'='*60}")
    print(f"  GENERATING CROP HISTORY (2-5 years per farmer)")
    print(f"{'='*60}")

    now = datetime.utcnow()
    crop_count = 0
    expense_count = 0
    harvest_count = 0
    sale_count = 0

    for batch_start in range(0, len(farmer_user_ids), batch_size):
        batch_end = min(batch_start + batch_size, len(farmer_user_ids))
        batch_ids = farmer_user_ids[batch_start:batch_end]

        async with async_session() as session:
            for user_id in batch_ids:
                # Each farmer gets 2-5 years of crop history
                years_back = random.randint(2, 5)
                farmer_area = random.uniform(1.5, 20.0)

                for year_offset in range(years_back):
                    year = now.year - year_offset
                    # 1-2 crops per season, pick 1-2 seasons
                    seasons_to_grow = random.sample(["Kharif", "Rabi"], k=random.choice([1, 2]))

                    for season in seasons_to_grow:
                        crop_data = random.choice(CROPS_DATA[season])
                        crop_area = round(random.uniform(0.5, min(farmer_area, 10.0)), 1)
                        variety = random.choice(crop_data["varieties"])

                        if season == "Kharif":
                            sowing_month = random.randint(6, 7)
                            harvest_month = random.randint(10, 12)
                        else:
                            sowing_month = random.randint(10, 11)
                            harvest_month = random.randint(2, 4)
                            if harvest_month <= 4:
                                harvest_year = year + 1
                            else:
                                harvest_year = year

                        sowing_date = datetime(year, sowing_month, random.randint(1, 28))
                        if season == "Rabi":
                            expected_harvest = datetime(year + 1 if harvest_month <= 4 else year, harvest_month, random.randint(1, 28))
                        else:
                            expected_harvest = datetime(year, harvest_month, random.randint(1, 28))

                        # Determine if crop is completed
                        is_past = expected_harvest < now
                        status = "Harvested" if is_past else "Growing"
                        actual_harvest = expected_harvest + timedelta(days=random.randint(-5, 10)) if is_past else None

                        actual_yield = round(random.uniform(*crop_data["yield_range"]) * crop_area, 1) if is_past else 0
                        price_per_unit = round(random.uniform(*crop_data["price_range"]), 0) if is_past else 0
                        total_revenue = round(actual_yield * price_per_unit, 0) if is_past else 0
                        total_cost_val = round(random.uniform(*crop_data["cost_per_acre"]) * crop_area, 0)
                        net_profit = round(total_revenue - total_cost_val, 0) if is_past else 0

                        crop = Crop(
                            user_id=user_id,
                            name=crop_data["name"],
                            area=crop_area,
                            season=season,
                            variety=variety,
                            sowing_date=sowing_date,
                            expected_harvest_date=expected_harvest,
                            status=status,
                            crop_type=crop_data["type"],
                            actual_harvest_date=actual_harvest,
                            actual_yield=actual_yield,
                            selling_price_per_unit=price_per_unit,
                            total_revenue=total_revenue,
                            total_cost=total_cost_val,
                            net_profit=net_profit,
                            created_at=sowing_date,
                        )
                        session.add(crop)
                        await session.flush()
                        crop_count += 1

                        # Generate 3-7 expenses per crop
                        num_expenses = random.randint(3, 7)
                        remaining_cost = total_cost_val
                        for exp_i in range(num_expenses):
                            cat = random.choice(list(EXPENSE_TYPES.keys()))
                            exp_type_data = random.choice(EXPENSE_TYPES[cat])
                            exp_name, unit, qty_min, qty_max, unit_cost_min, unit_cost_max = exp_type_data
                            qty = round(random.uniform(qty_min, qty_max), 1)
                            unit_cost = round(random.uniform(unit_cost_min, unit_cost_max), 0)
                            exp_total = round(qty * unit_cost, 0)
                            stage = random.choice(EXPENSE_STAGES)
                            exp_date = rand_date_between(sowing_date, actual_harvest if actual_harvest else expected_harvest)

                            expense = CropExpense(
                                crop_id=crop.id,
                                category=cat,
                                type=exp_name,
                                quantity=qty,
                                unit=unit,
                                unit_cost=unit_cost,
                                total_cost=exp_total,
                                date=exp_date,
                                payment_mode=random.choice(["cash", "digital"]),
                                unit_size=1.0,
                                duration=qty if cat == "Labor" else 1.0,
                                stage=stage,
                            )
                            session.add(expense)
                            expense_count += 1

                        # Generate harvest records for past crops
                        if is_past and actual_yield > 0:
                            num_harvests = random.randint(1, 3)
                            remaining_yield = actual_yield
                            for h_i in range(num_harvests):
                                if remaining_yield <= 0:
                                    break
                                h_qty = round(remaining_yield / (num_harvests - h_i) * random.uniform(0.8, 1.2), 1)
                                h_qty = min(h_qty, remaining_yield)
                                remaining_yield -= h_qty
                                h_date = actual_harvest + timedelta(days=h_i * random.randint(5, 15))
                                h_revenue = round(h_qty * price_per_unit, 0)
                                
                                harvest = CropHarvest(
                                    crop_id=crop.id,
                                    date=h_date,
                                    stage=["First Picking", "Second Picking", "Final Harvest"][min(h_i, 2)],
                                    quantity=h_qty,
                                    unit="Quintals",
                                    quality=random.choice(["Grade A", "Grade A", "Grade B", "Grade B", "Grade C"]),
                                    selling_price_per_unit=price_per_unit,
                                    total_revenue=h_revenue,
                                    buyer_type=random.choice(["Market", "Private", "Government"]),
                                    sold_to=random.choice(["Local Mandi", "FCI", "Private Trader", "Mill", "Direct Buyer"]),
                                    status="Sold",
                                    created_at=h_date,
                                )
                                session.add(harvest)
                                harvest_count += 1

                            # Generate 1 sale record for completed crops
                            sale_date = actual_harvest + timedelta(days=random.randint(1, 30))
                            bag_size = random.choice([50, 75, 100])
                            total_bags = max(1, int(actual_yield * 100 / bag_size))
                            
                            sale = CropSale(
                                crop_id=crop.id,
                                date=sale_date,
                                buyer_type=random.choice(["Mill", "Market", "Trader", "Direct"]),
                                buyer_name=random.choice(["Local Mandi", "Sri Lakshmi Mill", "FCI Depot", "Private Trader", "Agri Market Yard"]),
                                quantity_quintals=actual_yield,
                                total_bags=total_bags,
                                bag_size=bag_size,
                                price_per_quintal=price_per_unit,
                                total_revenue=total_revenue,
                                payment_mode=random.choice(["cash", "digital", "cash"]),
                                status="sold",
                                created_at=sale_date,
                            )
                            session.add(sale)
                            sale_count += 1

            await session.commit()
        
        pct = int((batch_end / len(farmer_user_ids)) * 100)
        print(f"    Crop history: {batch_end}/{len(farmer_user_ids)} farmers ({pct}%) | "
              f"Crops:{crop_count} Expenses:{expense_count} Harvests:{harvest_count} Sales:{sale_count}")

    print(f"  [OK] Crop history: {crop_count} crops, {expense_count} expenses, {harvest_count} harvests, {sale_count} sales")

    # ─── 3. Load Shops ────────────────────────────────────────────────────────
    ws = wb["shops"]
    shop_rows = list(ws.iter_rows(min_row=2, values_only=True))
    total_shops = len(shop_rows)
    print(f"\n{'='*60}")
    print(f"  LOADING {total_shops} SHOPS")
    print(f"{'='*60}")

    shop_user_ids = []

    async with async_session() as session:
        for row in shop_rows:
            (email, phone, password, full_name,
             shop_name, license_number, shop_id, father_name, relation_type, owner_name,
             aadhaar_number, pan_number,
             shop_address, landmark,
             house_no, street, village, mandal, district, state, pincode,
             bank_name, account_number, ifsc_code) = row

            user = User(
                email=email,
                phone_number=str(phone),
                full_name=full_name,
                role=UserRole.SHOP,
                is_active=True,
                hashed_password=shop_hash,
            )
            session.add(user)
            await session.flush()

            profile = ShopProfile(
                user_id=user.id,
                shop_name=shop_name,
                license_number=license_number,
                shop_id=shop_id,
                father_name=father_name,
                relation_type=relation_type,
                owner_name=owner_name,
                aadhaar_number=str(aadhaar_number),
                pan_number=pan_number,
                shop_address=shop_address,
                landmark=landmark,
                house_no=str(house_no) if house_no else None,
                street=street,
                village=village,
                mandal=mandal,
                district=district,
                state=state,
                pincode=str(pincode),
                bank_name=bank_name,
                account_number=str(account_number),
                ifsc_code=ifsc_code,
            )
            session.add(profile)
            shop_user_ids.append(user.id)

        await session.commit()
    print(f"  [OK] {total_shops} shops + profiles inserted")

    # ─── 4. Generate Products + Orders for Shops ──────────────────────────────
    print(f"\n  Generating shop products & orders...")
    product_count = 0
    order_count = 0

    for batch_start in range(0, len(shop_user_ids), 50):
        batch_end = min(batch_start + 50, len(shop_user_ids))
        batch_ids = shop_user_ids[batch_start:batch_end]

        async with async_session() as session:
            for shop_uid in batch_ids:
                # Each shop gets 8-15 products
                num_products = random.randint(8, 15)
                shop_products = random.sample(SHOP_PRODUCTS_DATA, min(num_products, len(SHOP_PRODUCTS_DATA)))
                product_ids_for_shop = []

                for pd in shop_products:
                    qty = random.randint(20, 500)
                    product = Product(
                        user_id=shop_uid,
                        name=pd["name"],
                        category=pd["category"],
                        brand=pd["brand"],
                        price=pd["price"],
                        cost_price=pd["cost"],
                        quantity=qty,
                        unit=pd["unit"],
                        quantity_per_unit=pd["qty_per_unit"],
                        measure_unit="kg",
                        batch_number=f"BATCH-{random.randint(10000, 99999)}",
                        description=f"{pd['name']} - {pd['brand']}",
                        low_stock_threshold=10,
                        status="active",
                        created_at=rand_date_between(datetime(2022, 1, 1), now),
                    )
                    session.add(product)
                    await session.flush()
                    product_ids_for_shop.append((product.id, pd))
                    product_count += 1

                # Generate 30-120 orders per shop over 2-4 years
                num_orders = random.randint(30, 120)
                for _ in range(num_orders):
                    order_date = rand_date_between(datetime(2022, 1, 1), now)
                    # 1-4 items per order
                    num_items = random.randint(1, 4)
                    items_selected = random.sample(product_ids_for_shop, min(num_items, len(product_ids_for_shop)))
                    
                    total = 0.0
                    order_items = []
                    for pid, pd in items_selected:
                        qty = random.randint(1, 10)
                        subtotal = round(pd["price"] * qty, 0)
                        total += subtotal
                        order_items.append((pid, pd["name"], qty, pd["price"], subtotal))

                    discount = round(total * random.choice([0, 0, 0, 0.02, 0.05, 0.1]), 0)
                    final_amount = total - discount
                    farmer_id = random.choice(farmer_user_ids) if random.random() > 0.3 else None

                    order = ShopOrder(
                        shop_id=shop_uid,
                        farmer_id=farmer_id,
                        farmer_name=f"Farmer #{farmer_id}" if farmer_id else "Walk-in Customer",
                        total_amount=total,
                        discount=discount,
                        final_amount=final_amount,
                        payment_mode=random.choice(["cash", "cash", "upi", "credit"]),
                        payment_status="paid",
                        status="completed",
                        created_at=order_date,
                    )
                    session.add(order)
                    await session.flush()
                    order_count += 1

                    for pid, pname, qty, price, subtotal in order_items:
                        oi = ShopOrderItem(
                            order_id=order.id,
                            product_id=pid,
                            product_name=pname,
                            quantity=qty,
                            unit_price=price,
                            subtotal=subtotal,
                        )
                        session.add(oi)

                    # Shop expense for some orders
                    if random.random() > 0.6:
                        se = ShopExpense(
                            order_id=order.id,
                            transportation=round(random.uniform(50, 500), 0),
                            labour=round(random.uniform(100, 800), 0),
                            other=round(random.uniform(0, 200), 0),
                            created_at=order_date,
                        )
                        session.add(se)

            await session.commit()
        print(f"    Shop products & orders: {batch_end}/{len(shop_user_ids)} shops | Products:{product_count} Orders:{order_count}")

    print(f"  [OK] {product_count} products, {order_count} orders")

    # ─── 5. Load Mills ────────────────────────────────────────────────────────
    ws = wb["mills"]
    mill_rows = list(ws.iter_rows(min_row=2, values_only=True))
    total_mills = len(mill_rows)
    print(f"\n{'='*60}")
    print(f"  LOADING {total_mills} MILLS")
    print(f"{'='*60}")

    mill_user_ids = []

    async with async_session() as session:
        for row in mill_rows:
            (email, phone, password, full_name,
             mill_name, license_number, mill_id, father_name, relation_type, owner_name,
             aadhaar_number, pan_number,
             house_no, street, village, mandal, district, state, pincode,
             location_text,
             bank_name, account_number, ifsc_code) = row

            user = User(
                email=email,
                phone_number=str(phone),
                full_name=full_name,
                role=UserRole.MANUFACTURER,
                is_active=True,
                hashed_password=mill_hash,
            )
            session.add(user)
            await session.flush()

            profile = MillProfile(
                user_id=user.id,
                mill_name=mill_name,
                license_number=license_number,
                mill_id=mill_id,
                father_name=father_name,
                relation_type=relation_type,
                owner_name=owner_name,
                aadhaar_number=str(aadhaar_number),
                pan_number=pan_number,
                house_no=str(house_no) if house_no else None,
                street=street,
                village=village,
                mandal=mandal,
                district=district,
                state=state,
                pincode=str(pincode),
                location_text=location_text,
                bank_name=bank_name,
                account_number=str(account_number),
                ifsc_code=ifsc_code,
            )
            session.add(profile)
            mill_user_ids.append(user.id)

        await session.commit()
    print(f"  [OK] {total_mills} mills + profiles inserted")

    # ─── 6. Generate Mill Purchases & Expenses ────────────────────────────────
    print(f"\n  Generating mill purchases & expenses...")
    purchase_count = 0
    mill_expense_count = 0

    async with async_session() as session:
        for mill_uid in mill_user_ids:
            # 10-30 purchases per mill
            num_purchases = random.randint(10, 30)
            for p_i in range(num_purchases):
                p_date = rand_date_between(datetime(2022, 1, 1), now)
                crop_name = random.choice(["Paddy", "Wheat", "Maize", "Groundnut", "Soybean", "Sugarcane"])
                qty = round(random.uniform(10, 200), 0)
                price_per = round(random.uniform(1500, 5000), 0)
                total_cost = round(qty * price_per, 0)
                transport = round(random.uniform(500, 5000), 0)
                farmer_id_ref = random.choice(farmer_user_ids)

                purchase = ManufacturerPurchase(
                    manufacturer_id=mill_uid,
                    farmer_id=farmer_id_ref,
                    farmer_name=f"Farmer #{farmer_id_ref}",
                    crop_name=crop_name,
                    quantity=qty,
                    unit="quintals",
                    price_per_unit=price_per,
                    total_cost=total_cost,
                    transport_cost=transport,
                    quality_grade=random.choice(["A", "A", "B", "B", "C"]),
                    batch_id=f"M-PUR-{purchase_count + 1}",
                    date=p_date,
                )
                session.add(purchase)
                purchase_count += 1

            # 5-15 expenses per mill
            for _ in range(random.randint(5, 15)):
                exp = ManufacturerExpense(
                    manufacturer_id=mill_uid,
                    category=random.choice(["electricity", "labour", "maintenance", "fuel", "rent", "packaging"]),
                    amount=round(random.uniform(5000, 100000), 0),
                    description=random.choice(["Monthly electricity", "Workers salary", "Machine maintenance", "Diesel for generator", "Warehouse rent", "Gunny bags purchase"]),
                    expense_date=rand_date_between(date(2022, 1, 1), date.today()),
                    created_at=datetime.utcnow(),
                )
                session.add(exp)
                mill_expense_count += 1

        await session.commit()
    print(f"  [OK] {purchase_count} purchases, {mill_expense_count} mill expenses")

    # ─── 7. Load Customers ────────────────────────────────────────────────────
    ws = wb["customers"]
    customer_rows = list(ws.iter_rows(min_row=2, values_only=True))
    total_customers = len(customer_rows)
    print(f"\n{'='*60}")
    print(f"  LOADING {total_customers} CUSTOMERS")
    print(f"{'='*60}")

    customer_user_ids = []

    for batch_start in range(0, total_customers, batch_size):
        batch_end = min(batch_start + batch_size, total_customers)
        batch = customer_rows[batch_start:batch_end]

        async with async_session() as session:
            for row in batch:
                (email, phone, password, full_name,
                 father_name, relation_type, id_number,
                 house_no, street, village, mandal, district, state, pincode,
                 bank_name, account_number, ifsc_code) = row

                user = User(
                    email=email,
                    phone_number=str(phone),
                    full_name=full_name,
                    role=UserRole.CUSTOMER,
                    is_active=True,
                    hashed_password=customer_hash,
                )
                session.add(user)
                await session.flush()

                profile = CustomerProfile(
                    user_id=user.id,
                    father_name=father_name,
                    phone_number=str(phone),
                    relation_type=relation_type,
                    id_number=str(id_number),
                    house_no=str(house_no) if house_no else None,
                    street=street,
                    village=village,
                    mandal=mandal,
                    district=district,
                    state=state,
                    pincode=str(pincode),
                    bank_name=bank_name,
                    account_number=str(account_number),
                    ifsc_code=ifsc_code,
                )
                session.add(profile)
                customer_user_ids.append(user.id)

            await session.commit()
        pct = int((batch_end / total_customers) * 100)
        print(f"    Customers: {batch_end}/{total_customers} ({pct}%)")

    print(f"  [OK] {total_customers} customers + profiles inserted")

    # ─── Final Summary ────────────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"  SEED DATA LOAD COMPLETE")
    print(f"{'='*60}")
    print(f"  Users:          {total_farmers + total_shops + total_mills + total_customers:,}")
    print(f"    Farmers:      {total_farmers:,}")
    print(f"    Shops:        {total_shops:,}")
    print(f"    Mills:        {total_mills:,}")
    print(f"    Customers:    {total_customers:,}")
    print(f"  Crops:          {crop_count:,}")
    print(f"  Crop Expenses:  {expense_count:,}")
    print(f"  Harvests:       {harvest_count:,}")
    print(f"  Crop Sales:     {sale_count:,}")
    print(f"  Products:       {product_count:,}")
    print(f"  Shop Orders:    {order_count:,}")
    print(f"  Purchases:      {purchase_count:,}")
    print(f"  Mill Expenses:  {mill_expense_count:,}")
    print(f"{'='*60}")
    print(f"\n  Passwords:")
    print(f"    Farmer:   Farmer@123")
    print(f"    Shop:     Shop@123")
    print(f"    Mill:     Mill@123")
    print(f"    Customer: Customer@123")


if __name__ == "__main__":
    asyncio.run(load_all())

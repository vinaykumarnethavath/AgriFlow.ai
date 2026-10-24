"""
Seed script to populate PostgreSQL database with realistic synthetic demo data
for demo@farmer.com, demo@shop.com, demo@manufacturer.com, demo@customer.com.
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

now = datetime.utcnow()
today = date.today()

async def run_seed():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    print("[OK] Database tables verified.")

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Check and get/create demo users
        hashed_pwd = get_password_hash("demo123")

        role_configs = [
            ("demo@farmer.com", "Ravi Kumar Reddy", "farmer", "9876543210"),
            ("demo@shop.com", "Venkat Rao Potti", "shop", "9848012345"),
            ("demo@manufacturer.com", "Prasad Babu Reddy", "manufacturer", "9700012345"),
            ("demo@customer.com", "Priya Sharma", "customer", "9900112233"),
        ]

        users = {}
        for email, name, role, phone in role_configs:
            res = await session.exec(select(User).where(User.email == email))
            u = res.first()
            if not u:
                u = User(
                    email=email,
                    phone_number=phone,
                    full_name=name,
                    role=role,
                    is_active=True,
                    hashed_password=hashed_pwd
                )
                session.add(u)
                await session.flush()
                print(f"[OK] Created User: {email} ({role}) -> ID {u.id}")
            else:
                u.full_name = name
                u.phone_number = phone
                session.add(u)
                await session.flush()
                print(f"[EXISTS] User: {email} -> ID {u.id}")
            users[role] = u

        farmer = users["farmer"]
        shop = users["shop"]
        mfr = users["manufacturer"]
        cust = users["customer"]

        # ── 1. Farmer Profile & Land Records ─────────────────────────────
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

            l1 = LandRecord(farmer_profile_id=f_prof.id, serial_number="KR/2021/001", area=2.30)
            l2 = LandRecord(farmer_profile_id=f_prof.id, serial_number="KR/2021/002", area=3.10)
            l3 = LandRecord(farmer_profile_id=f_prof.id, serial_number="KR/2021/003", area=1.80)
            session.add_all([l1, l2, l3])
            await session.flush()
            print("[OK] Farmer Profile & Land Records seeded")

        # ── 2. Farmer Crops & Expenses ────────────────────────────────────
        crops_res = await session.exec(select(Crop).where(Crop.user_id == farmer.id))
        existing_crops = crops_res.all()
        if not existing_crops:
            crop1 = Crop(
                user_id=farmer.id,
                name="Paddy (BPT-5204)",
                area=3.10,
                season="Kharif",
                variety="BPT-5204 Samba Masoori",
                sowing_date=now - timedelta(days=75),
                expected_harvest_date=now + timedelta(days=45),
                status="Growing",
                crop_type="Cereal",
                notes="Excellent vegetative growth. 2nd urea dose applied.",
                total_cost=28500,
                total_revenue=0,
                net_profit=0,
            )
            crop2 = Crop(
                user_id=farmer.id,
                name="Cotton (Bunny BT)",
                area=2.30,
                season="Kharif",
                variety="Bunny BT",
                sowing_date=now - timedelta(days=95),
                expected_harvest_date=now + timedelta(days=35),
                status="Growing",
                crop_type="Fiber",
                notes="Boll development stage. Regular monitoring for pink bollworm.",
                total_cost=31200,
                total_revenue=0,
                net_profit=0,
            )
            crop3 = Crop(
                user_id=farmer.id,
                name="Maize (Hybrid)",
                area=1.80,
                season="Zaid",
                variety="Kaveri Super-55",
                sowing_date=now - timedelta(days=120),
                expected_harvest_date=now - timedelta(days=10),
                actual_harvest_date=now - timedelta(days=8),
                status="Harvested",
                crop_type="Cereal",
                notes="Harvest complete. Yield: 11.16 tons (6.2 T/acre).",
                actual_yield=11.2,
                selling_price_per_unit=1890,
                total_revenue=42336,
                total_cost=18500,
                net_profit=23836,
            )
            session.add_all([crop1, crop2, crop3])
            await session.flush()

            # Add expenses
            c_expenses = [
                CropExpense(crop_id=crop1.id, category="Input", type="Seed", quantity=30, unit="kg", unit_cost=65, total_cost=1950, date=now - timedelta(days=74), payment_mode="cash", stage="Sowing"),
                CropExpense(crop_id=crop1.id, category="Fertilizer", type="DAP Fertilizer", quantity=150, unit="kg", unit_cost=27, total_cost=4050, date=now - timedelta(days=70), payment_mode="digital", stage="Sowing"),
                CropExpense(crop_id=crop1.id, category="Fertilizer", type="Urea", quantity=200, unit="kg", unit_cost=5.4, total_cost=1080, date=now - timedelta(days=40), payment_mode="cash", stage="Watering"),
                CropExpense(crop_id=crop1.id, category="Labor", type="Transplanting", quantity=6, unit="days", unit_cost=600, total_cost=3600, date=now - timedelta(days=68), payment_mode="cash", stage="Sowing"),
                CropExpense(crop_id=crop2.id, category="Input", type="Seed", quantity=4, unit="packet", unit_cost=740, total_cost=2960, date=now - timedelta(days=94), payment_mode="digital", stage="Sowing"),
                CropExpense(crop_id=crop2.id, category="Pesticide", type="Chlorpyriphos 20 EC", quantity=3, unit="liter", unit_cost=620, total_cost=1860, date=now - timedelta(days=20), payment_mode="cash", stage="Flowering"),
            ]
            session.add_all(c_expenses)
            await session.flush()
            print("[OK] Farmer Crops & Expenses seeded")

        # ── 3. Shop Profile & Products ────────────────────────────────────
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
            print("[OK] Shop Profile seeded")

        prods_res = await session.exec(select(Product).where(Product.user_id == shop.id))
        products = prods_res.all()
        if not products:
            p1 = Product(user_id=shop.id, name="Urea 46-0-0 (50 kg)", short_name="Urea", category="fertilizer", brand="IFFCO", manufacturer="IFFCO", price=267, cost_price=240, quantity=245, unit="bag", quantity_per_unit=50, measure_unit="kg", batch_number="KAC-U01", status="active")
            p2 = Product(user_id=shop.id, name="DAP 18-46-0 (50 kg)", short_name="DAP", category="fertilizer", brand="Coromandel", manufacturer="Coromandel", price=1350, cost_price=1200, quantity=88, unit="bag", quantity_per_unit=50, measure_unit="kg", batch_number="KAC-D01", status="active")
            p3 = Product(user_id=shop.id, name="MOP Potash (50 kg)", short_name="MOP", category="fertilizer", brand="IPL", manufacturer="IPL", price=1100, cost_price=980, quantity=62, unit="bag", quantity_per_unit=50, measure_unit="kg", batch_number="KAC-M01", status="active")
            p4 = Product(user_id=shop.id, name="Chlorpyriphos 20 EC (1L)", short_name="Chlorpyriphos", category="pesticide", brand="Dhanuka", manufacturer="Dhanuka", price=620, cost_price=510, quantity=156, unit="bottle", quantity_per_unit=1, measure_unit="L", batch_number="KAC-P01", status="active")
            p5 = Product(user_id=shop.id, name="BPT-5204 Certified Seed (5kg)", short_name="BPT-5204", category="seeds", brand="AP State Seeds", manufacturer="APSSC", price=185, cost_price=145, quantity=420, unit="packet", quantity_per_unit=5, measure_unit="kg", batch_number="KAC-S01", status="active")
            p6 = Product(user_id=shop.id, name="Cotton Bunny BT Seeds (450g)", short_name="Bunny BT", category="seeds", brand="Rasi Seeds", manufacturer="Rasi", price=740, cost_price=640, quantity=35, unit="packet", quantity_per_unit=0.45, measure_unit="kg", batch_number="KAC-S02", status="active", low_stock_threshold=50)
            p7 = Product(user_id=shop.id, name="Drip Irrigation Inline Pipe (100m)", short_name="Drip 16mm", category="equipment", brand="Jain Irrigation", manufacturer="Jain", price=2800, cost_price=2300, quantity=18, unit="roll", quantity_per_unit=100, measure_unit="m", batch_number="KAC-E01", status="active")

            session.add_all([p1, p2, p3, p4, p5, p6, p7])
            await session.flush()
            products = [p1, p2, p3, p4, p5, p6, p7]
            print("[OK] Shop Products seeded")

        # ── 4. Farmer Orders from Shop ────────────────────────────────────
        orders_res = await session.exec(select(ShopOrder).where(ShopOrder.farmer_id == farmer.id))
        orders = orders_res.all()
        if not orders and products:
            p_map = {p.short_name: p for p in products}

            o1 = ShopOrder(
                shop_id=shop.id,
                farmer_id=farmer.id,
                farmer_name="Ravi Kumar Reddy",
                total_amount=8450,
                discount=265,
                final_amount=8185,
                payment_mode="upi",
                payment_status="paid",
                status="delivered",
                order_notes="Delivered to Kondapally field store",
                created_at=now - timedelta(days=12),
            )
            session.add(o1)
            await session.flush()

            oi1 = ShopOrderItem(order_id=o1.id, product_id=p_map["DAP"].id, product_name=p_map["DAP"].name, quantity=5, unit_price=1350, subtotal=6750)
            oi2 = ShopOrderItem(order_id=o1.id, product_id=p_map["Urea"].id, product_name=p_map["Urea"].name, quantity=5, unit_price=267, subtotal=1335)
            session.add_all([oi1, oi2])

            o2 = ShopOrder(
                shop_id=shop.id,
                farmer_id=farmer.id,
                farmer_name="Ravi Kumar Reddy",
                total_amount=2850,
                discount=0,
                final_amount=2850,
                payment_mode="card",
                payment_status="paid",
                status="out_for_delivery",
                order_notes="Delivery driver on the way",
                created_at=now - timedelta(days=2),
            )
            session.add(o2)
            await session.flush()

            oi3 = ShopOrderItem(order_id=o2.id, product_id=p_map["Chlorpyriphos"].id, product_name=p_map["Chlorpyriphos"].name, quantity=3, unit_price=620, subtotal=1860)
            oi4 = ShopOrderItem(order_id=o2.id, product_id=p_map["MOP"].id, product_name=p_map["MOP"].name, quantity=1, unit_price=1100, subtotal=1100)
            session.add_all([oi3, oi4])

            o3 = ShopOrder(
                shop_id=shop.id,
                farmer_id=farmer.id,
                farmer_name="Ravi Kumar Reddy",
                total_amount=5600,
                discount=100,
                final_amount=5500,
                payment_mode="cash",
                payment_status="pending",
                status="processing",
                order_notes="Packing sprinkler accessories",
                created_at=now - timedelta(hours=6),
            )
            session.add(o3)
            await session.flush()

            oi5 = ShopOrderItem(order_id=o3.id, product_id=p_map["Drip 16mm"].id, product_name=p_map["Drip 16mm"].name, quantity=2, unit_price=2800, subtotal=5600)
            session.add(oi5)
            await session.flush()
            print("[OK] Farmer Orders & Order Items seeded")

        # ── 5. Credit & Loans for Farmer ─────────────────────────────────
        loans_res = await session.exec(select(CreditLoan).where(CreditLoan.farmer_id == farmer.id))
        if not loans_res.first():
            loan1 = CreditLoan(
                farmer_id=farmer.id,
                source_type="bank",
                lender_name="State Bank of India (KCC)",
                purpose="Kharif & Rabi crop credit — Seeds, Fertilizers, Labor",
                principal_amount=150000.0,
                interest_rate_percent=4.0,
                interest_type="annual",
                start_date=today - timedelta(days=120),
                due_date=today + timedelta(days=240),
                amount_paid=62000.0,
                status="active",
                notes="Kisan Credit Card ₹1.5L limit. Subsidized interest rate under GoI scheme.",
            )
            session.add(loan1)
            await session.flush()

            rep1 = LoanRepayment(loan_id=loan1.id, payment_date=today - timedelta(days=60), amount=35000.0, payment_mode="bank_transfer", notes="Maize harvest sale installment")
            rep2 = LoanRepayment(loan_id=loan1.id, payment_date=today - timedelta(days=20), amount=27000.0, payment_mode="bank_transfer", notes="Second seasonal installment")
            session.add_all([rep1, rep2])
            print("[OK] Credit & Loans seeded")

        # ── 6. Crop Insurance for Farmer ─────────────────────────────────
        ins_res = await session.exec(select(CropInsurance).where(CropInsurance.farmer_id == farmer.id))
        if not ins_res.first():
            ins1 = CropInsurance(
                farmer_id=farmer.id,
                scheme_name="PM-Fasal Bima Yojana (PMFBY)",
                policy_number="PMFBY-AP-2026-K-88421",
                insured_crop_name="Paddy (BPT-5204)",
                season="Kharif 2026",
                area_insured_acres=3.10,
                sum_insured=186000.0,
                farmer_premium_paid=3720.0,
                gov_subsidy_amount=62800.0,
                insurance_company="Agriculture Insurance Company of India (AIC)",
                application_date=today - timedelta(days=70),
                policy_status="active",
                claim_status="none",
                notes="Coverage active for entire Kharif cycle against flood, pest attack, and dry spell.",
            )
            session.add(ins1)
            print("[OK] Crop Insurance seeded")

        # ── 7. Crop Storage for Farmer ────────────────────────────────────
        stor_res = await session.exec(select(CropStorage).where(CropStorage.farmer_id == farmer.id))
        if not stor_res.first():
            st1 = CropStorage(
                farmer_id=farmer.id,
                crop_name="Maize",
                variety="Hybrid",
                storage_type="cold_storage",
                facility_name="Kondapally Primary Cold Store",
                location="Kondapally Industrial Zone, Krishna AP",
                receipt_number="KPCS-2026-M-0842",
                bags_count=80,
                weight_quintals=40.0,
                bag_weight_kg=50.0,
                monthly_rent_per_bag=6.0,
                deposit_date=today - timedelta(days=15),
                expected_release_date=today + timedelta(days=45),
                status="stored",
                target_sell_price_per_quintal=2100.0,
                notes="Holding 40 qtl Maize for December peak price. Current rate: ₹1,890, target: ₹2,100.",
            )
            session.add(st1)
            print("[OK] Crop Storage seeded")

        # ── 8. Farm Calendar Events ──────────────────────────────────────
        cal_res = await session.exec(select(FarmEvent).where(FarmEvent.user_id == farmer.id))
        if not cal_res.first():
            ev1 = FarmEvent(user_id=farmer.id, title="Paddy Field Inspection (Block 2)", event_type="spraying", event_date=today + timedelta(days=1), description="Check water level and panicle emergence", is_completed=False, color="#22c55e")
            ev2 = FarmEvent(user_id=farmer.id, title="Cotton Second Picking", event_type="harvest", event_date=today + timedelta(days=7), description="Hire 6 labor team for picking", is_completed=False, color="#f59e0b")
            ev3 = FarmEvent(user_id=farmer.id, title="KCC Loan EMI Due (₹8,500)", event_type="loan", event_date=today + timedelta(days=15), description="Debit from SBI savings account", is_completed=False, color="#ef4444")
            ev4 = FarmEvent(user_id=farmer.id, title="Rabi Wheat Nursery Sowing", event_type="sowing", event_date=today + timedelta(days=22), description="Prepare seed bed with vermicompost", is_completed=False, color="#3b82f6")
            session.add_all([ev1, ev2, ev3, ev4])
            print("[OK] Farm Calendar Events seeded")

        # ── 9. Community Chat Channels & Messages ─────────────────────────
        ch_res = await session.exec(select(ChatChannel).where(ChatChannel.name == "Krishna District Paddy Farmers"))
        ch = ch_res.first()
        if not ch:
            ch1 = ChatChannel(name="Krishna District Paddy Farmers", channel_type=ChannelType.GROUP, location_tag="Krishna, AP")
            ch2 = ChatChannel(name="Cotton Pest Alert & Advisory", channel_type=ChannelType.GROUP, location_tag="Andhra Pradesh")
            session.add_all([ch1, ch2])
            await session.flush()

            m1 = ChannelMember(channel_id=ch1.id, user_id=farmer.id)
            m2 = ChannelMember(channel_id=ch1.id, user_id=shop.id)
            m3 = ChannelMember(channel_id=ch2.id, user_id=farmer.id)
            session.add_all([m1, m2, m3])
            await session.flush()

            msg1 = ChatMessage(channel_id=ch1.id, sender_id=shop.id, sender_name="Venkat Rao (Krishna Agro)", message_text="Fresh stock of IFFCO Urea and DAP available at subsidized rates today. Limit 5 bags per farmer.", created_at=now - timedelta(hours=8))
            msg2 = ChatMessage(channel_id=ch1.id, sender_id=farmer.id, sender_name="Ravi Kumar Reddy", message_text="Thanks Venkat garu, picked up 5 bags this morning. Quality is good.", created_at=now - timedelta(hours=5))
            msg3 = ChatMessage(channel_id=ch2.id, sender_id=shop.id, sender_name="Dr. Anjali (Agronomist)", message_text="Yellow mosaic and pink bollworm warnings issued for Guntur and Krishna. Spray Chlorpyriphos in early morning hours only.", created_at=now - timedelta(hours=3))
            session.add_all([msg1, msg2, msg3])
            print("[OK] Community Channels & Messages seeded")

        # ── 10. Mill Profile for Manufacturer ────────────────────────────
        m_prof_res = await session.exec(select(MillProfile).where(MillProfile.user_id == mfr.id))
        if not m_prof_res.first():
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
                district="Krishna",
                state="Andhra Pradesh",
                pincode="521111",
                bank_name="HDFC Bank",
                account_number="50200088991122",
                ifsc_code="HDFC0001842",
            )
            session.add(m_prof)
            print("[OK] Mill Profile seeded")

        # ── 11. Customer Profile for Buyer ───────────────────────────────
        c_prof_res = await session.exec(select(CustomerProfile).where(CustomerProfile.user_id == cust.id))
        if not c_prof_res.first():
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
            print("[OK] Customer Profile seeded")

        await session.commit()
        print("\n=== SUCCESS: ALL DEMO DATA SEEDED INTO POSTGRESQL ===")

if __name__ == "__main__":
    asyncio.run(run_seed())

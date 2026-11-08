"""
Comprehensive Data Parity Seeder for AgriFlow.AI
Populates real database tables for all features that were previously only in demo mode:
- Emergency Contacts (SOS Hotlines)
- Farm Calendar Events
- Crop Storage & Warehouse Receipts
- Community Chat Channels & Messages
- Plot Soil Data & Fertilizer Applications
- Crop Sales Records
- Blockchain Cryptographic Blocks
- Mill Weighment Slips, By-Products & Farmer Load Pools
"""

import sys, os
from datetime import datetime, date, timedelta
import json
import hashlib

from sqlmodel import select, SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker

from app.database import engine, default_sqlite_url
from app.models.user import User, UserRole
from app.models.crop import Crop, CropSale, CropHarvest
from app.models.farmer import FarmerProfile, LandRecord
from app.models.shop import ShopProfile
from app.models.manufacturer import (
    MillProfile, ManufacturerPurchase, ProductionBatch,
    WeighmentSlip, ByProduct, FarmerLoadPool, FarmerLoadPoolMember
)
from app.models.trade import Product, ShopOrder
from app.models.emergency_contact import EmergencyContact
from app.models.farm_calendar import FarmEvent
from app.models.crop_storage import CropStorage
from app.models.plot_nutrition import PlotSoilData, FertilizerApplication
from app.models.chat import ChatChannel, ChannelMember, ChatMessage, ChannelType
from app.models.blockchain import BlockchainBlock


async def run_parity_seed():
    print("=" * 70)
    print("  SEEDING PRODUCTION DATA PARITY FOR AGRIFLOW.AI")
    print("=" * 70)

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # 1. Fetch Demo Users
        res_farmer = await session.exec(select(User).where(User.email == "demo@farmer.com"))
        farmer = res_farmer.first()
        res_shop = await session.exec(select(User).where(User.email == "demo@shop.com"))
        shop = res_shop.first()
        res_mfr = await session.exec(select(User).where(User.email == "demo@manufacturer.com"))
        mfr = res_mfr.first()
        res_cust = await session.exec(select(User).where(User.email == "demo@customer.com"))
        cust = res_cust.first()

        if not farmer:
            print("[Parity Seed] Error: demo@farmer.com not found. Run base seed first.")
            return

        today = date.today()
        now = datetime.utcnow()

        # ── 1. EMERGENCY CONTACTS (SOS DIRECTORY) ─────────────────────
        res_ec = await session.exec(select(EmergencyContact))
        if len(res_ec.all()) == 0:
            contacts = [
                EmergencyContact(
                    name="Kisan Call Center (Ministry of Agriculture)",
                    category="national_helpline",
                    phone_number="1551",
                    is_toll_free=True,
                    is_verified=True,
                    availability_hours="24/7",
                    department_or_village="National Toll-Free",
                    notes="Government helpline for expert agronomy advice in 22 regional languages."
                ),
                EmergencyContact(
                    name="PMFBY Crop Insurance Grievance Helpline",
                    category="national_helpline",
                    phone_number="14447",
                    is_toll_free=True,
                    is_verified=True,
                    availability_hours="9:00 AM - 6:00 PM",
                    department_or_village="Department of Agriculture",
                    notes="Toll-free claim filing and localized crop damage intimation within 72 hours."
                ),
                EmergencyContact(
                    name="APCPDCL / Electricity Power Outage Discom",
                    category="electricity_power",
                    phone_number="1912",
                    is_toll_free=True,
                    is_verified=True,
                    availability_hours="24/7",
                    department_or_village="State Power Distribution",
                    notes="Direct line for agricultural feeder outages, blown transformers, and tube-well faults."
                ),
                EmergencyContact(
                    name="KVK Krishi Vigyan Kendra (Anantapur Agronomist)",
                    category="kvk_agriculture_officer",
                    phone_number="08554-286234",
                    alternate_phone="+91 94401 28912",
                    is_toll_free=False,
                    is_verified=True,
                    availability_hours="8:00 AM - 7:00 PM",
                    department_or_village="KVK Agricultural Science Center, Anantapur",
                    notes="Plant pathologist Dr. Subrahmanyam & soil testing specialists."
                ),
                EmergencyContact(
                    name="Tungabhadra Canal & Irrigation Field Office",
                    category="water_irrigation",
                    phone_number="+91 94402 38472",
                    is_toll_free=False,
                    is_verified=True,
                    availability_hours="6:00 AM - 8:00 PM",
                    department_or_village="Irrigation Section Office, Tadipatri",
                    notes="Canal water release schedules and branch canal regulator issues."
                ),
                EmergencyContact(
                    name="Dr. YSR Government Mobile Veterinary Hospital",
                    category="veterinary",
                    phone_number="+91 98480 19283",
                    is_toll_free=False,
                    is_verified=True,
                    availability_hours="24/7 On-Call",
                    department_or_village="Veterinary Dispensary, Dharmavaram",
                    notes="Emergency treatment for draught bullocks, dairy cattle, and sheep herds."
                ),
                EmergencyContact(
                    name="Sri Sai Harvester & Tractor Repair Workshop",
                    category="machinery_mechanic",
                    phone_number="+91 99887 74411",
                    is_toll_free=False,
                    is_verified=True,
                    availability_hours="6:00 AM - 10:00 PM",
                    department_or_village="Main Road, Dharmavaram Bypass",
                    notes="Paddy combine harvester mechanic, hydraulic lift repair, and generator rentals."
                ),
                EmergencyContact(
                    name="Venkat Rao - Krishna Agro Input Center",
                    category="input_retailer",
                    phone_number="9848012345",
                    is_toll_free=False,
                    is_verified=True,
                    availability_hours="8:00 AM - 9:00 PM",
                    department_or_village="Opp. RTC Bus Stand, Anantapur",
                    notes="Emergency pesticide sprays, fungicide supplies, and soil amendments."
                ),
            ]
            session.add_all(contacts)
            await session.flush()
            print(f" [OK] Seeded {len(contacts)} Emergency SOS Hotlines & Helplines.")

        # ── 2. FARM CALENDAR EVENTS ───────────────────────────────────
        res_fe = await session.exec(select(FarmEvent).where(FarmEvent.user_id == farmer.id))
        if len(res_fe.all()) == 0:
            res_crops = await session.exec(select(Crop).where(Crop.user_id == farmer.id))
            all_farmer_crops = res_crops.all()
            c_paddy = next((c for c in all_farmer_crops if "Paddy" in c.name or "Rice" in c.name), None)
            c_cotton = next((c for c in all_farmer_crops if "Cotton" in c.name), None)

            events = [
                FarmEvent(
                    user_id=farmer.id,
                    title="Nursery Sowing & Seed Treatment (Carbendazim)",
                    event_type="sowing",
                    event_date=today - timedelta(days=20),
                    description="Paddy BPT-5204 seed soaking with bio-fungicide for 24 hours prior to nursery bed sowing.",
                    crop_id=c_paddy.id if c_paddy else None,
                    crop_name=c_paddy.name if c_paddy else "BPT-5204 Samba Masoori",
                    is_completed=True,
                    color="#10b981"
                ),
                FarmEvent(
                    user_id=farmer.id,
                    title="Main Field Transplanting (25-day seedlings)",
                    event_type="sowing",
                    event_date=today - timedelta(days=5),
                    description="Transplant 2-3 seedlings per hill with 20x15cm spacing. Apply basal DAP 50kg/acre.",
                    crop_id=c_paddy.id if c_paddy else None,
                    crop_name=c_paddy.name if c_paddy else "BPT-5204 Samba Masoori",
                    is_completed=True,
                    color="#059669"
                ),
                FarmEvent(
                    user_id=farmer.id,
                    title="Pre-emergence Herbicide Application (Pretilachlor)",
                    event_type="spraying",
                    event_date=today + timedelta(days=2),
                    description="Spray Pretilachlor 50% EC @ 500ml/acre within 3 days of transplanting with thin water layer.",
                    crop_id=c_paddy.id if c_paddy else None,
                    crop_name=c_paddy.name if c_paddy else "BPT-5204 Samba Masoori",
                    is_completed=False,
                    color="#f59e0b"
                ),
                FarmEvent(
                    user_id=farmer.id,
                    title="First Top Dressing — Urea + Zinc Sulphate",
                    event_type="fertilizer",
                    event_date=today + timedelta(days=12),
                    description="Broadcast 35kg Neem Coated Urea + 10kg Zinc Sulphate per acre during active tillering.",
                    crop_id=c_paddy.id if c_paddy else None,
                    crop_name=c_paddy.name if c_paddy else "BPT-5204 Samba Masoori",
                    is_completed=False,
                    color="#3b82f6"
                ),
                FarmEvent(
                    user_id=farmer.id,
                    title="Canal Water Irrigation Turn (Branch Canal #4)",
                    event_type="irrigation",
                    event_date=today + timedelta(days=7),
                    description="Maintain 5cm standing water in the field. Open sub-channel gate at 7:00 AM.",
                    crop_id=c_paddy.id if c_paddy else None,
                    crop_name=c_paddy.name if c_paddy else "BPT-5204 Samba Masoori",
                    is_completed=False,
                    color="#06b6d4"
                ),
                FarmEvent(
                    user_id=farmer.id,
                    title="Stem Borer & Leaf Folder Pheromone Trap Monitoring",
                    event_type="spraying",
                    event_date=today + timedelta(days=18),
                    description="Inspect 8 pheromone lure traps across 4 acres. Check moth catches for ETL thresholds.",
                    crop_id=c_paddy.id if c_paddy else None,
                    crop_name=c_paddy.name if c_paddy else "BPT-5204 Samba Masoori",
                    is_completed=False,
                    color="#ef4444"
                ),
                FarmEvent(
                    user_id=farmer.id,
                    title="Kisan Credit Card (KCC) Interest Subvention Due",
                    event_type="loan",
                    event_date=today + timedelta(days=25),
                    description="Repay KCC seasonal interest of ₹18,400 at SBI Tadipatri Branch to secure 3% prompt subvention.",
                    is_completed=False,
                    color="#8b5cf6"
                ),
                FarmEvent(
                    user_id=farmer.id,
                    title="Paddy Panicle Initiation Stage Fertilizer (MOP)",
                    event_type="fertilizer",
                    event_date=today + timedelta(days=40),
                    description="Apply Muriate of Potash (MOP) @ 25kg/acre to promote grain filling and lodging resistance.",
                    crop_id=c_paddy.id if c_paddy else None,
                    crop_name=c_paddy.name if c_paddy else "BPT-5204 Samba Masoori",
                    is_completed=False,
                    color="#3b82f6"
                ),
                FarmEvent(
                    user_id=farmer.id,
                    title="Expected Harvest Window & Combine Harvester Booking",
                    event_type="harvest",
                    event_date=today + timedelta(days=85),
                    description="Confirm harvest machinery rental with Sri Sai Harvester group. Check grain moisture at 16-18%.",
                    crop_id=c_paddy.id if c_paddy else None,
                    crop_name=c_paddy.name if c_paddy else "BPT-5204 Samba Masoori",
                    is_completed=False,
                    color="#10b981"
                ),
            ]
            session.add_all(events)
            await session.flush()
            print(f" [OK] Seeded {len(events)} Farm Calendar Schedule Events.")

        # ── 3. CROP STORAGE (WAREHOUSE RECEIPTS & COLD STORAGE) ───────
        res_cs = await session.exec(select(CropStorage).where(CropStorage.farmer_id == farmer.id))
        if len(res_cs.all()) == 0:
            storages = [
                CropStorage(
                    farmer_id=farmer.id,
                    crop_name="Paddy (Sona Masoori)",
                    variety="BPT-5204",
                    storage_type="warehouse_cwc_swc",
                    facility_name="Central Warehousing Corporation (CWC) Godown #4",
                    location="Industrial Area, Gooty Road, Anantapur",
                    receipt_number="eNWR-CWC-2025-08912",
                    bags_count=180,
                    weight_quintals=90.0,
                    bag_weight_kg=50.0,
                    monthly_rent_per_bag=6.5,
                    deposit_date=today - timedelta(days=60),
                    expected_release_date=today + timedelta(days=45),
                    status="stored",
                    target_sell_price_per_quintal=2650.0,
                    notes="Premium dried paddy stored awaiting off-season price rise. 13.5% moisture certified."
                ),
                CropStorage(
                    farmer_id=farmer.id,
                    crop_name="Groundnut (Pods)",
                    variety="K-6 Kadiri",
                    storage_type="cold_storage",
                    facility_name="Sri Venkateswara Cold Storage & Agro Logistics",
                    location="Dharmavaram Highway, Tadipatri",
                    receipt_number="SVCS-GN-2025-104",
                    bags_count=120,
                    weight_quintals=48.0,
                    bag_weight_kg=40.0,
                    monthly_rent_per_bag=14.0,
                    deposit_date=today - timedelta(days=40),
                    expected_release_date=today + timedelta(days=30),
                    status="stored",
                    target_sell_price_per_quintal=7800.0,
                    notes="Stored in temperature-controlled room (10°C) to prevent aflatoxin and maintain seed viability."
                ),
                CropStorage(
                    farmer_id=farmer.id,
                    crop_name="Bengal Gram (Chana)",
                    variety="JG-11",
                    storage_type="private_godown",
                    facility_name="Markfed Farmer Service Society Godown",
                    location="Market Yard, Tadipatri",
                    receipt_number="APM-CH-2025-331",
                    bags_count=60,
                    weight_quintals=30.0,
                    bag_weight_kg=50.0,
                    monthly_rent_per_bag=5.0,
                    deposit_date=today - timedelta(days=90),
                    actual_release_date=today - timedelta(days=10),
                    status="fully_released",
                    target_sell_price_per_quintal=6200.0,
                    notes="Released and sold to pulse processing mill at ₹6,350/Qtl (profitable +₹450 above deposit price)."
                ),
            ]
            session.add_all(storages)
            await session.flush()
            print(f" [OK] Seeded {len(storages)} Warehouse Storage & e-NWR Records.")

        # ── 4. CHAT CHANNELS & MESSAGES (COMMUNITY & DIRECT) ──────────
        res_ch = await session.exec(select(ChatChannel))
        if len(res_ch.all()) == 0:
            # Regional Group Channels
            ch_ap = ChatChannel(
                name="Andhra Pradesh Farmers Forum",
                channel_type=ChannelType.GROUP,
                location_tag="Andhra Pradesh"
            )
            ch_anantapur = ChatChannel(
                name="Anantapur Groundnut & Paddy Growers",
                channel_type=ChannelType.GROUP,
                location_tag="Anantapur"
            )
            # P2P Channel: Farmer <-> Shop
            ch_p2p_shop = ChatChannel(
                name=f"Chat with {shop.full_name}",
                channel_type=ChannelType.P2P,
            )
            # P2P Channel: Farmer <-> Mill
            ch_p2p_mill = ChatChannel(
                name=f"Chat with {mfr.full_name}",
                channel_type=ChannelType.P2P,
            )
            session.add_all([ch_ap, ch_anantapur, ch_p2p_shop, ch_p2p_mill])
            await session.flush()

            # Channel Members
            members = [
                ChannelMember(channel_id=ch_ap.id, user_id=farmer.id),
                ChannelMember(channel_id=ch_ap.id, user_id=shop.id),
                ChannelMember(channel_id=ch_anantapur.id, user_id=farmer.id),
                ChannelMember(channel_id=ch_anantapur.id, user_id=shop.id),
                ChannelMember(channel_id=ch_p2p_shop.id, user_id=farmer.id),
                ChannelMember(channel_id=ch_p2p_shop.id, user_id=shop.id),
                ChannelMember(channel_id=ch_p2p_mill.id, user_id=farmer.id),
                ChannelMember(channel_id=ch_p2p_mill.id, user_id=mfr.id),
            ]
            session.add_all(members)
            await session.flush()

            # Chat Messages
            messages = [
                # Group chat messages
                ChatMessage(
                    channel_id=ch_anantapur.id,
                    sender_id=shop.id,
                    sender_name="Venkat Rao (Krishna Agro Center)",
                    message_text="Fresh shipment of IFFCO DAP and Neem Coated Urea has arrived at the shop. Subsidized rates available on Aadhaar authentication.",
                    created_at=now - timedelta(days=3, hours=4)
                ),
                ChatMessage(
                    channel_id=ch_anantapur.id,
                    sender_id=farmer.id,
                    sender_name="Ravi Kumar Reddy",
                    message_text="Venkat garu, do you have Coragen or Flubendiamide stock for stem borer in 100ml bottles?",
                    created_at=now - timedelta(days=2, hours=10)
                ),
                ChatMessage(
                    channel_id=ch_anantapur.id,
                    sender_id=shop.id,
                    sender_name="Venkat Rao (Krishna Agro Center)",
                    message_text="Yes Ravi garu, genuine FMC Coragen 150ml and Bayer Fame are available in stock.",
                    created_at=now - timedelta(days=2, hours=9)
                ),
                # Direct Farmer <-> Shop messages
                ChatMessage(
                    channel_id=ch_p2p_shop.id,
                    sender_id=farmer.id,
                    sender_name="Ravi Kumar Reddy",
                    message_text="Hello Venkat garu, I placed an order for 4 bags of DAP and 2 bottles of herbicide. Can it be dispatched to Chinna Vaduguru tomorrow?",
                    created_at=now - timedelta(days=1, hours=5)
                ),
                ChatMessage(
                    channel_id=ch_p2p_shop.id,
                    sender_id=shop.id,
                    sender_name="Venkat Rao",
                    message_text="Namaste Ravi garu! Yes, our auto will deliver it to your farm gate by 11:30 AM tomorrow. I have confirmed your order on the dashboard.",
                    created_at=now - timedelta(days=1, hours=3)
                ),
                # Direct Farmer <-> Mill messages
                ChatMessage(
                    channel_id=ch_p2p_mill.id,
                    sender_id=farmer.id,
                    sender_name="Ravi Kumar Reddy",
                    message_text="Prasad garu, I have 180 bags of BPT-5204 ready for procurement. Current moisture is tested at 13.8%. What is the mill gate price today?",
                    created_at=now - timedelta(hours=18)
                ),
                ChatMessage(
                    channel_id=ch_p2p_mill.id,
                    sender_id=mfr.id,
                    sender_name="Prasad Babu (Sri Venkateswara Mill)",
                    message_text="Hello Ravi Kumar garu, for moisture below 14% and Grade A clean grain, we are paying ₹2,420 per quintal with same-day RTGS/Razorpay direct settlement. You can book a delivery slot on the mill portal.",
                    created_at=now - timedelta(hours=14)
                ),
            ]
            session.add_all(messages)
            await session.flush()
            print(f" [OK] Seeded {len(messages)} Community & P2P Chat Messages.")

        # ── 5. PLOT SOIL NUTRITION & FERTILIZER APPLICATION ───────────
        res_soil = await session.exec(select(PlotSoilData).where(PlotSoilData.user_id == farmer.id))
        if len(res_soil.all()) == 0:
            res_lr = await session.exec(select(LandRecord).join(FarmerProfile).where(FarmerProfile.user_id == farmer.id))
            records = res_lr.all()
            lr1 = records[0] if records else None
            lr2 = records[1] if len(records) > 1 else lr1

            if lr1:
                plot1 = PlotSoilData(
                    user_id=farmer.id,
                    land_record_id=lr1.id,
                    nitrogen=245.0,  # Low (target: 280-560)
                    phosphorus=18.5, # Medium (target: 10-25)
                    potassium=310.0, # High (target: >280)
                    ph_level=7.2,    # Neutral to slightly alkaline
                    organic_carbon=0.62,
                    last_tested=now - timedelta(days=25),
                    notes="Plot 1 (4.20 Acres): Black Cotton soil. Slightly deficient in available Nitrogen. Requires zinc supplement."
                )
                session.add(plot1)
                await session.flush()

                f1 = FertilizerApplication(
                    plot_soil_data_id=plot1.id,
                    fertilizer_name="Di-Ammonium Phosphate (DAP 18:46:0)",
                    quantity=100.0,
                    unit="kg",
                    application_date=now - timedelta(days=18),
                    nitrogen_added=18.0,
                    phosphorus_added=46.0,
                    potassium_added=0.0,
                    cost=2700.0,
                    notes="Basal application prior to paddy seedling transplanting."
                )
                f2 = FertilizerApplication(
                    plot_soil_data_id=plot1.id,
                    fertilizer_name="Neem Coated Urea (46% N)",
                    quantity=70.0,
                    unit="kg",
                    application_date=now - timedelta(days=6),
                    nitrogen_added=32.2,
                    phosphorus_added=0.0,
                    potassium_added=0.0,
                    cost=533.0,
                    notes="First top dressing split dose with standing water."
                )
                session.add_all([f1, f2])

            if lr2 and lr2.id != (lr1.id if lr1 else None):
                plot2 = PlotSoilData(
                    user_id=farmer.id,
                    land_record_id=lr2.id,
                    nitrogen=210.0,
                    phosphorus=22.0,
                    potassium=270.0,
                    ph_level=6.8,
                    organic_carbon=0.55,
                    last_tested=now - timedelta(days=35),
                    notes="Plot 2 (3.00 Acres): Red Loamy soil. Good drainage, responds well to bio-fertilizers and gypsum."
                )
                session.add(plot2)
                await session.flush()

                f3 = FertilizerApplication(
                    plot_soil_data_id=plot2.id,
                    fertilizer_name="Single Super Phosphate (SSP)",
                    quantity=150.0,
                    unit="kg",
                    application_date=now - timedelta(days=28),
                    nitrogen_added=0.0,
                    phosphorus_added=24.0,
                    potassium_added=0.0,
                    cost=1800.0,
                    notes="Applied for groundnut crop with gypsum amendment."
                )
                session.add(f3)

            await session.flush()
            print(" [OK] Seeded Plot Soil Health & Fertilizer Application History.")

        # ── 6. CROP SALES (PRODUCE REVENUE TRANSACTIONS) ───────────────
        res_csales = await session.exec(select(CropSale))
        if len(res_csales.all()) == 0:
            res_crops = await session.exec(select(Crop).where(Crop.user_id == farmer.id))
            all_crops = res_crops.all()
            sales = []
            for i, c in enumerate(all_crops[:4]):
                qty_qtl = 40.0 + (i * 15.0)
                rate = 2350.0 if "Paddy" in c.name else 7200.0 if "Groundnut" in c.name else 6800.0
                revenue = qty_qtl * rate
                sales.append(
                    CropSale(
                        crop_id=c.id,
                        date=now - timedelta(days=45 + (i * 60)),
                        buyer_type="Mill" if i % 2 == 0 else "Market",
                        buyer_name="Sri Venkateswara Rice Mill" if i % 2 == 0 else "Tadipatri Agricultural Market Yard",
                        buyer_id=str(mfr.id) if i % 2 == 0 else "AP-MARKET-01",
                        quantity_quintals=qty_qtl,
                        total_bags=int(qty_qtl * 2),
                        bag_size=50,
                        price_per_quintal=rate,
                        total_revenue=revenue,
                        payment_mode="Razorpay" if i % 2 == 0 else "Bank Transfer",
                        status="sold",
                        notes=f"Seasonal sale invoice. Grade A quality grain verified."
                    )
                )
            if sales:
                session.add_all(sales)
                await session.flush()
                print(f" [OK] Seeded {len(sales)} Crop Harvest Sales Transactions.")

        # ── 7. BLOCKCHAIN CRYPTOGRAPHIC BLOCKS ─────────────────────────
        res_blocks = await session.exec(select(BlockchainBlock))
        if len(res_blocks.all()) == 0:
            # Genesis Block
            genesis_payload = json.dumps({
                "type": "genesis",
                "message": "AgriFlow.AI Immutable Agricultural Ledger Initialized",
                "network": "AgriFlow-MainNet-01",
                "timestamp": (now - timedelta(days=180)).isoformat()
            })
            genesis_hash = hashlib.sha256(f"0-0-{genesis_payload}".encode()).hexdigest()
            b0 = BlockchainBlock(
                block_index=0,
                timestamp=now - timedelta(days=180),
                previous_hash="0" * 64,
                hash=genesis_hash,
                payload=genesis_payload,
                verifier_name="AgriFlow Root Authority"
            )
            session.add(b0)
            await session.flush()

            # Transaction Block 1: Organic Soil Certification
            b1_payload = json.dumps({
                "type": "certification",
                "farmer": farmer.full_name,
                "crop": "BPT-5204 Organic Samba Masoori",
                "acres": 4.2,
                "certification_id": "AP-ORG-2025-9912",
                "audit": "Zero chemical residue detected. 3rd-party audit passed.",
                "wage_standard": "Fair-Trade minimum wage +22% premium paid to harvesting labor."
            })
            b1_hash = hashlib.sha256(f"1-{genesis_hash}-{b1_payload}".encode()).hexdigest()
            b1 = BlockchainBlock(
                block_index=1,
                timestamp=now - timedelta(days=90),
                previous_hash=genesis_hash,
                hash=b1_hash,
                payload=b1_payload,
                certification_type="organic",
                verifier_name="AgriFlow Organic Certification Board"
            )
            session.add(b1)
            await session.flush()

            # Transaction Block 2: Mill Procurement Batch Traceability
            b2_payload = json.dumps({
                "type": "mill_procurement",
                "mill": mfr.full_name,
                "batch_id": "BATCH-PADDY-2026-001",
                "farmer_id": farmer.id,
                "farmer_name": farmer.full_name,
                "weight_quintals": 120.0,
                "quality_grade": "Grade A Premium",
                "moisture_pct": 13.8,
                "payment_hash": "pay_rzp_mock_live_verified_01"
            })
            b2_hash = hashlib.sha256(f"2-{b1_hash}-{b2_payload}".encode()).hexdigest()
            b2 = BlockchainBlock(
                block_index=2,
                timestamp=now - timedelta(days=15),
                previous_hash=b1_hash,
                hash=b2_hash,
                payload=b2_payload,
                certification_type="traceability",
                verifier_name="Sri Venkateswara Quality Lab"
            )
            session.add(b2)
            await session.flush()
            print(" [OK] Initialized Blockchain Ledger with 3 Cryptographic Blocks.")

        # ── 8. MILL WEIGHMENT SLIPS & BY-PRODUCTS ──────────────────────
        res_ws = await session.exec(select(WeighmentSlip))
        if len(res_ws.all()) == 0:
            res_purchases = await session.exec(select(ManufacturerPurchase).where(ManufacturerPurchase.manufacturer_id == mfr.id))
            purchases = res_purchases.all()
            slips = []
            for idx, p in enumerate(purchases[:5]):
                gross = 14500.0 + (idx * 500.0) # kg
                tare = 3500.0 # empty truck
                net = gross - tare
                m_ded = (net * 0.015) if idx % 2 == 1 else 0.0
                f_net = net - m_ded
                slips.append(
                    WeighmentSlip(
                        purchase_id=p.id,
                        slip_number=f"WS-2026-{1000 + idx}",
                        gross_weight=gross / 100.0, # in quintals
                        tare_weight=tare / 100.0,
                        net_weight=net / 100.0,
                        moisture_pct=14.2 if idx % 2 == 1 else 13.5,
                        foreign_matter_pct=0.4,
                        damaged_grain_pct=0.2,
                        quality_grade="Grade A",
                        moisture_deduction_kg=m_ded,
                        final_net_weight=f_net / 100.0,
                        price_per_unit=p.price_per_unit,
                        total_amount=(f_net / 100.0) * p.price_per_unit,
                        msp_price=2200.0,
                        msp_comparison="+₹220 Above MSP Benchmark",
                        payment_mode=p.payment_mode or "Razorpay",
                        payment_status="paid",
                        farmer_name=p.farmer_name or farmer.full_name,
                        farmer_phone="9876543210",
                        crop_name=p.crop_name,
                        unit="quintal",
                        vehicle_number=f"AP 04 TX {2100 + idx}",
                        mill_name="Sri Venkateswara Modern Rice Mill",
                        mill_location="Tadipatri Bypass Road, Anantapur",
                        created_by=mfr.id,
                        created_at=now - timedelta(days=20 + idx * 5)
                    )
                )
            if slips:
                session.add_all(slips)
                await session.flush()
                print(f" [OK] Seeded {len(slips)} Mill Digital Weighment Slips (Parchi).")

        # By-Products
        res_bp = await session.exec(select(ByProduct))
        if len(res_bp.all()) == 0:
            res_batches = await session.exec(select(ProductionBatch).where(ProductionBatch.manufacturer_id == mfr.id))
            batches = res_batches.all()
            b1 = batches[0] if batches else None
            if b1:
                byproducts = [
                    ByProduct(
                        batch_id=b1.id,
                        manufacturer_id=mfr.id,
                        name="Defatted Rice Bran (Cattle Feed Grade)",
                        quantity=24.5,
                        unit="quintal",
                        estimated_value_per_unit=1850.0,
                        total_value=24.5 * 1850.0,
                        sold_to="Sri Balaji Dairy Feed Mixers",
                        sold_price=1850.0,
                        sold_date=now - timedelta(days=8),
                        status="sold"
                    ),
                    ByProduct(
                        batch_id=b1.id,
                        manufacturer_id=mfr.id,
                        name="Rice Husk (Boiler Biomass Fuel)",
                        quantity=45.0,
                        unit="quintal",
                        estimated_value_per_unit=420.0,
                        total_value=45.0 * 420.0,
                        status="in_stock"
                    ),
                    ByProduct(
                        batch_id=b1.id,
                        manufacturer_id=mfr.id,
                        name="Broken Rice (Brewer's & Flour Grade)",
                        quantity=18.0,
                        unit="quintal",
                        estimated_value_per_unit=1650.0,
                        total_value=18.0 * 1650.0,
                        status="in_stock"
                    ),
                ]
                session.add_all(byproducts)
                await session.flush()
                print(f" [OK] Seeded {len(byproducts)} Milling By-Product Value Streams.")

        # Farmer Load Pools
        res_lp = await session.exec(select(FarmerLoadPool))
        if len(res_lp.all()) == 0:
            pool = FarmerLoadPool(
                organizer_id=farmer.id,
                pool_name="Chinna Vaduguru Paddy Shared Truck Pool",
                crop_name="Paddy (Sona Masoori)",
                preferred_mill_id=mfr.id,
                origin_village="Chinna Vaduguru",
                origin_mandal="Tadipatri",
                target_weight_quintals=150.0,
                current_weight_quintals=95.0,
                target_date=today + timedelta(days=5),
                vehicle_type="10-Tyre Tata Truck (15-Ton)",
                estimated_cost_per_quintal=45.0, # Saves ₹35/qtl compared to individual mini-trucks!
                status="open",
                notes="Pooling small paddy harvest loads to save ₹35/quintal on transport to Sri Venkateswara Mill."
            )
            session.add(pool)
            await session.flush()

            m1 = FarmerLoadPoolMember(
                pool_id=pool.id,
                farmer_id=farmer.id,
                pledged_weight_quintals=65.0,
                bags_count=130,
                pickup_location="Farm Gate, Survey #142/2",
                status="confirmed"
            )
            session.add(m1)
            await session.flush()
            print(" [OK] Seeded Farmer Shared Transport Load Pool.")

        await session.commit()
        print("\n" + "=" * 70)
        print("  DATA PARITY SEEDING COMPLETED SUCCESSFULLY!")
        print("=" * 70)

if __name__ == "__main__":
    import asyncio
    asyncio.run(run_parity_seed())


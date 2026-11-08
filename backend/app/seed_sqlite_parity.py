"""
Direct SQLite Parity Seeder for AgriFlow.AI
Seeds rich data into the SQLite database for:
- Emergency Contacts (SOS)
- Farm Calendar Events
- Crop Storage & e-NWR Warehouse Receipts
- Community & Direct Chat (Channels, Members, Messages)
- Plot Soil Data & Fertilizer Applications
- Crop Sales Records
- Blockchain Cryptographic Blocks
- Mill Weighment Slips, By-Products & Farmer Load Pools
"""

import sqlite3
import os
from datetime import datetime, date, timedelta
import json
import hashlib

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "agrichain.db")

def seed():
    print(f"Connecting to {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Get User IDs
    c.execute("SELECT id, role, full_name FROM user")
    users = {row[1].lower(): (row[0], row[2]) for row in c.fetchall()}
    print(f"Loaded users: {users}")

    farmer_id = users.get("farmer", (1, "Ravi Kumar Reddy"))[0]
    farmer_name = users.get("farmer", (1, "Ravi Kumar Reddy"))[1]

    shop_id = users.get("shop", (2, "Venkat Rao Potti"))[0]
    shop_name = users.get("shop", (2, "Venkat Rao Potti"))[1]

    mfr_id = users.get("manufacturer", (3, "Prasad Babu Reddy"))[0]
    mfr_name = users.get("manufacturer", (3, "Prasad Babu Reddy"))[1]

    cust_id = users.get("customer", (4, "Priya Sharma"))[0]
    cust_name = users.get("customer", (4, "Priya Sharma"))[1]

    # Get Farmer Crop IDs
    c.execute("SELECT id, name FROM crop WHERE user_id = ?", (farmer_id,))
    farmer_crops = c.fetchall()
    c_paddy_id = farmer_crops[0][0] if farmer_crops else 1
    c_paddy_name = farmer_crops[0][1] if farmer_crops else "Paddy (Sona Masoori BPT-5204)"

    # Get Farmer Land Record ID
    c.execute("SELECT lr.id FROM landrecord lr JOIN farmerprofile fp ON lr.farmer_profile_id = fp.id WHERE fp.user_id = ?", (farmer_id,))
    lr_row = c.fetchone()
    lr_id = lr_row[0] if lr_row else 1

    # Get Manufacturer Purchase & Batch IDs
    c.execute("SELECT id, crop_name, price_per_unit FROM manufacturer_purchases WHERE manufacturer_id = ?", (mfr_id,))
    mfr_purchases = c.fetchall()

    c.execute("SELECT id, output_product_name FROM production_batches WHERE manufacturer_id = ?", (mfr_id,))
    mfr_batches = c.fetchall()

    today = date.today()
    now_iso = datetime.utcnow().isoformat()

    # ── 1. EMERGENCY CONTACTS ─────────────────────────────────────────
    c.execute("SELECT count(*) FROM emergency_contacts")
    if c.fetchone()[0] == 0:
        contacts = [
            ("Kisan Call Center (Ministry of Agriculture)", "national_helpline", "1551", None, "National Toll-Free", 1, 1, "24/7", "Government helpline for expert agronomy advice in 22 regional languages.", None, now_iso, now_iso),
            ("PMFBY Crop Insurance Grievance Helpline", "national_helpline", "14447", None, "Department of Agriculture", 1, 1, "9:00 AM - 6:00 PM", "Toll-free claim filing and localized crop damage intimation within 72 hours.", None, now_iso, now_iso),
            ("APCPDCL / Electricity Power Outage Discom", "electricity_power", "1912", None, "State Power Distribution", 1, 1, "24/7", "Direct line for agricultural feeder outages, blown transformers, and tube-well faults.", None, now_iso, now_iso),
            ("KVK Krishi Vigyan Kendra (Anantapur Agronomist)", "kvk_agriculture_officer", "08554-286234", "+91 94401 28912", "KVK Agricultural Science Center, Anantapur", 0, 1, "8:00 AM - 7:00 PM", "Plant pathologist Dr. Subrahmanyam & soil testing specialists.", None, now_iso, now_iso),
            ("Tungabhadra Canal & Irrigation Field Office", "water_irrigation", "+91 94402 38472", None, "Irrigation Section Office, Tadipatri", 0, 1, "6:00 AM - 8:00 PM", "Canal water release schedules and branch canal regulator issues.", None, now_iso, now_iso),
            ("Dr. YSR Government Mobile Veterinary Hospital", "veterinary", "+91 98480 19283", None, "Veterinary Dispensary, Dharmavaram", 0, 1, "24/7 On-Call", "Emergency treatment for draught bullocks, dairy cattle, and sheep herds.", None, now_iso, now_iso),
            ("Sri Sai Harvester & Tractor Repair Workshop", "machinery_mechanic", "+91 99887 74411", None, "Main Road, Dharmavaram Bypass", 0, 1, "6:00 AM - 10:00 PM", "Paddy combine harvester mechanic, hydraulic lift repair, and generator rentals.", None, now_iso, now_iso),
            ("Venkat Rao - Krishna Agro Input Center", "input_retailer", "9848012345", None, "Opp. RTC Bus Stand, Anantapur", 0, 1, "8:00 AM - 9:00 PM", "Emergency pesticide sprays, fungicide supplies, and soil amendments.", None, now_iso, now_iso),
        ]
        c.executemany("""
            INSERT INTO emergency_contacts (name, category, phone_number, alternate_phone, department_or_village, is_toll_free, is_verified, availability_hours, notes, farmer_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, contacts)
        print(f" [OK] Seeded {len(contacts)} Emergency SOS Hotlines.")

    # ── 2. FARM CALENDAR EVENTS ───────────────────────────────────────
    c.execute("SELECT count(*) FROM farm_event WHERE user_id = ?", (farmer_id,))
    if c.fetchone()[0] == 0:
        events = [
            ("Nursery Sowing & Seed Treatment (Carbendazim)", "sowing", (today - timedelta(days=20)).isoformat(), "Paddy BPT-5204 seed soaking with bio-fungicide for 24 hours prior to nursery bed sowing.", c_paddy_id, c_paddy_name, 1, 1, "#10b981", farmer_id, now_iso),
            ("Main Field Transplanting (25-day seedlings)", "sowing", (today - timedelta(days=5)).isoformat(), "Transplant 2-3 seedlings per hill with 20x15cm spacing. Apply basal DAP 50kg/acre.", c_paddy_id, c_paddy_name, 1, 1, "#059669", farmer_id, now_iso),
            ("Pre-emergence Herbicide Application (Pretilachlor)", "spraying", (today + timedelta(days=2)).isoformat(), "Spray Pretilachlor 50% EC @ 500ml/acre within 3 days of transplanting with thin water layer.", c_paddy_id, c_paddy_name, 1, 0, "#f59e0b", farmer_id, now_iso),
            ("First Top Dressing — Urea + Zinc Sulphate", "fertilizer", (today + timedelta(days=12)).isoformat(), "Broadcast 35kg Neem Coated Urea + 10kg Zinc Sulphate per acre during active tillering.", c_paddy_id, c_paddy_name, 1, 0, "#3b82f6", farmer_id, now_iso),
            ("Canal Water Irrigation Turn (Branch Canal #4)", "irrigation", (today + timedelta(days=7)).isoformat(), "Maintain 5cm standing water in the field. Open sub-channel gate at 7:00 AM.", c_paddy_id, c_paddy_name, 1, 0, "#06b6d4", farmer_id, now_iso),
            ("Stem Borer & Leaf Folder Pheromone Trap Monitoring", "spraying", (today + timedelta(days=18)).isoformat(), "Inspect 8 pheromone lure traps across 4 acres. Check moth catches for ETL thresholds.", c_paddy_id, c_paddy_name, 1, 0, "#ef4444", farmer_id, now_iso),
            ("Kisan Credit Card (KCC) Interest Subvention Due", "loan", (today + timedelta(days=25)).isoformat(), "Repay KCC seasonal interest of ₹18,400 at SBI Tadipatri Branch to secure 3% prompt subvention.", None, None, 3, 0, "#8b5cf6", farmer_id, now_iso),
            ("Paddy Panicle Initiation Stage Fertilizer (MOP)", "fertilizer", (today + timedelta(days=40)).isoformat(), "Apply Muriate of Potash (MOP) @ 25kg/acre to promote grain filling and lodging resistance.", c_paddy_id, c_paddy_name, 2, 0, "#3b82f6", farmer_id, now_iso),
            ("Expected Harvest Window & Combine Harvester Booking", "harvest", (today + timedelta(days=85)).isoformat(), "Confirm harvest machinery rental with Sri Sai Harvester group. Check grain moisture at 16-18%.", c_paddy_id, c_paddy_name, 7, 0, "#10b981", farmer_id, now_iso),
        ]
        c.executemany("""
            INSERT INTO farm_event (title, event_type, event_date, description, crop_id, crop_name, reminder_days_before, is_completed, color, user_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, events)
        print(f" [OK] Seeded {len(events)} Farm Calendar Schedule Events.")

    # ── 3. CROP STORAGE ───────────────────────────────────────────────
    c.execute("SELECT count(*) FROM crop_storages WHERE farmer_id = ?", (farmer_id,))
    if c.fetchone()[0] == 0:
        storages = [
            ("Paddy (Sona Masoori)", "BPT-5204", "warehouse_cwc_swc", "Central Warehousing Corporation (CWC) Godown #4", "Industrial Area, Gooty Road, Anantapur", "eNWR-CWC-2025-08912", 180, 90.0, 50.0, 6.5, (today - timedelta(days=60)).isoformat(), (today + timedelta(days=45)).isoformat(), None, "stored", 2650.0, "Premium dried paddy stored awaiting off-season price rise. 13.5% moisture certified.", farmer_id, now_iso, now_iso),
            ("Groundnut (Pods)", "K-6 Kadiri", "cold_storage", "Sri Venkateswara Cold Storage & Agro Logistics", "Dharmavaram Highway, Tadipatri", "SVCS-GN-2025-104", 120, 48.0, 40.0, 14.0, (today - timedelta(days=40)).isoformat(), (today + timedelta(days=30)).isoformat(), None, "stored", 7800.0, "Stored in temperature-controlled room (10°C) to prevent aflatoxin and maintain seed viability.", farmer_id, now_iso, now_iso),
            ("Bengal Gram (Chana)", "JG-11", "private_godown", "Markfed Farmer Service Society Godown", "Market Yard, Tadipatri", "APM-CH-2025-331", 60, 30.0, 50.0, 5.0, (today - timedelta(days=90)).isoformat(), None, (today - timedelta(days=10)).isoformat(), "fully_released", 6200.0, "Released and sold to pulse processing mill at ₹6,350/Qtl (profitable +₹450 above deposit price).", farmer_id, now_iso, now_iso),
        ]
        c.executemany("""
            INSERT INTO crop_storages (crop_name, variety, storage_type, facility_name, location, receipt_number, bags_count, weight_quintals, bag_weight_kg, monthly_rent_per_bag, deposit_date, expected_release_date, actual_release_date, status, target_sell_price_per_quintal, notes, farmer_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, storages)
        print(f" [OK] Seeded {len(storages)} Crop Storage & e-NWR Warehouse Receipts.")

    # ── 4. CHAT CHANNELS & MESSAGES ───────────────────────────────────
    c.execute("SELECT count(*) FROM chatchannel")
    if c.fetchone()[0] == 0:
        c.execute("INSERT INTO chatchannel (name, channel_type, location_tag, created_at) VALUES (?, ?, ?, ?)",
                  ("Andhra Pradesh Farmers Forum", "group", "Andhra Pradesh", now_iso))
        ch_ap_id = c.lastrowid

        c.execute("INSERT INTO chatchannel (name, channel_type, location_tag, created_at) VALUES (?, ?, ?, ?)",
                  ("Anantapur Groundnut & Paddy Growers", "group", "Anantapur", now_iso))
        ch_anantapur_id = c.lastrowid

        c.execute("INSERT INTO chatchannel (name, channel_type, created_at) VALUES (?, ?, ?)",
                  (f"Chat with {shop_name}", "p2p", now_iso))
        ch_shop_id = c.lastrowid

        c.execute("INSERT INTO chatchannel (name, channel_type, created_at) VALUES (?, ?, ?)",
                  (f"Chat with {mfr_name}", "p2p", now_iso))
        ch_mill_id = c.lastrowid

        members = [
            (ch_ap_id, farmer_id, now_iso), (ch_ap_id, shop_id, now_iso),
            (ch_anantapur_id, farmer_id, now_iso), (ch_anantapur_id, shop_id, now_iso),
            (ch_shop_id, farmer_id, now_iso), (ch_shop_id, shop_id, now_iso),
            (ch_mill_id, farmer_id, now_iso), (ch_mill_id, mfr_id, now_iso),
        ]
        c.executemany("INSERT INTO channelmember (channel_id, user_id, joined_at) VALUES (?, ?, ?)", members)

        msg_t1 = (datetime.utcnow() - timedelta(days=2, hours=4)).isoformat()
        msg_t2 = (datetime.utcnow() - timedelta(days=1, hours=6)).isoformat()
        msg_t3 = (datetime.utcnow() - timedelta(hours=14)).isoformat()
        msg_t4 = (datetime.utcnow() - timedelta(hours=8)).isoformat()

        messages = [
            (ch_anantapur_id, shop_id, shop_name, "Fresh shipment of IFFCO DAP and Neem Coated Urea has arrived at Krishna Agro Center. Subsidized rates available on Aadhaar authentication.", None, None, msg_t1),
            (ch_anantapur_id, farmer_id, farmer_name, "Venkat garu, do you have Coragen or Flubendiamide stock for stem borer in 100ml bottles?", None, None, msg_t2),
            (ch_shop_id, farmer_id, farmer_name, "Hello Venkat garu, I requested an order for 4 bags of DAP. Can it be dispatched to Chinna Vaduguru tomorrow?", None, None, msg_t3),
            (ch_shop_id, shop_id, shop_name, "Namaste Ravi garu! Yes, our delivery auto will reach your farm gate by 11:30 AM tomorrow. I have confirmed your order.", None, None, msg_t4),
            (ch_mill_id, farmer_id, farmer_name, "Prasad garu, I have 180 bags of BPT-5204 ready. Tested moisture is 13.8%. What is the mill gate price today?", None, None, msg_t3),
            (ch_mill_id, mfr_id, mfr_name, "Hello Ravi garu, for moisture below 14% and Grade A clean grain, we pay ₹2,420/quintal with same-day Razorpay/RTGS settlement.", None, None, msg_t4),
        ]
        c.executemany("INSERT INTO chatmessage (channel_id, sender_id, sender_name, message_text, media_url, media_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", messages)
        print(" [OK] Seeded 4 Chat Channels and 6 Messages.")

    # ── 5. PLOT SOIL DATA & FERTILIZER APPLICATION ───────────────────
    c.execute("SELECT count(*) FROM plotsoildata WHERE user_id = ?", (farmer_id,))
    if c.fetchone()[0] == 0 and lr_id:
        c.execute("""
            INSERT INTO plotsoildata (land_record_id, nitrogen, phosphorus, potassium, ph_level, organic_carbon, crop_id, last_tested, notes, user_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (lr_id, 245.0, 18.5, 310.0, 7.2, 0.62, c_paddy_id, (datetime.utcnow() - timedelta(days=25)).isoformat(), "Plot 1 (4.20 Acres): Black Cotton soil. Slightly deficient in available Nitrogen. Requires zinc supplement.", farmer_id, now_iso, now_iso))
        plot_id = c.lastrowid

        f_apps = [
            (plot_id, "Di-Ammonium Phosphate (DAP 18:46:0)", 100.0, "kg", (datetime.utcnow() - timedelta(days=18)).isoformat(), "Basal broadcast", c_paddy_id, "Basal application prior to transplanting.", farmer_id, now_iso),
            (plot_id, "Neem Coated Urea (46% N)", 70.0, "kg", (datetime.utcnow() - timedelta(days=6)).isoformat(), "Top dressing", c_paddy_id, "First top dressing split dose with standing water.", farmer_id, now_iso)
        ]
        c.executemany("""
            INSERT INTO fertilizerapplication (plot_soil_data_id, fertilizer_name, quantity, unit, application_date, application_method, crop_id, notes, user_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, f_apps)
        print(" [OK] Seeded Plot Soil Test Data & Fertilizer Applications.")

    # ── 6. CROP SALES ─────────────────────────────────────────────────
    c.execute("SELECT count(*) FROM cropsale")
    if c.fetchone()[0] == 0 and farmer_crops:
        sales = [
            (farmer_crops[0][0], (datetime.utcnow() - timedelta(days=45)).isoformat(), "Mill", "Sri Venkateswara Rice Mill", str(mfr_id), 60.0, 120, 50, 2380.0, 142800.0, "Razorpay", "Direct mill delivery. Grade A fine grain.", "sold", now_iso),
            (farmer_crops[0][0], (datetime.utcnow() - timedelta(days=120)).isoformat(), "Market", "Tadipatri Agricultural Market Yard (APMC)", "APMC-TAD-01", 45.0, 90, 50, 2320.0, 104400.0, "Bank Transfer", "Open auction mandi sale.", "sold", now_iso),
        ]
        c.executemany("""
            INSERT INTO cropsale (crop_id, date, buyer_type, buyer_name, buyer_id, quantity_quintals, total_bags, bag_size, price_per_quintal, total_revenue, payment_mode, notes, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sales)
        print(f" [OK] Seeded {len(sales)} Crop Sales History Records.")

    # ── 7. BLOCKCHAIN BLOCKS ──────────────────────────────────────────
    c.execute("SELECT count(*) FROM blockchain_blocks")
    if c.fetchone()[0] == 0:
        gen_payload = json.dumps({"type": "genesis", "message": "AgriFlow.AI Immutable Agricultural Ledger", "network": "AgriFlow-MainNet-01"})
        h0 = hashlib.sha256(f"0-0-{gen_payload}".encode()).hexdigest()
        b0_time = (datetime.utcnow() - timedelta(days=180)).isoformat()
        c.execute("""
            INSERT INTO blockchain_blocks (block_index, timestamp, previous_hash, hash, payload, verifier_name)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (0, b0_time, "0" * 64, h0, gen_payload, "AgriFlow Root Authority"))

        b1_payload = json.dumps({
            "type": "certification",
            "farmer": farmer_name,
            "crop": c_paddy_name,
            "certification_id": "AP-ORG-2025-9912",
            "audit": "Zero chemical residue detected. 3rd-party audit passed.",
            "wage_standard": "Fair-Trade minimum wage +22% premium paid to harvesting labor."
        })
        h1 = hashlib.sha256(f"1-{h0}-{b1_payload}".encode()).hexdigest()
        b1_time = (datetime.utcnow() - timedelta(days=90)).isoformat()
        c.execute("""
            INSERT INTO blockchain_blocks (block_index, timestamp, previous_hash, hash, payload, certification_type, verifier_name)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (1, b1_time, h0, h1, b1_payload, "organic", "AgriFlow Organic Certification Board"))

        b2_payload = json.dumps({
            "type": "mill_procurement",
            "mill": mfr_name,
            "batch_id": "BATCH-PADDY-2026-001",
            "farmer_id": farmer_id,
            "weight_quintals": 120.0,
            "quality_grade": "Grade A Premium",
            "moisture_pct": 13.8,
            "payment_hash": "pay_rzp_mock_live_verified_01"
        })
        h2 = hashlib.sha256(f"2-{h1}-{b2_payload}".encode()).hexdigest()
        b2_time = (datetime.utcnow() - timedelta(days=15)).isoformat()
        c.execute("""
            INSERT INTO blockchain_blocks (block_index, timestamp, previous_hash, hash, payload, certification_type, verifier_name)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (2, b2_time, h1, h2, b2_payload, "traceability", "Sri Venkateswara Quality Lab"))
        print(" [OK] Initialized Blockchain Ledger with 3 Cryptographic Blocks.")

    # ── 8. MILL WEIGHMENT SLIPS, BY-PRODUCTS & LOAD POOLS ─────────────
    c.execute("SELECT count(*) FROM weighment_slips")
    if c.fetchone()[0] == 0 and mfr_purchases:
        slips = []
        for idx, p in enumerate(mfr_purchases[:4]):
            p_id = p[0]
            c_name = p[1]
            rate = p[2]
            gross = 150.0 + (idx * 5.0)
            tare = 35.0
            net = gross - tare
            m_ded = (net * 0.015) if idx % 2 == 1 else 0.0
            f_net = net - m_ded
            total_val = f_net * rate
            created_dt = (datetime.utcnow() - timedelta(days=20 + idx * 8)).isoformat()
            slips.append((
                p_id, f"WS-2026-{1001 + idx}", gross, tare, net,
                14.2 if idx % 2 == 1 else 13.5, 0.4, 0.2, "Grade A",
                m_ded, 0.0, f_net, rate, total_val, 2200.0, "+₹220 Above MSP Benchmark",
                "Razorpay", "paid", None, farmer_name, "9876543210", c_name, "quintal",
                f"AP 04 TX {2100 + idx}", "Sri Venkateswara Modern Rice Mill", "Tadipatri Bypass Road, Anantapur",
                created_dt, mfr_id
            ))
        c.executemany("""
            INSERT INTO weighment_slips (purchase_id, slip_number, gross_weight, tare_weight, net_weight, moisture_pct, foreign_matter_pct, damaged_grain_pct, quality_grade, moisture_deduction_kg, foreign_matter_deduction_kg, final_net_weight, price_per_unit, total_amount, msp_price, msp_comparison, payment_mode, payment_status, transaction_ref, farmer_name, farmer_phone, crop_name, unit, vehicle_number, mill_name, mill_location, created_at, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, slips)
        print(f" [OK] Seeded {len(slips)} Mill Digital Weighment Slips.")

    # By-Products
    c.execute("SELECT count(*) FROM by_products")
    if c.fetchone()[0] == 0 and mfr_batches:
        b_id = mfr_batches[0][0]
        byproducts = [
            (b_id, mfr_id, "Defatted Rice Bran (Cattle Feed Grade)", 24.5, "quintal", 1850.0, 24.5 * 1850.0, "Sri Balaji Dairy Feed Mixers", 1850.0, (datetime.utcnow() - timedelta(days=8)).isoformat(), "sold", now_iso),
            (b_id, mfr_id, "Rice Husk (Boiler Biomass Fuel)", 45.0, "quintal", 420.0, 45.0 * 420.0, None, None, None, "in_stock", now_iso),
            (b_id, mfr_id, "Broken Rice (Brewer's & Flour Grade)", 18.0, "quintal", 1650.0, 18.0 * 1650.0, None, None, None, "in_stock", now_iso),
        ]
        c.executemany("""
            INSERT INTO by_products (batch_id, manufacturer_id, name, quantity, unit, estimated_value_per_unit, total_value, sold_to, sold_price, sold_date, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, byproducts)
        print(f" [OK] Seeded {len(byproducts)} Milling By-Product Streams.")

    # Farmer Load Pools
    c.execute("SELECT count(*) FROM farmer_load_pools")
    if c.fetchone()[0] == 0:
        c.execute("""
            INSERT INTO farmer_load_pools (creator_id, crop_name, target_quantity, current_quantity, unit, village, mandal, district, state, delivery_date, preferred_mill_id, preferred_mill_name, status, min_quality_grade, expected_price_per_unit, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (farmer_id, "Paddy (Sona Masoori)", 150.0, 95.0, "quintal", "Chinna Vaduguru", "Tadipatri", "Anantapur", "Andhra Pradesh", (today + timedelta(days=5)).isoformat(), mfr_id, mfr_name, "open", "Grade A", 2400.0, "Pooling harvest loads to save ₹35/quintal on transport to Sri Venkateswara Mill.", now_iso, now_iso))
        pool_id = c.lastrowid

        c.execute("""
            INSERT INTO farmer_load_pool_members (pool_id, farmer_id, farmer_name, farmer_phone, quantity, unit, quality_grade, joined_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (pool_id, farmer_id, farmer_name, "9876543210", 65.0, "quintal", "Grade A", now_iso))
        print(" [OK] Seeded Farmer Shared Transport Load Pool.")

    conn.commit()
    conn.close()
    print("=" * 70)
    print("  ALL PARITY SEEDING COMPLETED SUCCESSFULLY IN SQLITE!")
    print("=" * 70)

if __name__ == "__main__":
    seed()

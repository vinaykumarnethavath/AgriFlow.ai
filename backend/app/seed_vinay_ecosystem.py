"""
AgriFlow.AI Comprehensive Ecosystem Generator for vinaykumarnethavath42@gmail.com
Creates:
1. 4 Accounts for vinaykumarnethavath42@gmail.com across all 4 roles (FARMER, SHOP, MANUFACTURER, CUSTOMER) with password 'agriflow.ai'
2. Surrounding Agricultural Network strictly within 50 km radius:
   - 16 Local Farmers (Tadipatri, Vaduguru, Yadiki, Gooty, Putlur, Yellanur, Pamidi, Kondapuram)
   - 7 Certified Fertilizer & Agri-Input Shops
   - 5 Modern Agro Processing Mills
   - 21 Residential Customers / Bulk Buyers
3. Pre-populated GeocodeCache for all local hubs ensuring 100% accurate distance calculation within 50 km
4. 3+ Years of Complete Multi-Year History (2023, 2024, 2025, and active 2026) filling EVERY SINGLE FEATURE:
   - Soil Reports & Health Cards (soil_profiles & plotsoildata)
   - Centralized Payment Transactions (payments) across all roles
   - Multi-Year Crops, Expenses, Harvests & Sales for Vinay & Surrounding Farmers
   - AI Crop Disease Diagnoses (cropdiagnosis) & Crop Health Statuses
   - Digital Weighment Slips & Moisture Deduction Logs (moisture_deduction_logs)
   - Production Batches, By-Products & Mill Procurement Requests (mill_procurement_requests)
   - Farmer Load Pools & Pool Members (farmer_load_pool_members)
   - Finished Goods Sales (manufacturer_sales) & Industrial Expenses
   - Shop Orders, Catalog Products, Order Items & Shop Expenses
   - Customer Orders, Invoices & Active Cart
   - Farm-to-Fork Traceability Events & Blockchain Blocks (traceabilityevent, blockchain_blocks)
   - Emergency & KVK Extension Contacts (emergency_contacts)
   - Farm Calendar Events, KCC Loans, Repayments & PMFBY Crop Insurances
"""

import sys
import os
import sqlite3
from datetime import datetime, date, timedelta
import json
import hashlib

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.utils import get_password_hash

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "agrichain.db")

def generate():
    print("=" * 80)
    print("  SEEDING COMPLETE ECOSYSTEM FOR vinaykumarnethavath42@gmail.com")
    print(f"  Target Database: {DB_PATH}")
    print("=" * 80)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    hashed_pw = get_password_hash("agriflow.ai")
    now_dt = datetime.now()
    now_iso = now_dt.isoformat()
    today = date.today()

    # ─────────────────────────────────────────────────────────────────────────────
    # STEP 0: GEOCODE CACHE (Strictly within 50km radius hubs)
    # ─────────────────────────────────────────────────────────────────────────────
    # Center user coordinates: Tadipatri / Chinna Vaduguru (Lat: 14.9125, Lon: 78.0108)
    hubs = [
        ("tadipatri", 14.9125, 78.0108, "Tadipatri, Anantapur, Andhra Pradesh"),
        ("veerapuram", 14.8850, 78.0420, "Veerapuram, Tadipatri, Anantapur, Andhra Pradesh"),
        ("chinna vaduguru", 14.9450, 77.9820, "Chinna Vaduguru, Tadipatri, Anantapur, Andhra Pradesh"),
        ("sajjaladinne", 14.9320, 77.9410, "Sajjaladinne, Tadipatri, Anantapur, Andhra Pradesh"),
        ("pedda vaduguru", 14.9810, 77.9350, "Pedda Vaduguru, Anantapur, Andhra Pradesh"),
        ("putlur", 14.8150, 77.9620, "Putlur, Anantapur, Andhra Pradesh"),
        ("aluru", 15.0120, 77.9650, "Aluru, Tadipatri, Anantapur, Andhra Pradesh"),
        ("kondapuram", 14.9810, 78.1320, "Kondapuram, YSR Kadapa, Andhra Pradesh"),
        ("yadiki", 15.0450, 77.8920, "Yadiki, Anantapur, Andhra Pradesh"),
        ("yellanur", 14.7310, 78.0410, "Yellanur, Anantapur, Andhra Pradesh"),
        ("pamidi", 14.9510, 77.5850, "Pamidi, Anantapur, Andhra Pradesh"),
        ("gooty", 15.1150, 77.6350, "Gooty, Anantapur, Andhra Pradesh"),
    ]

    for key_name, lat, lon, full_addr in hubs:
        c.execute("""
            INSERT OR REPLACE INTO geocode_cache (address_key, query_text, lat, lng, confidence, formatted_address, components_json, provider, updated_at)
            VALUES (?, ?, ?, ?, 9, ?, '{}', 'seeded', ?)
        """, (key_name, full_addr, lat, lon, full_addr, now_iso))
        c.execute("""
            INSERT OR REPLACE INTO geocode_cache (address_key, query_text, lat, lng, confidence, formatted_address, components_json, provider, updated_at)
            VALUES (?, ?, ?, ?, 9, ?, '{}', 'seeded', ?)
        """, (f"{key_name} anantapur", full_addr, lat, lon, full_addr, now_iso))

    print(f" [OK] Geocache loaded with {len(hubs)} regional clusters strictly within 50 km.")

    # ─────────────────────────────────────────────────────────────────────────────
    # STEP 1: CREATE OR UPDATE VINAY'S 4 ACCOUNTS
    # ─────────────────────────────────────────────────────────────────────────────
    vinay_email = "vinaykumarnethavath42@gmail.com"
    accounts_meta = [
        ("FARMER", "Vinay Kumar Nethavath", "9876510001"),
        ("SHOP", "Vinay Agri Inputs & Fertilizer Store", "9876510002"),
        ("MANUFACTURER", "Vinay Agro Industries & Rice Mill", "9876510003"),
        ("CUSTOMER", "Vinay Kumar", "9876510004"),
    ]

    vinay_users = {}
    for role, name, phone in accounts_meta:
        c.execute("SELECT id FROM user WHERE email = ? AND role = ?", (vinay_email, role))
        row = c.fetchone()
        if row:
            u_id = row[0]
            c.execute("UPDATE user SET full_name = ?, phone_number = ?, hashed_password = ?, is_active = 1 WHERE id = ?",
                      (name, phone, hashed_pw, u_id))
        else:
            c.execute("""
                INSERT INTO user (email, phone_number, full_name, role, is_active, hashed_password)
                VALUES (?, ?, ?, ?, 1, ?)
            """, (vinay_email, phone, name, role, hashed_pw))
            u_id = c.lastrowid
        vinay_users[role.lower()] = u_id

    u_farmer = vinay_users["farmer"]
    u_shop = vinay_users["shop"]
    u_mfr = vinay_users["manufacturer"]
    u_cust = vinay_users["customer"]
    print(f" [OK] Vinay's 4 Accounts Active -> Farmer ID: {u_farmer}, Shop ID: {u_shop}, Mill ID: {u_mfr}, Customer ID: {u_cust}")

    # Farmer Profile for Vinay
    c.execute("SELECT id FROM farmerprofile WHERE user_id = ?", (u_farmer,))
    fp = c.fetchone()
    if fp:
        c.execute("""
            UPDATE farmerprofile SET
                farmer_id = 'AP-ATP-FARM-001',
                father_husband_name = 'Sri Ramanaidu Nethavath',
                village = 'Chinna Vaduguru',
                mandal = 'Tadipatri',
                district = 'Anantapur',
                state = 'Andhra Pradesh',
                country = 'India',
                pincode = '515411',
                total_area = 8.50,
                aadhaar_last_4 = '4218',
                bank_name = 'State Bank of India',
                account_number = '39481029384',
                ifsc_code = 'SBIN0000984',
                phone_number = '9876510001',
                irrigation_type = 'Canal & Tube Well Drip',
                primary_crop = 'Paddy & Groundnut'
            WHERE user_id = ?
        """, (u_farmer,))
        fp_id = fp[0]
    else:
        c.execute("""
            INSERT INTO farmerprofile (user_id, farmer_id, father_husband_name, village, mandal, district, state, country, pincode, total_area, aadhaar_last_4, bank_name, account_number, ifsc_code, phone_number, irrigation_type, primary_crop)
            VALUES (?, 'AP-ATP-FARM-001', 'Sri Ramanaidu Nethavath', 'Chinna Vaduguru', 'Tadipatri', 'Anantapur', 'Andhra Pradesh', 'India', '515411', 8.50, '4218', 'State Bank of India', '39481029384', 'SBIN0000984', '9876510001', 'Canal & Tube Well Drip', 'Paddy & Groundnut')
        """, (u_farmer,))
        fp_id = c.lastrowid

    # Shop Profile for Vinay
    notif_json = json.dumps({"sales_alerts": True, "low_stock": True, "daily_summary": True, "weekly_reports": True})
    c.execute("SELECT id FROM shop_profiles WHERE user_id = ?", (u_shop,))
    sp = c.fetchone()
    if sp:
        c.execute("""
            UPDATE shop_profiles SET
                shop_name = 'Vinay Agri Inputs & Fertilizer Store',
                owner_name = 'Vinay Kumar Nethavath',
                license_number = 'AP/ATP/AGRI/2023/8821',
                father_name = 'Sri Ramanaidu Nethavath',
                phone_number = '9876510002',
                contact_number = '9876510002',
                village = 'Tadipatri',
                mandal = 'Tadipatri',
                district = 'Anantapur',
                state = 'Andhra Pradesh',
                country = 'India',
                pincode = '515411',
                shop_address = 'Main Bazaar, Opp. Agricultural Market Yard, Tadipatri',
                hide_personal_details = 0,
                notification_preferences = ?
            WHERE user_id = ?
        """, (notif_json, u_shop))
    else:
        c.execute("""
            INSERT INTO shop_profiles (user_id, shop_name, owner_name, license_number, father_name, phone_number, contact_number, village, mandal, district, state, country, pincode, shop_address, hide_personal_details, notification_preferences)
            VALUES (?, 'Vinay Agri Inputs & Fertilizer Store', 'Vinay Kumar Nethavath', 'AP/ATP/AGRI/2023/8821', 'Sri Ramanaidu Nethavath', '9876510002', '9876510002', 'Tadipatri', 'Tadipatri', 'Anantapur', 'Andhra Pradesh', 'India', '515411', 'Main Bazaar, Opp. Agricultural Market Yard, Tadipatri', 0, ?)
        """, (u_shop, notif_json))

    # Mill Profile for Vinay
    c.execute("SELECT id FROM mill_profiles WHERE user_id = ?", (u_mfr,))
    mp = c.fetchone()
    if mp:
        c.execute("""
            UPDATE mill_profiles SET
                mill_name = 'Vinay Agro Industries & Modern Rice Mill',
                owner_name = 'Vinay Kumar Nethavath',
                license_number = 'AP/MILL/2023/4412',
                father_name = 'Sri Ramanaidu Nethavath',
                phone_number = '9876510003',
                contact_number = '9876510003',
                village = 'Tadipatri',
                mandal = 'Tadipatri',
                district = 'Anantapur',
                state = 'Andhra Pradesh',
                country = 'India',
                pincode = '515411',
                daily_capacity = '120 Tons/Day',
                crops_accepted = 'Paddy, Samba Masoori, Basmati, Groundnut',
                price_offered_text = '₹2,350 - ₹2,500/Qtl',
                hide_personal_details = 0,
                bank_name = 'State Bank of India',
                account_number = '39481029385',
                ifsc_code = 'SBIN0000984',
                is_verified = 1,
                rating = 4.9
            WHERE user_id = ?
        """, (u_mfr,))
    else:
        c.execute("""
            INSERT INTO mill_profiles (user_id, mill_name, owner_name, license_number, father_name, phone_number, contact_number, village, mandal, district, state, country, pincode, daily_capacity, crops_accepted, price_offered_text, hide_personal_details, bank_name, account_number, ifsc_code, is_verified, rating)
            VALUES (?, 'Vinay Agro Industries & Modern Rice Mill', 'Vinay Kumar Nethavath', 'AP/MILL/2023/4412', 'Sri Ramanaidu Nethavath', '9876510003', '9876510003', 'Tadipatri', 'Tadipatri', 'Anantapur', 'Andhra Pradesh', 'India', '515411', '120 Tons/Day', 'Paddy, Samba Masoori, Basmati, Groundnut', '₹2,350 - ₹2,500/Qtl', 0, 'State Bank of India', '39481029385', 'SBIN0000984', 1, 4.9)
        """, (u_mfr,))

    # Customer Profile for Vinay
    c.execute("SELECT id FROM customer_profiles WHERE user_id = ?", (u_cust,))
    cp = c.fetchone()
    if cp:
        c.execute("""
            UPDATE customer_profiles SET
                father_name = 'Sri Ramanaidu Nethavath',
                phone_number = '9876510004',
                id_number = '982233445566',
                village = 'Tadipatri',
                mandal = 'Tadipatri',
                district = 'Anantapur',
                state = 'Andhra Pradesh',
                country = 'India',
                pincode = '515411',
                bank_name = 'HDFC Bank',
                account_number = '50100234567891',
                ifsc_code = 'HDFC0001842'
            WHERE user_id = ?
        """, (u_cust,))
    else:
        c.execute("""
            INSERT INTO customer_profiles (user_id, father_name, phone_number, id_number, village, mandal, district, state, country, pincode, bank_name, account_number, ifsc_code)
            VALUES (?, 'Sri Ramanaidu Nethavath', '9876510004', '982233445566', 'Tadipatri', 'Tadipatri', 'Anantapur', 'Andhra Pradesh', 'India', '515411', 'HDFC Bank', '50100234567891', 'HDFC0001842')
        """, (u_cust,))

    # ─────────────────────────────────────────────────────────────────────────────
    # STEP 2: CREATE 16 SURROUNDING FARMERS (WITHIN 50 KM)
    # ─────────────────────────────────────────────────────────────────────────────
    farmer_seed_list = [
        ("Ramesh Naidu", "9849010001", "Pedda Vaduguru", "Tadipatri", "Anantapur", 11.2),
        ("Suresh Reddy", "9849010002", "Chinna Vaduguru", "Tadipatri", "Anantapur", 4.8),
        ("Anjaneyulu Kuruba", "9849010003", "Yadiki", "Yadiki", "Anantapur", 19.5),
        ("Balaji Chowdary", "9849010004", "Veerapuram", "Tadipatri", "Anantapur", 4.5),
        ("Chandrasekhar Rao", "9849010005", "Gooty", "Gooty", "Anantapur", 46.2),
        ("Devendra Varma", "9849010006", "Putlur", "Putlur", "Anantapur", 12.0),
        ("Eswar Prasad", "9849010007", "Pedda Vaduguru", "Tadipatri", "Anantapur", 11.2),
        ("Gangadhar Gowd", "9849010008", "Yadiki", "Yadiki", "Anantapur", 19.5),
        ("Hanumantha Rayudu", "9849010009", "Sajjaladinne", "Tadipatri", "Anantapur", 7.8),
        ("Jagadeesh Kumar", "9849010010", "Aluru", "Tadipatri", "Anantapur", 12.1),
        ("Keshava Murthy", "9849010011", "Kondapuram", "Kondapuram", "YSR Kadapa", 15.2),
        ("Lakshmaiah Setty", "9849010012", "Chinna Vaduguru", "Tadipatri", "Anantapur", 4.8),
        ("Madhava Swamy", "9849010013", "Yellanur", "Yellanur", "Anantapur", 20.4),
        ("Narayana Swamy", "9849010014", "Pamidi", "Pamidi", "Anantapur", 46.0),
        ("Obulesu Boya", "9849010015", "Pedda Vaduguru", "Tadipatri", "Anantapur", 11.2),
        ("Prabhakar Reddy", "9849010016", "Tadipatri", "Tadipatri", "Anantapur", 2.0),
    ]

    all_farmer_ids = [u_farmer]
    for idx, (f_name, f_phone, f_vill, f_mandal, f_dist, f_dist_km) in enumerate(farmer_seed_list):
        f_email = f"farmer_{idx+1}@agriflow.local"
        c.execute("SELECT id FROM user WHERE (email = ? OR phone_number = ?) AND role = 'FARMER'", (f_email, f_phone))
        row = c.fetchone()
        if row:
            fid = row[0]
            c.execute("UPDATE user SET full_name = ?, phone_number = ?, hashed_password = ?, is_active = 1 WHERE id = ?",
                      (f_name, f_phone, hashed_pw, fid))
        else:
            c.execute("""
                INSERT INTO user (email, phone_number, full_name, role, is_active, hashed_password)
                VALUES (?, ?, ?, 'FARMER', 1, ?)
            """, (f_email, f_phone, f_name, hashed_pw))
            fid = c.lastrowid

        all_farmer_ids.append(fid)

        # Farmer Profile
        c.execute("SELECT id FROM farmerprofile WHERE user_id = ?", (fid,))
        f_prof = c.fetchone()
        if f_prof:
            c.execute("""
                UPDATE farmerprofile SET village = ?, mandal = ?, district = ?, phone_number = ?, total_area = ?
                WHERE user_id = ?
            """, (f_vill, f_mandal, f_dist, f_phone, 5.0 + (idx % 6), fid))
        else:
            c.execute("""
                INSERT INTO farmerprofile (user_id, farmer_id, father_husband_name, village, mandal, district, state, country, pincode, total_area, aadhaar_last_4, bank_name, account_number, ifsc_code, irrigation_type, primary_crop, phone_number)
                VALUES (?, ?, ?, ?, ?, ?, 'Andhra Pradesh', 'India', '515411', ?, '8812', 'Andhra Pragathi Grameena Bank', '77210928374', 'APGB0002194', 'Canal & Borewell', 'Paddy & Groundnut', ?)
            """, (fid, f"AP-FARM-ATP-{idx+10}", f"Sri {f_name.split()[0]} Appa", f_vill, f_mandal, f_dist, 5.0 + (idx % 6), f_phone))

    print(f" [OK] Seeded {len(all_farmer_ids)} Local Farmers across surrounding villages strictly within 50 km.")

    # ─────────────────────────────────────────────────────────────────────────────
    # STEP 3: CREATE 7 SURROUNDING AGRI-INPUT SHOPS (WITHIN 50 KM)
    # ─────────────────────────────────────────────────────────────────────────────
    shop_seed_list = [
        ("Vinay Agri Inputs & Fertilizer Store", "Vinay Kumar Nethavath", "9876510002", "Tadipatri", "Tadipatri", "Anantapur", "515411", u_shop, "Main Bazaar, Opp. Agricultural Market Yard"),
        ("Krishna Agro Input Center", "Venkat Rao Potti", "9848110001", "Tadipatri", "Tadipatri", "Anantapur", "515411", None, "RTC Bus Stand Road"),
        ("Kisan Seva Kendra & Fertilizer Depot", "B. Subba Rao", "9849100021", "Pedda Vaduguru", "Tadipatri", "Anantapur", "515401", None, "Station Road, Pedda Vaduguru"),
        ("Sri Balaji Agro Chemicals & Seeds", "K. Ramachandra", "9849100022", "Yadiki", "Yadiki", "Anantapur", "515408", None, "Yadiki Crossroads"),
        ("Rythu Bharosa Fertilizer Mart", "M. Venkateswarlu", "9849100023", "Gooty", "Gooty", "Anantapur", "515401", None, "Railway Feeder Road, Gooty"),
        ("Putlur Rythu Seva Agency", "T. Narayana", "9849100024", "Putlur", "Putlur", "Anantapur", "515411", None, "Main Road, Putlur"),
        ("Yellanur Agro Corporation", "P. Sreeramulu", "9849100025", "Yellanur", "Yellanur", "Anantapur", "515465", None, "Bazaar Street, Yellanur"),
    ]

    all_shop_ids = []
    for s_name, s_owner, s_phone, s_vill, s_mandal, s_dist, s_pin, explicit_uid, s_addr in shop_seed_list:
        if explicit_uid:
            sid = explicit_uid
        else:
            s_email = f"shop_{len(all_shop_ids)+1}@agriflow.local"
            c.execute("SELECT id FROM user WHERE (email = ? OR phone_number = ?) AND role = 'SHOP'", (s_email, s_phone))
            row = c.fetchone()
            if row:
                sid = row[0]
                c.execute("UPDATE user SET full_name = ?, phone_number = ?, hashed_password = ?, is_active = 1 WHERE id = ?",
                          (s_name, s_phone, hashed_pw, sid))
            else:
                c.execute("""
                    INSERT INTO user (email, phone_number, full_name, role, is_active, hashed_password)
                    VALUES (?, ?, ?, 'SHOP', 1, ?)
                """, (s_email, s_phone, s_name, hashed_pw))
                sid = c.lastrowid

            # Shop Profile for peer shops
            c.execute("SELECT id FROM shop_profiles WHERE user_id = ?", (sid,))
            if c.fetchone():
                c.execute("""
                    UPDATE shop_profiles SET shop_name = ?, owner_name = ?, village = ?, mandal = ?, district = ?, pincode = ?, shop_address = ?
                    WHERE user_id = ?
                """, (s_name, s_owner, s_vill, s_mandal, s_dist, s_pin, f"{s_addr}, {s_vill}", sid))
            else:
                c.execute("""
                    INSERT INTO shop_profiles (user_id, shop_name, owner_name, license_number, father_name, phone_number, contact_number, village, mandal, district, state, country, pincode, shop_address, hide_personal_details, notification_preferences)
                    VALUES (?, ?, ?, ?, 'Govindappa', ?, ?, ?, ?, ?, 'Andhra Pradesh', 'India', ?, ?, 0, ?)
                """, (sid, s_name, s_owner, f"AP/ATP/AGRI/{2023+len(all_shop_ids)}/8821", s_phone, s_phone, s_vill, s_mandal, s_dist, s_pin, f"{s_addr}, {s_vill}", notif_json))

        all_shop_ids.append(sid)

    print(f" [OK] Seeded {len(all_shop_ids)} Certified Fertilizer & Agri-Input Shops within 50 km.")

    # ─────────────────────────────────────────────────────────────────────────────
    # STEP 4: CREATE 5 MODERN MILLS / MANUFACTURERS (WITHIN 50 KM)
    # ─────────────────────────────────────────────────────────────────────────────
    mill_seed_list = [
        ("Vinay Agro Industries & Modern Rice Mill", "Vinay Kumar Nethavath", "9876510003", "Tadipatri", "Tadipatri", "Anantapur", "515411", u_mfr, "120 Tons/Day", "Paddy, Samba Masoori, Basmati", "₹2,350 - ₹2,500/Qtl"),
        ("Sri Venkateswara Modern Rice Mill", "Prasad Babu Reddy", "9700110001", "Tadipatri", "Tadipatri", "Anantapur", "515411", None, "100 Tons/Day", "Paddy, Rice", "₹2,300 - ₹2,450/Qtl"),
        ("Rayalaseema Dal & Pulse Processing Plant", "S. Govind Reddy", "9849200031", "Yadiki", "Yadiki", "Anantapur", "515408", None, "50 Tons/Day", "Bengal Gram, Toor Dal, Moong", "₹6,200 - ₹7,100/Qtl"),
        ("Gooty Groundnut Oil Expeller & Agro Mill", "K. Janardhan", "9849200032", "Gooty", "Gooty", "Anantapur", "515401", None, "60 Tons/Day", "Groundnut Pods, Sunflower Seeds", "₹7,200 - ₹7,800/Qtl"),
        ("Pamidi Cotton Ginning & Modern Oil Mill", "V. Raghunath", "9849200033", "Pamidi", "Pamidi", "Anantapur", "515775", None, "80 Bales/Day", "Kapas (Raw Cotton)", "₹6,800 - ₹7,400/Qtl"),
    ]

    all_mill_ids = []
    for m_name, m_owner, m_phone, m_vill, m_mandal, m_dist, m_pin, explicit_uid, m_cap, m_crops, m_price in mill_seed_list:
        if explicit_uid:
            mid = explicit_uid
        else:
            m_email = f"mill_{len(all_mill_ids)+1}@agriflow.local"
            c.execute("SELECT id FROM user WHERE (email = ? OR phone_number = ?) AND role = 'MANUFACTURER'", (m_email, m_phone))
            row = c.fetchone()
            if row:
                mid = row[0]
                c.execute("UPDATE user SET full_name = ?, phone_number = ?, hashed_password = ?, is_active = 1 WHERE id = ?",
                          (m_name, m_phone, hashed_pw, mid))
            else:
                c.execute("""
                    INSERT INTO user (email, phone_number, full_name, role, is_active, hashed_password)
                    VALUES (?, ?, ?, 'MANUFACTURER', 1, ?)
                """, (m_email, m_phone, m_name, hashed_pw))
                mid = c.lastrowid

            # Mill Profile for peer mills
            c.execute("SELECT id FROM mill_profiles WHERE user_id = ?", (mid,))
            if c.fetchone():
                c.execute("""
                    UPDATE mill_profiles SET mill_name = ?, owner_name = ?, village = ?, mandal = ?, district = ?, pincode = ?, daily_capacity = ?, crops_accepted = ?, price_offered_text = ?
                    WHERE user_id = ?
                """, (m_name, m_owner, m_vill, m_mandal, m_dist, m_pin, m_cap, m_crops, m_price, mid))
            else:
                c.execute("""
                    INSERT INTO mill_profiles (user_id, mill_name, owner_name, license_number, father_name, phone_number, contact_number, village, mandal, district, state, country, pincode, daily_capacity, crops_accepted, price_offered_text, hide_personal_details, bank_name, account_number, ifsc_code, is_verified, rating)
                    VALUES (?, ?, ?, ?, 'Chinnappa', ?, ?, ?, ?, ?, 'Andhra Pradesh', 'India', ?, ?, ?, ?, 0, 'Union Bank of India', '5510293847', 'UBIN0055102', 1, 4.8)
                """, (mid, m_name, m_owner, f"AP/MILL/{2023+len(all_mill_ids)}/4412", m_phone, m_phone, m_vill, m_mandal, m_dist, m_pin, m_cap, m_crops, m_price))

        all_mill_ids.append(mid)

    print(f" [OK] Seeded {len(all_mill_ids)} Agro Processing Mills within 50 km.")

    # ─────────────────────────────────────────────────────────────────────────────
    # STEP 5: CREATE 21 RESIDENTIAL CUSTOMERS / BUYERS (WITHIN 50 KM)
    # ─────────────────────────────────────────────────────────────────────────────
    customer_names = [
        ("Vinay Kumar", "9876510004", u_cust),
        ("Priya Sharma", "9900220001", None),
        ("Kavitha Krishnan", "9849300001", None),
        ("Deepak Chawla", "9849300002", None),
        ("Sunita Agarwal", "9849300003", None),
        ("Manoj Varma", "9849300004", None),
        ("Anuradha Devi", "9849300005", None),
        ("Rajesh Kanna", "9849300006", None),
        ("Swathi Priya", "9849300007", None),
        ("Venkatesh Babu", "9849300008", None),
        ("Meenakshi Sundaram", "9849300009", None),
        ("Kiran Mai", "9849300010", None),
        ("Srikanth Reddy", "9849300011", None),
        ("Sandhya Rani", "9849300012", None),
        ("Ashok Vardhan", "9849300013", None),
        ("Geetha Madhuri", "9849300014", None),
        ("Harish Chandra", "9849300015", None),
        ("Bhavani Shankar", "9849300016", None),
        ("Radha Krishna", "9849300017", None),
        ("Rohit Nandan", "9849300018", None),
        ("Sujatha Kumari", "9849300019", None),
    ]

    all_cust_ids = []
    cust_villages = ["Tadipatri", "Chinna Vaduguru", "Pedda Vaduguru", "Yadiki", "Veerapuram", "Putlur", "Sajjaladinne"]
    for c_name, c_phone, explicit_uid in customer_names:
        if explicit_uid:
            cid = explicit_uid
        else:
            c_email = f"cust_{len(all_cust_ids)+1}@agriflow.local"
            c.execute("SELECT id FROM user WHERE (email = ? OR phone_number = ?) AND role = 'CUSTOMER'", (c_email, c_phone))
            row = c.fetchone()
            if row:
                cid = row[0]
                c.execute("UPDATE user SET full_name = ?, phone_number = ?, hashed_password = ?, is_active = 1 WHERE id = ?",
                          (c_name, c_phone, hashed_pw, cid))
            else:
                c.execute("""
                    INSERT INTO user (email, phone_number, full_name, role, is_active, hashed_password)
                    VALUES (?, ?, ?, 'CUSTOMER', 1, ?)
                """, (c_email, c_phone, c_name, hashed_pw))
                cid = c.lastrowid

            # Customer Profile for peer customers
            c_vill = cust_villages[len(all_cust_ids) % len(cust_villages)]
            c.execute("SELECT id FROM customer_profiles WHERE user_id = ?", (cid,))
            if c.fetchone():
                c.execute("UPDATE customer_profiles SET village = ?, mandal = 'Tadipatri', district = 'Anantapur' WHERE user_id = ?", (c_vill, cid))
            else:
                c.execute("""
                    INSERT INTO customer_profiles (user_id, father_name, phone_number, id_number, village, mandal, district, state, country, pincode, bank_name, account_number, ifsc_code)
                    VALUES (?, 'Sri Nageswara Rao', ?, '982233445566', ?, 'Tadipatri', 'Anantapur', 'Andhra Pradesh', 'India', '515411', 'Canara Bank', '1102938475', 'CNRB0001102')
                """, (cid, c_phone, c_vill))

        all_cust_ids.append(cid)

    print(f" [OK] Seeded {len(all_cust_ids)} Active Customers / Buyers within 50 km.")

    # ─────────────────────────────────────────────────────────────────────────────
    # STEP 6: SEED PRODUCTS FOR VINAY'S SHOP & VINAY'S MILL
    # ─────────────────────────────────────────────────────────────────────────────
    catalog_inputs = [
        ("IFFCO Neem Coated Urea 45kg", "fertilizer", 267.0, 150, "IFFCO", "Standard neem coated urea for rapid nitrogen vegetative boost."),
        ("IFFCO DAP (18:46:0) 50kg", "fertilizer", 1350.0, 100, "IFFCO", "Di-Ammonium Phosphate for root development and tillering."),
        ("Muriate of Potash (MOP 60% K2O) 50kg", "fertilizer", 1650.0, 80, "IPL", "High-grade potassium for pest resistance and grain weight."),
        ("Gromor NPK (14:35:14) 50kg", "fertilizer", 1470.0, 60, "Coromandel", "Complex balanced NPK fertilizer for paddy and groundnut."),
        ("Zinc Sulphate 33% (Monohydrate) 5kg", "fertilizer", 480.0, 50, "Aries Agro", "Essential micronutrient for overcoming khaira disease."),
        ("Mahadhan Micronutrient Mixture 10kg", "fertilizer", 850.0, 45, "Deepak Fert", "Complete trace elements Fe, Mn, Zn, Cu, B, Mo."),
        ("FMC Coragen (Chlorantraniliprole 18.5% SC) 150ml", "pesticide", 1850.0, 40, "FMC India", "Broad-spectrum stem borer and leaf folder insecticide."),
        ("Bayer Fame (Flubendiamide 39.35% SC) 100ml", "pesticide", 1250.0, 35, "Bayer", "Targeted lepidopteran pest caterpillar control."),
        ("Syngenta Amistar Top Fungicide 200ml", "pesticide", 1450.0, 30, "Syngenta", "Dual-action systemic fungicide for blast & sheath blight."),
        ("Pretilachlor 50% EC Herbicide 1 Liter", "pesticide", 520.0, 60, "UPL", "Selective pre-emergence paddy weed control."),
        ("BPT-5204 Samba Masoori Foundation Paddy Seeds 25kg", "seeds", 1450.0, 120, "AP Seeds", "Certified pure foundation seeds with high milling recovery."),
        ("Kadiri-6 (K-6) Drought Tolerant Groundnut Seeds 30kg", "seeds", 2850.0, 70, "ANGRAU Certified", "High-oil bold pod groundnut seeds."),
        ("Rasi RCH-659 BG-II Hybrid Cotton Seeds (450g)", "seeds", 864.0, 90, "Rasi Seeds", "High boll retention and sucking pest tolerance."),
        ("Knapsack Battery Sprayer 16-Liter (12V/12Ah)", "equipment", 2400.0, 25, "KisanCraft", "Rechargeable heavy-duty farm sprayer with brass nozzles."),
    ]

    prod_ids = []
    for p_name, p_cat, p_price, p_qty, p_brand, p_desc in catalog_inputs:
        c.execute("SELECT id FROM product WHERE name = ? AND user_id = ?", (p_name, u_shop))
        p_row = c.fetchone()
        if p_row:
            p_id = p_row[0]
            c.execute("UPDATE product SET price = ?, quantity = ?, brand = ?, description = ? WHERE id = ?",
                      (p_price, p_qty, p_brand, p_desc, p_id))
        else:
            c.execute("""
                INSERT INTO product (name, category, price, quantity, unit, measure_unit, batch_number, low_stock_threshold, status, apportioned_transport, apportioned_labour, apportioned_other, brand, description, user_id, created_at, traceability_json)
                VALUES (?, ?, ?, ?, 'units', 'packet/bag', 'BATCH-VINAY-2026', 10, 'active', 0.0, 0.0, 0.0, ?, ?, ?, ?, '{}')
            """, (p_name, p_cat, p_price, p_qty, p_brand, p_desc, u_shop, now_iso))
            p_id = c.lastrowid
        prod_ids.append(p_id)

    # Finished Goods for Vinay's Mill
    mill_goods = [
        ("Vinay Royal Steamed Sona Masoori Rice 25kg", "grains", 1450.0, 250, "Vinay Agro", "Double polished sortex clean aged rice."),
        ("Vinay Premium Traditional Basmati Rice 10kg", "grains", 1150.0, 180, "Vinay Agro", "Extra long grain fragrant aged Basmati rice."),
        ("Vinay Stone-Ground Whole Wheat Chakki Atta 10kg", "grains", 420.0, 200, "Vinay Agro", "100% whole wheat high fiber stone-milled flour."),
        ("Vinay Pure Cold-Pressed Groundnut Oil 5-Liter Can", "grains", 920.0, 120, "Vinay Agro", "Traditional wood cold pressed unrefined groundnut oil."),
    ]
    mill_prod_ids = []
    for mg_name, mg_cat, mg_price, mg_qty, mg_brand, mg_desc in mill_goods:
        c.execute("SELECT id FROM product WHERE name = ? AND user_id = ?", (mg_name, u_mfr))
        mg_row = c.fetchone()
        if mg_row:
            mg_id = mg_row[0]
            c.execute("UPDATE product SET price = ?, quantity = ?, brand = ?, description = ? WHERE id = ?",
                      (mg_price, mg_qty, mg_brand, mg_desc, mg_id))
        else:
            c.execute("""
                INSERT INTO product (name, category, price, quantity, unit, measure_unit, batch_number, low_stock_threshold, status, apportioned_transport, apportioned_labour, apportioned_other, brand, description, user_id, created_at, traceability_json)
                VALUES (?, ?, ?, ?, 'units', 'bag/can', 'BATCH-MILL-2026', 20, 'active', 0.0, 0.0, 0.0, ?, ?, ?, ?, '{}')
            """, (mg_name, mg_cat, mg_price, mg_qty, mg_brand, mg_desc, u_mfr, now_iso))
            mg_id = c.lastrowid
        mill_prod_ids.append(mg_id)

    print(f" [OK] Seeded 14 Agri-Inputs & 4 Finished Packaged Products for Vinay's Shop and Mill.")

    # ─────────────────────────────────────────────────────────────────────────────
    # STEP 7: SEED 3 YEARS OF CROPS & AGRICULTURAL DATA FOR VINAY'S FARMER ACCOUNT
    # ─────────────────────────────────────────────────────────────────────────────
    c.execute("SELECT id FROM landrecord WHERE farmer_profile_id = ? AND serial_number = '182/1-A'", (fp_id,))
    lr1 = c.fetchone()
    lr1_id = lr1[0] if lr1 else None
    if not lr1_id:
        c.execute("INSERT INTO landrecord (farmer_profile_id, serial_number, area) VALUES (?, '182/1-A', 4.50)", (fp_id,))
        lr1_id = c.lastrowid

    c.execute("SELECT id FROM landrecord WHERE farmer_profile_id = ? AND serial_number = '182/2-B'", (fp_id,))
    lr2 = c.fetchone()
    lr2_id = lr2[0] if lr2 else None
    if not lr2_id:
        c.execute("INSERT INTO landrecord (farmer_profile_id, serial_number, area) VALUES (?, '182/2-B', 4.00)", (fp_id,))
        lr2_id = c.lastrowid

    crops_history = [
        # 2023
        ("Kharif Paddy BPT-5204", 4.5, "Kharif 2023", "BPT-5204 Samba Masoori", "2023-07-10", "2023-11-25", "harvested", 38500.0, 114800.0, 92.0, 2350.0, "own", None, None, 0.0, None),
        ("Rabi Groundnut Kadiri-6", 4.0, "Rabi 2023-24", "K-6 Kadiri", "2023-12-05", "2024-03-20", "harvested", 29400.0, 98600.0, 48.0, 7100.0, "rented", "Sri Balaji Chowdary", "9849010004", 22000.0, "Annual Tenancy Lease - ₹22,000/Acre"),
        # 2024
        ("Kharif Bt Cotton RCH-659", 4.5, "Kharif 2024", "RCH-659 BG-II", "2024-06-25", "2024-11-15", "harvested", 42000.0, 126000.0, 36.0, 7000.0, "rented", "Sri Suresh Reddy", "9849010002", 24000.0, "Single Season Koulu Agreement - ₹24,000/Acre"),
        ("Rabi Bengal Gram JG-11", 4.0, "Rabi 2024-25", "JG-11 Desi Chana", "2024-11-28", "2025-03-05", "harvested", 24000.0, 84200.0, 38.0, 6200.0, "own", None, None, 0.0, None),
        # 2025
        ("Kharif Paddy Samba Masoori", 4.5, "Kharif 2025", "BPT-5204", "2025-07-08", "2025-11-20", "harvested", 41200.0, 128500.0, 96.0, 2420.0, "own", None, None, 0.0, None),
        ("Rabi Groundnut K-6", 4.0, "Rabi 2025-26", "Kadiri-6", "2025-12-02", "2026-03-18", "harvested", 31500.0, 108400.0, 52.0, 7400.0, "rented", "Sri Balaji Chowdary", "9849010004", 25000.0, "Annual Tenancy Lease - ₹25,000/Acre"),
        # 2026 (Active)
        ("Kharif Paddy Samba Masoori (Active)", 4.5, "Kharif 2026", "BPT-5204", "2026-07-12", "2026-11-28", "growing", 18500.0, 0.0, 0.0, 2450.0, "own", None, None, 0.0, None),
        ("Sweet Corn Hybrid (Active)", 4.0, "Kharif 2026", "Sugar-75", "2026-08-01", "2026-10-30", "growing", 12400.0, 0.0, 0.0, 1800.0, "rented", "Sri Suresh Reddy", "9849010002", 18000.0, "Kharif 2026 Seasonal Koulu - ₹18,000/Acre"),
    ]

    vinay_crop_ids = []
    for c_name, c_area, c_seas, c_var, c_sow, c_harv, c_stat, c_cost, c_rev, c_yield, c_price, c_own_type, c_lo_name, c_lo_phone, c_rent, c_terms in crops_history:
        c_type = "Paddy" if "Paddy" in c_name else ("Groundnut" if "Groundnut" in c_name else ("Cotton" if "Cotton" in c_name else ("Bengal Gram" if "Gram" in c_name else "Corn")))
        
        # Resolve landowner id if phone exists
        lo_id = None
        if c_lo_phone:
            c.execute("SELECT id FROM user WHERE phone_number = ?", (c_lo_phone,))
            u_lo = c.fetchone()
            if u_lo:
                lo_id = u_lo[0]

        cult_name = "Vinay Kumar Nethavath"

        c.execute("SELECT id FROM crop WHERE user_id = ? AND name = ?", (u_farmer, c_name))
        crop_row = c.fetchone()
        if crop_row:
            crop_id = crop_row[0]
            c.execute("""
                UPDATE crop SET area = ?, season = ?, variety = ?, crop_type = ?, sowing_date = ?, expected_harvest_date = ?, status = ?, total_cost = ?, total_revenue = ?, actual_yield = ?, selling_price_per_unit = ?,
                                land_ownership_type = ?, landowner_name = ?, landowner_phone = ?, landowner_id = ?, rent_amount = ?, lease_terms = ?, cultivator_name = ?
                WHERE id = ?
            """, (c_area, c_seas, c_var, c_type, c_sow, c_harv, c_stat, c_cost, c_rev, c_yield, c_price, c_own_type, c_lo_name, c_lo_phone, lo_id, c_rent, c_terms, cult_name, crop_id))
        else:
            c.execute("""
                INSERT INTO crop (user_id, name, area, season, variety, crop_type, sowing_date, expected_harvest_date, status, total_cost, total_revenue, actual_yield, selling_price_per_unit, created_at,
                                  land_ownership_type, landowner_name, landowner_phone, landowner_id, rent_amount, lease_terms, cultivator_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (u_farmer, c_name, c_area, c_seas, c_var, c_type, c_sow, c_harv, c_stat, c_cost, c_rev, c_yield, c_price, now_iso,
                  c_own_type, c_lo_name, c_lo_phone, lo_id, c_rent, c_terms, cult_name))
            crop_id = c.lastrowid
        vinay_crop_ids.append(crop_id)

        # Seed realistic seasonal expenses (Seeds, Fertilizer, Labor, Irrigation, Land Lease)
        c.execute("DELETE FROM cropexpense WHERE crop_id = ?", (crop_id,))
        exp_date_base = datetime.fromisoformat(c_sow)
        expenses = []
        if c_own_type == "rented" and c_rent > 0:
            expenses.append(("Land Lease", f"Land Lease / Tenancy Rent ({c_lo_name or 'Landlord'})", 1.0, "lease", c_rent, c_rent, (exp_date_base - timedelta(days=5)).isoformat(), "Cash", "1 plot", "1 season", "Land Prep"))

        expenses.extend([
            ("Input", "Certified Seeds & Seed Treatment", 25.0, "kg", 60.0, 1500.0, (exp_date_base + timedelta(days=2)).isoformat(), "Cash", "50kg", "1 day", "Sowing"),
            ("Input", "Basal DAP & Potash Application", 100.0, "kg", 30.0, 3000.0, (exp_date_base + timedelta(days=5)).isoformat(), "Razorpay", "50kg", "1 day", "Sowing"),
            ("Labor", "Transplanting / Sowing Labor (12 Women)", 12.0, "days", 450.0, 5400.0, (exp_date_base + timedelta(days=12)).isoformat(), "Cash", "1 day", "1 day", "Vegetative"),
            ("Machinery", "Tractor Rotary Tillage & Bunding", 6.0, "hours", 900.0, 5400.0, (exp_date_base - timedelta(days=2)).isoformat(), "Cash", "1 hr", "6 hrs", "Land Prep"),
            ("Input", "Top Dressing Urea + Zinc Sulphate", 80.0, "kg", 18.0, 1440.0, (exp_date_base + timedelta(days=35)).isoformat(), "Razorpay", "45kg", "1 day", "Tillering"),
            ("Labor", "Weeding & Canal Field Channel Cleaning", 8.0, "days", 450.0, 3600.0, (exp_date_base + timedelta(days=45)).isoformat(), "Cash", "1 day", "1 day", "Weeding"),
            ("Input", "Bio-Fungicide & Insecticide Spray", 2.0, "liters", 950.0, 1900.0, (exp_date_base + timedelta(days=60)).isoformat(), "Razorpay", "1 liter", "1 day", "Flowering"),
        ])

        for cat, typ, q, u, uc, tc, dt, pm, usz, dur, stg in expenses:
            c.execute("""
                INSERT INTO cropexpense (crop_id, category, type, quantity, unit, unit_cost, total_cost, date, payment_mode, unit_size, duration, stage)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (crop_id, cat, typ, q, u, uc, tc, dt, pm, usz, dur, stg))

        # Recalculate crop total cost to accurately include the land lease rent
        actual_total_cost = sum(tc for _, _, _, _, _, tc, _, _, _, _, _ in expenses)
        actual_net_profit = (c_rev or 0.0) - actual_total_cost
        c.execute("UPDATE crop SET total_cost = ?, net_profit = ? WHERE id = ?", (actual_total_cost, actual_net_profit, crop_id))

        # Seed Harvest & Sales if harvested
        if c_stat == "harvested":
            c.execute("DELETE FROM cropharvest WHERE crop_id = ?", (crop_id,))
            c.execute("DELETE FROM cropsale WHERE crop_id = ?", (crop_id,))
            h_date = datetime.fromisoformat(c_harv)
            c.execute("""
                INSERT INTO cropharvest (crop_id, date, stage, quantity, unit, quality, selling_price_per_unit, total_revenue, buyer_type, status, created_at)
                VALUES (?, ?, 'Full Harvest', ?, 'Quintal', 'Grade A', ?, ?, 'Mill', 'sold', ?)
            """, (crop_id, h_date.isoformat(), c_yield, c_price, c_rev, now_iso))

            c.execute("""
                INSERT INTO cropsale (crop_id, date, buyer_type, buyer_name, buyer_id, quantity_quintals, total_bags, bag_size, price_per_quintal, total_revenue, payment_mode, status, created_at)
                VALUES (?, ?, 'Mill', 'Vinay Agro Industries & Rice Mill', ?, ?, ?, 50.0, ?, ?, 'Razorpay', 'sold', ?)
            """, (crop_id, (h_date + timedelta(days=5)).isoformat(), str(u_mfr), c_yield, int(c_yield * 2), c_price, c_rev, now_iso))

    # Seed 1 Rented Crop where Suresh Reddy is Cultivator on Land Owned by Vinay
    c.execute("SELECT id, full_name FROM user WHERE phone_number = '9849010002'")
    suresh_row = c.fetchone()
    if suresh_row:
        suresh_id = suresh_row[0]
        suresh_name = suresh_row[1]
        c.execute("SELECT id FROM crop WHERE user_id = ? AND name = 'Kharif Groundnut K-6 (Vinay Leased Land)'", (suresh_id,))
        leased_crop = c.fetchone()
        if leased_crop:
            leased_crop_id = leased_crop[0]
            c.execute("""
                UPDATE crop SET area = 3.5, season = 'Kharif 2026', variety = 'Kadiri-6', crop_type = 'Groundnut', sowing_date = '2026-07-15',
                                expected_harvest_date = '2026-11-20', status = 'growing', total_cost = 41200.0, total_revenue = 0.0, actual_yield = 0.0, selling_price_per_unit = 7400.0,
                                land_ownership_type = 'rented', landowner_name = 'Vinay Kumar Nethavath', landowner_phone = '9876510001', landowner_id = ?, rent_amount = 26000.0,
                                lease_terms = 'Tenancy Agreement 2026 - Share ₹26,000/Acre', cultivator_name = ?
                WHERE id = ?
            """, (u_farmer, suresh_name, leased_crop_id))
        else:
            c.execute("""
                INSERT INTO crop (user_id, name, area, season, variety, crop_type, sowing_date, expected_harvest_date, status, total_cost, total_revenue, actual_yield, selling_price_per_unit, created_at,
                                  land_ownership_type, landowner_name, landowner_phone, landowner_id, rent_amount, lease_terms, cultivator_name)
                VALUES (?, 'Kharif Groundnut K-6 (Vinay Leased Land)', 3.5, 'Kharif 2026', 'Kadiri-6', 'Groundnut', '2026-07-15', '2026-11-20', 'growing', 41200.0, 0.0, 0.0, 7400.0, ?,
                        'rented', 'Vinay Kumar Nethavath', '9876510001', ?, 26000.0, 'Tenancy Agreement 2026 - Share ₹26,000/Acre', ?)
            """, (suresh_id, now_iso, u_farmer, suresh_name))
            leased_crop_id = c.lastrowid

        # Record rent in crop expenses for Suresh's rented crop
        c.execute("DELETE FROM cropexpense WHERE crop_id = ?", (leased_crop_id,))
        c.execute("""
            INSERT INTO cropexpense (crop_id, category, type, quantity, unit, unit_cost, total_cost, date, payment_mode, unit_size, duration, stage)
            VALUES (?, 'Land Lease', 'Land Lease / Tenancy Rent (Vinay Kumar Nethavath)', 1.0, 'lease', 26000.0, 26000.0, '2026-07-10', 'Cash', '1 plot', '1 season', 'Land Prep')
        """, (leased_crop_id,))
        c.execute("""
            INSERT INTO cropexpense (crop_id, category, type, quantity, unit, unit_cost, total_cost, date, payment_mode, unit_size, duration, stage)
            VALUES (?, 'Input', 'Kadiri-6 Certified Seeds 70kg', 70.0, 'kg', 95.0, 6650.0, '2026-07-16', 'Cash', '70kg', '1 day', 'Sowing')
        """, (leased_crop_id,))
        c.execute("""
            INSERT INTO cropexpense (crop_id, category, type, quantity, unit, unit_cost, total_cost, date, payment_mode, unit_size, duration, stage)
            VALUES (?, 'Input', 'DAP Basal Application (2 Bags)', 2.0, 'bags', 1350.0, 2700.0, '2026-07-18', 'Cash', '50kg', '1 day', 'Sowing')
        """, (leased_crop_id,))
        c.execute("""
            INSERT INTO cropexpense (crop_id, category, type, quantity, unit, unit_cost, total_cost, date, payment_mode, unit_size, duration, stage)
            VALUES (?, 'Labor', 'Sowing & Field Labor', 13.0, 'days', 450.0, 5850.0, '2026-07-20', 'Cash', '1 day', '1 day', 'Sowing')
        """, (leased_crop_id,))

    # Also seed 3 years of crops for the 16 surrounding farmers within 50 km!
    surr_crop_templates = [
        ("Kharif Paddy BPT-5204", "Paddy", 5.0, "BPT-5204", "2023-07-15", "2023-11-28", 102.0, 2350.0),
        ("Rabi Groundnut Kadiri-6", "Groundnut", 4.0, "K-6", "2023-12-10", "2024-03-25", 46.0, 7150.0),
        ("Kharif Bt Cotton RCH-659", "Cotton", 4.5, "RCH-659", "2024-06-28", "2024-11-20", 38.0, 7050.0),
        ("Rabi Bengal Gram JG-11", "Bengal Gram", 3.5, "JG-11", "2024-12-05", "2025-03-12", 34.0, 6250.0),
        ("Kharif Paddy Samba Masoori", "Paddy", 6.0, "BPT-5204", "2025-07-10", "2025-11-22", 125.0, 2440.0),
        ("Sweet Corn Hybrid (Active)", "Corn", 4.0, "Sugar-75", "2026-07-20", "2026-11-10", 0.0, 1850.0),
    ]
    for s_fid in all_farmer_ids[1:]:
        c.execute("SELECT full_name FROM user WHERE id = ?", (s_fid,))
        s_user_row = c.fetchone()
        s_farmer_name = s_user_row[0] if s_user_row else "Cultivator"
        for cr_idx, (cr_name, cr_type, cr_area, cr_var, cr_sow, cr_harv, cr_yld, cr_prc) in enumerate(surr_crop_templates):
            c.execute("SELECT id FROM crop WHERE user_id = ? AND name = ?", (s_fid, cr_name))
            if not c.fetchone():
                is_harv = cr_yld > 0
                st = "harvested" if is_harv else "growing"
                tot_c = cr_area * 8500.0
                tot_r = cr_yld * cr_prc if is_harv else 0.0
                c.execute("""
                    INSERT INTO crop (user_id, name, area, season, variety, crop_type, sowing_date, expected_harvest_date, status, total_cost, total_revenue, actual_yield, selling_price_per_unit, created_at, land_ownership_type, cultivator_name)
                    VALUES (?, ?, ?, 'Seasonal', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'own', ?)
                """, (s_fid, cr_name, cr_area, cr_var, cr_type, cr_sow, cr_harv, st, tot_c, tot_r, cr_yld, cr_prc, now_iso, s_farmer_name))

    print(f" [OK] Seeded 3-Year Complete Multi-Year Crops across Vinay and 16 Surrounding Farmers.")

    # ─────────────────────────────────────────────────────────────────────────────
    # STEP 8: SEED SOIL REPORTS (soil_profiles & plotsoildata) FOR 3+ YEARS
    # ─────────────────────────────────────────────────────────────────────────────
    c.execute("DELETE FROM soil_profiles WHERE farmer_id = ?", (u_farmer,))
    soil_reports = [
        # Baseline 2023
        (lr1_id, "Survey #182/1-A (Wet Land) - Kharif 2023 Baseline", "black_regur", "SHC-AP-ATP-2023-0418", "Regional Agricultural Research Station (RARS) & KVK Anantapur", "2023-06-12", 7.4, 0.58, 0.38, 245.0, 18.5, 310.0, 14.2, 0.65, 4.8, 0.45, "Slight nitrogen and zinc deficiency. Organic matter application recommended.", u_farmer),
        # Progress 2024
        (lr2_id, "Survey #182/2-B (Semi-Wet Loam) - Rabi 2024 Test", "red_loam", "SHC-AP-ATP-2024-0982", "District Soil Testing Laboratory, Tadipatri", "2024-05-20", 7.1, 0.64, 0.32, 260.0, 21.0, 330.0, 16.5, 0.82, 5.4, 0.52, "Optimal balance for pulse & cotton rotation. Good micronutrient retention.", u_farmer),
        # Recent 2025
        (lr1_id, "Survey #182/1-A (Main Paddy Field) - Kharif 2025 Verified Report", "black_regur", "SHC-AP-ATP-2025-1734", "ANGRAU Certified Agricultural Laboratory, Anantapur", "2025-06-18", 7.2, 0.72, 0.29, 275.0, 24.0, 355.0, 18.0, 0.95, 6.0, 0.60, "Grade A Soil Health Index. Enhanced organic carbon from compost incorporation.", u_farmer),
        # Active 2026
        (lr1_id, "Survey #182/1-A (Main Paddy Field) - 2026 Active Season", "black_regur", "SHC-AP-ATP-2026-2819", "KVK Mobile Soil Testing Van, Tadipatri Circle", "2026-06-05", 7.3, 0.74, 0.28, 280.0, 25.5, 360.0, 18.5, 1.05, 6.2, 0.65, "All macro and micro nutrients optimal for BPT-5204 high-yield variety.", u_farmer),
    ]

    for lr_id, label, s_type, shc_no, lab, t_date, ph, oc, ec, n, p, k, s, zn, fe, b, notes, fid in soil_reports:
        c.execute("""
            INSERT INTO soil_profiles (land_record_id, plot_label, soil_type, shc_number, testing_lab, test_date, ph_level, organic_carbon_percent, ec_ds_m, nitrogen_kg_ha, phosphorus_kg_ha, potassium_kg_ha, sulphur_ppm, zinc_ppm, iron_ppm, boron_ppm, notes, farmer_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (lr_id, label, s_type, shc_no, lab, t_date, ph, oc, ec, n, p, k, s, zn, fe, b, notes, fid, t_date + "T10:00:00", t_date + "T10:00:00"))

    # Also seed plotsoildata
    c.execute("DELETE FROM plotsoildata WHERE user_id = ?", (u_farmer,))
    c.execute("""
        INSERT INTO plotsoildata (land_record_id, nitrogen, phosphorus, potassium, ph_level, organic_carbon, crop_id, last_tested, notes, user_id, created_at, updated_at)
        VALUES (?, 280.0, 25.5, 360.0, 7.3, 0.74, ?, '2026-06-05T10:00:00', 'Active verified laboratory report. Grade A soil health.', ?, ?, ?)
    """, (lr1_id, vinay_crop_ids[-2], u_farmer, now_iso, now_iso))
    p_id = c.lastrowid

    c.execute("DELETE FROM fertilizerapplication WHERE user_id = ?", (u_farmer,))
    c.execute("""
        INSERT INTO fertilizerapplication (plot_soil_data_id, fertilizer_name, quantity, unit, application_date, application_method, notes, user_id, created_at)
        VALUES (?, 'IFFCO Neem Coated Urea + Zinc Sulphate', 90.0, 'kg', '2026-07-20T11:00:00', 'Top dressing broadcast', 'Active tillering stage nitrogen & micronutrient application.', ?, ?)
    """, (p_id, u_farmer, now_iso))

    print(f" [OK] Seeded 4 Multi-Year Soil Health Cards (2023 - 2026) & Plot Nutrition Reports for Vinay.")

    # ─────────────────────────────────────────────────────────────────────────────
    # STEP 9: SEED CENTRALIZED PAYMENT TRANSACTIONS (payments TABLE)
    # ─────────────────────────────────────────────────────────────────────────────
    # Clear old payments for Vinay's accounts to avoid duplication
    c.execute("DELETE FROM payments WHERE user_id IN (?, ?, ?, ?)", (u_farmer, u_shop, u_mfr, u_cust))

    payment_entries = []

    # 1. Customer Purchases (Vinay Customer paying for groceries via Razorpay)
    for yr in [2023, 2024, 2025, 2026]:
        end_m = today.month if yr == 2026 else 12
        for m in [1, 3, 5, 7, 9, 11]:
            if yr == 2026 and m > end_m: continue
            pay_dt = datetime(yr, m, 8, 18, 30).isoformat()
            amt = 2290.0
            rz_order = f"order_rzp_cust_{yr}_{m}_{u_cust}"
            rz_pay = f"pay_rzp_cust_{yr}_{m}_{u_cust}"
            sig = hashlib.sha256(f"{rz_order}|{rz_pay}|secret".encode()).hexdigest()
            payment_entries.append((u_cust, rz_order, rz_pay, sig, amt, "INR", "paid", "customer_order", None, "House #4-12, Main Street, Tadipatri", "delivered", f"TRK-DEL-{yr}-{m}", "Groceries & Sona Masoori Rice Purchase", pay_dt, pay_dt))

    # 2. Farmer Input Purchases (Vinay Farmer paying for fertilizers/seeds at shop via Razorpay)
    for yr in [2023, 2024, 2025, 2026]:
        end_m = today.month if yr == 2026 else 12
        for m in [6, 7, 11, 12]:
            if yr == 2026 and m > end_m: continue
            pay_dt = datetime(yr, m, 14, 11, 15).isoformat()
            amt = 4850.0
            rz_order = f"order_rzp_farm_{yr}_{m}_{u_farmer}"
            rz_pay = f"pay_rzp_farm_{yr}_{m}_{u_farmer}"
            sig = hashlib.sha256(f"{rz_order}|{rz_pay}|secret".encode()).hexdigest()
            payment_entries.append((u_farmer, rz_order, rz_pay, sig, amt, "INR", "paid", "farmer_expense", None, None, "delivered", None, "IFFCO Complex Fertilizers & Hybrid Seeds", pay_dt, pay_dt))

    # 3. Shop Inbound Sales (Vinay Shop receiving Razorpay payments from local farmers)
    for yr in [2023, 2024, 2025, 2026]:
        end_m = today.month if yr == 2026 else 12
        for m in [1, 4, 7, 10]:
            if yr == 2026 and m > end_m: continue
            pay_dt = datetime(yr, m, 16, 16, 45).isoformat()
            amt = 8640.0
            rz_order = f"order_rzp_shop_{yr}_{m}_{u_shop}"
            rz_pay = f"pay_rzp_shop_{yr}_{m}_{u_shop}"
            sig = hashlib.sha256(f"{rz_order}|{rz_pay}|secret".encode()).hexdigest()
            payment_entries.append((u_shop, rz_order, rz_pay, sig, amt, "INR", "paid", "shop_order", None, None, "delivered", None, "Subsidized Urea & Insecticides Counter Sale", pay_dt, pay_dt))

    # 4. Mill Grain Procurements & Finished Goods Sales (Vinay Mill Razorpay transactions)
    for yr in [2023, 2024, 2025, 2026]:
        end_m = today.month if yr == 2026 else 12
        for m in [3, 11]:
            if yr == 2026 and m > end_m: continue
            pay_dt = datetime(yr, m, 20, 15, 0).isoformat()
            amt = 85600.0
            rz_order = f"order_rzp_mill_{yr}_{m}_{u_mfr}"
            rz_pay = f"pay_rzp_mill_{yr}_{m}_{u_mfr}"
            sig = hashlib.sha256(f"{rz_order}|{rz_pay}|secret".encode()).hexdigest()
            payment_entries.append((u_mfr, rz_order, rz_pay, sig, amt, "INR", "paid", "manufacturer_purchase", None, None, "delivered", None, "Paddy Procurement Settlement to Farmer", pay_dt, pay_dt))

    c.executemany("""
        INSERT INTO payments (user_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, status, payment_for, reference_id, shipping_address, shipping_status, tracking_id, notes, created_at, paid_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, payment_entries)

    print(f" [OK] Seeded {len(payment_entries)} Centralized Verified Razorpay Payment Records across all 4 roles.")

    # ─────────────────────────────────────────────────────────────────────────────
    # STEP 10: SEED AI CROP DIAGNOSIS & HEALTH STATUS (cropdiagnosis, crop_health_status)
    # ─────────────────────────────────────────────────────────────────────────────
    c.execute("DELETE FROM cropdiagnosis WHERE crop_id IN (SELECT id FROM crop WHERE user_id = ?)", (u_farmer,))
    c.execute("DELETE FROM crop_health_status WHERE user_id = ?", (u_farmer,))

    # Diagnosis 1: Rice Leaf Blast
    diag1_json = json.dumps({
        "disease": "Rice Leaf Blast (Magnaporthe oryzae)",
        "pathogen_type": "Fungal",
        "affected_organs": ["Leaves", "Collar", "Neck"],
        "recommended_treatment": "Spray Tricyclazole 75% WP @ 0.6g/liter of water or Isoprothiolane 40% EC @ 1.5ml/liter.",
        "prevention": "Avoid excess nitrogen fertilizer. Maintain proper field water level without water stress.",
        "prognosis": "Favorable. If treated within 48 hours, yield loss is prevented.",
        "organic_alternative": "Foliar spray with Pseudomonas fluorescens @ 5g/liter."
    })
    c.execute("""
        INSERT INTO cropdiagnosis (crop_id, image_url, is_healthy, disease_name, severity, confidence, full_diagnosis_json, created_at)
        VALUES (?, 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=600', 0, 'Rice Leaf Blast (Magnaporthe oryzae)', 'moderate', '96.4%', ?, ?)
    """, (vinay_crop_ids[-2], diag1_json, "2026-08-10T14:30:00"))

    # Diagnosis 2: Healthy Crop Scan
    diag2_json = json.dumps({
        "disease": "None (Healthy Crop)",
        "condition": "Optimal tillering and vigorous vegetative foliage.",
        "chlorophyll_index": "SPAD 44.2 (Excellent)",
        "recommendation": "Continue planned irrigation schedule and scheduled micronutrient foliar spray."
    })
    c.execute("""
        INSERT INTO cropdiagnosis (crop_id, image_url, is_healthy, disease_name, severity, confidence, full_diagnosis_json, created_at)
        VALUES (?, 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600', 1, 'Healthy Paddy Canopy', 'none', '99.1%', ?, ?)
    """, (vinay_crop_ids[-2], diag2_json, "2026-08-18T10:15:00"))

    # Health Status records for all Vinay's crops
    for c_id in vinay_crop_ids:
        c.execute("""
            INSERT INTO crop_health_status (crop_id, status, notes, user_id, updated_at)
            VALUES (?, 'optimal', 'Regular scouting verified. Soil moisture and pest resistance monitored.', ?, ?)
        """, (c_id, u_farmer, now_iso))

    print(f" [OK] Seeded AI Crop Disease Diagnoses & Health Monitoring Records.")

    # ─────────────────────────────────────────────────────────────────────────────
    # STEP 11: SEED 3 YEARS OF SHOP TRANSACTIONS, OVERHEAD & SHOP EXPENSES
    # ─────────────────────────────────────────────────────────────────────────────
    c.execute("SELECT id, price, name FROM product WHERE user_id = ?", (u_shop,))
    shop_products = c.fetchall()

    c.execute("DELETE FROM shop_orders WHERE shop_id = ?", (u_shop,))
    c.execute("DELETE FROM shop_accounting_expenses WHERE shop_id = ?", (u_shop,))
    c.execute("DELETE FROM shop_expenses WHERE order_id IN (SELECT id FROM shop_orders WHERE shop_id = ?)", (u_shop,))

    shop_order_count = 0
    for yr in [2023, 2024, 2025, 2026]:
        end_m = today.month if yr == 2026 else 12
        for m in range(1, end_m + 1):
            m_dt = date(yr, m, 15)
            for ord_idx in range(4):
                f_buyer_id = all_farmer_ids[(ord_idx + m) % len(all_farmer_ids)]
                p_item = shop_products[(ord_idx * 2) % len(shop_products)]
                qty = 3 + (ord_idx % 4)
                subtotal = p_item[1] * qty
                discount = 40.0 if subtotal > 2000 else 0.0
                final_amt = subtotal - discount
                profit_amt = final_amt * 0.16
                shop_order_count += 1

                order_dt = datetime(yr, m, 4 + ord_idx * 6, 10 + ord_idx, 15).isoformat()
                c.execute("""
                    INSERT INTO shop_orders (total_amount, discount, final_amount, payment_mode, payment_status, status, created_at, shop_id, total_expenses, profit, farmer_id, farmer_name, order_notes)
                    VALUES (?, ?, ?, 'razorpay', 'paid', 'completed', ?, ?, 120.0, ?, ?, ?, 'Local agri-inputs counter purchase')
                """, (subtotal, discount, final_amt, order_dt, u_shop, profit_amt, f_buyer_id, f"Farmer #{f_buyer_id}"))
                so_id = c.lastrowid

                c.execute("""
                    INSERT INTO shop_order_items (product_name, quantity, unit_price, subtotal, order_id, product_id)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (p_item[2], qty, p_item[1], subtotal, so_id, p_item[0]))

                # Order-level shop logistics expenses
                c.execute("""
                    INSERT INTO shop_expenses (order_id, transportation, labour, other, notes, created_at)
                    VALUES (?, 60.0, 40.0, 20.0, 'Handling and delivery cartage', ?)
                """, (so_id, order_dt))

            # Monthly Overhead Expenses (Rent, Electricity, Labour)
            c.execute("""
                INSERT INTO shop_accounting_expenses (shop_id, category, amount, description, expense_date, created_at)
                VALUES (?, 'Rent', 8000.0, 'Monthly Store Shop Rent', ?, ?)
            """, (u_shop, m_dt.isoformat(), m_dt.isoformat()))
            c.execute("""
                INSERT INTO shop_accounting_expenses (shop_id, category, amount, description, expense_date, created_at)
                VALUES (?, 'Electricity', ?, 'APSPDCL Commercial Power Bill', ?, ?)
            """, (u_shop, 1800.0 + (m * 50), m_dt.isoformat(), m_dt.isoformat()))
            c.execute("""
                INSERT INTO shop_accounting_expenses (shop_id, category, amount, description, expense_date, created_at)
                VALUES (?, 'Labour', 9500.0, 'Helper and loader monthly wages', ?, ?)
            """, (u_shop, m_dt.isoformat(), m_dt.isoformat()))

    print(f" [OK] Seeded {shop_order_count} Orders, Shop Handling Expenses & 36 Months Operational Accounting for Vinay's Shop.")

    # ─────────────────────────────────────────────────────────────────────────────
    # STEP 12: SEED 3 YEARS OF MILL OPERATIONS, WEIGHMENTS, MOISTURE LOGS & SALES
    # ─────────────────────────────────────────────────────────────────────────────
    c.execute("DELETE FROM manufacturer_purchases WHERE manufacturer_id = ?", (u_mfr,))
    c.execute("DELETE FROM weighment_slips WHERE created_by = ?", (u_mfr,))
    c.execute("DELETE FROM production_batches WHERE manufacturer_id = ?", (u_mfr,))
    c.execute("DELETE FROM by_products WHERE manufacturer_id = ?", (u_mfr,))
    c.execute("DELETE FROM manufacturerexpense WHERE manufacturer_id = ?", (u_mfr,))
    c.execute("DELETE FROM moisture_deduction_logs WHERE created_by = ?", (u_mfr,))
    c.execute("DELETE FROM manufacturer_sales WHERE manufacturer_id = ?", (u_mfr,))
    c.execute("DELETE FROM mill_procurement_requests WHERE mill_id = ?", (u_mfr,))

    mfr_proc_count = 0
    for yr in [2023, 2024, 2025, 2026]:
        end_m = today.month if yr == 2026 else 12
        for m in [3, 7, 11]:  # Rabi & Kharif procurement peaks
            if yr == 2026 and m > end_m: continue
            proc_dt = datetime(yr, m, 18, 14, 0).isoformat()
            gross_wt = 180.0
            tare_wt = 38.0
            net_wt = gross_wt - tare_wt
            rate = 2380.0 + ((yr - 2023) * 60)
            total_amt = net_wt * rate
            batch_num = f"BATCH-VINAY-{yr}-M{m}"

            # Mill Purchase record
            c.execute("""
                INSERT INTO manufacturer_purchases (manufacturer_id, farmer_id, farmer_name, crop_name, quantity, unit, price_per_unit, total_cost, transport_cost, quality_grade, payment_mode, batch_id, date)
                VALUES (?, ?, 'Vinay Kumar Nethavath', 'Paddy (Sona Masoori BPT-5204)', ?, 'quintal', ?, ?, 1500.0, 'Grade A', 'Razorpay', ?, ?)
            """, (u_mfr, u_farmer, net_wt, rate, total_amt, batch_num, proc_dt))
            purch_id = c.lastrowid
            mfr_proc_count += 1

            # Digital Weighment Slip (Parchi)
            c.execute("""
                INSERT INTO weighment_slips (purchase_id, slip_number, gross_weight, tare_weight, net_weight, moisture_pct, foreign_matter_pct, damaged_grain_pct, quality_grade, moisture_deduction_kg, foreign_matter_deduction_kg, final_net_weight, price_per_unit, total_amount, msp_price, msp_comparison, payment_mode, payment_status, farmer_name, farmer_phone, crop_name, unit, vehicle_number, mill_name, mill_location, created_at, created_by)
                VALUES (?, ?, ?, ?, ?, 13.6, 0.3, 0.1, 'Grade A', 0.0, 0.0, ?, ?, ?, 2183.0, '+₹217 Above Government MSP', 'Razorpay', 'paid', 'Vinay Kumar Nethavath', '9876510001', 'Paddy (Sona Masoori)', 'quintal', 'AP 04 TX 8841', 'Vinay Agro Industries & Rice Mill', 'Tadipatri Industrial Area', ?, ?)
            """, (purch_id, f"WS-VINAY-{yr}-{m}", gross_wt, tare_wt, net_wt, net_wt, rate, total_amt, proc_dt, u_mfr))

            # Moisture Deduction Audit Log
            c.execute("""
                INSERT INTO moisture_deduction_logs (purchase_id, crop_name, original_weight, unit, actual_moisture, standard_moisture, moisture_excess, weight_deduction, adjusted_weight, foreign_matter_pct, foreign_matter_deduction, damaged_grain_pct, damaged_grain_deduction, final_net_weight, price_per_unit, total_value, created_at, created_by)
                VALUES (?, 'Paddy (Sona Masoori)', ?, 'quintal', 13.6, 14.0, 0.0, 0.0, ?, 0.3, 0.0, 0.1, 0.0, ?, ?, ?, ?, ?)
            """, (purch_id, net_wt, net_wt, net_wt, rate, total_amt, proc_dt, u_mfr))

            # Production Batch
            c.execute("""
                INSERT INTO production_batches (manufacturer_id, input_product_id, input_qty, output_product_name, output_qty, output_unit, processing_cost, waste_qty, efficiency, batch_number, date)
                VALUES (?, ?, ?, 'Vinay Royal Steamed Sona Masoori Rice 25kg', ?, 'bags', 14500.0, 4.5, 96.8, ?, ?)
            """, (u_mfr, purch_id, net_wt, int(net_wt * 2.8), batch_num, proc_dt))
            batch_id = c.lastrowid

            # By-Products
            c.execute("""
                INSERT INTO by_products (batch_id, manufacturer_id, name, quantity, unit, estimated_value_per_unit, total_value, sold_to, sold_price, sold_date, status, created_at)
                VALUES (?, ?, 'High-Protein Defatted Rice Bran', 28.0, 'quintal', 1880.0, 28.0 * 1880.0, 'Sri Balaji Cattle Feeds', 1880.0, ?, 'sold', ?)
            """, (batch_id, u_mfr, proc_dt, proc_dt))

            c.execute("""
                INSERT INTO by_products (batch_id, manufacturer_id, name, quantity, unit, estimated_value_per_unit, total_value, status, created_at)
                VALUES (?, ?, 'Rice Husk Biomass Boiler Fuel', 42.0, 'quintal', 430.0, 42.0 * 430.0, 'in_stock', ?)
            """, (batch_id, u_mfr, proc_dt))

            # Mill Operational Expenses (Electricity, Labour)
            c.execute("""
                INSERT INTO manufacturerexpense (manufacturer_id, category, amount, description, expense_date, created_at)
                VALUES (?, 'electricity', 24500.0, 'HT Power Substation Electricity Bill', ?, ?)
            """, (u_mfr, date(yr, m, 25), proc_dt))
            c.execute("""
                INSERT INTO manufacturerexpense (manufacturer_id, category, amount, description, expense_date, created_at)
                VALUES (?, 'labour', 38000.0, 'Mill operators and bagging team monthly wages', ?, ?)
            """, (u_mfr, date(yr, m, 28), proc_dt))

            # Mill Sales of finished goods to local stores & bulk buyers
            c.execute("""
                INSERT INTO manufacturer_sales (manufacturer_id, buyer_type, buyer_name, product_id, quantity, selling_price, discount, total_amount, payment_mode, invoice_id, delivery_status, date)
                VALUES (?, 'Retail Shop', 'Vinay Agri Inputs & Fertilizer Store', ?, 60.0, 1450.0, 1000.0, 86000.0, 'Razorpay', ?, 'delivered', ?)
            """, (u_mfr, mill_prod_ids[0], f"INV-MILL-{yr}-{m}", proc_dt))

    # Inbound Mill Procurement Requests from local farmers within 50 km
    for p_idx, s_fid in enumerate(all_farmer_ids[1:7]):
        c.execute("SELECT full_name, phone_number FROM user WHERE id = ?", (s_fid,))
        f_u = c.fetchone()
        f_n = f_u[0] if f_u else f"Local Farmer #{s_fid}"
        f_p = f_u[1] if f_u else "9849010001"
        c.execute("""
            INSERT INTO mill_procurement_requests (mill_id, farmer_id, crop_name, quantity, unit, expected_price_per_unit, quality_grade, moisture_content, harvest_date, farmer_name, farmer_phone, farmer_location, notes, status, delivery_slot_date, vehicle_type, vehicle_number, token_number, created_at, updated_at)
            VALUES (?, ?, 'Paddy (Sona Masoori BPT-5204)', 120.0, 'quintal', 2420.0, 'Grade A', 13.8, '2026-08-15', ?, ?, 'Tadipatri Circle', 'Direct harvest delivery slot booked with mill.', 'approved', '2026-08-28', 'Tractor Trailer', 'AP 04 TC 8812', ?, ?, ?)
        """, (u_mfr, s_fid, f_n, f_p, f"TOK-ATP-00{p_idx+1}", now_iso, now_iso))

    # Active Farmer Load Pool & Pool Members
    c.execute("""
        INSERT OR REPLACE INTO farmer_load_pools (creator_id, crop_name, target_quantity, current_quantity, unit, village, mandal, district, state, delivery_date, preferred_mill_id, preferred_mill_name, status, min_quality_grade, expected_price_per_unit, notes, created_at, updated_at)
        VALUES (?, 'Paddy (Sona Masoori)', 180.0, 125.0, 'quintal', 'Chinna Vaduguru', 'Tadipatri', 'Anantapur', 'Andhra Pradesh', '2026-08-30', ?, 'Vinay Agro Industries & Rice Mill', 'open', 'Grade A', 2450.0, 'Direct collective dispatch to Vinay Agro Mill. Free offloading and zero wait time.', ?, ?)
    """, (u_farmer, u_mfr, now_iso, now_iso))
    pool_id = c.lastrowid

    c.execute("DELETE FROM farmer_load_pool_members WHERE pool_id = ?", (pool_id,))
    c.execute("""
        INSERT INTO farmer_load_pool_members (pool_id, farmer_id, farmer_name, farmer_phone, quantity, unit, quality_grade, joined_at)
        VALUES (?, ?, 'Vinay Kumar Nethavath', '9876510001', 50.0, 'quintal', 'Grade A', ?)
    """, (pool_id, u_farmer, now_iso))
    c.execute("""
        INSERT INTO farmer_load_pool_members (pool_id, farmer_id, farmer_name, farmer_phone, quantity, unit, quality_grade, joined_at)
        VALUES (?, ?, 'Suresh Reddy', '9849010002', 40.0, 'quintal', 'Grade A', ?)
    """, (pool_id, all_farmer_ids[2], now_iso))
    c.execute("""
        INSERT INTO farmer_load_pool_members (pool_id, farmer_id, farmer_name, farmer_phone, quantity, unit, quality_grade, joined_at)
        VALUES (?, ?, 'Balaji Chowdary', '9849010004', 35.0, 'quintal', 'Grade A', ?)
    """, (pool_id, all_farmer_ids[4], now_iso))

    print(f" [OK] Seeded Mill Procurements, Weighment Slips, Moisture Logs, Milling Batches, Sales & Farmer Load Pool.")

    # ─────────────────────────────────────────────────────────────────────────────
    # STEP 13: SEED TRACEABILITY EVENTS & BLOCKCHAIN LEDGER
    # ─────────────────────────────────────────────────────────────────────────────
    c.execute("DELETE FROM traceabilityevent WHERE product_id = ?", (mill_prod_ids[0],))
    c.execute("DELETE FROM blockchain_blocks WHERE product_id = ?", (mill_prod_ids[0],))

    trace_events = [
        ("SEEDING", "Foundation BPT-5204 seeds planted by Vinay Kumar at Chinna Vaduguru farm (Survey #182/1-A)."),
        ("SOIL_AUDIT", "Tested by KVK Anantapur with SHC-AP-ATP-2025-1734. Optimal organic carbon 0.72%."),
        ("HARVEST", "96 Quintals harvested at 13.6% moisture level with Grade A purity certification."),
        ("MILL_RECEPTION", "Delivered to Vinay Agro Industries with Digital Weighment Slip WS-VINAY-2025-11."),
        ("SORTEX_MILLING", "Milled in 120 TPD Buhler Sortex milling plant. Batch #BATCH-VINAY-2025-M11."),
        ("PACKAGING_DISPATCH", "Hermetically packaged in 25kg tamper-proof sealed bags with verifiable QR traceability.")
    ]

    prev_hash = "0000000000000000000000000000000000000000000000000000000000000000"
    for b_idx, (action, detail) in enumerate(trace_events):
        event_dt = (datetime(2025, 7, 10) + timedelta(days=b_idx * 28)).isoformat()
        c.execute("""
            INSERT INTO traceabilityevent (product_id, actor_id, action, details, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (mill_prod_ids[0], u_mfr, action, detail, event_dt))

        block_payload = json.dumps({"action": action, "details": detail, "product_id": mill_prod_ids[0], "timestamp": event_dt})
        cur_hash = hashlib.sha256(f"{b_idx+1}|{prev_hash}|{block_payload}".encode()).hexdigest()

        c.execute("""
            INSERT INTO blockchain_blocks (block_index, timestamp, previous_hash, hash, payload, product_id, certification_type, verifier_name)
            VALUES (?, ?, ?, ?, ?, ?, 'AgriFlow Supply Chain Traceability', 'AP Agriculture Authority')
        """, (b_idx + 1, event_dt, prev_hash, cur_hash, block_payload, mill_prod_ids[0]))
        prev_hash = cur_hash

    print(f" [OK] Seeded 6 Farm-to-Fork Traceability Events & Immutable Blockchain Ledger.")

    # ─────────────────────────────────────────────────────────────────────────────
    # STEP 14: SEED 3 YEARS OF PURCHASES FOR VINAY'S CUSTOMER ACCOUNT
    # ─────────────────────────────────────────────────────────────────────────────
    prod_rice = mill_goods[0]
    prod_atta = mill_goods[2]

    c.execute("DELETE FROM customer_orders WHERE customer_id = ?", (u_cust,))

    cust_order_count = 0
    for yr in [2023, 2024, 2025, 2026]:
        end_m = today.month if yr == 2026 else 12
        for m in [1, 3, 5, 7, 9, 11]:
            if yr == 2026 and m > end_m: continue
            order_dt = datetime(yr, m, 8, 18, 30).isoformat()
            tot = prod_rice[2] + (prod_atta[2] * 2)
            c.execute("""
                INSERT INTO customer_orders (customer_id, total_amount, status, created_at, payment_mode, payment_status, payment_id, shipping_address)
                VALUES (?, ?, 'delivered', ?, 'razorpay', 'paid', ?, 'House #4-12, Main Street, Tadipatri, Anantapur, AP - 515411')
            """, (u_cust, tot, order_dt, f"pay_rzp_vinay_{yr}_{m}"))
            co_id = c.lastrowid
            cust_order_count += 1

            c.execute("""
                INSERT INTO customer_order_items (order_id, product_id, seller_id, product_name, quantity, price)
                VALUES (?, ?, ?, ?, 1.0, ?)
            """, (co_id, mill_prod_ids[0], u_mfr, prod_rice[0], prod_rice[2]))

            c.execute("""
                INSERT INTO customer_order_items (order_id, product_id, seller_id, product_name, quantity, price)
                VALUES (?, ?, ?, ?, 2.0, ?)
            """, (co_id, mill_prod_ids[2], u_mfr, prod_atta[0], prod_atta[2]))

    # Active Shopping Cart for Vinay's Customer account
    c.execute("DELETE FROM cart WHERE customer_id = ?", (u_cust,))
    c.execute("INSERT INTO cart (customer_id, product_id, quantity) VALUES (?, ?, 1.0)", (u_cust, mill_prod_ids[0]))
    c.execute("INSERT INTO cart (customer_id, product_id, quantity) VALUES (?, ?, 2.0)", (u_cust, mill_prod_ids[2]))

    print(f" [OK] Seeded {cust_order_count} Historical Invoices & Active Shopping Cart for Vinay's Customer Account.")

    # ─────────────────────────────────────────────────────────────────────────────
    # STEP 15: SEED EMERGENCY & EXTENSION DIRECTORY CONTACTS
    # ─────────────────────────────────────────────────────────────────────────────
    c.execute("DELETE FROM emergency_contacts WHERE farmer_id = ? OR farmer_id IS NULL", (u_farmer,))
    emergency_contacts = [
        ("Tadipatri Krishi Vigyan Kendra (KVK) Scientist Helpdesk", "agricultural_extension", "08558-220192", "9440118821", "KVK Reddipalli / Tadipatri Circle", 0, 1, "9:00 AM - 5:00 PM (Mon-Sat)", "Free agronomic advice, pest alerts and soil report guidance.", u_farmer, now_iso, now_iso),
        ("Assistant Director of Agriculture (ADA) Office Tadipatri", "government_officer", "08558-220450", "9849903412", "Department of Agriculture, AP", 0, 1, "10:00 AM - 5:00 PM (Working Days)", "Seed subsidy, fertilizer enforcement and PM-KISAN verification.", u_farmer, now_iso, now_iso),
        ("Rythu Bharosa Kendra (RBK) Chinna Vaduguru", "government_officer", "9849010099", None, "Chinna Vaduguru Gram Panchayat", 0, 1, "8:00 AM - 6:00 PM Daily", "Local village input booking, CM-APP registration and e-Crop booking.", u_farmer, now_iso, now_iso),
        ("Veterinary Hospital & Livestock Doctor, Tadipatri", "veterinary", "08558-221088", "9440552190", "Animal Husbandry Department", 0, 1, "24 Hours Emergency", "Bovine vaccination, emergency surgical and deworming services.", u_farmer, now_iso, now_iso),
        ("Kisan Call Center (Central Government)", "emergency", "1800-180-1551", None, "Ministry of Agriculture & Farmers Welfare", 1, 1, "6:00 AM - 10:00 PM All 365 Days", "Toll-free nationwide multilingual farmer assistance hotline.", u_farmer, now_iso, now_iso),
        ("APSPDCL Agricultural Power Feeder Tadipatri", "electricity", "1912", "08558-223456", "AP Southern Power Distribution Company", 1, 1, "24x7 Helpline", "Report transformer breakdown, phase drop and scheduled 9-hour farm power supply.", u_farmer, now_iso, now_iso),
        ("Emergency Ambulance & Medical Services", "emergency", "108", "102", "Emergency Medical Services", 1, 1, "24x7 Round the Clock", "Immediate trauma and snakebite emergency medical transport.", u_farmer, now_iso, now_iso),
        ("Tadipatri Fire Station & Disaster Relief", "emergency", "101", "08558-220101", "AP State Disaster Response & Fire Services", 1, 1, "24x7 Immediate Response", "Crop fire extinguishing and flood rescue operations.", u_farmer, now_iso, now_iso),
    ]

    c.executemany("""
        INSERT INTO emergency_contacts (name, category, phone_number, alternate_phone, department_or_village, is_toll_free, is_verified, availability_hours, notes, farmer_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, emergency_contacts)

    print(f" [OK] Seeded 8 Verified Agricultural Extension, Veterinary & Emergency Services.")

    # ─────────────────────────────────────────────────────────────────────────────
    # STEP 16: SEED DIRECT CHAT CHANNELS CONNECTING VINAY'S ACCOUNTS
    # ─────────────────────────────────────────────────────────────────────────────
    c.execute("""
        INSERT INTO chatchannel (name, channel_type, location_tag, created_at)
        VALUES ('Direct: Vinay Farmer <-> Vinay Agri Store', 'p2p', 'Tadipatri', ?)
    """, (now_iso,))
    ch_vf_vs = c.lastrowid
    c.execute("INSERT INTO channelmember (channel_id, user_id, joined_at) VALUES (?, ?, ?)", (ch_vf_vs, u_farmer, now_iso))
    c.execute("INSERT INTO channelmember (channel_id, user_id, joined_at) VALUES (?, ?, ?)", (ch_vf_vs, u_shop, now_iso))

    c.execute("""
        INSERT INTO chatchannel (name, channel_type, location_tag, created_at)
        VALUES ('Direct: Vinay Farmer <-> Vinay Agro Mill', 'p2p', 'Tadipatri', ?)
    """, (now_iso,))
    ch_vf_vm = c.lastrowid
    c.execute("INSERT INTO channelmember (channel_id, user_id, joined_at) VALUES (?, ?, ?)", (ch_vf_vm, u_farmer, now_iso))
    c.execute("INSERT INTO channelmember (channel_id, user_id, joined_at) VALUES (?, ?, ?)", (ch_vf_vm, u_mfr, now_iso))

    c.execute("""
        INSERT INTO chatmessage (channel_id, sender_id, sender_name, message_text, created_at)
        VALUES (?, ?, 'Vinay Kumar Nethavath (Farmer)', 'Hello, do you have fresh IFFCO DAP and Zinc Sulphate in stock for the current Kharif season?', ?)
    """, (ch_vf_vs, u_farmer, (now_dt - timedelta(hours=3)).isoformat()))

    c.execute("""
        INSERT INTO chatmessage (channel_id, sender_id, sender_name, message_text, created_at)
        VALUES (?, ?, 'Vinay Agri Store', 'Yes Vinay garu, fresh stock arrived today. Subsidized Aadhaar price available at counter.', ?)
    """, (ch_vf_vs, u_shop, (now_dt - timedelta(hours=2)).isoformat()))

    conn.commit()
    conn.close()

    print("\n" + "=" * 80)
    print("  ALL REQUESTED SEED DATA SUCCESSFULLY GENERATED AND STORED!")
    print("=" * 80)

if __name__ == "__main__":
    generate()

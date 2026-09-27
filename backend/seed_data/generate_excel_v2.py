"""
AgriFlow Seed Data Generator V2 — Community Interlinked Edition
================================================================
Generates a comprehensive Excel workbook with 10 sheets that create
a realistic, deeply interlinked agricultural supply chain:

  ENTITY SHEETS (users & profiles):
    1. farmers          – 15,000 farmers in 6 focus regions (clusters)
    2. shops            – 800 agri-input shops linked to farmer regions
    3. mills            – 400 mills linked to farmer regions
    4. customers        – 5,000 end-consumers from OTHER regions (cross-region buying)

  TRANSACTION SHEETS (interlinking):
    5. farmer_shop_orders  – Farmers buying inputs from nearby shops
    6. farmer_mill_sales   – Farmers selling harvest to nearby mills
    7. mill_production     – Mills processing raw → finished goods
    8. mill_customer_sales – Mills selling processed goods to cross-region customers
    9. customer_orders     – Customers buying directly from farmers/mills
   10. community_links     – Farmer ↔ Shop ↔ Mill community mapping

Run:  python generate_excel_v2.py
Output: agriflow_seed_data_v2.xlsx
"""

import random
import string
import os
from datetime import datetime, timedelta, date
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

# ─── Deterministic seed for reproducibility ──────────────────────────────────
random.seed(2026)

# ═══════════════════════════════════════════════════════════════════════════════
#                     REGION DEFINITIONS (6 FOCUS CLUSTERS)
# ═══════════════════════════════════════════════════════════════════════════════
#
# Each cluster is a focused agricultural region containing tightly coupled:
#   - Farmer villages  (where crops grow)
#   - Nearby mandis/market towns  (where shops operate)
#   - Industrial pockets  (where mills process)
#
# Customers come from DIFFERENT regions to create cross-region trade.

FOCUS_REGIONS = [
    # ── Region 1: Telangana Rice Belt ─────────────────────────────────────────
    {
        "region_name": "Telangana Rice Belt",
        "state": "Telangana",
        "districts": [
            {
                "district": "Warangal", "mandal": "Hanamkonda",
                "farmer_villages": ["Kazipet", "Elkathurthy", "Parkal", "Narsampet", "Jangaon", "Wardhannapet", "Mahabubabad", "Dornakal"],
                "market_towns": ["Hanamkonda", "Warangal City", "Jangaon Town"],
                "mill_areas": ["Kazipet Industrial", "Warangal MIDC"],
                "pincode_prefix": "506",
            },
            {
                "district": "Karimnagar", "mandal": "Karimnagar",
                "farmer_villages": ["Huzurabad", "Jagtial", "Metpally", "Korutla", "Peddapalli", "Manthani", "Sulthanabad", "Dharmapuri"],
                "market_towns": ["Karimnagar City", "Jagtial Town", "Peddapalli Town"],
                "mill_areas": ["Karimnagar Ind. Estate", "Peddapalli Rice Hub"],
                "pincode_prefix": "505",
            },
            {
                "district": "Nizamabad", "mandal": "Nizamabad",
                "farmer_villages": ["Bodhan", "Armoor", "Kamareddy", "Banswada", "Yellareddy", "Machareddy", "Pitlam", "Balkonda"],
                "market_towns": ["Nizamabad City", "Kamareddy Town"],
                "mill_areas": ["Nizamabad Ind. Area", "Bodhan Rice Complex"],
                "pincode_prefix": "503",
            },
        ],
        "primary_crops": ["Paddy", "Cotton", "Turmeric", "Chilli"],
        "lat_range": (17.8, 19.2), "lon_range": (78.0, 80.0),
    },
    # ── Region 2: Andhra Pradesh Godavari Delta ──────────────────────────────
    {
        "region_name": "AP Godavari Delta",
        "state": "Andhra Pradesh",
        "districts": [
            {
                "district": "East Godavari", "mandal": "Kakinada",
                "farmer_villages": ["Rajahmundry", "Amalapuram", "Mandapeta", "Ramachandrapuram", "Pithapuram", "Tuni", "Mummidivaram", "Ravulapalem"],
                "market_towns": ["Kakinada City", "Rajahmundry Town", "Amalapuram Town"],
                "mill_areas": ["Kakinada Port Area", "Rajahmundry Ind."],
                "pincode_prefix": "533",
            },
            {
                "district": "West Godavari", "mandal": "Eluru",
                "farmer_villages": ["Bhimavaram", "Narsapuram", "Tadepalligudem", "Palacole", "Tanuku", "Kovvur", "Undi", "Akividu"],
                "market_towns": ["Eluru City", "Bhimavaram Town", "Tanuku Town"],
                "mill_areas": ["Bhimavaram Rice Hub", "Eluru Processing Zone"],
                "pincode_prefix": "534",
            },
            {
                "district": "Guntur", "mandal": "Guntur",
                "farmer_villages": ["Tenali", "Mangalagiri", "Sattenapalli", "Narasaraopet", "Bapatla", "Repalle", "Macherla", "Vinukonda"],
                "market_towns": ["Guntur Mandi", "Tenali Market", "Bapatla Town"],
                "mill_areas": ["Guntur Chilli Yards", "Tenali Rice Mills"],
                "pincode_prefix": "522",
            },
        ],
        "primary_crops": ["Paddy", "Chilli", "Sugarcane", "Groundnut"],
        "lat_range": (15.5, 17.5), "lon_range": (80.5, 82.5),
    },
    # ── Region 3: Punjab Wheat Granary ────────────────────────────────────────
    {
        "region_name": "Punjab Wheat Granary",
        "state": "Punjab",
        "districts": [
            {
                "district": "Ludhiana", "mandal": "Ludhiana",
                "farmer_villages": ["Jagraon", "Samrala", "Khanna", "Raikot", "Payal", "Machhiwara", "Doraha", "Sudhar"],
                "market_towns": ["Ludhiana Grain Market", "Khanna Mandi", "Jagraon Mandi"],
                "mill_areas": ["Ludhiana Focal Point", "Khanna Flour Mills"],
                "pincode_prefix": "141",
            },
            {
                "district": "Amritsar", "mandal": "Amritsar",
                "farmer_villages": ["Tarn Taran", "Ajnala", "Majitha", "Jandiala Guru", "Baba Bakala", "Ramdas", "Lopoke", "Chogawan"],
                "market_towns": ["Amritsar Grain Market", "Tarn Taran Mandi"],
                "mill_areas": ["Amritsar Industrial Area", "Tarn Taran Processing"],
                "pincode_prefix": "143",
            },
            {
                "district": "Patiala", "mandal": "Patiala",
                "farmer_villages": ["Rajpura", "Nabha", "Samana", "Patran", "Ghanaur", "Sanaur", "Banur", "Ghagga"],
                "market_towns": ["Patiala Grain Market", "Rajpura Mandi", "Nabha Mandi"],
                "mill_areas": ["Rajpura Industrial Area", "Patiala Processing"],
                "pincode_prefix": "147",
            },
        ],
        "primary_crops": ["Wheat", "Paddy", "Maize", "Mustard"],
        "lat_range": (30.2, 31.8), "lon_range": (74.5, 76.5),
    },
    # ── Region 4: Maharashtra Deccan Plateau ──────────────────────────────────
    {
        "region_name": "Maharashtra Deccan",
        "state": "Maharashtra",
        "districts": [
            {
                "district": "Pune", "mandal": "Haveli",
                "farmer_villages": ["Baramati", "Indapur", "Daund", "Junnar", "Shirur", "Bhor", "Purandar", "Khed"],
                "market_towns": ["Pune Market Yard", "Baramati APMC", "Daund Mandi"],
                "mill_areas": ["Pimpri-Chinchwad MIDC", "Baramati Processing"],
                "pincode_prefix": "411",
            },
            {
                "district": "Nashik", "mandal": "Nashik",
                "farmer_villages": ["Sinnar", "Niphad", "Dindori", "Igatpuri", "Malegaon", "Yeola", "Chandwad", "Kalwan"],
                "market_towns": ["Nashik APMC", "Malegaon Market", "Niphad Onion Yard"],
                "mill_areas": ["Nashik MIDC", "Sinnar Industrial"],
                "pincode_prefix": "422",
            },
            {
                "district": "Kolhapur", "mandal": "Kolhapur",
                "farmer_villages": ["Ichalkaranji", "Hatkanangale", "Shirol", "Kagal", "Radhanagari", "Panhala", "Gadhinglaj", "Chandgad"],
                "market_towns": ["Kolhapur Market Yard", "Ichalkaranji Market"],
                "mill_areas": ["Kolhapur Industrial", "Shiroli MIDC"],
                "pincode_prefix": "416",
            },
        ],
        "primary_crops": ["Sugarcane", "Soybean", "Onion", "Jowar"],
        "lat_range": (16.5, 20.0), "lon_range": (73.5, 75.5),
    },
    # ── Region 5: Uttar Pradesh Indo-Gangetic ─────────────────────────────────
    {
        "region_name": "UP Indo-Gangetic",
        "state": "Uttar Pradesh",
        "districts": [
            {
                "district": "Lucknow", "mandal": "Lucknow",
                "farmer_villages": ["Mohanlalganj", "Malihabad", "Bakshi Ka Talab", "Chinhat", "Kakori", "Itaunja", "Gosaiganj", "Nagram"],
                "market_towns": ["Lucknow Krishi Mandi", "Chinhat Market"],
                "mill_areas": ["Amausi Industrial", "Chinhat Processing"],
                "pincode_prefix": "226",
            },
            {
                "district": "Varanasi", "mandal": "Varanasi",
                "farmer_villages": ["Pindra", "Chiraigaon", "Rajatalab", "Cholapur", "Harahua", "Sevapuri", "Kashi Vidyapeeth", "Badagaon"],
                "market_towns": ["Varanasi Mandi", "Rajatalab Market"],
                "mill_areas": ["Varanasi Industrial", "Pindra Processing"],
                "pincode_prefix": "221",
            },
            {
                "district": "Kanpur", "mandal": "Kanpur Nagar",
                "farmer_villages": ["Bilhaur", "Ghatampur", "Bhitargaon", "Sarsaul", "Patara", "Kakwan", "Shivrajpur", "Chaubepur"],
                "market_towns": ["Kanpur Anaj Mandi", "Bilhaur Market"],
                "mill_areas": ["Panki Industrial", "Dada Nagar Processing"],
                "pincode_prefix": "208",
            },
        ],
        "primary_crops": ["Wheat", "Paddy", "Sugarcane", "Potato"],
        "lat_range": (25.5, 27.5), "lon_range": (80.0, 83.5),
    },
    # ── Region 6: Karnataka Southern Plateau ──────────────────────────────────
    {
        "region_name": "Karnataka Southern",
        "state": "Karnataka",
        "districts": [
            {
                "district": "Mysuru", "mandal": "Mysuru",
                "farmer_villages": ["Nanjangud", "T Narasipura", "Hunsur", "Periyapatna", "K R Nagar", "Bannur", "Sargur", "Heggadadevankote"],
                "market_towns": ["Mysuru APMC", "Nanjangud Market"],
                "mill_areas": ["Mysuru Industrial", "Nanjangud Processing"],
                "pincode_prefix": "570",
            },
            {
                "district": "Mandya", "mandal": "Mandya",
                "farmer_villages": ["Maddur", "Malavalli", "Srirangapatna", "Pandavapura", "Nagamangala", "K R Pet", "Shrirangapattana", "Melukote"],
                "market_towns": ["Mandya Sugar Market", "Maddur Mandi"],
                "mill_areas": ["Mandya Sugar Complex", "Maddur Processing"],
                "pincode_prefix": "571",
            },
            {
                "district": "Hassan", "mandal": "Hassan",
                "farmer_villages": ["Belur", "Channarayapatna", "Arkalgud", "Arsikere", "Holenarasipura", "Sakleshpur", "Alur", "Arasikere"],
                "market_towns": ["Hassan APMC", "Arsikere Market"],
                "mill_areas": ["Hassan Industrial", "Arsikere Rice Mills"],
                "pincode_prefix": "573",
            },
        ],
        "primary_crops": ["Paddy", "Sugarcane", "Jowar", "Groundnut"],
        "lat_range": (12.0, 13.5), "lon_range": (75.5, 77.5),
    },
]

# ── Customer source regions (where customers come FROM — different from farmer regions) ──
CUSTOMER_REGIONS = [
    {"state": "Delhi", "districts": [
        {"district": "New Delhi", "mandal": "New Delhi", "villages": ["Dwarka", "Rohini", "Vasant Kunj", "Janakpuri", "Saket"], "pincode_prefix": "110"},
        {"district": "South Delhi", "mandal": "Hauz Khas", "villages": ["Mehrauli", "Kalkaji", "Lajpat Nagar", "Greater Kailash"], "pincode_prefix": "110"},
    ]},
    {"state": "Tamil Nadu", "districts": [
        {"district": "Chennai", "mandal": "Chennai", "villages": ["Adyar", "T Nagar", "Anna Nagar", "Mylapore", "Velachery"], "pincode_prefix": "600"},
        {"district": "Coimbatore", "mandal": "Coimbatore", "villages": ["Peelamedu", "Gandhipuram", "RS Puram", "Singanallur"], "pincode_prefix": "641"},
    ]},
    {"state": "Gujarat", "districts": [
        {"district": "Ahmedabad", "mandal": "Ahmedabad", "villages": ["Navrangpura", "Satellite", "Bopal", "Chandkheda", "Maninagar"], "pincode_prefix": "380"},
        {"district": "Surat", "mandal": "Surat", "villages": ["Adajan", "Vesu", "Athwa", "Varachha", "Katargam"], "pincode_prefix": "395"},
    ]},
    {"state": "Rajasthan", "districts": [
        {"district": "Jaipur", "mandal": "Jaipur", "villages": ["Malviya Nagar", "Vaishali Nagar", "Mansarovar", "Tonk Road"], "pincode_prefix": "302"},
        {"district": "Jodhpur", "mandal": "Jodhpur", "villages": ["Paota", "Sardarpura", "Ratanada", "Basni"], "pincode_prefix": "342"},
    ]},
    {"state": "West Bengal", "districts": [
        {"district": "Kolkata", "mandal": "Kolkata", "villages": ["Salt Lake", "Dum Dum", "Behala", "Jadavpur", "Howrah"], "pincode_prefix": "700"},
        {"district": "Hooghly", "mandal": "Chinsurah", "villages": ["Serampore", "Chandannagar", "Bandel", "Uttarpara"], "pincode_prefix": "712"},
    ]},
]

# ─── Indian Names ─────────────────────────────────────────────────────────────

MALE_FIRST_NAMES = [
    "Ramesh", "Suresh", "Mahesh", "Rajesh", "Ganesh", "Venkatesh", "Naresh", "Dinesh",
    "Anil", "Sunil", "Manoj", "Ajay", "Vijay", "Sanjay", "Ravi", "Kiran",
    "Prakash", "Harish", "Satish", "Girish", "Ashok", "Vinod", "Pramod", "Arvind",
    "Deepak", "Alok", "Pankaj", "Mukesh", "Yogesh", "Umesh", "Rakesh", "Nilesh",
    "Gopal", "Mohan", "Sohan", "Rohan", "Vishal", "Nikhil", "Sachin", "Rahul",
    "Amit", "Sumit", "Mohit", "Rohit", "Varun", "Tarun", "Charan", "Karan",
    "Naveen", "Praveen", "Sravan", "Pavan", "Bharat", "Ishwar", "Shyam", "Ram",
    "Krishna", "Balaji", "Murali", "Srinivas", "Venu", "Prasad", "Lakshman", "Raju",
    "Sathya", "Bhaskar", "Shankar", "Sekhar", "Kishore", "Bala", "Anand", "Nanda",
    "Jagdish", "Devendra", "Surendra", "Narendra", "Rajendra", "Mahendra", "Birendra", "Dhirendra",
    "Santosh", "Ramakrishna", "Venkata", "Siddharth", "Akhil", "Pranav", "Arjun", "Vikram",
    "Mahadev", "Shiva", "Ganpat", "Hanuman", "Tulsi", "Govind", "Hari", "Nagendra",
    "Basavaraj", "Channappa", "Yellappa", "Mallappa", "Thimmappa", "Siddappa", "Hanumanth", "Basappa",
]

FEMALE_FIRST_NAMES = [
    "Lakshmi", "Saraswati", "Parvati", "Durga", "Sita", "Radha", "Ganga", "Yamuna",
    "Anita", "Sunita", "Kavita", "Savita", "Mamta", "Sumitra", "Rekha", "Meena",
    "Padma", "Kamla", "Shanti", "Jaya", "Vijaya", "Sujata", "Renuka", "Anuradha",
    "Bhavani", "Gayatri", "Lata", "Geeta", "Seema", "Neelam", "Pushpa", "Saroja",
    "Vasanta", "Chandra", "Indira", "Nirmala", "Usha", "Aruna", "Swati", "Priya",
    "Deepa", "Asha", "Ranjana", "Madhuri", "Sneha", "Pooja", "Divya", "Ananya",
]

LAST_NAMES = [
    "Reddy", "Naidu", "Rao", "Kumar", "Singh", "Yadav", "Sharma", "Verma",
    "Patel", "Shah", "Desai", "Patil", "Shinde", "Jadhav", "More", "Gowda",
    "Swamy", "Nair", "Menon", "Pillai", "Das", "Ghosh", "Roy", "Sen",
    "Joshi", "Kulkarni", "Deshpande", "Hegde", "Shetty", "Bhat", "Kaur", "Gill",
    "Sidhu", "Dhillon", "Sandhu", "Chauhan", "Thakur", "Rajput", "Tiwari", "Pandey",
    "Mishra", "Dubey", "Gupta", "Agarwal", "Bansal", "Jain", "Sethi", "Mehta",
    "Chaudhary", "Mandal", "Sarkar", "Mondal", "Biswas", "Barman", "Mahato", "Murmu",
    "Nethavath", "Rathod", "Pawar", "Bhosale", "Chavan", "Kale", "Solanki", "Rajput",
]

FATHER_NAMES = [
    "Ramaiah", "Venkataiah", "Narasimha", "Balaiah", "Chandraiah", "Laxmaiah", "Mallaiah",
    "Rajanna", "Pochaiah", "Yellaiah", "Veeraiah", "Bhaskar", "Gangaram", "Laxman",
    "Bhagwan", "Dharma", "Shankar", "Kishan", "Mohan", "Gopal", "Shyam", "Girdhari",
    "Raghunath", "Jagannath", "Vishwanath", "Dashrath", "Trilok", "Omkar", "Devidas",
]

# ─── Crop Data ────────────────────────────────────────────────────────────────

CROPS = {
    "Kharif": [
        {"name": "Paddy", "type": "Cereal", "varieties": ["Sona Masuri", "BPT 5204", "IR-64", "Swarna", "Tellahamsa", "MTU-1010"], "yield_range": (15, 35), "price_range": (1800, 2500), "cost_per_acre": (12000, 22000)},
        {"name": "Maize", "type": "Cereal", "varieties": ["DHM-117", "Kaveri 50", "NK-6240", "Pioneer 3522"], "yield_range": (20, 40), "price_range": (1400, 2100), "cost_per_acre": (10000, 18000)},
        {"name": "Cotton", "type": "Commercial", "varieties": ["Bt Cotton", "Bunny", "Mallika", "Suraj", "NCS-145"], "yield_range": (8, 18), "price_range": (5500, 7200), "cost_per_acre": (15000, 30000)},
        {"name": "Soybean", "type": "Oilseed", "varieties": ["JS-335", "JS-9560", "NRC-37", "MACS-1407"], "yield_range": (8, 15), "price_range": (3800, 5200), "cost_per_acre": (8000, 15000)},
        {"name": "Groundnut", "type": "Oilseed", "varieties": ["TMV-2", "JL-501", "Kadiri-6", "TAG-24"], "yield_range": (10, 20), "price_range": (4500, 6500), "cost_per_acre": (12000, 20000)},
        {"name": "Chilli", "type": "Spice", "varieties": ["Teja", "Byadgi", "S-4", "LCA-334", "US-341"], "yield_range": (5, 15), "price_range": (8000, 18000), "cost_per_acre": (25000, 45000)},
        {"name": "Turmeric", "type": "Spice", "varieties": ["Erode Local", "Salem", "Rajapore", "Mydukur"], "yield_range": (20, 40), "price_range": (6000, 12000), "cost_per_acre": (30000, 55000)},
        {"name": "Sugarcane", "type": "Commercial", "varieties": ["Co-86032", "CoC-671", "Co-0238", "CoM-0265"], "yield_range": (300, 500), "price_range": (280, 350), "cost_per_acre": (35000, 60000)},
        {"name": "Jowar", "type": "Cereal", "varieties": ["CSV-15", "CSH-16", "Maldandi", "M-35-1"], "yield_range": (8, 18), "price_range": (2200, 3200), "cost_per_acre": (6000, 12000)},
        {"name": "Bajra", "type": "Cereal", "varieties": ["HHB-67", "ICTP-8203", "Raj-171", "GHB-558"], "yield_range": (8, 16), "price_range": (1900, 2800), "cost_per_acre": (5000, 10000)},
    ],
    "Rabi": [
        {"name": "Wheat", "type": "Cereal", "varieties": ["PBW-343", "HD-2967", "Lok-1", "GW-496", "WH-1105"], "yield_range": (15, 30), "price_range": (1900, 2600), "cost_per_acre": (10000, 18000)},
        {"name": "Chickpea", "type": "Pulse", "varieties": ["JG-11", "JAKI-9218", "Vijay", "Vishal", "KAK-2"], "yield_range": (6, 12), "price_range": (4200, 5800), "cost_per_acre": (8000, 14000)},
        {"name": "Mustard", "type": "Oilseed", "varieties": ["Pusa Bold", "RH-749", "Bio-902", "NRCHB-101"], "yield_range": (6, 12), "price_range": (4500, 6000), "cost_per_acre": (6000, 11000)},
        {"name": "Onion", "type": "Vegetable", "varieties": ["Nasik Red", "Bellary Red", "Pusa Ratnar", "Agrifound Dark Red"], "yield_range": (80, 150), "price_range": (800, 2500), "cost_per_acre": (30000, 50000)},
        {"name": "Potato", "type": "Vegetable", "varieties": ["Kufri Jyoti", "Kufri Pukhraj", "Kufri Bahar", "Kufri Chipsona"], "yield_range": (80, 150), "price_range": (600, 1500), "cost_per_acre": (35000, 55000)},
        {"name": "Sunflower", "type": "Oilseed", "varieties": ["KBSH-44", "MSFH-17", "BSH-1", "Sunbred-275"], "yield_range": (5, 10), "price_range": (4000, 5500), "cost_per_acre": (7000, 12000)},
        {"name": "Bengal Gram", "type": "Pulse", "varieties": ["JG-11", "JG-14", "KAK-2", "Vijay"], "yield_range": (5, 10), "price_range": (4500, 6200), "cost_per_acre": (7000, 12000)},
        {"name": "Lentil", "type": "Pulse", "varieties": ["IPL-316", "K-75", "Pant L-5", "HUL-57"], "yield_range": (4, 8), "price_range": (3800, 5500), "cost_per_acre": (5000, 9000)},
    ],
}

# ─── Shop Products ───────────────────────────────────────────────────────────

SHOP_PRODUCTS = [
    {"name": "DAP Fertilizer", "category": "fertilizer", "brand": "IFFCO", "unit": "bag", "qty_per_unit": 50, "cost": 1150, "price": 1350},
    {"name": "Urea", "category": "fertilizer", "brand": "IFFCO", "unit": "bag", "qty_per_unit": 50, "cost": 266, "price": 300},
    {"name": "MOP Potash", "category": "fertilizer", "brand": "IPL", "unit": "bag", "qty_per_unit": 50, "cost": 850, "price": 1000},
    {"name": "NPK 20-20-0", "category": "fertilizer", "brand": "Coromandel", "unit": "bag", "qty_per_unit": 50, "cost": 1100, "price": 1280},
    {"name": "NPK 10-26-26", "category": "fertilizer", "brand": "Zuari", "unit": "bag", "qty_per_unit": 50, "cost": 1200, "price": 1400},
    {"name": "Zinc Sulphate", "category": "fertilizer", "brand": "Tata", "unit": "kg", "qty_per_unit": 25, "cost": 40, "price": 55},
    {"name": "Gypsum", "category": "fertilizer", "brand": "GSFC", "unit": "bag", "qty_per_unit": 50, "cost": 200, "price": 280},
    {"name": "SSP", "category": "fertilizer", "brand": "Paradeep", "unit": "bag", "qty_per_unit": 50, "cost": 350, "price": 450},
    {"name": "Imidacloprid 17.8 SL", "category": "pesticide", "brand": "Bayer", "unit": "liter", "qty_per_unit": 1, "cost": 800, "price": 1050},
    {"name": "Chlorpyriphos 20 EC", "category": "pesticide", "brand": "Dhanuka", "unit": "liter", "qty_per_unit": 1, "cost": 350, "price": 480},
    {"name": "Monocrotophos 36 SL", "category": "pesticide", "brand": "Syngenta", "unit": "liter", "qty_per_unit": 1, "cost": 300, "price": 420},
    {"name": "Carbendazim 50 WP", "category": "pesticide", "brand": "BASF", "unit": "packet", "qty_per_unit": 0.5, "cost": 180, "price": 260},
    {"name": "Mancozeb 75 WP", "category": "pesticide", "brand": "UPL", "unit": "packet", "qty_per_unit": 1, "cost": 250, "price": 350},
    {"name": "Glyphosate 41 SL", "category": "pesticide", "brand": "Excel", "unit": "liter", "qty_per_unit": 1, "cost": 350, "price": 500},
    {"name": "Neem Oil", "category": "pesticide", "brand": "Multiplex", "unit": "liter", "qty_per_unit": 1, "cost": 200, "price": 300},
    {"name": "Paddy Seed BPT-5204", "category": "seeds", "brand": "NSC", "unit": "kg", "qty_per_unit": 10, "cost": 45, "price": 65},
    {"name": "Cotton Seed Bt", "category": "seeds", "brand": "Mahyco", "unit": "packet", "qty_per_unit": 0.45, "cost": 650, "price": 850},
    {"name": "Maize Seed Hybrid", "category": "seeds", "brand": "Kaveri", "unit": "kg", "qty_per_unit": 5, "cost": 180, "price": 250},
    {"name": "Wheat Seed HD-2967", "category": "seeds", "brand": "ICAR", "unit": "kg", "qty_per_unit": 40, "cost": 30, "price": 45},
    {"name": "Drip Irrigation Kit", "category": "equipment", "brand": "Jain", "unit": "set", "qty_per_unit": 1, "cost": 8000, "price": 12000},
    {"name": "Sprayer Manual 16L", "category": "equipment", "brand": "Neptune", "unit": "piece", "qty_per_unit": 1, "cost": 900, "price": 1400},
    {"name": "Battery Sprayer 16L", "category": "equipment", "brand": "Aspee", "unit": "piece", "qty_per_unit": 1, "cost": 2500, "price": 3800},
    {"name": "Vermicompost", "category": "fertilizer", "brand": "Organic Gold", "unit": "bag", "qty_per_unit": 50, "cost": 300, "price": 450},
    {"name": "Humic Acid", "category": "fertilizer", "brand": "Aries", "unit": "liter", "qty_per_unit": 1, "cost": 350, "price": 500},
]

# ── Mill output products ──────────────────────────────────────────────────────
MILL_OUTPUT_PRODUCTS = [
    {"input_crop": "Paddy", "output": "Rice (Sona Masuri)", "category": "processed", "unit": "kg", "efficiency": (0.60, 0.68), "price_range": (3200, 4500)},
    {"input_crop": "Paddy", "output": "Rice (BPT 5204)", "category": "processed", "unit": "kg", "efficiency": (0.60, 0.68), "price_range": (2800, 4000)},
    {"input_crop": "Wheat", "output": "Wheat Flour (Atta)", "category": "processed", "unit": "kg", "efficiency": (0.72, 0.82), "price_range": (2800, 3800)},
    {"input_crop": "Wheat", "output": "Maida (Refined Flour)", "category": "processed", "unit": "kg", "efficiency": (0.65, 0.75), "price_range": (3000, 4200)},
    {"input_crop": "Wheat", "output": "Suji (Semolina)", "category": "processed", "unit": "kg", "efficiency": (0.20, 0.30), "price_range": (3500, 4800)},
    {"input_crop": "Maize", "output": "Maize Flour (Makki Atta)", "category": "processed", "unit": "kg", "efficiency": (0.70, 0.80), "price_range": (2500, 3500)},
    {"input_crop": "Groundnut", "output": "Groundnut Oil", "category": "processed", "unit": "liter", "efficiency": (0.35, 0.42), "price_range": (14000, 20000)},
    {"input_crop": "Soybean", "output": "Soybean Oil", "category": "processed", "unit": "liter", "efficiency": (0.15, 0.20), "price_range": (10000, 14000)},
    {"input_crop": "Sugarcane", "output": "Jaggery (Gur)", "category": "processed", "unit": "kg", "efficiency": (0.08, 0.12), "price_range": (4000, 6000)},
    {"input_crop": "Chilli", "output": "Chilli Powder", "category": "processed", "unit": "kg", "efficiency": (0.80, 0.90), "price_range": (15000, 28000)},
    {"input_crop": "Turmeric", "output": "Turmeric Powder", "category": "processed", "unit": "kg", "efficiency": (0.75, 0.85), "price_range": (10000, 18000)},
    {"input_crop": "Chickpea", "output": "Chana Dal", "category": "processed", "unit": "kg", "efficiency": (0.68, 0.78), "price_range": (6000, 8500)},
    {"input_crop": "Bengal Gram", "output": "Besan (Gram Flour)", "category": "processed", "unit": "kg", "efficiency": (0.80, 0.88), "price_range": (5500, 7500)},
    {"input_crop": "Lentil", "output": "Masoor Dal", "category": "processed", "unit": "kg", "efficiency": (0.70, 0.80), "price_range": (6500, 9000)},
    {"input_crop": "Mustard", "output": "Mustard Oil", "category": "processed", "unit": "liter", "efficiency": (0.30, 0.38), "price_range": (12000, 17000)},
]

# ─── Bank Data ────────────────────────────────────────────────────────────────

BANKS = [
    ("State Bank of India", "SBIN"), ("Andhra Bank", "ANDB"), ("Canara Bank", "CNRB"),
    ("Bank of Baroda", "BARB"), ("Punjab National Bank", "PUNB"), ("Union Bank of India", "UBIN"),
    ("Indian Bank", "IDIB"), ("Central Bank of India", "CBIN"), ("Bank of India", "BKID"),
    ("HDFC Bank", "HDFC"), ("ICICI Bank", "ICIC"), ("Axis Bank", "UTIB"),
    ("Kotak Mahindra Bank", "KKBK"), ("IndusInd Bank", "INDB"),
    ("Telangana Grameena Bank", "TGMB"), ("Andhra Pradesh Grameena Vikas Bank", "APGV"),
]

# ═══════════════════════════════════════════════════════════════════════════════
#                          HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

def rand_phone():
    return random.choice(["6", "7", "8", "9"]) + "".join([str(random.randint(0, 9)) for _ in range(9)])

def rand_email(name, idx, role):
    domain = random.choice(["gmail.com", "yahoo.co.in", "rediffmail.com", "outlook.com"])
    clean = name.lower().replace(" ", ".").replace("'", "")
    return f"{clean}.{role}{idx}@{domain}"

def rand_account():
    return "".join([str(random.randint(0, 9)) for _ in range(random.choice([11, 12, 13, 14]))])

def rand_ifsc(bank_code, region_idx):
    return f"{bank_code}0{region_idx:02d}{random.randint(100, 999)}"

def rand_aadhaar_last4():
    return "".join([str(random.randint(0, 9)) for _ in range(4)])

def rand_aadhaar_full():
    return "".join([str(random.randint(0, 9)) for _ in range(12)])

def rand_pan():
    letters = string.ascii_uppercase
    return "".join(random.choices(letters, k=5)) + "".join([str(random.randint(0, 9)) for _ in range(4)]) + random.choice(letters)

def rand_date_between(start, end):
    delta = (end - start).days
    if delta <= 0:
        return start
    return start + timedelta(days=random.randint(0, delta))

def rand_name(gender="male"):
    first = random.choice(FEMALE_FIRST_NAMES) if gender == "female" else random.choice(MALE_FIRST_NAMES)
    return f"{first} {random.choice(LAST_NAMES)}"

def rand_father():
    return f"{random.choice(FATHER_NAMES)} {random.choice(LAST_NAMES)}"

def rand_lat_lon(lat_range, lon_range):
    return (round(random.uniform(*lat_range), 6), round(random.uniform(*lon_range), 6))

def rand_street():
    return random.choice([
        "Main Road", "Station Road", "Market Street", "Temple Road", "Gandhi Nagar",
        "Nehru Colony", "Rajiv Nagar", "Indira Colony", "Ambedkar Street", "Bus Stand Road",
        "Railway Colony", "Bypass Road", "College Road", "Hospital Road", "Bank Street",
        "Patel Nagar", "Subhash Road", "Netaji Street", "Tagore Lane", "Ashoka Marg",
    ])

# ─── Excel styling ───────────────────────────────────────────────────────────

HEADER_FILL = PatternFill(start_color="1F4E79", end_color="1F4E79", fill_type="solid")
HEADER_FONT = Font(name="Calibri", bold=True, color="FFFFFF", size=11)
THIN_BORDER = Border(
    left=Side(style="thin"), right=Side(style="thin"),
    top=Side(style="thin"), bottom=Side(style="thin"),
)

SHEET_COLORS = {
    "farmers": "2E86C1",
    "shops": "27AE60",
    "mills": "E67E22",
    "customers": "8E44AD",
    "farmer_shop_orders": "1ABC9C",
    "farmer_mill_sales": "D35400",
    "mill_production": "2C3E50",
    "mill_customer_sales": "C0392B",
    "customer_orders": "7D3C98",
    "community_links": "16A085",
}

def style_header(ws, color=None):
    fill = PatternFill(start_color=color or "1F4E79", end_color=color or "1F4E79", fill_type="solid") if color else HEADER_FILL
    for cell in ws[1]:
        cell.fill = fill
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = THIN_BORDER

def auto_width(ws):
    for col in ws.columns:
        max_len = 0
        col_letter = col[0].column_letter
        for cell in col:
            try:
                if cell.value:
                    max_len = max(max_len, len(str(cell.value)))
            except:
                pass
        ws.column_dimensions[col_letter].width = min(max_len + 3, 40)


# ═══════════════════════════════════════════════════════════════════════════════
#                          MAIN GENERATOR
# ═══════════════════════════════════════════════════════════════════════════════

def generate():
    wb = Workbook()
    print("🌾 AgriFlow Seed Data Generator V2 — Community Interlinked Edition")
    print("=" * 70)

    # ═══════════════════════════════════════════════════════════════════════════
    # TRACKING STRUCTURES — we build these as we go to create interlinking
    # ═══════════════════════════════════════════════════════════════════════════

    # farmer_registry[farmer_idx] = {region_idx, district, village, farmer_id, name, lat, lon}
    farmer_registry = []
    # shop_registry[shop_idx] = {region_idx, district, market_town, shop_id, shop_name, name}
    shop_registry = []
    # mill_registry[mill_idx] = {region_idx, district, mill_area, mill_id, mill_name, name}
    mill_registry = []
    # customer_registry[cust_idx] = {customer_region, state, district, name}
    customer_registry = []

    # Community links — which farmers are served by which shops/mills
    # community_links[farmer_idx] = {"shops": [shop_idx, ...], "mills": [mill_idx, ...]}
    community_map = {}

    shop_name_prefixes = ["Sri", "Sai", "Maa", "Jai", "Om", "Balaji", "Krishna", "Lakshmi", "Shiva", "Durga",
                          "Mahalaxmi", "Ganapati", "Venkateswara", "Hanuman", "Raghavendra", "Subramanya"]
    shop_name_suffixes = ["Agri Centre", "Seeds & Fertilizers", "Farm Store", "Kisan Seva Kendra", "Agro Agencies",
                          "Fertilizer Depot", "Agri Inputs", "Farm Solutions", "Pesticide Centre", "Seed House",
                          "Krishi Kendra", "Agri Mart", "Farmers Supply", "Agro World"]
    mill_name_prefixes = ["Sri", "Sai", "Royal", "Modern", "Lakshmi", "Ganesh", "Balaji", "Venkata", "National", "Star",
                          "Golden", "Diamond", "Bharat", "Precision", "Supreme", "Heritage"]
    mill_name_suffixes = ["Rice Mill", "Flour Mill", "Oil Mill", "Processing Unit", "Industries",
                          "Agro Industries", "Rice & Flour Mill", "Dal Mill", "Spice Mill", "Rice Factory",
                          "Food Products", "Processing Works", "Agri Processing"]

    # ─── Sheet 1: FARMERS (15,000 across 6 regions) ──────────────────────────
    ws_farmers = wb.active
    ws_farmers.title = "farmers"
    farmer_headers = [
        "farmer_idx", "email", "phone_number", "password", "full_name", "farmer_id",
        "father_husband_name", "gender", "relation_type",
        "house_no", "street", "village", "mandal", "district", "state", "pincode",
        "region_name", "region_idx",
        "total_area", "aadhaar_last_4", "bank_name", "account_number", "ifsc_code",
        "primary_crop", "secondary_crop",
        "latitude", "longitude",
        "land_serial_1", "land_area_1", "land_serial_2", "land_area_2",
    ]
    ws_farmers.append(farmer_headers)

    FARMERS_PER_REGION = 2500
    total_farmers = FARMERS_PER_REGION * len(FOCUS_REGIONS)
    print(f"\n  📝 Generating {total_farmers:,} farmers across {len(FOCUS_REGIONS)} regions...")

    farmer_idx = 0
    for region_idx, region in enumerate(FOCUS_REGIONS):
        for i in range(FARMERS_PER_REGION):
            dist_data = random.choice(region["districts"])
            village = random.choice(dist_data["farmer_villages"])
            pincode = dist_data["pincode_prefix"] + str(random.randint(100, 999))
            house_no = f"{random.randint(1, 500)}/{random.choice(string.ascii_uppercase)}"
            street = rand_street()
            lat, lon = rand_lat_lon(region["lat_range"], region["lon_range"])

            gender = random.choice(["male"] * 8 + ["female"] * 2)
            name = rand_name(gender)
            father = rand_father()
            relation = "S/O" if gender == "male" else "W/O"
            total_area = round(random.uniform(1.0, 25.0), 1)
            bank_name, bank_code = random.choice(BANKS)

            # Assign primary & secondary crops from the region's speciality
            primary_crop = random.choice(region["primary_crops"])
            remaining_crops = [c for c in region["primary_crops"] if c != primary_crop]
            all_crops = [c["name"] for season_crops in CROPS.values() for c in season_crops]
            secondary_crop = random.choice(remaining_crops) if remaining_crops else random.choice(all_crops)

            land1_serial = f"SY-{random.randint(100, 999)}/{random.randint(1, 50)}"
            land1_area = round(total_area * random.uniform(0.5, 0.8), 1)
            land2_serial = f"SY-{random.randint(100, 999)}/{random.randint(1, 50)}" if total_area > 3 else ""
            land2_area = round(total_area - land1_area, 1) if land2_serial else ""

            farmer_id_str = f"FRM-{region['state'][:2].upper()}-{farmer_idx + 1:05d}"

            farmer_registry.append({
                "idx": farmer_idx,
                "region_idx": region_idx,
                "district": dist_data["district"],
                "village": village,
                "farmer_id": farmer_id_str,
                "name": name,
                "lat": lat, "lon": lon,
                "primary_crop": primary_crop,
                "secondary_crop": secondary_crop,
                "total_area": total_area,
            })

            ws_farmers.append([
                farmer_idx,
                rand_email(name, farmer_idx, "farmer"),
                rand_phone(),
                "Farmer@123",
                name,
                farmer_id_str,
                father, gender, relation,
                house_no, street, village, dist_data["mandal"], dist_data["district"],
                region["state"], pincode,
                region["region_name"], region_idx,
                total_area,
                rand_aadhaar_last4(),
                bank_name, rand_account(), rand_ifsc(bank_code, region_idx),
                primary_crop, secondary_crop,
                lat, lon,
                land1_serial, land1_area, land2_serial, land2_area,
            ])
            farmer_idx += 1

    style_header(ws_farmers, SHEET_COLORS["farmers"])
    auto_width(ws_farmers)
    print(f"    ✅ {total_farmers:,} farmers generated across {len(FOCUS_REGIONS)} regions")

    # ─── Sheet 2: SHOPS (800 — concentrated in farmer regions) ────────────────
    ws_shops = wb.create_sheet("shops")
    shop_headers = [
        "shop_idx", "email", "phone_number", "password", "full_name",
        "shop_name", "license_number", "shop_id", "father_name", "relation_type", "owner_name",
        "aadhaar_number", "pan_number",
        "shop_address", "landmark",
        "house_no", "street", "village", "mandal", "district", "state", "pincode",
        "region_name", "region_idx", "market_town",
        "latitude", "longitude",
        "bank_name", "account_number", "ifsc_code",
        "specialization",
    ]
    ws_shops.append(shop_headers)

    SHOPS_PER_REGION = 130  # ~130 per region + extras
    total_shops_target = 800
    print(f"\n  🏪 Generating {total_shops_target} shops across {len(FOCUS_REGIONS)} regions...")

    shop_idx = 0
    for region_idx, region in enumerate(FOCUS_REGIONS):
        n_shops = SHOPS_PER_REGION + (total_shops_target % len(FOCUS_REGIONS) if region_idx == 0 else 0)
        if shop_idx + n_shops > total_shops_target:
            n_shops = total_shops_target - shop_idx
        if n_shops <= 0:
            break

        for i in range(n_shops):
            dist_data = random.choice(region["districts"])
            market_town = random.choice(dist_data["market_towns"])
            pincode = dist_data["pincode_prefix"] + str(random.randint(100, 999))
            house_no = f"{random.randint(1, 200)}/{random.choice(string.ascii_uppercase)}"
            street = rand_street()
            lat, lon = rand_lat_lon(region["lat_range"], region["lon_range"])

            name = rand_name("male")
            shop_name = f"{random.choice(shop_name_prefixes)} {random.choice(shop_name_suffixes)}"
            bank_name, bank_code = random.choice(BANKS)
            specialization = random.choice(["fertilizer", "pesticide", "seeds", "general", "equipment", "organic"])

            shop_id_str = f"SHP-{region['state'][:2].upper()}-{shop_idx + 1:04d}"

            shop_registry.append({
                "idx": shop_idx,
                "region_idx": region_idx,
                "district": dist_data["district"],
                "market_town": market_town,
                "shop_id": shop_id_str,
                "shop_name": shop_name,
                "name": name,
            })

            ws_shops.append([
                shop_idx,
                rand_email(name, shop_idx, "shop"),
                rand_phone(),
                "Shop@123",
                name,
                shop_name,
                f"LIC-{region['state'][:3].upper()}-{random.randint(10000, 99999)}",
                shop_id_str,
                rand_father(), "S/O", name,
                rand_aadhaar_full(), rand_pan(),
                f"{house_no}, {street}, {market_town}",
                random.choice(["Near Bus Stand", "Near Market Yard", "Main Road Junction", "Near Railway Station", "Near Temple", "Near APMC Yard"]),
                house_no, street, market_town, dist_data["mandal"], dist_data["district"],
                region["state"], pincode,
                region["region_name"], region_idx, market_town,
                lat, lon,
                bank_name, rand_account(), rand_ifsc(bank_code, region_idx),
                specialization,
            ])
            shop_idx += 1

    style_header(ws_shops, SHEET_COLORS["shops"])
    auto_width(ws_shops)
    total_shops = shop_idx
    print(f"    ✅ {total_shops:,} shops generated")

    # ─── Sheet 3: MILLS (400 — concentrated in farmer regions) ────────────────
    ws_mills = wb.create_sheet("mills")
    mill_headers = [
        "mill_idx", "email", "phone_number", "password", "full_name",
        "mill_name", "license_number", "mill_id", "father_name", "relation_type", "owner_name",
        "aadhaar_number", "pan_number",
        "house_no", "street", "village", "mandal", "district", "state", "pincode",
        "region_name", "region_idx", "mill_area",
        "latitude", "longitude",
        "location_text",
        "bank_name", "account_number", "ifsc_code",
        "processing_type", "daily_capacity_tons",
    ]
    ws_mills.append(mill_headers)

    MILLS_PER_REGION = 65
    total_mills_target = 400
    print(f"\n  🏭 Generating {total_mills_target} mills across {len(FOCUS_REGIONS)} regions...")

    mill_idx = 0
    for region_idx, region in enumerate(FOCUS_REGIONS):
        n_mills = MILLS_PER_REGION + (total_mills_target % len(FOCUS_REGIONS) if region_idx == 0 else 0)
        if mill_idx + n_mills > total_mills_target:
            n_mills = total_mills_target - mill_idx
        if n_mills <= 0:
            break

        for i in range(n_mills):
            dist_data = random.choice(region["districts"])
            mill_area = random.choice(dist_data["mill_areas"])
            pincode = dist_data["pincode_prefix"] + str(random.randint(100, 999))
            house_no = f"Plot-{random.randint(1, 100)}"
            street = random.choice(["Industrial Estate", "MIDC Area", "Processing Zone", "Ind. Complex"])
            lat, lon = rand_lat_lon(region["lat_range"], region["lon_range"])

            name = rand_name("male")
            mill_name = f"{random.choice(mill_name_prefixes)} {random.choice(mill_name_suffixes)}"
            bank_name, bank_code = random.choice(BANKS)

            # Processing type tied to regional crops
            crop_for_mill = random.choice(region["primary_crops"])
            matching_outputs = [p for p in MILL_OUTPUT_PRODUCTS if p["input_crop"] == crop_for_mill]
            if not matching_outputs:
                matching_outputs = [random.choice(MILL_OUTPUT_PRODUCTS)]
            processing_type = random.choice(matching_outputs)["output"]
            daily_capacity = round(random.uniform(5, 80), 1)

            mill_id_str = f"MIL-{region['state'][:2].upper()}-{mill_idx + 1:04d}"

            mill_registry.append({
                "idx": mill_idx,
                "region_idx": region_idx,
                "district": dist_data["district"],
                "mill_area": mill_area,
                "mill_id": mill_id_str,
                "mill_name": mill_name,
                "name": name,
                "processing_type": processing_type,
                "primary_input_crop": crop_for_mill,
            })

            ws_mills.append([
                mill_idx,
                rand_email(name, mill_idx, "mill"),
                rand_phone(),
                "Mill@123",
                name,
                mill_name,
                f"MFG-{region['state'][:3].upper()}-{random.randint(10000, 99999)}",
                mill_id_str,
                rand_father(), "S/O", name,
                rand_aadhaar_full(), rand_pan(),
                house_no, street, mill_area, dist_data["mandal"], dist_data["district"],
                region["state"], pincode,
                region["region_name"], region_idx, mill_area,
                lat, lon,
                f"{mill_area}, {dist_data['district']}",
                bank_name, rand_account(), rand_ifsc(bank_code, region_idx),
                processing_type, daily_capacity,
            ])
            mill_idx += 1

    style_header(ws_mills, SHEET_COLORS["mills"])
    auto_width(ws_mills)
    total_mills = mill_idx
    print(f"    ✅ {total_mills:,} mills generated")

    # ─── Sheet 4: CUSTOMERS (5,000 from OTHER regions) ────────────────────────
    ws_customers = wb.create_sheet("customers")
    customer_headers = [
        "cust_idx", "email", "phone_number", "password", "full_name",
        "father_name", "relation_type", "id_number",
        "house_no", "street", "village", "mandal", "district", "state", "pincode",
        "customer_region",
        "preferred_products",
        "bank_name", "account_number", "ifsc_code",
    ]
    ws_customers.append(customer_headers)

    total_customers_target = 5000
    print(f"\n  🛒 Generating {total_customers_target:,} customers from {len(CUSTOMER_REGIONS)} consumer regions...")

    cust_idx = 0
    customers_per_region = total_customers_target // len(CUSTOMER_REGIONS)

    for cr_idx, cr in enumerate(CUSTOMER_REGIONS):
        n_custs = customers_per_region + (total_customers_target % len(CUSTOMER_REGIONS) if cr_idx == 0 else 0)
        for i in range(n_custs):
            dist_data = random.choice(cr["districts"])
            village = random.choice(dist_data["villages"])
            pincode = dist_data["pincode_prefix"] + str(random.randint(10, 99))
            house_no = f"{random.randint(1, 999)}"
            street = rand_street()

            gender = random.choice(["male", "female"])
            name = rand_name(gender)
            relation = "S/O" if gender == "male" else random.choice(["W/O", "D/O"])
            bank_name, bank_code = random.choice(BANKS)

            # Preferred products → what they buy from farmers/mills
            preferred = random.sample(
                ["Rice", "Wheat Flour", "Groundnut Oil", "Chilli Powder", "Turmeric Powder",
                 "Jaggery", "Maize Flour", "Chana Dal", "Besan", "Mustard Oil",
                 "Masoor Dal", "Fresh Paddy", "Fresh Wheat", "Soybean Oil"],
                k=random.randint(2, 5)
            )

            customer_registry.append({
                "idx": cust_idx,
                "customer_region": cr["state"],
                "state": cr["state"],
                "district": dist_data["district"],
                "name": name,
                "preferred_products": preferred,
            })

            ws_customers.append([
                cust_idx,
                rand_email(name, cust_idx, "cust"),
                rand_phone(),
                "Customer@123",
                name,
                rand_father(), relation, rand_aadhaar_full(),
                house_no, street, village, dist_data["mandal"], dist_data["district"],
                cr["state"], pincode,
                cr["state"],
                ", ".join(preferred),
                bank_name, rand_account(), rand_ifsc(bank_code, cr_idx),
            ])
            cust_idx += 1

    style_header(ws_customers, SHEET_COLORS["customers"])
    auto_width(ws_customers)
    total_customers = cust_idx
    print(f"    ✅ {total_customers:,} customers generated from {len(CUSTOMER_REGIONS)} consumer regions")

    # ═══════════════════════════════════════════════════════════════════════════
    #   BUILD COMMUNITY LINKS — connect farmers to nearby shops & mills
    # ═══════════════════════════════════════════════════════════════════════════

    print(f"\n  🔗 Building community links (farmer ↔ shop ↔ mill)...")

    # Group by region
    farmers_by_region = {}
    for f in farmer_registry:
        farmers_by_region.setdefault(f["region_idx"], []).append(f)
    shops_by_region = {}
    for s in shop_registry:
        shops_by_region.setdefault(s["region_idx"], []).append(s)
    mills_by_region = {}
    for m in mill_registry:
        mills_by_region.setdefault(m["region_idx"], []).append(m)

    # Each farmer gets 2-4 nearby shops and 1-3 nearby mills
    for region_idx in range(len(FOCUS_REGIONS)):
        region_farmers = farmers_by_region.get(region_idx, [])
        region_shops = shops_by_region.get(region_idx, [])
        region_mills = mills_by_region.get(region_idx, [])

        for f in region_farmers:
            # Same-district shops first, then any in region
            same_district_shops = [s for s in region_shops if s["district"] == f["district"]]
            if len(same_district_shops) < 2:
                same_district_shops = region_shops

            n_shops = min(random.randint(2, 4), len(same_district_shops))
            linked_shops = random.sample(same_district_shops, n_shops)

            same_district_mills = [m for m in region_mills if m["district"] == f["district"]]
            if len(same_district_mills) < 1:
                same_district_mills = region_mills

            n_mills = min(random.randint(1, 3), len(same_district_mills))
            linked_mills = random.sample(same_district_mills, n_mills)

            community_map[f["idx"]] = {
                "shops": [s["idx"] for s in linked_shops],
                "mills": [m["idx"] for m in linked_mills],
            }

    print(f"    ✅ {len(community_map):,} farmer-community links built")

    # ─── Sheet 10: Community Links ────────────────────────────────────────────
    ws_community = wb.create_sheet("community_links")
    community_headers = [
        "farmer_idx", "farmer_id", "farmer_name", "farmer_village", "farmer_district",
        "region_name", "region_idx",
        "linked_shop_idx", "linked_shop_id", "linked_shop_name", "shop_market_town",
        "linked_mill_idx", "linked_mill_id", "linked_mill_name", "mill_area",
        "link_type",
    ]
    ws_community.append(community_headers)

    link_count = 0
    for f_idx, links in community_map.items():
        f = farmer_registry[f_idx]
        region = FOCUS_REGIONS[f["region_idx"]]

        for s_idx in links["shops"]:
            s = shop_registry[s_idx]
            ws_community.append([
                f["idx"], f["farmer_id"], f["name"], f["village"], f["district"],
                region["region_name"], f["region_idx"],
                s["idx"], s["shop_id"], s["shop_name"], s["market_town"],
                "", "", "", "",
                "farmer_to_shop",
            ])
            link_count += 1

        for m_idx in links["mills"]:
            m = mill_registry[m_idx]
            ws_community.append([
                f["idx"], f["farmer_id"], f["name"], f["village"], f["district"],
                region["region_name"], f["region_idx"],
                "", "", "", "",
                m["idx"], m["mill_id"], m["mill_name"], m["mill_area"],
                "farmer_to_mill",
            ])
            link_count += 1

    style_header(ws_community, SHEET_COLORS["community_links"])
    auto_width(ws_community)
    print(f"    ✅ {link_count:,} community link rows written")

    # ═══════════════════════════════════════════════════════════════════════════
    #   TRANSACTION SHEETS
    # ═══════════════════════════════════════════════════════════════════════════

    now = datetime.utcnow()

    # ─── Sheet 5: Farmer → Shop Orders (farmers buying inputs) ────────────────
    ws_fso = wb.create_sheet("farmer_shop_orders")
    fso_headers = [
        "order_id", "farmer_idx", "farmer_id", "farmer_name",
        "shop_idx", "shop_id", "shop_name",
        "region_name", "region_idx",
        "product_name", "category", "brand", "quantity", "unit_price", "subtotal",
        "discount", "final_amount",
        "payment_mode", "payment_status", "order_date",
    ]
    ws_fso.append(fso_headers)

    print(f"\n  💳 Generating farmer → shop orders...")
    fso_count = 0

    # Each farmer makes 3-10 purchases from their linked shops over the past 3 years
    sample_farmers = random.sample(farmer_registry, min(8000, len(farmer_registry)))
    for f in sample_farmers:
        links = community_map.get(f["idx"])
        if not links or not links["shops"]:
            continue

        n_orders = random.randint(3, 10)
        for _ in range(n_orders):
            s_idx = random.choice(links["shops"])
            s = shop_registry[s_idx]
            region = FOCUS_REGIONS[f["region_idx"]]

            # Pick 1-4 products
            n_items = random.randint(1, 4)
            items = random.sample(SHOP_PRODUCTS, min(n_items, len(SHOP_PRODUCTS)))

            for item in items:
                qty = random.randint(1, 8)
                subtotal = round(item["price"] * qty, 0)
                discount = round(subtotal * random.choice([0, 0, 0, 0.02, 0.05]), 0)
                final = subtotal - discount
                order_date = rand_date_between(datetime(2023, 1, 1), now)

                ws_fso.append([
                    f"FSO-{fso_count + 1:06d}",
                    f["idx"], f["farmer_id"], f["name"],
                    s["idx"], s["shop_id"], s["shop_name"],
                    region["region_name"], f["region_idx"],
                    item["name"], item["category"], item["brand"],
                    qty, item["price"], subtotal,
                    discount, final,
                    random.choice(["cash", "cash", "upi", "credit"]),
                    random.choice(["paid", "paid", "paid", "pending"]),
                    order_date.strftime("%Y-%m-%d"),
                ])
                fso_count += 1

    style_header(ws_fso, SHEET_COLORS["farmer_shop_orders"])
    auto_width(ws_fso)
    print(f"    ✅ {fso_count:,} farmer → shop order rows generated")

    # ─── Sheet 6: Farmer → Mill Sales (farmers selling harvest to mills) ──────
    ws_fms = wb.create_sheet("farmer_mill_sales")
    fms_headers = [
        "sale_id", "farmer_idx", "farmer_id", "farmer_name", "farmer_village",
        "mill_idx", "mill_id", "mill_name", "mill_area",
        "region_name", "region_idx",
        "crop_name", "variety", "quantity_quintals", "total_bags", "bag_size_kg",
        "price_per_quintal", "total_amount",
        "quality_grade", "transport_cost",
        "payment_mode", "payment_status",
        "sale_date",
    ]
    ws_fms.append(fms_headers)

    print(f"\n  🌾 Generating farmer → mill sales...")
    fms_count = 0

    sample_farmers_for_sales = random.sample(farmer_registry, min(10000, len(farmer_registry)))
    for f in sample_farmers_for_sales:
        links = community_map.get(f["idx"])
        if not links or not links["mills"]:
            continue

        # 1-4 harvest sales over the past 3 years
        n_sales = random.randint(1, 4)
        for _ in range(n_sales):
            m_idx = random.choice(links["mills"])
            m = mill_registry[m_idx]
            region = FOCUS_REGIONS[f["region_idx"]]

            crop_name = f["primary_crop"] if random.random() > 0.3 else f["secondary_crop"]
            # Find crop data
            crop_data = None
            for season_crops in CROPS.values():
                for c in season_crops:
                    if c["name"] == crop_name:
                        crop_data = c
                        break
            if not crop_data:
                crop_data = random.choice(CROPS["Kharif"])
                crop_name = crop_data["name"]

            variety = random.choice(crop_data["varieties"])
            qty_quintals = round(random.uniform(5, 80) * (f["total_area"] / 10.0), 1)
            bag_size = random.choice([50, 75, 100])
            total_bags = max(1, int(qty_quintals * 100 / bag_size))
            price_per_q = round(random.uniform(*crop_data["price_range"]), 0)
            total_amount = round(qty_quintals * price_per_q, 0)
            transport = round(random.uniform(200, 3000), 0)
            sale_date = rand_date_between(datetime(2023, 1, 1), now)

            ws_fms.append([
                f"FMS-{fms_count + 1:06d}",
                f["idx"], f["farmer_id"], f["name"], f["village"],
                m["idx"], m["mill_id"], m["mill_name"], m["mill_area"],
                region["region_name"], f["region_idx"],
                crop_name, variety, qty_quintals, total_bags, bag_size,
                price_per_q, total_amount,
                random.choice(["Grade A", "Grade A", "Grade B", "Grade B", "Grade C"]),
                transport,
                random.choice(["cash", "digital", "bank_transfer"]),
                random.choice(["paid", "paid", "paid", "pending"]),
                sale_date.strftime("%Y-%m-%d"),
            ])
            fms_count += 1

    style_header(ws_fms, SHEET_COLORS["farmer_mill_sales"])
    auto_width(ws_fms)
    print(f"    ✅ {fms_count:,} farmer → mill sale rows generated")

    # ─── Sheet 7: Mill Production Batches ─────────────────────────────────────
    ws_prod = wb.create_sheet("mill_production")
    prod_headers = [
        "batch_id", "mill_idx", "mill_id", "mill_name",
        "region_name", "region_idx",
        "input_crop", "input_qty_quintals",
        "output_product", "output_qty_quintals", "output_unit",
        "processing_cost", "waste_qty", "efficiency_pct",
        "batch_date",
    ]
    ws_prod.append(prod_headers)

    print(f"\n  ⚙️ Generating mill production batches...")
    prod_count = 0

    for m in mill_registry:
        region = FOCUS_REGIONS[m["region_idx"]]
        # 10-40 batches per mill over 3 years
        n_batches = random.randint(10, 40)
        for _ in range(n_batches):
            input_crop = m.get("primary_input_crop", random.choice(region["primary_crops"]))
            matching_outputs = [p for p in MILL_OUTPUT_PRODUCTS if p["input_crop"] == input_crop]
            if not matching_outputs:
                matching_outputs = [random.choice(MILL_OUTPUT_PRODUCTS)]
                input_crop = matching_outputs[0]["input_crop"]
            output_product = random.choice(matching_outputs)

            input_qty = round(random.uniform(20, 200), 1)
            eff = round(random.uniform(*output_product["efficiency"]), 4)
            output_qty = round(input_qty * eff, 1)
            waste = round(input_qty - output_qty, 1)
            processing_cost = round(random.uniform(500, 5000) * (input_qty / 50), 0)
            batch_date = rand_date_between(datetime(2023, 1, 1), now)

            ws_prod.append([
                f"PROD-{prod_count + 1:06d}",
                m["idx"], m["mill_id"], m["mill_name"],
                region["region_name"], m["region_idx"],
                input_crop, input_qty,
                output_product["output"], output_qty, output_product["unit"],
                processing_cost, waste, round(eff * 100, 1),
                batch_date.strftime("%Y-%m-%d"),
            ])
            prod_count += 1

    style_header(ws_prod, SHEET_COLORS["mill_production"])
    auto_width(ws_prod)
    print(f"    ✅ {prod_count:,} production batch rows generated")

    # ─── Sheet 8: Mill → Customer Sales (cross-region) ────────────────────────
    ws_mcs = wb.create_sheet("mill_customer_sales")
    mcs_headers = [
        "sale_id", "mill_idx", "mill_id", "mill_name", "mill_region",
        "customer_idx", "customer_name", "customer_state", "customer_district",
        "product_name", "quantity_kg", "selling_price_per_kg", "discount_pct",
        "total_amount", "delivery_status",
        "payment_mode", "invoice_id",
        "sale_date",
    ]
    ws_mcs.append(mcs_headers)

    print(f"\n  📦 Generating mill → customer sales (cross-region)...")
    mcs_count = 0

    for m in mill_registry:
        # Each mill sells to 5-25 customers from other regions
        n_sales = random.randint(5, 25)
        for _ in range(n_sales):
            cust = random.choice(customer_registry)
            region = FOCUS_REGIONS[m["region_idx"]]

            # Pick a product the mill can produce
            input_crop = m.get("primary_input_crop", random.choice(region["primary_crops"]))
            matching = [p for p in MILL_OUTPUT_PRODUCTS if p["input_crop"] == input_crop]
            if not matching:
                matching = [random.choice(MILL_OUTPUT_PRODUCTS)]
            output = random.choice(matching)

            qty_kg = round(random.uniform(10, 500), 0)
            price_per_kg = round(random.uniform(*output["price_range"]) / 100, 2)  # Convert per quintal to per kg
            discount_pct = random.choice([0, 0, 0, 2, 5, 8, 10])
            total = round(qty_kg * price_per_kg * (1 - discount_pct / 100), 0)
            sale_date = rand_date_between(datetime(2023, 6, 1), now)

            ws_mcs.append([
                f"MCS-{mcs_count + 1:06d}",
                m["idx"], m["mill_id"], m["mill_name"], region["region_name"],
                cust["idx"], cust["name"], cust["state"], cust["district"],
                output["output"], qty_kg, price_per_kg, discount_pct,
                total, random.choice(["delivered", "delivered", "delivered", "shipped", "pending"]),
                random.choice(["upi", "bank_transfer", "cash", "razorpay"]),
                f"INV-{mcs_count + 1:06d}",
                sale_date.strftime("%Y-%m-%d"),
            ])
            mcs_count += 1

    style_header(ws_mcs, SHEET_COLORS["mill_customer_sales"])
    auto_width(ws_mcs)
    print(f"    ✅ {mcs_count:,} mill → customer sale rows generated")

    # ─── Sheet 9: Customer Orders (direct from farmers or mills) ──────────────
    ws_co = wb.create_sheet("customer_orders")
    co_headers = [
        "order_id", "customer_idx", "customer_name", "customer_state", "customer_district",
        "seller_type", "seller_idx", "seller_name", "seller_region",
        "product_name", "quantity", "unit_price", "total_amount",
        "order_status", "payment_mode",
        "order_date",
    ]
    ws_co.append(co_headers)

    print(f"\n  🛍️ Generating customer orders (cross-region buying)...")
    co_count = 0

    for cust in customer_registry:
        # Each customer makes 3-15 orders
        n_orders = random.randint(3, 15)
        for _ in range(n_orders):
            # 40% buy from farmers directly, 60% buy from mills
            if random.random() < 0.4:
                seller_type = "farmer"
                seller = random.choice(farmer_registry)
                seller_idx = seller["idx"]
                seller_name = seller["name"]
                seller_region = FOCUS_REGIONS[seller["region_idx"]]["region_name"]

                # Buy raw produce
                crop_name = seller["primary_crop"]
                crop_data = None
                for season_crops in CROPS.values():
                    for c in season_crops:
                        if c["name"] == crop_name:
                            crop_data = c
                            break
                if not crop_data:
                    crop_data = random.choice(CROPS["Kharif"])
                    crop_name = crop_data["name"]

                qty = round(random.uniform(5, 100), 0)
                unit_price = round(random.uniform(*crop_data["price_range"]) / 100, 2)  # per kg
                product_name = f"Fresh {crop_name}"
            else:
                seller_type = "mill"
                seller = random.choice(mill_registry)
                seller_idx = seller["idx"]
                seller_name = seller["mill_name"]
                seller_region = FOCUS_REGIONS[seller["region_idx"]]["region_name"]

                # Buy processed goods
                input_crop = seller.get("primary_input_crop", "Paddy")
                matching = [p for p in MILL_OUTPUT_PRODUCTS if p["input_crop"] == input_crop]
                if not matching:
                    matching = [random.choice(MILL_OUTPUT_PRODUCTS)]
                output = random.choice(matching)

                qty = round(random.uniform(5, 200), 0)
                unit_price = round(random.uniform(*output["price_range"]) / 100, 2)
                product_name = output["output"]

            total = round(qty * unit_price, 0)
            order_date = rand_date_between(datetime(2023, 6, 1), now)

            ws_co.append([
                f"CO-{co_count + 1:06d}",
                cust["idx"], cust["name"], cust["state"], cust["district"],
                seller_type, seller_idx, seller_name, seller_region,
                product_name, qty, unit_price, total,
                random.choice(["delivered", "delivered", "shipped", "confirmed", "pending"]),
                random.choice(["upi", "bank_transfer", "cod", "razorpay"]),
                order_date.strftime("%Y-%m-%d"),
            ])
            co_count += 1

    style_header(ws_co, SHEET_COLORS["customer_orders"])
    auto_width(ws_co)
    print(f"    ✅ {co_count:,} customer order rows generated")

    # ═══════════════════════════════════════════════════════════════════════════
    #   SAVE
    # ═══════════════════════════════════════════════════════════════════════════

    output_path = os.path.join(os.path.dirname(__file__), "agriflow_seed_data_v2.xlsx")
    wb.save(output_path)

    print(f"\n{'=' * 70}")
    print(f"📦 EXCEL SAVED: {output_path}")
    print(f"{'=' * 70}")
    print(f"  ENTITY SHEETS:")
    print(f"    farmers          : {total_farmers:>8,} rows  (6 focus regions)")
    print(f"    shops            : {total_shops:>8,} rows  (linked to farmer regions)")
    print(f"    mills            : {total_mills:>8,} rows  (linked to farmer regions)")
    print(f"    customers        : {total_customers:>8,} rows  (from {len(CUSTOMER_REGIONS)} consumer regions)")
    print(f"")
    print(f"  TRANSACTION SHEETS:")
    print(f"    farmer_shop_orders   : {fso_count:>8,} rows  (farmers buying from shops)")
    print(f"    farmer_mill_sales    : {fms_count:>8,} rows  (farmers selling to mills)")
    print(f"    mill_production      : {prod_count:>8,} rows  (mill processing batches)")
    print(f"    mill_customer_sales  : {mcs_count:>8,} rows  (mills selling to customers)")
    print(f"    customer_orders      : {co_count:>8,} rows  (customers buying cross-region)")
    print(f"")
    print(f"  COMMUNITY LINKS:")
    print(f"    community_links      : {link_count:>8,} rows  (farmer ↔ shop ↔ mill)")
    print(f"")
    print(f"  TOTAL ROWS: {total_farmers + total_shops + total_mills + total_customers + fso_count + fms_count + prod_count + mcs_count + co_count + link_count:>10,}")
    print(f"{'=' * 70}")
    print(f"\n  Regions:")
    for r in FOCUS_REGIONS:
        print(f"    🌱 {r['region_name']} ({r['state']}) — Crops: {', '.join(r['primary_crops'])}")
    print(f"\n  Customer Source Regions:")
    for cr in CUSTOMER_REGIONS:
        print(f"    🏙️  {cr['state']}")
    print(f"\n  Passwords:")
    print(f"    Farmer:   Farmer@123")
    print(f"    Shop:     Shop@123")
    print(f"    Mill:     Mill@123")
    print(f"    Customer: Customer@123")

    return output_path


if __name__ == "__main__":
    generate()

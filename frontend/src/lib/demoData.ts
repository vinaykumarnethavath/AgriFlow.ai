// AGRIFLOW DEMO DATA — Complete, realistic synthetic data for all roles, spanning 5 years (2021-2026)

export type DemoRole = "farmer" | "shop" | "manufacturer" | "customer";

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const years = [2021, 2022, 2023, 2024, 2025, 2026];

function mkDate(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

export const farmerDemoData = {
  profile: {
    id: 17,
    farmer_id: "FM-2021-00123",
    full_name: "Ravi Kumar Reddy",
    father_husband_name: "Suresh Reddy",
    phone_number: "9876543210",
    secondary_phone: "9848011223",
    gender: "Male",
    relation_type: "son_of",
    house_no: "4-5/B",
    street: "Nandanavanam Road",
    village: "Kondapally",
    mandal: "Nuzividu",
    district: "Krishna",
    state: "Andhra Pradesh",
    country: "India",
    pincode: "521111",
    total_area: 7.20,
    aadhaar_last_4: "8842",
    bank_name: "State Bank of India",
    account_number: "35420198765",
    ifsc_code: "SBIN0003241",
    land_records: [
      { id: 1, serial_number: "142/1A", area: 3.10, soil_type: "Black Cotton", irrigation_source: "Borewell + Canal" },
      { id: 2, serial_number: "142/2B", area: 2.30, soil_type: "Red Loamy", irrigation_source: "Drip Irrigation" },
      { id: 3, serial_number: "188/4", area: 1.80, soil_type: "Alluvial Clay", irrigation_source: "Lift Irrigation" },
    ],
    profile_picture_url: null,
  },
  crops: [
    {
        "id": 1,
        "user_id": 17,
        "name": "Paddy (BPT-5204)",
        "area": 3.1,
        "season": "Kharif 2021",
        "variety": "BPT-5204 Samba Masoori",
        "crop_type": "Cereal",
        "sowing_date": "2021-07-10T00:00:00",
        "expected_harvest_date": "2021-11-20T00:00:00",
        "actual_harvest_date": "2021-11-20T00:00:00",
        "status": "Sold",
        "notes": "Superfine grain grade A. Excellent monsoon season.",
        "total_cost": 16230,
        "total_revenue": 125130.0,
        "actual_yield": 64.5,
        "selling_price_per_unit": 1940.0,
        "net_profit": 108900.0,
        "expenses_count": 6,
        "total_expenses": 16230,
        "expenses": [
            {
                "id": 101,
                "crop_id": 1,
                "category": "Input",
                "type": "Seed",
                "quantity": 30,
                "unit": "kg",
                "unit_cost": 45,
                "total_cost": 1350,
                "date": "2021-07-12T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Paddy (BPT-5204)"
            },
            {
                "id": 102,
                "crop_id": 1,
                "category": "Fertilizer",
                "type": "DAP Fertilizer",
                "quantity": 150,
                "unit": "kg",
                "unit_cost": 24,
                "total_cost": 3600,
                "date": "2021-07-15T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Paddy (BPT-5204)"
            },
            {
                "id": 103,
                "crop_id": 1,
                "category": "Labor",
                "type": "Transplanting Labor",
                "quantity": 8,
                "unit": "days",
                "unit_cost": 450,
                "total_cost": 3600,
                "date": "2021-07-22T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 8,
                "stage": "Sowing",
                "notes": "Verified field application for Paddy (BPT-5204)"
            },
            {
                "id": 104,
                "crop_id": 1,
                "category": "Fertilizer",
                "type": "Urea 46%",
                "quantity": 200,
                "unit": "kg",
                "unit_cost": 5.3,
                "total_cost": 1060,
                "date": "2021-08-25T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Watering",
                "notes": "Verified field application for Paddy (BPT-5204)"
            },
            {
                "id": 105,
                "crop_id": 1,
                "category": "Pesticide",
                "type": "Chlorpyriphos",
                "quantity": 2,
                "unit": "liter",
                "unit_cost": 520,
                "total_cost": 1040,
                "date": "2021-09-15T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 1,
                "duration": 1,
                "stage": "Flowering",
                "notes": "Verified field application for Paddy (BPT-5204)"
            },
            {
                "id": 106,
                "crop_id": 1,
                "category": "Machinery",
                "type": "Combine Harvester",
                "quantity": 3.1,
                "unit": "hours",
                "unit_cost": 1800,
                "total_cost": 5580,
                "date": "2021-11-19T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Harvesting",
                "notes": "Verified field application for Paddy (BPT-5204)"
            }
        ],
        "harvests": [
            {
                "id": 10,
                "crop_id": 1,
                "date": "2021-11-20T00:00:00",
                "stage": "Main Harvest",
                "quantity": 64.5,
                "unit": "Quintal",
                "unit_size": 50,
                "quality": "Grade A Certified",
                "selling_price_per_unit": 1940.0,
                "total_revenue": 125130.0,
                "status": "Sold",
                "notes": "Harvested 129 bags (50 kg each) total 64.5 Quintals"
            }
        ],
        "sales": [
            {
                "id": 1001,
                "crop_id": 1,
                "date": "2021-11-20T00:00:00",
                "buyer_type": "Market",
                "buyer_name": "Nuzividu APMC Mandi Yard",
                "buyer_id": "APMC-NZ-104",
                "quantity_quintals": 64.5,
                "total_bags": 129,
                "bag_size": 50,
                "price_per_quintal": 1940.0,
                "total_revenue": 125130.0,
                "payment_mode": "Direct Bank Transfer",
                "notes": "Full lot sold at Rs. 1,940/Qtl to Nuzividu APMC Mandi Yard. Gate weighbridge receipt verified.",
                "status": "sold",
                "harvest_ids": [
                    10
                ]
            }
        ]
    },
    {
        "id": 2,
        "user_id": 17,
        "name": "Maize (Kaveri-55)",
        "area": 2.3,
        "season": "Rabi 2021-22",
        "variety": "Kaveri Super-55",
        "crop_type": "Cereal",
        "sowing_date": "2021-12-05T00:00:00",
        "expected_harvest_date": "2022-04-12T00:00:00",
        "actual_harvest_date": "2022-04-12T00:00:00",
        "status": "Sold",
        "notes": "Good cob weight with deep yellow kernels.",
        "total_cost": 12275,
        "total_revenue": 86020.0,
        "actual_yield": 46.0,
        "selling_price_per_unit": 1870.0,
        "net_profit": 73745.0,
        "expenses_count": 5,
        "total_expenses": 12275,
        "expenses": [
            {
                "id": 201,
                "crop_id": 2,
                "category": "Input",
                "type": "Seed",
                "quantity": 16,
                "unit": "kg",
                "unit_cost": 180,
                "total_cost": 2880,
                "date": "2021-12-07T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Maize (Kaveri-55)"
            },
            {
                "id": 202,
                "crop_id": 2,
                "category": "Fertilizer",
                "type": "DAP Fertilizer",
                "quantity": 100,
                "unit": "kg",
                "unit_cost": 24,
                "total_cost": 2400,
                "date": "2021-12-10T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Maize (Kaveri-55)"
            },
            {
                "id": 203,
                "crop_id": 2,
                "category": "Irrigation",
                "type": "Borewell Electricity",
                "quantity": 1,
                "unit": "unit",
                "unit_cost": 3200,
                "total_cost": 3200,
                "date": "2022-01-20T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Watering",
                "notes": "Verified field application for Maize (Kaveri-55)"
            },
            {
                "id": 204,
                "crop_id": 2,
                "category": "Fertilizer",
                "type": "Urea Top Dressing",
                "quantity": 150,
                "unit": "kg",
                "unit_cost": 5.3,
                "total_cost": 795,
                "date": "2022-02-15T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Watering",
                "notes": "Verified field application for Maize (Kaveri-55)"
            },
            {
                "id": 205,
                "crop_id": 2,
                "category": "Labor",
                "type": "Harvest & De-husking",
                "quantity": 6,
                "unit": "days",
                "unit_cost": 500,
                "total_cost": 3000,
                "date": "2022-04-10T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 6,
                "stage": "Harvesting",
                "notes": "Verified field application for Maize (Kaveri-55)"
            }
        ],
        "harvests": [
            {
                "id": 20,
                "crop_id": 2,
                "date": "2022-04-12T00:00:00",
                "stage": "Main Harvest",
                "quantity": 46.0,
                "unit": "Quintal",
                "unit_size": 50,
                "quality": "Grade A Certified",
                "selling_price_per_unit": 1870.0,
                "total_revenue": 86020.0,
                "status": "Sold",
                "notes": "Harvested 92 bags (50 kg each) total 46.0 Quintals"
            }
        ],
        "sales": [
            {
                "id": 2001,
                "crop_id": 2,
                "date": "2022-04-12T00:00:00",
                "buyer_type": "Retailer",
                "buyer_name": "ITC e-Choupal Procurement Center",
                "buyer_id": "ITC-ECH-22",
                "quantity_quintals": 46.0,
                "total_bags": 92,
                "bag_size": 50,
                "price_per_quintal": 1870.0,
                "total_revenue": 86020.0,
                "payment_mode": "Online Direct",
                "notes": "Full lot sold at Rs. 1,870/Qtl to ITC e-Choupal Procurement Center. Gate weighbridge receipt verified.",
                "status": "sold",
                "harvest_ids": [
                    20
                ]
            }
        ]
    },
    {
        "id": 3,
        "user_id": 17,
        "name": "Cotton (Bunny BT)",
        "area": 2.5,
        "season": "Kharif 2022",
        "variety": "Bunny BT Bollgard II",
        "crop_type": "Fiber",
        "sowing_date": "2022-06-20T00:00:00",
        "expected_harvest_date": "2022-11-25T00:00:00",
        "actual_harvest_date": "2022-11-25T00:00:00",
        "status": "Sold",
        "notes": "High ginning out-turn. 3 pickings completed.",
        "total_cost": 15860,
        "total_revenue": 127680.0,
        "actual_yield": 21.0,
        "selling_price_per_unit": 6080.0,
        "net_profit": 111820.0,
        "expenses_count": 5,
        "total_expenses": 15860,
        "expenses": [
            {
                "id": 301,
                "crop_id": 3,
                "category": "Input",
                "type": "Seed",
                "quantity": 5,
                "unit": "packet",
                "unit_cost": 720,
                "total_cost": 3600,
                "date": "2022-06-22T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Cotton (Bunny BT)"
            },
            {
                "id": 302,
                "crop_id": 3,
                "category": "Fertilizer",
                "type": "NPK 19:19:19",
                "quantity": 100,
                "unit": "kg",
                "unit_cost": 26,
                "total_cost": 2600,
                "date": "2022-07-10T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Cotton (Bunny BT)"
            },
            {
                "id": 303,
                "crop_id": 3,
                "category": "Labor",
                "type": "Weeding & Interculture",
                "quantity": 6,
                "unit": "days",
                "unit_cost": 500,
                "total_cost": 3000,
                "date": "2022-08-05T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 6,
                "stage": "Watering",
                "notes": "Verified field application for Cotton (Bunny BT)"
            },
            {
                "id": 304,
                "crop_id": 3,
                "category": "Pesticide",
                "type": "Imidacloprid Spray",
                "quantity": 3,
                "unit": "bottle",
                "unit_cost": 420,
                "total_cost": 1260,
                "date": "2022-09-02T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Flowering",
                "notes": "Verified field application for Cotton (Bunny BT)"
            },
            {
                "id": 305,
                "crop_id": 3,
                "category": "Labor",
                "type": "First & Second Picking",
                "quantity": 12,
                "unit": "days",
                "unit_cost": 450,
                "total_cost": 5400,
                "date": "2022-11-15T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 12,
                "stage": "Harvesting",
                "notes": "Verified field application for Cotton (Bunny BT)"
            }
        ],
        "harvests": [
            {
                "id": 30,
                "crop_id": 3,
                "date": "2022-11-25T00:00:00",
                "stage": "Main Harvest",
                "quantity": 21.0,
                "unit": "Quintal",
                "unit_size": 50,
                "quality": "Grade A Certified",
                "selling_price_per_unit": 6080.0,
                "total_revenue": 127680.0,
                "status": "Sold",
                "notes": "Harvested 42 bags (50 kg each) total 21.0 Quintals"
            }
        ],
        "sales": [
            {
                "id": 3001,
                "crop_id": 3,
                "date": "2022-11-25T00:00:00",
                "buyer_type": "Trader",
                "buyer_name": "Krishna District Farmers Producer Co. (FPO)",
                "buyer_id": "FPO-KD-08",
                "quantity_quintals": 21.0,
                "total_bags": 42,
                "bag_size": 50,
                "price_per_quintal": 6080.0,
                "total_revenue": 127680.0,
                "payment_mode": "RTGS / Direct Credit",
                "notes": "Full lot sold at Rs. 6,080/Qtl to Krishna District Farmers Producer Co. (FPO). Gate weighbridge receipt verified.",
                "status": "sold",
                "harvest_ids": [
                    30
                ]
            }
        ]
    },
    {
        "id": 4,
        "user_id": 17,
        "name": "Wheat (PBW-343)",
        "area": 3.0,
        "season": "Rabi 2022-23",
        "variety": "PBW 343 High Yield",
        "crop_type": "Cereal",
        "sowing_date": "2022-11-15T00:00:00",
        "expected_harvest_date": "2023-03-28T00:00:00",
        "actual_harvest_date": "2023-03-28T00:00:00",
        "status": "Sold",
        "notes": "Certified seed sown with seed-cum-fertilizer drill.",
        "total_cost": 17035,
        "total_revenue": 108810.0,
        "actual_yield": 54.0,
        "selling_price_per_unit": 2015.0,
        "net_profit": 91775.0,
        "expenses_count": 5,
        "total_expenses": 17035,
        "expenses": [
            {
                "id": 401,
                "crop_id": 4,
                "category": "Input",
                "type": "Seed",
                "quantity": 120,
                "unit": "kg",
                "unit_cost": 32,
                "total_cost": 3840,
                "date": "2022-11-18T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Wheat (PBW-343)"
            },
            {
                "id": 402,
                "crop_id": 4,
                "category": "Fertilizer",
                "type": "DAP Fertilizer",
                "quantity": 150,
                "unit": "kg",
                "unit_cost": 26,
                "total_cost": 3900,
                "date": "2022-11-20T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Wheat (PBW-343)"
            },
            {
                "id": 403,
                "crop_id": 4,
                "category": "Irrigation",
                "type": "First Crown Root Irrigation",
                "quantity": 1,
                "unit": "unit",
                "unit_cost": 2500,
                "total_cost": 2500,
                "date": "2022-12-12T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Watering",
                "notes": "Verified field application for Wheat (PBW-343)"
            },
            {
                "id": 404,
                "crop_id": 4,
                "category": "Fertilizer",
                "type": "Urea First Split",
                "quantity": 150,
                "unit": "kg",
                "unit_cost": 5.3,
                "total_cost": 795,
                "date": "2023-01-05T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Watering",
                "notes": "Verified field application for Wheat (PBW-343)"
            },
            {
                "id": 405,
                "crop_id": 4,
                "category": "Machinery",
                "type": "Harvester Combine",
                "quantity": 3,
                "unit": "hours",
                "unit_cost": 2000,
                "total_cost": 6000,
                "date": "2023-03-26T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Harvesting",
                "notes": "Verified field application for Wheat (PBW-343)"
            }
        ],
        "harvests": [
            {
                "id": 40,
                "crop_id": 4,
                "date": "2023-03-28T00:00:00",
                "stage": "Main Harvest",
                "quantity": 54.0,
                "unit": "Quintal",
                "unit_size": 50,
                "quality": "Grade A Certified",
                "selling_price_per_unit": 2015.0,
                "total_revenue": 108810.0,
                "status": "Sold",
                "notes": "Harvested 108 bags (50 kg each) total 54.0 Quintals"
            }
        ],
        "sales": [
            {
                "id": 4001,
                "crop_id": 4,
                "date": "2023-03-28T00:00:00",
                "buyer_type": "Market",
                "buyer_name": "Gannavaram Regulated Market Committee",
                "buyer_id": "RMC-GV-44",
                "quantity_quintals": 54.0,
                "total_bags": 108,
                "bag_size": 50,
                "price_per_quintal": 2015.0,
                "total_revenue": 108810.0,
                "payment_mode": "UPI / Bank Transfer",
                "notes": "Full lot sold at Rs. 2,015/Qtl to Gannavaram Regulated Market Committee. Gate weighbridge receipt verified.",
                "status": "sold",
                "harvest_ids": [
                    40
                ]
            }
        ]
    },
    {
        "id": 5,
        "user_id": 17,
        "name": "Paddy (BPT-5204)",
        "area": 3.1,
        "season": "Kharif 2023",
        "variety": "BPT-5204 Samba Masoori",
        "crop_type": "Cereal",
        "sowing_date": "2023-07-05T00:00:00",
        "expected_harvest_date": "2023-11-18T00:00:00",
        "actual_harvest_date": "2023-11-18T00:00:00",
        "status": "Sold",
        "notes": "Highest seasonal yield achieved. Soil health improved.",
        "total_cost": 18285,
        "total_revenue": 148444.0,
        "actual_yield": 68.0,
        "selling_price_per_unit": 2183.0,
        "net_profit": 130159.0,
        "expenses_count": 6,
        "total_expenses": 18285,
        "expenses": [
            {
                "id": 501,
                "crop_id": 5,
                "category": "Input",
                "type": "Seed",
                "quantity": 30,
                "unit": "kg",
                "unit_cost": 48,
                "total_cost": 1440,
                "date": "2023-07-07T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Paddy (BPT-5204)"
            },
            {
                "id": 502,
                "crop_id": 5,
                "category": "Fertilizer",
                "type": "DAP Fertilizer",
                "quantity": 150,
                "unit": "kg",
                "unit_cost": 27,
                "total_cost": 4050,
                "date": "2023-07-12T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Paddy (BPT-5204)"
            },
            {
                "id": 503,
                "crop_id": 5,
                "category": "Labor",
                "type": "Mechanical Transplanting",
                "quantity": 1,
                "unit": "unit",
                "unit_cost": 4800,
                "total_cost": 4800,
                "date": "2023-07-20T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Paddy (BPT-5204)"
            },
            {
                "id": 504,
                "crop_id": 5,
                "category": "Fertilizer",
                "type": "Zinc Sulphate Foliar",
                "quantity": 5,
                "unit": "kg",
                "unit_cost": 85,
                "total_cost": 425,
                "date": "2023-08-18T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Watering",
                "notes": "Verified field application for Paddy (BPT-5204)"
            },
            {
                "id": 505,
                "crop_id": 5,
                "category": "Fertilizer",
                "type": "Urea Top Dressing",
                "quantity": 200,
                "unit": "kg",
                "unit_cost": 5.3,
                "total_cost": 1060,
                "date": "2023-09-02T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Watering",
                "notes": "Verified field application for Paddy (BPT-5204)"
            },
            {
                "id": 506,
                "crop_id": 5,
                "category": "Machinery",
                "type": "Harvester Combine",
                "quantity": 3.1,
                "unit": "hours",
                "unit_cost": 2100,
                "total_cost": 6510,
                "date": "2023-11-16T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Harvesting",
                "notes": "Verified field application for Paddy (BPT-5204)"
            }
        ],
        "harvests": [
            {
                "id": 50,
                "crop_id": 5,
                "date": "2023-11-18T00:00:00",
                "stage": "Main Harvest",
                "quantity": 68.0,
                "unit": "Quintal",
                "unit_size": 50,
                "quality": "Grade A Certified",
                "selling_price_per_unit": 2183.0,
                "total_revenue": 148444.0,
                "status": "Sold",
                "notes": "Harvested 136 bags (50 kg each) total 68.0 Quintals"
            }
        ],
        "sales": [
            {
                "id": 5001,
                "crop_id": 5,
                "date": "2023-11-18T00:00:00",
                "buyer_type": "Mill",
                "buyer_name": "Vijayawada Agro Processing Mills Ltd",
                "buyer_id": "MILL-VJ-12",
                "quantity_quintals": 68.0,
                "total_bags": 136,
                "bag_size": 50,
                "price_per_quintal": 2183.0,
                "total_revenue": 148444.0,
                "payment_mode": "Cheque / NEFT",
                "notes": "Full lot sold at Rs. 2,183/Qtl to Vijayawada Agro Processing Mills Ltd. Gate weighbridge receipt verified.",
                "status": "sold",
                "harvest_ids": [
                    50
                ]
            }
        ]
    },
    {
        "id": 6,
        "user_id": 17,
        "name": "Maize (Kaveri-55)",
        "area": 2.3,
        "season": "Rabi 2023-24",
        "variety": "Kaveri Super-55",
        "crop_type": "Cereal",
        "sowing_date": "2023-12-08T00:00:00",
        "expected_harvest_date": "2024-04-15T00:00:00",
        "actual_harvest_date": "2024-04-15T00:00:00",
        "status": "Sold",
        "notes": "Sold directly to Sri Venkateswara Mill at MSP + bonus.",
        "total_cost": 11700,
        "total_revenue": 107635.0,
        "actual_yield": 51.5,
        "selling_price_per_unit": 2090.0,
        "net_profit": 95935.0,
        "expenses_count": 4,
        "total_expenses": 11700,
        "expenses": [
            {
                "id": 601,
                "crop_id": 6,
                "category": "Input",
                "type": "Seed",
                "quantity": 16,
                "unit": "kg",
                "unit_cost": 200,
                "total_cost": 3200,
                "date": "2023-12-10T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Maize (Kaveri-55)"
            },
            {
                "id": 602,
                "crop_id": 6,
                "category": "Fertilizer",
                "type": "NPK Complex 20:20:0:13",
                "quantity": 100,
                "unit": "kg",
                "unit_cost": 28,
                "total_cost": 2800,
                "date": "2023-12-15T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Maize (Kaveri-55)"
            },
            {
                "id": 603,
                "crop_id": 6,
                "category": "Labor",
                "type": "Earthing Up & Weeding",
                "quantity": 4,
                "unit": "days",
                "unit_cost": 550,
                "total_cost": 2200,
                "date": "2024-01-25T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 4,
                "stage": "Watering",
                "notes": "Verified field application for Maize (Kaveri-55)"
            },
            {
                "id": 604,
                "crop_id": 6,
                "category": "Irrigation",
                "type": "Drip Subsurface System",
                "quantity": 1,
                "unit": "unit",
                "unit_cost": 3500,
                "total_cost": 3500,
                "date": "2024-02-20T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Watering",
                "notes": "Verified field application for Maize (Kaveri-55)"
            }
        ],
        "harvests": [
            {
                "id": 60,
                "crop_id": 6,
                "date": "2024-04-15T00:00:00",
                "stage": "Main Harvest",
                "quantity": 51.5,
                "unit": "Quintal",
                "unit_size": 50,
                "quality": "Grade A Certified",
                "selling_price_per_unit": 2090.0,
                "total_revenue": 107635.0,
                "status": "Sold",
                "notes": "Harvested 103 bags (50 kg each) total 51.5 Quintals"
            }
        ],
        "sales": [
            {
                "id": 6001,
                "crop_id": 6,
                "date": "2024-04-15T00:00:00",
                "buyer_type": "Mill",
                "buyer_name": "Sri Venkateswara Rice & Cotton Mill",
                "buyer_id": "MILL-AP-01",
                "quantity_quintals": 51.5,
                "total_bags": 103,
                "bag_size": 50,
                "price_per_quintal": 2090.0,
                "total_revenue": 107635.0,
                "payment_mode": "Bank NEFT",
                "notes": "Full lot sold at Rs. 2,090/Qtl to Sri Venkateswara Rice & Cotton Mill. Gate weighbridge receipt verified.",
                "status": "sold",
                "harvest_ids": [
                    60
                ]
            }
        ]
    },
    {
        "id": 7,
        "user_id": 17,
        "name": "Green Gram (Moong)",
        "area": 1.8,
        "season": "Zaid 2023",
        "variety": "IPM 02-03",
        "crop_type": "Pulse",
        "sowing_date": "2023-03-20T00:00:00",
        "expected_harvest_date": "2023-05-25T00:00:00",
        "actual_harvest_date": "2023-05-25T00:00:00",
        "status": "Sold",
        "notes": "Short duration pulse crop. Excellent nitrogen fixation for subsequent paddy.",
        "total_cost": 4150,
        "total_revenue": 89182.0,
        "actual_yield": 11.5,
        "selling_price_per_unit": 7755.0,
        "net_profit": 85032.0,
        "expenses_count": 2,
        "total_expenses": 4150,
        "expenses": [
            {
                "id": 701,
                "crop_id": 7,
                "category": "Input",
                "type": "Seed",
                "quantity": 15,
                "unit": "kg",
                "unit_cost": 110,
                "total_cost": 1650,
                "date": "2023-03-22T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Green Gram (Moong)"
            },
            {
                "id": 702,
                "crop_id": 7,
                "category": "Labor",
                "type": "Spraying & Pod Picking",
                "quantity": 5,
                "unit": "days",
                "unit_cost": 500,
                "total_cost": 2500,
                "date": "2023-05-20T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 5,
                "stage": "Harvesting",
                "notes": "Verified field application for Green Gram (Moong)"
            }
        ],
        "harvests": [
            {
                "id": 70,
                "crop_id": 7,
                "date": "2023-05-25T00:00:00",
                "stage": "Main Harvest",
                "quantity": 11.5,
                "unit": "Quintal",
                "unit_size": 50,
                "quality": "Grade A Certified",
                "selling_price_per_unit": 7755.0,
                "total_revenue": 89182.0,
                "status": "Sold",
                "notes": "Harvested 23 bags (50 kg each) total 11.5 Quintals"
            }
        ],
        "sales": [
            {
                "id": 7001,
                "crop_id": 7,
                "date": "2023-05-25T00:00:00",
                "buyer_type": "Market",
                "buyer_name": "Nuzividu APMC Mandi Yard",
                "buyer_id": "APMC-NZ-104",
                "quantity_quintals": 11.5,
                "total_bags": 23,
                "bag_size": 50,
                "price_per_quintal": 7755.0,
                "total_revenue": 89182.0,
                "payment_mode": "Direct Bank Transfer",
                "notes": "Full lot sold at Rs. 7,755/Qtl to Nuzividu APMC Mandi Yard. Gate weighbridge receipt verified.",
                "status": "sold",
                "harvest_ids": [
                    70
                ]
            }
        ]
    },
    {
        "id": 8,
        "user_id": 17,
        "name": "Cotton (Bunny BT)",
        "area": 2.5,
        "season": "Kharif 2024",
        "variety": "Bunny BT Bollgard II",
        "crop_type": "Fiber",
        "sowing_date": "2024-06-25T00:00:00",
        "expected_harvest_date": "2024-11-28T00:00:00",
        "actual_harvest_date": "2024-11-28T00:00:00",
        "status": "Sold",
        "notes": "Premium long staple fiber sold to mill at spot premium.",
        "total_cost": 16060,
        "total_revenue": 162190.0,
        "actual_yield": 24.5,
        "selling_price_per_unit": 6620.0,
        "net_profit": 146130.0,
        "expenses_count": 4,
        "total_expenses": 16060,
        "expenses": [
            {
                "id": 801,
                "crop_id": 8,
                "category": "Input",
                "type": "Seed",
                "quantity": 5,
                "unit": "packet",
                "unit_cost": 740,
                "total_cost": 3700,
                "date": "2024-06-28T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Cotton (Bunny BT)"
            },
            {
                "id": 802,
                "crop_id": 8,
                "category": "Fertilizer",
                "type": "DAP + Neem Cake",
                "quantity": 100,
                "unit": "kg",
                "unit_cost": 30,
                "total_cost": 3000,
                "date": "2024-07-10T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Cotton (Bunny BT)"
            },
            {
                "id": 803,
                "crop_id": 8,
                "category": "Pesticide",
                "type": "Chlorpyriphos 20 EC",
                "quantity": 3,
                "unit": "liter",
                "unit_cost": 620,
                "total_cost": 1860,
                "date": "2024-08-20T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 1,
                "duration": 1,
                "stage": "Watering",
                "notes": "Verified field application for Cotton (Bunny BT)"
            },
            {
                "id": 804,
                "crop_id": 8,
                "category": "Labor",
                "type": "Labor for 3 Pickings",
                "quantity": 15,
                "unit": "days",
                "unit_cost": 500,
                "total_cost": 7500,
                "date": "2024-11-20T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 15,
                "stage": "Harvesting",
                "notes": "Verified field application for Cotton (Bunny BT)"
            }
        ],
        "harvests": [
            {
                "id": 80,
                "crop_id": 8,
                "date": "2024-11-28T00:00:00",
                "stage": "Main Harvest",
                "quantity": 24.5,
                "unit": "Quintal",
                "unit_size": 50,
                "quality": "Grade A Certified",
                "selling_price_per_unit": 6620.0,
                "total_revenue": 162190.0,
                "status": "Sold",
                "notes": "Harvested 49 bags (50 kg each) total 24.5 Quintals"
            }
        ],
        "sales": [
            {
                "id": 8001,
                "crop_id": 8,
                "date": "2024-11-28T00:00:00",
                "buyer_type": "Retailer",
                "buyer_name": "ITC e-Choupal Procurement Center",
                "buyer_id": "ITC-ECH-22",
                "quantity_quintals": 24.5,
                "total_bags": 49,
                "bag_size": 50,
                "price_per_quintal": 6620.0,
                "total_revenue": 162190.0,
                "payment_mode": "Online Direct",
                "notes": "Full lot sold at Rs. 6,620/Qtl to ITC e-Choupal Procurement Center. Gate weighbridge receipt verified.",
                "status": "sold",
                "harvest_ids": [
                    80
                ]
            }
        ]
    },
    {
        "id": 9,
        "user_id": 17,
        "name": "Wheat (PBW-343)",
        "area": 3.0,
        "season": "Rabi 2024-25",
        "variety": "PBW 343 High Yield",
        "crop_type": "Cereal",
        "sowing_date": "2024-11-10T00:00:00",
        "expected_harvest_date": "2025-03-25T00:00:00",
        "actual_harvest_date": "2025-03-25T00:00:00",
        "status": "Sold",
        "notes": "Milled at local mill, high gluten quality.",
        "total_cost": 15930,
        "total_revenue": 129675.0,
        "actual_yield": 57.0,
        "selling_price_per_unit": 2275.0,
        "net_profit": 113745.0,
        "expenses_count": 4,
        "total_expenses": 15930,
        "expenses": [
            {
                "id": 901,
                "crop_id": 9,
                "category": "Input",
                "type": "Seed",
                "quantity": 120,
                "unit": "kg",
                "unit_cost": 35,
                "total_cost": 4200,
                "date": "2024-11-12T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Wheat (PBW-343)"
            },
            {
                "id": 902,
                "crop_id": 9,
                "category": "Fertilizer",
                "type": "DAP Fertilizer",
                "quantity": 150,
                "unit": "kg",
                "unit_cost": 27,
                "total_cost": 4050,
                "date": "2024-11-16T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Wheat (PBW-343)"
            },
            {
                "id": 903,
                "crop_id": 9,
                "category": "Fertilizer",
                "type": "Urea Top Dressing",
                "quantity": 200,
                "unit": "kg",
                "unit_cost": 5.4,
                "total_cost": 1080,
                "date": "2024-12-28T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Watering",
                "notes": "Verified field application for Wheat (PBW-343)"
            },
            {
                "id": 904,
                "crop_id": 9,
                "category": "Machinery",
                "type": "Harvester Combine",
                "quantity": 3,
                "unit": "hours",
                "unit_cost": 2200,
                "total_cost": 6600,
                "date": "2025-03-23T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Harvesting",
                "notes": "Verified field application for Wheat (PBW-343)"
            }
        ],
        "harvests": [
            {
                "id": 90,
                "crop_id": 9,
                "date": "2025-03-25T00:00:00",
                "stage": "Main Harvest",
                "quantity": 57.0,
                "unit": "Quintal",
                "unit_size": 50,
                "quality": "Grade A Certified",
                "selling_price_per_unit": 2275.0,
                "total_revenue": 129675.0,
                "status": "Sold",
                "notes": "Harvested 114 bags (50 kg each) total 57.0 Quintals"
            }
        ],
        "sales": [
            {
                "id": 9001,
                "crop_id": 9,
                "date": "2025-03-25T00:00:00",
                "buyer_type": "Trader",
                "buyer_name": "Krishna District Farmers Producer Co. (FPO)",
                "buyer_id": "FPO-KD-08",
                "quantity_quintals": 57.0,
                "total_bags": 114,
                "bag_size": 50,
                "price_per_quintal": 2275.0,
                "total_revenue": 129675.0,
                "payment_mode": "RTGS / Direct Credit",
                "notes": "Full lot sold at Rs. 2,275/Qtl to Krishna District Farmers Producer Co. (FPO). Gate weighbridge receipt verified.",
                "status": "sold",
                "harvest_ids": [
                    90
                ]
            }
        ]
    },
    {
        "id": 10,
        "user_id": 17,
        "name": "Tomato (Hybrid)",
        "area": 1.5,
        "season": "Zaid 2024",
        "variety": "US-440 Red Round",
        "crop_type": "Vegetable",
        "sowing_date": "2024-02-10T00:00:00",
        "expected_harvest_date": "2024-05-20T00:00:00",
        "actual_harvest_date": "2024-05-20T00:00:00",
        "status": "Sold",
        "notes": "Good summer market demand. Sold in 25kg crates at local mandi.",
        "total_cost": 12160,
        "total_revenue": 94250.0,
        "actual_yield": 145.0,
        "selling_price_per_unit": 650.0,
        "net_profit": 82090.0,
        "expenses_count": 3,
        "total_expenses": 12160,
        "expenses": [
            {
                "id": 1001,
                "crop_id": 10,
                "category": "Input",
                "type": "Seed",
                "quantity": 2,
                "unit": "packet",
                "unit_cost": 380,
                "total_cost": 760,
                "date": "2024-02-12T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Tomato (Hybrid)"
            },
            {
                "id": 1002,
                "crop_id": 10,
                "category": "Fertilizer",
                "type": "NPK 19:19:19 Drip",
                "quantity": 50,
                "unit": "kg",
                "unit_cost": 140,
                "total_cost": 7000,
                "date": "2024-03-15T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Watering",
                "notes": "Verified field application for Tomato (Hybrid)"
            },
            {
                "id": 1003,
                "crop_id": 10,
                "category": "Labor",
                "type": "Staking & Manual Picking",
                "quantity": 8,
                "unit": "days",
                "unit_cost": 550,
                "total_cost": 4400,
                "date": "2024-05-15T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 8,
                "stage": "Harvesting",
                "notes": "Verified field application for Tomato (Hybrid)"
            }
        ],
        "harvests": [
            {
                "id": 100,
                "crop_id": 10,
                "date": "2024-05-20T00:00:00",
                "stage": "2nd & 3rd Picking",
                "quantity": 145.0,
                "unit": "Quintal",
                "unit_size": 50,
                "quality": "Grade A Certified",
                "selling_price_per_unit": 650.0,
                "total_revenue": 94250.0,
                "status": "Sold",
                "notes": "Harvested 290 bags (50 kg each) total 145.0 Quintals"
            }
        ],
        "sales": [
            {
                "id": 10001,
                "crop_id": 10,
                "date": "2024-05-20T00:00:00",
                "buyer_type": "Market",
                "buyer_name": "Gannavaram Regulated Market Committee",
                "buyer_id": "RMC-GV-44",
                "quantity_quintals": 145.0,
                "total_bags": 290,
                "bag_size": 50,
                "price_per_quintal": 650.0,
                "total_revenue": 94250.0,
                "payment_mode": "UPI / Bank Transfer",
                "notes": "Full lot sold at Rs. 650/Qtl to Gannavaram Regulated Market Committee. Gate weighbridge receipt verified.",
                "status": "sold",
                "harvest_ids": [
                    100
                ]
            }
        ]
    },
    {
        "id": 11,
        "user_id": 17,
        "name": "Paddy (BPT-5204)",
        "area": 3.1,
        "season": "Kharif 2025",
        "variety": "BPT-5204 Samba Masoori",
        "crop_type": "Cereal",
        "sowing_date": "2025-07-08T00:00:00",
        "expected_harvest_date": "2025-11-22T00:00:00",
        "actual_harvest_date": "2025-11-22T00:00:00",
        "status": "Sold",
        "notes": "Superfine grain grade A. Held 40 qtl in cold storage before selling at high.",
        "total_cost": 18160,
        "total_revenue": 163300.0,
        "actual_yield": 71.0,
        "selling_price_per_unit": 2300.0,
        "net_profit": 145140.0,
        "expenses_count": 5,
        "total_expenses": 18160,
        "expenses": [
            {
                "id": 1101,
                "crop_id": 11,
                "category": "Input",
                "type": "Seed",
                "quantity": 30,
                "unit": "kg",
                "unit_cost": 50,
                "total_cost": 1500,
                "date": "2025-07-10T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Paddy (BPT-5204)"
            },
            {
                "id": 1102,
                "crop_id": 11,
                "category": "Fertilizer",
                "type": "DAP Fertilizer",
                "quantity": 150,
                "unit": "kg",
                "unit_cost": 27,
                "total_cost": 4050,
                "date": "2025-07-15T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Paddy (BPT-5204)"
            },
            {
                "id": 1103,
                "crop_id": 11,
                "category": "Labor",
                "type": "Transplanting Labor",
                "quantity": 8,
                "unit": "days",
                "unit_cost": 550,
                "total_cost": 4400,
                "date": "2025-07-25T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 8,
                "stage": "Sowing",
                "notes": "Verified field application for Paddy (BPT-5204)"
            },
            {
                "id": 1104,
                "crop_id": 11,
                "category": "Fertilizer",
                "type": "Urea Second Split",
                "quantity": 200,
                "unit": "kg",
                "unit_cost": 5.4,
                "total_cost": 1080,
                "date": "2025-09-10T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Watering",
                "notes": "Verified field application for Paddy (BPT-5204)"
            },
            {
                "id": 1105,
                "crop_id": 11,
                "category": "Machinery",
                "type": "Combine Harvester",
                "quantity": 3.1,
                "unit": "hours",
                "unit_cost": 2300,
                "total_cost": 7130,
                "date": "2025-11-20T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Harvesting",
                "notes": "Verified field application for Paddy (BPT-5204)"
            }
        ],
        "harvests": [
            {
                "id": 110,
                "crop_id": 11,
                "date": "2025-11-22T00:00:00",
                "stage": "Main Harvest",
                "quantity": 71.0,
                "unit": "Quintal",
                "unit_size": 50,
                "quality": "Grade A Certified",
                "selling_price_per_unit": 2300.0,
                "total_revenue": 163300.0,
                "status": "Sold",
                "notes": "Harvested 142 bags (50 kg each) total 71.0 Quintals"
            }
        ],
        "sales": [
            {
                "id": 11001,
                "crop_id": 11,
                "date": "2025-11-22T00:00:00",
                "buyer_type": "Mill",
                "buyer_name": "Vijayawada Agro Processing Mills Ltd",
                "buyer_id": "MILL-VJ-12",
                "quantity_quintals": 71.0,
                "total_bags": 142,
                "bag_size": 50,
                "price_per_quintal": 2300.0,
                "total_revenue": 163300.0,
                "payment_mode": "Cheque / NEFT",
                "notes": "Full lot sold at Rs. 2,300/Qtl to Vijayawada Agro Processing Mills Ltd. Gate weighbridge receipt verified.",
                "status": "sold",
                "harvest_ids": [
                    110
                ]
            }
        ]
    },
    {
        "id": 12,
        "user_id": 17,
        "name": "Maize (Kaveri-55)",
        "area": 2.3,
        "season": "Rabi 2025-26",
        "variety": "Kaveri Super-55",
        "crop_type": "Cereal",
        "sowing_date": "2025-12-10T00:00:00",
        "expected_harvest_date": "2026-04-18T00:00:00",
        "actual_harvest_date": "2026-04-18T00:00:00",
        "status": "Sold",
        "notes": "Good kernel quality, harvested and stored in Kondapally godown.",
        "total_cost": 11230,
        "total_revenue": 117925.0,
        "actual_yield": 53.0,
        "selling_price_per_unit": 2225.0,
        "net_profit": 106695.0,
        "expenses_count": 4,
        "total_expenses": 11230,
        "expenses": [
            {
                "id": 1201,
                "crop_id": 12,
                "category": "Input",
                "type": "Seed",
                "quantity": 16,
                "unit": "kg",
                "unit_cost": 220,
                "total_cost": 3520,
                "date": "2025-12-12T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Maize (Kaveri-55)"
            },
            {
                "id": 1202,
                "crop_id": 12,
                "category": "Fertilizer",
                "type": "DAP Fertilizer",
                "quantity": 100,
                "unit": "kg",
                "unit_cost": 27,
                "total_cost": 2700,
                "date": "2025-12-18T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Maize (Kaveri-55)"
            },
            {
                "id": 1203,
                "crop_id": 12,
                "category": "Fertilizer",
                "type": "Urea Split",
                "quantity": 150,
                "unit": "kg",
                "unit_cost": 5.4,
                "total_cost": 810,
                "date": "2026-02-05T00:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Watering",
                "notes": "Verified field application for Maize (Kaveri-55)"
            },
            {
                "id": 1204,
                "crop_id": 12,
                "category": "Labor",
                "type": "Harvest & Shelling",
                "quantity": 7,
                "unit": "days",
                "unit_cost": 600,
                "total_cost": 4200,
                "date": "2026-04-15T00:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 7,
                "stage": "Harvesting",
                "notes": "Verified field application for Maize (Kaveri-55)"
            }
        ],
        "harvests": [
            {
                "id": 120,
                "crop_id": 12,
                "date": "2026-04-18T00:00:00",
                "stage": "Main Harvest",
                "quantity": 53.0,
                "unit": "Quintal",
                "unit_size": 50,
                "quality": "Grade A Certified",
                "selling_price_per_unit": 2225.0,
                "total_revenue": 117925.0,
                "status": "Sold",
                "notes": "Harvested 106 bags (50 kg each) total 53.0 Quintals"
            }
        ],
        "sales": [
            {
                "id": 12001,
                "crop_id": 12,
                "date": "2026-04-18T00:00:00",
                "buyer_type": "Mill",
                "buyer_name": "Sri Venkateswara Rice & Cotton Mill",
                "buyer_id": "MILL-AP-01",
                "quantity_quintals": 53.0,
                "total_bags": 106,
                "bag_size": 50,
                "price_per_quintal": 2225.0,
                "total_revenue": 117925.0,
                "payment_mode": "Bank NEFT",
                "notes": "Full lot sold at Rs. 2,225/Qtl to Sri Venkateswara Rice & Cotton Mill. Gate weighbridge receipt verified.",
                "status": "sold",
                "harvest_ids": [
                    120
                ]
            }
        ]
    },
    {
        "id": 13,
        "user_id": 17,
        "name": "Paddy (BPT-5204)",
        "area": 3.1,
        "season": "Kharif 2026",
        "variety": "BPT-5204 Samba Masoori",
        "crop_type": "Cereal",
        "sowing_date": "2026-08-12T12:00:00",
        "expected_harvest_date": "2026-12-10T12:00:00",
        "actual_harvest_date": null,
        "status": "Growing",
        "notes": "Panicle emergence stage. Second urea split and bio-fertilizer applied. Crop is vigorous.",
        "total_cost": 11490,
        "total_revenue": 0.0,
        "actual_yield": 0.0,
        "selling_price_per_unit": 0.0,
        "net_profit": 0,
        "expenses_count": 4,
        "total_expenses": 11490,
        "expenses": [
            {
                "id": 1301,
                "crop_id": 13,
                "category": "Input",
                "type": "Seed",
                "quantity": 30,
                "unit": "kg",
                "unit_cost": 52,
                "total_cost": 1560,
                "date": "2026-08-14T12:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Paddy (BPT-5204)"
            },
            {
                "id": 1302,
                "crop_id": 13,
                "category": "Fertilizer",
                "type": "DAP Fertilizer",
                "quantity": 150,
                "unit": "kg",
                "unit_cost": 27,
                "total_cost": 4050,
                "date": "2026-08-20T12:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Paddy (BPT-5204)"
            },
            {
                "id": 1303,
                "crop_id": 13,
                "category": "Labor",
                "type": "Transplanting Labor",
                "quantity": 8,
                "unit": "days",
                "unit_cost": 600,
                "total_cost": 4800,
                "date": "2026-08-27T12:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 8,
                "stage": "Sowing",
                "notes": "Verified field application for Paddy (BPT-5204)"
            },
            {
                "id": 1304,
                "crop_id": 13,
                "category": "Fertilizer",
                "type": "Urea Top Dressing",
                "quantity": 200,
                "unit": "kg",
                "unit_cost": 5.4,
                "total_cost": 1080,
                "date": "2026-09-26T12:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Watering",
                "notes": "Verified field application for Paddy (BPT-5204)"
            }
        ],
        "harvests": [],
        "sales": []
    },
    {
        "id": 14,
        "user_id": 17,
        "name": "Cotton (Bunny BT)",
        "area": 2.3,
        "season": "Kharif 2026",
        "variety": "Bunny BT Bollgard II",
        "crop_type": "Fiber",
        "sowing_date": "2026-07-28T12:00:00",
        "expected_harvest_date": "2026-11-30T12:00:00",
        "actual_harvest_date": null,
        "status": "Growing",
        "notes": "Boll formation stage. Regularly monitored for whitefly and pink bollworm.",
        "total_cost": 11260,
        "total_revenue": 0.0,
        "actual_yield": 0.0,
        "selling_price_per_unit": 0.0,
        "net_profit": 0,
        "expenses_count": 4,
        "total_expenses": 11260,
        "expenses": [
            {
                "id": 1401,
                "crop_id": 14,
                "category": "Input",
                "type": "Seed",
                "quantity": 5,
                "unit": "packet",
                "unit_cost": 740,
                "total_cost": 3700,
                "date": "2026-07-31T12:00:00",
                "payment_mode": "Cash",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Cotton (Bunny BT)"
            },
            {
                "id": 1402,
                "crop_id": 14,
                "category": "Fertilizer",
                "type": "DAP Fertilizer",
                "quantity": 100,
                "unit": "kg",
                "unit_cost": 27,
                "total_cost": 2700,
                "date": "2026-08-07T12:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 1,
                "stage": "Sowing",
                "notes": "Verified field application for Cotton (Bunny BT)"
            },
            {
                "id": 1403,
                "crop_id": 14,
                "category": "Pesticide",
                "type": "Chlorpyriphos 20 EC",
                "quantity": 3,
                "unit": "liter",
                "unit_cost": 620,
                "total_cost": 1860,
                "date": "2026-10-06T12:00:00",
                "payment_mode": "Cash",
                "unit_size": 1,
                "duration": 1,
                "stage": "Watering",
                "notes": "Verified field application for Cotton (Bunny BT)"
            },
            {
                "id": 1404,
                "crop_id": 14,
                "category": "Labor",
                "type": "Intercultivation Weeding",
                "quantity": 5,
                "unit": "days",
                "unit_cost": 600,
                "total_cost": 3000,
                "date": "2026-09-11T12:00:00",
                "payment_mode": "UPI",
                "unit_size": 450,
                "duration": 5,
                "stage": "Watering",
                "notes": "Verified field application for Cotton (Bunny BT)"
            }
        ],
        "harvests": [],
        "sales": []
    }
],
  orders: [
    {
        "id": 102,
        "order_id": 102,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 5520,
        "discount": 165,
        "final_amount": 5355,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2021-102",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-01-18T10:30:00Z",
        "items": [
            {
                "product_id": 3,
                "product_name": "MOP Potash (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 1700,
                "total_price": 5100,
                "subtotal": 5100,
                "unit": "bag",
                "brand": "IPL",
                "manufacturer": "IPL"
            },
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 1,
                "unit_price": 420,
                "total_price": 420,
                "subtotal": 420,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 108,
        "order_id": 108,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 3550,
        "discount": 106,
        "final_amount": 3444,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2021-108",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-06-18T10:30:00Z",
        "items": [
            {
                "product_id": 9,
                "product_name": "Drip Irrigation Inline Pipe (100m)",
                "category": "equipment",
                "quantity": 1,
                "unit_price": 2200,
                "total_price": 2200,
                "subtotal": 2200,
                "unit": "bundle",
                "brand": "Jain Irrigation",
                "manufacturer": "Jain Irrigation"
            },
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 1350,
                "total_price": 1350,
                "subtotal": 1350,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 114,
        "order_id": 114,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 2380,
        "discount": 0,
        "final_amount": 2380,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2021-114",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-09-18T10:30:00Z",
        "items": [
            {
                "product_id": 5,
                "product_name": "Chlorpyriphos 20 EC (1L)",
                "category": "pesticide",
                "quantity": 3,
                "unit_price": 540,
                "total_price": 1620,
                "subtotal": 1620,
                "unit": "L",
                "brand": "Tata Rallis",
                "manufacturer": "Tata Rallis"
            },
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 1,
                "unit_price": 760,
                "total_price": 760,
                "subtotal": 760,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 120,
        "order_id": 120,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 427,
        "discount": 0,
        "final_amount": 427,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2021-120",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-12-18T10:30:00Z",
        "items": [
            {
                "product_id": 1,
                "product_name": "Urea 46-0-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 267,
                "total_price": 267,
                "subtotal": 267,
                "unit": "bag",
                "brand": "IFFCO",
                "manufacturer": "IFFCO"
            },
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 160,
                "total_price": 160,
                "subtotal": 160,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 126,
        "order_id": 126,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 4350,
        "discount": 130,
        "final_amount": 4220,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2022-126",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-05-18T10:30:00Z",
        "items": [
            {
                "product_id": 7,
                "product_name": "Paddy BPT 5204 Seeds (25 kg)",
                "category": "seed",
                "quantity": 3,
                "unit_price": 1300,
                "total_price": 3900,
                "subtotal": 3900,
                "unit": "bag",
                "brand": "AP Seeds",
                "manufacturer": "AP Seeds"
            },
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 450,
                "total_price": 450,
                "subtotal": 450,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 132,
        "order_id": 132,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 2120,
        "discount": 0,
        "final_amount": 2120,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2022-132",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-08-18T10:30:00Z",
        "items": [
            {
                "product_id": 3,
                "product_name": "MOP Potash (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 1700,
                "total_price": 1700,
                "subtotal": 1700,
                "unit": "bag",
                "brand": "IPL",
                "manufacturer": "IPL"
            },
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 1,
                "unit_price": 420,
                "total_price": 420,
                "subtotal": 420,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 138,
        "order_id": 138,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 7950,
        "discount": 238,
        "final_amount": 7712,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2022-138",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-11-18T10:30:00Z",
        "items": [
            {
                "product_id": 9,
                "product_name": "Drip Irrigation Inline Pipe (100m)",
                "category": "equipment",
                "quantity": 3,
                "unit_price": 2200,
                "total_price": 6600,
                "subtotal": 6600,
                "unit": "bundle",
                "brand": "Jain Irrigation",
                "manufacturer": "Jain Irrigation"
            },
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 1350,
                "total_price": 1350,
                "subtotal": 1350,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 144,
        "order_id": 144,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 1300,
        "discount": 0,
        "final_amount": 1300,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2023-144",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-03-18T10:30:00Z",
        "items": [
            {
                "product_id": 5,
                "product_name": "Chlorpyriphos 20 EC (1L)",
                "category": "pesticide",
                "quantity": 1,
                "unit_price": 540,
                "total_price": 540,
                "subtotal": 540,
                "unit": "L",
                "brand": "Tata Rallis",
                "manufacturer": "Tata Rallis"
            },
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 1,
                "unit_price": 760,
                "total_price": 760,
                "subtotal": 760,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 150,
        "order_id": 150,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 961,
        "discount": 0,
        "final_amount": 961,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2023-150",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-07-18T10:30:00Z",
        "items": [
            {
                "product_id": 1,
                "product_name": "Urea 46-0-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 267,
                "total_price": 801,
                "subtotal": 801,
                "unit": "bag",
                "brand": "IFFCO",
                "manufacturer": "IFFCO"
            },
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 160,
                "total_price": 160,
                "subtotal": 160,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 156,
        "order_id": 156,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 1750,
        "discount": 0,
        "final_amount": 1750,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2023-156",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-10-18T10:30:00Z",
        "items": [
            {
                "product_id": 7,
                "product_name": "Paddy BPT 5204 Seeds (25 kg)",
                "category": "seed",
                "quantity": 1,
                "unit_price": 1300,
                "total_price": 1300,
                "subtotal": 1300,
                "unit": "bag",
                "brand": "AP Seeds",
                "manufacturer": "AP Seeds"
            },
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 450,
                "total_price": 450,
                "subtotal": 450,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 162,
        "order_id": 162,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 5520,
        "discount": 165,
        "final_amount": 5355,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2024-162",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-01-18T10:30:00Z",
        "items": [
            {
                "product_id": 3,
                "product_name": "MOP Potash (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 1700,
                "total_price": 5100,
                "subtotal": 5100,
                "unit": "bag",
                "brand": "IPL",
                "manufacturer": "IPL"
            },
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 1,
                "unit_price": 420,
                "total_price": 420,
                "subtotal": 420,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 168,
        "order_id": 168,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 3550,
        "discount": 106,
        "final_amount": 3444,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2024-168",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-06-18T10:30:00Z",
        "items": [
            {
                "product_id": 9,
                "product_name": "Drip Irrigation Inline Pipe (100m)",
                "category": "equipment",
                "quantity": 1,
                "unit_price": 2200,
                "total_price": 2200,
                "subtotal": 2200,
                "unit": "bundle",
                "brand": "Jain Irrigation",
                "manufacturer": "Jain Irrigation"
            },
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 1350,
                "total_price": 1350,
                "subtotal": 1350,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 174,
        "order_id": 174,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 2380,
        "discount": 0,
        "final_amount": 2380,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2024-174",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-09-18T10:30:00Z",
        "items": [
            {
                "product_id": 5,
                "product_name": "Chlorpyriphos 20 EC (1L)",
                "category": "pesticide",
                "quantity": 3,
                "unit_price": 540,
                "total_price": 1620,
                "subtotal": 1620,
                "unit": "L",
                "brand": "Tata Rallis",
                "manufacturer": "Tata Rallis"
            },
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 1,
                "unit_price": 760,
                "total_price": 760,
                "subtotal": 760,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 180,
        "order_id": 180,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 427,
        "discount": 0,
        "final_amount": 427,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2024-180",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-12-18T10:30:00Z",
        "items": [
            {
                "product_id": 1,
                "product_name": "Urea 46-0-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 267,
                "total_price": 267,
                "subtotal": 267,
                "unit": "bag",
                "brand": "IFFCO",
                "manufacturer": "IFFCO"
            },
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 160,
                "total_price": 160,
                "subtotal": 160,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 186,
        "order_id": 186,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 4350,
        "discount": 130,
        "final_amount": 4220,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2025-186",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-05-18T10:30:00Z",
        "items": [
            {
                "product_id": 7,
                "product_name": "Paddy BPT 5204 Seeds (25 kg)",
                "category": "seed",
                "quantity": 3,
                "unit_price": 1300,
                "total_price": 3900,
                "subtotal": 3900,
                "unit": "bag",
                "brand": "AP Seeds",
                "manufacturer": "AP Seeds"
            },
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 450,
                "total_price": 450,
                "subtotal": 450,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 192,
        "order_id": 192,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 2120,
        "discount": 0,
        "final_amount": 2120,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2025-192",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-08-18T10:30:00Z",
        "items": [
            {
                "product_id": 3,
                "product_name": "MOP Potash (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 1700,
                "total_price": 1700,
                "subtotal": 1700,
                "unit": "bag",
                "brand": "IPL",
                "manufacturer": "IPL"
            },
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 1,
                "unit_price": 420,
                "total_price": 420,
                "subtotal": 420,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 198,
        "order_id": 198,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 7950,
        "discount": 238,
        "final_amount": 7712,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2025-198",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-11-18T10:30:00Z",
        "items": [
            {
                "product_id": 9,
                "product_name": "Drip Irrigation Inline Pipe (100m)",
                "category": "equipment",
                "quantity": 3,
                "unit_price": 2200,
                "total_price": 6600,
                "subtotal": 6600,
                "unit": "bundle",
                "brand": "Jain Irrigation",
                "manufacturer": "Jain Irrigation"
            },
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 1350,
                "total_price": 1350,
                "subtotal": 1350,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 204,
        "order_id": 204,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 1300,
        "discount": 0,
        "final_amount": 1300,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2026-204",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-03-18T10:30:00Z",
        "items": [
            {
                "product_id": 5,
                "product_name": "Chlorpyriphos 20 EC (1L)",
                "category": "pesticide",
                "quantity": 1,
                "unit_price": 540,
                "total_price": 540,
                "subtotal": 540,
                "unit": "L",
                "brand": "Tata Rallis",
                "manufacturer": "Tata Rallis"
            },
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 1,
                "unit_price": 760,
                "total_price": 760,
                "subtotal": 760,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 210,
        "order_id": 210,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 961,
        "discount": 0,
        "final_amount": 961,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2026-210",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-07-18T10:30:00Z",
        "items": [
            {
                "product_id": 1,
                "product_name": "Urea 46-0-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 267,
                "total_price": 801,
                "subtotal": 801,
                "unit": "bag",
                "brand": "IFFCO",
                "manufacturer": "IFFCO"
            },
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 160,
                "total_price": 160,
                "subtotal": 160,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 216,
        "order_id": 216,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 1750,
        "discount": 0,
        "final_amount": 1750,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2026-216",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-10-18T10:30:00Z",
        "items": [
            {
                "product_id": 7,
                "product_name": "Paddy BPT 5204 Seeds (25 kg)",
                "category": "seed",
                "quantity": 1,
                "unit_price": 1300,
                "total_price": 1300,
                "subtotal": 1300,
                "unit": "bag",
                "brand": "AP Seeds",
                "manufacturer": "AP Seeds"
            },
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 450,
                "total_price": 450,
                "subtotal": 450,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    }
],
  calendar: [
    { id: 1, user_id: 17, title: "Paddy Field Inspection (Block 2)", event_type: "spraying", event_date: "2026-10-25", description: "Check water level and panicle emergence", is_completed: false, color: "#22c55e", reminder_days_before: 1 },
    { id: 2, user_id: 17, title: "Cotton Second Picking", event_type: "harvest", event_date: "2026-10-31", description: "Hire 6 labor team for picking", is_completed: false, color: "#f59e0b", reminder_days_before: 2 },
    { id: 3, user_id: 17, title: "KCC Loan EMI Due (₹8,500)", event_type: "loan", event_date: "2026-11-15", description: "Debit from SBI savings account", is_completed: false, color: "#ef4444", reminder_days_before: 3 },
    { id: 4, user_id: 17, title: "Rabi Wheat Nursery Sowing", event_type: "sowing", event_date: "2026-11-22", description: "Prepare seed bed with vermicompost", is_completed: false, color: "#3b82f6", reminder_days_before: 2 },
    { id: 5, user_id: 17, title: "Canal Water Gate Release", event_type: "irrigation", event_date: "2026-10-27", description: "Irrigate 3.1 acres Paddy Block 1", is_completed: false, color: "#06b6d4", reminder_days_before: 1 }
  ],
  storage: {
    summary: {
      total_batches: 1,
      stored_batches: 1,
      total_bags: 80,
      total_weight_quintals: 40.0,
      total_monthly_rent: 480.0,
      total_rent_accrued: 240.0,
      est_market_value: 84000.0,
      available_for_pledge: 40.0
    },
    storages: [
      {
        id: 1,
        crop_name: "Maize (Hybrid)",
        variety: "Hybrid NK-6240",
        storage_type: "cold_storage",
        facility_name: "Kondapally Primary Cold Store",
        location: "Kondapally Industrial Zone, Krishna AP",
        receipt_number: "KPCS-2026-M-0842",
        bags_count: 80,
        weight_quintals: 40.0,
        bag_weight_kg: 50.0,
        monthly_rent_per_bag: 6.0,
        deposit_date: "2026-10-09",
        expected_release_date: "2026-12-08",
        status: "stored",
        target_sell_price_per_quintal: 2100.0,
        notes: "Holding 40 qtl Maize for December peak price. Current rate: ₹1,890, target: ₹2,100.",
        created_at: "2026-10-09T08:00:00Z"
      }
    ]
  },
  insurance: {
    summary: {
      total_policies: 2,
      active_policies: 1,
      settled_claims_count: 1,
      total_sum_insured: 510000.0,
      total_farmer_premium_paid: 5100.0,
      total_claims_received: 42000.0
    },
    policies: [
      {
        id: 1,
        policy_number: "PMFBY-AP-KHARIF-2026-08421",
        scheme_name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        season: "Kharif",
        crop_year: 2026,
        crop_name: "Paddy (BPT 5204) & Cotton",
        sum_insured_per_acre: 60000.0,
        farmer_share_percent: 2.0,
        total_premium_paid: 3240.0,
        total_sum_insured: 324000.0,
        insured_area_acres: 5.40,
        insurance_company: "Agriculture Insurance Company of India (AIC)",
        policy_document_url: null,
        policy_status: "active",
        created_at: "2026-06-20T10:00:00Z",
        claim_status: null
      },
      {
        id: 2,
        policy_number: "PMFBY-AP-RABI-2025-01994",
        scheme_name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        season: "Rabi",
        crop_year: 2025,
        crop_name: "Maize (Hybrid)",
        sum_insured_per_acre: 60000.0,
        farmer_share_percent: 1.5,
        total_premium_paid: 1860.0,
        total_sum_insured: 186000.0,
        insured_area_acres: 3.10,
        insurance_company: "Agriculture Insurance Company of India (AIC)",
        policy_status: "claim_settled",
        created_at: "2025-11-15T09:30:00Z",
        claim_status: "approved",
        claim_amount: 42000.0,
        claim_settlement_date: "2026-03-25"
      }
    ],
    guidance: {
      claim_intimation_window_hours: 72,
      toll_free_number: "1800-180-1551",
      required_documents: ["Aadhaar Card", "Land Possession Certificate (Pahani)", "Sowing Certificate", "Bank Passbook Copy", "Geo-tagged Calamity Photos"],
      local_nodal_officer: "Mandal Agricultural Officer, Nuzividu (Ph: 08656-234567)"
    }
  },
  finance: {
    wallet_balance: 84200,
    total_income: 285000,
    total_expenses: 104000,
    pending_payments: 28500,
    summary: {
      total_borrowed: 170000.0,
      total_outstanding: 62000.0,
      total_repaid: 108000.0,
      active_loans_count: 1,
      overdue_loans_count: 0
    },
    loans: [
      {
        id: 1,
        source_type: "bank",
        lender_name: "State Bank of India (KCC Agri Branch, Nuzividu)",
        purpose: "Kisan Credit Card Kharif Crop Loan (Paddy + Cotton)",
        principal_amount: 150000.0,
        interest_rate_percent: 7.0,
        interest_type: "annual",
        start_date: "2024-05-10",
        due_date: "2026-11-15",
        outstanding_amount: 62000.0,
        status: "active",
        emi_amount: 8500.0,
        notes: "3% interest subvention active for timely repayment. Effective rate 4%.",
        repayments: [
          { id: 1, loan_id: 1, repayment_amount: 88000.0, repayment_date: "2025-10-15", payment_mode: "bank_transfer", notes: "Post-harvest repayment from Paddy proceeds" }
        ]
      },
      {
        id: 2,
        source_type: "fertilizer_shop",
        lender_name: "Krishna Agro Center",
        purpose: "Seasonal input credit for DAP & Urea fertilizers",
        principal_amount: 20000.0,
        interest_rate_percent: 0.0,
        interest_type: "flat",
        start_date: "2026-06-15",
        due_date: "2026-10-31",
        outstanding_amount: 0.0,
        status: "closed",
        notes: "Fully settled on 2026-10-12 via UPI.",
        repayments: [
          { id: 2, loan_id: 2, repayment_amount: 20000.0, repayment_date: "2026-10-12", payment_mode: "upi", notes: "Settled in full" }
        ]
      }
    ],
    transactions: [
      { id: "T001", date: mkDate(2026,10,15), type: "credit", description: "PM-KISAN 17th Installment", amount: 2000 },
      { id: "T002", date: mkDate(2026,10,12), type: "credit", description: "Paddy Sale Advance - Sri Venkateswara Mill", amount: 48400 },
      { id: "T003", date: mkDate(2026,10,8), type: "debit", description: "Krishna Agro Center - Input Purchase", amount: 8185 },
      { id: "T004", date: mkDate(2026,9,30), type: "debit", description: "KCC Loan EMI Payment", amount: 8500 },
      { id: "T005", date: mkDate(2026,9,20), type: "credit", description: "Maize Sale proceeds", amount: 35000 },
    ],
  },
  annualPerformanceSummary: {
    year: 2026,
    available_years: [2026, 2025, 2024, 2023, 2022, 2021],
    total_revenue: 285000,
    total_expenses: 104000,
    net_profit: 181000,
    profit_margin_percent: 63.5,
    total_area_cultivated: 7.20,
    crops_grown_count: 3,
    kharif_summary: { revenue: 215000, expenses: 76000, net_profit: 139000, area: 5.40 },
    rabi_summary: { revenue: 70000, expenses: 28000, net_profit: 42000, area: 1.80 },
    top_crops: [
      { name: "Paddy (BPT 5204)", revenue: 145000, expenses: 48000, profit: 97000, yield_quintals: 62.0 },
      { name: "Cotton (Bunny BT)", revenue: 70000, expenses: 28000, profit: 42000, yield_quintals: 10.5 },
      { name: "Maize (Hybrid)", revenue: 70000, expenses: 28000, profit: 42000, yield_quintals: 38.0 },
    ],
    yoy_growth: {
      revenue_growth_percent: 12.8,
      profit_growth_percent: 15.2,
      expense_change_percent: -4.1
    }
  },
  seasons: {
    available: ["Kharif 2026", "Rabi 2025-26", "Kharif 2025", "Rabi 2024-25", "Kharif 2024", "Rabi 2023-24"],
    overviews: [
      { season: "Kharif 2026", total_revenue: 215000, total_expenses: 76000, net_profit: 139000, total_yield: 72.5, area: 5.40 },
      { season: "Rabi 2025-26", total_revenue: 70000, total_expenses: 28000, net_profit: 42000, total_yield: 42.5, area: 1.80 },
      { season: "Kharif 2025", total_revenue: 198000, total_expenses: 74000, net_profit: 124000, total_yield: 68.0, area: 5.40 },
    ]
  },
  millsMarketplace: [
    {
      id: 1,
      mill_name: "Sri Venkateswara Rice & Cotton Mill",
      type: "Rice",
      owner_name: "Prasad Babu Reddy",
      location: "Nuzividu Industrial Estate",
      district: "Krishna",
      state: "Andhra Pradesh",
      distance: "4.8 km",
      phone: "9700012345",
      verified: true,
      rating: 4.8,
      price_offered: "₹2,420 / Qtl (Paddy)",
      capacity: "120 Tons/Day",
      crops_accepted: "Paddy (BPT 5204), Cotton, Maize",
      license_number: "AP/MILL/2018/00892"
    },
    {
      id: 2,
      mill_name: "Vijaya Modern Modern Rice Mill",
      type: "Rice",
      owner_name: "Koteswara Rao",
      location: "Gannavaram Road",
      district: "Krishna",
      state: "Andhra Pradesh",
      distance: "12.5 km",
      phone: "9848077665",
      verified: true,
      rating: 4.6,
      price_offered: "₹2,380 / Qtl (Paddy)",
      capacity: "80 Tons/Day",
      crops_accepted: "Paddy (BPT 5204), Paddy (MTU 1010)",
      license_number: "AP/MILL/2019/00341"
    },
    {
      id: 3,
      mill_name: "Amaravati Cotton Ginning & Pressing",
      type: "Cotton",
      owner_name: "Srinivasa Murthy",
      location: "Vijayawada Bypass",
      district: "Krishna",
      state: "Andhra Pradesh",
      distance: "21.0 km",
      phone: "9848099882",
      verified: true,
      rating: 4.7,
      price_offered: "₹6,850 / Qtl (Raw Cotton)",
      capacity: "200 Bales/Day",
      crops_accepted: "Cotton (Bunny BT), DCH-32",
      license_number: "AP/COT/2016/0112"
    }
  ],
  weather: {
    location: "Kondapally, Andhra Pradesh",
    temperature: 29.5,
    condition: "Partly Cloudy",
    humidity: 72,
    wind_speed: 12.4,
    rainfall_mm: 2.4,
    soil_moisture: 32,
    current: {
      temperature_2m: 29.5,
      relative_humidity_2m: 72,
      precipitation: 2.4,
      precipitation_sum: 2.4,
      windspeed_10m: 12.4,
      soil_moisture_0_to_1cm: 0.28,
      soil_moisture_0_to_7cm: 0.32,
      evapotranspiration: 4.2
    },
    daily: [
      { date: mkDate(2026,10,24), temperature_2m_max: 31, temperature_2m_min: 23, precipitation_sum: 2.4, soil_moisture_0_to_7cm: 0.32, evapotranspiration: 4.2 },
      { date: mkDate(2026,10,25), temperature_2m_max: 33, temperature_2m_min: 24, precipitation_sum: 0.0, soil_moisture_0_to_7cm: 0.30, evapotranspiration: 4.5 },
      { date: mkDate(2026,10,26), temperature_2m_max: 28, temperature_2m_min: 22, precipitation_sum: 18.5, soil_moisture_0_to_7cm: 0.38, evapotranspiration: 2.8 },
      { date: mkDate(2026,10,27), temperature_2m_max: 27, temperature_2m_min: 21, precipitation_sum: 12.0, soil_moisture_0_to_7cm: 0.36, evapotranspiration: 3.1 },
      { date: mkDate(2026,10,28), temperature_2m_max: 30, temperature_2m_min: 23, precipitation_sum: 4.2, soil_moisture_0_to_7cm: 0.34, evapotranspiration: 3.8 },
      { date: mkDate(2026,10,29), temperature_2m_max: 32, temperature_2m_min: 24, precipitation_sum: 0.0, soil_moisture_0_to_7cm: 0.31, evapotranspiration: 4.4 },
      { date: mkDate(2026,10,30), temperature_2m_max: 30, temperature_2m_min: 22, precipitation_sum: 1.5, soil_moisture_0_to_7cm: 0.30, evapotranspiration: 4.1 },
    ],
    forecast: [
      { day: "Today", date: mkDate(2026,10,24), temp: 31, temp_min: 23, condition: "Partly Cloudy", rain_prob: 30, soil_moisture: 32 },
      { day: "Tue", date: mkDate(2026,10,25), temp: 33, temp_min: 24, condition: "Sunny", rain_prob: 5, soil_moisture: 30 },
      { day: "Wed", date: mkDate(2026,10,26), temp: 28, temp_min: 22, condition: "Heavy Rain", rain_prob: 85, soil_moisture: 38 },
      { day: "Thu", date: mkDate(2026,10,27), temp: 27, temp_min: 21, condition: "Rainy", rain_prob: 70, soil_moisture: 36 },
      { day: "Fri", date: mkDate(2026,10,28), temp: 30, temp_min: 23, condition: "Cloudy", rain_prob: 40, soil_moisture: 34 },
      { day: "Sat", date: mkDate(2026,10,29), temp: 32, temp_min: 24, condition: "Sunny", rain_prob: 10, soil_moisture: 31 },
      { day: "Sun", date: mkDate(2026,10,30), temp: 30, temp_min: 22, condition: "Thunderstorm", rain_prob: 60, soil_moisture: 30 },
    ],
    alerts: [
      { type: "warning", title: "Heavy Thunderstorm Alert", message: "Moderate to heavy thunderstorm expected across Krishna district on Wednesday afternoon. Ensure field drainage channels are clear." }
    ],
    advice: [
      "Optimal soil moisture (32%) observed in Block 1 Paddy; postpone planned canal irrigation.",
      "Spray Chlorpyriphos 20 EC in early morning hours before Wednesday's expected rainfall.",
      "Check storage warehouse roof seals at Kondapally Cold Store ahead of rains."
    ],
    recommendations: [
      { icon: "💧", type: "info", title: "Optimal Soil Moisture", text: "Soil moisture is in the optimal range (32%) for paddy vegetative growth." },
      { icon: "⛈️", type: "warning", title: "Upcoming Cyclone Rain", text: "Avoid nitrogen top-dressing 24 hours before Wednesday rain to prevent nutrient leaching." }
    ]
  },
  marketPrices: [
    {
      crop_name: "Paddy (BPT-5204)",
      market_price: 2420,
      change: 45,
      trend: "up",
      nearest_mandi: "Nuzividu APMC",
      msp: 2369,
      msp_comparison: "above",
      markets: [
        { market_name: "Nuzividu APMC", distance_km: 4.2, price: 2420, change: 45, trend: "up" },
        { market_name: "Vijayawada Mandi", distance_km: 18.5, price: 2450, change: 60, trend: "up" },
        { market_name: "Guntur Yard", distance_km: 42.0, price: 2390, change: -10, trend: "down" }
      ]
    },
    {
      crop_name: "Cotton",
      market_price: 6850,
      change: -120,
      trend: "down",
      nearest_mandi: "Vijayawada",
      msp: 6620,
      msp_comparison: "above",
      markets: [
        { market_name: "Vijayawada", distance_km: 18.5, price: 6850, change: -120, trend: "down" },
        { market_name: "Guntur APMC", distance_km: 42.0, price: 6920, change: -80, trend: "down" }
      ]
    },
    {
      crop_name: "Maize",
      market_price: 1890,
      change: 30,
      trend: "up",
      nearest_mandi: "Guntur APMC",
      msp: 2090,
      msp_comparison: "below",
      markets: [
        { market_name: "Guntur APMC", distance_km: 42.0, price: 1890, change: 30, trend: "up" },
        { market_name: "Nuzividu APMC", distance_km: 4.2, price: 1870, change: 25, trend: "up" }
      ]
    },
    {
      crop_name: "Chilli (Teja)",
      market_price: 18200,
      change: -250,
      trend: "down",
      nearest_mandi: "Guntur Yard",
      msp: 0,
      msp_comparison: "n/a",
      markets: [
        { market_name: "Guntur Yard", distance_km: 42.0, price: 18200, change: -250, trend: "down" },
        { market_name: "Khammam Mandi", distance_km: 85.0, price: 18450, change: -180, trend: "down" }
      ]
    }
  ],
  news: [
    { id: 1, category: "scheme", title: "PM-KISAN 17th Installment Released: ₹2,000 Credited Directly", summary: "Over 9.26 crore beneficiary farmers received the 17th installment of PM-KISAN directly in their Aadhaar-seeded bank accounts.", source: "PIB Ministry of Agriculture", verified: true, date: "2026-10-15T00:00:00Z" },
    { id: 2, category: "market", title: "Cabinet Approves Paddy MSP Hike to ₹2,369/Quintal for Kharif", summary: "Minimum Support Price for Paddy Common increased by ₹117/qtl, offering farmers an assured 50% margin over all-India weighted average cost of production.", source: "Cabinet Committee on Economic Affairs", verified: true, date: "2026-09-28T00:00:00Z" },
    { id: 3, category: "alert", title: "Heavy Rainfall & Cyclone Advisory for Coastal Andhra Pradesh", summary: "IMD Hyderabad forecasts moderate to heavy thunderstorm rains with wind speeds 40-50 kmph over Krishna, Guntur and West Godavari.", source: "IMD Hyderabad", verified: true, date: "2026-10-22T00:00:00Z" },
    { id: 4, category: "tip", title: "Pink Bollworm Scouting Guidelines for Kharif Cotton Growers", summary: "Agricultural scientists advise monitoring 20 green bolls per acre for rosette flowers and exit holes before spraying Chlorpyriphos 20 EC.", source: "ICAR Cotton Research Station", verified: true, date: "2026-10-05T00:00:00Z" },
    { id: 5, category: "technology", title: "Subsidized Solar Drip Irrigation Schemes Open for Krishna District", summary: "AP Micro Irrigation Project announces 80% subsidy for small and marginal farmers installing inline drip equipment.", source: "APMIP Vijayawada", verified: true, date: "2026-10-10T00:00:00Z" }
  ],
  recommendations: {
    bestCrop: {
      crop_name: "Paddy (BPT 5204 Samba Masuri)",
      icon: "🌾",
      variety: "BPT 5204 Certified",
      target_season: "Kharif 2026",
      expected_profit_per_acre: 31200,
      expected_yield_per_acre: 20.0,
      estimated_cost_per_acre: 17200,
      estimated_revenue_per_acre: 48400,
      confidence_score: 96,
      headline: "Top Recommended Crop: High APMC Mandi Premium & Proven 5-Yr Field Performance",
      reason: "Consistently delivered 20+ qtl/acre over past 4 seasons with steady APMC rates above ₹2,400/qtl. Soil pH 6.8 is ideal.",
      past_profit_factor: "+18% average net margin over last 3 years in Block 1 & 2.",
      market_trend_factor: "High demand across Krishna & Guntur mills for export-quality slender grain.",
      weather_factor: "Monsoon rainfall forecast matches early tillering stage water requirements.",
      alternatives: [
        { crop_name: "Maize (Hybrid NK-6240)", variety: "NK-6240", expected_profit_per_acre: 27000, confidence_score: 91, tag: "Low Water" },
        { crop_name: "Bunny BT Cotton", variety: "Bunny BT", expected_profit_per_acre: 18200, confidence_score: 84, tag: "High Value" }
      ]
    },
    crops: [
      { crop_name: "Maize (Hybrid NK-6240)", reason: "High demand expected in poultry feed mills this winter; prices projected at ₹2,100/qtl (+11% vs MSP).", confidence_score: 94, type: "market" },
      { crop_name: "Chickpea / Bengal Gram", reason: "Ideal nitrogen-fixing rotation crop following Kharif Paddy. Restores soil NPK naturally.", confidence_score: 88, type: "rotation" },
      { crop_name: "Sesame (Till)", reason: "Low water requirement suited for residual moisture in Block 3.", confidence_score: 82, type: "general" }
    ]
  },
  plots: [
    {
        "id": 1,
        "land_record_id": 1,
        "serial_number": "SURVEY-442/1A",
        "plot_name": "Block 1 (North Field)",
        "area": 3.1,
        "area_acres": 3.1,
        "soil_type": "Black Cotton",
        "crop_name": "Paddy (BPT-5204)",
        "current_crop": "Paddy (BPT-5204)",
        "crop_status": "Growing",
        "crop_id": 13,
        "status": "Optimal",
        "soil_data": {
            "id": 1,
            "land_record_id": 1,
            "user_id": 17,
            "nitrogen": 280,
            "phosphorus": 26,
            "potassium": 310,
            "ph_level": 7.2,
            "organic_carbon": 0.65,
            "crop_id": 13,
            "last_tested": "2026-06-15",
            "notes": "Black cotton soil with high clay content. Optimal CEC.",
            "created_at": "2026-06-15T08:00:00Z",
            "updated_at": "2026-06-15T08:00:00Z"
        },
        "live_adjusted": {
            "baseline": {
                "nitrogen": 280,
                "phosphorus": 26,
                "potassium": 310,
                "ph_level": 7.2,
                "organic_carbon": 0.65,
                "last_tested": "2026-06-15"
            },
            "adjusted": {
                "nitrogen": 265,
                "phosphorus": 25,
                "potassium": 305,
                "ph_level": 7.15
            },
            "deltas": {
                "nitrogen": -15,
                "phosphorus": -1,
                "potassium": -5
            }
        }
    },
    {
        "id": 2,
        "land_record_id": 2,
        "serial_number": "SURVEY-442/1B",
        "plot_name": "Block 2 (South Field)",
        "area": 2.3,
        "area_acres": 2.3,
        "soil_type": "Red Loamy",
        "crop_name": "Cotton (Bunny BT)",
        "current_crop": "Cotton (Bunny BT)",
        "crop_status": "Growing",
        "crop_id": 14,
        "status": "Good",
        "soil_data": {
            "id": 2,
            "land_record_id": 2,
            "user_id": 17,
            "nitrogen": 240,
            "phosphorus": 22,
            "potassium": 275,
            "ph_level": 6.8,
            "organic_carbon": 0.58,
            "crop_id": 14,
            "last_tested": "2026-07-01",
            "notes": "Well drained red loamy plot. Well suited for cotton taproot development.",
            "created_at": "2026-07-01T08:00:00Z",
            "updated_at": "2026-07-01T08:00:00Z"
        },
        "live_adjusted": {
            "baseline": {
                "nitrogen": 240,
                "phosphorus": 22,
                "potassium": 275,
                "ph_level": 6.8,
                "organic_carbon": 0.58,
                "last_tested": "2026-07-01"
            },
            "adjusted": {
                "nitrogen": 230,
                "phosphorus": 21,
                "potassium": 268,
                "ph_level": 6.8
            },
            "deltas": {
                "nitrogen": -10,
                "phosphorus": -1,
                "potassium": -7
            }
        }
    },
    {
        "id": 3,
        "land_record_id": 3,
        "serial_number": "SURVEY-443/2",
        "plot_name": "Block 3 (Canal Gate)",
        "area": 1.8,
        "area_acres": 1.8,
        "soil_type": "Alluvial Clay",
        "crop_name": "Maize (Kaveri-55)",
        "current_crop": "Maize (Kaveri-55)",
        "crop_status": "Fallow",
        "crop_id": null,
        "status": "Optimal",
        "soil_data": {
            "id": 3,
            "land_record_id": 3,
            "user_id": 17,
            "nitrogen": 310,
            "phosphorus": 30,
            "potassium": 340,
            "ph_level": 7.4,
            "organic_carbon": 0.72,
            "crop_id": null,
            "last_tested": "2026-08-10",
            "notes": "Canal silt deposit enriched plot. High organic matter.",
            "created_at": "2026-08-10T08:00:00Z",
            "updated_at": "2026-08-10T08:00:00Z"
        },
        "live_adjusted": {
            "baseline": {
                "nitrogen": 310,
                "phosphorus": 30,
                "potassium": 340,
                "ph_level": 7.4,
                "organic_carbon": 0.72,
                "last_tested": "2026-08-10"
            },
            "adjusted": {
                "nitrogen": 310,
                "phosphorus": 30,
                "potassium": 340,
                "ph_level": 7.4
            },
            "deltas": {
                "nitrogen": 0,
                "phosphorus": 0,
                "potassium": 0
            }
        }
    }
],
  reportMeta: {
    crops_count: 3,
    total_area_acres: 7.20,
    total_yield_quintals: 62.5,
    total_cost: 104000,
    total_revenue: 285000,
    net_profit: 181000,
    eligible_uses: ["Bank KCC Loan Renewal", "Crop Insurance PMFBY Claim Verification", "APMC Mandi Direct Trade Certification"]
  },
  blockchain: {
    blocks: [
    {
        "id": 1,
        "block_index": 0,
        "timestamp": "2026-06-15T09:00:00.000Z",
        "previous_hash": "0000000000000000000000000000000000000000000000000000000000000000",
        "hash": "0000a39f1c7d8b5e2a44f9c118e63023e6541fbbd098d5c90b63c7b8d41e779a",
        "payload": "Genesis Block: AgriFlow.ai Decentralized Farm-to-Fork Traceability Network initialized for Krishna District AP.",
        "product_id": 0,
        "certification_type": "Genesis",
        "verifier_name": "AgriFlow Consensus Engine"
    },
    {
        "id": 2,
        "block_index": 1,
        "timestamp": "2026-07-10T11:30:00.000Z",
        "previous_hash": "0000a39f1c7d8b5e2a44f9c118e63023e6541fbbd098d5c90b63c7b8d41e779a",
        "hash": "0000c82b41f7e0294b8fa4390b1e42a98f12cc65a78019e4871e98d89a7102cd",
        "payload": "Organic Farm Practice Verified: Zero synthetic organophosphates detected. Panchagavya and neem bio-repellent soil treatment on Plot 1 (Paddy BPT-5204).",
        "product_id": 1,
        "certification_type": "Organic Certification",
        "verifier_name": "AP State Organic Certification Authority (APSOCA)"
    },
    {
        "id": 3,
        "block_index": 2,
        "timestamp": "2026-09-25T14:45:00.000Z",
        "previous_hash": "0000c82b41f7e0294b8fa4390b1e42a98f12cc65a78019e4871e98d89a7102cd",
        "hash": "0000e4719082bfce1a719d380bbfa3940120194098efccad8291048bca612e31",
        "payload": "Harvest Batch #2026-PAD-01: 52 quintals harvested at optimal 14.1% moisture. Mill procurement gate pass #GP-4421 stamped.",
        "product_id": 1,
        "certification_type": "Traceability Event",
        "verifier_name": "Sri Venkateswara Rice & Cotton Mill Gate Inspector"
    },
    {
        "id": 4,
        "block_index": 3,
        "timestamp": "2026-10-24T16:00:00.000Z",
        "previous_hash": "0000e4719082bfce1a719d380bbfa3940120194098efccad8291048bca612e31",
        "hash": "0000f9184ba71304910cf91a84c83017a4190c1084ef772390ab128ce64821a0",
        "payload": "Fair Trade & Fair Price Certification: Farmer received \u20b92,420/quintal (>18% above MSP benchmark). Direct bank transfer verified.",
        "product_id": 1,
        "certification_type": "Fair Trade Verification",
        "verifier_name": "Fair Trade India Agriculture Bureau"
    }
],
    stats: {
    "total_blocks": 4,
    "organic_certifications": 1,
    "fair_trade_verifications": 1,
    "traceability_events": 2,
    "is_ledger_valid": true
}
  },
  seasonComparison: {
    "season_a": {
        "season": "Kharif 2026",
        "total_revenue": 215000,
        "total_expenses": 76000,
        "net_profit": 139000,
        "total_yield": 72.5,
        "area": 5.4,
        "profit_per_acre": 25740.74,
        "yield_per_acre": 13.43,
        "crops_count": 2
    },
    "season_b": {
        "season": "Rabi 2025-26",
        "total_revenue": 70000,
        "total_expenses": 28000,
        "net_profit": 42000,
        "total_yield": 42.5,
        "area": 1.8,
        "profit_per_acre": 23333.33,
        "yield_per_acre": 23.61,
        "crops_count": 1
    },
    "profit_comparison": {
        "season_a_val": 139000,
        "season_b_val": 42000,
        "absolute_change": 97000,
        "percentage_change": 230.95,
        "is_positive": true
    },
    "yield_comparison": {
        "season_a_val": 72.5,
        "season_b_val": 42.5,
        "absolute_change": 30.0,
        "percentage_change": 70.59,
        "is_positive": true
    },
    "cost_comparison": {
        "season_a_val": 76000,
        "season_b_val": 28000,
        "absolute_change": 48000,
        "percentage_change": 171.43,
        "is_positive": false
    },
    "revenue_comparison": {
        "season_a_val": 215000,
        "season_b_val": 70000,
        "absolute_change": 145000,
        "percentage_change": 207.14,
        "is_positive": true
    },
    "crop_comparisons": [
        {
            "crop_name": "Paddy (BPT-5204)",
            "season_a_yield": 52.0,
            "season_b_yield": 0.0,
            "season_a_profit": 108900,
            "season_b_profit": 0,
            "yield_change_percent": 100.0,
            "profit_change_percent": 100.0
        },
        {
            "crop_name": "Maize (Kaveri-55)",
            "season_a_yield": 0.0,
            "season_b_yield": 42.5,
            "season_a_profit": 0,
            "season_b_profit": 42000,
            "yield_change_percent": -100.0,
            "profit_change_percent": -100.0
        }
    ],
    "ai_insights": [
        "Net income grew by \u20b997,000 (+231%) in Kharif 2026 primarily due to expanding cultivated acreage into Paddy (BPT-5204).",
        "Cost per quintal produced improved from \u20b9658/q in Rabi to \u20b91,048/q in Kharif due to intensive cotton bio-pest control expenses.",
        "Mandi realization price for Paddy reached \u20b92,420/q exceeding the government MSP of \u20b92,300/q by \u20b9120/q.",
        "Recommendation for next Rabi: Continue maize-pulse crop rotation to preserve soil nitrogen and lower basal fertilizer expenditure."
    ]
}
};

export const shopDemoData = {
  profile: {
    id: 10,
    shop_name: "Krishna Agro Center",
    owner_name: "Venkat Rao Potti",
    father_name: "Subba Rao Potti",
    license_no: "AP/AGR/2019/04521",
    license_number: "AP/AGR/2019/04521",
    gst: "37AAAPV1234C1Z5",
    phone: "9848012345",
    contact_number: "9848012345",
    email: "krishna.agro@gmail.com",
    address: "Main Road, Near Bus Stand, Nuzividu, Krishna Dist., AP 521111",
    village: "Nuzividu",
    district: "Krishna",
    state: "Andhra Pradesh",
    pincode: "521111",
    established: 2018,
    rating: 4.8,
    total_customers: 1842,
  },
  inventory: [
    { id: 1, user_id: 1, seller_name: "Krishna Agro Center", name: "Urea 46-0-0 (50 kg)", short_name: "Urea", category: "fertilizer", stock: 245, quantity: 245, unit_price: 267, price: 267, cost_price: 240, reorder_level: 100, supplier: "IFFCO", brand: "IFFCO", manufacturer: "IFFCO", unit: "bag", low_stock: false, status: "active" },
    { id: 2, user_id: 1, seller_name: "Krishna Agro Center", name: "DAP 18-46-0 (50 kg)", short_name: "DAP", category: "fertilizer", stock: 88, quantity: 88, unit_price: 1350, price: 1350, cost_price: 1200, reorder_level: 50, supplier: "Coromandel", brand: "Coromandel", manufacturer: "Coromandel", unit: "bag", low_stock: false, status: "active" },
    { id: 3, user_id: 1, seller_name: "Krishna Agro Center", name: "MOP Potash (50 kg)", short_name: "MOP", category: "fertilizer", stock: 62, quantity: 62, unit_price: 1100, price: 1100, cost_price: 980, reorder_level: 40, supplier: "IPL", brand: "IPL", manufacturer: "IPL", unit: "bag", low_stock: false, status: "active" },
    { id: 4, user_id: 1, seller_name: "Krishna Agro Center", name: "Chlorpyriphos 20 EC (1L)", short_name: "Chlorpyriphos", category: "pesticide", stock: 156, quantity: 156, unit_price: 620, price: 620, cost_price: 510, reorder_level: 60, supplier: "Dhanuka", brand: "Dhanuka", manufacturer: "Dhanuka", unit: "bottle", low_stock: false, status: "active" },
    { id: 5, user_id: 1, seller_name: "Krishna Agro Center", name: "BPT-5204 Certified Seed (5kg)", short_name: "BPT-5204", category: "seeds", stock: 420, quantity: 420, unit_price: 185, price: 185, cost_price: 145, reorder_level: 150, supplier: "AP State Seeds", brand: "AP Seeds", manufacturer: "APSSC", unit: "packet", low_stock: false, status: "active" },
    { id: 6, user_id: 1, seller_name: "Krishna Agro Center", name: "Cotton Bunny BT Seeds (450g)", short_name: "Bunny BT", category: "seeds", stock: 35, quantity: 35, unit_price: 740, price: 740, cost_price: 640, reorder_level: 50, supplier: "Rasi Seeds", brand: "Rasi", manufacturer: "Rasi", unit: "packet", low_stock: true, status: "active" },
    { id: 7, user_id: 1, seller_name: "Krishna Agro Center", name: "Drip Irrigation Inline Pipe (100m)", short_name: "Drip 16mm", category: "equipment", stock: 18, quantity: 18, unit_price: 2800, price: 2800, cost_price: 2300, reorder_level: 20, supplier: "Jain Irrigation", brand: "Jain", manufacturer: "Jain", unit: "roll", low_stock: true, status: "active" },
  ],
  orders: [
    {
        "id": 101,
        "order_id": 101,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 2700,
        "discount": 0,
        "final_amount": 2700,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2021-101",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-01-05T10:30:00Z",
        "items": [
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 1350,
                "total_price": 2700,
                "subtotal": 2700,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 102,
        "order_id": 102,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 5520,
        "discount": 165,
        "final_amount": 5355,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2021-102",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-01-18T10:30:00Z",
        "items": [
            {
                "product_id": 3,
                "product_name": "MOP Potash (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 1700,
                "total_price": 5100,
                "subtotal": 5100,
                "unit": "bag",
                "brand": "IPL",
                "manufacturer": "IPL"
            },
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 1,
                "unit_price": 420,
                "total_price": 420,
                "subtotal": 420,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 103,
        "order_id": 103,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 640,
        "discount": 0,
        "final_amount": 640,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2021-103",
        "status": "confirmed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-03-05T10:30:00Z",
        "items": [
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 4,
                "unit_price": 160,
                "total_price": 640,
                "subtotal": 640,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 104,
        "order_id": 104,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 2820,
        "discount": 0,
        "final_amount": 2820,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2021-104",
        "status": "dispatched",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-03-18T10:30:00Z",
        "items": [
            {
                "product_id": 5,
                "product_name": "Chlorpyriphos 20 EC (1L)",
                "category": "pesticide",
                "quantity": 1,
                "unit_price": 540,
                "total_price": 540,
                "subtotal": 540,
                "unit": "L",
                "brand": "Tata Rallis",
                "manufacturer": "Tata Rallis"
            },
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 3,
                "unit_price": 760,
                "total_price": 2280,
                "subtotal": 2280,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 105,
        "order_id": 105,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 840,
        "discount": 0,
        "final_amount": 840,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2021-105",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-05-05T10:30:00Z",
        "items": [
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 2,
                "unit_price": 420,
                "total_price": 840,
                "subtotal": 840,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 106,
        "order_id": 106,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 4800,
        "discount": 144,
        "final_amount": 4656,
        "payment_mode": "cash",
        "payment_status": "unpaid",
        "payment_id": null,
        "status": "pending",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-05-18T10:30:00Z",
        "items": [
            {
                "product_id": 7,
                "product_name": "Paddy BPT 5204 Seeds (25 kg)",
                "category": "seed",
                "quantity": 3,
                "unit_price": 1300,
                "total_price": 3900,
                "subtotal": 3900,
                "unit": "bag",
                "brand": "AP Seeds",
                "manufacturer": "AP Seeds"
            },
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 450,
                "total_price": 900,
                "subtotal": 900,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 107,
        "order_id": 107,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 3040,
        "discount": 91,
        "final_amount": 2949,
        "payment_mode": "credit",
        "payment_status": "pending",
        "payment_id": null,
        "status": "cancelled",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-06-05T10:30:00Z",
        "items": [
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 4,
                "unit_price": 760,
                "total_price": 3040,
                "subtotal": 3040,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 108,
        "order_id": 108,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 3550,
        "discount": 106,
        "final_amount": 3444,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2021-108",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-06-18T10:30:00Z",
        "items": [
            {
                "product_id": 9,
                "product_name": "Drip Irrigation Inline Pipe (100m)",
                "category": "equipment",
                "quantity": 1,
                "unit_price": 2200,
                "total_price": 2200,
                "subtotal": 2200,
                "unit": "bundle",
                "brand": "Jain Irrigation",
                "manufacturer": "Jain Irrigation"
            },
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 1350,
                "total_price": 1350,
                "subtotal": 1350,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 109,
        "order_id": 109,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 900,
        "discount": 0,
        "final_amount": 900,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2021-109",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-07-05T10:30:00Z",
        "items": [
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 450,
                "total_price": 900,
                "subtotal": 900,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 110,
        "order_id": 110,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 1281,
        "discount": 0,
        "final_amount": 1281,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2021-110",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-07-18T10:30:00Z",
        "items": [
            {
                "product_id": 1,
                "product_name": "Urea 46-0-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 267,
                "total_price": 801,
                "subtotal": 801,
                "unit": "bag",
                "brand": "IFFCO",
                "manufacturer": "IFFCO"
            },
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 160,
                "total_price": 480,
                "subtotal": 480,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 111,
        "order_id": 111,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 5400,
        "discount": 162,
        "final_amount": 5238,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2021-111",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-08-05T10:30:00Z",
        "items": [
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 4,
                "unit_price": 1350,
                "total_price": 5400,
                "subtotal": 5400,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 112,
        "order_id": 112,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 2540,
        "discount": 0,
        "final_amount": 2540,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2021-112",
        "status": "confirmed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-08-18T10:30:00Z",
        "items": [
            {
                "product_id": 3,
                "product_name": "MOP Potash (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 1700,
                "total_price": 1700,
                "subtotal": 1700,
                "unit": "bag",
                "brand": "IPL",
                "manufacturer": "IPL"
            },
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 2,
                "unit_price": 420,
                "total_price": 840,
                "subtotal": 840,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 113,
        "order_id": 113,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 320,
        "discount": 0,
        "final_amount": 320,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2021-113",
        "status": "dispatched",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-09-05T10:30:00Z",
        "items": [
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 160,
                "total_price": 320,
                "subtotal": 320,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 114,
        "order_id": 114,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 2380,
        "discount": 0,
        "final_amount": 2380,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2021-114",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-09-18T10:30:00Z",
        "items": [
            {
                "product_id": 5,
                "product_name": "Chlorpyriphos 20 EC (1L)",
                "category": "pesticide",
                "quantity": 3,
                "unit_price": 540,
                "total_price": 1620,
                "subtotal": 1620,
                "unit": "L",
                "brand": "Tata Rallis",
                "manufacturer": "Tata Rallis"
            },
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 1,
                "unit_price": 760,
                "total_price": 760,
                "subtotal": 760,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 115,
        "order_id": 115,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 1680,
        "discount": 0,
        "final_amount": 1680,
        "payment_mode": "upi",
        "payment_status": "unpaid",
        "payment_id": null,
        "status": "pending",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-10-05T10:30:00Z",
        "items": [
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 4,
                "unit_price": 420,
                "total_price": 1680,
                "subtotal": 1680,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 116,
        "order_id": 116,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 2650,
        "discount": 0,
        "final_amount": 2650,
        "payment_mode": "credit",
        "payment_status": "pending",
        "payment_id": null,
        "status": "cancelled",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-10-18T10:30:00Z",
        "items": [
            {
                "product_id": 7,
                "product_name": "Paddy BPT 5204 Seeds (25 kg)",
                "category": "seed",
                "quantity": 1,
                "unit_price": 1300,
                "total_price": 1300,
                "subtotal": 1300,
                "unit": "bag",
                "brand": "AP Seeds",
                "manufacturer": "AP Seeds"
            },
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 450,
                "total_price": 1350,
                "subtotal": 1350,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 117,
        "order_id": 117,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 1520,
        "discount": 0,
        "final_amount": 1520,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2021-117",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-11-05T10:30:00Z",
        "items": [
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 2,
                "unit_price": 760,
                "total_price": 1520,
                "subtotal": 1520,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 118,
        "order_id": 118,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 9300,
        "discount": 279,
        "final_amount": 9021,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2021-118",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-11-18T10:30:00Z",
        "items": [
            {
                "product_id": 9,
                "product_name": "Drip Irrigation Inline Pipe (100m)",
                "category": "equipment",
                "quantity": 3,
                "unit_price": 2200,
                "total_price": 6600,
                "subtotal": 6600,
                "unit": "bundle",
                "brand": "Jain Irrigation",
                "manufacturer": "Jain Irrigation"
            },
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 1350,
                "total_price": 2700,
                "subtotal": 2700,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 119,
        "order_id": 119,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 1800,
        "discount": 0,
        "final_amount": 1800,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2021-119",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-12-05T10:30:00Z",
        "items": [
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 4,
                "unit_price": 450,
                "total_price": 1800,
                "subtotal": 1800,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 120,
        "order_id": 120,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 427,
        "discount": 0,
        "final_amount": 427,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2021-120",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2021",
        "created_at": "2021-12-18T10:30:00Z",
        "items": [
            {
                "product_id": 1,
                "product_name": "Urea 46-0-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 267,
                "total_price": 267,
                "subtotal": 267,
                "unit": "bag",
                "brand": "IFFCO",
                "manufacturer": "IFFCO"
            },
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 160,
                "total_price": 160,
                "subtotal": 160,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 121,
        "order_id": 121,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 2700,
        "discount": 0,
        "final_amount": 2700,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2022-121",
        "status": "confirmed",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-01-05T10:30:00Z",
        "items": [
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 1350,
                "total_price": 2700,
                "subtotal": 2700,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 122,
        "order_id": 122,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 6360,
        "discount": 190,
        "final_amount": 6170,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2022-122",
        "status": "dispatched",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-01-18T10:30:00Z",
        "items": [
            {
                "product_id": 3,
                "product_name": "MOP Potash (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 1700,
                "total_price": 5100,
                "subtotal": 5100,
                "unit": "bag",
                "brand": "IPL",
                "manufacturer": "IPL"
            },
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 3,
                "unit_price": 420,
                "total_price": 1260,
                "subtotal": 1260,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 123,
        "order_id": 123,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 640,
        "discount": 0,
        "final_amount": 640,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2022-123",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-03-05T10:30:00Z",
        "items": [
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 4,
                "unit_price": 160,
                "total_price": 640,
                "subtotal": 640,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 124,
        "order_id": 124,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 2060,
        "discount": 0,
        "final_amount": 2060,
        "payment_mode": "cash",
        "payment_status": "unpaid",
        "payment_id": null,
        "status": "pending",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-03-18T10:30:00Z",
        "items": [
            {
                "product_id": 5,
                "product_name": "Chlorpyriphos 20 EC (1L)",
                "category": "pesticide",
                "quantity": 1,
                "unit_price": 540,
                "total_price": 540,
                "subtotal": 540,
                "unit": "L",
                "brand": "Tata Rallis",
                "manufacturer": "Tata Rallis"
            },
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 2,
                "unit_price": 760,
                "total_price": 1520,
                "subtotal": 1520,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 125,
        "order_id": 125,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 840,
        "discount": 0,
        "final_amount": 840,
        "payment_mode": "credit",
        "payment_status": "pending",
        "payment_id": null,
        "status": "cancelled",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-05-05T10:30:00Z",
        "items": [
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 2,
                "unit_price": 420,
                "total_price": 840,
                "subtotal": 840,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 126,
        "order_id": 126,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 4350,
        "discount": 130,
        "final_amount": 4220,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2022-126",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-05-18T10:30:00Z",
        "items": [
            {
                "product_id": 7,
                "product_name": "Paddy BPT 5204 Seeds (25 kg)",
                "category": "seed",
                "quantity": 3,
                "unit_price": 1300,
                "total_price": 3900,
                "subtotal": 3900,
                "unit": "bag",
                "brand": "AP Seeds",
                "manufacturer": "AP Seeds"
            },
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 450,
                "total_price": 450,
                "subtotal": 450,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 127,
        "order_id": 127,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 3040,
        "discount": 91,
        "final_amount": 2949,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2022-127",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-06-05T10:30:00Z",
        "items": [
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 4,
                "unit_price": 760,
                "total_price": 3040,
                "subtotal": 3040,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 128,
        "order_id": 128,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 6250,
        "discount": 187,
        "final_amount": 6063,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2022-128",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-06-18T10:30:00Z",
        "items": [
            {
                "product_id": 9,
                "product_name": "Drip Irrigation Inline Pipe (100m)",
                "category": "equipment",
                "quantity": 1,
                "unit_price": 2200,
                "total_price": 2200,
                "subtotal": 2200,
                "unit": "bundle",
                "brand": "Jain Irrigation",
                "manufacturer": "Jain Irrigation"
            },
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 1350,
                "total_price": 4050,
                "subtotal": 4050,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 129,
        "order_id": 129,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 900,
        "discount": 0,
        "final_amount": 900,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2022-129",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-07-05T10:30:00Z",
        "items": [
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 450,
                "total_price": 900,
                "subtotal": 900,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 130,
        "order_id": 130,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 1121,
        "discount": 0,
        "final_amount": 1121,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2022-130",
        "status": "confirmed",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-07-18T10:30:00Z",
        "items": [
            {
                "product_id": 1,
                "product_name": "Urea 46-0-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 267,
                "total_price": 801,
                "subtotal": 801,
                "unit": "bag",
                "brand": "IFFCO",
                "manufacturer": "IFFCO"
            },
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 160,
                "total_price": 320,
                "subtotal": 320,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 131,
        "order_id": 131,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 5400,
        "discount": 162,
        "final_amount": 5238,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2022-131",
        "status": "dispatched",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-08-05T10:30:00Z",
        "items": [
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 4,
                "unit_price": 1350,
                "total_price": 5400,
                "subtotal": 5400,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 132,
        "order_id": 132,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 2120,
        "discount": 0,
        "final_amount": 2120,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2022-132",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-08-18T10:30:00Z",
        "items": [
            {
                "product_id": 3,
                "product_name": "MOP Potash (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 1700,
                "total_price": 1700,
                "subtotal": 1700,
                "unit": "bag",
                "brand": "IPL",
                "manufacturer": "IPL"
            },
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 1,
                "unit_price": 420,
                "total_price": 420,
                "subtotal": 420,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 133,
        "order_id": 133,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 320,
        "discount": 0,
        "final_amount": 320,
        "payment_mode": "upi",
        "payment_status": "unpaid",
        "payment_id": null,
        "status": "pending",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-09-05T10:30:00Z",
        "items": [
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 160,
                "total_price": 320,
                "subtotal": 320,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 134,
        "order_id": 134,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 3900,
        "discount": 117,
        "final_amount": 3783,
        "payment_mode": "credit",
        "payment_status": "pending",
        "payment_id": null,
        "status": "cancelled",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-09-18T10:30:00Z",
        "items": [
            {
                "product_id": 5,
                "product_name": "Chlorpyriphos 20 EC (1L)",
                "category": "pesticide",
                "quantity": 3,
                "unit_price": 540,
                "total_price": 1620,
                "subtotal": 1620,
                "unit": "L",
                "brand": "Tata Rallis",
                "manufacturer": "Tata Rallis"
            },
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 3,
                "unit_price": 760,
                "total_price": 2280,
                "subtotal": 2280,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 135,
        "order_id": 135,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 1680,
        "discount": 0,
        "final_amount": 1680,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2022-135",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-10-05T10:30:00Z",
        "items": [
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 4,
                "unit_price": 420,
                "total_price": 1680,
                "subtotal": 1680,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 136,
        "order_id": 136,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 2200,
        "discount": 0,
        "final_amount": 2200,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2022-136",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-10-18T10:30:00Z",
        "items": [
            {
                "product_id": 7,
                "product_name": "Paddy BPT 5204 Seeds (25 kg)",
                "category": "seed",
                "quantity": 1,
                "unit_price": 1300,
                "total_price": 1300,
                "subtotal": 1300,
                "unit": "bag",
                "brand": "AP Seeds",
                "manufacturer": "AP Seeds"
            },
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 450,
                "total_price": 900,
                "subtotal": 900,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 137,
        "order_id": 137,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 1520,
        "discount": 0,
        "final_amount": 1520,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2022-137",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-11-05T10:30:00Z",
        "items": [
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 2,
                "unit_price": 760,
                "total_price": 1520,
                "subtotal": 1520,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 138,
        "order_id": 138,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 7950,
        "discount": 238,
        "final_amount": 7712,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2022-138",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-11-18T10:30:00Z",
        "items": [
            {
                "product_id": 9,
                "product_name": "Drip Irrigation Inline Pipe (100m)",
                "category": "equipment",
                "quantity": 3,
                "unit_price": 2200,
                "total_price": 6600,
                "subtotal": 6600,
                "unit": "bundle",
                "brand": "Jain Irrigation",
                "manufacturer": "Jain Irrigation"
            },
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 1350,
                "total_price": 1350,
                "subtotal": 1350,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 139,
        "order_id": 139,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 1800,
        "discount": 0,
        "final_amount": 1800,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2022-139",
        "status": "confirmed",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-12-05T10:30:00Z",
        "items": [
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 4,
                "unit_price": 450,
                "total_price": 1800,
                "subtotal": 1800,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 140,
        "order_id": 140,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 747,
        "discount": 0,
        "final_amount": 747,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2022-140",
        "status": "dispatched",
        "order_notes": "Standard agricultural input supply - Season 2022",
        "created_at": "2022-12-18T10:30:00Z",
        "items": [
            {
                "product_id": 1,
                "product_name": "Urea 46-0-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 267,
                "total_price": 267,
                "subtotal": 267,
                "unit": "bag",
                "brand": "IFFCO",
                "manufacturer": "IFFCO"
            },
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 160,
                "total_price": 480,
                "subtotal": 480,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 141,
        "order_id": 141,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 2700,
        "discount": 0,
        "final_amount": 2700,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2023-141",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-01-05T10:30:00Z",
        "items": [
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 1350,
                "total_price": 2700,
                "subtotal": 2700,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 142,
        "order_id": 142,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 5940,
        "discount": 178,
        "final_amount": 5762,
        "payment_mode": "cash",
        "payment_status": "unpaid",
        "payment_id": null,
        "status": "pending",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-01-18T10:30:00Z",
        "items": [
            {
                "product_id": 3,
                "product_name": "MOP Potash (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 1700,
                "total_price": 5100,
                "subtotal": 5100,
                "unit": "bag",
                "brand": "IPL",
                "manufacturer": "IPL"
            },
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 2,
                "unit_price": 420,
                "total_price": 840,
                "subtotal": 840,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 143,
        "order_id": 143,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 640,
        "discount": 0,
        "final_amount": 640,
        "payment_mode": "credit",
        "payment_status": "pending",
        "payment_id": null,
        "status": "cancelled",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-03-05T10:30:00Z",
        "items": [
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 4,
                "unit_price": 160,
                "total_price": 640,
                "subtotal": 640,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 144,
        "order_id": 144,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 1300,
        "discount": 0,
        "final_amount": 1300,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2023-144",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-03-18T10:30:00Z",
        "items": [
            {
                "product_id": 5,
                "product_name": "Chlorpyriphos 20 EC (1L)",
                "category": "pesticide",
                "quantity": 1,
                "unit_price": 540,
                "total_price": 540,
                "subtotal": 540,
                "unit": "L",
                "brand": "Tata Rallis",
                "manufacturer": "Tata Rallis"
            },
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 1,
                "unit_price": 760,
                "total_price": 760,
                "subtotal": 760,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 145,
        "order_id": 145,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 840,
        "discount": 0,
        "final_amount": 840,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2023-145",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-05-05T10:30:00Z",
        "items": [
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 2,
                "unit_price": 420,
                "total_price": 840,
                "subtotal": 840,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 146,
        "order_id": 146,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 5250,
        "discount": 157,
        "final_amount": 5093,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2023-146",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-05-18T10:30:00Z",
        "items": [
            {
                "product_id": 7,
                "product_name": "Paddy BPT 5204 Seeds (25 kg)",
                "category": "seed",
                "quantity": 3,
                "unit_price": 1300,
                "total_price": 3900,
                "subtotal": 3900,
                "unit": "bag",
                "brand": "AP Seeds",
                "manufacturer": "AP Seeds"
            },
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 450,
                "total_price": 1350,
                "subtotal": 1350,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 147,
        "order_id": 147,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 3040,
        "discount": 91,
        "final_amount": 2949,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2023-147",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-06-05T10:30:00Z",
        "items": [
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 4,
                "unit_price": 760,
                "total_price": 3040,
                "subtotal": 3040,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 148,
        "order_id": 148,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 4900,
        "discount": 147,
        "final_amount": 4753,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2023-148",
        "status": "confirmed",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-06-18T10:30:00Z",
        "items": [
            {
                "product_id": 9,
                "product_name": "Drip Irrigation Inline Pipe (100m)",
                "category": "equipment",
                "quantity": 1,
                "unit_price": 2200,
                "total_price": 2200,
                "subtotal": 2200,
                "unit": "bundle",
                "brand": "Jain Irrigation",
                "manufacturer": "Jain Irrigation"
            },
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 1350,
                "total_price": 2700,
                "subtotal": 2700,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 149,
        "order_id": 149,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 900,
        "discount": 0,
        "final_amount": 900,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2023-149",
        "status": "dispatched",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-07-05T10:30:00Z",
        "items": [
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 450,
                "total_price": 900,
                "subtotal": 900,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 150,
        "order_id": 150,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 961,
        "discount": 0,
        "final_amount": 961,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2023-150",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-07-18T10:30:00Z",
        "items": [
            {
                "product_id": 1,
                "product_name": "Urea 46-0-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 267,
                "total_price": 801,
                "subtotal": 801,
                "unit": "bag",
                "brand": "IFFCO",
                "manufacturer": "IFFCO"
            },
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 160,
                "total_price": 160,
                "subtotal": 160,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 151,
        "order_id": 151,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 5400,
        "discount": 162,
        "final_amount": 5238,
        "payment_mode": "upi",
        "payment_status": "unpaid",
        "payment_id": null,
        "status": "pending",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-08-05T10:30:00Z",
        "items": [
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 4,
                "unit_price": 1350,
                "total_price": 5400,
                "subtotal": 5400,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 152,
        "order_id": 152,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 2960,
        "discount": 0,
        "final_amount": 2960,
        "payment_mode": "credit",
        "payment_status": "pending",
        "payment_id": null,
        "status": "cancelled",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-08-18T10:30:00Z",
        "items": [
            {
                "product_id": 3,
                "product_name": "MOP Potash (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 1700,
                "total_price": 1700,
                "subtotal": 1700,
                "unit": "bag",
                "brand": "IPL",
                "manufacturer": "IPL"
            },
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 3,
                "unit_price": 420,
                "total_price": 1260,
                "subtotal": 1260,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 153,
        "order_id": 153,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 320,
        "discount": 0,
        "final_amount": 320,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2023-153",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-09-05T10:30:00Z",
        "items": [
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 160,
                "total_price": 320,
                "subtotal": 320,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 154,
        "order_id": 154,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 3140,
        "discount": 94,
        "final_amount": 3046,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2023-154",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-09-18T10:30:00Z",
        "items": [
            {
                "product_id": 5,
                "product_name": "Chlorpyriphos 20 EC (1L)",
                "category": "pesticide",
                "quantity": 3,
                "unit_price": 540,
                "total_price": 1620,
                "subtotal": 1620,
                "unit": "L",
                "brand": "Tata Rallis",
                "manufacturer": "Tata Rallis"
            },
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 2,
                "unit_price": 760,
                "total_price": 1520,
                "subtotal": 1520,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 155,
        "order_id": 155,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 1680,
        "discount": 0,
        "final_amount": 1680,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2023-155",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-10-05T10:30:00Z",
        "items": [
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 4,
                "unit_price": 420,
                "total_price": 1680,
                "subtotal": 1680,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 156,
        "order_id": 156,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 1750,
        "discount": 0,
        "final_amount": 1750,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2023-156",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-10-18T10:30:00Z",
        "items": [
            {
                "product_id": 7,
                "product_name": "Paddy BPT 5204 Seeds (25 kg)",
                "category": "seed",
                "quantity": 1,
                "unit_price": 1300,
                "total_price": 1300,
                "subtotal": 1300,
                "unit": "bag",
                "brand": "AP Seeds",
                "manufacturer": "AP Seeds"
            },
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 450,
                "total_price": 450,
                "subtotal": 450,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 157,
        "order_id": 157,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 1520,
        "discount": 0,
        "final_amount": 1520,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2023-157",
        "status": "confirmed",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-11-05T10:30:00Z",
        "items": [
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 2,
                "unit_price": 760,
                "total_price": 1520,
                "subtotal": 1520,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 158,
        "order_id": 158,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 10650,
        "discount": 319,
        "final_amount": 10331,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2023-158",
        "status": "dispatched",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-11-18T10:30:00Z",
        "items": [
            {
                "product_id": 9,
                "product_name": "Drip Irrigation Inline Pipe (100m)",
                "category": "equipment",
                "quantity": 3,
                "unit_price": 2200,
                "total_price": 6600,
                "subtotal": 6600,
                "unit": "bundle",
                "brand": "Jain Irrigation",
                "manufacturer": "Jain Irrigation"
            },
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 1350,
                "total_price": 4050,
                "subtotal": 4050,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 159,
        "order_id": 159,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 1800,
        "discount": 0,
        "final_amount": 1800,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2023-159",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-12-05T10:30:00Z",
        "items": [
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 4,
                "unit_price": 450,
                "total_price": 1800,
                "subtotal": 1800,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 160,
        "order_id": 160,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 587,
        "discount": 0,
        "final_amount": 587,
        "payment_mode": "cash",
        "payment_status": "unpaid",
        "payment_id": null,
        "status": "pending",
        "order_notes": "Standard agricultural input supply - Season 2023",
        "created_at": "2023-12-18T10:30:00Z",
        "items": [
            {
                "product_id": 1,
                "product_name": "Urea 46-0-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 267,
                "total_price": 267,
                "subtotal": 267,
                "unit": "bag",
                "brand": "IFFCO",
                "manufacturer": "IFFCO"
            },
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 160,
                "total_price": 320,
                "subtotal": 320,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 161,
        "order_id": 161,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 2700,
        "discount": 0,
        "final_amount": 2700,
        "payment_mode": "credit",
        "payment_status": "pending",
        "payment_id": null,
        "status": "cancelled",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-01-05T10:30:00Z",
        "items": [
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 1350,
                "total_price": 2700,
                "subtotal": 2700,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 162,
        "order_id": 162,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 5520,
        "discount": 165,
        "final_amount": 5355,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2024-162",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-01-18T10:30:00Z",
        "items": [
            {
                "product_id": 3,
                "product_name": "MOP Potash (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 1700,
                "total_price": 5100,
                "subtotal": 5100,
                "unit": "bag",
                "brand": "IPL",
                "manufacturer": "IPL"
            },
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 1,
                "unit_price": 420,
                "total_price": 420,
                "subtotal": 420,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 163,
        "order_id": 163,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 640,
        "discount": 0,
        "final_amount": 640,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2024-163",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-03-05T10:30:00Z",
        "items": [
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 4,
                "unit_price": 160,
                "total_price": 640,
                "subtotal": 640,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 164,
        "order_id": 164,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 2820,
        "discount": 0,
        "final_amount": 2820,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2024-164",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-03-18T10:30:00Z",
        "items": [
            {
                "product_id": 5,
                "product_name": "Chlorpyriphos 20 EC (1L)",
                "category": "pesticide",
                "quantity": 1,
                "unit_price": 540,
                "total_price": 540,
                "subtotal": 540,
                "unit": "L",
                "brand": "Tata Rallis",
                "manufacturer": "Tata Rallis"
            },
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 3,
                "unit_price": 760,
                "total_price": 2280,
                "subtotal": 2280,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 165,
        "order_id": 165,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 840,
        "discount": 0,
        "final_amount": 840,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2024-165",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-05-05T10:30:00Z",
        "items": [
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 2,
                "unit_price": 420,
                "total_price": 840,
                "subtotal": 840,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 166,
        "order_id": 166,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 4800,
        "discount": 144,
        "final_amount": 4656,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2024-166",
        "status": "confirmed",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-05-18T10:30:00Z",
        "items": [
            {
                "product_id": 7,
                "product_name": "Paddy BPT 5204 Seeds (25 kg)",
                "category": "seed",
                "quantity": 3,
                "unit_price": 1300,
                "total_price": 3900,
                "subtotal": 3900,
                "unit": "bag",
                "brand": "AP Seeds",
                "manufacturer": "AP Seeds"
            },
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 450,
                "total_price": 900,
                "subtotal": 900,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 167,
        "order_id": 167,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 3040,
        "discount": 91,
        "final_amount": 2949,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2024-167",
        "status": "dispatched",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-06-05T10:30:00Z",
        "items": [
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 4,
                "unit_price": 760,
                "total_price": 3040,
                "subtotal": 3040,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 168,
        "order_id": 168,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 3550,
        "discount": 106,
        "final_amount": 3444,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2024-168",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-06-18T10:30:00Z",
        "items": [
            {
                "product_id": 9,
                "product_name": "Drip Irrigation Inline Pipe (100m)",
                "category": "equipment",
                "quantity": 1,
                "unit_price": 2200,
                "total_price": 2200,
                "subtotal": 2200,
                "unit": "bundle",
                "brand": "Jain Irrigation",
                "manufacturer": "Jain Irrigation"
            },
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 1350,
                "total_price": 1350,
                "subtotal": 1350,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 169,
        "order_id": 169,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 900,
        "discount": 0,
        "final_amount": 900,
        "payment_mode": "upi",
        "payment_status": "unpaid",
        "payment_id": null,
        "status": "pending",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-07-05T10:30:00Z",
        "items": [
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 450,
                "total_price": 900,
                "subtotal": 900,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 170,
        "order_id": 170,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 1281,
        "discount": 0,
        "final_amount": 1281,
        "payment_mode": "credit",
        "payment_status": "pending",
        "payment_id": null,
        "status": "cancelled",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-07-18T10:30:00Z",
        "items": [
            {
                "product_id": 1,
                "product_name": "Urea 46-0-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 267,
                "total_price": 801,
                "subtotal": 801,
                "unit": "bag",
                "brand": "IFFCO",
                "manufacturer": "IFFCO"
            },
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 160,
                "total_price": 480,
                "subtotal": 480,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 171,
        "order_id": 171,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 5400,
        "discount": 162,
        "final_amount": 5238,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2024-171",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-08-05T10:30:00Z",
        "items": [
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 4,
                "unit_price": 1350,
                "total_price": 5400,
                "subtotal": 5400,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 172,
        "order_id": 172,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 2540,
        "discount": 0,
        "final_amount": 2540,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2024-172",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-08-18T10:30:00Z",
        "items": [
            {
                "product_id": 3,
                "product_name": "MOP Potash (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 1700,
                "total_price": 1700,
                "subtotal": 1700,
                "unit": "bag",
                "brand": "IPL",
                "manufacturer": "IPL"
            },
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 2,
                "unit_price": 420,
                "total_price": 840,
                "subtotal": 840,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 173,
        "order_id": 173,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 320,
        "discount": 0,
        "final_amount": 320,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2024-173",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-09-05T10:30:00Z",
        "items": [
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 160,
                "total_price": 320,
                "subtotal": 320,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 174,
        "order_id": 174,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 2380,
        "discount": 0,
        "final_amount": 2380,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2024-174",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-09-18T10:30:00Z",
        "items": [
            {
                "product_id": 5,
                "product_name": "Chlorpyriphos 20 EC (1L)",
                "category": "pesticide",
                "quantity": 3,
                "unit_price": 540,
                "total_price": 1620,
                "subtotal": 1620,
                "unit": "L",
                "brand": "Tata Rallis",
                "manufacturer": "Tata Rallis"
            },
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 1,
                "unit_price": 760,
                "total_price": 760,
                "subtotal": 760,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 175,
        "order_id": 175,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 1680,
        "discount": 0,
        "final_amount": 1680,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2024-175",
        "status": "confirmed",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-10-05T10:30:00Z",
        "items": [
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 4,
                "unit_price": 420,
                "total_price": 1680,
                "subtotal": 1680,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 176,
        "order_id": 176,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 2650,
        "discount": 0,
        "final_amount": 2650,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2024-176",
        "status": "dispatched",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-10-18T10:30:00Z",
        "items": [
            {
                "product_id": 7,
                "product_name": "Paddy BPT 5204 Seeds (25 kg)",
                "category": "seed",
                "quantity": 1,
                "unit_price": 1300,
                "total_price": 1300,
                "subtotal": 1300,
                "unit": "bag",
                "brand": "AP Seeds",
                "manufacturer": "AP Seeds"
            },
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 450,
                "total_price": 1350,
                "subtotal": 1350,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 177,
        "order_id": 177,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 1520,
        "discount": 0,
        "final_amount": 1520,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2024-177",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-11-05T10:30:00Z",
        "items": [
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 2,
                "unit_price": 760,
                "total_price": 1520,
                "subtotal": 1520,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 178,
        "order_id": 178,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 9300,
        "discount": 279,
        "final_amount": 9021,
        "payment_mode": "cash",
        "payment_status": "unpaid",
        "payment_id": null,
        "status": "pending",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-11-18T10:30:00Z",
        "items": [
            {
                "product_id": 9,
                "product_name": "Drip Irrigation Inline Pipe (100m)",
                "category": "equipment",
                "quantity": 3,
                "unit_price": 2200,
                "total_price": 6600,
                "subtotal": 6600,
                "unit": "bundle",
                "brand": "Jain Irrigation",
                "manufacturer": "Jain Irrigation"
            },
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 1350,
                "total_price": 2700,
                "subtotal": 2700,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 179,
        "order_id": 179,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 1800,
        "discount": 0,
        "final_amount": 1800,
        "payment_mode": "credit",
        "payment_status": "pending",
        "payment_id": null,
        "status": "cancelled",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-12-05T10:30:00Z",
        "items": [
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 4,
                "unit_price": 450,
                "total_price": 1800,
                "subtotal": 1800,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 180,
        "order_id": 180,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 427,
        "discount": 0,
        "final_amount": 427,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2024-180",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2024",
        "created_at": "2024-12-18T10:30:00Z",
        "items": [
            {
                "product_id": 1,
                "product_name": "Urea 46-0-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 267,
                "total_price": 267,
                "subtotal": 267,
                "unit": "bag",
                "brand": "IFFCO",
                "manufacturer": "IFFCO"
            },
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 160,
                "total_price": 160,
                "subtotal": 160,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 181,
        "order_id": 181,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 2700,
        "discount": 0,
        "final_amount": 2700,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2025-181",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-01-05T10:30:00Z",
        "items": [
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 1350,
                "total_price": 2700,
                "subtotal": 2700,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 182,
        "order_id": 182,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 6360,
        "discount": 190,
        "final_amount": 6170,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2025-182",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-01-18T10:30:00Z",
        "items": [
            {
                "product_id": 3,
                "product_name": "MOP Potash (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 1700,
                "total_price": 5100,
                "subtotal": 5100,
                "unit": "bag",
                "brand": "IPL",
                "manufacturer": "IPL"
            },
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 3,
                "unit_price": 420,
                "total_price": 1260,
                "subtotal": 1260,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 183,
        "order_id": 183,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 640,
        "discount": 0,
        "final_amount": 640,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2025-183",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-03-05T10:30:00Z",
        "items": [
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 4,
                "unit_price": 160,
                "total_price": 640,
                "subtotal": 640,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 184,
        "order_id": 184,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 2060,
        "discount": 0,
        "final_amount": 2060,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2025-184",
        "status": "confirmed",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-03-18T10:30:00Z",
        "items": [
            {
                "product_id": 5,
                "product_name": "Chlorpyriphos 20 EC (1L)",
                "category": "pesticide",
                "quantity": 1,
                "unit_price": 540,
                "total_price": 540,
                "subtotal": 540,
                "unit": "L",
                "brand": "Tata Rallis",
                "manufacturer": "Tata Rallis"
            },
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 2,
                "unit_price": 760,
                "total_price": 1520,
                "subtotal": 1520,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 185,
        "order_id": 185,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 840,
        "discount": 0,
        "final_amount": 840,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2025-185",
        "status": "dispatched",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-05-05T10:30:00Z",
        "items": [
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 2,
                "unit_price": 420,
                "total_price": 840,
                "subtotal": 840,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 186,
        "order_id": 186,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 4350,
        "discount": 130,
        "final_amount": 4220,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2025-186",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-05-18T10:30:00Z",
        "items": [
            {
                "product_id": 7,
                "product_name": "Paddy BPT 5204 Seeds (25 kg)",
                "category": "seed",
                "quantity": 3,
                "unit_price": 1300,
                "total_price": 3900,
                "subtotal": 3900,
                "unit": "bag",
                "brand": "AP Seeds",
                "manufacturer": "AP Seeds"
            },
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 450,
                "total_price": 450,
                "subtotal": 450,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 187,
        "order_id": 187,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 3040,
        "discount": 91,
        "final_amount": 2949,
        "payment_mode": "upi",
        "payment_status": "unpaid",
        "payment_id": null,
        "status": "pending",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-06-05T10:30:00Z",
        "items": [
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 4,
                "unit_price": 760,
                "total_price": 3040,
                "subtotal": 3040,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 188,
        "order_id": 188,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 6250,
        "discount": 187,
        "final_amount": 6063,
        "payment_mode": "credit",
        "payment_status": "pending",
        "payment_id": null,
        "status": "cancelled",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-06-18T10:30:00Z",
        "items": [
            {
                "product_id": 9,
                "product_name": "Drip Irrigation Inline Pipe (100m)",
                "category": "equipment",
                "quantity": 1,
                "unit_price": 2200,
                "total_price": 2200,
                "subtotal": 2200,
                "unit": "bundle",
                "brand": "Jain Irrigation",
                "manufacturer": "Jain Irrigation"
            },
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 1350,
                "total_price": 4050,
                "subtotal": 4050,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 189,
        "order_id": 189,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 900,
        "discount": 0,
        "final_amount": 900,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2025-189",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-07-05T10:30:00Z",
        "items": [
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 450,
                "total_price": 900,
                "subtotal": 900,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 190,
        "order_id": 190,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 1121,
        "discount": 0,
        "final_amount": 1121,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2025-190",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-07-18T10:30:00Z",
        "items": [
            {
                "product_id": 1,
                "product_name": "Urea 46-0-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 267,
                "total_price": 801,
                "subtotal": 801,
                "unit": "bag",
                "brand": "IFFCO",
                "manufacturer": "IFFCO"
            },
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 160,
                "total_price": 320,
                "subtotal": 320,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 191,
        "order_id": 191,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 5400,
        "discount": 162,
        "final_amount": 5238,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2025-191",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-08-05T10:30:00Z",
        "items": [
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 4,
                "unit_price": 1350,
                "total_price": 5400,
                "subtotal": 5400,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 192,
        "order_id": 192,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 2120,
        "discount": 0,
        "final_amount": 2120,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2025-192",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-08-18T10:30:00Z",
        "items": [
            {
                "product_id": 3,
                "product_name": "MOP Potash (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 1700,
                "total_price": 1700,
                "subtotal": 1700,
                "unit": "bag",
                "brand": "IPL",
                "manufacturer": "IPL"
            },
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 1,
                "unit_price": 420,
                "total_price": 420,
                "subtotal": 420,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 193,
        "order_id": 193,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 320,
        "discount": 0,
        "final_amount": 320,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2025-193",
        "status": "confirmed",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-09-05T10:30:00Z",
        "items": [
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 160,
                "total_price": 320,
                "subtotal": 320,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 194,
        "order_id": 194,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 3900,
        "discount": 117,
        "final_amount": 3783,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2025-194",
        "status": "dispatched",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-09-18T10:30:00Z",
        "items": [
            {
                "product_id": 5,
                "product_name": "Chlorpyriphos 20 EC (1L)",
                "category": "pesticide",
                "quantity": 3,
                "unit_price": 540,
                "total_price": 1620,
                "subtotal": 1620,
                "unit": "L",
                "brand": "Tata Rallis",
                "manufacturer": "Tata Rallis"
            },
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 3,
                "unit_price": 760,
                "total_price": 2280,
                "subtotal": 2280,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 195,
        "order_id": 195,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 1680,
        "discount": 0,
        "final_amount": 1680,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2025-195",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-10-05T10:30:00Z",
        "items": [
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 4,
                "unit_price": 420,
                "total_price": 1680,
                "subtotal": 1680,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 196,
        "order_id": 196,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 2200,
        "discount": 0,
        "final_amount": 2200,
        "payment_mode": "cash",
        "payment_status": "unpaid",
        "payment_id": null,
        "status": "pending",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-10-18T10:30:00Z",
        "items": [
            {
                "product_id": 7,
                "product_name": "Paddy BPT 5204 Seeds (25 kg)",
                "category": "seed",
                "quantity": 1,
                "unit_price": 1300,
                "total_price": 1300,
                "subtotal": 1300,
                "unit": "bag",
                "brand": "AP Seeds",
                "manufacturer": "AP Seeds"
            },
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 450,
                "total_price": 900,
                "subtotal": 900,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 197,
        "order_id": 197,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 1520,
        "discount": 0,
        "final_amount": 1520,
        "payment_mode": "credit",
        "payment_status": "pending",
        "payment_id": null,
        "status": "cancelled",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-11-05T10:30:00Z",
        "items": [
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 2,
                "unit_price": 760,
                "total_price": 1520,
                "subtotal": 1520,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 198,
        "order_id": 198,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 7950,
        "discount": 238,
        "final_amount": 7712,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2025-198",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-11-18T10:30:00Z",
        "items": [
            {
                "product_id": 9,
                "product_name": "Drip Irrigation Inline Pipe (100m)",
                "category": "equipment",
                "quantity": 3,
                "unit_price": 2200,
                "total_price": 6600,
                "subtotal": 6600,
                "unit": "bundle",
                "brand": "Jain Irrigation",
                "manufacturer": "Jain Irrigation"
            },
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 1350,
                "total_price": 1350,
                "subtotal": 1350,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 199,
        "order_id": 199,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 1800,
        "discount": 0,
        "final_amount": 1800,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2025-199",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-12-05T10:30:00Z",
        "items": [
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 4,
                "unit_price": 450,
                "total_price": 1800,
                "subtotal": 1800,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 200,
        "order_id": 200,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 747,
        "discount": 0,
        "final_amount": 747,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2025-200",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2025",
        "created_at": "2025-12-18T10:30:00Z",
        "items": [
            {
                "product_id": 1,
                "product_name": "Urea 46-0-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 267,
                "total_price": 267,
                "subtotal": 267,
                "unit": "bag",
                "brand": "IFFCO",
                "manufacturer": "IFFCO"
            },
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 160,
                "total_price": 480,
                "subtotal": 480,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 201,
        "order_id": 201,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 2700,
        "discount": 0,
        "final_amount": 2700,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2026-201",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-01-05T10:30:00Z",
        "items": [
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 1350,
                "total_price": 2700,
                "subtotal": 2700,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 202,
        "order_id": 202,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 5940,
        "discount": 178,
        "final_amount": 5762,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2026-202",
        "status": "confirmed",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-01-18T10:30:00Z",
        "items": [
            {
                "product_id": 3,
                "product_name": "MOP Potash (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 1700,
                "total_price": 5100,
                "subtotal": 5100,
                "unit": "bag",
                "brand": "IPL",
                "manufacturer": "IPL"
            },
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 2,
                "unit_price": 420,
                "total_price": 840,
                "subtotal": 840,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 203,
        "order_id": 203,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 640,
        "discount": 0,
        "final_amount": 640,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2026-203",
        "status": "dispatched",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-03-05T10:30:00Z",
        "items": [
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 4,
                "unit_price": 160,
                "total_price": 640,
                "subtotal": 640,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 204,
        "order_id": 204,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 1300,
        "discount": 0,
        "final_amount": 1300,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2026-204",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-03-18T10:30:00Z",
        "items": [
            {
                "product_id": 5,
                "product_name": "Chlorpyriphos 20 EC (1L)",
                "category": "pesticide",
                "quantity": 1,
                "unit_price": 540,
                "total_price": 540,
                "subtotal": 540,
                "unit": "L",
                "brand": "Tata Rallis",
                "manufacturer": "Tata Rallis"
            },
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 1,
                "unit_price": 760,
                "total_price": 760,
                "subtotal": 760,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 205,
        "order_id": 205,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 840,
        "discount": 0,
        "final_amount": 840,
        "payment_mode": "upi",
        "payment_status": "unpaid",
        "payment_id": null,
        "status": "pending",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-05-05T10:30:00Z",
        "items": [
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 2,
                "unit_price": 420,
                "total_price": 840,
                "subtotal": 840,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 206,
        "order_id": 206,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 5250,
        "discount": 157,
        "final_amount": 5093,
        "payment_mode": "credit",
        "payment_status": "pending",
        "payment_id": null,
        "status": "cancelled",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-05-18T10:30:00Z",
        "items": [
            {
                "product_id": 7,
                "product_name": "Paddy BPT 5204 Seeds (25 kg)",
                "category": "seed",
                "quantity": 3,
                "unit_price": 1300,
                "total_price": 3900,
                "subtotal": 3900,
                "unit": "bag",
                "brand": "AP Seeds",
                "manufacturer": "AP Seeds"
            },
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 450,
                "total_price": 1350,
                "subtotal": 1350,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 207,
        "order_id": 207,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 3040,
        "discount": 91,
        "final_amount": 2949,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2026-207",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-06-05T10:30:00Z",
        "items": [
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 4,
                "unit_price": 760,
                "total_price": 3040,
                "subtotal": 3040,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 208,
        "order_id": 208,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 4900,
        "discount": 147,
        "final_amount": 4753,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2026-208",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-06-18T10:30:00Z",
        "items": [
            {
                "product_id": 9,
                "product_name": "Drip Irrigation Inline Pipe (100m)",
                "category": "equipment",
                "quantity": 1,
                "unit_price": 2200,
                "total_price": 2200,
                "subtotal": 2200,
                "unit": "bundle",
                "brand": "Jain Irrigation",
                "manufacturer": "Jain Irrigation"
            },
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 1350,
                "total_price": 2700,
                "subtotal": 2700,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 209,
        "order_id": 209,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 900,
        "discount": 0,
        "final_amount": 900,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2026-209",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-07-05T10:30:00Z",
        "items": [
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 450,
                "total_price": 900,
                "subtotal": 900,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    },
    {
        "id": 210,
        "order_id": 210,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 961,
        "discount": 0,
        "final_amount": 961,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2026-210",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-07-18T10:30:00Z",
        "items": [
            {
                "product_id": 1,
                "product_name": "Urea 46-0-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 3,
                "unit_price": 267,
                "total_price": 801,
                "subtotal": 801,
                "unit": "bag",
                "brand": "IFFCO",
                "manufacturer": "IFFCO"
            },
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 160,
                "total_price": 160,
                "subtotal": 160,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 211,
        "order_id": 211,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 18,
        "farmer_name": "K. Venkatesh",
        "farmer_phone": "9848011224",
        "total_amount": 5400,
        "discount": 162,
        "final_amount": 5238,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2026-211",
        "status": "confirmed",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-08-05T10:30:00Z",
        "items": [
            {
                "product_id": 2,
                "product_name": "DAP 18-46-0 (50 kg)",
                "category": "fertilizer",
                "quantity": 4,
                "unit_price": 1350,
                "total_price": 5400,
                "subtotal": 5400,
                "unit": "bag",
                "brand": "Coromandel",
                "manufacturer": "Coromandel"
            }
        ]
    },
    {
        "id": 212,
        "order_id": 212,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 19,
        "farmer_name": "M. Nageswara Rao",
        "farmer_phone": "9848011225",
        "total_amount": 2960,
        "discount": 0,
        "final_amount": 2960,
        "payment_mode": "credit",
        "payment_status": "paid",
        "payment_id": "PAY-2026-212",
        "status": "dispatched",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-08-18T10:30:00Z",
        "items": [
            {
                "product_id": 3,
                "product_name": "MOP Potash (50 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 1700,
                "total_price": 1700,
                "subtotal": 1700,
                "unit": "bag",
                "brand": "IPL",
                "manufacturer": "IPL"
            },
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 3,
                "unit_price": 420,
                "total_price": 1260,
                "subtotal": 1260,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 213,
        "order_id": 213,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 20,
        "farmer_name": "P. Anjaneyulu",
        "farmer_phone": "9848011226",
        "total_amount": 320,
        "discount": 0,
        "final_amount": 320,
        "payment_mode": "upi",
        "payment_status": "paid",
        "payment_id": "PAY-2026-213",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-09-05T10:30:00Z",
        "items": [
            {
                "product_id": 4,
                "product_name": "NPK 19-19-19 (1 kg)",
                "category": "fertilizer",
                "quantity": 2,
                "unit_price": 160,
                "total_price": 320,
                "subtotal": 320,
                "unit": "kg",
                "brand": "Mahadhan",
                "manufacturer": "Mahadhan"
            }
        ]
    },
    {
        "id": 214,
        "order_id": 214,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 21,
        "farmer_name": "S. Srinivasa Rao",
        "farmer_phone": "9848011227",
        "total_amount": 3140,
        "discount": 94,
        "final_amount": 3046,
        "payment_mode": "cash",
        "payment_status": "unpaid",
        "payment_id": null,
        "status": "pending",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-09-18T10:30:00Z",
        "items": [
            {
                "product_id": 5,
                "product_name": "Chlorpyriphos 20 EC (1L)",
                "category": "pesticide",
                "quantity": 3,
                "unit_price": 540,
                "total_price": 1620,
                "subtotal": 1620,
                "unit": "L",
                "brand": "Tata Rallis",
                "manufacturer": "Tata Rallis"
            },
            {
                "product_id": 8,
                "product_name": "Cotton Bunny BT Seeds (450g)",
                "category": "seed",
                "quantity": 2,
                "unit_price": 760,
                "total_price": 1520,
                "subtotal": 1520,
                "unit": "packet",
                "brand": "Mahyco",
                "manufacturer": "Mahyco"
            }
        ]
    },
    {
        "id": 215,
        "order_id": 215,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 22,
        "farmer_name": "B. Ramakrishna",
        "farmer_phone": "9848011228",
        "total_amount": 1680,
        "discount": 0,
        "final_amount": 1680,
        "payment_mode": "credit",
        "payment_status": "pending",
        "payment_id": null,
        "status": "cancelled",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-10-05T10:30:00Z",
        "items": [
            {
                "product_id": 6,
                "product_name": "Imidacloprid 17.8 SL (250ml)",
                "category": "pesticide",
                "quantity": 4,
                "unit_price": 420,
                "total_price": 1680,
                "subtotal": 1680,
                "unit": "bottle",
                "brand": "Bayer",
                "manufacturer": "Bayer"
            }
        ]
    },
    {
        "id": 216,
        "order_id": 216,
        "shop_id": 10,
        "shop_name": "Krishna Agro Center",
        "shop_contact": {
            "phone": "9848012345",
            "address": "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
            "owner_name": "Venkat Rao Potti",
            "latitude": 16.785,
            "longitude": 80.846
        },
        "farmer_id": 17,
        "farmer_name": "Ravi Kumar Reddy",
        "farmer_phone": "9876543210",
        "total_amount": 1750,
        "discount": 0,
        "final_amount": 1750,
        "payment_mode": "cash",
        "payment_status": "paid",
        "payment_id": "PAY-2026-216",
        "status": "completed",
        "order_notes": "Standard agricultural input supply - Season 2026",
        "created_at": "2026-10-18T10:30:00Z",
        "items": [
            {
                "product_id": 7,
                "product_name": "Paddy BPT 5204 Seeds (25 kg)",
                "category": "seed",
                "quantity": 1,
                "unit_price": 1300,
                "total_price": 1300,
                "subtotal": 1300,
                "unit": "bag",
                "brand": "AP Seeds",
                "manufacturer": "AP Seeds"
            },
            {
                "product_id": 10,
                "product_name": "Zinc Sulphate 33% (5 kg)",
                "category": "fertilizer",
                "quantity": 1,
                "unit_price": 450,
                "total_price": 450,
                "subtotal": 450,
                "unit": "bag",
                "brand": "Aries Agro",
                "manufacturer": "Aries Agro"
            }
        ]
    }
],
  salesTrend: [
    { date: "2026-10-18", sales: 24500, order_count: 5 },
    { date: "2026-10-19", sales: 31200, order_count: 7 },
    { date: "2026-10-20", sales: 28400, order_count: 6 },
    { date: "2026-10-21", sales: 42100, order_count: 9 },
    { date: "2026-10-22", sales: 38600, order_count: 8 },
    { date: "2026-10-23", sales: 45900, order_count: 11 },
    { date: "2026-10-24", sales: 18420, order_count: 4 }
  ],
  analytics: {
    today_sales: 18420,
    total_sales: 3840000,
    total_orders: 3240,
    total_customers: 1842,
    pending_orders: 3,
    low_stock_items: 2,
    revenue_growth: 14.5
  },
  revenueReport: {
    total_revenue: 3840000,
    total_cost: 3072000,
    gross_profit: 768000,
    margin_percent: 20.0
  },
  customers: [
    { id: 17, name: "Ravi Kumar Reddy", village: "Kondapally", total_purchases: 84500, orders_count: 14, last_order: "2026-10-24", credit_due: 4300 },
    { id: 201, name: "Suresh Naidu", village: "Gannavaram", total_purchases: 42000, orders_count: 8, last_order: "2026-10-23", credit_due: 0 },
    { id: 202, name: "Koteswara Rao", village: "Vuyyuru", total_purchases: 68000, orders_count: 11, last_order: "2026-10-20", credit_due: 12500 }
  ],
  channelBreakdown: [
    {
        "channel": "In-Store Counter",
        "revenue": 486000,
        "orders_count": 342,
        "percentage": 65.5
    },
    {
        "channel": "AgriFlow Mobile App",
        "revenue": 182000,
        "orders_count": 118,
        "percentage": 24.5
    },
    {
        "channel": "Wholesale Credit (Khata)",
        "revenue": 74000,
        "orders_count": 35,
        "percentage": 10.0
    }
],
  orderHealth: {
    "total_orders": 495,
    "fulfilled_on_time": 477,
    "delayed_orders": 12,
    "canceled_orders": 6,
    "fulfillment_rate_percent": 96.4,
    "average_dispatch_hours": 3.8,
    "return_rate_percent": 0.4
},
  topProducts: [
    {
        "product_id": 101,
        "name": "IFFCO Nano Urea (500ml Bottle)",
        "category": "Fertilizer",
        "units_sold": 420,
        "revenue": 94500,
        "margin_percent": 14.5
    },
    {
        "product_id": 102,
        "name": "Kaveri 55 Hybrid Maize Seed (4kg Bag)",
        "category": "Seeds",
        "units_sold": 185,
        "revenue": 144300,
        "margin_percent": 18.0
    },
    {
        "product_id": 103,
        "name": "Coromandel Gromor 14-35-14 (50kg Bag)",
        "category": "Fertilizer",
        "units_sold": 160,
        "revenue": 272000,
        "margin_percent": 9.2
    },
    {
        "product_id": 104,
        "name": "Bayer Belt Expert Flubendiamide (100ml)",
        "category": "Pesticide",
        "units_sold": 95,
        "revenue": 80750,
        "margin_percent": 22.0
    },
    {
        "product_id": 105,
        "name": "Neem Oil 10000 PPM Cold Pressed (1L)",
        "category": "Bio-Organic",
        "units_sold": 110,
        "revenue": 49500,
        "margin_percent": 25.0
    }
]
};

export const manufacturerDemoData = {
  profile: {
    id: 18,
    mill_name: "Sri Venkateswara Rice & Cotton Mill",
    owner_name: "Prasad Babu Reddy",
    father_name: "Venkata Narayana Reddy",
    license_no: "AP/MILL/2018/00892",
    license_number: "AP/MILL/2018/00892",
    gst: "37BBBPV5678D1Z2",
    capacity: "120 tons/day",
    location: "Nuzividu Industrial Estate, Krishna Dist., AP",
    district: "Krishna",
    state: "Andhra Pradesh",
    pincode: "521111",
    established: 2017,
    employees: 48,
    certifications: ["FSSAI", "ISO 9001:2015", "APEDA"],
  },
  stats: {
    total_procurement_tons: 4980,
    milling_capacity_tpd: 120,
    active_batches: 4,
    finished_goods_value: 17580000,
    monthly_sales: 3240000,
    efficiency_ratio: 68.5
  },
  salesTrend: [
    { date: "2026-10-18", sales: 460000 },
    { date: "2026-10-19", sales: 720000 },
    { date: "2026-10-20", sales: 704000 },
    { date: "2026-10-21", sales: 880000 },
    { date: "2026-10-22", sales: 460000 },
    { date: "2026-10-23", sales: 1250000 },
    { date: "2026-10-24", sales: 940000 }
  ],
  purchases: [
    { id: 1, po_number: "PO-2026-1021", date: "2026-10-20", supplier: "Farmer Pool - Nuzividu", commodity: "Paddy BPT-5204", quantity: 80, unit: "tons", rate: 2420, total_amount: 1936000, status: "received" },
    { id: 2, po_number: "PO-2026-1022", date: "2026-10-18", supplier: "APMC Vijayawada", commodity: "Raw Cotton", quantity: 25, unit: "tons", rate: 6850, total_amount: 1712500, status: "in_transit" },
    { id: 3, po_number: "PO-2026-1023", date: "2026-10-15", supplier: "Ravi Kumar Reddy", commodity: "Paddy BPT-5204", quantity: 20, unit: "tons", rate: 2420, total_amount: 484000, status: "received" },
  ],
  sales: [
    {
        "id": 1,
        "manufacturer_id": 1,
        "invoice_id": "INV-2026-0891",
        "invoice_no": "INV-2026-0891",
        "buyer_id": 201,
        "buyer_name": "Reliance Retail Ltd (Vijayawada Hub)",
        "buyer_type": "retailer",
        "buyer_contact": {
            "name": "Anand Verma (Procurement Lead)",
            "phone": "9848011223",
            "email": "procurement.ap@relianceretail.com",
            "address": "Plot 14, Auto Nagar Industrial Area, Vijayawada"
        },
        "product_id": 1,
        "product_name": "Premium BPT-5204 Sona Masoori Rice (25kg Bag)",
        "quantity": 600,
        "unit": "bags",
        "selling_price": 1350,
        "rate": 1350,
        "discount": 15000,
        "total_amount": 795000,
        "payment_mode": "Bank RTGS",
        "delivery_status": "delivered",
        "status": "delivered",
        "date": "2026-10-24"
    },
    {
        "id": 2,
        "manufacturer_id": 1,
        "invoice_id": "INV-2026-0892",
        "invoice_no": "INV-2026-0892",
        "buyer_id": 202,
        "buyer_name": "D-Mart Wholesale (Avenue Supermarts Guntur)",
        "buyer_type": "wholesaler",
        "buyer_contact": {
            "name": "Suresh Chandra",
            "phone": "9848033445",
            "email": "guntur.proc@dmartindia.com",
            "address": "NH-16 Bypass, Guntur AP"
        },
        "product_id": 1,
        "product_name": "Premium BPT-5204 Sona Masoori Rice (25kg Bag)",
        "quantity": 800,
        "unit": "bags",
        "selling_price": 1320,
        "rate": 1320,
        "discount": 20000,
        "total_amount": 1036000,
        "payment_mode": "NEFT Transfer",
        "delivery_status": "delivered",
        "status": "delivered",
        "date": "2026-10-22"
    },
    {
        "id": 3,
        "manufacturer_id": 1,
        "invoice_id": "INV-2026-0893",
        "invoice_no": "INV-2026-0893",
        "buyer_id": 203,
        "buyer_name": "Annapurna Agro Supermarket Chain",
        "buyer_type": "retailer",
        "buyer_contact": {
            "name": "M. Satyanarayana",
            "phone": "9848055667",
            "email": "purchase@annapurnaagro.in",
            "address": "Eluru Road, Governorpet, Vijayawada"
        },
        "product_id": 2,
        "product_name": "Kaveri Cattle Feed Pellets (50kg Bag)",
        "quantity": 400,
        "unit": "bags",
        "selling_price": 1180,
        "rate": 1180,
        "discount": 8000,
        "total_amount": 464000,
        "payment_mode": "UPI / Bank Transfer",
        "delivery_status": "dispatched",
        "status": "dispatched",
        "date": "2026-10-21"
    },
    {
        "id": 4,
        "manufacturer_id": 1,
        "invoice_id": "INV-2026-0894",
        "invoice_no": "INV-2026-0894",
        "buyer_id": 204,
        "buyer_name": "Rayalaseema Cotton Spinners Consortium",
        "buyer_type": "distributor",
        "buyer_contact": {
            "name": "K. Venugopal",
            "phone": "9848077889",
            "email": "procure@rayalaseemaspinning.com",
            "address": "Industrial Growth Centre, Tadipatri"
        },
        "product_id": 3,
        "product_name": "Ginned Cotton Lint Bales (170kg Bale)",
        "quantity": 60,
        "unit": "bales",
        "selling_price": 14200,
        "rate": 14200,
        "discount": 12000,
        "total_amount": 840000,
        "payment_mode": "Bank RTGS",
        "delivery_status": "delivered",
        "status": "delivered",
        "date": "2026-10-19"
    },
    {
        "id": 5,
        "manufacturer_id": 1,
        "invoice_id": "INV-2026-0895",
        "invoice_no": "INV-2026-0895",
        "buyer_id": 205,
        "buyer_name": "Heritage Foods Agro Division",
        "buyer_type": "distributor",
        "buyer_contact": {
            "name": "P. Ramesh Naidu",
            "phone": "9848099001",
            "email": "dairyfeed@heritagefoods.in",
            "address": "Kasipentla Road, Chandragiri, Tirupati"
        },
        "product_id": 2,
        "product_name": "De-oiled Rice Bran Meal (50kg Bag)",
        "quantity": 350,
        "unit": "bags",
        "selling_price": 950,
        "rate": 950,
        "discount": 5000,
        "total_amount": 327500,
        "payment_mode": "Bank Transfer",
        "delivery_status": "pending",
        "status": "pending",
        "date": "2026-10-25"
    }
],
  byProducts: [
    {
        "id": 1,
        "manufacturer_id": 1,
        "by_product_name": "De-Oiled Rice Bran",
        "category": "feed",
        "quantity_available": 120.5,
        "unit": "quintals",
        "rate_per_unit": 2850,
        "storage_location": "Silo B-2 (Feed Section)",
        "status": "available",
        "created_at": "2026-10-20"
    },
    {
        "id": 2,
        "manufacturer_id": 1,
        "by_product_name": "Broken Rice (Kani / Grits)",
        "category": "food_grade",
        "quantity_available": 45.0,
        "unit": "quintals",
        "rate_per_unit": 2100,
        "storage_location": "Godown 1, Bay 4",
        "status": "available",
        "created_at": "2026-10-21"
    },
    {
        "id": 3,
        "manufacturer_id": 1,
        "by_product_name": "Rice Husk (Boiler Biomass)",
        "category": "biomass",
        "quantity_available": 310.0,
        "unit": "quintals",
        "rate_per_unit": 420,
        "storage_location": "Open Yard C",
        "status": "available",
        "created_at": "2026-10-22"
    },
    {
        "id": 4,
        "manufacturer_id": 1,
        "by_product_name": "Cottonseed Meal Cake",
        "category": "feed",
        "quantity_available": 85.0,
        "unit": "quintals",
        "rate_per_unit": 3350,
        "storage_location": "Gin Shed Shed-3",
        "status": "available",
        "created_at": "2026-10-19"
    }
],
  loadPools: [
    {
        "id": 1,
        "mill_id": 1,
        "route_name": "Nuzividu Agri Cluster -> Kondapally Mill",
        "commodity": "Paddy (BPT-5204)",
        "capacity_quintals": 120.0,
        "pooled_quintals": 95.0,
        "target_date": "2026-10-28",
        "status": "active",
        "pickup_points": [
            "Vissannapeta Mandi",
            "Nuzividu Market Yard",
            "Musunuru Village Point"
        ],
        "cost_per_quintal": 45,
        "joined_farmers": [
            {
                "farmer_id": 17,
                "farmer_name": "Ramesh Kumar",
                "quantity": 30.0,
                "status": "confirmed"
            },
            {
                "farmer_id": 24,
                "farmer_name": "K. Venkateswara Rao",
                "quantity": 40.0,
                "status": "confirmed"
            },
            {
                "farmer_id": 31,
                "farmer_name": "M. Krishna Murthy",
                "quantity": 25.0,
                "status": "confirmed"
            }
        ]
    },
    {
        "id": 2,
        "mill_id": 1,
        "route_name": "Mylavaram -> Sri Venkateswara Ginning Yard",
        "commodity": "Cotton (Raw Kapas)",
        "capacity_quintals": 80.0,
        "pooled_quintals": 80.0,
        "target_date": "2026-10-26",
        "status": "ready_for_dispatch",
        "pickup_points": [
            "Mylavaram Cross",
            "Ibrahimpatnam Feeder"
        ],
        "cost_per_quintal": 65,
        "joined_farmers": [
            {
                "farmer_id": 17,
                "farmer_name": "Ramesh Kumar",
                "quantity": 25.0,
                "status": "confirmed"
            },
            {
                "farmer_id": 42,
                "farmer_name": "S. Appa Rao",
                "quantity": 55.0,
                "status": "confirmed"
            }
        ]
    }
],
  weighmentSlips: [
    {
        "id": 1,
        "purchase_id": 1,
        "slip_number": "WS-2026-1044",
        "date": "2026-10-20T10:30:00Z",
        "supplier_name": "Farmer Pool - Nuzividu (Ramesh Kumar & Group)",
        "commodity": "Paddy BPT-5204",
        "vehicle_number": "AP 16 TX 4421",
        "driver_name": "K. Srinivas",
        "gross_weight_kg": 24800,
        "tare_weight_kg": 8800,
        "net_weight_kg": 16000,
        "moisture_percent": 14.2,
        "moisture_deduction_kg": 32,
        "foreign_matter_deduction_kg": 40,
        "final_billable_quintals": 159.28,
        "rate_per_quintal": 2420,
        "total_payable": 385457,
        "weighbridge_operator": "G. Mallikarjun (Weigh Scale #1)"
    },
    {
        "id": 2,
        "purchase_id": 2,
        "slip_number": "WS-2026-1045",
        "date": "2026-10-18T14:15:00Z",
        "supplier_name": "APMC Vijayawada / Nuzividu Farmers",
        "commodity": "Raw Cotton (Bunny BT)",
        "vehicle_number": "AP 39 V 8820",
        "driver_name": "P. Ramana",
        "gross_weight_kg": 14650,
        "tare_weight_kg": 7150,
        "net_weight_kg": 7500,
        "moisture_percent": 8.0,
        "moisture_deduction_kg": 0,
        "foreign_matter_deduction_kg": 30,
        "final_billable_quintals": 74.7,
        "rate_per_quintal": 7100,
        "total_payable": 530370,
        "weighbridge_operator": "G. Mallikarjun (Weigh Scale #1)"
    }
],
  inventory: {
    raw_materials: [
      { item: "Paddy (BPT-5204)", quantity: 420, unit: "tons", value: 10164000 },
      { item: "Raw Cotton", quantity: 85, unit: "tons", value: 5822500 },
      { item: "Packaging Material", quantity: 12000, unit: "bags", value: 480000 },
    ],
    finished_goods: [
      { item: "Boiled Rice (25kg bag)", quantity: 8400, unit: "bags", value: 7728000 },
      { item: "Raw Rice (25kg bag)", quantity: 3200, unit: "bags", value: 2816000 },
      { item: "Cotton Lint (Grade A)", quantity: 48, unit: "tons", value: 6624000 },
    ],
  },
  production: {
    current_batch: { id: "BT-2026-108", commodity: "Paddy", input_tons: 120, expected_output_tons: 82.2, status: "running", start_time: "2026-10-24T06:00:00Z" },
    efficiency: { milling_ratio: 68.5, rejection_rate: 1.2, energy_per_ton: 42 },
  },
  intelligence: {
    demand_forecast: [
      { product: "Boiled Rice", next_month_tons: 420, confidence: 87, trend: "up" },
      { product: "Raw Rice", next_month_tons: 310, confidence: 82, trend: "stable" },
    ],
    price_intelligence: [
      { commodity: "Paddy", recommended_buy_price: 2420, current_market: 2450, suggestion: "Procure directly from Nuzividu farmer cluster before November mandi peak." },
      { commodity: "Cotton", recommended_buy_price: 6800, current_market: 6850, suggestion: "Steady ginning margin at ₹6,850/qtl." },
    ],
  },
  accounting: {
    total_revenue: 28500000,
    total_expenses: 22800000,
    net_profit: 5700000,
    receivables: 3450000,
    payables: 2180000
  }
};

export const customerDemoData = {
  profile: {
    id: 19,
    full_name: "Priya Sharma",
    father_name: "Ramesh Sharma",
    email: "priya.sharma@gmail.com",
    phone_number: "9900112233",
    house_no: "Flat 402",
    street: "Green Valley Apartments, KPHB Colony",
    village: "Kukatpally",
    mandal: "Kukatpally",
    district: "Hyderabad",
    state: "Telangana",
    country: "India",
    pincode: "500085",
    loyalty_points: 2840,
    saved_addresses: [
      { id: 1, label: "Home", address: "Flat 402, Green Valley Apartments, KPHB Colony, Hyderabad 500085", is_default: true }
    ]
  },
  orders: [
    {
      id: 101,
      total_amount: 1450,
      status: "delivered",
      created_at: "2026-10-18T14:30:00Z",
      items: [
        { product_id: 1, product_name: "BPT-5204 Samba Masuri Rice (25kg)", quantity: 1, unit_price: 1250, subtotal: 1250, image_url: "/placeholder.png" },
        { product_id: 3, product_name: "Organic Turmeric Powder (500g)", quantity: 1, unit_price: 200, subtotal: 200, image_url: "/placeholder.png" }
      ]
    },
    {
      id: 102,
      total_amount: 980,
      status: "shipped",
      created_at: "2026-10-22T10:15:00Z",
      items: [
        { product_id: 2, product_name: "Cold-Pressed Groundnut Oil (5L)", quantity: 1, unit_price: 980, subtotal: 980, image_url: "/placeholder.png" }
      ]
    }
  ],
  cart: [
    { id: 1, product_id: 1, product_name: "BPT-5204 Samba Masuri Rice (25kg)", quantity: 1, unit_price: 1250, total_price: 1250 },
    { id: 2, product_id: 3, product_name: "Organic Turmeric Powder (500g)", quantity: 2, unit_price: 200, total_price: 400 }
  ],
  smartBuying: {
    price_alerts: [
      { product: "Samba Masuri Rice", current_price: 1250, target_price: 1180, notification_active: true },
      { product: "Cold-Pressed Groundnut Oil", current_price: 980, target_price: 920, notification_active: true }
    ],
    savings_this_year: 12600,
    verified_farm_sources: 18
  },
  marketplace: [
    { id: 1, name: "BPT-5204 Samba Masuri Rice (25kg)", category: "grains", price: 1250, unit: "bag", stock: 150, rating: 4.9, farm_source: "Kondapally Farmers Pool (Krishna AP)", verified: true, image_url: "/placeholder.png" },
    { id: 2, name: "Cold-Pressed Pure Groundnut Oil (5L)", category: "processed", price: 980, unit: "tin", stock: 85, rating: 4.8, farm_source: "Sri Venkateswara Oil Mill", verified: true, image_url: "/placeholder.png" },
    { id: 3, name: "Organic Farm Turmeric Powder (500g)", category: "organic", price: 200, unit: "packet", stock: 320, rating: 4.9, farm_source: "Nizamabad Organic Cluster", verified: true, image_url: "/placeholder.png" },
    { id: 4, name: "Farm Fresh Sweet Corn (Pack of 6)", category: "fresh", price: 120, unit: "pack", stock: 60, rating: 4.7, farm_source: "Ravi Kumar Reddy Fields", verified: true, image_url: "/placeholder.png" }
  ]
};

export function getDemoDataByRole(role: DemoRole) {
  switch (role) {
    case "farmer": return farmerDemoData;
    case "shop": return shopDemoData;
    case "manufacturer": return manufacturerDemoData;
    case "customer": return customerDemoData;
    default: return null;
  }
}

export function resolveDemoApiResponse(url: string, method: string = "get"): any {
  const cleanUrl = url.split("?")[0].toLowerCase().trim();

  // Auth demo endpoints
  if (cleanUrl.includes("/auth/demo-login")) {
    return {
      access_token: "demo-token-active",
      token_type: "bearer",
      role: "farmer",
      id: 17,
      full_name: "Ravi Kumar Reddy",
    };
  }

  // Farmer endpoints
  if (cleanUrl.includes("/farmer/profile") || cleanUrl === "/farmer/profile/") {
    return farmerDemoData.profile;
  }
  if (cleanUrl.includes("/farmer/land-records")) {
    return farmerDemoData.profile.land_records;
  }
  // Single crop and crop sub-resources
  const cropIdMatch = cleanUrl.match(/(?:\/farmer)?\/crops\/(\d+)(?:\/(expenses|harvests|sales))?/);
  if (cropIdMatch) {
    const cropId = parseInt(cropIdMatch[1], 10);
    const subResource = cropIdMatch[2];
    const crop = farmerDemoData.crops.find((c: any) => c.id === cropId) || farmerDemoData.crops[0];

    // Sub-resource: Expenses
    if (subResource === "expenses") {
      if (method.toLowerCase() === "post") {
        return {
          id: Date.now(),
          crop_id: cropId,
          category: "Input",
          type: "Fertilizer / Seed Application",
          quantity: 1,
          unit: "unit",
          unit_cost: 1500,
          total_cost: 1500,
          date: new Date().toISOString(),
          payment_mode: "Cash",
          status: "completed"
        };
      }
      return (crop as any).expenses || [];
    }

    // Sub-resource: Harvests
    if (subResource === "harvests") {
      if (method.toLowerCase() === "post") {
        return {
          id: Date.now(),
          crop_id: cropId,
          date: new Date().toISOString(),
          stage: "New Harvest",
          quantity: 25,
          unit: "Quintal",
          unit_size: 50,
          quality: "Grade A",
          selling_price_per_unit: 2400,
          total_revenue: 60000,
          status: "Stored"
        };
      }
      return (crop as any).harvests || [];
    }

    // Sub-resource: Sales (Sold to buyers)
    if (subResource === "sales") {
      if (method.toLowerCase() === "post") {
        return {
          id: Date.now(),
          crop_id: cropId,
          date: new Date().toISOString(),
          buyer_type: "Mill",
          buyer_name: "Sri Venkateswara Rice & Cotton Mill",
          buyer_id: "MILL-AP-01",
          quantity_quintals: 25,
          total_bags: 50,
          bag_size: 50,
          price_per_quintal: 2400,
          total_revenue: 60000,
          payment_mode: "Bank NEFT",
          notes: "Fresh mandi sale listing confirmed",
          status: "sold"
        };
      }
      return (crop as any).sales || [];
    }

    return crop;
  }

  // Handle direct crop sales deletion
  if (cleanUrl.includes("/farmer/crops/sales/") && method.toLowerCase() === "delete") {
    return { success: true, message: "Sale listing removed successfully" };
  }
  if (cleanUrl.includes("/farmer/crops/harvests/") && method.toLowerCase() === "delete") {
    return { success: true, message: "Harvest record removed successfully" };
  }
  if (cleanUrl.includes("/farmer/crops/expenses/") && method.toLowerCase() === "delete") {
    return { success: true, message: "Expense record removed successfully" };
  }
  
  if (cleanUrl.includes("/farmer/expenses") || cleanUrl.includes("/analytics/expenses")) {
    const allExp: any[] = [];
    farmerDemoData.crops.forEach((c: any) => {
      if (c.expenses) {
        c.expenses.forEach((e: any) => {
          allExp.push({ ...e, crop_name: c.name, crop_id: c.id });
        });
      }
    });
    return allExp;
  }

  // Farmer analytics & yield trends across 5 years
  if (cleanUrl.includes("/analytics/farmer/overview") || cleanUrl.includes("/analytics/farmer/yield-trend")) {
    return {
      total_area: farmerDemoData.profile.total_area,
      active_crops_count: farmerDemoData.crops.filter((c: any) => c.status === "Growing").length,
      historical_crops_count: farmerDemoData.crops.length,
      total_5year_turnover: farmerDemoData.crops.reduce((s: number, c: any) => s + (c.total_revenue || 0), 0),
      total_5year_expenses: farmerDemoData.crops.reduce((s: number, c: any) => s + (c.total_expenses || 0), 0),
      net_profit: farmerDemoData.crops.reduce((s: number, c: any) => s + (c.net_profit || 0), 0),
      yield_history: farmerDemoData.crops.map((c: any) => ({
        crop_name: c.name,
        season: c.season,
        yield_quintals: c.actual_yield || 0,
        revenue: c.total_revenue || 0,
        cost: c.total_expenses || 0
      }))
    };
  }

  // Market trends & general recommendations
  if (cleanUrl.includes("/analytics/market-trends")) {
    return [
      { commodity: "Paddy (BPT-5204)", current_price: 2320, msp: 2183, trend: "up", change_percent: 6.2 },
      { commodity: "Cotton (Bunny BT)", current_price: 7150, msp: 7020, trend: "up", change_percent: 1.8 },
      { commodity: "Maize (Hybrid)", current_price: 1950, msp: 2090, trend: "stable", change_percent: -0.5 },
      { commodity: "Wheat (Sharbati)", current_price: 2450, msp: 2275, trend: "up", change_percent: 7.6 },
      { commodity: "Tomato", current_price: 1800, msp: 0, trend: "volatile", change_percent: 12.0 }
    ];
  }
  if (cleanUrl.includes("/analytics/recommendations")) {
    return farmerDemoData.recommendations.crops;
  }

  // Soil Health Cards & Profile
  if (cleanUrl.includes("/soil-profile") || cleanUrl.includes("/soil-health")) {
    return [
      {
        id: 1,
        sample_code: "SHC-2025-AP01",
        test_date: "2025-05-14",
        plot_name: "Survey 142/1A (Main Field)",
        ph: 7.2,
        ec: 0.42,
        organic_carbon_percent: 0.68,
        nitrogen_kg_ha: 265,
        phosphorus_kg_ha: 24,
        potassium_kg_ha: 310,
        zinc_ppm: 0.72,
        iron_ppm: 5.4,
        fertility_rating: "Medium-High",
        recommendations: "Apply 25 kg Zinc Sulphate per acre. Reduce chemical nitrogen by 15% due to pulse rotation."
      },
      {
        id: 2,
        sample_code: "SHC-2023-AP02",
        test_date: "2023-05-18",
        plot_name: "Survey 142/2B (South Field)",
        ph: 7.0,
        ec: 0.38,
        organic_carbon_percent: 0.55,
        nitrogen_kg_ha: 240,
        phosphorus_kg_ha: 20,
        potassium_kg_ha: 290,
        zinc_ppm: 0.65,
        iron_ppm: 4.8,
        fertility_rating: "Medium",
        recommendations: "Add farmyard manure 5 tonnes/acre to improve organic carbon."
      }
    ];
  }

  // Emergency SOS Directory
  if (cleanUrl.includes("/emergency-contacts") || cleanUrl.includes("/emergency")) {
    return [
      { id: 1, name: "Kisan Call Center (National Toll Free)", role: "Agronomy Advisory", phone: "1551", available: "24x7" },
      { id: 2, name: "PMFBY Crop Loss Intimation", role: "Insurance Nodal Helpline", phone: "14447", available: "Within 72 hrs of disaster" },
      { id: 3, name: "Rural Electricity Board (Transformer breakdown)", role: "Power & Pump repair", phone: "1912", available: "24x7" },
      { id: 4, name: "Dr. K. Ramana Rao", role: "KVK Senior Agronomist (Krishna)", phone: "9440112233", available: "9 AM - 6 PM" },
      { id: 5, name: "Nuzividu Canal Water Inspector", role: "Irrigation Supply Officer", phone: "9849023456", available: "Emergency" }
    ];
  }

  if (cleanUrl.includes("/crops") || cleanUrl.includes("/crops/")) {
    return farmerDemoData.crops;
  }
  if (cleanUrl.includes("/weather/forecast") || cleanUrl.includes("/weather/soil-forecast")) {
    return farmerDemoData.weather;
  }
  if (cleanUrl.includes("/weather")) {
    return farmerDemoData.weather;
  }
  if (cleanUrl.includes("/news")) {
    return farmerDemoData.news;
  }
  if (cleanUrl.includes("/market/prices") || cleanUrl.includes("/market-prices") || cleanUrl.includes("/prices")) {
    return farmerDemoData.marketPrices;
  }

  // Orders endpoints
  if ((cleanUrl === "/orders" || cleanUrl === "/orders/") && method.toLowerCase() === "post") {
    const newId = Date.now();
    const newOrder: any = {
      id: newId,
      order_id: newId,
      shop_id: 1,
      shop_name: "Krishna Agro Center",
      shop_contact: {
        phone: "9848012345",
        address: "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
        owner_name: "Venkat Rao Potti",
        latitude: 16.785,
        longitude: 80.846
      },
      farmer_id: 17,
      farmer_name: "Ravi Kumar Reddy",
      farmer_phone: "9876543210",
      total_amount: 2700,
      discount: 0,
      final_amount: 2700,
      payment_mode: "cash",
      payment_status: "pending",
      status: "pending",
      order_notes: "Farmer fertilizer order",
      created_at: new Date().toISOString(),
      items: [
        { product_id: 2, product_name: "DAP 18-46-0 (50 kg)", category: "fertilizer", quantity: 2, unit_price: 1350, total_price: 2700, subtotal: 2700, unit: "bag", brand: "Coromandel", manufacturer: "Coromandel" }
      ]
    };
    (farmerDemoData.orders as any[]).unshift(newOrder);
    (shopDemoData.orders as any[]).unshift(newOrder);
    return newOrder;
  }
  if (cleanUrl.includes("/orders/") && cleanUrl.includes("/status")) {
    const parts = cleanUrl.split("/");
    const idIdx = parts.indexOf("orders") + 1;
    const targetId = parseInt(parts[idIdx], 10);
    const order = (farmerDemoData.orders as any[]).find(o => o.id === targetId || o.order_id === targetId);
    if (order) {
      order.status = "confirmed";
    }
    const shopOrder = (shopDemoData.orders as any[]).find(o => o.id === targetId || o.order_id === targetId);
    if (shopOrder) {
      shopOrder.status = "confirmed";
    }
    return { message: "Status updated successfully" };
  }
  if (cleanUrl.includes("/orders/my-orders") || (cleanUrl.includes("/orders") && !cleanUrl.includes("/shop") && !cleanUrl.includes("/customer") && !cleanUrl.includes("/manufacturer"))) {
    return farmerDemoData.orders;
  }

  // Payment endpoints (Razorpay test integration)
  if (cleanUrl.includes("/payments/config")) {
    return {
      key_id: "rzp_test_Tmtg2ZhDpl58fH",
      is_mock: false,
      is_test_mode: true,
      currency: "INR",
    };
  }
  if (cleanUrl.includes("/payments/create-order")) {
    return {
      id: Date.now(),
      user_id: 17,
      razorpay_order_id: `order_rzp_${Date.now()}`,
      amount: 2700,
      currency: "INR",
      status: "created",
      payment_for: "shop_order",
      reference_id: 101,
      shipping_address: null,
      notes: "Farmer Payment",
      created_at: new Date().toISOString(),
      paid_at: null,
    };
  }
  if (cleanUrl.includes("/payments/verify")) {
    const pendingOrder = farmerDemoData.orders.find(o => o.payment_status !== "paid");
    if (pendingOrder) {
      pendingOrder.payment_status = "paid";
    }
    return { status: "success", message: "Payment verified successfully" };
  }
  // ==================== CROP INSIGHTS & ANALYTICS ====================
  const cropInsightsMatch = cleanUrl.match(/\/analytics\/crop\/(\d+)\/insights/);
  if (cropInsightsMatch) {
    const cropId = parseInt(cropInsightsMatch[1], 10);
    const crop = farmerDemoData.crops.find((c: any) => c.id === cropId) || farmerDemoData.crops[0];
    const estCost = (crop as any).total_cost || 15000;
    const estRev = (crop as any).total_revenue || (((crop as any).expected_yield || (crop as any).actual_yield || 30) * ((crop as any).selling_price_per_unit || 2400));
    const predProfit = estRev - estCost;
    return {
      insights: [
        {
          type: "success",
          category: "Cost Optimization",
          message: `Expense tracking shows total expenditure of Rs. ${estCost.toLocaleString()} within healthy budget limits.`,
          action: "Review itemized ledger"
        },
        {
          type: "info",
          category: "Market Advisory",
          message: `${crop.name} local mandi realization is trending +4.5% above the minimum support price (MSP).`,
          action: "Check APMC rates"
        },
        {
          type: "warning",
          category: "Weather & Irrigation",
          message: "Anticipating dry spell over next 5 days. Schedule secondary furrow irrigation.",
          action: "View farm calendar"
        }
      ],
      prediction: {
        predicted_profit: predProfit,
        estimated_revenue: estRev,
        estimated_cost: estCost,
        confidence: "92%",
        message: `Projected harvest yield of ${Number((crop as any).expected_yield || (crop as any).actual_yield || 32)} quintals with estimated net return of Rs. ${Number(predProfit).toLocaleString()}.`,
      }
    };
  }

  // ==================== CROP STORAGE TRACKING ====================
  if (cleanUrl.includes("/crop-storage/summary") || cleanUrl.includes("/storage/summary")) {
    return farmerDemoData.storage.summary;
  }
  if (cleanUrl.includes("/crop-storage/") && cleanUrl.includes("/release")) {
    const parts = cleanUrl.split("/");
    const id = parseInt(parts[parts.indexOf("crop-storage") + 1] || parts[parts.indexOf("storage") + 1] || "1", 10);
    const item = (farmerDemoData.storage.storages as any[]).find(s => s.id === id) || farmerDemoData.storage.storages[0];
    return { ...item, status: "released", notes: "Released to buyer directly from warehouse" };
  }
  if ((cleanUrl.includes("/crop-storage/") || cleanUrl.includes("/storage/")) && method.toLowerCase() === "delete") {
    return { success: true, message: "Crop storage record removed successfully" };
  }
  if ((cleanUrl.includes("/crop-storage/") || cleanUrl.includes("/storage/")) && method.toLowerCase() === "put") {
    const parts = cleanUrl.split("/");
    const id = parseInt(parts[parts.indexOf("crop-storage") + 1] || parts[parts.indexOf("storage") + 1] || "1", 10);
    const item = (farmerDemoData.storage.storages as any[]).find(s => s.id === id) || farmerDemoData.storage.storages[0];
    return { ...item, updated_at: new Date().toISOString() };
  }
  if ((cleanUrl === "/crop-storage" || cleanUrl === "/crop-storage/" || cleanUrl.includes("/storage")) && method.toLowerCase() === "post") {
    return {
      id: Date.now(),
      farmer_id: 17,
      crop_name: "Paddy (BPT 5204)",
      variety: "Samba Mahsuri",
      storage_type: "warehouse",
      facility_name: "AP State Warehousing Corp (APSWC Nuzividu)",
      location: "Mylavaram Road, Nuzividu",
      bags_stored: 100,
      bags_remaining: 100,
      weight_per_bag_kg: 50,
      total_weight_quintals: 50.0,
      storage_date: new Date().toISOString(),
      monthly_rent_per_bag: 6.0,
      status: "stored",
      receipt_number: `APSWC-NZ-${Date.now().toString().slice(-4)}`
    };
  }
  if (cleanUrl.includes("/crop-storage") || cleanUrl.includes("/storage/records") || cleanUrl.includes("/storage")) {
    return farmerDemoData.storage.storages;
  }

  // ==================== CROP INSURANCE (PMFBY) ====================
  if (cleanUrl.includes("/crop-insurance/summary") || cleanUrl.includes("/insurance/summary")) {
    return farmerDemoData.insurance.summary;
  }
  if (cleanUrl.includes("/crop-insurance/guidance") || cleanUrl.includes("/insurance/guidance") || cleanUrl.includes("/pmfby")) {
    return farmerDemoData.insurance.guidance;
  }
  if (cleanUrl.includes("/crop-insurance/") && cleanUrl.includes("/file-claim")) {
    const parts = cleanUrl.split("/");
    const id = parseInt(parts[parts.indexOf("crop-insurance") + 1] || "1", 10);
    const policy = (farmerDemoData.insurance.policies as any[]).find(p => p.id === id) || farmerDemoData.insurance.policies[0];
    return {
      ...policy,
      claim_status: "under_review",
      claim_amount: 35000,
      claim_date: new Date().toISOString()
    };
  }
  if (cleanUrl.includes("/crop-insurance/") && cleanUrl.includes("/claim-status")) {
    return { success: true, message: "Claim status updated successfully" };
  }
  if (cleanUrl.includes("/crop-insurance/") && method.toLowerCase() === "delete") {
    return { success: true, message: "Crop insurance policy deleted" };
  }
  if (cleanUrl.includes("/crop-insurance/") && method.toLowerCase() === "put") {
    const parts = cleanUrl.split("/");
    const id = parseInt(parts[parts.indexOf("crop-insurance") + 1] || "1", 10);
    const policy = (farmerDemoData.insurance.policies as any[]).find(p => p.id === id) || farmerDemoData.insurance.policies[0];
    return { ...policy, updated_at: new Date().toISOString() };
  }
  if ((cleanUrl === "/crop-insurance" || cleanUrl === "/crop-insurance/") && method.toLowerCase() === "post") {
    return {
      id: Date.now(),
      farmer_id: 17,
      policy_number: `PMFBY-AP-2026-${Date.now().toString().slice(-4)}`,
      scheme_name: "Pradhan Mantri Fasal Bima Yojana",
      season: "Kharif",
      crop_year: 2026,
      crop_name: "Paddy (BPT 5204)",
      sum_insured: 240000,
      farmer_premium: 2400,
      government_subsidy: 21600,
      status: "active",
      claim_status: "none"
    };
  }
  if (cleanUrl.includes("/crop-insurance") || cleanUrl.includes("/insurance/policies") || cleanUrl.includes("/insurance")) {
    return farmerDemoData.insurance.policies;
  }

  // ==================== CREDIT TRACKER & LOANS ====================
  if (cleanUrl.includes("/credit-loans/summary") || cleanUrl.includes("/finance/summary")) {
    return farmerDemoData.finance.summary;
  }
  if (cleanUrl.includes("/credit-loans/") && cleanUrl.includes("/repayments")) {
    if (method.toLowerCase() === "post") {
      return {
        id: Date.now(),
        loan_id: 1,
        amount: 5000,
        payment_date: new Date().toISOString(),
        payment_mode: "UPI",
        notes: "Monthly installment recorded"
      };
    }
    if (method.toLowerCase() === "delete") {
      return { success: true, message: "Repayment entry deleted" };
    }
    return [
      { id: 101, loan_id: 1, amount: 25000, payment_date: "2026-04-15", payment_mode: "Bank NEFT", notes: "Post-harvest repayment from Paddy sales" },
      { id: 102, loan_id: 1, amount: 20000, payment_date: "2026-08-20", payment_mode: "Cash / Branch Deposit", notes: "KCC interim principal repayment" }
    ];
  }
  if (cleanUrl.includes("/credit-loans/") && method.toLowerCase() === "delete") {
    return { success: true, message: "Loan entry deleted" };
  }
  if (cleanUrl.includes("/credit-loans/") && method.toLowerCase() === "put") {
    const parts = cleanUrl.split("/");
    const id = parseInt(parts[parts.indexOf("credit-loans") + 1] || "1", 10);
    const loan = (farmerDemoData.finance.loans as any[]).find(l => l.id === id) || farmerDemoData.finance.loans[0];
    return { ...loan, updated_at: new Date().toISOString() };
  }
  if ((cleanUrl === "/credit-loans" || cleanUrl === "/credit-loans/") && method.toLowerCase() === "post") {
    return {
      id: Date.now(),
      farmer_id: 17,
      source_type: "bank",
      lender_name: "State Bank of India (Nuzividu Branch)",
      purpose: "Crop Working Capital Loan",
      principal_amount: 50000,
      outstanding_amount: 50000,
      interest_rate_percent: 7.0,
      interest_type: "simple",
      disbursement_date: new Date().toISOString(),
      due_date: "2027-04-30",
      status: "active",
      emi_amount: 4500,
      total_repaid: 0
    };
  }
  if (cleanUrl.includes("/credit-loans") || cleanUrl.includes("/finance/loans")) {
    return farmerDemoData.finance.loans;
  }
  if (cleanUrl.includes("/finance")) {
    return farmerDemoData.finance;
  }

  // ==================== FARM CALENDAR ====================
  if (cleanUrl.includes("/farm-calendar/events/") && cleanUrl.includes("/toggle")) {
    const parts = cleanUrl.split("/");
    const id = parseInt(parts[parts.indexOf("events") + 1] || "1", 10);
    const ev = (farmerDemoData.calendar as any[]).find(e => e.id === id);
    if (ev) ev.is_completed = !ev.is_completed;
    return { success: true, message: "Event completion toggled" };
  }
  if (cleanUrl.includes("/farm-calendar/events/") && method.toLowerCase() === "delete") {
    return { success: true, message: "Farm event deleted" };
  }
  if (cleanUrl.includes("/farm-calendar/events/") && method.toLowerCase() === "put") {
    const parts = cleanUrl.split("/");
    const id = parseInt(parts[parts.indexOf("events") + 1] || "1", 10);
    const ev = (farmerDemoData.calendar as any[]).find(e => e.id === id) || farmerDemoData.calendar[0];
    return { ...ev, updated_at: new Date().toISOString() };
  }
  if ((cleanUrl === "/farm-calendar/events" || cleanUrl === "/farm-calendar/events/") && method.toLowerCase() === "post") {
    return {
      id: Date.now(),
      user_id: 17,
      title: "New Scheduled Activity",
      event_type: "general",
      event_date: new Date().toISOString().split("T")[0],
      description: "Auto-scheduled field task",
      is_completed: false,
      color: "#22c55e",
      reminder_days_before: 2
    };
  }
  if (cleanUrl.includes("/farm-calendar") || cleanUrl.includes("/calendar/events") || cleanUrl.includes("/farm-events")) {
    return farmerDemoData.calendar;
  }

  // ==================== ANNUAL SUMMARY & SEASON COMPARISON ====================
  if (cleanUrl.includes("/analytics/annual-summary-years") || cleanUrl.includes("/annual-summary-years") || cleanUrl.includes("/annual-summary/years")) {
    return [2026, 2025, 2024, 2023, 2022, 2021];
  }
  if (cleanUrl.includes("/analytics/annual-summary") || cleanUrl.includes("/annual-summary")) {
    return farmerDemoData.annualPerformanceSummary;
  }
  if (cleanUrl.includes("/season-comparison/seasons") || cleanUrl.includes("/seasons/available") || cleanUrl.includes("/available-seasons")) {
    return farmerDemoData.seasons.available;
  }
  if (cleanUrl.includes("/season-comparison/all-overview") || cleanUrl.includes("/seasons/overview") || cleanUrl.includes("/seasons-overview")) {
    return farmerDemoData.seasons.overviews;
  }
  if (cleanUrl.includes("/season-comparison/compare") || cleanUrl.includes("/seasons/compare")) {
    return (farmerDemoData as any).seasonComparison || {
      season_a: farmerDemoData.seasons.overviews[0],
      season_b: farmerDemoData.seasons.overviews[1],
      profit_comparison: { season_a_val: 139000, season_b_val: 42000, absolute_change: 97000, percentage_change: 230.95, is_positive: true },
      yield_comparison: { season_a_val: 72.5, season_b_val: 42.5, absolute_change: 30.0, percentage_change: 70.59, is_positive: true },
      cost_comparison: { season_a_val: 76000, season_b_val: 28000, absolute_change: 48000, percentage_change: 171.43, is_positive: false },
      revenue_comparison: { season_a_val: 215000, season_b_val: 70000, absolute_change: 145000, percentage_change: 207.14, is_positive: true },
      crop_comparisons: [
        { crop_name: "Paddy (BPT-5204)", season_a_yield: 52.0, season_b_yield: 0.0, season_a_profit: 108900, season_b_profit: 0, yield_change_percent: 100, profit_change_percent: 100 }
      ],
      ai_insights: ["Net income grew by Rs. 97,000 (+231%) in Kharif 2026 primarily due to expanding cultivated acreage into Paddy."]
    };
  }

  // ==================== PLOT NUTRITION & SOIL MANAGEMENT ====================
  if (cleanUrl.includes("/plot-nutrition/active-crops")) {
    return farmerDemoData.crops.filter((c: any) => c.status === "Growing").map((c: any) => ({
      id: c.id,
      name: c.name,
      area: c.area_acres || 3.0,
      season: c.season || "Kharif 2026",
      variety: c.variety || "Hybrid",
      sowing_date: c.sowing_date,
      expected_harvest_date: c.expected_harvest_date,
      crop_type: "Cereal / Cash Crop",
      status: "Growing"
    }));
  }
  if (cleanUrl.includes("/plot-nutrition/plots/") && cleanUrl.includes("/live-status")) {
    const parts = cleanUrl.split("/");
    const id = parseInt(parts[parts.indexOf("plots") + 1] || "1", 10);
    const plot = (farmerDemoData.plots as any[]).find(p => p.id === id || p.land_record_id === id) || farmerDemoData.plots[0];
    return plot.live_adjusted || {
      baseline: { nitrogen: 280, phosphorus: 26, potassium: 310, ph_level: 7.2, organic_carbon: 0.65, last_tested: "2026-06-15" },
      adjusted: { nitrogen: 265, phosphorus: 25, potassium: 305, ph_level: 7.15 },
      deltas: { nitrogen: -15, phosphorus: -1, potassium: -5 }
    };
  }
  if (cleanUrl.includes("/plot-nutrition/plots/") && cleanUrl.includes("/recommend")) {
    return {
      status: "Optimal",
      soil_health_summary: "Soil pH (7.2) is neutral and favorable. Available nitrogen is 280 kg/ha. Phosphorus and potassium are balanced.",
      recommendations: [
        { name: "Urea (Top Dressing)", quantity: "35 kg / acre", timing: "At panicle initiation (within 7 days)", application_method: "Broadcasting after water drain" },
        { name: "MOP (Muriate of Potash)", quantity: "15 kg / acre", timing: "Along with top-dress nitrogen", application_method: "Soil application for grain filling" },
        { name: "Zinc Sulphate (21%)", quantity: "10 kg / acre", timing: "Early vegetative stage", application_method: "Foliar spray (0.5% concentration)" }
      ],
      additional_tips: [
        "Maintain shallow 2-3 cm standing water during panicle emergence.",
        "Avoid broadcasting urea right before heavy monsoonal showers."
      ]
    };
  }
  if (cleanUrl.includes("/plot-nutrition/plots/") && cleanUrl.includes("/fertilizer-history")) {
    return [
      { id: 1, plot_soil_data_id: 1, user_id: 17, fertilizer_name: "DAP (Di-Ammonium Phosphate)", quantity: 50, unit: "kg", application_date: "2026-06-18", application_method: "Basal dressing at transplanting", crop_id: 13, notes: "Basal NPK dose applied", created_at: "2026-06-18T09:00:00Z" },
      { id: 2, plot_soil_data_id: 1, user_id: 17, fertilizer_name: "Urea (First Split)", quantity: 35, unit: "kg", application_date: "2026-07-10", application_method: "Top dressing", crop_id: 13, notes: "Vegetative tillering boost", created_at: "2026-07-10T08:30:00Z" }
    ];
  }
  if (cleanUrl.includes("/plot-nutrition/plots/") && cleanUrl.includes("/apply-fertilizer")) {
    return { success: true, message: "Fertilizer application recorded successfully" };
  }
  if (cleanUrl.includes("/plot-nutrition/plots/") && cleanUrl.includes("/analyze-impact")) {
    return {
      overall_status: "Balanced",
      nutrient_balance: { nitrogen: "Adequate", phosphorus: "Optimal", potassium: "High" },
      estimated_levels: { nitrogen: 295, phosphorus: 28, potassium: 325, ph_level: 7.2 },
      analysis_summary: "Recent fertilizer application increased nitrogen by +30 kg/ha, aligning with active tillering demands.",
      adjusted_recommendations: [],
      risk_alerts: []
    };
  }
  if (cleanUrl.includes("/plot-nutrition/plots/") && cleanUrl.includes("/link-crop")) {
    return { success: true, message: "Crop linked to plot soil profile" };
  }
  if (cleanUrl.includes("/plot-nutrition/plots") || cleanUrl.includes("/plots") || cleanUrl.includes("/nutrition/plots")) {
    return farmerDemoData.plots;
  }

  // ==================== BLOCKCHAIN TRACEABILITY ====================
  if (cleanUrl.includes("/blockchain/blocks")) {
    return (farmerDemoData as any).blockchain?.blocks || [];
  }
  if (cleanUrl.includes("/blockchain/stats")) {
    return (farmerDemoData as any).blockchain?.stats || { total_blocks: 4, organic_certifications: 1, fair_trade_verifications: 1, traceability_events: 2, is_ledger_valid: true };
  }
  if (cleanUrl.includes("/blockchain/verify")) {
    return { is_valid: true, failing_block_index: null, message: "Cryptographic SHA-256 integrity verified across all ledger blocks." };
  }
  if (cleanUrl.includes("/blockchain/tamper-demo")) {
    return { tampered: true, block_index: 2, message: "Tamper detection alert: Block #2 hash mismatch detected. Ledger broken at index 2." };
  }
  if (cleanUrl.includes("/blockchain/certify") && method.toLowerCase() === "post") {
    return {
      id: Date.now(),
      block_index: 4,
      timestamp: new Date().toISOString(),
      previous_hash: "0000f9184ba71304910cf91a84c83017a4190c1084ef772390ab128ce64821a0",
      hash: "00007b82c199df0281ba4920de632810a0129bcfe18204918237192837482910",
      payload: "Certification Event: Harvest Batch #2026-BPT-13 certified by Andhra Pradesh Agricultural Quality Board.",
      certification_type: "Quality Inspection",
      verifier_name: "AP Quality Council"
    };
  }

  // ==================== MANUFACTURER SUPPLY CHAIN & LOGISTICS ====================
  if (cleanUrl.includes("/manufacturer/sales") && method.toLowerCase() === "post") {
    return {
      id: Date.now(),
      manufacturer_id: 1,
      invoice_id: `INV-2026-${Date.now().toString().slice(-4)}`,
      invoice_no: `INV-2026-${Date.now().toString().slice(-4)}`,
      buyer_name: "Direct Mandi Wholesaler",
      buyer_type: "wholesaler",
      product_id: 1,
      quantity: 100,
      selling_price: 1350,
      total_amount: 135000,
      payment_mode: "Bank Transfer",
      delivery_status: "dispatched",
      date: new Date().toISOString().split("T")[0]
    };
  }
  if (cleanUrl.includes("/manufacturer/by-products")) {
    if (method.toLowerCase() === "patch" || method.toLowerCase() === "post") {
      return { success: true, message: "By-product updated successfully" };
    }
    return (manufacturerDemoData as any).byProducts || [];
  }
  if (cleanUrl.includes("/manufacturer/load-pools")) {
    if (method.toLowerCase() === "delete") {
      return { success: true, message: "Load pool removed" };
    }
    if (cleanUrl.includes("/join") || cleanUrl.includes("/submit") || method.toLowerCase() === "post") {
      return { success: true, message: "Load pool joined successfully with freight allocation confirmed" };
    }
    return (manufacturerDemoData as any).loadPools || [];
  }
  if (cleanUrl.includes("/manufacturer/weighment-slip") || cleanUrl.includes("/manufacturer/weighment-slips") || cleanUrl.includes("/manufacturer/gate-pass")) {
    if (method.toLowerCase() === "post") {
      return {
        id: Date.now(),
        slip_number: `WS-2026-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString(),
        supplier_name: "Farmer Inbound Delivery",
        commodity: "Paddy BPT-5204",
        vehicle_number: "AP 16 TX 9988",
        gross_weight_kg: 22000,
        tare_weight_kg: 7000,
        net_weight_kg: 15000,
        moisture_percent: 13.8,
        final_billable_quintals: 150.0,
        rate_per_quintal: 2420,
        total_payable: 363000
      };
    }
    return (manufacturerDemoData as any).weighmentSlips || [];
  }
  if (cleanUrl.includes("/manufacturer/moisture-standards") || cleanUrl.includes("/manufacturer/moisture-calculator")) {
    return [
      { commodity: "Paddy", standard_moisture_percent: 14.0, max_acceptable_moisture_percent: 18.0, deduction_rate_per_percent: 0.75 },
      { commodity: "Raw Cotton", standard_moisture_percent: 8.0, max_acceptable_moisture_percent: 12.0, deduction_rate_per_percent: 1.0 },
      { commodity: "Maize", standard_moisture_percent: 13.0, max_acceptable_moisture_percent: 17.0, deduction_rate_per_percent: 0.8 },
      { commodity: "Wheat", standard_moisture_percent: 12.0, max_acceptable_moisture_percent: 15.0, deduction_rate_per_percent: 0.7 }
    ];
  }
  if (cleanUrl.includes("/manufacturer/procurement-requests/inbound")) {
    return [
      {
        id: 101,
        farmer_id: 17,
        farmer_name: "Ravi Kumar Reddy",
        commodity: "Paddy (BPT-5204)",
        quantity_quintals: 52.0,
        expected_price: 2450,
        offered_price: 2420,
        status: "accepted",
        delivery_date: "2026-10-27",
        village: "Nuzividu, Krishna AP"
      }
    ];
  }

  // ==================== SHOP ANALYTICS & RETAIL CHANNELS ====================
  if (cleanUrl.includes("/analytics/shop/channel-breakdown")) {
    return (shopDemoData as any).channelBreakdown || [];
  }
  if (cleanUrl.includes("/analytics/shop/order-health")) {
    return (shopDemoData as any).orderHealth || { total_orders: 495, fulfillment_rate_percent: 96.4 };
  }
  if (cleanUrl.includes("/analytics/shop/top-products")) {
    return (shopDemoData as any).topProducts || [];
  }
  if (cleanUrl.includes("/orders/shop-orders-detailed")) {
    return shopDemoData.orders;
  }
  if (cleanUrl.includes("/shop-accounting/draft-batches")) {
    return [];
  }

  // ==================== CROP HEALTH AI DIAGNOSIS ====================
  if (cleanUrl.includes("/crop-health/supported-crops")) {
    return ["Paddy", "Cotton", "Maize", "Chilli", "Tomato", "Wheat", "Green Gram", "Groundnut"];
  }
  if (cleanUrl.includes("/crop-health/diagnose") && method.toLowerCase() === "post") {
    return {
      crop: "Paddy",
      disease_detected: "Bacterial Leaf Blight (Xanthomonas oryzae)",
      confidence: 0.94,
      severity: "Moderate",
      symptoms: "Yellow to translucent water-soaked stripes along leaf margins spreading downwards.",
      recommendations: {
        chemical: ["Spray Streptomycin Sulphate + Tetracycline Combination (Plantomycin) @ 1g/10L water", "Copper Oxychloride 50% WP @ 2.5g/L water"],
        organic: ["Apply fresh cow dung extract (20%) filtrate spray", "Neem oil 10000 ppm @ 3ml/L water"],
        cultural: ["Drain excess standing water for 48 hours to dry canopy", "Avoid excess split dose of synthetic nitrogen urea"]
      }
    };
  }
  
  if (cleanUrl.includes("/farmer/crop-health") || cleanUrl.includes("health")) {
    return [
      { crop_id: 1, status: "healthy", notes: "Optimal growth, leaf color normal" },
      { crop_id: 2, status: "monitor", notes: "Bollworm alert in Krishna district, inspect flowers" },
      { crop_id: 3, status: "healthy", notes: "Harvested with 42.5 quintals yield" },
    ];
  }
  if (cleanUrl.includes("/ai-suggestion") || cleanUrl.includes("suggestion")) {
    return {
      title: "Nitrogen Boost for Paddy (BPT-5204)",
      message: "Current soil nitrogen is 182 kg/ha. Apply second split dose of 35 kg/acre urea within next 3 days before anticipated rainfall.",
      urgency: "medium",
      crop: "Paddy (BPT-5204)",
    };
  }
  if (cleanUrl.includes("/chat/channels") || cleanUrl.includes("/community/channels")) {
    return [
      { id: 1, name: "Krishna District Paddy Farmers", channel_type: "group", location_tag: "Krishna, AP", created_at: "2024-01-01", last_message: "Sold 20 quintals at Nuzividu APMC today!", last_message_time: "2026-10-24T18:30:00" },
      { id: 2, name: "Cotton Pest Alert & Advisory", channel_type: "group", location_tag: "Andhra Pradesh", created_at: "2024-02-01", last_message: "Spray Chlorpyriphos 20 EC in early morning", last_message_time: "2026-10-24T16:15:00" },
      { id: 3, name: "Agronomist Dr. Anjali", channel_type: "p2p", location_tag: "Nuzividu KVK", created_at: "2024-03-01", last_message: "Your soil pH of 6.8 is excellent for paddy.", last_message_time: "2026-10-23T11:00:00" },
    ];
  }
  if (cleanUrl.includes("/chat/channels/") && cleanUrl.includes("/messages")) {
    return [
      { id: 101, channel_id: 1, sender_id: 10, sender_name: "Venkat Rao (Krishna Agro)", sender_role: "shop", message_text: "Fresh stock of IFFCO Urea and DAP available at subsidized rates today. Limit 5 bags per farmer.", created_at: "2026-10-24T10:00:00Z" },
      { id: 102, channel_id: 1, sender_id: 17, sender_name: "Ravi Kumar Reddy", sender_role: "farmer", message_text: "Thanks Venkat garu, picked up 5 bags this morning. Good quality.", created_at: "2026-10-24T12:30:00Z" },
      { id: 103, channel_id: 1, sender_id: 301, sender_name: "Dr. Anjali (Agronomist)", sender_role: "expert", message_text: "Yellow mosaic and pink bollworm warnings issued for Guntur and Krishna. Spray Chlorpyriphos in early morning hours only.", created_at: "2026-10-24T14:00:00Z" },
    ];
  }
  if (cleanUrl.includes("/chat/farmers") || cleanUrl.includes("/community/farmers")) {
    return [
      { id: 201, full_name: "Suresh Naidu", village: "Gannavaram", district: "Krishna", primary_crop: "Cotton", phone_number: "9876501234" },
      { id: 202, full_name: "Koteswara Rao", village: "Vuyyuru", district: "Krishna", primary_crop: "Paddy", phone_number: "9876505678" },
      { id: 203, full_name: "Venkata Raman", village: "Gudivada", district: "Krishna", primary_crop: "Sugarcane", phone_number: "9876509012" },
    ];
  }

  // Shop endpoints
  if (cleanUrl.includes("/shop/profile") || cleanUrl === "/shop/profile/") {
    return shopDemoData.profile;
  }
  if (cleanUrl.includes("/shop/inventory") || cleanUrl.includes("/products/shop") || cleanUrl.includes("/products/")) {
    return shopDemoData.inventory;
  }
  if (cleanUrl.includes("/orders/shop-orders") || cleanUrl.includes("/shop/orders") || cleanUrl.includes("/shop/sales")) {
    return shopDemoData.orders;
  }
  if (cleanUrl.includes("/analytics/sales-trend") || cleanUrl.includes("/sales-trend")) {
    return shopDemoData.salesTrend;
  }
  if (cleanUrl.includes("/analytics/shop") || cleanUrl.includes("/shop/analytics")) {
    return shopDemoData.analytics;
  }
  if (cleanUrl.includes("/analytics/revenue-report") || cleanUrl.includes("/revenue-report")) {
    return shopDemoData.revenueReport;
  }
  if (cleanUrl.includes("/shop/customers") || cleanUrl.includes("/customers")) {
    return shopDemoData.customers;
  }

  // Manufacturer endpoints
  if (cleanUrl.includes("/manufacturer/profile")) {
    return manufacturerDemoData.profile;
  }
  if (cleanUrl.includes("/manufacturer/stats")) {
    return manufacturerDemoData.stats;
  }
  if (cleanUrl.includes("/manufacturer/sales-trend")) {
    return manufacturerDemoData.salesTrend;
  }
  if (cleanUrl.includes("/manufacturer/production") || cleanUrl.includes("/production")) {
    return manufacturerDemoData.production;
  }
  if (cleanUrl.includes("/manufacturer/inventory")) {
    return manufacturerDemoData.inventory;
  }
  if (cleanUrl.includes("/manufacturer/purchases") || cleanUrl.includes("/purchases")) {
    return manufacturerDemoData.purchases;
  }
  if (cleanUrl.includes("/manufacturer/sales")) {
    return manufacturerDemoData.sales;
  }
  if (cleanUrl.includes("/manufacturer/accounting/summary")) {
    return manufacturerDemoData.accounting;
  }
  if (cleanUrl.includes("/manufacturer/intelligence") || cleanUrl.includes("/intelligence")) {
    return manufacturerDemoData.intelligence;
  }

  // Customer endpoints
  if (cleanUrl.includes("/customer/profile") || cleanUrl.includes("/customer/me")) {
    return customerDemoData.profile;
  }
  if (cleanUrl.includes("/customer/orders")) {
    return customerDemoData.orders;
  }
  if (cleanUrl.includes("/customer/cart")) {
    return customerDemoData.cart;
  }
  if (cleanUrl.includes("/customer/smart-buying") || cleanUrl.includes("/smart-buying")) {
    return customerDemoData.smartBuying;
  }
  if (cleanUrl.includes("/customer/marketplace") || cleanUrl.includes("/marketplace")) {
    return customerDemoData.marketplace;
  }

  return null;
}

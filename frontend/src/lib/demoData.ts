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
      id: 1,
      name: "Paddy (BPT 5204 Samba Masuri)",
      area: 3.10,
      season: "Kharif",
      variety: "BPT 5204 Certified",
      crop_type: "Paddy",
      sowing_date: "2026-06-15T00:00:00",
      expected_harvest_date: "2026-10-30T00:00:00",
      status: "Growing",
      notes: "Excellent vegetative growth. Panicle initiation active. Applied 2nd dose Urea.",
      expenses_count: 4,
      total_expenses: 18450
    },
    {
      id: 2,
      name: "Cotton (Bunny BT Hybrid)",
      area: 2.30,
      season: "Kharif",
      variety: "Bunny BT",
      crop_type: "Cotton",
      sowing_date: "2026-05-20T00:00:00",
      expected_harvest_date: "2026-11-25T00:00:00",
      status: "Growing",
      notes: "Second picking scheduled. Pest scouting shows minor bollworm trace.",
      expenses_count: 3,
      total_expenses: 14200
    },
    {
      id: 3,
      name: "Maize (NK-6240 Hybrid)",
      area: 1.80,
      season: "Rabi",
      variety: "NK-6240",
      crop_type: "Maize",
      sowing_date: "2026-01-10T00:00:00",
      expected_harvest_date: "2026-04-20T00:00:00",
      actual_harvest_date: "2026-04-18T00:00:00",
      actual_yield: 42.5,
      selling_price_per_unit: 1890,
      net_profit: 48600,
      status: "Harvested",
      notes: "Harvested and 40 quintals deposited in Kondapally Primary Cold Store.",
      expenses_count: 2,
      total_expenses: 9800
    }
  ],
  orders: [
    {
      id: 101,
      shop_id: 10,
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
      total_amount: 8450,
      discount: 265,
      final_amount: 8185,
      payment_mode: "upi",
      payment_status: "paid",
      payment_id: "UPI-PAY-98218842",
      status: "delivered",
      order_notes: "Delivered to Kondapally field store gate",
      created_at: "2026-10-12T10:30:00Z",
      items: [
        { product_id: 1, product_name: "Urea 46-0-0 (50 kg)", category: "fertilizer", quantity: 5, unit_price: 267, total_price: 1335, subtotal: 1335, unit: "bag", brand: "IFFCO", manufacturer: "IFFCO" },
        { product_id: 2, product_name: "DAP 18-46-0 (50 kg)", category: "fertilizer", quantity: 4, unit_price: 1350, total_price: 5400, subtotal: 5400, unit: "bag", brand: "Coromandel", manufacturer: "Coromandel" },
        { product_id: 4, product_name: "Chlorpyriphos 20 EC (1L)", category: "pesticide", quantity: 2, unit_price: 620, total_price: 1240, subtotal: 1240, unit: "bottle", brand: "Dhanuka", manufacturer: "Dhanuka" }
      ]
    },
    {
      id: 102,
      shop_id: 10,
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
      total_amount: 4400,
      discount: 100,
      final_amount: 4300,
      payment_mode: "credit",
      payment_status: "pending",
      status: "shipped",
      order_notes: "On delivery truck, driver contact: 9848099881",
      created_at: "2026-10-21T14:15:00Z",
      items: [
        { product_id: 3, product_name: "MOP Potash (50 kg)", category: "fertilizer", quantity: 4, unit_price: 1100, total_price: 4400, subtotal: 4400, unit: "bag", brand: "IPL", manufacturer: "IPL" }
      ]
    },
    {
      id: 103,
      shop_id: 10,
      shop_name: "Krishna Agro Center",
      shop_contact: {
        phone: "9848012345",
        address: "Main Road, Near Bus Stand, Nuzividu, Krishna AP",
        owner_name: "Venkat Rao Potti"
      },
      farmer_id: 17,
      farmer_name: "Ravi Kumar Reddy",
      total_amount: 2800,
      discount: 0,
      final_amount: 2800,
      payment_mode: "cash_on_delivery",
      payment_status: "pending",
      status: "processing",
      order_notes: "Packaging inline drip pipes for Block 2",
      created_at: "2026-10-24T09:00:00Z",
      items: [
        { product_id: 7, product_name: "Drip Irrigation Inline Pipe (100m)", category: "equipment", quantity: 1, unit_price: 2800, total_price: 2800, subtotal: 2800, unit: "roll", brand: "Jain Irrigation", manufacturer: "Jain" }
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
    { id: 1, plot_name: "Block 1 (North Field)", area_acres: 3.10, soil_type: "Black Cotton", current_crop: "Paddy (BPT 5204)", status: "Optimal" },
    { id: 2, plot_name: "Block 2 (South Field)", area_acres: 2.30, soil_type: "Red Loamy", current_crop: "Cotton (Bunny BT)", status: "Good" },
    { id: 3, plot_name: "Block 3 (Canal Gate)", area_acres: 1.80, soil_type: "Alluvial Clay", current_crop: "Maize (NK-6240)", status: "Optimal" }
  ],
  reportMeta: {
    crops_count: 3,
    total_area_acres: 7.20,
    total_yield_quintals: 62.5,
    total_cost: 104000,
    total_revenue: 285000,
    net_profit: 181000,
    eligible_uses: ["Bank KCC Loan Renewal", "Crop Insurance PMFBY Claim Verification", "APMC Mandi Direct Trade Certification"]
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
    { id: 1, name: "Urea 46-0-0 (50 kg)", short_name: "Urea", category: "fertilizer", stock: 245, quantity: 245, unit_price: 267, price: 267, cost_price: 240, reorder_level: 100, supplier: "IFFCO", brand: "IFFCO", manufacturer: "IFFCO", unit: "bag", low_stock: false, status: "active" },
    { id: 2, name: "DAP 18-46-0 (50 kg)", short_name: "DAP", category: "fertilizer", stock: 88, quantity: 88, unit_price: 1350, price: 1350, cost_price: 1200, reorder_level: 50, supplier: "Coromandel", brand: "Coromandel", manufacturer: "Coromandel", unit: "bag", low_stock: false, status: "active" },
    { id: 3, name: "MOP Potash (50 kg)", short_name: "MOP", category: "fertilizer", stock: 62, quantity: 62, unit_price: 1100, price: 1100, cost_price: 980, reorder_level: 40, supplier: "IPL", brand: "IPL", manufacturer: "IPL", unit: "bag", low_stock: false, status: "active" },
    { id: 4, name: "Chlorpyriphos 20 EC (1L)", short_name: "Chlorpyriphos", category: "pesticide", stock: 156, quantity: 156, unit_price: 620, price: 620, cost_price: 510, reorder_level: 60, supplier: "Dhanuka", brand: "Dhanuka", manufacturer: "Dhanuka", unit: "bottle", low_stock: false, status: "active" },
    { id: 5, name: "BPT-5204 Certified Seed (5kg)", short_name: "BPT-5204", category: "seeds", stock: 420, quantity: 420, unit_price: 185, price: 185, cost_price: 145, reorder_level: 150, supplier: "AP State Seeds", brand: "AP Seeds", manufacturer: "APSSC", unit: "packet", low_stock: false, status: "active" },
    { id: 6, name: "Cotton Bunny BT Seeds (450g)", short_name: "Bunny BT", category: "seeds", stock: 35, quantity: 35, unit_price: 740, price: 740, cost_price: 640, reorder_level: 50, supplier: "Rasi Seeds", brand: "Rasi", manufacturer: "Rasi", unit: "packet", low_stock: true, status: "active" },
    { id: 7, name: "Drip Irrigation Inline Pipe (100m)", short_name: "Drip 16mm", category: "equipment", stock: 18, quantity: 18, unit_price: 2800, price: 2800, cost_price: 2300, reorder_level: 20, supplier: "Jain Irrigation", brand: "Jain", manufacturer: "Jain", unit: "roll", low_stock: true, status: "active" },
  ],
  orders: [
    {
      id: 101,
      order_id: 101,
      farmer_id: 17,
      farmer_name: "Ravi Kumar Reddy",
      farmer_phone: "9876543210",
      total_amount: 8450,
      discount: 265,
      final_amount: 8185,
      payment_mode: "upi",
      payment_status: "paid",
      status: "delivered",
      order_notes: "Delivered to Kondapally field store",
      created_at: "2026-10-12T10:30:00Z",
      items: [
        { product_name: "Urea 46-0-0 (50 kg)", quantity: 5, unit_price: 267, subtotal: 1335 },
        { product_name: "DAP 18-46-0 (50 kg)", quantity: 4, unit_price: 1350, subtotal: 5400 },
        { product_name: "Chlorpyriphos 20 EC (1L)", quantity: 2, unit_price: 620, subtotal: 1240 }
      ]
    },
    {
      id: 102,
      order_id: 102,
      farmer_id: 17,
      farmer_name: "Ravi Kumar Reddy",
      farmer_phone: "9876543210",
      total_amount: 4400,
      discount: 100,
      final_amount: 4300,
      payment_mode: "credit",
      payment_status: "pending",
      status: "shipped",
      order_notes: "On delivery truck",
      created_at: "2026-10-21T14:15:00Z",
      items: [
        { product_name: "MOP Potash (50 kg)", quantity: 4, unit_price: 1100, subtotal: 4400 }
      ]
    },
    {
      id: 103,
      order_id: 103,
      farmer_id: 201,
      farmer_name: "Suresh Naidu",
      farmer_phone: "9876501234",
      total_amount: 5920,
      discount: 120,
      final_amount: 5800,
      payment_mode: "cash",
      payment_status: "paid",
      status: "delivered",
      created_at: "2026-10-23T11:00:00Z",
      items: [
        { product_name: "Cotton Bunny BT Seeds (450g)", quantity: 8, unit_price: 740, subtotal: 5920 }
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
    { id: 1, invoice_no: "SL-3421", date: "2026-10-22", buyer_name: "Reliance Fresh (Vijayawada)", product_name: "Boiled Rice (25kg bag)", quantity: 500, unit: "bags", rate: 920, total_amount: 460000, status: "delivered" },
    { id: 2, invoice_no: "SL-3422", date: "2026-10-20", buyer_name: "DMart Hyderabad", product_name: "Raw Rice (25kg bag)", quantity: 800, unit: "bags", rate: 880, total_amount: 704000, status: "processing" },
    { id: 3, invoice_no: "SL-3423", date: "2026-10-18", buyer_name: "Export - Dubai (Gulf Traders)", product_name: "Cotton Lint Grade A", quantity: 20, unit: "tons", rate: 138000, total_amount: 2760000, status: "dispatched" },
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
  if (cleanUrl.includes("/orders/my-orders") || (cleanUrl.includes("/orders") && !cleanUrl.includes("/shop") && !cleanUrl.includes("/customer") && !cleanUrl.includes("/manufacturer"))) {
    return farmerDemoData.orders;
  }
  if (cleanUrl.includes("/storage/summary")) {
    return farmerDemoData.storage.summary;
  }
  if (cleanUrl.includes("/storage/records") || cleanUrl.includes("/storage")) {
    return farmerDemoData.storage.storages;
  }
  if (cleanUrl.includes("/insurance/summary")) {
    return farmerDemoData.insurance.summary;
  }
  if (cleanUrl.includes("/insurance/guidance") || cleanUrl.includes("/pmfby")) {
    return farmerDemoData.insurance.guidance;
  }
  if (cleanUrl.includes("/insurance/policies") || cleanUrl.includes("/insurance")) {
    return farmerDemoData.insurance.policies;
  }
  if (cleanUrl.includes("/finance/summary")) {
    return farmerDemoData.finance.summary;
  }
  if (cleanUrl.includes("/finance/loans")) {
    return farmerDemoData.finance.loans;
  }
  if (cleanUrl.includes("/finance")) {
    return farmerDemoData.finance;
  }
  if (cleanUrl.includes("/calendar/events") || cleanUrl.includes("/farm-events")) {
    return farmerDemoData.calendar;
  }
  if (cleanUrl.includes("/analytics/annual-summary") || cleanUrl.includes("/annual-summary")) {
    return farmerDemoData.annualPerformanceSummary;
  }
  if (cleanUrl.includes("/analytics/annual-summary-years") || cleanUrl.includes("/annual-summary-years")) {
    return [2026, 2025, 2024, 2023, 2022, 2021];
  }
  if (cleanUrl.includes("/seasons/available") || cleanUrl.includes("/available-seasons")) {
    return farmerDemoData.seasons.available;
  }
  if (cleanUrl.includes("/seasons/overview") || cleanUrl.includes("/seasons-overview")) {
    return farmerDemoData.seasons.overviews;
  }
  if (cleanUrl.includes("/recommendations/best-crop")) {
    return farmerDemoData.recommendations.bestCrop;
  }
  if (cleanUrl.includes("/recommendations/crop") || cleanUrl.includes("/crop-recommendations")) {
    return farmerDemoData.recommendations.crops;
  }
  if (cleanUrl.includes("/reports/preview-meta")) {
    return farmerDemoData.reportMeta;
  }
  if (cleanUrl.includes("/manufacturer/mills/marketplace") || cleanUrl.includes("/mills")) {
    return farmerDemoData.millsMarketplace;
  }
  if (cleanUrl.includes("/manufacturer/procurement-requests/my") || cleanUrl.includes("/procurement-requests/my")) {
    return [];
  }
  if (cleanUrl.includes("/plots") || cleanUrl.includes("/nutrition/plots")) {
    return farmerDemoData.plots;
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

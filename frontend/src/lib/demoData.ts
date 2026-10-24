// AGRIFLOW DEMO DATA — Realistic data for all roles, spanning 5 years (2021-2026)

export type DemoRole = "farmer" | "shop" | "manufacturer" | "customer";

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const years = [2021, 2022, 2023, 2024, 2025, 2026];

function mkDate(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

export const farmerDemoData = {
  profile: {
    farmer_id: "FM-2021-00123",
    full_name: "Ravi Kumar Reddy",
    father_husband_name: "Suresh Reddy",
    phone_number: "9876543210",
    gender: "Male",
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
      { serial_number: "KR/2021/001", area: 2.30 },
      { serial_number: "KR/2021/002", area: 3.10 },
      { serial_number: "KR/2021/003", area: 1.80 },
    ],
    profile_picture_url: null,
  },
  crops: [
    { id: 1, name: "Paddy (BPT-5204)", area: 3.10, sowing_date: mkDate(2026,6,15), expected_harvest_date: mkDate(2026,10,20), status: "growing", notes: "Good germination, requires second dose of urea" },
    { id: 2, name: "Cotton (Bunny BT)", area: 2.30, sowing_date: mkDate(2026,5,20), expected_harvest_date: mkDate(2026,11,30), status: "growing", notes: "Watch for bollworm attack" },
    { id: 3, name: "Maize", area: 1.80, sowing_date: mkDate(2026,7,1), expected_harvest_date: mkDate(2026,10,5), status: "harvested", notes: "Yield: 6.2 tons/acre" },
  ],
  annualYield: years.map((y, i) => ({
    year: y,
    paddy: [4.8, 5.1, 5.4, 5.0, 5.8, 4.9][i],
    cotton: [1.2, 1.4, 1.3, 1.6, 1.5, 1.7][i],
    maize: [5.5, 5.9, 6.1, 6.0, 6.4, 6.2][i],
    totalRevenue: [210000, 245000, 268000, 252000, 310000, 285000][i],
    expenses: [82000, 91000, 98000, 95000, 112000, 104000][i],
  })),
  monthlyRevenue: months.map((m, i) => ({
    month: m,
    revenue: [12000,8000,18000,22000,35000,28000,14000,9000,38000,45000,32000,24000][i],
    expenses: [5000,4200,7800,9100,14200,11500,6200,4500,15800,18200,13100,9800][i],
  })),
  weather: {
    location: "Kondapally, Andhra Pradesh",
    current: { temp: 29, feels_like: 32, humidity: 74, wind_speed: 14, condition: "Partly Cloudy", uv_index: 6, visibility: 8, pressure: 1013, rainfall_today: 2.4 },
    forecast: [
      { day: "Today", high: 31, low: 23, condition: "Partly Cloudy", rain_chance: 30 },
      { day: "Tue", high: 33, low: 24, condition: "Sunny", rain_chance: 5 },
      { day: "Wed", high: 28, low: 22, condition: "Heavy Rain", rain_chance: 85 },
      { day: "Thu", high: 26, low: 21, condition: "Rainy", rain_chance: 70 },
      { day: "Fri", high: 30, low: 23, condition: "Cloudy", rain_chance: 40 },
      { day: "Sat", high: 32, low: 24, condition: "Sunny", rain_chance: 10 },
      { day: "Sun", high: 29, low: 22, condition: "Thunderstorm", rain_chance: 90 },
    ],
    historical_rainfall: years.map((y, i) => ({ year: y, annual_mm: [890, 1020, 950, 1100, 870, 980][i] })),
    soil: { moisture: 68, temperature: 27, ph: 6.8, ec: 0.42, nitrogen: 182, phosphorus: 28, potassium: 215 },
  },
  news: [
    { id: 1, title: "PM-KISAN 17th Installment Released - Rs.2000 Credited", date: mkDate(2026,10,15), source: "PIB India", category: "Government", summary: "Over 9 crore farmers received their PM-KISAN installment.", urgent: true },
    { id: 2, title: "Paddy MSP Increased by Rs.117 for Kharif 2026", date: mkDate(2026,9,28), source: "Ministry of Agriculture", category: "MSP", summary: "Cabinet approves new MSP of Rs.2,369 per quintal for paddy.", urgent: false },
    { id: 3, title: "Heavy Rainfall Alert: Coastal Andhra Pradesh", date: mkDate(2026,10,22), source: "IMD Hyderabad", category: "Weather", summary: "IMD warns of heavy rainfall over coastal districts for next 3 days.", urgent: true },
    { id: 4, title: "Drip Irrigation Subsidy: 80% for Small Farmers", date: mkDate(2026,10,10), source: "APMC Board", category: "Subsidy", summary: "Government announces enhanced subsidy for micro-irrigation systems.", urgent: false },
    { id: 5, title: "New Pest Outbreak: Yellow Mosaic Virus in Soybean", date: mkDate(2026,10,5), source: "ICAR", category: "Advisory", summary: "Farmers advised to use resistant varieties and apply recommended pesticides.", urgent: true },
  ],
  marketPrices: [
    { crop: "Paddy (BPT-5204)", market: "Nuzividu APMC", price: 2420, unit: "Rs./Quintal", change: 45, trend: "up" },
    { crop: "Cotton", market: "Vijayawada", price: 6850, unit: "Rs./Quintal", change: -120, trend: "down" },
    { crop: "Maize", market: "Guntur APMC", price: 1890, unit: "Rs./Quintal", change: 30, trend: "up" },
    { crop: "Turmeric", market: "Nizamabad", price: 12400, unit: "Rs./Quintal", change: 380, trend: "up" },
    { crop: "Red Chilli", market: "Guntur APMC", price: 18200, unit: "Rs./Quintal", change: -250, trend: "down" },
  ],
  priceTrend: years.map((y, i) => ({
    year: y,
    paddy: [1815,1868,2015,2183,2269,2369][i],
    cotton: [5726,6025,6380,6110,7020,6850][i],
    maize: [1462,1526,1635,1750,1870,1890][i],
  })),
  finance: {
    wallet_balance: 84200,
    total_income: 285000,
    total_expenses: 104000,
    pending_payments: 28500,
    loans: [
      { id: "KCC-2024-01", type: "Kisan Credit Card", amount: 150000, outstanding: 62000, emi: 8500, due: mkDate(2026,11,15), status: "active" },
      { id: "ATL-2022-03", type: "Agri-Term Loan", amount: 200000, outstanding: 0, emi: 0, due: mkDate(2024,3,31), status: "closed" },
    ],
    insurance: [
      { id: "PMFBY-2026-K", scheme: "PMFBY Kharif 2026", crop: "Paddy + Cotton", area: 5.40, premium_paid: 3240, sum_insured: 324000, status: "active", expiry: mkDate(2026,12,31) },
      { id: "PMFBY-2025-R", scheme: "PMFBY Rabi 2025", crop: "Wheat + Maize", area: 3.10, premium_paid: 1860, sum_insured: 186000, status: "claim_settled", claim_amount: 42000 },
    ],
    transactions: [
      { id: "T001", date: mkDate(2026,10,15), type: "credit", description: "PM-KISAN Installment", amount: 2000 },
      { id: "T002", date: mkDate(2026,10,12), type: "credit", description: "Paddy Sale - Nuzividu APMC", amount: 48400 },
      { id: "T003", date: mkDate(2026,10,8), type: "debit", description: "Urea Fertilizer (10 bags)", amount: 5400 },
      { id: "T004", date: mkDate(2026,9,30), type: "debit", description: "KCC EMI Payment", amount: 8500 },
      { id: "T005", date: mkDate(2026,9,20), type: "credit", description: "Cotton Sale - Vijayawada", amount: 68500 },
    ],
  },
  soilHealth: {
    current: { nitrogen: 182, phosphorus: 28, potassium: 215, ph: 6.8, organic_carbon: 0.72, moisture: 68 },
    history: years.map((y, i) => ({
      year: y, n: [210,195,188,175,185,182][i], p: [32,30,29,26,27,28][i], k: [220,218,212,205,210,215][i], ph: [6.9,6.8,6.7,6.8,6.9,6.8][i],
    })),
    recommendations: [
      "Apply 55 kg/acre urea in split doses for paddy",
      "Add organic matter (FYM 4 tons/acre) before next sowing",
      "Potassium levels optimal - no additional input needed",
      "Monitor pH - slightly acidic, consider lime application",
    ],
  },
  calendar: [
    { date: mkDate(2026,10,25), event: "Paddy Field Inspection (Block-2)", type: "inspection" },
    { date: mkDate(2026,10,28), event: "KCC EMI Due (Rs.8,500)", type: "payment" },
    { date: mkDate(2026,11,1), event: "Cotton Second Picking", type: "harvest" },
    { date: mkDate(2026,11,5), event: "APMC Market Visit - Nuzividu", type: "market" },
    { date: mkDate(2026,11,15), event: "Rabi Sowing - Wheat (Block-3)", type: "sowing" },
  ],
  community: {
    posts: [
      { id: 1, author: "Suresh Naidu", role: "Farmer", content: "Anyone else seeing pink bollworm in cotton this season?", time: "2h ago", likes: 14, replies: 8 },
      { id: 2, author: "Anjali Devi", role: "Agronomist", content: "Reminder: Spray Chlorpyriphos 20 EC for bollworm. Do it in early morning.", time: "5h ago", likes: 32, replies: 12 },
      { id: 3, author: "Ravi Kumar", role: "Farmer", content: "Sold 20 quintals of paddy at Nuzividu APMC - got Rs.2,420/quintal. Good rates!", time: "1d ago", likes: 45, replies: 22 },
    ],
  },
  orders: [
    { id: "ORD-001", item: "DAP Fertilizer (50kg x 5 bags)", shop: "Krishna Agro Center", date: mkDate(2026,10,10), amount: 6750, status: "delivered" },
    { id: "ORD-002", item: "Chlorpyriphos 20 EC (1L x 3)", shop: "Reddy Agri Inputs", date: mkDate(2026,10,18), amount: 1890, status: "out_for_delivery" },
    { id: "ORD-003", item: "Sprinkler Set (2 acres)", shop: "Jyothi Farm Equipment", date: mkDate(2026,10,22), amount: 12500, status: "processing" },
  ],
};

export const shopDemoData = {
  profile: {
    shop_name: "Krishna Agro Center",
    owner_name: "Venkat Rao Potti",
    license_no: "AP/AGR/2019/04521",
    gst: "37AAAPV1234C1Z5",
    phone: "9848012345",
    email: "krishna.agro@gmail.com",
    address: "Main Road, Near Bus Stand, Nuzividu, Krishna Dist., AP 521111",
    established: 2018,
    rating: 4.7,
    total_customers: 1842,
  },
  inventory: [
    { id: 1, name: "Urea (50 kg bag)", category: "Fertilizer", stock: 245, unit_price: 267, reorder_level: 100, supplier: "IFFCO", low_stock: false },
    { id: 2, name: "DAP (50 kg bag)", category: "Fertilizer", stock: 88, unit_price: 1350, reorder_level: 50, supplier: "IFFCO", low_stock: false },
    { id: 3, name: "MOP (50 kg bag)", category: "Fertilizer", stock: 62, unit_price: 1100, reorder_level: 40, supplier: "IPL", low_stock: false },
    { id: 4, name: "Chlorpyriphos 20 EC (1L)", category: "Pesticide", stock: 156, unit_price: 620, reorder_level: 60, supplier: "Dhanuka", low_stock: false },
    { id: 5, name: "BPT-5204 Paddy Seed (5kg)", category: "Seeds", stock: 420, unit_price: 185, reorder_level: 150, supplier: "AP Seeds", low_stock: false },
    { id: 6, name: "Cotton Bunny BT (450g)", category: "Seeds", stock: 35, unit_price: 740, reorder_level: 50, supplier: "Rasi Seeds", low_stock: true },
    { id: 7, name: "Drip Emitter (16mm x 100m)", category: "Equipment", stock: 18, unit_price: 2800, reorder_level: 20, supplier: "Jain Irrigation", low_stock: true },
  ],
  salesSummary: { today: 18420, this_week: 94500, this_month: 362800, this_year: 3840000 },
  annualSales: years.map((y, i) => ({
    year: y,
    revenue: [2100000, 2480000, 2920000, 3150000, 3620000, 3840000][i],
    profit: [420000, 496000, 584000, 630000, 724000, 768000][i],
    orders: [1840, 2120, 2450, 2680, 3050, 3240][i],
    customers: [820, 960, 1140, 1320, 1580, 1842][i],
  })),
  monthlySales: months.map((m, i) => ({
    month: m,
    revenue: [182000,145000,210000,295000,380000,342000,268000,195000,320000,415000,362000,226000][i],
    profit: [36400,29000,42000,59000,76000,68400,53600,39000,64000,83000,72400,45200][i],
  })),
  recentOrders: [
    { id: "SO-2842", farmer: "Ravi Kumar Reddy", items: "DAP x5, Urea x10", total: 8185, date: mkDate(2026,10,22), status: "delivered" },
    { id: "SO-2843", farmer: "Lakshmi Devi", items: "BPT-5204 Seed x20", total: 6800, date: mkDate(2026,10,22), status: "processing" },
    { id: "SO-2844", farmer: "Srinivas Rao", items: "Cotton Bunny BT x8", total: 6400, date: mkDate(2026,10,21), status: "delivered" },
  ],
  accounting: {
    total_receivables: 48500,
    total_payables: 125000,
    gst_payable: 18420,
    bank_balance: 284000,
  },
};

export const manufacturerDemoData = {
  profile: {
    mill_name: "Sri Venkateswara Rice and Cotton Mill",
    owner_name: "Prasad Babu Reddy",
    license_no: "AP/MILL/2018/00892",
    gst: "37BBBPV5678D1Z2",
    capacity: "120 tons/day",
    location: "Nuzividu Industrial Estate, Krishna Dist., AP",
    established: 2017,
    employees: 48,
    certifications: ["FSSAI", "ISO 9001:2015", "APEDA"],
  },
  annualProduction: years.map((y, i) => ({
    year: y,
    rice_tons: [2800, 3200, 3850, 4100, 4620, 4980][i],
    cotton_tons: [820, 940, 1050, 1120, 1280, 1350][i],
    revenue: [14500000, 17200000, 20800000, 22400000, 26100000, 28500000][i],
    profit: [2900000, 3440000, 4160000, 4480000, 5220000, 5700000][i],
  })),
  monthlyProduction: months.map((m, i) => ({
    month: m,
    rice: [280,240,185,210,380,420,360,295,440,520,465,320][i],
    cotton: [0,0,0,0,0,80,140,180,210,250,220,160][i],
    revenue: [1450000,1240000,960000,1100000,1980000,2200000,2620000,2480000,3100000,3680000,3240000,2850000][i],
  })),
  inventory: {
    raw_materials: [
      { item: "Paddy (BPT-5204)", quantity: 420, unit: "tons", value: 8820000 },
      { item: "Raw Cotton", quantity: 85, unit: "tons", value: 5610000 },
      { item: "Packaging Material", quantity: 12000, unit: "bags", value: 480000 },
    ],
    finished_goods: [
      { item: "Boiled Rice (25kg bag)", quantity: 8400, unit: "bags", value: 7980000 },
      { item: "Raw Rice (25kg bag)", quantity: 3200, unit: "bags", value: 2880000 },
      { item: "Cotton Lint (Grade A)", quantity: 48, unit: "tons", value: 6720000 },
    ],
  },
  purchases: [
    { id: "PO-1021", date: mkDate(2026,10,20), supplier: "Farmer Pool - Nuzividu", commodity: "Paddy BPT-5204", quantity: 80, unit: "tons", rate: 2100, total: 168000, status: "received" },
    { id: "PO-1022", date: mkDate(2026,10,18), supplier: "APMC Vijayawada", commodity: "Raw Cotton", quantity: 25, unit: "tons", rate: 6600, total: 165000, status: "in_transit" },
    { id: "PO-1023", date: mkDate(2026,10,15), supplier: "Ravi Kumar Reddy", commodity: "Paddy BPT-5204", quantity: 18, unit: "tons", rate: 2150, total: 38700, status: "received" },
  ],
  sales: [
    { id: "SL-3421", date: mkDate(2026,10,22), buyer: "Reliance Fresh (Vijayawada)", product: "Boiled Rice 25kg", qty: 500, rate: 920, total: 460000, status: "delivered" },
    { id: "SL-3422", date: mkDate(2026,10,20), buyer: "DMart Hyderabad", product: "Raw Rice 25kg", qty: 800, rate: 880, total: 704000, status: "processing" },
    { id: "SL-3423", date: mkDate(2026,10,18), buyer: "Export - Dubai", product: "Cotton Lint Grade A", qty: 20, rate: 138000, total: 2760000, status: "shipped" },
  ],
  production: {
    current_batch: { id: "BT-2026-108", commodity: "Paddy", input_tons: 120, expected_output_tons: 82, status: "running" },
    efficiency: { milling_ratio: 68.5, rejection_rate: 1.2, energy_per_ton: 42 },
  },
  intelligence: {
    demand_forecast: [
      { product: "Boiled Rice", next_month_tons: 420, confidence: 87, trend: "up" },
      { product: "Raw Rice", next_month_tons: 310, confidence: 82, trend: "stable" },
    ],
    price_intelligence: [
      { commodity: "Paddy", recommended_buy_price: 2080, current_market: 2100, suggestion: "Buy now - prices expected to rise by Rs.120 next month" },
      { commodity: "Cotton", recommended_buy_price: 6400, current_market: 6600, suggestion: "Wait 2 weeks - surplus from Vidarbha expected to lower rates" },
    ],
  },
};

export const customerDemoData = {
  profile: {
    full_name: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    phone: "9900112233",
    address: "Flat 402, Green Valley Apartments, KPHB Colony, Hyderabad 500085",
    member_since: "2022-03-15",
    tier: "Gold",
    total_orders: 142,
    total_spent: 84500,
    saved_amount: 12600,
    loyalty_points: 2840,
  },
  marketplace: {
    featured: [
      { id: 1, name: "Organic Sona Masoori Rice (5kg)", seller: "Sri Venkateswara Mill", price: 390, mrp: 450, discount: 13, rating: 4.8, reviews: 1842, organic: true, in_stock: true },
      { id: 2, name: "Cold-Pressed Groundnut Oil (1L)", seller: "Rayalaseema Natural Foods", price: 285, mrp: 320, discount: 11, rating: 4.6, reviews: 924, organic: true, in_stock: true },
      { id: 3, name: "Turmeric Powder (500g)", seller: "Nizamabad Spice Traders", price: 145, mrp: 180, discount: 19, rating: 4.9, reviews: 3210, organic: true, in_stock: true },
      { id: 4, name: "A2 Desi Cow Ghee (500ml)", seller: "GIR Organic Farm", price: 680, mrp: 800, discount: 15, rating: 4.7, reviews: 2100, organic: true, in_stock: true },
      { id: 5, name: "Jaggery Powder (1kg)", seller: "Nellore Sweet Mill", price: 95, mrp: 120, discount: 21, rating: 4.5, reviews: 680, organic: false, in_stock: true },
    ],
    categories: ["Rice and Grains", "Oils", "Spices", "Dairy", "Pulses", "Vegetables", "Fruits", "Organic"],
  },
  orders: [
    { id: "CO-8821", date: mkDate(2026,10,20), items: "Sona Masoori Rice 5kg x2, Groundnut Oil 1L x3", total: 1635, status: "out_for_delivery", expected: mkDate(2026,10,24) },
    { id: "CO-8789", date: mkDate(2026,10,10), items: "Turmeric 500g x2, Desi Ghee 500ml x1", total: 970, status: "delivered", delivered_on: mkDate(2026,10,13) },
    { id: "CO-8742", date: mkDate(2026,9,25), items: "Jaggery 1kg x5, Raw Honey 250ml x2", total: 1060, status: "delivered", delivered_on: mkDate(2026,9,28) },
  ],
  spendingHistory: years.map((y, i) => ({
    year: y,
    amount: [8400, 11200, 14800, 16200, 18600, 15300][i],
    orders: [18, 24, 32, 35, 40, 33][i],
  })),
  monthlySpending: months.map((m, i) => ({
    month: m,
    amount: [1200,800,950,1100,1800,1400,1100,900,1600,2100,1500,1050][i],
  })),
  cart: [
    { id: 1, name: "Organic Sona Masoori Rice (5kg)", price: 390, qty: 2, seller: "Sri Venkateswara Mill" },
    { id: 2, name: "Turmeric Powder (500g)", price: 145, qty: 3, seller: "Nizamabad Spice Traders" },
  ],
  smartBuying: {
    price_alerts: [
      { product: "Groundnut Oil 1L", target_price: 260, current_price: 285, status: "monitoring" },
      { product: "Basmati Rice 5kg", target_price: 480, current_price: 510, status: "monitoring" },
    ],
    recommendations: [
      { product: "Rice Bran Oil 1L", reason: "Price dropped 18% this week - lowest in 6 months", deal_score: 92 },
      { product: "Wheat Atta 10kg", reason: "Stock offered directly by mill - 22% below market", deal_score: 88 },
    ],
  },
};

export interface DemoRoleConfig {
  id: DemoRole;
  label: string;
  subtitle: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  gradient: string;
  features: {
    name: string;
    icon: string;
    href: string;
    description: string;
  }[];
  demoUser: {
    id: number;
    full_name: string;
    role: string;
    email?: string;
    phone_number?: string;
  };
  stats: { label: string; value: string; icon: string }[];
}

export const DEMO_ROLE_CONFIGS: DemoRoleConfig[] = [
  {
    id: "farmer",
    label: "Farmer",
    subtitle: "Ravi Kumar Reddy · 7.2 Acres · AP",
    icon: "🌾",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/40",
    borderColor: "border-green-200 dark:border-green-800",
    gradient: "from-green-500 to-emerald-600",
    demoUser: { id: 1001, full_name: "Ravi Kumar Reddy", role: "farmer", phone_number: "9876543210" },
    stats: [
      { label: "Land Holding", value: "7.2 Acres", icon: "🌍" },
      { label: "Active Crops", value: "3 Crops", icon: "🌱" },
      { label: "Annual Income", value: "Rs.2.85L", icon: "💰" },
      { label: "Paddy Yield", value: "4.9 T/Acre", icon: "📈" },
    ],
    features: [
      { name: "Dashboard", icon: "🏠", href: "/dashboard/farmer", description: "Live overview: weather, crops, wallet and news" },
      { name: "Farmer Profile", icon: "👤", href: "/dashboard/farmer/profile", description: "Farmer ID, land records, Aadhaar and bank details" },
      { name: "Weather and Soil", icon: "⛅", href: "/dashboard/farmer/weather", description: "7-day forecast + live soil NPK readings" },
      { name: "News and Alerts", icon: "📰", href: "/dashboard/farmer/news", description: "Government schemes, weather alerts and advisories" },
      { name: "Community and Chats", icon: "💬", href: "/dashboard/farmer/community", description: "Peer chat with farmers and agronomists" },
      { name: "Annual Summary (5-Yr Data)", icon: "📅", href: "/dashboard/farmer/annual-summary", description: "5-year crop yield, revenue and expense history" },
      { name: "Analytics and Trends", icon: "📈", href: "/dashboard/farmer/analytics", description: "Yield comparisons and production trends" },
      { name: "Season Comparison", icon: "🌾", href: "/dashboard/farmer/season-comparison", description: "Kharif vs Rabi performance across seasons" },
      { name: "My Crops", icon: "🌱", href: "/dashboard/farmer/crops", description: "Paddy, Cotton and Maize with AI health status" },
      { name: "Market Prices", icon: "📊", href: "/dashboard/farmer/market-prices", description: "Real-time APMC prices + 5-year price trends" },
      { name: "Finance and Loans", icon: "🏦", href: "/dashboard/farmer/finance", description: "Wallet, KCC loans, PMFBY crop insurance" },
      { name: "Soil and Nutrition", icon: "🧪", href: "/dashboard/farmer/nutrition", description: "NPK analysis + fertilizer recommendations" },
      { name: "Farm Calendar", icon: "🗓️", href: "/dashboard/farmer/calendar", description: "Upcoming sowings, sprayings and harvest events" },
      { name: "My Orders", icon: "📦", href: "/dashboard/farmer/orders", description: "Seeds, fertilizers and input deliveries tracker" },
      { name: "Buy Inputs", icon: "🛒", href: "/dashboard/farmer/market", description: "Fertilizers and seeds from nearby agro shops" },
      { name: "Sell to Mills", icon: "🏭", href: "/dashboard/farmer/mills", description: "Pool crops and get direct mill rates" },
      { name: "Warehouse and Storage", icon: "🏬", href: "/dashboard/farmer/storage", description: "Cold storage booking and receipt financing" },
      { name: "Learning Hub", icon: "🎥", href: "/dashboard/farmer/learning", description: "Video tutorials on modern high-yield farming" },
      { name: "Emergency SOS", icon: "🚨", href: "/dashboard/farmer/emergency", description: "Instant emergency assistance for crop disease" },
      { name: "Settings", icon: "⚙️", href: "/dashboard/farmer/settings", description: "Account security, language and notification settings" },
    ],
  },
  {
    id: "shop",
    label: "Shop Owner",
    subtitle: "Krishna Agro Center · Nuzividu, AP",
    icon: "🏪",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    borderColor: "border-blue-200 dark:border-blue-800",
    gradient: "from-blue-500 to-cyan-600",
    demoUser: { id: 1002, full_name: "Venkat Rao Potti", role: "shop", phone_number: "9848012345" },
    stats: [
      { label: "Annual Revenue", value: "Rs.38.4L", icon: "💹" },
      { label: "Products", value: "7 Items", icon: "📦" },
      { label: "Customers", value: "1,842", icon: "👥" },
      { label: "Rating", value: "4.7 Stars", icon: "⭐" },
    ],
    features: [
      { name: "Dashboard", icon: "🏠", href: "/dashboard/shop", description: "Today's sales, low stock alerts and pending orders" },
      { name: "Inventory", icon: "📦", href: "/dashboard/shop/inventory", description: "7 product categories with reorder alerts" },
      { name: "Orders and Dispatch", icon: "📋", href: "/dashboard/shop/orders", description: "Manage customer orders and delivery status" },
      { name: "Customers Directory", icon: "👥", href: "/dashboard/shop/customers", description: "Active farmer database and purchase history" },
      { name: "Sales Analytics (5-Yr Trends)", icon: "📈", href: "/dashboard/shop/analytics", description: "5-year revenue trends and product performance" },
      { name: "Crop Calendar Demand", icon: "📅", href: "/dashboard/shop/crop-calendar", description: "Forecast input demand based on crop seasons" },
      { name: "Accounting and GST", icon: "🧾", href: "/dashboard/shop/accounting", description: "GST filing, receivables, payables and P and L" },
      { name: "Product Discovery", icon: "💡", href: "/dashboard/shop/discovery", description: "New products, brand deals and schemes" },
      { name: "Shop Profile", icon: "⚙️", href: "/dashboard/shop/profile", description: "Manage shop details, licenses and certifications" },
    ],
  },
  {
    id: "manufacturer",
    label: "Mill Owner",
    subtitle: "Sri Venkateswara Rice and Cotton Mill",
    icon: "🏭",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    borderColor: "border-amber-200 dark:border-amber-800",
    gradient: "from-amber-500 to-orange-600",
    demoUser: { id: 1003, full_name: "Prasad Babu Reddy", role: "manufacturer", phone_number: "9700012345" },
    stats: [
      { label: "Annual Revenue", value: "Rs.2.85Cr", icon: "💰" },
      { label: "Production", value: "4,980 T/yr", icon: "⚙️" },
      { label: "Employees", value: "48 Staff", icon: "👷" },
      { label: "Efficiency", value: "68.5%", icon: "📊" },
    ],
    features: [
      { name: "Dashboard", icon: "🏠", href: "/dashboard/manufacturer", description: "Daily production status, revenue and operational alerts" },
      { name: "Procurement and Purchases", icon: "🚜", href: "/dashboard/manufacturer/purchases", description: "Buy paddy and cotton directly from farmers and APMC" },
      { name: "Production and Batches", icon: "⚙️", href: "/dashboard/manufacturer/production", description: "Batch management, milling efficiency and output" },
      { name: "Inventory Management", icon: "📦", href: "/dashboard/manufacturer/inventory", description: "Raw material silos and finished goods tracking" },
      { name: "B2B Sales and Dispatches", icon: "📤", href: "/dashboard/manufacturer/sales", description: "Wholesale sales to retailers, chains and exporters" },
      { name: "Orders Fulfillment", icon: "📋", href: "/dashboard/manufacturer/orders", description: "Commercial order tracking and dispatch schedules" },
      { name: "Analytics (5-Yr History)", icon: "📈", href: "/dashboard/manufacturer/analytics", description: "5-year milling output and revenue growth trends" },
      { name: "AI Market Intelligence", icon: "🧠", href: "/dashboard/manufacturer/intelligence", description: "AI demand forecasting and procurement price signals" },
      { name: "Accounting and Financials", icon: "🧾", href: "/dashboard/manufacturer/accounting", description: "P and L balance sheet, GST invoices and statements" },
      { name: "Mill Profile", icon: "⚙️", href: "/dashboard/manufacturer/profile", description: "Mill capacity, ISO/FSSAI certifications and settings" },
    ],
  },
  {
    id: "customer",
    label: "Buyer",
    subtitle: "Priya Sharma · Gold Member · Hyderabad",
    icon: "🛍️",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/40",
    borderColor: "border-purple-200 dark:border-purple-800",
    gradient: "from-purple-500 to-pink-600",
    demoUser: { id: 1004, full_name: "Priya Sharma", role: "customer", email: "priya.sharma@gmail.com" },
    stats: [
      { label: "Total Orders", value: "142 Orders", icon: "📦" },
      { label: "Total Spent", value: "Rs.84,500", icon: "💳" },
      { label: "Money Saved", value: "Rs.12,600", icon: "🎉" },
      { label: "Loyalty Points", value: "2,840 pts", icon: "⭐" },
    ],
    features: [
      { name: "Home and Feed", icon: "🏠", href: "/dashboard/customer", description: "Personalized feed with farm deals and recommendations" },
      { name: "Farm Marketplace", icon: "🛒", href: "/dashboard/customer/marketplace", description: "Buy 100% organic food directly from farms and mills" },
      { name: "Products Catalog", icon: "🌾", href: "/dashboard/customer/products", description: "Browse verified rice, oils, pulses, honey and spices" },
      { name: "Shopping Cart", icon: "🛍️", href: "/dashboard/customer/cart", description: "Review selected items and instant checkout" },
      { name: "My Orders and Tracking", icon: "📦", href: "/dashboard/customer/orders", description: "Live dispatch and doorstep delivery tracking" },
      { name: "Smart Buying", icon: "🧠", href: "/dashboard/customer/smart-buying", description: "AI-powered price drop alerts and lowest-rate alerts" },
      { name: "Customer Profile", icon: "⚙️", href: "/dashboard/customer/profile", description: "Delivery addresses, loyalty points and preferences" },
    ],
  },
];

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
  const cleanUrl = url.split("?")[0].toLowerCase();

  // Auth demo endpoints
  if (cleanUrl.includes("/auth/demo-login")) {
    return {
      access_token: "demo-token-active",
      token_type: "bearer",
      role: "farmer",
      id: 1001,
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
  if (cleanUrl.includes("/weather")) {
    return farmerDemoData.weather;
  }
  if (cleanUrl.includes("/news")) {
    return farmerDemoData.news;
  }
  if (cleanUrl.includes("/market-prices") || cleanUrl.includes("/prices")) {
    return farmerDemoData.marketPrices;
  }
  if (cleanUrl.includes("/orders/my-orders") || (cleanUrl.includes("/orders") && !cleanUrl.includes("/shop") && !cleanUrl.includes("/customer") && !cleanUrl.includes("/manufacturer"))) {
    return farmerDemoData.orders;
  }
  if (cleanUrl.includes("/farmer/finance") || cleanUrl.includes("/finance")) {
    return farmerDemoData.finance;
  }
  if (cleanUrl.includes("/farmer/crop-health") || cleanUrl.includes("health")) {
    return [
      { crop_id: 1, status: "healthy", notes: "Optimal growth, leaf color normal" },
      { crop_id: 2, status: "monitor", notes: "Bollworm alert in Krishna district, inspect flowers" },
      { crop_id: 3, status: "healthy", notes: "Harvested with 6.2 tons yield" },
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
  if (cleanUrl.includes("/community/channels") || cleanUrl.includes("/community/channel")) {
    return [
      { id: 1, name: "AP Paddy Growers Group", channel_type: "group", location_tag: "Krishna, AP", created_at: "2024-01-01", last_message: "Sold 20 quintals at Nuzividu APMC today!", last_message_time: "2026-10-24T18:30:00" },
      { id: 2, name: "Cotton Pest Management", channel_type: "group", location_tag: "Andhra Pradesh", created_at: "2024-02-01", last_message: "Spray Chlorpyriphos 20 EC in early morning", last_message_time: "2026-10-24T16:15:00" },
      { id: 3, name: "Agronomist Dr. Anjali", channel_type: "p2p", location_tag: "Nuzividu KVK", created_at: "2024-03-01", last_message: "Your soil pH of 6.8 is excellent for paddy.", last_message_time: "2026-10-23T11:00:00" },
    ];
  }
  if (cleanUrl.includes("/community/messages") || cleanUrl.includes("/messages")) {
    return [
      { id: 101, channel_id: 1, sender_id: 201, sender_name: "Suresh Naidu", sender_role: "farmer", message_text: "Anyone else seeing pink bollworm in cotton this season?", created_at: "2026-10-24T16:00:00" },
      { id: 102, channel_id: 1, sender_id: 301, sender_name: "Dr. Anjali (Agronomist)", sender_role: "expert", message_text: "Reminder: Spray Chlorpyriphos 20 EC for bollworm. Do it in early morning.", created_at: "2026-10-24T17:30:00" },
      { id: 103, channel_id: 1, sender_id: 1001, sender_name: "Ravi Kumar Reddy", sender_role: "farmer", message_text: "Sold 20 quintals of paddy at Nuzividu APMC - got Rs.2,420/quintal. Good rates!", created_at: "2026-10-24T18:30:00" },
    ];
  }
  if (cleanUrl.includes("/community/farmers") || cleanUrl.includes("/farmers")) {
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
  if (cleanUrl.includes("/shop/inventory") || cleanUrl.includes("/products/shop")) {
    return shopDemoData.inventory;
  }
  if (cleanUrl.includes("/shop/orders") || cleanUrl.includes("/shop/sales")) {
    return shopDemoData.recentOrders;
  }
  if (cleanUrl.includes("/shop/analytics")) {
    return shopDemoData.annualSales;
  }
  if (cleanUrl.includes("/shop/customers") || cleanUrl.includes("/customers")) {
    return [
      { id: 1, name: "Ravi Kumar Reddy", village: "Kondapally", total_purchases: 84500, orders_count: 14, last_order: "2026-10-22" },
      { id: 2, name: "Lakshmi Devi", village: "Agiripalli", total_purchases: 42000, orders_count: 8, last_order: "2026-10-20" },
      { id: 3, name: "Srinivas Rao", village: "Musunuru", total_purchases: 68000, orders_count: 11, last_order: "2026-10-18" },
    ];
  }

  // Manufacturer endpoints
  if (cleanUrl.includes("/manufacturer/profile")) {
    return manufacturerDemoData.profile;
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
  if (cleanUrl.includes("/manufacturer/intelligence") || cleanUrl.includes("/intelligence")) {
    return manufacturerDemoData.intelligence;
  }
  if (cleanUrl.includes("/manufacturer/analytics")) {
    return manufacturerDemoData.annualProduction;
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
  if (cleanUrl.includes("/marketplace") || cleanUrl.includes("/products")) {
    return customerDemoData.marketplace.featured;
  }

  return null;
}

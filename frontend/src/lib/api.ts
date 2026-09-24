import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
console.log("API Client initialized with baseURL:", API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const requestUrl = String(error.config?.url || '');
        const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register') || requestUrl.includes('/auth/send-register-otp') || requestUrl.includes('/auth/forgot-password') || requestUrl.includes('/auth/verify-otp') || requestUrl.includes('/auth/reset-password');
        if (error.response?.status === 401 && typeof window !== 'undefined' && !isAuthRequest) {
            // Token expired or invalid
            console.warn("Authentication error, redirecting to login");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export interface Crop {
    id: number;
    user_id: number;
    name: string;
    area: number;
    season?: string;
    variety?: string;
    sowing_date: string;
    expected_harvest_date?: string;
    status: string;
    notes?: string;
    total_cost?: number;
    total_revenue?: number;
    actual_yield?: number;
    selling_price_per_unit?: number;
    net_profit?: number;
    actual_harvest_date?: string;
}

export interface CropUpdate {
    name?: string;
    area?: number;
    season?: string;
    variety?: string;
    sowing_date?: string;
    expected_harvest_date?: string;
    status?: string;
    notes?: string;
}

export interface CropExpense {
    id: number;
    crop_id: number;
    category: string;
    type: string;
    quantity: number;
    unit: string;
    unit_cost: number;
    total_cost: number;
    date: string;
    payment_mode: string;
    unit_size?: number;
    duration?: number;
    stage?: string;
    bill_url?: string;
    notes?: string;
}

export interface CropHarvest {
    id: number;
    crop_id: number;
    date: string;
    stage: string;
    quantity: number;     // stored in quintals
    unit: string;
    unit_size?: number;   // bag size in kg (used during recording)
    quality: string;
    selling_price_per_unit: number;
    total_revenue: number;
    buyer_type?: string;
    sold_to?: string;
    notes?: string;
    status?: string;
}

export interface CropSale {
    id: number;
    crop_id: number;
    date: string;
    buyer_type: string;
    buyer_name: string;
    buyer_id?: string;
    quantity_quintals: number;
    total_bags: number;
    bag_size: number;
    price_per_quintal: number;
    total_revenue: number;
    payment_mode: string;
    notes?: string;
    status: string;
    harvest_ids?: number[];
}

export const getCropExpenses = async (cropId: number) => {
    const response = await api.get<CropExpense[]>(`/farmer/crops/${cropId}/expenses`);
    return response.data;
};

export const getAllFarmerExpenses = async () => {
    const response = await api.get<(CropExpense & { crop_name: string })[]>("/farmer/expenses");
    return response.data;
};

export const createCropExpense = async (cropId: number, expense: Partial<CropExpense>) => {
    const response = await api.post<CropExpense>(`/farmer/crops/${cropId}/expenses`, expense);
    return response.data;
};



export const updateCropExpense = async (expenseId: number, expense: Partial<CropExpense>) => {
    const response = await api.put<CropExpense>(`/farmer/crops/expenses/${expenseId}`, expense);
    return response.data;
};

export const deleteCropExpense = async (expenseId: number) => {
    const response = await api.delete(`/farmer/crops/expenses/${expenseId}`);
    return response.data;
};

export const getCropHarvests = async (cropId: number) => {
    const response = await api.get<CropHarvest[]>(`/farmer/crops/${cropId}/harvests`);
    return response.data;
};

export const createCropHarvest = async (cropId: number, harvest: Partial<CropHarvest>) => {
    const response = await api.post<CropHarvest>(`/farmer/crops/${cropId}/harvests`, harvest);
    return response.data;
};

export const updateCropHarvest = async (harvestId: number, harvest: Partial<CropHarvest>) => {
    const response = await api.put<CropHarvest>(`/farmer/crops/harvests/${harvestId}`, harvest);
    return response.data;
};

export const deleteCropHarvest = async (harvestId: number) => {
    const response = await api.delete(`/farmer/crops/harvests/${harvestId}`);
    return response.data;
};

export const getCropSales = async (cropId: number) => {
    const response = await api.get<CropSale[]>(`/farmer/crops/${cropId}/sales`);
    return response.data;
};

export const createCropSale = async (cropId: number, sale: Partial<CropSale>) => {
    const response = await api.post<CropSale>(`/farmer/crops/${cropId}/sales`, sale);
    return response.data;
};

export const deleteCropSale = async (saleId: number) => {
    const response = await api.delete(`/farmer/crops/sales/${saleId}`);
    return response.data;
};

export interface Insight {
    type: "info" | "warning" | "alert" | "success";
    category: string;
    message: string;
    action: string;
}

export interface Prediction {
    predicted_profit: number;
    estimated_revenue: number;
    estimated_cost: number;
    confidence: string;
    message: string;
}

export interface CropRecommendation {
    name: string;
    reason: string;
}

export interface MarketTrend {
    crop: string;
    price: number;
    unit: string;
    change: number;
    trend: "up" | "down" | "stable";
}

export const updateCrop = async (id: number, cropData: CropUpdate) => {
    const response = await api.put<Crop>(`/crops/${id}`, cropData);
    return response.data;
};

export const getCropDetails = async (id: number) => {
    const response = await api.get<Crop>(`/crops/${id}`);
    return response.data;
};

// Duplicates removed.
export const getCropInsights = async (cropId: number) => {
    const response = await api.get<{ insights: Insight[], prediction: Prediction }>(`/analytics/crop/${cropId}/insights`);
    return response.data;
};

export const getRecommendations = async () => {
    const response = await api.get<CropRecommendation[]>("/analytics/recommendations");
    return response.data;
};

export const getMarketTrends = async () => {
    const response = await api.get<MarketTrend[]>("/analytics/market-trends");
    return response.data;
};


// Shop & Product Interfaces
export interface Product {
    id: number;
    name: string;
    short_name?: string;
    category: string;
    brand?: string;
    manufacturer?: string;
    price: number;
    cost_price?: number;
    quantity: number;
    unit: string;
    measure_unit?: string;
    quantity_per_unit?: number;
    batch_number: string;
    description?: string;
    main_composition?: string;
    manufacture_date?: string;
    image_url?: string;
    product_image_url?: string;
    low_stock_threshold?: number;
    user_id: number;
    traceability_json?: string;
    expiry_date?: string;
    apportioned_transport?: number;
    apportioned_labour?: number;
    apportioned_other?: number;
    status?: 'draft' | 'active';
    created_at?: string;
}

export interface ShopOrderItem {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

export interface ShopOrder {
    id: number;
    shop_id: number;
    farmer_id?: number;
    farmer_name?: string;
    total_amount: number;
    discount: number;
    final_amount: number;
    payment_mode: string;
    payment_status?: string;
    payment_id?: string;
    status: string;
    created_at: string;
    items?: ShopOrderItem[];
    total_expenses?: number;
    total_cost?: number;
    profit?: number;
}

export interface ShopOrderStatusUpdate {
    status?: string;
    payment_status?: string;
    discount?: number;
    expense_transportation?: number;
    expense_labour?: number;
    expense_other?: number;
    expense_notes?: string;
}

export interface ShopAnalytics {
  total_products: number;
  total_stock: number;
  today_sales: number;
  month_revenue: number;
  low_stock_count: number;
  pending_orders: number;
}

// Revenue report interface (from /analytics/shop/revenue)
export interface RevenueReport {
  total_revenue: number;
  total_cost: number;
  total_expenses: number;
  profit: number;
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  avg_ticket: number;
}

export const getShopRevenue = async (period?: string) => {
  const url = period ? `/analytics/shop/revenue?period=${period}` : "/analytics/shop/revenue";
  const response = await api.get<RevenueReport>(url);
  return response.data;
};

export interface CategoryRevenue {
  category: string;
  revenue: number;
  qty_sold: number;
  profit: number;
}

export const getCategoryRevenue = async (period?: string) => {
  const url = period ? `/analytics/shop/category-revenue?period=${period}` : "/analytics/shop/category-revenue";
  const response = await api.get<CategoryRevenue[]>(url);
  return response.data;
};

export interface ContactInfo {
  user_id: number;
  full_name: string;
  role: string;
  phone_number?: string;
  address?: string;
  profile_picture_url?: string;
  village?: string;
  mandal?: string;
  district?: string;
  state?: string;
}

export interface ShopOrderDetailed {
  id: number;
  shop_id: number;
  farmer_id?: number;
  farmer_name?: string;
  farmer_contact?: ContactInfo;
  total_amount: number;
  discount: number;
  final_amount: number;
  payment_mode: string;
  payment_status?: string;
  status: string;
  created_at: string;
  total_cost: number;
  total_expenses: number;
  profit: number;
  expense: {
    transportation: number;
    labour: number;
    other: number;
    notes?: string;
    total: number;
  } | null;
  items: {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    cost_price: number;
  }[];
}

export const getShopOrdersDetailed = async () => {
  const response = await api.get<ShopOrderDetailed[]>("/orders/shop-orders-detailed");
  return response.data;
};

export interface SalesTrend {
    date: string;
    sales: number;
    order_count: number;
}

// Shop API
export const getMyProducts = async () => {
    const response = await api.get<Product[]>("/products/my/all");
    return response.data;
}

export const updateProduct = async (id: number, data: Partial<Product>) => {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
}

export const deleteProduct = async (id: number) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
}

export const markProductStatus = async (id: number, status: 'draft' | 'active') => {
    const response = await api.patch(`/products/${id}/status`, { status });
    return response.data;
}

export interface ProductBatchReceiveInfo {
    name: string;
    category: string;
    brand?: string;
    batch_number: string;
    cost_price: number;
    selling_price: number;
    quantity: number;
    unit?: string;
    description?: string;
    manufacture_date?: string;
    expiry_date?: string;
}

export interface BulkProductReceive {
    items: ProductBatchReceiveInfo[];
    total_transport_cost: number;
    total_labour_cost: number;
    total_other_cost: number;
    expense_notes?: string;
}

export const bulkReceiveStock = async (data: BulkProductReceive) => {
    const response = await api.post("/products/bulk-receive", data);
    return response.data;
}

export interface DraftBatch {
    id: number;
    name: string;
    batch_number: string;
    cost_price: number;
    quantity: number;
    unit: string;
    total_value: number;
    category: string;
    created_at: string;
    apportioned_transport: number;
    apportioned_labour: number;
    apportioned_other: number;
}

export const getDraftBatches = async (): Promise<DraftBatch[]> => {
    const response = await api.get<DraftBatch[]>('/shop-accounting/draft-batches');
    return response.data;
}

export const getShopOrders = async () => {
    const response = await api.get<ShopOrder[]>("/orders/shop-orders");
    return response.data;
}

export const updateOrderStatus = async (id: number, updateData: ShopOrderStatusUpdate) => {
    const response = await api.put<ShopOrder>(`/orders/${id}/status`, updateData);
    return response.data;
}

export const createManualOrder = async (orderData: {
    items: { product_id: number, quantity: number }[],
    farmer_id?: number,
    discount?: number,
    payment_mode?: string,
    expense_transportation?: number,
    expense_labour?: number,
    expense_other?: number,
    expense_notes?: string
}) => {
    const response = await api.post<ShopOrder>("/orders/", orderData);
    return response.data;
}

export const getShopAnalytics = async () => {
    const response = await api.get<ShopAnalytics>("/analytics/shop/overview");
    return response.data;
}

export const getSalesTrend = async (period = "7d") => {
    const response = await api.get<SalesTrend[]>("/analytics/shop/sales-trend", { params: { period } });
    return response.data;
}

export interface TopProduct {
    product_id: number;
    product_name: string;
    category: string;
    batch_number?: string;
    batch_id?: number;
    units_sold: number;
    revenue: number;
    cost_price?: number;
    total_cost?: number;
    overhead?: number;
    profit: number;
    remaining_qty?: number;
}

export interface ChannelBreakdown {
    channel: string;
    orders: number;
    revenue: number;
    average_order_value: number;
}

export interface OrderHealthMetric {
    status: string;
    count: number;
    percentage: number;
}

export const getTopProducts = async (period = "30d") => {
    const response = await api.get<TopProduct[]>("/analytics/shop/top-products", { params: { period } });
    return response.data;
};

export const getChannelBreakdown = async (period = "30d") => {
    const response = await api.get<ChannelBreakdown[]>("/analytics/shop/channel-breakdown", { params: { period } });
    return response.data;
};

export const getOrderHealth = async (period = "30d") => {
    const response = await api.get<OrderHealthMetric[]>("/analytics/shop/order-health", { params: { period } });
    return response.data;
};

export interface ShopCustomer {
    id: number;
    name: string;
    full_name: string;
    total_orders: number;
    total_spent: number;
    last_order_date: string;
}

export const getShopCustomers = async () => {
    const response = await api.get<ShopCustomer[]>("/analytics/shop/customers");
    return response.data;
}


// Manufacturer Interfaces
export interface ManufacturerStats {
    raw_stock: number;
    finished_stock: number;
    today_purchases: number;
    today_sales: number;
    month_revenue: number;
    month_purchases: number;
    net_profit: number;
    total_batches: number;
    avg_efficiency: number;
}

export interface MillAccountingSummary {
    period: string;
    total_revenue: number;
    total_purchase_cost: number;
    total_processing_cost: number;
    total_expenses: number;
    net_profit: number;
    total_sales_count: number;
    avg_sale_value: number;
    expense_by_category: Record<string, number>;
}

export interface MillExpense {
    id: number;
    manufacturer_id: number;
    category: string;
    amount: number;
    description: string | null;
    expense_date: string;
    created_at: string;
}

export interface ManufacturerPurchase {
    id: number;
    manufacturer_id: number;
    farmer_id?: number;
    farmer_name: string;
    farmer_contact?: ContactInfo;
    crop_name: string;
    quantity: number;
    unit: string;
    price_per_unit: number;
    total_cost: number;
    transport_cost: number;
    quality_grade?: string;
    batch_id: string;
    date: string;
}

export interface ManufacturerSale {
    id: number;
    manufacturer_id: number;
    buyer_type: string;
    buyer_id?: number;
    buyer_name: string;
    buyer_contact?: ContactInfo;
    product_id: number;
    quantity: number;
    selling_price: number;
    discount: number;
    total_amount: number;
    payment_mode: string;
    invoice_id: string;
    delivery_status: string;
    date: string;
}

export interface ProductionBatch {
    id: number;
    manufacturer_id: number;
    input_product_id: number;
    input_qty: number;
    output_product_name: string;
    output_qty: number;
    output_unit: string;
    processing_cost: number;
    waste_qty: number;
    efficiency: number;
    batch_number: string;
    date: string;
}

// Manufacturer API Functions
export const getManufacturerStats = async () => {
    const response = await api.get<ManufacturerStats>("/manufacturer/stats");
    return response.data;
}

export const createPurchase = async (data: Omit<ManufacturerPurchase, "id" | "manufacturer_id" | "batch_id" | "date">) => {
    const response = await api.post<ManufacturerPurchase>("/manufacturer/purchases", data);
    return response.data;
}

export const getPurchases = async () => {
    const response = await api.get<ManufacturerPurchase[]>("/manufacturer/purchases");
    return response.data;
}

export const createProductionBatch = async (data: any) => {
    const response = await api.post<ProductionBatch>("/manufacturer/production", data);
    return response.data;
}

export const getProductionHistory = async () => {
    const response = await api.get<ProductionBatch[]>("/manufacturer/production");
    return response.data;
}

export const createManufacturerSale = async (data: any) => {
    const response = await api.post<ManufacturerSale>("/manufacturer/sales", data);
    return response.data;
}

export const getManufacturerSales = async () => {
    const response = await api.get<ManufacturerSale[]>("/manufacturer/sales");
    return response.data;
}

export const getMillSalesTrend = async (period = "7d") => {
    const response = await api.get<{ date: string; sales: number }[]>("/manufacturer/sales-trend", { params: { period } });
    return response.data;
}

export const updateSaleDeliveryStatus = async (saleId: number, delivery_status: string) => {
    const response = await api.patch<ManufacturerSale>(`/manufacturer/sales/${saleId}/status`, { delivery_status });
    return response.data;
}

export const getMillAccountingSummary = async (period = "30d") => {
    const response = await api.get<MillAccountingSummary>(`/manufacturer/accounting/summary`, { params: { period } });
    return response.data;
}

export const getMillExpenses = async (period = "30d") => {
    const response = await api.get<MillExpense[]>(`/manufacturer/accounting/expenses`, { params: { period } });
    return response.data;
}

export const addMillExpense = async (data: { category: string; amount: number; description?: string; expense_date?: string }) => {
    const response = await api.post<MillExpense>("/manufacturer/accounting/expenses", data);
    return response.data;
}

export const deleteMillExpense = async (id: number) => {
    const response = await api.delete(`/manufacturer/accounting/expenses/${id}`);
    return response.data;
}

export interface MillTopCrop {
    crop_name: string;
    total_cost: number;
    total_qty: number;
    count: number;
}

export interface MillTopProduct {
    product_id: number;
    product_name: string;
    revenue: number;
    units_sold: number;
    count: number;
}

export interface MillAnalytics {
    period: string;
    total_revenue: number;
    total_purchase_cost: number;
    total_processing_cost: number;
    total_expenses: number;
    net_profit: number;
    profit_margin: number;
    total_sales_count: number;
    avg_sale_value: number;
    avg_efficiency: number;
    top_crops: MillTopCrop[];
    top_products: MillTopProduct[];
}

export const getMillAnalytics = async (period = "30d") => {
    const response = await api.get<MillAnalytics>("/manufacturer/analytics", { params: { period } });
    return response.data;
}

// Customer Interfaces
export interface CartItem {
    id: number;
    product_id: number;
    product_name: string;
    price: number;
    quantity: number;
    image_url?: string;
    seller_name: string;
}

export interface CustomerOrderItem {
    product_name: string;
    quantity: number;
    price: number;
    seller_id: number;
    seller_contact?: ContactInfo;
}

export interface CustomerOrder {
    id: number;
    total_amount: number;
    status: string;
    created_at: string;
    items: CustomerOrderItem[];
}

// Customer API
export const getMarketplaceProducts = async (category?: string, search?: string) => {
    const params = { category, search };
    const response = await api.get<Product[]>("/customer/marketplace", { params });
    return response.data;
}

export const getProductDetails = async (id: number) => {
    const response = await api.get<Product>(`/customer/products/${id}`);
    return response.data;
}

export const getCart = async () => {
    const response = await api.get<CartItem[]>("/customer/cart");
    return response.data;
}

export const addToCart = async (productId: number, quantity: number) => {
    const response = await api.post("/customer/cart", { product_id: productId, quantity });
    return response.data;
}

export const removeFromCart = async (itemId: number) => {
    const response = await api.delete(`/customer/cart/${itemId}`);
    return response.data;
}

export const checkout = async () => {
    const response = await api.post<CustomerOrder>("/customer/checkout");
    return response.data;
}

export const getMyOrders = async () => {
    const response = await api.get<CustomerOrder[]>("/customer/orders");
    return response.data;
}

// --- Weather & Analytics ---

// --- Info Module ---

export interface WeatherData {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
    wind_speed: number;
    rainfall_mm: number;
    soil_moisture?: number;
    forecast: { day: string, date?: string, temp: number, temp_min?: number, condition: string, rain_prob: number, soil_moisture?: number }[];
    alerts: { type: 'warning' | 'caution' | 'info' | 'success', title: string, message: string }[];
    advice: string[];
    source?: string;
}

export interface SoilWeatherCurrent {
    date?: string;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    precipitation_sum?: number;
    windspeed_10m?: number;
    evapotranspiration?: number;
    et0_fao_evapotranspiration?: number;
    soil_moisture_0_to_1cm?: number;
    soil_moisture_1_to_3cm?: number;
    soil_moisture_3_to_9cm?: number;
    soil_moisture_9_to_27cm?: number;
    soil_moisture_27_to_81cm?: number;
    soil_moisture_0_to_7cm?: number;
    soil_moisture_7_to_28cm?: number;
    soil_moisture_28_to_100cm?: number;
    soil_moisture_100_to_255cm?: number;
    soil_temperature_0cm?: number;
    soil_temperature_6cm?: number;
    soil_temperature_18cm?: number;
    soil_temperature_54cm?: number;
    soil_temperature_0_to_7cm?: number;
    soil_temperature_7_to_28cm?: number;
    soil_temperature_28_to_100cm?: number;
    soil_temperature_100_to_255cm?: number;
    temperature_2m_max?: number;
    temperature_2m_min?: number;
}

export interface SoilWeatherDaily {
    date: string;
    temperature_2m_max?: number;
    temperature_2m_min?: number;
    temperature_2m?: number;
    precipitation_sum?: number;
    precipitation?: number;
    soil_moisture_0_to_1cm?: number;
    soil_moisture_0_to_7cm?: number;
    evapotranspiration?: number;
    et0_fao_evapotranspiration?: number;
    windspeed_10m?: number;
    relative_humidity_2m?: number;
    [key: string]: any;
}

export interface FarmerRecommendation {
    icon: string;
    type: "warning" | "caution" | "success" | "info";
    title: string;
    text: string;
}

export interface SoilWeatherResponse {
    latitude: number;
    longitude: number;
    elevation: number;
    timezone: string;
    date?: string;
    current: SoilWeatherCurrent;
    daily: SoilWeatherDaily[];
    recommendations: FarmerRecommendation[];
    source?: string;
}

export interface GeocodeResult {
    name: string;
    latitude: number;
    longitude: number;
    elevation: number;
    admin1: string;
    country: string;
    display: string;
    country_code: string;
}

export const getSoilWeatherForecast = async (lat: number, lon: number, lang?: string): Promise<SoilWeatherResponse> => {
    const params: any = { lat, lon };
    if (lang) params.lang = lang;
    const response = await api.get<SoilWeatherResponse>('/weather/forecast', { params });
    return response.data;
};

export const getSoilWeatherHistorical = async (lat: number, lon: number, date: string): Promise<SoilWeatherResponse> => {
    const response = await api.get<SoilWeatherResponse>('/weather/historical', { params: { lat, lon, date } });
    return response.data;
};

export const searchGeocodeCities = async (name: string): Promise<GeocodeResult[]> => {
    const response = await api.get<{ results: GeocodeResult[] }>('/weather/geocode', { params: { name } });
    return response.data.results || [];
};

export const getWeather = async (lat?: number, lon?: number, lang?: string) => {
    const params: any = lat && lon ? { lat, lon } : {};
    if (lang) params.lang = lang;
    const response = await api.get<WeatherData>('/weather/', { params });
    return response.data;
};

export interface MarketLocation {
    market_name: string;
    distance_km: number;
    price: number;
    change: number;
    trend: 'up' | 'down';
}

export interface MarketPrice {
    crop_name: string;
    market_price: number;
    change: number;
    trend: 'up' | 'down';
    nearest_mandi: string;
    msp: number;
    msp_comparison: 'above' | 'below' | 'n/a';
    markets: MarketLocation[];
}

export interface NewsItem {
    id: number;
    category: 'scheme' | 'tip' | 'market' | 'alert' | 'advisory' | 'technology';
    title: string;
    summary: string;
    source: string;
    verified: boolean;
    date: string;
    url?: string;
    image_url?: string;
}

export const getMarketPrices = async () => {
    const response = await api.get<MarketPrice[]>('/market/prices');
    return response.data;
};

export const getNews = async (q?: string) => {
    const params: Record<string, string> = {};
    if (q) params.q = q;
    const response = await api.get<NewsItem[]>('/news/', { params });
    return response.data;
};

// --- Location Services ---

export interface GeocodedLocation {
    formatted_address: string;
    components: {
        village: string;
        district: string;
        state: string;
        country: string;
        postcode: string;
    };
    lat: number;
    lng: number;
    confidence: number;
}

export interface NearbyPlace {
    name: string;
    type: string;
    lat: number;
    lng: number;
    distance_km: number;
    address: string;
}

export interface DistanceResult {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    distance_km: number;
    distance_miles: number;
}

export const geocodeAddress = async (q: string) => {
    const response = await api.get<GeocodedLocation>('/location/geocode', { params: { q } });
    return response.data;
};

export const reverseGeocode = async (lat: number, lon: number) => {
    const response = await api.get<GeocodedLocation>('/location/reverse', { params: { lat, lon } });
    return response.data;
};

export const getNearbyPlaces = async (lat: number, lon: number, types = 'market,shop', radius_km = 50) => {
    const response = await api.get<NearbyPlace[]>('/location/nearby', { params: { lat, lon, types, radius_km } });
    return response.data;
};

export const getDistance = async (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const response = await api.get<DistanceResult>('/location/distance', { params: { lat1, lon1, lat2, lon2 } });
    return response.data;
};

export const getFarmerOverview = async () => {
    const response = await api.get('/analytics/farmer/overview');
    return response.data;
};

export const getYieldTrend = async () => {
    const response = await api.get('/analytics/farmer/yield-trend');
    return response.data;
};

// --- RAG Chatbot API ---
export interface ChatMessage {
    question: string;
}

export interface ChatResponse {
    answer: string;
    source: "db_only" | "external" | "mixed";
    data_points?: any;
}

export const sendChatMessage = async (question: string, lang: string = "en"): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/rag/chat', { question, lang });
    return response.data;
};


// --- AI Crop Health Diagnosis API ---

export interface DiseaseInfo {
    disease_name: string;
    confidence: string;
    severity: string;
    description: string;
    affected_parts: string[];
    causes: string[];
}

export interface TreatmentStep {
    step_number: number;
    title: string;
    description: string;
    timing: string;
}

export interface PesticideRecommendation {
    name: string;
    type: string;
    dosage: string;
    application_method: string;
    frequency: string;
    precautions: string[];
}

export interface PreventionTip {
    tip: string;
    category: string;
}

export interface CropHealthDiagnosis {
    is_healthy: boolean;
    crop_detected: string;
    disease: DiseaseInfo | null;
    treatment_steps: TreatmentStep[];
    pesticide_recommendations: PesticideRecommendation[];
    prevention_tips: PreventionTip[];
    additional_notes: string;
    urgency_level: string;
}

export interface SupportedCrop {
    name: string;
    emoji: string;
}

export const diagnoseCropHealth = async (imageFile: File, cropName?: string, cropId?: number): Promise<CropHealthDiagnosis> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (cropName) {
        formData.append('crop_name', cropName);
    }
    if (cropId) {
        formData.append('crop_id', cropId.toString());
    }
    const response = await api.post<CropHealthDiagnosis>('/crop-health/diagnose', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 60s timeout for AI analysis
    });
    return response.data;
};

export interface CropDiagnosisHistoryItem {
    id: number;
    crop_id: number;
    image_url: string;
    created_at: string;
    diagnosis: CropHealthDiagnosis;
}

export const getCropDiagnosisHistory = async (cropId: number): Promise<CropDiagnosisHistoryItem[]> => {
    const response = await api.get<CropDiagnosisHistoryItem[]>(`/crop-health/history/${cropId}`);
    return response.data;
};

export const getSupportedCrops = async (): Promise<SupportedCrop[]> => {
    const response = await api.get<{ crops: SupportedCrop[] }>('/crop-health/supported-crops');
    return response.data.crops;
};

// --- Manufacturer Intelligence Mock API ---
export interface ProcurementInsight {
    date: string;
    predictedPrice: number;
    trend: 'up' | 'down' | 'stable';
    regionForecasts: { region: string; harvestStatus: string; impact: string }[];
    recommendation: "BUY NOW" | "WAIT" | "HOLD";
}

export interface InventoryOptimizationInsight {
    date: string;
    predictedDemand: number;
    currentStock: number;
    recommendation: string;
    alerts: { type: 'warning' | 'info' | 'critical'; message: string }[];
}

export const getProcurementIntelligence = async (): Promise<ProcurementInsight[]> => {
    // Mock data for Procurement Intelligence
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    date: "Week 1",
                    predictedPrice: 4500,
                    trend: "down",
                    regionForecasts: [
                        { region: "North Region", harvestStatus: "Starting in 2 weeks", impact: "Price drop expected" },
                        { region: "South Region", harvestStatus: "Ongoing", impact: "Stable supply" }
                    ],
                    recommendation: "WAIT"
                },
                {
                    date: "Week 2",
                    predictedPrice: 4300,
                    trend: "down",
                    regionForecasts: [],
                    recommendation: "WAIT"
                },
                {
                    date: "Week 3",
                    predictedPrice: 4100,
                    trend: "stable",
                    regionForecasts: [],
                    recommendation: "BUY NOW"
                },
                {
                    date: "Week 4",
                    predictedPrice: 4150,
                    trend: "up",
                    regionForecasts: [],
                    recommendation: "HOLD"
                }
            ]);
        }, 800);
    });
};

export const getInventoryOptimization = async (): Promise<InventoryOptimizationInsight[]> => {
    // Mock data for Inventory Optimization
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    date: "Jan",
                    predictedDemand: 12000,
                    currentStock: 15000,
                    recommendation: "Decrease production of Wheat Flour by 10%",
                    alerts: [{ type: "warning", message: "Risk of overstocking next month" }]
                },
                {
                    date: "Feb",
                    predictedDemand: 18000,
                    currentStock: 14000,
                    recommendation: "Increase production of Rice by 20%",
                    alerts: [{ type: "critical", message: "Potential stockout for Rice in 2 weeks" }]
                },
                {
                    date: "Mar",
                    predictedDemand: 15000,
                    currentStock: 16000,
                    recommendation: "Maintain current production levels",
                    alerts: [{ type: "info", message: "Inventory levels optimal" }]
                }
            ]);
        }, 800);
    });
};

// --- Customer Smart Buying Mock API ---
export interface CustomerSmartBuyingInsight {
    id: string;
    commodityName: string;
    currentPrice: number;
    trend: 'up' | 'down' | 'stable';
    priceHistory: { date: string; price: number }[];
    recommendation: "BUY NOW" | "WAIT";
    rationale: string;
    imageEmoji: string;
}

export const getCustomerSmartBuyingInsights = async (): Promise<CustomerSmartBuyingInsight[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: "c1",
                    commodityName: "Premium Basmati Rice",
                    currentPrice: 75,
                    trend: "down",
                    priceHistory: [
                        { date: "Day 1", price: 85 },
                        { date: "Day 2", price: 83 },
                        { date: "Day 3", price: 80 },
                        { date: "Day 4", price: 78 },
                        { date: "Day 5", price: 75 },
                    ],
                    recommendation: "BUY NOW",
                    rationale: "Prices are at a 3-month low due to recent bumper harvests in Punjab.",
                    imageEmoji: "🍚"
                },
                {
                    id: "c2",
                    commodityName: "Kashmiri Apples",
                    currentPrice: 150,
                    trend: "up",
                    priceHistory: [
                        { date: "Day 1", price: 130 },
                        { date: "Day 2", price: 135 },
                        { date: "Day 3", price: 140 },
                        { date: "Day 4", price: 145 },
                        { date: "Day 5", price: 150 },
                    ],
                    recommendation: "WAIT",
                    rationale: "Prices are artificially high due to transport delays. Expected to drop 10% next week.",
                    imageEmoji: "🍎"
                },
                {
                    id: "c3",
                    commodityName: "Toor Dal (Pigeon Pea)",
                    currentPrice: 110,
                    trend: "stable",
                    priceHistory: [
                        { date: "Day 1", price: 112 },
                        { date: "Day 2", price: 111 },
                        { date: "Day 3", price: 110 },
                        { date: "Day 4", price: 110 },
                        { date: "Day 5", price: 110 },
                    ],
                    recommendation: "BUY NOW",
                    rationale: "Stable pricing with no immediate drops expected. Good time to stock up.",
                    imageEmoji: "🍲"
                }
            ]);
        }, 800);
    });
};

// --- Blockchain Ledger APIs ---
export interface BlockchainBlock {
    id: number;
    block_index: number;
    timestamp: string;
    previous_hash: string;
    hash: string;
    payload: string;
    product_id?: number;
    certification_type?: string;
    verifier_name?: string;
}

export interface BlockchainStats {
    total_blocks: number;
    organic_certifications: number;
    fair_trade_verifications: number;
    traceability_events: number;
    is_ledger_valid: boolean;
}

export interface VerificationResult {
    is_valid: boolean;
    failing_block_index: number | null;
    message: string;
}

export const getBlockchainBlocks = async (): Promise<BlockchainBlock[]> => {
    const response = await api.get<BlockchainBlock[]>("/blockchain/blocks");
    return response.data;
};

export const verifyBlockchain = async (): Promise<VerificationResult> => {
    const response = await api.get<VerificationResult>("/blockchain/verify");
    return response.data;
};

export const getBlockchainStats = async (): Promise<BlockchainStats> => {
    const response = await api.get<BlockchainStats>("/blockchain/stats");
    return response.data;
};

export const certifyProduct = async (data: {
    product_id: number;
    certification_type: string;
    verifier_name: string;
    details: any;
}): Promise<BlockchainBlock> => {
    const response = await api.post<BlockchainBlock>("/blockchain/certify", data);
    return response.data;
};

export const tamperBlockchain = async (blockIndex: number, tamperedPayload: string) => {
    const response = await api.post("/blockchain/tamper-demo", null, {
        params: { block_index: blockIndex, tampered_payload: tamperedPayload }
    });
    return response.data;
};

// --- Plot Nutrition ---

export interface LiveSoilStatus {
    baseline: {
        nitrogen: number;
        phosphorus: number;
        potassium: number;
        ph_level: number;
        organic_carbon?: number | null;
        last_tested?: string | null;
    };
    adjusted: {
        nitrogen: number;
        phosphorus: number;
        potassium: number;
        ph_level: number;
    };
    deltas: {
        nitrogen: number;
        phosphorus: number;
        potassium: number;
        ph_level: number;
    };
    added_nutrients: {
        nitrogen: number;
        phosphorus: number;
        potassium: number;
    };
    crop_absorbed: {
        nitrogen: number;
        phosphorus: number;
        potassium: number;
        crop_name: string;
        absorption_note: string;
    };
    total_applications: number;
    nutrient_balance: Record<string, string>;
    last_applied?: string | null;
}

export interface PlotSoilData {
    id: number;
    land_record_id: number;
    user_id: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph_level: number;
    organic_carbon: number | null;
    crop_id: number | null;
    last_tested: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface PlotOverview {
    land_record_id: number;
    serial_number: string;
    area: number;
    soil_data: PlotSoilData | null;
    crop_name: string | null;
    crop_status: string | null;
    crop_id: number | null;
    live_adjusted?: LiveSoilStatus | null;
}

export interface ActiveCrop {
    id: number;
    name: string;
    area: number;
    season: string | null;
    variety: string | null;
    sowing_date: string | null;
    expected_harvest_date: string | null;
    crop_type: string;
    status: string;
}

export interface PlotFertilizerRec {
    name: string;
    quantity: string;
    timing: string;
    application_method: string;
}

export interface PlotNutritionRecommendation {
    status: string;
    soil_health_summary: string;
    recommendations: PlotFertilizerRec[];
    additional_tips: string[];
}

export interface FertilizerApplicationData {
    id: number;
    plot_soil_data_id: number;
    user_id: number;
    fertilizer_name: string;
    quantity: number;
    unit: string;
    application_date: string;
    application_method: string | null;
    crop_id: number | null;
    notes: string | null;
    created_at: string;
}

export interface ImpactAnalysis {
    overall_status: string;
    nutrient_balance: Record<string, string>;
    estimated_levels: Record<string, number>;
    analysis_summary: string;
    adjusted_recommendations: PlotFertilizerRec[];
    risk_alerts: string[];
}

export const getPlots = async (): Promise<PlotOverview[]> => {
    const response = await api.get<PlotOverview[]>("/plot-nutrition/plots");
    return response.data;
};

export const getPlotLiveStatus = async (plotSoilId: number): Promise<LiveSoilStatus> => {
    const response = await api.get<LiveSoilStatus>(`/plot-nutrition/plots/${plotSoilId}/live-status`);
    return response.data;
};

export const getActiveCrops = async (): Promise<ActiveCrop[]> => {
    const response = await api.get<ActiveCrop[]>("/plot-nutrition/active-crops");
    return response.data;
};

export const savePlotSoilData = async (landRecordId: number, data: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    ph_level: number;
    organic_carbon?: number | null;
    notes?: string | null;
}): Promise<PlotSoilData> => {
    const response = await api.post<PlotSoilData>(`/plot-nutrition/plots/${landRecordId}/soil`, data);
    return response.data;
};

export const linkCropToPlot = async (plotSoilId: number, cropId: number): Promise<PlotSoilData> => {
    const response = await api.put<PlotSoilData>(`/plot-nutrition/plots/${plotSoilId}/link-crop`, { crop_id: cropId });
    return response.data;
};

export const getPlotRecommendation = async (plotSoilId: number): Promise<PlotNutritionRecommendation> => {
    const response = await api.post<PlotNutritionRecommendation>(`/plot-nutrition/plots/${plotSoilId}/recommend`);
    return response.data;
};

export const applyFertilizer = async (plotSoilId: number, data: {
    fertilizer_name: string;
    quantity: number;
    unit: string;
    application_date: string;
    application_method?: string;
    notes?: string;
}): Promise<FertilizerApplicationData> => {
    const response = await api.post<FertilizerApplicationData>(`/plot-nutrition/plots/${plotSoilId}/apply-fertilizer`, data);
    return response.data;
};

export const getFertilizerHistory = async (plotSoilId: number): Promise<FertilizerApplicationData[]> => {
    const response = await api.get<FertilizerApplicationData[]>(`/plot-nutrition/plots/${plotSoilId}/fertilizer-history`);
    return response.data;
};

export const analyzeFertilizerImpact = async (plotSoilId: number): Promise<ImpactAnalysis> => {
    const response = await api.post<ImpactAnalysis>(`/plot-nutrition/plots/${plotSoilId}/analyze-impact`);
    return response.data;
};

// ─── Crop Health Indicator ────────────────────────────────────────────

export interface CropHealthStatusData {
    id: number;
    crop_id: number;
    user_id: number;
    status: 'healthy' | 'monitor' | 'issue';
    notes?: string;
    updated_at: string;
}

export interface AISuggestion {
    suggestion: string;
    category: string;
    icon: string;
    all_suggestions?: { suggestion: string; category: string; icon: string; priority: number }[];
}

export const getAllCropHealthStatuses = async (): Promise<CropHealthStatusData[]> => {
    const response = await api.get<CropHealthStatusData[]>('/crop-health-indicator/crops');
    return response.data;
};

export const getCropHealthStatus = async (cropId: number): Promise<CropHealthStatusData> => {
    const response = await api.get<CropHealthStatusData>(`/crop-health-indicator/crop/${cropId}`);
    return response.data;
};

export const updateCropHealthStatus = async (
    cropId: number,
    data: { status?: string; notes?: string }
): Promise<CropHealthStatusData> => {
    const response = await api.put<CropHealthStatusData>(`/crop-health-indicator/crop/${cropId}`, data);
    return response.data;
};

export const getAISuggestion = async (): Promise<AISuggestion> => {
    const response = await api.get<AISuggestion>('/crop-health-indicator/suggestion');
    return response.data;
};

// ─── Farm Calendar ────────────────────────────────────────────────────

export interface FarmEvent {
    id: number;
    user_id: number;
    title: string;
    event_type: string; // sowing, fertilizer, weeding, harvest, loan, irrigation, spraying, custom
    event_date: string;
    description?: string;
    crop_id?: number;
    crop_name?: string;
    reminder_days_before: number;
    is_completed: boolean;
    color?: string;
    created_at: string;
}

export interface FarmEventCreate {
    title: string;
    event_type: string;
    event_date: string;
    description?: string;
    crop_id?: number;
    crop_name?: string;
    reminder_days_before?: number;
    is_completed?: boolean;
    color?: string;
}

export const getFarmEvents = async (month?: number, year?: number): Promise<FarmEvent[]> => {
    const params: Record<string, number> = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get<FarmEvent[]>('/farm-calendar/events', { params });
    return response.data;
};

export const getUpcomingFarmEvents = async (days: number = 7): Promise<FarmEvent[]> => {
    const response = await api.get<FarmEvent[]>('/farm-calendar/upcoming', { params: { days } });
    return response.data;
};

export const createFarmEvent = async (event: FarmEventCreate): Promise<FarmEvent> => {
    const response = await api.post<FarmEvent>('/farm-calendar/events', event);
    return response.data;
};

export const updateFarmEvent = async (eventId: number, data: Partial<FarmEventCreate>): Promise<FarmEvent> => {
    const response = await api.put<FarmEvent>(`/farm-calendar/events/${eventId}`, data);
    return response.data;
};

export const deleteFarmEvent = async (eventId: number): Promise<void> => {
    await api.delete(`/farm-calendar/events/${eventId}`);
};

export const toggleFarmEvent = async (eventId: number): Promise<{ id: number; is_completed: boolean }> => {
    const response = await api.patch<{ id: number; is_completed: boolean }>(`/farm-calendar/events/${eventId}/toggle`);
    return response.data;
};

// ─── Credit & Loan Tracker ──────────────────────────────
export interface CreditLoan {
    id: number;
    farmer_id: number;
    source_type: 'bank' | 'trader' | 'fertilizer_shop' | 'cooperative' | 'relative_friend' | 'other';
    lender_name: string;
    purpose: string;
    crop_id?: number;
    principal_amount: number;
    interest_rate_percent: number;
    interest_type: 'annual' | 'monthly' | 'flat' | 'none';
    start_date: string;
    due_date?: string;
    amount_paid: number;
    status: 'active' | 'paid_off' | 'overdue';
    notes?: string;
    created_at: string;
    updated_at: string;
    remaining_balance: number;
    days_until_due?: number | null;
    is_overdue: boolean;
}

export interface CreditLoanCreate {
    source_type: string;
    lender_name: string;
    purpose: string;
    crop_id?: number | null;
    principal_amount: number;
    interest_rate_percent?: number;
    interest_type?: string;
    start_date: string;
    due_date?: string | null;
    amount_paid?: number;
    status?: string;
    notes?: string;
}

export interface LoanRepayment {
    id: number;
    loan_id: number;
    payment_date: string;
    amount: number;
    payment_mode: 'cash' | 'upi' | 'bank_transfer' | 'harvest_crop' | 'other';
    notes?: string;
    created_at: string;
}

export interface LoanRepaymentCreate {
    payment_date: string;
    amount: number;
    payment_mode?: string;
    notes?: string;
}

export interface CreditSummary {
    total_borrowed: number;
    total_repaid: number;
    total_outstanding: number;
    active_loans_count: number;
    paid_off_count: number;
    overdue_count: number;
    upcoming_due_loans: CreditLoan[];
}

export const getCreditLoans = async (statusFilter?: string, sourceType?: string): Promise<CreditLoan[]> => {
    const params: Record<string, string> = {};
    if (statusFilter) params.status_filter = statusFilter;
    if (sourceType) params.source_type = sourceType;
    const response = await api.get<CreditLoan[]>('/credit-loans/', { params });
    return response.data;
};

export const getCreditSummary = async (): Promise<CreditSummary> => {
    const response = await api.get<CreditSummary>('/credit-loans/summary');
    return response.data;
};

export const getCreditLoan = async (loanId: number): Promise<CreditLoan> => {
    const response = await api.get<CreditLoan>(`/credit-loans/${loanId}`);
    return response.data;
};

export const createCreditLoan = async (data: CreditLoanCreate): Promise<CreditLoan> => {
    const response = await api.post<CreditLoan>('/credit-loans/', data);
    return response.data;
};

export const updateCreditLoan = async (loanId: number, data: Partial<CreditLoanCreate>): Promise<CreditLoan> => {
    const response = await api.put<CreditLoan>(`/credit-loans/${loanId}`, data);
    return response.data;
};

export const deleteCreditLoan = async (loanId: number): Promise<void> => {
    await api.delete(`/credit-loans/${loanId}`);
};

export const getLoanRepayments = async (loanId: number): Promise<LoanRepayment[]> => {
    const response = await api.get<LoanRepayment[]>(`/credit-loans/${loanId}/repayments`);
    return response.data;
};

export const addLoanRepayment = async (loanId: number, data: LoanRepaymentCreate): Promise<LoanRepayment> => {
    const response = await api.post<LoanRepayment>(`/credit-loans/${loanId}/repayments`, data);
    return response.data;
};

export const deleteLoanRepayment = async (loanId: number, repaymentId: number): Promise<void> => {
    await api.delete(`/credit-loans/${loanId}/repayments/${repaymentId}`);
};

// ─── Season Comparison ──────────────────────────────────
export interface MetricComparison {
    season_a_val: number;
    season_b_val: number;
    difference: number;
    percent_change: number;
    is_positive: boolean;
}

export interface SeasonSummary {
    season_name: string;
    year: number;
    label: string;
    crops_count: number;
    total_area_acres: number;
    total_cost: number;
    total_yield_quintals: number;
    total_revenue: number;
    net_profit: number;
    profit_margin_percent: number;
    yield_per_acre: number;
    cost_per_acre: number;
    profit_per_acre: number;
}

export interface CropComparisonItem {
    crop_name: string;
    season_a_area: number;
    season_b_area: number;
    season_a_yield: number;
    season_b_yield: number;
    season_a_cost: number;
    season_b_cost: number;
    season_a_revenue: number;
    season_b_revenue: number;
    season_a_profit: number;
    season_b_profit: number;
    profit_change_percent: number;
    yield_change_percent: number;
    cost_change_percent: number;
    status_text: string;
}

export interface SeasonComparisonResponse {
    season_a: SeasonSummary;
    season_b: SeasonSummary;
    profit_comparison: MetricComparison;
    yield_comparison: MetricComparison;
    cost_comparison: MetricComparison;
    revenue_comparison: MetricComparison;
    crop_comparisons: CropComparisonItem[];
    ai_insights: string[];
}

export const getAvailableSeasons = async (): Promise<string[]> => {
    const response = await api.get<string[]>('/season-comparison/seasons');
    return response.data;
};

export const compareSeasons = async (seasonA?: string, seasonB?: string): Promise<SeasonComparisonResponse> => {
    const params: Record<string, string> = {};
    if (seasonA) params.season_a = seasonA;
    if (seasonB) params.season_b = seasonB;
    const response = await api.get<SeasonComparisonResponse>('/season-comparison/compare', { params });
    return response.data;
};

export const getAllSeasonsOverview = async (): Promise<SeasonSummary[]> => {
    const response = await api.get<SeasonSummary[]>('/season-comparison/all-overview');
    return response.data;
};

// ─── Best Crop Recommendation ───────────────────────────
export interface AlternativeCrop {
    crop_name: string;
    icon: string;
    variety: string;
    expected_profit_per_acre: number;
    confidence_score: number;
    tag: string;
}

export interface BestCropRecommendation {
    crop_name: string;
    icon: string;
    variety: string;
    target_season: string;
    expected_profit_per_acre: number;
    expected_yield_per_acre: number;
    estimated_cost_per_acre: number;
    estimated_revenue_per_acre: number;
    confidence_score: number;
    headline: string;
    reason: string;
    past_profit_factor: string;
    market_trend_factor: string;
    weather_factor: string;
    alternatives: AlternativeCrop[];
}

export const getBestCropRecommendation = async (): Promise<BestCropRecommendation> => {
    const response = await api.get<BestCropRecommendation>('/recommendations/best-crop');
    return response.data;
};

// ─── Farm Reports (PDF Export) ──────────────────────────
export interface FarmReportMeta {
    crops_count: number;
    total_area_acres: number;
    total_yield_quintals: number;
    total_cost: number;
    total_revenue: number;
    net_profit: number;
    eligible_uses: string[];
}

export const getFarmReportPreviewMeta = async (season?: string): Promise<FarmReportMeta> => {
    const params: Record<string, string> = {};
    if (season) params.season = season;
    const response = await api.get<FarmReportMeta>('/farm-reports/preview-meta', { params });
    return response.data;
};

export const downloadFarmReportPdf = async (season?: string, year?: number): Promise<Blob> => {
    const params: Record<string, string | number> = {};
    if (season) params.season = season;
    if (year) params.year = year;
    const response = await api.get('/farm-reports/download', {
        params,
        responseType: 'blob',
    });
    return response.data;
};

export const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
};

// ─── Crop Insurance Tracker ─────────────────────────────
export interface CropInsurance {
    id: number;
    farmer_id: number;
    scheme_name: string;
    policy_number: string;
    insured_crop_name: string;
    crop_id?: number;
    season: string;
    area_insured_acres: number;
    sum_insured: number;
    farmer_premium_paid: number;
    gov_subsidy_amount?: number;
    insurance_company: string;
    application_date: string;
    policy_status: 'active' | 'expired' | 'claim_filed';
    claim_status: 'none' | 'submitted' | 'under_survey' | 'approved' | 'settled' | 'rejected';
    claim_amount_requested?: number;
    claim_amount_approved?: number;
    claim_loss_reason?: string;
    claim_filed_date?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CropInsuranceCreate {
    scheme_name?: string;
    policy_number: string;
    insured_crop_name: string;
    crop_id?: number | null;
    season: string;
    area_insured_acres: number;
    sum_insured: number;
    farmer_premium_paid: number;
    gov_subsidy_amount?: number;
    insurance_company?: string;
    application_date: string;
    policy_status?: string;
    claim_status?: string;
    notes?: string;
}

export interface CropInsuranceClaimRequest {
    claim_amount_requested: number;
    claim_loss_reason: string;
    claim_filed_date: string;
    notes?: string;
}

export interface CropInsuranceSummary {
    total_policies_count: number;
    active_policies_count: number;
    total_sum_insured: number;
    total_premium_paid: number;
    claims_pending_count: number;
    claims_settled_count: number;
    total_claims_received: number;
}

export interface PMFBYGuidance {
    scheme: string;
    helpline: {
        toll_free: string;
        kisan_call_center: string;
        official_portal: string;
        app_name: string;
    };
    critical_rule: string;
    steps: {
        step: number;
        title: string;
        description: string;
    }[];
    required_documents: string[];
}

export const getCropInsurances = async (policyStatus?: string, claimStatus?: string): Promise<CropInsurance[]> => {
    const params: Record<string, string> = {};
    if (policyStatus) params.policy_status = policyStatus;
    if (claimStatus) params.claim_status = claimStatus;
    const response = await api.get<CropInsurance[]>('/crop-insurance/', { params });
    return response.data;
};

export const getCropInsuranceSummary = async (): Promise<CropInsuranceSummary> => {
    const response = await api.get<CropInsuranceSummary>('/crop-insurance/summary');
    return response.data;
};

export const getCropInsurance = async (policyId: number): Promise<CropInsurance> => {
    const response = await api.get<CropInsurance>(`/crop-insurance/${policyId}`);
    return response.data;
};

export const createCropInsurance = async (data: CropInsuranceCreate): Promise<CropInsurance> => {
    const response = await api.post<CropInsurance>('/crop-insurance/', data);
    return response.data;
};

export const updateCropInsurance = async (policyId: number, data: Partial<CropInsuranceCreate>): Promise<CropInsurance> => {
    const response = await api.put<CropInsurance>(`/crop-insurance/${policyId}`, data);
    return response.data;
};

export const deleteCropInsurance = async (policyId: number): Promise<void> => {
    await api.delete(`/crop-insurance/${policyId}`);
};

export const fileInsuranceClaim = async (policyId: number, data: CropInsuranceClaimRequest): Promise<CropInsurance> => {
    const response = await api.post<CropInsurance>(`/crop-insurance/${policyId}/file-claim`, data);
    return response.data;
};

export const updateInsuranceClaimStatus = async (
    policyId: number,
    claimStatus: string,
    approvedAmount?: number
): Promise<CropInsurance> => {
    const params: Record<string, any> = { claim_status: claimStatus };
    if (approvedAmount !== undefined) params.claim_amount_approved = approvedAmount;
    const response = await api.patch<CropInsurance>(`/crop-insurance/${policyId}/claim-status`, null, { params });
    return response.data;
};

export const getPMFBYGuidance = async (): Promise<PMFBYGuidance> => {
    const response = await api.get<PMFBYGuidance>('/crop-insurance/guidance/pmfby');
    return response.data;
};

// ==================== CROP STORAGE TRACKING ====================
export interface CropStorage {
    id: number;
    farmer_id: number;
    crop_name: string;
    variety: string | null;
    storage_type: 'cold_storage' | 'warehouse_cwc_swc' | 'private_godown' | 'on_farm_silo' | 'other' | string;
    facility_name: string;
    location: string;
    receipt_number: string | null;
    bags_count: number;
    weight_quintals: number;
    bag_weight_kg: number;
    monthly_rent_per_bag: number;
    deposit_date: string;
    expected_release_date: string | null;
    actual_release_date: string | null;
    status: 'stored' | 'partially_released' | 'fully_released' | 'overdue_alert' | string;
    target_sell_price_per_quintal: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    days_in_storage: number;
    accumulated_rent: number;
    days_until_release: number | null;
    is_release_due: boolean;
}

export interface CropStorageCreate {
    crop_name: string;
    variety?: string;
    storage_type?: string;
    facility_name: string;
    location: string;
    receipt_number?: string;
    bags_count: number;
    weight_quintals: number;
    bag_weight_kg?: number;
    monthly_rent_per_bag?: number;
    deposit_date?: string;
    expected_release_date?: string;
    status?: string;
    target_sell_price_per_quintal?: number;
    notes?: string;
}

export interface CropStorageReleaseRequest {
    bags_released: number;
    release_date?: string;
    selling_price_per_quintal?: number;
    notes?: string;
}

export interface CropStorageSummary {
    total_bags_stored: number;
    total_quintals_stored: number;
    monthly_rent_commitment: number;
    total_accumulated_rent: number;
    active_facilities_count: number;
    release_due_count: number;
}

export const getCropStorages = async (status?: string): Promise<CropStorage[]> => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    const response = await api.get<CropStorage[]>('/crop-storage/', { params });
    return response.data;
};

export const getCropStorageSummary = async (): Promise<CropStorageSummary> => {
    const response = await api.get<CropStorageSummary>('/crop-storage/summary');
    return response.data;
};

export const getCropStorage = async (storageId: number): Promise<CropStorage> => {
    const response = await api.get<CropStorage>(`/crop-storage/${storageId}`);
    return response.data;
};

export const createCropStorage = async (data: CropStorageCreate): Promise<CropStorage> => {
    const response = await api.post<CropStorage>('/crop-storage/', data);
    return response.data;
};

export const updateCropStorage = async (storageId: number, data: Partial<CropStorageCreate>): Promise<CropStorage> => {
    const response = await api.put<CropStorage>(`/crop-storage/${storageId}`, data);
    return response.data;
};

export const deleteCropStorage = async (storageId: number): Promise<void> => {
    await api.delete(`/crop-storage/${storageId}`);
};

export const releaseCropStorage = async (storageId: number, data: CropStorageReleaseRequest): Promise<CropStorage> => {
    const response = await api.post<CropStorage>(`/crop-storage/${storageId}/release`, data);
    return response.data;
};

// ==================== SOIL PROFILE & TESTING ====================
export interface SoilProfile {
    id: number;
    farmer_id: number;
    land_record_id: number | null;
    plot_label: string;
    soil_type: string;
    shc_number: string | null;
    testing_lab: string;
    test_date: string;
    ph_level: number;
    organic_carbon_percent: number;
    ec_ds_m: number | null;
    nitrogen_kg_ha: number;
    phosphorus_kg_ha: number;
    potassium_kg_ha: number;
    sulphur_ppm: number | null;
    zinc_ppm: number | null;
    iron_ppm: number | null;
    boron_ppm: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    health_score: number;
    health_status: 'optimal' | 'moderate' | 'needs_attention' | string;
    ph_status: 'acidic' | 'neutral' | 'alkaline' | string;
    nitrogen_status: 'low' | 'medium' | 'high' | string;
    phosphorus_status: 'low' | 'medium' | 'high' | string;
    potassium_status: 'low' | 'medium' | 'high' | string;
    is_test_overdue: boolean;
}

export interface SoilProfileCreate {
    land_record_id?: number | null;
    plot_label?: string;
    soil_type?: string;
    shc_number?: string | null;
    testing_lab?: string;
    test_date?: string;
    ph_level?: number;
    organic_carbon_percent?: number;
    ec_ds_m?: number | null;
    nitrogen_kg_ha?: number;
    phosphorus_kg_ha?: number;
    potassium_kg_ha?: number;
    sulphur_ppm?: number | null;
    zinc_ppm?: number | null;
    iron_ppm?: number | null;
    boron_ppm?: number | null;
    notes?: string | null;
}

export interface SoilHealthSummary {
    total_profiles: number;
    dominant_soil_type: string;
    avg_health_score: number;
    overall_fertility: string;
    avg_ph: number;
    avg_organic_carbon: number;
    avg_n: number;
    avg_p: number;
    avg_k: number;
    overdue_tests_count: number;
    key_recommendation: string;
}

export const getSoilProfiles = async (): Promise<SoilProfile[]> => {
    const response = await api.get<SoilProfile[]>('/soil-profile/');
    return response.data;
};

export const getSoilHealthSummary = async (): Promise<SoilHealthSummary> => {
    const response = await api.get<SoilHealthSummary>('/soil-profile/summary');
    return response.data;
};

export const getSoilProfile = async (id: number): Promise<SoilProfile> => {
    const response = await api.get<SoilProfile>(`/soil-profile/${id}`);
    return response.data;
};

export const createSoilProfile = async (data: SoilProfileCreate): Promise<SoilProfile> => {
    const response = await api.post<SoilProfile>('/soil-profile/', data);
    return response.data;
};

export const updateSoilProfile = async (id: number, data: Partial<SoilProfileCreate>): Promise<SoilProfile> => {
    const response = await api.put<SoilProfile>(`/soil-profile/${id}`, data);
    return response.data;
};

export const deleteSoilProfile = async (id: number): Promise<void> => {
    await api.delete(`/soil-profile/${id}`);
};

export const seedDefaultSoilProfiles = async (): Promise<SoilProfile[]> => {
    const response = await api.post<SoilProfile[]>('/soil-profile/seed-defaults');
    return response.data;
};

// ==================== ANNUAL PERFORMANCE SUMMARY ====================
export interface YoYMetric {
    current: number;
    previous: number;
    difference: number;
    percent_change: number;
    is_positive: boolean;
}

export interface SeasonAnnualBreakdown {
    season_name: string;
    crops_count: number;
    area_acres: number;
    production_quintals: number;
    cost: number;
    revenue: number;
    net_profit: number;
    profit_share_percent: number;
}

export interface CropAnnualRank {
    rank: number;
    crop_id: number;
    crop_name: string;
    variety: string | null;
    season: string;
    area: number;
    yield_quintals: number;
    yield_per_acre: number;
    total_cost: number;
    revenue: number;
    net_profit: number;
    profit_per_acre: number;
    cost_benefit_ratio: number;
}

export interface ExpenseCategoryItem {
    category: string;
    amount: number;
    percentage: number;
}

export interface MonthlyCashflowItem {
    month_num: number;
    month_name: string;
    income: number;
    expenses: number;
    net: number;
}

export interface AnnualSummaryResponse {
    year: number;
    available_years: number[];
    total_crops_planted: number;
    gross_cropped_area_acres: number;
    net_operated_area_acres: number;
    cropping_intensity_percent: number;
    total_production_quintals: number;
    gross_revenue: number;
    total_input_cost: number;
    net_farm_income: number;
    profit_margin_percent: number;
    avg_return_per_acre: number;
    yoy_revenue: YoYMetric;
    yoy_profit: YoYMetric;
    yoy_cost: YoYMetric;
    yoy_yield: YoYMetric;
    seasonal_breakdown: SeasonAnnualBreakdown[];
    crop_rankings: CropAnnualRank[];
    expense_breakdown: ExpenseCategoryItem[];
    monthly_cashflow: MonthlyCashflowItem[];
    key_highlights: string[];
    audit_summary: string;
}

export const getAnnualSummaryYears = async (): Promise<number[]> => {
    const response = await api.get<number[]>('/annual-summary/years');
    return response.data;
};

export const getAnnualPerformanceSummary = async (year?: number): Promise<AnnualSummaryResponse> => {
    const params: Record<string, any> = {};
    if (year) params.year = year;
    const response = await api.get<AnnualSummaryResponse>('/annual-summary/', { params });
    return response.data;
};

// ==================== EMERGENCY CONTACTS & SOS DIRECTORY ====================
export interface EmergencyContact {
    id: number;
    farmer_id: number | null;
    name: string;
    category: 'national_helpline' | 'kvk_agriculture_officer' | 'electricity_power' | 'water_irrigation' | 'veterinary' | 'machinery_mechanic' | 'input_retailer' | 'other' | string;
    phone_number: string;
    alternate_phone: string | null;
    department_or_village: string | null;
    is_toll_free: boolean;
    is_verified: boolean;
    availability_hours: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    is_system_contact: boolean;
}

export interface EmergencyContactCreate {
    name: string;
    category?: string;
    phone_number: string;
    alternate_phone?: string;
    department_or_village?: string;
    is_toll_free?: boolean;
    availability_hours?: string;
    notes?: string;
}

export const getEmergencyContacts = async (category?: string): Promise<EmergencyContact[]> => {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    const response = await api.get<EmergencyContact[]>('/emergency-contacts/', { params });
    return response.data;
};

export const createEmergencyContact = async (data: EmergencyContactCreate): Promise<EmergencyContact> => {
    const response = await api.post<EmergencyContact>('/emergency-contacts/', data);
    return response.data;
};

export const updateEmergencyContact = async (id: number, data: Partial<EmergencyContactCreate>): Promise<EmergencyContact> => {
    const response = await api.put<EmergencyContact>(`/emergency-contacts/${id}`, data);
    return response.data;
};

export const deleteEmergencyContact = async (id: number): Promise<void> => {
    await api.delete(`/emergency-contacts/${id}`);
};

export default api;


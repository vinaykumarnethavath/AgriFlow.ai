"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { ContactInfo } from "@/lib/api";
import ContactInfoCard from "@/components/ui/ContactInfoCard";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import OrderChatModal from "@/components/chat/OrderChatModal";
import {
    ShoppingCart,
    Search,
    Package,
    Minus,
    Plus,
    Trash2,
    ArrowLeft,
    History,
    CheckCircle,
    Clock,
    Leaf,
    Droplets,
    Bug,
    Wrench,
    Store,
    Star,
    ChevronDown,
    CreditCard,
    Wallet,
    Box,
    MessageSquare,
    Truck,
    RefreshCw,
    X,
    User,
    Phone,
    MapPin,
    ShieldCheck,
    Check
} from "lucide-react";
import MockRazorpayPopup from "@/components/payment/MockRazorpayPopup";
import { useLanguage } from "@/context/LanguageContext";

interface Product {
    id: number;
    name: string;
    short_name?: string;
    category: string;
    brand?: string;
    price: number;
    quantity: number;
    batch_number: string;
    description?: string;
    image_url?: string;
    product_image_url?: string;
    user_id: number;
    seller_name?: string;
    unit?: string;
    quantity_per_unit?: number;
    manufacture_date?: string;
    main_composition?: string;
}

interface CartItem {
    product: Product;
    quantity: number;
}

interface ShopInfo {
    id: number;
    name: string;
    owner_name?: string;
    phone?: string;
    contact_number?: string;
    license_number?: string;
    village?: string;
    mandal?: string;
    district?: string;
    state?: string;
    pincode?: string;
    address?: string;
    distance_km?: number | null;
    rating?: number;
    profile_picture_url?: string;
    products_count?: number;
}

interface OrderItem {
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    image_url?: string;
    product_image_url?: string;
    brand?: string;
    manufacturer?: string;
    main_composition?: string;  // Product composition for farmer visibility
}

interface Order {
    id: number;
    shop_id: number;
    shop_name?: string;
    shop_contact?: ContactInfo;
    farmer_id?: number;
    total_amount: number;
    discount: number;
    final_amount: number;
    payment_mode: string;
    payment_status?: string;
    payment_id?: string;
    status: string;
    created_at: string;
    items?: OrderItem[];
}

// Short names commonly used by farmers
const COMMON_SHORT_NAMES: Record<string, string> = {
    "DAP": "DAP (Di-Ammonium Phosphate)",
    "MOP": "MOP (Muriate of Potash)",
    "NPK": "NPK Fertilizer",
    "Urea": "Urea (46-0-0)",
    "SSP": "SSP (Single Super Phosphate)",
    "ZnSO4": "Zinc Sulphate",
    "Potash": "Potash / MOP",
};

function MarketPageContent() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<CartItem[]>(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem("agri_farmer_cart");
                if (saved) return JSON.parse(saved);
            } catch (_) {}
        }
        return [];
    });
    const [showCart, setShowCart] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                if (cart && cart.length > 0) {
                    localStorage.setItem("agri_farmer_cart", JSON.stringify(cart));
                } else {
                    localStorage.removeItem("agri_farmer_cart");
                }
            } catch (_) {}
        }
    }, [cart]);

    useEffect(() => {
        if (searchParams?.get("tab") === "orders") {
            setShowHistory(true);
            setShowCart(false);
            fetchOrders();
        }
    }, [searchParams]);

    // Background polling while on orders tab to track shop confirmations
    useEffect(() => {
        if (!showHistory) return;
        const timer = setInterval(() => {
            if (typeof document !== "undefined" && document.hidden) return;
            api.get("/orders/my-orders")
                .then(res => setOrders(res.data))
                .catch(() => {});
        }, 8000);
        return () => clearInterval(timer);
    }, [showHistory]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedShop, setSelectedShop] = useState<number | null>(null);
    const [shops, setShops] = useState<ShopInfo[]>([]);
    const [nearbyShopIds, setNearbyShopIds] = useState<Set<number> | null>(null);
    const [radiusKm, setRadiusKm] = useState<number>(50);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [paymentMode, setPaymentMode] = useState<"cash" | "upi" | "razorpay">("upi");
    const [mockOptions, setMockOptions] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [orderNotes, setOrderNotes] = useState("");
    const [chatModalOpen, setChatModalOpen] = useState(false);
    const [chatTarget, setChatTarget] = useState<{
        userId: number;
        name: string;
        role: string;
        phone?: string | null;
        orderId?: number;
        orderSummary?: string;
    } | null>(null);

    const categories = [
        { id: "all", name: t("marketPage.allProducts", "All Products"), icon: Package },
        { id: "fertilizer", name: t("marketPage.fertilizers", "Fertilizers"), icon: Leaf },
        { id: "pesticide", name: t("marketPage.pesticides", "Pesticides"), icon: Bug },
        { id: "seeds", name: t("marketPage.seeds", "Seeds"), icon: Droplets },
        { id: "equipment", name: t("marketPage.equipment", "Equipment"), icon: Wrench },
    ];

    useEffect(() => {
        fetchProducts();
        fetchOrders();
        fetchNearbyShops(radiusKm);
    }, []);

    useEffect(() => {
        fetchNearbyShops(radiusKm);
    }, [radiusKm]);

    const fetchProducts = async () => {
        try {
            const response = await api.get("/products/");
            const prods: Product[] = response.data || [];
            setProducts(prods);

            // Ensure any shop that sells products is also represented
            setShops(prevShops => {
                const map = new Map<number, ShopInfo>();
                prevShops.forEach(s => map.set(s.id, s));
                prods.forEach(p => {
                    if (p.user_id && !map.has(p.user_id)) {
                        map.set(p.user_id, {
                            id: p.user_id,
                            name: p.seller_name || "Agri Input Dealer",
                        });
                    }
                });
                return Array.from(map.values());
            });
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNearbyShops = async (radius: number) => {
        try {
            let allShopDetails: ShopInfo[] = [];

            // 1. Fetch registered shops with full details from /products/shops
            try {
                const res = await api.get("/products/shops");
                if (Array.isArray(res.data)) {
                    allShopDetails = res.data.map((s: any) => ({
                        id: s.id,
                        name: s.name || "Agri Input Shop",
                        owner_name: s.owner_name,
                        phone: s.phone || s.contact_number,
                        contact_number: s.contact_number || s.phone,
                        license_number: s.license_number,
                        village: s.village,
                        mandal: s.mandal,
                        district: s.district,
                        state: s.state,
                        pincode: s.pincode,
                        address: s.address,
                        products_count: s.products_count,
                        distance_km: null,
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch /products/shops:", err);
            }

            // 2. Fetch distance & location closeness from /location/nearby/internal
            try {
                const response = await api.get("/location/nearby/internal", {
                    params: {
                        types: "shop",
                        radius_km: radius,
                        limit: 100,
                    },
                });
                const providers = (response.data || []) as Array<{
                    user_id: number;
                    name?: string;
                    village?: string;
                    mandal?: string;
                    district?: string;
                    state?: string;
                    contact_number?: string;
                    address?: string;
                    distance_km?: number;
                }>;

                const shopMap = new Map<number, ShopInfo>();
                allShopDetails.forEach(s => shopMap.set(s.id, s));

                providers.forEach(p => {
                    if (typeof p.user_id === "number") {
                        const existing = shopMap.get(p.user_id);
                        if (existing) {
                            existing.distance_km = p.distance_km ?? existing.distance_km;
                            if (!existing.phone && p.contact_number) existing.phone = p.contact_number;
                            if (!existing.address && p.address) existing.address = p.address;
                            if (!existing.village && p.village) existing.village = p.village;
                            if (!existing.mandal && p.mandal) existing.mandal = p.mandal;
                            if (!existing.district && p.district) existing.district = p.district;
                            if (!existing.state && p.state) existing.state = p.state;
                        } else {
                            shopMap.set(p.user_id, {
                                id: p.user_id,
                                name: p.name || "Agri Shop",
                                phone: p.contact_number,
                                contact_number: p.contact_number,
                                village: p.village,
                                mandal: p.mandal,
                                district: p.district,
                                state: p.state,
                                address: p.address,
                                distance_km: p.distance_km ?? null,
                            });
                        }
                    }
                });

                allShopDetails = Array.from(shopMap.values());
            } catch (err) {
                console.warn("Could not query /location/nearby/internal:", err);
            }

            setShops(allShopDetails);
            const ids = new Set<number>(allShopDetails.map(s => s.id));
            setNearbyShopIds(ids);

            setSelectedShop(prev => {
                if (prev === null) return prev;
                return ids.has(prev) ? prev : null;
            });
        } catch (error) {
            console.error("Failed to fetch shops:", error);
            setNearbyShopIds(null);
        }
    };

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const response = await api.get("/orders/my-orders");
            setOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleCancelOrder = async (orderId: number) => {
        if (!confirm("Are you sure you want to cancel this order?")) return;
        try {
            await api.put(`/orders/${orderId}/status`, { status: "cancelled" });
            fetchOrders();
            fetchProducts();
        } catch (error) {
            console.error(error);
            alert("Failed to cancel order.");
        }
    };

    // Filter products by search, category, and shop
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch =
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.short_name && product.short_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
            const matchesShop = selectedShop === null || product.user_id === selectedShop;
            // Gracefully handle empty nearbyShopIds (show all if empty/not yet loaded, or if shop is explicitly selected)
            const matchesNearby = !nearbyShopIds || nearbyShopIds.size === 0 || nearbyShopIds.has(product.user_id) || selectedShop !== null;

            return matchesSearch && matchesCategory && matchesShop && matchesNearby;
        });
    }, [products, searchQuery, selectedCategory, selectedShop, nearbyShopIds]);

    const groupedFilteredProducts = useMemo(() => {
        const groups: Record<string, Product & { related_batches: Product[] }> = {};
        for (const p of filteredProducts) {
            const key = `${p.name}_${p.category}_${p.user_id}`;
            if (!groups[key]) {
                groups[key] = { ...p, related_batches: [p] };
            } else {
                groups[key].quantity += p.quantity;
                groups[key].related_batches.push(p);
            }
        }
        return Object.values(groups);
    }, [filteredProducts]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: Math.min(item.quantity + 1, product.quantity) }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateCartQuantity = (productId: number, delta: number) => {
        setCart(prev =>
            prev.map(item => {
                if (item.product.id === productId) {
                    const newQty = Math.max(1, Math.min(item.quantity + delta, item.product.quantity));
                    return { ...item, quantity: newQty };
                }
                return item;
            })
        );
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const placeOrder = async () => {
        if (placingOrder) return;
        if (!cart || cart.length === 0) {
            alert("Your cart is empty. Please add items before requesting an order.");
            return;
        }
        setPlacingOrder(true);
        try {
            // Group cart items by shop (user_id)
            const shopGroups: Record<number, CartItem[]> = {};
            for (const item of cart) {
                const shopId = item.product.user_id || 1;
                if (!shopGroups[shopId]) shopGroups[shopId] = [];
                shopGroups[shopId].push(item);
            }

            for (const shopId in shopGroups) {
                const items: {product_id: number, quantity: number}[] = [];
                for (const item of shopGroups[shopId]) {
                    const relatedBatches = (item.product as any).related_batches || [item.product];
                    let remainingQty = item.quantity;
                    for (const batch of relatedBatches) {
                        if (remainingQty <= 0) break;
                        const avail = typeof batch.quantity === "number" && batch.quantity > 0 ? batch.quantity : remainingQty;
                        const qtyToTake = Math.min(avail, remainingQty);
                        if (qtyToTake > 0 && batch.id) {
                            items.push({
                                product_id: batch.id,
                                quantity: qtyToTake
                            });
                            remainingQty -= qtyToTake;
                        }
                    }
                    // Fallback: if remainingQty > 0 or batches had no positive quantities, add base product
                    if (remainingQty > 0 && item.product.id) {
                        const existingIdx = items.findIndex(it => it.product_id === item.product.id);
                        if (existingIdx >= 0) {
                            items[existingIdx].quantity += remainingQty;
                        } else {
                            items.push({
                                product_id: item.product.id,
                                quantity: remainingQty
                            });
                        }
                    }
                }

                if (items.length === 0) {
                    throw new Error("Could not prepare items for the order. Please try re-adding the product to cart.");
                }

                // Attempt placing order with 1-second auto-retry on transient network glitch
                try {
                    await api.post("/orders/", {
                        farmer_id: user?.id,
                        items,
                        payment_mode: paymentMode, // "cash" or "razorpay"
                        discount: 0,
                        order_notes: orderNotes.trim() || undefined,
                    });
                } catch (firstErr: any) {
                    const isNetwork = firstErr?.code === "ERR_NETWORK" || (firstErr?.message && firstErr.message.toLowerCase().includes("network error"));
                    if (isNetwork) {
                        console.warn("First order attempt failed with network issue, retrying in 1.2s...");
                        await new Promise(r => setTimeout(r, 1200));
                        await api.post("/orders/", {
                            items,
                            payment_mode: paymentMode,
                            discount: 0,
                            order_notes: orderNotes.trim() || undefined,
                        });
                    } else {
                        throw firstErr;
                    }
                }
            }

            alert(`Order requests sent successfully! The shop owner will review and confirm your order.`);
            setCart([]);
            if (typeof window !== "undefined") {
                try {
                    localStorage.removeItem("agri_farmer_cart");
                } catch (_) {}
            }
            setOrderNotes("");
            setOrderPlaced(false);
            setShowCart(false);
            setShowHistory(true);
            setPaymentMode("cash");
            router.replace("/dashboard/farmer/market?tab=orders");
            fetchOrders();
            fetchProducts();
        } catch (error: any) {
            console.error("Failed to request order:", error);
            // CART IS INTENTIONALLY PRESERVED SO USER NEVER LOSES THEIR PRODUCTS
            const isNetwork = error?.code === "ERR_NETWORK" || (error?.message && error.message.toLowerCase().includes("network error"));
            if (isNetwork) {
                alert("Network Connection Error: Could not reach the server. Don't worry, your items remain safely in your cart! Please check your internet connection and try tapping 'Request Order' again.");
            } else {
                const detail = error?.response?.data?.detail;
                const backendErr = error?.response?.data?.error;
                let errorMessage = "Failed to request order. Please try again.";
                if (typeof detail === "string") {
                    errorMessage = detail;
                    if (backendErr && typeof backendErr === "string") {
                        errorMessage += `: ${backendErr.slice(0, 150)}`;
                    }
                } else if (Array.isArray(detail)) {
                    errorMessage = detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ");
                } else if (error?.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error?.message) {
                    errorMessage = error.message;
                }
                alert(errorMessage);
            }
        } finally {
            setPlacingOrder(false);
        }
    };

    const handlePayNow = async (order: Order, preferredMethod: "upi" | "card" | "netbanking" = "upi") => {
        try {
            // Prefill user details if available
            let prefillInfo: any = {};
            try {
                const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    prefillInfo = {
                        name: parsed.full_name || "",
                        email: parsed.email || "",
                        contact: parsed.phone_number || "",
                    };
                }
            } catch (_) {}

            const { executePaymentFlow } = await import("@/lib/payment-api");
            await executePaymentFlow({
                amount: order.final_amount,
                payment_for: "shop_order",
                reference_id: order.id,
                notes: "Farmer Input Shop Order",
                name: "AgriFlow.AI Market",
                description: `Payment for Order #${order.id}`,
                preferredMethod,
                prefill: prefillInfo,
                onSuccess: () => {
                    alert("Payment successful! Order marked as paid.");
                    fetchOrders();
                },
                onOpenMockPopup: (opts) => {
                    setMockOptions(opts);
                }
            });
        } catch (error: any) {
            console.error("Razorpay initiation failed", error);
            alert(error?.response?.data?.detail || "Could not initialize payment window.");
        }
    };

    const getShortName = (product: Product) => {
        return product.short_name || product.name;
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "fertilizer": return <Leaf className="h-4 w-4" />;
            case "pesticide": return <Bug className="h-4 w-4" />;
            case "seeds": return <Droplets className="h-4 w-4" />;
            case "equipment": return <Wrench className="h-4 w-4" />;
            default: return <Package className="h-4 w-4" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "fertilizer": return "bg-emerald-100 text-emerald-700";
            case "pesticide": return "bg-rose-100 text-rose-700";
            case "seeds": return "bg-blue-100 text-blue-700";
            case "equipment": return "bg-amber-100 text-amber-700";
            default: return "bg-gray-100 text-foreground";
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "completed": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
            case "confirmed": return "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
            case "dispatched": return "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800";
            case "pending": return "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
            case "cancelled": return "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800";
            case "rejected": return "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-200 dark:border-red-800";
            default: return "bg-muted text-muted-foreground border border-border";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            </div>
        );
    }

    // ===========================
    //  ORDER HISTORY VIEW — Side Panel Layout
    // ===========================
    if (showHistory) {
        return (
            <div className="space-y-4 p-2">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => { 
                                setShowHistory(false); 
                                setSelectedOrder(null); 
                                router.replace("/dashboard/farmer/market");
                            }}
                            className="flex items-center gap-2 border-border text-foreground bg-card hover:bg-muted"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Shopping
                        </Button>
                        <h1 className="text-3xl font-bold text-foreground">Order History</h1>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchOrders}
                        disabled={ordersLoading}
                        className="flex items-center gap-1.5 border-border text-muted-foreground hover:text-foreground"
                    >
                        <RefreshCw className={`h-4 w-4 ${ordersLoading ? "animate-spin text-green-600" : ""}`} />
                        <span>Refresh Orders</span>
                    </Button>
                </div>

                {ordersLoading ? (
                    <Card className="border-dashed border-2 border-border bg-card">
                        <CardContent className="p-12 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent mx-auto mb-3"></div>
                            <p className="text-muted-foreground font-medium">Loading your orders...</p>
                        </CardContent>
                    </Card>
                ) : orders.length === 0 ? (
                    <Card className="border-dashed border-2 border-border bg-card">
                        <CardContent className="p-12 text-center">
                            <History className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
                            <h3 className="text-xl font-bold text-muted-foreground">No orders yet</h3>
                            <p className="text-muted-foreground">Your order history will appear here</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex gap-4 h-[calc(100vh-180px)]">
                        {/* Order List (Left) */}
                        <div className="w-full md:w-96 flex-shrink-0 overflow-y-auto space-y-2 pr-1">
                            {orders.map(order => (
                                <div
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                        selectedOrder?.id === order.id
                                            ? "border-green-500 bg-green-50/80 dark:bg-green-950/40 shadow-md ring-1 ring-green-500/30"
                                            : "border-border bg-card hover:border-green-300 dark:hover:border-green-700 hover:shadow-xs"
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-card-foreground">Order #{order.id}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                {" · "}
                                                {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute:'2-digit' })}
                                            </p>
                                            {order.shop_name && (
                                                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 mt-1">
                                                    <Store className="h-3 w-3" />{order.shop_name}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-700 dark:text-green-400">₹{order.final_amount.toLocaleString()}</p>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusStyle(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    {order.items && (
                                        <p className="text-[11px] text-muted-foreground mt-2 truncate">
                                            {order.items.map(i => i.product_name).join(", ")}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Order Detail Panel (Right) */}
                        <div className="hidden md:flex flex-1 overflow-y-auto">
                            {!selectedOrder ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border bg-card/50 rounded-xl">
                                    <History className="h-12 w-12 mb-3 opacity-40" />
                                    <p className="font-medium">Select an order to view details</p>
                                </div>
                            ) : (
                                <Card className="flex-1 border-border bg-card">
                                    <CardHeader className="border-b border-border bg-muted/20 pb-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl text-card-foreground">Order #{selectedOrder.id}</CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    {" at "}
                                                    {new Date(selectedOrder.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute:'2-digit' })}
                                                </p>
                                                {selectedOrder.shop_name && (
                                                    <span className="text-xs bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 mt-2 inline-flex items-center gap-1 font-medium">
                                                        <Store className="h-3 w-3" />{selectedOrder.shop_name}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${getStatusStyle(selectedOrder.status)}`}>
                                                {selectedOrder.status === 'completed' ? <CheckCircle className="h-3 w-3 inline mr-1" /> : <Clock className="h-3 w-3 inline mr-1" />}
                                                {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-5 space-y-5">
                                        {/* Shop Contact Details */}
                                        {selectedOrder.shop_contact && (
                                            <ContactInfoCard
                                                contact={selectedOrder.shop_contact}
                                                label="Shop Contact"
                                            />
                                        )}

                                        {/* Cart Items */}
                                        <div>
                                            <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">Cart Items</h3>
                                            <div className="space-y-3">
                                                {selectedOrder.items?.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-start py-2.5 border-b border-border last:border-0">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden border border-border">
                                                                {item.image_url || item.product_image_url ? (
                                                                    <img src={item.image_url || item.product_image_url} alt={item.product_name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="h-5 w-5" /></div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-card-foreground">{item.product_name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.brand || item.manufacturer ? <span className="text-emerald-700 dark:text-emerald-400 font-medium">{item.brand || item.manufacturer}</span> : ''}
                                                                    {item.brand || item.manufacturer ? ' · ' : ''}Qty: {item.quantity} × ₹{item.unit_price}
                                                                </p>
                                                                {item.main_composition && (
                                                                    <span className="text-[10px] bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-900 font-medium mt-1 inline-block">
                                                                        🧪 {item.main_composition}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="font-semibold text-card-foreground">₹{item.subtotal.toLocaleString()}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Transaction Details */}
                                        <div className="border-t border-border pt-4">
                                            <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">Transaction Details</h3>
                                            <div className="bg-muted/40 dark:bg-zinc-800/60 rounded-xl p-4 space-y-2.5 border border-border/60">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Subtotal</span>
                                                    <span className="font-medium text-card-foreground">₹{selectedOrder.total_amount.toLocaleString()}</span>
                                                </div>
                                                {selectedOrder.discount > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Discount</span>
                                                        <span className="font-medium text-green-600 dark:text-green-400">- ₹{selectedOrder.discount.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-sm border-t border-border pt-2">
                                                    <span className="font-bold text-card-foreground">Total</span>
                                                    <span className="font-bold text-green-700 dark:text-green-400 text-lg">₹{selectedOrder.final_amount.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Details */}
                                        <div className="border-t border-border pt-4">
                                            <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">Payment</h3>
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-50 dark:bg-blue-950/60 p-2 rounded-lg border border-blue-100 dark:border-blue-900">
                                                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-card-foreground capitalize">{selectedOrder.payment_mode}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {selectedOrder.payment_status === "paid" ? (
                                                            <span className="text-green-600 dark:text-green-400 font-bold">✅ Payment Completed</span>
                                                        ) : (
                                                            <span className="text-amber-600 dark:text-amber-400 font-medium">⏳ Payment Pending</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="border-t border-border pt-4 flex gap-3 flex-wrap">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setChatTarget({
                                                        userId: selectedOrder.shop_id,
                                                        name: selectedOrder.shop_name || "Shopkeeper",
                                                        role: "shop",
                                                        phone: selectedOrder.shop_contact?.phone_number,
                                                        orderId: selectedOrder.id,
                                                        orderSummary: selectedOrder.items?.map(i => i.product_name).slice(0, 2).join(", "),
                                                    });
                                                    setChatModalOpen(true);
                                                }}
                                                className="border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                            >
                                                <MessageSquare className="h-4 w-4 mr-1" /> Chat with Shop
                                            </Button>
                                            {(selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed') && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCancelOrder(selectedOrder.id)}
                                                    className="text-red-600 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" /> Cancel Order
                                                </Button>
                                            )}
                                            {selectedOrder.status === "rejected" && (
                                                <span className="text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 px-3 py-1.5 rounded-full border border-rose-300 dark:border-rose-800 flex items-center gap-1.5">
                                                    <X className="w-3.5 h-3.5 text-rose-600" /> Rejected by Shopkeeper
                                                </span>
                                            )}
                                            {selectedOrder.status === "confirmed" && selectedOrder.payment_status !== "paid" && (
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handlePayNow(selectedOrder, "upi")}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold flex items-center gap-1.5"
                                                    >
                                                        <span className="font-black italic text-xs">UPI</span> Pay via UPI / QR — ₹{selectedOrder.final_amount.toLocaleString()}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handlePayNow(selectedOrder, "card")}
                                                        className="border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-foreground font-semibold flex items-center gap-1.5"
                                                    >
                                                        <CreditCard className="h-4 w-4 mr-1" /> Cards / Netbanking
                                                    </Button>
                                                </div>
                                            )}
                                            {selectedOrder.status === "pending" && (
                                                <span className="text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 px-3 py-1.5 rounded-full border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" /> Waiting for Shopkeeper to Confirm
                                                </span>
                                            )}
                                            {selectedOrder.status === "confirmed" && selectedOrder.payment_status === "paid" && (
                                                <span className="text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300 px-3 py-1.5 rounded-full border border-green-300 dark:border-green-800 flex items-center gap-1.5">
                                                    <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Paid ✅ Awaiting Dispatch
                                                </span>
                                            )}
                                            {selectedOrder.status === "dispatched" && (
                                                <span className="text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 px-3 py-1.5 rounded-full border border-purple-300 dark:border-purple-800 flex items-center gap-1.5">
                                                    <Truck className="w-3.5 h-3.5 text-purple-600" /> Dispatched 🚚 Out for Delivery
                                                </span>
                                            )}
                                            {selectedOrder.status === "completed" && (
                                                <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Delivered & Completed
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
                {mockOptions && <MockRazorpayPopup options={mockOptions} onClose={() => { setMockOptions(null); fetchOrders(); }} />}
            </div>
        );
    }

    // ===========================
    //  CART VIEW
    // ===========================
    if (showCart) {
        return (
            <div className="space-y-6 p-2">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => setShowCart(false)}
                        className="flex items-center gap-2 border-gray-300 text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" /> Continue Shopping
                    </Button>
                    <h1 className="text-3xl font-bold text-foreground">Your Cart</h1>
                </div>

                {orderPlaced ? (
                    <Card className="bg-emerald-50 border-emerald-200">
                        <CardContent className="p-12 text-center space-y-4">
                            <CheckCircle className="h-20 w-20 mx-auto text-emerald-500 mb-2" />
                            <h3 className="text-2xl font-bold text-emerald-800">Order Placed Successfully!</h3>
                            <p className="text-emerald-600 max-w-md mx-auto">Your order has been submitted to the shop. You can track it in My Orders and communicate directly with the shop owner.</p>
                            <div className="pt-2">
                                <Link href="/dashboard/farmer/orders">
                                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5">
                                        <Box className="w-4 h-4 mr-2" /> Track in My Orders ➜
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : cart.length === 0 ? (
                    <Card className="border-dashed border-2">
                        <CardContent className="p-12 text-center">
                            <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-muted-foreground">Your cart is empty</h3>
                            <p className="text-muted-foreground">Add products to get started</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="space-y-4">
                            {cart.map(item => (
                                <Card key={item.product.id} className="border-gray-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            {/* Product Image */}
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                {item.product.image_url || item.product.product_image_url ? (
                                                    <img src={item.product.image_url || item.product.product_image_url} alt={item.product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl">
                                                        {item.product.category === 'fertilizer' ? '🌿' : item.product.category === 'pesticide' ? '🧴' : item.product.category === 'seeds' ? '🌱' : '📦'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    {getCategoryIcon(item.product.category)}
                                                    <h3 className="font-bold text-foreground">{getShortName(item.product)}</h3>
                                                </div>
                                                {item.product.seller_name && (
                                                    <button
                                                        onClick={() => { setSelectedShop(item.product.user_id); setShowCart(false); }}
                                                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors"
                                                    >
                                                        <Store className="h-3 w-3" />
                                                        Sold by <span className="font-bold">{item.product.seller_name}</span>
                                                    </button>
                                                )}
                                                <p className="text-sm text-green-700 font-bold">₹{item.product.price} each</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => updateCartQuantity(item.product.id, -1)}
                                                        className="h-8 w-8 p-0 text-foreground"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="font-bold w-8 text-center text-foreground">{item.quantity}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => updateCartQuantity(item.product.id, 1)}
                                                        className="h-8 w-8 p-0 text-foreground"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <p className="font-bold text-lg w-24 text-right text-foreground">
                                                    ₹{(item.product.price * item.quantity).toLocaleString()}
                                                </p>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => removeFromCart(item.product.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Card className="bg-gradient-to-r from-green-600 to-emerald-700 border-none shadow-xl text-white">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                    <div className="lg:col-span-4 space-y-2">
                                        <p className="text-green-100 text-sm font-medium">Total Order Amount</p>
                                        <p className="text-4xl font-extrabold text-white">₹{cartTotal.toLocaleString()}</p>
                                        <p className="text-green-200 text-xs">
                                            {cartItemCount} item(s) • {Object.keys(
                                                cart.reduce((acc, item) => ({ ...acc, [item.product.user_id || 1]: true }), {} as Record<number, boolean>)
                                            ).length} shop(s)
                                        </p>
                                        <p className="text-green-100/80 text-xs mt-3 leading-relaxed">
                                            🔒 Items remain safely saved in your cart even if you refresh or lose internet connection.
                                        </p>
                                    </div>

                                    <div className="lg:col-span-8 space-y-4">
                                        <div className="bg-white/10 dark:bg-zinc-800/50 rounded-xl p-3.5 backdrop-blur-xs">
                                            <p className="text-green-100 text-xs font-bold uppercase tracking-wider mb-2">Payment Mode</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <Button
                                                    type="button"
                                                    variant={paymentMode === "upi" ? "default" : "outline"}
                                                    onClick={() => setPaymentMode("upi")}
                                                    className={`py-2.5 px-2 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                                                        paymentMode === "upi"
                                                            ? "bg-white dark:bg-zinc-900 text-green-700 dark:text-green-300 shadow-md ring-2 ring-emerald-400 font-bold"
                                                            : "bg-transparent text-white border-green-400/80 hover:bg-green-700 hover:text-white"
                                                    }`}
                                                >
                                                    <span className="font-black italic text-emerald-300">UPI</span>
                                                    <span>Pay via UPI / QR</span>
                                                    <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-bold">Fast</span>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={paymentMode === "razorpay" ? "default" : "outline"}
                                                    onClick={() => setPaymentMode("razorpay")}
                                                    className={`py-2.5 px-2 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                                                        paymentMode === "razorpay"
                                                            ? "bg-white dark:bg-zinc-900 text-green-700 dark:text-green-300 shadow-md ring-2 ring-emerald-400 font-bold"
                                                            : "bg-transparent text-white border-green-400/80 hover:bg-green-700 hover:text-white"
                                                    }`}
                                                >
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                    <span>Cards / Netbanking</span>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={paymentMode === "cash" ? "default" : "outline"}
                                                    onClick={() => setPaymentMode("cash")}
                                                    className={`py-2.5 px-2 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                                                        paymentMode === "cash"
                                                            ? "bg-white dark:bg-zinc-900 text-green-700 dark:text-green-300 shadow-md ring-2 ring-emerald-400 font-bold"
                                                            : "bg-transparent text-white border-green-400/80 hover:bg-green-700 hover:text-white"
                                                    }`}
                                                >
                                                    <Wallet className="w-3.5 h-3.5" />
                                                    <span>Cash on Delivery</span>
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="bg-white/10 dark:bg-zinc-800/50 rounded-xl p-3.5 backdrop-blur-xs">
                                            <p className="text-green-100 text-xs font-bold uppercase tracking-wider mb-1.5">Special Delivery Instructions / Note for Shopkeeper</p>
                                            <textarea
                                                value={orderNotes}
                                                onChange={(e) => setOrderNotes(e.target.value)}
                                                placeholder="e.g., Deliver near village temple, need 50kg bags, please call before dispatch..."
                                                rows={2}
                                                className="w-full p-2.5 rounded-lg text-xs bg-white text-gray-900 dark:bg-zinc-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-green-400 resize-none"
                                            />
                                        </div>

                                        <Button
                                            onClick={placeOrder}
                                            disabled={placingOrder}
                                            className="w-full bg-white dark:bg-zinc-900 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-zinc-800 font-bold px-8 py-5 text-base shadow-lg transition-transform active:scale-[0.99] disabled:opacity-70"
                                        >
                                            {placingOrder ? "Processing Order..." : "Request Order"}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
                {mockOptions && <MockRazorpayPopup options={mockOptions} onClose={() => { setMockOptions(null); setPlacingOrder(false); }} />}
            </div>
        );
    }

    return (
        <div className="space-y-6 p-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/farmer">
                        <Button variant="outline" className="flex items-center gap-2 border-gray-300 text-foreground">
                            <ArrowLeft className="h-4 w-4" /> {t("common.back", "Back")}
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{t("marketPage.title", "Buy Fertilizer & Agri Inputs")}</h1>
                        <p className="text-xs text-muted-foreground">Certified local fertilizer & agri-input shops with direct ordering</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                        variant="outline"
                        onClick={() => { 
                            setShowHistory(true); 
                            setShowCart(false); 
                            router.replace("/dashboard/farmer/market?tab=orders");
                            fetchOrders(); 
                        }}
                        className="border-gray-300 dark:border-zinc-700 text-foreground flex items-center gap-1.5"
                    >
                        <Box className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span>My Orders</span>
                        {orders.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-700 dark:text-green-300 text-[10px] font-bold">
                                {orders.length}
                            </span>
                        )}
                    </Button>

                    <Button
                        onClick={() => { setShowCart(true); setShowHistory(false); }}
                        className={`relative ${showCart ? "bg-green-700" : "bg-green-600 hover:bg-green-700"} text-white`}
                    >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {t("marketPage.cart", "Cart")}
                        {cartItemCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                {cartItemCount}
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            {/* Registered Agri Input & Fertilizer Shops Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <h2 className="text-lg font-bold text-foreground">
                            Registered Agri Shops & Fertilizer Dealers
                        </h2>
                        {shops.length > 0 && (
                            <span className="text-xs bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 font-semibold px-2.5 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                                {shops.length} {shops.length === 1 ? "Shop" : "Shops"} Available
                            </span>
                        )}
                    </div>
                    {selectedShop !== null && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedShop(null)}
                            className="text-xs text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-zinc-800 font-semibold flex items-center gap-1"
                        >
                            <X className="h-3.5 w-3.5" /> Show All Shops
                        </Button>
                    )}
                </div>

                {shops.length === 0 ? (
                    <Card className="border-dashed border-gray-200 dark:border-zinc-800 bg-card">
                        <CardContent className="p-6 text-center text-sm text-muted-foreground">
                            <Store className="h-8 w-8 mx-auto mb-2 opacity-40 text-green-600" />
                            Loading registered fertilizer dealers and shops...
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {shops.map((shop) => {
                            const isSelected = selectedShop === shop.id;
                            const shopProductCount = shop.products_count ?? products.filter(p => p.user_id === shop.id).length;
                            const addressDisplay = shop.address || [shop.village, shop.mandal, shop.district, shop.state, shop.pincode].filter(Boolean).join(", ");
                            const phoneDisplay = shop.phone || shop.contact_number;

                            return (
                                <Card
                                    key={shop.id}
                                    className={`relative transition-all duration-200 border-2 overflow-hidden ${
                                        isSelected
                                            ? "border-green-600 dark:border-green-500 bg-green-50/40 dark:bg-green-950/20 shadow-md ring-2 ring-green-500/20"
                                            : "border-gray-200 dark:border-zinc-800 hover:border-green-400 dark:hover:border-green-600 bg-white dark:bg-zinc-900 hover:shadow-md"
                                    }`}
                                >
                                    <CardContent className="p-4 space-y-3">
                                        {/* Shop Header */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-start gap-2.5 min-w-0">
                                                <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 flex items-center justify-center font-bold text-base flex-shrink-0 border border-green-200 dark:border-green-800">
                                                    🏪
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-base text-foreground truncate" title={shop.name}>
                                                        {shop.name}
                                                    </h3>
                                                    {shop.owner_name && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <User className="h-3 w-3 text-muted-foreground" />
                                                            <span>Owner: <strong className="text-foreground">{shop.owner_name}</strong></span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {isSelected ? (
                                                <span className="flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-bold bg-green-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                                                    <Check className="h-3 w-3" /> Selected
                                                </span>
                                            ) : (
                                                <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                                    <ShieldCheck className="h-3 w-3" /> Certified
                                                </span>
                                            )}
                                        </div>

                                        {/* Shop Details */}
                                        <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/60 pt-2.5">
                                            {phoneDisplay && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                                    <a
                                                        href={`tel:${phoneDisplay}`}
                                                        className="font-medium text-green-700 dark:text-green-400 hover:underline"
                                                    >
                                                        {phoneDisplay}
                                                    </a>
                                                </div>
                                            )}

                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-3.5 w-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-2">
                                                    {addressDisplay || "Local Input Center"}
                                                </span>
                                            </div>

                                            {shop.license_number && (
                                                <div className="text-[11px] text-muted-foreground">
                                                    License: <span className="font-mono text-foreground">{shop.license_number}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground">
                                                <span className="font-medium text-foreground">
                                                    {shop.distance_km != null ? `📍 ${shop.distance_km.toFixed(1)} km away` : "📍 Serving Local Region"}
                                                </span>
                                                <span className="font-semibold text-green-700 dark:text-green-400">
                                                    {shopProductCount} {shopProductCount === 1 ? "Product" : "Products"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={isSelected ? "default" : "outline"}
                                                onClick={() => setSelectedShop(isSelected ? null : shop.id)}
                                                className={`flex-1 text-xs font-semibold ${
                                                    isSelected
                                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                                        : "border-gray-300 dark:border-zinc-700 text-foreground hover:bg-green-50 dark:hover:bg-zinc-800"
                                                }`}
                                            >
                                                {isSelected ? "Clear Selection" : "View Products"}
                                            </Button>

                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setChatTarget({
                                                        userId: shop.id,
                                                        name: shop.name || shop.owner_name || "Agri Input Shop",
                                                        role: "shop",
                                                        phone: phoneDisplay,
                                                    });
                                                    setChatModalOpen(true);
                                                }}
                                                className="border-gray-300 dark:border-zinc-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-zinc-800 text-xs px-2.5"
                                                title="Chat directly with this shopkeeper"
                                            >
                                                <MessageSquare className="h-3.5 w-3.5 mr-1" /> Chat
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Search and Shop Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder={t("marketPage.searchPlaceholder", "Search by name, brand (e.g., DAP, Urea, IFFCO)...")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-xl focus:border-green-500 outline-none text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-900 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                </div>
                {/* Shop Filter */}
                <div className="relative">
                    <select
                        value={selectedShop ?? "all"}
                        onChange={(e) => setSelectedShop(e.target.value === "all" ? null : parseInt(e.target.value))}
                        className="appearance-none pl-10 pr-10 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-xl focus:border-green-500 outline-none text-gray-900 dark:text-gray-100 bg-white dark:bg-zinc-900 min-w-[200px]"
                    >
                        <option value="all">{t("marketPage.allShops", "All Shops")}</option>
                        {shops.map(shop => (
                            <option key={shop.id} value={shop.id}>
                                {shop.name}{(shop.village || shop.mandal || shop.district || shop.state)
                                    ? ` (${shop.village || shop.mandal || shop.district || shop.state})`
                                    : ""}
                            </option>
                        ))}
                    </select>
                    <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                    <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? "default" : "outline"}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 whitespace-nowrap ${selectedCategory === cat.id
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "hover:bg-green-50 text-foreground border-gray-300"
                            }`}
                    >
                        <cat.icon className="h-4 w-4" />
                        {cat.name}
                    </Button>
                ))}
            </div>

            {/* Products Grid */}
            {groupedFilteredProducts.length === 0 ? (
                <Card className="border-dashed border-2">
                    <CardContent className="p-12 text-center">
                        <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-muted-foreground">{t("marketPage.noProducts", "No products found")}</h3>
                        <p className="text-muted-foreground">{t("marketPage.adjustFilters", "Try adjusting your search or filters")}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groupedFilteredProducts.map(product => {
                        const inCart = cart.find(item => item.product.id === product.id);
                        return (
                            <Card
                                key={product.id}
                                className="border-gray-200 hover:border-green-300 hover:shadow-lg transition-all group overflow-hidden"
                            >
                                {/* Product Image */}
                                <div 
                                    className="w-full h-44 bg-gray-50 dark:bg-zinc-800 overflow-hidden relative cursor-pointer"
                                    onClick={() => {
                                        const imgUrl = product.image_url || product.product_image_url;
                                        if (imgUrl) setSelectedImage(imgUrl);
                                    }}
                                >
                                    {product.image_url || product.product_image_url ? (
                                        <img
                                            src={product.image_url || product.product_image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-6xl opacity-30">
                                                {product.category === 'fertilizer' ? '🌿' : product.category === 'pesticide' ? '🧴' : product.category === 'seeds' ? '🌱' : '📦'}
                                            </div>
                                        </div>
                                    )}
                                    {/* Category Badge */}
                                    <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getCategoryColor(product.category)}`}>
                                        {getCategoryIcon(product.category)}
                                        {t(`marketPage.${product.category}`, product.category)}
                                    </span>
                                    {product.quantity < 10 && (
                                        <span className="absolute top-3 right-3 text-xs bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded-full">{t("marketPage.lowStock", "Low Stock")}</span>
                                    )}
                                </div>

                                <CardContent className="p-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-foreground group-hover:text-green-700 transition-colors line-clamp-1">
                                            {getShortName(product)}
                                        </h3>
                                        {product.brand && (
                                            <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                                        )}

                                        {/* Shop Name */}
                                        {product.seller_name && (
                                            <button
                                                onClick={() => setSelectedShop(product.user_id)}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 mb-2 transition-colors cursor-pointer"
                                            >
                                                <Store className="h-3 w-3" /> {product.seller_name}
                                            </button>
                                        )}
                                        
                                        {/* Pack Size & Dates */}
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {product.quantity_per_unit && product.unit && (
                                                <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1">
                                                    <Package className="h-3 w-3" />
                                                    {product.quantity_per_unit} {product.unit} {t("marketPage.pack", "pack")}
                                                </span>
                                            )}
                                            {product.manufacture_date && (
                                                <span className="text-[10px] bg-sky-50 text-sky-700 font-medium px-2 py-0.5 rounded-full border border-sky-100">
                                                    {t("marketPage.mfgDate", "Mfg")}: {new Date(product.manufacture_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                        {product.main_composition && (
                                            <div className="mt-1 mb-2">
                                                <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded inline-block">
                                                    <span className="font-semibold">{t("marketPage.composition", "Composition")}:</span> {product.main_composition}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price and Stock */}
                                    <div className="flex justify-between items-end mb-3 mt-auto">
                                        <div>
                                            <p className="text-2xl font-bold text-green-700">₹{product.price}</p>
                                            <p className="text-xs text-muted-foreground">{t("marketPage.perUnit", "per unit")}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-muted-foreground">{product.quantity} {t("marketPage.inStock", "in stock")}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons: Chat with Shop + Add to Cart */}
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setChatTarget({
                                                    userId: product.user_id,
                                                    name: product.seller_name || "Shopkeeper",
                                                    role: "shop",
                                                    orderSummary: product.name,
                                                });
                                                setChatModalOpen(true);
                                            }}
                                            className="px-3 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                            title={`Chat with ${product.seller_name || "Shopkeeper"}`}
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            onClick={() => addToCart(product)}
                                            disabled={product.quantity === 0}
                                            className={`flex-1 ${inCart
                                                ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
                                                : "bg-green-600 hover:bg-green-700 text-white"
                                                }`}
                                        >
                                            {inCart ? (
                                                <>
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    {t("marketPage.inCart", "In Cart")} ({inCart.quantity})
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    {t("marketPage.addToCart", "Add to Cart")}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Floating Cart Summary */}
            {cartItemCount > 0 && !showCart && (
                <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 z-50">
                    <Card className="bg-gradient-to-r from-green-600 to-emerald-700 border-none shadow-2xl">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-green-100 text-sm">{cartItemCount} item(s)</p>
                                    <p className="text-2xl font-bold text-white">₹{cartTotal.toLocaleString()}</p>
                                </div>
                                <Button
                                    onClick={() => setShowCart(true)}
                                    className="bg-white dark:bg-zinc-900 text-green-700 hover:bg-green-50 font-bold"
                                >
                                    View Cart →
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            {mockOptions && <MockRazorpayPopup options={mockOptions} onClose={() => { setMockOptions(null); setPlacingOrder(false); }} />}
            
            {/* Image Lightbox */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
                        <button 
                            className="absolute top-0 right-0 md:top-4 md:right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors z-10"
                            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <img 
                            src={selectedImage} 
                            alt="Full View" 
                            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {/* Direct Interactive Chat Modal with Shop Owner */}
            {chatTarget && (
                <OrderChatModal
                    isOpen={chatModalOpen}
                    onClose={() => {
                        setChatModalOpen(false);
                        setChatTarget(null);
                    }}
                    targetUserId={chatTarget.userId}
                    targetName={chatTarget.name}
                    targetRole={chatTarget.role}
                    targetPhone={chatTarget.phone}
                    orderId={chatTarget.orderId}
                    orderSummary={chatTarget.orderSummary}
                />
            )}
        </div>
    );
}

export default function MarketPage() {
    return (
        <React.Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading market...</div>}>
            <MarketPageContent />
        </React.Suspense>
    );
}

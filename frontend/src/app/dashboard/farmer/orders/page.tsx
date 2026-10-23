"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
    getFarmerOrders,
    cancelFarmerOrder,
    FarmerOrder
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ContactInfoCard from "@/components/ui/ContactInfoCard";
import OrderChatModal from "@/components/chat/OrderChatModal";
import MockRazorpayPopup from "@/components/payment/MockRazorpayPopup";
import {
    Package,
    Store,
    Clock,
    CheckCircle,
    Truck,
    AlertCircle,
    ShoppingBag,
    ArrowLeft,
    Search,
    MessageSquare,
    Phone,
    CreditCard,
    Trash2,
    RefreshCw,
    FileText,
    Leaf,
    Bug,
    Droplets,
    Wrench,
    MapPin,
    Calendar,
    ChevronRight,
    Sparkles,
    Check
} from "lucide-react";

export default function FarmerOrdersPage() {
    const { user } = useAuth();
    const { t } = useLanguage();

    const [orders, setOrders] = useState<FarmerOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<FarmerOrder | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Chat Modal State
    const [chatModalOpen, setChatModalOpen] = useState(false);
    const [chatTarget, setChatTarget] = useState<{
        userId: number;
        name: string;
        role: string;
        phone?: string | null;
        orderId?: number;
        orderSummary?: string;
    } | null>(null);

    // Online Payment State
    const [mockOptions, setMockOptions] = useState<any>(null);
    const [payingOrder, setPayingOrder] = useState<number | null>(null);

    const fetchOrdersData = async (isBackground = false) => {
        try {
            if (!isBackground) setRefreshing(true);
            const data = await getFarmerOrders();
            setOrders(data);

            // Keep selected order updated with fresh data
            setSelectedOrder(prev => {
                if (!prev) return data.length > 0 ? data[0] : null;
                const updated = data.find(o => o.id === prev.id);
                return updated || (data.length > 0 ? data[0] : null);
            });
        } catch (error) {
            console.error("Failed to fetch farmer orders:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrdersData();

        // Polling every 10 seconds for real-time order status updates from shop
        const interval = setInterval(() => {
            if (typeof document !== "undefined" && document.hidden) return;
            fetchOrdersData(true);
        }, 10000);

        const handleVisibilityChange = () => {
            if (typeof document !== "undefined" && !document.hidden) {
                fetchOrdersData(true);
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    // Filtered orders
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && ["pending", "confirmed", "dispatched"].includes(order.status)) ||
                order.status === statusFilter;

            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                order.id.toString().includes(q) ||
                (order.shop_name && order.shop_name.toLowerCase().includes(q)) ||
                (order.items && order.items.some(i => i.product_name.toLowerCase().includes(q) || (i.brand && i.brand.toLowerCase().includes(q))));

            return matchesStatus && matchesSearch;
        });
    }, [orders, statusFilter, searchQuery]);

    // KPI Metrics
    const metrics = useMemo(() => {
        const totalOrders = orders.length;
        const activeOrders = orders.filter(o => ["pending", "confirmed", "dispatched"].includes(o.status)).length;
        const completedOrders = orders.filter(o => o.status === "completed").length;
        const totalSpent = orders
            .filter(o => o.status !== "cancelled")
            .reduce((sum, o) => sum + (o.final_amount || 0), 0);
        return { totalOrders, activeOrders, completedOrders, totalSpent };
    }, [orders]);

    const handleCancel = async (orderId: number) => {
        if (!confirm("Are you sure you want to cancel this order? The shop will be notified.")) return;
        try {
            await cancelFarmerOrder(orderId);
            await fetchOrdersData();
        } catch (error: any) {
            alert(error?.response?.data?.detail || "Failed to cancel order.");
        }
    };

    const openChat = (order: FarmerOrder) => {
        const itemNames = order.items?.map(i => i.product_name).slice(0, 2).join(", ") || "Fertilizer Items";
        setChatTarget({
            userId: order.shop_id,
            name: order.shop_name || "Shop Owner",
            role: "shop",
            phone: order.shop_contact?.phone_number,
            orderId: order.id,
            orderSummary: itemNames,
        });
        setChatModalOpen(true);
    };

    const handlePayNow = async (order: FarmerOrder) => {
        setPayingOrder(order.id);
        try {
            const { getRazorpayConfig, createPaymentOrder, verifyPayment, loadRazorpayScript } = await import("@/lib/payment-api");
            const config = await getRazorpayConfig();
            const paymentOrder = await createPaymentOrder({
                amount: order.final_amount,
                payment_for: "shop_order",
                reference_id: order.id,
                notes: `Farmer Payment for Order #${order.id}`,
            });

            const prefillInfo = {
                name: user?.full_name || "",
                email: user?.email || "",
                contact: user?.phone_number || "",
            };

            const options = {
                key: config.key_id,
                amount: Math.round(paymentOrder.amount * 100),
                currency: config.currency || "INR",
                name: "AgriChain Supply Network",
                description: `Payment for Fertilizer Order #${order.id}`,
                order_id: paymentOrder.razorpay_order_id,
                prefill: prefillInfo,
                theme: { color: "#16a34a" },
                handler: async (response: any) => {
                    try {
                        await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        alert("Payment successful! Shop has been notified.");
                        fetchOrdersData();
                    } catch (err: any) {
                        alert(err?.response?.data?.detail || "Payment verification failed.");
                    } finally {
                        setPayingOrder(null);
                    }
                },
            };

            const isMockMode = config.is_mock || config.key_id.startsWith("rzp_test_placeholder");
            if (isMockMode) {
                setMockOptions(options);
                return;
            }

            const loaded = await loadRazorpayScript();
            if (!loaded) {
                alert("Failed to load Razorpay SDK.");
                setPayingOrder(null);
                return;
            }

            const razorpay = new (window as any).Razorpay(options);
            razorpay.on("payment.failed", (resp: any) => {
                alert(`Payment failed: ${resp.error?.description || "Transaction declined"}`);
                setPayingOrder(null);
            });
            razorpay.open();
        } catch (error: any) {
            console.error("Payment initiation failed:", error);
            alert(error?.response?.data?.detail || "Could not initialize payment window.");
            setPayingOrder(null);
        }
    };

    const getStatusStep = (status: string) => {
        switch (status) {
            case "pending": return 1;
            case "confirmed": return 2;
            case "dispatched": return 3;
            case "completed": return 4;
            default: return 0; // cancelled
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Confirmation</span>;
            case "confirmed":
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1"><Check className="w-3 h-3" /> Shop Confirmed</span>;
            case "dispatched":
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-300 dark:border-purple-800 flex items-center gap-1"><Truck className="w-3 h-3" /> Out for Delivery</span>;
            case "completed":
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Delivered & Completed</span>;
            case "cancelled":
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Cancelled</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground">{status}</span>;
        }
    };

    const getCategoryIcon = (category?: string) => {
        switch (category) {
            case "fertilizer": return <Leaf className="w-4 h-4 text-emerald-600" />;
            case "pesticide": return <Bug className="w-4 h-4 text-rose-600" />;
            case "seeds": return <Droplets className="w-4 h-4 text-blue-600" />;
            case "equipment": return <Wrench className="w-4 h-4 text-amber-600" />;
            default: return <Package className="w-4 h-4 text-emerald-600" />;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
                <p className="text-muted-foreground text-sm font-medium">Loading your fertilizer & farm orders...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-2 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/farmer">
                        <Button variant="outline" size="sm" className="border-border text-foreground">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                            <span>My Fertilizer Orders</span>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300">
                                {orders.length} Total
                            </span>
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            Track fertilizer deliveries, communicate directly with shop owners, and manage order receipts.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchOrdersData()}
                        disabled={refreshing}
                        className="border-border text-foreground flex items-center gap-1.5"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-green-600" : ""}`} />
                        <span>Refresh</span>
                    </Button>
                    <Link href="/dashboard/farmer/market">
                        <Button className="bg-green-600 hover:bg-green-700 text-white font-medium flex items-center gap-2 shadow-xs">
                            <ShoppingBag className="w-4 h-4" />
                            <span>Buy Fertilizers</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <Card className="border border-border bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/30 dark:to-emerald-950/10 shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Active Orders</p>
                            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{metrics.activeOrders}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/30 dark:to-indigo-950/10 shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Completed Orders</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-1">{metrics.completedOrders}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border bg-gradient-to-br from-amber-50/50 to-yellow-50/30 dark:from-amber-950/30 dark:to-yellow-950/10 shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Total Placed</p>
                            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">{metrics.totalOrders}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                            <Package className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border bg-gradient-to-br from-teal-50/50 to-cyan-50/30 dark:from-teal-950/30 dark:to-cyan-950/10 shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Total Fertilizer Value</p>
                            <p className="text-2xl font-bold text-teal-700 dark:text-teal-400 mt-1">₹{metrics.totalSpent.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-muted/50 rounded-xl border border-border">
                    {[
                        { id: "all", label: "All Orders" },
                        { id: "active", label: "Active" },
                        { id: "pending", label: "Pending" },
                        { id: "confirmed", label: "Confirmed" },
                        { id: "dispatched", label: "Dispatched" },
                        { id: "completed", label: "Completed" },
                        { id: "cancelled", label: "Cancelled" },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                                statusFilter === tab.id
                                    ? "bg-card text-foreground font-bold shadow-xs border border-border/80"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by Order #, product, shop..."
                        className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            {/* Main Content Area */}
            {filteredOrders.length === 0 ? (
                <Card className="border border-dashed border-border bg-card/60">
                    <CardContent className="p-12 text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                            <ShoppingBag className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">No orders found</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                                {searchQuery || statusFilter !== "all"
                                    ? "No orders match your filter criteria. Try clearing search or selecting a different status."
                                    : "You haven't placed any fertilizer orders yet. Browse nearby shops and buy quality fertilizers with direct shopkeeper interaction."}
                            </p>
                        </div>
                        <Link href="/dashboard/farmer/market">
                            <Button className="bg-green-600 hover:bg-green-700 text-white font-medium">
                                <ShoppingBag className="w-4 h-4 mr-2" /> Browse Fertilizer Market
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
                    {/* Orders List (Left Column) */}
                    <div className="lg:col-span-5 space-y-3 overflow-y-auto max-h-[750px] pr-1">
                        {filteredOrders.map(order => {
                            const isSelected = selectedOrder?.id === order.id;
                            const itemCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) || order.items?.length || 0;

                            return (
                                <div
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                                        isSelected
                                            ? "border-green-500 bg-green-50/70 dark:bg-green-950/30 shadow-md ring-2 ring-green-500/20"
                                            : "border-border bg-card hover:border-green-300 dark:hover:border-green-700/60 hover:shadow-xs"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-card-foreground text-sm sm:text-base">Order #{order.id}</span>
                                                {getStatusBadge(order.status)}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                                {new Date(order.created_at).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                                {" · "}
                                                {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-bold text-green-700 dark:text-green-400 text-base">
                                                ₹{order.final_amount.toLocaleString("en-IN")}
                                            </p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                                order.payment_status === "paid"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-950/80 dark:text-green-300"
                                                    : order.payment_mode === "cash"
                                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                                                        : "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300"
                                            }`}>
                                                {order.payment_status === "paid" ? "Paid ✅" : order.payment_mode === "cash" ? "Cash on Delivery" : "Payment Pending"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Shop Info Pill */}
                                    <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5 font-medium text-card-foreground truncate">
                                            <Store className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                            <span className="truncate">{order.shop_name}</span>
                                        </div>
                                        <span className="text-muted-foreground text-[11px] shrink-0 font-medium">
                                            {itemCount} item(s)
                                        </span>
                                    </div>

                                    {/* Summary preview of items */}
                                    {order.items && order.items.length > 0 && (
                                        <p className="text-[11px] text-muted-foreground mt-1 truncate">
                                            {order.items.map(i => `${i.quantity}x ${i.product_name}`).join(", ")}
                                        </p>
                                    )}

                                    {/* Quick action buttons row */}
                                    <div className="mt-3 pt-2 flex items-center justify-between gap-2 border-t border-border/40">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openChat(order);
                                            }}
                                            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            <span>Chat with Shop</span>
                                        </button>

                                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                            <span>Details</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Details Panel (Right Column) */}
                    <div className="lg:col-span-7">
                        {!selectedOrder ? (
                            <Card className="h-full border border-dashed border-border bg-card/40 flex items-center justify-center p-8 text-center text-muted-foreground">
                                <p>Select an order to view full delivery progress and shop contact.</p>
                            </Card>
                        ) : (
                            <Card className="border border-border bg-card shadow-sm sticky top-4">
                                <CardHeader className="border-b border-border bg-muted/20 pb-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2.5">
                                                <CardTitle className="text-xl font-bold text-card-foreground">
                                                    Order #{selectedOrder.id}
                                                </CardTitle>
                                                {getStatusBadge(selectedOrder.status)}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5" />
                                                Placed on {new Date(selectedOrder.created_at).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric"
                                                })} at {new Date(selectedOrder.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => openChat(selectedOrder)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                <span>Chat with Shop</span>
                                            </Button>

                                            {selectedOrder.shop_contact?.phone_number && (
                                                <a
                                                    href={`tel:${selectedOrder.shop_contact.phone_number}`}
                                                    className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
                                                    title={`Call Shop (${selectedOrder.shop_contact.phone_number})`}
                                                >
                                                    <Phone className="w-4 h-4 text-emerald-600" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-5 space-y-6">
                                    {/* Order Delivery Status Stepper */}
                                    {selectedOrder.status !== "cancelled" ? (
                                        <div className="bg-muted/30 rounded-2xl p-4 border border-border/60">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                                Order & Delivery Progress
                                            </h4>
                                            <div className="grid grid-cols-4 gap-2 text-center relative">
                                                {[
                                                    { step: 1, label: "Placed", desc: "Submitted to Shop", icon: Package },
                                                    { step: 2, label: "Confirmed", desc: "Accepted by Shop", icon: CheckCircle },
                                                    { step: 3, label: "Dispatched", desc: "Out for Delivery", icon: Truck },
                                                    { step: 4, label: "Delivered", desc: "Completed", icon: Check },
                                                ].map((s) => {
                                                    const currentStep = getStatusStep(selectedOrder.status);
                                                    const isDone = currentStep >= s.step;
                                                    const isCurrent = currentStep === s.step;

                                                    return (
                                                        <div key={s.step} className="flex flex-col items-center">
                                                            <div
                                                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                                                                    isDone
                                                                        ? "bg-green-600 text-white ring-4 ring-green-100 dark:ring-green-950/60"
                                                                        : "bg-muted text-muted-foreground border border-border"
                                                                }`}
                                                            >
                                                                <s.icon className="w-4 h-4" />
                                                            </div>
                                                            <p className={`text-xs font-bold mt-2 ${isCurrent ? "text-green-700 dark:text-green-400" : isDone ? "text-foreground" : "text-muted-foreground"}`}>
                                                                {s.label}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground hidden sm:block">
                                                                {s.desc}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                                            <div>
                                                <p className="font-bold">This order was cancelled</p>
                                                <p className="text-xs mt-0.5">Stock has been restored and no further payments are due.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Shop Information & Interaction Card */}
                                    <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                                                    <Store className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-card-foreground text-base">{selectedOrder.shop_name}</h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        {selectedOrder.shop_contact?.address || "Registered Agri Supply Partner"}
                                                    </p>
                                                    {selectedOrder.shop_contact?.phone_number && (
                                                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            <span>{selectedOrder.shop_contact.phone_number}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openChat(selectedOrder)}
                                                className="border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5 mr-1" /> Message
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Special Instructions / Farmer Notes */}
                                    {selectedOrder.order_notes && (
                                        <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200">
                                            <p className="font-bold uppercase tracking-wider text-[10px] text-amber-800 dark:text-amber-300 mb-1">
                                                Your Delivery Instructions to Shopkeeper:
                                            </p>
                                            <p className="italic">"{selectedOrder.order_notes}"</p>
                                        </div>
                                    )}

                                    {/* Ordered Items List */}
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                                            <span>Ordered Fertilizer & Farm Products</span>
                                            <span className="text-[11px] font-medium">{selectedOrder.items?.length || 0} Products</span>
                                        </h4>
                                        <div className="divide-y divide-border border rounded-2xl overflow-hidden bg-card">
                                            {selectedOrder.items?.map((item, idx) => (
                                                <div key={idx} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden flex items-center justify-center border border-border shrink-0">
                                                            {item.image_url || item.product_image_url ? (
                                                                <img
                                                                    src={item.image_url || item.product_image_url}
                                                                    alt={item.product_name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                getCategoryIcon(item.category)
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-card-foreground text-sm">{item.product_name}</p>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                                {item.brand && <span className="font-medium text-emerald-700 dark:text-emerald-400">{item.brand}</span>}
                                                                <span>Qty: {item.quantity} × ₹{item.unit_price}</span>
                                                            </div>
                                                            {item.main_composition && (
                                                                <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                                    🧪 {item.main_composition}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="font-bold text-card-foreground text-sm">₹{item.subtotal.toLocaleString("en-IN")}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Payment & Bill Summary */}
                                    <div className="border-t border-border pt-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                            Payment & Bill Breakdown
                                        </h4>
                                        <div className="bg-muted/30 rounded-2xl p-4 space-y-2 border border-border/60">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Items Total</span>
                                                <span className="font-medium text-card-foreground">₹{selectedOrder.total_amount.toLocaleString("en-IN")}</span>
                                            </div>
                                            {selectedOrder.discount > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">Shop Discount Granted</span>
                                                    <span className="font-bold text-emerald-700 dark:text-emerald-400">- ₹{selectedOrder.discount.toLocaleString("en-IN")}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-base font-bold border-t border-border pt-2">
                                                <span className="text-card-foreground">Final Bill</span>
                                                <span className="text-green-700 dark:text-green-400 text-lg">₹{selectedOrder.final_amount.toLocaleString("en-IN")}</span>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between text-xs px-2 text-muted-foreground">
                                            <span>Payment Method: <strong className="text-card-foreground uppercase">{selectedOrder.payment_mode}</strong></span>
                                            <span>
                                                Status:{" "}
                                                <strong className={selectedOrder.payment_status === "paid" ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>
                                                    {selectedOrder.payment_status === "paid" ? "PAID (Completed)" : "PENDING"}
                                                </strong>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Actions */}
                                    <div className="border-t border-border pt-4 flex items-center justify-between flex-wrap gap-2.5">
                                        <div className="flex items-center gap-2">
                                            {selectedOrder.status === "pending" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleCancel(selectedOrder.id)}
                                                    className="border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" /> Cancel Order
                                                </Button>
                                            )}

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.print()}
                                                className="border-border text-foreground hover:bg-muted"
                                            >
                                                <FileText className="w-4 h-4 mr-1" /> Print Slip
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Pay Now online button if confirmed and not paid yet */}
                                            {selectedOrder.status === "confirmed" && selectedOrder.payment_mode === "razorpay" && selectedOrder.payment_status !== "paid" && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handlePayNow(selectedOrder)}
                                                    disabled={payingOrder === selectedOrder.id}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-xs"
                                                >
                                                    <CreditCard className="w-4 h-4 mr-1" /> Pay Now — ₹{selectedOrder.final_amount.toLocaleString("en-IN")}
                                                </Button>
                                            )}

                                            <Link href="/dashboard/farmer/market">
                                                <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white">
                                                    <ShoppingBag className="w-4 h-4 mr-1" /> Reorder / Buy More
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* Interactive Chat Modal with Shop Owner */}
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

            {/* Mock Razorpay Popup for deferred payment */}
            {mockOptions && (
                <MockRazorpayPopup
                    options={mockOptions}
                    onClose={() => {
                        setMockOptions(null);
                        setPayingOrder(null);
                        fetchOrdersData();
                    }}
                />
            )}
        </div>
    );
}

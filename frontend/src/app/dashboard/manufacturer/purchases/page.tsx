"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
    createPurchase, getPurchases, ManufacturerPurchase,
    getInboundProcurementRequests, acceptProcurementRequest, rejectProcurementRequest,
    MillProcurementRequest
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Truck, Plus, History, TrendingDown, CheckCircle2, Clock, XCircle, Send, Phone, MapPin, Check, AlertCircle, ShieldCheck, Scale } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import MockRazorpayPopup from "@/components/payment/MockRazorpayPopup";

const PERIOD_OPTIONS = [
    { label: "Today", value: "today" },
    { label: "Week", value: "7d" },
    { label: "Month", value: "30d" },
    { label: "3 Months", value: "90d" },
    { label: "All", value: "all" },
];

const QUALITY_COLORS: Record<string, string> = {
    A: "bg-green-100 text-green-700",
    B: "bg-yellow-100 text-yellow-700",
    C: "bg-red-100 text-red-700",
};

const PAYMENT_COLORS: Record<string, string> = {
    Cash: "bg-emerald-100 text-emerald-700",
    UPI: "bg-blue-100 text-blue-700",
    "Bank Transfer": "bg-indigo-100 text-indigo-700",
    Razorpay: "bg-purple-100 text-purple-700",
};

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<ManufacturerPurchase[]>([]);
    const [inboundRequests, setInboundRequests] = useState<MillProcurementRequest[]>([]);
    const [activeTab, setActiveTab] = useState<"ledger" | "inbound">("ledger");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mockOptions, setMockOptions] = useState<any>(null);
    const [period, setPeriod] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Accept / Reject Modals for farmer offers
    const [acceptModalOpen, setAcceptModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<MillProcurementRequest | null>(null);
    const [agreedPrice, setAgreedPrice] = useState<number>(0);
    const [acceptNotes, setAcceptNotes] = useState("");
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<any>();

    // Watch for total calculation
    const qty = watch("quantity");
    const price = watch("price_per_unit");
    const transport = watch("transport_cost");

    const filteredPurchases = useMemo(() => {
        const now = new Date();
        return purchases.filter(p => {
            const d = new Date(p.date);
            let inPeriod = true;
            if (period === "today") inPeriod = d.toDateString() === now.toDateString();
            else if (period === "7d") inPeriod = d >= new Date(now.getTime() - 7 * 86400000);
            else if (period === "30d") inPeriod = d >= new Date(now.getTime() - 30 * 86400000);
            else if (period === "90d") inPeriod = d >= new Date(now.getTime() - 90 * 86400000);
            const q = searchTerm.toLowerCase();
            const matchSearch = !q || p.crop_name.toLowerCase().includes(q) || p.farmer_name.toLowerCase().includes(q);
            return inPeriod && matchSearch;
        });
    }, [purchases, period, searchTerm]);

    const totalSpent = filteredPurchases.reduce((s, p) => s + p.total_cost, 0);
    const totalQty = filteredPurchases.reduce((s, p) => s + p.quantity, 0);
    const avgPrice = filteredPurchases.length > 0
        ? filteredPurchases.reduce((s, p) => s + p.price_per_unit, 0) / filteredPurchases.length
        : 0;
    const topCrop = filteredPurchases.length > 0
        ? Object.entries(filteredPurchases.reduce((acc, p) => { acc[p.crop_name] = (acc[p.crop_name] || 0) + p.total_cost; return acc; }, {} as Record<string, number>))
            .sort((a, b) => b[1] - a[1])[0]?.[0] || "—"
        : "—";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [purchaseData, inboundData] = await Promise.all([
                getPurchases(),
                getInboundProcurementRequests().catch(() => [])
            ]);
            setPurchases(purchaseData);
            setInboundRequests(inboundData);
        } catch (error) {
            console.error("Failed to fetch purchases:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAcceptModal = (req: MillProcurementRequest) => {
        setSelectedRequest(req);
        setAgreedPrice(req.expected_price_per_unit);
        setAcceptNotes("");
        setAcceptModalOpen(true);
    };

    const handleConfirmAccept = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;
        try {
            setActionLoading(true);
            const res = await acceptProcurementRequest(selectedRequest.id, {
                offered_price_per_unit: Number(agreedPrice),
                notes: acceptNotes
            });
            alert(res.message);
            setAcceptModalOpen(false);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to accept offer");
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenRejectModal = (req: MillProcurementRequest) => {
        setSelectedRequest(req);
        setRejectReason("");
        setRejectModalOpen(true);
    };

    const handleConfirmReject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRequest) return;
        try {
            setActionLoading(true);
            await rejectProcurementRequest(selectedRequest.id, {
                rejection_reason: rejectReason
            });
            alert("Supply request declined.");
            setRejectModalOpen(false);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to decline offer");
        } finally {
            setActionLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        try {
            const purchase = await createPurchase({
                ...data,
                quantity: parseFloat(data.quantity),
                price_per_unit: parseFloat(data.price_per_unit),
                transport_cost: parseFloat(data.transport_cost || 0),
                farmer_id: data.farmer_id ? parseInt(data.farmer_id) : undefined
            });

            // If Razorpay selected, open payment gateway
            if (data.payment_mode === "Razorpay") {
                const totalAmount = calculateTotal();
                if (totalAmount > 0) {
                    const { createPaymentOrder, verifyPayment, getRazorpayConfig } = await import("@/lib/payment-api");
                    const config = await getRazorpayConfig();

                    const paymentOrder = await createPaymentOrder({
                        amount: totalAmount,
                        payment_for: "manufacturer_purchase",
                        reference_id: purchase.id,
                    });

                    if (!(window as any).Razorpay) {
                        await new Promise<void>((resolve, reject) => {
                            const script = document.createElement("script");
                            script.src = "https://checkout.razorpay.com/v1/checkout.js";
                            script.onload = () => resolve();
                            script.onerror = () => reject();
                            document.body.appendChild(script);
                        });
                    }

                    const options = {
                        key: config.key_id,
                        amount: Math.round(totalAmount * 100),
                        currency: "INR",
                        name: "AgriChain Manufacturer",
                        description: `Purchase ${purchase.batch_id}`,
                        order_id: paymentOrder.razorpay_order_id,
                        theme: { color: "#2563eb" },
                        handler: async (response: any) => {
                            try {
                                await verifyPayment({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                });
                                alert("Payment successful!");
                            } catch (err) {
                                alert("Payment verification failed.");
                            }
                            fetchData();
                            setIsModalOpen(false);
                            reset();
                        },
                    };

                    if (config.key_id.startsWith("rzp_test_placeholder")) {
                        setMockOptions(options);
                        return;
                    }

                    const razorpay = new (window as any).Razorpay(options);
                    razorpay.open();
                    return;
                }
            }

            fetchData();
            setIsModalOpen(false);
            reset();
        } catch (error) {
            console.error("Failed to create purchase:", error);
            alert("Failed to record purchase.");
        }
    };

    const calculateTotal = () => {
        const q = parseFloat(qty as any) || 0;
        const p = parseFloat(price as any) || 0;
        const t = parseFloat(transport as any) || 0;
        return (q * p) + t;
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Raw Material Purchases</h1>
                    <p className="text-muted-foreground">Record and track crops bought from farmers</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> New Purchase
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground font-medium">Total Spent</p>
                        <p className="text-2xl font-bold text-foreground mt-1">₹{totalSpent.toLocaleString()}</p>
                        <div className="flex items-center text-xs text-blue-500 mt-1"><TrendingDown className="w-3 h-3 mr-1" /> Purchase cost</div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground font-medium">No. of Purchases</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{filteredPurchases.length}</p>
                        <p className="text-xs text-orange-500 mt-1">Transactions</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground font-medium">Total Qty Bought</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{totalQty.toLocaleString()} kg</p>
                        <p className="text-xs text-green-500 mt-1">Raw material</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground font-medium">Top Crop</p>
                        <p className="text-xl font-bold text-foreground mt-1 truncate">{topCrop}</p>
                        <p className="text-xs text-purple-500 mt-1">Avg ₹{avgPrice.toFixed(0)}/unit</p>
                    </CardContent>
                </Card>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-3 border-b">
                <button
                    onClick={() => setActiveTab("ledger")}
                    className={`pb-3 px-4 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${
                        activeTab === "ledger"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <History className="w-4 h-4" />
                    Purchases Ledger
                    <Badge variant="secondary" className="ml-1 text-xs">{purchases.length}</Badge>
                </button>

                <button
                    onClick={() => setActiveTab("inbound")}
                    className={`pb-3 px-4 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${
                        activeTab === "inbound"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <Send className="w-4 h-4" />
                    Inbound Farmer Harvest Requests
                    <Badge
                        variant={inboundRequests.filter(r => r.status === "pending").length > 0 ? "default" : "secondary"}
                        className="ml-1 text-xs"
                    >
                        {inboundRequests.filter(r => r.status === "pending").length} Pending
                    </Badge>
                </button>
            </div>

            {/* TAB 1: PURCHASES LEDGER */}
            {activeTab === "ledger" && (
                <>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex border rounded-lg overflow-hidden">
                            {PERIOD_OPTIONS.map(opt => (
                                <button key={opt.value} onClick={() => setPeriod(opt.value)}
                                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === opt.value ? "bg-blue-600 text-white" : "bg-white text-muted-foreground hover:bg-gray-50"}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            placeholder="Search crop or farmer…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-400 w-52"
                        />
                    </div>

                    {/* Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="w-5 h-5" /> Purchase History
                                <span className="ml-auto text-xs font-normal text-muted-foreground">{filteredPurchases.length} records</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-foreground font-medium border-b">
                                        <tr>
                                            <th className="px-6 py-4">Batch ID</th>
                                            <th className="px-6 py-4">Farmer</th>
                                            <th className="px-6 py-4">Crop</th>
                                            <th className="px-6 py-4">Quality</th>
                                            <th className="px-6 py-4 text-right">Qty</th>
                                            <th className="px-6 py-4 text-right">Price/Unit</th>
                                            <th className="px-6 py-4 text-right">Transport</th>
                                            <th className="px-6 py-4 text-right">Total Cost</th>
                                            <th className="px-6 py-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredPurchases.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                                                    No purchases found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredPurchases.map((p) => (
                                                <tr key={p.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{p.batch_id}</td>
                                                    <td className="px-6 py-4 font-medium text-foreground">{p.farmer_name}</td>
                                                    <td className="px-6 py-4 font-medium">{p.crop_name}</td>
                                                    <td className="px-6 py-4">
                                                        {p.quality_grade ? (
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${QUALITY_COLORS[p.quality_grade] || "bg-gray-100 text-muted-foreground"}`}>
                                                                Grade {p.quality_grade}
                                                            </span>
                                                        ) : "—"}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">{p.quantity} {p.unit}</td>
                                                    <td className="px-6 py-4 text-right">₹{p.price_per_unit.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-right text-muted-foreground">₹{(p.transport_cost || 0).toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-orange-700">₹{p.total_cost.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-muted-foreground">{new Date(p.date).toLocaleDateString("en-IN")}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* TAB 2: INBOUND FARMER HARVEST REQUESTS */}
            {activeTab === "inbound" && (
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Send className="w-5 h-5 text-blue-600" /> Inbound Produce Supply Requests
                                </span>
                                <Badge variant="outline">{inboundRequests.length} Total Requests</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-foreground font-medium border-b">
                                        <tr>
                                            <th className="px-6 py-4">Farmer Details</th>
                                            <th className="px-6 py-4">Crop & Grade</th>
                                            <th className="px-6 py-4 text-right">Quantity</th>
                                            <th className="px-6 py-4 text-right">Asking Rate</th>
                                            <th className="px-6 py-4 text-right">Est. Deal</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {inboundRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                                    <Send className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                                                    No harvest supply requests received from farmers yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            inboundRequests.map((req) => {
                                                const totalValue = req.quantity * req.expected_price_per_unit;
                                                const isPending = req.status === "pending";
                                                const isAccepted = req.status === "accepted";
                                                const isRejected = req.status === "rejected";

                                                return (
                                                    <tr key={req.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-foreground">{req.farmer_name}</div>
                                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                                <Phone className="w-3 h-3 text-emerald-600" /> {req.farmer_phone}
                                                            </div>
                                                            {req.farmer_location && (
                                                                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3 text-red-500" /> {req.farmer_location}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-semibold text-blue-900">{req.crop_name}</div>
                                                            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                                <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                                                                    {req.quality_grade || "Grade A"}
                                                                </Badge>
                                                                {req.moisture_content && (
                                                                    <span className="text-[11px]">Moisture: {req.moisture_content}%</span>
                                                                )}
                                                            </div>
                                                            {req.notes && (
                                                                <div className="text-[11px] text-muted-foreground italic truncate max-w-xs mt-0.5">
                                                                    &quot;{req.notes}&quot;
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-medium">
                                                            {req.quantity} {req.unit}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            ₹{req.expected_price_per_unit}/{req.unit}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-emerald-700">
                                                            ₹{totalValue.toLocaleString("en-IN")}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {isPending && (
                                                                <Badge className="bg-amber-100 text-amber-800 border-amber-300 gap-1 text-xs">
                                                                    <Clock className="w-3 h-3 animate-spin" /> Pending Review
                                                                </Badge>
                                                            )}
                                                            {isAccepted && (
                                                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 gap-1 text-xs">
                                                                    <CheckCircle2 className="w-3 h-3" /> Accepted
                                                                </Badge>
                                                            )}
                                                            {isRejected && (
                                                                <Badge className="bg-red-100 text-red-800 border-red-300 gap-1 text-xs">
                                                                    <XCircle className="w-3 h-3" /> Declined
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {isPending ? (
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleOpenAcceptModal(req)}
                                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3"
                                                                    >
                                                                        Accept & Buy
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleOpenRejectModal(req)}
                                                                        className="text-red-600 hover:bg-red-50 border-red-200 text-xs h-8 px-2.5"
                                                                    >
                                                                        Decline
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground italic">Processed</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal: Record Manual Purchase */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Purchase">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Farmer Name</Label>
                            <Input {...register("farmer_name", { required: true })} placeholder="Ram Lal" />
                        </div>
                        <div className="space-y-2">
                            <Label>Farmer ID (Optional)</Label>
                            <Input type="number" {...register("farmer_id")} placeholder="Registered ID" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Crop Name</Label>
                            <Input {...register("crop_name", { required: true })} placeholder="Wheat" />
                        </div>
                        <div className="space-y-2">
                            <Label>Quality Grade</Label>
                            <select {...register("quality_grade")} className="w-full p-2 border rounded-md">
                                <option value="A">Grade A (Premium)</option>
                                <option value="B">Grade B (Standard)</option>
                                <option value="C">Grade C (Low)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input type="number" step="0.01" {...register("quantity", { required: true })} placeholder="100" />
                        </div>
                        <div className="space-y-2">
                            <Label>Unit</Label>
                            <select {...register("unit")} className="w-full p-2 border rounded-md">
                                <option value="kg">kg</option>
                                <option value="tons">tons</option>
                                <option value="quintal">quintal</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Price per Unit</Label>
                            <Input type="number" step="0.01" {...register("price_per_unit", { required: true })} placeholder="20" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Transport Cost (₹)</Label>
                            <Input type="number" step="0.01" {...register("transport_cost")} placeholder="500" />
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Mode</Label>
                            <select {...register("payment_mode")} className="w-full p-2 border rounded-md">
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Razorpay">Pay Online (Razorpay)</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                        <span className="font-semibold text-foreground">Total Purchase Cost:</span>
                        <span className="text-xl font-bold text-blue-700">₹{calculateTotal().toLocaleString()}</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Confirm Purchase</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Accept Inbound Farmer Harvest Offer */}
            <Modal
                isOpen={acceptModalOpen}
                onClose={() => setAcceptModalOpen(false)}
                title="Accept Farmer Harvest Offer"
            >
                {selectedRequest && (
                    <form onSubmit={handleConfirmAccept} className="space-y-4 pt-2">
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-emerald-950 text-sm">{selectedRequest.farmer_name}</span>
                                <span className="font-semibold text-emerald-800">{selectedRequest.farmer_phone}</span>
                            </div>
                            <div className="text-emerald-700">
                                Produce: <strong>{selectedRequest.crop_name}</strong> • Quantity: <strong>{selectedRequest.quantity} {selectedRequest.unit}s</strong>
                            </div>
                            <div className="text-emerald-700">
                                Asking Rate: <strong>₹{selectedRequest.expected_price_per_unit}/{selectedRequest.unit}</strong>
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs font-semibold">Agreed Purchase Rate (₹ per {selectedRequest.unit})</Label>
                            <Input
                                type="number"
                                required
                                min="100"
                                step="10"
                                value={agreedPrice}
                                onChange={(e) => setAgreedPrice(parseFloat(e.target.value) || 0)}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label className="text-xs font-semibold">Logistics & Weighbridge Instructions (Optional)</Label>
                            <Input
                                placeholder="e.g. Weighbridge gate 2 arrival between 9 AM - 4 PM"
                                value={acceptNotes}
                                onChange={(e) => setAcceptNotes(e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div className="p-3 bg-muted/40 rounded-xl flex justify-between items-center text-sm font-semibold">
                            <span>Total Payable to Farmer:</span>
                            <span className="text-lg font-black text-emerald-800">
                                ₹{(selectedRequest.quantity * agreedPrice).toLocaleString("en-IN")}
                            </span>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setAcceptModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={actionLoading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {actionLoading ? "Accepting..." : "Confirm & Create Purchase"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Modal: Decline Inbound Harvest Offer */}
            <Modal
                isOpen={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                title="Decline Supply Offer"
            >
                {selectedRequest && (
                    <form onSubmit={handleConfirmReject} className="space-y-4 pt-2">
                        <p className="text-sm text-muted-foreground">
                            Decline harvest offer for <strong>{selectedRequest.quantity} {selectedRequest.unit}s</strong> of <strong>{selectedRequest.crop_name}</strong> from <strong>{selectedRequest.farmer_name}</strong>?
                        </p>

                        <div>
                            <Label className="text-xs font-semibold">Reason for Declining (Optional)</Label>
                            <Input
                                placeholder="e.g. High moisture content / Full milling storage capacity"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setRejectModalOpen(false)}>
                                Back
                            </Button>
                            <Button
                                type="submit"
                                disabled={actionLoading}
                                variant="destructive"
                            >
                                {actionLoading ? "Declining..." : "Decline Offer"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {mockOptions && <MockRazorpayPopup options={mockOptions} onClose={() => setMockOptions(null)} />}
        </div>
    );
}


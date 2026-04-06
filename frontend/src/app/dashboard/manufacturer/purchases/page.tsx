"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { createPurchase, getPurchases, ManufacturerPurchase } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Plus, History, TrendingDown } from "lucide-react";
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
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mockOptions, setMockOptions] = useState<any>(null);
    const [period, setPeriod] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

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
            const data = await getPurchases();
            setPurchases(data);
        } catch (error) {
            console.error("Failed to fetch purchases:", error);
        } finally {
            setLoading(false);
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
                    <h1 className="text-3xl font-bold text-gray-800">Raw Material Purchases</h1>
                    <p className="text-gray-500">Record and track crops bought from farmers</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" /> New Purchase
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 font-medium">Total Spent</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">₹{totalSpent.toLocaleString()}</p>
                        <div className="flex items-center text-xs text-blue-500 mt-1"><TrendingDown className="w-3 h-3 mr-1" /> Purchase cost</div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 font-medium">No. of Purchases</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{filteredPurchases.length}</p>
                        <p className="text-xs text-orange-500 mt-1">Transactions</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 font-medium">Total Qty Bought</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{totalQty.toLocaleString()} kg</p>
                        <p className="text-xs text-green-500 mt-1">Raw material</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 font-medium">Top Crop</p>
                        <p className="text-xl font-bold text-gray-800 mt-1 truncate">{topCrop}</p>
                        <p className="text-xs text-purple-500 mt-1">Avg ₹{avgPrice.toFixed(0)}/unit</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="flex border rounded-lg overflow-hidden">
                    {PERIOD_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => setPeriod(opt.value)}
                            className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === opt.value ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                            {opt.label}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Search crop or farmer…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="border rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 w-52"
                />
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" /> Purchase History
                        <span className="ml-auto text-xs font-normal text-gray-400">{filteredPurchases.length} records</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-medium border-b">
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
                                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                            No purchases found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPurchases.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.batch_id}</td>
                                            <td className="px-6 py-4 font-medium text-gray-800">{p.farmer_name}</td>
                                            <td className="px-6 py-4 font-medium">{p.crop_name}</td>
                                            <td className="px-6 py-4">
                                                {p.quality_grade ? (
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${QUALITY_COLORS[p.quality_grade] || "bg-gray-100 text-gray-600"}`}>
                                                        Grade {p.quality_grade}
                                                    </span>
                                                ) : "—"}
                                            </td>
                                            <td className="px-6 py-4 text-right">{p.quantity} {p.unit}</td>
                                            <td className="px-6 py-4 text-right">₹{p.price_per_unit.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right text-gray-500">₹{(p.transport_cost || 0).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-bold text-orange-700">₹{p.total_cost.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-gray-500">{new Date(p.date).toLocaleDateString("en-IN")}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

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
                        <span className="font-semibold text-gray-700">Total Purchase Cost:</span>
                        <span className="text-xl font-bold text-blue-700">₹{calculateTotal().toLocaleString()}</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Confirm Purchase</Button>
                    </div>
                </form>
            </Modal>

            {mockOptions && <MockRazorpayPopup options={mockOptions} onClose={() => setMockOptions(null)} />}
        </div>
    );
}

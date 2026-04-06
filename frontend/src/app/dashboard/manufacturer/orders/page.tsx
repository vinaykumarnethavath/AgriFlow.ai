"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getManufacturerSales, updateSaleDeliveryStatus, getMyProducts, ManufacturerSale, Product } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Truck, CheckCircle, Package, ArrowUpRight,
    TrendingUp, ShoppingCart
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; next: string | null; nextLabel: string | null; btnClass: string }> = {
    pending:    { label: "Pending",    badgeClass: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100", next: "dispatched", nextLabel: "Mark Dispatched", btnClass: "bg-blue-600 hover:bg-blue-700" },
    dispatched: { label: "Dispatched", badgeClass: "bg-blue-100 text-blue-700 hover:bg-blue-100",       next: "delivered",  nextLabel: "Mark Delivered",  btnClass: "bg-green-600 hover:bg-green-700" },
    delivered:  { label: "Delivered",  badgeClass: "bg-green-100 text-green-700 hover:bg-green-100",    next: null,         nextLabel: null,              btnClass: "" },
};

export default function ManufacturerOrdersPage() {
    const [sales, setSales] = useState<ManufacturerSale[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [timeFilter, setTimeFilter] = useState("all");
    const [selectedSale, setSelectedSale] = useState<ManufacturerSale | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [salesData, productsData] = await Promise.all([
                getManufacturerSales(),
                getMyProducts().catch(() => []),
            ]);
            setSales(salesData);
            setProducts(productsData as Product[]);
            if (salesData.length > 0 && !selectedSale) setSelectedSale(salesData[0]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const productMap = useMemo(() => {
        const m: Record<number, string> = {};
        products.forEach(p => { m[p.id] = p.name; });
        return m;
    }, [products]);

    const filtered = useMemo(() => {
        return sales.filter(s => {
            const matchStatus = statusFilter === "all" || (s.delivery_status || "pending") === statusFilter;
            if (!matchStatus) return false;
            if (timeFilter === "all") return true;
            const d = new Date(s.date);
            const now = new Date();
            if (timeFilter === "today") return d.toDateString() === now.toDateString();
            if (timeFilter === "week") { const w = new Date(); w.setDate(now.getDate() - 7); return d >= w; }
            if (timeFilter === "month") { const m = new Date(); m.setMonth(now.getMonth() - 1); return d >= m; }
            return true;
        });
    }, [sales, statusFilter, timeFilter]);

    const counts = useMemo(() => ({
        all: sales.length,
        pending: sales.filter(s => (s.delivery_status || "pending") === "pending").length,
        dispatched: sales.filter(s => s.delivery_status === "dispatched").length,
        delivered: sales.filter(s => s.delivery_status === "delivered").length,
    }), [sales]);

    const handleStatusUpdate = async (saleId: number, newStatus: string) => {
        setUpdatingId(saleId);
        try {
            await updateSaleDeliveryStatus(saleId, newStatus);
            setSales(prev => prev.map(s => s.id === saleId ? { ...s, delivery_status: newStatus } : s));
            if (selectedSale?.id === saleId) setSelectedSale(prev => prev ? { ...prev, delivery_status: newStatus } : null);
        } catch (e) {
            console.error(e);
            alert("Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
    );

    const sel = selectedSale;
    const selStatus = sel?.delivery_status || "pending";
    const selCfg = STATUS_CONFIG[selStatus] || STATUS_CONFIG.pending;
    const selProductName = sel ? (productMap[sel.product_id] || `Product #${sel.product_id}`) : "";
    const grossRevenue = sel ? sel.quantity * sel.selling_price : 0;
    const selProfit = sel ? sel.total_amount : 0;

    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-100px)]">
            <div className="flex flex-col h-full space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Orders & Delivery</h1>
                        <p className="text-gray-500 text-sm">Track and advance delivery status of all outgoing sales</p>
                    </div>
                    <button onClick={fetchAll}
                        className="flex items-center gap-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg border border-blue-200 font-medium transition-colors">
                        <ArrowUpRight className="h-4 w-4" /> Refresh
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
                    {/* ── Left Panel: Order List ── */}
                    <Card className="col-span-1 border-r h-full overflow-y-auto">
                        <CardHeader className="pb-3 border-b sticky top-0 bg-white z-10">
                            <CardTitle className="text-lg">Order History</CardTitle>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)}
                                    className="p-1 border rounded text-xs text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                                    <option value="all">Any Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                </select>
                                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                                    className="p-1 border rounded text-xs text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                                    <option value="all">Any Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="dispatched">Dispatched</option>
                                    <option value="delivered">Delivered</option>
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500 text-sm">No matching orders</div>
                                ) : (
                                    filtered.map(sale => {
                                        const st = sale.delivery_status || "pending";
                                        const cfg = STATUS_CONFIG[st] || STATUS_CONFIG.pending;
                                        return (
                                            <div key={sale.id} onClick={() => setSelectedSale(sale)}
                                                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedSale?.id === sale.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""}`}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-gray-800 text-sm">#{sale.id}</span>
                                                    <span className="text-xs text-gray-500">{new Date(sale.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">{sale.buyer_name}</div>
                                                        <div className="text-gray-500 capitalize text-xs">{sale.buyer_type}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-green-700">₹{sale.total_amount.toLocaleString()}</div>
                                                        <Badge className={cfg.badgeClass}>{cfg.label}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── Right Panel: Order Detail ── */}
                    <Card className="col-span-2 h-full overflow-y-auto">
                        {sel ? (
                            <>
                                <CardHeader className="border-b bg-gray-50 sticky top-0 z-10">
                                    <div className="flex justify-between items-center flex-wrap gap-2">
                                        <div>
                                            <CardTitle className="flex items-center gap-3">
                                                Order #{sel.id}
                                                <Badge className={selCfg.badgeClass}>{selCfg.label}</Badge>
                                            </CardTitle>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {new Date(sel.date).toLocaleString("en-IN")} · {sel.buyer_name}
                                            </p>
                                        </div>
                                        {selCfg.next && (
                                            <Button size="sm" className={selCfg.btnClass}
                                                disabled={updatingId === sel.id}
                                                onClick={() => handleStatusUpdate(sel.id, selCfg.next!)}>
                                                {selStatus === "pending" ? <Truck className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                                                {updatingId === sel.id ? "Updating…" : selCfg.nextLabel}
                                            </Button>
                                        )}
                                        {selStatus === "delivered" && (
                                            <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold">
                                                <CheckCircle className="w-5 h-5" /> Delivered
                                            </span>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="p-6 space-y-6">
                                    {/* Sale Details Table */}
                                    <div>
                                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm text-gray-700">
                                            <ShoppingCart className="w-4 h-4" /> Sale Details
                                        </h3>
                                        <div className="border rounded-xl overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 border-b">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Product</th>
                                                        <th className="px-4 py-3 text-center font-medium text-gray-600">Qty</th>
                                                        <th className="px-4 py-3 text-right font-medium text-gray-600">Unit Price</th>
                                                        <th className="px-4 py-3 text-right font-medium text-gray-600">Discount</th>
                                                        <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="hover:bg-gray-50/50">
                                                        <td className="px-4 py-3 font-medium">{selProductName}</td>
                                                        <td className="px-4 py-3 text-center">{sel.quantity} kg</td>
                                                        <td className="px-4 py-3 text-right">₹{sel.selling_price}</td>
                                                        <td className="px-4 py-3 text-right text-green-600">{sel.discount > 0 ? `-₹${sel.discount}` : "—"}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-gray-900">₹{sel.total_amount.toLocaleString()}</td>
                                                    </tr>
                                                </tbody>
                                                <tfoot className="bg-gray-50 font-medium text-sm">
                                                    <tr>
                                                        <td colSpan={4} className="px-4 py-2 text-right text-gray-600">Gross Amount</td>
                                                        <td className="px-4 py-2 text-right">₹{grossRevenue.toLocaleString()}</td>
                                                    </tr>
                                                    {sel.discount > 0 && (
                                                        <tr>
                                                            <td colSpan={4} className="px-4 py-2 text-right text-green-600">Discount</td>
                                                            <td className="px-4 py-2 text-right text-green-600">-₹{sel.discount}</td>
                                                        </tr>
                                                    )}
                                                    <tr className="border-t-2 border-gray-200 text-base">
                                                        <td colSpan={4} className="px-4 py-3 text-right">
                                                            Total ({sel.payment_mode})
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-bold text-green-700 text-lg">₹{sel.total_amount.toLocaleString()}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Order Info Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                        {[
                                            { label: "Invoice ID", value: sel.invoice_id, mono: true },
                                            { label: "Buyer Type", value: sel.buyer_type, capitalize: true },
                                            { label: "Payment Mode", value: sel.payment_mode, capitalize: true },
                                            { label: "Delivery Status", value: selCfg.label },
                                            { label: "Sale Date", value: new Date(sel.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                                            { label: "Quantity", value: `${sel.quantity} kg @ ₹${sel.selling_price}/kg` },
                                        ].map(item => (
                                            <div key={item.label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                <p className="text-xs text-gray-400 font-medium mb-1">{item.label}</p>
                                                <p className={`font-semibold text-gray-800 ${item.mono ? "font-mono text-xs" : ""} ${item.capitalize ? "capitalize" : ""}`}>{item.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Revenue Summary */}
                                    <div className="rounded-xl p-5 border-2 bg-emerald-50 border-emerald-200">
                                        <h3 className="font-semibold mb-4 flex items-center gap-2 text-sm">
                                            <TrendingUp className="w-4 h-4 text-emerald-600" /> Sale Summary
                                        </h3>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            {[
                                                { label: "Gross Amount", value: `₹${grossRevenue.toLocaleString()}`, color: "text-blue-700", bg: "bg-blue-50" },
                                                { label: "Discount", value: `₹${sel.discount || 0}`, color: "text-orange-600", bg: "bg-orange-50" },
                                                { label: "Net Revenue", value: `₹${selProfit.toLocaleString()}`, color: "text-emerald-700 font-bold", bg: "bg-emerald-100" },
                                            ].map(item => (
                                                <div key={item.label} className={`${item.bg} rounded-lg p-3`}>
                                                    <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                                                    <div className={`text-base ${item.color}`}>{item.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <Package className="w-16 h-16 mb-4 opacity-20" />
                                <p>Select an order to view details</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}

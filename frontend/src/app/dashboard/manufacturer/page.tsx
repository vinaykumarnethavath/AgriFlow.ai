"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Factory, Truck, ShoppingCart,
    ArrowUpRight, ArrowDownRight, User, TrendingUp,
    Wallet, BarChart2, Package, DollarSign, Clock, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import api, {
    getManufacturerStats, getMillSalesTrend, getPurchases, getManufacturerSales,
    getMillAccountingSummary,
    ManufacturerStats, ManufacturerPurchase, ManufacturerSale
} from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PERIOD_OPTIONS = [
    { label: "7D", value: "7d" },
    { label: "1M", value: "30d" },
    { label: "3M", value: "90d" },
    { label: "1Y", value: "1y" },
];

const PERIOD_LABELS: Record<string, string> = {
    "7d": "Last 7 Days", "30d": "Last 30 Days", "90d": "Last 3 Months", "1y": "Last Year",
};

const DELIVERY_STATUS: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
    dispatched: { label: "Dispatched", color: "bg-blue-100 text-blue-700" },
    delivered: { label: "Delivered", color: "bg-green-100 text-green-700" },
};

export default function ManufacturerDashboard() {
    const { user } = useAuth();
    const relationMap: Record<string, string> = { "son_of": "S/o", "wife_of": "W/o", "daughter_of": "D/o", "S/O": "S/o", "W/O": "W/o", "D/O": "D/o" };
    const [stats, setStats] = useState<ManufacturerStats | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [salesTrend, setSalesTrend] = useState<{ date: string; sales: number }[]>([]);
    const [recentSales, setRecentSales] = useState<ManufacturerSale[]>([]);
    const [monthExpenses, setMonthExpenses] = useState(0);
    const [period, setPeriod] = useState("7d");
    const [chartLoading, setChartLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAll = async () => {
        try {
            const [statsData, profileRes, trend, sales, accounting] = await Promise.all([
                getManufacturerStats(),
                api.get("/manufacturer/profile").catch(() => ({ data: null })),
                getMillSalesTrend("7d"),
                getManufacturerSales(),
                getMillAccountingSummary("30d").catch(() => null),
            ]);
            setStats(statsData);
            if (profileRes?.data) setProfile(profileRes.data);
            setSalesTrend(trend);
            setRecentSales(sales.slice(0, 8));
            if (accounting) setMonthExpenses(accounting.total_expenses);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePeriodChange = async (p: string) => {
        setPeriod(p);
        setChartLoading(true);
        try {
            const trend = await getMillSalesTrend(p);
            setSalesTrend(trend);
        } catch (e) {
            console.error(e);
        } finally {
            setChartLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
    );

    const netProfit = stats?.net_profit ?? 0;
    const profitColor = netProfit >= 0 ? "text-emerald-700" : "text-red-700";
    const profitBg = netProfit >= 0 ? "border-emerald-200 bg-emerald-50/60" : "border-red-200 bg-red-50/60";

    return (
        <div className="space-y-6">
            {/* Profile Banner */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 border border-blue-100 rounded-xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {profile?.profile_picture_url ? (
                        <img src={profile.profile_picture_url} alt="Mill Logo" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl border-2 border-white shadow-sm">
                            {(profile?.mill_name || user?.full_name || "M").charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-800">{profile?.mill_name || "Mill Dashboard"}</h1>
                            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-md font-mono">ID: {profile?.mill_id || profile?.id || "—"}</span>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <User className="w-4 h-4 text-blue-600" />
                            Owner: <span className="font-semibold text-gray-800 ml-1">{profile?.owner_name || user?.full_name}</span>
                            {profile?.father_name && (
                                <span className="ml-2 bg-white/80 px-2 py-0.5 rounded border border-gray-100 text-gray-500 text-xs font-medium">
                                    {relationMap[profile?.relation_type || ""] || profile?.relation_type || "S/o"}: <span className="text-gray-700">{profile.father_name}</span>
                                </span>
                            )}
                        </p>
                        {profile?.district && (
                            <p className="text-xs text-gray-500">{[profile.village, profile.mandal, profile.district].filter(Boolean).join(", ")}</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <Link href="/dashboard/manufacturer/purchases">
                        <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">+ Record Purchase</button>
                    </Link>
                    <Link href="/dashboard/manufacturer/sales">
                        <button className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">+ New Sale</button>
                    </Link>
                </div>
            </div>

            {/* KPI Cards — 4 cards with icon boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow border-blue-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-muted-foreground">Month Revenue</p>
                            <div className="bg-purple-100 p-2 rounded-lg"><TrendingUp className="h-5 w-5 text-purple-600" /></div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">₹{Number(stats?.month_revenue || 0).toLocaleString()}</h3>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3 text-purple-500" /> This month</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-orange-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-muted-foreground">Month Purchases</p>
                            <div className="bg-orange-100 p-2 rounded-lg"><Truck className="h-5 w-5 text-orange-600" /></div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">₹{Number(stats?.month_purchases || 0).toLocaleString()}</h3>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><ArrowDownRight className="w-3 h-3 text-orange-500" /> Raw material cost</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-blue-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-muted-foreground">Raw Stock</p>
                            <div className="bg-blue-100 p-2 rounded-lg"><Package className="h-5 w-5 text-blue-600" /></div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{Number(stats?.raw_stock || 0).toLocaleString()} kg</h3>
                        <p className="text-xs text-muted-foreground mt-1">Finished: {Number(stats?.finished_stock || 0).toLocaleString()} kg</p>
                    </CardContent>
                </Card>
                <Card className={`hover:shadow-md transition-shadow ${netProfit >= 0 ? "border-emerald-200 bg-emerald-50/30" : "border-red-200 bg-red-50/30"}`}>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                            <div className={`p-2 rounded-lg ${netProfit >= 0 ? "bg-emerald-100" : "bg-red-100"}`}>
                                <DollarSign className={`h-5 w-5 ${netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`} />
                            </div>
                        </div>
                        <h3 className={`text-2xl font-bold ${profitColor}`}>₹{Math.abs(netProfit).toLocaleString()}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{stats?.avg_efficiency || 0}% avg efficiency · {stats?.total_batches || 0} batches</p>
                    </CardContent>
                </Card>
            </div>

            {/* Chart 2/3 + Side Panel 1/3 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="flex flex-col lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3 pb-2">
                        <CardTitle className="flex items-center gap-2">
                            <BarChart2 className="w-5 h-5 text-blue-600" />
                            Sales Trend — {PERIOD_LABELS[period]}
                        </CardTitle>
                        <div className="flex items-center border rounded-lg overflow-hidden">
                            {PERIOD_OPTIONS.map(opt => (
                                <button key={opt.value} onClick={() => handlePeriodChange(opt.value)}
                                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${period === opt.value ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="h-[280px] pt-4">
                        {chartLoading ? (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full" />
                            </div>
                        ) : salesTrend.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">No sales data for this period</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => { const dt = new Date(d); return `${dt.getDate()}/${dt.getMonth()+1}`; }} />
                                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(Number(v)/1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, "Sales"]} labelFormatter={l => `Date: ${l}`} />
                                    <Line type="monotone" dataKey="sales" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 2, fill: "#7c3aed" }} activeDot={{ r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-6 lg:col-span-1">
                    <Card className="border-amber-200 bg-amber-50/60 flex-1 flex flex-col justify-center">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-700">Monthly Expenses</CardTitle>
                            <Wallet className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-800 mb-1">₹{monthExpenses.toLocaleString()}</div>
                            <p className="text-xs text-amber-600">Overheads this month</p>
                        </CardContent>
                    </Card>
                    <Card className={`flex-1 flex flex-col justify-center ${profitBg}`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className={`text-sm font-medium ${netProfit >= 0 ? "text-emerald-700" : "text-red-700"}`}>Net Profit</CardTitle>
                            <TrendingUp className={`h-4 w-4 ${netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-bold mb-1 ${profitColor}`}>₹{Math.abs(netProfit).toLocaleString()}</div>
                            <p className={`text-xs ${netProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>{netProfit >= 0 ? "Profitable this month" : "Loss this month"}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Sales Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-purple-500" /> Recent Sales</span>
                        <Link href="/dashboard/manufacturer/orders" className="text-xs text-purple-500 hover:underline font-normal">View all orders →</Link>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Invoice</th>
                                    <th className="px-4 py-3">Buyer</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Qty</th>
                                    <th className="px-4 py-3">Payment</th>
                                    <th className="px-4 py-3">Delivery</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentSales.length === 0 ? (
                                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No recent sales found.</td></tr>
                                ) : (
                                    recentSales.map(s => {
                                        const ds = DELIVERY_STATUS[s.delivery_status || "pending"] || DELIVERY_STATUS.pending;
                                        return (
                                            <tr key={s.id} className="hover:bg-gray-50 border-b">
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(s.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                                                <td className="px-4 py-3 font-mono text-xs text-gray-400">{s.invoice_id}</td>
                                                <td className="px-4 py-3 font-medium whitespace-nowrap">{s.buyer_name}</td>
                                                <td className="px-4 py-3"><span className="capitalize text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">{s.buyer_type}</span></td>
                                                <td className="px-4 py-3 text-gray-600">{s.quantity} kg</td>
                                                <td className="px-4 py-3"><span className="capitalize text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">{s.payment_mode}</span></td>
                                                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ds.color}`}>{ds.label}</span></td>
                                                <td className="px-4 py-3 text-right font-bold text-gray-900">₹{s.total_amount.toLocaleString()}</td>
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
    );
}

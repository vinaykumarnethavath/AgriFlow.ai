"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getMillAnalytics, getMillSalesTrend, MillAnalytics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    TrendingUp, TrendingDown, Truck, Factory,
    Wheat, ShoppingCart, BarChart2, ArrowUpRight, DollarSign
} from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";

const PERIOD_OPTIONS = [
    { label: "7D", value: "7d" },
    { label: "1M", value: "30d" },
    { label: "3M", value: "90d" },
    { label: "1Y", value: "1y" },
];

const PERIOD_LABELS: Record<string, string> = {
    "7d": "Last 7 Days", "30d": "Last 30 Days", "90d": "Last 3 Months", "1y": "Last Year",
};

export default function MillAnalyticsPage() {
    const [data, setData] = useState<MillAnalytics | null>(null);
    const [trend, setTrend] = useState<{ date: string; sales: number }[]>([]);
    const [period, setPeriod] = useState("30d");
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);

    useEffect(() => {
        fetchAll("30d");
    }, []);

    const fetchAll = async (p: string) => {
        setLoading(true);
        try {
            const [analyticsData, trendData] = await Promise.all([
                getMillAnalytics(p),
                getMillSalesTrend(p),
            ]);
            setData(analyticsData);
            setTrend(trendData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePeriod = async (p: string) => {
        setPeriod(p);
        setChartLoading(true);
        try {
            const [analyticsData, trendData] = await Promise.all([
                getMillAnalytics(p),
                getMillSalesTrend(p),
            ]);
            setData(analyticsData);
            setTrend(trendData);
        } catch (e) {
            console.error(e);
        } finally {
            setChartLoading(false);
        }
    };

    const totalCosts = useMemo(() => {
        if (!data) return 0;
        return data.total_purchase_cost + data.total_processing_cost + data.total_expenses;
    }, [data]);

    const progressBars = useMemo(() => {
        if (!data || data.total_revenue === 0) return [];
        return [
            { label: "Purchase Cost", value: data.total_purchase_cost, color: "bg-orange-400", pct: (data.total_purchase_cost / data.total_revenue) * 100 },
            { label: "Processing Cost", value: data.total_processing_cost, color: "bg-purple-400", pct: (data.total_processing_cost / data.total_revenue) * 100 },
            { label: "Other Expenses", value: data.total_expenses, color: "bg-amber-400", pct: (data.total_expenses / data.total_revenue) * 100 },
        ];
    }, [data]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
    );

    const isProfit = (data?.net_profit ?? 0) >= 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Mill Analytics</h1>
                    <p className="text-gray-500 text-sm">Full financial overview — {PERIOD_LABELS[period]}</p>
                </div>
                <div className="flex items-center border rounded-lg overflow-hidden shadow-sm">
                    {PERIOD_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => handlePeriod(opt.value)}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${period === opt.value ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow border-purple-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                            <div className="bg-purple-100 p-2 rounded-lg"><TrendingUp className="h-5 w-5 text-purple-600" /></div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">₹{(data?.total_revenue || 0).toLocaleString()}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{data?.total_sales_count || 0} sales · avg ₹{(data?.avg_sale_value || 0).toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-orange-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-muted-foreground">Total Costs</p>
                            <div className="bg-orange-100 p-2 rounded-lg"><Truck className="h-5 w-5 text-orange-600" /></div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">₹{totalCosts.toLocaleString()}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Purchase + Processing + Overhead</p>
                    </CardContent>
                </Card>
                <Card className={`hover:shadow-md transition-shadow ${isProfit ? "border-emerald-200 bg-emerald-50/30" : "border-red-200 bg-red-50/30"}`}>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                            <div className={`p-2 rounded-lg ${isProfit ? "bg-emerald-100" : "bg-red-100"}`}>
                                <DollarSign className={`h-5 w-5 ${isProfit ? "text-emerald-600" : "text-red-600"}`} />
                            </div>
                        </div>
                        <h3 className={`text-2xl font-bold ${isProfit ? "text-emerald-700" : "text-red-700"}`}>₹{Math.abs(data?.net_profit || 0).toLocaleString()}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Margin: {data?.profit_margin || 0}%</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-cyan-100">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-muted-foreground">Avg Efficiency</p>
                            <div className="bg-cyan-100 p-2 rounded-lg"><Factory className="h-5 w-5 text-cyan-600" /></div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{data?.avg_efficiency || 0}%</h3>
                        <p className="text-xs text-muted-foreground mt-1">Production efficiency</p>
                    </CardContent>
                </Card>
            </div>

            {/* P&L Breakdown + Trend Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* P&L Progress Breakdown */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BarChart2 className="w-5 h-5 text-blue-500" /> Cost Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">Total Revenue</span>
                                <span className="font-bold text-purple-700">₹{(data?.total_revenue || 0).toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-purple-100 rounded-full h-3">
                                <div className="bg-purple-500 h-3 rounded-full w-full" />
                            </div>
                        </div>

                        {progressBars.map(bar => (
                            <div key={bar.label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">{bar.label}</span>
                                    <span className="font-medium">₹{bar.value.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div className={`${bar.color} h-2.5 rounded-full transition-all duration-500`}
                                        style={{ width: `${Math.min(bar.pct, 100)}%` }} />
                                </div>
                                <p className="text-xs text-gray-400 text-right mt-0.5">{bar.pct.toFixed(1)}% of revenue</p>
                            </div>
                        ))}

                        <div className={`mt-4 p-4 rounded-xl border-2 ${isProfit ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-sm">Net Profit</span>
                                {isProfit
                                    ? <TrendingUp className="w-4 h-4 text-emerald-600" />
                                    : <TrendingDown className="w-4 h-4 text-red-600" />
                                }
                            </div>
                            <p className={`text-2xl font-bold mt-1 ${isProfit ? "text-emerald-700" : "text-red-700"}`}>
                                {isProfit ? "" : "-"}₹{Math.abs(data?.net_profit || 0).toLocaleString()}
                            </p>
                            <p className={`text-xs mt-0.5 ${isProfit ? "text-emerald-600" : "text-red-500"}`}>
                                Margin: {data?.profit_margin || 0}%
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Trend Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TrendingUp className="w-5 h-5 text-purple-500" /> Revenue Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {chartLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full" />
                            </div>
                        ) : trend.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data for this period</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => { const dt = new Date(d); return `${dt.getDate()}/${dt.getMonth()+1}`; }} />
                                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(Number(v)/1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, "Revenue"]} labelFormatter={l => `Date: ${l}`} />
                                    <Line type="monotone" dataKey="sales" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Top Crops + Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Crops Bought */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Wheat className="w-5 h-5 text-amber-500" /> Top Crops Purchased
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(data?.top_crops?.length ?? 0) === 0 ? (
                            <p className="text-sm text-gray-400 py-4 text-center">No purchase data for this period.</p>
                        ) : (
                            <div className="space-y-1">
                                <div className="grid grid-cols-4 text-xs font-medium text-gray-500 px-3 pb-2 border-b">
                                    <span className="col-span-2">Crop</span>
                                    <span className="text-center">Qty (kg)</span>
                                    <span className="text-right">Total Cost</span>
                                </div>
                                {data!.top_crops.map((crop, i) => (
                                    <div key={crop.crop_name} className="grid grid-cols-4 items-center px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm">
                                        <div className="col-span-2 flex items-center gap-2">
                                            <span className="text-xs text-gray-400 font-mono w-4">{i + 1}</span>
                                            <span className="font-medium text-gray-800">{crop.crop_name}</span>
                                        </div>
                                        <span className="text-center text-gray-600">{crop.total_qty.toLocaleString()}</span>
                                        <span className="text-right font-semibold text-orange-600">₹{crop.total_cost.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Products Sold */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ShoppingCart className="w-5 h-5 text-purple-500" /> Top Products Sold
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(data?.top_products?.length ?? 0) === 0 ? (
                            <p className="text-sm text-gray-400 py-4 text-center">No sales data for this period.</p>
                        ) : (
                            <div className="space-y-1">
                                <div className="grid grid-cols-4 text-xs font-medium text-gray-500 px-3 pb-2 border-b">
                                    <span className="col-span-2">Product</span>
                                    <span className="text-center">Units Sold</span>
                                    <span className="text-right">Revenue</span>
                                </div>
                                {data!.top_products.map((prod, i) => (
                                    <div key={prod.product_id} className="grid grid-cols-4 items-center px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm">
                                        <div className="col-span-2 flex items-center gap-2">
                                            <span className="text-xs text-gray-400 font-mono w-4">{i + 1}</span>
                                            <span className="font-medium text-gray-800">{prod.product_name}</span>
                                        </div>
                                        <span className="text-center text-gray-600">{prod.units_sold.toLocaleString()}</span>
                                        <span className="text-right font-semibold text-purple-600">₹{prod.revenue.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Crop Bar Chart */}
            {(data?.top_crops?.length ?? 0) > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ArrowUpRight className="w-5 h-5 text-orange-500" /> Crop Purchase Comparison
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data!.top_crops} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="crop_name" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(Number(v)/1000).toFixed(0)}k`} />
                                <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, "Total Cost"]} />
                                <Bar dataKey="total_cost" fill="#fb923c" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

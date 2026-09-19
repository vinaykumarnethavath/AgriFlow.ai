"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import api from "@/lib/api";
import { PredictiveStockingWidget } from "@/components/shop/PredictiveStockingWidget";
import { ProductAlertsWidget } from "@/components/shop/ProductAlertsWidget";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, TrendingUp, Tractor } from "lucide-react";

const regionalDemandData = [
    { month: "Jan", urea: 400, dap: 240, seeds: 240 },
    { month: "Feb", urea: 300, dap: 139, seeds: 221 },
    { month: "Mar", urea: 200, dap: 980, seeds: 229 },
    { month: "Apr", urea: 278, dap: 390, seeds: 200 },
    { month: "May", urea: 189, dap: 480, seeds: 218 },
    { month: "Jun", urea: 239, dap: 380, seeds: 250 },
    { month: "Jul", urea: 349, dap: 430, seeds: 210 },
];

export default function DiscoveryPage() {
    const { t } = useLanguage();
    const [cropCultivationData, setCropCultivationData] = useState<any[]>([]);
    const [totalCultivationArea, setTotalCultivationArea] = useState<number>(0);
    const [totalPastArea, setTotalPastArea] = useState<number>(0);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"top8" | "all">("top8");

    useEffect(() => {
        const fetchDiscoveryData = async () => {
            try {
                const { data } = await api.get("/analytics/shop/discovery");
                if (data.crop_cultivation) setCropCultivationData(data.crop_cultivation);
                if (data.total_cultivation_area) setTotalCultivationArea(data.total_cultivation_area);
                if (data.total_past_area) setTotalPastArea(data.total_past_area);
                if (data.recommendations) setRecommendations(data.recommendations);
            } catch (err) {
                console.error("Failed to fetch discovery data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDiscoveryData();
    }, []);

    const displayData = viewMode === "top8" ? cropCultivationData.slice(0, 8) : cropCultivationData;

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-sm">
                        <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{t('shop.discovery') || "Market Insights & Discovery"}</h1>
                        <p className="text-sm text-muted-foreground">Smart recommendations tailored for your 50km radius based on regional trends and crop cycles.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PredictiveStockingWidget baseRecs={recommendations} loading={loading} activeArea={totalCultivationArea} pastArea={totalPastArea} />
                <ProductAlertsWidget />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                {/* Crop Cultivation Area Chart */}
                <Card className="border-gray-200 dark:border-zinc-800">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-600 dark:text-emerald-400">
                                    <Tractor className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold">Active Cultivation Area</CardTitle>
                                    <CardDescription className="text-xs">Estimated total standing crop area (in acres) in your region</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                {totalCultivationArea > 0 && (
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                        {totalCultivationArea.toLocaleString()} Total Acres
                                    </span>
                                )}
                                {cropCultivationData.length > 8 && (
                                    <div className="inline-flex rounded-lg bg-gray-100 dark:bg-zinc-800 p-0.5 text-xs font-medium">
                                        <button
                                            type="button"
                                            onClick={() => setViewMode("top8")}
                                            className={`px-2.5 py-1 rounded-md transition-all ${
                                                viewMode === "top8"
                                                    ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm font-semibold"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            Top 8
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setViewMode("all")}
                                            className={`px-2.5 py-1 rounded-md transition-all ${
                                                viewMode === "all"
                                                    ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm font-semibold"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            All ({cropCultivationData.length})
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className={viewMode === "top8" ? "h-[340px] w-full" : "h-[480px] w-full"}>
                            <ResponsiveContainer width="100%" height="100%">
                                {loading ? (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
                                    </div>
                                ) : displayData.length === 0 ? (
                                    <div className="flex justify-center items-center h-full text-muted-foreground text-sm">
                                        No active crop cultivation data available yet.
                                    </div>
                                ) : (
                                    <BarChart
                                        data={displayData}
                                        layout="vertical"
                                        margin={{ top: 8, right: 24, left: 10, bottom: 8 }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            horizontal={true}
                                            vertical={false}
                                            stroke="currentColor"
                                            className="text-gray-200 dark:text-gray-800 opacity-50"
                                        />
                                        <XAxis
                                            type="number"
                                            stroke="currentColor"
                                            className="text-gray-500 dark:text-gray-400"
                                            tick={{ fontSize: 11, fill: 'currentColor' }}
                                            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                                        />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            stroke="currentColor"
                                            className="text-gray-700 dark:text-gray-300 font-medium"
                                            tick={{ fontSize: 12, fill: 'currentColor' }}
                                            width={110}
                                            interval={0}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const item = payload[0].payload;
                                                    return (
                                                        <div className="bg-popover text-popover-foreground border rounded-lg shadow-md p-2.5 text-xs space-y-1">
                                                            <div className="flex items-center gap-2 font-semibold">
                                                                <span
                                                                    className="w-2.5 h-2.5 rounded-full"
                                                                    style={{ backgroundColor: item.color }}
                                                                />
                                                                <span>{item.name}</span>
                                                            </div>
                                                            <div className="text-muted-foreground flex justify-between gap-4">
                                                                <span>Area:</span>
                                                                <span className="font-medium text-foreground">
                                                                    {Number(item.area).toLocaleString()} Acres
                                                                </span>
                                                            </div>
                                                            {item.percentage !== undefined && (
                                                                <div className="text-muted-foreground flex justify-between gap-4">
                                                                    <span>Share:</span>
                                                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                                        {item.percentage}%
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                            cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
                                        />
                                        <Bar
                                            dataKey="area"
                                            radius={[0, 6, 6, 0]}
                                            barSize={viewMode === "top8" ? 20 : 16}
                                        >
                                            {displayData.map((entry) => (
                                                <Cell key={`cell-${entry.name}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Regional Demand Trends Line Chart */}
                <Card className="border-gray-200 dark:border-zinc-800">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600 dark:text-blue-400">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold">Regional Demand Trends</CardTitle>
                                <CardDescription className="text-xs">Historical demand for top input categories in your area</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="h-[340px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={regionalDemandData} margin={{ top: 8, right: 24, left: 10, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-800 opacity-50" />
                                    <XAxis dataKey="month" stroke="currentColor" className="text-gray-500 dark:text-gray-400" tick={{ fontSize: 11, fill: 'currentColor' }} />
                                    <YAxis stroke="currentColor" className="text-gray-500 dark:text-gray-400" tick={{ fontSize: 11, fill: 'currentColor' }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="urea" stroke="#3b82f6" name="Urea" strokeWidth={2} dot={{ r: 3 }} />
                                    <Line type="monotone" dataKey="dap" stroke="#10b981" name="DAP" strokeWidth={2} dot={{ r: 3 }} />
                                    <Line type="monotone" dataKey="seeds" stroke="#8b5cf6" name="Seeds" strokeWidth={2} dot={{ r: 3 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

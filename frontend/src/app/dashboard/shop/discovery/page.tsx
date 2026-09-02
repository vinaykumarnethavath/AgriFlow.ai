"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
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

const cropCultivationData = [
    { name: "Paddy (Rice)", area: 4523, color: "#10b981" },
    { name: "Maize", area: 3187, color: "#f59e0b" },
    { name: "Cotton", area: 2841, color: "#8b5cf6" },
    { name: "Groundnut", area: 1459, color: "#ec4899" },
    { name: "Sugarcane", area: 812, color: "#06b6d4" }
];

export default function DiscoveryPage() {
    const { t } = useLanguage();

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
                <PredictiveStockingWidget />
                <ProductAlertsWidget />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Crop Cultivation Area Chart */}
                <Card className="border-gray-200 dark:border-zinc-800">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Tractor className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <CardTitle className="text-lg">Active Cultivation Area</CardTitle>
                                <CardDescription>Estimated total area (in acres) per crop type in your region</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cropCultivationData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="currentColor" className="text-gray-200 dark:text-gray-700 dark:opacity-20" />
                                <XAxis type="number" stroke="currentColor" className="text-gray-600 dark:text-gray-400" tick={{ fontSize: 12, fill: 'currentColor' }} />
                                <YAxis dataKey="name" type="category" stroke="currentColor" className="text-gray-600 dark:text-gray-400" tick={{ fontSize: 12, fill: 'currentColor' }} width={90} />
                                <Tooltip 
                                    formatter={(value) => [`${value} Acres`, "Total Area"]}
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="area" radius={[0, 4, 4, 0]} barSize={24}>
                                    {cropCultivationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Regional Demand Trends Line Chart */}
                <Card className="border-gray-200 dark:border-zinc-800">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <CardTitle className="text-lg">Regional Demand Trends</CardTitle>
                                <CardDescription>Historical demand for top categories in your area</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={regionalDemandData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700 dark:opacity-20" />
                                <XAxis dataKey="month" stroke="currentColor" className="text-gray-600 dark:text-gray-400" tick={{ fontSize: 12, fill: 'currentColor' }} />
                                <YAxis stroke="currentColor" className="text-gray-600 dark:text-gray-400" tick={{ fontSize: 12, fill: 'currentColor' }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="urea" stroke="#3b82f6" name="Urea" strokeWidth={2} />
                                <Line type="monotone" dataKey="dap" stroke="#10b981" name="DAP" strokeWidth={2} />
                                <Line type="monotone" dataKey="seeds" stroke="#8b5cf6" name="Seeds" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

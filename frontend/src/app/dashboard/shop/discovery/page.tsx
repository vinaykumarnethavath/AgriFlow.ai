"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { PredictiveStockingWidget } from "@/components/shop/PredictiveStockingWidget";
import { ProductAlertsWidget } from "@/components/shop/ProductAlertsWidget";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, TrendingUp } from "lucide-react";

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

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-100 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-full shadow-sm">
                        <MapPin className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('shop.discovery') || "Market Insights & Discovery"}</h1>
                        <p className="text-sm text-gray-600">Smart recommendations tailored for your 50km radius based on regional trends and crop cycles.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PredictiveStockingWidget />
                <ProductAlertsWidget />
            </div>

            <Card className="border-gray-200">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gray-500" />
                        <div>
                            <CardTitle className="text-lg">Regional Demand Trends</CardTitle>
                            <CardDescription>Historical demand for top categories in your area</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[300px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={regionalDemandData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="urea" stroke="#3b82f6" name="Urea" strokeWidth={2} />
                            <Line type="monotone" dataKey="dap" stroke="#10b981" name="DAP" strokeWidth={2} />
                            <Line type="monotone" dataKey="seeds" stroke="#8b5cf6" name="Seeds" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

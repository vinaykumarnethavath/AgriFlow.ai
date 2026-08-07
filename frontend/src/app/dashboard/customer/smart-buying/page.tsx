"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Minus, ShoppingBag, LineChart as LineChartIcon, Info } from "lucide-react";
import Link from "next/link";
import { getCustomerSmartBuyingInsights, CustomerSmartBuyingInsight } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function SmartBuyingDashboard() {
    const { t } = useLanguage();
    const [insights, setInsights] = useState<CustomerSmartBuyingInsight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCustomerSmartBuyingInsights().then((data) => {
            setInsights(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    const getRecommendationColor = (rec: string) => {
        return rec === "BUY NOW" ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200";
    };

    const getTrendIcon = (trend: string) => {
        if (trend === "up") return <TrendingUp className="w-4 h-4 text-red-500" />;
        if (trend === "down") return <TrendingDown className="w-4 h-4 text-green-500" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <LineChartIcon className="w-8 h-8" />
                        Smart Buying AI
                    </h1>
                    <p className="text-green-100 max-w-2xl text-lg">
                        Never overpay again. Our AI analyzes market trends to tell you exactly when to buy your favorite commodities for the best price.
                    </p>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-32 -mb-16 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
            </div>

            {/* Commodity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {insights.map((insight) => (
                    <Card key={insight.id} className="shadow-sm hover:shadow-md transition-shadow border-green-50 flex flex-col h-full">
                        <CardHeader className="pb-3 border-b border-gray-100">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
                                    <span className="text-2xl">{insight.imageEmoji}</span>
                                    {insight.commodityName}
                                </CardTitle>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-gray-900">₹{insight.currentPrice}</span>
                                    <span className="text-sm text-gray-500">/kg</span>
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="pt-4 flex-1">
                            <div className="flex justify-between items-center mb-4">
                                <Badge variant="outline" className={`px-3 py-1 font-bold tracking-wider shadow-sm ${getRecommendationColor(insight.recommendation)}`}>
                                    {insight.recommendation}
                                </Badge>
                                <div className="flex items-center gap-1 text-sm font-medium bg-gray-50 px-2 py-1 rounded-md">
                                    Trend: {getTrendIcon(insight.trend)}
                                    <span className="capitalize ml-1 text-gray-600">{insight.trend}</span>
                                </div>
                            </div>

                            <div className="h-40 w-full mb-4 bg-gray-50/50 rounded-lg p-2 border border-gray-100">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={insight.priceHistory}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                                        <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(val) => [`₹${val}`, 'Price']}
                                            labelFormatter={() => ''}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="price" 
                                            stroke={insight.trend === 'down' ? '#10b981' : insight.trend === 'up' ? '#ef4444' : '#6366f1'} 
                                            strokeWidth={3} 
                                            dot={{ r: 4, strokeWidth: 2 }} 
                                            activeDot={{ r: 6 }} 
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="flex items-start gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                                <p>{insight.rationale}</p>
                            </div>
                        </CardContent>

                        <CardFooter className="pt-0 border-t border-gray-50 mt-auto">
                            <Link href={`/dashboard/customer/marketplace?search=${encodeURIComponent(insight.commodityName)}`} className="w-full mt-4">
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={insight.recommendation !== "BUY NOW"}>
                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                    {insight.recommendation === "BUY NOW" ? "Shop Now at Lowest Price" : "Better to Wait"}
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

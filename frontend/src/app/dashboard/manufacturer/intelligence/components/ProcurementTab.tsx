import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, AlertCircle, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { getProcurementIntelligence, ProcurementInsight } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ProcurementTab() {
    const [insights, setInsights] = useState<ProcurementInsight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProcurementIntelligence().then((data) => {
            setInsights(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    const currentInsight = insights[0];

    const getRecommendationColor = (rec: string) => {
        switch (rec) {
            case "BUY NOW": return "bg-green-100 text-green-800 border-green-200";
            case "WAIT": return "bg-red-100 text-red-800 border-red-200";
            case "HOLD": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default: return "bg-gray-100 text-foreground";
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 border-blue-100 shadow-sm bg-gradient-to-br from-white to-blue-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                            Action Recommendation
                        </CardTitle>
                        <CardDescription>Based on 4-week harvest forecast</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className={`px-6 py-3 rounded-xl border-2 font-bold text-2xl tracking-wider ${getRecommendationColor(currentInsight?.recommendation)}`}>
                                {currentInsight?.recommendation || "N/A"}
                            </div>
                            <p className="mt-4 text-sm text-center text-muted-foreground">
                                {currentInsight?.recommendation === "WAIT" && "Prices are expected to drop due to upcoming harvests. Delay bulk purchases."}
                                {currentInsight?.recommendation === "BUY NOW" && "Prices are at an optimal low. Secure raw materials now."}
                                {currentInsight?.recommendation === "HOLD" && "Monitor market conditions closely before large orders."}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 shadow-sm">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-lg">Price Forecast Trend</CardTitle>
                        <CardDescription>Predicted raw material pricing over the next 4 weeks</CardDescription>
                    </CardHeader>
                    <CardContent className="h-64 pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={insights}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `₹${val}`} dx={-10} domain={['dataMin - 100', 'dataMax + 100']} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => [`₹${value}`, 'Predicted Price']}
                                />
                                <Area type="monotone" dataKey="predictedPrice" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-muted-foreground" />
                        Regional Harvest Forecasts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-foreground font-medium">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Region</th>
                                    <th className="px-4 py-3">Harvest Status</th>
                                    <th className="px-4 py-3">Market Impact</th>
                                    <th className="px-4 py-3 rounded-tr-lg">Trend Indicator</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentInsight?.regionForecasts.length === 0 ? (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No regional data available.</td></tr>
                                ) : (
                                    currentInsight?.regionForecasts.map((forecast, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-4 font-medium text-foreground">{forecast.region}</td>
                                            <td className="px-4 py-4">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {forecast.harvestStatus}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-muted-foreground">{forecast.impact}</td>
                                            <td className="px-4 py-4">
                                                {forecast.impact.toLowerCase().includes("drop") ? (
                                                    <TrendingDown className="w-5 h-5 text-green-500" /> // Price drop is good for buyer
                                                ) : forecast.impact.toLowerCase().includes("rise") ? (
                                                    <TrendingUp className="w-5 h-5 text-red-500" />
                                                ) : (
                                                    <Minus className="w-5 h-5 text-muted-foreground" />
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

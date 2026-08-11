import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Factory, PackageOpen, Info, AlertTriangle } from "lucide-react";
import { getInventoryOptimization, InventoryOptimizationInsight } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function InventoryTab() {
    const [insights, setInsights] = useState<InventoryOptimizationInsight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getInventoryOptimization().then((data) => {
            setInsights(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    const currentInsight = insights[0];

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'critical': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getAlertBg = (type: string) => {
        switch (type) {
            case 'warning': return "bg-amber-50 border-amber-200 text-amber-800";
            case 'critical': return "bg-red-50 border-red-200 text-red-800";
            default: return "bg-blue-50 border-blue-200 text-blue-800";
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 border-indigo-100 shadow-sm bg-gradient-to-br from-white to-indigo-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Factory className="w-5 h-5 text-indigo-600" />
                            Production Strategy
                        </CardTitle>
                        <CardDescription>AI recommended action</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-6">
                            <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-indigo-100">
                                <p className="font-semibold text-lg text-indigo-900 leading-snug">
                                    {currentInsight?.recommendation || "Maintain current levels"}
                                </p>
                            </div>
                            <div className="mt-6 w-full space-y-3">
                                {currentInsight?.alerts.map((alert, idx) => (
                                    <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${getAlertBg(alert.type)}`}>
                                        {getAlertIcon(alert.type)}
                                        <p className="text-sm font-medium">{alert.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 shadow-sm">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PackageOpen className="w-5 h-5 text-muted-foreground" />
                            Demand vs Current Inventory
                        </CardTitle>
                        <CardDescription>Projected wholesale demand against available stock</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72 pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={insights} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="predictedDemand" name="Predicted Demand (units)" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                                <Bar dataKey="currentStock" name="Current Stock (units)" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

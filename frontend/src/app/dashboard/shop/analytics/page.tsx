"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart, TrendingUp, DollarSign, ShoppingCart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import api from "@/lib/api";
import {
    LineChart as ReChartsLine,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart as ReChartsBar,
    Bar,
    Legend
} from 'recharts';

export default function ShopAnalyticsPage() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        avgTicket: 0,
        pendingOrders: 0,
        revenueTrend: 0,
        orderTrend: 0
    });

    const [chartData, setChartData] = useState([
        { name: 'Mon', revenue: 4000, orders: 24 },
        { name: 'Tue', revenue: 3000, orders: 18 },
        { name: 'Wed', revenue: 2000, orders: 12 },
        { name: 'Thu', revenue: 2780, orders: 15 },
        { name: 'Fri', revenue: 1890, orders: 10 },
        { name: 'Sat', revenue: 2390, orders: 14 },
        { name: 'Sun', revenue: 3490, orders: 20 },
    ]);

    useEffect(() => {
        // In a real app, we'd fetch actual aggregated data here
        // For now, simulator data based on existing order models
        setStats({
            totalRevenue: 45280,
            totalOrders: 124,
            avgTicket: 365,
            pendingOrders: 12,
            revenueTrend: 12.5,
            orderTrend: -2.3
        });
    }, []);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Sales Analytics
                    </h1>
                    <p className="text-muted-foreground">Detailed insights into your shop's performance</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                                <h3 className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</h3>
                                <div className="flex items-center mt-1 text-green-600 text-xs">
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                    <span>{stats.revenueTrend}% from last month</span>
                                </div>
                            </div>
                            <div className="bg-green-100 p-3 rounded-xl dark:bg-green-900/30">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                                <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
                                <div className="flex items-center mt-1 text-red-600 text-xs">
                                    <ArrowDownRight className="h-3 w-3 mr-1" />
                                    <span>{stats.orderTrend}% from last month</span>
                                </div>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-xl dark:bg-blue-900/30">
                                <ShoppingCart className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Average Ticket</p>
                                <h3 className="text-2xl font-bold">₹{stats.avgTicket}</h3>
                                <p className="text-xs text-muted-foreground mt-1">Per customer visit</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-xl dark:bg-purple-900/30">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                                <h3 className="text-2xl font-bold">{stats.pendingOrders}</h3>
                                <p className="text-xs text-muted-foreground mt-1">Requiring action</p>
                            </div>
                            <div className="bg-amber-100 p-3 rounded-xl dark:bg-amber-900/30">
                                <LineChart className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trend (Weekly)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReChartsLine data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </ReChartsLine>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Order Volume</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReChartsBar data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </ReChartsBar>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Category Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Category Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { name: 'Fertilizers', value: 65, color: 'bg-green-500' },
                            { name: 'Seeds', value: 20, color: 'bg-blue-500' },
                            { name: 'Pesticides', value: 10, color: 'bg-red-500' },
                            { name: 'Other', value: 5, color: 'bg-gray-500' },
                        ].map((cat) => (
                            <div key={cat.name} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">{cat.name}</span>
                                    <span className="text-muted-foreground">{cat.value}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div className={`${cat.color} h-2 rounded-full`} style={{ width: `${cat.value}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

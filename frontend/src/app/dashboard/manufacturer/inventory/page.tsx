"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getMyProducts, Product } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Factory, AlertTriangle, Search, IndianRupee } from "lucide-react";

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const data = await getMyProducts();
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch inventory:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInventory();
    }, []);

    const rawMaterials = useMemo(() => products.filter(p => p.category === "raw_material"), [products]);
    const finishedGoods = useMemo(() => products.filter(p => p.category === "processed"), [products]);

    const rawValue = useMemo(() => rawMaterials.reduce((s, p) => s + (p.cost_price || 0) * p.quantity, 0), [rawMaterials]);
    const finishedValue = useMemo(() => finishedGoods.reduce((s, p) => s + (p.price || 0) * p.quantity, 0), [finishedGoods]);
    const lowStockCount = useMemo(() => products.filter(p => p.quantity < 10).length, [products]);

    const filterBySearch = (list: Product[]) =>
        search ? list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.batch_number || "").toLowerCase().includes(search.toLowerCase())) : list;

    const InventoryTable = ({ data, type }: { data: Product[]; type: string }) => {
        const isRaw = type === "Raw Material";
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                        <tr>
                            <th className="px-6 py-3">Product Name</th>
                            <th className="px-6 py-3">Batch ID</th>
                            <th className="px-6 py-3 text-right">Stock Level</th>
                            <th className="px-6 py-3 text-right">{isRaw ? "Cost/Unit" : "Sell Price/Unit"}</th>
                            <th className="px-6 py-3 text-right">Total Value</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No {type} inventory found.</td>
                            </tr>
                        ) : data.map(p => {
                            const unitVal = isRaw ? (p.cost_price || 0) : (p.price || 0);
                            const totalVal = unitVal * p.quantity;
                            const isLow = p.quantity < 10;
                            return (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {p.name}
                                        <div className="text-xs text-gray-400">{p.brand}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{p.batch_number}</td>
                                    <td className="px-6 py-4 text-right font-bold">
                                        {p.quantity} <span className="text-gray-500 font-normal">{p.unit}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={isRaw ? "text-gray-700" : "text-green-700"}>₹{unitVal.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-semibold">
                                        <span className={isRaw ? "text-orange-600" : "text-green-600"}>₹{totalVal.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {isLow ? (
                                            <span className="flex items-center text-red-600 text-xs font-bold gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Low Stock
                                            </span>
                                        ) : (
                                            <span className="text-green-600 text-xs bg-green-100 px-2 py-0.5 rounded-full">In Stock</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Inventory Overview</h1>
                    <p className="text-gray-500">Track raw materials and finished goods stock</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 font-medium">Raw Material Stock Value</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">₹{rawValue.toLocaleString()}</p>
                        <p className="text-xs text-orange-500 mt-1">{rawMaterials.length} batches · {rawMaterials.reduce((s, p) => s + p.quantity, 0).toLocaleString()} kg</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 font-medium">Finished Goods Stock Value</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">₹{finishedValue.toLocaleString()}</p>
                        <p className="text-xs text-green-500 mt-1">{finishedGoods.length} products · {finishedGoods.reduce((s, p) => s + p.quantity, 0).toLocaleString()} kg</p>
                    </CardContent>
                </Card>
                <Card className={`border-l-4 ${lowStockCount > 0 ? "border-l-red-500" : "border-l-gray-300"}`}>
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-500 font-medium">Low Stock Alerts</p>
                        <p className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? "text-red-600" : "text-gray-400"}`}>{lowStockCount}</p>
                        <p className={`text-xs mt-1 ${lowStockCount > 0 ? "text-red-400" : "text-gray-400"}`}>{lowStockCount > 0 ? "Items need restocking" : "All stock levels OK"}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search product or batch…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 border rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            <Tabs defaultValue="raw" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="raw" className="flex items-center gap-2">
                        <Package className="w-4 h-4" /> Raw Materials
                        <span className="ml-1 bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full font-medium">{rawMaterials.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="finished" className="flex items-center gap-2">
                        <Factory className="w-4 h-4" /> Finished Goods
                        <span className="ml-1 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full font-medium">{finishedGoods.length}</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="raw">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Raw Material Stock
                                <span className="text-sm font-normal text-orange-600">Total Value: ₹{rawValue.toLocaleString()}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <InventoryTable data={filterBySearch(rawMaterials)} type="Raw Material" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="finished">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Finished Goods Stock
                                <span className="text-sm font-normal text-green-600">Total Value: ₹{finishedValue.toLocaleString()}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <InventoryTable data={filterBySearch(finishedGoods)} type="Finished Goods" />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getMyProducts, getAllByProducts, Product, ByProduct } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Factory, AlertTriangle, Search, Layers, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [byProducts, setByProducts] = useState<ByProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const [data, bpData] = await Promise.all([
                    getMyProducts(),
                    getAllByProducts().catch(() => [])
                ]);
                setProducts(data);
                setByProducts(bpData);
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
    const inStockByProducts = useMemo(() => byProducts.filter(bp => bp.status === "in_stock"), [byProducts]);

    const rawValue = useMemo(() => rawMaterials.reduce((s, p) => s + (p.cost_price || 0) * p.quantity, 0), [rawMaterials]);
    const finishedValue = useMemo(() => finishedGoods.reduce((s, p) => s + (p.price || 0) * p.quantity, 0), [finishedGoods]);
    const byProductValue = useMemo(() => inStockByProducts.reduce((s, bp) => s + bp.total_value, 0), [inStockByProducts]);
    const lowStockCount = useMemo(() => products.filter(p => p.quantity < 10).length, [products]);

    const filterProductsBySearch = (list: Product[]) =>
        search ? list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.batch_number || "").toLowerCase().includes(search.toLowerCase())) : list;

    const filterByProductsBySearch = (list: ByProduct[]) =>
        search ? list.filter(bp => bp.name.toLowerCase().includes(search.toLowerCase()) || (bp.sold_to || "").toLowerCase().includes(search.toLowerCase())) : list;

    const InventoryTable = ({ data, type }: { data: Product[]; type: string }) => {
        const isRaw = type === "Raw Material";
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-foreground font-medium border-b">
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
                                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No {type} inventory found.</td>
                            </tr>
                        ) : data.map(p => {
                            const unitVal = isRaw ? (p.cost_price || 0) : (p.price || 0);
                            const totalVal = unitVal * p.quantity;
                            const isLow = p.quantity < 10;
                            return (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-foreground">
                                        {p.name}
                                        <div className="text-xs text-muted-foreground">{p.brand}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{p.batch_number}</td>
                                    <td className="px-6 py-4 text-right font-bold">
                                        {p.quantity} <span className="text-muted-foreground font-normal">{p.unit}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={isRaw ? "text-foreground" : "text-green-700"}>₹{unitVal.toLocaleString()}</span>
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
                    <h1 className="text-3xl font-bold text-foreground">Inventory Overview</h1>
                    <p className="text-muted-foreground text-sm">Track raw materials, finished products, and milling by-products in real-time</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground font-medium">Raw Material Stock</p>
                        <p className="text-2xl font-bold text-foreground mt-1">₹{rawValue.toLocaleString()}</p>
                        <p className="text-xs text-orange-600 mt-1">{rawMaterials.length} batches · {rawMaterials.reduce((s, p) => s + p.quantity, 0).toLocaleString()} kg</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground font-medium">Finished Goods Stock</p>
                        <p className="text-2xl font-bold text-foreground mt-1">₹{finishedValue.toLocaleString()}</p>
                        <p className="text-xs text-green-600 mt-1">{finishedGoods.length} products · {finishedGoods.reduce((s, p) => s + p.quantity, 0).toLocaleString()} kg</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground font-medium">By-Products in Stock</p>
                        <p className="text-2xl font-bold text-purple-700 mt-1">₹{byProductValue.toLocaleString()}</p>
                        <p className="text-xs text-purple-600 mt-1">{inStockByProducts.length} items · {inStockByProducts.reduce((s, bp) => s + bp.quantity, 0).toLocaleString()} kg</p>
                    </CardContent>
                </Card>
                <Card className={`border-l-4 ${lowStockCount > 0 ? "border-l-red-500" : "border-l-gray-300"} hover:shadow-md transition-shadow`}>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground font-medium">Low Stock Alerts</p>
                        <p className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? "text-red-600" : "text-muted-foreground"}`}>{lowStockCount}</p>
                        <p className={`text-xs mt-1 ${lowStockCount > 0 ? "text-red-500" : "text-muted-foreground"}`}>{lowStockCount > 0 ? "Items need restocking" : "All stock levels healthy"}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search inventory…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 pr-3 py-2 border rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-background"
                />
            </div>

            <Tabs defaultValue="raw" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="raw" className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-orange-600" /> Raw Materials
                        <span className="ml-1 bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full font-medium">{rawMaterials.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="finished" className="flex items-center gap-2">
                        <Factory className="w-4 h-4 text-green-600" /> Finished Goods
                        <span className="ml-1 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full font-medium">{finishedGoods.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="byproducts" className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-600" /> By-Products (Bran, Husk)
                        <span className="ml-1 bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded-full font-medium">{byProducts.length}</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="raw">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Raw Material Stock</span>
                                <span className="text-sm font-normal text-orange-600">Total Value: ₹{rawValue.toLocaleString()}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <InventoryTable data={filterProductsBySearch(rawMaterials)} type="Raw Material" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="finished">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Finished Goods Stock</span>
                                <span className="text-sm font-normal text-green-600">Total Value: ₹{finishedValue.toLocaleString()}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <InventoryTable data={filterProductsBySearch(finishedGoods)} type="Finished Goods" />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="byproducts">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>By-Products Stock & Recovery</span>
                                <span className="text-sm font-normal text-purple-600">In-Stock Value: ₹{byProductValue.toLocaleString()}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-foreground font-medium border-b">
                                        <tr>
                                            <th className="px-6 py-3">By-Product</th>
                                            <th className="px-6 py-3 text-right">Quantity</th>
                                            <th className="px-6 py-3 text-right">Est. Value / Unit</th>
                                            <th className="px-6 py-3 text-right">Total Est. Value</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Sold Info</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filterByProductsBySearch(byProducts).length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No by-products recorded.</td>
                                            </tr>
                                        ) : filterByProductsBySearch(byProducts).map(bp => (
                                            <tr key={bp.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-semibold text-foreground">
                                                    {bp.name}
                                                    <div className="text-xs text-muted-foreground">Batch #{bp.batch_id}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold">
                                                    {bp.quantity} <span className="text-muted-foreground font-normal">{bp.unit}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    ₹{bp.estimated_value_per_unit} / {bp.unit}
                                                </td>
                                                <td className="px-6 py-4 text-right font-semibold text-purple-600">
                                                    ₹{bp.total_value.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {bp.status === "sold" ? (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Sold</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">In Stock</Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-muted-foreground">
                                                    {bp.status === "sold" ? (
                                                        <span>Sold to <strong className="text-foreground">{bp.sold_to}</strong> for ₹{bp.sold_price?.toLocaleString()}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">Available for sale</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

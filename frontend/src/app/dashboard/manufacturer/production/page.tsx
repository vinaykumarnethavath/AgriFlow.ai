"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
    createProductionBatch,
    getProductionHistory,
    getMyProducts,
    Product,
    ProductionBatch,
    addByProduct,
    getBatchByProducts,
    getByProductsSummary,
    updateByProduct,
    ByProduct,
    ByProductSummary
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Factory, ArrowRight, Activity, Layers, Plus, DollarSign,
    CheckCircle2, Sparkles, TrendingUp, RefreshCw, ShoppingBag
} from "lucide-react";
import { Modal } from "@/components/ui/modal";

export default function ProductionPage() {
    const [batches, setBatches] = useState<ProductionBatch[]>([]);
    const [rawMaterials, setRawMaterials] = useState<Product[]>([]);
    const [allByProducts, setAllByProducts] = useState<ByProduct[]>([]);
    const [byProductsSummary, setByProductsSummary] = useState<ByProductSummary | null>(null);
    const [activeTab, setActiveTab] = useState<"batches" | "byproducts">("batches");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal state for Logging By-Product
    const [isByProductModalOpen, setIsByProductModalOpen] = useState(false);
    const [selectedBatchForByProduct, setSelectedBatchForByProduct] = useState<ProductionBatch | null>(null);
    const [savingByProduct, setSavingByProduct] = useState(false);
    const [byProductForm, setByProductForm] = useState({
        name: "Rice Bran",
        quantity: 120,
        unit: "kg",
        estimated_value_per_unit: 34
    });

    // Modal state for Recording By-Product Sale
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const [selectedByProductForSell, setSelectedByProductForSell] = useState<ByProduct | null>(null);
    const [savingSell, setSavingSell] = useState(false);
    const [sellForm, setSellForm] = useState({
        sold_to: "",
        sold_price: 0
    });

    const totalBatches = batches.length;
    const totalOutputQty = useMemo(() => batches.reduce((s, b) => s + b.output_qty, 0), [batches]);
    const totalProcessingCost = useMemo(() => batches.reduce((s, b) => s + b.processing_cost, 0), [batches]);
    const avgEfficiency = useMemo(() => batches.length > 0
        ? batches.reduce((s, b) => s + b.efficiency, 0) / batches.length : 0, [batches]);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

    // Watch fields for calculations
    const selectedInputId = watch("input_product_id");
    const inputQty = watch("input_qty");
    const outputQty = watch("output_qty");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [history, products, summary] = await Promise.all([
                getProductionHistory(),
                getMyProducts(),
                getByProductsSummary("30d").catch(() => null)
            ]);
            setBatches(history);
            setRawMaterials(products.filter(p => p.category === 'raw_material'));
            if (summary) setByProductsSummary(summary);

            // Fetch by-products for recent batches
            if (history.length > 0) {
                const batchPromises = history.slice(0, 10).map(b => getBatchByProducts(b.id).catch(() => []));
                const results = await Promise.all(batchPromises);
                setAllByProducts(results.flat());
            }
        } catch (error) {
            console.error("Failed to fetch production data:", error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: any) => {
        try {
            await createProductionBatch({
                ...data,
                input_qty: parseFloat(data.input_qty),
                output_qty: parseFloat(data.output_qty),
                processing_cost: parseFloat(data.processing_cost),
                input_product_id: parseInt(data.input_product_id)
            });
            fetchData();
            setIsModalOpen(false);
            reset();
        } catch (error) {
            console.error("Failed to start batch:", error);
            alert("Failed to start batch. Check input stock.");
        }
    };

    const calculateEfficiency = () => {
        const i = parseFloat(inputQty) || 0;
        const o = parseFloat(outputQty) || 0;
        if (i === 0) return 0;
        return ((o / i) * 100).toFixed(1);
    };

    const selectedProduct = rawMaterials.find(p => p.id.toString() === selectedInputId);

    // By-Product Handlers
    const handleOpenAddByProduct = (batch: ProductionBatch) => {
        setSelectedBatchForByProduct(batch);
        let defaultName = "Rice Bran";
        let defaultRate = 34;
        const out = (batch.output_product_name || "").toLowerCase();
        if (out.includes("wheat") || out.includes("flour")) {
            defaultName = "Wheat Bran (Choker)";
            defaultRate = 25;
        } else if (out.includes("dal") || out.includes("pulse")) {
            defaultName = "Chuni / Khanda";
            defaultRate = 28;
        } else if (out.includes("oil")) {
            defaultName = "De-Oiled Cake (DOC)";
            defaultRate = 42;
        }
        setByProductForm({
            name: defaultName,
            quantity: Math.max(10, Math.round(batch.input_qty * 0.1)),
            unit: "kg",
            estimated_value_per_unit: defaultRate
        });
        setIsByProductModalOpen(true);
    };

    const handleSaveByProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBatchForByProduct) return;
        try {
            setSavingByProduct(true);
            const created = await addByProduct({
                batch_id: selectedBatchForByProduct.id,
                name: byProductForm.name,
                quantity: Number(byProductForm.quantity),
                unit: byProductForm.unit,
                estimated_value_per_unit: Number(byProductForm.estimated_value_per_unit)
            });
            setAllByProducts(prev => [created, ...prev]);
            setIsByProductModalOpen(false);
            // Refresh summary
            const summary = await getByProductsSummary("30d").catch(() => null);
            if (summary) setByProductsSummary(summary);
            alert(`Logged ${created.quantity} ${created.unit} of ${created.name}!`);
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to log by-product");
        } finally {
            setSavingByProduct(false);
        }
    };

    const handleOpenSellModal = (bp: ByProduct) => {
        setSelectedByProductForSell(bp);
        setSellForm({
            sold_to: "",
            sold_price: bp.total_value || (bp.quantity * bp.estimated_value_per_unit)
        });
        setIsSellModalOpen(true);
    };

    const handleConfirmSell = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedByProductForSell) return;
        try {
            setSavingSell(true);
            const updated = await updateByProduct(selectedByProductForSell.id, {
                sold_to: sellForm.sold_to || "Direct Buyer",
                sold_price: Number(sellForm.sold_price),
                status: "sold"
            });
            setAllByProducts(prev => prev.map(item => item.id === updated.id ? updated : item));
            setIsSellModalOpen(false);
            const summary = await getByProductsSummary("30d").catch(() => null);
            if (summary) setByProductsSummary(summary);
            alert(`Recorded sale of ${updated.name} for ₹${updated.sold_price}!`);
        } catch (err: any) {
            alert(err.response?.data?.detail || "Failed to record sale");
        } finally {
            setSavingSell(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
    );

    const inStockValue = byProductsSummary?.in_stock_value ||
        allByProducts.filter(bp => bp.status === "in_stock").reduce((s, bp) => s + (bp.total_value || bp.quantity * bp.estimated_value_per_unit), 0);
    const soldRevenue = byProductsSummary?.sold_revenue ||
        allByProducts.filter(bp => bp.status === "sold").reduce((s, bp) => s + (bp.sold_price || 0), 0);
    const totalByProductQty = byProductsSummary?.total_quantity ||
        allByProducts.reduce((s, bp) => s + bp.quantity, 0);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                        Production & Processing
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                            Batch Management
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Convert raw agricultural harvest into finished goods and track valuable by-products (bran, husk, oilcake).
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold">
                        <Factory className="w-4 h-4 mr-1.5" /> Start New Batch
                    </Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-3 border-b">
                <button
                    onClick={() => setActiveTab("batches")}
                    className={`pb-3 px-4 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${
                        activeTab === "batches"
                            ? "border-emerald-600 text-emerald-600"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <Activity className="w-4 h-4" />
                    Primary Production Batches
                    <Badge variant="secondary" className="ml-1 text-xs">{batches.length}</Badge>
                </button>

                <button
                    onClick={() => setActiveTab("byproducts")}
                    className={`pb-3 px-4 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${
                        activeTab === "byproducts"
                            ? "border-purple-600 text-purple-600"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <Layers className="w-4 h-4 text-purple-600" />
                    By-Products Inventory & Recovery
                    <Badge variant="secondary" className="ml-1 text-xs bg-purple-50 text-purple-700 border-purple-200">
                        {allByProducts.length} Recorded
                    </Badge>
                </button>
            </div>

            {/* TAB 1: PRIMARY PRODUCTION BATCHES */}
            {activeTab === "batches" && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="border-l-4 border-l-emerald-500 bg-card">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground font-semibold">Total Batches</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{totalBatches}</p>
                                <p className="text-xs text-emerald-600 font-medium mt-1">Production runs</p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-cyan-500 bg-card">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground font-semibold">Avg Milling Efficiency</p>
                                <p className={`text-2xl font-bold mt-1 ${avgEfficiency >= 90 ? "text-emerald-600" : avgEfficiency >= 70 ? "text-amber-600" : "text-red-600"}`}>
                                    {avgEfficiency.toFixed(1)}%
                                </p>
                                <p className="text-xs text-cyan-600 font-medium mt-1">Finished output / Raw input</p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-purple-500 bg-card">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground font-semibold">Processing Cost</p>
                                <p className="text-2xl font-bold text-foreground mt-1">₹{totalProcessingCost.toLocaleString()}</p>
                                <p className="text-xs text-purple-600 font-medium mt-1">Power + Labour</p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-blue-500 bg-card">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground font-semibold">Total Finished Goods</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{totalOutputQty.toLocaleString()} kg</p>
                                <p className="text-xs text-blue-600 font-medium mt-1">Bagged & ready for sale</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5" /> Production Log
                                <span className="ml-auto text-xs font-normal text-muted-foreground">{batches.length} batches</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-foreground font-medium border-b">
                                        <tr>
                                            <th className="px-6 py-4">Batch No</th>
                                            <th className="px-6 py-4">Output Product</th>
                                            <th className="px-6 py-4 text-right">Input Qty</th>
                                            <th className="px-6 py-4 text-right">Output Qty</th>
                                            <th className="px-6 py-4 text-right">Waste</th>
                                            <th className="px-6 py-4 text-center">Efficiency</th>
                                            <th className="px-6 py-4 text-right">Cost</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4 text-right">By-Products</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {batches.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                                                    No production batches run yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            batches.map((b) => (
                                                <tr key={b.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{b.batch_number}</td>
                                                    <td className="px-6 py-4 font-medium text-foreground">{b.output_product_name}</td>
                                                    <td className="px-6 py-4 text-right text-muted-foreground">{b.input_qty} kg</td>
                                                    <td className="px-6 py-4 text-right font-semibold">{b.output_qty} {b.output_unit}</td>
                                                    <td className="px-6 py-4 text-right text-red-500">{(b.waste_qty || 0).toFixed(1)} kg</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${b.efficiency >= 90 ? "bg-green-100 text-green-700" : b.efficiency >= 70 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                                                            {b.efficiency.toFixed(1)}%
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-purple-700 font-medium">₹{b.processing_cost.toLocaleString()}</td>
                                                    <td className="px-6 py-4 text-muted-foreground">{new Date(b.date).toLocaleDateString("en-IN")}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleOpenAddByProduct(b)}
                                                            className="text-xs h-7 px-2.5 border-purple-200 text-purple-700 hover:bg-purple-50 flex items-center gap-1 ml-auto whitespace-nowrap"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                            Log By-Product
                                                        </Button>
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
            )}

            {/* TAB 2: BY-PRODUCTS RECOVERY & INVENTORY */}
            {activeTab === "byproducts" && (
                <div className="space-y-6">
                    {/* Secondary Revenue Hero Banner */}
                    <div className="p-5 bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 text-white rounded-2xl border border-purple-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-300" />
                                <h3 className="font-extrabold text-lg text-white">
                                    Milling By-Product Recovery & Revenue Tracking
                                </h3>
                            </div>
                            <p className="text-xs text-purple-100/80 max-w-2xl leading-relaxed">
                                Processing crops produces valuable secondary streams: Rice Bran (sold to solvent extraction units), Rice Husk (boiler fuel), Broken Rice (poultry feed / brewing), and Oilcakes. Track each by-product to prevent leakage and maximize mill profitability.
                            </p>
                        </div>
                        <Button
                            onClick={() => {
                                if (batches.length > 0) handleOpenAddByProduct(batches[0]);
                                else alert("Please create a production batch first.");
                            }}
                            className="bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs whitespace-nowrap shadow-sm"
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Log By-Product for Latest Batch
                        </Button>
                    </div>

                    {/* Summary KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="border-l-4 border-l-emerald-500 bg-card">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground font-semibold">In-Stock By-Product Value</p>
                                <p className="text-2xl font-bold text-emerald-700 mt-1">₹{Math.round(inStockValue).toLocaleString("en-IN")}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">Asset currently in godown</p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500 bg-card">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground font-semibold">Realized Sales Revenue</p>
                                <p className="text-2xl font-bold text-purple-700 mt-1">₹{Math.round(soldRevenue).toLocaleString("en-IN")}</p>
                                <p className="text-[11px] text-purple-600 font-medium mt-0.5">Cash collected from sales</p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-blue-500 bg-card">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground font-semibold">Total Recovered Quantity</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{totalByProductQty.toLocaleString()} kg</p>
                                <p className="text-[11px] text-blue-600 font-medium mt-0.5">Recovered from milling</p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-amber-500 bg-card">
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground font-semibold">Active By-Product Lots</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{allByProducts.length}</p>
                                <p className="text-[11px] text-amber-600 font-medium mt-0.5">{allByProducts.filter(bp => bp.status === "in_stock").length} lots in stock</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* By-Products Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Layers className="w-5 h-5 text-purple-600" /> By-Products Inventory Ledger
                                <span className="ml-auto text-xs font-normal text-muted-foreground">{allByProducts.length} records</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-foreground font-medium border-b">
                                        <tr>
                                            <th className="px-6 py-4">By-Product</th>
                                            <th className="px-6 py-4">Batch ID</th>
                                            <th className="px-6 py-4 text-right">Quantity</th>
                                            <th className="px-6 py-4 text-right">Est. Rate</th>
                                            <th className="px-6 py-4 text-right">Total Est. Value</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Buyer / Realized Price</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {allByProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                                                    <Layers className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                                                    No secondary by-products logged yet. Click &quot;Log By-Product&quot; next to any production batch.
                                                </td>
                                            </tr>
                                        ) : (
                                            allByProducts.map((bp) => {
                                                const isInStock = bp.status === "in_stock";
                                                const isSold = bp.status === "sold";
                                                const val = bp.total_value || (bp.quantity * bp.estimated_value_per_unit);

                                                return (
                                                    <tr key={bp.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-foreground">{bp.name}</div>
                                                            <div className="text-[11px] text-muted-foreground">Logged {new Date(bp.created_at).toLocaleDateString("en-IN")}</div>
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                                                            Batch #{bp.batch_id}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-medium">
                                                            {bp.quantity} {bp.unit}
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-muted-foreground">
                                                            ₹{bp.estimated_value_per_unit}/{bp.unit}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-foreground">
                                                            ₹{Math.round(val).toLocaleString("en-IN")}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {isInStock && (
                                                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">
                                                                    In Stock
                                                                </Badge>
                                                            )}
                                                            {isSold && (
                                                                <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-xs">
                                                                    Sold
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-xs">
                                                            {isSold ? (
                                                                <div>
                                                                    <span className="font-bold text-purple-800 block">₹{bp.sold_price?.toLocaleString("en-IN")}</span>
                                                                    <span className="text-muted-foreground">{bp.sold_to || "Buyer"}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground italic">Available in godown</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {isInStock && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleOpenSellModal(bp)}
                                                                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7 px-2.5 ml-auto"
                                                                >
                                                                    <ShoppingBag className="w-3 h-3 mr-1" />
                                                                    Record Sale
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* MODAL: START PRODUCTION BATCH */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Start Production Batch">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
                    <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-blue-800 flex items-center gap-2">1. Input (Raw Material)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Select Material</Label>
                                <select {...register("input_product_id", { required: true })} className="w-full p-2 border rounded-md">
                                    <option value="">-- Select Raw Material --</option>
                                    {rawMaterials.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity} {p.unit})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Quantity to Process</Label>
                                <div className="flex gap-2">
                                    <Input type="number" step="0.01" {...register("input_qty", { required: true })} />
                                    <span className="p-2 bg-white border rounded text-muted-foreground text-sm flex items-center">{selectedProduct?.unit || 'unit'}</span>
                                </div>
                                {selectedProduct && (
                                    <div className="text-xs text-blue-600">Available: {selectedProduct.quantity} {selectedProduct.unit}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center -my-2 relative z-10">
                        <div className="bg-white rounded-full p-2 border shadow-sm">
                            <ArrowRight className="text-muted-foreground" />
                        </div>
                    </div>

                    <div className="space-y-4 bg-green-50 p-4 rounded-lg border border-green-100">
                        <h3 className="font-semibold text-green-800 flex items-center gap-2">2. Output (Finished Good)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Product Name</Label>
                                <Input {...register("output_product_name", { required: true })} placeholder="e.g. Rice (Sona Masoori) or Wheat Flour" />
                            </div>
                            <div className="space-y-2">
                                <Label>Output Quantity</Label>
                                <div className="flex gap-2">
                                    <Input type="number" step="0.01" {...register("output_qty", { required: true })} />
                                    <select {...register("output_unit")} className="w-24 p-2 border rounded-md">
                                        <option value="kg">kg</option>
                                        <option value="quintal">quintal</option>
                                        <option value="liter">liter</option>
                                        <option value="packet">pkt</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Processing Cost (₹)</Label>
                            <Input type="number" step="0.01" {...register("processing_cost", { required: true })} placeholder="Total cost (Labor + Power)" />
                        </div>
                        <div className="flex flex-col justify-end pb-2">
                            <div className="text-sm text-muted-foreground">Expected Efficiency: <span className="font-bold text-foreground">{calculateEfficiency()}%</span></div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">Run Batch</Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL: LOG BY-PRODUCT */}
            <Modal
                isOpen={isByProductModalOpen}
                onClose={() => setIsByProductModalOpen(false)}
                title="Log Secondary By-Product for Batch"
            >
                {selectedBatchForByProduct && (
                    <form onSubmit={handleSaveByProduct} className="space-y-4 pt-2">
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 text-xs space-y-1">
                            <span className="font-bold text-purple-950 dark:text-purple-100 block">
                                Production Batch #{selectedBatchForByProduct.batch_number}
                            </span>
                            <div className="text-purple-800 dark:text-purple-200">
                                Output: <strong>{selectedBatchForByProduct.output_product_name}</strong> • Raw Material Input: <strong>{selectedBatchForByProduct.input_qty} kg</strong>
                            </div>
                        </div>

                        {/* Presets */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                                Common By-Product Presets
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {["Rice Bran", "Broken Rice", "Rice Husk", "Wheat Bran (Choker)", "De-Oiled Cake (DOC)", "Pulses Chuni"].map(pName => (
                                    <button
                                        type="button"
                                        key={pName}
                                        onClick={() => setByProductForm(prev => ({ ...prev, name: pName }))}
                                        className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                                            byProductForm.name === pName
                                                ? "bg-purple-600 text-white border-purple-600"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                        }`}
                                    >
                                        {pName}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1">
                                    By-Product Name *
                                </label>
                                <Input
                                    required
                                    value={byProductForm.name}
                                    onChange={(e) => setByProductForm({ ...byProductForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1">
                                    Recovered Quantity *
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        required
                                        min="1"
                                        step="0.5"
                                        value={byProductForm.quantity}
                                        onChange={(e) => setByProductForm({ ...byProductForm, quantity: parseFloat(e.target.value) || 0 })}
                                    />
                                    <select
                                        className="w-20 p-2 text-xs border rounded-lg"
                                        value={byProductForm.unit}
                                        onChange={(e) => setByProductForm({ ...byProductForm, unit: e.target.value })}
                                    >
                                        <option value="kg">kg</option>
                                        <option value="quintal">quintal</option>
                                        <option value="bags">bags</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                                Estimated Selling Rate (₹ per {byProductForm.unit})
                            </label>
                            <Input
                                type="number"
                                required
                                min="1"
                                step="0.5"
                                value={byProductForm.estimated_value_per_unit}
                                onChange={(e) => setByProductForm({ ...byProductForm, estimated_value_per_unit: parseFloat(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="p-3 bg-muted/40 rounded-xl flex justify-between items-center text-xs font-semibold">
                            <span>Total Estimated Recovery Value:</span>
                            <span className="text-base font-black text-purple-800">
                                ₹{(byProductForm.quantity * byProductForm.estimated_value_per_unit).toLocaleString("en-IN")}
                            </span>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsByProductModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={savingByProduct}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                            >
                                {savingByProduct ? "Saving..." : "Add to Inventory"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* MODAL: RECORD BY-PRODUCT SALE */}
            <Modal
                isOpen={isSellModalOpen}
                onClose={() => setIsSellModalOpen(false)}
                title="Record By-Product Sale & Revenue"
            >
                {selectedByProductForSell && (
                    <form onSubmit={handleConfirmSell} className="space-y-4 pt-2">
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 text-xs space-y-1">
                            <span className="font-bold text-purple-950 dark:text-purple-100 block">
                                {selectedByProductForSell.name}
                            </span>
                            <div className="text-purple-800 dark:text-purple-200">
                                Stock: <strong>{selectedByProductForSell.quantity} {selectedByProductForSell.unit}</strong> • Estimated Value: <strong>₹{selectedByProductForSell.total_value?.toLocaleString("en-IN")}</strong>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                                Buyer / Solvent Plant / Cattle Feed Merchant Name
                            </label>
                            <Input
                                required
                                placeholder="e.g. Sri Balaji Solvent Extraction or Local Dairy Union"
                                value={sellForm.sold_to}
                                onChange={(e) => setSellForm({ ...sellForm, sold_to: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                                Total Realized Sale Price (₹)
                            </label>
                            <Input
                                type="number"
                                required
                                min="100"
                                step="10"
                                value={sellForm.sold_price}
                                onChange={(e) => setSellForm({ ...sellForm, sold_price: parseFloat(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsSellModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={savingSell}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                            >
                                {savingSell ? "Recording..." : "Record Sale & Revenue"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}

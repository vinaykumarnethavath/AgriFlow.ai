"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
    Users, Plus, Truck, ArrowRight, ShieldCheck, CheckCircle2, Clock,
    Calendar, MapPin, Scale, Factory, AlertCircle, ChevronRight,
    Sparkles, Search, RefreshCw, Send, Check, Phone, DollarSign
} from "lucide-react";
import Link from "next/link";
import {
    listLoadPools,
    createLoadPool,
    joinLoadPool,
    submitLoadPoolToMill,
    cancelLoadPool,
    getMillsMarketplace,
    getCrops,
    FarmerLoadPool,
    FarmerLoadPoolCreate,
    MillMarketplaceItem,
    Crop
} from "@/lib/api";

export default function LoadPoolsPage() {
    const [pools, setPools] = useState<FarmerLoadPool[]>([]);
    const [mills, setMills] = useState<MillMarketplaceItem[]>([]);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"explore" | "my_pools">("explore");
    const [filterCrop, setFilterCrop] = useState("all");
    const [searchDistrict, setSearchDistrict] = useState("");

    // Modal state for Creating Pool
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [creatingPool, setCreatingPool] = useState(false);
    const [createForm, setCreateForm] = useState<FarmerLoadPoolCreate>({
        crop_name: "Paddy",
        target_quantity: 100,
        unit: "quintal",
        village: "",
        mandal: "",
        district: "",
        state: "Telangana",
        delivery_date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
        preferred_mill_id: undefined,
        min_quality_grade: "Grade A",
        expected_price_per_unit: 2350,
        my_quantity: 20,
        notes: "Targeting 1 full truckload (100 quintals) for direct mill procurement."
    });

    // Modal state for Joining Pool
    const [joinModalOpen, setJoinModalOpen] = useState(false);
    const [joiningPool, setJoiningPool] = useState(false);
    const [selectedPoolForJoin, setSelectedPoolForJoin] = useState<FarmerLoadPool | null>(null);
    const [joinForm, setJoinForm] = useState({
        quantity: 15,
        unit: "quintal",
        quality_grade: "Grade A"
    });

    // Alerts
    const [alertMessage, setAlertMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const showAlert = (text: string, type: "success" | "error" = "success") => {
        setAlertMessage({ text, type });
        setTimeout(() => setAlertMessage(null), 5000);
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [poolList, millList, cropList] = await Promise.all([
                listLoadPools().catch(() => []),
                getMillsMarketplace().catch(() => []),
                getCrops().catch(() => [])
            ]);
            setPools(poolList);
            setMills(millList);
            setCrops(cropList);
        } catch (error) {
            console.error("Failed to load pooling data:", error);
            showAlert("Failed to load active load pools", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePool = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createForm.crop_name || !createForm.village || !createForm.district) {
            showAlert("Please fill in Crop name, Village, and District", "error");
            return;
        }
        if (createForm.my_quantity <= 0 || createForm.target_quantity <= 0) {
            showAlert("Quantities must be greater than zero", "error");
            return;
        }
        if (createForm.my_quantity > createForm.target_quantity) {
            showAlert("Your pledge cannot exceed total target quantity", "error");
            return;
        }

        try {
            setCreatingPool(true);
            const created = await createLoadPool(createForm);
            setPools(prev => [created, ...prev]);
            setIsCreateModalOpen(false);
            showAlert(`Successfully created Load Pool for ${createForm.target_quantity} ${createForm.unit}s of ${createForm.crop_name}!`);
            setActiveTab("my_pools");
        } catch (error: any) {
            console.error("Failed to create load pool:", error);
            showAlert(error.response?.data?.detail || "Could not create pool. Please try again.", "error");
        } finally {
            setCreatingPool(false);
        }
    };

    const handleOpenJoinModal = (pool: FarmerLoadPool) => {
        setSelectedPoolForJoin(pool);
        const remaining = Math.max(1, pool.target_quantity - pool.current_quantity);
        setJoinForm({
            quantity: Math.min(20, remaining),
            unit: pool.unit,
            quality_grade: pool.min_quality_grade || "Grade A"
        });
        setJoinModalOpen(true);
    };

    const handleConfirmJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPoolForJoin) return;
        if (joinForm.quantity <= 0) {
            showAlert("Please specify a valid quantity to pledge", "error");
            return;
        }

        try {
            setJoiningPool(true);
            const updatedPool = await joinLoadPool(selectedPoolForJoin.id, {
                quantity: Number(joinForm.quantity),
                unit: joinForm.unit,
                quality_grade: joinForm.quality_grade
            });

            setPools(prev => prev.map(p => p.id === updatedPool.id ? updatedPool : p));
            setJoinModalOpen(false);
            showAlert(`Successfully pledged ${joinForm.quantity} ${joinForm.unit}s to the pool!`);
        } catch (error: any) {
            console.error("Failed to join pool:", error);
            showAlert(error.response?.data?.detail || "Could not join load pool", "error");
        } finally {
            setJoiningPool(false);
        }
    };

    const handleSubmitToMill = async (poolId: number) => {
        if (!confirm("Submit this aggregated pool to the processing mill now? The mill will be notified with the consolidated load.")) return;
        try {
            const res = await submitLoadPoolToMill(poolId);
            showAlert(res.message || "Pool submitted to mill as a consolidated procurement request!");
            loadData();
        } catch (error: any) {
            showAlert(error.response?.data?.detail || "Failed to submit pool to mill", "error");
        }
    };

    const handleCancelPool = async (poolId: number) => {
        if (!confirm("Are you sure you want to cancel this load pool? All members will be notified.")) return;
        try {
            await cancelLoadPool(poolId);
            setPools(prev => prev.filter(p => p.id !== poolId));
            showAlert("Pool cancelled successfully");
        } catch (error: any) {
            showAlert(error.response?.data?.detail || "Failed to cancel pool", "error");
        }
    };

    // Filter pools
    const filteredPools = useMemo(() => {
        return pools.filter(p => {
            const matchesCrop = filterCrop === "all" || p.crop_name.toLowerCase().includes(filterCrop.toLowerCase());
            const q = searchDistrict.toLowerCase().trim();
            const matchesSearch = !q ||
                p.district.toLowerCase().includes(q) ||
                p.village.toLowerCase().includes(q) ||
                (p.mandal && p.mandal.toLowerCase().includes(q)) ||
                p.crop_name.toLowerCase().includes(q);
            return matchesCrop && matchesSearch;
        });
    }, [pools, filterCrop, searchDistrict]);

    // Summary stats
    const totalOpenPools = pools.filter(p => p.status === "open").length;
    const totalPooledQuintals = pools.reduce((s, p) => s + (p.current_quantity || 0), 0);
    const totalFarmersInvolved = pools.reduce((s, p) => s + (p.member_count || (p.members?.length || 1)), 0);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Top Breadcrumb & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Link href="/dashboard/farmer/mills" className="hover:text-blue-600 transition-colors">
                            ← Back to Mills Marketplace
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 rounded-2xl shadow-inner">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                                Collective Selling & Load Pooling
                                <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs">
                                    Farmer Aggregation
                                </Badge>
                            </h1>
                            <p className="text-muted-foreground text-sm mt-0.5">
                                Combine your small harvest lots with neighboring farmers to form full truckloads and sell directly to mills at premium bulk rates.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadData}
                        disabled={loading}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
                    </Button>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-1.5" /> Start a New Pool
                    </Button>
                </div>
            </div>

            {/* Notification alert */}
            {alertMessage && (
                <div
                    className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                        alertMessage.type === "success"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {alertMessage.type === "success" ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                        <span className="font-medium text-sm">{alertMessage.text}</span>
                    </div>
                    <button onClick={() => setAlertMessage(null)} className="text-sm font-semibold opacity-70 hover:opacity-100">
                        ✕
                    </button>
                </div>
            )}

            {/* Value Proposition Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-amber-500 bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-semibold">Active Open Pools</span>
                            <Users className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-2xl font-black text-foreground mt-1">{totalOpenPools}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Seeking farmer partners</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-semibold">Total Pooled Volume</span>
                            <Scale className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-2xl font-black text-foreground mt-1">{totalPooledQuintals.toLocaleString()} Quintals</p>
                        <p className="text-[11px] text-emerald-600 font-medium mt-0.5">~{Math.round(totalPooledQuintals / 100)} Truckloads aggregated</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-semibold">Farmers Aggregated</span>
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-black text-foreground mt-1">{totalFarmersInvolved} Farmers</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Collaborating for better rates</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 bg-card">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-semibold">Estimated Price Lift</span>
                            <Sparkles className="w-4 h-4 text-purple-600" />
                        </div>
                        <p className="text-2xl font-black text-foreground mt-1">+₹150–₹250</p>
                        <p className="text-[11px] text-purple-600 font-medium mt-0.5">Per quintal vs local middlemen</p>
                    </CardContent>
                </Card>
            </div>

            {/* How Collective Selling Works Banner */}
            <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl border border-amber-300/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                        <Truck className="w-4 h-4 text-amber-600" />
                        How Collective Selling Works for Small Farmers:
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
                        1. A lead farmer creates a target pool for 100 quintals (1 full truck). • 2. Neighbors in the same village or mandal pledge 10–20 quintals each. • 3. When filled, the consolidated load is directly sold to a verified processing mill at bulk wholesale rates with shared transport costs!
                    </p>
                </div>
                <Button
                    size="sm"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs whitespace-nowrap"
                >
                    Create Pool Now
                </Button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-4 rounded-2xl border shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by district, village, or crop (e.g. Suryapet, Paddy)..."
                        className="pl-10 h-10 rounded-xl bg-background"
                        value={searchDistrict}
                        onChange={(e) => setSearchDistrict(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                    {["all", "Paddy", "Wheat", "Maize", "Cotton", "Soybean"].map(crop => (
                        <button
                            key={crop}
                            onClick={() => setFilterCrop(crop)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                filterCrop === crop
                                    ? "bg-amber-500 text-amber-950 font-bold shadow-sm"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                        >
                            {crop === "all" ? "All Crops" : crop}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pools Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-2xl bg-muted/40 animate-pulse border" />
                    ))}
                </div>
            ) : filteredPools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPools.map(pool => {
                        const fillPct = Math.min(100, pool.fill_percentage || (pool.target_quantity > 0 ? (pool.current_quantity / pool.target_quantity) * 100 : 0));
                        const isFull = fillPct >= 100;
                        const isSubmitted = pool.status === "submitted";
                        const isCompleted = pool.status === "completed";

                        return (
                            <Card key={pool.id} className="overflow-hidden border hover:shadow-md transition-all flex flex-col justify-between">
                                <div>
                                    {/* Header */}
                                    <div className="p-5 pb-3 border-b bg-gradient-to-br from-card to-muted/20">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs mb-1.5 font-bold">
                                                    {pool.crop_name}
                                                </Badge>
                                                <h3 className="font-bold text-foreground text-base">
                                                    {pool.crop_name} Load Pool #{pool.id}
                                                </h3>
                                            </div>
                                            <Badge
                                                className={`text-xs ${
                                                    isSubmitted
                                                        ? "bg-blue-100 text-blue-800 border-blue-300"
                                                        : isCompleted
                                                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                                        : isFull
                                                        ? "bg-purple-100 text-purple-800 border-purple-300"
                                                        : "bg-emerald-100 text-emerald-800 border-emerald-300"
                                                }`}
                                            >
                                                {isSubmitted ? "Submitted to Mill" : isCompleted ? "Completed" : isFull ? "Target Reached" : "Open for Pledges"}
                                            </Badge>
                                        </div>

                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                                            <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                            {[pool.village, pool.mandal, pool.district].filter(Boolean).join(", ")}
                                        </p>
                                    </div>

                                    {/* Body Progress */}
                                    <div className="p-5 space-y-4">
                                        {/* Progress bar */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-muted-foreground">Pool Progress</span>
                                                <span className="font-bold text-foreground">
                                                    {pool.current_quantity} / {pool.target_quantity} {pool.unit}s ({Math.round(fillPct)}%)
                                                </span>
                                            </div>
                                            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 rounded-full ${
                                                        isFull ? "bg-emerald-500" : "bg-amber-500"
                                                    }`}
                                                    style={{ width: `${fillPct}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[11px] text-muted-foreground">
                                                <span>Pledged by {pool.member_count || (pool.members?.length || 1)} farmers</span>
                                                <span className="text-amber-700 font-semibold">
                                                    {Math.max(0, pool.target_quantity - pool.current_quantity)} {pool.unit}s left
                                                </span>
                                            </div>
                                        </div>

                                        {/* Financial & Delivery Details */}
                                        <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-3 rounded-xl border">
                                            <div>
                                                <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Target Price</span>
                                                <span className="font-bold text-foreground text-sm text-emerald-700">
                                                    ₹{pool.expected_price_per_unit}/{pool.unit}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Delivery Target</span>
                                                <span className="font-bold text-foreground flex items-center gap-1 mt-0.5">
                                                    <Calendar className="w-3 h-3 text-blue-600" />
                                                    {pool.delivery_date}
                                                </span>
                                            </div>
                                            {pool.preferred_mill_name && (
                                                <div className="col-span-2 border-t pt-1.5">
                                                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Target Mill</span>
                                                    <span className="font-semibold text-foreground flex items-center gap-1">
                                                        <Factory className="w-3 h-3 text-slate-500" />
                                                        {pool.preferred_mill_name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Members pills */}
                                        {pool.members && pool.members.length > 0 && (
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                                                    Participating Farmers ({pool.members.length})
                                                </span>
                                                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                                                    {pool.members.map((m, idx) => (
                                                        <span
                                                            key={m.id || idx}
                                                            className="text-[11px] bg-slate-100 dark:bg-slate-800 text-foreground px-2 py-0.5 rounded-full border flex items-center gap-1 font-medium"
                                                        >
                                                            <Users className="w-3 h-3 text-blue-500" />
                                                            {m.farmer_name}: <strong>{m.quantity} {m.unit}</strong>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer actions */}
                                <div className="p-4 bg-muted/20 border-t flex items-center justify-between gap-2">
                                    {!isFull && !isSubmitted && !isCompleted && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleOpenJoinModal(pool)}
                                            className="w-full bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1" /> Join & Pledge Produce
                                        </Button>
                                    )}

                                    {isFull && !isSubmitted && !isCompleted && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleSubmitToMill(pool.id)}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                        >
                                            <Send className="w-3.5 h-3.5 mr-1" /> Submit Full Load to Mill
                                        </Button>
                                    )}

                                    {isSubmitted && (
                                        <span className="text-xs text-blue-700 font-semibold flex items-center gap-1 mx-auto">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600" /> Procurement Request Active
                                        </span>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-card border rounded-2xl space-y-3">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground/30" />
                    <h3 className="text-lg font-bold text-foreground">No active load pools match your search</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Be the lead organizer in your village! Start a new load pool for 100 quintals and invite neighboring farmers to pledge their produce.
                    </p>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold"
                    >
                        <Plus className="w-4 h-4 mr-1.5" /> Start First Load Pool
                    </Button>
                </div>
            )}

            {/* MODAL: CREATE A LOAD POOL */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Start a Collective Farmer Load Pool"
            >
                <form onSubmit={handleCreatePool} className="space-y-4 pt-2">
                    <p className="text-xs text-muted-foreground">
                        Aggregate produce with neighboring farmers to form a full truckload. You will be designated as the Pool Organizer.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                                Crop / Produce *
                            </label>
                            <Input
                                required
                                placeholder="e.g. Paddy (BPT 5204), Wheat, Maize"
                                value={createForm.crop_name}
                                onChange={(e) => setCreateForm({ ...createForm, crop_name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                                Target Pool Quantity (Quintals) *
                            </label>
                            <Input
                                type="number"
                                required
                                min="20"
                                step="5"
                                value={createForm.target_quantity}
                                onChange={(e) => setCreateForm({ ...createForm, target_quantity: parseFloat(e.target.value) || 0 })}
                            />
                            <span className="text-[10px] text-muted-foreground">Standard truck: 100 quintals (10 tons)</span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                                Your Initial Pledge (Quintals) *
                            </label>
                            <Input
                                type="number"
                                required
                                min="1"
                                step="0.5"
                                value={createForm.my_quantity}
                                onChange={(e) => setCreateForm({ ...createForm, my_quantity: parseFloat(e.target.value) || 0 })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                                Target Price (₹ per Quintal) *
                            </label>
                            <Input
                                type="number"
                                required
                                min="100"
                                step="10"
                                value={createForm.expected_price_per_unit}
                                onChange={(e) => setCreateForm({ ...createForm, expected_price_per_unit: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    {/* Location fields */}
                    <div className="p-3 bg-muted/40 rounded-xl border space-y-3">
                        <span className="text-xs font-bold text-foreground block">
                            Aggregation Location (Where Farmers Gather Produce)
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Village *</label>
                                <Input
                                    required
                                    placeholder="e.g. Chivvemla"
                                    value={createForm.village}
                                    onChange={(e) => setCreateForm({ ...createForm, village: e.target.value })}
                                    className="h-9 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Mandal</label>
                                <Input
                                    placeholder="e.g. Suryapet"
                                    value={createForm.mandal || ""}
                                    onChange={(e) => setCreateForm({ ...createForm, mandal: e.target.value })}
                                    className="h-9 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">District *</label>
                                <Input
                                    required
                                    placeholder="e.g. Suryapet"
                                    value={createForm.district}
                                    onChange={(e) => setCreateForm({ ...createForm, district: e.target.value })}
                                    className="h-9 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                                Target Delivery Date
                            </label>
                            <Input
                                type="date"
                                value={createForm.delivery_date}
                                onChange={(e) => setCreateForm({ ...createForm, delivery_date: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                                Preferred Processing Mill (Optional)
                            </label>
                            <select
                                className="w-full text-xs rounded-xl border border-input bg-background p-2.5 h-10"
                                value={createForm.preferred_mill_id || ""}
                                onChange={(e) => setCreateForm({ ...createForm, preferred_mill_id: e.target.value ? parseInt(e.target.value) : undefined })}
                            >
                                <option value="">-- Any verified mill --</option>
                                {mills.map(m => (
                                    <option key={m.id} value={m.user_id}>
                                        {m.name} ({m.type}, {m.district})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                            Organizer Notes
                        </label>
                        <Input
                            placeholder="e.g. Common tractor pickup at Village Panchayat floor on Saturday morning."
                            value={createForm.notes || ""}
                            onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={creatingPool}
                            className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold"
                        >
                            {creatingPool ? "Creating Pool..." : "Launch Load Pool"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL: JOIN / PLEDGE TO LOAD POOL */}
            <Modal
                isOpen={joinModalOpen}
                onClose={() => setJoinModalOpen(false)}
                title="Pledge Produce to Load Pool"
            >
                {selectedPoolForJoin && (
                    <form onSubmit={handleConfirmJoin} className="space-y-4 pt-2">
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                            <span className="font-bold text-amber-950 dark:text-amber-100 block">
                                {selectedPoolForJoin.crop_name} Pool #{selectedPoolForJoin.id}
                            </span>
                            <div className="text-amber-800 dark:text-amber-200">
                                Aggregation Location: <strong>{[selectedPoolForJoin.village, selectedPoolForJoin.district].join(", ")}</strong>
                            </div>
                            <div className="text-amber-800 dark:text-amber-200">
                                Target Rate: <strong>₹{selectedPoolForJoin.expected_price_per_unit}/{selectedPoolForJoin.unit}</strong> • Target Delivery: <strong>{selectedPoolForJoin.delivery_date}</strong>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                                Your Supply Quantity to Pledge ({selectedPoolForJoin.unit}s) *
                            </label>
                            <Input
                                type="number"
                                required
                                min="1"
                                step="0.5"
                                max={selectedPoolForJoin.target_quantity - selectedPoolForJoin.current_quantity}
                                value={joinForm.quantity}
                                onChange={(e) => setJoinForm({ ...joinForm, quantity: parseFloat(e.target.value) || 0 })}
                            />
                            <span className="text-[11px] text-muted-foreground mt-0.5 block">
                                Remaining needed to fill pool: {Math.max(0, selectedPoolForJoin.target_quantity - selectedPoolForJoin.current_quantity)} {selectedPoolForJoin.unit}s
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                                Produce Quality Grade
                            </label>
                            <select
                                className="w-full text-sm rounded-xl border border-input bg-background p-2.5"
                                value={joinForm.quality_grade}
                                onChange={(e) => setJoinForm({ ...joinForm, quality_grade: e.target.value })}
                            >
                                <option value="Grade A">Grade A (Premium / Clean)</option>
                                <option value="Grade B">Grade B (Standard Market)</option>
                                <option value="FAQ">FAQ (Fair Average Quality)</option>
                            </select>
                        </div>

                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                            <span className="font-semibold text-emerald-900 dark:text-emerald-100">Estimated Payout:</span>
                            <span className="text-base font-black text-emerald-800 dark:text-emerald-200">
                                ₹{(joinForm.quantity * selectedPoolForJoin.expected_price_per_unit).toLocaleString("en-IN")}
                            </span>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setJoinModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={joiningPool}
                                className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold"
                            >
                                {joiningPool ? "Confirming..." : "Confirm Pledge"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}

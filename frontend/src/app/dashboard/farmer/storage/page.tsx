"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
    PackageCheck, Plus, IndianRupee, AlertTriangle, CheckCircle,
    Clock, Building2, Warehouse, Snowflake, Scale,
    FileText, Trash2, Edit3, ArrowRight, Wallet, Check, AlertCircle,
    Calendar, MapPin, Tag, TrendingUp, Filter, Search
} from "lucide-react";
import {
    CropStorage, CropStorageCreate, CropStorageReleaseRequest, CropStorageSummary,
    getCropStorages, getCropStorageSummary, createCropStorage,
    updateCropStorage, deleteCropStorage, releaseCropStorage
} from "@/lib/api";

const STORAGE_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    cold_storage: {
        label: "Cold Storage",
        icon: <Snowflake className="h-4 w-4" />,
        color: "text-blue-700 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/30 border-blue-200"
    },
    warehouse_cwc_swc: {
        label: "Govt Warehouse (CWC/SWC)",
        icon: <Warehouse className="h-4 w-4" />,
        color: "text-purple-700 dark:text-purple-400",
        bg: "bg-purple-50 dark:bg-purple-900/30 border-purple-200"
    },
    private_godown: {
        label: "Private Godown / Arhat",
        icon: <Building2 className="h-4 w-4" />,
        color: "text-amber-700 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/30 border-amber-200"
    },
    on_farm_silo: {
        label: "On-Farm Silo / Store",
        icon: <PackageCheck className="h-4 w-4" />,
        color: "text-emerald-700 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200"
    },
    other: {
        label: "Other Storage Facility",
        icon: <Warehouse className="h-4 w-4" />,
        color: "text-gray-700 dark:text-gray-400",
        bg: "bg-gray-50 dark:bg-gray-800/30 border-gray-200"
    }
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    stored: { label: "In Storage", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
    partially_released: { label: "Partially Released", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-100 dark:bg-amber-900/40" },
    fully_released: { label: "Fully Released / Sold", color: "text-gray-600 dark:text-gray-300", bg: "bg-gray-100 dark:bg-gray-800" },
    overdue_alert: { label: "Release Due / Overdue", color: "text-rose-700 dark:text-rose-300", bg: "bg-rose-100 dark:bg-rose-900/40" }
};

export default function CropStoragePage() {
    const { user } = useAuth();
    const { t } = useLanguage();

    const [storages, setStorages] = useState<CropStorage[]>([]);
    const [summary, setSummary] = useState<CropStorageSummary | null>(null);
    const [loading, setLoading] = useState(true);

    // Filters & Search
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);

    // Selected lot for edit / release
    const [selectedStorage, setSelectedStorage] = useState<CropStorage | null>(null);

    // Form states
    const [formData, setFormData] = useState<CropStorageCreate>({
        crop_name: "",
        variety: "",
        storage_type: "cold_storage",
        facility_name: "",
        location: "",
        receipt_number: "",
        bags_count: 50,
        weight_quintals: 25,
        bag_weight_kg: 50,
        monthly_rent_per_bag: 8,
        deposit_date: new Date().toISOString().split("T")[0],
        expected_release_date: "",
        status: "stored",
        target_sell_price_per_quintal: 0,
        notes: ""
    });

    const [releaseData, setReleaseData] = useState<CropStorageReleaseRequest>({
        bags_released: 10,
        release_date: new Date().toISOString().split("T")[0],
        selling_price_per_quintal: 0,
        notes: ""
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [storagesData, summaryData] = await Promise.all([
                getCropStorages(),
                getCropStorageSummary()
            ]);
            setStorages(storagesData);
            setSummary(summaryData);
        } catch (err) {
            console.error("Failed to load crop storage data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Handle Create
    const handleCreateStorage = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCropStorage({
                ...formData,
                bags_count: Number(formData.bags_count),
                weight_quintals: Number(formData.weight_quintals),
                bag_weight_kg: Number(formData.bag_weight_kg || 50),
                monthly_rent_per_bag: Number(formData.monthly_rent_per_bag || 0),
                target_sell_price_per_quintal: formData.target_sell_price_per_quintal ? Number(formData.target_sell_price_per_quintal) : undefined,
                expected_release_date: formData.expected_release_date || undefined,
                receipt_number: formData.receipt_number || undefined,
                variety: formData.variety || undefined,
                notes: formData.notes || undefined
            });
            setIsAddModalOpen(false);
            resetForm();
            loadData();
        } catch (err) {
            console.error("Failed to deposit produce:", err);
            alert("Failed to save storage record. Please verify the inputs.");
        }
    };

    // Handle Edit
    const handleEditStorage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStorage) return;
        try {
            await updateCropStorage(selectedStorage.id, {
                ...formData,
                bags_count: Number(formData.bags_count),
                weight_quintals: Number(formData.weight_quintals),
                bag_weight_kg: Number(formData.bag_weight_kg || 50),
                monthly_rent_per_bag: Number(formData.monthly_rent_per_bag || 0),
                target_sell_price_per_quintal: formData.target_sell_price_per_quintal ? Number(formData.target_sell_price_per_quintal) : undefined,
                expected_release_date: formData.expected_release_date || undefined,
                receipt_number: formData.receipt_number || undefined,
                variety: formData.variety || undefined,
                notes: formData.notes || undefined
            });
            setIsEditModalOpen(false);
            setSelectedStorage(null);
            resetForm();
            loadData();
        } catch (err) {
            console.error("Failed to update storage record:", err);
            alert("Failed to update storage record.");
        }
    };

    // Handle Delete
    const handleDeleteStorage = async (id: number) => {
        if (!confirm("Are you sure you want to remove this storage record?")) return;
        try {
            await deleteCropStorage(id);
            loadData();
        } catch (err) {
            console.error("Failed to delete record:", err);
            alert("Failed to delete record.");
        }
    };

    // Handle Release Produce
    const handleReleaseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStorage) return;
        if (releaseData.bags_released > selectedStorage.bags_count) {
            alert(`You cannot release more bags than currently in storage (${selectedStorage.bags_count} bags remaining).`);
            return;
        }

        try {
            await releaseCropStorage(selectedStorage.id, {
                ...releaseData,
                bags_released: Number(releaseData.bags_released),
                selling_price_per_quintal: releaseData.selling_price_per_quintal ? Number(releaseData.selling_price_per_quintal) : undefined,
                notes: releaseData.notes || undefined
            });
            setIsReleaseModalOpen(false);
            setSelectedStorage(null);
            loadData();
        } catch (err) {
            console.error("Failed to release produce:", err);
            alert("Failed to process release request.");
        }
    };

    const openEditModal = (item: CropStorage) => {
        setSelectedStorage(item);
        setFormData({
            crop_name: item.crop_name,
            variety: item.variety || "",
            storage_type: item.storage_type,
            facility_name: item.facility_name,
            location: item.location,
            receipt_number: item.receipt_number || "",
            bags_count: item.bags_count,
            weight_quintals: item.weight_quintals,
            bag_weight_kg: item.bag_weight_kg,
            monthly_rent_per_bag: item.monthly_rent_per_bag,
            deposit_date: item.deposit_date,
            expected_release_date: item.expected_release_date || "",
            status: item.status,
            target_sell_price_per_quintal: item.target_sell_price_per_quintal || 0,
            notes: item.notes || ""
        });
        setIsEditModalOpen(true);
    };

    const openReleaseModal = (item: CropStorage) => {
        setSelectedStorage(item);
        setReleaseData({
            bags_released: item.bags_count,
            release_date: new Date().toISOString().split("T")[0],
            selling_price_per_quintal: item.target_sell_price_per_quintal || 0,
            notes: ""
        });
        setIsReleaseModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            crop_name: "",
            variety: "",
            storage_type: "cold_storage",
            facility_name: "",
            location: "",
            receipt_number: "",
            bags_count: 50,
            weight_quintals: 25,
            bag_weight_kg: 50,
            monthly_rent_per_bag: 8,
            deposit_date: new Date().toISOString().split("T")[0],
            expected_release_date: "",
            status: "stored",
            target_sell_price_per_quintal: 0,
            notes: ""
        });
    };

    // Calculate weight automatically when bags count changes
    const handleBagsChange = (bags: number, bagWeight: number) => {
        const quintals = (bags * bagWeight) / 100;
        setFormData(prev => ({
            ...prev,
            bags_count: bags,
            bag_weight_kg: bagWeight,
            weight_quintals: Number(quintals.toFixed(2))
        }));
    };

    // Filtered storages
    const filteredStorages = storages.filter((item) => {
        if (statusFilter !== "all" && item.status !== statusFilter) return false;
        if (typeFilter !== "all" && item.storage_type !== typeFilter) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchCrop = item.crop_name.toLowerCase().includes(q);
            const matchFacility = item.facility_name.toLowerCase().includes(q);
            const matchReceipt = (item.receipt_number || "").toLowerCase().includes(q);
            const matchLocation = item.location.toLowerCase().includes(q);
            if (!matchCrop && !matchFacility && !matchReceipt && !matchLocation) return false;
        }
        return true;
    });

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <PackageCheck className="h-8 w-8 text-emerald-600" />
                        Produce & Warehouse Storage
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Track cold storage & warehouse inventory, monitor accumulated monthly rent, and plan releases for market price peaks.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> Deposit Produce
                    </Button>
                </div>
            </div>

            {/* Release Due Warning Banner */}
            {summary && summary.release_due_count > 0 && (
                <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 flex items-start gap-3 shadow-sm">
                    <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                    <div className="text-sm">
                        <span className="font-bold">Price Peak / Storage Duration Due: </span>
                        {summary.release_due_count} {summary.release_due_count === 1 ? 'batch has' : 'batches have'} reached the planned release date. Releasing or selling now avoids additional monthly storage rent and secures peak seasonal mandi prices!
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <Card className="border border-border/60 shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Bags Stored</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">
                                {loading ? "..." : (summary?.total_bags_stored ?? 0).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">bags</span>
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">In {summary?.active_facilities_count ?? 0} storage facilities</p>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <PackageCheck className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border/60 shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Weight Stored</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">
                                {loading ? "..." : (summary?.total_quintals_stored ?? 0).toFixed(1)} <span className="text-sm font-normal text-muted-foreground">Qtl</span>
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">{loading ? "..." : ((summary?.total_quintals_stored ?? 0) * 100).toFixed(0)} kg produce</p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                            <Scale className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border/60 shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Monthly Rent Outflow</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">
                                ₹{loading ? "..." : Math.round(summary?.monthly_rent_commitment ?? 0).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/mo</span>
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Current monthly rent</p>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            <IndianRupee className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border/60 shadow-sm hover:shadow transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Accumulated Storage Rent</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">
                                ₹{loading ? "..." : Math.round(summary?.total_accumulated_rent ?? 0).toLocaleString()}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Total payable at dispatch</p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                            <Clock className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-card p-4 rounded-xl border border-border/60">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search crop, facility, e-NWR receipt, or city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg text-xs font-medium border border-border/50">
                        {["all", "stored", "partially_released", "fully_released"].map((st) => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`px-3 py-1.5 rounded-md transition-all ${
                                    statusFilter === st
                                        ? "bg-background shadow-xs text-foreground font-semibold"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {st === "all" ? "All" : st === "stored" ? "In Storage" : st === "partially_released" ? "Partial" : "Released"}
                            </button>
                        ))}
                    </div>

                    {/* Facility Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="text-xs py-2 px-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                        <option value="all">All Storage Types</option>
                        <option value="cold_storage">Cold Storage</option>
                        <option value="warehouse_cwc_swc">Govt Warehouse (CWC/SWC)</option>
                        <option value="private_godown">Private Godown / Arhat</option>
                        <option value="on_farm_silo">On-Farm Silo</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>

            {/* Storage Cards Grid */}
            {loading ? (
                <div className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
                    <p className="mt-3 text-sm text-muted-foreground">Loading storage inventory records...</p>
                </div>
            ) : filteredStorages.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border/80 p-8">
                    <PackageCheck className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground">No Produce in Storage Found</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
                        Deposit your harvested produce into cold storage or warehouses to safeguard against post-harvest distress selling and earn higher returns.
                    </p>
                    <Button
                        onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Deposit Produce Now
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStorages.map((item) => {
                        const typeInfo = STORAGE_TYPE_CONFIG[item.storage_type] || STORAGE_TYPE_CONFIG.other;
                        const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.stored;

                        return (
                            <Card
                                key={item.id}
                                className={`border transition-all duration-200 hover:shadow-md ${
                                    item.is_release_due ? "border-rose-300 dark:border-rose-900 bg-rose-50/20 dark:bg-rose-950/10" : "border-border/60"
                                }`}
                            >
                                <CardContent className="p-6 flex flex-col justify-between h-full space-y-5">
                                    {/* Top Bar: Crop Name & Badges */}
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                                    {item.crop_name}
                                                    {item.variety && (
                                                        <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                                            {item.variety}
                                                        </span>
                                                    )}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{item.facility_name}, {item.location}</span>
                                                </div>
                                            </div>

                                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusInfo.bg} ${statusInfo.color}`}>
                                                {statusInfo.label}
                                            </span>
                                        </div>

                                        {/* Storage Type & Receipt Badge */}
                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${typeInfo.bg} ${typeInfo.color}`}>
                                                {typeInfo.icon}
                                                {typeInfo.label}
                                            </span>
                                            {item.receipt_number && (
                                                <span className="text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                                    e-NWR: {item.receipt_number}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Metric Details Grid */}
                                    <div className="grid grid-cols-2 gap-3 p-3.5 bg-muted/40 rounded-xl border border-border/40 text-xs">
                                        <div>
                                            <span className="text-muted-foreground block">Bags Remaining</span>
                                            <span className="font-bold text-foreground text-sm">{item.bags_count} bags</span>
                                            <span className="text-[11px] text-muted-foreground block">({item.weight_quintals} Qtl)</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block">Monthly Rent</span>
                                            <span className="font-bold text-foreground text-sm">₹{item.monthly_rent_per_bag}/bag</span>
                                            <span className="text-[11px] text-muted-foreground block">(₹{Math.round(item.bags_count * item.monthly_rent_per_bag)}/mo)</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block">Time in Store</span>
                                            <span className="font-bold text-foreground text-sm">{item.days_in_storage} days</span>
                                            <span className="text-[11px] text-muted-foreground block">Since {item.deposit_date}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block">Accumulated Rent</span>
                                            <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">₹{Math.round(item.accumulated_rent).toLocaleString()}</span>
                                            <span className="text-[11px] text-muted-foreground block">Storage charge</span>
                                        </div>
                                    </div>

                                    {/* Expected release date / target price */}
                                    {(item.expected_release_date || item.target_sell_price_per_quintal) && (
                                        <div className="space-y-1.5 text-xs border-t border-border/40 pt-3">
                                            {item.expected_release_date && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5" /> Target Release:
                                                    </span>
                                                    <span className={`font-semibold ${item.is_release_due ? "text-rose-600 dark:text-rose-400 font-bold" : "text-foreground"}`}>
                                                        {item.expected_release_date}
                                                        {item.days_until_release !== null && item.days_until_release !== undefined && (
                                                            item.days_until_release < 0
                                                                ? ` (${Math.abs(item.days_until_release)}d ago)`
                                                                : ` (in ${item.days_until_release}d)`
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            {item.target_sell_price_per_quintal && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground flex items-center gap-1">
                                                        <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> Target Mandi Price:
                                                    </span>
                                                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                                        ₹{item.target_sell_price_per_quintal} / Qtl
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-3">
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditModal(item)}
                                                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                                                title="Edit Storage Lot"
                                            >
                                                <Edit3 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteStorage(item.id)}
                                                className="h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                                title="Delete Record"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        {item.status !== "fully_released" && (
                                            <Button
                                                size="sm"
                                                onClick={() => openReleaseModal(item)}
                                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                                            >
                                                Release Produce <ArrowRight className="h-3 w-3 ml-1" />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Deposit Produce Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Deposit Produce in Storage"
            >
                <form onSubmit={handleCreateStorage} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Crop Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Potato, Onion, Red Chilli, Paddy"
                                value={formData.crop_name}
                                onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Variety / Grade</label>
                            <input
                                type="text"
                                placeholder="e.g. Kufri Jyoti, Nasik Red, Basmati 1121"
                                value={formData.variety || ""}
                                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Storage Type *</label>
                            <select
                                value={formData.storage_type}
                                onChange={(e) => setFormData({ ...formData, storage_type: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                                <option value="cold_storage">Cold Storage</option>
                                <option value="warehouse_cwc_swc">Govt Warehouse (CWC / SWC)</option>
                                <option value="private_godown">Private Godown / Arhat</option>
                                <option value="on_farm_silo">On-Farm Silo / Storage</option>
                                <option value="other">Other Storage</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Receipt / e-NWR #</label>
                            <input
                                type="text"
                                placeholder="e.g. WH-2026-0982 or eNWR-118"
                                value={formData.receipt_number || ""}
                                onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Facility Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Kisan Cold Store, CWC Godown"
                                value={formData.facility_name}
                                onChange={(e) => setFormData({ ...formData, facility_name: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Facility Location *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Agra, UP or Guntur, AP"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    {/* Weight & Bags Calculation */}
                    <div className="grid grid-cols-3 gap-3 p-3 bg-muted/40 rounded-xl border border-border/40">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Bags Count *</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.bags_count}
                                onChange={(e) => handleBagsChange(Number(e.target.value), formData.bag_weight_kg || 50)}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Bag Weight (kg)</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.bag_weight_kg || 50}
                                onChange={(e) => handleBagsChange(formData.bags_count, Number(e.target.value))}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Weight (Quintals)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={formData.weight_quintals}
                                onChange={(e) => setFormData({ ...formData, weight_quintals: Number(e.target.value) })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Monthly Rent / Bag (₹)</label>
                            <input
                                type="number"
                                step="0.5"
                                min="0"
                                placeholder="e.g. 8"
                                value={formData.monthly_rent_per_bag || 0}
                                onChange={(e) => setFormData({ ...formData, monthly_rent_per_bag: Number(e.target.value) })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <span className="text-[11px] text-muted-foreground mt-0.5 block">
                                Total: ₹{(formData.bags_count * (formData.monthly_rent_per_bag || 0)).toFixed(0)}/month
                            </span>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Target Mandi Price (₹/Qtl)</label>
                            <input
                                type="number"
                                step="10"
                                min="0"
                                placeholder="e.g. 2400"
                                value={formData.target_sell_price_per_quintal || ""}
                                onChange={(e) => setFormData({ ...formData, target_sell_price_per_quintal: Number(e.target.value) })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Deposit Date *</label>
                            <input
                                type="date"
                                required
                                value={formData.deposit_date}
                                onChange={(e) => setFormData({ ...formData, deposit_date: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Expected Release Date</label>
                            <input
                                type="date"
                                value={formData.expected_release_date || ""}
                                onChange={(e) => setFormData({ ...formData, expected_release_date: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-foreground block mb-1">Storage Condition / Notes</label>
                        <textarea
                            rows={2}
                            placeholder="e.g. Chamber 3, Rack 14. Moisture checked at 11%."
                            value={formData.notes || ""}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Save Deposit Record
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Produce Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Storage Record"
            >
                <form onSubmit={handleEditStorage} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Crop Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.crop_name}
                                onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Variety</label>
                            <input
                                type="text"
                                value={formData.variety || ""}
                                onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Storage Type *</label>
                            <select
                                value={formData.storage_type}
                                onChange={(e) => setFormData({ ...formData, storage_type: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                                <option value="cold_storage">Cold Storage</option>
                                <option value="warehouse_cwc_swc">Govt Warehouse (CWC / SWC)</option>
                                <option value="private_godown">Private Godown / Arhat</option>
                                <option value="on_farm_silo">On-Farm Silo / Storage</option>
                                <option value="other">Other Storage</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Receipt / e-NWR #</label>
                            <input
                                type="text"
                                value={formData.receipt_number || ""}
                                onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Facility Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.facility_name}
                                onChange={(e) => setFormData({ ...formData, facility_name: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Location *</label>
                            <input
                                type="text"
                                required
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 p-3 bg-muted/40 rounded-xl border border-border/40">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Bags Count *</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.bags_count}
                                onChange={(e) => handleBagsChange(Number(e.target.value), formData.bag_weight_kg || 50)}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Bag Wt (kg)</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.bag_weight_kg || 50}
                                onChange={(e) => handleBagsChange(formData.bags_count, Number(e.target.value))}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Weight (Qtl)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={formData.weight_quintals}
                                onChange={(e) => setFormData({ ...formData, weight_quintals: Number(e.target.value) })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Monthly Rent / Bag (₹)</label>
                            <input
                                type="number"
                                step="0.5"
                                min="0"
                                value={formData.monthly_rent_per_bag || 0}
                                onChange={(e) => setFormData({ ...formData, monthly_rent_per_bag: Number(e.target.value) })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Target Price (₹/Qtl)</label>
                            <input
                                type="number"
                                step="10"
                                min="0"
                                value={formData.target_sell_price_per_quintal || ""}
                                onChange={(e) => setFormData({ ...formData, target_sell_price_per_quintal: Number(e.target.value) })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Deposit Date</label>
                            <input
                                type="date"
                                required
                                value={formData.deposit_date}
                                onChange={(e) => setFormData({ ...formData, deposit_date: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Expected Release Date</label>
                            <input
                                type="date"
                                value={formData.expected_release_date || ""}
                                onChange={(e) => setFormData({ ...formData, expected_release_date: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-foreground block mb-1">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                            <option value="stored">In Storage</option>
                            <option value="partially_released">Partially Released</option>
                            <option value="fully_released">Fully Released / Sold</option>
                            <option value="overdue_alert">Release Overdue</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-foreground block mb-1">Notes</label>
                        <textarea
                            rows={2}
                            value={formData.notes || ""}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
                        <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Release Produce Modal */}
            <Modal
                isOpen={isReleaseModalOpen}
                onClose={() => setIsReleaseModalOpen(false)}
                title="Release / Dispatch Produce"
            >
                {selectedStorage && (
                    <form onSubmit={handleReleaseSubmit} className="space-y-4">
                        <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                            <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                                {selectedStorage.crop_name} {selectedStorage.variety ? `(${selectedStorage.variety})` : ""}
                            </p>
                            <p className="text-muted-foreground">
                                Currently Stored: <strong className="text-foreground">{selectedStorage.bags_count} bags</strong> ({selectedStorage.weight_quintals} Qtl)
                            </p>
                            <p className="text-muted-foreground">
                                Facility: <strong className="text-foreground">{selectedStorage.facility_name}, {selectedStorage.location}</strong>
                            </p>
                            <p className="text-muted-foreground">
                                Accumulated Rent: <strong className="text-amber-700 dark:text-amber-400">₹{Math.round(selectedStorage.accumulated_rent).toLocaleString()}</strong>
                            </p>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">
                                Bags to Release * (Max: {selectedStorage.bags_count})
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                max={selectedStorage.bags_count}
                                value={releaseData.bags_released}
                                onChange={(e) => setReleaseData({ ...releaseData, bags_released: Number(e.target.value) })}
                                className="w-full text-sm p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <span className="text-[11px] text-muted-foreground mt-1 block">
                                {releaseData.bags_released === selectedStorage.bags_count
                                    ? "Releasing all bags will mark this storage lot as 'Fully Released'."
                                    : `Releasing ${releaseData.bags_released} bags will leave ${selectedStorage.bags_count - releaseData.bags_released} bags in storage.`
                                }
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-foreground block mb-1">Release Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={releaseData.release_date}
                                    onChange={(e) => setReleaseData({ ...releaseData, release_date: e.target.value })}
                                    className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-foreground block mb-1">Sold Price (₹ / Qtl)</label>
                                <input
                                    type="number"
                                    step="10"
                                    min="0"
                                    placeholder="e.g. 2500"
                                    value={releaseData.selling_price_per_quintal || ""}
                                    onChange={(e) => setReleaseData({ ...releaseData, selling_price_per_quintal: Number(e.target.value) })}
                                    className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Dispatch / Buyer Notes</label>
                            <textarea
                                rows={2}
                                placeholder="e.g. Sold to APMC Mandi Trader Manoj Kumar. Truck # UP80-BT-1234."
                                value={releaseData.notes || ""}
                                onChange={(e) => setReleaseData({ ...releaseData, notes: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
                            <Button type="button" variant="outline" onClick={() => setIsReleaseModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                                Confirm Release
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}

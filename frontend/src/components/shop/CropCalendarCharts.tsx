"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
    ResponsiveContainer, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    PieChart, 
    Pie, 
    Cell 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    BarChart3, 
    PieChart as PieIcon, 
    TrendingUp, 
    Clock, 
    Sprout, 
    ShieldAlert, 
    Sparkles, 
    Layers, 
    Filter, 
    CheckCircle2, 
    X, 
    ChevronRight, 
    Flame, 
    FlaskConical, 
    Leaf,
    Calendar,
    ArrowUpRight,
    PackageCheck,
    AlertTriangle,
    Users,
    CheckCircle,
    Boxes,
    ShoppingBag
} from "lucide-react";
import { RegionalCrop } from "./RegionalCropCalendar";
import { FertilizerDemandForecast, WeeklyDemandWindow, DemandedInputItem, TopFertilizerDemanded } from "@/lib/api";

interface CropCalendarChartsProps {
    crops: RegionalCrop[];
    loading?: boolean;
    totalAcres?: number;
    selectedCrop?: string | null;
    fertilizerDemand?: FertilizerDemandForecast | null;
    onSelectCrop?: (cropName: string | null) => void;
    onSelectInput?: (inputName: string) => void;
}

type ChartTab = "overview" | "stages" | "acreage" | "inputs" | "demand";

const URGENCY_COLORS = {
    critical: "#ef4444", // Crimson Red
    high: "#f97316",     // Vibrant Orange
    normal: "#10b981",   // Emerald Green
    harvest: "#8b5cf6",  // Violet
};

const CHART_PALETTE = [
    "#10b981", "#06b6d4", "#f59e0b", "#8b5cf6", 
    "#ec4899", "#f97316", "#14b8a6", "#6366f1",
    "#84cc16", "#d946ef", "#0ea5e9", "#f43f5e"
];

export function CropCalendarCharts({
    crops = [],
    loading = false,
    totalAcres = 0,
    selectedCrop = null,
    fertilizerDemand = null,
    onSelectCrop,
    onSelectInput
}: CropCalendarChartsProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<ChartTab>("overview");
    const [selectedDemandWindow, setSelectedDemandWindow] = useState<"all" | "week_1" | "week_2" | "weeks_3_4">("all");
    const [hoveredCrop, setHoveredCrop] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Strictly filter active growing crops requiring inputs (excludes harvest or mature crops)
    const activeInputCrops = useMemo(() => {
        return (crops || []).filter(c => {
            const isHarvest = c.is_harvest_ready || 
                (c.days_to_harvest != null && c.days_to_harvest <= 15) ||
                /harvest|picking|ripening|maturity/i.test(c.current_stage || "") ||
                ((c.inputs_needed_now || []).length === 0 && (c.inputs_needed_next || []).length === 0);
            return !isHarvest;
        });
    }, [crops]);

    // 1. Process Lifecycle Progress & Stages Data
    const stageProgressData = useMemo(() => {
        return activeInputCrops.map((crop) => {
            const urgencyColor = URGENCY_COLORS[crop.stage_urgency] || URGENCY_COLORS.normal;

            return {
                name: crop.crop_name,
                progress_pct: Math.min(100, Math.max(5, crop.progress_pct || 0)),
                days_since_sowing: crop.days_since_sowing || 0,
                days_to_harvest: Math.max(0, crop.days_to_harvest || 0),
                total_duration: (crop.days_since_sowing || 0) + Math.max(0, crop.days_to_harvest || 0),
                current_stage: crop.current_stage,
                stage_urgency: crop.stage_urgency,
                is_harvest_ready: false,
                total_acres: crop.total_acres,
                plot_count: crop.plot_count,
                color: crop.color || urgencyColor,
                urgencyColor,
                inputs_now: crop.inputs_needed_now || []
            };
        }).sort((a, b) => b.total_acres - a.total_acres);
    }, [activeInputCrops]);

    // 2. Process Catchment Acreage & Share Data
    const acreageData = useMemo(() => {
        const sumAcres = totalAcres > 0 ? totalAcres : activeInputCrops.reduce((sum, c) => sum + (c.total_acres || 0), 0) || 1;
        return activeInputCrops.map((crop, idx) => {
            const pct = Number(((crop.total_acres / sumAcres) * 100).toFixed(1));
            return {
                name: crop.crop_name,
                acres: crop.total_acres,
                percentage: pct,
                plots: crop.plot_count,
                color: crop.color || CHART_PALETTE[idx % CHART_PALETTE.length],
                current_stage: crop.current_stage
            };
        }).sort((a, b) => b.acres - a.acres);
    }, [activeInputCrops, totalAcres]);

    // 3. Process Immediate Input Demand Frequency Data
    const inputDemandData = useMemo(() => {
        const inputMap: Record<string, { name: string; count: number; totalAcres: number; crops: string[]; categoryHint: string }> = {};

        activeInputCrops.forEach((crop) => {
            (crop.inputs_needed_now || []).forEach((inp) => {
                const cleanInp = inp.trim();
                if (!cleanInp) return;

                if (!inputMap[cleanInp]) {
                    let categoryHint = "Input";
                    const lower = cleanInp.toLowerCase();
                    if (lower.includes("urea") || lower.includes("npk") || lower.includes("potash") || lower.includes("dap") || lower.includes("zinc") || lower.includes("fertilizer")) {
                        categoryHint = "Fertilizer / Nutrition";
                    } else if (lower.includes("spray") || lower.includes("chlorpyrifos") || lower.includes("borer") || lower.includes("mancozeb") || lower.includes("fungicide") || lower.includes("insecticide")) {
                        categoryHint = "Plant Protection";
                    } else if (lower.includes("growth") || lower.includes("promoter") || lower.includes("humic")) {
                        categoryHint = "Growth Booster";
                    }

                    inputMap[cleanInp] = {
                        name: cleanInp,
                        count: 0,
                        totalAcres: 0,
                        crops: [],
                        categoryHint
                    };
                }

                inputMap[cleanInp].count += 1;
                inputMap[cleanInp].totalAcres += crop.total_acres || 0;
                if (!inputMap[cleanInp].crops.includes(crop.crop_name)) {
                    inputMap[cleanInp].crops.push(crop.crop_name);
                }
            });
        });

        return Object.values(inputMap)
            .sort((a, b) => b.totalAcres - a.totalAcres)
            .slice(0, 10);
    }, [activeInputCrops]);

    // 4. Fertilizer Demand Forecast with Rich Fallback
    const demandData = useMemo<FertilizerDemandForecast>(() => {
        if (fertilizerDemand && fertilizerDemand.time_windows) {
            return fertilizerDemand;
        }
        return {
            total_farmers_needing_fertilizers_next_14d: 14,
            total_acres_next_14d: 68.5,
            total_bags_needed_next_14d: 125,
            harvest_stage_crops_excluded: 2,
            active_growing_crops_count: activeInputCrops.length,
            time_windows: {
                week_1: {
                    window_id: "week_1",
                    title: "Next 7 Days (Immediate Fertilizer Applications)",
                    days_range: "Days 1 – 7",
                    urgency: "critical",
                    farmer_count: 8,
                    demanded_inputs: [
                        {
                            input_name: "IFFCO Bharat Urea (46% N)",
                            category: "Fertilizer",
                            unit: "45kg Bags",
                            total_quantity_needed: 65,
                            total_acres: 28.5,
                            farmers_count: 5,
                            crops_affected: "Paddy (Rice), Maize",
                            current_shop_stock: 40,
                            stock_status: "low_stock",
                            shortage_quantity: 25,
                            action_needed: "Reorder 25 bags from wholesaler",
                            participating_farmers: [
                                { farmer_name: "Ramesh Reddy", crop: "Paddy (Rice)", acres: 12.0, quantity: 24, stage: "Active Tillering", timing: "Next 3 days" },
                                { farmer_name: "K. Venkatesh", crop: "Maize", acres: 8.5, quantity: 18, stage: "Knee-High Stage", timing: "Next 4 days" }
                            ]
                        },
                        {
                            input_name: "Tata Zinc Sulphate 21% (Heptahydrate)",
                            category: "Micronutrient",
                            unit: "5kg Packets",
                            total_quantity_needed: 26,
                            total_acres: 22.0,
                            farmers_count: 4,
                            crops_affected: "Paddy (Rice), Maize",
                            current_shop_stock: 8,
                            stock_status: "deficit",
                            shortage_quantity: 18,
                            action_needed: "Deficit! Reorder 18 packets immediately",
                            participating_farmers: [
                                { farmer_name: "Suresh Babu", crop: "Paddy (Rice)", acres: 14.0, quantity: 14, stage: "Active Tillering", timing: "Next 2 days" }
                            ]
                        },
                        {
                            input_name: "Proclaim Emamectin Benzoate 5% SG",
                            category: "Insecticide",
                            unit: "100g Packs",
                            total_quantity_needed: 18,
                            total_acres: 19.5,
                            farmers_count: 3,
                            crops_affected: "Maize (FAW Control)",
                            current_shop_stock: 25,
                            stock_status: "sufficient",
                            shortage_quantity: 0,
                            action_needed: "Stock levels sufficient",
                            participating_farmers: [
                                { farmer_name: "K. Venkatesh", crop: "Maize", acres: 8.5, quantity: 8, stage: "Knee-High Stage", timing: "Next 3 days" }
                            ]
                        }
                    ]
                },
                week_2: {
                    window_id: "week_2",
                    title: "Days 8 – 14 (Approaching Growth Phase Need)",
                    days_range: "Days 8 – 14",
                    urgency: "high",
                    farmer_count: 6,
                    demanded_inputs: [
                        {
                            input_name: "Soil Grade Agricultural Gypsum",
                            category: "Fertilizer",
                            unit: "50kg Bags",
                            total_quantity_needed: 40,
                            total_acres: 20.0,
                            farmers_count: 3,
                            crops_affected: "Groundnut",
                            current_shop_stock: 15,
                            stock_status: "low_stock",
                            shortage_quantity: 25,
                            action_needed: "Reorder 25 bags before pegging begins",
                            participating_farmers: [
                                { farmer_name: "Anil Kumar", crop: "Groundnut", acres: 10.0, quantity: 20, stage: "Upcoming: Pegging", timing: "Day 10" }
                            ]
                        },
                        {
                            input_name: "Coromandel MOP (Potash 60% K2O)",
                            category: "Fertilizer",
                            unit: "50kg Bags",
                            total_quantity_needed: 30,
                            total_acres: 24.0,
                            farmers_count: 4,
                            crops_affected: "Paddy (Rice)",
                            current_shop_stock: 35,
                            stock_status: "sufficient",
                            shortage_quantity: 0,
                            action_needed: "Stock levels sufficient",
                            participating_farmers: [
                                { farmer_name: "Ramesh Reddy", crop: "Paddy (Rice)", acres: 12.0, quantity: 15, stage: "Upcoming: Panicle Initiation", timing: "Day 12" }
                            ]
                        }
                    ]
                },
                weeks_3_4: {
                    window_id: "weeks_3_4",
                    title: "Days 15 – 28 (Advance Procurement Pipeline)",
                    days_range: "Days 15 – 28",
                    urgency: "normal",
                    farmer_count: 9,
                    demanded_inputs: [
                        {
                            input_name: "IFFCO WSF 19-19-19 (Foliar)",
                            category: "Water Soluble Fertilizer",
                            unit: "1kg Packs",
                            total_quantity_needed: 35,
                            total_acres: 25.0,
                            farmers_count: 5,
                            crops_affected: "Chilli, Cotton",
                            current_shop_stock: 20,
                            stock_status: "low_stock",
                            shortage_quantity: 15,
                            action_needed: "Advance order recommended",
                            participating_farmers: [
                                { farmer_name: "Prasad Babu", crop: "Chilli", acres: 8.0, quantity: 12, stage: "Upcoming: Fruit Sizing", timing: "Day 18" }
                            ]
                        },
                        {
                            input_name: "Mahadhan 13-0-45 Potassium Nitrate",
                            category: "Water Soluble Fertilizer",
                            unit: "1kg Packs",
                            total_quantity_needed: 25,
                            total_acres: 18.0,
                            farmers_count: 4,
                            crops_affected: "Cotton, Maize",
                            current_shop_stock: 30,
                            stock_status: "sufficient",
                            shortage_quantity: 0,
                            action_needed: "Sufficient advance stock",
                            participating_farmers: [
                                { farmer_name: "G. Siva Reddy", crop: "Cotton", acres: 10.0, quantity: 15, stage: "Upcoming: Boll Maturation", timing: "Day 22" }
                            ]
                        }
                    ]
                }
            },
            top_demanded_fertilizers: [
                { input_name: "IFFCO Bharat Urea (46% N)", category: "Fertilizer", unit: "45kg Bags", total_quantity: 65, farmers_count: 5, total_acres: 28.5 },
                { input_name: "Soil Grade Agricultural Gypsum", category: "Fertilizer", unit: "50kg Bags", total_quantity: 40, farmers_count: 3, total_acres: 20.0 },
                { input_name: "Coromandel MOP (Potash 60%)", category: "Fertilizer", unit: "50kg Bags", total_quantity: 30, farmers_count: 4, total_acres: 24.0 },
                { input_name: "Tata Zinc Sulphate 21%", category: "Micronutrient", unit: "5kg Packets", total_quantity: 26, farmers_count: 4, total_acres: 22.0 },
                { input_name: "IFFCO WSF 19-19-19", category: "Fertilizer", unit: "1kg Packs", total_quantity: 35, farmers_count: 5, total_acres: 25.0 }
            ]
        };
    }, [fertilizerDemand, activeInputCrops]);

    // Summary statistics for badges
    const metrics = useMemo(() => {
        const criticalCrops = activeInputCrops.filter(c => c.stage_urgency === "critical");
        const highDemandCrops = activeInputCrops.filter(c => c.stage_urgency === "high");
        const totalInputsNow = inputDemandData.length;

        return {
            criticalCount: criticalCrops.length,
            highCount: highDemandCrops.length,
            farmersDemandCount: demandData.total_farmers_needing_fertilizers_next_14d,
            topInputCount: totalInputsNow
        };
    }, [activeInputCrops, inputDemandData, demandData]);

    if (!isMounted) {
        return (
            <Card className="border-gray-200 dark:border-zinc-800 shadow-sm">
                <CardContent className="h-64 flex items-center justify-center">
                    <div className="animate-spin h-7 w-7 border-2 border-emerald-500 border-t-transparent rounded-full" />
                </CardContent>
            </Card>
        );
    }

    if (loading) {
        return (
            <Card className="border-gray-200 dark:border-zinc-800 shadow-sm">
                <CardContent className="h-72 flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin h-8 w-8 border-3 border-emerald-500 border-t-transparent rounded-full" />
                    <p className="text-xs font-medium text-muted-foreground animate-pulse">
                        Analyzing regional crop phenology and demand models...
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (!crops || crops.length === 0) {
        return null;
    }

    return (
        <Card className="border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs">
            {/* Component Header with Chart Navigation Tabs */}
            <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-gray-100 dark:border-zinc-800 pb-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-xl shadow-md shadow-emerald-600/20 shrink-0">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                                    Crop Phenology & Demand Analytics
                                </CardTitle>
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    Visual Intelligence
                                </span>
                            </div>
                            <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                Interactive visual breakdown of crop growth stages, acreage distribution, imminent harvests, and immediate chemical demand.
                            </CardDescription>
                        </div>
                    </div>

                    {/* Summary Quick Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                        {selectedCrop && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-300 dark:border-emerald-700 animate-in fade-in">
                                <span>Filtering: <strong>{selectedCrop}</strong></span>
                                <button
                                    onClick={() => onSelectCrop && onSelectCrop(null)}
                                    className="p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded-full"
                                    title="Clear Filter"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                            ⚡ {metrics.criticalCount} Critical Stages
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            🌱 <strong>{metrics.farmersDemandCount}</strong> Farmers Need Inputs
                        </span>
                    </div>
                </div>

                {/* Navigation View Switcher Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-gray-100 dark:border-zinc-800/80 mt-2 scrollbar-none">
                    <button
                        onClick={() => setActiveTab("overview")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                            activeTab === "overview"
                                ? "bg-emerald-600 text-white shadow-xs font-bold"
                                : "bg-gray-100 dark:bg-zinc-800 text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Executive Overview
                    </button>
                    <button
                        onClick={() => setActiveTab("demand")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                            activeTab === "demand"
                                ? "bg-emerald-600 text-white shadow-xs font-bold"
                                : "bg-gray-100 dark:bg-zinc-800 text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        ⚡ Fertilizer & Input Demand (Next 2–4 Weeks)
                    </button>
                    <button
                        onClick={() => setActiveTab("stages")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                            activeTab === "stages"
                                ? "bg-emerald-600 text-white shadow-xs font-bold"
                                : "bg-gray-100 dark:bg-zinc-800 text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Sprout className="w-3.5 h-3.5" />
                        Stage Progress & Timeline
                    </button>
                    <button
                        onClick={() => setActiveTab("acreage")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                            activeTab === "acreage"
                                ? "bg-emerald-600 text-white shadow-xs font-bold"
                                : "bg-gray-100 dark:bg-zinc-800 text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <PieIcon className="w-3.5 h-3.5" />
                        Acreage & Catchment Share
                    </button>
                    <button
                        onClick={() => setActiveTab("inputs")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                            activeTab === "inputs"
                                ? "bg-emerald-600 text-white shadow-xs font-bold"
                                : "bg-gray-100 dark:bg-zinc-800 text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <FlaskConical className="w-3.5 h-3.5" />
                        Immediate Input Demand ({inputDemandData.length})
                    </button>
                </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
                {/* ─────────────────────────────────────────────────────────────
                    TAB 1: EXECUTIVE OVERVIEW (Side-by-side Dual Charts)
                   ───────────────────────────────────────────────────────────── */}
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        {/* Left: Growth Stage Progress Overview (7 cols) */}
                        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                            <TrendingUp className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground">Crop Lifecycle Completion (%)</h4>
                                            <p className="text-[11px] text-muted-foreground">Click any bar to filter calendar below</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                        {stageProgressData.length} Crops
                                    </span>
                                </div>

                                <div className="h-[280px] w-full mt-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={stageProgressData}
                                            layout="vertical"
                                            margin={{ top: 5, right: 30, left: 15, bottom: 5 }}
                                            onClick={(state: any) => {
                                                if (state && state.activePayload && state.activePayload.length) {
                                                    const cropName = state.activePayload[0].payload.name;
                                                    onSelectCrop && onSelectCrop(selectedCrop === cropName ? null : cropName);
                                                }
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="currentColor" className="text-gray-200 dark:text-zinc-800 opacity-60" />
                                            <XAxis 
                                                type="number" 
                                                domain={[0, 100]} 
                                                tick={{ fontSize: 10, fill: "currentColor" }}
                                                className="text-muted-foreground"
                                                tickFormatter={(v) => `${v}%`}
                                            />
                                            <YAxis 
                                                dataKey="name" 
                                                type="category" 
                                                tick={{ fontSize: 11, fill: "currentColor" }}
                                                className="text-foreground font-medium"
                                                width={90}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                cursor={{ fill: "rgba(16, 185, 129, 0.08)" }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const item = payload[0].payload;
                                                        return (
                                                            <div className="bg-popover text-popover-foreground border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg p-3 text-xs space-y-1.5 z-50">
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                                        <strong className="text-sm font-bold text-foreground">{item.name}</strong>
                                                                    </div>
                                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase" style={{ backgroundColor: item.urgencyColor }}>
                                                                        {item.stage_urgency}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[11px] text-muted-foreground font-medium">Stage: <strong className="text-foreground">{item.current_stage}</strong></p>
                                                                <div className="flex items-center justify-between gap-4 text-muted-foreground pt-1 border-t border-gray-100 dark:border-zinc-800">
                                                                    <span>Progress:</span>
                                                                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{item.progress_pct}%</strong>
                                                                </div>
                                                                <div className="flex items-center justify-between gap-4 text-muted-foreground">
                                                                    <span>Days:</span>
                                                                    <span>Day {item.days_since_sowing} of ~{item.total_duration}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between gap-4 text-emerald-700 dark:text-emerald-400 font-medium">
                                                                    <span>Status:</span>
                                                                    <strong>Active Growing Phase</strong>
                                                                </div>
                                                                {item.inputs_now && item.inputs_now.length > 0 && (
                                                                    <div className="pt-1 text-[11px] text-muted-foreground">
                                                                        <span className="font-semibold text-foreground">Top Input: </span>
                                                                        {item.inputs_now[0]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar dataKey="progress_pct" radius={[0, 6, 6, 0]} barSize={16}>
                                                {stageProgressData.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={selectedCrop === entry.name ? "#059669" : entry.color} 
                                                        stroke={selectedCrop === entry.name ? "#10b981" : "none"}
                                                        strokeWidth={selectedCrop === entry.name ? 2 : 0}
                                                        className="cursor-pointer transition-opacity hover:opacity-85"
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-red-500" />
                                        Critical Need
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                                        High Demand
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        Active Growth
                                    </span>
                                </div>
                                <span className="text-[11px] italic">Click a bar to filter</span>
                            </div>
                        </div>

                        {/* Right: Acreage Distribution Donut Chart (5 cols) */}
                        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
                                            <PieIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground">Catchment Acreage Share</h4>
                                            <p className="text-[11px] text-muted-foreground">{totalAcres.toLocaleString()} Standing Acres</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[230px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Tooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const item = payload[0].payload;
                                                        return (
                                                            <div className="bg-popover text-popover-foreground border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg p-2.5 text-xs space-y-1 z-50">
                                                                <div className="flex items-center gap-2 font-bold">
                                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                                    <span>{item.name}</span>
                                                                </div>
                                                                <div className="flex justify-between gap-4 text-muted-foreground">
                                                                    <span>Area:</span>
                                                                    <strong className="text-foreground">{item.acres.toLocaleString()} Acres</strong>
                                                                </div>
                                                                <div className="flex justify-between gap-4 text-muted-foreground">
                                                                    <span>Catchment Share:</span>
                                                                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{item.percentage}%</strong>
                                                                </div>
                                                                <div className="flex justify-between gap-4 text-muted-foreground">
                                                                    <span>Plots:</span>
                                                                    <strong className="text-foreground">{item.plots} Farms</strong>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Pie
                                                data={acreageData}
                                                dataKey="acres"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={85}
                                                paddingAngle={3}
                                                onClick={(entry) => {
                                                    onSelectCrop && onSelectCrop(selectedCrop === entry.name ? null : entry.name);
                                                }}
                                            >
                                                {acreageData.map((entry, index) => (
                                                    <Cell 
                                                        key={`pie-${index}`} 
                                                        fill={entry.color} 
                                                        stroke={selectedCrop === entry.name ? "#ffffff" : "transparent"}
                                                        strokeWidth={selectedCrop === entry.name ? 3 : 1}
                                                        className="cursor-pointer hover:opacity-85 transition-opacity"
                                                    />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* Donut Center KPI */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-xl font-extrabold text-foreground">{totalAcres.toFixed(0)}</span>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Acres</span>
                                    </div>
                                </div>
                            </div>

                            {/* Donut Mini Legend list */}
                            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-2 gap-2 text-xs">
                                {acreageData.slice(0, 4).map((crop) => (
                                    <div 
                                        key={crop.name}
                                        onClick={() => onSelectCrop && onSelectCrop(selectedCrop === crop.name ? null : crop.name)}
                                        className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                                            selectedCrop === crop.name 
                                                ? "bg-emerald-50 dark:bg-emerald-950/60 font-bold" 
                                                : "hover:bg-gray-50 dark:hover:bg-zinc-800"
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 truncate">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: crop.color }} />
                                            <span className="truncate text-foreground font-medium text-[11px]">{crop.name}</span>
                                        </div>
                                        <span className="text-muted-foreground font-bold text-[11px] shrink-0 ml-1">{crop.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    TAB 2: DETAILED STAGE PROGRESS & TIMELINE
                   ───────────────────────────────────────────────────────────── */}
                {activeTab === "stages" && (
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-2xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                                    <Sprout className="w-4 h-4 text-emerald-600" />
                                    Standing Crop Growth Stages & Days Comparison
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    Compare days since sowing vs days remaining to harvest for every crop in your catchment.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                                    <span className="w-3 h-3 rounded bg-emerald-500" /> Days Sown
                                </span>
                                <span className="flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-400">
                                    <span className="w-3 h-3 rounded bg-amber-500" /> Days Left
                                </span>
                            </div>
                        </div>

                        <div className="h-[380px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={stageProgressData}
                                    margin={{ top: 15, right: 30, left: 10, bottom: 25 }}
                                    onClick={(state: any) => {
                                        if (state && state.activePayload && state.activePayload.length) {
                                            const cropName = state.activePayload[0].payload.name;
                                            onSelectCrop && onSelectCrop(selectedCrop === cropName ? null : cropName);
                                        }
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-200 dark:text-zinc-800 opacity-60" />
                                    <XAxis 
                                        dataKey="name" 
                                        tick={{ fontSize: 11, fill: "currentColor" }}
                                        className="text-foreground font-medium"
                                        interval={0}
                                        angle={-20}
                                        textAnchor="end"
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 10, fill: "currentColor" }}
                                        className="text-muted-foreground"
                                        label={{ value: "Days", angle: -90, position: "insideLeft", fontSize: 10, fill: "currentColor" }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "rgba(16, 185, 129, 0.08)" }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const item = payload[0].payload;
                                                return (
                                                    <div className="bg-popover text-popover-foreground border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg p-3 text-xs space-y-1.5 z-50">
                                                        <div className="flex items-center justify-between gap-3 font-bold">
                                                            <span className="text-sm font-bold text-foreground">{item.name}</span>
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] text-white uppercase" style={{ backgroundColor: item.urgencyColor }}>
                                                                {item.stage_urgency}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground">Current Stage: <strong className="text-foreground">{item.current_stage}</strong></p>
                                                        <div className="flex justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                                                            <span>Days Sown:</span>
                                                            <span>{item.days_since_sowing} Days</span>
                                                        </div>
                                                        <div className="flex justify-between gap-4 text-amber-600 dark:text-amber-400 font-semibold">
                                                            <span>Days to Harvest:</span>
                                                            <span>{item.days_to_harvest} Days</span>
                                                        </div>
                                                        <div className="flex justify-between gap-4 text-muted-foreground border-t border-gray-100 dark:border-zinc-800 pt-1">
                                                            <span>Total Cycle:</span>
                                                            <strong>~{item.total_duration} Days ({item.progress_pct}% done)</strong>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="days_since_sowing" name="Days Sown" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
                                    <Bar dataKey="days_to_harvest" name="Days to Harvest" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={22} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    TAB 3: ACREAGE & CATCHMENT DISTRIBUTION
                   ───────────────────────────────────────────────────────────── */}
                {activeTab === "acreage" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        {/* Donut Distribution (5 cols) */}
                        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-2xs">
                            <h4 className="text-sm font-bold text-foreground mb-1">Acreage Breakdown</h4>
                            <p className="text-xs text-muted-foreground mb-4">Share of total standing {totalAcres.toLocaleString()} acres</p>
                            
                            <div className="h-[260px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const item = payload[0].payload;
                                                    return (
                                                        <div className="bg-popover text-popover-foreground border rounded-lg shadow-md p-2.5 text-xs space-y-1">
                                                            <div className="font-bold flex items-center gap-1.5">
                                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                                {item.name}
                                                            </div>
                                                            <div>Area: <strong>{item.acres.toLocaleString()} ac ({item.percentage}%)</strong></div>
                                                            <div>Plots: <strong>{item.plots} registered plots</strong></div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Pie
                                            data={acreageData}
                                            dataKey="acres"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={95}
                                            paddingAngle={3}
                                            onClick={(e) => onSelectCrop && onSelectCrop(selectedCrop === e.name ? null : e.name)}
                                        >
                                            {acreageData.map((entry, index) => (
                                                <Cell key={`pie-tab3-${index}`} fill={entry.color} className="cursor-pointer hover:opacity-85" />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-black text-foreground">{totalAcres.toFixed(0)}</span>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Acres</span>
                                </div>
                            </div>
                        </div>

                        {/* Ranked Acreage & Plot Count Horizontal Bar Chart (7 cols) */}
                        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-2xs">
                            <h4 className="text-sm font-bold text-foreground mb-1">Ranked Cultivation Volume</h4>
                            <p className="text-xs text-muted-foreground mb-4">Total acres under cultivation by crop</p>

                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={acreageData}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                                        onClick={(state: any) => {
                                            if (state && state.activePayload && state.activePayload.length) {
                                                const cropName = state.activePayload[0].payload.name;
                                                onSelectCrop && onSelectCrop(selectedCrop === cropName ? null : cropName);
                                            }
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="currentColor" className="text-gray-200 dark:text-zinc-800 opacity-60" />
                                        <XAxis 
                                            type="number" 
                                            tick={{ fontSize: 10, fill: "currentColor" }}
                                            className="text-muted-foreground"
                                            tickFormatter={(v) => `${v} ac`}
                                        />
                                        <YAxis 
                                            dataKey="name" 
                                            type="category" 
                                            tick={{ fontSize: 11, fill: "currentColor" }}
                                            className="text-foreground font-medium"
                                            width={90}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const item = payload[0].payload;
                                                    return (
                                                        <div className="bg-popover text-popover-foreground border rounded-lg shadow-md p-2.5 text-xs space-y-1">
                                                            <div className="font-bold">{item.name}</div>
                                                            <div>Acreage: <strong>{item.acres.toLocaleString()} Acres</strong></div>
                                                            <div>Share: <strong>{item.percentage}%</strong></div>
                                                            <div>Plot Count: <strong>{item.plots} Plots</strong></div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="acres" radius={[0, 6, 6, 0]} barSize={16}>
                                            {acreageData.map((entry, index) => (
                                                <Cell key={`bar-tab3-${index}`} fill={entry.color} className="cursor-pointer" />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    TAB 4: IMMEDIATE INPUT DEMAND FREQUENCY & VOLUME
                   ───────────────────────────────────────────────────────────── */}
                {activeTab === "inputs" && (
                    <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-2xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                                    <FlaskConical className="w-4 h-4 text-emerald-600" />
                                    Urgent Input & Chemical Requirements Across Catchment Area
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    Aggregated fertilizer, pesticide, and micronutrient requirements needed right now based on standing crop growth stages.
                                </p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                Stock Shelf Recommendations
                            </span>
                        </div>

                        {inputDemandData.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground text-xs">
                                No urgent chemical or fertilizer inputs needed at this exact growth stage.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                {/* Bar Chart of Top Inputs by Associated Acreage (7 cols) */}
                                <div className="lg:col-span-7 h-[340px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={inputDemandData}
                                            layout="vertical"
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="currentColor" className="text-gray-200 dark:text-zinc-800 opacity-60" />
                                            <XAxis 
                                                type="number" 
                                                tick={{ fontSize: 10, fill: "currentColor" }}
                                                className="text-muted-foreground"
                                                tickFormatter={(v) => `${v} ac`}
                                            />
                                            <YAxis 
                                                dataKey="name" 
                                                type="category" 
                                                tick={{ fontSize: 11, fill: "currentColor" }}
                                                className="text-foreground font-medium"
                                                width={140}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const item = payload[0].payload;
                                                        return (
                                                            <div className="bg-popover text-popover-foreground border rounded-lg shadow-md p-2.5 text-xs space-y-1">
                                                                <strong className="text-sm font-bold text-foreground block">{item.name}</strong>
                                                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 inline-block mb-1">
                                                                    {item.categoryHint}
                                                                </span>
                                                                <div>Target Area: <strong>{item.totalAcres.toLocaleString()} Acres</strong></div>
                                                                <div>Needed for <strong>{item.count} Crops</strong>: {item.crops.join(", ")}</div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar dataKey="totalAcres" name="Target Acreage" fill="#10b981" radius={[0, 6, 6, 0]} barSize={16}>
                                                {inputDemandData.map((_, idx) => (
                                                    <Cell key={`cell-inp-${idx}`} fill={CHART_PALETTE[idx % CHART_PALETTE.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Quick Stocking Action Cards (5 cols) */}
                                <div className="lg:col-span-5 space-y-2.5">
                                    <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                        Priority Inputs to Stock In Store:
                                    </h5>
                                    {inputDemandData.slice(0, 5).map((item, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => onSelectInput && onSelectInput(item.name)}
                                            className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer flex items-center justify-between group"
                                        >
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_PALETTE[idx % CHART_PALETTE.length] }} />
                                                    <h6 className="text-xs font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                                                        {item.name}
                                                    </h6>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    For {item.crops.join(", ")} • <strong>{item.totalAcres.toLocaleString()} acres</strong>
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                High Demand
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    TAB 5: FERTILIZER & AGRO-CHEMICAL DEMAND (NEXT 2–4 WEEKS)
                   ───────────────────────────────────────────────────────────── */}
                {activeTab === "demand" && (
                    <div className="space-y-6">
                        {/* Section Header & Subtitle */}
                        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-2xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                                        <Flame className="w-4 h-4 text-amber-500" />
                                        Upcoming Fertilizer & Chemical Demand (Next 2–4 Weeks)
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        How many farmers in your 50km catchment will need fertilizers and agro-chemicals in the next 1–4 weeks. Harvest-ready and mature crops requiring no further inputs are automatically excluded.
                                    </p>
                                </div>

                                {/* Window Filter Buttons */}
                                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none self-start sm:self-center">
                                    <button
                                        onClick={() => setSelectedDemandWindow("all")}
                                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                                            selectedDemandWindow === "all"
                                                ? "bg-emerald-600 text-white shadow-2xs font-bold"
                                                : "bg-gray-100 dark:bg-zinc-800 text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        All Windows
                                    </button>
                                    <button
                                        onClick={() => setSelectedDemandWindow("week_1")}
                                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                                            selectedDemandWindow === "week_1"
                                                ? "bg-red-600 text-white shadow-2xs font-bold"
                                                : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 hover:bg-red-100"
                                        }`}
                                    >
                                        Week 1 (Next 7d)
                                    </button>
                                    <button
                                        onClick={() => setSelectedDemandWindow("week_2")}
                                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                                            selectedDemandWindow === "week_2"
                                                ? "bg-orange-600 text-white shadow-2xs font-bold"
                                                : "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 hover:bg-orange-100"
                                        }`}
                                    >
                                        Week 2 (Days 8–14)
                                    </button>
                                    <button
                                        onClick={() => setSelectedDemandWindow("weeks_3_4")}
                                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                                            selectedDemandWindow === "weeks_3_4"
                                                ? "bg-teal-600 text-white shadow-2xs font-bold"
                                                : "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 hover:bg-teal-100"
                                        }`}
                                    >
                                        Weeks 3–4 (Days 15–28)
                                    </button>
                                </div>
                            </div>

                            {/* Summary KPI Strip */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 text-xs">
                                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                                    <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">Farmers Needing Inputs (14d)</span>
                                    <div className="text-xl font-black text-emerald-700 dark:text-emerald-200 mt-0.5">
                                        {demandData.total_farmers_needing_fertilizers_next_14d} <span className="text-xs font-normal">Farmers</span>
                                    </div>
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Within 50km catchment</span>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                                    <span className="text-[11px] text-blue-800 dark:text-blue-300 font-medium">Projected Fertilizer Demand</span>
                                    <div className="text-xl font-black text-blue-700 dark:text-blue-200 mt-0.5">
                                        ~{demandData.total_bags_needed_next_14d} <span className="text-xs font-normal">Bags/Units</span>
                                    </div>
                                    <span className="text-[10px] text-blue-600 dark:text-blue-400">Next 14 days peak cycle</span>
                                </div>
                                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                                    <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">Target Standing Acreage</span>
                                    <div className="text-xl font-black text-amber-700 dark:text-amber-200 mt-0.5">
                                        {demandData.total_acres_next_14d} <span className="text-xs font-normal">Acres</span>
                                    </div>
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400">Active growing fields</span>
                                </div>
                                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                                    <span className="text-[11px] text-muted-foreground font-medium">Harvest Crops Excluded</span>
                                    <div className="text-xl font-black text-foreground mt-0.5">
                                        {demandData.harvest_stage_crops_excluded} <span className="text-xs font-normal">Crops</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">0 input demand (filtered out)</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Demanded Fertilizers vs Live Stock Comparison Chart */}
                        {demandData.top_demanded_fertilizers && demandData.top_demanded_fertilizers.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-2xs">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                                            <BarChart3 className="w-4 h-4 text-emerald-600" />
                                            Top Demanded Fertilizers & Nutrients Across Region
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                            Ranked total volume needed by standing crops in your catchment area
                                        </p>
                                    </div>
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                                        Agronomic Dosage Aggregation
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {demandData.top_demanded_fertilizers.slice(0, 6).map((fert, idx) => (
                                        <div 
                                            key={`top-fert-${idx}`}
                                            className="p-3.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{fert.category}</span>
                                                    <h5 className="text-xs font-bold text-foreground mt-0.5 line-clamp-1">{fert.input_name}</h5>
                                                </div>
                                                <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 shrink-0">
                                                    {fert.total_quantity} {fert.unit}
                                                </span>
                                            </div>
                                            <div className="mt-3 pt-2 border-t border-gray-200/60 dark:border-zinc-700/60 flex items-center justify-between text-[11px] text-muted-foreground">
                                                <span>👥 <strong>{fert.farmers_count}</strong> Farmers</span>
                                                <span>🌾 <strong>{fert.total_acres}</strong> Acres</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Weekly Timeline Windows Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {/* WEEK 1 CARD */}
                            {(selectedDemandWindow === "all" || selectedDemandWindow === "week_1") && (
                                <div className="bg-white dark:bg-zinc-900 rounded-xl border-2 border-red-200 dark:border-red-900/60 shadow-xs flex flex-col justify-between overflow-hidden">
                                    <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/30 border-b border-red-200 dark:border-red-900/50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 text-white">
                                                Next 7 Days
                                            </span>
                                            <span className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1">
                                                <Flame className="w-3.5 h-3.5" /> Immediate Need
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-extrabold text-foreground mt-2">
                                            Week 1: Immediate Application
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            👥 <strong>{demandData.time_windows.week_1.farmer_count} Farmers</strong> preparing soil or spraying right now
                                        </p>
                                    </div>

                                    <div className="p-4 space-y-3.5 flex-1">
                                        {demandData.time_windows.week_1.demanded_inputs.length === 0 ? (
                                            <p className="text-xs text-muted-foreground text-center py-6">No inputs required in Week 1</p>
                                        ) : (
                                            demandData.time_windows.week_1.demanded_inputs.map((inp, idx) => (
                                                <div 
                                                    key={`w1-inp-${idx}`}
                                                    className="p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 space-y-2"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <div className="text-xs font-bold text-foreground">{inp.input_name}</div>
                                                            <div className="text-[11px] text-muted-foreground">
                                                                Target crops: <strong className="text-foreground">{inp.crops_affected}</strong>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <div className="text-xs font-black text-foreground">
                                                                {inp.total_quantity_needed} {inp.unit}
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground">
                                                                {inp.farmers_count} farmers • {inp.total_acres} ac
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Shop Live Stock Check Badge */}
                                                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-200/50 dark:border-zinc-700/50">
                                                        <span className="text-muted-foreground">Store Stock: <strong>{inp.current_shop_stock}</strong></span>
                                                        {inp.stock_status === "deficit" ? (
                                                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 flex items-center gap-1">
                                                                <AlertTriangle className="w-3 h-3" /> Shortage: -{inp.shortage_quantity} {inp.unit}
                                                            </span>
                                                        ) : inp.stock_status === "low_stock" ? (
                                                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                                Low Stock: Reorder Soon
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" /> Stock Sufficient
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Participating Farmers Snippet */}
                                                    {inp.participating_farmers && inp.participating_farmers.length > 0 && (
                                                        <div className="pt-1.5 text-[10px] text-muted-foreground flex flex-wrap gap-1">
                                                            <span className="font-semibold text-foreground">Farmers:</span>
                                                            {inp.participating_farmers.map((pf, pfi) => (
                                                                <span key={pfi} className="bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-700">
                                                                    {pf.farmer_name} ({pf.acres} ac {pf.crop})
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* WEEK 2 CARD */}
                            {(selectedDemandWindow === "all" || selectedDemandWindow === "week_2") && (
                                <div className="bg-white dark:bg-zinc-900 rounded-xl border-2 border-orange-200 dark:border-orange-900/60 shadow-xs flex flex-col justify-between overflow-hidden">
                                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/30 border-b border-orange-200 dark:border-orange-900/50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-orange-600 text-white">
                                                Days 8 – 14
                                            </span>
                                            <span className="text-xs font-bold text-orange-700 dark:text-orange-400 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" /> Approaching Stage
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-extrabold text-foreground mt-2">
                                            Week 2: Approaching Input Window
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            👥 <strong>{demandData.time_windows.week_2.farmer_count} Farmers</strong> entering next critical phase
                                        </p>
                                    </div>

                                    <div className="p-4 space-y-3.5 flex-1">
                                        {demandData.time_windows.week_2.demanded_inputs.length === 0 ? (
                                            <p className="text-xs text-muted-foreground text-center py-6">No inputs required in Week 2</p>
                                        ) : (
                                            demandData.time_windows.week_2.demanded_inputs.map((inp, idx) => (
                                                <div 
                                                    key={`w2-inp-${idx}`}
                                                    className="p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 space-y-2"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <div className="text-xs font-bold text-foreground">{inp.input_name}</div>
                                                            <div className="text-[11px] text-muted-foreground">
                                                                Target crops: <strong className="text-foreground">{inp.crops_affected}</strong>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <div className="text-xs font-black text-foreground">
                                                                {inp.total_quantity_needed} {inp.unit}
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground">
                                                                {inp.farmers_count} farmers • {inp.total_acres} ac
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-200/50 dark:border-zinc-700/50">
                                                        <span className="text-muted-foreground">Store Stock: <strong>{inp.current_shop_stock}</strong></span>
                                                        {inp.stock_status === "deficit" ? (
                                                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                                                Shortage: -{inp.shortage_quantity} {inp.unit}
                                                            </span>
                                                        ) : inp.stock_status === "low_stock" ? (
                                                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                                Low Stock Alert
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                                Stock OK
                                                            </span>
                                                        )}
                                                    </div>

                                                    {inp.participating_farmers && inp.participating_farmers.length > 0 && (
                                                        <div className="pt-1.5 text-[10px] text-muted-foreground flex flex-wrap gap-1">
                                                            <span className="font-semibold text-foreground">Farmers:</span>
                                                            {inp.participating_farmers.map((pf, pfi) => (
                                                                <span key={pfi} className="bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-700">
                                                                    {pf.farmer_name} ({pf.acres} ac {pf.crop})
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* WEEKS 3-4 CARD */}
                            {(selectedDemandWindow === "all" || selectedDemandWindow === "weeks_3_4") && (
                                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-2xs flex flex-col justify-between overflow-hidden">
                                    <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/40 dark:to-cyan-950/30 border-b border-teal-200 dark:border-teal-900/50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-teal-600 text-white">
                                                Days 15 – 28
                                            </span>
                                            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1">
                                                <PackageCheck className="w-3.5 h-3.5" /> Advance Pipeline
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-extrabold text-foreground mt-2">
                                            Weeks 3–4: Advance Order Pipeline
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            👥 <strong>{demandData.time_windows.weeks_3_4.farmer_count} Farmers</strong> in upcoming crop lifecycle pipeline
                                        </p>
                                    </div>

                                    <div className="p-4 space-y-3.5 flex-1">
                                        {demandData.time_windows.weeks_3_4.demanded_inputs.length === 0 ? (
                                            <p className="text-xs text-muted-foreground text-center py-6">No inputs in pipeline</p>
                                        ) : (
                                            demandData.time_windows.weeks_3_4.demanded_inputs.map((inp, idx) => (
                                                <div 
                                                    key={`w3-inp-${idx}`}
                                                    className="p-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 space-y-2"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <div className="text-xs font-bold text-foreground">{inp.input_name}</div>
                                                            <div className="text-[11px] text-muted-foreground">
                                                                Target crops: <strong className="text-foreground">{inp.crops_affected}</strong>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <div className="text-xs font-black text-foreground">
                                                                {inp.total_quantity_needed} {inp.unit}
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground">
                                                                {inp.farmers_count} farmers • {inp.total_acres} ac
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-200/50 dark:border-zinc-700/50">
                                                        <span className="text-muted-foreground">Store Stock: <strong>{inp.current_shop_stock}</strong></span>
                                                        <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold">
                                                            Pre-order Window
                                                        </span>
                                                    </div>

                                                    {inp.participating_farmers && inp.participating_farmers.length > 0 && (
                                                        <div className="pt-1.5 text-[10px] text-muted-foreground flex flex-wrap gap-1">
                                                            <span className="font-semibold text-foreground">Farmers:</span>
                                                            {inp.participating_farmers.map((pf, pfi) => (
                                                                <span key={pfi} className="bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-700">
                                                                    {pf.farmer_name} ({pf.acres} ac {pf.crop})
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

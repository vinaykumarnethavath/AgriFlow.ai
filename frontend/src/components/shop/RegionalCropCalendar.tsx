"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    Calendar, Clock, Sprout, AlertCircle, CheckCircle2, ChevronDown, 
    ChevronUp, Sparkles, Droplets, ShieldAlert, ArrowRight, Filter, 
    Search, Layers, Flame, PackageCheck
} from "lucide-react";

export interface StageTimelineItem {
    name: string;
    start_day: number;
    end_day: number;
    description: string;
    recommended_inputs: string[];
    urgency: "critical" | "high" | "normal";
    status: "completed" | "current" | "upcoming";
}

export interface MatchedProduct {
    name: string;
    category: string;
    dosage?: string;
    timing?: string;
    company?: string;
}

export interface RegionalCrop {
    crop_name: string;
    total_acres: number;
    plot_count: number;
    color: string;
    current_stage: string;
    stage_description: string;
    stage_urgency: "critical" | "high" | "normal";
    progress_pct: number;
    days_since_sowing: number;
    days_to_harvest: number;
    is_harvest_ready: boolean;
    inputs_needed_now: string[];
    inputs_needed_next: string[];
    matched_products_now: MatchedProduct[];
    matched_products_next: MatchedProduct[];
    stage_timeline: StageTimelineItem[];
}

interface RegionalCropCalendarProps {
    crops?: RegionalCrop[];
    loading?: boolean;
    regionName?: string;
    totalAcres?: number;
    totalFarmers?: number;
    onSelectInput?: (inputName: string) => void;
}

export function RegionalCropCalendar({
    crops = [],
    loading = false,
    regionName = "Catchment Area",
    totalAcres = 0,
    totalFarmers = 0,
    onSelectInput
}: RegionalCropCalendarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [urgencyFilter, setUrgencyFilter] = useState<"all" | "critical" | "harvest_ready">("all");
    const [expandedCrop, setExpandedCrop] = useState<string | null>(null);

    const filteredCrops = useMemo(() => {
        return crops.filter(c => {
            const matchesSearch = c.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.current_stage.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.inputs_needed_now.some(inp => inp.toLowerCase().includes(searchQuery.toLowerCase()));

            if (!matchesSearch) return false;

            if (urgencyFilter === "critical") {
                return c.stage_urgency === "critical" || c.stage_urgency === "high";
            }
            if (urgencyFilter === "harvest_ready") {
                return c.is_harvest_ready;
            }
            return true;
        });
    }, [crops, searchQuery, urgencyFilter]);

    const stats = useMemo(() => {
        const criticalCount = crops.filter(c => c.stage_urgency === "critical").length;
        const harvestCount = crops.filter(c => c.is_harvest_ready).length;
        const activeCount = crops.length;
        return { criticalCount, harvestCount, activeCount };
    }, [crops]);

    const getUrgencyBadge = (urgency: string, isHarvest: boolean) => {
        if (isHarvest) {
            return (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    🌾 Harvest Window
                </span>
            );
        }
        switch (urgency) {
            case "critical":
                return (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
                        <Flame className="w-3 h-3 text-red-600 dark:text-red-400" />
                        Peak Input Stage
                    </span>
                );
            case "high":
                return (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                        <AlertCircle className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                        High Demand
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Active Growth
                    </span>
                );
        }
    };

    return (
        <Card className="border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-zinc-900 border-b border-gray-100 dark:border-zinc-800 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/20">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-xl font-bold">Regional Crop Calendar & Growth Stages</CardTitle>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                                    {regionName}
                                </span>
                            </div>
                            <CardDescription className="text-xs mt-0.5">
                                Live stage tracking for {crops.length} standing crop varieties across {totalAcres.toLocaleString()} acres. Know exactly what inputs farmers need right now.
                            </CardDescription>
                        </div>
                    </div>

                    {/* Quick Stats Pill */}
                    <div className="flex items-center gap-2 self-start md:self-auto text-xs">
                        <div className="bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-xs">
                            <span className="text-muted-foreground">Total Standing: </span>
                            <span className="font-bold text-foreground">{totalAcres.toLocaleString()} ac</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 shadow-xs text-red-700 dark:text-red-400 font-semibold">
                            <span>⚡ {stats.criticalCount} Peak Stages</span>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/80">
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by crop, stage, or fertilizer..."
                            className="w-full text-xs pl-9 pr-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        <button
                            onClick={() => setUrgencyFilter("all")}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                                urgencyFilter === "all"
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : "bg-gray-100 dark:bg-zinc-800 text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            All Crops ({crops.length})
                        </button>
                        <button
                            onClick={() => setUrgencyFilter("critical")}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                                urgencyFilter === "critical"
                                    ? "bg-red-600 text-white shadow-xs"
                                    : "bg-gray-100 dark:bg-zinc-800 text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            ⚡ Needs Top-Dress / Protection ({stats.criticalCount})
                        </button>
                        <button
                            onClick={() => setUrgencyFilter("harvest_ready")}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                                urgencyFilter === "harvest_ready"
                                    ? "bg-amber-600 text-white shadow-xs"
                                    : "bg-gray-100 dark:bg-zinc-800 text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            🌾 Pre-Harvest ({stats.harvestCount})
                        </button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-gray-100 dark:divide-zinc-800">
                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin h-8 w-8 border-3 border-emerald-500 border-t-transparent rounded-full" />
                    </div>
                ) : filteredCrops.length === 0 ? (
                    <div className="text-center py-14 text-muted-foreground">
                        <Sprout className="w-10 h-10 text-gray-300 dark:text-zinc-600 mx-auto mb-2" />
                        <p className="font-semibold text-sm">No crops match your search query</p>
                        <p className="text-xs mt-1">Try searching for a different crop name or reset the filters.</p>
                    </div>
                ) : (
                    filteredCrops.map((crop) => {
                        const isExpanded = expandedCrop === crop.crop_name;
                        return (
                            <div 
                                key={crop.crop_name} 
                                className={`transition-colors duration-150 ${isExpanded ? "bg-emerald-50/20 dark:bg-zinc-800/40" : "hover:bg-gray-50/70 dark:hover:bg-zinc-800/20"}`}
                            >
                                <div className="p-4 sm:p-5">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        {/* Crop Info & Stage */}
                                        <div className="flex items-start gap-3.5 min-w-[280px]">
                                            <div 
                                                className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0 text-sm"
                                                style={{ backgroundColor: crop.color }}
                                            >
                                                {crop.crop_name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h3 className="font-bold text-base text-foreground">{crop.crop_name}</h3>
                                                    {getUrgencyBadge(crop.stage_urgency, crop.is_harvest_ready)}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span><strong className="text-foreground">{crop.total_acres.toLocaleString()}</strong> Acres</span>
                                                    <span>•</span>
                                                    <span><strong className="text-foreground">{crop.plot_count}</strong> Farm Plots</span>
                                                    <span>•</span>
                                                    <span>Day <strong className="text-foreground">{crop.days_since_sowing}</strong> of cycle</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stage Progress Bar */}
                                        <div className="flex-1 max-w-md">
                                            <div className="flex items-center justify-between text-xs mb-1.5">
                                                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                                                    Current Stage: {crop.current_stage}
                                                </span>
                                                <span className="text-muted-foreground font-semibold">
                                                    {crop.days_to_harvest > 0 ? (
                                                        <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" /> {crop.days_to_harvest} days to harvest
                                                        </span>
                                                    ) : (
                                                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                                            🌾 Ready for Harvest
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                            
                                            <div className="relative h-2.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full transition-all duration-700 ease-out"
                                                    style={{ 
                                                        width: `${Math.min(100, Math.max(5, crop.progress_pct))}%`,
                                                        backgroundColor: crop.color 
                                                    }}
                                                />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                                                {crop.stage_description}
                                            </p>
                                        </div>

                                        {/* Inputs Needed Tags & Toggle */}
                                        <div className="flex items-center justify-between lg:justify-end gap-3 min-w-[240px]">
                                            <div className="flex flex-col items-start lg:items-end">
                                                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">
                                                    Inputs Needed Right Now
                                                </span>
                                                <div className="flex flex-wrap gap-1 lg:justify-end">
                                                    {crop.inputs_needed_now.length > 0 ? (
                                                        crop.inputs_needed_now.slice(0, 3).map((inp, i) => (
                                                            <span 
                                                                key={i} 
                                                                onClick={() => onSelectInput && onSelectInput(inp)}
                                                                className="cursor-pointer text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
                                                            >
                                                                {inp}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">
                                                            Maturity stage – no chemicals
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setExpandedCrop(isExpanded ? null : crop.crop_name)}
                                                className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-700 transition-colors"
                                                title={isExpanded ? "Collapse Timeline" : "View Full Lifecycle Timeline"}
                                            >
                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Lifecycle Timeline & Catalog Products */}
                                    {isExpanded && (
                                        <div className="mt-5 pt-4 border-t border-gray-200 dark:border-zinc-700/80 space-y-4 animate-in fade-in-50 duration-200">
                                            
                                            {/* Stage Timeline Progression */}
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                                                    Agronomic Lifecycle Progression (Sowing to Harvest)
                                                </h4>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                                                    {crop.stage_timeline.map((st, sIdx) => {
                                                        const isCurrent = st.status === "current";
                                                        const isDone = st.status === "completed";
                                                        return (
                                                            <div 
                                                                key={sIdx}
                                                                className={`p-3 rounded-xl border text-xs transition-all ${
                                                                    isCurrent 
                                                                        ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-xs ring-2 ring-emerald-500/20"
                                                                        : isDone
                                                                        ? "bg-gray-50/80 dark:bg-zinc-800/40 border-gray-200 dark:border-zinc-700 opacity-80"
                                                                        : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 opacity-60"
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between mb-1.5">
                                                                    <span className="text-[10px] font-bold text-gray-500">
                                                                        Day {st.start_day}–{st.end_day}
                                                                    </span>
                                                                    {isCurrent ? (
                                                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-600 text-white uppercase">
                                                                            Active Now
                                                                        </span>
                                                                    ) : isDone ? (
                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                                    ) : (
                                                                        <span className="text-[9px] text-gray-400 font-medium">Upcoming</span>
                                                                    )}
                                                                </div>
                                                                <h5 className={`font-bold mb-1 ${isCurrent ? "text-emerald-950 dark:text-emerald-200" : "text-foreground"}`}>
                                                                    {st.name}
                                                                </h5>
                                                                <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2">
                                                                    {st.description}
                                                                </p>
                                                                {st.recommended_inputs.length > 0 && (
                                                                    <div className="mt-auto pt-1 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap gap-1">
                                                                        {st.recommended_inputs.slice(0, 2).map((inp, idx) => (
                                                                            <span key={idx} className="text-[9px] font-semibold bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">
                                                                                {inp}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Products Available in Catalog for Current & Upcoming Stage */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                                {/* Current Stage Products */}
                                                <div className="bg-white dark:bg-zinc-900 rounded-xl p-3.5 border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
                                                    <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                                                        <PackageCheck className="w-4 h-4 text-emerald-600" />
                                                        Catalog Products For Immediate Stocking ({crop.current_stage})
                                                    </h5>
                                                    <div className="space-y-2">
                                                        {crop.matched_products_now.length > 0 ? (
                                                            crop.matched_products_now.map((p, pIdx) => (
                                                                <div key={pIdx} className="p-2.5 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between text-xs">
                                                                    <div>
                                                                        <span className="font-bold text-foreground block">{p.name}</span>
                                                                        <span className="text-[11px] text-muted-foreground">{p.company} • {p.dosage || "Standard Dose"}</span>
                                                                    </div>
                                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                                                                        {p.category}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground italic">No specialized inputs required at this stage.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Upcoming Stage Products */}
                                                <div className="bg-white dark:bg-zinc-900 rounded-xl p-3.5 border border-amber-100 dark:border-amber-900/40 shadow-xs">
                                                    <h5 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4 text-amber-600" />
                                                        Pre-Order For Next Stage (Upcoming in 2–4 Weeks)
                                                    </h5>
                                                    <div className="space-y-2">
                                                        {crop.matched_products_next.length > 0 ? (
                                                            crop.matched_products_next.map((p, pIdx) => (
                                                                <div key={pIdx} className="p-2.5 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-between text-xs">
                                                                    <div>
                                                                        <span className="font-bold text-foreground block">{p.name}</span>
                                                                        <span className="text-[11px] text-muted-foreground">{p.company} • {p.dosage || "Pre-stage"}</span>
                                                                    </div>
                                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                                                                        Order Ahead
                                                                    </span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground italic">Final ripening stage approaching. Focus on harvest equipment & bags.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}

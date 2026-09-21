"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    Lightbulb, Leaf, ShieldAlert, Sparkles, TrendingUp, Package, 
    ShoppingCart, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, 
    ArrowRight, Droplet, Factory, Flame, Clock, Beaker, Check, Compass
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface ContributingCrop {
    crop: string;
    acres: number;
    stage?: string;
    urgency?: string;
}

export interface Recommendation {
    id: string;
    productName: string;
    genericName?: string;
    company?: string;
    category: string;
    subCategory?: string;
    unit: string;
    composition?: string;
    color: string;
    urgencyWindow: string;
    urgencyLevel: string;
    timeframe?: string; // "Need NOW", "Next 2-4 weeks", "Post-Harvest", "Sowing Window"
    confidence: number;
    targetMaintainStock: number;
    safetyBuffer: number;
    currentStock: number;
    reorderQuantity: number;
    stockStatus: 'critical' | 'low' | 'optimal' | 'surplus';
    reason: string;
    dosagePerAcre?: string;
    applicationTiming?: string;
    applicationMethod?: string;
    keyBenefits?: string;
    contributingCrops: ContributingCrop[];
    matchedProductIds: number[];
}

export function PredictiveStockingWidget({
    baseRecs = [],
    loading = false,
    activeArea = 0,
    pastArea = 0
}: {
    baseRecs?: Recommendation[];
    loading?: boolean;
    activeArea?: number;
    pastArea?: number;
}) {
    const { t } = useLanguage();
    const [filter, setFilter] = useState<string>("all");
    const [expandedRecId, setExpandedRecId] = useState<string | null>(null);

    const filteredRecs = useMemo(() => {
        if (!baseRecs) return [];
        if (filter === "now") {
            return baseRecs.filter(r => r.timeframe === "Need NOW");
        }
        if (filter === "upcoming") {
            return baseRecs.filter(r => r.timeframe === "Next 2-4 weeks");
        }
        if (filter === "urgent") {
            return baseRecs.filter(r => r.stockStatus === 'critical' || r.stockStatus === 'low');
        }
        if (filter === "fertilizers") {
            return baseRecs.filter(r => r.category.toLowerCase().includes('fertilizer'));
        }
        if (filter === "protection") {
            return baseRecs.filter(r => r.category.toLowerCase().includes('protection') || r.category.toLowerCase().includes('pesticide') || r.category.toLowerCase().includes('fungicide') || r.category.toLowerCase().includes('herbicide'));
        }
        return baseRecs;
    }, [baseRecs, filter]);

    const kpis = useMemo(() => {
        if (!baseRecs) return { totalTarget: 0, immediateOrder: 0, criticalCount: 0, needNowCount: 0 };
        return {
            totalTarget: baseRecs.reduce((sum, r) => sum + r.targetMaintainStock, 0),
            immediateOrder: baseRecs.reduce((sum, r) => sum + r.reorderQuantity, 0),
            criticalCount: baseRecs.filter(r => r.stockStatus === 'critical').length,
            needNowCount: baseRecs.filter(r => r.timeframe === 'Need NOW').length
        };
    }, [baseRecs]);

    const getIcon = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('seed')) return <Leaf className="w-5 h-5" />;
        if (cat.includes('protection') || cat.includes('pesticide') || cat.includes('fungicide') || cat.includes('herbicide')) return <ShieldAlert className="w-5 h-5" />;
        if (cat.includes('fertilizer')) return <Factory className="w-5 h-5" />;
        return <Package className="w-5 h-5" />;
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'critical': return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900";
            case 'low': return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900";
            case 'optimal': return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900";
            case 'surplus': return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'critical': return <AlertCircle className="w-3.5 h-3.5" />;
            case 'low': return <AlertCircle className="w-3.5 h-3.5" />;
            case 'optimal': return <CheckCircle2 className="w-3.5 h-3.5" />;
            case 'surplus': return <Package className="w-3.5 h-3.5" />;
            default: return null;
        }
    };

    const getTimeframePill = (timeframe?: string) => {
        switch (timeframe) {
            case "Need NOW":
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border border-red-200 dark:border-red-800">
                        <Flame className="w-3 h-3 text-red-600 dark:text-red-400 animate-pulse" />
                        NEED NOW
                    </span>
                );
            case "Next 2-4 weeks":
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        NEXT 2-4 WEEKS
                    </span>
                );
            case "Post-Harvest":
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        <Droplet className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        SOIL RECOVERY
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Leaf className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        SOWING BASAL
                    </span>
                );
        }
    };

    const getProgressBar = (rec: Recommendation) => {
        const totalBarMax = Math.max(rec.targetMaintainStock * 1.5, rec.currentStock, 1);
        const currentPct = Math.min((rec.currentStock / totalBarMax) * 100, 100);
        const targetPct = Math.min((rec.targetMaintainStock / totalBarMax) * 100, 100);
        
        let barColor = "bg-emerald-500";
        if (rec.stockStatus === 'critical') barColor = "bg-red-500";
        if (rec.stockStatus === 'low') barColor = "bg-orange-500";
        if (rec.stockStatus === 'surplus') barColor = "bg-blue-500";

        return (
            <div className="mt-3">
                <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-gray-600 dark:text-gray-400">
                        In Store: <span className="font-bold text-foreground">{rec.currentStock} {rec.unit.split(' ')[0]}</span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                        Stage Target: <span className="font-bold text-foreground">{rec.targetMaintainStock} {rec.unit.split(' ')[0]}</span>
                    </span>
                </div>
                <div className="relative h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    {/* Target Marker Background */}
                    <div 
                        className="absolute top-0 bottom-0 bg-gray-200/60 dark:bg-zinc-700 border-r-2 border-emerald-600 dark:border-emerald-400 transition-all duration-500"
                        style={{ width: `${targetPct}%` }}
                    />
                    {/* Current Stock Bar */}
                    <div 
                        className={`absolute top-0 bottom-0 left-0 rounded-full ${barColor} transition-all duration-700 ease-out`}
                        style={{ width: `${currentPct}%` }}
                    />
                </div>
            </div>
        );
    };

    return (
        <Card className="h-full border-emerald-100 dark:border-emerald-900/30 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-zinc-900 border-b border-emerald-100 dark:border-emerald-900/50 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl shadow-sm text-emerald-700 dark:text-emerald-400">
                            <Lightbulb className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg text-emerald-950 dark:text-emerald-50 font-bold">Stage-Aware Stocking Intelligence</CardTitle>
                            <CardDescription className="text-xs text-emerald-700/70 dark:text-emerald-400/70">
                                Real catalog recommendations based on {activeArea > 0 ? `${activeArea.toLocaleString()}ac` : 'regional'} standing crops and soil depletion
                            </CardDescription>
                        </div>
                    </div>
                </div>

                {/* KPI Ribbon */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                    <div className="bg-white dark:bg-zinc-800/80 rounded-lg p-2.5 border border-gray-100 dark:border-zinc-800 shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Target Inventory</p>
                        <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">{kpis.totalTarget.toLocaleString()} <span className="text-[11px] font-normal text-gray-500">units</span></p>
                    </div>
                    <div className="bg-white dark:bg-zinc-800/80 rounded-lg p-2.5 border border-orange-100 dark:border-orange-900/30 shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-orange-600 mb-0.5">Deficit / Reorder</p>
                        <p className="text-base sm:text-lg font-bold text-orange-700 dark:text-orange-400">+{kpis.immediateOrder.toLocaleString()} <span className="text-[11px] font-normal text-orange-600/70">units</span></p>
                    </div>
                    <div className="bg-white dark:bg-zinc-800/80 rounded-lg p-2.5 border border-red-100 dark:border-red-900/30 shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-red-600 mb-0.5">Critical Stockouts</p>
                        <p className="text-base sm:text-lg font-bold text-red-700 dark:text-red-400">{kpis.criticalCount}</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-800/80 rounded-lg p-2.5 border border-emerald-100 dark:border-emerald-900/30 shadow-xs">
                        <p className="text-[10px] uppercase font-bold text-emerald-600 mb-0.5">⚡ Need Right Now</p>
                        <p className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400">{kpis.needNowCount}</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                    {[
                        { id: 'all', label: 'All Items' },
                        { id: 'now', label: '⚡ Need NOW' },
                        { id: 'upcoming', label: '⏳ Next 2-4 Weeks' },
                        { id: 'fertilizers', label: '🌱 Fertilizers' },
                        { id: 'protection', label: '🛡️ Crop Protection' },
                        { id: 'urgent', label: '⚠️ Urgent Stockouts' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
                                filter === f.id 
                                ? 'bg-emerald-600 text-white shadow-xs' 
                                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 px-4 bg-gray-50/30 dark:bg-zinc-950/30 min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin h-8 w-8 border-3 border-emerald-500 border-t-transparent rounded-full" />
                    </div>
                ) : filteredRecs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <div className="bg-gray-100 dark:bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <p className="font-medium text-sm">No items found for this filter.</p>
                        <p className="text-xs mt-1">Your inventory looks healthy for this timeline.</p>
                    </div>
                ) : (
                    filteredRecs.map((rec) => {
                        const isExpanded = expandedRecId === rec.id;
                        return (
                            <div key={rec.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xs overflow-hidden transition-all hover:border-emerald-300 dark:hover:border-emerald-700">
                                {/* Main Card View */}
                                <div className="p-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex gap-3">
                                            <div className={`p-2.5 rounded-lg h-min ${rec.color} flex-shrink-0`}>
                                                {getIcon(rec.category)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h4 className="font-bold text-foreground text-sm sm:text-base">{rec.productName}</h4>
                                                    {getTimeframePill(rec.timeframe)}
                                                    <span className="text-[10px] font-bold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                                        {rec.category}
                                                    </span>
                                                </div>

                                                {rec.company && (
                                                    <p className="text-[11px] text-muted-foreground mb-1.5">
                                                        {rec.company} {rec.composition ? `• ${rec.composition}` : ''}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
                                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${getStatusStyle(rec.stockStatus)}`}>
                                                        {getStatusIcon(rec.stockStatus)}
                                                        {rec.stockStatus === 'critical' ? 'Out of Stock' : rec.stockStatus === 'low' ? 'Low Stock' : rec.stockStatus === 'optimal' ? 'Optimal' : 'Surplus'}
                                                    </span>
                                                    <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                                                        {rec.confidence}% Match
                                                    </span>
                                                    {rec.dosagePerAcre && (
                                                        <span className="text-gray-500 dark:text-gray-400 text-[11px] font-normal hidden sm:inline">
                                                            Dose: {rec.dosagePerAcre.split(';')[0]}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">Need to Order</div>
                                            <div className={`text-lg sm:text-xl font-black ${rec.reorderQuantity > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                {rec.reorderQuantity > 0 ? `+${rec.reorderQuantity.toLocaleString()}` : '0'} <span className="text-xs font-semibold">{rec.unit.split(' ')[0]}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {getProgressBar(rec)}

                                    <div className="mt-4 flex justify-between items-center border-t border-gray-100 dark:border-zinc-800 pt-3">
                                        <button 
                                            onClick={() => setExpandedRecId(isExpanded ? null : rec.id)}
                                            className="text-xs font-semibold text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                                        >
                                            {isExpanded ? 'Hide Agronomic Intelligence' : 'View Agronomic Intelligence'}
                                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        </button>

                                        {rec.reorderQuantity > 0 ? (
                                            <button className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors">
                                                <ShoppingCart className="w-3.5 h-3.5" /> Stock +{rec.reorderQuantity.toLocaleString()} {rec.unit.split(' ')[0]}
                                            </button>
                                        ) : (
                                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Stock Adequate
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Agronomic & Lifecycle Drawer */}
                                {isExpanded && (
                                    <div className="bg-gray-50/70 dark:bg-zinc-900/60 p-4 border-t border-gray-200 dark:border-zinc-800 text-xs space-y-4">
                                        
                                        {/* Crop Drivers & Active Stages */}
                                        <div>
                                            <h5 className="text-[11px] font-bold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                                                <SproutIcon className="w-3.5 h-3.5 text-emerald-600" /> Standing Crops Driving This Demand
                                            </h5>
                                            <div className="flex flex-wrap gap-2">
                                                {rec.contributingCrops && rec.contributingCrops.length > 0 ? (
                                                    rec.contributingCrops.map((c, i) => (
                                                        <span key={i} className="text-xs font-medium bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-2.5 py-1 rounded-md text-gray-700 dark:text-gray-300 shadow-2xs">
                                                            <strong>{c.crop}</strong>: <span className="font-bold text-emerald-600 dark:text-emerald-400">{c.acres.toLocaleString()} ac</span>
                                                            {c.stage && <span className="text-muted-foreground ml-1">({c.stage})</span>}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-500 italic">No standing crops requiring this in the current week.</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Agronomic Dosage & Application Protocol from Excel Catalog */}
                                        {(rec.dosagePerAcre || rec.applicationTiming || rec.keyBenefits) && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-zinc-800 p-3 rounded-lg border border-gray-200 dark:border-zinc-700">
                                                {rec.dosagePerAcre && (
                                                    <div>
                                                        <span className="font-bold text-gray-500 uppercase text-[10px] block mb-0.5">Recommended Dosage</span>
                                                        <span className="font-semibold text-foreground text-xs">{rec.dosagePerAcre}</span>
                                                    </div>
                                                )}
                                                {rec.applicationTiming && (
                                                    <div>
                                                        <span className="font-bold text-gray-500 uppercase text-[10px] block mb-0.5">Application Timing</span>
                                                        <span className="font-semibold text-foreground text-xs">{rec.applicationTiming}</span>
                                                    </div>
                                                )}
                                                {rec.keyBenefits && (
                                                    <div className="sm:col-span-2 pt-2 border-t border-gray-100 dark:border-zinc-700/60">
                                                        <span className="font-bold text-gray-500 uppercase text-[10px] block mb-0.5">Key Agronomic Benefit</span>
                                                        <span className="text-muted-foreground text-xs">{rec.keyBenefits}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* AI Stage Explanation */}
                                        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                                            <h5 className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase mb-1 flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Growth-Stage & Depletion Analysis
                                            </h5>
                                            <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                                                {rec.reason}
                                            </p>
                                        </div>

                                        {/* Urgency Window */}
                                        <div className="flex justify-between items-center pt-1">
                                            <div className="flex items-center gap-1.5 font-semibold text-gray-600 dark:text-gray-400">
                                                <Compass className="w-4 h-4 text-emerald-600" />
                                                Demand Driver: <span className="text-foreground">{rec.urgencyWindow}</span>
                                            </div>
                                            <button className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1">
                                                Order From Wholesaler <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>

                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}

function SproutIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M7 20h10" />
            <path d="M10 20c5.5-2.5.8-6.4 3-10" />
            <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
            <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
        </svg>
    );
}

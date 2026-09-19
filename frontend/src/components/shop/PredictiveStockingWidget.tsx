"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    Lightbulb, Leaf, ShieldAlert, Sparkles, TrendingUp, Package, 
    ShoppingCart, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, 
    ArrowRight, Droplet, Factory
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Recommendation {
    id: string;
    productName: string;
    category: string;
    unit: string;
    color: string;
    urgencyWindow: string;
    urgencyLevel: string;
    confidence: number;
    targetMaintainStock: number;
    safetyBuffer: number;
    currentStock: number;
    reorderQuantity: number;
    stockStatus: 'critical' | 'low' | 'optimal' | 'surplus';
    reason: string;
    contributingCrops: { crop: string; acres: number }[];
    matchedProductIds: number[];
}

export function PredictiveStockingWidget({ baseRecs = [], loading = false, activeArea = 0, pastArea = 0 }: { baseRecs?: Recommendation[], loading?: boolean, activeArea?: number, pastArea?: number }) {
    const { t } = useLanguage();
    const [filter, setFilter] = useState<string>("all");
    const [expandedRecId, setExpandedRecId] = useState<string | null>(null);

    const filteredRecs = useMemo(() => {
        if (!baseRecs) return [];
        if (filter === "urgent") {
            return baseRecs.filter(r => r.stockStatus === 'critical' || r.stockStatus === 'low');
        }
        if (filter === "fertilizers") {
            return baseRecs.filter(r => r.category.toLowerCase().includes('fertilizer'));
        }
        if (filter === "seeds") {
            return baseRecs.filter(r => r.category.toLowerCase().includes('seed'));
        }
        if (filter === "protection") {
            return baseRecs.filter(r => r.category.toLowerCase().includes('protection') || r.category.toLowerCase().includes('pesticide'));
        }
        return baseRecs;
    }, [baseRecs, filter]);

    const kpis = useMemo(() => {
        if (!baseRecs) return { totalTarget: 0, immediateOrder: 0, criticalCount: 0 };
        return {
            totalTarget: baseRecs.reduce((sum, r) => sum + r.targetMaintainStock, 0),
            immediateOrder: baseRecs.reduce((sum, r) => sum + r.reorderQuantity, 0),
            criticalCount: baseRecs.filter(r => r.stockStatus === 'critical').length
        };
    }, [baseRecs]);

    const getIcon = (category: string) => {
        const cat = category.toLowerCase();
        if (cat.includes('seed')) return <Leaf className="w-5 h-5" />;
        if (cat.includes('protection') || cat.includes('pesticide')) return <ShieldAlert className="w-5 h-5" />;
        if (cat.includes('fertilizer')) return <Factory className="w-5 h-5" />;
        return <Package className="w-5 h-5" />;
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'critical': return "bg-red-50 text-red-700 border-red-200";
            case 'low': return "bg-orange-50 text-orange-700 border-orange-200";
            case 'optimal': return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case 'surplus': return "bg-blue-50 text-blue-700 border-blue-200";
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
                        Current: <span className="font-bold text-foreground">{rec.currentStock} {rec.unit.split(' ')[0]}</span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                        Maintain Target: <span className="font-bold text-foreground">{rec.targetMaintainStock} {rec.unit.split(' ')[0]}</span>
                    </span>
                </div>
                <div className="relative h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    {/* Target Marker Background */}
                    <div 
                        className="absolute top-0 bottom-0 bg-gray-200/60 dark:bg-zinc-700 border-r border-gray-300 dark:border-zinc-600 transition-all duration-500"
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
                            <CardTitle className="text-lg text-emerald-950 dark:text-emerald-50 font-bold">Predictive Stocking</CardTitle>
                            <CardDescription className="text-xs text-emerald-700/70 dark:text-emerald-400/70">
                                AI-driven targets based on {activeArea > 0 ? `${activeArea.toLocaleString()}ac` : 'regional'} active crops & past rotations
                            </CardDescription>
                        </div>
                    </div>
                </div>

                {/* KPI Ribbon */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-white dark:bg-zinc-800/80 rounded-lg p-2.5 border border-gray-100 dark:border-zinc-800 shadow-sm">
                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-0.5">Target Inventory</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{kpis.totalTarget.toLocaleString()} <span className="text-xs font-normal text-gray-500">units</span></p>
                    </div>
                    <div className="bg-white dark:bg-zinc-800/80 rounded-lg p-2.5 border border-orange-100 dark:border-orange-900/30 shadow-sm">
                        <p className="text-[10px] uppercase font-bold text-orange-600 mb-0.5">Deficit / Reorder</p>
                        <p className="text-lg font-bold text-orange-700 dark:text-orange-400">+{kpis.immediateOrder.toLocaleString()} <span className="text-xs font-normal text-orange-600/70">units</span></p>
                    </div>
                    <div className="bg-white dark:bg-zinc-800/80 rounded-lg p-2.5 border border-red-100 dark:border-red-900/30 shadow-sm">
                        <p className="text-[10px] uppercase font-bold text-red-600 mb-0.5">Critical Stockouts</p>
                        <p className="text-lg font-bold text-red-700 dark:text-red-400">{kpis.criticalCount}</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                    {[
                        { id: 'all', label: 'All Items' },
                        { id: 'urgent', label: '⚠️ Urgent Reorders' },
                        { id: 'fertilizers', label: '🌱 Fertilizers' },
                        { id: 'seeds', label: '🌾 Seeds' },
                        { id: 'protection', label: '🛡️ Crop Protection' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                                filter === f.id 
                                ? 'bg-emerald-600 text-white shadow-sm' 
                                : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
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
                        <p className="text-xs mt-1">Your inventory looks healthy here.</p>
                    </div>
                ) : (
                    filteredRecs.map((rec) => {
                        const isExpanded = expandedRecId === rec.id;
                        return (
                            <div key={rec.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-all hover:border-emerald-200 dark:hover:border-emerald-800">
                                {/* Main Card View */}
                                <div className="p-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex gap-3">
                                            <div className={`p-2.5 rounded-lg h-min ${rec.color} flex-shrink-0`}>
                                                {getIcon(rec.category)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-foreground">{rec.productName}</h4>
                                                    <span className="text-[10px] font-bold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                                        {rec.category}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-semibold">
                                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${getStatusStyle(rec.stockStatus)}`}>
                                                        {getStatusIcon(rec.stockStatus)}
                                                        {rec.stockStatus === 'critical' ? 'Out of Stock' : rec.stockStatus === 'low' ? 'Low Stock' : rec.stockStatus === 'optimal' ? 'Optimal' : 'Surplus'}
                                                    </span>
                                                    <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                                                        {rec.confidence}% Match
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Need to Order</div>
                                            <div className={`text-xl font-black ${rec.reorderQuantity > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                {rec.reorderQuantity > 0 ? `+${rec.reorderQuantity}` : '0'} <span className="text-xs font-semibold">{rec.unit.split(' ')[0]}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {getProgressBar(rec)}

                                    <div className="mt-4 flex justify-between items-center border-t border-gray-100 dark:border-zinc-800 pt-3">
                                        <button 
                                            onClick={() => setExpandedRecId(isExpanded ? null : rec.id)}
                                            className="text-xs font-semibold text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                                        >
                                            {isExpanded ? 'Hide AI Analysis' : 'View AI Analysis'}
                                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        </button>

                                        {rec.reorderQuantity > 0 ? (
                                            <button className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors">
                                                <ShoppingCart className="w-3.5 h-3.5" /> Buy {rec.reorderQuantity} Units
                                            </button>
                                        ) : (
                                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Stock Adequate
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Agronomic Drawer */}
                                {isExpanded && (
                                    <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 border-t border-gray-200 dark:border-zinc-800 text-sm space-y-4">
                                        
                                        {/* Crop Drivers */}
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1.5">
                                                <SproutIcon className="w-3.5 h-3.5" /> Active Standing Crops (Demand Drivers)
                                            </h5>
                                            <div className="flex flex-wrap gap-2">
                                                {rec.contributingCrops.length > 0 ? (
                                                    rec.contributingCrops.map((c, i) => (
                                                        <span key={i} className="text-xs font-medium bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-2 py-1 rounded-md text-gray-700 dark:text-gray-300 shadow-sm">
                                                            {c.crop}: <span className="font-bold text-emerald-600 dark:text-emerald-400">{c.acres.toLocaleString()} ac</span>
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-500">No active crops requiring this directly right now.</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* AI Reason & Rotation */}
                                        <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                            <h5 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase mb-1.5 flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5" /> AI Rotation Insight
                                            </h5>
                                            <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                                                {rec.reason}
                                            </p>
                                        </div>

                                        {/* Timing */}
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                <Droplet className="w-4 h-4 text-blue-500" />
                                                Seasonal Urgency: <span className="text-foreground">{rec.urgencyWindow}</span>
                                            </div>
                                            <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                                                Search Suppliers <ArrowRight className="w-3 h-3" />
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
    )
}

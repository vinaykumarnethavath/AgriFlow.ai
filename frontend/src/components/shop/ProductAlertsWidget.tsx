"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Factory, Leaf, ShieldCheck, ChevronRight, Check, Star, Target, Droplets } from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface ProductAlert {
    id: string;
    productName: string;
    manufacturer: string;
    type: string;
    highlights: string[];
    priceHint: string;
    isNew: boolean;
    iconType: string;
    target_crops: string[];
    fieldEffect: string;
    rating: number;
    matchedAcreage?: number;
    matchedCrops?: { crop: string; area: number }[];
    details?: {
        photo?: string;
        crops: string[];
        conditions: string[];
        description: string;
    };
}

export function ProductAlertsWidget({ alerts = [], loading = false }: { alerts?: ProductAlert[], loading?: boolean }) {
    const [selectedAlert, setSelectedAlert] = useState<ProductAlert | null>(null);

    const getIcon = (type: string) => {
        if (type === "leaf") return <Leaf className="w-4 h-4 text-emerald-600" />;
        if (type === "shield") return <ShieldCheck className="w-4 h-4 text-blue-600" />;
        if (type === "sparkles") return <Sparkles className="w-4 h-4 text-amber-600" />;
        return <Factory className="w-4 h-4 text-indigo-600" />;
    };

    return (
        <Card className="h-full border-indigo-100 dark:border-indigo-900/30 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-50/80 to-white dark:from-indigo-950/20 dark:to-zinc-900 border-b border-indigo-100 dark:border-indigo-900/50 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl shadow-sm text-indigo-700 dark:text-indigo-400">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg text-indigo-950 dark:text-indigo-50 font-bold">Smart Product Discovery</CardTitle>
                        <CardDescription className="text-xs text-indigo-700/70 dark:text-indigo-400/70">
                            High-efficacy inputs matched to your region's active crops
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 px-4 bg-gray-50/30 dark:bg-zinc-950/30 min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin h-8 w-8 border-3 border-indigo-500 border-t-transparent rounded-full" />
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <div className="bg-gray-100 dark:bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Leaf className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="font-medium text-sm">No specific product alerts.</p>
                        <p className="text-xs mt-1">We couldn't find matching new products for the current season.</p>
                    </div>
                ) : (
                    alerts.map((alert) => (
                        <div 
                            key={alert.id} 
                            className="relative p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all group cursor-pointer overflow-hidden"
                            onClick={() => setSelectedAlert(alert)}
                        >
                            {alert.isNew && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider shadow-sm z-10">
                                    New Arrival
                                </div>
                            )}
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-foreground text-base group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{alert.productName}</h4>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                        <Factory className="w-3 h-3" /> {alert.manufacturer}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-zinc-800 p-2 rounded-lg border border-gray-100 dark:border-zinc-700">
                                    {getIcon(alert.iconType)}
                                </div>
                            </div>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-3 mt-3">
                                {alert.highlights.map((highlight, idx) => (
                                    <span key={idx} className="text-[10px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full border border-gray-200 dark:border-zinc-700">
                                        {highlight}
                                    </span>
                                ))}
                            </div>

                            {/* Crop Matching Indicator */}
                            {alert.matchedCrops && alert.matchedCrops.length > 0 && (
                                <div className="mb-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-2 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-1">
                                        <Target className="w-3.5 h-3.5" /> High Demand Potential in your area
                                    </div>
                                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-tight">
                                        Matches <span className="font-bold text-indigo-600 dark:text-indigo-400">{(alert.matchedAcreage || 0).toLocaleString()} acres</span> of active crops (e.g. {alert.matchedCrops.slice(0, 2).map(c => c.crop).join(', ')}).
                                    </p>
                                </div>
                            )}

                            {/* Field Effect & Reviews */}
                            {alert.fieldEffect && (
                                <div className="mb-3 flex items-start gap-2 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-100/50 dark:border-amber-900/30">
                                    <div className="mt-0.5 flex-shrink-0">
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-amber-900 dark:text-amber-200 font-medium leading-snug">
                                            {alert.fieldEffect.replace(/Field Review: ⭐ [\d.]+\/[\d.]+ - /, '')}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                    {alert.priceHint}
                                </span>
                                <span className="text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 font-semibold text-xs flex items-center gap-1">
                                    View Details <ChevronRight className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>

            <Modal 
                isOpen={!!selectedAlert} 
                onClose={() => setSelectedAlert(null)}
                title={selectedAlert?.productName || "Product Details"}
            >
                {selectedAlert && selectedAlert.details && (
                    <div className="space-y-6">
                        {selectedAlert.details.photo && (
                            <div className="w-full h-48 overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-800 relative shadow-sm border border-gray-200 dark:border-zinc-700">
                                <img 
                                    src={selectedAlert.details.photo} 
                                    alt={selectedAlert.productName} 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 left-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm border border-gray-200 dark:border-zinc-700">
                                    <Factory className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                    {selectedAlert.manufacturer}
                                </div>
                            </div>
                        )}
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                        {selectedAlert.productName}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-md w-max border border-amber-200 dark:border-amber-800">
                                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {selectedAlert.rating} / 5.0 Average Efficacy Rating
                                    </div>
                                </div>
                                <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide">
                                    {selectedAlert.type}
                                </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                                {selectedAlert.details.description}
                            </p>
                        </div>

                        {/* Detailed Efficacy Report */}
                        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-zinc-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                            <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4" /> Real-world Field Effects
                            </h4>
                            <p className="text-sm text-indigo-950 dark:text-indigo-100 leading-relaxed font-medium">
                                {selectedAlert.fieldEffect}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Leaf className="w-4 h-4" /> Target Crops
                                </h4>
                                <ul className="space-y-1.5">
                                    {selectedAlert.details.crops.map((crop, i) => (
                                        <li key={i} className="text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-2 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {crop}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40">
                                <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Droplets className="w-4 h-4" /> Ideal Conditions
                                </h4>
                                <ul className="space-y-1.5">
                                    {selectedAlert.details.conditions.map((cond, i) => (
                                        <li key={i} className="text-sm text-blue-950 dark:text-blue-100 flex items-center gap-2 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {cond}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/80 rounded-xl border border-gray-200 dark:border-zinc-700 gap-4">
                            <div>
                                <span className="block text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Wholesale Price</span>
                                <span className="block text-2xl font-black text-foreground">{selectedAlert.priceHint}</span>
                            </div>
                            <button className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
                                <Factory className="w-4 h-4" /> Source Product
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </Card>
    );
}

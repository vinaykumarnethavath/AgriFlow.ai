"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Trophy, Sparkles, TrendingUp, CloudRain, Wallet,
    CheckCircle2, ArrowRight, Lightbulb, Sprout, ChevronRight
} from "lucide-react";
import { BestCropRecommendation, getBestCropRecommendation } from "@/lib/api";

interface BestCropRecommendationCardProps {
    onSelectCrop?: (cropName: string, variety: string, season: string) => void;
}

export default function BestCropRecommendationCard({ onSelectCrop }: BestCropRecommendationCardProps) {
    const [rec, setRec] = useState<BestCropRecommendation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBestCrop = async () => {
            try {
                const data = await getBestCropRecommendation();
                setRec(data);
            } catch (err) {
                console.error("Failed to fetch best crop recommendation:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBestCrop();
    }, []);

    if (loading) {
        return (
            <Card className="border border-amber-200/60 shadow-md bg-gradient-to-br from-amber-50/60 to-emerald-50/60 dark:from-amber-950/20 dark:to-emerald-950/20 animate-pulse">
                <CardContent className="p-6">
                    <div className="h-6 w-48 bg-amber-200/60 rounded mb-4" />
                    <div className="h-10 w-3/4 bg-gray-200/60 rounded mb-3" />
                    <div className="h-16 w-full bg-gray-100 rounded-xl" />
                </CardContent>
            </Card>
        );
    }

    if (!rec) return null;

    return (
        <Card className="border-2 border-amber-300 dark:border-amber-700/60 shadow-xl bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/60 dark:from-amber-950/30 dark:via-background dark:to-emerald-950/20 overflow-hidden relative">
            {/* Top decorative gradient bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500" />

            <CardContent className="p-5 md:p-6 space-y-5">
                {/* Header Tag Row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                            <Trophy className="h-3.5 w-3.5" /> Best Crop Recommendation
                        </span>
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-700">
                            {rec.target_season}
                        </span>
                    </div>

                    <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                        <Sparkles className="h-3 w-3" /> {rec.confidence_score}% AI Match
                    </span>
                </div>

                {/* Main Hero Recommendation Title */}
                <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Recommended for Next Season
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mt-1">
                        <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
                            <span>{rec.icon}</span>
                            <span>{rec.crop_name}</span>
                            <span className="text-sm font-normal text-muted-foreground">({rec.variety})</span>
                        </h2>
                        <div className="inline-flex items-center bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 font-extrabold px-3 py-1 rounded-xl text-base border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                            Expected Profit: ₹{rec.expected_profit_per_acre.toLocaleString("en-IN")}/acre
                        </div>
                    </div>
                </div>

                {/* Reason Callout Box */}
                <div className="bg-amber-100/70 dark:bg-amber-950/40 border-l-4 border-l-amber-500 p-3.5 rounded-r-xl">
                    <p className="text-xs uppercase font-extrabold text-amber-900 dark:text-amber-300 tracking-wider mb-0.5 flex items-center gap-1">
                        <Lightbulb className="h-3.5 w-3.5 text-amber-600" /> Why This Crop?
                    </p>
                    <p className="text-sm font-medium text-foreground italic leading-relaxed">
                        &ldquo;{rec.reason}&rdquo;
                    </p>
                </div>

                {/* 3 Pillar Decision Factors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Past Profit Factor */}
                    <div className="bg-card p-3 rounded-xl border border-border/80 shadow-2xs space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                            <Wallet className="h-3.5 w-3.5" />
                            <span>Farmer&apos;s Past Profits</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {rec.past_profit_factor}
                        </p>
                    </div>

                    {/* Market Trend Factor */}
                    <div className="bg-card p-3 rounded-xl border border-border/80 shadow-2xs space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span>Current Market Trend</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {rec.market_trend_factor}
                        </p>
                    </div>

                    {/* Weather Factor */}
                    <div className="bg-card p-3 rounded-xl border border-border/80 shadow-2xs space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400">
                            <CloudRain className="h-3.5 w-3.5" />
                            <span>Seasonal Weather Forecast</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {rec.weather_factor}
                        </p>
                    </div>
                </div>

                {/* Expected Financials Breakdown Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-muted/40 p-3 rounded-xl border border-border text-center text-xs">
                    <div>
                        <p className="text-muted-foreground text-[11px]">Est. Yield / Acre</p>
                        <p className="font-bold text-foreground text-sm mt-0.5">{rec.expected_yield_per_acre} Quintals</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-[11px]">Input Cost / Acre</p>
                        <p className="font-bold text-foreground text-sm mt-0.5">₹{rec.estimated_cost_per_acre.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-[11px]">Gross Revenue / Acre</p>
                        <p className="font-bold text-foreground text-sm mt-0.5">₹{rec.estimated_revenue_per_acre.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/50 rounded-lg py-1 border border-emerald-200 dark:border-emerald-800">
                        <p className="text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">Net Profit / Acre</p>
                        <p className="font-black text-emerald-700 dark:text-emerald-400 text-sm mt-0.5">₹{rec.expected_profit_per_acre.toLocaleString("en-IN")}</p>
                    </div>
                </div>

                {/* Runner-up Alternatives */}
                {rec.alternatives && rec.alternatives.length > 0 && (
                    <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground">Other Top Contenders:</span>
                            {rec.alternatives.map((alt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onSelectCrop && onSelectCrop(alt.crop_name, alt.variety, rec.target_season.split(" ")[0])}
                                    className="bg-muted hover:bg-muted/80 text-foreground text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors border border-border"
                                >
                                    <span>{alt.icon}</span>
                                    <span>{alt.crop_name}</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{alt.expected_profit_per_acre.toLocaleString("en-IN")}/ac</span>
                                    <span className="text-[10px] text-muted-foreground">({alt.tag})</span>
                                </button>
                            ))}
                        </div>

                        {onSelectCrop && (
                            <Button
                                size="sm"
                                onClick={() => onSelectCrop(rec.crop_name, rec.variety, rec.target_season.split(" ")[0])}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 shrink-0 shadow-sm"
                            >
                                <Sprout className="h-3.5 w-3.5 mr-1" /> Plan {rec.crop_name}
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

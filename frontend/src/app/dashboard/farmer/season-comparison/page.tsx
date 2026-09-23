"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BarChart3, TrendingUp, TrendingDown, ArrowRight, ArrowLeftRight,
    Sprout, IndianRupee, Scale, Sparkles, CheckCircle2, AlertTriangle,
    Layers, PieChart, Activity, RefreshCw
} from "lucide-react";
import {
    SeasonComparisonResponse, SeasonSummary,
    getAvailableSeasons, compareSeasons, getAllSeasonsOverview
} from "@/lib/api";

export default function SeasonComparisonPage() {
    const { user } = useAuth();
    const { t } = useLanguage();

    const [seasonsList, setSeasonsList] = useState<string[]>([]);
    const [seasonA, setSeasonA] = useState<string>("");
    const [seasonB, setSeasonB] = useState<string>("");

    const [comparison, setComparison] = useState<SeasonComparisonResponse | null>(null);
    const [allOverviews, setAllOverviews] = useState<SeasonSummary[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial load: available seasons
    useEffect(() => {
        const loadInitial = async () => {
            setLoading(true);
            try {
                const [seasons, overviews] = await Promise.all([
                    getAvailableSeasons(),
                    getAllSeasonsOverview(),
                ]);
                setSeasonsList(seasons);
                setAllOverviews(overviews);

                if (seasons.length >= 2) {
                    setSeasonA(seasons[1]);
                    setSeasonB(seasons[0]);
                } else if (seasons.length === 1) {
                    setSeasonA(seasons[0]);
                    setSeasonB(seasons[0]);
                }
            } catch (err) {
                console.error("Failed to load seasons:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitial();
    }, []);

    // Fetch comparison when seasonA or seasonB changes
    const fetchComparisonData = async (a: string, b: string) => {
        if (!a && !b) return;
        setLoading(true);
        try {
            const data = await compareSeasons(a, b);
            setComparison(data);
        } catch (err) {
            console.error("Failed to compare seasons:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (seasonA || seasonB) {
            fetchComparisonData(seasonA, seasonB);
        }
    }, [seasonA, seasonB]);

    // Swap seasons
    const handleSwap = () => {
        const temp = seasonA;
        setSeasonA(seasonB);
        setSeasonB(temp);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-green-800 via-emerald-800 to-teal-900 p-6 rounded-2xl text-white shadow-lg">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-emerald-300" />
                        Season Performance Comparison
                    </h1>
                    <p className="text-emerald-100 text-sm mt-1">
                        Compare yield, production costs, revenue, and net profits across farming seasons to track real progress.
                    </p>
                </div>

                {/* Season Selectors Control */}
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 self-stretch sm:self-auto">
                    <div className="flex-1 sm:flex-initial">
                        <p className="text-[10px] uppercase font-bold text-emerald-200 px-1 mb-1">Baseline Season</p>
                        <select
                            value={seasonA}
                            onChange={(e) => setSeasonA(e.target.value)}
                            className="w-full sm:w-auto text-xs font-bold bg-white text-gray-900 rounded-lg px-2.5 py-1.5 outline-none shadow-sm"
                        >
                            {seasonsList.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleSwap}
                        className="p-2 hover:bg-white/20 rounded-lg text-emerald-200 hover:text-white transition-colors self-end mb-0.5"
                        title="Swap comparison order"
                    >
                        <ArrowLeftRight className="h-4 w-4" />
                    </button>

                    <div className="flex-1 sm:flex-initial">
                        <p className="text-[10px] uppercase font-bold text-emerald-200 px-1 mb-1">Compare With</p>
                        <select
                            value={seasonB}
                            onChange={(e) => setSeasonB(e.target.value)}
                            className="w-full sm:w-auto text-xs font-bold bg-emerald-100 text-emerald-950 rounded-lg px-2.5 py-1.5 outline-none shadow-sm"
                        >
                            {seasonsList.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-emerald-600 font-bold animate-pulse">
                    Calculating seasonal financial analytics...
                </div>
            ) : comparison ? (
                <>
                    {/* Big Highlight Growth Banner */}
                    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-green-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className={`p-3 rounded-2xl ${comparison.profit_comparison.difference >= 0 ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                                    {comparison.profit_comparison.difference >= 0 ? (
                                        <TrendingUp className="h-7 w-7" />
                                    ) : (
                                        <TrendingDown className="h-7 w-7" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-800 dark:text-emerald-300">
                                            Seasonal Growth Summary
                                        </span>
                                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                                            comparison.profit_comparison.difference >= 0
                                                ? "bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100"
                                                : "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100"
                                        }`}>
                                            {comparison.profit_comparison.difference >= 0 ? "+" : ""}
                                            {comparison.profit_comparison.percent_change}% Profit Change
                                        </span>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-black text-foreground mt-0.5">
                                        {comparison.season_b.label}: ₹{comparison.season_b.net_profit.toLocaleString("en-IN")} Profit
                                        <span className="text-muted-foreground text-sm font-normal ml-2">
                                            (vs ₹{comparison.season_a.net_profit.toLocaleString("en-IN")} in {comparison.season_a.label})
                                        </span>
                                    </h2>
                                </div>
                            </div>

                            <div className="text-right sm:border-l sm:pl-6 border-emerald-200 dark:border-emerald-800">
                                <p className="text-xs text-muted-foreground">Net Profit Delta</p>
                                <p className={`text-xl font-black ${comparison.profit_comparison.difference >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                                    {comparison.profit_comparison.difference >= 0 ? "+" : ""}₹{comparison.profit_comparison.difference.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 4 Key Comparison Metrics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Net Profit */}
                        <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                                    <span>NET PROFIT</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                                        comparison.profit_comparison.is_positive ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                    }`}>
                                        {comparison.profit_comparison.difference >= 0 ? "+" : ""}{comparison.profit_comparison.percent_change}%
                                    </span>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-foreground">₹{comparison.season_b.net_profit.toLocaleString("en-IN")}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Was ₹{comparison.season_a.net_profit.toLocaleString("en-IN")} in {comparison.season_a.label}
                                    </p>
                                </div>
                                <div className="pt-2 border-t text-xs flex justify-between text-muted-foreground">
                                    <span>Profit/Acre:</span>
                                    <span className="font-bold text-foreground">₹{comparison.season_b.profit_per_acre.toLocaleString("en-IN")}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Harvest Yield */}
                        <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                                    <span>HARVEST YIELD</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                                        comparison.yield_comparison.is_positive ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                    }`}>
                                        {comparison.yield_comparison.difference >= 0 ? "+" : ""}{comparison.yield_comparison.percent_change}%
                                    </span>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-foreground">{comparison.season_b.total_yield_quintals} Qtl</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Was {comparison.season_a.total_yield_quintals} Qtl in {comparison.season_a.label}
                                    </p>
                                </div>
                                <div className="pt-2 border-t text-xs flex justify-between text-muted-foreground">
                                    <span>Yield/Acre:</span>
                                    <span className="font-bold text-foreground">{comparison.season_b.yield_per_acre} Qtl/Ac</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Production Cost */}
                        <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                                    <span>TOTAL INPUT COST</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                                        comparison.cost_comparison.difference <= 0 ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                    }`}>
                                        {comparison.cost_comparison.difference > 0 ? "+" : ""}{comparison.cost_comparison.percent_change}%
                                    </span>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-foreground">₹{comparison.season_b.total_cost.toLocaleString("en-IN")}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Was ₹{comparison.season_a.total_cost.toLocaleString("en-IN")} in {comparison.season_a.label}
                                    </p>
                                </div>
                                <div className="pt-2 border-t text-xs flex justify-between text-muted-foreground">
                                    <span>Cost/Acre:</span>
                                    <span className="font-bold text-foreground">₹{comparison.season_b.cost_per_acre.toLocaleString("en-IN")}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Revenue & Profit Margin */}
                        <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                                    <span>TOTAL REVENUE</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                                        comparison.revenue_comparison.is_positive ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                    }`}>
                                        {comparison.revenue_comparison.difference >= 0 ? "+" : ""}{comparison.revenue_comparison.percent_change}%
                                    </span>
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-foreground">₹{comparison.season_b.total_revenue.toLocaleString("en-IN")}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Was ₹{comparison.season_a.total_revenue.toLocaleString("en-IN")} in {comparison.season_a.label}
                                    </p>
                                </div>
                                <div className="pt-2 border-t text-xs flex justify-between text-muted-foreground">
                                    <span>Profit Margin:</span>
                                    <span className="font-bold text-foreground">{comparison.season_b.profit_margin_percent}%</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Side-by-Side Visual Comparison Card */}
                    <Card className="border border-border shadow-sm">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                    <Scale className="h-5 w-5 text-emerald-600" />
                                    Side-by-Side Breakdown
                                </h3>
                                <div className="flex items-center gap-4 text-xs font-semibold">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 rounded-full bg-gray-400" />
                                        <span>{comparison.season_a.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-3 w-3 rounded-full bg-emerald-600" />
                                        <span>{comparison.season_b.label}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Relative Comparison Bars */}
                            <div className="space-y-4">
                                {/* Profit */}
                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-muted-foreground">Net Profit</span>
                                        <span>
                                            ₹{comparison.season_a.net_profit.toLocaleString("en-IN")} vs <strong>₹{comparison.season_b.net_profit.toLocaleString("en-IN")}</strong>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 h-4">
                                        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex justify-end">
                                            <div className="h-full bg-gray-400 rounded-lg" style={{ width: `${Math.min(100, (comparison.season_a.net_profit / Math.max(1, comparison.season_a.net_profit, comparison.season_b.net_profit)) * 100)}%` }} />
                                        </div>
                                        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex justify-start">
                                            <div className="h-full bg-emerald-600 rounded-lg" style={{ width: `${Math.min(100, (comparison.season_b.net_profit / Math.max(1, comparison.season_a.net_profit, comparison.season_b.net_profit)) * 100)}%` }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Revenue */}
                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-muted-foreground">Total Revenue</span>
                                        <span>
                                            ₹{comparison.season_a.total_revenue.toLocaleString("en-IN")} vs <strong>₹{comparison.season_b.total_revenue.toLocaleString("en-IN")}</strong>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 h-4">
                                        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex justify-end">
                                            <div className="h-full bg-blue-300 rounded-lg" style={{ width: `${Math.min(100, (comparison.season_a.total_revenue / Math.max(1, comparison.season_a.total_revenue, comparison.season_b.total_revenue)) * 100)}%` }} />
                                        </div>
                                        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex justify-start">
                                            <div className="h-full bg-blue-600 rounded-lg" style={{ width: `${Math.min(100, (comparison.season_b.total_revenue / Math.max(1, comparison.season_a.total_revenue, comparison.season_b.total_revenue)) * 100)}%` }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Total Cost */}
                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-muted-foreground">Input Costs</span>
                                        <span>
                                            ₹{comparison.season_a.total_cost.toLocaleString("en-IN")} vs <strong>₹{comparison.season_b.total_cost.toLocaleString("en-IN")}</strong>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 h-4">
                                        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex justify-end">
                                            <div className="h-full bg-amber-300 rounded-lg" style={{ width: `${Math.min(100, (comparison.season_a.total_cost / Math.max(1, comparison.season_a.total_cost, comparison.season_b.total_cost)) * 100)}%` }} />
                                        </div>
                                        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex justify-start">
                                            <div className="h-full bg-amber-600 rounded-lg" style={{ width: `${Math.min(100, (comparison.season_b.total_cost / Math.max(1, comparison.season_a.total_cost, comparison.season_b.total_cost)) * 100)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Crop-by-Crop Performance Breakdown */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                <Sprout className="h-5 w-5 text-emerald-600" />
                                Crop-by-Crop Comparison
                            </h3>
                            <span className="text-xs text-muted-foreground">
                                {comparison.crop_comparisons.length} crops analyzed
                            </span>
                        </div>

                        {comparison.crop_comparisons.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-6 text-center">No crop data found for these seasons.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {comparison.crop_comparisons.map((crop, idx) => {
                                    const isProfitUp = crop.profit_change_percent >= 0;
                                    return (
                                        <Card key={idx} className="border border-border/80 shadow-sm hover:shadow-md transition-all">
                                            <CardContent className="p-5 space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
                                                            <span>🌾</span> {crop.crop_name}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            Area: {crop.season_a_area} Ac ({comparison.season_a.label}) → {crop.season_b_area} Ac ({comparison.season_b.label})
                                                        </p>
                                                    </div>
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border ${
                                                        isProfitUp ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300"
                                                    }`}>
                                                        {isProfitUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                                                        {crop.status_text}
                                                    </span>
                                                </div>

                                                {/* Comparison Grid */}
                                                <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-xl border border-border/50">
                                                    <div className="space-y-1.5 border-r pr-2">
                                                        <p className="font-bold text-muted-foreground uppercase text-[10px]">{comparison.season_a.label}</p>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Yield:</span>
                                                            <span className="font-semibold text-foreground">{crop.season_a_yield} Qtl</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Cost:</span>
                                                            <span className="font-semibold text-foreground">₹{crop.season_a_cost.toLocaleString("en-IN")}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Profit:</span>
                                                            <span className="font-bold text-foreground">₹{crop.season_a_profit.toLocaleString("en-IN")}</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5 pl-2">
                                                        <p className="font-bold text-emerald-700 dark:text-emerald-400 uppercase text-[10px]">{comparison.season_b.label}</p>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Yield:</span>
                                                            <span className="font-semibold text-foreground">{crop.season_b_yield} Qtl</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Cost:</span>
                                                            <span className="font-semibold text-foreground">₹{crop.season_b_cost.toLocaleString("en-IN")}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-muted-foreground">Profit:</span>
                                                            <span className={`font-bold ${crop.season_b_profit >= crop.season_a_profit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                                                                ₹{crop.season_b_profit.toLocaleString("en-IN")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* AI Seasonal Insights Box */}
                    {comparison.ai_insights && comparison.ai_insights.length > 0 && (
                        <Card className="border border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/30 dark:via-indigo-950/20 dark:to-blue-950/20 shadow-sm">
                            <CardContent className="p-5 space-y-3">
                                <h3 className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2 text-base">
                                    <Sparkles className="h-5 w-5 text-purple-600" />
                                    AI Seasonal Performance Takeaways
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                    {comparison.ai_insights.map((insight, idx) => (
                                        <div key={idx} className="flex items-start gap-2 bg-white/70 dark:bg-black/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900/50 shadow-2xs">
                                            <p className="text-xs text-foreground leading-relaxed">{insight}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            ) : null}
        </div>
    );
}

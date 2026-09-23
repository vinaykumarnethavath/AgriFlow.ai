"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BarChart2, TrendingUp, TrendingDown, IndianRupee, Sprout,
    Calendar, Award, Scale, PieChart, ArrowUpRight, ArrowDownRight,
    Sparkles, ShieldCheck, Download, RefreshCw, Layers, ChevronRight,
    CheckCircle2, AlertTriangle, Wallet, ArrowRight
} from "lucide-react";
import {
    AnnualSummaryResponse, YoYMetric,
    getAnnualPerformanceSummary, getAnnualSummaryYears
} from "@/lib/api";

export default function AnnualSummaryPage() {
    const { user } = useAuth();
    const { t } = useLanguage();

    const [availableYears, setAvailableYears] = useState<number[]>([2026, 2025]);
    const [selectedYear, setSelectedYear] = useState<number>(2026);
    const [data, setData] = useState<AnnualSummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async (yr?: number) => {
        try {
            setLoading(true);
            const targetYear = yr || selectedYear;
            const res = await getAnnualPerformanceSummary(targetYear);
            setData(res);
            if (res.available_years && res.available_years.length > 0) {
                setAvailableYears(res.available_years);
            }
        } catch (err) {
            console.error("Failed to load annual summary:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load initial years and summary
        getAnnualSummaryYears()
            .then((years) => {
                if (years && years.length > 0) {
                    setAvailableYears(years);
                    setSelectedYear(years[0]);
                    return loadData(years[0]);
                } else {
                    return loadData();
                }
            })
            .catch(() => loadData());
    }, []);

    const handleYearChange = (yr: number) => {
        setSelectedYear(yr);
        loadData(yr);
    };

    const renderYoYBadge = (yoy?: YoYMetric) => {
        if (!yoy) return null;
        const isUp = yoy.percent_change >= 0;
        const isGood = yoy.is_positive;

        return (
            <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                isGood
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
            }`}>
                {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                <span>{isUp ? "+" : ""}{yoy.percent_change}% YoY</span>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <BarChart2 className="h-8 w-8 text-emerald-600" />
                        Annual Farm Performance & Audit
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Comprehensive calendar-year financial ledger, multi-season performance (Kharif, Rabi, Zaid), and crop return rankings.
                    </p>
                </div>

                {/* Year Selector Pills */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground mr-1">Fiscal Year:</span>
                    <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60">
                        {availableYears.map((yr) => (
                            <button
                                key={yr}
                                onClick={() => handleYearChange(yr)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    selectedYear === yr
                                        ? "bg-emerald-600 text-white shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {yr}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-emerald-600 mb-3" />
                    <p className="text-sm text-muted-foreground">Compiling annual farm performance audit for {selectedYear}...</p>
                </div>
            ) : !data ? (
                <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border/80 p-8">
                    <BarChart2 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground">No Crop Records in {selectedYear}</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
                        No crop harvest or expense records were found for calendar year {selectedYear}.
                    </p>
                    <Link href="/dashboard/farmer/crops">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Go to Crops Management
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Top 4 KPI Cards with YoY Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* Gross Revenue */}
                        <Card className="border border-border/60 shadow-sm hover:shadow transition-shadow">
                            <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gross Revenue</span>
                                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                                        <IndianRupee className="h-5 w-5" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-foreground">
                                        ₹{Math.round(data.gross_revenue).toLocaleString()}
                                    </h3>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                                        <span className="text-xs text-muted-foreground">vs {selectedYear - 1}</span>
                                        {renderYoYBadge(data.yoy_revenue)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Input Costs */}
                        <Card className="border border-border/60 shadow-sm hover:shadow transition-shadow">
                            <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operational Cost</span>
                                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 rounded-xl text-rose-600 border border-rose-200 dark:border-rose-800">
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-foreground">
                                        ₹{Math.round(data.total_input_cost).toLocaleString()}
                                    </h3>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                                        <span className="text-xs text-muted-foreground">vs {selectedYear - 1}</span>
                                        {renderYoYBadge(data.yoy_cost)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Net Farm Income & Margin */}
                        <Card className="border border-border/60 shadow-sm hover:shadow transition-shadow">
                            <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net Farm Profit</span>
                                    <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-blue-600 border border-blue-200 dark:border-blue-800">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className={`text-2xl font-black ${data.net_farm_income >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}`}>
                                            ₹{Math.round(data.net_farm_income).toLocaleString()}
                                        </h3>
                                        <span className="text-xs font-bold text-muted-foreground">({data.profit_margin_percent}% margin)</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                                        <span className="text-xs text-muted-foreground">vs {selectedYear - 1}</span>
                                        {renderYoYBadge(data.yoy_profit)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Production & Cropping Intensity */}
                        <Card className="border border-border/60 shadow-sm hover:shadow transition-shadow">
                            <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Output & Land Use</span>
                                    <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 rounded-xl text-purple-600 border border-purple-200 dark:border-purple-800">
                                        <Scale className="h-5 w-5" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-2xl font-black text-foreground">
                                            {data.total_production_quintals.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">Qtl</span>
                                        </h3>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                                        <span>Intensity: <strong className="text-foreground">{data.cropping_intensity_percent}%</strong></span>
                                        <span>Avg: <strong className="text-emerald-600">₹{Math.round(data.avg_return_per_acre)}/ac</strong></span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Executive AI Farm Auditor Insight */}
                    <Card className="border border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/50 via-card to-background">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 rounded-lg bg-emerald-600 text-white">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground text-base">Annual Executive Farm Audit</h3>
                                        <p className="text-xs text-muted-foreground">AI-driven financial appraisal based on market revenues and input ledgers.</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300">
                                    {selectedYear} Fiscal Review
                                </span>
                            </div>

                            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                                {data.audit_summary}
                            </p>

                            {data.key_highlights.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-border/40">
                                    {data.key_highlights.map((h, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs text-foreground/80 bg-background/80 p-2.5 rounded-lg border border-border/40">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span>{h}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Seasonal Breakdown Cards */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-emerald-600" />
                                Seasonal Financial Breakdown ({selectedYear})
                            </h2>
                            <span className="text-xs text-muted-foreground">Kharif • Rabi • Zaid performance</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {data.seasonal_breakdown.map((s) => (
                                <Card key={s.season_name} className="border border-border/60 hover:shadow-sm transition-shadow">
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-foreground">{s.season_name} Season</h3>
                                                <span className="text-xs text-muted-foreground">{s.crops_count} crop{s.crops_count !== 1 ? "s" : ""} • {s.area_acres} acres</span>
                                            </div>
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-muted text-foreground">
                                                {s.profit_share_percent}% profit share
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 p-3 bg-muted/40 rounded-xl text-xs">
                                            <div>
                                                <span className="text-muted-foreground block">Season Revenue</span>
                                                <span className="font-bold text-foreground">₹{Math.round(s.revenue).toLocaleString()}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">Season Cost</span>
                                                <span className="font-bold text-foreground">₹{Math.round(s.cost).toLocaleString()}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">Total Harvest</span>
                                                <span className="font-bold text-foreground">{s.production_quintals} Qtl</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">Net Profit</span>
                                                <span className={`font-bold ${s.net_profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                                                    ₹{Math.round(s.net_profit).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress Bar of income share */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[11px] text-muted-foreground">
                                                <span>Annual Income Contribution</span>
                                                <span>{s.profit_share_percent}%</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <div
                                                    className="bg-emerald-600 h-2 rounded-full"
                                                    style={{ width: `${Math.min(100, Math.max(0, s.profit_share_percent))}%` }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Crop Profitability League Table */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <Award className="h-5 w-5 text-amber-500" />
                                Crop Profitability League (Ranked)
                            </h2>
                            <span className="text-xs text-muted-foreground">Ranked by net financial return</span>
                        </div>

                        <div className="border border-border/60 rounded-xl overflow-x-auto bg-card shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/60 text-xs uppercase text-muted-foreground border-b border-border/60">
                                    <tr>
                                        <th className="py-3.5 px-4 font-semibold">Rank</th>
                                        <th className="py-3.5 px-4 font-semibold">Crop & Variety</th>
                                        <th className="py-3.5 px-4 font-semibold">Season</th>
                                        <th className="py-3.5 px-4 font-semibold text-right">Area (Ac)</th>
                                        <th className="py-3.5 px-4 font-semibold text-right">Yield (Qtl)</th>
                                        <th className="py-3.5 px-4 font-semibold text-right">Total Cost</th>
                                        <th className="py-3.5 px-4 font-semibold text-right">Revenue</th>
                                        <th className="py-3.5 px-4 font-semibold text-right">Net Profit</th>
                                        <th className="py-3.5 px-4 font-semibold text-right">Profit / Ac</th>
                                        <th className="py-3.5 px-4 font-semibold text-center">CBR</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {data.crop_rankings.map((c) => (
                                        <tr key={c.crop_id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4 font-bold text-foreground">
                                                {c.rank === 1 ? "🥇 #1" : c.rank === 2 ? "🥈 #2" : c.rank === 3 ? "🥉 #3" : `#${c.rank}`}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-foreground">{c.crop_name}</div>
                                                {c.variety && <div className="text-xs text-muted-foreground">{c.variety}</div>}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                                                    {c.season}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right font-medium text-foreground">{c.area}</td>
                                            <td className="py-3 px-4 text-right font-medium text-foreground">
                                                {c.yield_quintals} <span className="text-xs text-muted-foreground font-normal">({c.yield_per_acre}/ac)</span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-muted-foreground">₹{Math.round(c.total_cost).toLocaleString()}</td>
                                            <td className="py-3 px-4 text-right font-medium text-foreground">₹{Math.round(c.revenue).toLocaleString()}</td>
                                            <td className="py-3 px-4 text-right">
                                                <span className={`font-bold ${c.net_profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                                                    ₹{Math.round(c.net_profit).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right font-semibold text-emerald-700 dark:text-emerald-300">
                                                ₹{Math.round(c.profit_per_acre).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                                    {c.cost_benefit_ratio}x
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Operational Expenditure Breakdown & Monthly Cashflow */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Cost Distribution */}
                        <Card className="border border-border/60">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                                        <PieChart className="h-5 w-5 text-emerald-600" />
                                        Expenditure Distribution
                                    </h3>
                                    <span className="text-xs text-muted-foreground">Total: ₹{Math.round(data.total_input_cost).toLocaleString()}</span>
                                </div>

                                <div className="space-y-3 pt-1">
                                    {data.expense_breakdown.map((exp) => (
                                        <div key={exp.category} className="space-y-1">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className="text-foreground">{exp.category}</span>
                                                <span className="text-muted-foreground">₹{Math.round(exp.amount).toLocaleString()} ({exp.percentage}%)</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-emerald-600 h-2 rounded-full"
                                                    style={{ width: `${Math.min(100, exp.percentage)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Monthly Cashflow Timeline */}
                        <Card className="border border-border/60">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                        Monthly Cashflow Pattern
                                    </h3>
                                    <span className="text-xs text-muted-foreground">Inflow vs Outflow</span>
                                </div>

                                <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-2">
                                    {data.monthly_cashflow.map((m) => (
                                        <div
                                            key={m.month_num}
                                            className={`p-2 rounded-lg text-center flex flex-col justify-between border ${
                                                m.net > 0
                                                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
                                                    : m.net < 0
                                                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"
                                                    : "bg-muted/40 border-border/40"
                                            }`}
                                        >
                                            <span className="text-[11px] font-bold text-foreground block">{m.month_name}</span>
                                            <span className={`text-[10px] font-semibold mt-2 block ${
                                                m.net > 0 ? "text-emerald-700 dark:text-emerald-400" : m.net < 0 ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground"
                                            }`}>
                                                {m.net > 0 ? `+${(m.net / 1000).toFixed(0)}k` : m.net < 0 ? `${(m.net / 1000).toFixed(0)}k` : "₹0"}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" /> Net Inflow (Harvest Sale)
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" /> Net Outflow (Sowing / Inputs)
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}

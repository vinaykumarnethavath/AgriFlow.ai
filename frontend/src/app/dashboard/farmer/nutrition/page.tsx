"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
    Droplets, FlaskConical, Sprout, Loader2, Info, CheckCircle2, AlertTriangle,
    MapPin, Leaf, Plus, Beaker, BarChart3, ArrowRight, Calendar, Package,
    TrendingUp, TrendingDown, Minus, RefreshCw, Sparkles, ShieldAlert, Target,
    Zap, Scale, SlidersHorizontal, ArrowUpRight, ArrowDownRight, Check, History, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    getPlots, getActiveCrops, savePlotSoilData, linkCropToPlot,
    getPlotRecommendation, applyFertilizer, getFertilizerHistory, analyzeFertilizerImpact,
    PlotOverview, ActiveCrop, PlotNutritionRecommendation, FertilizerApplicationData, ImpactAnalysis
} from "@/lib/api";

// ── Helpers ────────────────────────────────────────────────────
function statusColor(status: string) {
    const s = (status || "").toLowerCase();
    if (s.includes("good") || s.includes("optimal")) return "text-emerald-600 dark:text-emerald-400";
    if (s.includes("poor") || s.includes("risk") || s.includes("deficient")) return "text-amber-500 dark:text-amber-400";
    if (s.includes("excessive") || s.includes("alkaline") || s.includes("acidic")) return "text-rose-500 dark:text-rose-400";
    return "text-blue-500 dark:text-blue-400";
}

function statusBg(status: string) {
    const s = (status || "").toLowerCase();
    if (s.includes("good") || s.includes("optimal")) return "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50";
    if (s.includes("poor") || s.includes("risk") || s.includes("deficient")) return "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50";
    if (s.includes("excessive") || s.includes("alkaline") || s.includes("acidic")) return "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/50";
    return "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/50";
}

function nutrientStatusBadge(status: string) {
    const s = (status || "").toLowerCase();
    if (s === "optimal") {
        return (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-0 text-[11px] gap-1">
                <CheckCircle2 className="h-3 w-3" /> Optimal
            </Badge>
        );
    }
    if (s === "deficient" || s === "acidic") {
        return (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-0 text-[11px] gap-1">
                <TrendingDown className="h-3 w-3" /> {s === "acidic" ? "Acidic" : "Deficient"}
            </Badge>
        );
    }
    if (s === "excessive" || s === "alkaline") {
        return (
            <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border-0 text-[11px] gap-1">
                <TrendingUp className="h-3 w-3" /> {s === "alkaline" ? "Alkaline" : "Excessive"}
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="text-[11px]">
            {status || "Normal"}
        </Badge>
    );
}

function nutrientLabel(key: string) {
    const labels: Record<string, string> = {
        nitrogen: "Nitrogen (N)",
        phosphorus: "Phosphorus (P)",
        potassium: "Potassium (K)",
        ph: "pH Level",
        ph_level: "pH Level",
        organic_carbon: "Organic Carbon (OC)"
    };
    return labels[key] || key;
}

// ── Component ──────────────────────────────────────────────────
export default function PrecisionNutritionPage() {
    const { t } = useLanguage();

    // Tab state (controlled)
    const [activeTab, setActiveTab] = useState<string>("plots");

    // Global state
    const [plots, setPlots] = useState<PlotOverview[]>([]);
    const [activeCrops, setActiveCrops] = useState<ActiveCrop[]>([]);
    const [selectedPlot, setSelectedPlot] = useState<PlotOverview | null>(null);
    const [loadingPlots, setLoadingPlots] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Plot card view mode in "My Plots" tab (per-plot toggle between baseline and live)
    const [cardViewModes, setCardViewModes] = useState<Record<number, "baseline" | "live">>({});

    // Tab 2 state — Nutrition Manager
    // View mode: 'baseline' (original soil test) vs 'live' (adjusted with fertilizer & crop absorption)
    const [managerViewMode, setManagerViewMode] = useState<"baseline" | "live">("baseline");
    const [soilForm, setSoilForm] = useState({
        nitrogen: "",
        phosphorus: "",
        potassium: "",
        ph_level: "",
        organic_carbon: "",
        notes: ""
    });
    const [savingSoil, setSavingSoil] = useState(false);
    const [linkingCrop, setLinkingCrop] = useState(false);
    const [selectedCropId, setSelectedCropId] = useState<string>("");
    const [recommendation, setRecommendation] = useState<PlotNutritionRecommendation | null>(null);
    const [loadingRec, setLoadingRec] = useState(false);
    const [showComparisonModal, setShowComparisonModal] = useState(false);

    // Tab 3 state — Fertilizer Impact
    const [fertForm, setFertForm] = useState({
        fertilizer_name: "",
        quantity: "",
        unit: "kg",
        application_date: new Date().toISOString().split("T")[0],
        application_method: "Broadcasting",
        notes: ""
    });
    const [fertHistory, setFertHistory] = useState<FertilizerApplicationData[]>([]);
    const [loadingFertHistory, setLoadingFertHistory] = useState(false);
    const [applyingFert, setApplyingFert] = useState(false);
    const [impactResult, setImpactResult] = useState<ImpactAnalysis | null>(null);
    const [loadingImpact, setLoadingImpact] = useState(false);

    // Recommendation cache per soil ID to prevent redundant regeneration if unchanged
    const recCacheRef = useRef<Record<number, PlotNutritionRecommendation>>({});

    // ── Data loading ─────────────────────────────────────────
    const loadPlots = useCallback(async (preserveSelectedId?: number) => {
        setLoadingPlots(true);
        setError(null);
        try {
            const [p, c] = await Promise.all([getPlots(), getActiveCrops()]);
            setPlots(p);
            setActiveCrops(c);
            if (preserveSelectedId) {
                const refreshed = p.find(item => item.land_record_id === preserveSelectedId);
                if (refreshed) {
                    setSelectedPlot(refreshed);
                }
            } else if (p.length > 0 && !selectedPlot) {
                // Default select first plot
                setSelectedPlot(p[0]);
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to load plot data.");
        } finally {
            setLoadingPlots(false);
        }
    }, [selectedPlot]);

    useEffect(() => {
        loadPlots();
    }, []);

    // ── Fetch or auto-generate recommendation ────────────────
    const fetchRecommendation = useCallback(async (plotSoilId: number, forceRefresh: boolean = false) => {
        if (!forceRefresh && recCacheRef.current[plotSoilId]) {
            setRecommendation(recCacheRef.current[plotSoilId]);
            return;
        }
        setLoadingRec(true);
        try {
            const data = await getPlotRecommendation(plotSoilId);
            recCacheRef.current[plotSoilId] = data;
            setRecommendation(data);
        } catch (err: any) {
            console.error("Failed to get recommendation", err);
        } finally {
            setLoadingRec(false);
        }
    }, []);

    // When a plot is selected, prefill form, load history, and auto-fetch recommendation
    useEffect(() => {
        if (!selectedPlot) return;
        const sd = selectedPlot.soil_data;
        if (sd) {
            setSoilForm({
                nitrogen: String(sd.nitrogen),
                phosphorus: String(sd.phosphorus),
                potassium: String(sd.potassium),
                ph_level: String(sd.ph_level),
                organic_carbon: sd.organic_carbon != null ? String(sd.organic_carbon) : "",
                notes: sd.notes || "",
            });
            setSelectedCropId(sd.crop_id ? String(sd.crop_id) : (selectedPlot.crop_id ? String(selectedPlot.crop_id) : ""));
            loadFertHistory(sd.id);
            // Auto-load recommendation response for this plot!
            fetchRecommendation(sd.id, false);
        } else {
            setSoilForm({ nitrogen: "", phosphorus: "", potassium: "", ph_level: "", organic_carbon: "", notes: "" });
            setSelectedCropId("");
            setFertHistory([]);
            setRecommendation(null);
        }
        setImpactResult(null);
    }, [selectedPlot, fetchRecommendation]);

    async function loadFertHistory(plotSoilId: number) {
        setLoadingFertHistory(true);
        try {
            const data = await getFertilizerHistory(plotSoilId);
            setFertHistory(data);
        } catch {
            setFertHistory([]);
        } finally {
            setLoadingFertHistory(false);
        }
    }

    // ── Plot Selection Action (Directs directly to Nutrition Manager) ──
    const handleSelectAndNavigate = (plot: PlotOverview) => {
        setSelectedPlot(plot);
        setActiveTab("manager");
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ── Save/Update Soil Data & Automatically Regenerate ─────
    async function handleSaveSoil(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedPlot) return;
        setSavingSoil(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const payload = {
                nitrogen: parseFloat(soilForm.nitrogen) || 0,
                phosphorus: parseFloat(soilForm.phosphorus) || 0,
                potassium: parseFloat(soilForm.potassium) || 0,
                ph_level: parseFloat(soilForm.ph_level) || 7,
                organic_carbon: soilForm.organic_carbon ? parseFloat(soilForm.organic_carbon) : null,
                notes: soilForm.notes || null,
            };
            const savedSoil = await savePlotSoilData(selectedPlot.land_record_id, payload);

            // If crop is selected and not yet linked, link it
            if (selectedCropId && selectedCropId !== String(savedSoil.crop_id)) {
                await linkCropToPlot(savedSoil.id, parseInt(selectedCropId));
            }

            // Reload plots and keep selection
            const updatedPlots = await getPlots();
            setPlots(updatedPlots);
            const updated = updatedPlots.find(p => p.land_record_id === selectedPlot.land_record_id);
            if (updated) setSelectedPlot(updated);

            setSuccessMessage("Original soil test values saved securely. Regenerating AI recommendations...");
            setTimeout(() => setSuccessMessage(null), 5000);

            // Re-generate fresh AI recommendation immediately
            await fetchRecommendation(savedSoil.id, true);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to save soil data.");
        } finally {
            setSavingSoil(false);
        }
    }

    async function handleLinkCrop() {
        if (!selectedPlot?.soil_data || !selectedCropId) return;
        setLinkingCrop(true);
        setError(null);
        try {
            await linkCropToPlot(selectedPlot.soil_data.id, parseInt(selectedCropId));
            const updatedPlots = await getPlots();
            setPlots(updatedPlots);
            const updated = updatedPlots.find(p => p.land_record_id === selectedPlot.land_record_id);
            if (updated) setSelectedPlot(updated);

            setSuccessMessage("Crop linked successfully! Regenerating recommendation for this crop...");
            setTimeout(() => setSuccessMessage(null), 4000);

            // Regenerate recommendation for new crop
            await fetchRecommendation(selectedPlot.soil_data.id, true);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to link crop.");
        } finally {
            setLinkingCrop(false);
        }
    }

    // ── Apply Fertilizer & Sync Dynamic Soil Adjustment ──────
    async function handleApplyFertilizer(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedPlot?.soil_data) return;
        setApplyingFert(true);
        setError(null);
        try {
            const payload = {
                fertilizer_name: fertForm.fertilizer_name,
                quantity: parseFloat(fertForm.quantity) || 0,
                unit: fertForm.unit,
                application_date: fertForm.application_date,
                application_method: fertForm.application_method || undefined,
                notes: fertForm.notes || undefined,
            };
            await applyFertilizer(selectedPlot.soil_data.id, payload);
            setFertForm({
                fertilizer_name: "",
                quantity: "",
                unit: "kg",
                application_date: new Date().toISOString().split("T")[0],
                application_method: "Broadcasting",
                notes: ""
            });

            // Reload history and refresh all plots to get updated live dynamic adjustments
            await loadFertHistory(selectedPlot.soil_data.id);
            const updatedPlots = await getPlots();
            setPlots(updatedPlots);
            const updated = updatedPlots.find(p => p.land_record_id === selectedPlot.land_record_id);
            if (updated) setSelectedPlot(updated);

            // Invalidate recommendation cache and update impact
            delete recCacheRef.current[selectedPlot.soil_data.id];
            await handleAnalyzeImpact();

            setSuccessMessage(`Application of ${payload.fertilizer_name} logged! Soil nutrient levels have been adjusted dynamically based on crop absorption.`);
            setTimeout(() => setSuccessMessage(null), 6000);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to log fertilizer.");
        } finally {
            setApplyingFert(false);
        }
    }

    async function handleAnalyzeImpact() {
        if (!selectedPlot?.soil_data) return;
        setLoadingImpact(true);
        setImpactResult(null);
        try {
            const data = await analyzeFertilizerImpact(selectedPlot.soil_data.id);
            setImpactResult(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to analyze impact.");
        } finally {
            setLoadingImpact(false);
        }
    }

    // Helper to get live adjusted data or fallback to baseline
    const liveData = selectedPlot?.live_adjusted;
    const hasLiveAdjustments = !!(liveData && liveData.total_applications > 0);

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 via-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white">
                            <FlaskConical className="h-6 w-6" />
                        </div>
                        {t("sidebar.nutrition", "Precision Nutrition & Soil Dynamics")}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Plot-wise soil testing, crop absorption tracking, continuous fertilizer adjustments & AI advice
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => loadPlots(selectedPlot?.land_record_id)}
                        disabled={loadingPlots}
                        className="gap-2 rounded-xl"
                    >
                        <RefreshCw className={`h-4 w-4 ${loadingPlots ? "animate-spin" : ""}`} />
                        Refresh Plots
                    </Button>
                </div>
            </div>

            {/* ── Alerts ── */}
            {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-2xl border border-rose-200 dark:border-rose-800/60 flex items-start gap-3 shadow-sm animate-in fade-in">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-rose-500 hover:text-rose-700 text-lg leading-none font-bold">×</button>
                </div>
            )}

            {successMessage && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3 shadow-sm animate-in fade-in">
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm font-medium">{successMessage}</p>
                    <button onClick={() => setSuccessMessage(null)} className="ml-auto text-emerald-500 hover:text-emerald-700 text-lg leading-none font-bold">×</button>
                </div>
            )}

            {/* ── Loading State ── */}
            {loadingPlots && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                    <p className="text-slate-600 dark:text-slate-400">Loading your land plots and soil health records...</p>
                </div>
            )}

            {/* ── Empty State ── */}
            {!loadingPlots && plots.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-100 dark:bg-slate-800/60 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center p-8">
                    <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
                        <MapPin className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">No Land Plots Found</h3>
                    <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-md">
                        Please set up your farmer profile with land records first. Go to your <strong>Profile</strong> page to add your land plots, then come back here.
                    </p>
                </div>
            )}

            {/* ── Main Tabs Layout ── */}
            {!loadingPlots && plots.length > 0 && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <TabsList className="bg-transparent p-0 h-auto flex flex-wrap gap-1">
                            <TabsTrigger
                                value="plots"
                                className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm font-medium"
                            >
                                <MapPin className="h-4 w-4 text-blue-500" />
                                My Plots ({plots.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="manager"
                                className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm font-medium"
                                disabled={!selectedPlot}
                            >
                                <Beaker className="h-4 w-4 text-teal-500" />
                                Nutrition Manager
                                {selectedPlot && (
                                    <Badge variant="secondary" className="ml-1 text-[11px] px-1.5 py-0 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                                        Plot {selectedPlot.serial_number}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger
                                value="impact"
                                className="gap-2 rounded-xl px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm font-medium"
                                disabled={!selectedPlot?.soil_data}
                            >
                                <BarChart3 className="h-4 w-4 text-purple-500" />
                                Fertilizer Impact
                                {fertHistory.length > 0 && (
                                    <Badge variant="secondary" className="ml-1 text-[11px] px-1.5 py-0 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                                        {fertHistory.length}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>

                        {/* Quick Plot Switcher in Tab Bar when on Manager/Impact */}
                        {selectedPlot && activeTab !== "plots" && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                <span className="text-xs text-slate-500 font-medium">Current:</span>
                                <span className="text-xs font-bold text-foreground">Plot {selectedPlot.serial_number}</span>
                                <button
                                    onClick={() => setActiveTab("plots")}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-1 font-semibold flex items-center gap-0.5"
                                >
                                    Switch Plot <ArrowRight className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ═══════════════════════════════════════════════════════
                        TAB 1: MY PLOTS (Select card -> Directs to Nutrition)
                       ═══════════════════════════════════════════════════════ */}
                    <TabsContent value="plots" className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div>
                                <h2 className="text-xl font-bold text-foreground">Your Land Plots ({plots.length})</h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Click any plot to open its <strong>Nutrition Manager</strong> and view instant AI advice
                                </p>
                            </div>
                            {selectedPlot && (
                                <Button
                                    onClick={() => setActiveTab("manager")}
                                    className="gap-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl shadow-md shadow-blue-500/20"
                                >
                                    <span>Manage Plot {selectedPlot.serial_number}</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {plots.map((plot) => {
                                const isSelected = selectedPlot?.land_record_id === plot.land_record_id;
                                const hasSoil = !!plot.soil_data;
                                const hasCrop = !!plot.crop_name;
                                const live = plot.live_adjusted;
                                const plotMode = cardViewModes[plot.land_record_id] || "baseline";
                                const totalApps = live?.total_applications || 0;

                                // Determine values to show based on mini card view mode
                                const displayN = (plotMode === "live" && live) ? live.adjusted.nitrogen : (plot.soil_data?.nitrogen ?? 0);
                                const displayP = (plotMode === "live" && live) ? live.adjusted.phosphorus : (plot.soil_data?.phosphorus ?? 0);
                                const displayK = (plotMode === "live" && live) ? live.adjusted.potassium : (plot.soil_data?.potassium ?? 0);
                                const deltaN = live?.deltas?.nitrogen || 0;
                                const deltaP = live?.deltas?.phosphorus || 0;
                                const deltaK = live?.deltas?.potassium || 0;

                                return (
                                    <div
                                        key={plot.land_record_id}
                                        onClick={() => handleSelectAndNavigate(plot)}
                                        className={`group relative text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 ${isSelected
                                            ? "border-blue-500 bg-gradient-to-b from-blue-50/60 to-white dark:from-blue-950/30 dark:to-slate-900 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20"
                                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700"
                                            }`}
                                    >
                                        <div>
                                            {/* Plot Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${hasSoil
                                                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                                        }`}>
                                                        <MapPin className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-foreground text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                                                            Plot {plot.serial_number}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 font-medium">{plot.area} acres</p>
                                                    </div>
                                                </div>
                                                {isSelected ? (
                                                    <Badge className="bg-blue-600 text-white text-xs border-0 shadow-sm px-2.5 py-0.5">
                                                        Selected
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold flex items-center gap-0.5">
                                                        Open <ArrowRight className="h-3 w-3" />
                                                    </span>
                                                )}
                                            </div>

                                            {/* Status Indicators */}
                                            <div className="space-y-1.5 mb-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <Beaker className={`h-3.5 w-3.5 ${hasSoil ? "text-emerald-500" : "text-slate-400"}`} />
                                                        <span className={hasSoil ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-slate-500"}>
                                                            {hasSoil ? "Soil test registered" : "No soil test yet"}
                                                        </span>
                                                    </div>
                                                    {hasSoil && plot.soil_data?.ph_level && (
                                                        <span className="font-semibold text-slate-600 dark:text-slate-400">
                                                            pH {plot.soil_data.ph_level}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <Sprout className={`h-3.5 w-3.5 ${hasCrop ? "text-green-500" : "text-slate-400"}`} />
                                                        <span className={hasCrop ? "text-green-700 dark:text-green-400 font-medium" : "text-slate-500"}>
                                                            {hasCrop ? `${plot.crop_name} (${plot.crop_status})` : "No crop linked"}
                                                        </span>
                                                    </div>
                                                    {totalApps > 0 && (
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/30">
                                                            {totalApps} fert applied
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Mini NPK Metric Display (Baseline vs Live Switch) */}
                                            {hasSoil && (
                                                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                                    {/* Card Mini Toggle if applications exist */}
                                                    {totalApps > 0 && (
                                                        <div
                                                            className="flex items-center justify-between"
                                                            onClick={(e) => e.stopPropagation()} // Prevent parent navigation when toggling mini view
                                                        >
                                                            <span className="text-[11px] font-semibold text-slate-500">View Values:</span>
                                                            <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg text-[10px]">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setCardViewModes({ ...cardViewModes, [plot.land_record_id]: "baseline" })}
                                                                    className={`px-2 py-0.5 rounded-md font-medium transition-colors ${plotMode === "baseline"
                                                                        ? "bg-white dark:bg-slate-700 text-foreground shadow-xs font-bold"
                                                                        : "text-slate-600 dark:text-slate-400 hover:text-foreground"
                                                                        }`}
                                                                >
                                                                    Lab Test
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setCardViewModes({ ...cardViewModes, [plot.land_record_id]: "live" })}
                                                                    className={`px-2 py-0.5 rounded-md font-medium transition-colors flex items-center gap-0.5 ${plotMode === "live"
                                                                        ? "bg-teal-500 text-white shadow-xs font-bold"
                                                                        : "text-slate-600 dark:text-slate-400 hover:text-foreground"
                                                                        }`}
                                                                >
                                                                    <Zap className="h-2.5 w-2.5" /> Live Adjusted
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* NPK Values Grid */}
                                                    <div className="grid grid-cols-3 gap-2 text-center bg-slate-50/80 dark:bg-slate-800/40 p-2.5 rounded-xl">
                                                        <div>
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Nitrogen</p>
                                                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{displayN}</p>
                                                            {plotMode === "live" && deltaN !== 0 && (
                                                                <span className={`text-[10px] font-semibold ${deltaN > 0 ? "text-emerald-500" : "text-amber-500"}`}>
                                                                    {deltaN > 0 ? `+${deltaN}` : deltaN}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Phosphorus</p>
                                                            <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{displayP}</p>
                                                            {plotMode === "live" && deltaP !== 0 && (
                                                                <span className={`text-[10px] font-semibold ${deltaP > 0 ? "text-emerald-500" : "text-amber-500"}`}>
                                                                    {deltaP > 0 ? `+${deltaP}` : deltaP}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Potassium</p>
                                                            <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{displayK}</p>
                                                            {plotMode === "live" && deltaK !== 0 && (
                                                                <span className={`text-[10px] font-semibold ${deltaK > 0 ? "text-emerald-500" : "text-amber-500"}`}>
                                                                    {deltaK > 0 ? `+${deltaK}` : deltaK}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Bottom Action Hint */}
                                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                            <span className="text-slate-500">
                                                {hasSoil ? "Tap to view AI nutrition advice" : "Tap to add soil test data"}
                                            </span>
                                            <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                                                Manage <ArrowRight className="h-3.5 w-3.5" />
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* ═══════════════════════════════════════════════════════
                        TAB 2: NUTRITION MANAGER (Baseline vs Live Toggle + Auto AI)
                       ═══════════════════════════════════════════════════════ */}
                    <TabsContent value="manager" className="space-y-6">
                        {selectedPlot && (
                            <>
                                {/* ── Plot Context Bar & View Mode Toggle ── */}
                                <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50 via-teal-50 to-emerald-50 dark:from-blue-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border border-blue-100 dark:border-blue-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="h-13 w-13 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-foreground">Plot {selectedPlot.serial_number}</h3>
                                                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">
                                                    {selectedPlot.area} acres
                                                </Badge>
                                                {selectedPlot.crop_name && (
                                                    <Badge className="bg-emerald-600 text-white text-xs">
                                                        {selectedPlot.crop_name} ({selectedPlot.crop_status || "Growing"})
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                                {selectedPlot.soil_data
                                                    ? `Soil tested • ${fertHistory.length} fertilizer application(s) logged`
                                                    : "No soil test data added yet. Enter baseline parameters below."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* ── Baseline vs Live Toggle Switch ── */}
                                    {selectedPlot.soil_data && (
                                        <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-1.5 rounded-2xl border border-blue-200/60 dark:border-slate-700 shadow-xs">
                                            <button
                                                type="button"
                                                onClick={() => setManagerViewMode("baseline")}
                                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${managerViewMode === "baseline"
                                                    ? "bg-blue-600 text-white shadow-sm"
                                                    : "text-slate-600 dark:text-slate-400 hover:text-foreground"
                                                    }`}
                                            >
                                                <Beaker className="h-4 w-4" />
                                                Original Soil Test
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setManagerViewMode("live")}
                                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${managerViewMode === "live"
                                                    ? "bg-teal-600 text-white shadow-sm"
                                                    : "text-slate-600 dark:text-slate-400 hover:text-foreground"
                                                    }`}
                                            >
                                                <Zap className="h-4 w-4" />
                                                Live Root Zone (Adjusted)
                                                {hasLiveAdjustments && (
                                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* ── Comparison Banner / Modal Trigger ── */}
                                {hasLiveAdjustments && (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs">
                                        <div className="flex items-center gap-2.5">
                                            <Scale className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                            <span>
                                                <strong>Soil Dynamics Active:</strong> Original lab baseline is preserved. Live values reflect <strong>{liveData?.total_applications}</strong> fertilizer event(s) and <strong>{selectedPlot.crop_name || "crop"}</strong> absorption.
                                            </span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setShowComparisonModal(!showComparisonModal)}
                                            className="bg-white dark:bg-slate-900 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100 rounded-xl gap-1.5 text-xs h-8"
                                        >
                                            <SlidersHorizontal className="h-3.5 w-3.5" />
                                            {showComparisonModal ? "Hide Ledger" : "Compare Baseline vs Live"}
                                        </Button>
                                    </div>
                                )}

                                {/* ── Side-by-Side Comparison Ledger (Collapsible / Modal) ── */}
                                {showComparisonModal && liveData && (
                                    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                                                    <Scale className="h-4 w-4" />
                                                </div>
                                                <h4 className="text-base font-bold text-foreground">Soil Nutrient Balance & Crop Absorption Ledger</h4>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                Crop: {selectedPlot.crop_name || "General Crop"}
                                            </Badge>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                                                        <th className="py-2.5 px-3 font-semibold">Nutrient</th>
                                                        <th className="py-2.5 px-3 font-semibold">🧪 Original Lab Test</th>
                                                        <th className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">+ Fertilizers Added</th>
                                                        <th className="py-2.5 px-3 font-semibold text-rose-500 dark:text-rose-400">- Crop Absorbed</th>
                                                        <th className="py-2.5 px-3 font-semibold text-teal-600 dark:text-teal-400">⚡ Live Available</th>
                                                        <th className="py-2.5 px-3 font-semibold">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                                    <tr>
                                                        <td className="py-3 px-3 font-bold text-foreground">Nitrogen (N)</td>
                                                        <td className="py-3 px-3 font-mono">{liveData.baseline.nitrogen} kg/ha</td>
                                                        <td className="py-3 px-3 font-mono text-emerald-600 dark:text-emerald-400">+{liveData.added_nutrients.nitrogen} kg/ha</td>
                                                        <td className="py-3 px-3 font-mono text-rose-500 dark:text-rose-400">-{liveData.crop_absorbed.nitrogen} kg/ha</td>
                                                        <td className="py-3 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">{liveData.adjusted.nitrogen} kg/ha</td>
                                                        <td className="py-3 px-3">{nutrientStatusBadge(liveData.nutrient_balance.nitrogen)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="py-3 px-3 font-bold text-foreground">Phosphorus (P)</td>
                                                        <td className="py-3 px-3 font-mono">{liveData.baseline.phosphorus} kg/ha</td>
                                                        <td className="py-3 px-3 font-mono text-emerald-600 dark:text-emerald-400">+{liveData.added_nutrients.phosphorus} kg/ha</td>
                                                        <td className="py-3 px-3 font-mono text-rose-500 dark:text-rose-400">-{liveData.crop_absorbed.phosphorus} kg/ha</td>
                                                        <td className="py-3 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">{liveData.adjusted.phosphorus} kg/ha</td>
                                                        <td className="py-3 px-3">{nutrientStatusBadge(liveData.nutrient_balance.phosphorus)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="py-3 px-3 font-bold text-foreground">Potassium (K)</td>
                                                        <td className="py-3 px-3 font-mono">{liveData.baseline.potassium} kg/ha</td>
                                                        <td className="py-3 px-3 font-mono text-emerald-600 dark:text-emerald-400">+{liveData.added_nutrients.potassium} kg/ha</td>
                                                        <td className="py-3 px-3 font-mono text-rose-500 dark:text-rose-400">-{liveData.crop_absorbed.potassium} kg/ha</td>
                                                        <td className="py-3 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">{liveData.adjusted.potassium} kg/ha</td>
                                                        <td className="py-3 px-3">{nutrientStatusBadge(liveData.nutrient_balance.potassium)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="py-3 px-3 font-bold text-foreground">pH Level</td>
                                                        <td className="py-3 px-3 font-mono">{liveData.baseline.ph_level}</td>
                                                        <td className="py-3 px-3 font-mono text-slate-500" colSpan={2}>
                                                            {liveData.deltas.ph_level !== 0 ? `Shift: ${liveData.deltas.ph_level > 0 ? "+" : ""}${liveData.deltas.ph_level}` : "Buffered"}
                                                        </td>
                                                        <td className="py-3 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">{liveData.adjusted.ph_level}</td>
                                                        <td className="py-3 px-3">{nutrientStatusBadge(liveData.nutrient_balance.ph)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <p className="text-[11px] text-slate-500 italic">
                                            * Note: Crop absorption rates are dynamically modeled based on {selectedPlot.crop_name || "the linked crop"}&apos;s physiological nutrient uptake kinetics.
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* ── Left Column: Soil Parameters & Crop Link ── */}
                                    <div className="lg:col-span-5 space-y-6">
                                        {/* 1. Soil Parameters Card (Switches content based on managerViewMode) */}
                                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-bold flex items-center gap-2.5 text-foreground">
                                                    {managerViewMode === "baseline" ? (
                                                        <>
                                                            <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                                                <Beaker className="h-4 w-4" />
                                                            </div>
                                                            Original Soil Test Parameters
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="h-8 w-8 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                                                                <Zap className="h-4 w-4" />
                                                            </div>
                                                            Live Adjusted Root Zone
                                                        </>
                                                    )}
                                                </h3>
                                            </div>

                                            {/* MODE A: BASELINE LAB TEST FORM */}
                                            {managerViewMode === "baseline" ? (
                                                <>
                                                    <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                                                        <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
                                                        <span>
                                                            These are the certified laboratory soil test values you entered. They remain safely stored as your immutable baseline and are never overwritten.
                                                        </span>
                                                    </div>

                                                    <form onSubmit={handleSaveSoil} className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-1.5">
                                                                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                    Nitrogen (N) kg/ha
                                                                </Label>
                                                                <Input
                                                                    required
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={soilForm.nitrogen}
                                                                    onChange={e => setSoilForm({ ...soilForm, nitrogen: e.target.value })}
                                                                    placeholder="e.g. 150"
                                                                    className="rounded-xl font-mono text-sm"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                    Phosphorus (P) kg/ha
                                                                </Label>
                                                                <Input
                                                                    required
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={soilForm.phosphorus}
                                                                    onChange={e => setSoilForm({ ...soilForm, phosphorus: e.target.value })}
                                                                    placeholder="e.g. 50"
                                                                    className="rounded-xl font-mono text-sm"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                    Potassium (K) kg/ha
                                                                </Label>
                                                                <Input
                                                                    required
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={soilForm.potassium}
                                                                    onChange={e => setSoilForm({ ...soilForm, potassium: e.target.value })}
                                                                    placeholder="e.g. 200"
                                                                    className="rounded-xl font-mono text-sm"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                    pH Level (0-14)
                                                                </Label>
                                                                <Input
                                                                    required
                                                                    type="number"
                                                                    step="0.1"
                                                                    value={soilForm.ph_level}
                                                                    onChange={e => setSoilForm({ ...soilForm, ph_level: e.target.value })}
                                                                    placeholder="e.g. 6.5"
                                                                    className="rounded-xl font-mono text-sm"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                Organic Carbon % (optional)
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={soilForm.organic_carbon}
                                                                onChange={e => setSoilForm({ ...soilForm, organic_carbon: e.target.value })}
                                                                placeholder="e.g. 0.55"
                                                                className="rounded-xl font-mono text-sm"
                                                            />
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                Observations / Soil Notes (optional)
                                                            </Label>
                                                            <Input
                                                                value={soilForm.notes}
                                                                onChange={e => setSoilForm({ ...soilForm, notes: e.target.value })}
                                                                placeholder="e.g. Clay loam, slight salinity..."
                                                                className="rounded-xl text-sm"
                                                            />
                                                        </div>

                                                        <Button
                                                            type="submit"
                                                            disabled={savingSoil}
                                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-5 shadow-sm transition-all"
                                                        >
                                                            {savingSoil ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                    Updating & Generating Advice...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Sparkles className="h-4 w-4 mr-2" />
                                                                    {selectedPlot.soil_data ? "Update Soil Data & Regenerate" : "Save Soil Data & Generate Advice"}
                                                                </>
                                                            )}
                                                        </Button>
                                                    </form>
                                                </>
                                            ) : (
                                                /* MODE B: LIVE DYNAMIC ADJUSTMENTS VIEW */
                                                <div className="space-y-4">
                                                    <div className="p-3 bg-teal-50/60 dark:bg-teal-950/20 rounded-xl border border-teal-100 dark:border-teal-900/40 text-xs text-teal-800 dark:text-teal-300 flex items-start gap-2">
                                                        <Zap className="h-4 w-4 shrink-0 mt-0.5 text-teal-600" />
                                                        <span>
                                                            Calculated in real-time by adding nutrients from <strong>{fertHistory.length} fertilizer events</strong> and subtracting dynamic absorption by <strong>{selectedPlot.crop_name || "your crop"}</strong>.
                                                        </span>
                                                    </div>

                                                    {liveData ? (
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-xs text-slate-500 font-semibold">Nitrogen (N)</span>
                                                                    {nutrientStatusBadge(liveData.nutrient_balance.nitrogen)}
                                                                </div>
                                                                <p className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
                                                                    {liveData.adjusted.nitrogen} <span className="text-xs font-normal text-slate-500">kg/ha</span>
                                                                </p>
                                                                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                                                    Baseline: {liveData.baseline.nitrogen}
                                                                    <span className={liveData.deltas.nitrogen >= 0 ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                                                                        ({liveData.deltas.nitrogen >= 0 ? "+" : ""}{liveData.deltas.nitrogen})
                                                                    </span>
                                                                </p>
                                                            </div>

                                                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-xs text-slate-500 font-semibold">Phosphorus (P)</span>
                                                                    {nutrientStatusBadge(liveData.nutrient_balance.phosphorus)}
                                                                </div>
                                                                <p className="text-xl font-bold font-mono text-orange-600 dark:text-orange-400">
                                                                    {liveData.adjusted.phosphorus} <span className="text-xs font-normal text-slate-500">kg/ha</span>
                                                                </p>
                                                                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                                                    Baseline: {liveData.baseline.phosphorus}
                                                                    <span className={liveData.deltas.phosphorus >= 0 ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                                                                        ({liveData.deltas.phosphorus >= 0 ? "+" : ""}{liveData.deltas.phosphorus})
                                                                    </span>
                                                                </p>
                                                            </div>

                                                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-xs text-slate-500 font-semibold">Potassium (K)</span>
                                                                    {nutrientStatusBadge(liveData.nutrient_balance.potassium)}
                                                                </div>
                                                                <p className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">
                                                                    {liveData.adjusted.potassium} <span className="text-xs font-normal text-slate-500">kg/ha</span>
                                                                </p>
                                                                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                                                    Baseline: {liveData.baseline.potassium}
                                                                    <span className={liveData.deltas.potassium >= 0 ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                                                                        ({liveData.deltas.potassium >= 0 ? "+" : ""}{liveData.deltas.potassium})
                                                                    </span>
                                                                </p>
                                                            </div>

                                                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-xs text-slate-500 font-semibold">pH Level</span>
                                                                    {nutrientStatusBadge(liveData.nutrient_balance.ph)}
                                                                </div>
                                                                <p className="text-xl font-bold font-mono text-teal-600 dark:text-teal-400">
                                                                    {liveData.adjusted.ph_level}
                                                                </p>
                                                                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                                                    Baseline: {liveData.baseline.ph_level}
                                                                    <span className="text-slate-600 font-medium">
                                                                        ({liveData.deltas.ph_level !== 0 ? `${liveData.deltas.ph_level > 0 ? "+" : ""}${liveData.deltas.ph_level}` : "±0.0"})
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-slate-500 text-center py-4">No live data available.</p>
                                                    )}

                                                    {/* Crop Absorption Note */}
                                                    {liveData?.crop_absorbed?.absorption_note && (
                                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
                                                            <p className="font-semibold text-foreground mb-0.5 flex items-center gap-1.5">
                                                                <Leaf className="h-3.5 w-3.5 text-green-500" />
                                                                Crop Uptake Kinetics
                                                            </p>
                                                            <p className="text-slate-600 dark:text-slate-400">{liveData.crop_absorbed.absorption_note}</p>
                                                        </div>
                                                    )}

                                                    <Button
                                                        type="button"
                                                        onClick={() => setActiveTab("impact")}
                                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-5 shadow-sm gap-2"
                                                    >
                                                        <Plus className="h-4 w-4" /> Log Fertilizer Application
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* 2. Link Crop Card */}
                                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                            <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
                                                <Leaf className="h-5 w-5 text-green-500" />
                                                Active Crop on Plot {selectedPlot.serial_number}
                                            </h3>

                                            {activeCrops.length === 0 ? (
                                                <p className="text-xs text-slate-500">
                                                    No crops currently growing. Add a crop in your Crop Manager to link here.
                                                </p>
                                            ) : (
                                                <div className="space-y-3">
                                                    <select
                                                        value={selectedCropId}
                                                        onChange={e => setSelectedCropId(e.target.value)}
                                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                                                    >
                                                        <option value="">Select a crop for this plot...</option>
                                                        {activeCrops.map(c => (
                                                            <option key={c.id} value={c.id}>
                                                                {c.name} ({c.crop_type || "Crop"}) — {c.area} acres ({c.season || "Active"})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <Button
                                                        onClick={handleLinkCrop}
                                                        disabled={!selectedCropId || !selectedPlot.soil_data || linkingCrop}
                                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                                                    >
                                                        {linkingCrop ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        ) : (
                                                            <Sprout className="h-4 w-4 mr-2" />
                                                        )}
                                                        {selectedPlot.crop_id ? "Update Linked Crop" : "Link Crop to Plot"}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ── Right Column: AI Recommendations (Auto-Generated) ── */}
                                    <div className="lg:col-span-7 space-y-6">
                                        {!selectedPlot.soil_data && (
                                            <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
                                                <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
                                                    <Target className="h-8 w-8" />
                                                </div>
                                                <h3 className="text-xl font-bold text-foreground">Save Soil Test to Get AI Advice</h3>
                                                <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-md text-sm">
                                                    Enter your Nitrogen, Phosphorus, Potassium and pH test parameters on the left and click &quot;Save Soil Data&quot;. AgriFlow AI will automatically analyze your plot and provide tailored recommendations.
                                                </p>
                                            </div>
                                        )}

                                        {selectedPlot.soil_data && loadingRec && (
                                            <div className="h-96 flex flex-col items-center justify-center p-12 space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                <div className="relative">
                                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-400 animate-pulse flex items-center justify-center text-white">
                                                        <Sparkles className="h-7 w-7" />
                                                    </div>
                                                </div>
                                                <h3 className="text-base font-bold text-foreground">AgriFlow AI Analyzing Plot {selectedPlot.serial_number}...</h3>
                                                <p className="text-xs text-slate-500 max-w-sm text-center">
                                                    Evaluating soil test parameters, crop nutrient demand, and application timing...
                                                </p>
                                            </div>
                                        )}

                                        {selectedPlot.soil_data && !loadingRec && recommendation && (
                                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                {/* Status Card */}
                                                <div className={`p-6 rounded-3xl border shadow-sm ${statusBg(recommendation.status)}`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className={`text-lg font-bold flex items-center gap-2 ${statusColor(recommendation.status)}`}>
                                                            <Sparkles className="h-5 w-5" />
                                                            Soil Health Status: {recommendation.status}
                                                        </h3>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => fetchRecommendation(selectedPlot.soil_data!.id, true)}
                                                            className="h-8 gap-1 rounded-xl text-xs bg-white dark:bg-slate-900"
                                                        >
                                                            <RefreshCw className="h-3.5 w-3.5" /> Re-analyze
                                                        </Button>
                                                    </div>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                                        {recommendation.soil_health_summary}
                                                    </p>
                                                </div>

                                                {/* Recommended Fertilizers */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                                            <Package className="h-5 w-5 text-blue-500" />
                                                            Recommended Fertilizer Plan ({recommendation.recommendations.length})
                                                        </h3>
                                                        <span className="text-xs text-slate-500">
                                                            Tailored for {selectedPlot.area} acres of {selectedPlot.crop_name || "crop"}
                                                        </span>
                                                    </div>
                                                    <div className="grid gap-3.5 sm:grid-cols-2">
                                                        {recommendation.recommendations.map((rec, i) => (
                                                            <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
                                                                <div className="flex items-center gap-3 mb-3">
                                                                    <div className="h-9 w-9 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                                                                        {i + 1}
                                                                    </div>
                                                                    <h4 className="font-bold text-foreground text-sm">{rec.name}</h4>
                                                                </div>
                                                                <div className="space-y-2 text-xs">
                                                                    <div className="flex justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                                                                        <span className="text-slate-500 font-medium">Dose:</span>
                                                                        <span className="font-bold text-foreground font-mono">{rec.quantity}</span>
                                                                    </div>
                                                                    <div className="flex justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                                                                        <span className="text-slate-500 font-medium">Timing:</span>
                                                                        <span className="font-semibold text-right max-w-[65%] text-foreground">{rec.timing}</span>
                                                                    </div>
                                                                    <div className="flex justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                                                                        <span className="text-slate-500 font-medium">Method:</span>
                                                                        <span className="font-semibold text-right max-w-[65%] text-foreground">{rec.application_method}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Pro Tips */}
                                                {recommendation.additional_tips?.length > 0 && (
                                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
                                                        <h3 className="text-sm font-bold mb-3 text-foreground flex items-center gap-2">
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                            Agronomic Best Practices for This Plot
                                                        </h3>
                                                        <ul className="space-y-2">
                                                            {recommendation.additional_tips.map((tip, i) => (
                                                                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                                                    <span>{tip}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {!selectedPlot && (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-100 dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
                                <MapPin className="h-12 w-12 text-slate-400 mb-4" />
                                <h3 className="text-lg font-bold text-foreground">No Plot Selected</h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                                    Please go to the <strong>My Plots</strong> tab and click on a land plot first.
                                </p>
                                <Button
                                    onClick={() => setActiveTab("plots")}
                                    className="mt-4 bg-blue-600 text-white rounded-xl"
                                >
                                    Select a Plot
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    {/* ═══════════════════════════════════════════════════════
                        TAB 3: FERTILIZER IMPACT & APPLICATION LOG
                       ═══════════════════════════════════════════════════════ */}
                    <TabsContent value="impact" className="space-y-6">
                        {selectedPlot?.soil_data ? (
                            <>
                                {/* Context Header */}
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/40 dark:via-pink-950/30 dark:to-rose-950/40 border border-purple-100 dark:border-purple-900/60 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="h-13 w-13 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                                            <BarChart3 className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground">Fertilizer Impact Tracker — Plot {selectedPlot.serial_number}</h3>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                                {selectedPlot.crop_name ? `Growing ${selectedPlot.crop_name}` : "No crop linked"} • {selectedPlot.area} acres
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setManagerViewMode("live");
                                            setActiveTab("manager");
                                        }}
                                        variant="outline"
                                        className="gap-2 rounded-xl bg-white dark:bg-slate-900 text-xs font-semibold"
                                    >
                                        <Zap className="h-4 w-4 text-teal-500" />
                                        View Live Soil Dynamics
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Left: Log Application Form & History */}
                                    <div className="lg:col-span-5 space-y-6">
                                        {/* Form */}
                                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                            <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
                                                <Plus className="h-5 w-5 text-purple-500" />
                                                Log Fertilizer Application
                                            </h3>
                                            <form onSubmit={handleApplyFertilizer} className="space-y-3.5">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                        Fertilizer Name
                                                    </Label>
                                                    <select
                                                        required
                                                        value={fertForm.fertilizer_name}
                                                        onChange={e => setFertForm({ ...fertForm, fertilizer_name: e.target.value })}
                                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 font-medium"
                                                    >
                                                        <option value="">Select fertilizer type...</option>
                                                        <option value="Urea">Urea (46% N)</option>
                                                        <option value="DAP">DAP (18% N, 46% P2O5)</option>
                                                        <option value="MOP">MOP (Muriate of Potash 60% K2O)</option>
                                                        <option value="SSP">SSP (Single Super Phosphate 16% P)</option>
                                                        <option value="NPK 19:19:19">NPK Complex (19:19:19)</option>
                                                        <option value="Ammonium Sulphate">Ammonium Sulphate (21% N)</option>
                                                        <option value="Agricultural Lime">Agricultural Lime (pH Buffer)</option>
                                                        <option value="Gypsum">Gypsum (Alkalinity Treatment)</option>
                                                        <option value="Vermicompost">Vermicompost (Organic)</option>
                                                        <option value="FYM">FYM (Farm Yard Manure)</option>
                                                        <option value="Neem Cake">Neem Cake</option>
                                                        <option value="Zinc Sulphate">Zinc Sulphate</option>
                                                    </select>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                            Quantity Applied
                                                        </Label>
                                                        <Input
                                                            required
                                                            type="number"
                                                            step="0.1"
                                                            value={fertForm.quantity}
                                                            onChange={e => setFertForm({ ...fertForm, quantity: e.target.value })}
                                                            placeholder="e.g. 50"
                                                            className="rounded-xl font-mono text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                            Unit
                                                        </Label>
                                                        <select
                                                            value={fertForm.unit}
                                                            onChange={e => setFertForm({ ...fertForm, unit: e.target.value })}
                                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 font-medium"
                                                        >
                                                            <option value="kg">Kilograms (kg)</option>
                                                            <option value="bags">Bags (50 kg)</option>
                                                            <option value="liters">Liters</option>
                                                            <option value="tons">Tons</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                            Application Date
                                                        </Label>
                                                        <Input
                                                            required
                                                            type="date"
                                                            value={fertForm.application_date}
                                                            onChange={e => setFertForm({ ...fertForm, application_date: e.target.value })}
                                                            className="rounded-xl text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                            Method
                                                        </Label>
                                                        <select
                                                            value={fertForm.application_method}
                                                            onChange={e => setFertForm({ ...fertForm, application_method: e.target.value })}
                                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 font-medium"
                                                        >
                                                            <option value="Broadcasting">Broadcasting</option>
                                                            <option value="Fertigation">Fertigation (Drip)</option>
                                                            <option value="Band placement">Band placement</option>
                                                            <option value="Foliar spray">Foliar spray</option>
                                                            <option value="Top dressing">Top dressing</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <Button
                                                    type="submit"
                                                    disabled={applyingFert}
                                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-5 shadow-sm font-semibold"
                                                >
                                                    {applyingFert ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Logging & Calculating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Package className="h-4 w-4 mr-2" /> Log Application & Update Live Soil
                                                        </>
                                                    )}
                                                </Button>
                                            </form>
                                        </div>

                                        {/* History */}
                                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
                                                    <History className="h-5 w-5 text-purple-500" />
                                                    Recorded Fertilizer Events
                                                </h3>
                                                <Badge variant="secondary" className="text-xs">
                                                    {fertHistory.length}
                                                </Badge>
                                            </div>

                                            {loadingFertHistory ? (
                                                <div className="flex items-center justify-center py-6">
                                                    <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                                                </div>
                                            ) : fertHistory.length === 0 ? (
                                                <p className="text-xs text-slate-500 text-center py-6">
                                                    No fertilizer applications logged yet for this plot.
                                                </p>
                                            ) : (
                                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                                    {fertHistory.map((app) => (
                                                        <div key={app.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                                                            <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold shrink-0">
                                                                <Package className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-foreground truncate">{app.fertilizer_name}</p>
                                                                <p className="text-slate-500 font-mono">
                                                                    {app.quantity} {app.unit} • {new Date(app.application_date).toLocaleDateString()}
                                                                    {app.application_method && ` • ${app.application_method}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Impact Analysis */}
                                    <div className="lg:col-span-7 space-y-6">
                                        {!impactResult && !loadingImpact && (
                                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-4">
                                                <div className="h-14 w-14 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto">
                                                    <BarChart3 className="h-7 w-7" />
                                                </div>
                                                <h3 className="text-lg font-bold text-foreground">Analyze Fertilizer Impact</h3>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                                                    Evaluates the cumulative balance of all fertilizers added versus what the growing crop has absorbed, ensuring no nutrient toxicity or deficiencies.
                                                </p>
                                                <Button
                                                    onClick={handleAnalyzeImpact}
                                                    disabled={fertHistory.length === 0}
                                                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 py-5 shadow-sm text-xs font-semibold gap-2"
                                                >
                                                    <BarChart3 className="h-4 w-4" /> Run Comprehensive Impact Analysis
                                                </Button>
                                                {fertHistory.length === 0 && (
                                                    <p className="text-[11px] text-amber-600 dark:text-amber-400">
                                                        Log at least one fertilizer application first.
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {loadingImpact && (
                                            <div className="h-96 flex flex-col items-center justify-center p-12 space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                                                <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
                                                <p className="text-sm font-semibold text-foreground">
                                                    Analyzing cumulative nutrient impact on Plot {selectedPlot.serial_number}...
                                                </p>
                                            </div>
                                        )}

                                        {impactResult && !loadingImpact && (
                                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                                                {/* Overall Status */}
                                                <div className={`p-6 rounded-3xl border shadow-sm ${statusBg(impactResult.overall_status)}`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className={`text-lg font-bold flex items-center gap-2 ${statusColor(impactResult.overall_status)}`}>
                                                            <Target className="h-5 w-5" />
                                                            Nutrient Status: {impactResult.overall_status}
                                                        </h3>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={handleAnalyzeImpact}
                                                            className="h-8 gap-1 rounded-xl text-xs bg-white dark:bg-slate-900"
                                                        >
                                                            <RefreshCw className="h-3.5 w-3.5" /> Re-check
                                                        </Button>
                                                    </div>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                                        {impactResult.analysis_summary}
                                                    </p>
                                                </div>

                                                {/* Nutrient Balance Grid */}
                                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                                        <Layers className="h-5 w-5 text-purple-500" />
                                                        Current Effective Soil Balance
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-3.5">
                                                        {Object.entries(impactResult.nutrient_balance).map(([key, status]) => (
                                                            <div key={key} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                                                <div>
                                                                    <p className="text-xs text-slate-500 font-semibold">{nutrientLabel(key)}</p>
                                                                    <p className="text-sm font-bold font-mono text-foreground mt-0.5">
                                                                        {impactResult.estimated_levels[key] !== undefined ? `${impactResult.estimated_levels[key]}${key === "ph" ? "" : " kg/ha"}` : "—"}
                                                                    </p>
                                                                </div>
                                                                <div>{nutrientStatusBadge(status)}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Adjusted Next-Step Recommendations */}
                                                {impactResult.adjusted_recommendations?.length > 0 && (
                                                    <div className="space-y-3">
                                                        <h3 className="text-base font-bold text-foreground">
                                                            Next Targeted Nutrient Applications
                                                        </h3>
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            {impactResult.adjusted_recommendations.map((rec, i) => (
                                                                <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className="h-7 w-7 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xs">
                                                                            {i + 1}
                                                                        </div>
                                                                        <h4 className="font-bold text-sm text-foreground">{rec.name}</h4>
                                                                    </div>
                                                                    <div className="space-y-1 text-xs">
                                                                        <div className="flex justify-between text-slate-500">
                                                                            <span>Dose:</span>
                                                                            <span className="font-bold text-foreground font-mono">{rec.quantity}</span>
                                                                        </div>
                                                                        <div className="flex justify-between text-slate-500">
                                                                            <span>Timing:</span>
                                                                            <span className="font-semibold text-right max-w-[65%] text-foreground">{rec.timing}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Risk Alerts */}
                                                {impactResult.risk_alerts?.length > 0 && (
                                                    <div className="bg-rose-50 dark:bg-rose-950/20 rounded-3xl p-5 border border-rose-100 dark:border-rose-900/50 space-y-3">
                                                        <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                                                            <ShieldAlert className="h-4 w-4" />
                                                            Agronomic Risk Alerts
                                                        </h3>
                                                        <ul className="space-y-2">
                                                            {impactResult.risk_alerts.map((alert, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                                                                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                                                    <span>{alert}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-100 dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
                                <BarChart3 className="h-12 w-12 text-slate-400 mb-4" />
                                <h3 className="text-lg font-bold text-foreground">Soil Test Required</h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm max-w-sm">
                                    Select a plot and save its soil test in the <strong>Nutrition Manager</strong> tab before tracking fertilizer impact.
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
    Droplets, FlaskConical, Sprout, Loader2, Info, CheckCircle2, AlertTriangle,
    MapPin, Leaf, Plus, Beaker, BarChart3, ArrowRight, Calendar, Package,
    TrendingUp, TrendingDown, Minus, RefreshCw, Sparkles, ShieldAlert, Target
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
    if (status.toLowerCase().includes("good") || status.toLowerCase().includes("optimal")) return "text-emerald-600 dark:text-emerald-400";
    if (status.toLowerCase().includes("poor") || status.toLowerCase().includes("risk")) return "text-red-500 dark:text-red-400";
    return "text-amber-500 dark:text-amber-400";
}

function statusBg(status: string) {
    if (status.toLowerCase().includes("good") || status.toLowerCase().includes("optimal")) return "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50";
    if (status.toLowerCase().includes("poor") || status.toLowerCase().includes("risk")) return "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800/50";
    return "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50";
}

function nutrientStatusIcon(status: string) {
    if (status === "optimal") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (status === "excessive") return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (status === "deficient") return <TrendingDown className="h-4 w-4 text-amber-500" />;
    if (status === "acidic") return <TrendingDown className="h-4 w-4 text-amber-500" />;
    if (status === "alkaline") return <TrendingUp className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
}

function nutrientLabel(key: string) {
    const labels: Record<string, string> = { nitrogen: "Nitrogen (N)", phosphorus: "Phosphorus (P)", potassium: "Potassium (K)", ph: "pH Level" };
    return labels[key] || key;
}

// ── Component ──────────────────────────────────────────────────
export default function PrecisionNutritionPage() {
    const { t } = useLanguage();

    // Global state
    const [plots, setPlots] = useState<PlotOverview[]>([]);
    const [activeCrops, setActiveCrops] = useState<ActiveCrop[]>([]);
    const [selectedPlot, setSelectedPlot] = useState<PlotOverview | null>(null);
    const [loadingPlots, setLoadingPlots] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Tab 2 state — Nutrition Manager
    const [soilForm, setSoilForm] = useState({ nitrogen: "", phosphorus: "", potassium: "", ph_level: "", organic_carbon: "", notes: "" });
    const [savingSoil, setSavingSoil] = useState(false);
    const [linkingCrop, setLinkingCrop] = useState(false);
    const [selectedCropId, setSelectedCropId] = useState<string>("");
    const [recommendation, setRecommendation] = useState<PlotNutritionRecommendation | null>(null);
    const [loadingRec, setLoadingRec] = useState(false);

    // Tab 3 state — Fertilizer Impact
    const [fertForm, setFertForm] = useState({ fertilizer_name: "", quantity: "", unit: "kg", application_date: "", application_method: "", notes: "" });
    const [fertHistory, setFertHistory] = useState<FertilizerApplicationData[]>([]);
    const [loadingFertHistory, setLoadingFertHistory] = useState(false);
    const [applyingFert, setApplyingFert] = useState(false);
    const [impactResult, setImpactResult] = useState<ImpactAnalysis | null>(null);
    const [loadingImpact, setLoadingImpact] = useState(false);

    // ── Data loading ─────────────────────────────────────────
    const loadPlots = useCallback(async () => {
        setLoadingPlots(true);
        setError(null);
        try {
            const [p, c] = await Promise.all([getPlots(), getActiveCrops()]);
            setPlots(p);
            setActiveCrops(c);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to load plot data.");
        } finally {
            setLoadingPlots(false);
        }
    }, []);

    useEffect(() => { loadPlots(); }, [loadPlots]);

    // When a plot is selected, prefill soil form and load history
    useEffect(() => {
        if (!selectedPlot) return;
        const sd = selectedPlot.soil_data;
        if (sd) {
            setSoilForm({
                nitrogen: String(sd.nitrogen), phosphorus: String(sd.phosphorus),
                potassium: String(sd.potassium), ph_level: String(sd.ph_level),
                organic_carbon: sd.organic_carbon != null ? String(sd.organic_carbon) : "",
                notes: sd.notes || "",
            });
            setSelectedCropId(sd.crop_id ? String(sd.crop_id) : "");
            // Load fertilizer history
            loadFertHistory(sd.id);
        } else {
            setSoilForm({ nitrogen: "", phosphorus: "", potassium: "", ph_level: "", organic_carbon: "", notes: "" });
            setSelectedCropId("");
            setFertHistory([]);
        }
        setRecommendation(null);
        setImpactResult(null);
    }, [selectedPlot]);

    async function loadFertHistory(plotSoilId: number) {
        setLoadingFertHistory(true);
        try {
            const data = await getFertilizerHistory(plotSoilId);
            setFertHistory(data);
        } catch { setFertHistory([]); }
        finally { setLoadingFertHistory(false); }
    }

    // ── Handlers ─────────────────────────────────────────────
    async function handleSaveSoil(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedPlot) return;
        setSavingSoil(true);
        try {
            const payload = {
                nitrogen: parseFloat(soilForm.nitrogen) || 0,
                phosphorus: parseFloat(soilForm.phosphorus) || 0,
                potassium: parseFloat(soilForm.potassium) || 0,
                ph_level: parseFloat(soilForm.ph_level) || 7,
                organic_carbon: soilForm.organic_carbon ? parseFloat(soilForm.organic_carbon) : null,
                notes: soilForm.notes || null,
            };
            await savePlotSoilData(selectedPlot.land_record_id, payload);
            await loadPlots();
            // Re-select updated plot
            const updated = (await getPlots()).find(p => p.land_record_id === selectedPlot.land_record_id);
            if (updated) setSelectedPlot(updated);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to save soil data.");
        } finally { setSavingSoil(false); }
    }

    async function handleLinkCrop() {
        if (!selectedPlot?.soil_data || !selectedCropId) return;
        setLinkingCrop(true);
        try {
            await linkCropToPlot(selectedPlot.soil_data.id, parseInt(selectedCropId));
            await loadPlots();
            const updated = (await getPlots()).find(p => p.land_record_id === selectedPlot.land_record_id);
            if (updated) setSelectedPlot(updated);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to link crop.");
        } finally { setLinkingCrop(false); }
    }

    async function handleGetRecommendation() {
        if (!selectedPlot?.soil_data) return;
        setLoadingRec(true);
        setRecommendation(null);
        try {
            const data = await getPlotRecommendation(selectedPlot.soil_data.id);
            setRecommendation(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to get recommendation.");
        } finally { setLoadingRec(false); }
    }

    async function handleApplyFertilizer(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedPlot?.soil_data) return;
        setApplyingFert(true);
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
            setFertForm({ fertilizer_name: "", quantity: "", unit: "kg", application_date: "", application_method: "", notes: "" });
            await loadFertHistory(selectedPlot.soil_data.id);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to log fertilizer.");
        } finally { setApplyingFert(false); }
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
        } finally { setLoadingImpact(false); }
    }

    // ── Render ───────────────────────────────────────────────
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                            <FlaskConical className="h-5 w-5 text-white" />
                        </div>
                        {t("sidebar.nutrition", "Precision Nutrition")}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Plot-wise soil analysis, crop-specific fertilizer recommendations & impact tracking
                    </p>
                </div>
                <Button variant="outline" onClick={loadPlots} disabled={loadingPlots} className="gap-2">
                    <RefreshCw className={`h-4 w-4 ${loadingPlots ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">×</button>
                </div>
            )}

            {/* Loading State */}
            {loadingPlots && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                    <p className="text-muted-foreground">Loading your plots...</p>
                </div>
            )}

            {/* Empty State */}
            {!loadingPlots && plots.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                        <MapPin className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-medium text-foreground">No Land Plots Found</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        Please set up your farmer profile with land records first. Go to your <strong>Profile</strong> page to add land records, then come back here.
                    </p>
                </div>
            )}

            {/* Main Content */}
            {!loadingPlots && plots.length > 0 && (
                <Tabs defaultValue="plots" className="space-y-6">
                    <TabsList className="w-full justify-start bg-slate-100 dark:bg-slate-900 p-1 rounded-xl h-auto flex-wrap">
                        <TabsTrigger value="plots" className="gap-2 rounded-lg px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                            <MapPin className="h-4 w-4" />
                            My Plots
                        </TabsTrigger>
                        <TabsTrigger value="manager" className="gap-2 rounded-lg px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm" disabled={!selectedPlot}>
                            <Beaker className="h-4 w-4" />
                            Nutrition Manager
                        </TabsTrigger>
                        <TabsTrigger value="impact" className="gap-2 rounded-lg px-4 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm" disabled={!selectedPlot?.soil_data}>
                            <BarChart3 className="h-4 w-4" />
                            Fertilizer Impact
                        </TabsTrigger>
                    </TabsList>

                    {/* ═══════ TAB 1: MY PLOTS ═══════ */}
                    <TabsContent value="plots" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-foreground">Your Land Plots ({plots.length})</h2>
                            <p className="text-sm text-muted-foreground">Select a plot to manage its nutrition</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {plots.map((plot) => {
                                const isSelected = selectedPlot?.land_record_id === plot.land_record_id;
                                const hasSoil = !!plot.soil_data;
                                const hasCrop = !!plot.crop_name;
                                return (
                                    <button
                                        key={plot.land_record_id}
                                        onClick={() => setSelectedPlot(plot)}
                                        className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${isSelected
                                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-md shadow-blue-100 dark:shadow-blue-900/20"
                                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700"
                                            }`}
                                    >
                                        {/* Plot Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${hasSoil ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"}`}>
                                                    <MapPin className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground text-sm">Plot {plot.serial_number}</h3>
                                                    <p className="text-xs text-muted-foreground">{plot.area} acres</p>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs border-0">
                                                    Selected
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Status Indicators */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs">
                                                <Beaker className={`h-3.5 w-3.5 ${hasSoil ? "text-emerald-500" : "text-slate-400"}`} />
                                                <span className={hasSoil ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                                                    {hasSoil ? "Soil data available" : "No soil data yet"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <Sprout className={`h-3.5 w-3.5 ${hasCrop ? "text-green-500" : "text-slate-400"}`} />
                                                <span className={hasCrop ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                                                    {hasCrop ? `${plot.crop_name} (${plot.crop_status})` : "No crop linked"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* NPK Mini Bar (if soil data exists) */}
                                        {hasSoil && (
                                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">N</p>
                                                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{plot.soil_data!.nitrogen}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">P</p>
                                                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{plot.soil_data!.phosphorus}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">K</p>
                                                    <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{plot.soil_data!.potassium}</p>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {selectedPlot && (
                            <div className="flex items-center gap-2 pt-2">
                                <Info className="h-4 w-4 text-blue-500" />
                                <p className="text-sm text-muted-foreground">
                                    Plot <strong>{selectedPlot.serial_number}</strong> selected. Switch to the <strong>Nutrition Manager</strong> tab to add soil data and get recommendations.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    {/* ═══════ TAB 2: NUTRITION MANAGER ═══════ */}
                    <TabsContent value="manager" className="space-y-6">
                        {selectedPlot && (
                            <>
                                {/* Plot Info Bar */}
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/30 dark:to-teal-950/30 border border-blue-100 dark:border-blue-900/50">
                                    <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Plot {selectedPlot.serial_number}</h3>
                                        <p className="text-sm text-muted-foreground">{selectedPlot.area} acres • {selectedPlot.crop_name ? `Growing ${selectedPlot.crop_name}` : "No crop linked"}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Left: Soil Data + Crop Link */}
                                    <div className="lg:col-span-5 space-y-6">
                                        {/* Soil Data Form */}
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                                <Droplets className="h-5 w-5 text-blue-500" />
                                                Soil Test Parameters
                                            </h3>
                                            <form onSubmit={handleSaveSoil} className="space-y-4">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">Nitrogen (N) kg/ha</Label>
                                                        <Input required type="number" step="0.01" value={soilForm.nitrogen} onChange={e => setSoilForm({ ...soilForm, nitrogen: e.target.value })} placeholder="e.g. 150" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">Phosphorus (P) kg/ha</Label>
                                                        <Input required type="number" step="0.01" value={soilForm.phosphorus} onChange={e => setSoilForm({ ...soilForm, phosphorus: e.target.value })} placeholder="e.g. 50" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">Potassium (K) kg/ha</Label>
                                                        <Input required type="number" step="0.01" value={soilForm.potassium} onChange={e => setSoilForm({ ...soilForm, potassium: e.target.value })} placeholder="e.g. 200" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">pH Level</Label>
                                                        <Input required type="number" step="0.1" value={soilForm.ph_level} onChange={e => setSoilForm({ ...soilForm, ph_level: e.target.value })} placeholder="e.g. 6.5" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Organic Carbon % (optional)</Label>
                                                    <Input type="number" step="0.01" value={soilForm.organic_carbon} onChange={e => setSoilForm({ ...soilForm, organic_carbon: e.target.value })} placeholder="e.g. 0.5" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Notes (optional)</Label>
                                                    <Input value={soilForm.notes} onChange={e => setSoilForm({ ...soilForm, notes: e.target.value })} placeholder="Any observation..." />
                                                </div>
                                                <Button type="submit" disabled={savingSoil} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                                                    {savingSoil ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Beaker className="h-4 w-4 mr-2" />}
                                                    {selectedPlot.soil_data ? "Update Soil Data" : "Save Soil Data"}
                                                </Button>
                                            </form>
                                        </div>

                                        {/* Link Crop */}
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                                            <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
                                                <Leaf className="h-5 w-5 text-green-500" />
                                                Link Active Crop
                                            </h3>
                                            {activeCrops.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">No actively growing crops found. Add a crop with status &quot;Growing&quot; first.</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    <select
                                                        value={selectedCropId}
                                                        onChange={e => setSelectedCropId(e.target.value)}
                                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="">Select a crop...</option>
                                                        {activeCrops.map(c => (
                                                            <option key={c.id} value={c.id}>
                                                                {c.name} — {c.area} acres ({c.season || "N/A"})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <Button
                                                        onClick={handleLinkCrop}
                                                        disabled={!selectedCropId || !selectedPlot.soil_data || linkingCrop}
                                                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
                                                        variant="default"
                                                    >
                                                        {linkingCrop ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sprout className="h-4 w-4 mr-2" />}
                                                        Link Crop to Plot
                                                    </Button>
                                                    {!selectedPlot.soil_data && (
                                                        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                            <AlertTriangle className="h-3 w-3" /> Save soil data first to link a crop
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Get Recommendation Button */}
                                        {selectedPlot.soil_data && (
                                            <Button
                                                onClick={handleGetRecommendation}
                                                disabled={loadingRec}
                                                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl py-6 text-base shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
                                            >
                                                {loadingRec ? (
                                                    <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Analyzing...</>
                                                ) : (
                                                    <><Sparkles className="h-5 w-5 mr-2" /> Get AI Recommendation</>
                                                )}
                                            </Button>
                                        )}
                                    </div>

                                    {/* Right: Recommendation Results */}
                                    <div className="lg:col-span-7">
                                        {!recommendation && !loadingRec && (
                                            <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                                                <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                                                    <Target className="h-8 w-8" />
                                                </div>
                                                <h3 className="text-xl font-medium text-foreground">Ready to Analyze</h3>
                                                <p className="text-muted-foreground mt-2 max-w-md">
                                                    Save your soil test data, link a crop, then hit &quot;Get AI Recommendation&quot; for personalized fertilizer advice for this plot.
                                                </p>
                                            </div>
                                        )}

                                        {loadingRec && (
                                            <div className="h-full flex flex-col items-center justify-center p-12 space-y-4">
                                                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                                                <p className="text-muted-foreground animate-pulse">AgriFlow AI is analyzing plot {selectedPlot.serial_number}...</p>
                                            </div>
                                        )}

                                        {recommendation && !loadingRec && (
                                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                {/* Status Card */}
                                                <div className={`p-5 rounded-2xl border ${statusBg(recommendation.status)}`}>
                                                    <h3 className={`text-lg font-semibold mb-1.5 flex items-center gap-2 ${statusColor(recommendation.status)}`}>
                                                        <Info className="h-5 w-5" />
                                                        Soil Health: {recommendation.status}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">{recommendation.soil_health_summary}</p>
                                                </div>

                                                {/* Fertilizer Cards */}
                                                <div>
                                                    <h3 className="text-lg font-bold mb-3 text-foreground">Recommended Fertilizers</h3>
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        {recommendation.recommendations.map((rec, i) => (
                                                            <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                                                <div className="flex items-center gap-3 mb-3">
                                                                    <div className="h-9 w-9 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">{i + 1}</div>
                                                                    <h4 className="font-semibold text-foreground">{rec.name}</h4>
                                                                </div>
                                                                <div className="space-y-1.5 text-xs">
                                                                    <div className="flex justify-between"><span className="text-muted-foreground">Quantity:</span><span className="font-medium">{rec.quantity}</span></div>
                                                                    <div className="flex justify-between"><span className="text-muted-foreground">Timing:</span><span className="font-medium text-right max-w-[60%]">{rec.timing}</span></div>
                                                                    <div className="flex justify-between"><span className="text-muted-foreground">Method:</span><span className="font-medium text-right max-w-[60%]">{rec.application_method}</span></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Tips */}
                                                {recommendation.additional_tips?.length > 0 && (
                                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
                                                        <h3 className="text-base font-semibold mb-3 text-foreground">Pro Tips for This Plot</h3>
                                                        <ul className="space-y-2">
                                                            {recommendation.additional_tips.map((tip, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
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
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium text-foreground">No Plot Selected</h3>
                                <p className="text-muted-foreground mt-1">Go to the <strong>My Plots</strong> tab and select a plot first.</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* ═══════ TAB 3: FERTILIZER IMPACT ═══════ */}
                    <TabsContent value="impact" className="space-y-6">
                        {selectedPlot?.soil_data ? (
                            <>
                                {/* Plot Context Bar */}
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-100 dark:border-purple-900/50">
                                    <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                        <BarChart3 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Fertilizer Impact — Plot {selectedPlot.serial_number}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedPlot.crop_name ? `Crop: ${selectedPlot.crop_name}` : "No crop linked"} • {selectedPlot.area} acres
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Left: Log Fertilizer + History */}
                                    <div className="lg:col-span-5 space-y-6">
                                        {/* Log Fertilizer Form */}
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                                            <h3 className="text-base font-semibold flex items-center gap-2 mb-4">
                                                <Plus className="h-5 w-5 text-purple-500" />
                                                Log Fertilizer Application
                                            </h3>
                                            <form onSubmit={handleApplyFertilizer} className="space-y-3">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Fertilizer Name</Label>
                                                    <select
                                                        required
                                                        value={fertForm.fertilizer_name}
                                                        onChange={e => setFertForm({ ...fertForm, fertilizer_name: e.target.value })}
                                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    >
                                                        <option value="">Select fertilizer...</option>
                                                        <option value="Urea">Urea (46% N)</option>
                                                        <option value="DAP">DAP (18-46-0)</option>
                                                        <option value="MOP">MOP (0-0-60)</option>
                                                        <option value="SSP">SSP (0-16-0)</option>
                                                        <option value="NPK Complex">NPK Complex</option>
                                                        <option value="Ammonium Sulphate">Ammonium Sulphate</option>
                                                        <option value="Zinc Sulphate">Zinc Sulphate</option>
                                                        <option value="Vermicompost">Vermicompost</option>
                                                        <option value="FYM">FYM (Farm Yard Manure)</option>
                                                        <option value="Neem Cake">Neem Cake</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">Quantity</Label>
                                                        <Input required type="number" step="0.1" value={fertForm.quantity} onChange={e => setFertForm({ ...fertForm, quantity: e.target.value })} placeholder="e.g. 50" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs">Unit</Label>
                                                        <select
                                                            value={fertForm.unit}
                                                            onChange={e => setFertForm({ ...fertForm, unit: e.target.value })}
                                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        >
                                                            <option value="kg">Kilograms (kg)</option>
                                                            <option value="bags">Bags (50 kg)</option>
                                                            <option value="liters">Liters</option>
                                                            <option value="tons">Tons</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Application Date</Label>
                                                    <Input required type="date" value={fertForm.application_date} onChange={e => setFertForm({ ...fertForm, application_date: e.target.value })} />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs">Method (optional)</Label>
                                                    <select
                                                        value={fertForm.application_method}
                                                        onChange={e => setFertForm({ ...fertForm, application_method: e.target.value })}
                                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    >
                                                        <option value="">Select method...</option>
                                                        <option value="Broadcasting">Broadcasting</option>
                                                        <option value="Band placement">Band placement</option>
                                                        <option value="Fertigation">Fertigation</option>
                                                        <option value="Foliar spray">Foliar spray</option>
                                                        <option value="Top dressing">Top dressing</option>
                                                    </select>
                                                </div>
                                                <Button type="submit" disabled={applyingFert} className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                                                    {applyingFert ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Package className="h-4 w-4 mr-2" />}
                                                    Log Application
                                                </Button>
                                            </form>
                                        </div>

                                        {/* Fertilizer History */}
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                                            <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
                                                <Calendar className="h-5 w-5 text-purple-500" />
                                                Application History
                                                {fertHistory.length > 0 && (
                                                    <Badge variant="secondary" className="ml-auto text-xs">{fertHistory.length}</Badge>
                                                )}
                                            </h3>
                                            {loadingFertHistory ? (
                                                <div className="flex items-center justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                                            ) : fertHistory.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-4">No fertilizer applications logged yet.</p>
                                            ) : (
                                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                                    {fertHistory.map((app) => (
                                                        <div key={app.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                                            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                                                                <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-foreground truncate">{app.fertilizer_name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {app.quantity} {app.unit} • {new Date(app.application_date).toLocaleDateString()}
                                                                    {app.application_method && ` • ${app.application_method}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Analyze Impact Button */}
                                        <Button
                                            onClick={handleAnalyzeImpact}
                                            disabled={loadingImpact || fertHistory.length === 0}
                                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl py-6 text-base shadow-lg shadow-purple-200 dark:shadow-purple-900/30"
                                        >
                                            {loadingImpact ? (
                                                <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Analyzing Impact...</>
                                            ) : (
                                                <><BarChart3 className="h-5 w-5 mr-2" /> Analyze Fertilizer Impact</>
                                            )}
                                        </Button>
                                        {fertHistory.length === 0 && (
                                            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 -mt-4">
                                                <AlertTriangle className="h-3 w-3" /> Log at least one fertilizer application to analyze impact
                                            </p>
                                        )}
                                    </div>

                                    {/* Right: Impact Analysis Results */}
                                    <div className="lg:col-span-7">
                                        {!impactResult && !loadingImpact && (
                                            <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                                                <div className="h-16 w-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-4">
                                                    <BarChart3 className="h-8 w-8" />
                                                </div>
                                                <h3 className="text-xl font-medium text-foreground">Impact Analysis</h3>
                                                <p className="text-muted-foreground mt-2 max-w-md">
                                                    Log your fertilizer applications, then click &quot;Analyze Fertilizer Impact&quot; to see how they&apos;re affecting your crop&apos;s nutrition.
                                                </p>
                                            </div>
                                        )}

                                        {loadingImpact && (
                                            <div className="h-full flex flex-col items-center justify-center p-12 space-y-4">
                                                <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
                                                <p className="text-muted-foreground animate-pulse">Analyzing fertilizer impact on plot {selectedPlot.serial_number}...</p>
                                            </div>
                                        )}

                                        {impactResult && !loadingImpact && (
                                            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                {/* Overall Status */}
                                                <div className={`p-5 rounded-2xl border ${statusBg(impactResult.overall_status)}`}>
                                                    <h3 className={`text-lg font-semibold mb-1.5 flex items-center gap-2 ${statusColor(impactResult.overall_status)}`}>
                                                        <Target className="h-5 w-5" />
                                                        Overall: {impactResult.overall_status}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">{impactResult.analysis_summary}</p>
                                                </div>

                                                {/* Nutrient Balance Grid */}
                                                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                                                    <h3 className="text-base font-semibold mb-3 text-foreground">Nutrient Balance</h3>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {Object.entries(impactResult.nutrient_balance).map(([key, status]) => (
                                                            <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                                                {nutrientStatusIcon(status)}
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">{nutrientLabel(key)}</p>
                                                                    <p className="text-sm font-semibold capitalize text-foreground">{status}</p>
                                                                </div>
                                                                {impactResult.estimated_levels[key] !== undefined && (
                                                                    <span className="ml-auto text-sm font-mono text-muted-foreground">
                                                                        {impactResult.estimated_levels[key]}{key === "ph" ? "" : " kg/ha"}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Adjusted Recommendations */}
                                                {impactResult.adjusted_recommendations?.length > 0 && (
                                                    <div>
                                                        <h3 className="text-base font-bold mb-3 text-foreground">Adjusted Recommendations</h3>
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            {impactResult.adjusted_recommendations.map((rec, i) => (
                                                                <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className="h-7 w-7 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xs">{i + 1}</div>
                                                                        <h4 className="font-semibold text-sm text-foreground">{rec.name}</h4>
                                                                    </div>
                                                                    <div className="space-y-1 text-xs">
                                                                        <div className="flex justify-between"><span className="text-muted-foreground">Quantity:</span><span className="font-medium">{rec.quantity}</span></div>
                                                                        <div className="flex justify-between"><span className="text-muted-foreground">Timing:</span><span className="font-medium text-right max-w-[60%]">{rec.timing}</span></div>
                                                                        <div className="flex justify-between"><span className="text-muted-foreground">Method:</span><span className="font-medium text-right max-w-[60%]">{rec.application_method}</span></div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Risk Alerts */}
                                                {impactResult.risk_alerts?.length > 0 && (
                                                    <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-5 border border-red-100 dark:border-red-900/50">
                                                        <h3 className="text-base font-semibold mb-3 text-red-600 dark:text-red-400 flex items-center gap-2">
                                                            <ShieldAlert className="h-5 w-5" />
                                                            Risk Alerts
                                                        </h3>
                                                        <ul className="space-y-2">
                                                            {impactResult.risk_alerts.map((alert, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                                                                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
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
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium text-foreground">Plot Soil Data Required</h3>
                                <p className="text-muted-foreground mt-1">Select a plot and save soil data in the <strong>Nutrition Manager</strong> tab first.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}

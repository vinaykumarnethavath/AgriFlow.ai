"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
    Layers, Sparkles, AlertCircle, CheckCircle2, ChevronRight,
    Plus, Beaker, ArrowRight, ShieldCheck, RefreshCw, Calendar,
    FileText, Activity, Info, Droplets
} from "lucide-react";
import {
    SoilProfile, SoilHealthSummary, SoilProfileCreate,
    getSoilProfiles, getSoilHealthSummary, createSoilProfile, seedDefaultSoilProfiles
} from "@/lib/api";

const SOIL_TYPE_LABELS: Record<string, string> = {
    alluvial: "Alluvial Soil",
    black_regur: "Black Soil (Regur)",
    red_loam: "Red & Yellow Loam",
    laterite: "Laterite Soil",
    clay_loam: "Clay Loam",
    sandy_loam: "Sandy Loam",
    silt_loam: "Silt Loam"
};

export default function SoilProfileCard() {
    const [profiles, setProfiles] = useState<SoilProfile[]>([]);
    const [summary, setSummary] = useState<SoilHealthSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState<SoilProfileCreate>({
        plot_label: "Main Plot",
        soil_type: "clay_loam",
        shc_number: "",
        testing_lab: "Krishi Vigyan Kendra (KVK)",
        test_date: new Date().toISOString().split("T")[0],
        ph_level: 6.8,
        organic_carbon_percent: 0.55,
        ec_ds_m: 0.4,
        nitrogen_kg_ha: 240,
        phosphorus_kg_ha: 16,
        potassium_kg_ha: 220,
        sulphur_ppm: 12,
        zinc_ppm: 0.75,
        iron_ppm: 5.0,
        boron_ppm: 0.5,
        notes: ""
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [pData, sData] = await Promise.all([
                getSoilProfiles(),
                getSoilHealthSummary()
            ]);
            setProfiles(pData);
            setSummary(sData);
        } catch (err) {
            console.error("Failed to load soil profile data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSeedDefaults = async () => {
        try {
            setSeeding(true);
            await seedDefaultSoilProfiles();
            await loadData();
        } catch (err) {
            console.error("Failed to seed default soil profile:", err);
        } finally {
            setSeeding(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createSoilProfile({
                ...formData,
                ph_level: Number(formData.ph_level),
                organic_carbon_percent: Number(formData.organic_carbon_percent),
                nitrogen_kg_ha: Number(formData.nitrogen_kg_ha),
                phosphorus_kg_ha: Number(formData.phosphorus_kg_ha),
                potassium_kg_ha: Number(formData.potassium_kg_ha),
                ec_ds_m: formData.ec_ds_m ? Number(formData.ec_ds_m) : undefined,
                sulphur_ppm: formData.sulphur_ppm ? Number(formData.sulphur_ppm) : undefined,
                zinc_ppm: formData.zinc_ppm ? Number(formData.zinc_ppm) : undefined,
                iron_ppm: formData.iron_ppm ? Number(formData.iron_ppm) : undefined,
                boron_ppm: formData.boron_ppm ? Number(formData.boron_ppm) : undefined,
            });
            setIsAddModalOpen(false);
            loadData();
        } catch (err) {
            console.error("Failed to record soil test:", err);
            alert("Failed to save soil test record.");
        }
    };

    const activeProfile = profiles.length > 0 ? profiles[0] : null;

    return (
        <Card className="border border-border/60 shadow-sm overflow-hidden bg-gradient-to-br from-card to-muted/20">
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-500/20">
                            <Layers className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-foreground">Soil Profile & Health Card</h3>
                                {activeProfile && (
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                        SHC Verified
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Physical texture, NPK fertility ratings, and laboratory testing history.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAddModalOpen(true)}
                            className="h-8 text-xs flex items-center gap-1.5"
                        >
                            <Plus className="h-3.5 w-3.5" /> Add Lab Test
                        </Button>
                        <Link href="/dashboard/farmer/nutrition">
                            <Button
                                size="sm"
                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                            >
                                Precision Nutrition <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-emerald-600" />
                        Loading soil profile records...
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="py-8 text-center space-y-3 bg-muted/20 rounded-xl border border-dashed border-border/80 p-6">
                        <Beaker className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                        <div>
                            <h4 className="text-sm font-semibold text-foreground">No Soil Health Card on Record</h4>
                            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                                Record your Soil Health Card (SHC) laboratory test or generate a calibrated soil baseline to optimize fertilizer dosage and crop yield.
                            </p>
                        </div>
                        <div className="flex justify-center gap-3 pt-1">
                            <Button
                                size="sm"
                                onClick={handleSeedDefaults}
                                disabled={seeding}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                            >
                                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                                {seeding ? "Generating..." : "Generate Baseline Soil Card"}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsAddModalOpen(true)}
                                className="text-xs"
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" /> Enter Manual Test
                            </Button>
                        </div>
                    </div>
                ) : activeProfile ? (
                    <div className="space-y-5">
                        {/* Top Highlights Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Health Score */}
                            <div className="p-3.5 rounded-xl bg-card border border-border/60 flex items-center justify-between">
                                <div>
                                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">Health Score</span>
                                    <div className="flex items-baseline gap-1.5 mt-0.5">
                                        <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                                            {activeProfile.health_score}
                                        </span>
                                        <span className="text-xs text-muted-foreground">/ 100</span>
                                    </div>
                                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                                        {activeProfile.health_status.replace("_", " ")}
                                    </span>
                                </div>
                                <div className="h-10 w-10 rounded-full border-4 border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-600">
                                    {activeProfile.health_score}%
                                </div>
                            </div>

                            {/* Soil Type */}
                            <div className="p-3.5 rounded-xl bg-card border border-border/60">
                                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">Soil Texture</span>
                                <h4 className="text-base font-bold text-foreground mt-1 truncate">
                                    {SOIL_TYPE_LABELS[activeProfile.soil_type] || activeProfile.soil_type}
                                </h4>
                                <span className="text-[11px] text-muted-foreground block mt-0.5">
                                    EC: {activeProfile.ec_ds_m ? `${activeProfile.ec_ds_m} dS/m` : "Normal (<1.0)"}
                                </span>
                            </div>

                            {/* pH Level */}
                            <div className="p-3.5 rounded-xl bg-card border border-border/60">
                                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">pH Reaction</span>
                                <div className="flex items-baseline gap-2 mt-0.5">
                                    <span className="text-2xl font-bold text-foreground">
                                        {activeProfile.ph_level.toFixed(1)}
                                    </span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                        activeProfile.ph_status === "neutral"
                                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                            : activeProfile.ph_status === "acidic"
                                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                            : "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                                    }`}>
                                        {activeProfile.ph_status.toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-[11px] text-muted-foreground block mt-0.5">Ideal range: 6.2 – 7.5</span>
                            </div>

                            {/* Organic Carbon */}
                            <div className="p-3.5 rounded-xl bg-card border border-border/60">
                                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">Organic Carbon (OC)</span>
                                <div className="flex items-baseline gap-1 mt-0.5">
                                    <span className="text-2xl font-bold text-foreground">
                                        {activeProfile.organic_carbon_percent.toFixed(2)}%
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-1.5 rounded-full"
                                        style={{ width: `${Math.min(100, (activeProfile.organic_carbon_percent / 1.0) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* N-P-K Fertility Status Bars */}
                        <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-foreground flex items-center gap-1.5">
                                    <Activity className="h-4 w-4 text-emerald-600" />
                                    Available Primary Macronutrients (NPK in kg/ha)
                                </span>
                                <span className="text-muted-foreground">Plot: {activeProfile.plot_label}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* Nitrogen */}
                                <div className="p-3 rounded-lg bg-card border border-border/40 space-y-1.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-medium text-foreground">Nitrogen (N)</span>
                                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                            activeProfile.nitrogen_status === "medium"
                                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                                : activeProfile.nitrogen_status === "low"
                                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                                : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                                        }`}>
                                            {activeProfile.nitrogen_status.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-foreground">{activeProfile.nitrogen_kg_ha.toFixed(0)} <span className="text-xs font-normal text-muted-foreground">kg/ha</span></p>
                                    <div className="w-full bg-muted rounded-full h-1.5">
                                        <div
                                            className="bg-blue-500 h-1.5 rounded-full"
                                            style={{ width: `${Math.min(100, (activeProfile.nitrogen_kg_ha / 560) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground block">Benchmark: 280–560 kg/ha</span>
                                </div>

                                {/* Phosphorus */}
                                <div className="p-3 rounded-lg bg-card border border-border/40 space-y-1.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-medium text-foreground">Phosphorus (P)</span>
                                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                            activeProfile.phosphorus_status === "medium"
                                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                                : activeProfile.phosphorus_status === "low"
                                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                                : "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                                        }`}>
                                            {activeProfile.phosphorus_status.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-foreground">{activeProfile.phosphorus_kg_ha.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">kg/ha</span></p>
                                    <div className="w-full bg-muted rounded-full h-1.5">
                                        <div
                                            className="bg-amber-500 h-1.5 rounded-full"
                                            style={{ width: `${Math.min(100, (activeProfile.phosphorus_kg_ha / 35) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground block">Benchmark: 10–25 kg/ha</span>
                                </div>

                                {/* Potassium */}
                                <div className="p-3 rounded-lg bg-card border border-border/40 space-y-1.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-medium text-foreground">Potassium (K)</span>
                                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                            activeProfile.potassium_status === "medium" || activeProfile.potassium_status === "high"
                                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                        }`}>
                                            {activeProfile.potassium_status.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-foreground">{activeProfile.potassium_kg_ha.toFixed(0)} <span className="text-xs font-normal text-muted-foreground">kg/ha</span></p>
                                    <div className="w-full bg-muted rounded-full h-1.5">
                                        <div
                                            className="bg-purple-500 h-1.5 rounded-full"
                                            style={{ width: `${Math.min(100, (activeProfile.potassium_kg_ha / 350) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-muted-foreground block">Benchmark: 110–280 kg/ha</span>
                                </div>
                            </div>

                            {/* Micronutrients Chips */}
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/30 text-[11px]">
                                <span className="font-semibold text-muted-foreground mr-1">Micronutrients (ppm):</span>
                                <span className="px-2 py-0.5 rounded bg-card border border-border/50 text-foreground">
                                    Zinc (Zn): <strong>{activeProfile.zinc_ppm || 0.7} ppm</strong> (Normal)
                                </span>
                                <span className="px-2 py-0.5 rounded bg-card border border-border/50 text-foreground">
                                    Iron (Fe): <strong>{activeProfile.iron_ppm || 5.2} ppm</strong> (Adequate)
                                </span>
                                <span className="px-2 py-0.5 rounded bg-card border border-border/50 text-foreground">
                                    Sulphur (S): <strong>{activeProfile.sulphur_ppm || 12} ppm</strong> (Adequate)
                                </span>
                                <span className="px-2 py-0.5 rounded bg-card border border-border/50 text-foreground">
                                    Boron (B): <strong>{activeProfile.boron_ppm || 0.55} ppm</strong> (Optimal)
                                </span>
                            </div>
                        </div>

                        {/* Agronomist Advice Box */}
                        {summary?.key_recommendation && (
                            <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-3">
                                <Sparkles className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                                <div className="text-xs">
                                    <span className="font-bold text-emerald-900 dark:text-emerald-200">ICAR Soil Health Recommendation: </span>
                                    <span className="text-emerald-950/80 dark:text-emerald-300">{summary.key_recommendation}</span>
                                </div>
                            </div>
                        )}

                        {/* Testing Metadata Footer */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground pt-1">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Tested on: <strong className="text-foreground">{activeProfile.test_date}</strong></span>
                                <span>• Lab: <strong className="text-foreground">{activeProfile.testing_lab}</strong></span>
                            </div>
                            {activeProfile.shc_number && (
                                <span className="bg-muted px-2 py-0.5 rounded text-[11px]">
                                    SHC Card: {activeProfile.shc_number}
                                </span>
                            )}
                        </div>
                    </div>
                ) : null}
            </CardContent>

            {/* Modal: Add Lab Test */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Record Soil Health Card / Lab Test"
            >
                <form onSubmit={handleCreate} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 pr-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Plot Name / Survey Label *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. North Acre / Plot 1"
                                value={formData.plot_label}
                                onChange={(e) => setFormData({ ...formData, plot_label: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Soil Type / Texture *</label>
                            <select
                                value={formData.soil_type}
                                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                                <option value="clay_loam">Clay Loam</option>
                                <option value="alluvial">Alluvial Soil</option>
                                <option value="black_regur">Black Soil (Regur)</option>
                                <option value="red_loam">Red & Yellow Loam</option>
                                <option value="laterite">Laterite Soil</option>
                                <option value="sandy_loam">Sandy Loam</option>
                                <option value="silt_loam">Silt Loam</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">SHC Number (Soil Health Card)</label>
                            <input
                                type="text"
                                placeholder="e.g. SHC-UP-2026-9812"
                                value={formData.shc_number || ""}
                                onChange={(e) => setFormData({ ...formData, shc_number: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Testing Lab *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. KVK Soil Testing Lab, Agra"
                                value={formData.testing_lab}
                                onChange={(e) => setFormData({ ...formData, testing_lab: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Test Date *</label>
                            <input
                                type="date"
                                required
                                value={formData.test_date}
                                onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">pH Level (3-11) *</label>
                            <input
                                type="number"
                                step="0.1"
                                min="3"
                                max="11"
                                required
                                value={formData.ph_level}
                                onChange={(e) => setFormData({ ...formData, ph_level: Number(e.target.value) })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-foreground block mb-1">Organic Carbon (%) *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="5"
                                required
                                value={formData.organic_carbon_percent}
                                onChange={(e) => setFormData({ ...formData, organic_carbon_percent: Number(e.target.value) })}
                                className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* NPK Values */}
                    <div className="p-3 bg-muted/40 rounded-xl border border-border/40 space-y-2">
                        <span className="text-xs font-bold text-foreground block">Available Macronutrients (kg / ha) *</span>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-[11px] text-muted-foreground block mb-1">Nitrogen (N)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.nitrogen_kg_ha}
                                    onChange={(e) => setFormData({ ...formData, nitrogen_kg_ha: Number(e.target.value) })}
                                    className="w-full text-sm p-2 rounded-lg border border-border bg-background"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] text-muted-foreground block mb-1">Phosphorus (P)</label>
                                <input
                                    type="number"
                                    required
                                    step="0.1"
                                    min="0"
                                    value={formData.phosphorus_kg_ha}
                                    onChange={(e) => setFormData({ ...formData, phosphorus_kg_ha: Number(e.target.value) })}
                                    className="w-full text-sm p-2 rounded-lg border border-border bg-background"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] text-muted-foreground block mb-1">Potassium (K)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.potassium_kg_ha}
                                    onChange={(e) => setFormData({ ...formData, potassium_kg_ha: Number(e.target.value) })}
                                    className="w-full text-sm p-2 rounded-lg border border-border bg-background"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Micronutrients Optional */}
                    <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                            <label className="text-[11px] text-muted-foreground block mb-1">Zinc (ppm)</label>
                            <input
                                type="number"
                                step="0.05"
                                value={formData.zinc_ppm || ""}
                                onChange={(e) => setFormData({ ...formData, zinc_ppm: Number(e.target.value) })}
                                className="w-full text-xs p-1.5 rounded-lg border border-border bg-background"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] text-muted-foreground block mb-1">Iron (ppm)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.iron_ppm || ""}
                                onChange={(e) => setFormData({ ...formData, iron_ppm: Number(e.target.value) })}
                                className="w-full text-xs p-1.5 rounded-lg border border-border bg-background"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] text-muted-foreground block mb-1">Sulphur (ppm)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.sulphur_ppm || ""}
                                onChange={(e) => setFormData({ ...formData, sulphur_ppm: Number(e.target.value) })}
                                className="w-full text-xs p-1.5 rounded-lg border border-border bg-background"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] text-muted-foreground block mb-1">Boron (ppm)</label>
                            <input
                                type="number"
                                step="0.05"
                                value={formData.boron_ppm || ""}
                                onChange={(e) => setFormData({ ...formData, boron_ppm: Number(e.target.value) })}
                                className="w-full text-xs p-1.5 rounded-lg border border-border bg-background"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-foreground block mb-1">Notes / Sampling Details</label>
                        <textarea
                            rows={2}
                            placeholder="e.g. Sample collected from 0-15cm depth across 5 zigzag points in the plot."
                            value={formData.notes || ""}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full text-sm p-2 rounded-lg border border-border bg-background focus:outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Save Soil Test Record
                        </Button>
                    </div>
                </form>
            </Modal>
        </Card>
    );
}

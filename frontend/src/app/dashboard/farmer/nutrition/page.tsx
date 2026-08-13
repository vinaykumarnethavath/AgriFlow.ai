"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Droplets, FlaskConical, Sprout, Loader2, Info, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

interface FertilizerRec {
    name: string;
    quantity: string;
    timing: string;
    application_method: string;
}

interface NutritionResponse {
    status: string;
    soil_health_summary: string;
    recommendations: FertilizerRec[];
    additional_tips: string[];
}

export default function PrecisionNutritionPage() {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<NutritionResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nitrogen: "",
        phosphorus: "",
        potassium: "",
        ph_level: "",
        crop_type: "",
        expected_yield: "",
        land_area: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const payload = {
                nitrogen: parseFloat(formData.nitrogen) || 0,
                phosphorus: parseFloat(formData.phosphorus) || 0,
                potassium: parseFloat(formData.potassium) || 0,
                ph_level: parseFloat(formData.ph_level) || 7,
                crop_type: formData.crop_type,
                expected_yield: formData.expected_yield,
                land_area: formData.land_area
            };

            const res = await api.post("/nutrition/advice", payload);
            setResult(res.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to fetch recommendations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <FlaskConical className="h-8 w-8 text-blue-500" />
                        {t("sidebar.nutrition", "Precision Nutrition")}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Get AI-driven fertilizer recommendations based on your soil test report.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Input Form */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-transparent rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
                        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                            <Droplets className="h-5 w-5 text-green-500" />
                            Soil Parameters
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nitrogen (N) kg/ha</Label>
                                    <Input required type="number" step="0.01" name="nitrogen" value={formData.nitrogen} onChange={handleChange} placeholder="e.g. 150" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phosphorus (P) kg/ha</Label>
                                    <Input required type="number" step="0.01" name="phosphorus" value={formData.phosphorus} onChange={handleChange} placeholder="e.g. 50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Potassium (K) kg/ha</Label>
                                    <Input required type="number" step="0.01" name="potassium" value={formData.potassium} onChange={handleChange} placeholder="e.g. 200" />
                                </div>
                                <div className="space-y-2">
                                    <Label>pH Level</Label>
                                    <Input required type="number" step="0.1" name="ph_level" value={formData.ph_level} onChange={handleChange} placeholder="e.g. 6.5" />
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground">Crop Details</h3>
                                <div className="space-y-2">
                                    <Label>Crop Type</Label>
                                    <Input required name="crop_type" value={formData.crop_type} onChange={handleChange} placeholder="e.g. Rice (Paddy)" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Land Area</Label>
                                    <Input required name="land_area" value={formData.land_area} onChange={handleChange} placeholder="e.g. 2 Acres" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Expected Yield</Label>
                                    <Input required name="expected_yield" value={formData.expected_yield} onChange={handleChange} placeholder="e.g. 40 Quintals" />
                                </div>
                            </div>

                            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl mt-4">
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Get AI Recommendation"}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Output Display */}
                <div className="lg:col-span-8">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    {!result && !loading && !error && (
                        <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                                <Sprout className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-medium text-foreground">Ready to Analyze</h3>
                            <p className="text-muted-foreground mt-2 max-w-md">
                                Enter your soil test parameters on the left to receive a highly personalized fertilizer schedule and soil amendment plan.
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center p-12 space-y-4">
                            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                            <p className="text-muted-foreground animate-pulse">AgriFlow AI is analyzing your soil data...</p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Summary Card */}
                            <div className={`p-6 rounded-2xl border ${result.status.includes("Good") ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30' : result.status.includes("Poor") ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-yellow-50 border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/30'}`}>
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                    <Info className="h-5 w-5" />
                                    Soil Health: {result.status}
                                </h3>
                                <p className="text-muted-foreground">
                                    {result.soil_health_summary}
                                </p>
                            </div>

                            {/* Recommendations List */}
                            <div>
                                <h3 className="text-xl font-bold mb-4 text-foreground">Recommended Fertilizers</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {result.recommendations.map((rec, i) => (
                                        <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                    {i + 1}
                                                </div>
                                                <h4 className="text-lg font-semibold text-foreground">{rec.name}</h4>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Quantity:</span>
                                                    <span className="font-medium">{rec.quantity}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Timing:</span>
                                                    <span className="font-medium text-right max-w-[60%]">{rec.timing}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Method:</span>
                                                    <span className="font-medium text-right max-w-[60%]">{rec.application_method}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tips */}
                            {result.additional_tips && result.additional_tips.length > 0 && (
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-semibold mb-4 text-foreground">Pro Tips for {formData.crop_type}</h3>
                                    <ul className="space-y-3">
                                        {result.additional_tips.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-3 text-muted-foreground">
                                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
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
        </div>
    );
}

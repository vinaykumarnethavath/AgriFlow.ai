"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
    ShieldCheck, Plus, AlertTriangle, CheckCircle2, Clock,
    PhoneCall, FileText, ChevronRight, Info, IndianRupee,
    Umbrella, Building2, Trash2, Edit3, Sparkles, ExternalLink
} from "lucide-react";
import {
    CropInsurance, CropInsuranceCreate, CropInsuranceClaimRequest,
    CropInsuranceSummary, PMFBYGuidance,
    getCropInsurances, getCropInsuranceSummary, createCropInsurance,
    updateCropInsurance, deleteCropInsurance, fileInsuranceClaim,
    getPMFBYGuidance
} from "@/lib/api";

const LOSS_REASONS = [
    { id: "excess_rainfall_flood", label: "Excess Rainfall / Inundation / Flood 🌊" },
    { id: "drought", label: "Severe Drought / Dry Spell ☀️" },
    { id: "hailstorm", label: "Hailstorm Damage ❄️" },
    { id: "pest_attack", label: "Severe Pest Attack / Locusts 🐛" },
    { id: "unseasonal_rains", label: "Unseasonal Post-Harvest Cyclone / Rain 🌧️" },
    { id: "other", label: "Other Localized Calamity ⚠️" }
];

export default function CropInsurancePage() {
    const { user } = useAuth();
    const { t } = useLanguage();

    const [policies, setPolicies] = useState<CropInsurance[]>([]);
    const [summary, setSummary] = useState<CropInsuranceSummary | null>(null);
    const [guidance, setGuidance] = useState<PMFBYGuidance | null>(null);
    const [loading, setLoading] = useState(true);

    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [showGuidance, setShowGuidance] = useState(false);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<CropInsurance | null>(null);

    // Form states
    const [newPolicy, setNewPolicy] = useState<CropInsuranceCreate>({
        scheme_name: "PM-Fasal Bima Yojana (PMFBY)",
        policy_number: "",
        insured_crop_name: "Wheat",
        season: "Kharif 2026",
        area_insured_acres: 2.0,
        sum_insured: 70000,
        farmer_premium_paid: 1400,
        insurance_company: "Agriculture Insurance Company of India (AIC)",
        application_date: new Date().toISOString().split("T")[0],
        policy_status: "active",
        notes: "",
    });

    const [claimForm, setClaimForm] = useState<CropInsuranceClaimRequest>({
        claim_amount_requested: 0,
        claim_loss_reason: "excess_rainfall_flood",
        claim_filed_date: new Date().toISOString().split("T")[0],
        notes: "",
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pList, pSummary, pGuidance] = await Promise.all([
                getCropInsurances(
                    filterStatus === "all" ? undefined : filterStatus === "claim_filed" ? "claim_filed" : undefined,
                    filterStatus === "claims_in_progress" ? "submitted" : undefined
                ),
                getCropInsuranceSummary(),
                getPMFBYGuidance(),
            ]);
            setPolicies(pList);
            setSummary(pSummary);
            setGuidance(pGuidance);
        } catch (err) {
            console.error("Failed to load crop insurance data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filterStatus]);

    const handleCreatePolicy = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCropInsurance({
                ...newPolicy,
                area_insured_acres: Number(newPolicy.area_insured_acres),
                sum_insured: Number(newPolicy.sum_insured),
                farmer_premium_paid: Number(newPolicy.farmer_premium_paid || 0),
            });
            setIsAddModalOpen(false);
            setNewPolicy({
                scheme_name: "PM-Fasal Bima Yojana (PMFBY)",
                policy_number: "",
                insured_crop_name: "Wheat",
                season: "Kharif 2026",
                area_insured_acres: 2.0,
                sum_insured: 70000,
                farmer_premium_paid: 1400,
                insurance_company: "Agriculture Insurance Company of India (AIC)",
                application_date: new Date().toISOString().split("T")[0],
                policy_status: "active",
                notes: "",
            });
            fetchData();
        } catch (err) {
            console.error("Failed to create policy:", err);
            alert("Failed to save insurance policy. Please verify inputs.");
        }
    };

    const handleOpenFileClaim = (policy: CropInsurance) => {
        setSelectedPolicy(policy);
        setClaimForm({
            claim_amount_requested: policy.sum_insured,
            claim_loss_reason: "excess_rainfall_flood",
            claim_filed_date: new Date().toISOString().split("T")[0],
            notes: "",
        });
        setIsClaimModalOpen(true);
    };

    const handleSubmitClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPolicy) return;
        try {
            await fileInsuranceClaim(selectedPolicy.id, {
                ...claimForm,
                claim_amount_requested: Number(claimForm.claim_amount_requested),
            });
            setIsClaimModalOpen(false);
            fetchData();
            alert("Crop damage claim submitted successfully! Intimation recorded.");
        } catch (err) {
            console.error("Failed to submit claim:", err);
            alert("Failed to submit claim.");
        }
    };

    const handleDeletePolicy = async (id: number) => {
        if (!confirm("Delete this insurance policy record?")) return;
        try {
            await deleteCropInsurance(id);
            fetchData();
        } catch (err) {
            console.error("Failed to delete policy:", err);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-teal-800 via-emerald-800 to-green-900 p-6 rounded-2xl text-white shadow-lg">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-white/20 text-xs font-bold px-2.5 py-0.5 rounded-full text-emerald-200">
                            Pradhan Mantri Fasal Bima Yojana
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
                        <ShieldCheck className="h-8 w-8 text-emerald-300" />
                        Crop Insurance Tracker
                    </h1>
                    <p className="text-emerald-100 text-sm mt-1">
                        Monitor government and private crop insurance coverage, premium receipts, and claim settlements.
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        onClick={() => setShowGuidance(!showGuidance)}
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/20 bg-white/10 font-bold"
                    >
                        <Info className="h-4 w-4 mr-1.5" /> Claim Rules & Help
                    </Button>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold shadow-md"
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add Policy
                    </Button>
                </div>
            </div>

            {/* Financial & Coverage Metrics */}
            {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-card hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase font-bold text-muted-foreground">Total Sum Insured</p>
                                <p className="text-2xl font-black text-foreground mt-1">₹{summary.total_sum_insured.toLocaleString("en-IN")}</p>
                                <p className="text-xs text-muted-foreground mt-1">{summary.active_policies_count} active crops covered</p>
                            </div>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                                <Umbrella className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500 shadow-sm bg-card hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase font-bold text-muted-foreground">Premium Paid</p>
                                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">₹{summary.total_premium_paid.toLocaleString("en-IN")}</p>
                                <p className="text-xs text-muted-foreground mt-1">~1.5% to 2% subsidized share</p>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                <IndianRupee className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500 shadow-sm bg-card hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase font-bold text-muted-foreground">Claims In Progress</p>
                                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{summary.claims_pending_count}</p>
                                <p className="text-xs text-muted-foreground mt-1">Under survey or processing</p>
                            </div>
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                                <Clock className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 shadow-sm bg-card hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase font-bold text-muted-foreground">Claims Settled</p>
                                <p className="text-2xl font-black text-green-600 dark:text-green-400 mt-1">₹{summary.total_claims_received.toLocaleString("en-IN")}</p>
                                <p className="text-xs text-muted-foreground mt-1">{summary.claims_settled_count} claims credited via DBT</p>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* 72-Hour Calamity Emergency Alert Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border-2 border-amber-300 dark:border-amber-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-amber-500 text-white rounded-xl shrink-0">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="font-extrabold text-base text-amber-950 dark:text-amber-100 flex items-center gap-2">
                            🚨 72-Hour Loss Reporting Rule (PMFBY Mandatory)
                        </h4>
                        <p className="text-xs text-amber-900 dark:text-amber-200 mt-0.5 leading-relaxed">
                            In case of hailstorm, cyclone, unseasonal flood, or pest calamity, loss <strong>MUST be intimated within 72 hours</strong> directly to your bank, local agriculture officer, or toll-free helpline <strong>14447</strong>.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <a
                        href="tel:14447"
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                        <PhoneCall className="h-4 w-4" /> Call 14447
                    </a>
                </div>
            </div>

            {/* Step-by-Step Claim Guidance Box (Collapsible or visible) */}
            {showGuidance && guidance && (
                <Card className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm animate-in slide-in-from-top-3">
                    <CardContent className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-foreground flex items-center gap-2 text-base">
                                <Sparkles className="h-5 w-5 text-emerald-600" />
                                Official Claim Filing Steps & Requirements
                            </h3>
                            <button onClick={() => setShowGuidance(false)} className="text-xs text-muted-foreground hover:underline">
                                Hide Guide
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {guidance.steps.map((st) => (
                                <div key={st.step} className="bg-card p-3.5 rounded-xl border border-border shadow-2xs space-y-1">
                                    <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                                        Step {st.step}
                                    </span>
                                    <h4 className="font-bold text-sm text-foreground mt-1">{st.title}</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{st.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-card p-3.5 rounded-xl border border-border text-xs space-y-1.5">
                            <p className="font-bold text-foreground">Documents to Keep Ready:</p>
                            <div className="flex flex-wrap gap-2 text-muted-foreground">
                                {guidance.required_documents.map((doc, idx) => (
                                    <span key={idx} className="bg-muted px-2.5 py-1 rounded-md text-[11px] font-medium border border-border">
                                        ✓ {doc}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-card p-2.5 rounded-xl border border-border shadow-2xs">
                <span className="text-xs font-bold text-muted-foreground mr-1">Filter:</span>
                {[
                    { id: "all", label: "All Policies" },
                    { id: "active", label: "Active Coverage" },
                    { id: "claims_in_progress", label: "Claims Pending" },
                    { id: "claim_filed", label: "All Filed Claims" },
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setFilterStatus(t.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            filterStatus === t.id
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Policies Grid */}
            {loading ? (
                <div className="p-12 text-center text-emerald-600 font-bold animate-pulse">
                    Loading insurance coverage...
                </div>
            ) : policies.length === 0 ? (
                <div className="bg-card border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
                    <Umbrella className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                    <h3 className="font-bold text-lg text-foreground">No Crop Insurance Policies Found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                        Add your PM-Fasal Bima Yojana (PMFBY) or weather insurance policy numbers to monitor coverage and easily submit disaster claims.
                    </p>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add Your First Policy
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {policies.map((p) => {
                        const hasClaim = p.claim_status && p.claim_status !== "none";
                        return (
                            <Card key={p.id} className="border border-border/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                                <CardContent className="p-5 space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border border-emerald-200">
                                                    {p.scheme_name}
                                                </span>
                                                <span className="text-xs font-semibold text-muted-foreground">
                                                    {p.season}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg text-foreground">
                                                🌾 {p.insured_crop_name} ({p.area_insured_acres} Acres)
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                Policy #: <strong className="text-foreground">{p.policy_number}</strong> • {p.insurance_company}
                                            </p>
                                        </div>

                                        {/* Claim Status Badge */}
                                        <div className="shrink-0">
                                            {p.claim_status === "settled" ? (
                                                <span className="bg-green-100 text-green-700 dark:bg-green-900/40 text-xs px-2.5 py-1 rounded-full font-bold border border-green-200 flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> Settled
                                                </span>
                                            ) : p.claim_status === "submitted" || p.claim_status === "under_survey" ? (
                                                <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 text-xs px-2.5 py-1 rounded-full font-bold border border-amber-300 flex items-center gap-1 animate-pulse">
                                                    <Clock className="h-3 w-3" /> Claim Under Survey
                                                </span>
                                            ) : p.claim_status === "approved" ? (
                                                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 text-xs px-2.5 py-1 rounded-full font-bold border border-blue-200">
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
                                                    Active Cover
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Key Numbers */}
                                    <div className="grid grid-cols-2 gap-2 bg-muted/40 p-3 rounded-xl border border-border text-center text-xs">
                                        <div>
                                            <p className="text-muted-foreground text-[11px]">Sum Insured (Coverage)</p>
                                            <p className="font-black text-foreground text-base mt-0.5">₹{p.sum_insured.toLocaleString("en-IN")}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-[11px]">Farmer Premium Paid</p>
                                            <p className="font-bold text-blue-600 dark:text-blue-400 text-base mt-0.5">₹{p.farmer_premium_paid.toLocaleString("en-IN")}</p>
                                        </div>
                                    </div>

                                    {/* Claim Status Details (if claim filed) */}
                                    {hasClaim && (
                                        <div className="bg-amber-50/70 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-xs space-y-1">
                                            <div className="flex justify-between font-bold text-amber-900 dark:text-amber-200">
                                                <span>Loss Reason: {p.claim_loss_reason?.replace("_", " ")}</span>
                                                <span>Req: ₹{(p.claim_amount_requested || 0).toLocaleString("en-IN")}</span>
                                            </div>
                                            {p.claim_amount_approved && (
                                                <div className="flex justify-between font-extrabold text-green-700 dark:text-green-300">
                                                    <span>Approved Compensation:</span>
                                                    <span>₹{p.claim_amount_approved.toLocaleString("en-IN")}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Action Row */}
                                    <div className="flex items-center justify-between pt-2 border-t border-border">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleDeletePolicy(p.id)}
                                                className="p-1.5 text-muted-foreground hover:text-red-600 rounded-lg hover:bg-muted"
                                                title="Delete policy"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        {!hasClaim ? (
                                            <Button
                                                size="sm"
                                                onClick={() => handleOpenFileClaim(p)}
                                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-8 px-3"
                                            >
                                                <AlertTriangle className="h-3.5 w-3.5 mr-1" /> File Damage Claim
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground font-medium">
                                                Filed on {p.claim_filed_date ? new Date(p.claim_filed_date).toLocaleDateString("en-IN") : "—"}
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* ─── ADD POLICY MODAL ───────────────────────── */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Crop Insurance Policy"
            >
                <form onSubmit={handleCreatePolicy} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground">Scheme Name *</label>
                        <select
                            required
                            className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none focus:ring-2 focus:ring-emerald-500"
                            value={newPolicy.scheme_name}
                            onChange={(e) => setNewPolicy({ ...newPolicy, scheme_name: e.target.value })}
                        >
                            <option value="PM-Fasal Bima Yojana (PMFBY)">Pradhan Mantri Fasal Bima Yojana (PMFBY)</option>
                            <option value="Weather Based Crop Insurance (WBCIS)">Restructured Weather Based Crop Insurance (WBCIS)</option>
                            <option value="Commercial / Private Policy">Commercial / Private Farm Insurance</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Policy Number / Application ID *</label>
                            <input
                                required
                                placeholder="e.g. 040206250001893"
                                className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none focus:ring-2 focus:ring-emerald-500"
                                value={newPolicy.policy_number}
                                onChange={(e) => setNewPolicy({ ...newPolicy, policy_number: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Insured Crop Name *</label>
                            <input
                                required
                                placeholder="e.g. Wheat, Paddy, Cotton"
                                className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none focus:ring-2 focus:ring-emerald-500"
                                value={newPolicy.insured_crop_name}
                                onChange={(e) => setNewPolicy({ ...newPolicy, insured_crop_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Season *</label>
                            <input
                                required
                                placeholder="e.g. Kharif 2026 or Rabi 2026-27"
                                className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none focus:ring-2 focus:ring-emerald-500"
                                value={newPolicy.season}
                                onChange={(e) => setNewPolicy({ ...newPolicy, season: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Insured Area (Acres) *</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                min="0.1"
                                className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none focus:ring-2 focus:ring-emerald-500"
                                value={newPolicy.area_insured_acres}
                                onChange={(e) => setNewPolicy({ ...newPolicy, area_insured_acres: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Sum Insured (₹) *</label>
                            <input
                                type="number"
                                required
                                min="1000"
                                placeholder="e.g. 75000"
                                className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none focus:ring-2 focus:ring-emerald-500"
                                value={newPolicy.sum_insured}
                                onChange={(e) => setNewPolicy({ ...newPolicy, sum_insured: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Farmer Premium Paid (₹)</label>
                            <input
                                type="number"
                                min="0"
                                placeholder="e.g. 1500"
                                className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none focus:ring-2 focus:ring-emerald-500"
                                value={newPolicy.farmer_premium_paid}
                                onChange={(e) => setNewPolicy({ ...newPolicy, farmer_premium_paid: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground">Insurance Company</label>
                        <select
                            className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none"
                            value={newPolicy.insurance_company}
                            onChange={(e) => setNewPolicy({ ...newPolicy, insurance_company: e.target.value })}
                        >
                            <option value="Agriculture Insurance Company of India (AIC)">Agriculture Insurance Company of India (AIC)</option>
                            <option value="SBI General Insurance">SBI General Insurance</option>
                            <option value="HDFC ERGO General Insurance">HDFC ERGO General Insurance</option>
                            <option value="Bajaj Allianz General Insurance">Bajaj Allianz General Insurance</option>
                            <option value="ICICI Lombard General Insurance">ICICI Lombard General Insurance</option>
                            <option value="Other Agency">Other Authorized Agency</option>
                        </select>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl mt-2"
                    >
                        Save Insurance Policy
                    </Button>
                </form>
            </Modal>

            {/* ─── FILE DAMAGE CLAIM MODAL ────────────────── */}
            {selectedPolicy && (
                <Modal
                    isOpen={isClaimModalOpen}
                    onClose={() => setIsClaimModalOpen(false)}
                    title={`File Damage Claim for ${selectedPolicy.insured_crop_name}`}
                >
                    <form onSubmit={handleSubmitClaim} className="space-y-4 p-1">
                        <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 text-xs space-y-1">
                            <p className="font-bold text-amber-900 dark:text-amber-200">
                                🔔 72-Hour Calamity Notice Warning
                            </p>
                            <p className="text-amber-800 dark:text-amber-300">
                                Ensure damage occurred within the last 72 hours for localized natural calamities.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Cause / Reason of Damage *</label>
                            <select
                                required
                                className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none"
                                value={claimForm.claim_loss_reason}
                                onChange={(e) => setClaimForm({ ...claimForm, claim_loss_reason: e.target.value })}
                            >
                                {LOSS_REASONS.map((r) => (
                                    <option key={r.id} value={r.id}>{r.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Date of Damage *</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none"
                                    value={claimForm.claim_filed_date}
                                    onChange={(e) => setClaimForm({ ...claimForm, claim_filed_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Claim Amount (₹) *</label>
                                <input
                                    type="number"
                                    required
                                    max={selectedPolicy.sum_insured}
                                    className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none"
                                    value={claimForm.claim_amount_requested || ""}
                                    onChange={(e) => setClaimForm({ ...claimForm, claim_amount_requested: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Damage Details / Field Notes</label>
                            <textarea
                                rows={2}
                                placeholder="Describe crop stage, affected guntas/acres, waterlogging..."
                                className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none"
                                value={claimForm.notes || ""}
                                onChange={(e) => setClaimForm({ ...claimForm, notes: e.target.value })}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl mt-2"
                        >
                            Submit Claim Intimation
                        </Button>
                    </form>
                </Modal>
            )}
        </div>
    );
}

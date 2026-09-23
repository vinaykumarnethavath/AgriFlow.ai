"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
    FileDown, Download, CheckCircle2, Building, ShieldCheck,
    Landmark, FileText, Loader2, Sparkles, AlertCircle
} from "lucide-react";
import {
    FarmReportMeta, getFarmReportPreviewMeta,
    downloadFarmReportPdf, triggerBlobDownload
} from "@/lib/api";

interface ExportReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    farmerName?: string;
    farmerId?: string;
}

export default function ExportReportModal({
    isOpen,
    onClose,
    farmerName,
    farmerId
}: ExportReportModalProps) {
    const [selectedSeason, setSelectedSeason] = useState<string>("All");
    const [meta, setMeta] = useState<FarmReportMeta | null>(null);
    const [loadingMeta, setLoadingMeta] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const fetchMeta = async () => {
            setLoadingMeta(true);
            try {
                const data = await getFarmReportPreviewMeta(selectedSeason === "All" ? undefined : selectedSeason);
                setMeta(data);
            } catch (err) {
                console.error("Failed to load report metadata preview:", err);
            } finally {
                setLoadingMeta(false);
            }
        };
        fetchMeta();
    }, [isOpen, selectedSeason]);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const seasonParam = selectedSeason === "All" ? undefined : selectedSeason;
            const blob = await downloadFarmReportPdf(seasonParam);
            const dateStr = new Date().toISOString().split("T")[0];
            const cleanId = farmerId || "Farmer";
            const filename = `Farm_Statement_${cleanId}_${selectedSeason}_${dateStr}.pdf`;
            triggerBlobDownload(blob, filename);
            onClose();
        } catch (err) {
            console.error("Failed to download PDF report:", err);
            alert("Failed to generate PDF report. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Export Official Farm Statement (PDF)"
        >
            <div className="space-y-5 p-1">
                {/* Introduction Banner */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                    <p className="font-extrabold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 text-sm">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        Verified Digital Agricultural Statement
                    </p>
                    <p className="text-emerald-800 dark:text-emerald-300">
                        Download a publication-quality PDF summary of your crops, yields, expenses, and net farm income.
                    </p>
                </div>

                {/* Season Filter Selector */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Select Season / Time Period
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {["All", "Kharif", "Rabi", "Zaid"].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setSelectedSeason(s)}
                                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                                    selectedSeason === s
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80 border-border"
                                }`}
                            >
                                {s === "All" ? "All Seasons" : s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Live Data Preview Card */}
                <div className="bg-card p-4 rounded-xl border border-border/80 shadow-2xs space-y-3">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-muted-foreground uppercase">Report Preview</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {selectedSeason === "All" ? "Full Financial Year" : `${selectedSeason} Season`}
                        </span>
                    </div>

                    {loadingMeta ? (
                        <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">
                            Loading report figures...
                        </div>
                    ) : meta ? (
                        <div className="grid grid-cols-3 gap-2 text-center text-xs bg-muted/30 p-3 rounded-lg border border-border/50">
                            <div>
                                <p className="text-[10px] text-muted-foreground">Crops Included</p>
                                <p className="font-bold text-foreground text-sm mt-0.5">{meta.crops_count} Crops</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground">Production Cost</p>
                                <p className="font-bold text-foreground text-sm mt-0.5">₹{meta.total_cost.toLocaleString("en-IN")}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground">Net Farm Profit</p>
                                <p className="font-black text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                                    ₹{meta.net_profit.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Accepted & Eligible Uses */}
                <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Official Bank & Government Applications:
                    </p>
                    <div className="space-y-1.5 text-xs text-foreground">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>Kisan Credit Card (KCC) limit enhancements & renewals</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>Commercial bank tractor & equipment loan eligibility</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>PM-Fasal Bima Yojana crop loss & insurance claims</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>State agricultural fertilizer & seed subsidy applications</span>
                        </div>
                    </div>
                </div>

                {/* Download CTA Button */}
                <Button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                    {downloading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Generating Official PDF...
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4" /> Download Official PDF Report
                        </>
                    )}
                </Button>
            </div>
        </Modal>
    );
}

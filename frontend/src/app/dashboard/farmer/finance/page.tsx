"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
    LineChart,
    BarChart2,
    CreditCard,
    ShieldCheck,
    PackageCheck,
    Landmark,
    Sparkles
} from "lucide-react";
import SeasonComparisonView from "@/components/farmer/finance/SeasonComparisonView";
import AnnualSummaryView from "@/components/farmer/finance/AnnualSummaryView";
import CreditTrackerView from "@/components/farmer/finance/CreditTrackerView";
import CropInsuranceView from "@/components/farmer/finance/CropInsuranceView";
import CropStorageView from "@/components/farmer/finance/CropStorageView";

export type FinanceTabKey =
    | "season-comparison"
    | "annual-summary"
    | "credit"
    | "insurance"
    | "storage";

interface TabDefinition {
    id: FinanceTabKey;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabDefinition[] = [
    {
        id: "season-comparison",
        label: "Season Comparison",
        description: "Compare yield, input costs & net profits across seasons",
        icon: LineChart,
    },
    {
        id: "annual-summary",
        label: "Annual Summary",
        description: "Fiscal year ledger, Kharif/Rabi audits & crop rankings",
        icon: BarChart2,
    },
    {
        id: "credit",
        label: "Credit & Loans",
        description: "KCC bank loans, shop credits & repayment ledger",
        icon: CreditCard,
    },
    {
        id: "insurance",
        label: "Crop Insurance",
        description: "PMFBY coverage policies, receipts & claim claims",
        icon: ShieldCheck,
    },
    {
        id: "storage",
        label: "Warehouse Storage",
        description: "Cold storage, CWC godown lots & release scheduling",
        icon: PackageCheck,
    },
];

function FinancePageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useLanguage();

    const paramTab = searchParams.get("tab") as FinanceTabKey | null;
    const initialTab: FinanceTabKey =
        paramTab && TABS.some((t) => t.id === paramTab)
            ? paramTab
            : "season-comparison";

    const [activeTab, setActiveTab] = useState<FinanceTabKey>(initialTab);
    const [visitedTabs, setVisitedTabs] = useState<Record<string, boolean>>({
        [initialTab]: true,
    });

    useEffect(() => {
        if (paramTab && TABS.some((t) => t.id === paramTab) && paramTab !== activeTab) {
            setActiveTab(paramTab);
            setVisitedTabs((prev) => ({ ...prev, [paramTab]: true }));
        }
    }, [paramTab]);

    const handleSelectTab = (tabId: FinanceTabKey) => {
        setActiveTab(tabId);
        setVisitedTabs((prev) => ({ ...prev, [tabId]: true }));
        // Update URL query parameter smoothly without full-page navigation
        const url = new URL(window.location.href);
        url.searchParams.set("tab", tabId);
        window.history.replaceState(null, "", url.toString());
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Unified Hub Navigation Header */}
            <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-green-950 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold">
                            <Landmark className="h-3.5 w-3.5 text-emerald-300" />
                            <span>{t("financeHub.badge", "All-in-One Finance & Storage Hub")}</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
                            {t("sidebar.financeStorage", "Finance & Storage")}
                        </h1>
                        <p className="text-emerald-100/90 text-sm max-w-3xl leading-relaxed">
                            {t(
                                "financeHub.description",
                                "Manage your full agricultural finance lifecycle: multi-season ROI comparisons, fiscal annual audits, borrowings & loan repayments, PMFBY crop insurance, and warehouse storage inventory."
                            )}
                        </p>
                    </div>

                    <div className="hidden lg:flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-xs text-emerald-100">
                        <Sparkles className="h-5 w-5 text-emerald-300 shrink-0" />
                        <div>
                            <p className="font-bold text-white">5 Unified Modules</p>
                            <p className="text-emerald-200">Switch tabs below instantly</p>
                        </div>
                    </div>
                </div>

                {/* Tab Switcher Pills */}
                <div className="p-2.5 bg-muted/30 border-t border-border/60">
                    <nav
                        className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
                        aria-label="Finance & Storage Tabs"
                    >
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleSelectTab(tab.id)}
                                    className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 select-none ${
                                        isActive
                                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/20"
                                            : "bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground border border-border/60"
                                    }`}
                                >
                                    <Icon
                                        className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                                            isActive
                                                ? "text-white"
                                                : "text-emerald-600 dark:text-emerald-400"
                                        }`}
                                    />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* View Panels (Mounted on demand & kept alive to preserve inputs) */}
            <div className="w-full">
                {visitedTabs["season-comparison"] && (
                    <div className={activeTab === "season-comparison" ? "block" : "hidden"}>
                        <SeasonComparisonView />
                    </div>
                )}

                {visitedTabs["annual-summary"] && (
                    <div className={activeTab === "annual-summary" ? "block" : "hidden"}>
                        <AnnualSummaryView />
                    </div>
                )}

                {visitedTabs["credit"] && (
                    <div className={activeTab === "credit" ? "block" : "hidden"}>
                        <CreditTrackerView />
                    </div>
                )}

                {visitedTabs["insurance"] && (
                    <div className={activeTab === "insurance" ? "block" : "hidden"}>
                        <CropInsuranceView />
                    </div>
                )}

                {visitedTabs["storage"] && (
                    <div className={activeTab === "storage" ? "block" : "hidden"}>
                        <CropStorageView />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function FinancePage() {
    return (
        <Suspense
            fallback={
                <div className="p-8 text-center text-emerald-600 font-semibold animate-pulse">
                    Loading Finance & Storage Hub...
                </div>
            }
        >
            <FinancePageContent />
        </Suspense>
    );
}

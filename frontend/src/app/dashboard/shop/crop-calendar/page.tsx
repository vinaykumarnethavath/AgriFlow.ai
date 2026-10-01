"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { RegionalCropCalendar, RegionalCrop } from "@/components/shop/RegionalCropCalendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Calendar, 
    Sprout, 
    MapPin, 
    Compass, 
    ArrowRight, 
    Clock, 
    ShieldAlert, 
    RefreshCw, 
    PackageCheck,
    Layers
} from "lucide-react";

export default function ShopCropCalendarPage() {
    const { t } = useLanguage();
    const [regionalCropCalendar, setRegionalCropCalendar] = useState<RegionalCrop[]>([]);
    const [totalCultivationArea, setTotalCultivationArea] = useState<number>(0);
    const [regionInfo, setRegionInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchCalendarData = async () => {
        try {
            const { data } = await api.get("/analytics/shop/discovery");
            if (data.regional_crop_calendar) setRegionalCropCalendar(data.regional_crop_calendar);
            if (data.total_cultivation_area) setTotalCultivationArea(data.total_cultivation_area);
            if (data.region_info) setRegionInfo(data.region_info);
        } catch (err) {
            console.error("Failed to fetch crop calendar data:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCalendarData();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchCalendarData();
    };

    // Calculate high-level summary KPIs
    const kpis = useMemo(() => {
        const totalCrops = regionalCropCalendar.length;
        const criticalCount = regionalCropCalendar.filter(
            c => c.stage_urgency === "critical" || c.stage_urgency === "high"
        ).length;
        const harvestCount = regionalCropCalendar.filter(
            c => c.is_harvest_ready || (c.days_to_harvest != null && c.days_to_harvest <= 20)
        ).length;
        const totalInputsNow = regionalCropCalendar.reduce(
            (acc, c) => acc + (c.inputs_needed_now?.length || 0), 0
        );

        return { totalCrops, criticalCount, harvestCount, totalInputsNow };
    }, [regionalCropCalendar]);

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-green-950/40 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="flex items-start gap-4">
                        <div className="p-3.5 bg-emerald-600 text-white rounded-2xl shadow-sm shrink-0">
                            <Calendar className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                                    {t("sidebar.cropCalendar", "Regional Crop Calendar & Growth Stages")}
                                </h1>
                                <span className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                                    Live Phenology Tracking
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                                Monitor regional crop stages, harvest countdowns, and stage-specific fertilizer & pesticide requirements across your catchment area to stock items proactively before peak farmer demand.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={loading || refreshing}
                            className="bg-white/80 dark:bg-zinc-800/80 hover:bg-white text-xs font-semibold gap-1.5"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                        <Link href="/dashboard/shop/discovery">
                            <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-xs"
                            >
                                <PackageCheck className="w-4 h-4" />
                                Smart Stocking Recs
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {regionInfo && (
                    <div className="mt-4 pt-4 border-t border-emerald-200/50 dark:border-emerald-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-semibold">
                            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{regionInfo.name}</span>
                            <span className="text-muted-foreground font-normal">
                                • {regionInfo.radius_km} km radius
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground font-medium flex-wrap">
                            <span>👥 <strong>{regionInfo.total_farmers}</strong> Active Farmers</span>
                            <span>🌾 <strong>{totalCultivationArea.toFixed(1)}</strong> Total Acres</span>
                            <span>📊 <strong>{regionInfo.market_share_pct}%</strong> Shop Catchment Share</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick KPI Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-gray-200 dark:border-zinc-800 shadow-2xs hover:shadow-xs transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Regional Crops</p>
                            <h3 className="text-2xl font-bold text-foreground mt-0.5">{kpis.totalCrops}</h3>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Cultivated in region</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                            <Sprout className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-zinc-800 shadow-2xs hover:shadow-xs transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Total Area</p>
                            <h3 className="text-2xl font-bold text-foreground mt-0.5">{totalCultivationArea.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">acres</span></h3>
                            <p className="text-[11px] text-muted-foreground font-medium">Registered plots</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                            <Layers className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-zinc-800 shadow-2xs hover:shadow-xs transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Critical Stages</p>
                            <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">{kpis.criticalCount}</h3>
                            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">Immediate inputs needed</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 dark:border-zinc-800 shadow-2xs hover:shadow-xs transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Upcoming Harvests</p>
                            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{kpis.harvestCount}</h3>
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">In harvest window / soon</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                            <Clock className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Interactive Regional Crop Calendar Component */}
            <RegionalCropCalendar
                crops={regionalCropCalendar}
                loading={loading}
                regionName={regionInfo?.name || "Catchment Area"}
                totalAcres={totalCultivationArea}
                totalFarmers={regionInfo?.total_farmers || 0}
            />

            {/* Bottom Navigation Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-emerald-50/70 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-emerald-950/20 border border-blue-100 dark:border-blue-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <span>💡</span>
                        Ready to optimize stock according to crop stages?
                    </h4>
                    <p className="text-xs text-muted-foreground">
                        Use our Predictive Stocking Engine to auto-match these stage requirements against your current shop inventory.
                    </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                    <Link href="/dashboard/shop/inventory">
                        <Button variant="outline" size="sm" className="text-xs font-semibold">
                            View Inventory
                        </Button>
                    </Link>
                    <Link href="/dashboard/shop/discovery">
                        <Button size="sm" className="bg-primary text-primary-foreground text-xs font-bold gap-1">
                            Predictive Stocking <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

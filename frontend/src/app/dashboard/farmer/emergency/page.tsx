"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import EmergencyContactsCard from "@/components/info/EmergencyContactsCard";
import {
    PhoneCall, ShieldAlert, Zap, Droplets, Stethoscope, AlertTriangle,
    ArrowLeft, Phone, Flame, HeartPulse, ShieldCheck, Info,
    ChevronDown, ChevronUp, Clock, CheckCircle2, Siren, HelpCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmergencyProtocol {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
    immediateAction: string;
    steps: string[];
    helpline: { label: string; number: string };
}

const EMERGENCY_PROTOCOLS: EmergencyProtocol[] = [
    {
        id: "electrical",
        title: "Electrical Shock & Fallen 11kV Lines",
        icon: Zap,
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-300 dark:border-amber-800",
        immediateAction: "DO NOT approach within 10 meters (33 ft) of snapped lines. Keep feet together and hop away.",
        steps: [
            "Switch off the main feeder/pump starter circuit breaker immediately if accessible safely.",
            "Do not touch an energized victim with bare hands; use a dry wooden stick or dry rope.",
            "Call the 24/7 Power Discom helpline (1912) and alert the village lineman.",
            "Administer CPR if the victim is unresponsive and breathing has stopped, after breaking contact."
        ],
        helpline: { label: "Discom 24/7 Power", number: "1912" }
    },
    {
        id: "pesticide",
        title: "Pesticide & Chemical Poisoning",
        icon: ShieldAlert,
        color: "text-rose-600 dark:text-rose-400",
        bgColor: "bg-rose-500/10",
        borderColor: "border-rose-300 dark:border-rose-800",
        immediateAction: "Remove victim from spraying zone into fresh air. Strip contaminated clothes immediately.",
        steps: [
            "Flush skin and eyes thoroughly with cold clean running water for at least 15 minutes.",
            "Do NOT induce vomiting unless specifically instructed by a medical doctor on the chemical label.",
            "Collect the exact pesticide container or trade label to show attending doctors at the clinic.",
            "Immediately rush to the nearest Primary Health Centre (PHC) or dial 108 Ambulance."
        ],
        helpline: { label: "Ambulance Emergency", number: "108" }
    },
    {
        id: "crop_loss",
        title: "Severe Calamity & Crop Loss (PMFBY Claim)",
        icon: AlertTriangle,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-300 dark:border-orange-800",
        immediateAction: "Intimate crop insurance authority within strict 72 hours of unseasonal rain, hailstorm, or flood.",
        steps: [
            "Dial PMFBY Toll-Free Hotline 14447 or file loss via the Crop Insurance App within 72 hours.",
            "Take geotagged and date-stamped clear photos and videos of flooded or damaged standing crops.",
            "Retain your PMFBY Policy Number, Aadhaar card, and Khasra / Survey Number ready.",
            "Notify your local Village Revenue Officer (VRO) or Agriculture Extension Officer (AEO) for joint survey."
        ],
        helpline: { label: "PMFBY Claim Line", number: "14447" }
    },
    {
        id: "livestock",
        title: "Cattle Sudden Bloat / Snakebite",
        icon: Stethoscope,
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-300 dark:border-emerald-800",
        immediateAction: "Keep affected cattle standing and head elevated. Avoid panic or forcing water down throat.",
        steps: [
            "In severe frothy bloat: keep animal walking slowly; keep mouth open with a wooden bit.",
            "In snakebite: keep the animal calm, avoid tight tourniquets, and note snake markings if safely visible.",
            "Call the 24/7 Mobile Veterinary Clinic at 1962 or your local veterinary dispensary doctor.",
            "Ensure anti-venom or trocar decompression is handled exclusively by a certified veterinarian."
        ],
        helpline: { label: "Veterinary Helpline", number: "1962" }
    },
    {
        id: "fire",
        title: "Stubble, Barn & Combine Harvester Fire",
        icon: Flame,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-300 dark:border-red-800",
        immediateAction: "Immediately create a firebreak by ploughing a wide dirt trench upwind of the flame front.",
        steps: [
            "Move all diesel drums, tractors, cattle, and fodder away from the path of the smoke.",
            "Use tractor disc harrows to throw wet dirt or soil onto creeping field fires if water is scarce.",
            "Dial 101 Fire Brigade and immediately broadcast warning to village farmer WhatsApp groups.",
            "Never fight large flames downwind where sudden wind gusts can encircle you."
        ],
        helpline: { label: "Fire Emergency", number: "101" }
    }
];

export default function EmergencyPage() {
    const { t } = useLanguage();
    const [expandedProtocol, setExpandedProtocol] = useState<string | null>("electrical");

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-12 px-2 sm:px-4">
            {/* ── BREADCRUMB & HEADER ── */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Link
                        href="/dashboard/farmer"
                        className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        <span>{t("sidebar.dashboard", "Dashboard")}</span>
                    </Link>
                    <span>/</span>
                    <span className="text-foreground font-semibold">
                        {t("sidebar.emergency", "Emergency SOS & Helplines")}
                    </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                        <Siren size={120} />
                    </div>

                    <div className="space-y-2 max-w-2xl relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/30 border border-rose-400/40 text-rose-100 text-xs font-semibold backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                            24/7 National Crisis Direct Dial
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                            <ShieldAlert className="h-8 w-8 text-rose-300" />
                            Emergency SOS & Helplines
                        </h1>
                        <p className="text-sm text-rose-100/90 leading-relaxed">
                            Immediate 24/7 direct-dial access to national agricultural crisis centers, tube well linemen, veterinary doctors, PMFBY crop loss intimation, and field safety protocols.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 relative z-10 shrink-0">
                        <a
                            href="tel:112"
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-rose-900 hover:bg-rose-50 font-black text-sm shadow-lg transition-transform active:scale-95"
                        >
                            <PhoneCall className="h-4 w-4 text-rose-600 animate-pulse" />
                            <span>Dial 112 (National SOS)</span>
                        </a>
                        <a
                            href="tel:18001801551"
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-950/60 hover:bg-rose-950 text-white font-bold text-xs border border-rose-400/40 backdrop-blur-sm transition-all"
                        >
                            <Phone className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Kisan Call Center: 1551</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* ── RAPID 1-CLICK HOTLINE TILES ── */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                        <HeartPulse className="h-4 w-4 text-rose-500" />
                        Quick Direct-Dial Crisis Directory
                    </h2>
                    <span className="text-xs text-muted-foreground hidden sm:inline">Tap any number to call instantly</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { title: "National SOS", sub: "Police / All Emergency", number: "112", color: "from-rose-500/10 to-rose-600/10 border-rose-500/30 text-rose-600 dark:text-rose-400" },
                        { title: "Kisan Center", sub: "Agronomy & Pests", number: "1551", color: "from-emerald-500/10 to-emerald-600/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" },
                        { title: "PMFBY Calamity", sub: "72-Hr Loss Intimation", number: "14447", color: "from-amber-500/10 to-amber-600/10 border-amber-500/30 text-amber-600 dark:text-amber-400" },
                        { title: "Rural Discom", sub: "Transformer & Feeder", number: "1912", color: "from-blue-500/10 to-blue-600/10 border-blue-500/30 text-blue-600 dark:text-blue-400" },
                        { title: "Vet Doctor", sub: "Cattle & Livestock", number: "1962", color: "from-teal-500/10 to-teal-600/10 border-teal-500/30 text-teal-600 dark:text-teal-400" },
                        { title: "Ambulance", sub: "Medical & PHC Rush", number: "108", color: "from-red-500/10 to-red-600/10 border-red-500/30 text-red-600 dark:text-red-400" },
                    ].map((h, i) => (
                        <a
                            key={i}
                            href={`tel:${h.number}`}
                            className={`p-3.5 rounded-xl border bg-gradient-to-br ${h.color} hover:shadow-md transition-all flex flex-col justify-between group active:scale-95`}
                        >
                            <div>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block line-clamp-1">
                                    {h.sub}
                                </span>
                                <p className="text-xs font-bold text-foreground mt-0.5 group-hover:underline">
                                    {h.title}
                                </p>
                            </div>
                            <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40">
                                <span className="text-sm font-black tracking-tight">{h.number}</span>
                                <PhoneCall className="h-3.5 w-3.5 opacity-80 group-hover:scale-110 transition-transform" />
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            {/* ── MAIN DIRECTORY CARD (Full contact list + Custom Add) ── */}
            <div className="space-y-3">
                <EmergencyContactsCard />
            </div>

            {/* ── FARM EMERGENCY ACTION GUIDELINES ── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-emerald-600" />
                            Farm Crisis First-Response Protocols
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Standard operating emergency procedures for sudden agricultural hazards on the field.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {EMERGENCY_PROTOCOLS.map((protocol) => {
                        const Icon = protocol.icon;
                        const isExpanded = expandedProtocol === protocol.id;

                        return (
                            <Card
                                key={protocol.id}
                                className={`border ${protocol.borderColor} transition-all overflow-hidden`}
                            >
                                <CardContent className="p-5 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${protocol.bgColor} ${protocol.color}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground">
                                                    {protocol.title}
                                                </h3>
                                                <p className="text-[11px] font-medium text-muted-foreground">
                                                    Primary Helpline: <span className="font-bold text-foreground">{protocol.helpline.label} ({protocol.helpline.number})</span>
                                                </p>
                                            </div>
                                        </div>

                                        <a
                                            href={`tel:${protocol.helpline.number}`}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold shrink-0 hover:opacity-90 active:scale-95 transition-all"
                                        >
                                            <Phone className="h-3 w-3" />
                                            <span>{protocol.helpline.number}</span>
                                        </a>
                                    </div>

                                    {/* Immediate Golden Rule */}
                                    <div className={`p-3 rounded-lg ${protocol.bgColor} border border-border/40 text-xs font-medium text-foreground flex items-start gap-2`}>
                                        <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${protocol.color}`} />
                                        <span><strong>Golden Rule:</strong> {protocol.immediateAction}</span>
                                    </div>

                                    {/* Action Steps */}
                                    <div>
                                        <button
                                            onClick={() => setExpandedProtocol(isExpanded ? null : protocol.id)}
                                            className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground py-1 transition-colors"
                                        >
                                            <span>Emergency Step-by-Step Response</span>
                                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                        </button>

                                        {isExpanded && (
                                            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground border-t border-border/40 pt-2 animate-in fade-in-50 duration-200">
                                                {protocol.steps.map((step, sIdx) => (
                                                    <li key={sIdx} className="flex items-start gap-2">
                                                        <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground shrink-0 mt-0.5">
                                                            {sIdx + 1}
                                                        </span>
                                                        <span className="leading-relaxed">{step}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* ── SAFETY FOOTER / DISCLAIMER ── */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-start gap-3">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="font-semibold text-foreground">Official Government & Utility Integration Notice</p>
                    <p className="leading-relaxed">
                        Numbers listed above connect to official central and state government disaster services, state power distribution corporations, and the Ministry of Agriculture & Farmers Welfare. Personal contacts added via the directory are stored securely on your account.
                    </p>
                </div>
            </div>
        </div>
    );
}

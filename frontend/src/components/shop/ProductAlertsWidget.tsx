"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Factory, Leaf, ShieldCheck, ChevronRight } from "lucide-react";

interface ProductAlert {
    id: string;
    productName: string;
    manufacturer: string;
    type: string;
    highlights: string[];
    priceHint: string;
    isNew: boolean;
    icon: React.ReactNode;
}

export function ProductAlertsWidget() {
    const alerts: ProductAlert[] = [
        {
            id: "alert-1",
            productName: "AquaSave Wheat Seed v2",
            manufacturer: "GreenTech Seeds Ltd.",
            type: "Seeds",
            highlights: ["Drought Resistant", "High Yield", "Short Cycle"],
            priceHint: "₹3,500 / 50kg bag",
            isNew: true,
            icon: <Leaf className="w-4 h-4 text-emerald-600" />
        },
        {
            id: "alert-2",
            productName: "BioShield Pro",
            manufacturer: "AgriChem Industries",
            type: "Bio-Pesticide",
            highlights: ["Organic Certified", "Broad Spectrum", "Residue Free"],
            priceHint: "₹850 / Liter",
            isNew: true,
            icon: <ShieldCheck className="w-4 h-4 text-blue-600" />
        },
        {
            id: "alert-3",
            productName: "Nano-Urea Plus",
            manufacturer: "National Fertilizers",
            type: "Fertilizer",
            highlights: ["High Efficiency", "Foliar Spray", "Cost Effective"],
            priceHint: "₹240 / 500ml",
            isNew: false,
            icon: <Sparkles className="w-4 h-4 text-amber-600" />
        }
    ];

    return (
        <Card className="h-full border-emerald-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-white border-b border-emerald-50/50 pb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <Factory className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                        <CardTitle className="text-lg text-emerald-900 font-bold">New Product Alerts</CardTitle>
                        <CardDescription className="text-xs">Wholesale discovery engine for advanced agricultural products</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                {alerts.map((alert) => (
                    <div key={alert.id} className="relative p-4 rounded-xl border border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm transition-all group cursor-pointer overflow-hidden">
                        {alert.isNew && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                                New Arrival
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-gray-900 text-base">{alert.productName}</h4>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Factory className="w-3 h-3" /> {alert.manufacturer}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-1.5 rounded-md border border-gray-100">
                                {alert.icon}
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 mb-3 mt-3">
                            {alert.highlights.map((highlight, idx) => (
                                <span key={idx} className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100/50">
                                    {highlight}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                            <span className="text-sm font-semibold text-gray-800">
                                {alert.priceHint}
                            </span>
                            <span className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                <ChevronRight className="w-5 h-5" />
                            </span>
                        </div>
                    </div>
                ))}
                
                <button className="w-full py-2.5 mt-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100 flex items-center justify-center gap-2">
                    Browse Wholesale Catalog
                </button>
            </CardContent>
        </Card>
    );
}

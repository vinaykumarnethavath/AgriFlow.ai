"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Factory, Leaf, ShieldCheck, ChevronRight, Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface ProductAlert {
    id: string;
    productName: string;
    manufacturer: string;
    type: string;
    highlights: string[];
    priceHint: string;
    isNew: boolean;
    icon: React.ReactNode;
    details?: {
        photo?: string;
        crops: string[];
        conditions: string[];
        description: string;
    };
}

export function ProductAlertsWidget() {
    const [selectedAlert, setSelectedAlert] = useState<ProductAlert | null>(null);

    const alerts: ProductAlert[] = [
        {
            id: "alert-1",
            productName: "AquaSave Wheat Seed v2",
            manufacturer: "GreenTech Seeds Ltd.",
            type: "Seeds",
            highlights: ["Drought Resistant", "High Yield", "Short Cycle"],
            priceHint: "₹3,500 / 50kg bag",
            isNew: true,
            icon: <Leaf className="w-4 h-4 text-emerald-600" />,
            details: {
                photo: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
                crops: ["Wheat", "Barley"],
                conditions: ["Low rainfall regions", "Dry soil conditions"],
                description: "A genetically optimized wheat seed variety designed for maximum yield in water-scarce environments. Reduces water usage by up to 30% without compromising grain quality."
            }
        },
        {
            id: "alert-2",
            productName: "BioShield Pro",
            manufacturer: "AgriChem Industries",
            type: "Bio-Pesticide",
            highlights: ["Organic Certified", "Broad Spectrum", "Residue Free"],
            priceHint: "₹850 / Liter",
            isNew: true,
            icon: <ShieldCheck className="w-4 h-4 text-blue-600" />,
            details: {
                photo: "https://images.unsplash.com/photo-1627918349071-70e28f0957b8?auto=format&fit=crop&w=400&q=80",
                crops: ["Tomatoes", "Peppers", "Cotton", "Tea"],
                conditions: ["High humidity", "Pest-prone seasons"],
                description: "An advanced organic bio-pesticide that targets multiple harmful insects while remaining completely safe for pollinators and crops. Zero chemical residue."
            }
        },
        {
            id: "alert-3",
            productName: "Nano-Urea Plus",
            manufacturer: "National Fertilizers",
            type: "Fertilizer",
            highlights: ["High Efficiency", "Foliar Spray", "Cost Effective"],
            priceHint: "₹240 / 500ml",
            isNew: false,
            icon: <Sparkles className="w-4 h-4 text-amber-600" />,
            details: {
                photo: "https://images.unsplash.com/photo-1592982537447-6f23b7b25e5a?auto=format&fit=crop&w=400&q=80",
                crops: ["Paddy", "Maize", "Sugarcane"],
                conditions: ["Mid-growth stage", "Nitrogen deficient soil"],
                description: "Liquid nano-urea formulation that provides 80% higher nitrogen use efficiency compared to conventional granular urea. A 500ml bottle replaces one 45kg bag of traditional urea."
            }
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
                    <div 
                        key={alert.id} 
                        className="relative p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-sm transition-all group cursor-pointer overflow-hidden"
                        onClick={() => setSelectedAlert(alert)}
                    >
                        {alert.isNew && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                                New Arrival
                            </div>
                        )}
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-foreground text-base">{alert.productName}</h4>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
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
                            <span className="text-sm font-semibold text-foreground">
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

            <Modal 
                isOpen={!!selectedAlert} 
                onClose={() => setSelectedAlert(null)}
                title={selectedAlert?.productName || "Product Details"}
            >
                {selectedAlert && selectedAlert.details && (
                    <div className="space-y-6">
                        {selectedAlert.details.photo && (
                            <div className="w-full h-48 overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-800 relative">
                                <img 
                                    src={selectedAlert.details.photo} 
                                    alt={selectedAlert.productName} 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                                    <Factory className="w-3.5 h-3.5" />
                                    {selectedAlert.manufacturer}
                                </div>
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                {selectedAlert.productName}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                {selectedAlert.details.description}
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/60">
                                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <Leaf className="w-3.5 h-3.5" /> Suitable Crops
                                </h4>
                                <ul className="space-y-1">
                                    {selectedAlert.details.crops.map((crop, i) => (
                                        <li key={i} className="text-sm text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5 font-medium">
                                            <Check className="w-3 h-3 text-emerald-500" /> {crop}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/60">
                                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Ideal Conditions
                                </h4>
                                <ul className="space-y-1">
                                    {selectedAlert.details.conditions.map((cond, i) => (
                                        <li key={i} className="text-sm text-amber-950 dark:text-amber-100 flex items-center gap-1.5 font-medium">
                                            <Check className="w-3 h-3 text-amber-500" /> {cond}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                            <div>
                                <span className="block text-xs text-muted-foreground font-semibold">Wholesale Price</span>
                                <span className="block text-lg font-bold text-foreground">{selectedAlert.priceHint}</span>
                            </div>
                            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors">
                                Source Product
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </Card>
    );
}

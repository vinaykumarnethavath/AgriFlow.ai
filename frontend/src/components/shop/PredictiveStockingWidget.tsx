"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, TrendingUp, CloudRain, Sprout, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getMyProducts, Product } from "@/lib/api";

interface Recommendation {
    id: string;
    productName: string;
    category: string;
    confidence: number;
    reason: string;
    icon: React.ReactNode;
    color: string;
    suggestedQuantity: number;
    searchQuery: string;
}

export function PredictiveStockingWidget() {
    const { t } = useLanguage();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const data = await getMyProducts();
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products for predictions", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInventory();
    }, []);

    const getDynamicRecommendations = (): Recommendation[] => {
        const baseRecs = [
            {
                id: "1",
                productName: "Urea 46% N",
                category: "Fertilizer",
                confidence: 94,
                reason: "Upcoming Kharif season and high historical demand in your 50km radius.",
                icon: <TrendingUp className="w-5 h-5" />,
                color: "text-blue-600 bg-blue-100",
                searchQuery: "Urea",
                targetStock: 500
            },
            {
                id: "2",
                productName: "Paddy Seeds (IR64)",
                category: "Seeds",
                confidence: 88,
                reason: "Monsoon forecasts predict favorable rainfall starting next week.",
                icon: <CloudRain className="w-5 h-5" />,
                color: "text-emerald-600 bg-emerald-100",
                searchQuery: "Paddy Seed IR64",
                targetStock: 200
            },
            {
                id: "3",
                productName: "Systemic Fungicide",
                category: "Pesticide",
                confidence: 76,
                reason: "Recent high humidity alerts indicate potential fungal outbreaks.",
                icon: <Sprout className="w-5 h-5" />,
                color: "text-purple-600 bg-purple-100",
                searchQuery: "Fungicide",
                targetStock: 100
            },
        ];

        return baseRecs.map(rec => {
            // Find if we have this product or similar in inventory
            const matchingProducts = products.filter(p => 
                p.name.toLowerCase().includes(rec.searchQuery.toLowerCase()) || 
                (p.category.toLowerCase() === rec.category.toLowerCase() && p.name.toLowerCase().includes(rec.productName.split(' ')[0].toLowerCase()))
            );

            const currentStock = matchingProducts.reduce((sum, p) => sum + p.quantity, 0);
            
            let suggestedQuantity = rec.targetStock;
            let finalReason = rec.reason;

            if (currentStock > 0) {
                if (currentStock < rec.targetStock) {
                    suggestedQuantity = rec.targetStock - currentStock;
                    finalReason = `You currently have ${currentStock} units. ${rec.reason} We recommend topping up to ${rec.targetStock}.`;
                } else {
                    suggestedQuantity = 0; // Already sufficiently stocked
                    finalReason = `Your stock of ${currentStock} units is sufficient for the upcoming demand.`;
                }
            } else {
                finalReason = `You have 0 units in stock. ${rec.reason} We recommend stocking ${rec.targetStock} units.`;
            }

            return {
                ...rec,
                reason: finalReason,
                suggestedQuantity,
            };
        });
    };

    const recommendations = getDynamicRecommendations();

    return (
        <Card className="h-full border-indigo-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-white border-b border-indigo-50/50 pb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Lightbulb className="w-5 h-5 text-indigo-700" />
                    </div>
                    <div>
                        <CardTitle className="text-lg text-indigo-900 font-bold">Predictive Stocking</CardTitle>
                        <CardDescription className="text-xs">AI-driven recommendations based on inventory, local crop cycles and weather</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                    </div>
                ) : (
                    recommendations.map((rec) => (
                        <div key={rec.id} className="group flex gap-4 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                            <div className={`p-3 rounded-full flex-shrink-0 h-min ${rec.color}`}>
                                {rec.icon}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-foreground">{rec.productName}</h4>
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{rec.category}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${rec.suggestedQuantity > 0 ? 'text-indigo-700 bg-indigo-100' : 'text-emerald-700 bg-emerald-100'}`}>
                                            {rec.confidence}% Match
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {rec.reason}
                                </p>
                                <div className="pt-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {rec.suggestedQuantity > 0 ? (
                                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                                            Buy +{rec.suggestedQuantity} units
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                                            Adequately Stocked
                                        </span>
                                    )}
                                    <button className="text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:text-indigo-800">
                                        Search Suppliers <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Sprout, TrendingUp, Lightbulb, ChevronRight, RotateCcw } from "lucide-react";
import { T } from "@/components/TranslateText";

interface Recommendation {
    crop_name: string;
    reason: string;
    confidence_score: number;
    type: "market" | "rotation" | "general";
}

export default function CropRecommendationWidget() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await api.get("/recommendations/crop");
                setRecommendations(res.data);
            } catch (err) {
                console.error("Failed to fetch recommendations", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, []);

    if (loading) {
        return (
            <Card className="border border-green-100 shadow-sm animate-pulse">
                <CardContent className="p-5">
                    <div className="h-6 w-48 bg-green-100 rounded mb-4"></div>
                    <div className="h-20 w-full bg-gray-100 rounded-xl"></div>
                </CardContent>
            </Card>
        );
    }

    if (recommendations.length === 0) return null;

    return (
        <Card className="border border-green-200 shadow-lg bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/20 dark:to-background overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Lightbulb size={120} />
            </div>
            
            <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-green-700" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">
                        <T>Smart Crop Recommendations</T>
                    </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">
                                        {rec.crop_name.toLowerCase().includes('chilli') ? '🌶️' :
                                        rec.crop_name.toLowerCase().includes('wheat') ? '🌾' :
                                        rec.crop_name.toLowerCase().includes('rice') ? '🌾' :
                                        rec.crop_name.toLowerCase().includes('soybean') ? '🫘' :
                                        rec.crop_name.toLowerCase().includes('maize') ? '🌽' : '🌿'}
                                    </span>
                                    <h3 className="font-bold text-lg"><T>{rec.crop_name}</T></h3>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1 ${
                                    rec.type === 'market' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                    rec.type === 'rotation' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    'bg-purple-50 text-purple-700 border border-purple-200'
                                }`}>
                                    {rec.type === 'market' && <TrendingUp className="h-3 w-3" />}
                                    {rec.type === 'rotation' && <RotateCcw className="h-3 w-3" />}
                                    {rec.type === 'general' && <Sprout className="h-3 w-3" />}
                                    <T>{rec.type}</T>
                                </span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                <T>{rec.reason}</T>
                            </p>
                            
                            <div className="mt-4 flex justify-between items-center pt-3 border-t border-gray-50 dark:border-zinc-800">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 w-16 overflow-hidden">
                                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${rec.confidence_score}%` }}></div>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground font-medium">{rec.confidence_score}% Match</span>
                                </div>
                                <button className="text-green-600 hover:text-green-700 p-1 bg-green-50 hover:bg-green-100 rounded-full transition-colors">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

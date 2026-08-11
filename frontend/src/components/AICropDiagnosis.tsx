"use client";

import React, { useState, useRef } from "react";
import { 
    Camera, 
    Upload, 
    AlertCircle, 
    CheckCircle2, 
    Info, 
    Activity, 
    ShieldAlert, 
    Droplets, 
    RefreshCw,
    X,
    FileText,
    Stethoscope,
    Lightbulb,
    ShoppingCart,
    History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { diagnoseCropHealth, getCropDiagnosisHistory, CropHealthDiagnosis, DiseaseInfo, TreatmentStep, PesticideRecommendation, PreventionTip, CropDiagnosisHistoryItem } from "@/lib/api";
import { compressImage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/context/LanguageContext";

interface AICropDiagnosisProps {
    cropName?: string;
    cropId?: number;
}

export const AICropDiagnosis: React.FC<AICropDiagnosisProps> = ({ cropName, cropId }) => {
    const { t } = useLanguage();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [diagnosis, setDiagnosis] = useState<CropHealthDiagnosis | null>(null);
    const [historyData, setHistoryData] = useState<CropDiagnosisHistoryItem[]>([]);
    const [activeTab, setActiveTab] = useState<"new" | "history">("new");
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (cropId && activeTab === "history") {
            getCropDiagnosisHistory(cropId).then(setHistoryData).catch(console.error);
        }
    }, [cropId, activeTab]);

    React.useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setDiagnosis(null);
            setError(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setSelectedImage(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setDiagnosis(null);
            setError(null);
        }
    };

    const runDiagnosis = async () => {
        if (!selectedImage) return;

        setIsAnalyzing(true);
        setError(null);
        try {
            // Compress image to save bandwidth and improve speed (max 1024px width, 70% quality)
            const compressedImage = await compressImage(selectedImage, 1024, 0.7);
            const result = await diagnoseCropHealth(compressedImage, cropName, cropId);
            setDiagnosis(result);
            if (cropId) {
                getCropDiagnosisHistory(cropId).then(setHistoryData).catch(console.error);
            }
        } catch (err: any) {
            console.error("Diagnosis error:", err);
            setError(err.response?.data?.detail || "Failed to analyze image. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const reset = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setDiagnosis(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const getUrgencyColor = (level: string) => {
        switch (level.toLowerCase()) {
            case "critical": return "bg-red-500 text-white";
            case "high": return "bg-orange-500 text-white";
            case "medium": return "bg-yellow-500 text-foreground";
            case "low": return "bg-blue-500 text-white";
            default: return "bg-gray-500 text-white";
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "critical": return "text-red-600";
            case "severe": return "text-orange-600";
            case "moderate": return "text-yellow-600";
            case "mild": return "text-green-600";
            default: return "text-muted-foreground";
        }
    };

    return (
        <div className="space-y-6">
            {cropId && (
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit mb-4">
                    <button
                        onClick={() => setActiveTab("new")}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === "new" ? "bg-white text-green-700 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <Activity className="w-4 h-4 inline mr-2" /> {t('farmer.cropDiagnosis')}
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === "history" ? "bg-white text-green-700 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                        <History className="w-4 h-4 inline mr-2" /> {t('customer.orderHistory')}
                    </button>
                </div>
            )}

            {activeTab === "history" && (
                <div className="space-y-4">
                    {historyData.length === 0 ? (
                        <div className="text-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <History className="mx-auto w-12 h-12 text-gray-300 mb-2" />
                            <p className="text-muted-foreground font-medium">No past diagnoses found for this crop.</p>
                        </div>
                    ) : (
                        historyData.map((item) => (
                            <Card key={item.id} className="overflow-hidden">
                                <div className="flex flex-col sm:flex-row">
                                    <div className="sm:w-48 h-48 bg-gray-100 shrink-0">
                                        {item.image_url ? (
                                            <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${item.image_url}`} alt="Crop" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                                        )}
                                    </div>
                                    <div className="p-4 flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-foreground">{item.diagnosis.disease?.disease_name || "Healthy"}</h4>
                                            <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex gap-2 mb-3">
                                            {item.diagnosis.is_healthy ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Healthy</Badge>
                                            ) : (
                                                <>
                                                    <Badge variant="outline" className={`${getSeverityColor(item.diagnosis.disease?.severity || "mild")}`}>{item.diagnosis.disease?.severity}</Badge>
                                                    <Badge className={`${getUrgencyColor(item.diagnosis.urgency_level)}`}>{item.diagnosis.urgency_level}</Badge>
                                                </>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{item.diagnosis.disease?.description || item.diagnosis.additional_notes}</p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {activeTab === "new" && (
                <div className="space-y-6">
                    {!diagnosis && !isAnalyzing && (
                <Card className="border-dashed border-2 border-green-200 bg-green-50/30">
                    <CardContent className="p-10 text-center">
                        <div 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="flex flex-col items-center justify-center space-y-4"
                        >
                            {previewUrl ? (
                                <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden shadow-lg mb-4">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        onClick={reset}
                                        className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="p-6 bg-white rounded-full shadow-sm mb-2">
                                    <Camera size={48} className="text-green-600" />
                                </div>
                            )}

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-green-900">
                                    {previewUrl ? t('common.success') : t('farmer.cropDiagnosis')}
                                </h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    {previewUrl 
                                        ? t('diagnosis.analyzing') 
                                        : t('diagnosis.dragDrop')}
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={fileInputRef}
                                    onChange={handleImageSelect}
                                />
                                <Button 
                                    variant="outline" 
                                    className="bg-white border-green-200 text-green-700 hover:bg-green-50"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload size={18} className="mr-2" /> 
                                    {previewUrl ? t('common.edit') : t('common.upload')}
                                </Button>
                                
                                {previewUrl && (
                                    <Button 
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        onClick={runDiagnosis}
                                    >
                                        <Stethoscope size={18} className="mr-2" /> 
                                        {t('farmer.diagnoseMyCrop')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isAnalyzing && (
                <Card className="border-green-100 overflow-hidden">
                    <CardContent className="p-12 flex flex-col items-center justify-center space-y-6 text-center">
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Stethoscope size={32} className="text-green-600 animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-foreground">{t('diagnosis.analyzing')}</h3>
                            <p className="text-muted-foreground animate-pulse">{t('common.loading')} {cropName || t('farmer.myCrops')}</p>
                        </div>
                        <div className="w-full max-w-xs bg-gray-100 h-2 rounded-full overflow-hidden">
                            <motion.div 
                                className="bg-green-600 h-full"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 15, ease: "linear" }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">This usually takes about 10-20 seconds</p>
                    </CardContent>
                </Card>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 text-red-700 animate-in fade-in zoom-in duration-300">
                    <AlertCircle className="shrink-0" />
                    <div>
                        <p className="font-bold">{t('diagnosis.result')}</p>
                        <p className="text-sm">{error}</p>
                        <Button variant="link" className="p-0 h-auto text-red-700 font-bold mt-2" onClick={reset}>
                            {t('diagnosis.tryAnother')}
                        </Button>
                    </div>
                </div>
            )}

            {diagnosis && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Urgency and Result Banner */}
                    <div className={`p-4 rounded-xl flex items-center justify-between shadow-sm ${diagnosis.is_healthy ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-center gap-3">
                            {diagnosis.is_healthy ? (
                                <CheckCircle2 className="text-green-600" size={28} />
                            ) : (
                                <AlertCircle className="text-red-600" size={28} />
                            )}
                            <div>
                                <h3 className={`font-bold text-lg ${diagnosis.is_healthy ? 'text-green-900' : 'text-red-900'}`}>
                                    {diagnosis.is_healthy ? t('diagnosis.healthy') : t('diagnosis.disease')}
                                </h3>
                                <p className="text-sm text-muted-foreground">{t('common.status')}: <span className="font-bold">{diagnosis.crop_detected}</span></p>
                            </div>
                        </div>
                        <Badge className={`${getUrgencyColor(diagnosis.urgency_level)} px-3 py-1 rounded-full text-xs uppercase tracking-wider`}>
                            {diagnosis.urgency_level} Urgency
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Disease Details */}
                        <Card className="md:col-span-2 shadow-md hover:shadow-lg transition-shadow border-gray-100">
                            <CardHeader className="border-b bg-gray-50/50">
                                <CardTitle className="text-foreground flex items-center gap-2">
                                    <FileText className="text-blue-600" size={20} />
                                    {t('diagnosis.result')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {diagnosis.disease ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-2xl font-black text-foreground">{diagnosis.disease.disease_name}</h4>
                                                <div className="flex gap-2 mt-2">
                                                    <Badge variant="outline" className={`${getSeverityColor(diagnosis.disease.severity)} border-current font-bold uppercase`}>
                                                        {t('diagnosis.severity')}: {diagnosis.disease.severity}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-blue-600 border-blue-200 font-bold uppercase">
                                                        {t('diagnosis.confidence')}: {diagnosis.disease.confidence}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <p className="text-foreground leading-relaxed bg-white border rounded-xl p-4 italic">
                                            "{diagnosis.disease.description}"
                                        </p>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                                <h5 className="text-xs font-bold text-blue-800 uppercase tracking-tight mb-2 flex items-center gap-1">
                                                    <ShieldAlert size={12} /> Affected Parts
                                                </h5>
                                                <div className="flex flex-wrap gap-1">
                                                    {diagnosis.disease.affected_parts.map((p, i) => (
                                                        <span key={i} className="text-xs bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-700 font-medium">{p}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                                                <h5 className="text-xs font-bold text-amber-800 uppercase tracking-tight mb-2 flex items-center gap-1">
                                                    <Info size={12} /> Probable Causes
                                                </h5>
                                                <div className="flex flex-wrap gap-1">
                                                    {diagnosis.disease.causes.map((c, i) => (
                                                        <span key={i} className="text-xs bg-white px-2 py-0.5 rounded border border-amber-200 text-amber-700 font-medium">{c}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-green-50 rounded-xl border border-green-100">
                                        <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
                                        <p className="font-bold text-green-900">{t('diagnosis.healthy')}</p>
                                        <p className="text-sm text-green-700 mt-1">{diagnosis.additional_notes}</p>
                                    </div>
                                )}

                                <div className="space-y-4 pt-4 border-t">
                                    <h5 className="font-bold text-foreground flex items-center gap-2">
                                        <Activity size={18} className="text-indigo-600" /> {t('diagnosis.treatment')}
                                    </h5>
                                    <div className="space-y-3">
                                        {diagnosis.treatment_steps.map((step, i) => (
                                            <div key={i} className="flex gap-3 items-start group">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                    {step.step_number}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground text-sm">{step.title} <span className="text-[10px] font-normal text-indigo-600 uppercase ml-2 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{step.timing}</span></p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pesticides & Prevention */}
                        <div className="space-y-6">
                            <Card className="shadow-md border-amber-100 overflow-hidden">
                                <CardHeader className="bg-amber-50/50 border-b">
                                    <CardTitle className="text-amber-900 text-sm flex items-center gap-2 uppercase tracking-widest">
                                        <Droplets size={16} /> Medicine Cabinet
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    {diagnosis.pesticide_recommendations.length > 0 ? (
                                        diagnosis.pesticide_recommendations.map((p, i) => (
                                            <div key={i} className="p-3 bg-white border border-amber-100 rounded-xl space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-bold text-amber-900 text-sm">{p.name}</p>
                                                    <Badge className="bg-amber-100 text-amber-800 text-[9px] hover:bg-amber-200 border-none">{p.type}</Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="text-[10px]">
                                                        <span className="text-muted-foreground block uppercase font-bold tracking-tighter">Dosage</span>
                                                        <span className="text-foreground font-medium">{p.dosage}</span>
                                                    </div>
                                                    <div className="text-[10px]">
                                                        <span className="text-muted-foreground block uppercase font-bold tracking-tighter">Frequency</span>
                                                        <span className="text-foreground font-medium">{p.frequency}</span>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] bg-amber-50 p-1.5 rounded border border-amber-100">
                                                    <span className="text-amber-800 font-bold block mb-0.5 uppercase tracking-tighter">Precautions:</span>
                                                    <ul className="list-disc list-inside text-amber-900/70">
                                                        {p.precautions.map((pr, pi) => (
                                                            <li key={pi}>{pr}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <a 
                                                    href={`/dashboard/farmer/market?q=${encodeURIComponent(p.name)}`}
                                                    target="_blank"
                                                    className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    <ShoppingCart size={14} /> Find in Nearby Shops
                                                </a>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic text-center p-4">No specific pesticide recommendation needed.</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="shadow-md border-green-100 overflow-hidden">
                                <CardHeader className="bg-green-50/50 border-b">
                                    <CardTitle className="text-green-900 text-sm flex items-center gap-2 uppercase tracking-widest">
                                        <Lightbulb size={16} /> Prevention Tips
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="space-y-2">
                                        {diagnosis.prevention_tips.map((tip, i) => (
                                            <div key={i} className="flex gap-2 p-2 bg-white rounded-lg border border-green-50">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                                                <div>
                                                    <p className="text-xs font-bold text-green-800">{tip.category}</p>
                                                    <p className="text-[11px] text-muted-foreground">{tip.tip}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Button 
                                variant="outline" 
                                className="w-full border-dashed border-gray-200 text-muted-foreground hover:text-green-600 hover:border-green-300"
                                onClick={reset}
                            >
                                <RefreshCw size={16} className="mr-2" /> Start New Analysis
                            </Button>
                        </div>
                    </div>

                    {/* Additional Notes */}
                    {diagnosis.additional_notes && (
                        <Card className="bg-indigo-50 border-indigo-100">
                            <CardContent className="p-4 flex gap-3 text-indigo-900 text-sm italic">
                                <Info className="shrink-0 text-indigo-600" />
                                <p>{diagnosis.additional_notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            )}
                </div>
            )}
        </div>
    );
};

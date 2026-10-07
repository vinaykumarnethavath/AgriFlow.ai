"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
    Factory, MapPin, Phone, Star, Search, ArrowRight, ShieldCheck,
    CheckCircle2, Clock, XCircle, RefreshCw, Send, AlertCircle,
    Copy, Check, Scale, QrCode, Truck, Calendar, Users, Printer,
    Sparkles, HelpCircle, FileText, ChevronRight, Calculator
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
    getMillsMarketplace,
    createMillProcurementRequest,
    getMyProcurementRequests,
    cancelProcurementRequest,
    getCrops,
    calculateMoistureDeduction,
    getGatePass,
    MillMarketplaceItem,
    MillProcurementRequest,
    Crop,
    GatePass,
    MoistureCalculatorResponse
} from "@/lib/api";

const MILL_CATEGORIES = [
    { label: "All Categories", value: "all" },
    { label: "Rice Mills", value: "Rice" },
    { label: "Flour & Grains", value: "Flour" },
    { label: "Dal & Pulses", value: "Dal" },
    { label: "Cotton Ginning", value: "Cotton" },
    { label: "Oil Extraction", value: "Oil" },
];

function MillsMarketplaceContent() {
    const searchParams = useSearchParams();
    const cropIdParam = searchParams.get("cropId");

    const [activeTab, setActiveTab] = useState<"marketplace" | "my_requests" | "moisture_calc">("marketplace");
    const [mills, setMills] = useState<MillMarketplaceItem[]>([]);
    const [myRequests, setMyRequests] = useState<MillProcurementRequest[]>([]);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loadingMills, setLoadingMills] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Modal state for Submitting Offer
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [selectedMill, setSelectedMill] = useState<MillMarketplaceItem | null>(null);
    const [submittingOffer, setSubmittingOffer] = useState(false);
    const [offerForm, setOfferForm] = useState({
        crop_id: cropIdParam ? parseInt(cropIdParam) : undefined,
        crop_name: "",
        quantity: 50,
        unit: "quintal",
        expected_price_per_unit: 2200,
        quality_grade: "Grade A",
        moisture_content: 14.0,
        harvest_date: new Date().toISOString().split("T")[0],
        delivery_slot_date: tomorrowStr,
        delivery_slot_time: "Morning (08:00 - 12:00)",
        vehicle_type: "Tractor Trolley",
        vehicle_number: "",
        notes: "Ready for direct farm-gate inspection or mill delivery."
    });

    // Gate Pass Modal state
    const [gatePassModalOpen, setGatePassModalOpen] = useState(false);
    const [activeGatePass, setActiveGatePass] = useState<GatePass | null>(null);
    const [loadingGatePass, setLoadingGatePass] = useState(false);

    // Moisture Calculator State
    const [calcCrop, setCalcCrop] = useState("Paddy");
    const [calcWeight, setCalcWeight] = useState(100);
    const [calcUnit, setCalcUnit] = useState("quintal");
    const [calcMoisture, setCalcMoisture] = useState(16.5);
    const [calcForeignMatter, setCalcForeignMatter] = useState(1.0);
    const [calcDamaged, setCalcDamaged] = useState(1.0);
    const [calcPrice, setCalcPrice] = useState(2300);
    const [calcResult, setCalcResult] = useState<MoistureCalculatorResponse | null>(null);
    const [calcLoading, setCalcLoading] = useState(false);

    // Modal state for Direct Call / Contact
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [contactMill, setContactMill] = useState<MillMarketplaceItem | null>(null);
    const [copiedPhone, setCopiedPhone] = useState(false);

    // Notification banner
    const [alertMessage, setAlertMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const showAlert = (text: string, type: "success" | "error" = "success") => {
        setAlertMessage({ text, type });
        setTimeout(() => setAlertMessage(null), 5000);
    };

    const handleViewGatePass = async (req: MillProcurementRequest) => {
        setGatePassModalOpen(true);
        setLoadingGatePass(true);
        try {
            const res = await getGatePass(req.id);
            setActiveGatePass(res.gate_pass);
        } catch (err) {
            console.warn("Could not load backend gate pass, building view from request:", err);
            setActiveGatePass({
                token_number: req.token_number || `TK-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${req.id.toString().padStart(4, "0")}`,
                request_id: req.id,
                status: req.status,
                farmer_name: req.farmer_name || "Farmer",
                farmer_phone: req.farmer_phone || "",
                farmer_location: req.farmer_location || "Farm Gate",
                crop_name: req.crop_name,
                quantity: req.quantity,
                unit: req.unit,
                quality_grade: req.quality_grade,
                moisture_content: req.moisture_content,
                delivery_slot_date: req.delivery_slot_date || req.harvest_date,
                delivery_slot_time: req.delivery_slot_time || "Morning (08:00 - 12:00)",
                vehicle_type: req.vehicle_type || "Tractor Trolley",
                vehicle_number: req.vehicle_number || "TS-TROLLEY",
                mill_name: req.mill_name || `Mill #${req.mill_id}`,
                mill_phone: req.mill_phone || null,
                mill_location: req.mill_location || "Processing Mill Gate",
                agreed_price: req.offered_price_per_unit || req.expected_price_per_unit,
                estimated_total: req.quantity * (req.offered_price_per_unit || req.expected_price_per_unit),
                qr_code_data: JSON.stringify({
                    token: req.token_number || `TK-${req.id}`,
                    req_id: req.id,
                    mill: req.mill_name,
                    crop: req.crop_name,
                    qty: req.quantity,
                    unit: req.unit,
                    date: req.delivery_slot_date
                }),
                created_at: req.created_at,
                accepted_at: req.updated_at
            });
        } finally {
            setLoadingGatePass(false);
        }
    };

    const runMoistureCalculation = async () => {
        try {
            setCalcLoading(true);
            const res = await calculateMoistureDeduction({
                crop_name: calcCrop,
                original_weight: Number(calcWeight),
                unit: calcUnit,
                actual_moisture: Number(calcMoisture),
                foreign_matter_pct: Number(calcForeignMatter),
                damaged_grain_pct: Number(calcDamaged),
                price_per_unit: Number(calcPrice),
                save_log: false
            });
            setCalcResult(res);
        } catch (err) {
            console.error("Moisture calculation error:", err);
            // Local standard formula fallback:
            const stdMap: Record<string, number> = { Paddy: 14.0, Wheat: 12.0, Maize: 14.0, Soybean: 12.0, Cotton: 8.5, Mustard: 8.0 };
            const std = stdMap[calcCrop] || 14.0;
            const excess = Math.max(0, calcMoisture - std);
            const moistureDeduction = (calcWeight * excess) / 100;
            const finalNet = Math.max(0, calcWeight - moistureDeduction);
            const origVal = calcWeight * calcPrice;
            const adjVal = finalNet * calcPrice;
            setCalcResult({
                crop_name: calcCrop,
                standard_moisture: std,
                actual_moisture: calcMoisture,
                original_weight: calcWeight,
                unit: calcUnit,
                moisture_excess: excess,
                weight_deduction_moisture: moistureDeduction,
                weight_after_moisture: calcWeight - moistureDeduction,
                foreign_matter_pct: calcForeignMatter,
                foreign_matter_deduction: 0,
                damaged_grain_pct: calcDamaged,
                damaged_grain_deduction: 0,
                final_net_weight: finalNet,
                price_per_unit: calcPrice,
                original_value: origVal,
                adjusted_value: adjVal,
                total_deduction_value: origVal - adjVal,
                deduction_percentage: calcWeight > 0 ? ((calcWeight - finalNet) / calcWeight) * 100 : 0,
                is_fair: excess <= 4.0
            });
        } finally {
            setCalcLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "moisture_calc") {
            runMoistureCalculation();
        }
    }, [activeTab, calcCrop, calcWeight, calcMoisture, calcForeignMatter, calcDamaged, calcPrice, calcUnit]);

    // Load Mills, Farmer's Crops, and Sent Requests
    useEffect(() => {
        loadMills();
        loadFarmerCrops();
        loadMyRequests();
    }, []);

    const loadMills = async () => {
        try {
            setLoadingMills(true);
            const data = await getMillsMarketplace();
            setMills(data);
        } catch (error) {
            console.error("Failed to fetch mills:", error);
            showAlert("Failed to load mills directory. Please check network.", "error");
        } finally {
            setLoadingMills(false);
        }
    };

    const loadFarmerCrops = async () => {
        try {
            const data = await getCrops();
            setCrops(data);
            if (cropIdParam) {
                const found = data.find((c: Crop) => c.id === parseInt(cropIdParam));
                if (found) {
                    setOfferForm(prev => ({
                        ...prev,
                        crop_id: found.id,
                        crop_name: found.name,
                        expected_price_per_unit: found.selling_price_per_unit || 2200,
                    }));
                }
            }
        } catch (err) {
            console.error("Could not load farmer crops:", err);
        }
    };

    const loadMyRequests = async () => {
        try {
            setLoadingRequests(true);
            const data = await getMyProcurementRequests();
            setMyRequests(data);
        } catch (error) {
            console.error("Failed to load sent requests:", error);
        } finally {
            setLoadingRequests(false);
        }
    };

    const handleOpenOfferModal = (mill: MillMarketplaceItem) => {
        setSelectedMill(mill);

        // Pre-fill crop details if not already selected
        let initialCropName = offerForm.crop_name;
        let initialPrice = offerForm.expected_price_per_unit;

        if (!initialCropName && crops.length > 0) {
            initialCropName = crops[0].name;
            initialPrice = crops[0].selling_price_per_unit || 2200;
        } else if (!initialCropName) {
            initialCropName = mill.crops_accepted.split(",")[0]?.trim() || "Paddy";
        }

        setOfferForm(prev => ({
            ...prev,
            crop_name: initialCropName,
            expected_price_per_unit: initialPrice || 2200
        }));

        setIsOfferModalOpen(true);
    };

    const handleCropSelectChange = (cropIdStr: string) => {
        if (!cropIdStr) {
            setOfferForm(prev => ({ ...prev, crop_id: undefined }));
            return;
        }
        const cid = parseInt(cropIdStr);
        const sel = crops.find((c: Crop) => c.id === cid);
        if (sel) {
            setOfferForm(prev => ({
                ...prev,
                crop_id: sel.id,
                crop_name: sel.name,
                expected_price_per_unit: sel.selling_price_per_unit || prev.expected_price_per_unit
            }));
        }
    };

    const handleSubmitOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMill) return;
        if (!offerForm.crop_name.trim()) {
            showAlert("Please specify the crop name", "error");
            return;
        }
        if (offerForm.quantity <= 0 || offerForm.expected_price_per_unit <= 0) {
            showAlert("Quantity and price must be greater than zero", "error");
            return;
        }

        try {
            setSubmittingOffer(true);
            const newReq = await createMillProcurementRequest({
                mill_id: selectedMill.user_id,
                crop_id: offerForm.crop_id,
                crop_name: offerForm.crop_name,
                quantity: Number(offerForm.quantity),
                unit: offerForm.unit,
                expected_price_per_unit: Number(offerForm.expected_price_per_unit),
                quality_grade: offerForm.quality_grade,
                moisture_content: offerForm.moisture_content ? Number(offerForm.moisture_content) : undefined,
                harvest_date: offerForm.harvest_date,
                delivery_slot_date: offerForm.delivery_slot_date,
                delivery_slot_time: offerForm.delivery_slot_time,
                vehicle_type: offerForm.vehicle_type,
                vehicle_number: offerForm.vehicle_number || undefined,
                notes: offerForm.notes
            });

            setMyRequests(prev => [newReq, ...prev]);
            setIsOfferModalOpen(false);
            showAlert(`Successfully sent sell offer for ${offerForm.quantity} ${offerForm.unit} of ${offerForm.crop_name} to ${selectedMill.mill_name}!`);
            setActiveTab("my_requests");
        } catch (error: any) {
            console.error("Failed to submit sell request:", error);
            const errDetail = error.response?.data?.detail || "Could not submit offer to mill. Please try again.";
            showAlert(errDetail, "error");
        } finally {
            setSubmittingOffer(false);
        }
    };

    const handleCancelRequest = async (requestId: number) => {
        if (!confirm("Are you sure you want to cancel this supply offer?")) return;
        try {
            await cancelProcurementRequest(requestId);
            setMyRequests(prev => prev.filter(r => r.id !== requestId));
            showAlert("Offer cancelled successfully");
        } catch (err: any) {
            const msg = err.response?.data?.detail || "Failed to cancel request";
            showAlert(msg, "error");
        }
    };

    const handleCopyPhone = (phone: string) => {
        navigator.clipboard.writeText(phone);
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
    };

    const filteredMills = useMemo(() => {
        return mills.filter(mill => {
            const matchesCat =
                selectedCategory === "all" ||
                mill.type.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                mill.crops_accepted.toLowerCase().includes(selectedCategory.toLowerCase());

            const q = searchTerm.toLowerCase().trim();
            const matchesSearch =
                !q ||
                mill.name.toLowerCase().includes(q) ||
                mill.location.toLowerCase().includes(q) ||
                mill.district.toLowerCase().includes(q) ||
                mill.crops_accepted.toLowerCase().includes(q) ||
                mill.type.toLowerCase().includes(q);

            return matchesCat && matchesSearch;
        });
    }, [mills, selectedCategory, searchTerm]);

    const estimatedTotalRevenue = offerForm.quantity * offerForm.expected_price_per_unit;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl shadow-inner">
                            <Factory className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                                Direct Sale to Processing Mills
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    Direct Procurement
                                </Badge>
                            </h1>
                            <p className="text-muted-foreground text-sm mt-0.5">
                                Bypass middlemen and sell raw produce directly to verified rice, dal, flour, and oil mills at bulk rates.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {cropIdParam && (
                        <Link href={`/dashboard/farmer/crops/${cropIdParam}`}>
                            <Button variant="outline" className="border-blue-200 hover:bg-blue-50 text-blue-700">
                                ← Back to Crop
                            </Button>
                        </Link>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            loadMills();
                            loadMyRequests();
                        }}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
                    </Button>
                </div>
            </div>

            {/* Alert banner */}
            {alertMessage && (
                <div
                    className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                        alertMessage.type === "success"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {alertMessage.type === "success" ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                        <span className="font-medium text-sm">{alertMessage.text}</span>
                    </div>
                    <button
                        onClick={() => setAlertMessage(null)}
                        className="text-sm font-semibold opacity-70 hover:opacity-100"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Load Pooling Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-5 shadow-lg border border-blue-800">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 uppercase tracking-wide">
                                🚀 New Feature
                            </span>
                            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-amber-300" />
                                Small Farmers Collective Selling (Load Pooling)
                            </h3>
                        </div>
                        <p className="text-sm text-blue-100/90 max-w-2xl">
                            Have 10–30 quintals? Combine your produce with neighboring farmers into a full truckload (100+ quintals) to secure direct mill bulk prices and reduce transport expenses by up to 40%!
                        </p>
                    </div>
                    <Link href="/dashboard/farmer/mills/load-pools">
                        <Button className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold shadow-md whitespace-nowrap">
                            <Users className="w-4 h-4 mr-1.5" />
                            Explore & Join Pools
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Nav Tabs */}
            <div className="flex items-center gap-2 border-b overflow-x-auto scrollbar-none pb-0.5">
                <button
                    onClick={() => setActiveTab("marketplace")}
                    className={`pb-3 px-4 font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 border-b-2 ${
                        activeTab === "marketplace"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <Factory className="w-4 h-4" />
                    Verified Mills Directory
                    <Badge variant="secondary" className="ml-1 text-xs">
                        {mills.length}
                    </Badge>
                </button>

                <button
                    onClick={() => setActiveTab("my_requests")}
                    className={`pb-3 px-4 font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 border-b-2 ${
                        activeTab === "my_requests"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <Send className="w-4 h-4" />
                    My Sent Supply Offers
                    <Badge
                        variant={myRequests.filter(r => r.status === "pending").length > 0 ? "default" : "secondary"}
                        className="ml-1 text-xs"
                    >
                        {myRequests.length}
                    </Badge>
                </button>

                <button
                    onClick={() => setActiveTab("moisture_calc")}
                    className={`pb-3 px-4 font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 border-b-2 ${
                        activeTab === "moisture_calc"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <Calculator className="w-4 h-4" />
                    Fair Moisture & Cut Calculator
                    <Badge variant="outline" className="ml-1 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                        Fair Trade
                    </Badge>
                </button>
            </div>

            {/* TAB 1: MARKETPLACE */}
            {activeTab === "marketplace" && (
                <div className="space-y-6">
                    {/* Controls: Search and Category Pills */}
                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-card p-4 rounded-2xl border shadow-sm">
                        <div className="relative flex-1 max-w-lg">
                            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by mill name, district, or crop (e.g. Paddy, Wheat, Cotton)..."
                                className="pl-10 h-10 rounded-xl bg-background"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Category filter pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                            {MILL_CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                                        selectedCategory === cat.value
                                            ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mill Cards Grid */}
                    {loadingMills ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-64 rounded-2xl bg-muted/40 animate-pulse border" />
                            ))}
                        </div>
                    ) : filteredMills.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredMills.map(mill => (
                                <Card
                                    key={mill.id}
                                    className="overflow-hidden hover:shadow-xl transition-all duration-300 border-border/80 bg-card flex flex-col justify-between group"
                                >
                                    <div>
                                        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/30 dark:from-blue-950/30 dark:to-card border-b">
                                            <div className="flex justify-between items-start gap-2">
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-md">
                                                            {mill.type}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Scale className="w-3 h-3" /> {mill.capacity}
                                                        </span>
                                                    </div>
                                                    <CardTitle className="text-lg font-bold text-foreground group-hover:text-blue-600 transition-colors leading-snug">
                                                        {mill.mill_name}
                                                    </CardTitle>
                                                </div>
                                                {mill.verified && (
                                                    <div
                                                        className="bg-emerald-100 text-emerald-700 p-1.5 rounded-full shadow-sm"
                                                        title="Verified Government Registered Mill"
                                                    >
                                                        <ShieldCheck className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </CardHeader>

                                        <CardContent className="pt-4 space-y-3">
                                            {/* Location & Distance */}
                                            <div className="flex items-start text-xs text-muted-foreground gap-2">
                                                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="text-foreground font-medium">{mill.location}</span>
                                                    <span className="ml-1 text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                                                        ~{mill.distance}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Crops Accepted */}
                                            <div className="text-xs">
                                                <span className="text-muted-foreground">Accepting Produce: </span>
                                                <span className="font-semibold text-foreground">
                                                    {mill.crops_accepted}
                                                </span>
                                            </div>

                                            {/* Price Offered Banner */}
                                            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-xl border border-blue-100 dark:border-blue-900/40">
                                                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                                                    Current Benchmark Rate Offered
                                                </p>
                                                <p className="text-base font-extrabold text-blue-950 dark:text-blue-100 mt-0.5">
                                                    {mill.price_offered}
                                                </p>
                                            </div>

                                            {/* Owner & Phone */}
                                            <div className="flex items-center justify-between text-xs pt-1 text-muted-foreground">
                                                <span>Manager: <strong className="text-foreground">{mill.owner_name}</strong></span>
                                                <button
                                                    onClick={() => {
                                                        setContactMill(mill);
                                                        setContactModalOpen(true);
                                                    }}
                                                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
                                                >
                                                    <Phone className="w-3.5 h-3.5" /> Call Mill
                                                </button>
                                            </div>
                                        </CardContent>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="p-4 pt-3 border-t bg-muted/20 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-lg border border-amber-200/60">
                                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                                                {mill.rating}
                                            </span>
                                        </div>

                                        <Button
                                            onClick={() => handleOpenOfferModal(mill)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 text-xs font-semibold px-4 h-9 rounded-xl"
                                        >
                                            Send Sell Offer <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-card border rounded-2xl space-y-3">
                            <Factory className="w-12 h-12 mx-auto text-muted-foreground/30" />
                            <h3 className="text-lg font-bold text-foreground">No processing mills found</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                No mills match &quot;{searchTerm}&quot; in the selected category. Try searching for &quot;Rice&quot;, &quot;Wheat&quot;, or select &quot;All Categories&quot;.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedCategory("all");
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: MY SENT SUPPLY OFFERS */}
            {activeTab === "my_requests" && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            Track the review and acceptance status of your harvest sell offers sent directly to mills.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadMyRequests}
                            disabled={loadingRequests}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loadingRequests ? "animate-spin" : ""}`} /> Refresh Offers
                        </Button>
                    </div>

                    {loadingRequests ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-28 rounded-2xl bg-muted/40 animate-pulse border" />
                            ))}
                        </div>
                    ) : myRequests.length > 0 ? (
                        <div className="space-y-4">
                            {myRequests.map(req => {
                                const isPending = req.status === "pending";
                                const isAccepted = req.status === "accepted";
                                const isRejected = req.status === "rejected";
                                const finalPrice = req.offered_price_per_unit || req.expected_price_per_unit;
                                const finalTotal = req.quantity * finalPrice;

                                return (
                                    <Card
                                        key={req.id}
                                        className={`overflow-hidden border transition-all ${
                                            isAccepted
                                                ? "border-emerald-200 bg-emerald-50/20"
                                                : isRejected
                                                ? "border-red-200 bg-red-50/10"
                                                : "border-blue-100 bg-card"
                                        }`}
                                    >
                                        <CardContent className="p-5">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                {/* Left details */}
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-lg font-bold text-foreground">
                                                            {req.mill_name || `Mill #${req.mill_id}`}
                                                        </h3>
                                                        {req.mill_location && (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <MapPin className="w-3 h-3 text-red-500" /> {req.mill_location}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                                                            Crop: {req.crop_name}
                                                        </span>
                                                        <span>Quantity: <strong>{req.quantity} {req.unit}s</strong></span>
                                                        <span>Grade: <strong>{req.quality_grade || "Grade A"}</strong></span>
                                                        {req.moisture_content && (
                                                            <span>Moisture: <strong>{req.moisture_content}%</strong></span>
                                                        )}
                                                        <span className="text-muted-foreground text-xs">
                                                            Offered on {new Date(req.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    {(req.delivery_slot_date || req.vehicle_number || req.token_number) && (
                                                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                                                            {req.token_number && (
                                                                <span className="font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                                                                    Pass #{req.token_number}
                                                                </span>
                                                            )}
                                                            {req.delivery_slot_date && (
                                                                <span className="flex items-center gap-1 text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                                                                    <Calendar className="w-3 h-3 text-blue-500" />
                                                                    Slot: {req.delivery_slot_date} {req.delivery_slot_time ? `(${req.delivery_slot_time})` : ""}
                                                                </span>
                                                            )}
                                                            {req.vehicle_type && (
                                                                <span className="flex items-center gap-1 text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                                                                    <Truck className="w-3 h-3 text-slate-500" />
                                                                    {req.vehicle_type} {req.vehicle_number ? `(${req.vehicle_number})` : ""}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {req.notes && (
                                                        <p className="text-xs text-muted-foreground italic">
                                                            &quot;{req.notes}&quot;
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Right status & financial */}
                                                <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                                                    <div className="text-right">
                                                        <div className="text-xs text-muted-foreground">
                                                            Asking Price: ₹{req.expected_price_per_unit}/{req.unit}
                                                        </div>
                                                        <div className="text-lg font-black text-foreground">
                                                            ₹{finalTotal.toLocaleString("en-IN")}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {isPending && (
                                                            <>
                                                                <Badge className="bg-amber-100 text-amber-800 border-amber-300 gap-1">
                                                                    <Clock className="w-3 h-3 animate-spin" /> Pending Mill Review
                                                                </Badge>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleCancelRequest(req.id)}
                                                                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </>
                                                        )}

                                                        {isAccepted && (
                                                            <div className="space-y-2 text-right">
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 gap-1">
                                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Deal Accepted
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleViewGatePass(req)}
                                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3 shadow-sm flex items-center gap-1.5"
                                                                    >
                                                                        <QrCode className="w-3.5 h-3.5" />
                                                                        Gate Pass & QR
                                                                    </Button>
                                                                    {req.mill_phone && (
                                                                        <a
                                                                            href={`tel:${req.mill_phone}`}
                                                                            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                                                                        >
                                                                            <Phone className="w-3 h-3" /> Call Mill
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {isRejected && (
                                                            <div className="text-right">
                                                                <Badge className="bg-red-100 text-red-800 border-red-300 gap-1">
                                                                    <XCircle className="w-3.5 h-3.5" /> Declined
                                                                </Badge>
                                                                {req.rejection_reason && (
                                                                    <p className="text-[11px] text-red-600 mt-1 max-w-xs">
                                                                        Reason: {req.rejection_reason}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-card border rounded-2xl space-y-3">
                            <Send className="w-12 h-12 mx-auto text-muted-foreground/30" />
                            <h3 className="text-lg font-bold text-foreground">No sent sell offers yet</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                You haven&apos;t submitted any supply offers to processing mills. Switch to the Verified Mills Directory tab to browse and submit your first offer!
                            </p>
                            <Button onClick={() => setActiveTab("marketplace")} className="bg-blue-600 hover:bg-blue-700 text-white">
                                Browse Verified Mills
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: FAIR MOISTURE & CUT CALCULATOR */}
            {activeTab === "moisture_calc" && (
                <div className="space-y-6">
                    {/* Header info */}
                    <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 rounded-2xl border border-emerald-800 shadow-md">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <Scale className="w-5 h-5 text-emerald-400" />
                                    <h2 className="text-xl font-extrabold text-white">
                                        Fair Moisture & Weighbridge Deduction Calculator
                                    </h2>
                                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                                        FCI Standards
                                    </Badge>
                                </div>
                                <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
                                    Milling companies legally deduct weight when grain moisture exceeds government storage standards. Use this scientific calculator to know your exact fair weight deduction and ensure you are not subjected to arbitrary cuts at the mill gate.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setCalcCrop("Paddy");
                                    setCalcWeight(100);
                                    setCalcMoisture(14.0);
                                    setCalcForeignMatter(1.0);
                                    setCalcDamaged(1.0);
                                    setCalcPrice(2300);
                                }}
                                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs whitespace-nowrap"
                            >
                                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                Reset to Base Standard
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* LEFT: Inputs (5 cols) */}
                        <div className="lg:col-span-5 bg-card p-6 rounded-2xl border shadow-sm space-y-4">
                            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-emerald-600" />
                                Produce & Moisture Parameters
                            </h3>

                            <div className="space-y-3.5">
                                {/* Crop selection */}
                                <div>
                                    <label className="block text-xs font-semibold text-foreground mb-1">
                                        Crop Type
                                    </label>
                                    <select
                                        className="w-full text-sm rounded-xl border border-input bg-background p-2.5 focus:ring-2 focus:ring-emerald-500 font-medium"
                                        value={calcCrop}
                                        onChange={(e) => {
                                            const crop = e.target.value;
                                            setCalcCrop(crop);
                                            // Auto-update price estimate and standard moisture
                                            if (crop === "Paddy") { setCalcMoisture(16.5); setCalcPrice(2300); }
                                            else if (crop === "Wheat") { setCalcMoisture(13.5); setCalcPrice(2275); }
                                            else if (crop === "Maize") { setCalcMoisture(15.5); setCalcPrice(2090); }
                                            else if (crop === "Soybean") { setCalcMoisture(13.0); setCalcPrice(4600); }
                                            else if (crop === "Mustard") { setCalcMoisture(9.0); setCalcPrice(5650); }
                                            else if (crop === "Cotton") { setCalcMoisture(9.5); setCalcPrice(7120); }
                                        }}
                                    >
                                        <option value="Paddy">Paddy / Rice (Govt Standard: 14.0%)</option>
                                        <option value="Wheat">Wheat (Govt Standard: 12.0%)</option>
                                        <option value="Maize">Maize / Corn (Govt Standard: 14.0%)</option>
                                        <option value="Soybean">Soybean (Govt Standard: 12.0%)</option>
                                        <option value="Mustard">Mustard / Rapeseed (Govt Standard: 8.0%)</option>
                                        <option value="Cotton">Cotton / Kapas (Govt Standard: 8.5%)</option>
                                        <option value="Chana">Bengal Gram / Chana (Govt Standard: 12.0%)</option>
                                        <option value="Moong">Green Gram / Moong (Govt Standard: 12.0%)</option>
                                    </select>
                                </div>

                                {/* Weight & Unit */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-semibold text-foreground mb-1">
                                            Gross Produce Weight
                                        </label>
                                        <Input
                                            type="number"
                                            min="1"
                                            step="0.5"
                                            value={calcWeight}
                                            onChange={(e) => setCalcWeight(parseFloat(e.target.value) || 0)}
                                            className="h-10 text-sm font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-foreground mb-1">
                                            Unit
                                        </label>
                                        <select
                                            className="w-full text-sm rounded-xl border border-input bg-background p-2.5 h-10 font-semibold"
                                            value={calcUnit}
                                            onChange={(e) => setCalcUnit(e.target.value)}
                                        >
                                            <option value="quintal">Quintal</option>
                                            <option value="kg">Kg</option>
                                            <option value="ton">Ton</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Moisture Input with Range Slider */}
                                <div className="space-y-1.5 p-3 bg-muted/40 rounded-xl border">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-semibold text-foreground">
                                            Weighbridge Moisture Meter Reading (%)
                                        </span>
                                        <span className="font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-sm">
                                            {calcMoisture}%
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="8"
                                        max="25"
                                        step="0.1"
                                        value={calcMoisture}
                                        onChange={(e) => setCalcMoisture(parseFloat(e.target.value))}
                                        className="w-full accent-blue-600 cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                                        <span>8% (Dry)</span>
                                        <span className="text-emerald-600 font-bold">Standard Limit: {calcResult?.standard_moisture || 14}%</span>
                                        <span className="text-red-500">25% (High Moisture)</span>
                                    </div>
                                </div>

                                {/* Agreed Price */}
                                <div>
                                    <label className="block text-xs font-semibold text-foreground mb-1">
                                        Agreed Rate (₹ per {calcUnit})
                                    </label>
                                    <Input
                                        type="number"
                                        min="100"
                                        step="10"
                                        value={calcPrice}
                                        onChange={(e) => setCalcPrice(parseFloat(e.target.value) || 0)}
                                        className="h-10 text-sm font-semibold"
                                    />
                                </div>

                                {/* Quality parameters (foreign matter & damaged) */}
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                                            Foreign Matter / Chaff %
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={calcForeignMatter}
                                            onChange={(e) => setCalcForeignMatter(parseFloat(e.target.value) || 0)}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                                            Damaged / Discolored %
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="15"
                                            step="0.1"
                                            value={calcDamaged}
                                            onChange={(e) => setCalcDamaged(parseFloat(e.target.value) || 0)}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Results & Fair Deduction Analysis (7 cols) */}
                        <div className="lg:col-span-7 space-y-4">
                            {calcResult && (
                                <>
                                    {/* Status Card */}
                                    <div
                                        className={`p-4 rounded-2xl border transition-all ${
                                            calcResult.moisture_excess <= 0
                                                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                                                : calcResult.moisture_excess <= 4
                                                ? "bg-blue-50 border-blue-200 text-blue-950"
                                                : "bg-amber-50 border-amber-200 text-amber-950"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            {calcResult.moisture_excess <= 0 ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                            )}
                                            <span className="font-bold text-sm">
                                                {calcResult.moisture_excess <= 0
                                                    ? "Zero Moisture Deduction! Within Permissible Storage Limit"
                                                    : `Permissible Scientific Deduction: -${calcResult.moisture_excess.toFixed(1)}% excess moisture`}
                                            </span>
                                        </div>
                                        <p className="text-xs opacity-80 pl-7">
                                            {calcResult.moisture_excess <= 0
                                                ? `The actual moisture reading (${calcResult.actual_moisture}%) is at or below the official standard (${calcResult.standard_moisture}%). Mill operator must pay for 100% of the weight without any moisture discount.`
                                                : `FCI guidelines permit a weight cut equal to the exact excess moisture percentage. Fair deduction is ${calcResult.weight_deduction_moisture.toFixed(2)} ${calcResult.unit}. Any deduction higher than this is unfair.`}
                                        </p>
                                    </div>

                                    {/* 4 Financial & Weight Cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="p-3.5 bg-card rounded-xl border shadow-sm">
                                            <span className="text-[11px] text-muted-foreground font-semibold block">Standard Limit</span>
                                            <span className="text-base font-extrabold text-foreground mt-0.5 block">
                                                {calcResult.standard_moisture}%
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">FCI storage norm</span>
                                        </div>

                                        <div className="p-3.5 bg-card rounded-xl border shadow-sm">
                                            <span className="text-[11px] text-muted-foreground font-semibold block">Moisture Cut</span>
                                            <span className="text-base font-extrabold text-amber-600 mt-0.5 block">
                                                -{calcResult.weight_deduction_moisture.toFixed(2)} {calcResult.unit}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {calcResult.moisture_excess > 0 ? `+${calcResult.moisture_excess.toFixed(1)}% excess` : "No deduction"}
                                            </span>
                                        </div>

                                        <div className="p-3.5 bg-card rounded-xl border shadow-sm">
                                            <span className="text-[11px] text-muted-foreground font-semibold block">Fair Net Weight</span>
                                            <span className="text-base font-extrabold text-blue-700 mt-0.5 block">
                                                {calcResult.final_net_weight.toFixed(2)} {calcResult.unit}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">Payable weight</span>
                                        </div>

                                        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/40 shadow-sm">
                                            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold block">Fair Payout</span>
                                            <span className="text-base font-black text-emerald-900 dark:text-emerald-100 mt-0.5 block">
                                                ₹{Math.round(calcResult.adjusted_value).toLocaleString("en-IN")}
                                            </span>
                                            <span className="text-[10px] text-emerald-700">Net payable</span>
                                        </div>
                                    </div>

                                    {/* Breakdown Bar & Details */}
                                    <div className="bg-card p-5 rounded-2xl border shadow-sm space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-muted-foreground">Value Realization</span>
                                            <span className="font-bold text-foreground">
                                                {(100 - calcResult.deduction_percentage).toFixed(1)}% of gross value
                                            </span>
                                        </div>
                                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
                                            <div
                                                className="bg-emerald-500 h-full transition-all duration-300"
                                                style={{ width: `${Math.max(5, 100 - calcResult.deduction_percentage)}%` }}
                                            />
                                            <div
                                                className="bg-amber-400 h-full transition-all duration-300"
                                                style={{ width: `${Math.min(95, calcResult.deduction_percentage)}%` }}
                                            />
                                        </div>

                                        <div className="flex justify-between items-center text-xs pt-1 border-t">
                                            <span className="text-muted-foreground">Gross Value (Before Deductions):</span>
                                            <span className="font-semibold text-foreground">₹{Math.round(calcResult.original_value).toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-amber-700 font-medium">Permissible Moisture Deduction Cut:</span>
                                            <span className="font-bold text-amber-700">-₹{Math.round(calcResult.total_deduction_value).toLocaleString("en-IN")} ({calcResult.deduction_percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-extrabold pt-1 border-t text-emerald-800 dark:text-emerald-200">
                                            <span>Scientific Fair Amount Due:</span>
                                            <span className="text-lg">₹{Math.round(calcResult.adjusted_value).toLocaleString("en-IN")}</span>
                                        </div>
                                    </div>

                                    {/* Drying Opportunity Tip */}
                                    {calcResult.moisture_excess > 0 && (
                                        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3">
                                            <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <div className="space-y-0.5 text-xs text-amber-950">
                                                <span className="font-bold block">
                                                    Actionable Farmer Advisory: Save ₹{Math.round(calcResult.total_deduction_value).toLocaleString("en-IN")} by Pre-Drying
                                                </span>
                                                <p className="opacity-90 leading-relaxed">
                                                    Sun-drying this lot for {calcResult.moisture_excess > 3 ? "1 to 2 days" : "4 to 6 hours"} on a clean tarpaulin will bring moisture from {calcResult.actual_moisture}% to {calcResult.standard_moisture}%, preventing all moisture cuts and putting that ₹{Math.round(calcResult.total_deduction_value).toLocaleString("en-IN")} back in your pocket!
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Government Standards Cheat Sheet */}
                                    <div className="bg-card p-4 rounded-2xl border shadow-sm space-y-2">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                                            Government (FCI / Agmark) Standard Quality Norms
                                        </h4>
                                        <div className="overflow-x-auto text-xs">
                                            <table className="w-full text-left">
                                                <thead className="bg-muted/50 text-muted-foreground font-semibold">
                                                    <tr>
                                                        <th className="p-2">Crop</th>
                                                        <th className="p-2">Max Moisture</th>
                                                        <th className="p-2">Foreign Matter</th>
                                                        <th className="p-2">Damaged Grain</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-muted">
                                                    <tr><td className="p-2 font-medium">Paddy / Rice</td><td className="p-2 text-emerald-600 font-bold">14.0%</td><td className="p-2">1.0%</td><td className="p-2">2.0%</td></tr>
                                                    <tr><td className="p-2 font-medium">Wheat</td><td className="p-2 text-emerald-600 font-bold">12.0%</td><td className="p-2">0.75%</td><td className="p-2">2.0%</td></tr>
                                                    <tr><td className="p-2 font-medium">Maize</td><td className="p-2 text-emerald-600 font-bold">14.0%</td><td className="p-2">1.0%</td><td className="p-2">1.5%</td></tr>
                                                    <tr><td className="p-2 font-medium">Soybean</td><td className="p-2 text-emerald-600 font-bold">12.0%</td><td className="p-2">1.0%</td><td className="p-2">2.0%</td></tr>
                                                    <tr><td className="p-2 font-medium">Mustard</td><td className="p-2 text-emerald-600 font-bold">8.0%</td><td className="p-2">2.0%</td><td className="p-2">2.0%</td></tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: SEND HARVEST OFFER */}
            <Modal
                isOpen={isOfferModalOpen}
                onClose={() => setIsOfferModalOpen(false)}
                title={`Send Harvest Offer to ${selectedMill?.mill_name || "Mill"}`}
            >
                {selectedMill && (
                    <form onSubmit={handleSubmitOffer} className="space-y-4 pt-2">
                        {/* Mill Quick Summary */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-center justify-between text-xs">
                            <div>
                                <span className="text-blue-600 font-bold block">{selectedMill.type}</span>
                                <span className="text-muted-foreground">{selectedMill.location}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Rate Offered</span>
                                <span className="font-extrabold text-blue-900 dark:text-blue-100">{selectedMill.price_offered}</span>
                            </div>
                        </div>

                        {/* Existing Crop Quick Selector */}
                        {crops.length > 0 && (
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                                    Pre-fill from Your Recorded Crops (Optional)
                                </label>
                                <select
                                    className="w-full text-sm rounded-xl border border-input bg-background p-2.5 focus:ring-2 focus:ring-blue-500"
                                    value={offerForm.crop_id || ""}
                                    onChange={(e) => handleCropSelectChange(e.target.value)}
                                >
                                    <option value="">-- Choose one of your farm crops --</option>
                                    {crops.map((c: Crop) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.area} Acres, Season: {c.season || "Current"})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Crop Name */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1">
                                    Produce / Crop Name *
                                </label>
                                <Input
                                    required
                                    placeholder="e.g. Paddy (Basmati), Wheat, Maize"
                                    value={offerForm.crop_name}
                                    onChange={(e) => setOfferForm({ ...offerForm, crop_name: e.target.value })}
                                />
                            </div>

                            {/* Quality Grade */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1">
                                    Produce Quality Grade
                                </label>
                                <select
                                    className="w-full text-sm rounded-xl border border-input bg-background p-2.5"
                                    value={offerForm.quality_grade}
                                    onChange={(e) => setOfferForm({ ...offerForm, quality_grade: e.target.value })}
                                >
                                    <option value="Grade A">Grade A (Premium / Clean / Low Moisture)</option>
                                    <option value="Grade B">Grade B (Standard Market Quality)</option>
                                    <option value="Grade C">Grade C (Industrial / Feed Quality)</option>
                                    <option value="FAQ">FAQ (Fair Average Quality)</option>
                                </select>
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1">
                                    Supply Quantity (in Quintals) *
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    step="0.5"
                                    required
                                    value={offerForm.quantity}
                                    onChange={(e) => setOfferForm({ ...offerForm, quantity: parseFloat(e.target.value) || 0 })}
                                />
                                <span className="text-[11px] text-muted-foreground mt-0.5 block">1 Quintal = 100 kg</span>
                            </div>

                            {/* Asking Price */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1">
                                    Expected Price (₹ per Quintal) *
                                </label>
                                <Input
                                    type="number"
                                    min="100"
                                    step="10"
                                    required
                                    value={offerForm.expected_price_per_unit}
                                    onChange={(e) => setOfferForm({ ...offerForm, expected_price_per_unit: parseFloat(e.target.value) || 0 })}
                                />
                                <span className="text-[11px] text-muted-foreground mt-0.5 block">Negotiable with mill manager</span>
                            </div>

                            {/* Moisture Content */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1">
                                    Moisture Content % (Optional)
                                </label>
                                <Input
                                    type="number"
                                    min="5"
                                    max="30"
                                    step="0.1"
                                    placeholder="e.g. 13.5%"
                                    value={offerForm.moisture_content || ""}
                                    onChange={(e) => setOfferForm({ ...offerForm, moisture_content: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            {/* Ready / Harvest Date */}
                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1">
                                    Ready for Dispatch / Pickup
                                </label>
                                <Input
                                    type="date"
                                    value={offerForm.harvest_date}
                                    onChange={(e) => setOfferForm({ ...offerForm, harvest_date: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Delivery Slot & Vehicle Booking */}
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                <Truck className="w-4 h-4 text-blue-600" />
                                Delivery Slot & Vehicle Details (For Gate Pass Booking)
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                                        Preferred Delivery Date
                                    </label>
                                    <Input
                                        type="date"
                                        value={offerForm.delivery_slot_date}
                                        onChange={(e) => setOfferForm({ ...offerForm, delivery_slot_date: e.target.value })}
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                                        Gate Arrival Time Slot
                                    </label>
                                    <select
                                        className="w-full text-xs rounded-lg border border-input bg-background p-2 h-9"
                                        value={offerForm.delivery_slot_time}
                                        onChange={(e) => setOfferForm({ ...offerForm, delivery_slot_time: e.target.value })}
                                    >
                                        <option value="Morning (08:00 - 12:00)">Morning (08:00 - 12:00)</option>
                                        <option value="Afternoon (12:00 - 16:00)">Afternoon (12:00 - 16:00)</option>
                                        <option value="Evening (16:00 - 20:00)">Evening (16:00 - 20:00)</option>
                                        <option value="Night (20:00 - 00:00)">Night (20:00 - 00:00)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                                        Transport Vehicle Type
                                    </label>
                                    <select
                                        className="w-full text-xs rounded-lg border border-input bg-background p-2 h-9"
                                        value={offerForm.vehicle_type}
                                        onChange={(e) => setOfferForm({ ...offerForm, vehicle_type: e.target.value })}
                                    >
                                        <option value="Tractor Trolley">Tractor Trolley</option>
                                        <option value="Mini Truck / Tata Ace">Mini Truck / Tata Ace (1-2 Ton)</option>
                                        <option value="Pickup Truck">Pickup Truck (Bolero / Dost)</option>
                                        <option value="Medium Truck">Medium Truck (6-Wheeler)</option>
                                        <option value="Heavy Truck">Heavy Truck (10+ Wheeler)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                                        Vehicle Registration Number (Optional)
                                    </label>
                                    <Input
                                        placeholder="e.g. TS08AB1234"
                                        value={offerForm.vehicle_number}
                                        onChange={(e) => setOfferForm({ ...offerForm, vehicle_number: e.target.value })}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                                Notes & Logistics Preference
                            </label>
                            <Input
                                placeholder="e.g. Farm-gate tractor collection preferred, or will deliver to mill."
                                value={offerForm.notes}
                                onChange={(e) => setOfferForm({ ...offerForm, notes: e.target.value })}
                            />
                        </div>

                        {/* Deal Summary Box */}
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                            <div>
                                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold block">
                                    Estimated Deal Value
                                </span>
                                <span className="text-xs text-emerald-600">
                                    {offerForm.quantity} Quintals × ₹{offerForm.expected_price_per_unit}
                                </span>
                            </div>
                            <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200">
                                ₹{estimatedTotalRevenue.toLocaleString("en-IN")}
                            </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOfferModalOpen(false)}
                                disabled={submittingOffer}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submittingOffer}
                                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
                            >
                                {submittingOffer ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" /> Submit Sell Offer
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* MODAL: DIRECT CONTACT / CALL MILL */}
            <Modal
                isOpen={contactModalOpen}
                onClose={() => setContactModalOpen(false)}
                title="Direct Mill Contact & Weighbridge Enquiry"
            >
                {contactMill && (
                    <div className="space-y-4 pt-2">
                        <div className="p-4 bg-muted/30 rounded-xl border space-y-2">
                            <h3 className="font-bold text-foreground text-base">{contactMill.mill_name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-red-500" /> {contactMill.location}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Authorized Manager: <strong className="text-foreground">{contactMill.owner_name}</strong>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Daily Milling Capacity: <strong className="text-blue-700">{contactMill.capacity}</strong>
                            </p>
                        </div>

                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-center space-y-2">
                            <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
                                Direct Phone Hotline
                            </p>
                            <div className="text-2xl font-black text-emerald-900 dark:text-emerald-100 tracking-wider">
                                {contactMill.phone}
                            </div>
                            <div className="flex justify-center gap-2 pt-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCopyPhone(contactMill.phone)}
                                    className="border-emerald-300 text-emerald-800"
                                >
                                    {copiedPhone ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5 mr-1" /> Copy Number
                                        </>
                                    )}
                                </Button>
                                <a href={`tel:${contactMill.phone}`}>
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        <Phone className="w-3.5 h-3.5 mr-1" /> Call Now
                                    </Button>
                                </a>
                            </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground text-center">
                            Pro-tip: Quote your harvest batch quantity and moisture percentage when speaking with the mill weighbridge operator.
                        </p>
                    </div>
                )}
            </Modal>

            {/* MODAL: DIGITAL GATE PASS & QR */}
            <Modal
                isOpen={gatePassModalOpen}
                onClose={() => setGatePassModalOpen(false)}
                title="🎫 Mill Delivery Gate Pass & Entry Token"
            >
                {loadingGatePass ? (
                    <div className="p-8 text-center space-y-3">
                        <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin" />
                        <p className="text-sm text-muted-foreground">Generating verified gate pass and security QR code...</p>
                    </div>
                ) : activeGatePass ? (
                    <div className="space-y-4 pt-1">
                        {/* Status bar */}
                        <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                <div>
                                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100 block">
                                        Authorized Gate Entry Pass
                                    </span>
                                    <span className="text-[11px] text-emerald-700">Valid for mill weighbridge check-in</span>
                                </div>
                            </div>
                            <Badge className="bg-emerald-600 text-white font-mono text-xs">
                                PASS ACTIVE
                            </Badge>
                        </div>

                        {/* Token Banner & QR Code */}
                        <div className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-5 rounded-2xl border text-center space-y-3 shadow-inner">
                            <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block">
                                    GATE ENTRY TOKEN NUMBER
                                </span>
                                <div className="text-2xl font-black font-mono tracking-wider text-blue-900 dark:text-blue-100 mt-0.5">
                                    {activeGatePass.token_number}
                                </div>
                            </div>

                            {/* Centered QR */}
                            <div className="flex justify-center p-3 bg-white rounded-xl shadow-sm border w-fit mx-auto">
                                <QRCodeSVG
                                    value={activeGatePass.qr_code_data || activeGatePass.token_number}
                                    size={160}
                                    level="H"
                                    includeMargin
                                />
                            </div>

                            <p className="text-[11px] text-muted-foreground">
                                Scan at mill gate scanner or show token number to security weighbridge operator
                            </p>
                        </div>

                        {/* Logistics Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-4 rounded-xl border">
                            <div>
                                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Farmer</span>
                                <span className="font-bold text-foreground text-sm">{activeGatePass.farmer_name}</span>
                                {activeGatePass.farmer_phone && (
                                    <span className="text-muted-foreground block">{activeGatePass.farmer_phone}</span>
                                )}
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Destination Mill</span>
                                <span className="font-bold text-foreground text-sm">{activeGatePass.mill_name}</span>
                                <span className="text-muted-foreground block">{activeGatePass.mill_location}</span>
                            </div>
                            <div className="border-t pt-2">
                                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Scheduled Slot</span>
                                <span className="font-bold text-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-blue-600" />
                                    {activeGatePass.delivery_slot_date || "Anytime"}
                                </span>
                                <span className="text-muted-foreground">{activeGatePass.delivery_slot_time || "Business Hours"}</span>
                            </div>
                            <div className="border-t pt-2">
                                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Assigned Vehicle</span>
                                <span className="font-bold text-foreground flex items-center gap-1">
                                    <Truck className="w-3 h-3 text-slate-600" />
                                    {activeGatePass.vehicle_type || "Tractor"}
                                </span>
                                <span className="text-muted-foreground">{activeGatePass.vehicle_number || "Gate Verification"}</span>
                            </div>
                            <div className="border-t pt-2 col-span-2 flex justify-between items-center bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                                <div>
                                    <span className="text-blue-900 font-bold block text-sm">
                                        {activeGatePass.quantity} {activeGatePass.unit}s of {activeGatePass.crop_name}
                                    </span>
                                    <span className="text-[11px] text-blue-700">
                                        Rate: ₹{activeGatePass.agreed_price}/{activeGatePass.unit} ({activeGatePass.quality_grade || "Grade A"})
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Estimated Total</span>
                                    <span className="text-base font-black text-blue-900">
                                        ₹{activeGatePass.estimated_total.toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-between items-center pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.print()}
                                className="flex items-center gap-1.5 text-xs"
                            >
                                <Printer className="w-3.5 h-3.5" /> Print Gate Pass
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setGatePassModalOpen(false)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4"
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}

export default function MillsMarketplace() {
    return (
        <React.Suspense
            fallback={
                <div className="p-12 text-center text-muted-foreground animate-pulse">
                    <Factory className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-bounce" />
                    Loading mills marketplace and live quotes...
                </div>
            }
        >
            <MillsMarketplaceContent />
        </React.Suspense>
    );
}

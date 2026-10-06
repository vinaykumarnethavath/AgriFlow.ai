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
    Copy, Check, Scale
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    getMillsMarketplace,
    createMillProcurementRequest,
    getMyProcurementRequests,
    cancelProcurementRequest,
    getCrops,
    MillMarketplaceItem,
    MillProcurementRequest,
    Crop
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

    const [activeTab, setActiveTab] = useState<"marketplace" | "my_requests">("marketplace");
    const [mills, setMills] = useState<MillMarketplaceItem[]>([]);
    const [myRequests, setMyRequests] = useState<MillProcurementRequest[]>([]);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loadingMills, setLoadingMills] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Modal state for Submitting Offer
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
        notes: "Ready for direct farm-gate inspection or mill delivery."
    });

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

            {/* Nav Tabs */}
            <div className="flex items-center gap-3 border-b">
                <button
                    onClick={() => setActiveTab("marketplace")}
                    className={`pb-3 px-4 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${
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
                    className={`pb-3 px-4 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${
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
                                                            <div className="space-y-1 text-right">
                                                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 gap-1">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Deal Accepted
                                                                </Badge>
                                                                {req.mill_phone && (
                                                                    <div>
                                                                        <a
                                                                            href={`tel:${req.mill_phone}`}
                                                                            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 justify-end"
                                                                        >
                                                                            <Phone className="w-3 h-3" /> Call: {req.mill_phone}
                                                                        </a>
                                                                    </div>
                                                                )}
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

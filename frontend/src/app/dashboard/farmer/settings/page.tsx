"use client";

import React, { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { 
    User, 
    Sprout, 
    MapPin, 
    CreditCard, 
    Bell, 
    Lock, 
    Save, 
    CheckCircle2, 
    AlertCircle, 
    ImagePlus, 
    Trash2, 
    Plus, 
    Compass, 
    PhoneCall, 
    ShieldCheck, 
    Building2, 
    Droplets, 
    Layers, 
    Sparkles,
    Eye,
    EyeOff,
    Check,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";

interface LandRecordItem {
    serial_number: string;
    area: number;
    soil_type?: string;
    irrigation_source?: string;
}

interface FarmerProfileData {
    id?: number;
    user_id?: number;
    full_name?: string;
    farmer_id: string;
    father_husband_name: string;
    phone_number?: string;
    secondary_phone?: string;
    gender?: string;
    relation_type?: string;
    profile_picture_url?: string;
    // Address
    house_no?: string;
    street?: string;
    village?: string;
    mandal?: string;
    district?: string;
    state?: string;
    country?: string;
    pincode?: string;
    // Farm
    total_area: number;
    primary_crop?: string;
    irrigation_type?: string;
    land_records?: LandRecordItem[];
    // Bank & DBT
    aadhaar_last_4: string;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    upi_id?: string;
    // Preferences
    preferred_language?: string;
    notification_preferences?: string;
}

const INDIAN_STATES = [
    "Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra", 
    "Punjab", "Haryana", "Uttar Pradesh", "Madhya Pradesh", "Gujarat", 
    "Rajasthan", "Bihar", "West Bengal", "Odisha", "Kerala", "Assam"
];

const COMMON_CROPS = [
    "Paddy (Rice)", "Wheat", "Cotton", "Chili", "Maize (Corn)", 
    "Groundnut", "Sugarcane", "Soybean", "Pulses (Red Gram / Bengal Gram)", 
    "Turmeric", "Tomato", "Onion", "Potato", "Banana", "Mango", "Millets"
];

const IRRIGATION_TYPES = [
    "Borewell", "Canal Water", "Drip Irrigation", "Sprinkler System", 
    "Rainfed / Monsoon", "River / Stream Lift", "Farm Pond"
];

const SOIL_TYPES = [
    "Black Cotton Soil", "Red Sandy Loam", "Alluvial Soil", 
    "Clay Loam", "Sandy Soil", "Laterite Soil"
];

const TABS = [
    { id: "personal", label: "Personal Details", icon: User },
    { id: "land", label: "Farm & Land Records", icon: Sprout },
    { id: "location", label: "Farm Location", icon: MapPin },
    { id: "banking", label: "Bank & Subsidies", icon: CreditCard },
    { id: "preferences", label: "Preferences & Alerts", icon: Bell },
    { id: "security", label: "Account Security", icon: Lock },
] as const;

type TabId = typeof TABS[number]["id"];

export default function FarmerSettingsPage() {
    const { user, logout } = useAuth();
    const { locale, setLocale, t } = useLanguage();
    
    const [activeTab, setActiveTab] = useState<TabId>("personal");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [detectingGps, setDetectingGps] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Profile form state
    const [form, setForm] = useState<FarmerProfileData>({
        farmer_id: "",
        full_name: "",
        father_husband_name: "",
        phone_number: "",
        secondary_phone: "",
        gender: "male",
        relation_type: "son_of",
        profile_picture_url: "",
        house_no: "",
        street: "",
        village: "",
        mandal: "",
        district: "",
        state: "Telangana",
        country: "India",
        pincode: "",
        total_area: 0,
        primary_crop: "Paddy (Rice)",
        irrigation_type: "Borewell",
        land_records: [{ serial_number: "", area: 0, soil_type: "Black Cotton Soil" }],
        aadhaar_last_4: "",
        bank_name: "",
        account_number: "",
        ifsc_code: "",
        upi_id: "",
        preferred_language: "en",
        notification_preferences: JSON.stringify({
            weather_alerts: true,
            market_prices: true,
            pest_warnings: true,
            scheme_updates: true,
            sms_notifications: true
        })
    });

    const [confirmAccountNo, setConfirmAccountNo] = useState("");
    const [parsedNotifications, setParsedNotifications] = useState({
        weather_alerts: true,
        market_prices: true,
        pest_warnings: true,
        scheme_updates: true,
        sms_notifications: true
    });
    const [measurementUnit, setMeasurementUnit] = useState("Acres");

    // Password change state
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load initial profile data
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/farmer/profile");
            if (data) {
                setForm({
                    ...data,
                    full_name: data.full_name || user?.full_name || "",
                    phone_number: data.phone_number || user?.phone_number || "",
                    land_records: data.land_records && data.land_records.length > 0 
                        ? data.land_records 
                        : [{ serial_number: "", area: 0, soil_type: "Black Cotton Soil" }]
                });
                setConfirmAccountNo(data.account_number || "");
                if (data.notification_preferences) {
                    try {
                        setParsedNotifications(JSON.parse(data.notification_preferences));
                    } catch (e) {
                        // ignore malformed json
                    }
                }
            }
        } catch (err: any) {
            if (err?.response?.status === 404) {
                // Pre-fill from user account if new profile
                setForm(prev => ({
                    ...prev,
                    full_name: user?.full_name || "",
                    phone_number: user?.phone_number || "",
                    farmer_id: `FARM-${Math.floor(100000 + Math.random() * 900000)}`
                }));
            } else {
                console.error("Failed to load farmer profile", err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Calculate total land area whenever land records change
    const updateLandRecords = (records: LandRecordItem[]) => {
        const total = records.reduce((sum, item) => sum + (Number(item.area) || 0), 0);
        setForm(prev => ({
            ...prev,
            land_records: records,
            total_area: Math.round(total * 100) / 100
        }));
    };

    const handleAddLandRecord = () => {
        const updated = [...(form.land_records || []), { serial_number: "", area: 0, soil_type: "Black Cotton Soil" }];
        updateLandRecords(updated);
    };

    const handleRemoveLandRecord = (index: number) => {
        const updated = (form.land_records || []).filter((_, i) => i !== index);
        updateLandRecords(updated.length > 0 ? updated : [{ serial_number: "", area: 0, soil_type: "Black Cotton Soil" }]);
    };

    const handleLandRecordFieldChange = (index: number, field: keyof LandRecordItem, value: any) => {
        const updated = [...(form.land_records || [])];
        updated[index] = {
            ...updated[index],
            [field]: field === "area" ? parseFloat(value) || 0 : value
        };
        updateLandRecords(updated);
    };

    // Profile picture upload
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setStatusMessage({ type: "error", text: "Image file size must be less than 5MB." });
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setUploadingImage(true);
        setStatusMessage(null);
        try {
            const { data } = await api.post("/upload", formData, {
                headers: { "Content-Type": undefined }
            });
            setForm(prev => ({ ...prev, profile_picture_url: data.url }));
            setStatusMessage({ type: "success", text: "Profile picture uploaded successfully! Remember to save settings." });
        } catch (err: any) {
            setStatusMessage({ type: "error", text: "Failed to upload picture. Please try again." });
        } finally {
            setUploadingImage(false);
        }
    };

    // GPS location detection
    const handleDetectGps = () => {
        if (!navigator.geolocation) {
            setStatusMessage({ type: "error", text: "Geolocation is not supported by your browser." });
            return;
        }

        setDetectingGps(true);
        setStatusMessage(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Try reverse geocoding via OpenStreetMap Nominatim
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`);
                    const data = await res.json();
                    if (data?.address) {
                        const addr = data.address;
                        setForm(prev => ({
                            ...prev,
                            village: addr.village || addr.suburb || addr.town || prev.village || "",
                            mandal: addr.county || addr.subdistrict || prev.mandal || "",
                            district: addr.state_district || addr.district || prev.district || "",
                            state: addr.state || prev.state || "Telangana",
                            pincode: addr.postcode || prev.pincode || ""
                        }));
                        setStatusMessage({ type: "success", text: `GPS Location detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}. Address fields updated!` });
                    } else {
                        setStatusMessage({ type: "success", text: `Coordinates acquired (${latitude.toFixed(4)}, ${longitude.toFixed(4)}).` });
                    }
                } catch (e) {
                    setStatusMessage({ type: "success", text: `Coordinates acquired (${latitude.toFixed(4)}, ${longitude.toFixed(4)}).` });
                } finally {
                    setDetectingGps(false);
                }
            },
            (error) => {
                setDetectingGps(false);
                setStatusMessage({ type: "error", text: `GPS Error: ${error.message || "Could not retrieve location. Please allow location permissions."}` });
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    };

    // Toggle notification preferences
    const handleNotificationToggle = (key: keyof typeof parsedNotifications) => {
        const updated = { ...parsedNotifications, [key]: !parsedNotifications[key] };
        setParsedNotifications(updated);
        setForm(prev => ({ ...prev, notification_preferences: JSON.stringify(updated) }));
    };

    // Submit main profile settings
    const handleSaveProfile = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        // Basic validations
        if (!form.farmer_id?.trim()) {
            setStatusMessage({ type: "error", text: "Farmer ID is required." });
            setActiveTab("personal");
            return;
        }
        if (!form.father_husband_name?.trim()) {
            setStatusMessage({ type: "error", text: "Father / Husband Name is required." });
            setActiveTab("personal");
            return;
        }
        if (form.account_number && confirmAccountNo && form.account_number !== confirmAccountNo) {
            setStatusMessage({ type: "error", text: "Bank Account Number and Confirmation do not match." });
            setActiveTab("banking");
            return;
        }

        setSaving(true);
        setStatusMessage(null);

        try {
            // Filter valid land records
            const validRecords = (form.land_records || []).filter(r => r.serial_number && r.area > 0);

            const payload = {
                ...form,
                total_area: validRecords.length > 0 
                    ? validRecords.reduce((sum, item) => sum + (Number(item.area) || 0), 0)
                    : (Number(form.total_area) || 0),
                land_records: validRecords,
                notification_preferences: JSON.stringify(parsedNotifications)
            };

            const { data } = await api.post("/farmer/profile", payload);
            setForm(prev => ({ ...prev, ...data }));
            setStatusMessage({ type: "success", text: "Farmer settings & details saved successfully!" });
            
            // Auto sync language if changed
            if (form.preferred_language && form.preferred_language !== locale) {
                setLocale(form.preferred_language as any);
            }
        } catch (err: any) {
            console.error("Save profile error", err);
            const msg = err?.response?.data?.detail || "Failed to save profile. Please check all fields.";
            setStatusMessage({ type: "error", text: typeof msg === "string" ? msg : JSON.stringify(msg) });
        } finally {
            setSaving(false);
        }
    };

    // Password change submit
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwordData.current_password) {
            setPasswordStatus({ type: "error", text: "Please enter your current password." });
            return;
        }
        if (passwordData.new_password.length < 6) {
            setPasswordStatus({ type: "error", text: "New password must be at least 6 characters long." });
            return;
        }
        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordStatus({ type: "error", text: "New passwords do not match." });
            return;
        }

        setPasswordSaving(true);
        setPasswordStatus(null);
        try {
            await api.post("/auth/change-password", {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            setPasswordStatus({ type: "success", text: "Password changed successfully!" });
            setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
        } catch (err: any) {
            setPasswordStatus({ 
                type: "error", 
                text: err?.response?.data?.detail || "Failed to change password. Make sure current password is correct." 
            });
        } finally {
            setPasswordSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                <p className="text-muted-foreground font-medium animate-pulse">{t("common.loading", "Loading farmer settings...")}</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-green-700 to-teal-800 text-white p-6 sm:p-8 shadow-xl">
                <div className="absolute right-0 top-0 -mt-10 -mr-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute left-1/3 bottom-0 -mb-8 w-40 h-40 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/40 shadow-inner flex items-center justify-center">
                                {form.profile_picture_url ? (
                                    <img 
                                        src={form.profile_picture_url} 
                                        alt={form.full_name || "Farmer"} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-white/80" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="absolute -bottom-2 -right-2 bg-white text-emerald-800 p-2 rounded-xl shadow-md hover:bg-emerald-50 active:scale-95 transition-all"
                                title="Upload Photo"
                            >
                                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                            </button>
                            <input 
                                ref={fileInputRef} 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleAvatarUpload} 
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                    {form.full_name || user?.full_name || "Farmer Profile"}
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 border border-emerald-300/40 text-emerald-100">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Farmer
                                </span>
                            </div>
                            <p className="text-emerald-100/90 text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
                                <span>ID: <strong className="font-mono text-white">{form.farmer_id || "Unassigned"}</strong></span>
                                <span>Total Area: <strong className="text-white">{form.total_area || 0} Acres</strong></span>
                                <span>Village: <strong className="text-white">{form.village || form.district || "Not set"}</strong></span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                        <Button
                            onClick={() => handleSaveProfile()}
                            disabled={saving}
                            className="bg-white hover:bg-emerald-50 text-emerald-900 font-semibold shadow-md px-5 py-2.5 h-auto transition-all duration-200"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-emerald-700" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2 text-emerald-700" />
                                    Save All Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Status Alert Banner */}
            {statusMessage && (
                <div className={`p-4 rounded-xl flex items-start gap-3 transition-all animate-in fade-in-50 duration-200 border ${
                    statusMessage.type === "success" 
                        ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800" 
                        : "bg-red-50 text-red-900 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800"
                }`}>
                    {statusMessage.type === "success" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 text-sm font-medium">{statusMessage.text}</div>
                    <button 
                        onClick={() => setStatusMessage(null)}
                        className="text-xs font-semibold opacity-70 hover:opacity-100"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-muted/60 dark:bg-muted/30 rounded-2xl border">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                                setActiveTab(tab.id);
                                setStatusMessage(null);
                            }}
                            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                                isActive
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/70"
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab 1: Personal Details */}
            {activeTab === "personal" && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <User className="w-5 h-5 text-emerald-600" />
                                Personal & Identity Information
                            </CardTitle>
                            <CardDescription>
                                These details identify you across PM-KISAN, Rythu Bharosa, Mandi procurement, and farm subsidy schemes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={form.full_name || ""}
                                    onChange={handleFieldChange}
                                    placeholder="e.g. Ramesh Kumar"
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Government Farmer ID / Rythu ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="farmer_id"
                                    value={form.farmer_id || ""}
                                    onChange={handleFieldChange}
                                    placeholder="e.g. PMK-829104 or TS-98214"
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Relationship
                                </label>
                                <select
                                    name="relation_type"
                                    value={form.relation_type || "son_of"}
                                    onChange={handleFieldChange}
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                >
                                    <option value="son_of">Son of (S/O)</option>
                                    <option value="daughter_of">Daughter of (D/O)</option>
                                    <option value="wife_of">Wife of (W/O)</option>
                                    <option value="care_of">Care of (C/O)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Father / Husband / Guardian Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="father_husband_name"
                                    value={form.father_husband_name || ""}
                                    onChange={handleFieldChange}
                                    placeholder="e.g. Satyanarayana"
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Primary Mobile Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={form.phone_number || ""}
                                    onChange={handleFieldChange}
                                    placeholder="e.g. 9876543210"
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Alternative / Family Phone
                                </label>
                                <input
                                    type="tel"
                                    name="secondary_phone"
                                    value={form.secondary_phone || ""}
                                    onChange={handleFieldChange}
                                    placeholder="e.g. 9123456780"
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={form.gender || "male"}
                                    onChange={handleFieldChange}
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Aadhaar Card (Last 4 Digits)
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        maxLength={4}
                                        name="aadhaar_last_4"
                                        value={form.aadhaar_last_4 || ""}
                                        onChange={handleFieldChange}
                                        placeholder="XXXX"
                                        className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono tracking-widest bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                    />
                                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Masked & Protected
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button 
                            onClick={() => handleSaveProfile()} 
                            disabled={saving} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Save className="w-4 h-4 mr-2" /> Save Personal Details
                        </Button>
                    </div>
                </div>
            )}

            {/* Tab 2: Farm & Land Records */}
            {activeTab === "land" && (
                <div className="space-y-6">
                    {/* Land Summary Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-card border rounded-2xl p-4 shadow-sm">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Cultivated Area</span>
                            <div className="text-2xl font-bold text-emerald-600 mt-1">
                                {form.total_area || 0} <span className="text-xs font-normal text-muted-foreground">{measurementUnit}</span>
                            </div>
                        </div>
                        <div className="bg-card border rounded-2xl p-4 shadow-sm">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">Registered Plots</span>
                            <div className="text-2xl font-bold text-foreground mt-1">
                                {(form.land_records || []).filter(r => r.serial_number).length}
                            </div>
                        </div>
                        <div className="bg-card border rounded-2xl p-4 shadow-sm">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">Primary Crop</span>
                            <div className="text-lg font-bold text-foreground mt-1 truncate">
                                {form.primary_crop || "Not selected"}
                            </div>
                        </div>
                        <div className="bg-card border rounded-2xl p-4 shadow-sm">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">Irrigation Source</span>
                            <div className="text-lg font-bold text-foreground mt-1 truncate">
                                {form.irrigation_type || "Borewell"}
                            </div>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Sprout className="w-5 h-5 text-emerald-600" />
                                Farming & Cultivation Overview
                            </CardTitle>
                            <CardDescription>
                                Set your primary crops, water irrigation sources, and overall farm profile.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Primary Crop
                                </label>
                                <select
                                    name="primary_crop"
                                    value={form.primary_crop || "Paddy (Rice)"}
                                    onChange={handleFieldChange}
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                >
                                    {COMMON_CROPS.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Primary Water / Irrigation Source
                                </label>
                                <select
                                    name="irrigation_type"
                                    value={form.irrigation_type || "Borewell"}
                                    onChange={handleFieldChange}
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                >
                                    {IRRIGATION_TYPES.map(i => (
                                        <option key={i} value={i}>{i}</option>
                                    ))}
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Survey Numbers & Land Plots Manager */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-emerald-600" />
                                    Survey Numbers & Land Plots
                                </CardTitle>
                                <CardDescription>
                                    Add each survey / passbook khatoni number with its corresponding area. Total area updates automatically.
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddLandRecord}
                                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                            >
                                <Plus className="w-4 h-4 mr-1.5" /> Add Survey Plot
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {(form.land_records || []).map((record, index) => (
                                <div 
                                    key={index}
                                    className="p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col md:flex-row items-center gap-4"
                                >
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                                            #{index + 1}
                                        </span>
                                        <div className="flex-1 md:w-48 space-y-1">
                                            <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                                                Survey / Khatoni No.
                                            </label>
                                            <input
                                                type="text"
                                                value={record.serial_number}
                                                onChange={(e) => handleLandRecordFieldChange(index, "serial_number", e.target.value)}
                                                placeholder="e.g. 104/A or 42/B"
                                                className="w-full px-3 py-1.5 border rounded-lg text-sm bg-background font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="w-full md:w-36 space-y-1">
                                        <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                                            Area ({measurementUnit})
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={record.area || ""}
                                            onChange={(e) => handleLandRecordFieldChange(index, "area", e.target.value)}
                                            placeholder="0.00"
                                            className="w-full px-3 py-1.5 border rounded-lg text-sm bg-background font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="w-full md:flex-1 space-y-1">
                                        <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                                            Soil Type
                                        </label>
                                        <select
                                            value={record.soil_type || "Black Cotton Soil"}
                                            onChange={(e) => handleLandRecordFieldChange(index, "soil_type", e.target.value)}
                                            className="w-full px-3 py-1.5 border rounded-lg text-sm bg-background focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        >
                                            {SOIL_TYPES.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveLandRecord(index)}
                                        className="p-2 text-muted-foreground hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors self-end md:self-center"
                                        title="Delete plot"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                                <span className="font-semibold text-emerald-900 dark:text-emerald-200 text-sm">
                                    Calculated Total Farm Area:
                                </span>
                                <span className="font-extrabold text-emerald-800 dark:text-emerald-300 text-lg">
                                    {form.total_area || 0} {measurementUnit}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button 
                            onClick={() => handleSaveProfile()} 
                            disabled={saving} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Save className="w-4 h-4 mr-2" /> Save Farm & Land Records
                        </Button>
                    </div>
                </div>
            )}

            {/* Tab 3: Location & Farm Address */}
            {activeTab === "location" && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-emerald-600" />
                                    Farm Location & Address Details
                                </CardTitle>
                                <CardDescription>
                                    Precise location is utilized for hyper-local weather warnings, pest advisories, and nearby mandi prices.
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleDetectGps}
                                disabled={detectingGps}
                                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 shrink-0"
                            >
                                {detectingGps ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin text-emerald-600" />
                                        Detecting GPS...
                                    </>
                                ) : (
                                    <>
                                        <Compass className="w-4 h-4 mr-2 text-emerald-600" />
                                        Detect GPS Coordinates
                                    </>
                                )}
                            </Button>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    House / Door / Farm Plot No.
                                </label>
                                <input
                                    type="text"
                                    name="house_no"
                                    value={form.house_no || ""}
                                    onChange={handleFieldChange}
                                    placeholder="e.g. 4-12/A or Farm House #2"
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Street / Landmark
                                </label>
                                <input
                                    type="text"
                                    name="street"
                                    value={form.street || ""}
                                    onChange={handleFieldChange}
                                    placeholder="e.g. Near Water Tank, Main Road"
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Village / Gram Panchayat <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="village"
                                    value={form.village || ""}
                                    onChange={handleFieldChange}
                                    placeholder="e.g. Ibrahimpatnam"
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Mandal / Tehsil / Block <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="mandal"
                                    value={form.mandal || ""}
                                    onChange={handleFieldChange}
                                    placeholder="e.g. Medchal"
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    District <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="district"
                                    value={form.district || ""}
                                    onChange={handleFieldChange}
                                    placeholder="e.g. Rangareddy"
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="state"
                                    value={form.state || "Telangana"}
                                    onChange={handleFieldChange}
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                >
                                    {INDIAN_STATES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    PIN Code
                                </label>
                                <input
                                    type="text"
                                    name="pincode"
                                    maxLength={6}
                                    value={form.pincode || ""}
                                    onChange={handleFieldChange}
                                    placeholder="e.g. 501506"
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    name="country"
                                    value={form.country || "India"}
                                    readOnly
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-muted text-muted-foreground cursor-not-allowed"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button 
                            onClick={() => handleSaveProfile()} 
                            disabled={saving} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Save className="w-4 h-4 mr-2" /> Save Location Details
                        </Button>
                    </div>
                </div>
            )}

            {/* Tab 4: Banking & Subsidies */}
            {activeTab === "banking" && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-emerald-600" />
                                Bank Account & DBT Subsidy Configuration
                            </CardTitle>
                            <CardDescription>
                                These bank details are strictly used for Direct Benefit Transfer (DBT), MSP procurement payments from mills, and crop sales.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Bank Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="bank_name"
                                    value={form.bank_name || ""}
                                    onChange={handleFieldChange}
                                    placeholder="e.g. State Bank of India"
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    IFSC Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="ifsc_code"
                                    value={form.ifsc_code || ""}
                                    onChange={(e) => setForm(prev => ({ ...prev, ifsc_code: e.target.value.toUpperCase() }))}
                                    placeholder="e.g. SBIN0020194"
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono uppercase bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Account Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="account_number"
                                    value={form.account_number || ""}
                                    onChange={handleFieldChange}
                                    placeholder="e.g. 38291048201"
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center justify-between">
                                    <span>Confirm Account Number <span className="text-red-500">*</span></span>
                                    {confirmAccountNo && form.account_number === confirmAccountNo && (
                                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                            <Check className="w-3.5 h-3.5" /> Matched
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="text"
                                    value={confirmAccountNo}
                                    onChange={(e) => setConfirmAccountNo(e.target.value)}
                                    placeholder="Re-enter bank account number"
                                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono bg-background text-foreground focus:outline-none transition ${
                                        confirmAccountNo && form.account_number !== confirmAccountNo 
                                            ? "border-red-400 focus:ring-2 focus:ring-red-400" 
                                            : "focus:ring-2 focus:ring-emerald-500"
                                    }`}
                                />
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    UPI ID / VPA (Optional - For Instant Mandi Payments)
                                </label>
                                <input
                                    type="text"
                                    name="upi_id"
                                    value={form.upi_id || ""}
                                    onChange={handleFieldChange}
                                    placeholder="e.g. 9876543210@upi or farmer@okhdfcbank"
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                            Bank details are stored with bank-grade encryption. They are verified with PFMS/NPCI for direct subsidy payments and cannot be modified by unauthorized third parties.
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button 
                            onClick={() => handleSaveProfile()} 
                            disabled={saving} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Save className="w-4 h-4 mr-2" /> Save Banking Details
                        </Button>
                    </div>
                </div>
            )}

            {/* Tab 5: Preferences & Alerts */}
            {activeTab === "preferences" && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Bell className="w-5 h-5 text-emerald-600" />
                                Alerts & Notification Preferences
                            </CardTitle>
                            <CardDescription>
                                Customize how and when AgriFlow alerts you about critical farm events.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                                <div>
                                    <h4 className="font-semibold text-sm text-foreground">Extreme Weather Warnings</h4>
                                    <p className="text-xs text-muted-foreground">Receive real-time alerts for impending rainstorms, hail, heatwaves, or unseasonal frost.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleNotificationToggle("weather_alerts")}
                                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                                        parsedNotifications.weather_alerts ? "bg-emerald-600" : "bg-muted-foreground/30"
                                    }`}
                                >
                                    <span className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                                        parsedNotifications.weather_alerts ? "translate-x-6" : "translate-x-1"
                                    }`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                                <div>
                                    <h4 className="font-semibold text-sm text-foreground">Daily Mandi & Market Prices</h4>
                                    <p className="text-xs text-muted-foreground">Daily morning updates on prices for your primary crops in nearby APMC mandis.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleNotificationToggle("market_prices")}
                                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                                        parsedNotifications.market_prices ? "bg-emerald-600" : "bg-muted-foreground/30"
                                    }`}
                                >
                                    <span className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                                        parsedNotifications.market_prices ? "translate-x-6" : "translate-x-1"
                                    }`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                                <div>
                                    <h4 className="font-semibold text-sm text-foreground">Pest & Disease Outbreak Warnings</h4>
                                    <p className="text-xs text-muted-foreground">AI surveillance warnings when pests or fungal blights are reported within a 15km radius.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleNotificationToggle("pest_warnings")}
                                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                                        parsedNotifications.pest_warnings ? "bg-emerald-600" : "bg-muted-foreground/30"
                                    }`}
                                >
                                    <span className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                                        parsedNotifications.pest_warnings ? "translate-x-6" : "translate-x-1"
                                    }`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                                <div>
                                    <h4 className="font-semibold text-sm text-foreground">Government Schemes & Subsidies</h4>
                                    <p className="text-xs text-muted-foreground">Notifications about PM-KISAN disbursals, fertilizer subsidy allocations, and credit facilities.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleNotificationToggle("scheme_updates")}
                                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                                        parsedNotifications.scheme_updates ? "bg-emerald-600" : "bg-muted-foreground/30"
                                    }`}
                                >
                                    <span className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                                        parsedNotifications.scheme_updates ? "translate-x-6" : "translate-x-1"
                                    }`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                                <div>
                                    <h4 className="font-semibold text-sm text-foreground">SMS Alerts via Fast2SMS</h4>
                                    <p className="text-xs text-muted-foreground">Receive critical alerts via SMS when offline or without internet connectivity.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleNotificationToggle("sms_notifications")}
                                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                                        parsedNotifications.sms_notifications ? "bg-emerald-600" : "bg-muted-foreground/30"
                                    }`}
                                >
                                    <span className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                                        parsedNotifications.sms_notifications ? "translate-x-6" : "translate-x-1"
                                    }`} />
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-emerald-600" />
                                Language & Units
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Display Language
                                </label>
                                <select
                                    value={form.preferred_language || locale}
                                    onChange={(e) => {
                                        const lang = e.target.value;
                                        setForm(prev => ({ ...prev, preferred_language: lang }));
                                        setLocale(lang as any);
                                    }}
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                >
                                    <option value="en">English</option>
                                    <option value="te">తెలుగు (Telugu)</option>
                                    <option value="hi">हिन्दी (Hindi)</option>
                                    <option value="ta">தமிழ் (Tamil)</option>
                                    <option value="kn">ಕನ್ನಡ (Kannada)</option>
                                    <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                                    <option value="mr">मराठी (Marathi)</option>
                                    <option value="bn">বাংলা (Bengali)</option>
                                    <option value="gu">ગુજરાતી (Gujarati)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Land Measurement Unit
                                </label>
                                <select
                                    value={measurementUnit}
                                    onChange={(e) => setMeasurementUnit(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-background text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                                >
                                    <option value="Acres">Acres (Standard)</option>
                                    <option value="Hectares">Hectares (1 Ha = 2.47 Acres)</option>
                                    <option value="Cents">Cents (100 Cents = 1 Acre)</option>
                                    <option value="Guntas">Guntas (40 Guntas = 1 Acre)</option>
                                    <option value="Bigha">Bigha</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button 
                            onClick={() => handleSaveProfile()} 
                            disabled={saving} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Save className="w-4 h-4 mr-2" /> Save Preferences
                        </Button>
                    </div>
                </div>
            )}

            {/* Tab 6: Account Security & Password */}
            {activeTab === "security" && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Lock className="w-5 h-5 text-emerald-600" />
                                Change Account Password
                            </CardTitle>
                            <CardDescription>
                                Ensure your password is at least 6 characters long and kept confidential.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                                {passwordStatus && (
                                    <div className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
                                        passwordStatus.type === "success" 
                                            ? "bg-emerald-50 text-emerald-900 border border-emerald-200" 
                                            : "bg-red-50 text-red-900 border border-red-200"
                                    }`}>
                                        {passwordStatus.type === "success" ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-red-600" />
                                        )}
                                        {passwordStatus.text}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Current Password
                                    </label>
                                    <PasswordInput
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        New Password
                                    </label>
                                    <PasswordInput
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                                        placeholder="At least 6 characters"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Confirm New Password
                                    </label>
                                    <PasswordInput
                                        value={passwordData.confirm_password}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                                        placeholder="Re-enter new password"
                                        required
                                    />
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={passwordSaving} 
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white mt-2"
                                >
                                    {passwordSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Updating Password...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4 mr-2" />
                                            Update Password
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                Active Account Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="p-3 rounded-xl border bg-muted/20">
                                    <span className="text-xs text-muted-foreground block">Linked Phone / Login</span>
                                    <span className="font-mono font-medium text-foreground">{user?.phone_number || "Not provided"}</span>
                                </div>
                                <div className="p-3 rounded-xl border bg-muted/20">
                                    <span className="text-xs text-muted-foreground block">Registered Email</span>
                                    <span className="font-mono font-medium text-foreground">{user?.email || "No email linked (Phone account)"}</span>
                                </div>
                                <div className="p-3 rounded-xl border bg-muted/20">
                                    <span className="text-xs text-muted-foreground block">Role</span>
                                    <span className="capitalize font-medium text-emerald-700 dark:text-emerald-300">Farmer</span>
                                </div>
                                <div className="p-3 rounded-xl border bg-muted/20">
                                    <span className="text-xs text-muted-foreground block">System User ID</span>
                                    <span className="font-mono font-medium text-foreground">{user?.id}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.href = "/dashboard/farmer/emergency"}
                                    className="text-amber-700 border-amber-300 hover:bg-amber-50"
                                >
                                    <PhoneCall className="w-4 h-4 mr-2" /> Emergency SOS Contacts
                                </Button>

                                <Button
                                    variant="destructive"
                                    onClick={logout}
                                >
                                    Sign Out of All Sessions
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

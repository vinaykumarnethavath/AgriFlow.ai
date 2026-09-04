"use client";

import React, { useRef, useState } from "react";
import { User, Upload, Building2, Store, CreditCard, MapPin, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface ProfileFormProps {
    role: "mill" | "shop" | "customer" | "farmer";
    initialData?: any;
    onSaveSuccess?: () => void;
}

export const ProfileForm = ({ role, initialData, onSaveSuccess }: ProfileFormProps) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState(initialData?.profile_picture_url || "");
    const [isHideMode, setIsHideMode] = useState(true);
    const [relationType, setRelationType] = useState(initialData?.relation_type || "S/O");

    // Form refs
    const nameRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);
    const fatherRef = useRef<HTMLInputElement>(null);
    const licenseRef = useRef<HTMLInputElement>(null);
    const idRef = useRef<HTMLInputElement>(null);
    const houseRef = useRef<HTMLInputElement>(null);
    const streetRef = useRef<HTMLInputElement>(null);
    const villageRef = useRef<HTMLInputElement>(null);
    const mandalRef = useRef<HTMLInputElement>(null);
    const districtRef = useRef<HTMLInputElement>(null);
    const stateRef = useRef<HTMLInputElement>(null);
    const pinRef = useRef<HTMLInputElement>(null);
    const bankRef = useRef<HTMLInputElement>(null);
    const accRef = useRef<HTMLInputElement>(null);
    const ifscRef = useRef<HTMLInputElement>(null);
    const locationRef = useRef<HTMLInputElement>(null);
    const aadhaarRef = useRef<HTMLInputElement>(null);
    const panRef = useRef<HTMLInputElement>(null);

    const permHouseRef = useRef<HTMLInputElement>(null);
    const permStreetRef = useRef<HTMLInputElement>(null);
    const permVillageRef = useRef<HTMLInputElement>(null);
    const permMandalRef = useRef<HTMLInputElement>(null);
    const permDistrictRef = useRef<HTMLInputElement>(null);
    const permStateRef = useRef<HTMLInputElement>(null);
    const permPinRef = useRef<HTMLInputElement>(null);

    const maskValue = (val: string, showLast: number = 4) => {
        if (!val) return "";
        if (!isHideMode) return val;
        if (val.length <= showLast) return val;
        return "*".repeat(val.length - showLast) + val.slice(-showLast);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        try {
            const { data } = await api.post("/upload", formData);
            setImageUrl(data.url);
        } catch (err) {
            alert(t('common.error') || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const profileData: any = {
            profile_picture_url: imageUrl,
            relation_type: relationType,
            father_name: fatherRef.current?.value,
            phone_number: phoneRef.current?.value || "",
            contact_number: phoneRef.current?.value || "",
            house_no: houseRef.current?.value,
            street: streetRef.current?.value,
            village: villageRef.current?.value,
            mandal: mandalRef.current?.value,
            district: districtRef.current?.value,
            state: stateRef.current?.value,
            pincode: pinRef.current?.value,
            bank_name: bankRef.current?.value,
            account_number: accRef.current?.value,
            ifsc_code: ifscRef.current?.value,
        };

        if (role === 'mill') {
            profileData.mill_name = nameRef.current?.value;
            profileData.license_number = licenseRef.current?.value;
            profileData.mill_id = idRef.current?.value;
            profileData.aadhaar_number = aadhaarRef.current?.value;
            profileData.pan_number = panRef.current?.value;
            profileData.location_text = locationRef.current?.value;
            profileData.perm_house_no = permHouseRef.current?.value;
            profileData.perm_street = permStreetRef.current?.value;
            profileData.perm_village = permVillageRef.current?.value;
            profileData.perm_mandal = permMandalRef.current?.value;
            profileData.perm_district = permDistrictRef.current?.value;
            profileData.perm_state = permStateRef.current?.value;
            profileData.perm_pincode = permPinRef.current?.value;
        } else if (role === 'shop') {
            profileData.shop_name = nameRef.current?.value;
            profileData.license_number = licenseRef.current?.value;
            profileData.location_text = locationRef.current?.value;
        } else if (role === 'customer') {
            profileData.full_name = nameRef.current?.value;
            profileData.id_number = idRef.current?.value;
        } else if (role === 'farmer') {
            profileData.full_name = nameRef.current?.value;
            profileData.farmer_id = idRef.current?.value;
        }

        try {
            const specificEndpoint = role === 'mill' ? '/manufacturer/profile' :
                (role === 'shop' ? '/shop/profile' :
                    (role === 'customer' ? '/customer/profile' : '/farmer/profile'));
            await api.post(specificEndpoint, profileData);
            if (onSaveSuccess) onSaveSuccess();
            alert(t('profile.profileUpdated') || "Profile saved successfully!");
        } catch (err: any) {
            console.error(err);
            alert("Failed to save profile: " + (err.response?.data?.detail || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-muted-foreground/10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isHideMode ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {isHideMode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground">Hide Mode</h4>
                        <p className="text-xs text-muted-foreground">Mask sensitive ID and Bank details</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsHideMode(!isHideMode)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-background hover:bg-muted transition"
                >
                    {isHideMode ? "Disable Masking" : "Enable Masking"}
                </button>
            </div>

            {/* General Information */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-32 w-32 rounded-2xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted/10 relative group">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-12 w-12 text-muted-foreground/40" />
                                )}
                                <label className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                    <Upload className="h-6 w-6 mb-1" />
                                    <span className="text-xs font-bold">{uploading ? "Uploading..." : "Upload"}</span>
                                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                                </label>
                            </div>
                            <span className="text-xs text-muted-foreground">{t('profile.uploadPhoto')}</span>
                        </div>

                        <div className="flex-1 space-y-4 w-full">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                                {role === 'mill' ? <Building2 className="h-5 w-5" /> : (role === 'shop' ? <Store className="h-5 w-5" /> : <User className="h-5 w-5" />)}
                                {role === 'mill' ? t('manufacturer.manufacturerDashboard') : (role === 'shop' ? t('dashboard.shop') : (role === 'farmer' ? t('profile.farmerProfile') : t('profile.personalDetails')))}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-muted-foreground">
                                        {role === 'mill' ? 'Mill Name' : (role === 'shop' ? 'Shop Name' : t('profile.fullName'))}
                                    </label>
                                    <input 
                                        ref={nameRef} 
                                        defaultValue={role === 'farmer' || role === 'customer' ? (initialData?.full_name || "") : (initialData?.[`${role}_name`] || "")} 
                                        required 
                                        className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-muted-foreground">Phone Number</label>
                                    <input
                                        ref={phoneRef}
                                        type="tel"
                                        defaultValue={initialData?.phone_number || initialData?.contact_number || ""}
                                        placeholder="e.g. +91 9876543210"
                                        className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none"
                                    />
                                </div>
                                {(role === 'mill' || role === 'shop') && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-muted-foreground">License Number</label>
                                        <input
                                            ref={licenseRef}
                                            defaultValue={maskValue(initialData?.license_number)}
                                            onFocus={(e) => isHideMode && (e.target.value = initialData?.license_number || "")}
                                            required
                                            className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none"
                                        />
                                    </div>
                                )}
                                {(role === 'customer' || role === 'farmer') && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-muted-foreground">{role === 'farmer' ? 'Farmer ID' : 'ID Number (Aadhaar/PAN)'}</label>
                                        <input
                                            ref={idRef}
                                            defaultValue={maskValue(role === 'farmer' ? initialData?.farmer_id : initialData?.id_number)}
                                            onFocus={(e) => isHideMode && (e.target.value = (role === 'farmer' ? initialData?.farmer_id : initialData?.id_number) || "")}
                                            required
                                            className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none"
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-muted-foreground">Relation & Name</label>
                                    <div className="flex gap-2">
                                        <select 
                                            value={relationType} 
                                            onChange={(e) => setRelationType(e.target.value)}
                                            className="border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none text-sm w-24"
                                        >
                                            <option value="S/O">S/O</option>
                                            <option value="W/O">W/O</option>
                                            <option value="D/O">D/O</option>
                                        </select>
                                        <input 
                                            ref={fatherRef} 
                                            defaultValue={initialData?.father_name || initialData?.father_husband_name} 
                                            required 
                                            placeholder="Name of Father/Husband"
                                            className="flex-1 border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" 
                                        />
                                    </div>
                                </div>
                                {(role === 'mill' || role === 'shop') && (
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-semibold text-muted-foreground">Location / Landmark</label>
                                        <input ref={locationRef} defaultValue={initialData?.location_text} className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" placeholder="e.g. Near Market Yard, Main Road" />
                                    </div>
                                )}
                                {role === 'mill' && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-muted-foreground">Mill ID</label>
                                            <input ref={idRef} defaultValue={initialData?.mill_id} className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" placeholder="e.g. MILL-12345" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-muted-foreground">{t('profile.aadhaarNumber')}</label>
                                            <input ref={aadhaarRef} defaultValue={initialData?.aadhaar_number} className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" placeholder="1234 5678 9012" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                        <MapPin className="h-5 w-5" />
                        {t('profile.landDetails')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">House No</label>
                            <input ref={houseRef} defaultValue={initialData?.house_no} className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-muted-foreground">Street</label>
                            <input ref={streetRef} defaultValue={initialData?.street} className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">Village/City</label>
                            <input ref={villageRef} defaultValue={initialData?.village} required className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">Mandal/Block</label>
                            <input ref={mandalRef} defaultValue={initialData?.mandal} className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">District</label>
                            <input ref={districtRef} defaultValue={initialData?.district} required className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">State</label>
                            <input ref={stateRef} defaultValue={initialData?.state} required className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">Pincode</label>
                            <input ref={pinRef} defaultValue={initialData?.pincode} required className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {role === 'mill' && (
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                            <MapPin className="h-5 w-5" />
                            Permanent Address
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">House No</label>
                                <input ref={permHouseRef} defaultValue={initialData?.perm_house_no} className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-muted-foreground">Street</label>
                                <input ref={permStreetRef} defaultValue={initialData?.perm_street} className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">Village/City</label>
                                <input ref={permVillageRef} defaultValue={initialData?.perm_village} className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">Mandal/Block</label>
                                <input ref={permMandalRef} defaultValue={initialData?.perm_mandal} className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">District</label>
                                <input ref={permDistrictRef} defaultValue={initialData?.perm_district} className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">State</label>
                                <input ref={permStateRef} defaultValue={initialData?.perm_state} className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">Pincode</label>
                                <input ref={permPinRef} defaultValue={initialData?.perm_pincode} className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-6 space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                        <CreditCard className="h-5 w-5" />
                        {t('profile.bankDetails')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">Bank Name</label>
                            <input ref={bankRef} defaultValue={initialData?.bank_name} required className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">Account Number</label>
                            <input
                                ref={accRef}
                                defaultValue={maskValue(initialData?.account_number)}
                                onFocus={(e) => isHideMode && (e.target.value = initialData?.account_number || "")}
                                required
                                className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">IFSC Code</label>
                            <input ref={ifscRef} defaultValue={initialData?.ifsc_code} required className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" />
                        </div>
                        {role === 'mill' && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground">{t('profile.panNumber')}</label>
                                <input ref={panRef} defaultValue={initialData?.pan_number} className="w-full border-2 rounded-xl p-2.5 bg-background text-foreground focus:border-primary outline-none" placeholder="ABCDE1234F" />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Button type="submit" disabled={loading} className="w-full py-6 text-lg font-bold bg-green-600 hover:bg-green-700 text-white">
                {loading ? t('common.loading') : t('profile.updateProfile')}
            </Button>
        </form>
    );
};

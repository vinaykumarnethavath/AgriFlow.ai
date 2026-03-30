"use client";

import React, { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Save, CheckCircle2, ImagePlus, X, ShieldCheck, Bell, Lock, Wallet, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShopProfileData {
    shop_name?: string;
    owner_name?: string;
    license_number?: string;
    father_name?: string;
    relation_type?: string;
    contact_number?: string;
    id?: number;
    shop_id?: string;
    profile_picture_url?: string;
    // Personal ID
    aadhaar_number?: string;
    pan_number?: string;
    hide_personal_details?: boolean;
    // Detailed Address (replacing single shop_address)
    house_no?: string;
    street?: string;
    village?: string;
    mandal?: string;
    district?: string;
    state?: string;
    pincode?: string;
    country?: string;
    landmark?: string;
    // Permanent address
    permanent_address?: string;
    perm_house_no?: string;
    perm_street?: string;
    perm_village?: string;
    perm_mandal?: string;
    perm_district?: string;
    perm_state?: string;
    perm_pincode?: string;
    // Bank
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
    full_name?: string;
}

function Section({ title, children, extra }: { title: string; children: React.ReactNode; extra?: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="bg-gray-50 border-b px-6 py-3 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 text-base">{title}</h3>
                {extra}
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">{children}</div>
        </div>
    );
}

function Field({ label, name, value, onChange, placeholder, type = "text", readOnly = false, fullWidth = false, required = false }: {
    label: string; name: string; value: any; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string; type?: string; readOnly?: boolean; fullWidth?: boolean; required?: boolean;
}) {
    return (
        <div className={`space-y-1 ${fullWidth ? "md:col-span-2" : ""}`}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={value ?? ""}
                onChange={onChange}
                placeholder={placeholder}
                readOnly={readOnly}
                required={required}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition ${
                    readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white text-gray-800"
                }`}
            />
        </div>
    );
}

const TABS = [
    { id: "profile", label: "Profile", icon: Settings2 },
    { id: "password", label: "Change Password", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "payments", label: "Payment Settings", icon: Wallet },
] as const;

type TabId = typeof TABS[number]["id"];

export default function ShopProfilePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [profileExists, setProfileExists] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isShopIdEditable, setIsShopIdEditable] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>("profile");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState<ShopProfileData>({
        shop_name: "", owner_name: "", license_number: "", shop_id: "", father_name: "", relation_type: "S/O",
        contact_number: "", profile_picture_url: "",
        aadhaar_number: "", pan_number: "", hide_personal_details: false,
        house_no: "", street: "", village: "", mandal: "", district: "",
        state: "", pincode: "", country: "India", landmark: "",
        permanent_address: "",
        perm_house_no: "", perm_street: "", perm_village: "", perm_mandal: "",
        perm_district: "", perm_state: "", perm_pincode: "",
        bank_name: "", account_number: "", ifsc_code: "", full_name: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get("/shop/profile");
                setForm({
                    ...data,
                    full_name: data.full_name || user?.full_name || "",
                });
                setProfileExists(true);
            } catch (err: any) {
                if (err?.response?.status === 404) {
                    setProfileExists(false);
                    setForm(prev => ({ ...prev, full_name: user?.full_name || "" }));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setForm(prev => ({ ...prev, [e.target.name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            // Assuming we have an upload endpoint. 
            // In the inventory page it's `/upload/`
            const { data } = await api.post("/upload/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const url = data.url || data.file_url || data.filename;
            setForm(prev => ({ ...prev, profile_picture_url: url }));
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Log payload for debugging
            console.log("Submitting profile payload:", form);
            await api.post("/shop/profile", form);
            setSaved(true);
            setProfileExists(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            console.error("Failed to save profile", err);
            const errorMsg = err.response?.data?.detail 
                ? (Array.isArray(err.response.data.detail) ? err.response.data.detail[0].msg : err.response.data.detail)
                : "Failed to save profile. Please check all required fields.";
            alert(`Error: ${errorMsg}`);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const current_password = data.get("current_password");
        const new_password = data.get("new_password");
        const confirm_password = data.get("confirm_password");

        if (!current_password || !new_password) {
            alert("Please fill all password fields.");
            return;
        }
        if (new_password !== confirm_password) {
            alert("New password and confirmation do not match.");
            return;
        }

        try {
            await api.post("/auth/change-password", {
                current_password,
                new_password,
            });
            alert("Password updated successfully.");
            e.currentTarget.reset();
        } catch (err: any) {
            console.error(err);
            alert(err?.response?.data?.detail || "Failed to update password");
        }
    };

    const handleNotificationSave = async (prefs: NotificationSettings) => {
        try {
            await api.post("/shop/notification-preferences", prefs);
            alert("Notification preferences updated");
        } catch (err: any) {
            console.error(err);
            alert(err?.response?.data?.detail || "Failed to update notification preferences");
        }
    };

    const handlePaymentSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        try {
            await api.post("/shop/payment-settings", Object.fromEntries(data.entries()));
            alert("Payment details saved");
        } catch (err: any) {
            console.error(err);
            alert(err?.response?.data?.detail || "Failed to save payment settings");
        }
    };

    type NotificationSettings = {
        sales_alerts: boolean;
        low_stock: boolean;
        daily_summary: boolean;
        weekly_reports: boolean;
    };

    const [notificationPrefs, setNotificationPrefs] = useState<NotificationSettings>({
        sales_alerts: true,
        low_stock: true,
        daily_summary: false,
        weekly_reports: true,
    });

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await api.get("/shop/notification-preferences");
                setNotificationPrefs(prev => ({ ...prev, ...data }));
            } catch (err) {
                console.log("No notification preferences saved yet");
            }
        };
        fetchNotifications();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 pb-24">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Shop Settings</h1>
                    <p className="text-gray-500 mt-1">Manage profile details, security, notifications and payout preferences.</p>
                </div>
                {!profileExists && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full font-medium border border-yellow-200">
                        Profile not yet created
                    </span>
                )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-wrap gap-2 p-2">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = tab.id === activeTab;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                isActive ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <Icon className="w-4 h-4" /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {activeTab === "profile" && (
                <form onSubmit={handleSubmit}>
                    <Section title="🏪 Shop Details">
                    <div className="md:col-span-2 flex items-center gap-6 mb-4">
                        <div 
                            className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:border-green-500"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {form.profile_picture_url ? (
                                <img src={form.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <ImagePlus className="w-6 h-6 mx-auto mb-1" />
                                    <span className="text-[10px]">{uploading ? "..." : "Upload"}</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800">Shop Logo / Photo</h4>
                            <p className="text-sm text-gray-500">Click the circle to upload an image.</p>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </div>
                    </div>

                    <Field label="Shop Name" name="shop_name" value={form.shop_name} onChange={handleChange} required placeholder="e.g. Sri Venkatesh Agri Store" />
                    <Field label="Owner Name" name="owner_name" value={form.owner_name} onChange={handleChange} placeholder="e.g. Ramesh Kumar" />
                    <Field label="Licence Number" name="license_number" value={form.license_number} onChange={handleChange} required placeholder="e.g. AGS/2024/00123" />
                    <Field label="Contact Number" name="contact_number" value={form.contact_number} onChange={handleChange} placeholder="e.g. 9876543210" type="tel" />
                    
                    <Field label="Shop ID" name="shop_id" value={form.shop_id || ""} onChange={handleChange} placeholder="e.g. SHOP-12345" />
                    
                    <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Relation & Name <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                            <select 
                                name="relation_type" 
                                value={form.relation_type || "S/O"} 
                                onChange={handleChange}
                                className="px-2 py-2.5 border rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 w-24"
                            >
                                <option value="S/O">S/O</option>
                                <option value="W/O">W/O</option>
                                <option value="D/O">D/O</option>
                            </select>
                            <input
                                type="text"
                                name="father_name"
                                value={form.father_name || ""}
                                onChange={handleChange}
                                placeholder="Name of Father/Husband"
                                required
                                className="flex-1 px-3 py-2.5 border rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                        </div>
                    </div>

                    <Field label="Aadhaar Number" name="aadhaar_number" value={form.aadhaar_number} onChange={handleChange} placeholder="1234 5678 9012" />
                    <Field label="Registered Email" name="email" value={user?.email || ""} onChange={() => {}} readOnly />
                </Section>



                <Section title="📍 Shop Detailed Address">
                    <Field label="House No. / Plot No." name="house_no" value={form.house_no} onChange={handleChange} placeholder="e.g. 12-34/A" />
                    <Field label="Street / Road" name="street" value={form.street} onChange={handleChange} placeholder="e.g. Main Bazar Road" />
                    <Field label="Village / City" name="village" value={form.village} onChange={handleChange} placeholder="e.g. Kodad" />
                    <Field label="Mandal / Tehsil" name="mandal" value={form.mandal} onChange={handleChange} placeholder="e.g. Kodad Rural" />
                    <Field label="District" name="district" value={form.district} onChange={handleChange} placeholder="e.g. Suryapet" />
                    <Field label="State" name="state" value={form.state} onChange={handleChange} placeholder="e.g. Telangana" />
                    <Field label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="e.g. 508206" />
                    <Field label="Landmark" name="landmark" value={form.landmark} onChange={handleChange} placeholder="e.g. Near Bus Stand" />
                </Section>

                    <Section title="🏠 Permanent Address">
                    <Field label="House No. / Plot No." name="perm_house_no" value={form.perm_house_no} onChange={handleChange} placeholder="e.g. 12-34/A" />
                    <Field label="Street / Road" name="perm_street" value={form.perm_street} onChange={handleChange} placeholder="e.g. Main Bazar Road" />
                    <Field label="Village / City" name="perm_village" value={form.perm_village} onChange={handleChange} placeholder="e.g. Kodad" />
                    <Field label="Mandal / Tehsil" name="perm_mandal" value={form.perm_mandal} onChange={handleChange} placeholder="e.g. Kodad Rural" />
                    <Field label="District" name="perm_district" value={form.perm_district} onChange={handleChange} placeholder="e.g. Suryapet" />
                    <Field label="State" name="perm_state" value={form.perm_state} onChange={handleChange} placeholder="e.g. Telangana" />
                    <Field label="Pincode" name="perm_pincode" value={form.perm_pincode} onChange={handleChange} placeholder="e.g. 508206" />
                </Section>

                    <Section title="🏦 Bank Details">
                    <Field label="Bank Name" name="bank_name" value={form.bank_name} required onChange={handleChange} placeholder="e.g. State Bank of India" />
                    <Field label="IFSC Code" name="ifsc_code" value={form.ifsc_code} required onChange={handleChange} placeholder="e.g. SBIN0001234" />
                    <Field label="Account Number" name="account_number" value={form.account_number} required onChange={handleChange} placeholder="e.g. 1234567890" />
                    <Field label="PAN Number" name="pan_number" value={form.pan_number} onChange={handleChange} placeholder="ABCDE1234F" />
                </Section>

                {/* Inline bottom bar for save action */}
                <div className="mt-8 flex items-center justify-end gap-4 border-t pt-6 border-gray-200">
                    {saved && (
                        <div className="flex items-center gap-2 text-green-600 font-medium text-sm animate-in fade-in slide-in-from-bottom-1">
                            <CheckCircle2 className="w-4 h-4" /> Profile saved successfully!
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-8 py-2.5 rounded-lg shadow-sm transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : profileExists ? "Save Changes" : "Create Profile"}
                    </button>
                </div>
                </form>
            )}

            {activeTab === "password" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                            <Lock className="w-5 h-5 text-emerald-600" /> Update Password
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={handlePasswordChange}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Password</label>
                                    <input type="password" name="current_password" className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New Password</label>
                                    <input type="password" name="new_password" className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" required />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirm New Password</label>
                                    <input type="password" name="confirm_password" className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" required />
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-400">Tip: Use at least 8 characters with a mix of letters, numbers and symbols.</p>
                            <button type="submit" className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">Update Password</button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {activeTab === "notifications" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                            <Bell className="w-5 h-5 text-emerald-600" /> Notification Preferences
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-500">Choose how you want to be notified about sales, alerts and reports.</p>
                        <div className="space-y-3">
                            {[{
                                key: "sales_alerts" as const,
                                title: "Sales Alerts",
                                description: "Instant alerts whenever a new order is placed."
                            }, {
                                key: "low_stock" as const,
                                title: "Low Stock Alerts",
                                description: "Receive warnings when a batch nears minimum quantity."
                            }, {
                                key: "daily_summary" as const,
                                title: "Daily Summary",
                                description: "Nightly recap of sales, revenue and outstanding orders."
                            }, {
                                key: "weekly_reports" as const,
                                title: "Weekly Insights",
                                description: "Sunday email with weekly sales performance graphs."
                            }].map(pref => (
                                <label key={pref.key} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-green-400 transition">
                                    <input
                                        type="checkbox"
                                        checked={notificationPrefs[pref.key]}
                                        onChange={(e) => setNotificationPrefs(prev => ({ ...prev, [pref.key]: e.target.checked }))}
                                        className="mt-1 accent-green-600"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700">{pref.title}</p>
                                        <p className="text-xs text-gray-500">{pref.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={() => handleNotificationSave(notificationPrefs)}
                            className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                        >Save Preferences</button>
                    </CardContent>
                </Card>
            )}

            {activeTab === "payments" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                            <Wallet className="w-5 h-5 text-emerald-600" /> Payment Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={handlePaymentSave}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Beneficiary Name</label>
                                    <input name="beneficiary_name" defaultValue={form.full_name || user?.full_name || ""} className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">UPI ID</label>
                                    <input name="upi_id" className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="example@upi" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bank Name</label>
                                    <input name="bank_name" defaultValue={form.bank_name} className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Account Number</label>
                                    <input name="account_number" defaultValue={form.account_number} className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">IFSC Code</label>
                                    <input name="ifsc_code" defaultValue={form.ifsc_code} className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payout Notes</label>
                                <textarea
                                    name="payout_notes"
                                    className="w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                    rows={3}
                                    placeholder="Extra instructions for weekly settlements, GST invoice references etc."
                                />
                            </div>
                            <button type="submit" className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">Save Payment Details</button>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

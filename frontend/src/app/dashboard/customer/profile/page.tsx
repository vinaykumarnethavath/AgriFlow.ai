"use client";

import React, { useEffect, useState } from "react";
import { ProfileForm } from "@/components/ProfileForm";
import api from "@/lib/api";
import { Lock, Bell, Wallet, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";

const TABS = [
    { id: "profile", label: "Profile", icon: Settings2 },
    { id: "password", label: "Change Password", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "payments", label: "Payment Settings", icon: Wallet },
] as const;

type TabId = typeof TABS[number]["id"];

export default function CustomerProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabId>("profile");

    const fetchProfile = async () => {
        try {
            const { data } = await api.get("/customer/profile");
            setProfile(data);
        } catch (err) {
            console.error("Profile not found or error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const current_password = data.get("current_password");
        const new_password = data.get("new_password");
        const confirm_password = data.get("confirm_password");

        if (new_password !== confirm_password) {
            alert("New passwords do not match.");
            return;
        }

        try {
            await api.post("/auth/change-password", { current_password, new_password });
            alert("Password updated successfully.");
            e.currentTarget.reset();
        } catch (err: any) {
            alert(err?.response?.data?.detail || "Failed to update password");
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;

    return (
        <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 pb-24">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
                    <p className="text-muted-foreground mt-1">Manage your personal profile, security, and payment preferences.</p>
                </div>
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
                                isActive ? "bg-green-600 text-white" : "text-muted-foreground hover:bg-gray-100"
                            }`}
                        >
                            <Icon className="w-4 h-4" /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {activeTab === "profile" && (
                <div className="bg-white rounded-xl border p-6 shadow-sm">
                    <ProfileForm role="customer" initialData={profile} onSaveSuccess={fetchProfile} />
                </div>
            )}

            {activeTab === "password" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                            <Lock className="w-5 h-5 text-emerald-600" /> Update Password
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4" onSubmit={handlePasswordChange}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Password</label>
                                    <PasswordInput name="current_password" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">New Password</label>
                                    <PasswordInput name="new_password" required />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confirm New Password</label>
                                    <PasswordInput name="confirm_password" required />
                                </div>
                            </div>
                            <button type="submit" className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">Update Password</button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {activeTab === "notifications" && (
                <Card>
                    <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Notification settings for orders and promos coming soon.</p>
                    </CardContent>
                </Card>
            )}

            {activeTab === "payments" && (
                <Card>
                    <CardHeader><CardTitle>Payment Methods</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Manage your saved cards and UPI IDs for faster checkout.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

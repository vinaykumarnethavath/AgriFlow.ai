"use client";

import React, { useEffect, useState } from "react";
import { ProfileForm } from "@/components/ProfileForm";
import api from "@/lib/api";

export default function CustomerProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-8">Loading profile...</div>;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-foreground">Customer Profile Settings</h1>
            <ProfileForm role="customer" initialData={profile} onSaveSuccess={fetchProfile} />
        </div>
    );
}

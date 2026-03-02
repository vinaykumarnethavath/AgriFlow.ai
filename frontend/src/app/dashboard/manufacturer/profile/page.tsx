"use client";

import React, { useEffect, useState } from "react";
import { ProfileForm } from "@/components/ProfileForm";
import api from "@/lib/api";

export default function MillProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get("/manufacturer/profile");
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
            <h1 className="text-3xl font-bold mb-6 text-foreground">Mill Profile Settings</h1>
            <ProfileForm role="mill" initialData={profile} onSaveSuccess={fetchProfile} />
        </div>
    );
}

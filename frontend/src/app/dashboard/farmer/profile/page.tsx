"use client";

import React, { useEffect, useState } from "react";
import { ProfileForm } from "@/components/ProfileForm";
import api from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function FarmerProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    const fetchProfile = async () => {
        try {
            const { data } = await api.get("/farmer/profile");
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

    if (loading) return <div className="p-8">{t('common.loading')}</div>;

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-foreground">{t('profile.title')}</h1>
            <ProfileForm role="farmer" initialData={profile} onSaveSuccess={fetchProfile} />
        </div>
    );
}

"use client";

import React from "react";
import { ContactInfo } from "@/lib/api";
import { Phone, MapPin, User, Store, Factory, ShoppingBag } from "lucide-react";

interface ContactInfoCardProps {
    contact: ContactInfo;
    label?: string; // e.g. "Customer Details", "Shop Contact"
}

const ROLE_CONFIG: Record<string, { label: string; icon: React.ElementType; gradient: string; badge: string }> = {
    farmer: {
        label: "Farmer",
        icon: User,
        gradient: "from-emerald-500 to-green-600",
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    shop: {
        label: "Shop Owner",
        icon: Store,
        gradient: "from-blue-500 to-indigo-600",
        badge: "bg-blue-100 text-blue-700 border-blue-200",
    },
    manufacturer: {
        label: "Manufacturer",
        icon: Factory,
        gradient: "from-purple-500 to-violet-600",
        badge: "bg-purple-100 text-purple-700 border-purple-200",
    },
    customer: {
        label: "Customer",
        icon: ShoppingBag,
        gradient: "from-amber-500 to-orange-600",
        badge: "bg-amber-100 text-amber-700 border-amber-200",
    },
};

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export default function ContactInfoCard({ contact, label }: ContactInfoCardProps) {
    const config = ROLE_CONFIG[contact.role] || ROLE_CONFIG.customer;
    const RoleIcon = config.icon;

    const addressParts = [contact.village, contact.mandal, contact.district, contact.state].filter(Boolean);
    const displayAddress = contact.address || addressParts.join(", ") || null;

    return (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className={`bg-gradient-to-r ${config.gradient} px-4 py-2.5 flex items-center gap-2`}>
                <RoleIcon className="w-4 h-4 text-white/90" />
                <span className="text-sm font-semibold text-white">
                    {label || `${config.label} Details`}
                </span>
            </div>

            {/* Body */}
            <div className="p-4 flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {contact.profile_picture_url ? (
                        <img
                            src={contact.profile_picture_url}
                            alt={contact.full_name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                        />
                    ) : (
                        <div
                            className={`w-14 h-14 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white font-bold text-lg shadow-sm`}
                        >
                            {getInitials(contact.full_name)}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Name + Role Badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900 text-base truncate">
                            {contact.full_name}
                        </h4>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${config.badge}`}>
                            {config.label}
                        </span>
                    </div>

                    {/* Phone */}
                    {contact.phone_number && (
                        <a
                            href={`tel:${contact.phone_number}`}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors group"
                        >
                            <div className="p-1 bg-blue-50 rounded-md group-hover:bg-blue-100 transition-colors">
                                <Phone className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-medium">{contact.phone_number}</span>
                        </a>
                    )}

                    {/* Address */}
                    {displayAddress && (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <div className="p-1 bg-gray-50 rounded-md mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                            <span className="leading-snug">{displayAddress}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

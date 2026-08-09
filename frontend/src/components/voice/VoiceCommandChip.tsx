"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useLanguage, SupportedLocale } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

interface VoiceCommandChipProps {
    onCommand: (command: string) => void;
}

// ── Context-aware quick commands based on current page and role ───────────────

interface QuickCommand {
    label: string;
    command: string;
    emoji: string;
}

function getFarmerCommands(pathname: string, locale: SupportedLocale): QuickCommand[] {
    const isEn = locale === "en";
    const isTe = locale === "te";
    const isHi = locale === "hi";

    if (pathname.includes("/market-prices")) {
        return [
            { label: isEn ? "Rice price" : isTe ? "వరి ధర" : isHi ? "चावल का भाव" : "Rice price", command: "What is the price of rice?", emoji: "🌾" },
            { label: isEn ? "Cotton price" : isTe ? "పత్తి ధర" : isHi ? "कपास का भाव" : "Cotton price", command: "What is the price of cotton?", emoji: "🏵️" },
            { label: isEn ? "Wheat price" : isTe ? "గోధుమ ధర" : isHi ? "गेहूं का भाव" : "Wheat price", command: "What is the price of wheat?", emoji: "🌿" },
        ];
    }

    if (pathname.includes("/market")) {
        return [
            { label: isEn ? "Search fertilizer" : isTe ? "ఎరువులు వెతకండి" : isHi ? "खाद खोजो" : "Search fertilizer", command: "Show me fertilizers", emoji: "🧪" },
            { label: isEn ? "Search pesticide" : isTe ? "పురుగుమందు" : isHi ? "कीटनाशक" : "Search pesticide", command: "Show me pesticides", emoji: "🐛" },
            { label: isEn ? "Go to dashboard" : isTe ? "డాష్‌బోర్డ్" : isHi ? "डैशबोर्ड" : "Dashboard", command: "Go to dashboard", emoji: "🏠" },
        ];
    }

    if (pathname.includes("/crops")) {
        return [
            { label: isEn ? "Add rice crop" : isTe ? "వరి పంట జోడించు" : isHi ? "धान की फसल जोड़ो" : "Add rice crop", command: "Add 2 acres of rice crop", emoji: "🌾" },
            { label: isEn ? "Add expense" : isTe ? "ఖర్చు జోడించు" : isHi ? "खर्चा जोड़ो" : "Add expense", command: "Add expense 500 rupees for fertilizer", emoji: "💰" },
            { label: isEn ? "My expenses" : isTe ? "నా ఖర్చులు" : isHi ? "मेरे खर्चे" : "My expenses", command: "How much did I spend?", emoji: "📊" },
        ];
    }

    if (pathname.includes("/weather")) {
        return [
            { label: isEn ? "Today's weather" : isTe ? "ఈరోజు వాతావరణం" : isHi ? "आज का मौसम" : "Weather", command: "What is the weather today?", emoji: "🌤️" },
            { label: isEn ? "Will it rain?" : isTe ? "వర్షం వస్తుందా?" : isHi ? "बारिश होगी?" : "Rain?", command: "Will it rain today?", emoji: "🌧️" },
        ];
    }

    if (pathname.includes("/profile")) {
        return [
            { label: isEn ? "Update village" : isTe ? "గ్రామం మార్చు" : isHi ? "गाँव बदलो" : "Update village", command: "Update my village to Rayaparthi", emoji: "📍" },
            { label: isEn ? "Go to crops" : isTe ? "పంటలకు వెళ్ళు" : isHi ? "फसलों पर जाओ" : "Go to crops", command: "Go to my crops", emoji: "🌱" },
        ];
    }

    // Default dashboard commands
    return [
        { label: isEn ? "My crops" : isTe ? "నా పంటలు" : isHi ? "मेरी फसलें" : "My crops", command: "Go to my crops", emoji: "🌱" },
        { label: isEn ? "Check prices" : isTe ? "ధరలు చూడు" : isHi ? "भाव देखो" : "Check prices", command: "What is the price of rice?", emoji: "📈" },
        { label: isEn ? "Weather" : isTe ? "వాతావరణం" : isHi ? "मौसम" : "Weather", command: "What is the weather today?", emoji: "🌤️" },
        { label: isEn ? "Add crop" : isTe ? "పంట జోడించు" : isHi ? "फसल जोड़ो" : "Add crop", command: "Add 2 acres of rice crop", emoji: "🌾" },
    ];
}

function getShopCommands(pathname: string, locale: SupportedLocale): QuickCommand[] {
    return [
        { label: "My inventory", command: "Go to my inventory", emoji: "📦" },
        { label: "Customer orders", command: "Show my orders", emoji: "🛒" },
        { label: "Accounting", command: "Go to accounting", emoji: "💹" },
    ];
}

function getManufacturerCommands(pathname: string, locale: SupportedLocale): QuickCommand[] {
    return [
        { label: "Purchases", command: "Show my purchases", emoji: "📥" },
        { label: "Production", command: "Go to production", emoji: "🏭" },
        { label: "Sales", command: "Show my sales", emoji: "📤" },
    ];
}

function getCustomerCommands(pathname: string, locale: SupportedLocale): QuickCommand[] {
    return [
        { label: "My orders", command: "Show my orders", emoji: "📋" },
        { label: "Browse products", command: "Show me products", emoji: "🛍️" },
    ];
}

function getContextualCommands(pathname: string, locale: SupportedLocale, role?: string): QuickCommand[] {
    switch (role) {
        case "shop": return getShopCommands(pathname, locale);
        case "manufacturer": return getManufacturerCommands(pathname, locale);
        case "customer": return getCustomerCommands(pathname, locale);
        default: return getFarmerCommands(pathname, locale);
    }
}

export function VoiceCommandChips({ onCommand }: VoiceCommandChipProps) {
    const pathname = usePathname();
    const { locale } = useLanguage();
    const { user } = useAuth();
    const commands = getContextualCommands(pathname, locale, user?.role);

    if (commands.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 justify-center mt-3">
            {commands.map((cmd, i) => (
                <button
                    key={i}
                    onClick={() => onCommand(cmd.command)}
                    className="
                        inline-flex items-center gap-1.5 px-3 py-1.5
                        text-xs font-medium
                        bg-white/10 hover:bg-white/20
                        border border-white/20 hover:border-white/40
                        text-white/80 hover:text-white
                        rounded-full
                        transition-all duration-200
                        backdrop-blur-sm
                        active:scale-95
                    "
                >
                    <span>{cmd.emoji}</span>
                    <span>{cmd.label}</span>
                </button>
            ))}
        </div>
    );
}

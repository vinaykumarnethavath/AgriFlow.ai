"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useLanguage, SupportedLocale } from "@/context/LanguageContext";

interface VoiceCommandChipProps {
    onCommand: (command: string) => void;
}

// ── Context-aware quick commands based on current page ───────────────────────

interface QuickCommand {
    label: string;
    command: string;
    emoji: string;
}

function getContextualCommands(pathname: string, locale: SupportedLocale): QuickCommand[] {
    const base: QuickCommand[] = [];

    if (pathname.includes("/market-prices") || pathname.includes("/market")) {
        base.push(
            { label: locale === "en" ? "Price of rice" : "चावल का भाव", command: "What is the price of rice?", emoji: "🌾" },
            { label: locale === "en" ? "Price of wheat" : "गेहूं का भाव", command: "What is the price of wheat?", emoji: "🌿" },
            { label: locale === "en" ? "Price of cotton" : "कपास का भाव", command: "What is the price of cotton?", emoji: "🏵️" },
        );
    } else if (pathname.includes("/weather")) {
        base.push(
            { label: locale === "en" ? "Today's weather" : "आज का मौसम", command: "What is the weather today?", emoji: "🌤️" },
        );
    } else if (pathname.includes("/crops")) {
        base.push(
            { label: locale === "en" ? "Add expense" : "खर्चा जोड़ो", command: "Add expense 500 rupees for fertilizer", emoji: "💰" },
            { label: locale === "en" ? "My expenses" : "मेरे खर्चे", command: "How much did I spend?", emoji: "📊" },
        );
    } else if (pathname.includes("/expenses")) {
        base.push(
            { label: locale === "en" ? "Total expenses" : "कुल खर्चा", command: "How much did I spend in total?", emoji: "📊" },
        );
    } else {
        // Default suggestions for dashboard
        base.push(
            { label: locale === "en" ? "Check prices" : "भाव देखो", command: "What is the price of rice?", emoji: "📈" },
            { label: locale === "en" ? "Weather" : "मौसम", command: "What is the weather today?", emoji: "🌤️" },
            { label: locale === "en" ? "My expenses" : "मेरे खर्चे", command: "How much did I spend?", emoji: "💰" },
            { label: locale === "en" ? "Open crops" : "फसल खोलो", command: "Go to my crops", emoji: "🌱" },
        );
    }

    return base;
}

export function VoiceCommandChips({ onCommand }: VoiceCommandChipProps) {
    const pathname = usePathname();
    const { locale } = useLanguage();
    const commands = getContextualCommands(pathname, locale);

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

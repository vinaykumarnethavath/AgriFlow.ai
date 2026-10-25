"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { DemoButton } from "@/components/DemoButton";
import { DemoBanner } from "@/components/demo/DemoBanner";
import { ChatBot } from "@/components/ChatBot";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { useDemoMode } from "@/context/DemoContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { isDemoMode } = useDemoMode();

    return (
        <div className="flex bg-background min-h-screen transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-8 overflow-y-auto relative bg-background`}>
                {/* Top-Right Quick Controls: Only show DemoButton if currently in demo mode */}
                <div className="flex justify-end items-center gap-2 mb-4 sticky top-0 z-30 bg-background/80 backdrop-blur-md py-2 px-3 rounded-xl border border-border/50 shadow-xs">
                    {isDemoMode && <DemoButton />}
                    <LanguageSelector direction="down" />
                    <ThemeToggle />
                </div>
                {isDemoMode && <DemoBanner />}
                {children}
            </div>
            <ChatBot />
            <VoiceAssistant />
        </div>
    );
}

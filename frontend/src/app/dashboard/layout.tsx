"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { DemoButton } from "@/components/DemoButton";
import { ChatBot } from "@/components/ChatBot";
import { VoiceAssistant } from "@/components/VoiceAssistant";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex bg-background min-h-screen transition-colors duration-300">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-8 overflow-y-auto relative bg-background`}>
                {/* Top-Right Quick Controls: Demo Button beside LanguageSelector and ThemeToggle */}
                <div className="flex justify-end items-center gap-2 mb-4 sticky top-0 z-30 bg-background/80 backdrop-blur-md py-2 px-3 rounded-xl border border-border/50 shadow-xs">
                    <DemoButton />
                    <LanguageSelector direction="down" />
                    <ThemeToggle />
                </div>
                {children}
            </div>
            <ChatBot />
            <VoiceAssistant />
        </div>
    );
}

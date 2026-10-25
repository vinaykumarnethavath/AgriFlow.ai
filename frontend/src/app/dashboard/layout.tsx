"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
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
                {isDemoMode && <DemoBanner />}
                {children}
            </div>
            <ChatBot />
            <VoiceAssistant />
        </div>
    );
}

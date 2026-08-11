"use client";

import React, { useState } from "react";
import { Brain, LineChart as LineChartIcon } from "lucide-react";
import ProcurementTab from "./components/ProcurementTab";
import InventoryTab from "./components/InventoryTab";

export default function IntelligenceDashboard() {
    const [activeTab, setActiveTab] = useState<"procurement" | "inventory">("procurement");

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Brain className="w-8 h-8" />
                        AI Intelligence Hub
                    </h1>
                    <p className="text-blue-100 max-w-2xl text-lg">
                        Strategic insights and AI-driven recommendations to optimize your procurement and inventory operations.
                    </p>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-32 -mb-16 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl"></div>
            </div>

            <div className="flex border-b border-gray-200">
                <button
                    className={`px-6 py-3 font-medium text-sm transition-colors relative flex items-center gap-2 ${
                        activeTab === "procurement"
                            ? "text-blue-700"
                            : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                    }`}
                    onClick={() => setActiveTab("procurement")}
                >
                    <LineChartIcon className="w-4 h-4" />
                    Procurement Intelligence
                    {activeTab === "procurement" && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md"></span>
                    )}
                </button>
                <button
                    className={`px-6 py-3 font-medium text-sm transition-colors relative flex items-center gap-2 ${
                        activeTab === "inventory"
                            ? "text-blue-700"
                            : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                    }`}
                    onClick={() => setActiveTab("inventory")}
                >
                    <Brain className="w-4 h-4" />
                    Inventory Optimization
                    {activeTab === "inventory" && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md"></span>
                    )}
                </button>
            </div>

            <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === "procurement" ? <ProcurementTab /> : <InventoryTab />}
            </div>
        </div>
    );
}

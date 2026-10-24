"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";
import { DemoModal } from "./DemoModal";

/**
 * DemoButton — A premium animated button that opens the DemoModal.
 * Sits in the top-right corner next to the LanguageSelector.
 */
export function DemoButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center gap-1.5 px-3 py-1.5 h-9 text-sm font-bold rounded-lg border transition-all duration-200 active:scale-95 select-none overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)",
          borderColor: "#16a34a",
          color: "white",
          boxShadow: "0 2px 8px rgba(34,197,94,0.35)",
        }}
        title="Explore Demo — See all features with realistic data"
        id="demo-mode-button"
      >
        {/* Animated shine overlay */}
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
          }}
        />

        {/* Pulsing dot */}
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>

        <Play className="h-3.5 w-3.5 fill-white flex-shrink-0" />
        <span className="hidden sm:inline">Demo</span>
      </button>

      <DemoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

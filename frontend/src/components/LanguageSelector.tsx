"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage, LANGUAGES, SupportedLocale } from "@/context/LanguageContext";
import { Globe, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * LanguageSelector — Beautiful dropdown language picker.
 * Shows the current language in its native script with a globe icon.
 * Designed to fit in the sidebar or header.
 */
export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-lg transition-all duration-200",
          "hover:bg-green-800/60 active:scale-95",
          compact
            ? "px-2 py-1.5 text-xs"
            : "px-3 py-2 text-sm",
          "text-green-100 hover:text-white"
        )}
        title="Change Language"
      >
        <Globe className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
        <span className="font-medium truncate max-w-[80px]">
          {currentLanguage.nativeName}
        </span>
        <ChevronDown
          className={cn(
            "shrink-0 transition-transform duration-200",
            compact ? "h-3 w-3" : "h-3.5 w-3.5",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-52 rounded-xl overflow-hidden",
            "bg-gray-900/95 backdrop-blur-xl border border-green-700/40",
            "shadow-2xl shadow-black/40",
            "animate-in fade-in slide-in-from-top-2 duration-200",
            // Position: opens upward from sidebar bottom
            "bottom-full mb-2 left-0"
          )}
        >
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-green-800/40">
            <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">
              🌐 Select Language
            </p>
          </div>

          {/* Language List */}
          <div className="py-1 max-h-72 overflow-y-auto scrollbar-thin">
            {LANGUAGES.map((lang) => {
              const isActive = locale === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLocale(lang.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                    isActive
                      ? "bg-green-600/30 text-green-300"
                      : "text-gray-300 hover:bg-green-800/30 hover:text-white"
                  )}
                >
                  {/* Native name (prominent) */}
                  <span className="text-base font-medium flex-1">
                    {lang.nativeName}
                  </span>

                  {/* English name (subtle) */}
                  <span className="text-xs text-gray-500">
                    {lang.name}
                  </span>

                  {/* Active Check */}
                  {isActive && (
                    <Check className="h-4 w-4 text-green-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

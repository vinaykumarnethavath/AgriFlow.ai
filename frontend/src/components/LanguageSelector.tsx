"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage, LANGUAGES } from "@/context/LanguageContext";
import { Globe, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * LanguageSelector — Dropdown language picker.
 * Shows the current language in its native script with a globe icon.
 * Features rich dark green accents and clear contrast across light and dark modes.
 */
export function LanguageSelector({
  compact = false,
  direction = "up",
  className,
}: {
  compact?: boolean;
  direction?: "up" | "down";
  className?: string;
}) {
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

  const isSidebar = direction === "up";

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-lg transition-all duration-200 active:scale-95 select-none",
          compact
            ? "px-2.5 py-1 text-xs"
            : "px-3 py-1.5 text-sm h-9",
          isSidebar
            ? "w-full justify-between bg-green-800/60 hover:bg-green-800 text-green-100 hover:text-white border border-green-700/60 font-medium"
            : "bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-700/30 hover:border-emerald-700/50 shadow-sm font-semibold dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-600/40 dark:hover:bg-emerald-900/60"
        )}
        title="Change Language"
      >
        <div className="flex items-center gap-2 truncate">
          <Globe
            className={cn(
              "shrink-0",
              compact ? "h-3.5 w-3.5" : "h-4 w-4",
              isSidebar ? "text-emerald-300" : "text-emerald-700 dark:text-emerald-400 stroke-[2.2]"
            )}
          />
          <span
            className={cn(
              "truncate max-w-[85px] font-semibold",
              isSidebar ? "text-green-100" : "text-emerald-900 dark:text-emerald-200"
            )}
          >
            {currentLanguage.nativeName}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "shrink-0 transition-transform duration-200",
            compact ? "h-3 w-3" : "h-3.5 w-3.5",
            isSidebar ? "text-emerald-300" : "text-emerald-700 dark:text-emerald-400 stroke-[2.2]",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 w-56 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200",
            isSidebar
              ? "bottom-full mb-2 left-0 bg-gray-900/95 border border-green-700/50 shadow-black/50"
              : "top-full mt-2 right-0 bg-white/98 dark:bg-gray-900/95 border border-emerald-700/30 dark:border-emerald-700/50 shadow-emerald-950/15 dark:shadow-black/60"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "px-3.5 py-2.5 border-b",
              isSidebar
                ? "border-green-800/50 bg-green-950/40"
                : "border-emerald-100 dark:border-emerald-800/40 bg-emerald-50/90 dark:bg-emerald-950/50"
            )}
          >
            <p
              className={cn(
                "text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
                isSidebar ? "text-green-400" : "text-emerald-800 dark:text-emerald-300"
              )}
            >
              <span>🌐</span> Select Language
            </p>
          </div>

          {/* Language List */}
          <div className="py-1 max-h-72 overflow-y-auto scrollbar-thin">
            {LANGUAGES.map((lang) => {
              const isActive = locale === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLocale(lang.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3.5 py-2 text-left transition-colors text-sm",
                    isSidebar
                      ? (isActive
                          ? "bg-green-600/30 text-green-300 font-semibold"
                          : "text-gray-300 hover:bg-green-800/30 hover:text-white")
                      : (isActive
                          ? "bg-emerald-100 text-emerald-950 font-bold dark:bg-emerald-900/50 dark:text-emerald-200"
                          : "text-gray-700 dark:text-gray-300 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30 hover:text-emerald-900 dark:hover:text-emerald-100")
                  )}
                >
                  <div className="flex flex-col">
                    {/* Native name (prominent) */}
                    <span className="font-semibold text-sm">
                      {lang.nativeName}
                    </span>
                    {/* English name (subtle) */}
                    <span
                      className={cn(
                        "text-[11px]",
                        isActive
                          ? "text-emerald-700 dark:text-emerald-300 font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {lang.name}
                    </span>
                  </div>

                  {/* Active Check */}
                  {isActive && (
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0 font-bold",
                        isSidebar ? "text-green-400" : "text-emerald-700 dark:text-emerald-400 stroke-[2.5]"
                      )}
                    />
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


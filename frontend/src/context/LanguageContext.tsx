"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import en, { TranslationKeys } from "@/locales/en";
import hi from "@/locales/hi";
import te from "@/locales/te";
import ta from "@/locales/ta";
import kn from "@/locales/kn";
import mr from "@/locales/mr";
import bn from "@/locales/bn";
import gu from "@/locales/gu";
import pa from "@/locales/pa";

// ── Types ────────────────────────────────────────────────────────────────────

export type SupportedLocale = "en" | "hi" | "te" | "ta" | "kn" | "mr" | "bn" | "gu" | "pa";

export interface LanguageInfo {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  script: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: "en", name: "English", nativeName: "English", script: "Latn" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", script: "Deva" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", script: "Telu" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", script: "Taml" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", script: "Knda" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", script: "Deva" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", script: "Beng" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", script: "Gujr" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", script: "Guru" },
];

// ── Locale Map ───────────────────────────────────────────────────────────────

const LOCALE_MAP: Record<SupportedLocale, any> = {
  en, hi, te, ta, kn, mr, bn, gu, pa,
};

// ── Helper: Deep key access ──────────────────────────────────────────────────

function getNestedValue(obj: any, keyPath: string): string | undefined {
  const keys = keyPath.split(".");
  let current = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[key];
  }
  return typeof current === "string" ? current : undefined;
}

// ── Context ──────────────────────────────────────────────────────────────────

interface LanguageContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, fallback?: string) => string;
  languages: LanguageInfo[];
  currentLanguage: LanguageInfo;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
  languages: LANGUAGES,
  currentLanguage: LANGUAGES[0],
});

// ── Provider ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "agri_language";

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>("en");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved locale from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
    if (saved && LOCALE_MAP[saved]) {
      setLocaleState(saved);
    }
    setIsHydrated(true);
  }, []);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    if (LOCALE_MAP[newLocale]) {
      setLocaleState(newLocale);
      localStorage.setItem(STORAGE_KEY, newLocale);
      // Update the html lang attribute
      document.documentElement.lang = newLocale;
    }
  }, []);

  // Translation function: looks up key in current locale, falls back to English
  const t = useCallback(
    (key: string, fallback?: string): string => {
      // Try current locale first
      const localDict = LOCALE_MAP[locale];
      const translated = getNestedValue(localDict, key);
      if (translated) return translated;

      // Fall back to English
      const enTranslated = getNestedValue(en, key);
      if (enTranslated) return enTranslated;

      // Fall back to the provided fallback or the key itself
      return fallback || key;
    },
    [locale]
  );

  const currentLanguage = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  // Prevent hydration mismatch by rendering English until client loads
  const contextValue = {
    locale: isHydrated ? locale : "en",
    setLocale,
    t: isHydrated ? t : (key: string, fallback?: string) => getNestedValue(en, key) || fallback || key,
    languages: LANGUAGES,
    currentLanguage: isHydrated ? currentLanguage : LANGUAGES[0],
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useLanguage = () => useContext(LanguageContext);

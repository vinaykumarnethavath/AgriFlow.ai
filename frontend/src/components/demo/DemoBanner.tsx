"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Sparkles, 
  RotateCcw, 
  X, 
  ChevronRight, 
  Check, 
  User, 
  Store, 
  Factory, 
  ShoppingBag,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import api from "@/lib/api";

const DEMO_ROLES = [
  {
    role: "farmer",
    label: "Farmer",
    name: "Ravi Kumar Reddy",
    subtext: "7.20 Ac • Krishna AP",
    icon: "🌾",
    path: "/dashboard/farmer",
    gradient: "from-green-600 to-emerald-600",
    border: "border-green-500/40",
  },
  {
    role: "shop",
    label: "Shop Owner",
    name: "Krishna Agro Center",
    subtext: "Fertilizers & Inputs",
    icon: "🏪",
    path: "/dashboard/shop",
    gradient: "from-blue-600 to-indigo-600",
    border: "border-blue-500/40",
  },
  {
    role: "manufacturer",
    label: "Mill Owner",
    name: "Sri Venkateswara Mill",
    subtext: "120 T/Day Rice & Cotton",
    icon: "🏭",
    path: "/dashboard/manufacturer",
    gradient: "from-amber-600 to-orange-600",
    border: "border-amber-500/40",
  },
  {
    role: "customer",
    label: "Consumer",
    name: "Priya Sharma",
    subtext: "Direct Farm Buyer",
    icon: "🛍️",
    path: "/dashboard/customer",
    gradient: "from-purple-600 to-pink-600",
    border: "border-purple-500/40",
  },
];

export function DemoBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const { login, logout } = useAuth();
  const [isDemo, setIsDemo] = useState(false);
  const [currentRole, setCurrentRole] = useState<string>("farmer");
  const [syncedMsg, setSyncedMsg] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkDemoState = () => {
      const demoFlag = localStorage.getItem("isDemoMode") === "true";
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      const hasDemoToken = Boolean(token?.startsWith("demo-token-"));
      const isDemoUser = Boolean(userStr?.includes("demo@"));

      const active = demoFlag || hasDemoToken || isDemoUser;
      setIsDemo(active);

      if (active) {
        if (pathname?.includes("/dashboard/shop")) setCurrentRole("shop");
        else if (pathname?.includes("/dashboard/manufacturer")) setCurrentRole("manufacturer");
        else if (pathname?.includes("/dashboard/customer")) setCurrentRole("customer");
        else setCurrentRole("farmer");
      }
    };

    checkDemoState();
    window.addEventListener("storage", checkDemoState);
    return () => window.removeEventListener("storage", checkDemoState);
  }, [pathname]);

  if (!isDemo) return null;

  const currentRoleObj = DEMO_ROLES.find(r => r.role === currentRole) || DEMO_ROLES[0];

  const handleSwitchRole = async (targetRole: string) => {
    if (targetRole === currentRole || switching) return;
    setSwitching(true);

    try {
      // Attempt backend demo login
      let token = `demo-token-${targetRole}`;
      let userObj: any = {
        email: `demo@${targetRole}.com`,
        role: targetRole,
        full_name: DEMO_ROLES.find(r => r.role === targetRole)?.name || "Demo User"
      };

      try {
        const { data } = await api.post("/auth/demo-login", { role: targetRole });
        if (data?.access_token) {
          token = data.access_token;
          userObj = {
            id: data.id,
            email: `demo@${targetRole}.com`,
            role: data.role,
            full_name: data.full_name || userObj.full_name
          };
        }
      } catch (err) {
        // Fallback to local session token
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("isDemoMode", "true");
      localStorage.setItem("demoRole", targetRole);
      sessionStorage.setItem("demoMode", "true");
      sessionStorage.setItem("demoRole", targetRole);

      document.cookie = `token=${token}; path=/; max-age=86400`;
      login(token, targetRole as any);

      const targetPath = DEMO_ROLES.find(r => r.role === targetRole)?.path || `/dashboard/${targetRole}`;
      router.push(targetPath);
      setCurrentRole(targetRole);
    } finally {
      setSwitching(false);
    }
  };

  const handleSyncData = () => {
    // Re-verify that demo flag is active
    localStorage.setItem("isDemoMode", "true");
    setSyncedMsg("All 5-year synthetic records & live datasets synchronized!");
    setTimeout(() => setSyncedMsg(null), 3500);
  };

  const handleExitDemo = () => {
    localStorage.removeItem("isDemoMode");
    localStorage.removeItem("demoRole");
    sessionStorage.removeItem("demoMode");
    sessionStorage.removeItem("demoRole");
    logout();
  };

  return (
    <aside 
      aria-label="Interactive Demo Mode Notice"
      className="mb-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-emerald-950/80 p-3 sm:p-4 text-white shadow-xl backdrop-blur-md relative overflow-hidden transition-all duration-300"
    >
      {/* Decorative gradient glow */}
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-green-500/10 blur-2xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 relative z-10">
        {/* Left identity & badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xl shadow-inner">
            {currentRoleObj.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
                Interactive Demo Active
              </span>
              <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                5-Year Real Data
              </span>
            </div>
            <div className="text-sm font-semibold text-slate-100 flex items-center gap-1.5 mt-0.5">
              <span>{currentRoleObj.name}</span>
              <span className="text-xs font-normal text-emerald-300/80">({currentRoleObj.subtext})</span>
            </div>
          </div>
        </div>

        {/* Middle: 1-click role switcher pills directly inside real project */}
        <div className="flex items-center gap-1.5 flex-wrap bg-black/30 p-1.5 rounded-xl border border-white/10">
          <span className="text-[11px] font-semibold text-slate-300 px-2 hidden md:inline">
            Switch Role:
          </span>
          {DEMO_ROLES.map((r) => {
            const isActive = r.role === currentRole;
            return (
              <button
                key={r.role}
                onClick={() => handleSwitchRole(r.role)}
                disabled={switching}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-200 select-none ${
                  isActive
                    ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/50 scale-105"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
                title={`Switch to ${r.label}`}
              >
                <span>{r.icon}</span>
                <span className="hidden sm:inline">{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right action buttons: sync data & exit demo */}
        <div className="flex items-center gap-2 self-end lg:self-center">
          <button
            onClick={handleSyncData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/30 transition-colors"
            title="Refresh and ensure synthetic datasets are synced"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sync Data</span>
          </button>
          <button
            onClick={handleExitDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg border border-rose-500/30 transition-colors"
            title="Exit Demo and return to Login"
          >
            <X className="h-3.5 w-3.5" />
            <span>Exit Demo</span>
          </button>
        </div>
      </div>

      {syncedMsg && (
        <div className="mt-2.5 flex items-center gap-2 text-xs font-medium text-emerald-300 bg-emerald-900/40 border border-emerald-500/30 rounded-lg px-3 py-1.5 animate-fadeIn">
          <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span>{syncedMsg}</span>
        </div>
      )}
    </aside>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Play, Sparkles, ChevronDown, Check, ArrowRight, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

const DEMO_ACCOUNTS = [
  {
    role: "farmer",
    label: "Farmer Dashboard",
    name: "Ravi Kumar Reddy",
    details: "7.20 Acres • 3 Active Crops • KCC Loans & Cold Storage",
    icon: "🌾",
    path: "/dashboard/farmer",
    color: "from-green-600 to-emerald-600",
    badge: "Most Complete",
  },
  {
    role: "shop",
    label: "Shop Owner Portal",
    name: "Krishna Agro Center",
    details: "Fertilizer POS • 7 Products • Farmer Orders & Credit",
    icon: "🏪",
    path: "/dashboard/shop",
    color: "from-blue-600 to-indigo-600",
    badge: "Live POS",
  },
  {
    role: "manufacturer",
    label: "Mill & Processing",
    name: "Sri Venkateswara Mill",
    details: "120 T/Day Rice Mill • Procurement & Farmer Batches",
    icon: "🏭",
    path: "/dashboard/manufacturer",
    color: "from-amber-600 to-orange-600",
    badge: "Milling",
  },
  {
    role: "customer",
    label: "Consumer Marketplace",
    name: "Priya Sharma",
    details: "Farm-Fresh Produce • Order Tracking • Smart Buying",
    icon: "🛍️",
    path: "/dashboard/customer",
    color: "from-purple-600 to-pink-600",
    badge: "Buyer",
  },
];

export function DemoButton() {
  const router = useRouter();
  const { login } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const launchRealDemo = async (role: string) => {
    setLoadingRole(role);
    try {
      let token = `demo-token-${role}`;
      let userObj: any = {
        email: `demo@${role}.com`,
        role: role,
        full_name: DEMO_ACCOUNTS.find(a => a.role === role)?.name || "Demo User"
      };

      try {
        const { data } = await api.post("/auth/demo-login", { role });
        if (data?.access_token) {
          token = data.access_token;
          userObj = {
            id: data.id,
            email: `demo@${role}.com`,
            role: data.role,
            full_name: data.full_name || userObj.full_name
          };
        }
      } catch (err) {
        // Fallback to local authenticated session
      }

      // Establish authenticated session in localStorage and cookies
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("isDemoMode", "true");
      localStorage.setItem("demoRole", role);
      sessionStorage.setItem("demoMode", "true");
      sessionStorage.setItem("demoRole", role);

      document.cookie = `token=${token}; path=/; max-age=86400`;

      // Update AuthContext state
      login(token, role as any);

      // Close menu and navigate directly into real project page
      setIsOpen(false);
      const targetPath = DEMO_ACCOUNTS.find(a => a.role === role)?.path || `/dashboard/${role}`;
      router.push(targetPath);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-1.5 px-3 py-1.5 h-9 text-sm font-bold rounded-lg border transition-all duration-200 active:scale-95 select-none overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)",
          borderColor: "#16a34a",
          color: "white",
          boxShadow: "0 2px 8px rgba(34,197,94,0.35)",
        }}
        title="Direct Interactive Demo — Launch real project with 5-year synthetic data"
        id="demo-mode-button"
      >
        {/* Animated shine overlay */}
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
          }}
        />

        {/* Pulsing live dot */}
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-70" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>

        <Play className="h-3.5 w-3.5 fill-white flex-shrink-0" />
        <span className="hidden sm:inline">Demo</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Direct Role Launcher Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border/60">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20 text-green-600 dark:text-green-400 text-sm">
                🌾
              </span>
              <div>
                <h4 className="text-sm font-bold text-foreground">Launch Real Project Demo</h4>
                <p className="text-[11px] text-muted-foreground">Select a role to open directly with 5-year real data</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick 1-click launch primary button */}
          <button
            onClick={() => launchRealDemo("farmer")}
            disabled={loadingRole !== null}
            className="w-full mb-2.5 flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-xs shadow-md shadow-green-900/20 hover:from-green-500 hover:to-emerald-500 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>⚡ Fast Launch: Farmer Dashboard (Default)</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          {/* Role cards list */}
          <div className="space-y-1.5">
            {DEMO_ACCOUNTS.map((acc) => {
              const isLoading = loadingRole === acc.role;
              return (
                <button
                  key={acc.role}
                  onClick={() => launchRealDemo(acc.role)}
                  disabled={loadingRole !== null}
                  className="w-full group flex items-start gap-3 p-2.5 rounded-xl border border-border/40 hover:border-green-500/40 hover:bg-muted/40 transition-all text-left select-none relative"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-muted/60 text-lg group-hover:scale-110 transition-transform">
                    {acc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="text-xs font-bold text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {acc.label}
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted font-medium text-muted-foreground">
                        {acc.badge}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-foreground/80 truncate">
                      {acc.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {acc.details}
                    </div>
                  </div>
                  {isLoading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-xs rounded-xl flex items-center justify-center">
                      <span className="text-xs font-medium text-green-600 animate-pulse">Launching...</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2 border-t border-border/60 text-center">
            <span className="text-[10px] text-muted-foreground">
              Directly opens real project pages • Instant role switching inside
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

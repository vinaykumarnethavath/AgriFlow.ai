"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Play, 
  Sparkles, 
  ChevronDown, 
  ArrowRight, 
  X, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Layers 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

interface DemoRoleConfig {
  role: string;
  label: string;
  name: string;
  details: string;
  icon: string;
  path: string;
  color: string;
  badge: string;
  badgeColor: string;
  stats: string[];
}

const DEMO_ACCOUNTS: DemoRoleConfig[] = [
  {
    role: "farmer",
    label: "Farmer Dashboard",
    name: "Ravi Kumar Reddy",
    details: "7.20 Acres • 14 Crop Seasons (2021–2026) • KCC Loan & PMFBY",
    icon: "🌾",
    path: "/dashboard/farmer",
    color: "from-emerald-600 to-green-700",
    badge: "5-Yr Farm Data",
    badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    stats: ["14 Crop Cycles", "₹18.5L Turnover", "Soil Health Cards", "KCC Loan Active"],
  },
  {
    role: "shop",
    label: "Shop Owner Portal",
    name: "Krishna Agro Center (Venkat Rao)",
    details: "15+ Products • 134 Orders (2021–2026) • 60 Months Accounting P&L",
    icon: "🏪",
    path: "/dashboard/shop",
    color: "from-blue-600 to-indigo-700",
    badge: "5-Yr Live POS",
    badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    stats: ["134 Orders", "15 Products", "60 Mo P&L", "Cash & UPI POS"],
  },
  {
    role: "manufacturer",
    label: "Mill & Processing Plant",
    name: "Sri Venkateswara Mill (Prasad Babu)",
    details: "120 T/Day Rice & Flour Mill • 5-Yr Procurement • 60+ Batches",
    icon: "🏭",
    path: "/dashboard/manufacturer",
    color: "from-amber-600 to-orange-700",
    badge: "5-Yr Milling",
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    stats: ["11 Procurements", "60+ Milling Batches", "210 Expenses", "SV Atta & Rice"],
  },
  {
    role: "customer",
    label: "Consumer Marketplace",
    name: "Priya Sharma",
    details: "Farm-Fresh Produce & Packaged Goods • 45+ Orders • Invoices",
    icon: "🛍️",
    path: "/dashboard/customer",
    color: "from-purple-600 to-pink-700",
    badge: "5-Yr Buyer",
    badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    stats: ["45+ Orders", "Grocery Invoices", "Verified Buyer", "Cart & Tracking"],
  },
];

const TIMELINE_YEARS = [
  { year: "2021", label: "Baseline" },
  { year: "2022", label: "Expansion" },
  { year: "2023", label: "Peak Yield" },
  { year: "2024", label: "Automation" },
  { year: "2025", label: "Diversified" },
  { year: "2026", label: "Active Live", active: true },
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
        className="group relative flex items-center gap-1.5 px-3 py-1.5 h-9 text-xs sm:text-sm font-bold rounded-lg border transition-all duration-200 active:scale-95 select-none overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
          borderColor: "#059669",
          color: "white",
          boxShadow: "0 2px 10px rgba(16, 185, 129, 0.35)",
        }}
        title="5-Year Demo — Multi-year dataset spanning 2021 to 2026 across 4 roles"
        id="demo-mode-button"
        aria-label="Toggle 5-Year Demo Menu"
      >
        {/* Animated shine overlay */}
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
          }}
        />

        {/* Pulsing live dot */}
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>

        <Play className="h-3.5 w-3.5 fill-white flex-shrink-0" />
        <span>5-Yr Demo</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Direct Role Launcher Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[440px] rounded-2xl bg-card/98 backdrop-blur-xl border border-border shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between pb-3 mb-2.5 border-b border-border/70">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-lg border border-emerald-500/30">
                🌾
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-foreground">5-Year Live Demo</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                    2021 – 2026
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Full multi-year records across all 4 connected roles
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/60 transition-colors"
              aria-label="Close demo menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 5-Year Timeline Pill Bar */}
          <div className="mb-3 p-2.5 rounded-xl bg-muted/40 border border-border/60">
            <div className="flex items-center justify-between text-[11px] font-semibold text-foreground mb-1.5">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>Historical Timeline</span>
              </span>
              <span className="text-[10px] text-muted-foreground">5 Active Years</span>
            </div>
            
            {/* Timeline progression bar */}
            <div className="grid grid-cols-6 gap-1 text-center">
              {TIMELINE_YEARS.map((item) => (
                <div
                  key={item.year}
                  className={`py-1 px-0.5 rounded-md border text-[10px] transition-colors ${
                    item.active
                      ? "bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs"
                      : "bg-background/80 text-foreground/80 border-border/60"
                  }`}
                >
                  <div className="font-bold leading-tight">{item.year}</div>
                  <div className={`text-[8px] truncate ${item.active ? "text-emerald-100" : "text-muted-foreground"}`}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick 1-click launch primary button */}
          <button
            onClick={() => launchRealDemo("farmer")}
            disabled={loadingRole !== null}
            className="w-full mb-3 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-200" />
              <span>⚡ Fast 1-Click: Ravi Kumar (Farmer Portal)</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-emerald-200" />
          </button>

          {/* Role cards list */}
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const isLoading = loadingRole === acc.role;
              return (
                <button
                  key={acc.role}
                  onClick={() => launchRealDemo(acc.role)}
                  disabled={loadingRole !== null}
                  className="w-full group flex flex-col p-2.5 rounded-xl border border-border/60 hover:border-emerald-500/50 hover:bg-muted/40 transition-all text-left select-none relative bg-card/60"
                >
                  <div className="flex items-start gap-2.5 w-full">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-muted/80 text-xl group-hover:scale-110 transition-transform border border-border/40">
                      {acc.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {acc.label}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${acc.badgeColor}`}>
                          {acc.badge}
                        </span>
                      </div>
                      
                      <div className="text-[12px] font-semibold text-foreground/90 mt-0.5 truncate">
                        {acc.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                        {acc.details}
                      </div>
                    </div>
                  </div>

                  {/* 5-year Stat pills per role */}
                  <div className="mt-2 pt-2 border-t border-border/40 flex flex-wrap gap-1">
                    {acc.stats.map((st, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.5 rounded-md bg-muted/70 text-foreground/75 font-medium border border-border/30"
                      >
                        {st}
                      </span>
                    ))}
                  </div>

                  {isLoading && (
                    <div className="absolute inset-0 bg-background/90 backdrop-blur-xs rounded-xl flex items-center justify-center z-10">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 animate-pulse">
                        <Sparkles className="h-4 w-4" />
                        <span>Launching 5-Year Session...</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2.5 border-t border-border/70 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Password: <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">demo123</code>
            </span>
            <span>Switch roles anytime inside</span>
          </div>
        </div>
      )}
    </div>
  );
}

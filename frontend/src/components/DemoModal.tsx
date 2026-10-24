"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  DEMO_ROLE_CONFIGS,
  DemoRoleConfig,
  farmerDemoData,
  shopDemoData,
  manufacturerDemoData,
  customerDemoData,
  resolveDemoApiResponse,
} from "@/lib/demoData";
import {
  X,
  Play,
  ChevronRight,
  Zap,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Database,
  Layers,
  Copy,
  Check,
  Calendar,
  CloudRain,
  Sprout,
  DollarSign,
  ShieldAlert,
} from "lucide-react";
import api from "@/lib/api";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  delivered: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  out_for_delivery: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
  received: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
  in_transit: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
};

const trendIcon = (trend: string) => (trend === "up" ? "↑" : trend === "down" ? "↓" : "→");
const trendColor = (trend: string) =>
  trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-gray-500";

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [selectedRole, setSelectedRole] = useState<DemoRoleConfig | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "features" | "5-year-data" | "api-explorer">("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setSelectedRole(null);
      setActiveTab("overview");
      setError("");
    }
  }, [isOpen]);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDemoLogin = async (role: DemoRoleConfig) => {
    setError("");
    setLoading(true);
    localStorage.setItem("isDemoMode", "true");
    localStorage.setItem("demoRole", role.id);
    try {
      const { data } = await api.post("/auth/demo-login", { role: role.id });
      const user = {
        id: data.id,
        email: role.demoUser.email || `demo@${role.id}.com`,
        role: data.role,
        full_name: data.full_name || role.demoUser.full_name,
        phone_number: role.demoUser.phone_number,
      };
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", data.access_token);
      login(data.access_token, data.role);
      onClose();
      router.push(`/dashboard/${data.role}`);
    } catch (err: any) {
      // Fallback: set demo user locally
      const user = {
        id: role.demoUser.id,
        email: role.demoUser.email || `demo@${role.id}.com`,
        role: role.id,
        full_name: role.demoUser.full_name,
        phone_number: role.demoUser.phone_number,
      };
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", "demo-token-" + role.id);
      login("demo-token-" + role.id, role.id as any);
      onClose();
      router.push(`/dashboard/${role.id}`);
    }
  };

  const handleNavigate = async (href: string) => {
    if (selectedRole) {
      localStorage.setItem("isDemoMode", "true");
      localStorage.setItem("demoRole", selectedRole.id);
      try {
        const { data } = await api.post("/auth/demo-login", { role: selectedRole.id });
        const user = {
          id: data.id,
          email: selectedRole.demoUser.email || `demo@${selectedRole.id}.com`,
          role: data.role,
          full_name: data.full_name || selectedRole.demoUser.full_name,
        };
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", data.access_token);
        login(data.access_token, data.role);
      } catch (err: any) {
        const fallbackUser = {
          id: selectedRole.demoUser.id,
          email: selectedRole.demoUser.email || `demo@${selectedRole.id}.com`,
          role: selectedRole.id,
          full_name: selectedRole.demoUser.full_name,
          phone_number: selectedRole.demoUser.phone_number,
        };
        localStorage.setItem("user", JSON.stringify(fallbackUser));
        localStorage.setItem("token", "demo-token-" + selectedRole.id);
        login("demo-token-" + selectedRole.id, selectedRole.id as any);
      }
    }
    onClose();
    router.push(href);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(10px)" }}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] bg-card rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-5 sm:p-6 text-white flex-shrink-0">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🌾</span>
                <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/30 tracking-wider">
                  LIVE DEMO EXPERIENCE
                </span>
                <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  5-YEAR REALISTIC DATA
                </span>
              </div>
              <h2 className="text-2xl font-bold">Explore AgriFlow with Realistic Demo Data</h2>
              <p className="text-green-100 text-xs sm:text-sm mt-0.5">
                {selectedRole
                  ? `Active Role: ${selectedRole.label} — Explore all ${selectedRole.features.length} connected features, 5-year history, and live API schemas`
                  : "Select a role to preview all real features, connected links, 5-year data & API mocks"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
              title="Close Demo"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Role selector pills */}
          <div className="relative flex gap-2 mt-4 flex-wrap">
            {DEMO_ROLE_CONFIGS.map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRole(role);
                  setActiveTab("overview");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  selectedRole?.id === role.id
                    ? "bg-white text-green-700 shadow-lg scale-105"
                    : "bg-white/15 text-white hover:bg-white/25 border border-white/20"
                }`}
              >
                <span>{role.icon}</span>
                <span>{role.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          {!selectedRole ? (
            /* ── Role Cards Grid ── */
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEMO_ROLE_CONFIGS.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`text-left p-5 rounded-2xl border-2 ${role.borderColor} ${role.bgColor} hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 group cursor-pointer`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-2xl shadow-md`}
                    >
                      {role.icon}
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg ${role.color}`}>{role.label}</h3>
                      <p className="text-xs text-muted-foreground">{role.subtitle}</p>
                    </div>
                    <ChevronRight
                      className={`ml-auto h-5 w-5 ${role.color} opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all`}
                    />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {role.stats.map((stat) => (
                      <div key={stat.label} className="bg-background/60 dark:bg-background/40 rounded-lg p-2 border border-border/50">
                        <div className="text-base">{stat.icon}</div>
                        <div className="font-bold text-sm text-foreground">{stat.value}</div>
                        <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Feature count */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    <span className="text-xs text-muted-foreground">{role.features.length} connected features</span>
                    <span className={`text-xs font-bold ${role.color} flex items-center gap-1`}>
                      <Play className="h-3 w-3 fill-current" /> Explore Role
                    </span>
                  </div>
                </button>
              ))}

              {/* Info banner */}
              <div className="col-span-full bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 p-4 flex items-center gap-3">
                <Zap className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    Full 5-Year Realistic History & Connected Links Included
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Farmer profile, land records, APMC mandi rates, 7-day weather & soil NPK, chats, 5-year yields & revenue, shop inventory, mill batches, and customer smart buying.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ── Role Detail View ── */
            <div className="flex flex-col h-full">
              {/* Navigation Tabs */}
              <div className="border-b border-border bg-muted/40 px-6 flex gap-1 overflow-x-auto flex-shrink-0">
                {[
                  { id: "overview", label: "Overview & Profile", icon: "👤" },
                  { id: "features", label: `All Features (${selectedRole.features.length})`, icon: "🔗" },
                  { id: "5-year-data", label: "5-Year History (2021-2026)", icon: "📈" },
                  { id: "api-explorer", label: "Live API Explorer", icon: "⚡" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      activeTab === t.id
                        ? "border-green-600 text-green-700 dark:text-green-400 bg-background/50"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                {/* ── 1. OVERVIEW TAB ── */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Profile card */}
                    <div className={`${selectedRole.bgColor} rounded-2xl border ${selectedRole.borderColor} p-5`}>
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedRole.gradient} flex items-center justify-center text-3xl shadow-lg`}
                        >
                          {selectedRole.icon}
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold ${selectedRole.color}`}>{selectedRole.demoUser.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{selectedRole.subtitle}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-background/80 px-2 py-0.5 rounded-full border border-border font-medium">
                              Demo Account
                            </span>
                            <span className={`text-xs ${selectedRole.color} font-semibold capitalize`}>
                              Role: {selectedRole.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        {selectedRole.stats.map((stat) => (
                          <div key={stat.label} className="bg-background/70 dark:bg-background/40 rounded-xl p-3 text-center border border-border/50">
                            <div className="text-xl mb-1">{stat.icon}</div>
                            <div className="font-bold text-foreground text-sm">{stat.value}</div>
                            <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Launch Cards */}
                    <div>
                      <h4 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        Top Connected Features — Click to open directly
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {selectedRole.features.slice(0, 6).map((feature) => (
                          <button
                            key={feature.href}
                            onClick={() => handleNavigate(feature.href)}
                            className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-green-500 transition-all text-left group cursor-pointer"
                          >
                            <span className="text-2xl">{feature.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-foreground truncate">{feature.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{feature.description}</p>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Launch button */}
                    {error && (
                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                        {error}
                      </div>
                    )}
                    <button
                      onClick={() => handleDemoLogin(selectedRole)}
                      disabled={loading}
                      className={`w-full bg-gradient-to-r ${selectedRole.gradient} text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer text-base`}
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Launching {selectedRole.label} Dashboard...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 fill-white" />
                          Enter & Explore as {selectedRole.label}
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* ── 2. ALL FEATURES TAB ── */}
                {activeTab === "features" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Clicking any feature below will auto-login as <strong className="text-foreground">{selectedRole.label}</strong> and take you straight to that screen.
                      </p>
                      <span className="text-xs font-bold bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 px-2 py-0.5 rounded-md">
                        {selectedRole.features.length} Routes
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedRole.features.map((feature) => (
                        <button
                          key={feature.href}
                          onClick={() => handleNavigate(feature.href)}
                          className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-green-500 hover:shadow-sm transition-all text-left group cursor-pointer"
                        >
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedRole.gradient} flex items-center justify-center text-lg flex-shrink-0 shadow-xs`}
                          >
                            {feature.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-foreground">{feature.name}</p>
                              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                                {feature.href.replace("/dashboard/", "")}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{feature.description}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── 3. 5-YEAR HISTORICAL DATA TAB ── */}
                {activeTab === "5-year-data" && (
                  <FiveYearDataTab role={selectedRole} />
                )}

                {/* ── 4. LIVE API EXPLORER TAB ── */}
                {activeTab === "api-explorer" && (
                  <ApiExplorerTab role={selectedRole} />
                )}
              </div>

              {/* Bottom action */}
              <div className="border-t border-border p-4 bg-muted/30 flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => setSelectedRole(null)}
                  className="px-4 py-2 rounded-xl border border-border text-xs sm:text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
                >
                  ← All Roles
                </button>
                <button
                  onClick={() => handleDemoLogin(selectedRole)}
                  disabled={loading}
                  className={`flex-1 bg-gradient-to-r ${selectedRole.gradient} text-white py-2.5 rounded-xl font-bold shadow hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-xs sm:text-sm cursor-pointer`}
                >
                  {loading ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Launching...
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-white" />
                      Launch Full {selectedRole.label} Dashboard
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 5-Year Data Component ──────────────────────────────────────────────────────
function FiveYearDataTab({ role }: { role: DemoRoleConfig }) {
  if (role.id === "farmer") {
    const d = farmerDemoData;
    return (
      <div className="space-y-6">
        <div className="bg-green-50/70 dark:bg-green-950/30 p-3.5 rounded-xl border border-green-200 dark:border-green-800 text-xs text-green-800 dark:text-green-300">
          🌾 <strong>Farmer 5-Year History (2021-2026):</strong> Comprehensive historical progression for Ravi Kumar Reddy across 3 active crops (Paddy, Cotton, Maize), APMC mandi price indices, and soil health chemistry.
        </div>

        {/* 1. Annual Revenue vs Expense */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span>💰</span> Annual Revenue vs Expenses (2021-2026)
          </h4>
          <div className="space-y-2.5">
            {d.annualYield.map((y) => {
              const netProfit = y.totalRevenue - y.expenses;
              return (
                <div key={y.year} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-foreground">{y.year}</span>
                    <span className="text-green-600 font-bold">Net Profit: ₹{(netProfit / 1000).toFixed(0)}K</span>
                    <span className="text-muted-foreground">Rev: ₹{(y.totalRevenue / 1000).toFixed(0)}K · Exp: ₹{(y.expenses / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${(y.totalRevenue / 350000) * 100}%` }}
                      title={`Revenue: ₹${y.totalRevenue}`}
                    />
                    <div
                      className="bg-red-400 h-full opacity-80"
                      style={{ width: `${(y.expenses / 350000) * 100}%` }}
                      title={`Expenses: ₹${y.expenses}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Crop Yield Trends Table */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3 overflow-x-auto">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span>🌾</span> 5-Year Yield History by Crop (Tons per Acre)
          </h4>
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2">Year</th>
                <th className="py-2">Paddy BPT-5204 (T/Ac)</th>
                <th className="py-2">Cotton Bunny BT (T/Ac)</th>
                <th className="py-2">Maize (T/Ac)</th>
                <th className="py-2">Total Harvest</th>
              </tr>
            </thead>
            <tbody>
              {d.annualYield.map((row) => (
                <tr key={row.year} className="border-b border-border/50 hover:bg-muted/40">
                  <td className="py-2 font-bold text-foreground">{row.year}</td>
                  <td className="py-2 text-green-700 dark:text-green-400 font-medium">{row.paddy} T</td>
                  <td className="py-2 text-blue-700 dark:text-blue-400 font-medium">{row.cotton} T</td>
                  <td className="py-2 text-amber-700 dark:text-amber-400 font-medium">{row.maize} T</td>
                  <td className="py-2 font-bold text-foreground">{(row.paddy * 3.1 + row.cotton * 2.3 + row.maize * 1.8).toFixed(1)} Tons</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. Mandi Price Progression */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3 overflow-x-auto">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span>📊</span> 5-Year APMC Mandi Benchmark Prices (₹ / Quintal)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
            {d.priceTrend.map((pt) => (
              <div key={pt.year} className="bg-muted/40 p-2.5 rounded-lg border border-border/50">
                <div className="font-bold text-xs text-foreground mb-1">{pt.year}</div>
                <div className="text-[11px] text-green-700 dark:text-green-400 font-semibold">Paddy: ₹{pt.paddy}</div>
                <div className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold">Cotton: ₹{pt.cotton}</div>
                <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">Maize: ₹{pt.maize}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Soil Health 5-Year Progression */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span>🧪</span> 5-Year Soil NPK & pH Quality Logs
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
            {d.soilHealth.history.map((sh) => (
              <div key={sh.year} className="bg-muted/40 p-2 rounded-lg border border-border/50">
                <div className="font-bold text-xs text-foreground">{sh.year}</div>
                <div className="text-[10px] text-muted-foreground mt-1">N: {sh.n} kg/ha</div>
                <div className="text-[10px] text-muted-foreground">P: {sh.p} kg/ha</div>
                <div className="text-[10px] text-muted-foreground">K: {sh.k} kg/ha</div>
                <div className="text-[10px] font-bold text-emerald-600">pH: {sh.ph}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (role.id === "shop") {
    const d = shopDemoData;
    return (
      <div className="space-y-6">
        <div className="bg-blue-50/70 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
          🏪 <strong>Shop Owner 5-Year Metrics (2021-2026):</strong> Commercial retail performance for Krishna Agro Center.
        </div>
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span>💹</span> 5-Year Revenue, Profit, and Farmer Customers
          </h4>
          <div className="space-y-3">
            {d.annualSales.map((y) => (
              <div key={y.year} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{y.year}</span>
                  <span className="text-blue-600 font-bold">Revenue: ₹{(y.revenue / 100000).toFixed(1)} Lakhs</span>
                  <span className="text-green-600">Profit: ₹{(y.profit / 100000).toFixed(1)}L · {y.customers} Farmers</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden bg-muted">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full"
                    style={{ width: `${(y.revenue / 4000000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (role.id === "manufacturer") {
    const d = manufacturerDemoData;
    return (
      <div className="space-y-6">
        <div className="bg-amber-50/70 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
          🏭 <strong>Mill Owner 5-Year Metrics (2021-2026):</strong> Sri Venkateswara Rice & Cotton Mill production and B2B dispatches.
        </div>
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span>⚙️</span> 5-Year Milling Volume & Turnover
          </h4>
          <div className="space-y-3">
            {d.annualProduction.map((y) => (
              <div key={y.year} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{y.year}</span>
                  <span className="text-amber-700 dark:text-amber-400 font-bold">Rice: {y.rice_tons.toLocaleString()} T · Cotton: {y.cotton_tons.toLocaleString()} T</span>
                  <span className="text-green-600">Turnover: ₹{(y.revenue / 10000000).toFixed(2)} Cr</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden bg-muted">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full"
                    style={{ width: `${(y.rice_tons / 5200) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (role.id === "customer") {
    const d = customerDemoData;
    return (
      <div className="space-y-6">
        <div className="bg-purple-50/70 dark:bg-purple-950/30 p-3.5 rounded-xl border border-purple-200 dark:border-purple-800 text-xs text-purple-800 dark:text-purple-300">
          🛍️ <strong>Customer 5-Year Spending & Savings (2021-2026):</strong> Priya Sharma direct farm purchasing records.
        </div>
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span>💳</span> 5-Year Annual Purchases and Orders
          </h4>
          <div className="space-y-3">
            {d.spendingHistory.map((y) => (
              <div key={y.year} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{y.year}</span>
                  <span className="text-purple-600 font-bold">Spend: ₹{y.amount.toLocaleString("en-IN")}</span>
                  <span className="text-muted-foreground">{y.orders} Orders placed</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden bg-muted">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full"
                    style={{ width: `${(y.amount / 20000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ── Live API Explorer Component ────────────────────────────────────────────────
function ApiExplorerTab({ role }: { role: DemoRoleConfig }) {
  const endpointsByRole: Record<string, { name: string; url: string; method: string }[]> = {
    farmer: [
      { name: "Farmer Profile", url: "/farmer/profile", method: "GET" },
      { name: "My Active Crops", url: "/crops/", method: "GET" },
      { name: "Weather & Soil Live", url: "/weather/", method: "GET" },
      { name: "Agricultural News", url: "/news/", method: "GET" },
      { name: "Live Mandi Prices", url: "/market-prices/", method: "GET" },
      { name: "Community Channels", url: "/community/channels", method: "GET" },
      { name: "Community Messages", url: "/community/messages", method: "GET" },
      { name: "Finance & Loans", url: "/farmer/finance", method: "GET" },
      { name: "My Input Orders", url: "/orders/my-orders", method: "GET" },
      { name: "AI Crop Doctor", url: "/farmer/crop-health", method: "GET" },
    ],
    shop: [
      { name: "Shop Profile", url: "/shop/profile", method: "GET" },
      { name: "Inventory Stock", url: "/shop/inventory", method: "GET" },
      { name: "Recent Orders", url: "/shop/orders", method: "GET" },
      { name: "Sales Analytics", url: "/shop/analytics", method: "GET" },
      { name: "Farmer Customers", url: "/shop/customers", method: "GET" },
    ],
    manufacturer: [
      { name: "Mill Profile", url: "/manufacturer/profile", method: "GET" },
      { name: "Production Batches", url: "/manufacturer/production", method: "GET" },
      { name: "Raw Material Silos", url: "/manufacturer/inventory", method: "GET" },
      { name: "Farmer Purchases", url: "/manufacturer/purchases", method: "GET" },
      { name: "B2B Sales Dispatches", url: "/manufacturer/sales", method: "GET" },
      { name: "AI Market Intelligence", url: "/manufacturer/intelligence", method: "GET" },
    ],
    customer: [
      { name: "Customer Profile", url: "/customer/profile", method: "GET" },
      { name: "Marketplace Feed", url: "/marketplace", method: "GET" },
      { name: "Order History", url: "/customer/orders", method: "GET" },
      { name: "Smart Buying Deals", url: "/customer/smart-buying", method: "GET" },
      { name: "Cart Items", url: "/customer/cart", method: "GET" },
    ],
  };

  const endpoints = endpointsByRole[role.id] || [];
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0] || null);
  const [copied, setCopied] = useState(false);

  const responseData = selectedEndpoint ? resolveDemoApiResponse(selectedEndpoint.url, selectedEndpoint.method) : null;
  const jsonString = JSON.stringify(responseData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-foreground">Interactive API Data Explorer</h4>
          <p className="text-xs text-muted-foreground">
            Inspect the exact JSON payload served for each endpoint when running in demo mode.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 px-2 py-0.5 rounded font-bold">
            HTTP 200 OK
          </span>
          <span className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded">
            ~18ms
          </span>
        </div>
      </div>

      {/* Endpoint Selector Pills */}
      <div className="flex gap-1.5 flex-wrap">
        {endpoints.map((ep) => (
          <button
            key={ep.url}
            onClick={() => setSelectedEndpoint(ep)}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
              selectedEndpoint?.url === ep.url
                ? "bg-foreground text-background font-bold shadow-xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <span className="text-[10px] text-green-600 font-mono mr-1">GET</span>
            {ep.name}
          </button>
        ))}
      </div>

      {/* URL Banner & Copy */}
      <div className="flex items-center justify-between bg-muted/60 p-2.5 rounded-lg border border-border text-xs font-mono">
        <span className="truncate">
          <strong className="text-green-600">GET</strong> {selectedEndpoint?.url}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded bg-background border border-border text-[11px] font-sans hover:bg-muted transition-colors cursor-pointer"
        >
          {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? "Copied" : "Copy JSON"}</span>
        </button>
      </div>

      {/* JSON Viewer */}
      <div className="relative bg-zinc-950 text-zinc-100 rounded-xl p-4 font-mono text-xs max-h-80 overflow-auto border border-zinc-800 shadow-inner">
        <pre className="whitespace-pre-wrap">{jsonString}</pre>
      </div>
    </div>
  );
}

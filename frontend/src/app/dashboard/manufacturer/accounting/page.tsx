"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    getMillAccountingSummary, getMillExpenses, addMillExpense, deleteMillExpense,
    MillAccountingSummary, MillExpense
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Wallet, TrendingUp, TrendingDown, IndianRupee, Plus, Trash2,
    ArrowUpRight, CheckCircle2, X, RefreshCw, Activity
} from "lucide-react";

const PERIOD_OPTIONS = [
    { label: "Today", value: "today" },
    { label: "Week", value: "7d" },
    { label: "Month", value: "30d" },
    { label: "3 Months", value: "90d" },
    { label: "Year", value: "1y" },
    { label: "All", value: "all" },
];

const EXPENSE_CATEGORIES = [
    { value: "wages", label: "👷 Labour & Wages", color: "bg-indigo-100 text-indigo-700" },
    { value: "electricity", label: "⚡ Electricity / Power", color: "bg-yellow-100 text-yellow-700" },
    { value: "maintenance", label: "🔧 Maintenance & Repairs", color: "bg-orange-100 text-orange-700" },
    { value: "packaging", label: "📦 Packaging Materials", color: "bg-pink-100 text-pink-700" },
    { value: "transport", label: "🚛 Transport / Logistics", color: "bg-cyan-100 text-cyan-700" },
    { value: "other", label: "📋 Other", color: "bg-gray-100 text-gray-700" },
];

const getCategoryInfo = (cat: string) =>
    EXPENSE_CATEGORIES.find(c => c.value === cat) || { value: cat, label: cat, color: "bg-gray-100 text-gray-700" };

export default function MillAccountingPage() {
    const [period, setPeriod] = useState("30d");
    const [summary, setSummary] = useState<MillAccountingSummary | null>(null);
    const [expenses, setExpenses] = useState<MillExpense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<{ category: string; amount: number } | null>(null);
    const [newExpense, setNewExpense] = useState({
        category: "wages",
        amount: 0,
        description: "",
        expense_date: new Date().toISOString().split("T")[0],
    });

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [sum, exp] = await Promise.all([
                getMillAccountingSummary(period).catch(() => null),
                getMillExpenses(period).catch(() => []),
            ]);
            setSummary(sum);
            setExpenses(exp as MillExpense[]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleAddExpense = async () => {
        if (newExpense.amount <= 0) return;
        setSaving(true);
        try {
            await addMillExpense(newExpense);
            setLastSaved({ category: newExpense.category, amount: newExpense.amount });
            setShowAddExpense(false);
            setNewExpense({ category: "wages", amount: 0, description: "", expense_date: new Date().toISOString().split("T")[0] });
            await fetchAll();
        } catch (e) {
            console.error(e);
            alert("Failed to add expense");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteExpense = async (id: number) => {
        if (!confirm("Delete this expense?")) return;
        try {
            await deleteMillExpense(id);
            await fetchAll();
        } catch (e) {
            console.error(e);
        }
    };

    const profitColor = (summary?.net_profit ?? 0) >= 0 ? "text-emerald-600" : "text-red-600";
    const profitBg = (summary?.net_profit ?? 0) >= 0 ? "border-l-emerald-500" : "border-l-red-500";

    if (loading && !summary) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start flex-wrap gap-3">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                            Mill Accounting & P&L
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Track all expenses and calculate net profit from mill operations.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex border rounded-lg overflow-hidden">
                            {PERIOD_OPTIONS.map(opt => (
                                <button key={opt.value} onClick={() => setPeriod(opt.value)}
                                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === opt.value ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <button onClick={fetchAll}
                            className="flex items-center gap-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 font-medium">
                            <RefreshCw className="h-3.5 w-3.5" /> Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Post-save banner */}
            {lastSaved && (
                <div className="bg-green-50 border border-green-300 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <p className="font-semibold text-green-800 flex-1">
                        ✅ ₹{lastSaved.amount.toLocaleString()} expense saved under "{getCategoryInfo(lastSaved.category).label}"
                    </p>
                    <button onClick={() => setLastSaved(null)}><X className="h-4 w-4 text-green-600" /></button>
                </div>
            )}

            {/* Big-Number Header Row — Revenue / Purchase / Processing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-purple-700">Total Revenue</p>
                            <div className="bg-purple-100 p-2.5 rounded-xl"><TrendingUp className="h-5 w-5 text-purple-600" /></div>
                        </div>
                        <p className="text-4xl font-extrabold text-purple-800">₹{(summary?.total_revenue || 0).toLocaleString()}</p>
                        <p className="text-xs text-purple-500 mt-2 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> {summary?.total_sales_count || 0} sales · avg ₹{(summary?.avg_sale_value || 0).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-orange-700">Purchase Cost</p>
                            <div className="bg-orange-100 p-2.5 rounded-xl"><TrendingDown className="h-5 w-5 text-orange-600" /></div>
                        </div>
                        <p className="text-4xl font-extrabold text-orange-800">₹{(summary?.total_purchase_cost || 0).toLocaleString()}</p>
                        <p className="text-xs text-orange-500 mt-2">Raw materials bought from farmers</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-cyan-50 to-sky-50 border-cyan-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-cyan-700">Processing Cost</p>
                            <div className="bg-cyan-100 p-2.5 rounded-xl"><Activity className="h-5 w-5 text-cyan-600" /></div>
                        </div>
                        <p className="text-4xl font-extrabold text-cyan-800">₹{(summary?.total_processing_cost || 0).toLocaleString()}</p>
                        <p className="text-xs text-cyan-500 mt-2">From all production batches</p>
                    </CardContent>
                </Card>
            </div>

            {/* Expenses + Net Profit Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-red-700">Other Expenses</p>
                            <div className="bg-red-100 p-2.5 rounded-xl"><Wallet className="h-5 w-5 text-red-600" /></div>
                        </div>
                        <p className="text-4xl font-extrabold text-red-700">₹{(summary?.total_expenses || 0).toLocaleString()}</p>
                        <p className="text-xs text-red-400 mt-2">Wages, electricity, maintenance…</p>
                    </CardContent>
                </Card>
                <Card className={`md:col-span-2 hover:shadow-md transition-shadow ${(summary?.net_profit ?? 0) >= 0 ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200" : "bg-gradient-to-br from-red-50 to-rose-50 border-red-300"}`}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className={`text-base font-semibold ${profitColor}`}>Net Profit / Loss</p>
                            <IndianRupee className={`h-5 w-5 ${profitColor}`} />
                        </div>
                        <p className={`text-5xl font-extrabold ${profitColor}`}>₹{Math.abs(summary?.net_profit || 0).toLocaleString()}</p>
                        <div className="mt-3 flex items-center gap-6 text-xs text-gray-500 flex-wrap">
                            <span>Revenue <strong className="text-purple-700">₹{(summary?.total_revenue || 0).toLocaleString()}</strong></span>
                            <span>− Costs <strong className="text-red-600">₹{((summary?.total_purchase_cost || 0) + (summary?.total_processing_cost || 0) + (summary?.total_expenses || 0)).toLocaleString()}</strong></span>
                            <span>= <strong className={profitColor}>₹{(summary?.net_profit || 0).toLocaleString()}</strong></span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Expense Breakdown — Category Metric Cards */}
            {summary && Object.keys(summary.expense_by_category).length > 0 && (
                <Card>
                    <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> Expense Breakdown by Category</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {Object.entries(summary.expense_by_category).map(([cat, amt]) => {
                                const info = getCategoryInfo(cat);
                                const pct = summary.total_expenses > 0 ? ((amt as number) / summary.total_expenses * 100).toFixed(0) : 0;
                                return (
                                    <div key={cat} className={`${info.color} rounded-xl p-3 border text-center`}>
                                        <p className="text-xs font-medium mb-1 truncate">{info.label.replace(/^[^\s]+ /, "")}</p>
                                        <p className="text-lg font-bold">₹{(amt as number).toLocaleString()}</p>
                                        <p className="text-xs opacity-70 mt-0.5">{pct}% of expenses</p>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Add Expense */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                        <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add Expense</span>
                        <button onClick={() => setShowAddExpense(v => !v)}
                            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                            {showAddExpense ? "Cancel" : "+ Add"}
                        </button>
                    </CardTitle>
                </CardHeader>
                {showAddExpense && (
                    <CardContent className="border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                                <select
                                    value={newExpense.category}
                                    onChange={e => setNewExpense(p => ({ ...p, category: e.target.value }))}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    {EXPENSE_CATEGORIES.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹)</label>
                                <input type="number" min={0}
                                    value={newExpense.amount || ""}
                                    onChange={e => setNewExpense(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                                <input type="date"
                                    value={newExpense.expense_date}
                                    onChange={e => setNewExpense(p => ({ ...p, expense_date: e.target.value }))}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
                                <input type="text"
                                    value={newExpense.description}
                                    onChange={e => setNewExpense(p => ({ ...p, description: e.target.value }))}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Notes…"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button onClick={handleAddExpense} disabled={saving || newExpense.amount <= 0}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                                {saving ? "Saving…" : "Save Expense"}
                            </button>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Expense Log */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Wallet className="w-4 h-4 text-blue-500" /> Expense Log
                        <span className="ml-auto text-xs font-normal text-gray-400">{expenses.length} entries</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {expenses.length === 0 ? (
                        <div className="px-6 py-10 text-center text-gray-400 text-sm">No expenses recorded for this period.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                                    <tr>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3">Description</th>
                                        <th className="px-6 py-3 text-right">Amount</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {expenses.map(e => {
                                        const info = getCategoryInfo(e.category);
                                        return (
                                            <tr key={e.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${info.color}`}>{info.label}</span>
                                                </td>
                                                <td className="px-6 py-3 text-gray-600">{e.description || "—"}</td>
                                                <td className="px-6 py-3 text-right font-bold text-red-600">₹{e.amount.toLocaleString()}</td>
                                                <td className="px-6 py-3 text-gray-500">{new Date(e.expense_date).toLocaleDateString("en-IN")}</td>
                                                <td className="px-6 py-3 text-right">
                                                    <button onClick={() => handleDeleteExpense(e.id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

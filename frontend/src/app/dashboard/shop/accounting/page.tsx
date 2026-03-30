"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Wallet, Package, Plus, Trash2, Receipt, ArrowUpRight, CheckCircle2, X, Info
} from "lucide-react";
import api from "@/lib/api";
import { getDraftBatches, DraftBatch } from "@/lib/api";

const PERIOD_OPTIONS = [
    { label: "Today", value: "today" },
    { label: "Week", value: "7d" },
    { label: "Month", value: "30d" },
    { label: "3 Months", value: "90d" },
    { label: "Year", value: "1y" },
    { label: "All", value: "all" },
];

const EXPENSE_CATEGORIES = [
    { value: "rent", label: "🏪 Rent", color: "bg-purple-100 text-purple-700", isBatch: false },
    { value: "wages", label: "👷 Regular Wages", color: "bg-indigo-100 text-indigo-700", isBatch: false },
    { value: "batch_transport", label: "🚛 Batch Transport", color: "bg-cyan-100 text-cyan-700", isBatch: true },
    { value: "batch_labour", label: "💪 Batch Unloading Labour", color: "bg-orange-100 text-orange-700", isBatch: true },
    { value: "batch_other", label: "📦 Batch Other Cost", color: "bg-pink-100 text-pink-700", isBatch: true },
    { value: "utilities", label: "⚡ Utilities", color: "bg-yellow-100 text-yellow-700", isBatch: false },
    { value: "other", label: "📋 Other", color: "bg-gray-100 text-gray-700", isBatch: false },
];

const PURCHASE_CATEGORY = { value: "batch_purchase", label: "🧾 Purchase Cost", color: "bg-blue-100 text-blue-800", isBatch: false };

interface AccountingSummary {
    period: string;
    total_revenue: number;
    total_cost: number;
    total_order_expenses: number;
    total_business_expenses: number;
    net_profit: number;
    total_orders: number;
    completed_orders: number;
    pending_orders: number;
    cancelled_orders: number;
    avg_order_value: number;
    expense_by_category: Record<string, number>;
}

interface BusinessExpense {
    id: number;
    category: string;
    amount: number;
    description: string | null;
    expense_date: string;
    created_at: string;
    linked_product_ids?: string | null;
}

export default function ShopAccountingPage() {
    const [period, setPeriod] = useState("30d");
    const [summary, setSummary] = useState<AccountingSummary | null>(null);
    const [expenses, setExpenses] = useState<BusinessExpense[]>([]);
    const [loading, setLoading] = useState(true);

    // Expense form state
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [newExpense, setNewExpense] = useState({
        category: "rent",
        amount: 0,
        description: "",
        expense_date: new Date().toISOString().split("T")[0],
    });
    const [saving, setSaving] = useState(false);
    const [lastSaveResult, setLastSaveResult] = useState<{ distributed_to: number; amount: number; category: string } | null>(null);

    // Batch selector state (for batch expense categories)
    const [draftBatches, setDraftBatches] = useState<DraftBatch[]>([]);
    const [selectedBatchIds, setSelectedBatchIds] = useState<number[]>([]);
    const [loadingBatches, setLoadingBatches] = useState(false);

    const isBatchCategory = EXPENSE_CATEGORIES.find(c => c.value === newExpense.category)?.isBatch ?? false;

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [sumRes, expRes] = await Promise.all([
                api.get(`/shop-accounting/summary?period=${period}`).catch(() => ({ data: null })),
                api.get(`/shop-accounting/expenses?period=${period}`).catch(() => ({ data: [] })),
            ]);
            setSummary(sumRes.data);
            setExpenses(expRes.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // Whenever the category changes to a batch type, fetch draft batches
    useEffect(() => {
        if (isBatchCategory && showAddExpense) {
            setLoadingBatches(true);
            getDraftBatches()
                .then(setDraftBatches)
                .catch(() => setDraftBatches([]))
                .finally(() => setLoadingBatches(false));
        }
    }, [isBatchCategory, showAddExpense]);

    const handleAddExpense = async () => {
        if (newExpense.amount <= 0) return;
        setSaving(true);
        setLastSaveResult(null);
        try {
            const payload: any = { ...newExpense };
            if (isBatchCategory && selectedBatchIds.length > 0) {
                payload.product_ids = selectedBatchIds;
            }
            const res = await api.post("/shop-accounting/expenses", payload);
            setShowAddExpense(false);
            setNewExpense({ category: "rent", amount: 0, description: "", expense_date: new Date().toISOString().split("T")[0] });
            setSelectedBatchIds([]);
            setLastSaveResult({
                distributed_to: res.data.distributed_to || 0,
                amount: newExpense.amount,
                category: newExpense.category,
            });
            await fetchAll();
        } catch (e) {
            console.error(e);
            alert("Failed to add expense");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteExpense = async (id: number, category: string) => {
        if (category === "batch_purchase") {
            alert("Purchase cost entries are created automatically from Inventory. Delete the product batch instead.");
            return;
        }
        if (!confirm("Delete this expense?")) return;
        try {
            await api.delete(`/shop-accounting/expenses/${id}`);
            await fetchAll();
        } catch (e) {
            console.error(e);
        }
    };

    const toggleBatchSelection = (id: number) => {
        setSelectedBatchIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const getCategoryInfo = (cat: string) => {
        if (cat === "batch_purchase") return PURCHASE_CATEGORY;
        return EXPENSE_CATEGORIES.find(c => c.value === cat) || { value: cat, label: cat, color: "bg-gray-100 text-gray-700" };
    };

    // Compute expense split
    const batchExpenseTotal = ['batch_transport', 'batch_labour', 'batch_other']
        .reduce((sum, cat) => sum + (summary?.expense_by_category[cat] || 0), 0);
    const purchaseTotal = summary?.expense_by_category['batch_purchase'] || 0;
    const generalExpenseTotal = (summary?.total_business_expenses || 0) - batchExpenseTotal - purchaseTotal;

    // Estimate overhead per unit for selected batches (preview)
    const selectedBatches = draftBatches.filter(b => selectedBatchIds.includes(b.id));
    const totalWeight = selectedBatches.reduce((s, b) => s + b.total_value, 0);

    if (loading && !summary) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                        Shop Accounting & Expenses
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Track expenses, batch costs, and overall profitability
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex border rounded-lg overflow-hidden">
                        {PERIOD_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setPeriod(opt.value)}
                                className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === opt.value ? "bg-green-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchAll}
                        className="flex items-center gap-1 text-sm bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg border border-green-200 font-medium"
                    >
                        <ArrowUpRight className="h-3.5 w-3.5" /> Refresh
                    </button>
                </div>
            </div>

            {/* Post-save confirmation banner */}
            {lastSaveResult && (
                <div className="bg-green-50 border border-green-300 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="font-semibold text-green-800">
                            ✅ ₹{lastSaveResult.amount.toLocaleString()} expense saved
                            {lastSaveResult.distributed_to > 0
                                ? ` and distributed across ${lastSaveResult.distributed_to} product batch${lastSaveResult.distributed_to > 1 ? 'es' : ''}`
                                : ''}
                        </p>
                        {lastSaveResult.distributed_to > 0 && (
                            <p className="text-sm text-green-700 mt-0.5">
                                Go back to Inventory → expand the batch → you'll see the landed cost updated with overhead.
                            </p>
                        )}
                    </div>
                    <button onClick={() => setLastSaveResult(null)} className="text-green-400 hover:text-green-600"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Purchase Costs", value: purchaseTotal, icon: Package, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" },
                        { label: "Batch Overheads", value: batchExpenseTotal, icon: Wallet, color: "text-cyan-600", bg: "bg-cyan-100", border: "border-cyan-200" },
                        { label: "General Expenses", value: Math.max(0, generalExpenseTotal), icon: Receipt, color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200" },
                        { label: "Total Business Expenses", value: summary.total_business_expenses, icon: Wallet, color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200" },
                    ].map((card: any) => (
                        <Card key={card.label} className={`hover:shadow-md transition-shadow ${card.border}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                                    <div className={`${card.bg} p-1.5 rounded-lg`}>
                                        <card.icon className={`h-4 w-4 ${card.color}`} />
                                    </div>
                                </div>
                                <h3 className={`text-xl font-bold ${card.color}`}>
                                    ₹{card.value.toLocaleString()}
                                </h3>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Business Expenses Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-amber-600" /> Business Expenses
                    </CardTitle>
                    <Button
                        size="sm"
                        onClick={() => { setShowAddExpense(!showAddExpense); setLastSaveResult(null); }}
                        className="bg-amber-600 hover:bg-amber-700 h-8 text-xs"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Expense
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">

                    {/* Add Expense Form */}
                    {showAddExpense && (
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Category</Label>
                                    <select
                                        className="w-full h-9 px-2 border rounded-md text-sm bg-white"
                                        value={newExpense.category}
                                        onChange={e => {
                                            setNewExpense({ ...newExpense, category: e.target.value });
                                            setSelectedBatchIds([]);
                                        }}
                                    >
                                        {EXPENSE_CATEGORIES.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Amount (₹)</Label>
                                    <Input
                                        type="number"
                                        className="h-9"
                                        value={newExpense.amount || ""}
                                        onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Date</Label>
                                    <Input
                                        type="date"
                                        className="h-9"
                                        value={newExpense.expense_date}
                                        onChange={e => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Description</Label>
                                    <Input
                                        className="h-9"
                                        placeholder="Optional note..."
                                        value={newExpense.description}
                                        onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Batch Linker — appears only for batch expense categories */}
                            {isBatchCategory && (
                                <div className="space-y-2 border-t pt-3">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4 text-cyan-600" />
                                        <p className="text-xs font-semibold text-cyan-800">Link to Draft Batches (Optional)</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Select which product batches this expense belongs to. The ₹{newExpense.amount || 0} will be distributed proportionally by each batch's purchase weight (cost × qty).
                                    </p>

                                    {loadingBatches ? (
                                        <p className="text-xs text-gray-400 py-2">Loading draft batches...</p>
                                    ) : draftBatches.length === 0 ? (
                                        <p className="text-xs text-gray-400 py-2 italic">No draft batches found. Add products first, then they'll appear here.</p>
                                    ) : (
                                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                            {draftBatches.map(batch => {
                                                const isSelected = selectedBatchIds.includes(batch.id);
                                                const myShare = totalWeight > 0 && isSelected
                                                    ? (batch.total_value / selectedBatches.reduce((s, b) => s + b.total_value, 0)) * newExpense.amount
                                                    : null;
                                                return (
                                                    <label
                                                        key={batch.id}
                                                        className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                                                            isSelected
                                                                ? "bg-cyan-50 border-cyan-300"
                                                                : "bg-white border-gray-200 hover:border-cyan-200"
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleBatchSelection(batch.id)}
                                                            className="accent-cyan-600"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-gray-800">{batch.name}</div>
                                                            <div className="text-xs text-gray-500">
                                                                Batch: {batch.batch_number} · {batch.quantity} {batch.unit} · ₹{batch.cost_price}/unit
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                Purchase value: ₹{batch.total_value.toLocaleString()}
                                                            </div>
                                                        </div>
                                                        {isSelected && myShare !== null && (
                                                            <div className="text-xs font-bold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded">
                                                                ≈ ₹{myShare.toFixed(2)}
                                                            </div>
                                                        )}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2 justify-end pt-1">
                                <Button size="sm" variant="outline" onClick={() => setShowAddExpense(false)} className="h-8 text-xs">Cancel</Button>
                                <Button
                                    size="sm"
                                    onClick={handleAddExpense}
                                    disabled={saving || newExpense.amount <= 0}
                                    className="h-8 text-xs bg-amber-600 hover:bg-amber-700"
                                >
                                    {saving ? "Saving..." : "Save Expense"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Expense Breakdown by Category */}
                    {summary && Object.keys(summary.expense_by_category).length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                            {Object.entries(summary.expense_by_category).map(([cat, amount]) => {
                                const info = getCategoryInfo(cat);
                                return (
                                    <div key={cat} className={`text-center p-2.5 rounded-lg border ${info.color}`}>
                                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">{info.label?.split(" ").slice(1).join(" ") || cat}</div>
                                        <div className="text-sm font-bold mt-0.5">₹{(amount as number).toLocaleString()}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Expense List */}
                    <div className="max-h-[400px] overflow-y-auto space-y-1.5 mt-2">
                        {expenses.length === 0 ? (
                            <div className="text-center py-6 text-gray-400 text-sm">No expenses recorded for this period</div>
                        ) : (
                            expenses.map((exp) => {
                                const info = getCategoryInfo(exp.category);
                                const isPurchase = exp.category === "batch_purchase";
                                const linkedCount = exp.linked_product_ids
                                    ? JSON.parse(exp.linked_product_ids).length
                                    : 0;
                                return (
                                    <div key={exp.id} className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${isPurchase ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 hover:border-gray-300'}`}>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${info.color}`}>
                                            {info.label?.split(" ").slice(1).join(" ") || exp.category}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            {exp.description && <div className="text-xs text-gray-700 truncate">{exp.description}</div>}
                                            <div className="text-[10px] text-gray-400 flex items-center gap-2">
                                                {new Date(exp.expense_date).toLocaleDateString("en-IN")}
                                                {linkedCount > 0 && (
                                                    <span className="text-cyan-600 font-medium">🔗 {linkedCount} batch{linkedCount > 1 ? 'es' : ''}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="font-bold text-sm text-gray-800 flex-shrink-0">₹{exp.amount.toLocaleString()}</span>
                                        <button
                                            onClick={() => handleDeleteExpense(exp.id, exp.category)}
                                            className={`p-1 rounded ${isPurchase ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}
                                            title={isPurchase ? "Auto-generated from Inventory" : "Delete expense"}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

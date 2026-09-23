"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
    CreditCard, Plus, IndianRupee, AlertTriangle, CheckCircle,
    Clock, Building2, Store, Users, Landmark, FileText,
    History, Trash2, Edit3, ArrowRight, Wallet, Check, AlertCircle
} from "lucide-react";
import {
    CreditLoan, CreditLoanCreate, LoanRepayment, LoanRepaymentCreate, CreditSummary,
    getCreditLoans, getCreditSummary, createCreditLoan, updateCreditLoan,
    deleteCreditLoan, addLoanRepayment, getLoanRepayments, deleteLoanRepayment
} from "@/lib/api";

const SOURCE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    bank: { label: "Bank Loan (KCC)", icon: <Landmark className="h-4 w-4" />, color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/30 border-blue-200" },
    fertilizer_shop: { label: "Fertilizer Shop Credit", icon: <Store className="h-4 w-4" />, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200" },
    trader: { label: "Trader / Arhatiya", icon: <Building2 className="h-4 w-4" />, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/30 border-amber-200" },
    cooperative: { label: "Cooperative Society (PACS)", icon: <Users className="h-4 w-4" />, color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/30 border-purple-200" },
    relative_friend: { label: "Friend / Relative", icon: <Users className="h-4 w-4" />, color: "text-teal-700 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-900/30 border-teal-200" },
    other: { label: "Other", icon: <FileText className="h-4 w-4" />, color: "text-gray-700 dark:text-gray-400", bg: "bg-gray-50 dark:bg-gray-800/30 border-gray-200" },
};

export default function CreditTrackerPage() {
    const { user } = useAuth();
    const { t } = useLanguage();

    const [loans, setLoans] = useState<CreditLoan[]>([]);
    const [summary, setSummary] = useState<CreditSummary | null>(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [sourceFilter, setSourceFilter] = useState<string>("all");

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    // Form states
    const [selectedLoan, setSelectedLoan] = useState<CreditLoan | null>(null);
    const [repayments, setRepayments] = useState<LoanRepayment[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [newLoan, setNewLoan] = useState<CreditLoanCreate>({
        source_type: "fertilizer_shop",
        lender_name: "",
        purpose: "",
        principal_amount: 0,
        interest_rate_percent: 0,
        interest_type: "annual",
        start_date: new Date().toISOString().split("T")[0],
        due_date: "",
        amount_paid: 0,
        status: "active",
        notes: "",
    });

    const [repayForm, setRepayForm] = useState<LoanRepaymentCreate>({
        payment_date: new Date().toISOString().split("T")[0],
        amount: 0,
        payment_mode: "cash",
        notes: "",
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [loansData, summaryData] = await Promise.all([
                getCreditLoans(
                    statusFilter === "all" ? undefined : statusFilter,
                    sourceFilter === "all" ? undefined : sourceFilter
                ),
                getCreditSummary(),
            ]);
            setLoans(loansData);
            setSummary(summaryData);
        } catch (err) {
            console.error("Error fetching credit loans data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [statusFilter, sourceFilter]);

    // Create loan
    const handleCreateLoan = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCreditLoan({
                ...newLoan,
                principal_amount: Number(newLoan.principal_amount),
                interest_rate_percent: Number(newLoan.interest_rate_percent || 0),
                amount_paid: Number(newLoan.amount_paid || 0),
                due_date: newLoan.due_date ? newLoan.due_date : null,
            });
            setIsAddModalOpen(false);
            setNewLoan({
                source_type: "fertilizer_shop",
                lender_name: "",
                purpose: "",
                principal_amount: 0,
                interest_rate_percent: 0,
                interest_type: "annual",
                start_date: new Date().toISOString().split("T")[0],
                due_date: "",
                amount_paid: 0,
                status: "active",
                notes: "",
            });
            fetchData();
        } catch (err) {
            console.error("Failed to create loan:", err);
            alert("Failed to save loan. Please check inputs.");
        }
    };

    // Update loan
    const handleUpdateLoan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLoan) return;
        try {
            await updateCreditLoan(selectedLoan.id, {
                source_type: selectedLoan.source_type,
                lender_name: selectedLoan.lender_name,
                purpose: selectedLoan.purpose,
                principal_amount: Number(selectedLoan.principal_amount),
                interest_rate_percent: Number(selectedLoan.interest_rate_percent || 0),
                interest_type: selectedLoan.interest_type,
                start_date: selectedLoan.start_date,
                due_date: selectedLoan.due_date || null,
                notes: selectedLoan.notes,
            });
            setIsEditModalOpen(false);
            fetchData();
        } catch (err) {
            console.error("Failed to update loan:", err);
            alert("Failed to update loan.");
        }
    };

    // Delete loan
    const handleDeleteLoan = async (id: number) => {
        if (!confirm("Are you sure you want to delete this loan record and its payment history?")) return;
        try {
            await deleteCreditLoan(id);
            fetchData();
        } catch (err) {
            console.error("Failed to delete loan:", err);
        }
    };

    // Open Repay Modal
    const handleOpenRepay = (loan: CreditLoan) => {
        setSelectedLoan(loan);
        setRepayForm({
            payment_date: new Date().toISOString().split("T")[0],
            amount: loan.remaining_balance,
            payment_mode: "cash",
            notes: "",
        });
        setIsRepayModalOpen(true);
    };

    // Submit Repay
    const handleSubmitRepayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLoan) return;
        try {
            await addLoanRepayment(selectedLoan.id, {
                ...repayForm,
                amount: Number(repayForm.amount),
            });
            setIsRepayModalOpen(false);
            fetchData();
        } catch (err) {
            console.error("Failed to record repayment:", err);
            alert("Failed to record repayment.");
        }
    };

    // Open History Modal
    const handleOpenHistory = async (loan: CreditLoan) => {
        setSelectedLoan(loan);
        setIsHistoryModalOpen(true);
        setHistoryLoading(true);
        try {
            const data = await getLoanRepayments(loan.id);
            setRepayments(data);
        } catch (err) {
            console.error("Failed to fetch payment history:", err);
        } finally {
            setHistoryLoading(false);
        }
    };

    // Delete a single repayment record
    const handleDeleteRepaymentRecord = async (repaymentId: number) => {
        if (!selectedLoan || !confirm("Delete this repayment record? The balance will adjust automatically.")) return;
        try {
            await deleteLoanRepayment(selectedLoan.id, repaymentId);
            const data = await getLoanRepayments(selectedLoan.id);
            setRepayments(data);
            fetchData();
        } catch (err) {
            console.error("Failed to delete repayment:", err);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-green-800 p-6 rounded-2xl text-white shadow-lg">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-emerald-200" />
                        Credit & Loan Tracker
                    </h1>
                    <p className="text-emerald-100 text-sm mt-1">
                        Track fertilizer store credit, bank crop loans (KCC), and trader borrowings with realistic repayment reminders.
                    </p>
                </div>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold shadow-md hover:shadow-lg transition-all shrink-0"
                >
                    <Plus className="h-5 w-5 mr-1" /> Add Credit / Loan
                </Button>
            </div>

            {/* Financial Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm bg-card hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase font-bold text-muted-foreground">Total Borrowed</p>
                                <p className="text-2xl font-black text-foreground mt-1">₹{summary.total_borrowed.toLocaleString("en-IN")}</p>
                                <p className="text-xs text-muted-foreground mt-1">{summary.active_loans_count + summary.paid_off_count} total entries</p>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                <Wallet className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 shadow-sm bg-card hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase font-bold text-muted-foreground">Total Repaid</p>
                                <p className="text-2xl font-black text-green-600 dark:text-green-400 mt-1">₹{summary.total_repaid.toLocaleString("en-IN")}</p>
                                <p className="text-xs text-muted-foreground mt-1">{summary.paid_off_count} loans fully cleared</p>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500 shadow-sm bg-card hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase font-bold text-muted-foreground">Remaining Balance</p>
                                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">₹{summary.total_outstanding.toLocaleString("en-IN")}</p>
                                <p className="text-xs text-muted-foreground mt-1">{summary.active_loans_count} active loans</p>
                            </div>
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                                <Clock className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-red-500 shadow-sm bg-card hover:shadow-md transition-shadow">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase font-bold text-muted-foreground">Overdue / Urgent</p>
                                <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{summary.overdue_count}</p>
                                <p className="text-xs text-muted-foreground mt-1">{summary.overdue_count > 0 ? "Requires immediate attention" : "All loans on schedule"}</p>
                            </div>
                            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Overdue / Upcoming Due Reminder Banner */}
            {summary && summary.upcoming_due_loans && summary.upcoming_due_loans.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-700 dark:text-amber-400 shrink-0">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-amber-900 dark:text-amber-200">
                                🔔 Upcoming Repayment Reminders ({summary.upcoming_due_loans.length})
                            </h4>
                            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                                Nearest due: <strong>{summary.upcoming_due_loans[0].lender_name}</strong> — ₹{summary.upcoming_due_loans[0].remaining_balance.toLocaleString("en-IN")}
                                {summary.upcoming_due_loans[0].is_overdue
                                    ? " (Overdue!)"
                                    : ` (Due in ${summary.upcoming_due_loans[0].days_until_due} days on ${new Date(summary.upcoming_due_loans[0].due_date!).toLocaleDateString("en-IN")})`}
                            </p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={() => handleOpenRepay(summary.upcoming_due_loans[0])}
                        className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                    >
                        Record Payment
                    </Button>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-muted-foreground mr-2">Status:</span>
                    {[
                        { id: "all", label: "All" },
                        { id: "active", label: "Active" },
                        { id: "overdue", label: "Overdue ⚠️" },
                        { id: "paid_off", label: "Paid Off ✓" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                statusFilter === tab.id
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Source:</span>
                    <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="text-xs border rounded-lg p-1.5 bg-background text-foreground outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                        <option value="all">All Sources</option>
                        <option value="fertilizer_shop">Fertilizer Shop</option>
                        <option value="bank">Bank Loan (KCC)</option>
                        <option value="trader">Trader / Arhatiya</option>
                        <option value="cooperative">Cooperative Society</option>
                        <option value="relative_friend">Friend / Relative</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>

            {/* Loans List */}
            {loading ? (
                <div className="p-12 text-center text-emerald-600 font-bold animate-pulse">
                    Loading loan records...
                </div>
            ) : loans.length === 0 ? (
                <div className="bg-card border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <h3 className="font-bold text-lg text-foreground">No Credit / Loan Records Found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                        Keep track of fertilizers bought on credit, bank crop loans, or borrowings from local traders.
                    </p>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add Your First Record
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loans.map((loan) => {
                        const source = SOURCE_CONFIG[loan.source_type] || SOURCE_CONFIG.other;
                        const pctPaid = loan.principal_amount > 0 ? Math.min(100, Math.round((loan.amount_paid / loan.principal_amount) * 100)) : 0;
                        const isCleared = loan.status === "paid_off" || loan.remaining_balance <= 0;

                        return (
                            <Card key={loan.id} className="border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                                <CardContent className="p-5 space-y-4">
                                    {/* Top Row */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`p-2.5 rounded-xl border ${source.bg} ${source.color}`}>
                                                {source.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-base text-foreground leading-tight">{loan.lender_name}</h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">{loan.purpose}</p>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="shrink-0">
                                            {isCleared ? (
                                                <span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-green-200">
                                                    <Check className="h-3 w-3" /> Paid Off
                                                </span>
                                            ) : loan.is_overdue ? (
                                                <span className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-red-200 animate-pulse">
                                                    <AlertTriangle className="h-3 w-3" /> Overdue
                                                </span>
                                            ) : (
                                                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-xs px-2.5 py-1 rounded-full font-bold border border-blue-200">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Repayment Progress</span>
                                            <span className="font-bold text-foreground">{pctPaid}% Paid</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 rounded-full ${
                                                    isCleared ? "bg-green-500" : pctPaid > 50 ? "bg-emerald-500" : "bg-amber-500"
                                                }`}
                                                style={{ width: `${pctPaid}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Key Numbers Grid */}
                                    <div className="grid grid-cols-3 gap-2 bg-muted/30 p-3 rounded-xl border border-border/50 text-center">
                                        <div>
                                            <p className="text-[11px] text-muted-foreground">Borrowed</p>
                                            <p className="font-bold text-sm text-foreground">₹{loan.principal_amount.toLocaleString("en-IN")}</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-muted-foreground">Paid</p>
                                            <p className="font-bold text-sm text-green-600 dark:text-green-400">₹{loan.amount_paid.toLocaleString("en-IN")}</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-muted-foreground">Remaining</p>
                                            <p className={`font-bold text-sm ${loan.remaining_balance > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                                                ₹{loan.remaining_balance.toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Details row: Interest & Dates */}
                                    <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                                        <div>
                                            {loan.interest_rate_percent > 0 ? (
                                                <span>Interest: <strong>{loan.interest_rate_percent}%</strong> ({loan.interest_type})</span>
                                            ) : (
                                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">0% (Interest-Free)</span>
                                            )}
                                        </div>
                                        <div>
                                            {loan.due_date ? (
                                                <span>
                                                    Due: <strong>{new Date(loan.due_date).toLocaleDateString("en-IN")}</strong>
                                                    {!isCleared && loan.days_until_due !== null && loan.days_until_due !== undefined && (
                                                        <span className={`ml-1 font-bold ${loan.days_until_due < 0 ? "text-red-500" : loan.days_until_due <= 7 ? "text-amber-500" : "text-muted-foreground"}`}>
                                                            ({loan.days_until_due < 0 ? `${Math.abs(loan.days_until_due)}d overdue` : `${loan.days_until_due}d left`})
                                                        </span>
                                                    )}
                                                </span>
                                            ) : (
                                                <span>No fixed due date</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between gap-2 pt-2">
                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleOpenHistory(loan)}
                                                className="text-xs h-8 px-2.5 text-muted-foreground hover:text-foreground"
                                                title="View Payment History"
                                            >
                                                <History className="h-3.5 w-3.5 mr-1" /> History
                                            </Button>
                                            <button
                                                onClick={() => {
                                                    setSelectedLoan(loan);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-1.5 text-muted-foreground hover:text-blue-600 rounded-lg hover:bg-muted"
                                                title="Edit Loan"
                                            >
                                                <Edit3 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLoan(loan.id)}
                                                className="p-1.5 text-muted-foreground hover:text-red-600 rounded-lg hover:bg-muted"
                                                title="Delete Record"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        {!isCleared && (
                                            <Button
                                                size="sm"
                                                onClick={() => handleOpenRepay(loan)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 px-3"
                                            >
                                                <IndianRupee className="h-3.5 w-3.5 mr-0.5" /> Pay / Repay
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* ─── ADD LOAN MODAL ───────────────────────── */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Credit / Loan Record"
            >
                <form onSubmit={handleCreateLoan} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Credit / Loan Source *</label>
                            <select
                                required
                                className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none focus:ring-2 focus:ring-emerald-500"
                                value={newLoan.source_type}
                                onChange={(e) => setNewLoan({ ...newLoan, source_type: e.target.value })}
                            >
                                <option value="fertilizer_shop">Fertilizer / Agro Store Credit</option>
                                <option value="bank">Bank Crop Loan (KCC / Commercial)</option>
                                <option value="trader">Trader / Arhatiya Borrowing</option>
                                <option value="cooperative">Cooperative Society (PACS)</option>
                                <option value="relative_friend">Friend / Relative</option>
                                <option value="other">Other Source</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Lender / Store Name *</label>
                            <input
                                required
                                placeholder="e.g. Kisan Seva Kendra, SBI, Sharma Arhatiya"
                                className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none focus:ring-2 focus:ring-emerald-500"
                                value={newLoan.lender_name}
                                onChange={(e) => setNewLoan({ ...newLoan, lender_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground">Purpose / Items Bought *</label>
                        <input
                            required
                            placeholder="e.g. 5 Bags Urea + 2 Bags DAP, Kharif Season Crop Loan"
                            className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none focus:ring-2 focus:ring-emerald-500"
                            value={newLoan.purpose}
                            onChange={(e) => setNewLoan({ ...newLoan, purpose: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Principal Amount (₹) *</label>
                            <input
                                type="number"
                                required
                                min="1"
                                placeholder="e.g. 25000"
                                className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none focus:ring-2 focus:ring-emerald-500"
                                value={newLoan.principal_amount || ""}
                                onChange={(e) => setNewLoan({ ...newLoan, principal_amount: parseFloat(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Interest Rate (% per year)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="0 for interest-free shop credit"
                                className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none focus:ring-2 focus:ring-emerald-500"
                                value={newLoan.interest_rate_percent || ""}
                                onChange={(e) => setNewLoan({ ...newLoan, interest_rate_percent: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Start / Borrowed Date *</label>
                            <input
                                type="date"
                                required
                                className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none focus:ring-2 focus:ring-emerald-500"
                                value={newLoan.start_date}
                                onChange={(e) => setNewLoan({ ...newLoan, start_date: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Due / Repayment Date</label>
                            <input
                                type="date"
                                className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none focus:ring-2 focus:ring-emerald-500"
                                value={newLoan.due_date || ""}
                                onChange={(e) => setNewLoan({ ...newLoan, due_date: e.target.value })}
                            />
                            <p className="text-[10px] text-muted-foreground">Will auto-sync to your Farm Activity Calendar</p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground">Initial Amount Paid (if any)</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none focus:ring-2 focus:ring-emerald-500"
                            value={newLoan.amount_paid || ""}
                            onChange={(e) => setNewLoan({ ...newLoan, amount_paid: parseFloat(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-foreground">Notes / Comments</label>
                        <textarea
                            rows={2}
                            placeholder="e.g. Agreed to repay post-harvest sale at mandi..."
                            className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none focus:ring-2 focus:ring-emerald-500"
                            value={newLoan.notes || ""}
                            onChange={(e) => setNewLoan({ ...newLoan, notes: e.target.value })}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl mt-2"
                    >
                        Save Credit Record
                    </Button>
                </form>
            </Modal>

            {/* ─── EDIT LOAN MODAL ───────────────────────── */}
            {selectedLoan && (
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title={`Edit Loan: ${selectedLoan.lender_name}`}
                >
                    <form onSubmit={handleUpdateLoan} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Source</label>
                                <select
                                    className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none"
                                    value={selectedLoan.source_type}
                                    onChange={(e) => setSelectedLoan({ ...selectedLoan, source_type: e.target.value as any })}
                                >
                                    <option value="fertilizer_shop">Fertilizer Shop</option>
                                    <option value="bank">Bank Loan</option>
                                    <option value="trader">Trader</option>
                                    <option value="cooperative">Cooperative</option>
                                    <option value="relative_friend">Friend / Relative</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Lender Name</label>
                                <input
                                    required
                                    className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none"
                                    value={selectedLoan.lender_name}
                                    onChange={(e) => setSelectedLoan({ ...selectedLoan, lender_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Purpose</label>
                            <input
                                required
                                className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none"
                                value={selectedLoan.purpose}
                                onChange={(e) => setSelectedLoan({ ...selectedLoan, purpose: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Principal (₹)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none"
                                    value={selectedLoan.principal_amount}
                                    onChange={(e) => setSelectedLoan({ ...selectedLoan, principal_amount: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Interest Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none"
                                    value={selectedLoan.interest_rate_percent}
                                    onChange={(e) => setSelectedLoan({ ...selectedLoan, interest_rate_percent: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Due Date</label>
                                <input
                                    type="date"
                                    className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none"
                                    value={selectedLoan.due_date || ""}
                                    onChange={(e) => setSelectedLoan({ ...selectedLoan, due_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Notes</label>
                                <input
                                    className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none"
                                    value={selectedLoan.notes || ""}
                                    onChange={(e) => setSelectedLoan({ ...selectedLoan, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl">
                            Update Loan Details
                        </Button>
                    </form>
                </Modal>
            )}

            {/* ─── RECORD PAYMENT MODAL ────────────────── */}
            {selectedLoan && (
                <Modal
                    isOpen={isRepayModalOpen}
                    onClose={() => setIsRepayModalOpen(false)}
                    title={`Record Repayment for ${selectedLoan.lender_name}`}
                >
                    <form onSubmit={handleSubmitRepayment} className="space-y-4 p-1">
                        <div className="bg-muted/40 p-3.5 rounded-xl border border-border/60 text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Principal:</span>
                                <span className="font-bold text-foreground">₹{selectedLoan.principal_amount.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Already Paid:</span>
                                <span className="font-bold text-green-600">₹{selectedLoan.amount_paid.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between border-t border-border/50 pt-1 font-bold">
                                <span className="text-foreground">Current Balance:</span>
                                <span className="text-amber-600">₹{selectedLoan.remaining_balance.toLocaleString("en-IN")}</span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Repayment Amount (₹) *</label>
                            <input
                                type="number"
                                required
                                min="1"
                                max={selectedLoan.remaining_balance}
                                className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg"
                                value={repayForm.amount || ""}
                                onChange={(e) => setRepayForm({ ...repayForm, amount: parseFloat(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Payment Date *</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none"
                                    value={repayForm.payment_date}
                                    onChange={(e) => setRepayForm({ ...repayForm, payment_date: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Payment Mode</label>
                                <select
                                    className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none"
                                    value={repayForm.payment_mode}
                                    onChange={(e) => setRepayForm({ ...repayForm, payment_mode: e.target.value as any })}
                                >
                                    <option value="cash">Cash 💵</option>
                                    <option value="upi">UPI / Online 📲</option>
                                    <option value="bank_transfer">Bank Transfer 🏦</option>
                                    <option value="harvest_crop">Harvest / Crop Sale Adjustment 🌾</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">Note / Reference</label>
                            <input
                                placeholder="e.g. Paid cash at shop counter"
                                className="w-full border rounded-xl p-2.5 text-foreground bg-background outline-none"
                                value={repayForm.notes || ""}
                                onChange={(e) => setRepayForm({ ...repayForm, notes: e.target.value })}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl mt-2"
                        >
                            Confirm Repayment of ₹{(repayForm.amount || 0).toLocaleString("en-IN")}
                        </Button>
                    </form>
                </Modal>
            )}

            {/* ─── PAYMENT HISTORY MODAL ────────────────── */}
            {selectedLoan && (
                <Modal
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                    title={`Payment History: ${selectedLoan.lender_name}`}
                >
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                        <div className="bg-muted/30 p-3 rounded-xl border border-border flex justify-between text-xs">
                            <div>
                                <p className="text-muted-foreground">Original Borrowed</p>
                                <p className="font-bold text-foreground">₹{selectedLoan.principal_amount.toLocaleString("en-IN")}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-muted-foreground">Remaining Due</p>
                                <p className="font-bold text-amber-600">₹{selectedLoan.remaining_balance.toLocaleString("en-IN")}</p>
                            </div>
                        </div>

                        {historyLoading ? (
                            <p className="text-center text-xs text-muted-foreground py-6">Loading payment history...</p>
                        ) : repayments.length === 0 ? (
                            <p className="text-center text-xs text-muted-foreground py-6">No repayment payments recorded yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {repayments.map((rp) => (
                                    <div key={rp.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/70 hover:border-emerald-200 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-green-600 dark:text-green-400">
                                                    + ₹{rp.amount.toLocaleString("en-IN")}
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase font-semibold">
                                                    {rp.payment_mode}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {new Date(rp.payment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                {rp.notes && ` • ${rp.notes}`}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteRepaymentRecord(rp.id)}
                                            className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                                            title="Revert payment"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}

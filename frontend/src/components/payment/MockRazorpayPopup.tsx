import React, { useState, useEffect } from "react";
import {
    ArrowLeft,
    CheckCircle2,
    Loader2,
    CreditCard,
    Wallet,
    Building,
    QrCode,
    Smartphone,
    ChevronRight,
    ShieldCheck,
    Copy,
    Check,
    Sparkles,
    AlertCircle
} from "lucide-react";

export default function MockRazorpayPopup({
    options,
    onClose
}: {
    options: any;
    onClose: () => void;
}) {
    const [activeTab, setActiveTab] = useState<"upi" | "card" | "netbanking" | "wallet">("upi");
    const [upiSubTab, setUpiSubTab] = useState<"qr" | "apps" | "vpa">("qr");
    const [step, setStep] = useState<"method" | "processing" | "success">("method");
    const [selectedUpiApp, setSelectedUpiApp] = useState<string>("Google Pay");
    const [customVpa, setCustomVpa] = useState<string>("");
    const [vpaError, setVpaError] = useState<string | null>(null);
    const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(300); // 5 min countdown

    const amountInRupees = (options.amount / 100) || 0;
    const formattedAmount = amountInRupees.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const upiId = "agriflow.merchant@icici";
    const upiUri = `upi://pay?pa=${upiId}&pn=AgriFlow&am=${amountInRupees.toFixed(2)}&cu=INR&tn=${encodeURIComponent(options.description || "AgriFlow Order")}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}&margin=8`;

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTimer = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const handleCopyUpi = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(upiId);
            setCopiedUpi(true);
            setTimeout(() => setCopiedUpi(false), 2000);
        }
    };

    const handlePayment = (methodLabel: string, methodType: string = "upi", specificVpa?: string) => {
        setStep("processing");
        setTimeout(() => {
            setStep("success");
            setTimeout(() => {
                options.handler({
                    razorpay_order_id: options.order_id,
                    razorpay_payment_id: `pay_upi_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                    razorpay_signature: "dummy_signature",
                    razorpay_payment_method: methodType,
                    razorpay_vpa: specificVpa || (methodType === "upi" ? `${methodLabel.toLowerCase().replace(/\s+/g, "")}@upi` : undefined),
                });
                onClose();
            }, 1000);
        }, 1400);
    };

    const handleVpaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = customVpa.trim();
        if (!trimmed || !trimmed.includes("@")) {
            setVpaError("Please enter a valid UPI ID (e.g. yourname@okhdfcbank or 9876543210@paytm)");
            return;
        }
        setVpaError(null);
        handlePayment("Custom VPA", "upi", trimmed);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-hidden relative flex flex-col font-sans border border-gray-200 dark:border-zinc-800">
                {/* Header Navbar */}
                <div className="bg-gradient-to-r from-emerald-700 via-green-700 to-teal-800 text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-md">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-white/20 rounded-full transition text-white"
                            aria-label="Back"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-white text-base leading-tight">
                                    {options.name || "AgriFlow Pay"}
                                </h2>
                                <span className="text-[10px] bg-emerald-950/60 text-emerald-200 px-2 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                                    Razorpay UPI
                                </span>
                            </div>
                            <p className="text-xs text-emerald-100/90 font-medium">
                                {options.description || "Secure Checkout"}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[11px] text-emerald-200 block uppercase font-medium">To Pay</span>
                        <span className="text-lg font-extrabold text-white">₹{formattedAmount}</span>
                    </div>
                </div>

                {/* Step: Choose Payment Method */}
                {step === "method" && (
                    <div className="flex-1 overflow-y-auto flex flex-col">
                        {/* Primary Method Tabs */}
                        <div className="grid grid-cols-4 bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 p-1.5 gap-1 text-xs font-semibold">
                            <button
                                onClick={() => setActiveTab("upi")}
                                className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                                    activeTab === "upi"
                                        ? "bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm font-bold"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <span className="inline-flex items-center gap-1">
                                    <span className="font-black italic text-emerald-600 dark:text-emerald-400">UPI</span>
                                </span>
                                <span>UPI & QR</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("card")}
                                className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                                    activeTab === "card"
                                        ? "bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm font-bold"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <CreditCard className="w-4 h-4" />
                                <span>Cards</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("netbanking")}
                                className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                                    activeTab === "netbanking"
                                        ? "bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm font-bold"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Building className="w-4 h-4" />
                                <span>Netbanking</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("wallet")}
                                className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
                                    activeTab === "wallet"
                                        ? "bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-sm font-bold"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Wallet className="w-4 h-4" />
                                <span>Wallets</span>
                            </button>
                        </div>

                        {/* TAB CONTENT: UPI */}
                        {activeTab === "upi" && (
                            <div className="p-4 space-y-4 flex-1">
                                {/* UPI Sub-Navigation */}
                                <div className="flex bg-emerald-50 dark:bg-emerald-950/40 p-1 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                                    <button
                                        onClick={() => setUpiSubTab("qr")}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                            upiSubTab === "qr"
                                                ? "bg-emerald-600 text-white shadow-xs"
                                                : "text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/50"
                                        }`}
                                    >
                                        <QrCode className="w-3.5 h-3.5" />
                                        Scan QR Code
                                    </button>
                                    <button
                                        onClick={() => setUpiSubTab("apps")}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                            upiSubTab === "apps"
                                                ? "bg-emerald-600 text-white shadow-xs"
                                                : "text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/50"
                                        }`}
                                    >
                                        <Smartphone className="w-3.5 h-3.5" />
                                        UPI Apps
                                    </button>
                                    <button
                                        onClick={() => setUpiSubTab("vpa")}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                            upiSubTab === "vpa"
                                                ? "bg-emerald-600 text-white shadow-xs"
                                                : "text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/50"
                                        }`}
                                    >
                                        @ UPI ID
                                    </button>
                                </div>

                                {/* SUB-TAB 1: QR CODE */}
                                {upiSubTab === "qr" && (
                                    <div className="flex flex-col items-center text-center space-y-3 pt-1">
                                        <div className="relative p-3 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-emerald-500 shadow-md">
                                            {/* Real-time Dynamic QR Code image */}
                                            <img
                                                src={qrCodeUrl}
                                                alt="UPI Payment QR Code"
                                                className="w-44 h-44 object-contain rounded-lg"
                                                onError={(e) => {
                                                    // Fallback to stylized SVG placeholder if image fails to load
                                                    (e.target as HTMLElement).style.display = "none";
                                                    const parent = (e.target as HTMLElement).parentElement;
                                                    if (parent) {
                                                        const fallback = document.createElement("div");
                                                        fallback.className = "w-44 h-44 flex flex-col items-center justify-center bg-gray-50 dark:bg-zinc-800 rounded-lg text-emerald-600";
                                                        fallback.innerHTML = `<svg class="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M7 12h10M12 7v10"/></svg><span class="text-xs font-bold mt-2">Scan with any UPI App</span>`;
                                                        parent.appendChild(fallback);
                                                    }
                                                }}
                                            />
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-950 p-1.5 rounded-full shadow-sm border border-emerald-400">
                                                <span className="font-black italic text-xs text-emerald-600">UPI</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-foreground">
                                                Scan with any UPI App: <span className="font-bold text-emerald-600 dark:text-emerald-400">GPay, PhonePe, Paytm, BHIM</span>
                                            </p>
                                            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                                                <span>QR expires in:</span>
                                                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                                                    {formatTimer(timer)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Merchant UPI ID Copy */}
                                        <div className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
                                            <div className="text-left">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Merchant UPI ID</span>
                                                <span className="font-mono font-semibold text-foreground">{upiId}</span>
                                            </div>
                                            <button
                                                onClick={handleCopyUpi}
                                                className="px-2.5 py-1 bg-white dark:bg-zinc-800 border rounded-lg text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] hover:bg-emerald-50 dark:hover:bg-zinc-700 flex items-center gap-1 transition"
                                            >
                                                {copiedUpi ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                                                {copiedUpi ? "Copied" : "Copy"}
                                            </button>
                                        </div>

                                        {/* Instant Action */}
                                        <button
                                            onClick={() => handlePayment("QR Scan", "upi", upiId)}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm mt-1"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Simulate Phone Scan & Pay ₹{formattedAmount}
                                        </button>
                                    </div>
                                )}

                                {/* SUB-TAB 2: UPI APPS */}
                                {upiSubTab === "apps" && (
                                    <div className="space-y-3">
                                        <p className="text-xs font-semibold text-muted-foreground">Select your installed UPI application:</p>
                                        <div className="space-y-2">
                                            {[
                                                { id: "gpay", name: "Google Pay", iconText: "G", color: "bg-blue-600 text-white", sub: "Fast checkout with linked bank" },
                                                { id: "phonepe", name: "PhonePe", iconText: "Pe", color: "bg-purple-600 text-white", sub: "UPI & PhonePe Wallet" },
                                                { id: "paytm", name: "Paytm UPI", iconText: "Paytm", color: "bg-[#002e6e] text-white", sub: "Instant bank transfer" },
                                                { id: "bhim", name: "BHIM UPI", iconText: "BHIM", color: "bg-emerald-700 text-white", sub: "Government NPCI certified" },
                                                { id: "cred", name: "CRED UPI", iconText: "CRED", color: "bg-black text-white", sub: "Earn reward coins on payment" },
                                            ].map((app) => (
                                                <div
                                                    key={app.id}
                                                    onClick={() => setSelectedUpiApp(app.name)}
                                                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                                                        selectedUpiApp === app.name
                                                            ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs"
                                                            : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900"
                                                    }`}
                                                >
                                                    <div className={`w-9 h-9 rounded-lg font-bold flex items-center justify-center text-xs shadow-xs shrink-0 ${app.color}`}>
                                                        {app.iconText}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-foreground text-sm flex items-center gap-2">
                                                            {app.name}
                                                            {selectedUpiApp === app.name && (
                                                                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                                                                    Selected
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground truncate">{app.sub}</p>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                                        selectedUpiApp === app.name
                                                            ? "border-emerald-600 bg-emerald-600"
                                                            : "border-gray-300 dark:border-zinc-600"
                                                    }`}>
                                                        {selectedUpiApp === app.name && <Check className="w-3 h-3 text-white stroke-[3]" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handlePayment(selectedUpiApp, "upi")}
                                            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Smartphone className="w-4 h-4" />
                                            Pay ₹{formattedAmount} via {selectedUpiApp}
                                        </button>
                                    </div>
                                )}

                                {/* SUB-TAB 3: ENTER UPI ID / VPA */}
                                {upiSubTab === "vpa" && (
                                    <form onSubmit={handleVpaSubmit} className="space-y-4 pt-1">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-foreground block">
                                                Enter UPI ID / VPA
                                            </label>
                                            <input
                                                type="text"
                                                value={customVpa}
                                                onChange={(e) => {
                                                    setCustomVpa(e.target.value);
                                                    setVpaError(null);
                                                }}
                                                placeholder="e.g. mobile@upi, name@okhdfcbank"
                                                className="w-full p-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-foreground text-sm font-mono placeholder:text-muted-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            />
                                            {vpaError && (
                                                <p className="text-xs text-rose-500 flex items-center gap-1 font-medium">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    {vpaError}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <p className="text-[11px] font-semibold text-muted-foreground">Quick test handles (click to fill):</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {["farmer@upi", "success@razorpay", "ravi@okhdfcbank", "shop@ybl"].map((handle) => (
                                                    <button
                                                        key={handle}
                                                        type="button"
                                                        onClick={() => {
                                                            setCustomVpa(handle);
                                                            setVpaError(null);
                                                        }}
                                                        className="text-[11px] font-mono px-2 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-zinc-700 text-foreground transition border border-gray-200 dark:border-zinc-700"
                                                    >
                                                        {handle}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm mt-4"
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                            Verify & Pay ₹{formattedAmount}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* TAB CONTENT: CARDS */}
                        {activeTab === "card" && (
                            <div className="p-4 space-y-4 flex-1">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-foreground block mb-1">Card Number</label>
                                        <input
                                            type="text"
                                            placeholder="4532 •••• •••• 8892"
                                            className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-foreground text-sm font-mono"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-foreground block mb-1">Expiry</label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-foreground text-sm font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-foreground block mb-1">CVV</label>
                                            <input
                                                type="password"
                                                placeholder="123"
                                                maxLength={4}
                                                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-foreground text-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handlePayment("Credit/Debit Card", "card")}
                                    className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    Pay ₹{formattedAmount} via Card
                                </button>
                            </div>
                        )}

                        {/* TAB CONTENT: NETBANKING */}
                        {activeTab === "netbanking" && (
                            <div className="p-4 space-y-3 flex-1">
                                <p className="text-xs font-semibold text-muted-foreground">Select popular Indian bank:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra", "Punjab National Bank"].map((bank) => (
                                        <button
                                            key={bank}
                                            onClick={() => handlePayment(bank, "netbanking")}
                                            className="p-3 text-left border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-zinc-900 hover:border-emerald-500 transition text-xs font-bold text-foreground flex items-center justify-between"
                                        >
                                            <span>{bank}</span>
                                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB CONTENT: WALLETS */}
                        {activeTab === "wallet" && (
                            <div className="p-4 space-y-3 flex-1">
                                <p className="text-xs font-semibold text-muted-foreground">Select wallet:</p>
                                <div className="space-y-2">
                                    {["PhonePe Wallet", "Amazon Pay", "Paytm Balance", "MobiKwik"].map((walletName) => (
                                        <button
                                            key={walletName}
                                            onClick={() => handlePayment(walletName, "wallet")}
                                            className="w-full p-3 border border-gray-200 dark:border-zinc-800 rounded-xl hover:bg-emerald-50 dark:hover:bg-zinc-900 hover:border-emerald-500 transition text-sm font-bold text-foreground flex items-center justify-between"
                                        >
                                            <span>{walletName}</span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer Security Badges */}
                        <div className="p-3 bg-gray-50 dark:bg-zinc-900/60 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-bit Encrypted
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-semibold text-foreground">
                                <span className="font-black italic text-emerald-600">UPI</span> NPCI Certified
                            </span>
                        </div>
                    </div>
                )}

                {/* Step: Processing Payment */}
                {step === "processing" && (
                    <div className="flex flex-col items-center justify-center p-12 text-center h-[55vh] space-y-4">
                        <div className="relative">
                            <Loader2 className="w-14 h-14 text-emerald-600 animate-spin" />
                            <span className="absolute inset-0 flex items-center justify-center font-bold text-xs text-emerald-800">
                                UPI
                            </span>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-foreground">Verifying UPI Transaction...</h3>
                            <p className="text-xs text-muted-foreground max-w-xs">
                                Connecting with NPCI and bank server for confirmation. Please do not close or refresh this window.
                            </p>
                        </div>
                    </div>
                )}

                {/* Step: Success Confirmation */}
                {step === "success" && (
                    <div className="flex flex-col items-center justify-center p-12 text-center h-[55vh] space-y-4 animate-in fade-in zoom-in-95">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 shadow-lg border border-emerald-300">
                            <CheckCircle2 className="w-10 h-10 fill-emerald-600 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-extrabold text-foreground">Payment Successful!</h3>
                            <p className="text-xs text-muted-foreground">
                                Paid ₹{formattedAmount} via UPI. Updating order status...
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

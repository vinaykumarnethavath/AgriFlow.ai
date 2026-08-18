"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Sprout, Mail, Phone, Store, Factory, ShoppingCart, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { UserRole } from "@/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";

type AuthMethod = "email" | "phone";
type EmailStep = "form" | "otp";

export default function RegisterPage() {
    const [authMethod, setAuthMethod] = useState<AuthMethod>("email");

    // ── Email form state ──────────────────────────────────────────────────────
    const [emailStep, setEmailStep] = useState<EmailStep>("form");
    const [emailFormData, setEmailFormData] = useState({
        full_name: "", email: "", password: "", confirm_password: "",
        role: UserRole.FARMER as UserRole,
    });
    const [otpCode, setOtpCode] = useState("");
    const otpInputRef = useRef<HTMLInputElement>(null);
    const [otpSending, setOtpSending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // ── Phone form state ──────────────────────────────────────────────────────
    const [phone, setPhone] = useState("");
    const [phoneFullName, setPhoneFullName] = useState("");
    const [phonePassword, setPhonePassword] = useState("");
    const [phoneConfirmPassword, setPhoneConfirmPassword] = useState("");
    const [phoneRole, setPhoneRole] = useState<UserRole>(UserRole.FARMER);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(true);

    const { login } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();

    const inputCls = "w-full rounded-lg border border-input bg-background px-4 py-2 text-sm outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/10 placeholder:text-muted-foreground text-foreground";
    const selectCls = "w-full rounded-lg border border-input bg-background px-4 py-2 text-sm outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/10 text-foreground";

    // ── Resend cooldown timer ─────────────────────────────────────────────────
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    // ── Auto-focus OTP input when switching to OTP step ───────────────────────
    useEffect(() => {
        if (emailStep === "otp") {
            setTimeout(() => otpInputRef.current?.focus(), 100);
        }
    }, [emailStep]);

    // ── Send registration OTP ─────────────────────────────────────────────────
    const handleSendOtp = async () => {
        const { full_name, email, password, confirm_password, role } = emailFormData;

        if (!full_name.trim()) { setError("Full name is required"); return; }
        if (!email.trim()) { setError("Email is required"); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
        if (password !== confirm_password) { setError("Passwords do not match"); return; }

        setError("");
        setOtpSending(true);
        try {
            await api.post("/auth/send-register-otp", {
                email: email.toLowerCase().trim(),
                role,
            });
            setEmailStep("otp");
            setOtpCode("");
            setResendCooldown(60);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to send verification code");
        } finally {
            setOtpSending(false);
        }
    };

    // ── Resend OTP ────────────────────────────────────────────────────────────
    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setError("");
        setOtpSending(true);
        try {
            await api.post("/auth/send-register-otp", {
                email: emailFormData.email.toLowerCase().trim(),
                role: emailFormData.role,
            });
            setResendCooldown(60);
            setOtpCode("");
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to resend verification code");
        } finally {
            setOtpSending(false);
        }
    };

    // ── Email Registration with OTP ───────────────────────────────────────────
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (emailStep === "form") {
            // First step: validate form and send OTP
            await handleSendOtp();
            return;
        }

        // Second step: submit registration with OTP code
        if (otpCode.length !== 6) {
            setError("Please enter the 6-digit verification code");
            return;
        }

        const { full_name, email, password, role } = emailFormData;

        setLoading(true);
        try {
            await api.post("/auth/register", {
                email: email.toLowerCase().trim(),
                password,
                full_name,
                role,
                email_otp_code: otpCode,
            });
            const { data } = await api.post("/auth/login", { email: email.toLowerCase().trim(), password, role });
            const user = { id: data.id, email, role: data.role, full_name };
            localStorage.setItem("user", JSON.stringify(user));
            login(data.access_token, data.role);
            router.push(`/dashboard/${data.role}`);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    // ── Phone Registration ────────────────────────────────────────────────────
    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!phone || phone.length !== 10) { setError("Enter a valid 10-digit phone number"); return; }
        if (phonePassword !== phoneConfirmPassword) { setError("Passwords do not match"); return; }
        if (!phoneFullName.trim()) { setError("Full name is required"); return; }

        setLoading(true);
        try {
            await api.post("/auth/register", {
                phone_number: phone,
                password: phonePassword,
                full_name: phoneFullName,
                role: phoneRole,
            });
            const { data } = await api.post("/auth/login", {
                phone_number: phone,
                password: phonePassword,
                role: phoneRole,
            });
            const user = { id: data.id, phone_number: phone, role: data.role, full_name: phoneFullName };
            localStorage.setItem("user", JSON.stringify(user));
            login(data.access_token, data.role);
            router.push(`/dashboard/${data.role}`);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Registration failed");
            setLoading(false);
        }
    };

    const roleButtons = (selectedRole: UserRole, onSelect: (role: UserRole) => void) => (
        <div className="flex gap-1.5">
            {[
                { id: UserRole.FARMER, label: "Farmer", icon: Sprout },
                { id: UserRole.SHOP, label: "Shop", icon: Store },
                { id: UserRole.MANUFACTURER, label: "Mill", icon: Factory },
                { id: UserRole.CUSTOMER, label: "Customer", icon: ShoppingCart }
            ].map(role => (
                <button
                    key={role.id} type="button"
                    onClick={() => onSelect(role.id)}
                    className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-lg border transition-colors ${selectedRole === role.id ? 'bg-green-100 border-green-500 text-green-700' : 'bg-background border-input text-muted-foreground hover:bg-muted'}`}
                >
                    <role.icon className="h-5 w-5 mb-0.5" />
                    <span className="text-[10px] font-bold leading-none">{role.label}</span>
                </button>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-colors duration-300 relative">
            <div className="absolute top-4 right-4 flex items-center gap-3">
                <LanguageSelector direction="down" />
                <ThemeToggle />
            </div>
            <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-lg overflow-hidden">
                {/* Header */}
                <div className="p-3 text-center border-b border-border">
                    <div className="flex justify-center mb-1">
                        <div className="w-28 flex items-center justify-center">
                            <img src="/logo.png?v=5" alt="AgriFlow Logo" className="w-full h-auto object-contain drop-shadow-md" />
                        </div>
                    </div>
                    <h1 className="text-xl font-bold text-foreground mt-0.5">Join AgriFlow</h1>
                    <p className="text-xs text-muted-foreground">Create an account to get started</p>
                </div>

                <div className="p-4 space-y-3">
                    {/* Method Toggle */}
                    <div className="flex rounded-lg border border-border overflow-hidden">
                        <button type="button"
                            onClick={() => { setAuthMethod("email"); setError(""); setEmailStep("form"); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-semibold transition-colors ${authMethod === "email" ? "bg-green-600 text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>
                            <Mail className="h-4 w-4" /> Email
                        </button>
                        <button type="button"
                            onClick={() => { setAuthMethod("phone"); setError(""); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-semibold transition-colors ${authMethod === "phone" ? "bg-green-600 text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>
                            <Phone className="h-4 w-4" /> Phone Number
                        </button>
                    </div>

                    {/* ── EMAIL FORM ── */}
                    {authMethod === "email" && (
                        <form onSubmit={handleEmailSubmit} className="space-y-3">
                            {emailStep === "form" ? (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-muted-foreground block">Full Name</label>
                                        <input type="text" placeholder="John Doe" required autoComplete="name"
                                            value={emailFormData.full_name}
                                            onChange={e => setEmailFormData(p => ({ ...p, full_name: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-muted-foreground block">Email Address</label>
                                        <input type="email" placeholder="user@example.com" required autoComplete="email"
                                            value={emailFormData.email}
                                            onChange={e => setEmailFormData(p => ({ ...p, email: e.target.value }))}
                                            className={inputCls} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-muted-foreground block">Password</label>
                                            <input type="password" required autoComplete="new-password" placeholder="••••••••"
                                                value={emailFormData.password}
                                                onChange={e => {
                                                    const v = e.target.value;
                                                    setEmailFormData(p => ({ ...p, password: v }));
                                                    setPasswordsMatch(!emailFormData.confirm_password || v === emailFormData.confirm_password);
                                                }}
                                                className={inputCls} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-muted-foreground block">Confirm</label>
                                            <input type="password" required autoComplete="new-password" placeholder="••••••••"
                                                value={emailFormData.confirm_password}
                                                onChange={e => {
                                                    const v = e.target.value;
                                                    setEmailFormData(p => ({ ...p, confirm_password: v }));
                                                    setPasswordsMatch(!v || emailFormData.password === v);
                                                }}
                                                className={`w-full rounded-lg border px-4 py-2 text-sm outline-none transition-all focus:ring-2 placeholder:text-muted-foreground text-foreground ${!passwordsMatch ? "border-red-500 bg-red-50 focus:ring-red-500/10" : "border-input bg-background focus:border-green-500 focus:ring-green-500/10"}`} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-muted-foreground block">Your Role</label>
                                        {roleButtons(emailFormData.role, (role) => setEmailFormData(p => ({ ...p, role })))}
                                    </div>
                                    {error && <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100 text-center text-xs font-medium">{error}</div>}
                                    <button type="submit" disabled={otpSending || !passwordsMatch}
                                        className="w-full bg-green-600 text-white rounded-lg py-2 font-bold shadow-md hover:bg-green-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none">
                                        {otpSending
                                            ? <span className="flex items-center justify-center gap-2"><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending Code...</span>
                                            : <span className="flex items-center justify-center gap-2"><Mail className="h-4 w-4" /> Verify Email & Create Account</span>}
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* OTP Verification Step */}
                                    <div className="text-center space-y-2 py-1">
                                        <div className="flex justify-center">
                                            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                                <ShieldCheck className="h-6 w-6 text-green-600" />
                                            </div>
                                        </div>
                                        <h2 className="text-lg font-bold text-foreground">Verify Your Email</h2>
                                        <p className="text-xs text-muted-foreground px-2">
                                            We sent a 6-digit code to <span className="text-foreground font-bold">{emailFormData.email}</span>
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-muted-foreground block text-center">Enter Verification Code</label>
                                        <input
                                            ref={otpInputRef}
                                            type="text"
                                            placeholder="123456"
                                            value={otpCode}
                                            onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                                            maxLength={6}
                                            required
                                            autoComplete="one-time-code"
                                            className="w-full text-center text-2xl font-mono tracking-[0.4em] rounded-lg border border-input bg-muted/30 px-4 py-3 outline-none transition-all focus:border-green-500 focus:bg-background focus:ring-4 focus:ring-green-500/5 text-foreground"
                                        />
                                    </div>
                                    {error && <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100 text-center text-xs font-medium">{error}</div>}
                                    <button type="submit" disabled={loading || otpCode.length !== 6}
                                        className="w-full bg-green-600 text-white rounded-lg py-2 font-bold shadow-md hover:bg-green-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none">
                                        {loading
                                            ? <span className="flex items-center justify-center gap-2"><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating Account...</span>
                                            : <span className="flex items-center justify-center gap-2"><ShieldCheck className="h-4 w-4" /> Verify & Create Account</span>}
                                    </button>
                                    <div className="flex items-center justify-between text-xs pt-1">
                                        <button type="button"
                                            onClick={() => { setEmailStep("form"); setError(""); setOtpCode(""); }}
                                            className="text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1 transition-colors">
                                            <ArrowLeft className="h-3 w-3" /> Back
                                        </button>
                                        <button type="button"
                                            onClick={handleResendOtp}
                                            disabled={resendCooldown > 0 || otpSending}
                                            className="text-green-600 hover:text-green-700 font-bold flex items-center gap-1 transition-colors disabled:opacity-50 disabled:pointer-events-none">
                                            <RefreshCw className={`h-3 w-3 ${otpSending ? 'animate-spin' : ''}`} />
                                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                                        </button>
                                    </div>
                                </>
                            )}
                            <div className="text-center text-sm pt-2">
                                <span className="text-muted-foreground">Already have an account? </span>
                                <Link href="/login" className="text-green-600 font-bold hover:underline">Login Here</Link>
                            </div>
                        </form>
                    )}

                    {/* ── PHONE FORM ── */}
                    {authMethod === "phone" && (
                        <form onSubmit={handlePhoneSubmit} className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-muted-foreground block">Phone Number</label>
                                <div className="flex gap-2">
                                    <span className="flex items-center px-3 rounded-lg border border-input bg-muted text-sm text-muted-foreground font-semibold">+91</span>
                                    <input type="tel" placeholder="9876543210" value={phone}
                                        onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                        maxLength={10} required className={`${inputCls} flex-1`} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-muted-foreground block">Full Name</label>
                                <input type="text" placeholder="John Doe" value={phoneFullName}
                                    onChange={e => setPhoneFullName(e.target.value)} required autoComplete="name" className={inputCls} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-muted-foreground block">Password</label>
                                    <input type="password" placeholder="••••••••" value={phonePassword}
                                        onChange={e => { setPhonePassword(e.target.value); setPasswordsMatch(!phoneConfirmPassword || e.target.value === phoneConfirmPassword); }}
                                        required autoComplete="new-password" className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-muted-foreground block">Confirm</label>
                                    <input type="password" placeholder="••••••••" value={phoneConfirmPassword}
                                        onChange={e => { setPhoneConfirmPassword(e.target.value); setPasswordsMatch(!e.target.value || phonePassword === e.target.value); }}
                                        required autoComplete="new-password"
                                        className={`w-full rounded-lg border px-4 py-2 text-sm outline-none transition-all focus:ring-2 placeholder:text-muted-foreground text-foreground ${!passwordsMatch ? "border-red-500 bg-red-50 focus:ring-red-500/10" : "border-input bg-background focus:border-green-500 focus:ring-green-500/10"}`} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-muted-foreground block">Your Role</label>
                                {roleButtons(phoneRole, setPhoneRole)}
                            </div>
                            {error && <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100 text-center text-xs font-medium">{error}</div>}
                            <button type="submit" disabled={loading}
                                className="w-full bg-green-600 text-white rounded-lg py-2 font-bold shadow-md hover:bg-green-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none">
                                {loading ? <span className="flex items-center justify-center gap-2"><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</span> : "Create Account"}
                            </button>
                            <div className="text-center text-sm pt-2">
                                <span className="text-muted-foreground">Already have an account? </span>
                                <Link href="/login" className="text-green-600 font-bold hover:underline">Login Here</Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

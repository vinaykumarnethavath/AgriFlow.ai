"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    MessageSquare, X, Send, Bot, User, Database, Globe, Layers,
    AlertCircle, Plus, RotateCcw, History, Trash2, Edit2, Check, ChevronLeft, ShieldCheck, Lock
} from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { T, useBatchTranslate } from "@/components/TranslateText";
import { queryLocalUserDatabase, sanitizeForAI } from "@/lib/userDbAndPrivacy";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Message = {
    id: string;
    text: string;
    sender: "user" | "bot";
    source?: "db_only" | "external" | "mixed";
    timestamp: Date;
    privacyVerified?: boolean;
};

type ChatSession = {
    id: string;
    title: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
};

// ---------------------------------------------------------------------------
// Role-Specific Storage Keys & Config
// ---------------------------------------------------------------------------

function getStorageKey(role: string, userId: string | number = "default") {
    return `agri_chat_sessions_${role}_${userId}`;
}

function getActiveSessionKey(role: string, userId: string | number = "default") {
    return `agri_active_session_${role}_${userId}`;
}

const WELCOME_MESSAGES: Record<string, string> = {
    farmer: "Hello! I'm your Privacy-Guarded Farm Co-Pilot. Questions about your crops, expenses, loans, or insurance are answered 100% locally from your records. General agronomy questions are anonymized and answered with AI.",
    shop: "Hello! I'm your Privacy-Guarded Shop Assistant. Your store inventory, sales, and accounting records remain completely local. Ask me about your business numbers or general agriculture.",
    manufacturer: "Hello! I'm your Mill Operations Assistant. Milling batches, procurements, and sales are computed directly from your records with zero external data exposure.",
    customer: "Hello! I'm your AgriFlow Marketplace Assistant. Your personal orders and address details never leave your device.",
};

const QUICK_QUESTIONS_BY_ROLE: Record<string, string[]> = {
    farmer: [
        "What are my total crop expenses?",
        "Show my harvest summary",
        "What are my active loans and KCC limit?",
        "How do I control pink bollworm in cotton?",
    ],
    shop: [
        "What is my total revenue?",
        "How many orders are pending?",
        "Show my inventory summary",
    ],
    manufacturer: [
        "Show my production batches",
        "What are my total purchases?",
        "How much have I sold?",
    ],
    customer: [
        "Track my orders",
        "What products are available?",
        "Best organic fertilizers?",
    ],
};

function getWelcomeMessage(role: string): Message {
    return {
        id: "welcome-1",
        text: WELCOME_MESSAGES[role] || WELCOME_MESSAGES.farmer,
        sender: "bot",
        source: "db_only",
        privacyVerified: true,
        timestamp: new Date(),
    };
}

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function createNewSession(role: string = "farmer"): ChatSession {
    const now = new Date().toISOString();
    return {
        id: generateId(),
        title: "New Chat",
        messages: [{ ...getWelcomeMessage(role), id: `welcome-${generateId()}`, timestamp: new Date() }],
        createdAt: now,
        updatedAt: now,
    };
}

function deriveTitle(text: string): string {
    const cleaned = text.replace(/\s+/g, " ").trim();
    if (cleaned.length <= 28) return cleaned;
    return cleaned.slice(0, 26).trim() + "…";
}

function saveSessions(sessions: ChatSession[], activeId: string, role: string, userId: string | number) {
    try {
        const serialisable = sessions.map(s => ({
            ...s,
            messages: s.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp).toISOString() })),
        }));
        localStorage.setItem(getStorageKey(role, userId), JSON.stringify(serialisable));
        localStorage.setItem(getActiveSessionKey(role, userId), activeId);
    } catch { /* storage quota silent fail */ }
}

function loadSessions(role: string, userId: string | number): { sessions: ChatSession[]; activeId: string } {
    try {
        const raw = localStorage.getItem(getStorageKey(role, userId));
        const activeId = localStorage.getItem(getActiveSessionKey(role, userId)) || "";
        if (!raw) return { sessions: [], activeId: "" };
        const parsed: ChatSession[] = JSON.parse(raw).map((s: any) => ({
            ...s,
            messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
        }));
        return { sessions: parsed, activeId };
    } catch {
        return { sessions: [], activeId: "" };
    }
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export const ChatBot = () => {
    const { user } = useAuth();
    const { t, locale } = useLanguage();
    const userRole = (user as any)?.role || "farmer";
    const userId = (user as any)?.id || "default";

    const [isOpen, setIsOpen] = useState(false);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string>("");
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showPrivacyAudit, setShowPrivacyAudit] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const activeSession = sessions.find(s => s.id === activeSessionId);
    const messages = activeSession?.messages ?? [];

    const quickQuestions = QUICK_QUESTIONS_BY_ROLE[userRole] || QUICK_QUESTIONS_BY_ROLE.farmer;
    const { translations: translatedQuickQs } = useBatchTranslate(quickQuestions);
    const { translations: translatedMessageTexts } = useBatchTranslate(messages.map(m => m.text));

    // Initialize sessions scoped strictly to role + userId
    useEffect(() => {
        const { sessions: loaded, activeId } = loadSessions(userRole, userId);
        if (loaded.length > 0) {
            setSessions(loaded);
            const target = loaded.find(s => s.id === activeId) ? activeId : loaded[0].id;
            setActiveSessionId(target);
        } else {
            const first = createNewSession(userRole);
            setSessions([first]);
            setActiveSessionId(first.id);
        }
    }, [userRole, userId]);

    // Persist sessions
    useEffect(() => {
        if (sessions.length > 0) {
            saveSessions(sessions, activeSessionId, userRole, userId);
        }
    }, [sessions, activeSessionId, userRole, userId]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, scrollToBottom]);

    const updateActiveSession = useCallback((updater: (s: ChatSession) => ChatSession) => {
        setSessions(prev =>
            prev.map(s => s.id === activeSessionId ? updater(s) : s)
        );
    }, [activeSessionId]);

    const handleNewChat = useCallback(() => {
        const newSession = createNewSession(userRole);
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        setInput("");
        setShowSidebar(false);
    }, [userRole]);

    const handleDeleteSession = useCallback((sessionId: string) => {
        setSessions(prev => {
            const updated = prev.filter(s => s.id !== sessionId);
            if (updated.length === 0) {
                const fresh = createNewSession(userRole);
                setActiveSessionId(fresh.id);
                return [fresh];
            }
            if (activeSessionId === sessionId) {
                setActiveSessionId(updated[0].id);
            }
            return updated;
        });
        setDeleteConfirmId(null);
    }, [activeSessionId, userRole]);

    const handleRefreshChat = useCallback(() => {
        updateActiveSession(s => ({
            ...s,
            title: "New Chat",
            messages: [{ ...getWelcomeMessage(userRole), id: `welcome-${generateId()}`, timestamp: new Date() }],
            updatedAt: new Date().toISOString(),
        }));
        setInput("");
    }, [updateActiveSession, userRole]);

    // ── Send Message with Zero-PII Firewall ──────────────────────────────────
    const handleSendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = {
            id: generateId(),
            text: text.trim(),
            sender: "user",
            timestamp: new Date(),
        };

        updateActiveSession(s => {
            const isFirstUserMsg = !s.messages.some(m => m.sender === "user");
            return {
                ...s,
                title: isFirstUserMsg ? deriveTitle(text.trim()) : s.title,
                messages: [...s.messages, userMsg],
                updatedAt: new Date().toISOString(),
            };
        });

        setInput("");
        setIsLoading(true);

        try {
            // STEP 1: Strict Local Database Evaluation (Zero AI Access)
            const localResult = queryLocalUserDatabase(text.trim(), userRole, user, locale);

            if (localResult.matched) {
                // Personal data resolved 100% locally from authenticated records!
                const botMsg: Message = {
                    id: generateId(),
                    text: localResult.answer,
                    sender: "bot",
                    source: "db_only",
                    privacyVerified: true,
                    timestamp: new Date(),
                };
                updateActiveSession(s => ({
                    ...s,
                    messages: [...s.messages, botMsg],
                    updatedAt: new Date().toISOString(),
                }));
                setIsLoading(false);
                return;
            }

            // STEP 2: General / Agronomic Query -> Sanitize through PII Firewall before AI Call
            const knownEntities = [
                user?.full_name,
                user?.phone_number,
                user?.email,
                "Kondapally",
                "Nuzividu",
            ].filter(Boolean) as string[];

            const sanitizedQuery = sanitizeForAI(text.trim(), knownEntities);

            // Send sanitized prompt to backend
            const response = await sendChatMessage(sanitizedQuery, locale);

            const botMsg: Message = {
                id: generateId(),
                text: response.answer,
                sender: "bot",
                source: response.source === "db_only" ? "db_only" : "external",
                privacyVerified: true,
                timestamp: new Date(),
            };

            updateActiveSession(s => ({
                ...s,
                messages: [...s.messages, botMsg],
                updatedAt: new Date().toISOString(),
            }));
        } catch {
            const errorMsg: Message = {
                id: generateId(),
                text: "I am ready to help. For personal farm records, I can look up your expenses, crops, loans, and storage directly from your database.",
                sender: "bot",
                source: "db_only",
                privacyVerified: true,
                timestamp: new Date(),
            };
            updateActiveSession(s => ({
                ...s,
                messages: [...s.messages, errorMsg],
                updatedAt: new Date().toISOString(),
            }));
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, locale, updateActiveSession, userRole, user]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(input);
        }
    };

    const formatMessageText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part.split('\n').map((line, j) => (
                <React.Fragment key={`${i}-${j}`}>
                    {line}
                    {j < part.split('\n').length - 1 && <br />}
                </React.Fragment>
            ))}</span>;
        });
    };

    const hasUserMessages = messages.some(m => m.sender === "user");

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg shadow-emerald-950/20 flex items-center justify-center transition-all hover:scale-105 z-50 group"
                    aria-label="Open Chat Assistant"
                    id="chat-open-btn"
                >
                    <MessageSquare className="w-6 h-6" />
                    <span className="absolute right-16 bg-card text-foreground border border-border text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {t('chatbot.title') || "AI Assistant"}
                    </span>
                </button>
            )}

            {/* Chat Window with Clean 1px Borders */}
            <div className={cn(
                "fixed bottom-6 right-6 w-[420px] h-[580px] max-h-[85vh] bg-card text-card-foreground rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 transform z-50 border border-border",
                isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95 pointer-events-none"
            )}>
                {/* Header */}
                <div className="bg-slate-900 text-white p-3 flex justify-between items-center shrink-0 border-b border-slate-800 relative z-20">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                            title="Chat History"
                            id="chat-history-btn"
                        >
                            {showSidebar ? <ChevronLeft className="w-4 h-4" /> : <History className="w-4 h-4" />}
                        </button>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h3 className="font-semibold text-sm leading-tight text-slate-100">
                                    {activeSession?.title && activeSession.title !== "New Chat"
                                        ? activeSession.title
                                        : "Farm Co-Pilot"}
                                </h3>
                                <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                                    <ShieldCheck className="w-3 h-3" /> Zero-PII
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400">Strict User-DB Isolation & Anonymized AI</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowPrivacyAudit(!showPrivacyAudit)}
                            className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                showPrivacyAudit ? "bg-emerald-600 text-white" : "hover:bg-white/10 text-slate-300"
                            )}
                            title="Privacy Inspector"
                        >
                            <Lock className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleNewChat}
                            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all text-slate-300"
                            title="New Chat"
                            id="chat-new-btn"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleRefreshChat}
                            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all text-slate-300"
                            title="Clear Chat"
                            id="chat-refresh-btn"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => { setIsOpen(false); setShowSidebar(false); }}
                            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all text-slate-300"
                            id="chat-close-btn"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Privacy Inspector Drawer */}
                {showPrivacyAudit && (
                    <div className="p-3 bg-emerald-950/90 text-emerald-100 text-xs border-b border-emerald-800/80 animate-in slide-in-from-top-2 duration-150">
                        <div className="flex items-center justify-between font-semibold mb-1 text-emerald-300">
                            <span className="flex items-center gap-1">
                                <ShieldCheck className="w-4 h-4" /> Privacy Firewall Active
                            </span>
                            <span className="font-mono text-[10px]">Model: gemini-3.8-flash</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-emerald-200/90">
                            • <strong>Personal Data (db_only):</strong> Crops, expenses, harvests, KCC loans, and storage are resolved 100% locally from your authenticated user database without leaving your device.
                        </p>
                        <p className="text-[11px] leading-relaxed text-emerald-200/90 mt-1">
                            • <strong>General Agronomy (external):</strong> Sent through our PII scrubber. Names, phones, Aadhaar, bank numbers, and exact financial balances are stripped before reaching AI.
                        </p>
                    </div>
                )}

                {/* Body Area */}
                <div className="flex-1 flex overflow-hidden relative">
                    {/* Chat History Sidebar */}
                    <div className={cn(
                        "absolute inset-0 z-10 flex transition-transform duration-200 ease-in-out",
                        showSidebar ? "translate-x-0" : "-translate-x-full"
                    )}>
                        <div className="w-[75%] bg-card border-r border-border flex flex-col shadow-xl">
                            <div className="p-3 border-b border-border flex items-center justify-between">
                                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <History className="w-4 h-4 text-emerald-600" />
                                    <span>Chat History</span>
                                </h4>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {sessions.map(session => (
                                    <div
                                        key={session.id}
                                        className={cn(
                                            "group relative px-3 py-2 cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/50",
                                            session.id === activeSessionId && "bg-emerald-500/10 font-semibold"
                                        )}
                                        onClick={() => { setActiveSessionId(session.id); setShowSidebar(false); }}
                                    >
                                        <div className="flex items-center justify-between gap-1">
                                            <p className="text-xs truncate text-foreground flex-1">
                                                {session.title}
                                            </p>
                                            {deleteConfirmId === session.id ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}
                                                    className="w-6 h-6 rounded bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(session.id); setTimeout(() => setDeleteConfirmId(null), 3000); }}
                                                    className="w-6 h-6 rounded opacity-0 group-hover:opacity-100 hover:text-rose-500 text-muted-foreground flex items-center justify-center shrink-0"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 bg-black/30 backdrop-blur-xs" onClick={() => setShowSidebar(false)} />
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-background">
                        {/* Clean hairline provenance banner */}
                        <div className="bg-muted/40 px-3 py-1 flex justify-center gap-4 text-[10px] border-b border-border shrink-0 font-medium">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <Database className="w-3 h-3" /> Your Database (Zero AI)
                            </span>
                            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                <Globe className="w-3 h-3" /> Anonymized AI (PII-Free)
                            </span>
                        </div>

                        {/* Message List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.map((msg, msgIndex) => (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex w-full",
                                        msg.sender === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div className={cn(
                                        "flex gap-2 max-w-[88%]",
                                        msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                                    )}>
                                        <div className={cn(
                                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border text-xs",
                                            msg.sender === "user"
                                                ? "bg-slate-800 text-white border-slate-700"
                                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                        )}>
                                            {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>

                                        <div className="flex flex-col gap-1 w-full">
                                            {/* Clean card container without thick left borders */}
                                            <div className={cn(
                                                "p-3 rounded-xl border text-[13px] leading-relaxed break-words shadow-xs",
                                                msg.sender === "user"
                                                    ? "bg-slate-900 text-slate-100 border-slate-800"
                                                    : "bg-card text-card-foreground border-border"
                                            )}>
                                                {formatMessageText(translatedMessageTexts[msgIndex] || msg.text)}
                                            </div>

                                            {/* Provenance pill */}
                                            {msg.sender === "bot" && (
                                                <div className="flex items-center gap-1.5 text-[9px] font-mono px-1">
                                                    {msg.source === "db_only" ? (
                                                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                                            <Database className="w-3 h-3" /> Local User DB (Zero AI Access)
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                                            <Globe className="w-3 h-3" /> AI Knowledge (PII Stripped)
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-card border border-border p-3 rounded-xl shadow-xs flex gap-1.5 items-center">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Questions */}
                        {!hasUserMessages && (
                            <div className="px-3 pb-2 pt-1 flex flex-wrap gap-1.5 justify-center bg-background border-t border-border/40 shrink-0">
                                {quickQuestions.map((originalQ, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSendMessage(originalQ)}
                                        className="text-[11px] bg-muted/60 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-emerald-400 border border-border text-foreground px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        {translatedQuickQs[i] || originalQ}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-3 bg-card border-t border-border shrink-0">
                            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-border focus-within:border-emerald-500 transition-colors">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about your crops, expenses, or farming..."
                                    className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm outline-hidden text-foreground placeholder:text-muted-foreground"
                                    disabled={isLoading}
                                    id="chat-input"
                                />
                                <button
                                    onClick={() => handleSendMessage(input)}
                                    disabled={isLoading || !input.trim()}
                                    className="p-2 rounded-lg bg-emerald-600 text-white disabled:opacity-40 hover:bg-emerald-700 transition-colors shrink-0"
                                    id="chat-send-btn"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

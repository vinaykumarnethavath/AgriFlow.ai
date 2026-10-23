"use client";

import React, { useEffect, useState, useRef } from "react";
import {
    getOrCreateP2PChat,
    getChannelMessages,
    sendChannelMessage,
    ChatChannelInfo,
    ChatMessageItem
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
    X,
    Send,
    Loader2,
    Phone,
    MessageSquare,
    Store,
    UserCheck,
    CheckCheck,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetUserId: number;
    targetName: string;
    targetRole?: "shop" | "farmer" | "manufacturer" | "customer" | string;
    targetPhone?: string | null;
    orderId?: number;
    orderSummary?: string;
}

export default function OrderChatModal({
    isOpen,
    onClose,
    targetUserId,
    targetName,
    targetRole = "shop",
    targetPhone,
    orderId,
    orderSummary,
}: OrderChatModalProps) {
    const { user } = useAuth();
    const [channel, setChannel] = useState<ChatChannelInfo | null>(null);
    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Load channel and messages
    useEffect(() => {
        if (!isOpen || !targetUserId) return;

        let isMounted = true;
        setLoading(true);

        const initChat = async () => {
            try {
                const ch = await getOrCreateP2PChat(targetUserId);
                if (!isMounted) return;
                setChannel(ch);

                const msgs = await getChannelMessages(ch.id);
                if (!isMounted) return;
                setMessages(msgs);
                setLoading(false);
                setTimeout(scrollToBottom, 100);

                // Start polling every 3 seconds for live conversation
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = setInterval(async () => {
                    try {
                        const updatedMsgs = await getChannelMessages(ch.id);
                        if (isMounted) {
                            setMessages(prev => {
                                if (updatedMsgs.length !== prev.length) {
                                    setTimeout(scrollToBottom, 50);
                                    return updatedMsgs;
                                }
                                return prev;
                            });
                        }
                    } catch (_) {}
                }, 3000);
            } catch (err) {
                console.error("Failed to initialize chat:", err);
                if (isMounted) setLoading(false);
            }
        };

        initChat();

        return () => {
            isMounted = false;
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [isOpen, targetUserId]);

    const handleSend = async (textToSend?: string) => {
        const text = (textToSend || inputText).trim();
        if (!text || !channel) return;

        try {
            setSending(true);
            setInputText("");
            const newMsg = await sendChannelMessage(channel.id, text);
            setMessages(prev => [...prev, newMsg]);
            setTimeout(scrollToBottom, 50);
        } catch (err) {
            console.error("Failed to send message:", err);
            alert("Could not send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const handleQuickReply = (prompt: string) => {
        handleSend(prompt);
    };

    if (!isOpen) return null;

    const quickPrompts = user?.role === "farmer"
        ? [
            orderId ? `Hi! What is the estimated delivery time for Order #${orderId}?` : "Hi! Is this fertilizer in stock?",
            "Can I get a discount if I buy multiple bags?",
            "Please call me once the fertilizer is dispatched."
        ]
        : [
            orderId ? `Hello! Order #${orderId} is being prepared and will be dispatched soon.` : "Hello! How can I assist you?",
            "Payment received, thank you for your order!",
            "Please confirm your exact landmark for delivery."
        ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl flex flex-col h-[600px] max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-green-700 via-emerald-700 to-teal-800 text-white flex items-center justify-between shrink-0 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-white text-base shrink-0 shadow-inner">
                            {targetRole === "shop" ? <Store className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-base truncate">{targetName}</h3>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/20">
                                    {targetRole}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-green-100">
                                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                                <span>Direct Chat · Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {targetPhone && (
                            <a
                                href={`tel:${targetPhone}`}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                                title={`Call ${targetPhone}`}
                            >
                                <Phone className="w-4 h-4" />
                            </a>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Order Context Pill */}
                {orderId && (
                    <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 shrink-0">
                        <span className="font-medium flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            Regarding Order <span className="font-bold text-emerald-700 dark:text-emerald-300">#{orderId}</span>
                            {orderSummary && <span className="text-muted-foreground truncate max-w-[200px]">({orderSummary})</span>}
                        </span>
                        <span className="text-[10px] bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                            Connected
                        </span>
                    </div>
                )}

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                            <p className="text-sm">Connecting chat channel...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 flex items-center justify-center mb-3 shadow-inner">
                                <MessageSquare className="w-7 h-7" />
                            </div>
                            <h4 className="font-bold text-foreground text-sm">Start your conversation</h4>
                            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                                Ask about fertilizer application, stock availability, pricing, or coordinate delivery timing.
                            </p>

                            <div className="w-full mt-4 space-y-1.5">
                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-left">Quick Messages:</p>
                                {quickPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuickReply(prompt)}
                                        className="w-full text-left text-xs p-2.5 rounded-xl border border-border bg-card hover:bg-muted/60 hover:border-green-400 transition-all text-card-foreground cursor-pointer flex items-center justify-between group"
                                    >
                                        <span className="truncate pr-2">"{prompt}"</span>
                                        <Send className="w-3 h-3 text-muted-foreground group-hover:text-green-600 shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg) => {
                                const isSelf = msg.sender_id === user?.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
                                    >
                                        <div className="flex items-center gap-1.5 mb-1 px-1">
                                            <span className="text-[10px] text-muted-foreground font-semibold">
                                                {isSelf ? "You" : msg.sender_name}
                                            </span>
                                            <span className="text-[9px] text-muted-foreground/70">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                                                isSelf
                                                    ? "bg-green-600 text-white rounded-tr-xs"
                                                    : "bg-card border border-border text-card-foreground rounded-tl-xs"
                                            }`}
                                        >
                                            <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.message_text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Quick Prompts Bar (when there are messages already) */}
                {messages.length > 0 && (
                    <div className="px-3 py-1.5 bg-card border-t border-border flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                        {quickPrompts.slice(0, 2).map((p, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuickReply(p)}
                                className="text-[11px] whitespace-nowrap bg-muted hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-700 dark:hover:text-green-300 text-muted-foreground px-2.5 py-1 rounded-full border border-border transition-colors cursor-pointer shrink-0"
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Footer */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="p-3 bg-card border-t border-border flex items-center gap-2 shrink-0"
                >
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={`Message ${targetName}...`}
                        className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-muted-foreground"
                    />
                    <Button
                        type="submit"
                        disabled={sending || !inputText.trim()}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 h-[42px] shrink-0 font-semibold"
                    >
                        {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-1" /> Send
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}

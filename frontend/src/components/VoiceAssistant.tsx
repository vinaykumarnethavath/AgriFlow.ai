"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mic, MicOff, X, Volume2, VolumeX, Loader2,
    CheckCircle2, Check, AlertCircle, Navigation, ArrowRight,
    Sparkles, Languages
} from "lucide-react";
import { useLanguage, LANGUAGES } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useVoiceCommand, VoiceStatus } from "@/hooks/useVoiceCommand";
import { parseVoiceIntent, VoiceIntent } from "@/lib/voiceIntentParser";
import { executeVoiceAction, VoiceActionResult } from "@/lib/voiceActionExecutor";
import { LargeWaveform } from "@/components/voice/VoiceWaveform";
import { VoiceCommandChips } from "@/components/voice/VoiceCommandChip";

// ── Status Labels ────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, Record<VoiceStatus, string>> = {
    en: {
        idle: "Tap the microphone to start",
        listening: "Listening... Speak now",
        processing: "Understanding your command...",
        speaking: "Speaking...",
        error: "Something went wrong",
        unsupported: "Voice not supported in this browser",
    },
    hi: {
        idle: "माइक्रोफ़ोन दबाएँ",
        listening: "सुन रहा हूँ... बोलिए",
        processing: "समझ रहा हूँ...",
        speaking: "बोल रहा हूँ...",
        error: "कुछ गलत हो गया",
        unsupported: "इस ब्राउज़र में वॉइस उपलब्ध नहीं है",
    },
    te: {
        idle: "మైక్రోఫోన్ నొక్కండి",
        listening: "వింటున్నాను... చెప్పండి",
        processing: "అర్థం చేసుకుంటున్నాను...",
        speaking: "చెబుతున్నాను...",
        error: "ఏదో తప్పు జరిగింది",
        unsupported: "ఈ బ్రౌజర్‌లో వాయిస్ అందుబాటులో లేదు",
    },
};

function getStatusLabel(locale: string, status: VoiceStatus): string {
    const labels = STATUS_LABELS[locale] || STATUS_LABELS.en;
    return labels[status] || STATUS_LABELS.en[status];
}

// ── Intent Labels ────────────────────────────────────────────────────────────

const INTENT_ICONS: Record<string, React.ReactNode> = {
    check_price: <Sparkles className="h-4 w-4" />,
    check_weather: <Sparkles className="h-4 w-4" />,
    log_expense: <ArrowRight className="h-4 w-4" />,
    check_expenses: <Sparkles className="h-4 w-4" />,
    navigate: <Navigation className="h-4 w-4" />,
    fallback_chat: <Sparkles className="h-4 w-4" />,
};

const INTENT_LABELS: Record<string, string> = {
    check_price: "Checking price",
    check_weather: "Checking weather",
    log_expense: "Logging expense",
    check_expenses: "Checking expenses",
    navigate: "Navigating",
    fallback_chat: "Asking AI assistant",
};

// ── Main Component ───────────────────────────────────────────────────────────

export function VoiceAssistant() {
    const router = useRouter();
    const { locale } = useLanguage();
    const { user } = useAuth();
    const voice = useVoiceCommand(locale);

    const [isOpen, setIsOpen] = useState(false);
    const [result, setResult] = useState<VoiceActionResult | null>(null);
    const [detectedIntent, setDetectedIntent] = useState<VoiceIntent | null>(null);
    const [pendingConfirmation, setPendingConfirmation] = useState<VoiceIntent | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [fallbackText, setFallbackText] = useState("");
    const processedRef = useRef(false);

    // Process transcript when speech recognition ends
    useEffect(() => {
        if (voice.status === "processing" && !processedRef.current) {
            processedRef.current = true;
            const finalCommand = voice.transcript.trim() || voice.interimTranscript.trim();
            if (finalCommand) {
                handleProcessTranscript(finalCommand);
            } else {
                // If the microphone didn't pick up any speech, just reset
                voice.setStatus("idle");
            }
        }
        // Reset the processed flag when going back to idle/listening
        if (voice.status === "idle" || voice.status === "listening") {
            processedRef.current = false;
        }
    }, [voice.status, voice.transcript, voice.interimTranscript]);

    const handleProcessTranscript = async (text: string) => {
        setIsExecuting(true);
        setResult(null);

        // Parse intent
        const intent = parseVoiceIntent(text, locale);
        setDetectedIntent(intent);
        setPendingConfirmation(intent);
        setIsExecuting(false);
    };

    const confirmIntent = async () => {
        if (!pendingConfirmation) return;
        setIsExecuting(true);
        const intent = pendingConfirmation;
        setPendingConfirmation(null);

        // Execute action
        try {
            const actionResult = await executeVoiceAction(intent, locale);
            setResult(actionResult);

            // Speak the result
            if (actionResult.message) {
                voice.speak(actionResult.message);
            } else {
                voice.setStatus("idle");
            }

            // Navigate if needed (after a short delay for TTS to start)
            if (actionResult.navigateTo) {
                setTimeout(() => {
                    router.push(actionResult.navigateTo!);
                }, 2000);
            }
        } catch {
            setResult({
                success: false,
                message: "Sorry, something went wrong. Please try again.",
            });
            voice.setStatus("idle");
        } finally {
            setIsExecuting(false);
        }
    };

    const cancelIntent = () => {
        setPendingConfirmation(null);
        voice.setStatus("idle");
        voice.resetTranscript();
        processedRef.current = false;
    };

    const handleOpen = () => {
        setIsOpen(true);
        setResult(null);
        setDetectedIntent(null);
        setPendingConfirmation(null);
        setFallbackText("");
        processedRef.current = false;
    };

    const handleClose = () => {
        voice.cancelListening();
        voice.stopSpeaking();
        setIsOpen(false);
        setResult(null);
        setDetectedIntent(null);
        setPendingConfirmation(null);
        setFallbackText("");
        voice.setStatus("idle");
        processedRef.current = false;
    };

    const handleMicClick = () => {
        if (voice.status === "listening") {
            voice.stopListening();
        } else {
            setResult(null);
            setDetectedIntent(null);
            setPendingConfirmation(null);
            setFallbackText("");
            processedRef.current = false;
            voice.resetTranscript();
            voice.startListening();
        }
    };

    const handleChipCommand = (command: string) => {
        setResult(null);
        setDetectedIntent(null);
        setPendingConfirmation(null);
        processedRef.current = true;
        voice.setStatus("processing");
        handleProcessTranscript(command);
    };

    const handleRetry = () => {
        setResult(null);
        setDetectedIntent(null);
        setPendingConfirmation(null);
        setFallbackText("");
        processedRef.current = false;
        voice.resetTranscript();
        voice.setStatus("idle");
    };

    const handleFallbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fallbackText.trim()) return;
        setResult(null);
        setDetectedIntent(null);
        setPendingConfirmation(null);
        processedRef.current = true;
        voice.setStatus("processing");
        handleProcessTranscript(fallbackText);
    };

    const currentLang = LANGUAGES.find((l) => l.code === locale);

    // Only show for farmer role
    if (user?.role !== "farmer") return null;

    return (
        <>
            {/* ── Floating Action Button ─────────────────────────────── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOpen}
                        id="voice-assistant-fab"
                        className="
                            fixed bottom-6 right-24 z-50
                            h-14 w-14 rounded-full
                            bg-gradient-to-br from-emerald-500 to-green-600
                            text-white shadow-lg shadow-green-500/30
                            flex items-center justify-center
                            hover:shadow-xl hover:shadow-green-500/40
                            transition-shadow duration-300
                            border-2 border-white/20
                        "
                        aria-label="Open Voice Assistant"
                    >
                        <Mic className="h-6 w-6" />
                        {/* Pulse ring */}
                        <span className="absolute inset-0 rounded-full animate-ping bg-green-400/30" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Voice Assistant Modal Overlay ───────────────────────── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={handleClose}
                        />

                        {/* Modal Panel */}
                        <motion.div
                            initial={{ y: 100, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 100, opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="
                                relative w-full max-w-md mx-4 mb-4 sm:mb-0
                                rounded-3xl overflow-hidden
                                bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
                                border border-white/10
                                shadow-2xl shadow-black/50
                            "
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 pt-5 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                                        <Mic className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-sm">
                                            Voice Assistant
                                        </h3>
                                        <div className="flex items-center gap-1 text-[10px] text-white/50">
                                            <Languages className="h-3 w-3" />
                                            <span>{currentLang?.nativeName || "English"}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    <X className="h-4 w-4 text-white/70" />
                                </button>
                            </div>

                            {/* Status Label */}
                            <div className="px-5 py-2">
                                <p className="text-center text-white/60 text-xs font-medium">
                                    {getStatusLabel(locale, voice.status)}
                                </p>
                            </div>

                            {/* Waveform */}
                            <div className="px-5">
                                <LargeWaveform status={voice.status} />
                            </div>

                            {/* Live Transcript */}
                            <div className="px-5 min-h-[48px] flex items-center justify-center">
                                {(voice.transcript || voice.interimTranscript) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="
                                            bg-white/5 border border-white/10 rounded-2xl
                                            px-4 py-2.5 max-w-full
                                        "
                                    >
                                        <p className="text-white/90 text-sm text-center leading-relaxed">
                                            {voice.transcript || (
                                                <span className="text-white/50 italic">
                                                    {voice.interimTranscript}
                                                </span>
                                            )}
                                        </p>
                                    </motion.div>
                                )}
                            </div>

                            {/* Detected Intent Badge */}
                            <AnimatePresence>
                                {detectedIntent && detectedIntent.type !== "fallback_chat" && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex justify-center px-5 py-1"
                                    >
                                        <span className="
                                            inline-flex items-center gap-1.5 px-3 py-1
                                            bg-emerald-500/20 border border-emerald-500/30
                                            text-emerald-300 rounded-full text-[11px] font-medium
                                        ">
                                            {INTENT_ICONS[detectedIntent.type]}
                                            {INTENT_LABELS[detectedIntent.type] || detectedIntent.type}
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Confirmation Step */}
                            {pendingConfirmation && !isExecuting && !result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mx-5 my-2 p-4 bg-emerald-900/40 border border-emerald-500/30 rounded-2xl"
                                >
                                    <p className="text-emerald-100 text-sm mb-3 font-medium">
                                        Did you mean to <strong>{pendingConfirmation.type.replace(/_/g, " ")}</strong>?
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={confirmIntent}
                                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 font-medium"
                                        >
                                            <Check className="h-4 w-4" /> Yes
                                        </button>
                                        <button
                                            onClick={cancelIntent}
                                            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 font-medium"
                                        >
                                            <X className="h-4 w-4" /> No
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Result Display */}
                            <AnimatePresence>
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="mx-5 mt-2 mb-1"
                                    >
                                        <div className={`
                                            rounded-2xl p-4 border
                                            ${result.success
                                                ? "bg-emerald-500/10 border-emerald-500/20"
                                                : "bg-red-500/10 border-red-500/20"
                                            }
                                        `}>
                                            <div className="flex items-start gap-2.5">
                                                {result.success ? (
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                                                ) : (
                                                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                                                )}
                                                <p className="text-white/80 text-sm leading-relaxed">
                                                    {result.message}
                                                </p>
                                            </div>
                                            {result.navigateTo && (
                                                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-300/70">
                                                    <Navigation className="h-3 w-3" />
                                                    <span>Navigating to {result.navigateTo}...</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Error Message & Fallback Input */}
                            {voice.error && (
                                <div className="mx-5 mt-2 mb-1 space-y-3">
                                    <div className="rounded-2xl p-3 bg-red-500/10 border border-red-500/20">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                                            <p className="text-red-300/80 text-xs">
                                                {voice.error}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Fallback text input */}
                                    {!result && (
                                        <form onSubmit={handleFallbackSubmit} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={fallbackText}
                                                onChange={(e) => setFallbackText(e.target.value)}
                                                placeholder="Type your command instead..."
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!fallbackText.trim() || isExecuting}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center"
                                            >
                                                {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* Quick Command Chips */}
                            {(voice.status === "idle" || voice.status === "error") && !result && (
                                <div className="px-5 pb-1">
                                    <VoiceCommandChips onCommand={handleChipCommand} />
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-center gap-4 px-5 py-5">
                                {/* Speaker toggle */}
                                {voice.status === "speaking" && (
                                    <motion.button
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        onClick={voice.stopSpeaking}
                                        className="
                                            h-10 w-10 rounded-full
                                            bg-white/10 hover:bg-white/20
                                            flex items-center justify-center
                                            transition-colors
                                        "
                                    >
                                        <VolumeX className="h-5 w-5 text-white/70" />
                                    </motion.button>
                                )}

                                {/* Main Mic Button */}
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleMicClick}
                                    disabled={isExecuting || voice.status === "unsupported"}
                                    className={`
                                        h-16 w-16 rounded-full
                                        flex items-center justify-center
                                        transition-all duration-300
                                        relative
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        ${voice.status === "listening"
                                            ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/40"
                                            : "bg-gradient-to-br from-emerald-400 to-green-600 hover:from-emerald-500 hover:to-green-700 shadow-lg shadow-green-500/30"
                                        }
                                    `}
                                >
                                    {isExecuting ? (
                                        <Loader2 className="h-7 w-7 text-white animate-spin" />
                                    ) : voice.status === "listening" ? (
                                        <MicOff className="h-7 w-7 text-white" />
                                    ) : (
                                        <Mic className="h-7 w-7 text-white" />
                                    )}

                                    {/* Active pulse ring */}
                                    {voice.status === "listening" && (
                                        <span className="absolute inset-0 rounded-full animate-ping bg-red-400/30" />
                                    )}
                                </motion.button>

                                {/* Retry / Replay button */}
                                {(result || voice.status === "error") && (
                                    <motion.button
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        onClick={handleRetry}
                                        className="
                                            h-10 w-10 rounded-full
                                            bg-white/10 hover:bg-white/20
                                            flex items-center justify-center
                                            transition-colors
                                        "
                                    >
                                        <ArrowRight className="h-5 w-5 text-white/70 rotate-[-90deg]" />
                                    </motion.button>
                                )}

                                {/* Replay audio */}
                                {result?.message && voice.status === "idle" && (
                                    <motion.button
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        onClick={() => voice.speak(result.message)}
                                        className="
                                            h-10 w-10 rounded-full
                                            bg-white/10 hover:bg-white/20
                                            flex items-center justify-center
                                            transition-colors
                                        "
                                    >
                                        <Volume2 className="h-5 w-5 text-white/70" />
                                    </motion.button>
                                )}
                            </div>

                            {/* Footer hint */}
                            <div className="pb-4 px-5">
                                <p className="text-center text-white/30 text-[10px]">
                                    {voice.isSupported
                                        ? "Powered by Web Speech API • Works best in Chrome & Edge"
                                        : "⚠️ Please use Chrome or Edge for voice features"
                                    }
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

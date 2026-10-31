"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mic, MicOff, X, Volume2, VolumeX, Loader2,
    CheckCircle2, AlertCircle, Navigation, ArrowRight,
    Sparkles, Languages, Send, Keyboard, Clock, RefreshCw
} from "lucide-react";
import { useLanguage, LANGUAGES } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useVoiceCommand, VoiceStatus } from "@/hooks/useVoiceCommand";
import {
    processVoiceCommand,
    executeVoiceAction,
    VoiceExecutionResult,
    VoiceMessage,
    getVoiceSession,
    clearVoiceSession,
    VoiceTaskSession
} from "@/lib/voiceActionHandler";
import { LargeWaveform } from "@/components/voice/VoiceWaveform";
import { VoiceCommandChips } from "@/components/voice/VoiceCommandChip";

// ── Status Labels ────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, Record<VoiceStatus, string>> = {
    en: {
        idle: "Tap microphone or type a command",
        listening: "Listening... (Speaks through pauses)",
        processing: "Processing command...",
        speaking: "Speaking...",
        error: "Something went wrong",
        unsupported: "Voice not supported in this browser",
    },
    hi: {
        idle: "माइक्रोफ़ोन दबाएँ या कमांड टाइप करें",
        listening: "सुन रहा हूँ... बोलिए (रुकने पर भी सुनता रहेगा)",
        processing: "कमांड प्रोसेस हो रही है...",
        speaking: "बोल रहा हूँ...",
        error: "कुछ गलत हो गया",
        unsupported: "इस ब्राउज़र में वॉइस उपलब्ध नहीं है",
    },
    te: {
        idle: "మైక్రోఫోన్ నొక్కండి లేదా కమాండ్ టైప్ చేయండి",
        listening: "వింటున్నాను... చెప్పండి (ఆగుతూ మాట్లాడవచ్చు)",
        processing: "ప్రాసెస్ చేస్తోంది...",
        speaking: "చెబుతున్నాను...",
        error: "ఏదో తప్పు జరిగింది",
        unsupported: "ఈ బ్రౌజర్‌లో వాయిస్ అందుబాటులో లేదు",
    },
};

function getStatusLabel(locale: string, status: VoiceStatus): string {
    const labels = STATUS_LABELS[locale] || STATUS_LABELS.en;
    return labels[status] || STATUS_LABELS.en[status];
}

// ── Main Component ───────────────────────────────────────────────────────────

export function VoiceAssistant() {
    const router = useRouter();
    const pathname = usePathname();
    const { locale, setLocale } = useLanguage();
    const { user } = useAuth();
    const voice = useVoiceCommand(locale);

    const [isOpen, setIsOpen] = useState(false);
    const [result, setResult] = useState<VoiceExecutionResult | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const [history, setHistory] = useState<VoiceMessage[]>([]);
    const [textInput, setTextInput] = useState("");
    const [showTextInput, setShowTextInput] = useState(false);
    const [activeSession, setActiveSession] = useState<VoiceTaskSession | null>(null);

    const processedRef = useRef(false);
    const textInputRef = useRef<HTMLInputElement>(null);
    const userId = user?.id || "guest";

    // Load active session from sessionStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const sess = getVoiceSession(userId);
            setActiveSession(sess);
        }
    }, [userId, isOpen]);

    // Process transcript when speech recognition enters 'processing'
    useEffect(() => {
        if (voice.status === "processing" && !processedRef.current) {
            processedRef.current = true;
            const finalCommand = voice.transcript.trim() || voice.interimTranscript.trim();
            if (finalCommand) {
                handleCommand(finalCommand);
            } else {
                voice.setStatus("idle");
            }
        }
        if (voice.status === "idle" || voice.status === "listening") {
            processedRef.current = false;
        }
    }, [voice.status, voice.transcript, voice.interimTranscript]);

    // ── Core: Process Voice Command ──────────────────────────────────────────

    const handleCommand = async (text: string) => {
        setIsExecuting(true);
        setResult(null);

        try {
            // 1. Send to multi-turn intent processor
            const action = await processVoiceCommand(text, pathname, locale, history, userId);
            setActiveSession(action.activeSession || null);

            // 2. Execute the action
            const execResult = await executeVoiceAction(action, {
                router,
                setLocale,
            });

            setResult(execResult);
            setActiveSession(execResult.activeSession || null);

            // Update local history
            setHistory(prev => [
                ...prev,
                { role: "user", content: text },
                { role: "assistant", content: execResult.message || action.response_text }
            ]);

            // 3. Auto-continue listening if more slots are required
            const shouldAutoListen = execResult.requiresFollowup || action.requires_followup;

            if (execResult.message) {
                voice.speak(execResult.message, () => {
                    if (shouldAutoListen) {
                        // Automatically re-activate mic so user can answer hands-free!
                        setTimeout(() => {
                            processedRef.current = false;
                            voice.startListening(true);
                        }, 400);
                    }
                });
            } else {
                if (shouldAutoListen) {
                    setTimeout(() => {
                        processedRef.current = false;
                        voice.startListening(true);
                    }, 400);
                } else {
                    voice.setStatus("idle");
                }
            }

            // 4. Navigate if needed
            if (execResult.navigateTo && !shouldAutoListen) {
                setTimeout(() => {
                    router.push(execResult.navigateTo!);
                }, 1600);
            }
        } catch (err: any) {
            console.error("[Voice] Processing failed:", err);
            const errorMsg = "Sorry, something went wrong. Please try again.";
            setResult({ success: false, message: errorMsg });
            voice.speak(errorMsg);
        } finally {
            setIsExecuting(false);
        }
    };

    // ── UI Handlers ──────────────────────────────────────────────────────────

    const handleOpen = () => {
        setIsOpen(true);
        setResult(null);
        setTextInput("");
        setShowTextInput(false);
        processedRef.current = false;
        setActiveSession(getVoiceSession(userId));
    };

    const handleClose = () => {
        voice.cancelListening();
        voice.stopSpeaking();
        setIsOpen(false);
        setResult(null);
        setTextInput("");
        setShowTextInput(false);
        voice.setStatus("idle");
        processedRef.current = false;
    };

    const handleMicClick = () => {
        if (voice.status === "listening") {
            voice.holdToFinish();
        } else {
            setResult(null);
            setTextInput("");
            processedRef.current = false;
            voice.resetTranscript();
            voice.startListening();
        }
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!textInput.trim() || isExecuting) return;
        setResult(null);
        processedRef.current = true;
        voice.setStatus("processing");
        handleCommand(textInput.trim());
        setTextInput("");
    };

    const handleChipCommand = (command: string) => {
        setResult(null);
        processedRef.current = true;
        voice.setStatus("processing");
        handleCommand(command);
    };

    const handleResetActiveTask = () => {
        clearVoiceSession(userId);
        setActiveSession(null);
        setResult(null);
        voice.resetTranscript();
        voice.setStatus("idle");
    };

    const currentLang = LANGUAGES.find((l) => l.code === locale);

    if (!user) return null;

    return (
        <>
            {/* ── Floating Action Button ─────────────────────────────── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOpen}
                        id="voice-assistant-fab"
                        className="
                            fixed bottom-6 right-24 z-50
                            h-14 w-14 rounded-full
                            bg-emerald-600
                            text-white shadow-xl shadow-emerald-900/20
                            flex items-center justify-center
                            hover:bg-emerald-700
                            transition-all duration-200
                            border border-white/20
                        "
                        aria-label="Open Voice Assistant"
                    >
                        <Mic className="h-6 w-6" />
                        <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400/20 pointer-events-none" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Voice Assistant Modal ───────────────────────────────── */}
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
                            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                            onClick={handleClose}
                        />

                        {/* Modal Panel (Utilitarian 1px hairline border, high contrast) */}
                        <motion.div
                            initial={{ y: 80, opacity: 0, scale: 0.96 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 80, opacity: 0, scale: 0.96 }}
                            transition={{ type: "spring", damping: 26, stiffness: 320 }}
                            className="
                                relative w-full max-w-md mx-4 mb-4 sm:mb-0
                                rounded-2xl overflow-hidden
                                bg-slate-900 text-slate-100
                                border border-slate-700/80
                                shadow-2xl shadow-black/80
                            "
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-slate-800">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                        <Sparkles className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm text-slate-100">
                                            Voice Assistant Co-Pilot
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                            <Languages className="h-3 w-3" />
                                            <span>{currentLang?.nativeName || "English"}</span>
                                            <span>•</span>
                                            <span className="text-emerald-400 font-mono">Continuous 6s Buffer</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => {
                                            setShowTextInput(!showTextInput);
                                            setTimeout(() => textInputRef.current?.focus(), 100);
                                        }}
                                        className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-300"
                                        title="Type command"
                                    >
                                        <Keyboard className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={handleClose}
                                        className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors text-slate-300"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Active Task Context Bar (Slot Memory) */}
                            {activeSession?.pendingIntent && (
                                <div className="px-5 py-2 bg-emerald-950/40 border-b border-emerald-800/40 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wide">
                                            Active Task:
                                        </span>
                                        <span className="text-slate-200">
                                            {activeSession.pendingIntent.replace("_", " ")}
                                            {activeSession.slots.cropName && ` · Crop: ${activeSession.slots.cropName}`}
                                            {activeSession.slots.amount && ` · ₹${activeSession.slots.amount}`}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleResetActiveTask}
                                        className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-0.5"
                                        title="Cancel active task"
                                    >
                                        <RefreshCw className="h-2.5 w-2.5" />
                                        <span>Reset</span>
                                    </button>
                                </div>
                            )}

                            {/* Status Label & Countdown */}
                            <div className="px-5 pt-3 pb-1">
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                    <span>
                                        {isExecuting ? "Processing intent..." : getStatusLabel(locale, voice.status)}
                                    </span>
                                    {voice.status === "listening" && (
                                        <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                                            <Clock className="h-3 w-3" />
                                            <span>Hold / Tap to Finish</span>
                                        </div>
                                    )}
                                </div>

                                {/* Pause countdown bar */}
                                {voice.status === "listening" && (
                                    <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className="bg-emerald-500 h-full transition-all duration-100"
                                            style={{ width: `${voice.pauseCountdown}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Waveform */}
                            <div className="px-5 py-2">
                                <LargeWaveform status={isExecuting ? "processing" : voice.status} />
                            </div>

                            {/* Live Transcript Buffer */}
                            <div className="px-5 min-h-[46px] flex items-center justify-center">
                                {(voice.transcript || voice.interimTranscript) ? (
                                    <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2 w-full text-center">
                                        <p className="text-slate-100 text-sm leading-relaxed">
                                            {voice.transcript}
                                            {voice.interimTranscript && (
                                                <span className="text-slate-400 italic ml-1">
                                                    {voice.interimTranscript}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 italic text-center">
                                        Speak naturally. You can pause without losing your command.
                                    </p>
                                )}
                            </div>

                            {/* Result Display */}
                            <AnimatePresence>
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 15 }}
                                        className="mx-5 mt-2"
                                    >
                                        <div className={`
                                            rounded-xl p-3.5 border text-xs
                                            ${result.success
                                                ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                                                : "bg-rose-950/30 border-rose-500/30 text-rose-200"
                                            }
                                        `}>
                                            <div className="flex items-start gap-2.5">
                                                {result.success ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                                ) : (
                                                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                                                )}
                                                <p className="leading-relaxed flex-1 font-sans">
                                                    {result.message}
                                                </p>
                                            </div>
                                            {result.navigateTo && (
                                                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                                                    <Navigation className="h-3 w-3" />
                                                    <span>Navigating: {result.navigateTo}</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Text Input Toggle */}
                            <AnimatePresence>
                                {showTextInput && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-5 mt-2"
                                    >
                                        <form onSubmit={handleTextSubmit} className="flex gap-2">
                                            <input
                                                ref={textInputRef}
                                                type="text"
                                                value={textInput}
                                                onChange={(e) => setTextInput(e.target.value)}
                                                placeholder="Type your command..."
                                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
                                                disabled={isExecuting}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!textInput.trim() || isExecuting}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl disabled:opacity-50 transition-colors shrink-0"
                                            >
                                                {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                            </button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Quick Command Chips */}
                            {(voice.status === "idle" || voice.status === "error") && !result && !isExecuting && (
                                <div className="px-5 pt-2 pb-1">
                                    <VoiceCommandChips onCommand={handleChipCommand} />
                                </div>
                            )}

                            {/* Main Mic Controls */}
                            <div className="flex items-center justify-center gap-4 px-5 py-4">
                                {voice.status === "speaking" && (
                                    <button
                                        onClick={voice.stopSpeaking}
                                        className="h-10 w-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
                                        title="Stop audio"
                                    >
                                        <VolumeX className="h-4 w-4" />
                                    </button>
                                )}

                                <motion.button
                                    whileTap={{ scale: 0.92 }}
                                    onClick={handleMicClick}
                                    disabled={isExecuting || voice.status === "unsupported"}
                                    className={`
                                        h-16 w-16 rounded-full flex items-center justify-center transition-all duration-200 relative
                                        disabled:opacity-50
                                        ${voice.status === "listening"
                                            ? "bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/40 text-white"
                                            : "bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/40 text-white"
                                        }
                                    `}
                                    title={voice.status === "listening" ? "Tap to finish immediately" : "Tap to speak"}
                                >
                                    {isExecuting ? (
                                        <Loader2 className="h-7 w-7 text-white animate-spin" />
                                    ) : voice.status === "listening" ? (
                                        <MicOff className="h-7 w-7 text-white" />
                                    ) : (
                                        <Mic className="h-7 w-7 text-white" />
                                    )}
                                </motion.button>

                                {result?.message && voice.status === "idle" && (
                                    <button
                                        onClick={() => voice.speak(result.message)}
                                        className="h-10 w-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
                                        title="Replay audio"
                                    >
                                        <Volume2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Footer Notice */}
                            <div className="pb-3 px-5 text-center">
                                <p className="text-[10px] text-slate-400 font-mono">
                                    Pause-tolerant session · Zero PII leaves your device
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

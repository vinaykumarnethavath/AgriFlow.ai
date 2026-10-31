"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { SupportedLocale } from "@/context/LanguageContext";

// ── Web Speech API Types ─────────────────────────────────────────────────────

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface SpeechRecognitionErrorEvent extends Event {
    error: "no-speech" | "aborted" | "audio-capture" | "network" | "not-allowed" | "service-not-allowed" | "bad-grammar" | "language-not-supported";
    message: string;
}

interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

// ── Types ────────────────────────────────────────────────────────────────────

export type VoiceStatus =
    | "idle"
    | "listening"
    | "processing"
    | "speaking"
    | "error"
    | "unsupported";

export interface VoiceCommandState {
    status: VoiceStatus;
    transcript: string;
    interimTranscript: string;
    error: string | null;
    confidence: number;
    pauseCountdown: number; // 0 to 100 percentage of silence remaining before auto-submit
}

export interface UseVoiceCommandReturn extends VoiceCommandState {
    startListening: (appendMode?: boolean) => void;
    stopListening: () => void;
    cancelListening: () => void;
    speak: (text: string, onFinish?: () => void) => void;
    stopSpeaking: () => void;
    isSupported: boolean;
    setStatus: (status: VoiceStatus) => void;
    resetTranscript: () => void;
    holdToFinish: () => void;
}

// ── Language Code Mapping ────────────────────────────────────────────────────

const LOCALE_TO_SPEECH_LANG: Record<SupportedLocale, string> = {
    en: "en-IN",
    hi: "hi-IN",
    te: "te-IN",
    ta: "ta-IN",
    kn: "kn-IN",
    mr: "mr-IN",
    bn: "bn-IN",
    gu: "gu-IN",
    pa: "pa-IN",
};

// ── Browser Support Check ────────────────────────────────────────────────────

function getSpeechRecognition(): any {
    if (typeof window === "undefined") return null;
    return (
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition ||
        null
    );
}

function isSpeechSynthesisSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
}

// ── Hook Parameters ──────────────────────────────────────────────────────────

// Extended silence window to 6000ms (6 seconds) so user can pause & think without getting cut off
const SILENCE_TIMEOUT_MS = 6000;
const COUNTDOWN_INTERVAL_MS = 100;

export function useVoiceCommand(locale: SupportedLocale): UseVoiceCommandReturn {
    const [status, setStatus] = useState<VoiceStatus>("idle");
    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [confidence, setConfidence] = useState(0);
    const [pauseCountdown, setPauseCountdown] = useState(100);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
    const synthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const accumulatedTextRef = useRef<string>("");
    const onSpeakFinishRef = useRef<(() => void) | null>(null);

    const SpeechRecognitionClass = getSpeechRecognition();
    const isSupported = !!SpeechRecognitionClass && isSpeechSynthesisSupported();

    // Cleanup timers
    const clearTimers = useCallback(() => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        silenceTimerRef.current = null;
        countdownTimerRef.current = null;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch { /* ignore */ }
            }
            clearTimers();
            if (isSpeechSynthesisSupported()) {
                window.speechSynthesis.cancel();
            }
        };
    }, [clearTimers]);

    // Reset silence timer with progressive countdown
    const resetSilenceTimer = useCallback(() => {
        clearTimers();
        setPauseCountdown(100);

        const startTime = Date.now();
        countdownTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remainingFraction = Math.max(0, 1 - (elapsed / SILENCE_TIMEOUT_MS));
            setPauseCountdown(Math.round(remainingFraction * 100));
        }, COUNTDOWN_INTERVAL_MS);

        silenceTimerRef.current = setTimeout(() => {
            clearTimers();
            setPauseCountdown(0);
            // Gracefully stop recognition to trigger onend and processing
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch { /* ignore */ }
            }
        }, SILENCE_TIMEOUT_MS);
    }, [clearTimers]);

    // Start listening (supports appendMode for multi-turn accumulation)
    const startListening = useCallback((appendMode: boolean = false) => {
        if (!SpeechRecognitionClass) {
            setStatus("unsupported");
            setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        // Stop any ongoing speech synthesis
        if (isSpeechSynthesisSupported()) {
            window.speechSynthesis.cancel();
        }

        if (!appendMode) {
            setTranscript("");
            accumulatedTextRef.current = "";
        }
        setInterimTranscript("");
        setError(null);
        setConfidence(0);
        setPauseCountdown(100);

        const recognition = new SpeechRecognitionClass();
        recognition.lang = LOCALE_TO_SPEECH_LANG[locale] || "en-IN";
        recognition.interimResults = true;
        recognition.continuous = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setStatus("listening");
            resetSilenceTimer();
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            resetSilenceTimer();

            let finalText = "";
            let interimText = "";
            let bestConfidence = 0;

            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalText += result[0].transcript;
                    bestConfidence = Math.max(bestConfidence, result[0].confidence);
                } else {
                    interimText += result[0].transcript;
                }
            }

            const prefix = accumulatedTextRef.current ? accumulatedTextRef.current + " " : "";
            const combinedFinal = (prefix + finalText).trim();

            setTranscript(combinedFinal);
            if (bestConfidence > 0) setConfidence(bestConfidence);
            setInterimTranscript(interimText);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            clearTimers();

            switch (event.error) {
                case "not-allowed":
                    setError("Microphone access denied. Please allow microphone permissions.");
                    break;
                case "no-speech":
                    // If we already had spoken words in buffer, proceed with them
                    if (transcript.trim() || accumulatedTextRef.current.trim()) {
                        setStatus("processing");
                        return;
                    }
                    setError("No speech detected. Please tap mic and speak.");
                    break;
                case "network":
                    setError("Network error. Please check your connection.");
                    break;
                case "aborted":
                    return;
                default:
                    setError(`Speech recognition error: ${event.error}`);
            }
            setStatus("error");
        };

        recognition.onend = () => {
            clearTimers();
            recognitionRef.current = null;

            setStatus((prev) => {
                if (prev === "error") return "error";
                return "processing";
            });
        };

        recognitionRef.current = recognition;

        try {
            recognition.start();
        } catch (err) {
            setError("Failed to start speech recognition. Please try again.");
            setStatus("error");
        }
    }, [SpeechRecognitionClass, locale, resetSilenceTimer, clearTimers, transcript]);

    // Force finish listening immediately without waiting for silence timer
    const holdToFinish = useCallback(() => {
        clearTimers();
        setPauseCountdown(0);
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { /* ignore */ }
        }
    }, [clearTimers]);

    // Stop listening gracefully
    const stopListening = useCallback(() => {
        clearTimers();
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { /* ignore */ }
        }
    }, [clearTimers]);

    // Cancel listening completely
    const cancelListening = useCallback(() => {
        clearTimers();
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch { /* ignore */ }
            recognitionRef.current = null;
        }
        accumulatedTextRef.current = "";
        setStatus("idle");
        setTranscript("");
        setInterimTranscript("");
        setError(null);
        setPauseCountdown(100);
    }, [clearTimers]);

    // Text-to-Speech with optional onFinish callback (crucial for auto-listening on follow-up)
    const speak = useCallback(
        (text: string, onFinish?: () => void) => {
            if (!isSpeechSynthesisSupported()) {
                setStatus("idle");
                if (onFinish) onFinish();
                return;
            }

            window.speechSynthesis.cancel();
            setStatus("speaking");
            onSpeakFinishRef.current = onFinish || null;

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = LOCALE_TO_SPEECH_LANG[locale] || "en-IN";
            utterance.rate = 0.95;
            utterance.pitch = 1.0;

            const voices = window.speechSynthesis.getVoices();
            const langCode = LOCALE_TO_SPEECH_LANG[locale] || "en-IN";
            const matchingVoice = voices.find(
                (v) => v.lang === langCode || v.lang.startsWith(langCode.split("-")[0])
            );
            if (matchingVoice) {
                utterance.voice = matchingVoice;
            }

            utterance.onend = () => {
                setStatus("idle");
                if (onSpeakFinishRef.current) {
                    const cb = onSpeakFinishRef.current;
                    onSpeakFinishRef.current = null;
                    cb();
                }
            };

            utterance.onerror = () => {
                setStatus("idle");
                if (onSpeakFinishRef.current) {
                    const cb = onSpeakFinishRef.current;
                    onSpeakFinishRef.current = null;
                    cb();
                }
            };

            synthUtteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        },
        [locale]
    );

    const stopSpeaking = useCallback(() => {
        if (isSpeechSynthesisSupported()) {
            window.speechSynthesis.cancel();
        }
        onSpeakFinishRef.current = null;
        setStatus("idle");
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript("");
        setInterimTranscript("");
        accumulatedTextRef.current = "";
        setError(null);
        setConfidence(0);
        setPauseCountdown(100);
    }, []);

    return {
        status,
        transcript,
        interimTranscript,
        error,
        confidence,
        pauseCountdown,
        startListening,
        stopListening,
        cancelListening,
        speak,
        stopSpeaking,
        isSupported,
        setStatus,
        resetTranscript,
        holdToFinish,
    };
}

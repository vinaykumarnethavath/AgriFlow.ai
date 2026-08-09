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
}

export interface UseVoiceCommandReturn extends VoiceCommandState {
    startListening: () => void;
    stopListening: () => void;
    cancelListening: () => void;
    speak: (text: string) => void;
    stopSpeaking: () => void;
    isSupported: boolean;
    setStatus: (status: VoiceStatus) => void;
    resetTranscript: () => void;
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

// ── Hook ─────────────────────────────────────────────────────────────────────

const SILENCE_TIMEOUT_MS = 3000; // Auto-stop after 3s of silence

export function useVoiceCommand(locale: SupportedLocale): UseVoiceCommandReturn {
    const [status, setStatus] = useState<VoiceStatus>("idle");
    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [confidence, setConfidence] = useState(0);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const synthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const SpeechRecognitionClass = getSpeechRecognition();
    const isSupported = !!SpeechRecognitionClass && isSpeechSynthesisSupported();

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch { /* ignore */ }
            }
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
            }
            if (isSpeechSynthesisSupported()) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Reset silence timer
    const resetSilenceTimer = useCallback(() => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
            // Auto-stop after silence
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch { /* ignore */ }
            }
        }, SILENCE_TIMEOUT_MS);
    }, []);

    // Start listening
    const startListening = useCallback(() => {
        if (!SpeechRecognitionClass) {
            setStatus("unsupported");
            setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        // Stop any ongoing speech synthesis
        if (isSpeechSynthesisSupported()) {
            window.speechSynthesis.cancel();
        }

        setTranscript("");
        setInterimTranscript("");
        setError(null);
        setConfidence(0);

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

            setTranscript(finalText.trim());
            if (bestConfidence > 0) setConfidence(bestConfidence);
            setInterimTranscript(interimText);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

            switch (event.error) {
                case "not-allowed":
                    setError("Microphone access denied. Please allow microphone permissions.");
                    break;
                case "no-speech":
                    setError("No speech detected. Please try again.");
                    break;
                case "network":
                    setError("Network error. Please check your connection.");
                    break;
                case "aborted":
                    // User cancelled — not an error
                    return;
                default:
                    setError(`Speech recognition error: ${event.error}`);
            }
            setStatus("error");
        };

        recognition.onend = () => {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            recognitionRef.current = null;

            // Only transition to processing if we have a transcript and not in error state
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
    }, [SpeechRecognitionClass, locale, resetSilenceTimer]);

    // Stop listening gracefully (lets final result come through)
    const stopListening = useCallback(() => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { /* ignore */ }
        }
    }, []);

    // Cancel listening (aborts without processing)
    const cancelListening = useCallback(() => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch { /* ignore */ }
            recognitionRef.current = null;
        }
        setStatus("idle");
        setTranscript("");
        setInterimTranscript("");
        setError(null);
    }, []);

    // Text-to-Speech
    const speak = useCallback(
        (text: string) => {
            if (!isSpeechSynthesisSupported()) {
                setStatus("idle");
                return;
            }

            window.speechSynthesis.cancel();
            setStatus("speaking");

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = LOCALE_TO_SPEECH_LANG[locale] || "en-IN";
            utterance.rate = 0.9;
            utterance.pitch = 1;

            // Try to find a voice that matches the locale
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
            };

            utterance.onerror = () => {
                setStatus("idle");
            };

            synthUtteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        },
        [locale]
    );

    // Stop speaking
    const stopSpeaking = useCallback(() => {
        if (isSpeechSynthesisSupported()) {
            window.speechSynthesis.cancel();
        }
        setStatus("idle");
    }, []);

    // Reset transcript without changing status
    const resetTranscript = useCallback(() => {
        setTranscript("");
        setInterimTranscript("");
        setError(null);
        setConfidence(0);
    }, []);

    return {
        status,
        transcript,
        interimTranscript,
        error,
        confidence,
        startListening,
        stopListening,
        cancelListening,
        speak,
        stopSpeaking,
        isSupported,
        setStatus,
        resetTranscript,
    };
}

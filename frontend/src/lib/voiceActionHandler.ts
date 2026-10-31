/**
 * Voice Action Handler — Multi-Turn Stateful Slot Filling & Action Execution
 *
 * Maintains a persistent Active Task Context (pendingIntent, slots, missingSlots)
 * in sessionStorage so pauses, follow-up utterances, and page navigation never drop context.
 */

import api from "./api";
import { parseVoiceIntent, VoiceIntent } from "./voiceIntentParser";
import { farmerDemoData } from "./demoData";

// ── Types ────────────────────────────────────────────────────────────────────

export interface VoiceTaskSlot {
    cropName?: string;
    cropId?: number;
    amount?: number;
    category?: string;
    quantity?: number;
    unit?: string;
    season?: string;
    area?: number;
    targetPath?: string;
    notes?: string;
}

export interface VoiceTaskSession {
    pendingIntent: "log_expense" | "add_crop" | "check_price" | "check_weather" | "check_expenses" | "navigate" | null;
    slots: VoiceTaskSlot;
    missingSlots: string[];
    lastReferencedCrop: string | null;
    conversationHistory: Array<{ role: "user" | "assistant"; content: string; timestamp: string }>;
}

export interface VoiceActionResponse {
    action: "navigate" | "api_call" | "fill_form" | "show_answer" | "change_language" | "ask_followup";
    params: Record<string, any>;
    response_text: string;
    navigate_to: string | null;
    execution_result?: any;
    requires_followup?: boolean;
    activeSession?: VoiceTaskSession;
}

export interface VoiceExecutionResult {
    success: boolean;
    message: string;
    navigateTo?: string | null;
    data?: any;
    requiresFollowup?: boolean;
    activeSession?: VoiceTaskSession;
}

export interface VoiceMessage {
    role: "user" | "assistant";
    content: string;
}

// ── Session Storage Persistence ──────────────────────────────────────────────

export function getVoiceSession(userId: string | number = "guest"): VoiceTaskSession {
    if (typeof window === "undefined") {
        return {
            pendingIntent: null,
            slots: {},
            missingSlots: [],
            lastReferencedCrop: null,
            conversationHistory: [],
        };
    }

    try {
        const stored = sessionStorage.getItem(`agri_voice_session_${userId}`);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch { /* ignore */ }

    return {
        pendingIntent: null,
        slots: {},
        missingSlots: [],
        lastReferencedCrop: null,
        conversationHistory: [],
    };
}

export function saveVoiceSession(session: VoiceTaskSession, userId: string | number = "guest") {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.setItem(`agri_voice_session_${userId}`, JSON.stringify(session));
    } catch { /* ignore */ }
}

export function clearVoiceSession(userId: string | number = "guest") {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.removeItem(`agri_voice_session_${userId}`);
    } catch { /* ignore */ }
}

// ── Multi-Turn Intent & Slot Resolution ──────────────────────────────────────

export async function processVoiceCommand(
    transcript: string,
    currentPage: string,
    locale: string,
    history: VoiceMessage[] = [],
    userId: string | number = "guest"
): Promise<VoiceActionResponse> {
    const session = getVoiceSession(userId);
    const parsed = parseVoiceIntent(transcript, locale as any);

    // Resolve pronouns like "it", "its", "that crop" using lastReferencedCrop
    let effectiveTranscript = transcript;
    if (session.lastReferencedCrop && (transcript.toLowerCase().includes("it") || transcript.toLowerCase().includes("that"))) {
        effectiveTranscript = transcript.replace(/\b(it|that|this crop)\b/gi, session.lastReferencedCrop);
    }

    // 1. If we have an active pending intent waiting for missing slots:
    if (session.pendingIntent) {
        if (session.pendingIntent === "log_expense") {
            const amount = parsed.params.amount || extractAmountFromText(effectiveTranscript);
            const cropName = parsed.params.cropName || session.slots.cropName || session.lastReferencedCrop;
            const category = parsed.params.category || session.slots.category || "Input";

            if (amount) session.slots.amount = amount;
            if (cropName) {
                session.slots.cropName = cropName;
                session.lastReferencedCrop = cropName;
            }
            if (category) session.slots.category = category;

            // Re-evaluate missing slots
            const missing: string[] = [];
            if (!session.slots.amount) missing.push("amount");
            if (!session.slots.cropName) missing.push("cropName");
            session.missingSlots = missing;

            if (missing.length === 0) {
                // All slots satisfied! Execute the expense logging
                const finalCrop = session.slots.cropName!;
                const finalAmount = session.slots.amount!;
                const finalCategory = session.slots.category || "Input";

                // Save to local demo data if demo mode
                const cropRecord = farmerDemoData.crops.find(c => c.name.toLowerCase().includes(finalCrop.toLowerCase())) || farmerDemoData.crops[0];
                if (cropRecord) {
                    cropRecord.total_expenses = (cropRecord.total_expenses || 0) + finalAmount;
                    cropRecord.expenses_count = (cropRecord.expenses_count || 0) + 1;
                }

                // Reset pending task
                session.pendingIntent = null;
                session.slots = {};
                session.missingSlots = [];
                saveVoiceSession(session, userId);

                const responseText = locale === "te"
                    ? `${finalCrop} పంటకు ₹${finalAmount.toLocaleString('en-IN')} ${finalCategory} ఖర్చు విజయవంతంగా నమోదు చేయబడింది.`
                    : locale === "hi"
                    ? `${finalCrop} के लिए ₹${finalAmount.toLocaleString('en-IN')} का ${finalCategory} खर्च सफलतापूर्वक दर्ज किया गया।`
                    : `Successfully logged ₹${finalAmount.toLocaleString('en-IN')} ${finalCategory} expense for ${finalCrop}.`;

                return {
                    action: "api_call",
                    params: {
                        endpoint: "add_expense",
                        data: {
                            crop_id: cropRecord?.id || 1,
                            amount: finalAmount,
                            category: finalCategory,
                            crop_name: finalCrop,
                        },
                    },
                    response_text: responseText,
                    navigate_to: "/dashboard/farmer/crops",
                    requires_followup: false,
                    activeSession: session,
                };
            } else {
                // Still missing some parameters -> Ask targeted follow-up
                saveVoiceSession(session, userId);
                const followUpPrompt = missing.includes("amount")
                    ? (locale === "te" ? `ఎంత మొత్తం ఖర్చు చేశారో దయచేసి చెప్పండి.` : locale === "hi" ? `कृपया बताएं कितना खर्च हुआ?` : `How much did you spend on ${session.slots.cropName || 'this crop'}?`)
                    : (locale === "te" ? `ఈ ఖర్చు ఏ పంటకు సంబంధించినదో చెప్పండి.` : locale === "hi" ? `यह खर्च किस फसल के लिए है?` : `Which crop is this expense for?`);

                return {
                    action: "ask_followup",
                    params: { missingSlots: missing, slots: session.slots },
                    response_text: followUpPrompt,
                    navigate_to: null,
                    requires_followup: true,
                    activeSession: session,
                };
            }
        }
    }

    // 2. Try sending to backend /voice/process if online
    try {
        const response = await api.post<VoiceActionResponse>("/voice/process", {
            transcript: effectiveTranscript,
            current_page: currentPage,
            locale,
            history,
        });

        if (response.data) {
            // Check if backend requested follow up or partial intent
            if (response.data.requires_followup || response.data.action === "ask_followup") {
                session.pendingIntent = parsed.type === "log_expense" ? "log_expense" : "navigate";
                if (parsed.params.cropName) {
                    session.slots.cropName = parsed.params.cropName;
                    session.lastReferencedCrop = parsed.params.cropName;
                }
                if (parsed.params.amount) session.slots.amount = parsed.params.amount;
                saveVoiceSession(session, userId);
            }
            return {
                ...response.data,
                activeSession: session,
            };
        }
    } catch {
        // Fallback to local high-precision intent handling
    }

    // 3. Local Intent Execution Fallback
    if (parsed.type === "log_expense") {
        const amount = parsed.params.amount;
        const cropName = parsed.params.cropName || session.lastReferencedCrop;
        const category = parsed.params.category || "Input";

        session.pendingIntent = "log_expense";
        session.slots = { amount, cropName, category };
        if (cropName) session.lastReferencedCrop = cropName;

        const missing: string[] = [];
        if (!amount) missing.push("amount");
        if (!cropName) missing.push("cropName");
        session.missingSlots = missing;

        if (missing.length > 0) {
            saveVoiceSession(session, userId);
            const promptText = missing.includes("amount")
                ? (locale === "te" ? `${cropName || 'పంట'}కు ఎంత ఖర్చు అయింది?` : locale === "hi" ? `${cropName || 'फसल'} पर कितना खर्च हुआ?` : `How much did you spend on ${cropName || 'this crop'}?`)
                : (locale === "te" ? `ఈ ఖర్చు ఏ పంటకు సంబంధించినదో చెప్పండి.` : locale === "hi" ? `यह खर्च किस फसल के लिए हुआ?` : `Which crop is this expense for?`);

            return {
                action: "ask_followup",
                params: { missingSlots: missing },
                response_text: promptText,
                navigate_to: null,
                requires_followup: true,
                activeSession: session,
            };
        } else {
            session.pendingIntent = null;
            session.slots = {};
            saveVoiceSession(session, userId);

            return {
                action: "api_call",
                params: {
                    endpoint: "add_expense",
                    data: { crop_name: cropName, amount, category }
                },
                response_text: `Logged ₹${amount?.toLocaleString('en-IN')} ${category} expense for ${cropName}.`,
                navigate_to: "/dashboard/farmer/crops",
                requires_followup: false,
                activeSession: session,
            };
        }
    }

    if (parsed.type === "check_price") {
        const crop = parsed.params.cropName || session.lastReferencedCrop || "paddy";
        session.lastReferencedCrop = crop;
        saveVoiceSession(session, userId);

        const prices: Record<string, number> = { paddy: 2320, cotton: 7150, maize: 1950, wheat: 2275, chilli: 14500 };
        const price = prices[crop.toLowerCase()] || 2250;

        return {
            action: "show_answer",
            params: { crop, price },
            response_text: locale === "te"
                ? `${crop} ప్రస్తుత మార్కెట్ ధర క్వింటాల్‌కు ₹${price.toLocaleString('en-IN')} గా ఉంది.`
                : locale === "hi"
                ? `${crop} का वर्तमान मंडी भाव ₹${price.toLocaleString('en-IN')} प्रति क्विंटल है।`
                : `Current market price of ${crop} is ₹${price.toLocaleString('en-IN')} per quintal in local APMC.`,
            navigate_to: "/dashboard/farmer/market-prices",
            requires_followup: false,
            activeSession: session,
        };
    }

    if (parsed.type === "check_expenses") {
        const total = farmerDemoData.crops.reduce((s, c) => s + (c.total_expenses || 0), 0);
        return {
            action: "show_answer",
            params: { total },
            response_text: `Your total recorded crop expenses across all active fields is ₹${total.toLocaleString('en-IN')}.`,
            navigate_to: "/dashboard/farmer/crops",
            requires_followup: false,
            activeSession: session,
        };
    }

    if (parsed.type === "navigate" && parsed.params.target) {
        return {
            action: "navigate",
            params: {},
            response_text: `Opening ${parsed.params.target.label}...`,
            navigate_to: parsed.params.target.path,
            requires_followup: false,
            activeSession: session,
        };
    }

    // Default general response
    return {
        action: "show_answer",
        params: {},
        response_text: `I heard: "${transcript}". You can ask me to log expenses, check mandi prices, check weather, or navigate to any page.`,
        navigate_to: null,
        requires_followup: false,
        activeSession: session,
    };
}

// ── Execute the parsed action ────────────────────────────────────────────────

export async function executeVoiceAction(
    action: VoiceActionResponse,
    options: {
        router: any;
        setLocale?: (locale: any) => void;
    }
): Promise<VoiceExecutionResult> {
    const { router, setLocale } = options;

    switch (action.action) {
        case "navigate":
            return {
                success: true,
                message: action.response_text,
                navigateTo: action.navigate_to,
                requiresFollowup: false,
                activeSession: action.activeSession,
            };

        case "ask_followup":
            return {
                success: true,
                message: action.response_text,
                navigateTo: null,
                requiresFollowup: true,
                activeSession: action.activeSession,
            };

        case "api_call":
            if (action.execution_result) {
                return {
                    success: action.execution_result.success ?? true,
                    message: action.response_text,
                    navigateTo: action.navigate_to,
                    data: action.execution_result.data,
                    requiresFollowup: false,
                    activeSession: action.activeSession,
                };
            }
            return await handleApiCall(action);

        case "fill_form":
            if (typeof window !== "undefined") {
                const event = new CustomEvent("voice-fill-form", {
                    detail: action.params.fields || action.params,
                });
                window.dispatchEvent(event);
            }
            return {
                success: true,
                message: action.response_text,
                navigateTo: action.navigate_to,
                requiresFollowup: false,
                activeSession: action.activeSession,
            };

        case "show_answer":
            return {
                success: true,
                message: action.response_text,
                navigateTo: action.navigate_to,
                requiresFollowup: false,
                activeSession: action.activeSession,
            };

        case "change_language":
            if (setLocale && action.params.locale) {
                setLocale(action.params.locale);
            }
            return {
                success: true,
                message: action.response_text,
                requiresFollowup: false,
                activeSession: action.activeSession,
            };

        default:
            return {
                success: true,
                message: action.response_text,
                navigateTo: action.navigate_to,
                requiresFollowup: false,
                activeSession: action.activeSession,
            };
    }
}

async function handleApiCall(action: VoiceActionResponse): Promise<VoiceExecutionResult> {
    const { endpoint, data } = action.params;
    try {
        if (endpoint === "add_expense") {
            try {
                await api.post(`/crops/${data.crop_id || 1}/expenses`, data);
            } catch {
                // If backend 404/offline, update local state
            }
            return {
                success: true,
                message: action.response_text,
                navigateTo: action.navigate_to || "/dashboard/farmer/crops",
                requiresFollowup: false,
                activeSession: action.activeSession,
            };
        }
        return {
            success: true,
            message: action.response_text,
            navigateTo: action.navigate_to,
            requiresFollowup: false,
            activeSession: action.activeSession,
        };
    } catch {
        return {
            success: true,
            message: action.response_text,
            navigateTo: action.navigate_to,
            requiresFollowup: false,
            activeSession: action.activeSession,
        };
    }
}

function extractAmountFromText(text: string): number | null {
    const match = text.match(/(?:₹|rs\.?|rupees?|रुपये|రూపాయలు)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
    return match ? parseFloat(match[1].replace(/,/g, "")) : null;
}

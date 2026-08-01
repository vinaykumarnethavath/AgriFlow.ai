/**
 * Voice Action Executor — Performs actions based on parsed voice intents.
 *
 * Takes a VoiceIntent and executes the corresponding action:
 * - Calls existing API functions
 * - Navigates to pages
 * - Returns result text for TTS feedback
 */

import { VoiceIntent, NavTarget } from "./voiceIntentParser";
import api, {
    getMarketPrices,
    getWeather,
    getAllFarmerExpenses,
    sendChatMessage,
    MarketPrice,
    WeatherData,
} from "./api";
import { SupportedLocale } from "@/context/LanguageContext";

// ── Result Types ─────────────────────────────────────────────────────────────

export interface VoiceActionResult {
    success: boolean;
    message: string;       // Human-readable result for TTS
    data?: any;            // Optional structured data for UI display
    navigateTo?: string;   // If set, navigate to this path
    formData?: Record<string, any>; // If set, pre-fill a form
}

// ── Response Templates (Multilingual) ────────────────────────────────────────

interface ResponseTemplates {
    priceResult: (crop: string, price: number, trend: string) => string;
    priceNotFound: (crop: string) => string;
    priceAskCrop: () => string;
    weatherResult: (location: string, temp: number, condition: string, humidity: number) => string;
    expenseLogged: (amount: number, category: string) => string;
    expensePrompt: () => string;
    expenseSummary: (total: number, count: number) => string;
    navigating: (page: string) => string;
    error: () => string;
    thinking: () => string;
}

const TEMPLATES: Record<string, ResponseTemplates> = {
    en: {
        priceResult: (crop, price, trend) =>
            `The current market price of ${crop} is ₹${price.toLocaleString()} per quintal. The price is ${trend === "up" ? "going up" : "going down"}.`,
        priceNotFound: (crop) => `Sorry, I couldn't find the market price for ${crop}. Please try another crop.`,
        priceAskCrop: () => "Which crop's price would you like to check? For example, say 'price of rice' or 'wheat rate'.",
        weatherResult: (location, temp, condition, humidity) =>
            `The weather in ${location} is ${condition} with a temperature of ${temp} degrees. Humidity is ${humidity} percent.`,
        expenseLogged: (amount, category) =>
            `Got it! I'll add an expense of ₹${amount.toLocaleString()} for ${category}. Please confirm the details on the form.`,
        expensePrompt: () => "Please tell me the amount and type of expense. For example, say 'spent 500 rupees on fertilizer'.",
        expenseSummary: (total, count) =>
            `You have ${count} recorded expenses totaling ₹${total.toLocaleString()}.`,
        navigating: (page) => `Opening ${page}.`,
        error: () => "Sorry, something went wrong. Please try again.",
        thinking: () => "Let me check that for you...",
    },
    hi: {
        priceResult: (crop, price, trend) =>
            `${crop} का मंडी भाव ₹${price.toLocaleString()} प्रति क्विंटल है। भाव ${trend === "up" ? "बढ़ रहा है" : "गिर रहा है"}.`,
        priceNotFound: (crop) => `माफ़ कीजिए, ${crop} का भाव नहीं मिला। कोई और फसल बताइए।`,
        priceAskCrop: () => "किस फसल का भाव जानना है? जैसे 'चावल का भाव' या 'गेहूं का रेट'।",
        weatherResult: (location, temp, condition, humidity) =>
            `${location} में मौसम ${condition} है। तापमान ${temp} डिग्री और नमी ${humidity} प्रतिशत है।`,
        expenseLogged: (amount, category) =>
            `ठीक है! ₹${amount.toLocaleString()} का ${category} खर्चा जोड़ रहा हूँ। कृपया फॉर्म में विवरण जाँचें।`,
        expensePrompt: () => "कितना खर्चा हुआ और किस पर? जैसे 'खाद पर 500 रुपये खर्च किए'।",
        expenseSummary: (total, count) =>
            `आपके ${count} खर्चे हैं, कुल ₹${total.toLocaleString()}.`,
        navigating: (page) => `${page} खोल रहा हूँ।`,
        error: () => "माफ़ कीजिए, कुछ गलत हो गया। कृपया दोबारा कोशिश करें।",
        thinking: () => "एक मिनट, जाँच रहा हूँ...",
    },
    te: {
        priceResult: (crop, price, trend) =>
            `${crop} మార్కెట్ ధర ₹${price.toLocaleString()} క్వింటాల్‌కు. ధర ${trend === "up" ? "పెరుగుతోంది" : "తగ్గుతోంది"}.`,
        priceNotFound: (crop) => `క్షమించండి, ${crop} ధర దొరకలేదు. మరొక పంట ప్రయత్నించండి.`,
        priceAskCrop: () => "ఏ పంట ధర తెలుసుకోవాలి? ఉదా: 'వరి ధర ఎంత' లేదా 'గోధుమ రేటు'.",
        weatherResult: (location, temp, condition, humidity) =>
            `${location}లో వాతావరణం ${condition}. ఉష్ణోగ్రత ${temp} డిగ్రీలు, తేమ ${humidity} శాతం.`,
        expenseLogged: (amount, category) =>
            `సరే! ${category}కు ₹${amount.toLocaleString()} ఖర్చు జోడిస్తున్నాను. దయచేసి ఫారమ్‌లో వివరాలు చూడండి.`,
        expensePrompt: () => "ఎంత ఖర్చు, దేనికి? ఉదా: 'ఎరువులకు 500 రూపాయలు ఖర్చు'.",
        expenseSummary: (total, count) =>
            `మీకు ${count} ఖర్చులు ఉన్నాయి, మొత్తం ₹${total.toLocaleString()}.`,
        navigating: (page) => `${page} తెరుస్తున్నాను.`,
        error: () => "క్షమించండి, ఏదో తప్పు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
        thinking: () => "ఒక్క నిమిషం, చూస్తున్నాను...",
    },
};

function getTemplate(locale: SupportedLocale): ResponseTemplates {
    return TEMPLATES[locale] || TEMPLATES.en;
}

// ── Action Executors ─────────────────────────────────────────────────────────

async function executeCheckPrice(
    intent: VoiceIntent,
    locale: SupportedLocale
): Promise<VoiceActionResult> {
    const tmpl = getTemplate(locale);
    const cropName = intent.params.cropName;

    if (!cropName) {
        return {
            success: true,
            message: tmpl.priceAskCrop(),
            navigateTo: "/dashboard/farmer/market-prices",
        };
    }

    try {
        const prices = await getMarketPrices();
        const match = prices.find(
            (p: MarketPrice) =>
                p.crop_name.toLowerCase().includes(cropName.toLowerCase()) ||
                cropName.toLowerCase().includes(p.crop_name.toLowerCase())
        );

        if (match) {
            return {
                success: true,
                message: tmpl.priceResult(match.crop_name, match.market_price, match.trend),
                data: match,
            };
        } else {
            return {
                success: false,
                message: tmpl.priceNotFound(cropName),
                navigateTo: "/dashboard/farmer/market-prices",
            };
        }
    } catch {
        return {
            success: false,
            message: tmpl.error(),
        };
    }
}

async function executeCheckWeather(
    locale: SupportedLocale
): Promise<VoiceActionResult> {
    const tmpl = getTemplate(locale);

    try {
        const weather = await getWeather();
        return {
            success: true,
            message: tmpl.weatherResult(
                weather.location,
                weather.temperature,
                weather.condition,
                weather.humidity
            ),
            data: weather,
        };
    } catch {
        return {
            success: false,
            message: tmpl.error(),
            navigateTo: "/dashboard/farmer/weather",
        };
    }
}

async function executeLogExpense(
    intent: VoiceIntent,
    locale: SupportedLocale
): Promise<VoiceActionResult> {
    const tmpl = getTemplate(locale);
    const { amount, category, description } = intent.params;

    if (!amount) {
        return {
            success: true,
            message: tmpl.expensePrompt(),
            navigateTo: "/dashboard/farmer/crops",
        };
    }

    // We don't auto-submit — we navigate to the crops page and pass form data
    return {
        success: true,
        message: tmpl.expenseLogged(amount, category || "Miscellaneous"),
        navigateTo: "/dashboard/farmer/crops",
        formData: {
            amount,
            category: category || "Miscellaneous",
            type: description || "",
            date: new Date().toISOString().split("T")[0],
        },
    };
}

async function executeCheckExpenses(
    locale: SupportedLocale
): Promise<VoiceActionResult> {
    const tmpl = getTemplate(locale);

    try {
        const expenses = await getAllFarmerExpenses();
        const total = expenses.reduce((sum, e) => sum + e.total_cost, 0);
        return {
            success: true,
            message: tmpl.expenseSummary(total, expenses.length),
            data: { total, count: expenses.length },
        };
    } catch {
        return {
            success: false,
            message: tmpl.error(),
            navigateTo: "/dashboard/farmer/expenses",
        };
    }
}

function executeNavigate(
    intent: VoiceIntent,
    locale: SupportedLocale
): VoiceActionResult {
    const tmpl = getTemplate(locale);
    const target = intent.params.target as NavTarget;

    return {
        success: true,
        message: tmpl.navigating(target.label),
        navigateTo: target.path,
    };
}

async function executeFallbackChat(
    intent: VoiceIntent,
    locale: SupportedLocale
): Promise<VoiceActionResult> {
    const tmpl = getTemplate(locale);
    const question = intent.params.question || intent.originalText;

    try {
        const response = await sendChatMessage(question);
        return {
            success: true,
            message: response.answer,
            data: response,
        };
    } catch {
        return {
            success: false,
            message: tmpl.error(),
        };
    }
}

// ── Main Executor ────────────────────────────────────────────────────────────

export async function executeVoiceAction(
    intent: VoiceIntent,
    locale: SupportedLocale
): Promise<VoiceActionResult> {
    switch (intent.type) {
        case "check_price":
            return executeCheckPrice(intent, locale);
        case "check_weather":
            return executeCheckWeather(locale);
        case "log_expense":
            return executeLogExpense(intent, locale);
        case "check_expenses":
            return executeCheckExpenses(locale);
        case "navigate":
            return executeNavigate(intent, locale);
        case "fallback_chat":
            return executeFallbackChat(intent, locale);
        default:
            return {
                success: false,
                message: getTemplate(locale).error(),
            };
    }
}

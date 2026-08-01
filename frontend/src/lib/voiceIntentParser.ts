/**
 * Voice Intent Parser — Multilingual NLP engine for voice command processing.
 *
 * Detects intents from spoken text using keyword-based pattern matching across
 * all 9 supported Indian languages. Extracts entities (amounts, crop names,
 * categories) from the spoken text.
 */

import { SupportedLocale } from "@/context/LanguageContext";

// ── Intent Types ─────────────────────────────────────────────────────────────

export type VoiceIntentType =
    | "log_expense"
    | "check_price"
    | "check_weather"
    | "check_expenses"
    | "navigate"
    | "fallback_chat";

export interface VoiceIntent {
    type: VoiceIntentType;
    confidence: number;
    params: Record<string, any>;
    originalText: string;
}

// ── Navigation Targets ───────────────────────────────────────────────────────

export interface NavTarget {
    path: string;
    label: string;
}

const NAV_TARGETS: Record<string, NavTarget> = {
    dashboard: { path: "/dashboard/farmer", label: "Dashboard" },
    crops: { path: "/dashboard/farmer/crops", label: "My Crops" },
    market: { path: "/dashboard/farmer/market", label: "Buy Fertilizers" },
    market_prices: { path: "/dashboard/farmer/market-prices", label: "Market Prices" },
    weather: { path: "/dashboard/farmer/weather", label: "Weather" },
    news: { path: "/dashboard/farmer/news", label: "Farmer News" },
    community: { path: "/dashboard/farmer/community", label: "Community Hub" },
    nutrition: { path: "/dashboard/farmer/nutrition", label: "Precision Nutrition" },
    learning: { path: "/dashboard/farmer/learning", label: "Learning Hub" },
    expenses: { path: "/dashboard/farmer/expenses", label: "Expenses" },
    profile: { path: "/dashboard/farmer/profile", label: "Profile" },
};

// ── Multilingual Keyword Dictionaries ────────────────────────────────────────

interface KeywordDict {
    expense: string[];
    price: string[];
    weather: string[];
    navigate: string[];
    totalExpense: string[];
    // Navigation keywords by target
    navCrops: string[];
    navMarket: string[];
    navMarketPrices: string[];
    navWeather: string[];
    navNews: string[];
    navCommunity: string[];
    navLearning: string[];
    navExpenses: string[];
    navDashboard: string[];
    navProfile: string[];
    navNutrition: string[];
}

const KEYWORDS: Record<SupportedLocale, KeywordDict> = {
    en: {
        expense: ["expense", "add expense", "log expense", "spent", "cost", "paid", "bought", "purchased", "payment"],
        price: ["price", "rate", "cost of", "how much", "market price", "mandi rate", "what is the price", "kilo", "quintal"],
        weather: ["weather", "rain", "temperature", "forecast", "climate", "hot", "cold", "humidity"],
        navigate: ["go to", "open", "show", "navigate", "take me to", "show me"],
        totalExpense: ["total expense", "how much spent", "total cost", "spending", "expenditure", "my expenses", "all expenses"],
        navCrops: ["crops", "my crops", "crop list", "farming"],
        navMarket: ["fertilizer", "buy fertilizer", "shop", "market", "buy", "store"],
        navMarketPrices: ["market price", "mandi", "rates", "commodity prices", "price list"],
        navWeather: ["weather", "rain", "forecast", "climate"],
        navNews: ["news", "updates", "farmer news", "agriculture news", "latest news"],
        navCommunity: ["community", "chat", "farmers", "group", "discussion"],
        navLearning: ["learning", "videos", "tutorial", "learn", "education"],
        navExpenses: ["expenses", "expense list", "expense history", "my spending"],
        navDashboard: ["dashboard", "home", "main"],
        navProfile: ["profile", "settings", "account", "my profile"],
        navNutrition: ["nutrition", "fertilizer recommendation", "soil", "nutrient"],
    },
    hi: {
        expense: ["खर्च", "खर्चा", "लागत", "भुगतान", "पैसा", "रुपये", "खरीदा", "खर्च जोड़ो", "पैसे दिए"],
        price: ["भाव", "दाम", "कीमत", "रेट", "मंडी", "क्या भाव", "कितने का"],
        weather: ["मौसम", "बारिश", "तापमान", "गर्मी", "सर्दी", "नमी"],
        navigate: ["खोलो", "दिखाओ", "जाओ", "ले चलो"],
        totalExpense: ["कुल खर्च", "कितना खर्चा", "कुल लागत", "पूरा खर्चा"],
        navCrops: ["फसल", "मेरी फसल", "खेती"],
        navMarket: ["खाद", "उर्वरक", "दुकान", "बाज़ार"],
        navMarketPrices: ["मंडी भाव", "बाज़ार भाव", "रेट"],
        navWeather: ["मौसम", "बारिश"],
        navNews: ["समाचार", "खबर", "ताजा खबर"],
        navCommunity: ["समुदाय", "किसान चैट", "ग्रुप"],
        navLearning: ["सीखो", "वीडियो", "शिक्षा"],
        navExpenses: ["खर्चे", "खर्चा सूची"],
        navDashboard: ["डैशबोर्ड", "होम", "मुखपृष्ठ"],
        navProfile: ["प्रोफाइल", "सेटिंग"],
        navNutrition: ["पोषण", "खाद सुझाव", "मिट्टी"],
    },
    te: {
        expense: ["ఖర్చు", "ఖర్చులు", "వ్యయం", "చెల్లింపు", "రూపాయలు", "కొన్నాను", "డబ్బు"],
        price: ["ధర", "రేటు", "ఎంత", "మార్కెట్ ధర", "మంది ధర", "ధర ఎంత"],
        weather: ["వాతావరణం", "వర్షం", "ఉష్ణోగ్రత", "వేడి", "చల్లని", "తేమ"],
        navigate: ["తెరవు", "చూపించు", "వెళ్ళు", "తీసుకెళ్ళు"],
        totalExpense: ["మొత్తం ఖర్చు", "ఎంత ఖర్చు", "మొత్తం వ్యయం"],
        navCrops: ["పంటలు", "నా పంటలు", "వ్యవసాయం"],
        navMarket: ["ఎరువులు", "దుకాణం", "మార్కెట్"],
        navMarketPrices: ["మార్కెట్ ధరలు", "మంది ధరలు", "రేట్లు"],
        navWeather: ["వాతావరణం", "వర్షం"],
        navNews: ["వార్తలు", "తాజా వార్తలు"],
        navCommunity: ["సమాజం", "చాట్", "గ్రూపు"],
        navLearning: ["నేర్చుకో", "వీడియోలు", "చదువు"],
        navExpenses: ["ఖర్చులు", "ఖర్చు జాబితా"],
        navDashboard: ["డాష్‌బోర్డ్", "హోమ్"],
        navProfile: ["ప్రొఫైల్", "సెట్టింగ్స్"],
        navNutrition: ["పోషణ", "ఎరువు సూచన", "నేల"],
    },
    ta: {
        expense: ["செலவு", "செலவுகள்", "பணம்", "ரூபாய்", "கொடுத்தேன்", "வாங்கினேன்"],
        price: ["விலை", "ரேட்", "எவ்வளவு", "மார்க்கெட் விலை", "மண்டி விலை"],
        weather: ["வானிலை", "மழை", "வெப்பநிலை", "வெயில்", "குளிர்"],
        navigate: ["திற", "காட்டு", "போ", "அழைத்துச் செல்"],
        totalExpense: ["மொத்த செலவு", "எவ்வளவு செலவு"],
        navCrops: ["பயிர்கள்", "என் பயிர்கள்", "விவசாயம்"],
        navMarket: ["உரம்", "கடை", "சந்தை"],
        navMarketPrices: ["சந்தை விலை", "மண்டி விலை", "ரேட்"],
        navWeather: ["வானிலை", "மழை"],
        navNews: ["செய்திகள்", "தகவல்"],
        navCommunity: ["சமூகம்", "அரட்டை", "குழு"],
        navLearning: ["கற்றல்", "வீடியோ", "கல்வி"],
        navExpenses: ["செலவுகள்", "செலவு பட்டியல்"],
        navDashboard: ["டாஷ்போர்ட்", "முகப்பு"],
        navProfile: ["சுயவிவரம்", "அமைப்புகள்"],
        navNutrition: ["ஊட்டச்சத்து", "உரம் பரிந்துரை", "மண்"],
    },
    kn: {
        expense: ["ಖರ್ಚು", "ವೆಚ್ಚ", "ಹಣ", "ರೂಪಾಯಿ", "ಕೊಟ್ಟೆ", "ಕೊಂಡೆ"],
        price: ["ಬೆಲೆ", "ರೇಟ್", "ಎಷ್ಟು", "ಮಾರ್ಕೆಟ್ ಬೆಲೆ"],
        weather: ["ಹವಾಮಾನ", "ಮಳೆ", "ತಾಪಮಾನ", "ಬಿಸಿ", "ತಂಪು"],
        navigate: ["ತೆರೆ", "ತೋರಿಸು", "ಹೋಗು"],
        totalExpense: ["ಒಟ್ಟು ಖರ್ಚು", "ಎಷ್ಟು ಖರ್ಚು"],
        navCrops: ["ಬೆಳೆಗಳು", "ನನ್ನ ಬೆಳೆಗಳು", "ಕೃಷಿ"],
        navMarket: ["ಗೊಬ್ಬರ", "ಅಂಗಡಿ", "ಮಾರುಕಟ್ಟೆ"],
        navMarketPrices: ["ಮಾರುಕಟ್ಟೆ ಬೆಲೆ", "ರೇಟ್‌ಗಳು"],
        navWeather: ["ಹವಾಮಾನ", "ಮಳೆ"],
        navNews: ["ಸುದ್ದಿ", "ತಾಜಾ ಸುದ್ದಿ"],
        navCommunity: ["ಸಮುದಾಯ", "ಚಾಟ್", "ಗುಂಪು"],
        navLearning: ["ಕಲಿ", "ವೀಡಿಯೋ", "ಶಿಕ್ಷಣ"],
        navExpenses: ["ಖರ್ಚುಗಳು", "ಖರ್ಚು ಪಟ್ಟಿ"],
        navDashboard: ["ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "ಹೋಮ್"],
        navProfile: ["ಪ್ರೊಫೈಲ್", "ಸೆಟ್ಟಿಂಗ್ಸ್"],
        navNutrition: ["ಪೋಷಣೆ", "ಗೊಬ್ಬರ ಸೂಚನೆ", "ಮಣ್ಣು"],
    },
    mr: {
        expense: ["खर्च", "खर्चा", "पैसे", "रुपये", "दिले", "विकत घेतले"],
        price: ["भाव", "दर", "किंमत", "रेट", "मंडी भाव", "किती"],
        weather: ["हवामान", "पाऊस", "तापमान", "उष्णता", "थंडी"],
        navigate: ["उघडा", "दाखवा", "जा"],
        totalExpense: ["एकूण खर्च", "किती खर्च", "एकूण खर्चा"],
        navCrops: ["पीक", "माझे पीक", "शेती"],
        navMarket: ["खत", "दुकान", "बाजार"],
        navMarketPrices: ["बाजार भाव", "मंडी भाव", "दर"],
        navWeather: ["हवामान", "पाऊस"],
        navNews: ["बातम्या", "ताज्या बातम्या"],
        navCommunity: ["समुदाय", "चॅट", "गट"],
        navLearning: ["शिका", "व्हिडिओ", "शिक्षण"],
        navExpenses: ["खर्चे", "खर्चाची यादी"],
        navDashboard: ["डॅशबोर्ड", "होम"],
        navProfile: ["प्रोफाइल", "सेटिंग्ज"],
        navNutrition: ["पोषण", "खत सूचना", "माती"],
    },
    bn: {
        expense: ["খরচ", "ব্যয়", "টাকা", "রুপি", "দিলাম", "কিনলাম"],
        price: ["দাম", "রেট", "কত", "মার্কেটের দাম", "মণ্ডির দাম"],
        weather: ["আবহাওয়া", "বৃষ্টি", "তাপমাত্রা", "গরম", "ঠাণ্ডা"],
        navigate: ["খোলো", "দেখাও", "যাও"],
        totalExpense: ["মোট খরচ", "কত খরচ", "মোট ব্যয়"],
        navCrops: ["ফসল", "আমার ফসল", "চাষ"],
        navMarket: ["সার", "দোকান", "বাজার"],
        navMarketPrices: ["বাজার দর", "মণ্ডির দাম", "রেট"],
        navWeather: ["আবহাওয়া", "বৃষ্টি"],
        navNews: ["সংবাদ", "খবর", "তাজা খবর"],
        navCommunity: ["সম্প্রদায়", "চ্যাট", "গ্রুপ"],
        navLearning: ["শেখো", "ভিডিও", "শিক্ষা"],
        navExpenses: ["খরচগুলো", "খরচের তালিকা"],
        navDashboard: ["ড্যাশবোর্ড", "হোম"],
        navProfile: ["প্রোফাইল", "সেটিংস"],
        navNutrition: ["পুষ্টি", "সার পরামর্শ", "মাটি"],
    },
    gu: {
        expense: ["ખર્ચ", "ખર્ચો", "પૈસા", "રૂપિયા", "આપ્યા", "ખરીદ્યું"],
        price: ["ભાવ", "દર", "કિંમત", "રેટ", "મંડી ભાવ", "કેટલા"],
        weather: ["હવામાન", "વરસાદ", "તાપમાન", "ગરમી", "ઠંડી"],
        navigate: ["ખોલો", "દેખાડો", "જાવ"],
        totalExpense: ["કુલ ખર્ચ", "કેટલો ખર્ચ"],
        navCrops: ["પાક", "મારા પાક", "ખેતી"],
        navMarket: ["ખાતર", "દુકાન", "બજાર"],
        navMarketPrices: ["બજાર ભાવ", "મંડી ભાવ", "રેટ"],
        navWeather: ["હવામાન", "વરસાદ"],
        navNews: ["સમાચાર", "ખબર", "તાજા સમાચાર"],
        navCommunity: ["સમુદાય", "ચેટ", "ગ્રુપ"],
        navLearning: ["શીખો", "વિડીયો", "શિક્ષણ"],
        navExpenses: ["ખર્ચાઓ", "ખર્ચ યાદી"],
        navDashboard: ["ડેશબોર્ડ", "હોમ"],
        navProfile: ["પ્રોફાઇલ", "સેટિંગ્સ"],
        navNutrition: ["પોષણ", "ખાતર સૂચન", "માટી"],
    },
    pa: {
        expense: ["ਖਰਚਾ", "ਖਰਚ", "ਪੈਸੇ", "ਰੁਪਏ", "ਦਿੱਤੇ", "ਖਰੀਦਿਆ"],
        price: ["ਭਾਅ", "ਰੇਟ", "ਕੀਮਤ", "ਮੰਡੀ ਭਾਅ", "ਕਿੰਨੇ"],
        weather: ["ਮੌਸਮ", "ਮੀਂਹ", "ਤਾਪਮਾਨ", "ਗਰਮੀ", "ਠੰਡ"],
        navigate: ["ਖੋਲੋ", "ਦਿਖਾਓ", "ਜਾਓ"],
        totalExpense: ["ਕੁੱਲ ਖਰਚਾ", "ਕਿੰਨਾ ਖਰਚ"],
        navCrops: ["ਫ਼ਸਲਾਂ", "ਮੇਰੀਆਂ ਫ਼ਸਲਾਂ", "ਖੇਤੀ"],
        navMarket: ["ਖਾਦ", "ਦੁਕਾਨ", "ਬਾਜ਼ਾਰ"],
        navMarketPrices: ["ਬਾਜ਼ਾਰ ਭਾਅ", "ਮੰਡੀ ਭਾਅ", "ਰੇਟ"],
        navWeather: ["ਮੌਸਮ", "ਮੀਂਹ"],
        navNews: ["ਖ਼ਬਰਾਂ", "ਤਾਜ਼ਾ ਖ਼ਬਰਾਂ"],
        navCommunity: ["ਭਾਈਚਾਰਾ", "ਚੈਟ", "ਗਰੁੱਪ"],
        navLearning: ["ਸਿੱਖੋ", "ਵੀਡੀਓ", "ਸਿੱਖਿਆ"],
        navExpenses: ["ਖਰਚੇ", "ਖਰਚ ਸੂਚੀ"],
        navDashboard: ["ਡੈਸ਼ਬੋਰਡ", "ਹੋਮ"],
        navProfile: ["ਪ੍ਰੋਫਾਈਲ", "ਸੈਟਿੰਗਜ਼"],
        navNutrition: ["ਪੋਸ਼ਣ", "ਖਾਦ ਸੁਝਾਅ", "ਮਿੱਟੀ"],
    },
};

// ── Expense Categories ───────────────────────────────────────────────────────

const EXPENSE_CATEGORY_KEYWORDS: Record<string, string[]> = {
    Input: ["fertilizer", "seed", "seeds", "pesticide", "herbicide", "insecticide", "manure", "compost", "खाद", "बीज", "कीटनाशक", "ఎరువు", "విత్తనాలు", "உரம்", "விதை", "ಗೊಬ್ಬರ", "ಬೀಜ", "खत", "সার", "বীজ", "ખાતર", "બીજ", "ਖਾਦ", "ਬੀਜ"],
    Labor: ["labor", "labour", "worker", "wage", "wages", "मजदूर", "मजदूरी", "కూలీ", "கூலி", "ಕೂಲಿ", "मजूर", "মজুর", "મજૂર", "ਮਜ਼ਦੂਰ"],
    Machinery: ["tractor", "machine", "equipment", "pump", "ट्रैक्टर", "मशीन", "పంపు", "ట్రాక్టర్", "இயந்திரம்", "ಯಂತ್ರ", "ट्रॅक्टर", "ট্র্যাক্টর", "ટ્રેક્ટર", "ਟਰੈਕਟਰ"],
    Irrigation: ["water", "irrigation", "drip", "bore", "borewell", "पानी", "सिंचाई", "నీరు", "நீர்", "ನೀರು", "পানি", "પાણી", "ਪਾਣੀ"],
    Logistics: ["transport", "truck", "freight", "delivery", "shipping", "ट्रांसपोर्ट", "రవాణా", "போக்குவரத்து", "ಸಾಗಣೆ", "वाहतूक", "পরিবহন", "પરિવહન", "ਢੋਆ-ਢੁਆਈ"],
    Miscellaneous: ["other", "misc", "miscellaneous", "अन्य", "ఇతర", "மற்றவை", "ಇತರ", "इतर", "অন্যান্য", "અન્ય", "ਹੋਰ"],
};

// ── Common Crop Names (for price lookup matching) ────────────────────────────

const CROP_NAMES: Record<string, string[]> = {
    rice: ["rice", "paddy", "चावल", "धान", "వరి", "బియ్యం", "நெல்", "அரிசி", "ಭತ್ತ", "अक्की", "ধান", "চাল", "ચોખા", "ધાન", "ਚਾਵਲ", "ਝੋਨਾ"],
    wheat: ["wheat", "गेहूं", "गहूं", "గోధుమ", "கோதுமை", "ಗೋಧಿ", "गहू", "গম", "ઘઉં", "ਕਣਕ"],
    cotton: ["cotton", "कपास", "పత్తి", "பருத்தி", "ಹತ್ತಿ", "कापूस", "তুলা", "કપાસ", "ਕਪਾਹ"],
    sugarcane: ["sugarcane", "sugar cane", "गन्ना", "చెరుకు", "கரும்பு", "ಕಬ್ಬು", "ऊस", "আখ", "શેરડી", "ਗੰਨਾ"],
    maize: ["maize", "corn", "मक्का", "మొక్కజొన్న", "சோளம்", "ಜೋಳ", "मका", "ভুট্টা", "મકાઈ", "ਮੱਕੀ"],
    soybean: ["soybean", "soy", "सोयाबीन", "సోయాబీన్", "சோயா", "ಸೋಯಾ", "सोयाबीन", "সয়াবিন", "સોયાબીન", "ਸੋਇਆਬੀਨ"],
    groundnut: ["groundnut", "peanut", "मूंगफली", "వేరుశెనగ", "நிலக்கடலை", "ಕಡಲೆಕಾಯಿ", "भुईमूग", "চিনাবাদাম", "મગફળી", "ਮੂੰਗਫਲੀ"],
    turmeric: ["turmeric", "हल्दी", "పసుపు", "மஞ்சள்", "ಅರಿಶಿನ", "हळद", "হলুদ", "હળદર", "ਹਲਦੀ"],
    chilli: ["chilli", "chili", "pepper", "mirch", "मिर्च", "మిరపకాయ", "மிளகாய்", "ಮೆಣಸಿನಕಾಯಿ", "मिरची", "মরিচ", "મરચું", "ਮਿਰਚ"],
    onion: ["onion", "प्याज", "ఉల్లిపాయ", "வெங்காயம்", "ಈರುಳ್ಳಿ", "कांदा", "পেঁয়াজ", "ડુંગળી", "ਪਿਆਜ਼"],
    tomato: ["tomato", "टमाटर", "టమాటో", "தக்காளி", "ಟೊಮೆಟೊ", "टोमॅटो", "টমেটো", "ટામેટું", "ਟਮਾਟਰ"],
    potato: ["potato", "आलू", "ఆలుగడ్డ", "உருளைக்கிழங்கு", "ಆಲೂಗಡ್ಡೆ", "बटाटा", "আলু", "બટાટા", "ਆਲੂ"],
    pulses: ["pulse", "pulses", "dal", "दाल", "పప్పు", "பருப்பு", "ಬೇಳೆ", "डाळ", "ডাল", "દાળ", "ਦਾਲ"],
    mustard: ["mustard", "सरसों", "ఆవాలు", "கடுகு", "ಸಾಸಿವೆ", "मोहरी", "সরিষা", "રાઈ", "ਸਰ੍ਹੋਂ"],
    jowar: ["jowar", "sorghum", "ज्वार", "జొన్న", "சோளம்", "ಜೋಳ", "ज्वारी", "জোয়ার", "જુવાર", "ਜਵਾਰ"],
    bajra: ["bajra", "pearl millet", "बाजरा", "సజ్జ", "கம்பு", "ಸಜ್ಜೆ", "बाजरी", "বাজরা", "બાજરી", "ਬਾਜਰਾ"],
    ragi: ["ragi", "finger millet", "रागी", "రాగి", "கேழ்வரகு", "ರಾಗಿ", "नाचणी", "রাগি", "રાગી", "ਰਾਗੀ"],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeText(text: string): string {
    return text.toLowerCase().trim().replace(/\s+/g, " ");
}

function containsAny(text: string, keywords: string[]): boolean {
    const normalized = normalizeText(text);
    return keywords.some((kw) => normalized.includes(kw.toLowerCase()));
}

function extractAmount(text: string): number | null {
    // Match patterns like "500", "500 rupees", "₹500", "rs 500", "rs. 500"
    const patterns = [
        /₹\s*(\d+(?:,\d+)*(?:\.\d+)?)/,
        /rs\.?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
        /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rupees?|रुपये|రూపాయలు|ரூபாய்|ರೂಪಾಯಿ|रुपये|টাকা|રૂપિયા|ਰੁਪਏ)/i,
        /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rupee|rs)/i,
        // Stand-alone number (if followed by or preceded by expense keywords)
        /\b(\d+(?:,\d+)*(?:\.\d+)?)\b/,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return parseFloat(match[1].replace(/,/g, ""));
        }
    }
    return null;
}

function extractCropName(text: string): string | null {
    const normalized = normalizeText(text);
    for (const [cropKey, aliases] of Object.entries(CROP_NAMES)) {
        for (const alias of aliases) {
            if (normalized.includes(alias.toLowerCase())) {
                return cropKey;
            }
        }
    }
    return null;
}

function detectExpenseCategory(text: string): string {
    for (const [category, keywords] of Object.entries(EXPENSE_CATEGORY_KEYWORDS)) {
        if (containsAny(text, keywords)) {
            return category;
        }
    }
    return "Miscellaneous";
}

function detectNavTarget(text: string, locale: SupportedLocale): NavTarget | null {
    const kw = KEYWORDS[locale] || KEYWORDS.en;

    // Check in priority order (more specific first)
    const targets: [string[], string][] = [
        [kw.navMarketPrices, "market_prices"],
        [kw.navExpenses, "expenses"],
        [kw.navCrops, "crops"],
        [kw.navMarket, "market"],
        [kw.navWeather, "weather"],
        [kw.navNews, "news"],
        [kw.navCommunity, "community"],
        [kw.navLearning, "learning"],
        [kw.navNutrition, "nutrition"],
        [kw.navProfile, "profile"],
        [kw.navDashboard, "dashboard"],
    ];

    for (const [keywords, targetKey] of targets) {
        if (containsAny(text, keywords)) {
            return NAV_TARGETS[targetKey] || null;
        }
    }
    return null;
}

// ── Main Parser ──────────────────────────────────────────────────────────────

export function parseVoiceIntent(text: string, locale: SupportedLocale): VoiceIntent {
    if (!text || !text.trim()) {
        return {
            type: "fallback_chat",
            confidence: 0,
            params: {},
            originalText: text,
        };
    }

    const kw = KEYWORDS[locale] || KEYWORDS.en;
    const normalized = normalizeText(text);

    // 1. Check for expense logging intent
    if (containsAny(text, kw.expense)) {
        const amount = extractAmount(text);
        const category = detectExpenseCategory(text);
        const cropName = extractCropName(text);

        return {
            type: "log_expense",
            confidence: amount ? 0.9 : 0.7,
            params: {
                amount,
                category,
                cropName,
                description: text,
            },
            originalText: text,
        };
    }

    // 2. Check for total expense summary intent
    if (containsAny(text, kw.totalExpense)) {
        return {
            type: "check_expenses",
            confidence: 0.85,
            params: {},
            originalText: text,
        };
    }

    // 3. Check for market price check intent
    if (containsAny(text, kw.price)) {
        const cropName = extractCropName(text);
        return {
            type: "check_price",
            confidence: cropName ? 0.9 : 0.7,
            params: {
                cropName,
            },
            originalText: text,
        };
    }

    // 4. Check for weather check intent
    if (containsAny(text, kw.weather)) {
        return {
            type: "check_weather",
            confidence: 0.85,
            params: {},
            originalText: text,
        };
    }

    // 5. Check for navigation intent
    if (containsAny(text, kw.navigate)) {
        const target = detectNavTarget(text, locale);
        if (target) {
            return {
                type: "navigate",
                confidence: 0.9,
                params: { target },
                originalText: text,
            };
        }
    }

    // 5b. Even without explicit "go to" keywords, check for nav target keywords
    const implicitTarget = detectNavTarget(text, locale);
    if (implicitTarget) {
        return {
            type: "navigate",
            confidence: 0.6,
            params: { target: implicitTarget },
            originalText: text,
        };
    }

    // 6. Fallback to RAG chatbot
    return {
        type: "fallback_chat",
        confidence: 0.5,
        params: { question: text },
        originalText: text,
    };
}

export { NAV_TARGETS, CROP_NAMES };

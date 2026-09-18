"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import en, { TranslationKeys } from "@/locales/en";
import hi from "@/locales/hi";
import te from "@/locales/te";
import ta from "@/locales/ta";
import kn from "@/locales/kn";
import mr from "@/locales/mr";
import bn from "@/locales/bn";
import gu from "@/locales/gu";
import pa from "@/locales/pa";

// ── Types ────────────────────────────────────────────────────────────────────

export type SupportedLocale = "en" | "hi" | "te" | "ta" | "kn" | "mr" | "bn" | "gu" | "pa";

export interface LanguageInfo {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  script: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: "en", name: "English", nativeName: "English", script: "Latn" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", script: "Deva" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", script: "Telu" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", script: "Taml" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", script: "Knda" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", script: "Deva" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", script: "Beng" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", script: "Gujr" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", script: "Guru" },
];

// ── Locale Map ───────────────────────────────────────────────────────────────

const LOCALE_MAP: Record<SupportedLocale, any> = {
  en, hi, te, ta, kn, mr, bn, gu, pa,
};

// ── Common UI / Agricultural Term Translations ──────────────────────────────
// Instant zero-latency translations for frequently viewed dashboard cards & commodities

export const COMMON_TRANSLATIONS: Record<string, Record<SupportedLocale, string>> = {
  // Weather & Telemetry Cards
  "soil moisture": {
    en: "Soil Moisture", hi: "मिट्टी की नमी", te: "నేలలో తేమ", ta: "மண் ஈரப்பதம்", kn: "ಮಣ್ಣಿನ ತೇವಾಂಶ", mr: "मातीतील ओलावा", bn: "মাটির আর্দ্রতা", gu: "જમીનમાં ભેજ", pa: "ਮਿੱਟੀ ਦੀ ਨਮੀ"
  },
  "optimal moisture": {
    en: "Optimal Moisture", hi: "उचित नमी", te: "అనుకూలమైన తేమ", ta: "சிறந்த ஈரப்பதம்", kn: "ಸೂಕ್ತ ತೇವಾಂಶ", mr: "योग्य ओलावा", bn: "অনুকূল আর্দ্রতা", gu: "યોગ્ય ભેજ", pa: "ਅਨੁਕੂਲ ਨਮੀ"
  },
  "needs watering": {
    en: "Needs Watering", hi: "पानी की आवश्यकता", te: "నీరు అవసరం", ta: "தண்ணீர் தேவை", kn: "ನೀರು ಬೇಕು", mr: "पाण्याची गरज", bn: "পানি প্রয়োজন", gu: "પાણીની જરૂર", pa: "ਪਾਣੀ ਦੀ ਲੋੜ"
  },
  "air temperature": {
    en: "Air Temperature", hi: "हवा का तापमान", te: "గాలి ఉష్ణోగ్రత", ta: "காற்று வெப்பநிலை", kn: "ಗಾಳಿಯ ತಾಪಮಾನ", mr: "हवेचे तापमान", bn: "বাতাসের তাপমাত্রা", gu: "હવાનું તાપમાન", pa: "ਹਵਾ ਦਾ ਤਾਪਮਾਨ"
  },
  "rainfall today": {
    en: "Rainfall Today", hi: "आज की वर्षा", te: "ఈరోజు వర్షపాతం", ta: "இன்றைய மழை", kn: "ಇಂದಿನ ಮಳೆ", mr: "आजचा पाऊस", bn: "আজকের বৃষ্টিপাত", gu: "આજનો વરસાદ", pa: "ਅੱਜ ਦੀ ਬਾਰਿਸ਼"
  },
  "wind speed": {
    en: "Wind Speed", hi: "हवा की गति", te: "గాలి వేగం", ta: "காற்றின் வேகம்", kn: "ಗಾಳಿಯ ವೇಗ", mr: "वाऱ्याचा वेग", bn: "বাতাসের গতি", gu: "પવનની ગતિ", pa: "ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ"
  },
  "water evaporation": {
    en: "Water Evaporation", hi: "जल वाष्पीकरण", te: "నీటి ఆవిరి", ta: "நீர் ஆவியாதல்", kn: "ನೀರಿನ ಆವಿಯಾಗುವಿಕೆ", mr: "पाण्याचे बाष्पीभवन", bn: "পানি বাষ্পীভবন", gu: "પાણીનું બાષ્પીભવન", pa: "ਪਾਣੀ ਦਾ ਵਾਸ਼ਪੀਕਰਨ"
  },
  "farm location": {
    en: "Farm Location", hi: "खेत का स्थान", te: "వ్యవసాయ క్షేత్ర స్థానం", ta: "பண்ணை அமைவிடம்", kn: "ಕೃಷಿ ಭೂಮಿಯ ಸ್ಥಳ", mr: "शेताचे स्थान", bn: "খামারের অবস্থান", gu: "ખેતરનું સ્થાન", pa: "ਖੇਤ ਦਾ ਸਥਾਨ"
  },
  "smart farmer advisory & immediate action tips": {
    en: "Smart Farmer Advisory & Immediate Action Tips", hi: "स्मार्ट किसान सलाह और त्वरित सुझाव", te: "స్మార్ట్ రైతు సలహాలు & తక్షణ సూచనలు", ta: "ஸ்மார்ட் உழவர் ஆலோசனை மற்றும் உடனடி குறிப்புகள்", kn: "ಸ್ಮಾರ್ಟ್ ರೈತ ಸಲಹೆಗಳು ಮತ್ತು ತಕ್ಷಣದ ಸಲಹೆಗಳು", mr: "स्मार्ट शेतकरी सल्ला आणि त्वरित कृती टिप्स", bn: "স্মার্ট কৃষক পরামর্শ এবং তাৎক্ষণিক পদক্ষেপ টিপস", gu: "સ્માર્ટ ખેડૂત સલાહ અને તાત્કાલિક પગલાં ટિપ્સ", pa: "ਸਮਾਰਟ ਕਿਸਾਨ ਸਲਾਹ ਅਤੇ ਤੁਰੰਤ ਕਾਰਵਾਈ ਸੁਝਾਅ"
  },
  "forecast (7 days)": {
    en: "Forecast (7 Days)", hi: "7 दिनों का पूर्वानुमान", te: "7 రోజుల వాతావరణ అంచనా", ta: "7 நாள் முன்னறிவிப்பு", kn: "ಮುನ್ಸೂಚನೆ (7 ದಿನಗಳು)", mr: "7 दिवसांचा अंदाज", bn: "৭ দিনের পূর্বাভাস", gu: "આગાહી (7 દિવસ)", pa: "7 ਦਿਨਾਂ ਦੀ ਭਵਿੱਖਬਾਣੀ"
  },
  "soil moisture depth analysis": {
    en: "Soil Moisture Depth Analysis", hi: "मिट्टी की गहराई में नमी का विश्लेषण", te: "నేల తేమ లోతు విశ్లేషణ", ta: "மண் ஈரப்பத ஆழ பகுப்பாய்வு", kn: "ಮಣ್ಣಿನ ತೇವಾಂಶ ಆಳ ವಿಶ್ಲೇಷಣೆ", mr: "मातीतील ओलावा खोली विश्लेषण", bn: "মাটির আর্দ্রতা গভীরতা বিশ্লেষণ", gu: "જમીનના ભેજનું ઊંડાણ વિશ્લેષણ", pa: "ਮਿੱਟੀ ਦੀ ਨਮੀ ਡੂੰਘਾਈ ਵਿਸ਼ਲੇਸ਼ਣ"
  },
  "fetching live agricultural telemetry...": {
    en: "Fetching live agricultural telemetry...", hi: "लाइव कृषि मौसम डेटा लोड हो रहा है...", te: "ప్రత్యక్ష వ్యవసాయ డేటా లోడ్ అవుతోంది...", ta: "நேரடி வேளாண் தரவு பெறப்படுகிறது...", kn: "ಲೈವ್ ಕೃಷಿ ಡೇಟಾವನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...", mr: "थेट कृषी डेटा लोड होत आहे...", bn: "লাইভ কৃষি ডেটা লোড হচ্ছে...", gu: "લાઇવ કૃષિ ડેટા લોડ થઈ રહ્યો છે...", pa: "ਲਾਈਵ ਖੇਤੀਬਾੜੀ ਡੇਟਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ..."
  },
  "surface moisture": {
    en: "Surface moisture", hi: "सतह की नमी", te: "ఉపరితల తేమ", ta: "மேற்பரப்பு ஈரப்பதம்", kn: "ಮೇಲ್ಮೈ ತೇವಾಂಶ", mr: "पृष्ठभागावरील ओलावा", bn: "পৃষ্ঠের আর্দ্রতা", gu: "સપાટીનો ભેજ", pa: "ਸਤਹ ਦੀ ਨਮੀ"
  },
  "current temp": {
    en: "Current temp", hi: "वर्तमान तापमान", te: "ప్రస్తుత ఉష్ణోగ్రత", ta: "தற்போதைய வெப்பநிலை", kn: "ಪ್ರಸ್ತುತ ತಾಪಮಾನ", mr: "सध्याचे तापमान", bn: "বর্তমান তাপমাত্রা", gu: "વર્તમાન તાપમાન", pa: "ਮੌਜੂਦਾ ਤਾਪਮਾਨ"
  },
  "partly cloudy": {
    en: "Partly Cloudy", hi: "आंशिक रूप से बादल", te: "పాక్షికంగా మేఘావృతం", ta: "பகுதியளவு மேகமூட்டம்", kn: "ಭಾಗಶಃ ಮೋಡ", mr: "अंशतः ढगाळ", bn: "আংশিক মেঘলা", gu: "આંશિક વાદળછાયું", pa: "ਅੰਸ਼ਕ ਤੌਰ 'ਤੇ ਬੱਦਲਵਾਈ"
  },
  "cloudy": {
    en: "Cloudy", hi: "बादल", te: "మేఘావృతం", ta: "மேகமூட்டம்", kn: "ಮೋಡ", mr: "ढगाळ", bn: "মেঘলা", gu: "વાદળછાયું", pa: "ਬੱਦਲਵਾਈ"
  },
  "sunny": {
    en: "Sunny", hi: "धूप", te: "ఎండ", ta: "வெயில்", kn: "ಬಿಸಿಲು", mr: "सूर्यप्रकाशित", bn: "রৌদ্রোজ্জ্বল", gu: "તડકો", pa: "ਧੁੱਪ"
  },
  "rainy": {
    en: "Rainy", hi: "बरसात", te: "వర్షకారం", ta: "மழை", kn: "ಮಳೆ", mr: "पावसाळी", bn: "বৃষ্টিপাত", gu: "વરસાદી", pa: "ਬਰਸਾਤ"
  },
  "clear sky": {
    en: "Clear Sky", hi: "साफ आसमान", te: "స్వచ్ఛమైన ఆకాశం", ta: "தெளிவான வானம்", kn: "ಸ್ವಚ್ಛ ಆಕಾಶ", mr: "निरभ्र आकाश", bn: "পরিষ্কার আকাশ", gu: "સ્વચ્છ આકાશ", pa: "ਸਾਫ਼ ਅਸਮਾਨ"
  },
  "today": {
    en: "Today", hi: "आज", te: "ఈరోజు", ta: "இன்று", kn: "ಇಂದು", mr: "आज", bn: "আজ", gu: "આજે", pa: "ਅੱਜ"
  },
  "tomorrow": {
    en: "Tomorrow", hi: "कल", te: "రేపు", ta: "நாளை", kn: "ನಾಳೆ", mr: "उद्या", bn: "আগামীকাল", gu: "આવતીકાલે", pa: "ਕੱਲ੍ਹ"
  },
  "sun": {
    en: "Sun", hi: "रवि", te: "ఆది", ta: "ஞாயிறு", kn: "ಭಾನು", mr: "रवि", bn: "রবি", gu: "રવિ", pa: "ਐਤ"
  },
  "mon": {
    en: "Mon", hi: "सोम", te: "సోమ", ta: "திங்கள்", kn: "ಸೋಮ", mr: "सोम", bn: "সোম", gu: "સોમ", pa: "ਸੋਮ"
  },
  "tue": {
    en: "Tue", hi: "मंगल", te: "మంగళ", ta: "செவ்வாய்", kn: "ಮಂಗಳ", mr: "मंगळ", bn: "মঙ্গল", gu: "મંગળ", pa: "ਮੰਗਲ"
  },
  "wed": {
    en: "Wed", hi: "बुध", te: "బుధ", ta: "புதன்", kn: "ಬುಧ", mr: "बुध", bn: "বুধ", gu: "બુધ", pa: "ਬੁੱਧ"
  },
  "thu": {
    en: "Thu", hi: "गुरु", te: "గురు", ta: "வியாழன்", kn: "ಗುರು", mr: "गुरु", bn: "বৃহঃ", gu: "ગુરુ", pa: "ਵੀਰ"
  },
  "fri": {
    en: "Fri", hi: "शुक्र", te: "శుక్ర", ta: "வெள்ளி", kn: "ಶುಕ್ರ", mr: "शुक्र", bn: "শুক্র", gu: "શુક્ર", pa: "ਸ਼ੁੱਕਰ"
  },
  "sat": {
    en: "Sat", hi: "शनि", te: "శని", ta: "சனி", kn: "ಶನಿ", mr: "शनि", bn: "শনি", gu: "શનિ", pa: "ਸ਼ਨਿੱਚਰ"
  },

  // Agricultural Commodities (Mandis & Market Prices)
  "rice": {
    en: "Rice", hi: "चावल / धान", te: "వరి", ta: "அரிசி", kn: "ಅಕ್ಕಿ", mr: "तांदूळ", bn: "চাল", gu: "ચોખા", pa: "ਚੌਲ"
  },
  "paddy": {
    en: "Paddy", hi: "धान", te: "వరి ధాన్యం", ta: "நெல்", kn: "ಭತ್ತ", mr: "भात", bn: "ধান", gu: "ડાંગર", pa: "ਝੋਨਾ"
  },
  "wheat": {
    en: "Wheat", hi: "गेहूं", te: "గోధుమ", ta: "கோதுமை", kn: "ಗೋಧಿ", mr: "गहू", bn: "গম", gu: "ઘઉં", pa: "ਕਣਕ"
  },
  "cotton": {
    en: "Cotton", hi: "कपास", te: "పత్తి", ta: "பருத்தி", kn: "ಹತ್ತಿ", mr: "कापूस", bn: "তুলা", gu: "કપાસ", pa: "ਕਪਾਹ"
  },
  "chilli": {
    en: "Chilli", hi: "मिर्च", te: "మిరప", ta: "மிளகாய்", kn: "ಮೆಣಸಿನಕಾಯಿ", mr: "मिरची", bn: "লঙ্কা", gu: "મરચાં", pa: "ਮਿਰਚ"
  },
  "maize": {
    en: "Maize", hi: "मक्का", te: "మొక్కజొన్న", ta: "மக்காச்சோளம்", kn: "ಮೆಕ್ಕೆಜೋಳ", mr: "मका", bn: "ভুট্টা", gu: "મકાઈ", pa: "ਮੱਕੀ"
  },
  "turmeric": {
    en: "Turmeric", hi: "हल्दी", te: "పసుపు", ta: "மஞ்சள்", kn: "ಅರಿಶಿನ", mr: "हळद", bn: "হলুদ", gu: "હળદર", pa: "ਹਲਦੀ"
  },
  "tomato": {
    en: "Tomato", hi: "टमाटर", te: "టమాటా", ta: "தக்காளி", kn: "ಟೊಮೆಟೊ", mr: "टोमॅटो", bn: "টমেটো", gu: "ટામેટા", pa: "ਟਮਾਟਰ"
  },
  "onion": {
    en: "Onion", hi: "प्याज", te: "ఉల్లిపాయ", ta: "வெங்காயம்", kn: "ಈರುಳ್ಳಿ", mr: "कांदा", bn: "পেঁয়াজ", gu: "ડુંગળી", pa: "ਪਿਆਜ਼"
  },
  "soybean": {
    en: "Soybean", hi: "सोयाबीन", te: "సోయాబీన్", ta: "சோயாபீன்", kn: "ಸೋಯಾಬೀನ್", mr: "सोयाबीन", bn: "সয়াবিন", gu: "સોયાબીન", pa: "ਸੋਇਆਬੀਨ"
  },
  "groundnut": {
    en: "Groundnut", hi: "मूंगफली", te: "వేరుశనగ", ta: "வேர்க்கடலை", kn: "ಕಡಲೆಕಾಯಿ", mr: "भुईमूग", bn: "চীনাবাদাম", gu: "મગફળી", pa: "ਮੂੰਗਫਲੀ"
  },

  // Dashboard & Farmer Actions
  "complete your farmer profile": {
    en: "Complete Your Farmer Profile", hi: "अपनी किसान प्रोफ़ाइल पूरी करें", te: "మీ రైతు ప్రొఫైల్‌ను పూర్తి చేయండి", ta: "உங்கள் உழவர் சுயவிவரத்தை முடிக்கவும்", kn: "ನಿಮ್ಮ ರೈತ ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸಿ", mr: "तुमची शेतकरी प्रोफाइल पूर्ण करा", bn: "আপনার কৃষক প্রোফাইল সম্পূর্ণ করুন", gu: "તમારી ખેડૂત પ્રોફાઇલ પૂર્ણ કરો", pa: "ਆਪਣੀ ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਪੂਰੀ ਕਰੋ"
  },
  "quick actions": {
    en: "Quick Actions", hi: "त्वरित कार्य", te: "త్వరిత చర్యలు", ta: "விரைவான செயல்கள்", kn: "ತ್ವರಿತ ಕ್ರಿಯೆಗಳು", mr: "त्वरित कृती", bn: "দ্রুত ক্রিয়া", gu: "ઝડપી ક્રિયાઓ", pa: "ਤੁਰੰਤ ਕਾਰਵਾਈਆਂ"
  },
  "add crop": {
    en: "Add Crop", hi: "फसल जोड़ें", te: "పంటను జోడించండి", ta: "பயிரைச் சேர்க்கவும்", kn: "ಬೆಳೆಯನ್ನು ಸೇರಿಸಿ", mr: "पीक जोडा", bn: "ফসল যোগ করুন", gu: "પાક ઉમેરો", pa: "ਫਸਲ ਸ਼ਾਮਲ ਕਰੋ"
  },
  "log expense": {
    en: "Log Expense", hi: "खर्च दर्ज करें", te: "ఖర్చును నమోదు చేయండి", ta: "செலவை பதிவு செய்யவும்", kn: "ವೆಚ್ಚವನ್ನು ದಾಖಲಿಸಿ", mr: "खर्च नोंदवा", bn: "খরচ নথিভুক্ত করুন", gu: "ખર્ચ નોંધો", pa: "ਖਰਚਾ ਦਰਜ ਕਰੋ"
  },
  "record harvest": {
    en: "Record Harvest", hi: "कटाई दर्ज करें", te: "దిగుబడిని నమోదు చేయండి", ta: "அறுவடை பதிவு செய்யவும்", kn: "ಕೊಯ್ಲು ದಾಖಲಿಸಿ", mr: "कापणी नोंदवा", bn: "ফসল কাটা রেকর্ড করুন", gu: "લણણી નોંધો", pa: "ਵਾਢੀ ਦਰਜ ਕਰੋ"
  },
  "sell harvest": {
    en: "Sell Harvest", hi: "फसल बेचें", te: "దిగుబడిని అమ్మండి", ta: "அறுவடை விற்கவும்", kn: "ಕೊಯ್ಲು ಮಾರಾಟ ಮಾಡಿ", mr: "कापणी विका", bn: "ফসল বিক্রি করুন", gu: "પાક વેચો", pa: "ਵਾਢੀ ਵੇਚੋ"
  },

  // Community Hub Aliases
  "groups": {
    en: "Groups", hi: "समूह", te: "సమూహాలు", ta: "குழுக்கள்", kn: "ಗುಂಪುಗಳು", mr: "गट", bn: "দলসমূহ", gu: "જૂથો", pa: "ਸਮੂਹ"
  },
  "search people by name or phone...": {
    en: "Search people by name or phone...", hi: "नाम या फोन से खोजें...", te: "పేరు లేదా ఫోన్ ద్వారా వెతకండి...", ta: "பெயர் அல்லது தொலைபேசி மூலம் தேடுங்கள்...", kn: "ಹೆಸರು ಅಥವಾ ಫೋನ್ ಮೂಲಕ ಹುಡುಕಿ...", mr: "नाव किंवा फोनद्वारे शोधा...", bn: "নাম বা ফোন দ্বারা অনুসন্ধান করুন...", gu: "નામ અથવા ફોન દ્વારા શોધો...", pa: "ਨਾਮ ਜਾਂ ਫੋਨ ਰਾਹੀਂ ਖੋਜੋ..."
  },
  "search results": {
    en: "Search Results", hi: "खोज परिणाम", te: "శోధన ఫలితాలు", ta: "தேடல் முடிவுகள்", kn: "ಹುಡುಕಾಟ ಫಲಿತಾಂಶಗಳು", mr: "शोध निकाल", bn: "অনুসন্ধান ফলাফল", gu: "શોધ પરિણામો", pa: "ਖੋਜ ਨਤੀਜੇ"
  },
  "← back to chats": {
    en: "← Back to Chats", hi: "← चैट पर वापस जाएं", te: "← చాట్‌లకు తిరిగి వెళ్ళండి", ta: "← அரட்டைகளுக்குத் திரும்பு", kn: "← ಚಾಟ್‌ಗಳಿಗೆ ಹಿಂತಿರುಗಿ", mr: "← चॅट्सवर परत जा", bn: "← চ্যাটে ফিরে যান", gu: "← ચેટ્સ પર પાછા જાઓ", pa: "← ਚੈਟਾਂ 'ਤੇ ਵਾਪਸ ਜਾਓ"
  },
  "searching users...": {
    en: "Searching users...", hi: "उपयोगकर्ताओं को खोजा जा रहा है...", te: "వినియోగదారులను వెతుకుతోంది...", ta: "பயனர்களைத் தேடுகிறது...", kn: "ಬಳಕೆದಾರರನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...", mr: "वापरकर्ते शोधत आहे...", bn: "ব্যবহারকারী খোঁজা হচ্ছে...", gu: "વપરાશકર્તાઓને શોધી રહ્યું છે...", pa: "ਉਪਭੋਗਤਾਵਾਂ ਦੀ ਖੋਜ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ..."
  },
  "no users found matching your search.": {
    en: "No users found matching your search.", hi: "आपकी खोज से कोई उपयोगकर्ता नहीं मिला।", te: "మీ శోధనకు సరిపోలే వినియోగదారులు కనుగొనబడలేదు.", ta: "உங்கள் தேடலுடன் பொருந்தும் பயனர்கள் இல்லை.", kn: "ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ಬಳಕೆದಾರರು ಸಿಗಲಿಲ್ಲ.", mr: "कोणताही वापरकर्ता सापडला नाही.", bn: "কোনো ব্যবহারকারী পাওয়া যায়নি।", gu: "કોઈ વપરાશકર્તા મળ્યા નથી.", pa: "ਕੋਈ ਉਪਭੋਗਤਾ ਨਹੀਂ ਮਿਲਿਆ।"
  },
  "agri experts": {
    en: "Agri Experts", hi: "कृषि विशेषज्ञ", te: "వ్యవసాయ నిపుణులు", ta: "வேளாண் நிபுணர்கள்", kn: "ಕೃಷಿ ತಜ್ಞರು", mr: "कृषी तज्ज्ञ", bn: "কৃষি বিশেষজ্ঞ", gu: "કૃષિ નિષ્ણાતો", pa: "ਖੇਤੀ ਮਾਹਿਰ"
  },
  "farmer community hub": {
    en: "Farmer Community Hub", hi: "किसान कम्युनिटी हब", te: "రైతు కమ్యూనిటీ హబ్", ta: "விவசாயி சமூக மையம்", kn: "ರೈತ ಸಮುದಾಯ ಕೇಂದ್ರ", mr: "शेतकरी कम्युनिटी हब", bn: "কৃষক কমিউনিটি হাব", gu: "ખેડૂત કોમ્યુનિટી હબ", pa: "ਕਿਸਾਨ ਕਮਿਊਨਿਟੀ ਹੱਬ"
  },
  "connect with farmers, share expertise, and trade farming tips locally.": {
    en: "Connect with farmers, share expertise, and trade farming tips locally.", hi: "किसानों से जुड़ें, विशेषज्ञता साझा करें और स्थानीय स्तर पर खेती के सुझावों का व्यापार करें।", te: "రైతులతో కనెక్ట్ అవ్వండి, నైపుణ్యాన్ని పంచుకోండి మరియు స్థానికంగా వ్యవసాయ చిట్కాలను మార్చుకోండి.", ta: "விவசாயிகளுடன் இணையுங்கள், நிபுணத்துவத்தைப் பகிர்ந்து கொள்ளுங்கள், உள்ளூரில் விவசாயக் குறிப்புகளைப் பரிமாறிக் கொள்ளுங்கள்.", kn: "ರೈತರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ, ಪರಿಣತಿಯನ್ನು ಹಂಚಿಕೊಳ್ಳಿ ಮತ್ತು ಸ್ಥಳೀಯವಾಗಿ ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ವ್ಯಾಪಾರ ಮಾಡಿ.", mr: "शेतकऱ्यांशी कनेक्ट व्हा, कौशल्य सामायिक करा आणि स्थानिक पातळीवर शेतीच्या टिप्सचा व्यापार करा.", bn: "কৃষকদের সাথে সংযোগ করুন, দক্ষতা ভাগ করুন এবং স্থানীয়ভাবে কৃষিকাজের টিপস বিনিময় করুন।", gu: "ખેડૂતો સાથે જોડાઓ, કુશળતા શેર કરો અને સ્થાનિક રીતે ખેતીની ટીપ્સનો વેપાર કરો.", pa: "ਕਿਸਾਨਾਂ ਨਾਲ ਜੁੜੋ, ਮੁਹਾਰਤ ਸਾਂਝੀ ਕਰੋ, ਅਤੇ ਸਥਾਨਕ ਤੌਰ 'ਤੇ ਖੇਤੀ ਦੇ ਸੁਝਾਵਾਂ ਦਾ ਵਪાર ਕਰੋ।"
  },
  "active chats": {
    en: "Active Chats", hi: "सक्रिय चैट", te: "క్రియాశీల చాట్‌లు", ta: "செயலில் உள்ள அரட்டைகள்", kn: "ಸಕ್ರಿಯ ಚಾಟ್‌ಗಳು", mr: "सक्रिय चॅट्स", bn: "সক্রিয় চ্যাট", gu: "સક્રિય ચેટ્સ", pa: "ਸਰਗਰਮ ਚੈਟਾਂ"
  },
  "experts q&a": {
    en: "Experts Q&A", hi: "विशेषज्ञ प्रश्नोत्तर", te: "నిపుణుల ప్ర&జ", ta: "நிபுணர்கள் প্রশ্নোত্তর", kn: "ತಜ್ಞರ ಪ್ರಶ್ನೋತ್ತರ", mr: "तज्ज्ञांचे प्रश्नोत्तरे", bn: "বিশেষজ্ঞদের প্রশ্নোত্তর", gu: "નિષ્ણાતોના પ્રશ્નોત્તરી", pa: "ਮਾਹਿਰਾਂ ਦੇ ਸਵਾਲ-ਜਵਾਬ"
  },
  "no active chats": {
    en: "No Active Chats", hi: "कोई सक्रिय चैट नहीं", te: "క్రియాశీల చాట్‌లు లేవు", ta: "செயலில் உள்ள அரட்டைகள் இல்லை", kn: "ಯಾವುದೇ ಸಕ್ರಿಯ ಚಾಟ್‌ಗಳಿಲ್ಲ", mr: "कोणतेही सक्रिय चॅट्स नाहीत", bn: "কোনো সক্রিয় চ্যাট নেই", gu: "કોઈ સક્રિય ચેટ્સ નથી", pa: "ਕੋਈ ਸਰਗਰਮ ਚੈਟ ਨਹੀਂ"
  },
  "use the search bar above to find people by name or phone number and start chatting.": {
    en: "Use the search bar above to find people by name or phone number and start chatting.", hi: "नाम या फोन नंबर से लोगों को खोजने और चैट शुरू करने के लिए ऊपर दिए गए खोज बार का उपयोग करें।", te: "పేరు లేదా ఫోన్ నంబర్ ద్వారా వ్యక్తులను కనుగొని చాట్ చేయడం ప్రారంభించడానికి పై శోధన పట్టీని ఉపయోగించండి.", ta: "பெயர் அல்லது தொலைபேசி எண் மூலம் ஆட்களைக் கண்டுபிடித்து அரட்டையடிக்க மேலே உள்ள தேடல் பட்டியைப் பயன்படுத்தவும்.", kn: "ಹೆಸರು ಅಥವಾ ಫೋನ್ ಸಂಖ್ಯೆಯ ಮೂಲಕ ಜನರನ್ನು ಹುಡುಕಲು ಮತ್ತು ಚಾಟ್ ಮಾಡಲು ಮೇಲಿನ ಹುಡುಕಾಟ ಪಟ್ಟಿಯನ್ನು ಬಳಸಿ.", mr: "नाव किंवा फोन नंबरद्वारे लोकांना शोधण्यासाठी आणि चॅटिंग सुरू करण्यासाठी वरील शोध बार वापरा.", bn: "নাম বা ফোন নম্বর দিয়ে লোকেদের খুঁজতে এবং চ্যাটিং শুরু করতে ওপরের সার্চ বারটি ব্যবহার করুন।", gu: "નામ અથવા ફોન નંબર દ્વારા લોકોને શોધવા અને ચેટિંગ શરૂ કરવા માટે ઉપરના સર્ચ બારનો ઉપયોગ કરો.", pa: "ਨਾਮ ਜਾਂ ਫੋਨ ਨੰਬਰ ਦੁਆਰਾ ਲੋਕਾਂ ਨੂੰ ਲੱਭਣ ਅਤੇ ਚੈਟਿੰਗ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਉਪਰੋਕਤ ਖੋਜ ਪੱਟੀ ਦੀ ਵਰਤੋਂ ਕਰੋ।"
  },
  "no messages yet": {
    en: "No messages yet", hi: "अभी तक कोई संदेश नहीं", te: "ఇంకా సందేశాలు లేవు", ta: "இதுவரை எந்த செய்தியும் இல்லை", kn: "ಇನ್ನೂ ಯಾವುದೇ ಸಂದೇಶಗಳಿಲ್ಲ", mr: "अद्याप कोणतेही संदेश नाहीत", bn: "এখনো কোনো বার্তা নেই", gu: "હજી કોઈ સંદેશા નથી", pa: "ਹਾਲੇ ਕੋਈ ਸੁਨੇਹਾ ਨਹੀਂ"
  },
  "no experts found.": {
    en: "No experts found.", hi: "कोई विशेषज्ञ नहीं मिला।", te: "నిపుణులు కనుగొనబడలేదు.", ta: "நிபுணர்கள் காணப்படவில்லை.", kn: "ಯಾವುದೇ ತಜ್ಞರು ಕಂಡುಬಂದಿಲ್ಲ.", mr: "कोणतेही तज्ज्ञ सापडले नाहीत.", bn: "কোনো বিশেষজ্ঞ পাওয়া যায়নি।", gu: "કોઈ નિષ્ણાતો મળ્યા નથી.", pa: "ਕੋਈ ਮਾਹਿਰ ਨਹੀਂ ਮਿਲਿਆ।"
  },
  "ask": {
    en: "Ask", hi: "पूछें", te: "అడగండి", ta: "கேள்", kn: "ಕೇಳಿ", mr: "विचारा", bn: "জিজ্ঞাসা করুন", gu: "પૂછો", pa: "ਪੁੱਛੋ"
  },
  "chat": {
    en: "Chat", hi: "चैट", te: "చాట్", ta: "அரட்டை", kn: "ಚಾಟ್", mr: "चॅट", bn: "চ্যাট", gu: "ચેટ", pa: "ਚੈਟ"
  },
  "loading groups...": {
    en: "Loading groups...", hi: "समूह लोड हो रहे हैं...", te: "సమూహాలు లోడ్ అవుతున్నాయి...", ta: "குழுக்களை ஏற்றுகிறது...", kn: "ಗುಂಪುಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...", mr: "गट लोड होत आहेत...", bn: "দলগুলো লোড হচ্ছে...", gu: "જૂથો લોડ કરી રહ્યું છે...", pa: "ਸਮੂਹ ਲੋਡ ਹੋ ਰਹੇ ਹਨ..."
  },
  "no groups available to join.": {
    en: "No groups available to join.", hi: "शामिल होने के लिए कोई समूह उपलब्ध नहीं है।", te: "చేరడానికి సమూహాలు అందుబాటులో లేవు.", ta: "சேர எந்த குழுக்களும் இல்லை.", kn: "ಸೇರಲು ಯಾವುದೇ ಗುಂಪುಗಳಿಲ್ಲ.", mr: "सामील होण्यासाठी कोणतेही गट उपलब्ध नाहीत.", bn: "যোগদানের জন্য কোনো দল উপলব্ধ নেই।", gu: "જોડાવા માટે કોઈ જૂથો ઉપલબ્ધ નથી.", pa: "ਸ਼ਾਮਲ ਹੋਣ ਲਈ ਕੋਈ ਸਮੂਹ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।"
  },
  "type a message...": {
    en: "Type a message...", hi: "एक संदेश टाइप करें...", te: "సందేశాన్ని టైప్ చేయండి...", ta: "ஒரு செய்தியை தட்டச்சு செய்யவும்...", kn: "ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...", mr: "संदेश टाइप करा...", bn: "একটি বার্তা টাইপ করুন...", gu: "સંદેશ ટાઇપ કરો...", pa: "ਇੱਕ ਸੁਨੇਹਾ ਟਾਈਪ ਕਰੋ..."
  },
  "select a chat to start messaging": {
    en: "Select a chat to start messaging", hi: "मैसेजिंग शुरू करने के लिए एक चैट चुनें", te: "సందేశం ప్రారంభించడానికి చాట్‌ని ఎంచుకోండి", ta: "செய்தியனுப்ப அரட்டையைத் தேர்ந்தெடுக்கவும்", kn: "ಸಂದೇಶ ಕಳುಹಿಸಲು ಚಾಟ್ ಆಯ್ಕೆಮಾಡಿ", mr: "मेसेजिंग सुरू करण्यासाठी चॅट निवडा", bn: "মেসেজিং শুরু করতে একটি চ্যাট নির্বাচন করুন", gu: "મેસેજિંગ શરૂ કરવા માટે ચેટ પસંદ કરો", pa: "ਮੈਸੇਜਿੰਗ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਇੱਕ ਚੈਟ ਚੁਣੋ"
  },
  // Precision Nutrition Page
  "plot-wise soil testing, crop absorption tracking, continuous fertilizer adjustments & ai advice": {
    en: "Plot-wise soil testing, crop absorption tracking, continuous fertilizer adjustments & AI advice", hi: "भूखंड-वार मिट्टी परीक्षण, फसल अवशोषण ट्रैकिंग, उर्वरक समायोजन और AI सलाह", te: "ప్లాట్ వారీగా మట్టి పరీక్ష, పంట శోషణ ట్రాకింగ్, నిరంతర ఎరువుల సర్దుబాటు & AI సలహా", ta: "நிலம் வாரியாக மண் பரிசோதனை, பயிர் உறிஞ்சுதல் கண்காணிப்பு, உர சரிசெய்தல் & AI ஆலோசனை", kn: "ಪ್ಲಾಟ್-ವಾರು ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ, ಬೆಳೆ ಹೀರಿಕೊಳ್ಳುವಿಕೆ ಟ್ರ್ಯಾಕಿಂಗ್, ರಸಗೊಬ್ಬರ ಹೊಂದಾಣಿಕೆ & AI ಸಲಹೆ", mr: "भूखंड-निहाय माती परीक्षण, पीक शोषण ट्रॅकिंग, खत समायोजन आणि AI सल्ला", bn: "প্লট-ভিত্তিক মাটি পরীক্ষা, ফসল শোষণ ট্র্যাকিং, সার সমন্বয় ও AI পরামর্শ", gu: "પ્લોટ-વાર માટી પરીક્ષણ, પાક શોષણ ટ્રેકિંગ, ખાતર ગોઠવણ & AI સલાહ", pa: "ਪਲਾਟ-ਵਾਰ ਮਿੱਟੀ ਪਰਖ, ਫਸਲ ਸੋਖਣ ਟ੍ਰੈਕਿੰਗ, ਖਾਦ ਸਮਾਯੋਜਨ ਅਤੇ AI ਸਲਾਹ"
  },
  "refresh plots": {
    en: "Refresh Plots", hi: "प्लॉट ताज़ा करें", te: "ప్లాట్‌లను రిఫ్రెష్ చేయండి", ta: "நிலங்களை புதுப்பிக்கவும்", kn: "ಪ್ಲಾಟ್‌ಗಳನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ", mr: "प्लॉट रिफ्रेश करा", bn: "প্লট রিফ্রেশ করুন", gu: "પ્લોટ રિફ્રેશ કરો", pa: "ਪਲਾਟ ਰਿਫ੍ਰੈਸ਼ ਕਰੋ"
  },
  "my plots": {
    en: "My Plots", hi: "मेरे प्लॉट", te: "నా ప్లాట్‌లు", ta: "எனது நிலங்கள்", kn: "ನನ್ನ ಪ್ಲಾಟ್‌ಗಳು", mr: "माझे प्लॉट", bn: "আমার প্লটসমূহ", gu: "મારા પ્લોટ", pa: "ਮੇਰੇ ਪਲਾਟ"
  },
  "nutrition manager": {
    en: "Nutrition Manager", hi: "पोषण प्रबंधक", te: "పోషణ మేనేజర్", ta: "ஊட்டச்சத்து மேலாளர்", kn: "ಪೋಷಕಾಂಶ ನಿರ್ವಾಹಕ", mr: "पोषण व्यवस्थापक", bn: "পুষ্টি ব্যবস্থাপক", gu: "પોષણ મેનેજર", pa: "ਪੋਸ਼ਣ ਮੈਨੇਜਰ"
  },
  "fertilizer impact": {
    en: "Fertilizer Impact", hi: "उर्वरक प्रभाव", te: "ఎరువుల ప్రభావం", ta: "உர தாக்கம்", kn: "ರಸಗೊಬ್ಬರ ಪ್ರಭಾವ", mr: "खत प्रभाव", bn: "সার প্রভাব", gu: "ખાતર અસર", pa: "ਖਾਦ ਪ੍ਰਭਾਵ"
  },
  "your land plots": {
    en: "Your Land Plots", hi: "आपके भूखंड", te: "మీ భూమి ప్లాట్‌లు", ta: "உங்கள் நிலங்கள்", kn: "ನಿಮ್ಮ ಭೂ ಪ್ಲಾಟ್‌ಗಳು", mr: "तुमचे भूखंड", bn: "আপনার জমি প্লট", gu: "તમારા જમીન પ્લોટ", pa: "ਤੁਹਾਡੇ ਜ਼ਮੀਨ ਪਲਾਟ"
  },
  "click any plot to open its nutrition manager and view instant ai advice": {
    en: "Click any plot to open its Nutrition Manager and view instant AI advice", hi: "किसी भी प्लॉट पर क्लिक करके पोषण प्रबंधक खोलें और AI सलाह देखें", te: "ఏదైనా ప్లాట్‌ను క్లిక్ చేసి దాని పోషణ మేనేజర్ తెరవండి మరియు తక్షణ AI సలహా చూడండి", ta: "எந்த நிலத்தையும் கிளிக் செய்து ஊட்டச்சத்து மேலாளரை திறந்து AI ஆலோசனை பார்க்கவும்", kn: "ಯಾವುದೇ ಪ್ಲಾಟ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಪೋಷಕಾಂಶ ನಿರ್ವಾಹಕವನ್ನು ತೆರೆಯಿರಿ ಮತ್ತು AI ಸಲಹೆ ವೀಕ್ಷಿಸಿ", mr: "कोणत्याही प्लॉटवर क्लिक करून पोषण व्यवस्थापक उघडा आणि AI सल्ला पहा", bn: "যেকোনো প্লটে ক্লিক করে পুষ্টি ব্যবস্থাপক খুলুন এবং AI পরামর্শ দেখুন", gu: "કોઈ પણ પ્લોટ પર ક્લિક કરીને પોષણ મેનેજર ખોલો અને AI સલાહ જુઓ", pa: "ਕਿਸੇ ਵੀ ਪਲਾਟ 'ਤੇ ਕਲਿੱਕ ਕਰੋ ਅਤੇ ਪੋਸ਼ਣ ਮੈਨੇਜਰ ਖੋਲ੍ਹੋ ਅਤੇ AI ਸਲਾਹ ਦੇਖੋ"
  },
  "manage plot": {
    en: "Manage Plot", hi: "प्लॉट प्रबंधित करें", te: "ప్లాట్ నిర్వహించండి", ta: "நிலத்தை நிர்வகிக்கவும்", kn: "ಪ್ಲಾಟ್ ನಿರ್ವಹಿಸಿ", mr: "प्लॉट व्यवस्थापित करा", bn: "প্লট পরিচালনা করুন", gu: "પ્લોટ સંચાલિત કરો", pa: "ਪਲਾਟ ਪ੍ਰਬੰਧਿਤ ਕਰੋ"
  },
  "selected": {
    en: "Selected", hi: "चयनित", te: "ఎంపిక చేయబడింది", ta: "தேர்ந்தெடுக்கப்பட்டது", kn: "ಆಯ್ಕೆಯಾಗಿದೆ", mr: "निवडले", bn: "নির্বাচিত", gu: "પસંદ કરેલ", pa: "ਚੁਣਿਆ ਗਿਆ"
  },
  "soil test registered": {
    en: "Soil test registered", hi: "मिट्टी परीक्षण पंजीकृत", te: "మట్టి పరీక్ష నమోదైంది", ta: "மண் பரிசோதனை பதிவு செய்யப்பட்டது", kn: "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ನೋಂದಾಯಿಸಲಾಗಿದೆ", mr: "माती परीक्षण नोंदणीकृत", bn: "মাটি পরীক্ষা নিবন্ধিত", gu: "માટી પરીક્ષણ નોંધાયેલ", pa: "ਮਿੱਟੀ ਪਰਖ ਰਜਿਸਟਰਡ"
  },
  "no soil test yet": {
    en: "No soil test yet", hi: "अभी तक मिट्टी परीक्षण नहीं हुआ", te: "ఇంకా మట్టి పరీక్ష జరగలేదు", ta: "இன்னும் மண் பரிசோதனை இல்லை", kn: "ಇನ್ನೂ ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಆಗಿಲ್ಲ", mr: "अजून माती परीक्षण झालेले नाही", bn: "এখনো মাটি পরীক্ষা হয়নি", gu: "હજી માટી પરીક્ષણ થયું નથી", pa: "ਅਜੇ ਮਿੱਟੀ ਪਰਖ ਨਹੀਂ ਹੋਈ"
  },
  "no crop linked": {
    en: "No crop linked", hi: "कोई फसल जुड़ी नहीं", te: "పంట అనుసంధానం కాలేదు", ta: "பயிர் இணைக்கப்படவில்லை", kn: "ಯಾವುದೇ ಬೆಳೆ ಲಿಂಕ್ ಆಗಿಲ್ಲ", mr: "कोणतेही पीक जोडलेले नाही", bn: "কোনো ফসল সংযুক্ত নেই", gu: "કોઈ પાક જોડાયેલ નથી", pa: "ਕੋਈ ਫਸਲ ਜੁੜੀ ਨਹੀਂ"
  },
  "nitrogen": {
    en: "Nitrogen", hi: "नाइट्रोजन", te: "నత్రజని", ta: "நைட்ரஜன்", kn: "ಸಾರಜನಕ", mr: "नत्रवायू", bn: "নাইট্রোজেন", gu: "નાઇટ્રોજન", pa: "ਨਾਈਟ੍ਰੋਜਨ"
  },
  "phosphorus": {
    en: "Phosphorus", hi: "फॉस्फोरस", te: "భాస్వరం", ta: "பாஸ்பரஸ்", kn: "ರಂಜಕ", mr: "स्फुरद", bn: "ফসফরাস", gu: "ફોસ્ફરસ", pa: "ਫਾਸਫੋਰਸ"
  },
  "potassium": {
    en: "Potassium", hi: "पोटैशियम", te: "పొటాషియం", ta: "பொட்டாசியம்", kn: "ಪೊಟ್ಯಾಸಿಯಂ", mr: "पोटॅशियम", bn: "পটাসিয়াম", gu: "પોટેશિયમ", pa: "ਪੋਟਾਸ਼ੀਅਮ"
  },
  "tap to view ai nutrition advice": {
    en: "Tap to view AI nutrition advice", hi: "AI पोषण सलाह देखने के लिए टैप करें", te: "AI పోషణ సలహా చూడటానికి ట్యాప్ చేయండి", ta: "AI ஊட்டச்சத்து ஆலோசனை பார்க்க தட்டவும்", kn: "AI ಪೋಷಕಾಂಶ ಸಲಹೆ ನೋಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ", mr: "AI पोषण सल्ला पाहण्यासाठी टॅप करा", bn: "AI পুষ্টি পরামর্শ দেখতে ট্যাপ করুন", gu: "AI પોષણ સલાહ જોવા ટેપ કરો", pa: "AI ਪੋਸ਼ਣ ਸਲਾਹ ਦੇਖਣ ਲਈ ਟੈਪ ਕਰੋ"
  },
  "tap to add soil test data": {
    en: "Tap to add soil test data", hi: "मिट्टी परीक्षण डेटा जोड़ने के लिए टैप करें", te: "మట్టి పరీక్ష డేటా జోడించడానికి ట్యాప్ చేయండి", ta: "மண் பரிசோதனை தரவை சேர்க்க தட்டவும்", kn: "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಡೇಟಾ ಸೇರಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ", mr: "माती परीक्षण डेटा जोडण्यासाठी टॅप करा", bn: "মাটি পরীক্ষা ডেটা যোগ করতে ট্যাপ করুন", gu: "માટી પરીક્ષણ ડેટા ઉમેરવા ટેપ કરો", pa: "ਮਿੱਟੀ ਪਰਖ ਡੇਟਾ ਜੋੜਨ ਲਈ ਟੈਪ ਕਰੋ"
  },
  "manage": {
    en: "Manage", hi: "प्रबंधित करें", te: "నిర్వహించండి", ta: "நிர்வகி", kn: "ನಿರ್ವಹಿಸಿ", mr: "व्यवस्थापित करा", bn: "পরিচালনা করুন", gu: "સંચાલિત કરો", pa: "ਪ੍ਰਬੰਧਿਤ ਕਰੋ"
  }
};

// ── Helper: Deep key access with alias resolution ───────────────────────────

function getNestedValue(obj: any, keyPath: string): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const keys = keyPath.split(".");
  let current = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[key];
  }
  return typeof current === "string" ? current : undefined;
}

function resolveKey(obj: any, keyPath: string): string | undefined {
  if (!obj) return undefined;
  // 1. Direct path lookup
  let val = getNestedValue(obj, keyPath);
  if (val) return val;

  // 2. Alias: community.* <-> communityHub.*
  if (keyPath.startsWith("community.")) {
    val = getNestedValue(obj, keyPath.replace("community.", "communityHub."));
    if (val) return val;
  } else if (keyPath.startsWith("communityHub.")) {
    val = getNestedValue(obj, keyPath.replace("communityHub.", "community."));
    if (val) return val;
  }

  // 3. Alias: weather telemetry
  if (keyPath.startsWith("weatherTelemetry.")) {
    val = getNestedValue(obj, keyPath.replace("weatherTelemetry.", "weather."));
    if (val) return val;
  }

  return undefined;
}

export function getCommonTranslation(keyOrText: string, fallback?: string, locale: SupportedLocale = "en"): string | undefined {
  if (locale === "en") return undefined;

  const lookupKey = (fallback || keyOrText).toLowerCase().trim();
  const directMatch = COMMON_TRANSLATIONS[lookupKey];
  if (directMatch && directMatch[locale]) {
    return directMatch[locale];
  }

  const keyWithoutPrefix = keyOrText.includes(".") ? keyOrText.split(".").pop()?.toLowerCase().trim() : undefined;
  if (keyWithoutPrefix && COMMON_TRANSLATIONS[keyWithoutPrefix] && COMMON_TRANSLATIONS[keyWithoutPrefix][locale]) {
    return COMMON_TRANSLATIONS[keyWithoutPrefix][locale];
  }

  return undefined;
}

// ── Context ──────────────────────────────────────────────────────────────────

interface LanguageContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, fallback?: string) => string;
  languages: LanguageInfo[];
  currentLanguage: LanguageInfo;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
  languages: LANGUAGES,
  currentLanguage: LANGUAGES[0],
});

// ── Provider ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "agri_language";

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>("en");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved locale from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
    if (saved && LOCALE_MAP[saved]) {
      setLocaleState(saved);
    }
    setIsHydrated(true);
  }, []);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    if (LOCALE_MAP[newLocale]) {
      setLocaleState(newLocale);
      localStorage.setItem(STORAGE_KEY, newLocale);
      // Update the html lang attribute
      document.documentElement.lang = newLocale;
    }
  }, []);

  // Translation function: looks up key in current locale, falls back to English
  const t = useCallback(
    (key: string, fallback?: string): string => {
      if (locale === "en") {
        const enVal = resolveKey(en, key);
        return enVal || fallback || key;
      }

      // 1. Try current locale dictionary
      const localDict = LOCALE_MAP[locale];
      const translated = resolveKey(localDict, key);
      if (translated) return translated;

      // 2. Check built-in common agricultural terms
      const common = getCommonTranslation(key, fallback, locale);
      if (common) return common;

      // 3. Fall back to English dictionary
      const enTranslated = resolveKey(en, key);
      if (enTranslated) return enTranslated;

      // 4. Fall back to the provided fallback or the key itself
      return fallback || key;
    },
    [locale]
  );

  const currentLanguage = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  const contextValue = {
    locale: isHydrated ? locale : "en",
    setLocale,
    t: isHydrated ? t : (key: string, fallback?: string) => resolveKey(en, key) || fallback || key,
    languages: LANGUAGES,
    currentLanguage: isHydrated ? currentLanguage : LANGUAGES[0],
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useLanguage = () => useContext(LanguageContext);

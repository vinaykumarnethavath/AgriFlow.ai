"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Key,
  ExternalLink,
  Copy,
  Check,
  Search,
  ShieldCheck,
  Mail,
  CloudSun,
  Bot,
  Newspaper,
  MapPin,
  CreditCard,
  Youtube,
  Cpu,
  Lock,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Terminal,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ApiKeyItem {
  id: string;
  name: string;
  category: "email" | "ai" | "data" | "payments" | "security";
  purpose: string;
  envVar: string;
  freeTier: string;
  officialUrl: string;
  directUrl: string;
  icon: any;
  badge: "Recommended" | "Required" | "Optional";
  steps: string[];
  envSnippet: string;
  importantTip?: string;
}

const API_KEYS_DATA: ApiKeyItem[] = [
  {
    id: "brevo",
    name: "Brevo (formerly Sendinblue)",
    category: "email",
    purpose: "Email OTP verification (Works reliably on Railway, Render, Fly.io via Port 443)",
    envVar: "BREVO_API_KEY, BREVO_SENDER_EMAIL",
    freeTier: "300 free emails / day (no credit card required)",
    officialUrl: "https://www.brevo.com/",
    directUrl: "https://app.brevo.com/settings/keys/api",
    icon: Mail,
    badge: "Recommended",
    steps: [
      "Navigate to https://www.brevo.com/ and click 'Sign up free'.",
      "Sign in with Google or enter your email and password.",
      "Check your inbox to confirm your email address.",
      "Complete the basic profile details (Enter 'AgriFlow' as business name).",
      "Click your Account Name in the top right corner and select 'SMTP & API'.",
      "Under the 'API Keys' tab, click 'Generate a new API key'.",
      "Name the key (e.g., 'agriflow-otp') and click 'Generate'. Copy the key starting with 'xkeysib-...'.",
      "Go to 'Senders & IP' on the left menu -> Click 'Add a sender' -> Enter your Gmail address.",
      "Open your Gmail inbox, click the verification link from Brevo to activate your sender address.",
      "Add BREVO_API_KEY and BREVO_SENDER_EMAIL to your backend/.env and cloud variables.",
    ],
    envSnippet: `BREVO_API_KEY=xkeysib-your_brevo_api_key_here\nBREVO_SENDER_EMAIL=your-verified-email@gmail.com`,
    importantTip:
      "Unlike direct SMTP (port 465), Brevo sends emails through HTTPS (port 443) which cloud platforms like Railway never block.",
  },
  {
    id: "gmail-smtp",
    name: "Gmail SMTP (App Password)",
    category: "email",
    purpose: "Direct Gmail SMTP delivery (Ideal for local development)",
    envVar: "SMTP_USER, SMTP_PASSWORD, SMTP_HOST, SMTP_PORT",
    freeTier: "Free with any standard Google account",
    officialUrl: "https://myaccount.google.com/security",
    directUrl: "https://myaccount.google.com/apppasswords",
    icon: Mail,
    badge: "Optional",
    steps: [
      "Open Google Account Security at https://myaccount.google.com/security.",
      "Under 'How you sign in to Google', ensure '2-Step Verification' is turned ON.",
      "In the top search bar, type 'App passwords' or visit https://myaccount.google.com/apppasswords.",
      "Under 'App name', type 'AgriFlow' and click 'Create'.",
      "A pop-up modal will display a 16-character code (e.g., uzcg mgnx onrh fhgp).",
      "Copy the 16 characters without spaces.",
      "Paste the credentials into backend/.env under SMTP_USER and SMTP_PASSWORD.",
    ],
    envSnippet: `SMTP_HOST=smtp.gmail.com\nSMTP_PORT=465\nSMTP_USER=your-email@gmail.com\nSMTP_PASSWORD=your16charapppass`,
    importantTip:
      "Never use your main Google account password. Google requires a 16-character App Password.",
  },
  {
    id: "resend",
    name: "Resend",
    category: "email",
    purpose: "Modern Email API alternative over HTTPS",
    envVar: "RESEND_API_KEY, RESEND_FROM",
    freeTier: "3,000 emails / month free",
    officialUrl: "https://resend.com/",
    directUrl: "https://resend.com/api-keys",
    icon: Mail,
    badge: "Optional",
    steps: [
      "Go to https://resend.com/ and sign in with GitHub or your email.",
      "On the left sidebar, click 'API Keys'.",
      "Click 'Create API Key'.",
      "Give it a name ('AgriFlow'), choose 'Full Access', and click 'Add'.",
      "Copy the generated token starting with 're_...'.",
      "Add to your .env file as RESEND_API_KEY.",
    ],
    envSnippet: `RESEND_API_KEY=re_your_api_key_here\nRESEND_FROM=AgriFlow <onboarding@resend.dev>`,
    importantTip:
      "The default 'onboarding@resend.dev' can only deliver to the email registered on your Resend account. For all emails, verify a custom domain under 'Domains'.",
  },
  {
    id: "fast2sms",
    name: "Fast2SMS",
    category: "data",
    purpose: "SMS OTP delivery to Indian mobile numbers (+91)",
    envVar: "FAST2SMS_API_KEY",
    freeTier: "₹50 free testing balance upon sign up",
    officialUrl: "https://www.fast2sms.com/",
    directUrl: "https://www.fast2sms.com/dashboard/dev-api",
    icon: ShieldCheck,
    badge: "Optional",
    steps: [
      "Open https://www.fast2sms.com/ and click 'Register'.",
      "Sign up with your Indian mobile number, name, and email.",
      "Verify with the SMS code sent to your phone.",
      "In the dashboard, click 'Dev API' in the left menu (https://www.fast2sms.com/dashboard/dev-api).",
      "Under 'Authorization', click the copy button to copy your API key.",
      "Save in backend/.env as FAST2SMS_API_KEY.",
    ],
    envSnippet: `FAST2SMS_API_KEY=your_fast2sms_authorization_key`,
  },
  {
    id: "groq",
    name: "Groq Cloud (AI Chatbot & LLM)",
    category: "ai",
    purpose: "Powers the AgriFlow conversational assistant, voice advice, and agricultural knowledge base",
    envVar: "GROQ_API_KEY",
    freeTier: "Free high-speed inference tier (Llama 3.3 70B & 8B)",
    officialUrl: "https://console.groq.com/",
    directUrl: "https://console.groq.com/keys",
    icon: Bot,
    badge: "Required",
    steps: [
      "Visit https://console.groq.com/ and sign in with GitHub or Google.",
      "On the left sidebar, click 'API Keys'.",
      "Click the 'Create API Key' button.",
      "Enter a key description (e.g. 'AgriFlow-Assistant').",
      "Click 'Submit' and immediately copy the key starting with 'gsk_...'.",
      "Paste into backend/.env as GROQ_API_KEY.",
    ],
    envSnippet: `GROQ_API_KEY=gsk_your_groq_api_key_here`,
    importantTip: "Groq only displays the API key once upon generation. Copy it immediately.",
  },
  {
    id: "openweather",
    name: "OpenWeatherMap",
    category: "data",
    purpose: "Real-time weather conditions, rainfall, temperature, and farming advisory",
    envVar: "OPENWEATHER_API_KEY",
    freeTier: "1,000 API calls / day free",
    officialUrl: "https://openweathermap.org/api",
    directUrl: "https://home.openweathermap.org/api_keys",
    icon: CloudSun,
    badge: "Required",
    steps: [
      "Go to https://home.openweathermap.org/users/sign_up.",
      "Create an account with username, email, and password.",
      "Verify your email by clicking the link in the confirmation email.",
      "Click your username at top right -> select 'My API Keys'.",
      "Enter a key name ('agriflow-weather') and click 'Generate'.",
      "Copy the 32-character hexadecimal key.",
      "Paste into backend/.env as OPENWEATHER_API_KEY.",
    ],
    envSnippet: `OPENWEATHER_API_KEY=your_32_character_openweathermap_key`,
    importantTip: "Newly generated OpenWeatherMap keys take 10 to 30 minutes to activate globally.",
  },
  {
    id: "newsapi",
    name: "NewsAPI",
    category: "data",
    purpose: "Live agricultural news, commodity prices, and market trends feed",
    envVar: "NEWS_API_KEY",
    freeTier: "100 requests / day free for developers",
    officialUrl: "https://newsapi.org/",
    directUrl: "https://newsapi.org/account",
    icon: Newspaper,
    badge: "Required",
    steps: [
      "Go to https://newsapi.org/register.",
      "Enter your Name, Email, and Password.",
      "Select 'I am an individual' and accept terms.",
      "Click 'Submit'.",
      "Your API key will be shown immediately on screen. Copy the 32-character key.",
      "Paste into backend/.env as NEWS_API_KEY.",
    ],
    envSnippet: `NEWS_API_KEY=your_32_character_newsapi_key`,
  },
  {
    id: "opencage",
    name: "OpenCage Geocoder",
    category: "data",
    purpose: "Converts GPS coordinates into district/city names for weather and delivery addresses",
    envVar: "OPENCAGE_API_KEY",
    freeTier: "2,500 requests / day free",
    officialUrl: "https://opencagedata.com/",
    directUrl: "https://opencagedata.com/dashboard#api-keys",
    icon: MapPin,
    badge: "Required",
    steps: [
      "Visit https://opencagedata.com/users/sign_up and register with your email.",
      "Click the email verification link sent to your inbox to activate.",
      "Once in your dashboard, click 'Geosearch / API Keys'.",
      "Locate your default 32-character API key and click 'Copy'.",
      "Paste into backend/.env as OPENCAGE_API_KEY.",
    ],
    envSnippet: `OPENCAGE_API_KEY=your_32_character_opencage_key`,
  },
  {
    id: "razorpay",
    name: "Razorpay (Test Mode)",
    category: "payments",
    purpose: "Handles order payments and mock checkout transactions",
    envVar: "RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET",
    freeTier: "Free test sandbox (no business documents or bank required)",
    officialUrl: "https://dashboard.razorpay.com/",
    directUrl: "https://dashboard.razorpay.com/app/keys",
    icon: CreditCard,
    badge: "Optional",
    steps: [
      "Go to https://dashboard.razorpay.com/signup and sign up.",
      "In the top header, switch the toggle from 'Live Mode' to 'Test Mode'.",
      "On the left sidebar, navigate to 'Account & Settings'.",
      "Under 'Website and app settings', click 'API Keys'.",
      "Click 'Generate Test Key'.",
      "Copy both 'Key Id' (starts with 'rzp_test_...') and 'Key Secret'.",
      "Paste into backend/.env.",
    ],
    envSnippet: `RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx\nRAZORPAY_KEY_SECRET=your_razorpay_secret`,
  },
  {
    id: "youtube",
    name: "YouTube Data API v3",
    category: "data",
    purpose: "Fetches educational farming videos, crop tutorials, and techniques in Learning Hub",
    envVar: "YOUTUBE_API_KEY",
    freeTier: "10,000 units / day free quota",
    officialUrl: "https://console.cloud.google.com/",
    directUrl: "https://console.cloud.google.com/apis/library/youtube.googleapis.com",
    icon: Youtube,
    badge: "Optional",
    steps: [
      "Open Google Cloud Console: https://console.cloud.google.com/.",
      "Create a new project named 'AgriFlow' (or select an existing one).",
      "In the left menu, select 'APIs & Services' -> 'Library'.",
      "Search for 'YouTube Data API v3' and click on it.",
      "Click the blue 'Enable' button.",
      "Go to 'APIs & Services' -> 'Credentials'.",
      "Click '+ CREATE CREDENTIALS' at top -> select 'API key'.",
      "Copy the key starting with 'AIzaSy...' and paste into backend/.env as YOUTUBE_API_KEY.",
    ],
    envSnippet: `YOUTUBE_API_KEY=AIzaSy_your_youtube_api_key_here`,
  },
  {
    id: "huggingface",
    name: "Hugging Face Access Token",
    category: "ai",
    purpose: "Runs AI crop disease diagnosis and vision classification models",
    envVar: "HUGGINGFACE_API_KEY",
    freeTier: "Free community inference API",
    officialUrl: "https://huggingface.co/",
    directUrl: "https://huggingface.co/settings/tokens",
    icon: Cpu,
    badge: "Optional",
    steps: [
      "Navigate to https://huggingface.co/join and create an account.",
      "Click your avatar in the top right -> select 'Settings'.",
      "In the left sidebar, click 'Access Tokens'.",
      "Click '+ Create new token'.",
      "Name it 'agriflow-crop-disease', select Type 'Read', and click 'Create token'.",
      "Copy the token starting with 'hf_...'.",
      "Paste into backend/.env as HUGGINGFACE_API_KEY.",
    ],
    envSnippet: `HUGGINGFACE_API_KEY=hf_your_huggingface_token_here`,
  },
  {
    id: "jwt",
    name: "JWT Secret Key",
    category: "security",
    purpose: "Cryptographic signature for securing user sessions, logins, and access tokens",
    envVar: "JWT_SECRET",
    freeTier: "Free (generated locally on your computer)",
    officialUrl: "",
    directUrl: "",
    icon: Lock,
    badge: "Required",
    steps: [
      "No external website is needed.",
      "Open any terminal (PowerShell, Command Prompt, or Linux bash).",
      "Run the command: python -c \"import secrets; print(secrets.token_urlsafe(64))\"",
      "Copy the generated 86-character string.",
      "Paste into backend/.env as JWT_SECRET.",
    ],
    envSnippet: `JWT_SECRET=your_generated_cryptographic_secret_here`,
    importantTip: "Generate a unique JWT_SECRET for production. Never share it publicly.",
  },
];

export default function ApiKeysGuidePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "All Keys", count: API_KEYS_DATA.length },
    { id: "email", label: "Email & OTP", count: API_KEYS_DATA.filter((k) => k.category === "email").length },
    { id: "ai", label: "AI & ML", count: API_KEYS_DATA.filter((k) => k.category === "ai").length },
    { id: "data", label: "Weather, News & Maps", count: API_KEYS_DATA.filter((k) => k.category === "data").length },
    { id: "payments", label: "Payments", count: API_KEYS_DATA.filter((k) => k.category === "payments").length },
    { id: "security", label: "Security", count: API_KEYS_DATA.filter((k) => k.category === "security").length },
  ];

  const filteredKeys = API_KEYS_DATA.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.envVar.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to App
            </Link>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-600">
                <Key className="h-4 w-4" />
              </div>
              <h1 className="text-base sm:text-lg font-bold">API Keys Setup Directory</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-border bg-muted/20 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
            <Sparkles className="h-3.5 w-3.5" /> Complete Step-by-Step Instructions
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            How to Get Every API Key for AgriFlow
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Click-by-click links, direct dashboard destinations, free tier limits, and copy-ready environment variable snippets.
          </p>

          {/* Search bar */}
          <div className="pt-2 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by API name, variable (e.g. BREVO, WEATHER, GROQ)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat.label}
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Quick Demo Mode Notice */}
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <Terminal className="h-4 w-4" /> Want to Test Instantly Without Real Emails?
            </div>
            <p className="text-xs text-muted-foreground">
              Add <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-foreground font-semibold">DISABLE_OTP_VERIFICATION=true</code> to your Railway / .env to bypass email/SMS verification immediately.
            </p>
          </div>
          <button
            onClick={() => handleCopy("bypass", "DISABLE_OTP_VERIFICATION=true")}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground flex items-center gap-1.5 shrink-0 transition-colors"
          >
            {copiedId === "bypass" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedId === "bypass" ? "Copied" : "Copy Flag"}
          </button>
        </div>

        {/* API Cards */}
        <div className="space-y-6">
          {filteredKeys.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                id={item.id}
                className="rounded-2xl border border-border bg-card shadow-sm hover:border-green-500/30 transition-all overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-border bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-600 shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground font-bold">#{idx + 1}</span>
                        <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                        <span
                          className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${
                            item.badge === "Recommended"
                              ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 border border-green-500/30"
                              : item.badge === "Required"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-500/30"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.purpose}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    {item.directUrl && (
                      <a
                        href={item.directUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow-sm transition-all"
                      >
                        Get Key Here <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Free tier metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/20 border border-border text-xs">
                    <div>
                      <span className="text-muted-foreground block font-medium">Environment Variables:</span>
                      <span className="font-mono font-bold text-foreground">{item.envVar}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-medium">Free Tier / Quota:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{item.freeTier}</span>
                    </div>
                  </div>

                  {/* Step-by-step checklist */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Step-by-Step Instructions
                    </h4>
                    <ol className="space-y-2 text-xs sm:text-sm pl-1">
                      {item.steps.map((step, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2.5 text-foreground leading-relaxed">
                          <span className="h-5 w-5 rounded-full bg-muted border border-border flex items-center justify-center font-mono text-[11px] font-bold shrink-0 text-muted-foreground mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Pro-tip */}
                  {item.importantTip && (
                    <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20 text-xs text-muted-foreground">
                      <span className="font-bold text-green-700 dark:text-green-400">Pro Tip: </span>
                      {item.importantTip}
                    </div>
                  )}

                  {/* Code snippet */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-semibold">Copy snippet for .env:</span>
                      <button
                        onClick={() => handleCopy(item.id, item.envSnippet)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-green-600 dark:text-green-400 hover:underline"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="h-3 w-3" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-muted/60 border border-border font-mono text-xs overflow-x-auto text-foreground">
                      {item.envSnippet}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

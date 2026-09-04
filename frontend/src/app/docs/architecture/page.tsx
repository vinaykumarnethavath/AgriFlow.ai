"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  ArrowRight,
  Database,
  Server,
  Monitor,
  Cloud,
  Cpu,
  ShieldCheck,
  Search,
  ArrowLeft,
  Bot,
  QrCode,
  Sprout,
  Store,
  Factory,
  ShoppingCart,
  CloudSun,
  Globe,
  Lock,
  ChevronRight,
  ExternalLink,
  GitFork,
  Code2,
  Boxes,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ArchitectureNode {
  title: string;
  type: "ui" | "api" | "logic" | "db" | "external";
  desc: string;
}

interface FeatureArch {
  id: string;
  category: "auth" | "blockchain" | "ai" | "farmer" | "shop_mill" | "commerce";
  name: string;
  moduleScope: string;
  description: string;
  icon: any;
  flow: ArchitectureNode[];
  backendRoutes: string[];
  dbTables: string[];
  externalServices: string[];
  interlinks: string[];
}

const ARCHITECTURE_DATA: FeatureArch[] = [
  {
    id: "auth",
    category: "auth",
    name: "Authentication & Multi-Role Identity",
    moduleScope: "Multi-Role User Authentication & Session Security",
    description: "Dual authentication (Email OTP & Phone SMS OTP) with multi-role access control for Farmers, Shops, Mills, and Consumers.",
    icon: Lock,
    flow: [
      { title: "Frontend Form", type: "ui", desc: "User inputs credentials + Role (Farmer/Shop/Mill/Customer)" },
      { title: "FastAPI Auth Router", type: "api", desc: "POST /auth/send-registration-otp & /auth/register" },
      { title: "Dispatch Engine", type: "logic", desc: "Generates 6-digit cryptographic OTP, checks expiry" },
      { title: "Brevo / Fast2SMS", type: "external", desc: "Delivers email OTP (Port 443 HTTPS) or SMS OTP" },
      { title: "PostgreSQL DB", type: "db", desc: "Stores User, EmailVerificationOTP, and PhoneOTP records" },
      { title: "JWT Token Issuer", type: "logic", desc: "Signs HS256 JWT access token with role claims" },
    ],
    backendRoutes: [
      "POST /auth/send-registration-otp",
      "POST /auth/verify-registration-otp",
      "POST /auth/register",
      "POST /auth/login",
      "POST /auth/forgot-password",
      "POST /auth/reset-password",
    ],
    dbTables: ["User", "EmailVerificationOTP", "PhoneOTP", "UserOTP"],
    externalServices: ["Brevo HTTP API", "Fast2SMS Dev API", "Gmail SMTP (Fallback)"],
    interlinks: [
      "Role-based Dashboard routing",
      "AuthContext state provider in frontend",
      "Protected API bearer token dependency (get_current_user)",
    ],
  },
  {
    id: "blockchain",
    category: "blockchain",
    name: "Blockchain Provenance & Immutable Ledger",
    moduleScope: "Cryptographic Ledger & Supply Chain Verification",
    description: "Cryptographic SHA-256 block mining for crops, organic certifications, and public QR code consumer verification.",
    icon: QrCode,
    flow: [
      { title: "Farmer / Mill Action", type: "ui", desc: "Logs crop harvest batch, processing details, or certification" },
      { title: "Blockchain Router", type: "api", desc: "POST /api/blockchain/mine-block" },
      { title: "Proof Engine", type: "logic", desc: "Calculates SHA-256 hash using previous block hash, Merkle root & timestamp" },
      { title: "Ledger Persistence", type: "db", desc: "Appends validated block to blockchain_blocks table" },
      { title: "QR Code Generator", type: "logic", desc: "Creates unique scannable URL pointing to verified block" },
      { title: "Consumer Public Trace", type: "ui", desc: "Displays immutable seed-to-shelf journey timeline" },
    ],
    backendRoutes: [
      "GET /api/blockchain/chain",
      "POST /api/blockchain/mine-block",
      "GET /api/blockchain/verify-integrity",
      "GET /api/traceability/crop/{id}",
    ],
    dbTables: ["blockchain_blocks", "crops", "manufacturer_batches"],
    externalServices: ["Cryptographic HashLib (SHA-256)"],
    interlinks: [
      "Farmer harvest logging and organic certificates",
      "Mill batch transformation and packing",
      "Public QR scan provenance view",
    ],
  },
  {
    id: "crop_health",
    category: "ai",
    name: "AI Crop Disease Diagnosis",
    moduleScope: "Computer Vision Pathology & Crop Treatment",
    description: "Computer vision image classification on uploaded leaf photos to identify plant pathologies and prescribe remedies.",
    icon: Sprout,
    flow: [
      { title: "Camera / Leaf Upload", type: "ui", desc: "Farmer takes photo of diseased leaf & drags into diagnosis tool" },
      { title: "Upload Endpoint", type: "api", desc: "POST /api/upload/image saves file to persistent /uploads" },
      { title: "Preprocessing Tensor", type: "logic", desc: "Resizes & normalizes image matrix to 224x224" },
      { title: "Hugging Face Model", type: "external", desc: "Runs computer vision model inference (ResNet / Vision Transformer)" },
      { title: "Remedy Knowledge DB", type: "logic", desc: "Matches disease with biological, chemical & organic remedies" },
      { title: "Interactive Diagnosis", type: "ui", desc: "Renders confidence %, symptoms, preventative measures" },
    ],
    backendRoutes: [
      "POST /api/upload/image",
      "POST /api/crop-health/diagnose",
      "GET /api/crop-health/history",
    ],
    dbTables: ["crop_disease_logs", "crops"],
    externalServices: ["Hugging Face Inference API", "Local File Storage (/uploads)"],
    interlinks: [
      "Farmer diagnostic dashboard tab",
      "Learning hub links for disease prevention videos",
      "Input shop product recommendations for fungicides",
    ],
  },
  {
    id: "rag_ai",
    category: "ai",
    name: "Conversational RAG AI Assistant & Voice",
    moduleScope: "Agricultural RAG Intelligence & Speech Processing",
    description: "Multilingual AI chatbot and speech assistant grounded in real-time localized weather, soil conditions, and crop data.",
    icon: Bot,
    flow: [
      { title: "Text or Voice Input", type: "ui", desc: "Farmer asks question in English, Hindi, or Telugu via ChatBot or Mic" },
      { title: "Chat / Voice Router", type: "api", desc: "POST /api/chat/message or POST /api/voice/process-audio" },
      { title: "RAG Context Builder", type: "logic", desc: "Injects user's active crops, local weather, and soil test results into prompt" },
      { title: "Groq Cloud LLM", type: "external", desc: "Llama 3.3 70B generates expert agricultural advice in < 200ms" },
      { title: "Persistence Engine", type: "db", desc: "Saves conversation threads to chat_messages table" },
      { title: "Speech Synthesis", type: "ui", desc: "Plays audio response and updates chat transcript" },
    ],
    backendRoutes: [
      "POST /api/chat/message",
      "GET /api/chat/history",
      "POST /api/voice/process-audio",
      "POST /api/voice/resolve-crop",
    ],
    dbTables: ["chat_messages", "crops", "plot_nutrition"],
    externalServices: ["Groq Cloud API (Llama 3.3)", "Web Speech API (Browser STT/TTS)"],
    interlinks: [
      "Real-time Weather API context",
      "Farmer crops and soil data context",
      "Floating ChatBot widget across all dashboards",
    ],
  },
  {
    id: "weather",
    category: "farmer",
    name: "Weather Forecast & Micro-Climate Advisory",
    moduleScope: "Micro-Climate Forecasting & Spray Window Advisory",
    description: "Real-time temperature, rain probability, wind speed, and dynamic farming spray window recommendations.",
    icon: CloudSun,
    flow: [
      { title: "Weather Dashboard", type: "ui", desc: "Farmer views 5-day hourly rainfall & weather charts" },
      { title: "Weather Router", type: "api", desc: "GET /api/weather/forecast?lat=...&lon=..." },
      { title: "Reverse Geocoder", type: "external", desc: "OpenCage API resolves GPS coordinates to district name" },
      { title: "OpenWeather API", type: "external", desc: "Fetches live weather & 5-day 3-hour precipitation data" },
      { title: "TTL Memory Cache", type: "logic", desc: "Caches response for 30 minutes to conserve API quota" },
      { title: "Agri Advisory Engine", type: "logic", desc: "Calculates safe pesticide spraying hours & frost alerts" },
    ],
    backendRoutes: [
      "GET /api/weather/forecast",
      "GET /api/weather/current",
      "GET /api/location/reverse-geocode",
    ],
    dbTables: ["User (Saved location coordinates)"],
    externalServices: ["OpenWeatherMap API", "OpenCage Geocoding API"],
    interlinks: [
      "Farmer dashboard home summary card",
      "Irrigation scheduling in Soil Nutrition page",
      "RAG chatbot prompt context injection",
    ],
  },
  {
    id: "nutrition",
    category: "farmer",
    name: "Soil Health, N-P-K & Fertilizer Planning",
    moduleScope: "Soil N-P-K Profiling & Fertilizer Calculation",
    description: "Radar chart soil profiling, nutrient deficit calculations, and customized Urea/DAP/MOP application schedules.",
    icon: Sprout,
    flow: [
      { title: "Plot Soil Input", type: "ui", desc: "Farmer logs soil test values: Nitrogen (N), Phosphorus (P), Potassium (K), pH" },
      { title: "Plot Nutrition Router", type: "api", desc: "POST /api/plot-nutrition & POST /api/nutrition/calculate-plan" },
      { title: "Deficit Calculator", type: "logic", desc: "Compares current soil levels against optimal crop threshold" },
      { title: "Fertilizer Optimizer", type: "logic", desc: "Computes exact kg of Urea (46% N), DAP (18-46-0), and MOP (60% K2O)" },
      { title: "Plot Table Storage", type: "db", desc: "Persists plot boundaries and test records in plot_nutrition" },
      { title: "Radar & Schedule UI", type: "ui", desc: "Displays visual N-P-K radar chart and split dosage schedule" },
    ],
    backendRoutes: [
      "GET /api/plot-nutrition",
      "POST /api/plot-nutrition",
      "POST /api/nutrition/calculate-plan",
      "GET /api/crops",
    ],
    dbTables: ["plot_nutrition", "crops"],
    externalServices: [],
    interlinks: [
      "Farmer crop cycle tracker",
      "Shop inventory recommendations for required fertilizers",
      "Blockchain soil quality certificate block",
    ],
  },
  {
    id: "shop_ledger",
    category: "shop_mill",
    name: "Input Shop Inventory & Khata Book",
    moduleScope: "Agri-Input Inventory & Merchant Khata Book",
    description: "Seed & fertilizer retail stock management, farmer credit/debit tracking, and automated financial accounting.",
    icon: Store,
    flow: [
      { title: "Retail Counter UI", type: "ui", desc: "Shop owner enters sales, seed stock updates, or credit khata entries" },
      { title: "Shop Router", type: "api", desc: "POST /api/shop-accounting/transactions & /api/products" },
      { title: "Stock Validator", type: "logic", desc: "Verifies stock levels and flags low inventory alerts" },
      { title: "Database Commit", type: "db", desc: "Inserts into products and shop_transactions tables" },
      { title: "Ledger Aggregator", type: "logic", desc: "Computes total receivables, net profit, and balance sheets" },
      { title: "Analytics View", type: "ui", desc: "Renders Recharts cashflow graphs and credit dues list" },
    ],
    backendRoutes: [
      "GET /api/products",
      "POST /api/products",
      "PUT /api/products/{id}",
      "GET /api/shop-accounting/transactions",
      "POST /api/shop-accounting/transactions",
      "GET /api/shop-accounting/summary",
    ],
    dbTables: ["products", "shop_transactions", "User"],
    externalServices: [],
    interlinks: [
      "Farmer purchasing inputs from shops",
      "Customer marketplace catalog integration",
      "Manufacturer fertilizer bulk distribution",
    ],
  },
  {
    id: "mill_pipeline",
    category: "shop_mill",
    name: "Manufacturer & Grain Milling Pipeline",
    moduleScope: "Grain Procurement, Milling & Packaging Pipeline",
    description: "Farmer raw grain procurement, conversion yield processing (e.g. paddy to polished rice), and packaging batches.",
    icon: Factory,
    flow: [
      { title: "Procurement Intake", type: "ui", desc: "Mill logs incoming truckload from farmer (weight, moisture %, grade)" },
      { title: "Manufacturer Router", type: "api", desc: "POST /api/manufacturer/batches/intake" },
      { title: "Milling Transformation", type: "logic", desc: "Computes processing yield conversion (e.g. 1000kg paddy -> 680kg rice + husk)" },
      { title: "Blockchain Imprint", type: "api", desc: "Mines transformation block linking farmer batch to finished product" },
      { title: "Database Storage", type: "db", desc: "Updates manufacturer_batches record status to 'Packaged'" },
      { title: "QR Tag Generation", type: "ui", desc: "Produces retail batch QR codes for store distribution" },
    ],
    backendRoutes: [
      "POST /api/manufacturer/batches/intake",
      "POST /api/manufacturer/batches/process",
      "POST /api/manufacturer/batches/package",
      "GET /api/manufacturer/analytics",
    ],
    dbTables: ["manufacturer_batches", "blockchain_blocks", "crops"],
    externalServices: ["Cryptographic Hash Engine"],
    interlinks: [
      "Farmer harvest origin block linking",
      "Customer marketplace retail bags",
      "Public QR traceability verification page",
    ],
  },
  {
    id: "commerce",
    category: "commerce",
    name: "Customer Marketplace, Cart & Razorpay Checkout",
    moduleScope: "Certified Produce Marketplace & Razorpay Gateway",
    description: "Browse certified agricultural produce, manage cart, pay via Razorpay (UPI/Cards), and track orders.",
    icon: ShoppingCart,
    flow: [
      { title: "Marketplace Catalog", type: "ui", desc: "Customer filters certified crops, adds bags to shopping cart" },
      { title: "Order Router", type: "api", desc: "POST /api/orders validates stock and creates PENDING order" },
      { title: "Razorpay Order Init", type: "api", desc: "POST /api/payments/razorpay/create-order generates order_id" },
      { title: "Razorpay Checkout Popup", type: "external", desc: "Customer pays securely via UPI, Google Pay, NetBanking, or Card" },
      { title: "HMAC Signature Check", type: "logic", desc: "Verifies payment signature using RAZORPAY_KEY_SECRET" },
      { title: "Order Finalization", type: "db", desc: "Updates order to 'PAID', deducts product stock, issues receipt" },
    ],
    backendRoutes: [
      "GET /api/products",
      "POST /api/orders",
      "GET /api/orders/my-orders",
      "POST /api/payments/razorpay/create-order",
      "POST /api/payments/razorpay/verify",
    ],
    dbTables: ["orders", "products", "User"],
    externalServices: ["Razorpay Payments Gateway API"],
    interlinks: [
      "Shop inventory deduction",
      "Manufacturer finished batch stock",
      "Blockchain QR link attached to order receipt",
    ],
  },
  {
    id: "learning",
    category: "farmer",
    name: "Learning Hub & Multilingual Tutorial Videos",
    moduleScope: "Multilingual Agricultural Video Tutorials",
    description: "Agricultural video guides with language filtering (Hindi, Telugu, Tamil, English), smart search, and player modal.",
    icon: Globe,
    flow: [
      { title: "Learning Hub UI", type: "ui", desc: "Farmer selects language tab (Hindi/Telugu/Tamil) and types crop query" },
      { title: "Learning Router", type: "api", desc: "GET /api/learning/videos?query=...&language=..." },
      { title: "YouTube Data API", type: "external", desc: "Queries YouTube Data API v3 for high-relevance farming tutorials" },
      { title: "Curated Fallback Engine", type: "logic", desc: "Returns expert agricultural playlist if quota is exhausted" },
      { title: "Browser Player Modal", type: "ui", desc: "Streams responsive YouTube video embed with chapter controls" },
      { title: "Local Storage Cache", type: "ui", desc: "Saves liked videos and watch history locally in browser" },
    ],
    backendRoutes: [
      "GET /api/learning/videos",
      "GET /api/learning/categories",
    ],
    dbTables: [],
    externalServices: ["YouTube Data API v3"],
    interlinks: [
      "Farmer dashboard quick tips widget",
      "Crop disease diagnosis remedy video link",
      "Multilingual translation selector",
    ],
  },
];

export default function ArchitecturePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeFeatureId, setActiveFeatureId] = useState<string>("auth");

  const categories = [
    { id: "all", label: "All Systems", count: ARCHITECTURE_DATA.length },
    { id: "auth", label: "Identity & Auth", count: ARCHITECTURE_DATA.filter((a) => a.category === "auth").length },
    { id: "blockchain", label: "Blockchain", count: ARCHITECTURE_DATA.filter((a) => a.category === "blockchain").length },
    { id: "ai", label: "AI & Vision", count: ARCHITECTURE_DATA.filter((a) => a.category === "ai").length },
    { id: "farmer", label: "Farmer Modules", count: ARCHITECTURE_DATA.filter((a) => a.category === "farmer").length },
    { id: "shop_mill", label: "Shop & Mill", count: ARCHITECTURE_DATA.filter((a) => a.category === "shop_mill").length },
    { id: "commerce", label: "Commerce & Pay", count: ARCHITECTURE_DATA.filter((a) => a.category === "commerce").length },
  ];

  const filteredFeatures = ARCHITECTURE_DATA.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.moduleScope.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.backendRoutes.some((r) => r.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const activeFeature = ARCHITECTURE_DATA.find((f) => f.id === activeFeatureId) || ARCHITECTURE_DATA[0];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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
                <Layers className="h-4 w-4" />
              </div>
              <h1 className="text-base sm:text-lg font-bold">System Architecture Specification</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/docs/api-keys"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
            >
              API Keys Directory
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-border bg-muted/20 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
            <Boxes className="h-3.5 w-3.5" /> Component-Level Diagram Engine
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Complete Architecture for Every Feature & Page
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Explore clean box-and-arrow data flow diagrams, connected backend routers, PostgreSQL database models, external APIs, and interlinked cross-role workflows.
          </p>

          {/* Search bar */}
          <div className="pt-2 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search features (e.g. Blockchain, OTP, Weather, Razorpay)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm transition-all"
            />
          </div>

          {/* Category Filter */}
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

      {/* Main Interactive Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Feature Selector Column */}
          <div className="lg:col-span-4 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Feature / Page</span>
              <span className="text-xs font-semibold text-muted-foreground">{filteredFeatures.length} found</span>
            </div>

            <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
              {filteredFeatures.map((feat) => {
                const Icon = feat.icon;
                const isSelected = feat.id === activeFeature.id;
                return (
                  <button
                    key={feat.id}
                    onClick={() => setActiveFeatureId(feat.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-green-500/10 border-green-500/50 shadow-sm ring-1 ring-green-500/20"
                        : "bg-card border-border hover:border-green-500/30 hover:bg-muted/30"
                    }`}
                  >
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-bold truncate ${isSelected ? "text-green-700 dark:text-green-400" : "text-foreground"}`}>
                          {feat.name}
                        </h3>
                        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "translate-x-0.5 text-green-600" : "text-muted-foreground"}`} />
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{feat.moduleScope}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Architecture Detail Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Feature Header Card */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-600 shrink-0">
                    <activeFeature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{activeFeature.name}</h2>
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400">{activeFeature.moduleScope}</p>
                  </div>
                </div>
                <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded-md bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 border border-green-500/20">
                  {activeFeature.category}
                </span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{activeFeature.description}</p>
            </div>

            {/* Visual Box & Arrow Pipeline Flow Diagram */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <GitFork className="h-4 w-4 text-green-500" /> End-to-End Box & Arrow Data Pipeline
                </div>
                {/* Legend */}
                <div className="hidden sm:flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> UI</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> API</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-purple-500" /> Logic</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> DB</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> External</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {activeFeature.flow.map((node, idx) => {
                  const typeColors = {
                    ui: "border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300",
                    api: "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300",
                    logic: "border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20 text-purple-800 dark:text-purple-300",
                    db: "border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300",
                    external: "border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300",
                  };

                  const typeBadge = {
                    ui: "Frontend View",
                    api: "FastAPI Endpoint",
                    logic: "Processing Engine",
                    db: "Database Layer",
                    external: "External Cloud API",
                  };

                  return (
                    <div
                      key={idx}
                      className={`relative p-4 rounded-xl border ${typeColors[node.type]} flex flex-col justify-between space-y-2 transition-all hover:scale-[1.01]`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-background/80 border border-border">
                          STEP {idx + 1}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                          {typeBadge[node.type]}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-foreground">{node.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{node.desc}</p>
                      </div>

                      {idx < activeFeature.flow.length - 1 && (
                        <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                          <div className="h-6 w-6 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-muted-foreground">
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Technical Subsystems Details (APIs, DB Models, Interlinks) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Connected Backend Routes */}
              <div className="p-5 rounded-xl border border-border bg-card space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Server className="h-3.5 w-3.5 text-green-500" /> Backend Endpoints
                </div>
                <ul className="space-y-1.5 text-xs font-mono">
                  {activeFeature.backendRoutes.map((route, rIdx) => (
                    <li key={rIdx} className="p-2 rounded-lg bg-muted/40 border border-border text-foreground truncate">
                      {route}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Connected Database Models */}
              <div className="p-5 rounded-xl border border-border bg-card space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                  <Database className="h-3.5 w-3.5 text-amber-500" /> Database Tables
                </div>
                {activeFeature.dbTables.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {activeFeature.dbTables.map((table, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300"
                      >
                        {table}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Stateless / Third-party direct stream</p>
                )}

                {/* External Services */}
                {activeFeature.externalServices.length > 0 && (
                  <div className="pt-2 border-t border-border space-y-1.5">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      External Services:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeFeature.externalServices.map((ext, eIdx) => (
                        <span
                          key={eIdx}
                          className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300"
                        >
                          {ext}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interlinked Components Banner */}
            <div className="p-5 rounded-xl border border-border bg-card space-y-2">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-purple-500" /> Interlinked Features & Workflows
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                {activeFeature.interlinks.map((link, lIdx) => (
                  <li key={lIdx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                    <span className="truncate">{link}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

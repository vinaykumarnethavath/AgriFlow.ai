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
  Calendar,
  CreditCard,
  PackageCheck,
  FileText,
  PhoneCall,
  BarChart2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Truck,
  Ban,
  ShieldAlert,
  DollarSign,
  Wallet,
  Sliders,
  Check,
  CheckCircle,
  ArrowDown,
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

interface OrderStateTransition {
  target: string;
  action: string;
  by: "Farmer" | "Shop Owner" | "System / Auto";
  rule: string;
}

interface OrderLifecycleState {
  id: string;
  name: string;
  badge: string;
  type: "initial" | "intermediate" | "terminal" | "locked";
  colorTheme: {
    border: string;
    bg: string;
    text: string;
    accent: string;
    ring: string;
  };
  description: string;
  actors: string[];
  stockAction: string;
  paymentRule: string;
  allowedTransitions: OrderStateTransition[];
}

const ORDER_LIFECYCLE_STATES: OrderLifecycleState[] = [
  {
    id: "pending",
    name: "pending",
    badge: "Pending Review",
    type: "initial",
    colorTheme: {
      border: "border-amber-500/40",
      bg: "bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-300",
      accent: "bg-amber-500",
      ring: "ring-amber-500/30",
    },
    description: "Farmer placed order from cart. Items are temporarily deducted/reserved in shop inventory. Cart state is safely preserved until confirmed.",
    actors: ["Farmer (Cancel)", "Shop Owner (Confirm/Reject)", "System (Auto-Confirm Engine)"],
    stockAction: "Product quantities deducted upon placement. 100% restored if rejected or cancelled.",
    paymentRule: "No payment collected yet. Razorpay payment modal unlocks in Farmer Orders once confirmed.",
    allowedTransitions: [
      { target: "confirmed", action: "Accept Order", by: "Shop Owner", rule: "Manual shop review OR Auto-confirm if all item stocks > low_stock_buffer" },
      { target: "rejected", action: "Decline Order", by: "Shop Owner", rule: "Restores stock to inventory immediately; notifies farmer on orders page" },
      { target: "cancelled", action: "Cancel Request", by: "Farmer", rule: "Farmer can cancel anytime while pending; stock instantly restored" },
    ],
  },
  {
    id: "confirmed",
    name: "confirmed",
    badge: "Shop Confirmed",
    type: "intermediate",
    colorTheme: {
      border: "border-blue-500/40",
      bg: "bg-blue-500/10",
      text: "text-blue-700 dark:text-blue-300",
      accent: "bg-blue-500",
      ring: "ring-blue-500/30",
    },
    description: "Shop accepted the order. Farmer is enabled to complete online Razorpay payment (or agree on COD). Cancellation remains open until dispatch.",
    actors: ["Shop Owner (Dispatch when paid)", "Farmer (Pay Online / Cancel before dispatch)"],
    stockAction: "Stock remains reserved in shop inventory.",
    paymentRule: "Online mode: Farmer clicks 'Pay with Razorpay' -> HMAC signature verified -> payment_status = 'paid'. Cash mode: COD confirmed.",
    allowedTransitions: [
      { target: "dispatched", action: "Dispatch Order", by: "Shop Owner", rule: "STRICT GUARD: Disallow dispatch unless payment_status == 'paid'" },
      { target: "cancelled", action: "Cancel Order", by: "Farmer", rule: "Permitted ONLY BEFORE dispatch. Restores stock; auto-refund if prepaid online" },
    ],
  },
  {
    id: "rejected",
    name: "rejected",
    badge: "Shop Rejected",
    type: "terminal",
    colorTheme: {
      border: "border-rose-500/40",
      bg: "bg-rose-500/10",
      text: "text-rose-700 dark:text-rose-300",
      accent: "bg-rose-500",
      ring: "ring-rose-500/30",
    },
    description: "Shop declined the order (due to insufficient stock, delivery distance, or off-season supply). Terminal state.",
    actors: ["Terminal State (No further actions)"],
    stockAction: "100% of reserved items automatically restored back to shop products stock.",
    paymentRule: "No payment collected. Any temporary payment pre-authorization is voided.",
    allowedTransitions: [],
  },
  {
    id: "cancelled",
    name: "cancelled",
    badge: "Order Cancelled",
    type: "terminal",
    colorTheme: {
      border: "border-slate-500/40",
      bg: "bg-slate-500/10",
      text: "text-slate-700 dark:text-slate-300",
      accent: "bg-slate-500",
      ring: "ring-slate-500/30",
    },
    description: "Farmer cancelled the order while in 'pending' or 'confirmed' state before dispatch. Terminal state.",
    actors: ["Terminal State (No further actions)"],
    stockAction: "100% of reserved items automatically restored back to shop products stock.",
    paymentRule: "If pre-paid online via Razorpay, automated refund transaction is initiated to original source.",
    allowedTransitions: [],
  },
  {
    id: "dispatched",
    name: "dispatched",
    badge: "Dispatched / In Transit",
    type: "locked",
    colorTheme: {
      border: "border-purple-500/40",
      bg: "bg-purple-500/10",
      text: "text-purple-700 dark:text-purple-300",
      accent: "bg-purple-500",
      ring: "ring-purple-500/30",
    },
    description: "Shop packaged goods and handed over to carrier/delivery. Cancellation is permanently locked. Order is in transit to farmer.",
    actors: ["Shop Owner or Farmer (Mark Delivered)"],
    stockAction: "Stock permanently relieved from warehouse inventory.",
    paymentRule: "Pre-condition verified: payment_status is 'paid'. Unpaid orders cannot be dispatched.",
    allowedTransitions: [
      { target: "completed", action: "Mark Delivered / Completed", by: "Shop Owner", rule: "Farmer physically receives package; delivery receipt confirmed" },
    ],
  },
  {
    id: "completed",
    name: "completed",
    badge: "Order Fulfilled",
    type: "terminal",
    colorTheme: {
      border: "border-emerald-500/40",
      bg: "bg-emerald-500/10",
      text: "text-emerald-700 dark:text-emerald-300",
      accent: "bg-emerald-500",
      ring: "ring-emerald-500/30",
    },
    description: "Produce / input materials safely received by the farmer. Transaction is fully settled on shop ledger.",
    actors: ["Terminal State (Lifecycle Complete)"],
    stockAction: "Archived in completed order records; stock adjustments permanent.",
    paymentRule: "Fully settled and accounted in shop accounting balance sheet.",
    allowedTransitions: [],
  },
];

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
    id: "farmer_operations",
    category: "farmer",
    name: "Farm Operations, Calendar & Crop Health",
    moduleScope: "Activity Scheduling, Milestones & Health Diagnostics",
    description: "Interactive monthly calendar with crop auto-event projection, real-time health indicator tags (🟢🟡🔴), and AI advisory.",
    icon: Calendar,
    flow: [
      { title: "Farmer Dashboard", type: "ui", desc: "Displays Crop Health status tags, AI suggestion box, and upcoming events" },
      { title: "Operations Routers", type: "api", desc: "GET /farm-calendar/events & GET /crop-health-indicator/" },
      { title: "Milestone Engine", type: "logic", desc: "Projects sowing, irrigation, fertilizer top-dressing, and harvest milestones" },
      { title: "Health Evaluator", type: "logic", desc: "Assesses leaf disease history, weather stress, and crop lifecycle" },
      { title: "Database Storage", type: "db", desc: "Persists farm_events and crop_health_status records" },
      { title: "Interactive Calendar", type: "ui", desc: "Full monthly grid with event completion toggles and filters" },
    ],
    backendRoutes: [
      "GET /farm-calendar/events",
      "POST /farm-calendar/events",
      "PUT /farm-calendar/events/{id}",
      "DELETE /farm-calendar/events/{id}",
      "GET /crop-health-indicator/{crop_id}",
      "GET /crop-health-indicator/suggestion/ai",
    ],
    dbTables: ["farm_events", "crops"],
    externalServices: ["Groq LLM (Agronomic advisory prompt)"],
    interlinks: [
      "Farmer central dashboard alert widgets",
      "Crop sowing & harvest date synchronizer",
      "Precision nutrition split-dosage schedules",
    ],
  },
  {
    id: "farmer_finance_risk",
    category: "farmer",
    name: "Financials, Credit, Insurance & Storage",
    moduleScope: "Credit Ledger, PMFBY Claims & Cold Storage Tracking",
    description: "Credit/loan management, PMFBY 72-hour disaster claim workflow, produce storage rent accumulation, and institutional PDF reporting.",
    icon: CreditCard,
    flow: [
      { title: "Financial Portals", type: "ui", desc: "Pages for Credit Tracker, Crop Insurance, Storage & Annual Summary" },
      { title: "Financial Routers", type: "api", desc: "Endpoints for /credit-loan, /crop-insurance, /crop-storage, /annual-summary" },
      { title: "Dynamic Rent & Loan Engine", type: "logic", desc: "Computes monthly storage rent, interest accumulation, and YoY comparisons" },
      { title: "ReportLab PDF Engine", type: "logic", desc: "Generates bank-ready PDF statements with verification seals" },
      { title: "Database Storage", type: "db", desc: "Stores credit_loans, loan_repayments, crop_insurances, crop_storages, soil_profiles" },
      { title: "SOS Directory", type: "ui", desc: "Direct-dial emergency hotline banner (KCC 1551, PMFBY 14447, Discom 1912)" },
    ],
    backendRoutes: [
      "GET /credit-loan/",
      "POST /credit-loan/",
      "POST /credit-loan/{id}/repay",
      "GET /crop-insurance/",
      "POST /crop-insurance/{id}/file-claim",
      "GET /crop-storage/",
      "POST /crop-storage/{id}/release",
      "GET /soil-profile/summary",
      "GET /annual-summary/",
      "GET /farm-reports/download",
      "GET /emergency-contacts/",
    ],
    dbTables: [
      "credit_loans",
      "loan_repayments",
      "crop_insurances",
      "crop_storages",
      "soil_profiles",
      "emergency_contacts",
    ],
    externalServices: ["ReportLab PDF Generator", "PMFBY National Helpline API (14447)"],
    interlinks: [
      "Farmer sidebar navigation links",
      "Bank loan application & subsidy workflows",
      "Emergency SOS direct call actions",
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
    id: "order_lifecycle",
    category: "commerce",
    name: "Order Lifecycle & State Machine",
    moduleScope: "Farmer-to-Shop Order FSM & Razorpay Flow",
    description: "Finite state machine governing order progression: pending, confirmed, rejected, cancelled, dispatched, and completed, integrated with shop auto-confirmation rules and Razorpay payment gating.",
    icon: RefreshCw,
    flow: [
      { title: "1. Order Placement", type: "ui", desc: "Farmer selects products, chooses Cash/Online, and submits order (cart preserved until verified)" },
      { title: "2. Pending Queue", type: "api", desc: "POST /api/orders creates pending order; evaluates shop auto-confirm rules & low-stock buffer" },
      { title: "3. Shop Decision", type: "logic", desc: "Shop confirms or declines; rejection immediately restores 100% reserved inventory stock" },
      { title: "4. Payment Gating", type: "external", desc: "For online orders, Razorpay HMAC SHA-256 signature verification updates payment_status to 'paid'" },
      { title: "5. Dispatch Verification", type: "logic", desc: "Shop can dispatch ONLY if payment_status is 'paid'; farmer cancellation locked once dispatched" },
      { title: "6. Delivery Fulfillment", type: "db", desc: "Order marked completed upon verified delivery; accounting ledger updated and finalized" },
    ],
    backendRoutes: [
      "POST /api/orders",
      "GET /api/orders/my-orders",
      "GET /api/orders/shop",
      "PATCH /api/orders/{id}/status",
      "POST /api/payments/razorpay/create-order",
      "POST /api/payments/razorpay/verify",
      "GET /api/shop-settings",
      "PUT /api/shop-settings",
    ],
    dbTables: ["shop_orders", "shop_order_items", "shop_order_settings", "payments", "products"],
    externalServices: ["Razorpay Payments Gateway API", "Fast2SMS (SMS Alerts)"],
    interlinks: [
      "Farmer Market & persistent cart storage",
      "Shop Orders management dashboard",
      "Inventory auto-deduction and restoration",
      "Farmer Orders tracking page",
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
  const [activeFeatureId, setActiveFeatureId] = useState<string>("order_lifecycle");
  const [activeOrderStateId, setActiveOrderStateId] = useState<string>("pending");
  const [orderViewTab, setOrderViewTab] = useState<"state_machine" | "pipeline">("state_machine");

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
              placeholder="Search features (e.g. Blockchain, OTP, Weather, Razorpay, State Machine)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm transition-all"
            />
          </div>

          {/* Quick jump to State Machine */}
          <div className="flex justify-center pt-1">
            <button
              onClick={() => {
                setSelectedCategory("commerce");
                setActiveFeatureId("order_lifecycle");
                setOrderViewTab("state_machine");
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-all shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Interactive State Machine: <strong>Order Lifecycle FSM</strong></span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
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

            {/* Main Visual Presentation: State Machine for Order Lifecycle or Box & Arrow Pipeline */}
            {activeFeature.id === "order_lifecycle" && orderViewTab === "state_machine" ? (
              <div className="space-y-6">
                {/* State Machine Container */}
                <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
                  {/* FSM Top Bar with Tab Switch */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <RefreshCw className="h-4 w-4 text-amber-500 animate-spin-slow" />
                        <span>Interactive Order Lifecycle State Machine (FSM)</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Click on any state node below to inspect transition triggers, role permissions, stock rules & payment guards.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border text-xs shrink-0">
                      <button
                        onClick={() => setOrderViewTab("state_machine")}
                        className="px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 bg-card shadow-sm text-foreground border border-border"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-amber-500" /> State Machine
                      </button>
                      <button
                        onClick={() => setOrderViewTab("pipeline")}
                        className="px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <GitFork className="h-3.5 w-3.5 text-green-500" /> Pipeline Flow
                      </button>
                    </div>
                  </div>

                  {/* Visual State Machine Flow Map */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-bold text-foreground">
                      <span className="uppercase tracking-wider text-muted-foreground">Order Lifecycle States & Branching</span>
                      <span className="text-[11px] font-normal text-muted-foreground">Showing 6 States • 2 Terminal Branches</span>
                    </div>

                    {/* Interactive States Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {ORDER_LIFECYCLE_STATES.map((st) => {
                        const isSelected = st.id === activeOrderStateId;
                        const typeTagColor = {
                          initial: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800",
                          intermediate: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800",
                          locked: "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800",
                          terminal: "bg-muted text-muted-foreground border-border",
                        };

                        return (
                          <div
                            key={st.id}
                            onClick={() => setActiveOrderStateId(st.id)}
                            className={`cursor-pointer text-left p-4 rounded-xl border transition-all relative flex flex-col justify-between space-y-3 ${
                              isSelected
                                ? `${st.colorTheme.border} ${st.colorTheme.bg} shadow-md ring-2 ${st.colorTheme.ring}`
                                : "bg-card border-border hover:border-border/80 hover:bg-muted/20"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-xs uppercase px-2 py-0.5 rounded-md bg-background/80 border border-border">
                                {st.name}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeTagColor[st.type]}`}>
                                {st.badge}
                              </span>
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                {st.description}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">Transitions: <strong>{st.allowedTransitions.length}</strong></span>
                              <span className={`font-semibold ${isSelected ? st.colorTheme.text : "text-muted-foreground"}`}>
                                {isSelected ? "Inspecting ➔" : "Click to view"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected State Inspector Panel */}
                  {(() => {
                    const sel = ORDER_LIFECYCLE_STATES.find((s) => s.id === activeOrderStateId) || ORDER_LIFECYCLE_STATES[0];
                    return (
                      <div className="p-5 rounded-xl border border-border bg-muted/20 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
                          <div className="flex items-center gap-2.5">
                            <div className={`h-8 w-8 rounded-lg ${sel.colorTheme.bg} border ${sel.colorTheme.border} flex items-center justify-center font-bold text-xs ${sel.colorTheme.text}`}>
                              {sel.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-foreground">Status: &ldquo;{sel.name}&rdquo;</h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-background border border-border">
                                  {sel.badge}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{sel.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-semibold text-muted-foreground">Who can act:</span>
                            {sel.actors.map((actor, aIdx) => (
                              <span key={aIdx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-background border border-border text-foreground">
                                {actor}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Rules Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                          {/* Stock Action */}
                          <div className="p-3.5 rounded-lg bg-card border border-border space-y-1">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <Boxes className="h-3.5 w-3.5 text-amber-500" /> Stock Inventory Effect
                            </span>
                            <p className="text-muted-foreground leading-relaxed">{sel.stockAction}</p>
                          </div>

                          {/* Payment Rule */}
                          <div className="p-3.5 rounded-lg bg-card border border-border space-y-1">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <CreditCard className="h-3.5 w-3.5 text-emerald-500" /> Payment Pre-Condition & Gating
                            </span>
                            <p className="text-muted-foreground leading-relaxed">{sel.paymentRule}</p>
                          </div>
                        </div>

                        {/* Permitted Outgoing Transitions */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                            Permitted Next State Transitions ({sel.allowedTransitions.length})
                          </span>
                          {sel.allowedTransitions.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {sel.allowedTransitions.map((tr, trIdx) => (
                                <div key={trIdx} className="p-3 rounded-lg bg-card border border-border space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-xs font-bold text-foreground">{sel.name}</span>
                                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                      <span className="font-mono text-xs font-bold text-green-600 dark:text-green-400">{tr.target}</span>
                                    </div>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                      {tr.by}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    <strong>Trigger:</strong> {tr.action} — {tr.rule}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg bg-card border border-border text-xs text-muted-foreground italic flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                              This is a terminal state. No further forward transitions permitted.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* State Transition Security Matrix Table */}
                <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                      <ShieldCheck className="h-4 w-4 text-green-500" />
                      Complete State Transition Security Matrix
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">FastAPI Enforced</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/50 border-b border-border text-[11px] uppercase font-bold text-muted-foreground">
                        <tr>
                          <th className="py-2.5 px-3">State</th>
                          <th className="py-2.5 px-3">Meaning</th>
                          <th className="py-2.5 px-3">Allowed Actors</th>
                          <th className="py-2.5 px-3">Next Valid States</th>
                          <th className="py-2.5 px-3">Inventory Action</th>
                          <th className="py-2.5 px-3">Payment / Dispatch Guard</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border font-mono text-[11px]">
                        <tr className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">pending</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">Farmer placed order; awaits review</td>
                          <td className="py-2.5 px-3 font-sans">Shop / Farmer</td>
                          <td className="py-2.5 px-3 text-foreground font-bold">confirmed, rejected, cancelled</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">Deducted from stock</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">Payment pending; cart preserved</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">confirmed</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">Shop accepted order (manual/auto)</td>
                          <td className="py-2.5 px-3 font-sans">Shop / Farmer</td>
                          <td className="py-2.5 px-3 text-foreground font-bold">dispatched, cancelled</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">Reserved in stock</td>
                          <td className="py-2.5 px-3 font-sans text-emerald-600 dark:text-emerald-400 font-bold">Razorpay Pay Now unlocks</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400">rejected</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">Shop declined order (shortage/distance)</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">None (Terminal)</td>
                          <td className="py-2.5 px-3 text-muted-foreground italic font-sans">— (Terminal)</td>
                          <td className="py-2.5 px-3 font-sans text-rose-600 dark:text-rose-400 font-bold">100% Stock Restored</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">No payment collected</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 font-bold text-slate-600 dark:text-slate-400">cancelled</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">Farmer cancelled prior to dispatch</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">None (Terminal)</td>
                          <td className="py-2.5 px-3 text-muted-foreground italic font-sans">— (Terminal)</td>
                          <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400 font-bold">100% Stock Restored</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">Auto-refund if prepaid online</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 font-bold text-purple-600 dark:text-purple-400">dispatched</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">Goods packed & shipped with carrier</td>
                          <td className="py-2.5 px-3 font-sans">Shop / Farmer</td>
                          <td className="py-2.5 px-3 text-foreground font-bold">completed</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">Permanently relieved</td>
                          <td className="py-2.5 px-3 font-sans text-amber-600 dark:text-amber-400 font-bold">STRICT: payment_status = &lsquo;paid&rsquo;</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">completed</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">Delivered & verified by customer</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">None (Terminal)</td>
                          <td className="py-2.5 px-3 text-muted-foreground italic font-sans">— (Terminal)</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">Final ledger recorded</td>
                          <td className="py-2.5 px-3 font-sans text-muted-foreground">Settlement finalized</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment Modes & Shop Auto-Confirm Rules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Payment Gating Card */}
                  <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                      <CreditCard className="h-4 w-4 text-emerald-500" />
                      Payment Modes & Dispatch Gating
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
                        <span className="font-bold text-foreground block">Online Mode (Razorpay)</span>
                        <p>
                          Farmer pays via Razorpay modal only after shop confirms. Backend verifies HMAC-SHA256 signature to set <code className="text-green-600 font-mono">payment_status = &lsquo;paid&rsquo;</code>. Dispatch is locked until verified.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
                        <span className="font-bold text-foreground block">Cash Mode (COD)</span>
                        <p>
                          Payment is settled physically upon delivery. Shop owner marks <code className="text-green-600 font-mono">payment_status = &lsquo;paid&rsquo;</code> upon agreed terms, allowing delivery dispatch.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shop Auto-Confirm & Buffer Card */}
                  <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
                      <Sliders className="h-4 w-4 text-amber-500" />
                      Shop Auto-Confirm & Buffer Stock Rules
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
                        <span className="font-bold text-foreground block">3 Modes in ShopOrderSettings</span>
                        <p>
                          <code className="text-foreground font-mono">manual</code> (review all), <code className="text-foreground font-mono">auto_all</code> (auto-confirm all), or <code className="text-foreground font-mono">auto_selected</code> (trusted regular farmers whitelist).
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-1">
                        <span className="font-bold block flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                          Low-Stock Buffer Safety Override
                        </span>
                        <p className="text-[11px] leading-relaxed">
                          If ANY product ordered has stock &le; <code className="font-mono font-bold">low_stock_buffer</code> (default: 5 units), auto-confirm is bypassed and forced to manual triage to prevent overselling.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Visual Box & Arrow Pipeline Flow Diagram (Default for all other features or when tab selected) */
              <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <GitFork className="h-4 w-4 text-green-500" /> End-to-End Box & Arrow Data Pipeline
                  </div>

                  {activeFeature.id === "order_lifecycle" && (
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border text-xs shrink-0">
                      <button
                        onClick={() => setOrderViewTab("state_machine")}
                        className="px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-amber-500" /> State Machine
                      </button>
                      <button
                        onClick={() => setOrderViewTab("pipeline")}
                        className="px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 bg-card shadow-sm text-foreground border border-border"
                      >
                        <GitFork className="h-3.5 w-3.5 text-green-500" /> Pipeline Flow
                      </button>
                    </div>
                  )}

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
            )}

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

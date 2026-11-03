# 🌾 AgriFlow AI (AgriChain)

<div align="center">

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.1+-black.svg?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?style=for-the-badge&logo=tailwind_css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.8%20Flash%20Vision-4285F4.svg?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Groq AI](https://img.shields.io/badge/Groq-Llama%203.3%2070B-F55036.svg?style=for-the-badge&logoColor=white)](https://groq.com/)
[![YouTube API](https://img.shields.io/badge/YouTube%20Data-v3-FF0000.svg?style=for-the-badge&logo=youtube&logoColor=white)](https://developers.google.com/youtube/v3)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Enterprise-grade, full-stack digital agriculture and farm-to-fork supply chain intelligence platform.**

[5-Year Demo](#-5-year-comprehensive-demo-ecosystem-2021--2026) • [Key Features](#-key-functional-modules) • [Context Learning Hub](#-context-aware-learning-hub--multi-factor-pipeline) • [Gemini Vision](#-ai-crop-health-diagnosis-google-gemini-38-flash) • [System Architecture](#-system-architecture) • [Setup Guide](#️-local-setup-guide)

</div>

---

**AgriFlow AI** unifies four vital agricultural stakeholders — **Farmers**, **Input & Fertilizer Retailers**, **Grain Processing Mills / Manufacturers**, and **Retail Consumers** — into a single, cryptographically auditable, and AI-powered operational ecosystem.

The platform comes pre-packaged with a **5-Year Comprehensive Demo Ecosystem (2021 – 2026)**, allowing developers, stakeholders, and reviewers to instantly explore multi-year crop cycles, historical shop accounting ledgers, industrial milling runs, and consumer orders with zero initial setup.

---

## 🌟 5-Year Comprehensive Demo Ecosystem (2021 – 2026)

AgriFlow provides an authentic, multi-year dataset spanning **2021 through 2026** across all 4 connected roles. You can launch any role with **1-click** from the interactive top-navigation **"5-Yr Demo"** button or log in using the credentials below:

| Role | Profile & Organization | Email | Password | 5-Year Dataset Highlights (2021 – 2026) |
| :--- | :--- | :--- | :--- | :--- |
| 🌾 **Farmer** | **Ravi Kumar Reddy**<br>Krishna District, AP | `demo@farmer.com` | `demo123` | • **14 Seasonal Crop Cycles** (Paddy, Cotton, Maize, Wheat, Tomato, Moong)<br>• **₹18.5L+ Turnover** with seasonal mandi & mill sales<br>• **SBI Kisan Credit Card (KCC)** & PACS loan ledgers<br>• **PMFBY / WBCIS Insurance** with settled flood/drought claims<br>• **3 Biennial Soil Health Cards** (2021, 2023, 2025) & e-NWR storage |
| 🏪 **Shop Owner** | **Krishna Agro Center**<br>Venkat Rao Potti | `demo@shop.com` | `demo123` | • **134+ Orders** across 2021–2026 (Completed, Dispatched, Confirmed, Pending)<br>• **15 Agricultural Input Products** (Seeds, Fertilizers, Bio-nutrients)<br>• **60 Continuous Months (5 Years)** of shop accounting P&L ledgers<br>• Real-time POS checkout with automatic stock decrement on order confirmation |
| 🏭 **Mill Owner** | **Sri Venkateswara Mill**<br>Prasad Babu Reddy | `demo@manufacturer.com` | `demo123` | • **120 Ton/Day Capacity** Rice & Flour Milling Plant<br>• **11 Farm-Gate Procurements** (310+ Quintals Paddy & Wheat)<br>• **60+ Industrial Milling Batches** & By-Product Recovery<br>• **210 Factory Expense Entries** & Wholesale B2B Sales Orders |
| 🛍️ **Customer** | **Priya Sharma**<br>Direct Farm Consumer | `demo@customer.com` | `demo123` | • **45+ Consumer Orders (2021–2026)** of fresh produce & packaged staples<br>• Full order history tracking with downloadable GST tax invoices<br>• Multi-item cart checkout with Razorpay payment flow |

> [!TIP]
> **Instant 1-Click Launch**: Click the green **"5-Yr Demo"** button on the top-right of the login screen or top-bar to open the visual timeline drawer and launch any role immediately without typing credentials.

---

## 🚀 Key Functional Modules

### 1. 🌾 Farmer Operations & Agronomic Intelligence
- **Multi-Season Cultivation Tracking**: Complete sowing-to-harvest crop cycle management with expense logging (seeds, fertilizers, pesticides, labor, irrigation, machinery) and gross revenue calculations.
- **Fair Moisture & Weighbridge Deduction Calculator**: Scientific FCI-standard moisture deduction formula ($W_{std} = W_{act} \times \frac{100 - M_{act}}{100 - M_{std}}$) protecting farmers against arbitrary Mandi/Mill weight cuts on Paddy, Wheat, Maize, and Soybeans with live interactive sliders.
- **Digital Gate Pass & QR Token Allocation**: Reserve intake queue slots (Morning, Afternoon, Evening) with vehicle info (Tractor, Mini Truck, 10-Wheeler) and tamper-proof SVG QR gate passes.
- **Small-Farmer Collective Selling (Load Pooling Hub)**: Aggregate smallholder harvests (10–25 Qtl) into commercial 10-ton truckloads (`/dashboard/farmer/mills/load-pools`), eliminating middleman commission haircuts.
- **Soil Moisture & Agro-Meteorological Intelligence (Open-Meteo)**: Volumetric soil water content telemetry across 5 root depth layers (0–1cm, 1–3cm, 3–9cm, 9–27cm, 27–81cm), 7-day agricultural forecasts, ET₀ evapotranspiration rates, and automated spray advisories.
- **Crop Health Indicator (🟢🟡🔴) & Gemini 3.8 Flash Vision**: Deep-learning multimodal pathology diagnosis using Google Gemini 3.8 Flash Vision with immediate pesticide and treatment steps.
- **Institutional Farm Report Generator (PDF)**: Download official bank-ready financial statements generated via ReportLab for Kisan Credit Card (KCC) renewal, equipment financing, and PMFBY claims.
- **Soil Profile & Government Soil Health Card (SHC)**: Track Available N-P-K, pH, Organic Carbon %, and micronutrients with ICAR fertility benchmark scores (0–100).
- **Post-Harvest Produce Storage (e-NWR)**: Cold storage and warehouse deposit tracking with dynamic monthly rent calculations and mandi peak price release alerts.
- **Hands-Free Multilingual Voice Assistant & Chatbot**: Interactive agronomic voice assistant with live audio waveform visualizer supporting 9 regional languages powered by Groq Llama 3.3 70B and Web Speech API.
- **Emergency Directory & Priority SOS Banner**: Direct-dial emergency hotlines: Kisan Call Center (`1551`), PMFBY Calamity Claim Line (`14447`), and Rural Electricity Breakdown (`1912`).

### 2. 🏪 Input Shop & Retail POS
- **Inventory Management with Auto-Decrement**: Dynamic product catalog across seeds, fertilizers, and crop protection inputs. Product inventory quantities automatically deduct upon order confirmation.
- **Order Lifecycle State Machine (FSM)**: Strict state-machine progression (`pending` ➔ `confirmed` ➔ `dispatched` ➔ `completed`, or `cancelled`/`rejected`) shared synchronously between farmer and shop dashboards.
- **Shop Auto-Confirmation & Safety Buffer**: Configurable shop modes (`manual`, `auto_all`, `auto_selected`) with a `low_stock_buffer` safeguard overriding auto-confirm if stock falls below threshold.
- **60-Month Accounting Ledger**: Apportioned rent, payroll, logistics, electricity, and shop overhead expenses categorized for real-time monthly and annual P&L reporting.
- **Omnichannel POS**: Process cash, credit, and digital UPI sales with customer khata ledger management.

### 3. 🏭 Grain Processing Mill & Industrial Manufacturing
- **Direct Farm Gate Procurement**: Create procurement contracts, schedule batch intakes, and record farmer arrivals.
- **Official Digital Weighment Slip (Dharamkanta Receipt / Parchi)**: Record Gross, Tare, Net Harvest Weight, and FCI moisture cut breakdown with printable formal receipts.
- **Industrial Milling Runs & Production Batches**: Convert raw paddy/grain into branded packaged outputs (SV Supreme Atta, SV Sharbati Rice) with yield conversion analysis.
- **By-Product Inventory & Secondary Recovery**: Manage secondary milling outputs (Rice Bran, Husk, Broken Rice, Mustard DOC) with in-stock valuation and buyer dispatch tracking.
- **Factory Accounting**: Dedicated 5-year operational expense tracking for machinery maintenance, labor wages, power tariffs, and bulk transport.

### 4. 🛍️ Consumer Marketplace & Public Traceability
- **Direct Farm-to-Fork Marketplace**: Browse farm-fresh fruits, vegetables, and mill-packaged grains with transparent farmer pricing.
- **Immutable Blockchain Ledger**: SHA-256 cryptographic hash-chaining and Proof-of-Work (PoW) block explorer verifying organic certificates, mill processing dates, and transit hops.
- **Public QR Traceability (`/trace/[id]`)**: Scan any retail product QR code to view its provenance timeline from seed sowing to supermarket shelf.
- **Consumer Order History & Invoices**: Persistent order tracking, invoice generation, and status timeline.

### 5. 💳 Razorpay Payments Integration
- Secure checkout flow for farm inputs and retail groceries.
- Supports Cards, Netbanking, Wallets, and configurable UPI modes with server-side HMAC-SHA256 signature verification.
- Enforced order dispatch gating: disallow dispatch until `payment_status == 'paid'`.

---

## 🔬 AI Crop Health Diagnosis (Google Gemini 3.8 Flash)

The Crop Health module provides instant plant pathology diagnostics from mobile leaf photos, powered by **Google Gemini 3.8 Flash Vision** (`backend/app/routers/crop_health.py`).

```mermaid
flowchart LR
    A["Farmer Photo Upload<br/>(JPEG / PNG / WebP)"] --> B["FastAPI Backend<br/>POST /crop-health/diagnose"]
    B --> C{"GEMINI_API_KEY<br/>Configured?"}
    C -->|Yes| D["Google Gemini 3.8 Flash<br/>(Multimodal Vision API)"]
    C -->|No| G["Simulated Fallback<br/>(Agricultural Heuristics)"]
    D --> E{"Structured JSON<br/>Parse Valid?"}
    E -->|Yes| F["Complete Diagnosis<br/>(Disease, Severity, Pesticides, Care)"]
    E -->|No| H{"Regex JSON<br/>Extraction?"}
    H -->|Match| F
    H -->|Fail| G
    G --> F
```

### Fallback Chain & Safety Net
1. **Gemini 3.8 Flash Multimodal Call**: Image bytes + `DIAGNOSIS_SYSTEM_PROMPT` sent natively via `google.generativeai`.
2. **JSON Extraction Engine**: Strips markdown code blocks (` ```json `), validates required schema fields (`is_healthy`, `disease`, `treatment_steps`, `pesticide_recommendations`, `prevention_tips`).
3. **Regex Extraction Safety Net**: Recovers embedded JSON structures from text if formatting deviates.
4. **Offline Simulated Diagnosis**: Gracefully falls back to structured agricultural guidance if API quota or connectivity is interrupted, ensuring zero frontend crashes.

---

## 🧠 Context-Aware Learning Hub & Multi-Factor Pipeline

The Learning Hub (`/dashboard/farmer/learning`) delivers personalized agricultural video tutorials grounded in the farmer's live telemetry streams, avoiding irrelevant general content.

### Proposed Multi-Factor Pipeline
```mermaid
graph TD
    subgraph MultiFactorInputs ["Input Telemetry Streams"]
        W["Weather & 7-Day Forecast<br/>(Temp, Rain >15mm, Alerts)"]
        C["Crops + Growth Stage<br/>(Sowing/Harvest Dates)"]
        P["Plots + Soil Profiles<br/>(Texture, N-P-K, pH)"]
        H["Crop Health & Pest Status<br/>(Recent Pathologies)"]
    end

    AFCE["Aggregated Farm Context Engine<br/>(Server-Side /learning/context)"]
    CAQB["Context-Aware Query Builder<br/>(Personalized Query Vectors)"]
    WRS["Weighted Relevance Scorer<br/>(YouTube API v3 + Dynamic Weights)"]
    UI["Tailored Learning Hub UI<br/>(Dynamic Category Ordering & Badges)"]

    W --> AFCE
    C --> AFCE
    P --> AFCE
    H --> AFCE
    AFCE -->|Rich Context Signals| CAQB
    CAQB -->|Personalized Queries| WRS
    WRS -->|Badged & Reasoned Videos| UI
```

### 3 Key Architectural Decisions

#### Decision 1: Server-Side Context Aggregation with Client Override Option
- **Design**: The backend `/learning/videos` and `/learning/context` endpoints autonomously assemble the authenticated farmer's `Crop`, `SoilProfile`, `CropHealthStatus`, and cached `Weather` data directly from PostgreSQL and internal services.
- **Advantage**: Keeps the frontend lightweight and secure. The UI simply requests recommendations without shipping heavy telemetry payloads.
- **Fallback**: Optional client query parameters (`crop_names`, `soil_type`, `weather_alert`) allow instant testing and manual overrides.

#### Decision 2: Contextual Growth Stage Estimator
Automated mathematical stage calculation based on crop calendar dates:
$$\text{Progress } \% = \frac{\text{Current Date} - \text{Sowing Date}}{\text{Harvest Date} - \text{Sowing Date}} \times 100$$

| Progress % | Growth Stage | Curated Agronomic Video Focus |
| :---: | :--- | :--- |
| **0% – 20%** | **Sowing & Seedling** | Seed treatment, germination, root development, nursery care |
| **21% – 50%** | **Vegetative Growth** | Tillering, foliage development, nitrogen top-dressing, weed management |
| **51% – 75%** | **Flowering & Reproductive** | Panicle initiation, boll formation, micronutrient spray, pest protection |
| **76% – 100%** | **Grain Filling & Pre-Harvest** | Moisture control, ripening monitoring, pre-harvest safety |
| **> 100%** | **Harvest & Post-Harvest** | Threshing, grain moisture testing, warehouse storage, mandi sales |

#### Decision 3: Dynamic Category Prioritization & Reason Badges
Categories dynamically reorder based on field urgency:
1. 🚨 **Priority #1 — Crop Health Emergency**: Active disease or pest detected in diagnostics $\rightarrow$ category #1 shifts to emergency treatment (e.g. *Cotton Pink Bollworm Control*).
2. 🌦️ **Priority #2 — Weather Advisory**: Rain $> 15\text{mm}$ or temperature $> 38^\circ\text{C}$ $\rightarrow$ category #2 becomes climate defense.
3. 🌱 **Priority #3 — Stage-Specific Guide**: Videos aligned with the active crop's mathematical growth stage.
4. 🧪 **Priority #4 — Soil Management**: Techniques specific to the plot's soil texture (Black, Alluvial, Red) and N-P-K balance.
5. 📚 **Standard Modules**: Nutrient planning, mandi price trends, government welfare schemes, modern smart tech.

---

## 🌐 Regional Multilingual Engine (9 Languages)

AgriFlow supports **9 Indian Languages** across all UI views and dynamic database content:

<div align="center">

| English | Hindi (हिन्दी) | Telugu (తెలుగు) | Tamil (தமிழ்) | Kannada (ಕನ್ನಡ) |
| :---: | :---: | :---: | :---: | :---: |
| `en` | `hi` | `te` | `ta` | `kn` |

| Marathi (मराठी) | Bengali (বাংলা) | Gujarati (ગુજરાતી) | Punjabi (ਪੰਜਾਬੀ) |
| :---: | :---: | :---: | :---: |
| `mr` | `bn` | `gu` | `pa` |

</div>

- **Single-Call Batch Translation**: High-speed JSON batch translation endpoint (`POST /api/translate`) translating up to 50 UI strings per API call.
- **Failover Chain**: Google Gemini 3.8 Flash $\rightarrow$ Groq Llama 3.3 70B fallback $\rightarrow$ Original strings.
- **In-Memory MD5 Cache**: Deterministic caching eliminates redundant API latency for frequently rendered UI labels.

---

## 📐 System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AgriFlow Users                                 │
│      🌾 Farmer      🏪 Input Shop      🏭 Mill / Processor    🛍️ Consumer    │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                  Frontend Client Tier (Next.js 16 + React 19)               │
│  - Role Portals: /farmer, /shop, /manufacturer, /customer                   │
│  - 5-Year Demo Selector & Timeline Drawer (DemoButton.tsx)                  │
│  - Interactive Docs & State Machine: /docs/architecture & /docs/api-keys    │
│  - Public Traceability Journey (/trace/[id]) & Blockchain Explorer          │
│  - Real-Time POS, Dharamkanta Slips, Gate Pass QR Generator, Leaflet Maps   │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼ (REST / JSON)
┌─────────────────────────────────────────────────────────────────────────────┐
│                 FastAPI Asynchronous Gateway & Router Layer                 │
│  - /api/auth               - /api/crops              - /api/manufacturer     │
│  - /api/orders             - /api/credit-loan        - /api/farm-calendar    │
│  - /api/crop-insurance     - /api/crop-storage       - /api/soil-profile     │
│  - /api/annual-summary     - /api/farm-reports       - /api/shop-accounting  │
│  - /crop-health            - /api/blockchain         - /api/weather          │
│  - /api/chat (RAG)         - /api/nutrition          - /api/payments         │
│  - /learning/videos        - /learning/context       - /api/translate        │
└─────────────────────────────────────────────────────────────────────────────┘
          │                   │                   │                   │
          ▼                   ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  AI / Vision     │ │  Payments Layer  │ │ Blockchain Ledger│ │ External Services│
│ Gemini 3.8 Flash │ │ Razorpay Checkout│ │ SHA-256 PoW Block│ │ Open-Meteo Weather│
│ Groq Llama 3.3   │ │ Signature Verify │ │ Trace Registry   │ │ YouTube Data v3  │
└──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
          │                   │                   │                   │
          └───────────────────┴─────────┬─────────┴───────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Persistence & Data Storage Layer                         │
│  - SQLModel / SQLAlchemy Async Engine (asyncpg / aiosqlite)                 │
│  - PostgreSQL Database (127.0.0.1:5432 / Cloud Managed)                     │
│  - 5-Year Synthetic Seeding Engine (app/seed_5year_demo.py)                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend Client
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI Primitives, Lucide Icons, Glassmorphism design language
- **Mapping & Charts**: Leaflet (SSR-safe dynamic import), Recharts
- **Audio & Media**: Web Speech API, HTML5 Canvas waveform visualizer, YouTube embedded player
- **State & Storage**: React Context API (`AuthContext`), persistent LocalStorage caches

### Backend API
- **Framework**: FastAPI (Python 3.10+), Uvicorn ASGI
- **ORM & Data**: SQLModel, SQLAlchemy 2.0 (Async), Alembic migrations
- **Database**: PostgreSQL (Production with `asyncpg`) / SQLite + `aiosqlite` (Local fallback)
- **Security & Auth**: OAuth2 Password Bearer flow, JWT (`python-jose`, `passlib`, `bcrypt`)
- **PDF Generation**: ReportLab (formal bank-ready farm financial statements)

### AI, Machine Learning & External Services
- **Multimodal Vision**: Google Gemini 3.8 Flash Vision (`google-generativeai`)
- **Conversational LLM**: Groq Cloud SDK (`llama-3.3-70b-versatile`)
- **Agricultural Videos**: YouTube Data API v3 with curated playlist fallback
- **Meteorology & Soil Telemetry**: Open-Meteo High-Resolution APIs & OpenWeatherMap
- **Geocoding**: OpenCage Geocoding API (Reverse GPS resolution)
- **Payments Gateway**: Razorpay API with server-side HMAC signature verification
- **Notifications**: Brevo HTTP API (Port 443 HTTPS email OTP) & Fast2SMS API

---

## 📂 Project Structure

```text
agri/
├── backend/
│   ├── app/
│   │   ├── routers/             # FastAPI modular endpoint routers
│   │   │   ├── auth.py          # Dual Email/Phone OTP registration & login
│   │   │   ├── crop_health.py   # Gemini 3.8 Flash Vision crop diagnosis
│   │   │   ├── learning.py      # Context-aware video learning hub
│   │   │   ├── translate.py     # Gemini & Groq 9-language batch translation
│   │   │   ├── orders.py        # Order lifecycle FSM & Razorpay checkout
│   │   │   ├── blockchain.py    # SHA-256 block mining & provenance chain
│   │   │   ├── weather.py       # Open-Meteo & OpenWeatherMap telemetry
│   │   │   ├── manufacturer.py  # Milling runs, moisture cuts, Dharamkanta
│   │   │   └── ...              # Credit, insurance, storage, reports, etc.
│   │   ├── services/            # Agronomic business logic engines
│   │   │   ├── learning_context_service.py # Multi-factor farm context aggregator
│   │   │   ├── youtube_service.py          # YouTube API query & playlist fallback
│   │   │   └── ...
│   │   ├── models/              # SQLModel database schemas
│   │   ├── database.py          # Async engine & session lifecycle
│   │   ├── deps.py              # Auth bearer token dependencies
│   │   ├── main.py              # Application entrypoint & CORS config
│   │   └── seed_5year_demo.py   # 5-Year comprehensive dataset generator
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/       # Role-segregated application portals
│   │   │   │   ├── farmer/      # Farmer operations, calendar, learning, credit
│   │   │   │   ├── shop/        # Input retailer POS, inventory, accounting
│   │   │   │   ├── manufacturer/# Milling runs, batch packing, intake queues
│   │   │   │   └── customer/    # Marketplace, shopping cart, order history
│   │   │   ├── docs/
│   │   │   │   ├── architecture/# Interactive architecture & state machine UI
│   │   │   │   └── api-keys/    # API configuration guide & key status
│   │   │   ├── trace/[id]/      # Public blockchain provenance scan view
│   │   │   ├── login/           # Multi-role authentication with demo selector
│   │   │   └── ...
│   │   ├── components/          # Reusable UI widgets (ChatBot, DemoButton, etc.)
│   │   ├── context/             # Global AuthContext provider
│   │   └── lib/                 # Demo data, API client, language registries
│   ├── package.json             # Node dependencies
│   └── tailwind.config.ts       # Tailwind CSS v4 configuration
│
├── API_KEYS_GUIDE.md            # Guide for acquiring all third-party API keys
├── DEPLOYMENT.md                # Production hosting instructions (Railway/Vercel)
├── FEATURES_AND_PLANS.md        # Feature roadmap & deep architectural decisions
└── SYSTEM_ARCHITECTURE.md       # Comprehensive 22+ module architecture spec
```

---

## ⚙️ Local Setup Guide

### 1. Prerequisites
- **Node.js**: v18.0 or higher (`node -v`)
- **Python**: v3.10 or higher (`python --version`)
- **PostgreSQL**: Running instance or local service (default port `5432`)

---

### 2. Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
```

Ensure your `backend/.env` file is populated with your credentials:
```env
# Database Connection
DATABASE_URL=postgresql+asyncpg://postgres:YourPassword@127.0.0.1:5432/agrichain

# Authentication
JWT_SECRET=your-secure-jwt-secret-key-min-32-chars

# AI & Multimodal Vision
GEMINI_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# External Video Feed
YOUTUBE_API_KEY=your_youtube_data_api_v3_key

# Payments Gateway (Test Mode)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Optional Services (Weather, Geocoding, Notifications)
OPENWEATHER_API_KEY=your_openweather_key
OPENCAGE_API_KEY=your_opencage_key
BREVO_API_KEY=your_brevo_api_key
FAST2SMS_API_KEY=your_fast2sms_api_key
```

```bash
# 5. Populate the comprehensive 5-Year Demo Dataset (2021 – 2026)
python seed_5year_demo.py

# 6. Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```
Interactive Swagger API documentation will be available at: `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
# 1. Open a new terminal and navigate to frontend
cd frontend

# 2. Install Node dependencies
npm install

# 3. Start the Next.js development server
npm run dev
```

The web application will be live at: `http://localhost:3000`

---

## ⚡ Quick Daily Run

Once installed, simply launch both services concurrently:

| Process | Directory | Command | URL |
| :--- | :--- | :--- | :--- |
| **Backend API** | `backend/` | `uvicorn app.main:app --reload --port 8000` | `http://localhost:8000/docs` |
| **Frontend UI** | `frontend/` | `npm run dev` | `http://localhost:3000` |
| **Interactive Docs** | Browser | Navigate to `/docs/architecture` | `http://localhost:3000/docs/architecture` |
| **API Keys Guide** | Browser | Navigate to `/docs/api-keys` | `http://localhost:3000/docs/api-keys` |

---

## 🧪 Testing & Verification

```bash
# Verify backend models & run 5-year seeder
python -c "import asyncio, sys; sys.path.insert(0, 'backend'); from app.seed_5year_demo import seed_5year_data; asyncio.run(seed_5year_data())"

# Compile and validate Python backend routers
python -m py_compile backend/app/routers/crop_health.py backend/app/routers/learning.py backend/app/routers/translate.py

# Type-check frontend code
cd frontend && npx tsc --noEmit
```

---

## 📖 Comprehensive Documentation Suite

| Document | Purpose |
| :--- | :--- |
| 📐 [**SYSTEM_ARCHITECTURE.md**](./SYSTEM_ARCHITECTURE.md) | Comprehensive 22+ module architecture specifications with Mermaid diagrams, data pipelines, and security rules. |
| 🗺️ [**FEATURES_AND_PLANS.md**](./FEATURES_AND_PLANS.md) | Deep dive into feature mechanics, role journeys, growth stage formulas, and dynamic prioritization rules. |
| 🔑 [**API_KEYS_GUIDE.md**](./API_KEYS_GUIDE.md) | Step-by-step instructions for acquiring and configuring all third-party API keys (Gemini, Groq, YouTube, Razorpay, etc.). |
| 🚀 [**DEPLOYMENT.md**](./DEPLOYMENT.md) | Production cloud deployment guide for Railway, Render, Fly.io, Vercel, and Docker containerization. |

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).

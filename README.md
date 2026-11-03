# 🌾 AgriFlow.AI

<div align="center">

[![FastAPI](https://img.shields.io/badge/FASTAPI-0.115+-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/NEXT.JS-16.1+-000000.svg?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/REACT-19.2+-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TAILWINDCSS-v4-38B2AC.svg?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/POSTGRESQL-16+-336791.svg?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

[![Google Gemini](https://img.shields.io/badge/GOOGLE%20GEMINI-3.8%20Flash%20Vision-4285F4.svg?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Groq](https://img.shields.io/badge/GROQ-Llama%203.3%2070B-F55036.svg?style=flat-square)](https://groq.com/)
[![YouTube](https://img.shields.io/badge/YOUTUBE%20DATA-v3-FF0000.svg?style=flat-square&logo=youtube&logoColor=white)](https://developers.google.com/youtube/v3)
[![Razorpay](https://img.shields.io/badge/RAZORPAY-Payments-2D68C4.svg?style=flat-square)](https://razorpay.com/)
[![License](https://img.shields.io/badge/LICENSE-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Enterprise-grade full-stack digital agriculture & farm-to-fork supply chain platform**

Unifying **Farmers** · **Input Shops** · **Processing Mills** · **Consumers** into one AI-powered, blockchain-auditable ecosystem

[Demo Credentials](#-5-year-demo-ecosystem-2021--2026) · [All Features](#-complete-feature-map) · [Architecture](#-system-architecture) · [Quick Start](#-quick-start)

</div>

---

## 🌟 5-Year Demo Ecosystem (2021 – 2026)

Pre-loaded with authentic multi-year data. **1-click launch** via the green `5-Yr Demo` button on login screen.

| Role | Email | Password | Key Data |
| :--- | :--- | :--- | :--- |
| 🌾 **Farmer** — Ravi Kumar Reddy, Krishna Dist. | `demo@farmer.com` | `demo123` | 14 crop cycles · ₹18.5L turnover · KCC loans · PMFBY claims · 3 soil cards |
| 🏪 **Shop** — Krishna Agro Center | `demo@shop.com` | `demo123` | 134+ orders · 15 products · 60 months P&L · Auto-decrement POS |
| 🏭 **Mill** — Sri Venkateswara Mill | `demo@manufacturer.com` | `demo123` | 120 TPD capacity · 310+ Qtl procured · 60+ batches · 210 expenses |
| 🛍️ **Customer** — Priya Sharma | `demo@customer.com` | `demo123` | 45+ orders · GST invoices · Razorpay cart checkout |

---

## 🗺️ Complete Feature Map

### 🌾 Farmer — 22 Modules

```mermaid
graph LR
    subgraph CROPS["Crop & Land Management"]
        A1["🌱 Multi-Season\nCultivation Tracker"]
        A2["💰 Expense & Revenue\nLogging"]
        A3["📊 Season vs Season\nComparison"]
        A4["📋 Annual Financial\nAudit Ledger"]
    end

    subgraph AI_INTEL["AI & Intelligence"]
        B1["🔬 Gemini 3.8 Flash\nVision Diagnosis"]
        B2["🤖 RAG Chatbot\nGroq Llama 3.3"]
        B3["🎙️ Voice Assistant\n9 Languages"]
        B4["📹 Context-Aware\nLearning Hub"]
    end

    subgraph FIELD["Field & Soil"]
        C1["🌡️ 5-Layer Soil\nMoisture Telemetry"]
        C2["🌦️ 7-Day Weather\n& Spray Advisory"]
        C3["🧪 Soil Health Card\nN-P-K · pH · ICAR Score"]
        C4["🌿 Plot Nutrition\nFertilizer Planner"]
    end

    subgraph FINANCE["Finance & Risk"]
        D1["🏦 Credit & KCC\nLoan Tracker"]
        D2["🛡️ PMFBY Crop\nInsurance Claims"]
        D3["🏬 e-NWR Cold\nStorage Tracker"]
        D4["📄 ReportLab PDF\nBank Statements"]
    end

    subgraph MARKET["Market & Sales"]
        E1["🏪 Input Shop\nMarketplace (50km)"]
        E2["🏭 Mill Direct\nSelling & Gate Pass"]
        E3["📦 Load Pooling\nCollective Selling"]
        E4["⚖️ FCI Moisture\nDeduction Calculator"]
    end

    subgraph MISC["Utilities"]
        F1["📅 Farm Activity\nCalendar"]
        F2["🚨 SOS Emergency\nDirectory"]
        F3["🔗 Blockchain\nHarvest QR"]
        F4["🟢🟡🔴 Health\nIndicator Tags"]
    end
```

### 🏪 Shop — 8 Modules

| Module | Description |
| :--- | :--- |
| 📦 **Inventory & Batch Tracking** | Product catalog with draft → active pipeline, batch-wise cost tracking, and low-stock alerts |
| 🔄 **Order Lifecycle FSM** | `pending` → `confirmed` → `dispatched` → `completed` (or `cancelled`/`rejected`) with Razorpay gating |
| ⚙️ **Auto-Confirm Engine** | 3 modes: `manual`, `auto_all`, `auto_selected` with `low_stock_buffer` safety override |
| 💳 **Omnichannel POS** | Cash, credit, digital UPI sales with customer khata ledger |
| 📊 **60-Month Accounting** | Rent, payroll, logistics, electricity — monthly & annual P&L with category breakdown |
| 📈 **Sales Analytics** | Category performance, batch-wise profit margins, channel breakdown (Cash vs Online) |
| 🏷️ **Quick Sell Interface** | Side-panel cart for rapid walk-in sales with discount and payment mode support |
| 👤 **Profile & Settings** | Shop identity, license numbers, bank details, UPI IDs, notification preferences |

### 🏭 Manufacturer / Mill — 7 Modules

| Module | Description |
| :--- | :--- |
| 🚛 **Farm-Gate Procurement** | Farmer harvest offer triage with moisture content, vehicle specs, and delivery slot scheduling |
| 🎫 **Token & Digital Gate Pass** | Sequential `TK-YYYYMMDD-XXXX` tokens with encrypted SVG QR for mill gate check-in |
| ⚖️ **Dharamkanta Weighment Slip** | Gross/Tare/Net weight recording with FCI moisture deduction and printable formal receipts |
| 🏭 **Milling Runs & Yield** | Raw grain → branded packaged output (SV Supreme Atta, SV Sharbati Rice) with conversion analysis |
| ♻️ **By-Product Recovery** | Rice Bran, Husk, Broken Rice, Mustard DOC — in-stock valuation and buyer dispatch |
| 💰 **Factory Accounting** | 5-year expense tracking: machinery maintenance, labor wages, power tariffs, transport |
| 📦 **Wholesale B2B Sales** | Bulk packaged goods distribution with order tracking |

### 🛍️ Consumer — 5 Modules

| Module | Description |
| :--- | :--- |
| 🛒 **Farm-to-Fork Marketplace** | Browse certified produce with transparent farmer pricing and blockchain provenance |
| 🛡️ **Blockchain Verified** | SHA-256 hash-chaining with PoW block explorer — organic certificates, transit hops, mill dates |
| 📱 **QR Traceability** | Scan any product QR at `/trace/[id]` for complete seed-to-shelf journey timeline |
| 💳 **Razorpay Checkout** | Cards, Netbanking, UPI, Wallets with server-side HMAC-SHA256 signature verification |
| 📋 **Order History** | Persistent tracking, GST invoices, status timeline across all historical transactions |

### 🤖 Cross-Role AI & Platform Services

```mermaid
graph LR
    subgraph AI_SERVICES["AI & Intelligence Services"]
        V["🔬 Gemini 3.8 Flash\nCrop Vision Diagnosis"]
        C["🤖 Groq Llama 3.3\nRAG Chatbot"]
        VO["🎙️ Web Speech API\nVoice Assistant"]
        T["🌐 9-Language\nBatch Translation"]
        L["📹 Context-Aware\nLearning Hub"]
    end

    subgraph PLATFORM["Platform Infrastructure"]
        BC["🔗 SHA-256\nBlockchain Ledger"]
        PAY["💳 Razorpay\nPayment Gateway"]
        WX["🌦️ Open-Meteo\nWeather + Soil"]
        GEO["📍 OpenCage\nGeocoding"]
        OTP["📧 Brevo + Fast2SMS\nOTP Notifications"]
    end
```

---

## 🌐 9 Regional Languages

<div align="center">

| `en` English | `hi` हिन्दी | `te` తెలుగు | `ta` தமிழ் | `kn` ಕನ್ನಡ | `mr` मराठी | `bn` বাংলা | `gu` ગુજરાતી | `pa` ਪੰਜਾਬੀ |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |

</div>

> Gemini 3.8 Flash → Groq Llama 3.3 fallback → MD5-cached batch translation across all UI views

---

## 📐 System Architecture

```text
  🌾 Farmer    🏪 Shop    🏭 Mill    🛍️ Consumer
       │           │          │           │
       └───────────┴────┬─────┴───────────┘
                        ▼
    ┌────────────────────────────────────────┐
    │   Next.js 16 + React 19 + Tailwind v4 │
    │   4 Role Portals · Glassmorphism UI   │
    │   Blockchain Explorer · Leaflet Maps  │
    └────────────────┬───────────────────────┘
                     ▼  REST / JSON
    ┌────────────────────────────────────────┐
    │     FastAPI Async Gateway (22+ APIs)   │
    ├────────┬──────────┬──────────┬─────────┤
    │ Gemini │ Razorpay │ SHA-256  │Open-Meteo│
    │ Groq   │ Payments │Blockchain│ YouTube │
    │ Vision │ HMAC-256 │ PoW+QR  │ Geocode │
    └────────┴────┬─────┴──────────┴─────────┘
                  ▼
    ┌────────────────────────────────────────┐
    │  PostgreSQL · SQLModel · asyncpg      │
    │  5-Year Seeder (2021-2026)            │
    └────────────────────────────────────────┘
```

> [!NOTE]
> For detailed per-module Mermaid diagrams, state machines, and data pipelines, see [**SYSTEM_ARCHITECTURE.md**](./SYSTEM_ARCHITECTURE.md).

---

## 🛠️ Tech Stack

<table>
<tr>
<td width="50%">

**Frontend**
| Tech | Purpose |
| :--- | :--- |
| Next.js 16 (App Router) | Framework & SSR |
| React 19 + TypeScript | UI Components |
| Tailwind CSS v4 | Styling & Glassmorphism |
| Recharts | Data Visualization |
| Leaflet | GPS Maps (SSR-safe) |
| Web Speech API | Voice I/O & Waveform |

</td>
<td width="50%">

**Backend**
| Tech | Purpose |
| :--- | :--- |
| FastAPI + Uvicorn | Async API Gateway |
| SQLModel + SQLAlchemy 2.0 | Async ORM |
| PostgreSQL / SQLite | Production / Local DB |
| JWT + OAuth2 + bcrypt | Auth & Security |
| ReportLab | PDF Bank Statements |
| google-generativeai | Gemini Vision SDK |

</td>
</tr>
<tr>
<td colspan="2">

**External Services**
| Service | Role |
| :--- | :--- |
| Google Gemini 3.8 Flash | Multimodal crop disease vision diagnosis |
| Groq Cloud (Llama 3.3 70B) | Conversational RAG agricultural assistant |
| YouTube Data API v3 | Context-aware farming video recommendations |
| Open-Meteo + OpenWeatherMap | 5-layer soil moisture & 7-day forecast |
| Razorpay | UPI / Card / Netbanking payment gateway |
| OpenCage | Reverse GPS geocoding (50km shop fencing) |
| Brevo + Fast2SMS | Email OTP (HTTPS P443) & SMS OTP |

</td>
</tr>
</table>

---

## 🚀 Quick Start

<table>
<tr>
<td width="50%">

**Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Configure keys
python seed_5year_demo.py    # Load 5yr demo
uvicorn app.main:app --reload --port 8000
```

</td>
<td width="50%">

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

</td>
</tr>
</table>

**Required `.env` keys:**
```env
DATABASE_URL=postgresql+asyncpg://postgres:pass@localhost:5432/agrichain
JWT_SECRET=your-secret-key
GEMINI_API_KEY=...    GROQ_API_KEY=...      YOUTUBE_API_KEY=...
RAZORPAY_KEY_ID=...   RAZORPAY_KEY_SECRET=...
```

> [!TIP]
> See [**API_KEYS_GUIDE.md**](./API_KEYS_GUIDE.md) for step-by-step instructions to get each API key.

| Process | Command | URL |
| :--- | :--- | :--- |
| Backend API | `uvicorn app.main:app --reload --port 8000` | `http://localhost:8000/docs` |
| Frontend UI | `npm run dev` | `http://localhost:3000` |

---

## 📂 Project Structure

```text
agri/
├── backend/
│   ├── app/
│   │   ├── routers/           # 22+ FastAPI endpoint routers
│   │   ├── services/          # Business logic (learning_context, youtube, etc.)
│   │   ├── models/            # SQLModel database schemas
│   │   ├── main.py            # App entrypoint & CORS
│   │   └── seed_5year_demo.py # 5-year demo data generator
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/app/
│   │   ├── dashboard/         # farmer/ · shop/ · manufacturer/ · customer/
│   │   ├── docs/              # architecture/ · api-keys/
│   │   └── trace/[id]/        # Public blockchain provenance
│   ├── src/components/        # ChatBot · DemoButton · ThemeToggle
│   └── src/lib/               # API client · demo data · i18n
├── SYSTEM_ARCHITECTURE.md     # 22+ module diagrams & state machines
├── FEATURES_AND_PLANS.md      # Feature deep-dives & design decisions
├── API_KEYS_GUIDE.md          # API key acquisition guide
└── DEPLOYMENT.md              # Railway / Vercel / Docker deployment
```

---

## 📄 License

Open-source under the [MIT License](LICENSE).

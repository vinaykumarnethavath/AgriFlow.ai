<div align="center">

<img src="frontend/public/logo.png" width="130" alt="AgriFlow Logo" style="border-radius: 20px; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);" />

# 🌾 AgriFlow.AI
### *Next-Gen Full-Stack Collaborative Agriculture & Seed-to-Fork Supply Chain Ecosystem*

[![Next.js 16](https://img.shields.io/badge/Next.js-16.1%20Turbopack-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

[![Google Gemini 3.8](https://img.shields.io/badge/Gemini%203.8-Flash%20Vision-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![Groq Llama 3.3](https://img.shields.io/badge/Groq-Llama%203.3%2070B-F55036?style=flat-square)](https://groq.com/)
[![SHA-256 Blockchain](https://img.shields.io/badge/Blockchain-SHA--256%20PoW-FFD700?style=flat-square)](https://en.wikipedia.org/wiki/Proof_of_work)
[![Razorpay Payments](https://img.shields.io/badge/Razorpay-HMAC--SHA256-2D68C4?style=flat-square)](https://razorpay.com/)
[![Open-Meteo](https://img.shields.io/badge/Open--Meteo-5--Layer%20Soil-green?style=flat-square)](https://open-meteo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

<p align="center">
  <b>Unifying Farmers, Input Shops, Processing Mills, and Consumers into a Transparent, AI-Powered, and Blockchain-Audited Agricultural Economy.</b>
</p>

[✨ Key Innovations](#-key-breakthrough-innovations) •
[🌟 5-Year Demo](#-5-year-authentic-demo-ecosystem) •
[🌾 Farmer Modules](#-farmer-portal--26-integrated-modules) •
[🏪 Shop Intelligence](#-agri-input-shop-portal--9-modules) •
[🏭 Mill Operations](#-processing-mill--manufacturer-portal--8-modules) •
[🛍️ Consumer & Traceability](#-consumer-marketplace--blockchain-traceability) •
[🏛️ Architecture](#-system-architecture) •
[⚡ Quick Start](#-quick-start-guide)

</div>

---

## 🚀 Executive Overview

**AgriFlow.AI** solves the systemic fragmentation in modern agriculture by bridging the critical divide between smallholder farmers, local input retail shops, industrial processing mills, and end consumers.

Built on an asynchronous **FastAPI** backbone and a responsive **Next.js 16 (Turbopack)** frontend, the platform features real-world innovations including **Together Cultivation (Ummadi Vyavasayam)** for tenant and partner farming, **Crop-Centric Collective Load Pooling** for smallholder mill sales, **Predictive Shop Crop Calendars** for proactive fertilizer demand forecasting, and **Proof-of-Work Blockchain Provenance** from seed to consumer shelf.

---

## ✨ Key Breakthrough Innovations

<table>
<tr>
<td width="50%" valign="top">

### 🤝 Together Cultivation (*Ummadi Vyavasayam*)
- **Collaborative Farming:** Designed for tenant farmers and partners pooling land, machinery, and labour.
- **Farmer-ID Connection:** Secure handshake via Farmer ID invite & acceptance.
- **Contributor Attribution:** Real-time expense logging tagging contributor name (`paid_by_name`) for 100% transparency.
- **Two-Phase Profit Settlement:**
  $$\text{Net Profit} = \text{Gross Sale} - \text{Total Shared Expenses}$$
  Splits net profit fairly while reimbursing out-of-pocket expenses to whoever paid them.

</td>
<td width="50%" valign="top">

### 🌾 Land Tenancy & Lease Tracking
- **Owned vs Leased Plots:** Comprehensive management of leased farmlands.
- **Contract Terms:** Records landlord details, lease amounts, duration, and rental due dates.
- **Auto-Expense Deductions:** Leased lands automatically generate recurring lease expenses in the seasonal crop ledger for accurate cost-of-production calculations.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🚛 Crop-Centric Collective Selling (Load Pooling)
- **Active Crop Integration:** Directly embedded in individual active crop detail pages (`/dashboard/farmer/crops/[id]`).
- **Harvest Countdown Sync:** Aligns pool readiness with live crop harvest dates.
- **Full Truckload Economics:** Combines 10–30 quintal smallholder harvests into 100+ quintal truckloads to unlock direct mill bulk pricing and cut transport costs by up to 40%.
- **Fair Trade Calculator:** Instant FCI-standard moisture cut & deduction calculations.

</td>
<td width="50%" valign="top">

### 🏪 Shop Phenology & Fertilizer Demand Forecast
- **50km Catchment Radar:** Aggregates regional standing crops across all registered farmer plots.
- **Predictive Input Demand:** Computes upcoming fertilizer needs (Basal DAP, Vegetative Urea, Flowering Potash) for crops entering critical stages in the next 1–3 weeks.
- **Intelligent Stage Filtering:** Automatically removes harvested crops or crops past fertilization stages, keeping shop stocking insights 100% actionable.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🏭 Mill Token System & Dharamkanta Weighment
- **Digital Farm-Gate Procurement:** Review harvest offers with moisture ratings and vehicle specs.
- **Sequential Token & Gate Pass:** Generates cryptographic `TK-YYYYMMDD-XXXX` digital tokens and SVG QR Gate Passes.
- **Electronic Dharamkanta Slip:** Captures Gross, Tare, and Net weight with automatic moisture deductions and print-ready receipts.
- **By-Product Valuation:** Live tracking of Rice Bran, Husk, Broken Rice, and Oil Cake yields.

</td>
<td width="50%" valign="top">

### ⛓️ Seed-to-Fork Blockchain Traceability
- **PoW SHA-256 Ledger:** Immutable cryptographic block explorer linking soil cards, inputs, harvest dates, and transit hops.
- **Public Verification (`/trace/[id]`):** Consumers scan on-package QR codes to view the complete verified lifecycle without logging in.
- **Dual Payment Rails:** Razorpay HMAC-SHA256 digital checkout + Deferred Farmer Khata settlement.

</td>
</tr>
</table>

---

## 🌟 5-Year Authentic Demo Ecosystem

The platform comes pre-seeded with **5 years of authentic agricultural data (2021 – 2026)** across all 4 roles. Launch with **1-click** using the green **`5-Yr Demo`** button on the login screen.

```text
  🌾 Farmer Portal          🏪 Shop Portal          🏭 Mill Portal          🛍️ Consumer Portal
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Ravi Kumar Reddy │    │Krishna Agro Ctr  │    │Sri Venkateswara  │    │   Priya Sharma   │
│ demo@farmer.com  │    │ demo@shop.com    │    │demo@manufacturer │    │ demo@customer.com│
│ Pass: demo123    │    │ Pass: demo123    │    │ Pass: demo123    │    │ Pass: demo123    │
└──────────────────┘    └──────────────────┘    └──────────────────┘    └──────────────────┘
  • 14 Crop Seasons       • 134+ POS Orders       • 120 TPD Capacity      • 45+ B2C Orders
  • 3 Soil Health Cards   • 60-Month P&L          • 310+ Qtl Procured     • GST Invoices
  • KCC Loans & PMFBY     • Auto-Confirm POS      • Weighment Slips       • Blockchain QRs
```

---

## 🗺️ Complete Feature Map

### 🌾 Farmer Portal — 26 Integrated Modules

```mermaid
graph LR
    subgraph FarmOps ["🌱 Field & Cultivation"]
        A1[Multi-Season Crops] --> A2[Together Cultivation]
        A2 --> A3[Land Tenancy & Lease]
        A3 --> A4[Interactive Calendar]
    end

    subgraph FarmFin ["💰 Financial & Risk Management"]
        B1[Expense & Revenue Ledger] --> B2[KCC Institutional Credit]
        B2 --> B3[PMFBY Calamity Claims]
        B3 --> B4[e-NWR Cold Storage]
        B4 --> B5[ReportLab PDF Statements]
    end

    subgraph FarmAI ["🤖 AI & Agronomy"]
        C1[Gemini 3.8 Flash Vision] --> C2[Groq Llama 3.3 Chatbot]
        C2 --> C3[9-Language Voice Assistant]
        C3 --> C4[Soil Health Card / ICAR]
        C4 --> C5[5-Layer Soil Moisture]
    end

    subgraph FarmMarket ["⚖️ Market & Logistics"]
        D1[50km Input Shop Mart] --> D2[Mill Direct Selling]
        D2 --> D3[Crop Load Pooling]
        D3 --> D4[FCI Moisture Deduction]
    end
```

| Domain | Key Modules & Capabilities |
| :--- | :--- |
| 🌱 **Crops & Tenancy** | **Multi-Season Tracker** · **Together Cultivation ("Ummadi Vyavasayam")** · **Land Tenancy (Owned vs Rented)** · **Season vs Season AI Comparison** · **Crop Health Indicator Tags (🟢🟡🔴)** |
| 🤖 **AI & Agronomy** | **Gemini 3.8 Flash Vision Diagnosis** (instant leaf pathology & chemical cures) · **Groq Llama 3.3 70B RAG** · **9-Language Voice Assistant with Waveform** · **Context-Aware YouTube Video Hub** |
| 🧪 **Soil & Weather** | **5-Layer Volumetric Soil Moisture (Open-Meteo)** · **7-Day Weather & Spray Advisory** · **Soil Health Card (ICAR Radar)** · **Plot-Specific N-P-K Fertilizer Calculator** |
| 💳 **Finance & Risk** | **Institutional Credit & KCC Loans** · **PMFBY 72-Hr Calamity Claims** · **e-NWR Certified Cold Storage** · **Annual Financial Audit** · **ReportLab Bank Statements** |
| ⚖️ **Market & Logistics** | **50km Input Shop Marketplace** · **Mill Direct Selling & Token Gate Pass** · **Crop-Centric Collective Selling (Load Pooling)** · **Fair Moisture & Cut Calculator** |
| 🚨 **Safety & Community** | **Priority 3-Box SOS Emergency Calling** (Krishi Vigyan Kendra, Agronomist, Ambulance) · **Farmer Community Forum** · **Agri News & Mandi Prices** |

---

### 🏪 Agri-Input Shop Portal — 9 Modules

| Module | Description |
| :--- | :--- |
| 📅 **Predictive Crop Calendar** | Analyzes 50km standing crops, forecasting **exact fertilizer demand in the next 1–3 weeks** while filtering out harvested plots. |
| 📦 **Inventory & Batch Pipeline** | Manage product catalog with draft → active stages, batch cost tracking, expiration monitoring, and low-stock alerts. |
| ⚙️ **Auto-Confirm Order Engine** | Configurable order fulfillment with 3 automation modes (`manual`, `auto_all`, `auto_selected`) and buffer safety checks. |
| 💳 **Omnichannel POS & Khata** | Process cash, UPI, and credit sales with instant farmer khata ledger tracking. |
| 🔄 **Order Lifecycle FSM** | State transition engine: `pending` → `confirmed` → `dispatched` → `completed` with Razorpay gating. |
| 💬 **Farmer Real-Time Chat** | Integrated order-tied messaging modal for immediate order coordination and delivery updates. |
| 📊 **60-Month Accounting Ledger** | Comprehensive P&L tracking: shop rent, staff wages, freight, electricity, with monthly and yearly analytics. |
| 📈 **Sales Margin Analytics** | Margin breakdown by brand, category, batch, and payment rail (Cash vs Digital). |
| 👤 **Store Profile & Licensing** | Fertilizer, pesticide, and seed dealer license records, GSTIN, bank details, and notification triggers. |

---

### 🏭 Processing Mill / Manufacturer Portal — 8 Modules

| Module | Description |
| :--- | :--- |
| 🚛 **Farm-Gate Procurement** | Review farmer harvest offers with moisture readings, vehicle registration, and scheduled delivery slots. |
| 🎫 **Token & Digital Gate Pass** | Sequential `TK-YYYYMMDD-XXXX` pass generation with encrypted SVG QR code for gate check-in. |
| ⚖️ **Dharamkanta Weighment Slip** | Gross, tare, and net weighment capture with automated FCI quality deductions and print-ready receipts. |
| 🏭 **Milling Runs & Yield** | Raw paddy/grain milling cycles into branded packaged goods (Atta, Basmati, Samba Masoori) with yield recovery tracking. |
| ♻️ **By-Product Recovery** | Value and inventory secondary yields: Rice Bran, Husk, Broken Grain, Mustard DOC, and de-oiled cakes. |
| 💰 **Industrial P&L Accounting** | Factory cost ledger: machinery maintenance, labor shifts, industrial power tariffs, and logistics. |
| 📦 **Wholesale B2B Distribution** | Manage wholesale dispatch, distributor billing, and high-volume purchase contracts. |
| 👤 **Mill Certification & Compliance** | Milling capacity management (TPD), storage silo specs, FSSAI certificates, and GST filings. |

---

### 🛍️ Consumer Marketplace & Blockchain Traceability

| Module | Description |
| :--- | :--- |
| 🛒 **Farm-to-Fork Marketplace** | Direct consumer sourcing of verified organic, non-GMO produce with transparent farmer earnings. |
| 🛡️ **Proof-of-Work Blockchain** | Native Python SHA-256 blockchain ledger maintaining an immutable audit trail of every harvest batch. |
| 📱 **Public QR Verification (`/trace/[id]`)** | Public trace route displaying interactive timeline: seed date, farm location, input logs, mill processing, and retail delivery. |
| 💳 **Razorpay Payment Gateway** | Bank-grade payment flow supporting UPI, Cards, Netbanking, with server-side HMAC-SHA256 signature verification. |
| 🧾 **Persistent Order Invoices** | Complete purchase history with downloadable GST-compliant invoices and live delivery tracking. |
| 🔍 **Smart Buying & Price Trends** | Historical price comparison graphs and nutritional certification badges. |

---

## 🏛️ System Architecture

```text
 🌾 Farmer Clients      🏪 Shop Clients       🏭 Mill Clients      🛍️ Consumer Clients
 [React 19 / PWA]      [React 19 / POS]      [React 19 / Mill]     [React 19 / Cart]
        │                     │                     │                     │
        └─────────────────────┼─────────────────────┴─────────────────────┘
                              ▼ HTTPS / JSON
             ┌─────────────────────────────────────────────────┐
             │       Next.js 16 Web Tier (Turbopack)           │
             │   • 63 Static/Dynamic Routes  • SSR & SSG       │
             │   • Indic Script Fallbacks    • Glassmorphism   │
             └────────────────────────┬────────────────────────┘
                                      ▼ RESTful API
 ┌─────────────────────────────────────────────────────────────────────────────────────┐
 │                       FastAPI Asynchronous Gateway (Python 3.12)                    │
 │                                                                                     │
 │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
 │  │ Auth & JWT (22+)│  │ Crops & Tenancy │  │ Mill & Gatepass │  │ POS & Orders   │  │
 │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └────────────────┘  │
 │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
 │  │ Gemini 3.8 AI   │  │ Groq Llama 3.3  │  │ SHA-256 PoW     │  │ Razorpay HMAC  │  │
 │  └─────────────────┘  └─────────────────┘  └─────────────────┘  └────────────────┘  │
 └────────────────────────────────────────┬────────────────────────────────────────────┘
                                          ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────┐
 │                         Persistence & Storage Infrastructure                        │
 │                                                                                     │
 │   🐘 PostgreSQL 16+ (SQLModel / asyncpg)       📁 Local / Persistent Object Storage │
 │   • Multi-Tenant User Profiles                 • Leaf Disease Diagnostic Photos     │
 │   • 5-Year Authentic Seeder (2021-2026)        • Land Lease Contracts & Gate Passes │
 │   • SHA-256 Block Chains & Slips               • Soil Health Card Scans             │
 └─────────────────────────────────────────────────────────────────────────────────────┘
```

> [!NOTE]
> For complete per-module sequence diagrams, entity-relationship models, and security threat specifications, see [**SYSTEM_ARCHITECTURE.md**](./SYSTEM_ARCHITECTURE.md).

---

## 🌐 9 Regional Indian Languages

AgriFlow.AI breaks literacy and language barriers with native support for **9 Indian languages**, featuring single-call batch translation, MD5 caching, and an Indic font stack:

<div align="center">

| English | हिन्दी (Hindi) | తెలుగు (Telugu) | தமிழ் (Tamil) | ಕನ್ನಡ (Kannada) |
| :---: | :---: | :---: | :---: | :---: |
| `en` | `hi` | `te` | `ta` | `kn` |

| मराठी (Marathi) | বাংলা (Bengali) | ગુજરાતી (Gujarati) | ਪੰਜਾਬੀ (Punjabi) |
| :---: | :---: | :---: | :---: |
| `mr` | `bn` | `gu` | `pa` |

</div>

> ⚡ **Dynamic Fallback:** Powered by Google Gemini 3.8 Flash with Groq Llama 3.3 failover, delivering instant, localized agricultural terminology across all screens.

---

## 🛠️ Complete Tech Stack

<table>
<tr>
<th width="33%">Frontend Stack</th>
<th width="33%">Backend Stack</th>
<th width="34%">External Integrations</th>
</tr>
<tr>
<td valign="top">

- **Framework:** Next.js 16.1 (App Router, Turbopack)
- **Library:** React 19.2 + TypeScript
- **Styling:** Tailwind CSS v4, Lucide Icons
- **Visuals:** Recharts, Glassmorphism UI
- **Maps:** Leaflet + React-Leaflet (SSR-safe)
- **Audio:** Web Speech API & Waveform Canvas
- **Typography:** CDN Preconnected Indic Noto Sans

</td>
<td valign="top">

- **Framework:** FastAPI (Async/Await)
- **ASGI Server:** Uvicorn
- **ORM:** SQLModel & SQLAlchemy 2.0 Async
- **Database:** PostgreSQL (asyncpg) / SQLite Local
- **Auth:** OAuth2 Password Bearer, JWT, bcrypt
- **PDF Engine:** ReportLab
- **Blockchain:** Pure Python SHA-256 Proof-of-Work

</td>
<td valign="top">

- **Vision AI:** Google Gemini 3.8 Flash Vision
- **RAG LLM:** Groq Cloud (Llama 3.3 70B Versatile)
- **Payments:** Razorpay API (HMAC-SHA256)
- **Soil & Weather:** Open-Meteo & OpenWeatherMap
- **Video:** YouTube Data API v3
- **Geocoding:** OpenCage Geocoder API
- **OTP:** Brevo HTTPS Port 443 + Fast2SMS

</td>
</tr>
</table>

---

## ⚡ Quick Start Guide

### Prerequisites
- **Python:** 3.11 or 3.12
- **Node.js:** 18.x or 20.x
- **PostgreSQL:** 15+ (or run SQLite locally for quick evaluation)

---

### 1. Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# 5. Populate 5-Year Authentic Demo Data
python seed_5year_demo.py

# 6. Launch Backend Server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: **`http://localhost:8000/docs`**

---

### 2. Frontend Setup

```bash
# 1. Navigate to frontend in a new terminal
cd frontend

# 2. Install dependencies
npm install

# 3. Launch Development Server (Turbopack)
npm run dev
```
Web Application will be live at: **`http://localhost:3000`**

---

### 3. Key Environment Variables (`backend/.env`)

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/agriflow

# Security & JWT
JWT_SECRET=super-secret-jwt-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# Artificial Intelligence
GEMINI_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_...

# Payments & Media
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
YOUTUBE_API_KEY=AIzaSy...

# Geocoding & Weather
OPENCAGE_API_KEY=...
OPENWEATHERMAP_API_KEY=...
```

> [!TIP]
> Need help obtaining API keys? Follow our complete step-by-step tutorial in [**API_KEYS_GUIDE.md**](./API_KEYS_GUIDE.md).

---

## 📁 Repository Structure

```text
agri/
├── backend/
│   ├── app/
│   │   ├── models/            # SQLModel Database Schemas (Crops, User, Orders, Mills, etc.)
│   │   ├── routers/           # 37 RESTful API Routers (Auth, Gemini, Groq, Orders, Pools, etc.)
│   │   ├── services/          # Business Logic (Blockchain, OCR, Video Feed, Notifications)
│   │   ├── main.py            # FastAPI Entrypoint & CORS Configuration
│   │   └── database.py        # Async Engine & Session Generators
│   ├── seed_5year_demo.py     # Authentic 2021-2026 Multi-Year Ecosystem Seeder
│   └── requirements.txt       # Python Dependencies
├── frontend/
│   ├── public/                # Static Assets & Brand Logo
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/     # 4 Role Dashboards (Farmer, Shop, Manufacturer, Customer)
│   │   │   ├── trace/[id]/    # Public Blockchain Seed-to-Fork Provenance View
│   │   │   ├── layout.tsx     # Global Layout with Preconnected Indic Webfonts
│   │   │   └── globals.css    # Tailwind v4 Styles & Typography Fallbacks
│   │   ├── components/        # Reusable UI, Glassmorphic Cards, Charts & POS Modals
│   │   ├── context/           # Auth, Language & Demo State Providers
│   │   └── lib/               # API Clients, Razorpay Helpers & Geocoding
│   └── package.json           # Node Dependencies & Build Scripts
├── API_KEYS_GUIDE.md          # Visual Guide for Third-Party API Keys
├── SYSTEM_ARCHITECTURE.md     # Deep-Dive 1200+ Line Architecture & Mermaid Diagrams
└── README.md                  # Master Project Overview
```

---

## 🤝 Contributing

Contributions are warmly welcomed! Please read our contribution workflow:
1. **Fork the Repository**
2. **Create a Feature Branch:** `git checkout -b feature/AmazingFeature`
3. **Commit your Changes:** `git commit -m 'feat: add AmazingFeature'`
4. **Push to the Branch:** `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

<div align="center">
  <sub>Built with ❤️ for Indian Agriculture and Smallholder Farmers Worldwide.</sub>
</div>

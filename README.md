# AgriFlow AI (AgriChain)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.1+-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?style=flat&logo=tailwind_css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Groq AI](https://img.shields.io/badge/Groq-Llama%203.2%20%2F%203.3-F55036.svg?style=flat)](https://groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**AgriFlow AI** is an enterprise-grade, full-stack digital agriculture and farm-to-fork supply chain platform. It unifies four vital agricultural stakeholders — **Farmers**, **Input & Fertilizer Retailers**, **Grain Processing Mills / Manufacturers**, and **Retail Consumers** — into a unified, cryptographically auditable, and AI-powered operational ecosystem.

The platform comes pre-packaged with a **5-Year Comprehensive Demo Ecosystem (2021 – 2026)**, allowing developers, stakeholders, and reviewers to instantly explore multi-year crop cycles, historical shop accounting ledgers, industrial milling runs, and consumer orders with zero setup.

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
- **Fair Moisture & Weighbridge Deduction Calculator**: Scientific FCI-standard moisture deduction formula ($W_{std} = W_{act} \times \frac{100 - M_{act}}{100 - M_{std}}$) protecting farmers against arbitrary Mandi/Mill weight cuts on Paddy, Wheat, Maize, and Soybeans.
- **Digital Gate Pass & QR Token Allocation**: Reserve intake queue slots (Morning, Afternoon, Evening) with vehicle info (Tractor, Mini Truck, 10-Wheeler) and tamper-proof SVG QR gate passes.
- **Small-Farmer Collective Selling (Load Pooling Hub)**: Aggregate smallholder harvests (10–25 Qtl) into commercial 10-ton truckloads, eliminating middleman commission haircuts.
- **Soil Moisture & Agro-Meteorological Intelligence (Open-Meteo)**: Volumetric soil water content telemetry across 5 root depth layers (0–1cm, 1–3cm, 3–9cm, 9–27cm, 27–81cm), 7-day agricultural forecasts, ET₀ evapotranspiration rates, and automated spray advisories.
- **Crop Health Indicator (🟢🟡🔴) & AI Vision Diagnosis**: Leaf disease recognition powered by Llama 3.2 Vision on Groq and Hugging Face, returning immediate pathology diagnostics and chemical treatment guidance.
- **Institutional Farm Report Generator (PDF)**: Download official bank-ready financial reports for Kisan Credit Card (KCC) renewal, equipment financing, and PMFBY claims.
- **Soil Profile & Government Soil Health Card (SHC)**: Track Available N-P-K, pH, Organic Carbon %, and micronutrients with ICAR fertility benchmark scores (0–100).
- **Post-Harvest Produce Storage (e-NWR)**: Cold storage and warehouse deposit tracking with dynamic monthly rent calculations and mandi peak price release alerts.
- **Hands-Free Multilingual Voice Assistant & Chatbot**: Interactive agronomic voice assistant with live wave audio feedback supporting 9 regional languages.

### 2. 🏪 Input Shop & Retail POS
- **Inventory Management with Auto-Decrement**: Dynamic product catalog across seeds, fertilizers, and crop protection inputs. Product inventory quantities automatically deduct upon order confirmation.
- **Order Lifecycle State Machine**: Full lifecycle tracking (`pending` ➔ `confirmed` ➔ `dispatched` ➔ `completed`, or `cancelled`/`rejected`) shared synchronously between farmer and shop dashboards.
- **60-Month Accounting Ledger**: Apportioned rent, payroll, logistics, electricity, and shop overhead expenses categorized for real-time monthly and annual P&L reporting.
- **Omnichannel POS**: Process cash, credit, and digital UPI sales with customer ledger management.

### 3. 🏭 Grain Processing Mill & Industrial Manufacturing
- **Direct Farm Gate Procurement**: Create procurement contracts, schedule batch intakes, and record farmer arrivals.
- **Official Digital Weighment Slip (Dharamkanta Receipt / Parchi)**: Record Gross, Tare, Net Harvest Weight, and FCI moisture cut breakdown with printable formal receipts.
- **Industrial Milling Runs & Production Batches**: Convert raw paddy/grain into branded packaged outputs (SV Supreme Atta, SV Sharbati Rice) with yield analysis.
- **By-Product Inventory & Secondary Recovery**: Manage secondary milling outputs (Rice Bran, Husk, Broken Rice, Mustard DOC) with in-stock valuation and buyer dispatch tracking.
- **Factory Accounting**: Dedicated 5-year operational expense tracking for machinery maintenance, labor wages, power tariffs, and bulk transport.

### 4. 🛍️ Consumer Marketplace & Public Traceability
- **Direct Farm-to-Fork Marketplace**: Browse farm-fresh fruits, vegetables, and mill-packaged grains with transparent farmer pricing.
- **Immutable Blockchain Ledger**: SHA-256 cryptographic hash-chaining and Proof-of-Work (PoW) block explorer verifying organic certificates, mill processing dates, and transit hops.
- **Public QR Traceability (`/trace/[id]`)**: Scan any retail product QR code to view its provenance timeline from seed sowing to supermarket shelf.
- **Consumer Order History & Invoices**: Persistent order tracking, invoice generation, and status timeline.

### 5. 💳 Razorpay Payments Integration
- Secure checkout flow for farm inputs and retail groceries.
- Supports Cards, Netbanking, Wallets, and configurable UPI modes with server-side signature verification.

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
│  - /api/crop-health        - /api/blockchain         - /api/weather          │
│  - /api/chat (RAG)         - /api/nutrition          - /api/payments         │
└─────────────────────────────────────────────────────────────────────────────┘
          │                   │                   │                   │
          ▼                   ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  AI / RAG Layer  │ │  Payments Layer  │ │ Blockchain Ledger│ │ External Services│
│ Groq Llama 3.2   │ │ Razorpay Checkout│ │ SHA-256 PoW Block│ │ Open-Meteo Weather│
│ Hugging Face Vis │ │ Signature Verify │ │ Trace Registry   │ │ Fast2SMS & Brevo │
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

### Frontend
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI Primitives, Lucide Icons
- **Mapping & Charts**: Leaflet (SSR-safe), Recharts
- **Audio & Media**: Web Speech API, Canvas Audio Visualizers

### Backend
- **Framework**: FastAPI (Python 3.10+), Uvicorn ASGI
- **ORM & Data**: SQLModel, SQLAlchemy 2.0 (Async), Alembic
- **Database**: PostgreSQL (Production) / SQLite + aiosqlite (Local fallback)
- **Security & Auth**: OAuth2 Password Flow, JWT (`python-jose`, `passlib`, `bcrypt`)
- **AI & ML**: Groq SDK (Llama 3.2 11B Vision & Llama 3.3 70B Versatile), Hugging Face Inference API
- **External Integrations**: Open-Meteo, Razorpay SDK, OpenCage Geocoder, Fast2SMS, Brevo

---

## ⚙️ Local Setup Guide

### 1. Prerequisites
- **Node.js**: v18.0 or higher (`node -v`)
- **Python**: v3.10 or higher (`python --version`)
- **PostgreSQL**: Running instance or local service

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
# Copy .env.example to .env and configure your DB connection:
cp .env.example .env
```

Ensure your `.env` contains your database connection string and optional API keys:
```env
DATABASE_URL=postgresql+asyncpg://postgres:YourPassword@127.0.0.1:5432/agrichain
JWT_SECRET=your-secure-jwt-secret-key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GROQ_API_KEY=your_groq_api_key
```

```bash
# 5. Populate the comprehensive 5-Year Demo Dataset (2021 - 2026)
python seed_5year_demo.py

# 6. Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at: `http://localhost:8000/docs`

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

Once installed, simply start both servers in separate terminals:

| Process | Directory | Command | URL |
| :--- | :--- | :--- | :--- |
| **Backend API** | `backend/` | `uvicorn app.main:app --reload --port 8000` | `http://localhost:8000/docs` |
| **Frontend UI** | `frontend/` | `npm run dev` | `http://localhost:3000` |

---

## 🧪 Testing & Verification

```bash
# Test backend models & 5-year seeder
python -c "import asyncio, sys; sys.path.insert(0, 'backend'); from app.seed_5year_demo import seed_5year_data; asyncio.run(seed_5year_data())"

# Lint frontend code
npm --prefix frontend run lint
```

---

## 📖 Additional Documentation
- [System Architecture Specification](./SYSTEM_ARCHITECTURE.md) — Detailed box-and-arrow data flow diagrams for all 22+ modules.
- [Deployment Guide](./DEPLOYMENT.md) — Production hosting steps for Railway, Render, Vercel, and Docker.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).

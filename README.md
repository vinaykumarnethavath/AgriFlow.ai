# AgriFlow AI

AgriFlow AI is a full-stack web application for agriculture supply-chain and farm operations. It provides role-based modules (farmer, manufacturer, customer/shop) for managing crops, products, orders, analytics, and AI-assisted workflows (RAG chatbot), with optional integrations for payments and external data sources (weather/market/news).

### Features

- **Role-based access for real users**
  - Separate custom experiences for Farmers, Fertiliser Shops, Processing Mills, and Customers.
- **Farm operations management**
  - Manage crop records, farming logs, and status updates during the cultivation seasons.
- **Product and order lifecycle**
  - Create listings, confirm orders, handle bulk stocks, and track progress along the supply chain.
- **Real-time style dashboards**
  - High-performance analytics endpoints powering active dashboards for crop sales and store revenues.
- **Shop accounting support**
  - Apportioned logistics cost tracking, wage/labor allocations, and automated shop accounting ledgers.
- **Payments (real-world checkout)**
  - Razorpay-based billing integration with verification checkpoints.
- **AI assistant (RAG chatbot)**
  - Context-aware chatbot trained on farm regulations and agronomic guides.
- **AI Crop Disease Diagnosis**
  - Direct analysis of crop leaf images utilizing Llama 3.2 Vision models to diagnose pest/fungus infections and prescribe pesticide recommendations.
- **Hands-Free Voice Assistant**
  - Highly interactive voice command parser with live wave audio feedback supporting multi-lingual navigation, logs registry, and settings toggling.
- **Multilingual Support (Localization)**
  - System-wide language switching across English, Hindi, Telugu, Tamil, Kannada, Marathi, Gujarati, Punjabi, and Bengali.
- **Precision Crop Nutrition Guidance**
  - Specialized calculators recommending customized fertilizer combinations and schedules according to target soil conditions.
- **Farmer Community Chat Hub**
  - Collaborative channel threads enabling real-time communications and messaging amongst farmers.
- **Procurement & Processing Portal**
  - Advanced manufacturer suite tracking raw procurement transactions, production runs, waste levels, and processing efficiencies.
- **Learning & Video Guides**
  - Integrated playlists and video resources covering modern agritech and smart farming practices.
- **Live External Insights**
  - Instant weather forecasts, mandi market prices, and agriculture news endpoints for real-time operational awareness.
- **Immutable Blockchain Ledger**
  - Cryptographically secured supply chain traceability using SHA-256 hash chaining and proof-of-work mining to guarantee organic certifications and fair-trade verifications.
- **Soil Moisture & Meteorological Intelligence (Open-Meteo Integration)**
  - High-resolution volumetric soil water content telemetry across 5 root depth layers (0–1cm surface topsoil, 1–3cm shallow seedling roots, 3–9cm active crop feeding zone, 9–27cm deep taproot zone, and 27–81cm deep subsoil reserve).
  - Direct 7-day agricultural forecasts with rainfall sum (mm), high/low daily temperatures, weather icons, and soil moisture estimates.
  - Automatic geolocation detection with farmer profile geocoding fallback.
  - Reference crop evapotranspiration (ET₀ mm) water loss calculations and 10m wind speed metrics.
  - Smart Farmer Advisory engine with automated recommendations for irrigation planning, heatwave defense, frost protection, fungal risk management, and spray suitability.
  - Historical ERA5-Land reanalysis archive querying for comparing seasonal trends.
- **Interactive Geo-Analysis Mapping**
  - SSR-safe Leaflet mapping integration with OpenStreetMap tiles, click-to-analyze coordinates, and on-field GPS resolution.
- **Enhanced Authentication & Single-Page Flow**
  - Interactive password show/hide toggle (`PasswordInput`) across all auth and profile forms.
  - Single-page, zero-scroll responsive layout for login and registration.
  - Selector-based dark mode tokens (`@custom-variant dark`) ensuring crystal-clear readability and contrast in outdoor and high-sunlight conditions.



## Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                           Users                              │
│  - Farmer                                                     │
│  - Fertiliser Shop                                            │
│  - Mills / Manufacturers                                      │
│  - Retail Customers                                           │
└──────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                        Frontend UI                           │
│        (Next.js + React + TypeScript + TailwindCSS)           │
│  - Role-based screens & Dashboards                            │
│  - Chatbot Assistant (RAG)                                    │
│  - Soil Moisture & Weather Dashboard (Open-Meteo)            │
│  - Leaflet Geo-Analysis Mapping                              │
│  - public/trace/[id] (QR Traceability Journey Verification)   │
│  - dashboard/blockchain (Ledger Explorer & Integrity Audit)  │
└──────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                       FastAPI Backend                         │
│              (backend/app/main.py + routers/)                 │
│  - API Routers: auth, crops, products, orders, analytics,    │
│    traceability, blockchain, rag, payments, weather, etc.     │
│  - Service Orchestration Layer (app/services/*)               │
└──────────────────────────────────────────────────────────────┘
         │               │               │               │
         ▼               ▼               ▼               ▼
┌────────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
│ AI / RAG Layer ││   Payments   ││  Blockchain  ││   External   │
│ (rag_service)  ││  (Razorpay)  ││ (Ledger PoW) ││   Insights   │
│ (Vision AI)    ││              ││              ││ (Open-Meteo) │
└────────────────┘└──────────────┘└──────────────┘└──────────────┘
         │               │               │               │
         ▼               ▼               ▼               ▼
┌──────────────────────────────────────────────────────────────┐
│                         Data Layer                           │
│         (SQLModel / SQLAlchemy Async Core Engine)            │
│  - Database Tables: users, crops, products, orders, etc.      │
│  - Blockchain Block Registry Table (blockchain_blocks)        │
└──────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                 PostgreSQL / SQLite Database                 │
│  - Persists all relational records & ledger blocks securely   │
└──────────────────────────────────────────────────────────────┘
```


## Tech Stack

### Frontend

- Next.js (`next`)
- React
- TypeScript
- TailwindCSS (Tailwind v4 with `@custom-variant dark`)
- Leaflet & `@types/leaflet`
- Lucide React
- Axios
- Zod
- Radix UI primitives

### Backend

- FastAPI
- Uvicorn
- SQLModel
- SQLAlchemy (async)
- Alembic
- JWT/Auth libs: `python-jose`, `pyjwt`, `passlib`, `bcrypt`
- Async DB drivers: `aiosqlite`, `asyncpg`
- Integrations: Razorpay, Open-Meteo (Forecast, Geocoding & Historical ERA5-Land)
- Env management: `python-dotenv`, `pydantic-settings`
- AI: Groq SDK (Llama 3.2 Vision & LPU Inference)

### Database

- PostgreSQL

## Local Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL database

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   Copy `.env.example` to `.env` and fill in the required values, especially `DATABASE_URL`.
   ```bash
   cp .env.example .env
   ```
5. Initialize the database and run seeds (optional but recommended):
   ```bash
   python force_init_db.py
   python seed_data.py
   ```
6. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

The application should now be running at `http://localhost:3000` (frontend) and `http://localhost:8000` (backend API).

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Future Scope

- **Real-time market + weather intelligence**
  - Continuous updates and alerts for price changes, rainfall forecasts, and extreme weather.
- **Multiple API integrations**
  - Connect more sources (government advisories, mandi prices by region, satellite/weather providers).
- **AI crop health detection**
  - Upload field images to detect diseases, nutrient deficiency, and pest risk.
- **AI recommendations**
  - Personalized crop planning, fertilizer/pesticide guidance, and irrigation scheduling.
- **Smart notifications for farmers and shops**
  - Real-time order/payment updates, reminders, and actionable farm alerts.
- **Predictive analytics**
  - Yield prediction, demand forecasting, and price trend prediction.

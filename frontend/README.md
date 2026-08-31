# AgriFlow AI — Frontend Web Client 🌾

The modern, responsive web application for AgriFlow AI built with **Next.js 16 (Turbopack)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**.

---

## 🛠️ Key Capabilities

- **Role-Based Workspaces**:
  - 🚜 **Farmer**: Crop lifecycle management, expenses & harvest recording, plot nutrition, AI disease diagnosis, voice navigation, and direct soil moisture & weather telemetry.
  - 🏪 **Input Retailer / Shop**: Batch inventory tracking, GPS-fenced 50km store catalog, expense-weighted cost apportionment, POS walk-in sales.
  - 🏭 **Processor / Mill**: Raw produce intake, conversion & wastage logging, branded retail QR packaging.
  - 🛒 **Customer**: Farm-to-fork store, digital checkout (Razorpay / COD), public blockchain verification portal (`/trace/[id]`).
- **Soil Moisture & Weather Intelligence**:
  - Multi-depth root moisture gauges (0–1cm, 1–3cm, 3–9cm, 9–27cm, 27–81cm).
  - 7-day agricultural forecasts, ET₀ evapotranspiration water loss, and automated farmer advisory tips.
  - Interactive Leaflet map with auto-geolocation.
- **Multilingual Support**:
  - Live localization switcher across 9 languages (English, Telugu, Hindi, Tamil, Kannada, Punjabi, Marathi, Gujarati, Bengali).
- **Accessibility & Design**:
  - Glassmorphic, high-contrast dark/light mode theme with selector-based dark mode (`@custom-variant dark`).
  - Compact single-page login and registration forms with show/hide password toggles.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in this directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 📂 Project Structure

```text
frontend/src/
├── app/                      # Next.js App Router (pages & layouts)
│   ├── dashboard/            # Role-specific workspaces (farmer, shop, manufacturer, customer)
│   │   ├── farmer/           # Crops, nutrition, market, weather, learning, profile
│   │   ├── shop/             # Inventory, accounting, orders, profile
│   │   ├── manufacturer/     # Intake, processing, batches, orders
│   │   └── customer/         # Store, cart, orders
│   ├── login/                # Authentication & role selection
│   ├── register/             # Unified single-page registration
│   ├── trace/[id]/           # Consumer blockchain QR journey explorer
│   └── globals.css           # Tailwind v4 theme tokens & dark-mode variant
├── components/               # Modular UI & Feature Components
│   ├── layout/               # Header, Sidebar, Bottom Navigation
│   ├── weather/              # SoilWeatherDashboard, SoilMap
│   ├── ui/                   # Reusable UI primitives (Button, Card, PasswordInput, etc.)
│   ├── voice/                # Hands-free voice assistant chip & microphone feedback
│   └── LanguageSelector.tsx  # Multilingual dropdown
├── context/                  # React Contexts (Language, Auth, Theme)
├── lib/                      # API client (Axios), payment SDK, and utility helpers
└── locales/                  # Translation JSON dictionary bundles
```

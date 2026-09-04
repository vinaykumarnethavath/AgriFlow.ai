# AgriFlow System Architecture & Data Flow Specification

This document details the complete end-to-end architecture of **AgriFlow**, breaking down each feature, subsystem, backend router, database model, and external integration with clean box-and-arrow diagrams.

---

## 1. Global High-Level System Architecture

```mermaid
graph TD
    subgraph ClientTier ["Frontend Client Tier (Next.js 16 + React + TailwindCSS)"]
        UI_Farmer["Farmer Dashboard"]
        UI_Shop["Input Shop Dashboard"]
        UI_Mill["Manufacturer Dashboard"]
        UI_Customer["Customer Marketplace"]
        UI_Trace["Public QR Traceability"]
        UI_Auth["Auth & Onboarding Portal"]
        UI_Docs["Developer Documentation"]
    end

    subgraph APIGateway ["API Layer (FastAPI Asynchronous Gateway)"]
        Router_Auth["Auth Router (/api/auth)"]
        Router_Crops["Crops & Farmer Router (/api/crops)"]
        Router_Nutrition["Soil Nutrition Router (/api/nutrition)"]
        Router_Weather["Weather Router (/api/weather)"]
        Router_Chat["AI Chat & Voice Router (/api/chat)"]
        Router_CropHealth["Crop Health Router (/api/crop-health)"]
        Router_Blockchain["Blockchain Router (/api/blockchain)"]
        Router_Orders["Orders & Payments Router (/api/orders)"]
        Router_Shop["Shop Accounting Router (/api/shop-accounting)"]
        Router_News["News & Prices Router (/api/news)"]
        Router_Learning["Learning Router (/api/learning)"]
        Router_Translate["Translation Router (/api/translate)"]
    end

    subgraph DataStorage ["Data & Persistence Layer"]
        PG_DB[("PostgreSQL Database\n(via asyncpg & SQLModel)")]
        Local_FS[("Persistent File System\n(/uploads leaf & cert photos)")]
    end

    subgraph ExternalServices ["External Third-Party APIs"]
        Ext_Brevo["Brevo HTTP API\n(Email OTP over Port 443)"]
        Ext_Fast2SMS["Fast2SMS API\n(SMS OTP for +91 numbers)"]
        Ext_Groq["Groq Cloud\n(Llama 3.3 LLM Inference)"]
        Ext_Weather["OpenWeatherMap API\n(Live 5-Day Weather)"]
        Ext_OpenCage["OpenCage Geocoder\n(GPS to Location Name)"]
        Ext_News["NewsAPI\n(Agri News & Mandi Prices)"]
        Ext_Razorpay["Razorpay\n(Payments & Checkout)"]
        Ext_YouTube["YouTube Data API v3\n(Farming Video Feed)"]
        Ext_HF["Hugging Face API\n(Crop Disease Vision Model)"]
    end

    UI_Farmer --> APIGateway
    UI_Shop --> APIGateway
    UI_Mill --> APIGateway
    UI_Customer --> APIGateway
    UI_Trace --> APIGateway
    UI_Auth --> APIGateway

    APIGateway --> PG_DB
    APIGateway --> Local_FS

    Router_Auth --> Ext_Brevo
    Router_Auth --> Ext_Fast2SMS
    Router_Chat --> Ext_Groq
    Router_Weather --> Ext_Weather
    Router_Weather --> Ext_OpenCage
    Router_News --> Ext_News
    Router_Orders --> Ext_Razorpay
    Router_Learning --> Ext_YouTube
    Router_CropHealth --> Ext_HF
```

---

## 2. Authentication & Identity Management Architecture

```mermaid
graph LR
    subgraph FrontendPages ["Frontend Views"]
        Page_Register["Registration Form\n(Email or Phone OTP)"]
        Page_Login["Login Portal\n(Role Selector + Password/OTP)"]
        Page_Forgot["Forgot Password Form\n(Reset Request)"]
        Page_Verify["OTP Verification Screen\n(6-Digit Validation)"]
        Page_Reset["Password Reset Form\n(New Password Entry)"]
    end

    subgraph AuthRouter ["FastAPI Auth Router (/api/auth)"]
        EP_SendRegOTP["POST /send-registration-otp\n(Generate & Dispatch)"]
        EP_VerifyRegOTP["POST /verify-registration-otp\n(Pre-check Code)"]
        EP_Register["POST /register\n(User Record Creation)"]
        EP_Login["POST /login\n(Verify Creds & Return JWT)"]
        EP_Forgot["POST /forgot-password\n(Issue Reset OTP)"]
        EP_VerifyOTP["POST /verify-otp\n(Validate Reset OTP)"]
        EP_Reset["POST /reset-password\n(Hash & Store New Pass)"]
    end

    subgraph Dispatchers ["Delivery Dispatchers"]
        Mail_Util["mail_utils._send_email()\n1. Brevo HTTP (Port 443)\n2. Resend HTTP (Port 443)\n3. Gmail SMTP (Port 465)"]
        SMS_Util["sms_utils.send_otp_sms()\nFast2SMS OTP Route"]
    end

    subgraph DatabaseTables ["Database Tables"]
        T_User[("User\n(id, email, phone, role, hashed_password)")]
        T_EmailOTP[("EmailVerificationOTP\n(email, role, otp_code, expires_at, is_verified)")]
        T_PhoneOTP[("PhoneOTP\n(phone_number, otp_code, expires_at, is_verified)")]
        T_UserOTP[("UserOTP\n(email, otp_code, expires_at, is_verified)")]
    end

    Page_Register --> EP_SendRegOTP
    Page_Register --> EP_VerifyRegOTP
    Page_Register --> EP_Register
    Page_Login --> EP_Login
    Page_Forgot --> EP_Forgot
    Page_Verify --> EP_VerifyOTP
    Page_Reset --> EP_Reset

    EP_SendRegOTP --> Mail_Util
    EP_SendRegOTP --> T_EmailOTP
    EP_VerifyRegOTP --> T_EmailOTP
    EP_Register --> T_EmailOTP
    EP_Register --> T_User

    EP_Forgot --> Mail_Util
    EP_Forgot --> SMS_Util
    EP_Forgot --> T_UserOTP
    EP_Forgot --> T_PhoneOTP

    EP_VerifyOTP --> T_UserOTP
    EP_VerifyOTP --> T_PhoneOTP

    EP_Reset --> T_User
    EP_Login --> T_User
```

---

## 3. Blockchain Provenance & Product Traceability

```mermaid
graph TD
    subgraph FarmerActions ["Farmer Origin"]
        F_Harvest["Farmer Logs Harvest\n(Crop, Variety, Plot, Date)"]
        F_Cert["Organic / Fair-Trade Cert\n(Mining Cert Block)"]
    end

    subgraph MillActions ["Manufacturer Processing"]
        M_Procure["Procure Grain Batch\n(Link Farmer Block)"]
        M_Mill["Milling & Packaging\n(Output Batch ID)"]
    end

    subgraph StoreActions ["Retail & Distribution"]
        S_Stock["Shop Stocks Bag\n(Assign Product Batch)"]
        S_QR["Generate QR Trace Code"]
    end

    subgraph BlockchainCore ["Blockchain Engine (app/routers/blockchain.py)"]
        B_Mine["mine_block()\n1. Collect Prev Hash\n2. Compute Merkle & Nonce\n3. Calculate SHA-256 Hash\n4. Commit Block"]
        B_Verify["verify_chain_integrity()\nDetect tampering or corrupted hashes"]
        B_Genesis["init_genesis_block()"]
    end

    subgraph PublicTracePage ["Public Verification View"]
        P_Scan["Consumer Scans QR on Bag\n(Seed-to-Shelf Provenance)"]
        P_Timeline["Interactive Provenance Timeline\nFarmer -> Soil -> Weather -> Mill -> Store"]
        P_Badge["LEDGER SECURE / TAMPERED Alert"]
    end

    subgraph DB_Block ["Storage"]
        T_Blocks[("blockchain_blocks\n(index, timestamp, data,\nprevious_hash, hash, nonce)")]
    end

    F_Harvest --> B_Mine
    F_Cert --> B_Mine
    M_Procure --> B_Mine
    M_Mill --> B_Mine
    S_Stock --> B_Mine

    B_Mine --> T_Blocks
    B_Verify --> T_Blocks
    B_Genesis --> T_Blocks

    P_Scan --> B_Verify
    P_Scan --> T_Blocks
    T_Blocks --> P_Timeline
    B_Verify --> P_Badge
```

---

## 4. AI Crop Health & Leaf Disease Diagnosis

```mermaid
graph LR
    subgraph FrontendUI ["Farmer Diagnostic View"]
        Comp_Upload["AICropDiagnosis Component\n(File Picker / Camera Drag & Drop)"]
        Comp_Results["Diagnosis View\n(Disease Name, Confidence %,\nSymptoms, Chemical & Organic Cures)"]
    end

    subgraph BackendEndpoints ["Backend Endpoints"]
        EP_Upload["POST /api/upload/image\n(Save file to local /uploads)"]
        EP_Diagnose["POST /api/crop-health/diagnose\n(Process image tensor)"]
    end

    subgraph AIModelPipeline ["AI Vision Pipeline"]
        Preprocess["Resize & Normalize (224x224)\nImage Tensor Conversion"]
        HF_Inference["Hugging Face Vision API\n(Crop Disease ResNet / ViT)"]
        Fallback_Rules["Rule-Based Agricultural Knowledge\n(Crop Leaf Symptom Heuristic)"]
        Remedy_DB["Curated Treatment Database\n(Organic Neem / Fungicide / Fertilizer)"]
    end

    subgraph StorageEngine ["Storage & Logs"]
        FS_Uploads["Persistent Disk: /uploads/leaves/"]
        T_CropDiag[("crop_disease_logs\n(crop_name, disease, confidence, image_url)")]
    end

    Comp_Upload --> EP_Upload
    EP_Upload --> FS_Uploads
    Comp_Upload --> EP_Diagnose

    EP_Diagnose --> Preprocess
    Preprocess --> HF_Inference
    HF_Inference -. If Timeout / No Key .-> Fallback_Rules
    HF_Inference --> Remedy_DB
    Fallback_Rules --> Remedy_DB
    Remedy_DB --> T_CropDiag
    Remedy_DB --> Comp_Results
```

---

## 5. Conversational RAG AI Assistant & Voice Interface

```mermaid
graph TD
    subgraph UserInterface ["Interactive Components"]
        UI_Chat["ChatBot Component (Text View)"]
        UI_Voice["VoiceAssistant Component (Speech View)\n(Mic Recording + Web Speech API)"]
    end

    subgraph BackendRouter ["Chat & Voice Routers (/api/chat, /api/voice)"]
        EP_Voice["POST /api/voice/process-audio\n(Audio Transcription & Intent)"]
        EP_Chat["POST /api/chat/message\n(Contextual RAG Chat)"]
        EP_History["GET /api/chat/history\n(Load User Chat Threads)"]
    end

    subgraph RAGContextEngine ["RAG Context Construction (app/routers/rag.py)"]
        Context_User["User Metadata\n(Role, Location District, Land Size)"]
        Context_Crops["Current Active Crops\n(Wheat, Rice, Tomato)"]
        Context_Weather["Live Weather for User's City\n(Rainfall, Humidity, Temperature)"]
        Context_AgriPrompt["Agricultural Expert System Prompt\n(Bilingual / Hinglish / Regional rules)"]
    end

    subgraph ExternalLLM ["Groq Cloud Inference Engine"]
        LLM_Model["Llama 3.3 70B Versatile\n(Fast Token Generation < 200ms)"]
    end

    subgraph DB_Chat ["Chat Persistence"]
        T_Messages[("chat_messages\n(user_id, role, content, timestamp)")]
    end

    UI_Voice --> EP_Voice
    UI_Chat --> EP_Chat
    UI_Chat --> EP_History

    EP_Voice --> EP_Chat
    EP_Chat --> Context_User
    EP_Chat --> Context_Crops
    EP_Chat --> Context_Weather
    EP_Chat --> Context_AgriPrompt

    Context_AgriPrompt --> LLM_Model
    LLM_Model --> T_Messages
    T_Messages --> UI_Chat
    LLM_Model --> UI_Voice
```

---

## 6. Real-Time Weather Forecast & Farming Micro-Advisory

```mermaid
graph LR
    subgraph WeatherPage ["Farmer Weather View"]
        View_Current["Current Weather Card\n(Temp, Wind, Humidity, Cloud Cover)"]
        View_Forecast["5-Day Forecast Chart\n(Day-by-Day Rain Probability & Temperatures)"]
        View_Advisory["Farming Spray & Irrigation Advisory\n(Optimal pesticide spraying hours, frost warnings)"]
    end

    subgraph WeatherRouter ["FastAPI Weather Router (/api/weather)"]
        EP_GetWeather["GET /api/weather/forecast\n(lat, lon or city_name)"]
        EP_Geocode["GET /api/location/reverse-geocode\n(GPS Coordinates to City/State)"]
    end

    subgraph WeatherAPIs ["External Integrations"]
        API_OpenWeather["OpenWeatherMap API\n(/data/2.5/forecast & /weather)"]
        API_OpenCage["OpenCage Geocoding API\n(Reverse Geocode GPS to Village/District)"]
    end

    subgraph WeatherCache ["In-Memory TTL Cache"]
        Mem_Cache["30-Minute Cache\n(Prevents API Rate Limits)"]
    end

    WeatherPage --> EP_GetWeather
    WeatherPage --> EP_Geocode

    EP_Geocode --> API_OpenCage
    EP_GetWeather --> Mem_Cache
    Mem_Cache -. Cache Miss .-> API_OpenWeather
    API_OpenWeather --> Mem_Cache

    EP_GetWeather --> View_Current
    EP_GetWeather --> View_Forecast
    EP_GetWeather --> View_Advisory
```

---

## 7. Soil Health, N-P-K Nutrition & Plot Management

```mermaid
graph TD
    subgraph NutritionPages ["Farmer Nutrition & Crops Module"]
        P_Nutrition["Soil Nutrition Dashboard\n(Soil N-P-K Radar, Fertilizer Recommendations)"]
        P_Plot["Crop Management View\n(Plot Acreage, Sowing Date, Harvest Timeline)"]
    end

    subgraph NutritionRouter ["FastAPI Nutrition Router (/api/nutrition)"]
        EP_GetPlots["GET /api/plot-nutrition\n(Retrieve all plots for user)"]
        EP_SavePlot["POST /api/plot-nutrition\n(Log Plot Nitrogen, Phosphorus, Potassium, pH)"]
        EP_FertCalc["POST /api/nutrition/calculate-plan\n(Compute Urea, DAP, MOP kilograms needed)"]
    end

    subgraph AgroCalculationEngine ["Fertilizer Recommendation Algorithm"]
        Target_Deficit["Compute Deficit = Target_Nutrient - Soil_Test_Level"]
        Fert_Ratio["Map to Fertilizer Types:\nNitrogen -> Urea (46% N)\nPhosphorus -> DAP (18% N, 46% P2O5)\nPotassium -> MOP (60% K2O)"]
        Water_Schedule["Irrigation Timing & Application Splits"]
    end

    subgraph DB_Nutrition ["Database Tables"]
        T_Plots[("plot_nutrition\n(plot_name, nitrogen, phosphorus, potassium, ph, organic_carbon)")]
        T_Crops[("crops\n(crop_name, variety, sowing_date, harvest_date, acreage)")]
    end

    P_Nutrition --> EP_GetPlots
    P_Nutrition --> EP_SavePlot
    P_Nutrition --> EP_FertCalc

    EP_GetPlots --> T_Plots
    EP_SavePlot --> T_Plots
    EP_FertCalc --> Target_Deficit
    Target_Deficit --> Fert_Ratio
    Fert_Ratio --> Water_Schedule
    Water_Schedule --> P_Nutrition
```

---

## 8. Learning Hub & Agricultural Video Tutorials

```mermaid
graph LR
    subgraph LearningUI ["Learning Hub View"]
        Search_Bar["Smart Search Bar\n(Query by crop, pest, season)"]
        Lang_Filter["Language Tabs\n(All, Hindi, Telugu, Tamil, English)"]
        Video_Grid["Video Cards & Video Player Modal\n(YouTube Embedded Player)"]
        Liked_List["Locally Saved Videos\n(Browser LocalStorage)"]
    end

    subgraph LearningRouter ["FastAPI Learning Router (/api/learning)"]
        EP_Videos["GET /api/learning/videos\n(query, language, max_results)"]
        EP_Fallback["Curated Fallback Registry\n(Guaranteed High-Yield Agriculture Playlists)"]
    end

    subgraph Ext_YouTubeEngine ["YouTube Data API v3"]
        YT_Search["GET /youtube/v3/search\n(type=video, q=farming+query, relevanceLanguage)"]
    end

    Search_Bar --> EP_Videos
    Lang_Filter --> EP_Videos
    EP_Videos --> YT_Search
    YT_Search -. On Quota Exceeded .-> EP_Fallback
    YT_Search --> Video_Grid
    EP_Fallback --> Video_Grid
    Video_Grid --> Liked_List
```

---

## 9. Input Retail Shop & Ledger Accounting

```mermaid
graph TD
    subgraph ShopUI ["Shop Operations Views"]
        UI_Inv["Inventory Management\n(Seeds, Fertilizers, Sprays, Stock Alert)"]
        UI_Acc["Financial Accounting\n(Cash Sales, Credit Ledger, Profit/Loss)"]
        UI_Cust["Customer Khata Book\n(Farmer Balances & Credit Dues)"]
    end

    subgraph ShopRouter ["FastAPI Shop Router (/api/shop-accounting)"]
        EP_Products["GET / POST / PUT /api/products\n(Product Catalog & Stock Quantity)"]
        EP_Txns["GET / POST /api/shop-accounting/transactions\n(Credit / Debit Entry)"]
        EP_Ledger["GET /api/shop-accounting/summary\n(Total Receivables, Monthly Revenue)"]
    end

    subgraph DB_Shop ["Database Tables"]
        T_Prod[("products\n(id, shop_id, name, category, price, stock_quantity, unit)")]
        T_ShopTxn[("shop_transactions\n(id, shop_id, customer_name, customer_phone, amount, type, notes)")]
    end

    UI_Inv --> EP_Products
    UI_Acc --> EP_Txns
    UI_Cust --> EP_Ledger

    EP_Products --> T_Prod
    EP_Txns --> T_ShopTxn
    EP_Ledger --> T_ShopTxn
```

---

## 10. Manufacturer & Mill Processing Pipeline

```mermaid
graph LR
    subgraph MillUI ["Manufacturer Operations Views"]
        UI_Procure["Procurement Intake\n(Raw Grain Intake from Farmers)"]
        UI_Prod["Milling & Production\n(Milling, Processing & Packaging)"]
        UI_Dist["Sales & Distribution\n(Distribution to Input Shops & Retail)"]
    end

    subgraph MillRouter ["FastAPI Manufacturer Router (/api/manufacturer)"]
        EP_Intake["POST /api/manufacturer/batches/intake\n(Record Weight, Moisture %, Purchase Price)"]
        EP_Process["POST /api/manufacturer/batches/process\n(Conversion: Raw Paddy -> Polished Rice)"]
        EP_Package["POST /api/manufacturer/batches/package\n(Create Retail Bags with Unique Batch IDs)"]
    end

    subgraph BlockLink ["Blockchain Integration"]
        BC_MineBlock["mine_block()\nImprints Batch Transformation onto Ledger"]
    end

    subgraph DB_Mill ["Database Tables"]
        T_Batches[("manufacturer_batches\n(id, farmer_id, raw_crop, weight_kg, processed_weight, status)")]
    end

    UI_Procure --> EP_Intake
    UI_Prod --> EP_Process
    UI_Dist --> EP_Package

    EP_Intake --> T_Batches
    EP_Process --> T_Batches
    EP_Package --> T_Batches
    EP_Package --> BC_MineBlock
```

---

## 11. Customer Marketplace, Cart & Razorpay Payments

```mermaid
graph TD
    subgraph CustomerUI ["Customer Shopping Views"]
        UI_Market["Marketplace Catalog\n(Browse Certified Produce, Filter by Category)"]
        UI_Cart["Cart Management\n(Quantity Selector & Summary)"]
        UI_Orders["Customer Orders View\n(Track Delivery, QR Trace Link, Receipt)"]
    end

    subgraph OrderRouter ["FastAPI Orders & Payments (/api/orders, /api/payments)"]
        EP_CreateOrder["POST /api/orders\n(Validate Stock & Create Pending Order)"]
        EP_RazorpayOrder["POST /api/payments/razorpay/create-order\n(Initialize Razorpay Order ID)"]
        EP_VerifyPayment["POST /api/payments/razorpay/verify\n(Verify HMAC SHA-256 Payment Signature)"]
        EP_ListOrders["GET /api/orders/my-orders\n(Fetch Customer Purchase History)"]
    end

    subgraph ExternalPaymentGateway ["Razorpay Gateway"]
        RZ_Modal["Razorpay Checkout Popup (JS)\n(UPI / Google Pay / NetBanking / Cards)"]
        RZ_Server["Razorpay Server Validation\n(Order Status: Paid)"]
    end

    subgraph DB_Orders ["Database Tables"]
        T_Orders[("orders\n(id, customer_id, total_amount, payment_status, delivery_status, items_json)")]
        T_Items[("products\n(Deduct stock_quantity upon confirmation)")]
    end

    UI_Market --> UI_Cart
    UI_Cart --> EP_CreateOrder
    EP_CreateOrder --> EP_RazorpayOrder
    EP_RazorpayOrder --> RZ_Modal
    RZ_Modal --> EP_VerifyPayment
    EP_VerifyPayment --> RZ_Server
    EP_VerifyPayment --> T_Orders
    EP_VerifyPayment --> T_Items
    T_Orders --> UI_Orders
```

---

## 12. Multilingual Regional Translation Engine

```mermaid
graph LR
    subgraph UIComponents ["UI Translation Elements"]
        Lang_Selector["LanguageSelector Component\n(English, Hindi, Telugu, Tamil, Kannada, Marathi)"]
        UI_Labels["Static UI Tokens (t('common.save'), etc.)\n(Loaded from frontend/src/locales/)"]
        Dynamic_Text["TranslateText Component\n(Dynamic DB content: crop advice, news, chatbot)"]
    end

    subgraph TranslateRouter ["FastAPI Translation Router (/api/translate)"]
        EP_Translate["POST /api/translate\n(text, target_language, source_language)"]
        Dict_Cache["In-Memory Translation Dictionary\n(Pre-compiled common agricultural vocabulary)"]
        Fallback_Translator["Online Translation Fallback\n(Translates paragraphs preserving formatting)"]
    end

    Lang_Selector --> UI_Labels
    Dynamic_Text --> EP_Translate
    EP_Translate --> Dict_Cache
    Dict_Cache -. If Uncached Phrase .-> Fallback_Translator
    Fallback_Translator --> Dynamic_Text
```

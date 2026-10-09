from sqlmodel import SQLModel, create_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker

import os
from dotenv import load_dotenv

load_dotenv()

import app.models  # noqa: F401

from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from sqlalchemy import text

# Default to SQLite if no DATABASE_URL is set; support Railway DATABASE_PUBLIC_URL as fallback
raw_db_url = os.getenv("DATABASE_URL") or os.getenv("DATABASE_PUBLIC_URL") or "sqlite+aiosqlite:///./agrichain.db"
DATABASE_URL = raw_db_url.strip()

# Railway provides DATABASE_URL starting with postgres:// but SQLAlchemy asyncpg needs postgresql+asyncpg://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

is_sqlite = DATABASE_URL.startswith("sqlite")

db_echo_env = os.getenv("DB_ECHO", "false")
db_echo = db_echo_env.strip().lower() in {"1", "true", "yes"}

engine_kwargs = {
    "echo": db_echo,
    "future": True,
}

if is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_size"] = 20
    engine_kwargs["max_overflow"] = 10
    engine_kwargs["pool_recycle"] = 300

    # asyncpg does not accept sslmode query parameter (e.g. ?sslmode=require).
    # Strip it from query params and pass ssl in connect_args to avoid TypeError.
    try:
        parsed = urlparse(DATABASE_URL)
        if parsed.query:
            query_params = parse_qs(parsed.query)
            sslmode_val = None
            if "sslmode" in query_params:
                sslmode_val = query_params.pop("sslmode")[0]
            new_query = urlencode(query_params, doseq=True)
            DATABASE_URL = urlunparse((
                parsed.scheme,
                parsed.netloc,
                parsed.path,
                parsed.params,
                new_query,
                parsed.fragment,
            ))
            if sslmode_val:
                engine_kwargs.setdefault("connect_args", {})
                if sslmode_val.lower() == "disable":
                    engine_kwargs["connect_args"]["ssl"] = False
                else:
                    engine_kwargs["connect_args"]["ssl"] = True
    except Exception as parse_err:
        print(f"[database] Warning: Failed to parse query params from DATABASE_URL: {parse_err}")

engine = create_async_engine(DATABASE_URL, **engine_kwargs)

# Module-level sessionmaker factory to avoid recreation overhead per HTTP request
async_session_maker = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
        
    # Safely migrate new columns and performance indexes on existing database tables
    migration_statements = [
        # Farmer profile migrations
        "ALTER TABLE farmerprofile ADD COLUMN IF NOT EXISTS phone_number VARCHAR",
        "ALTER TABLE farmerprofile ADD COLUMN IF NOT EXISTS gender VARCHAR",
        "ALTER TABLE farmerprofile ADD COLUMN IF NOT EXISTS relation_type VARCHAR",
        "ALTER TABLE farmerprofile ADD COLUMN IF NOT EXISTS upi_id VARCHAR",
        "ALTER TABLE farmerprofile ADD COLUMN IF NOT EXISTS secondary_phone VARCHAR",
        "ALTER TABLE farmerprofile ADD COLUMN IF NOT EXISTS irrigation_type VARCHAR",
        "ALTER TABLE farmerprofile ADD COLUMN IF NOT EXISTS primary_crop VARCHAR",
        "ALTER TABLE farmerprofile ADD COLUMN IF NOT EXISTS preferred_language VARCHAR",
        "ALTER TABLE farmerprofile ADD COLUMN IF NOT EXISTS notification_preferences VARCHAR",
        
        # Customer profile migrations
        "ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR",
        
        # Shop profile migrations
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS contact_number VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS owner_name VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS relation_type VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS shop_id VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS pan_number VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS hide_personal_details BOOLEAN DEFAULT FALSE",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS shop_address VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS landmark VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS permanent_address VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS perm_house_no VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS perm_street VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS perm_village VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS perm_mandal VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS perm_district VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS perm_state VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS perm_pincode VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS location_text VARCHAR",

        # Mill profile migrations
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS contact_number VARCHAR",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS owner_name VARCHAR",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS relation_type VARCHAR",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS mill_id VARCHAR",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS mill_type VARCHAR DEFAULT 'Rice Mill'",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS crops_accepted VARCHAR DEFAULT 'Paddy, Rice, Wheat'",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS price_offered_text VARCHAR DEFAULT '₹2,200 - ₹2,500/Quintal'",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS daily_capacity VARCHAR DEFAULT '100 Tons/Day'",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS rating FLOAT DEFAULT 4.8",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS permanent_address VARCHAR",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS perm_house_no VARCHAR",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS perm_street VARCHAR",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS perm_village VARCHAR",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS perm_mandal VARCHAR",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS perm_district VARCHAR",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS perm_state VARCHAR",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS perm_pincode VARCHAR",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS location_text VARCHAR",

        # Product migrations
        "ALTER TABLE product ADD COLUMN IF NOT EXISTS short_name VARCHAR",
        "ALTER TABLE product ADD COLUMN IF NOT EXISTS manufacturer VARCHAR",
        "ALTER TABLE product ADD COLUMN IF NOT EXISTS cost_price FLOAT",
        "ALTER TABLE product ADD COLUMN IF NOT EXISTS quantity_per_unit FLOAT",
        "ALTER TABLE product ADD COLUMN IF NOT EXISTS measure_unit VARCHAR DEFAULT 'kg'",
        "ALTER TABLE product ADD COLUMN IF NOT EXISTS product_image_url VARCHAR",
        "ALTER TABLE product ADD COLUMN IF NOT EXISTS main_composition VARCHAR",
        "ALTER TABLE product ADD COLUMN IF NOT EXISTS manufacture_date TIMESTAMP",
        "ALTER TABLE product ADD COLUMN IF NOT EXISTS low_stock_threshold INT DEFAULT 10",
        "ALTER TABLE product ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP",
        "ALTER TABLE product ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'draft'",
        "ALTER TABLE product ADD COLUMN IF NOT EXISTS apportioned_transport FLOAT DEFAULT 0.0",
        "ALTER TABLE product ADD COLUMN IF NOT EXISTS apportioned_labour FLOAT DEFAULT 0.0",
        "ALTER TABLE product ADD COLUMN IF NOT EXISTS apportioned_other FLOAT DEFAULT 0.0",

        # Shop Orders migrations
        "ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS total_expenses FLOAT DEFAULT 0.0",
        "ALTER TABLE shop_orders ADD COLUMN IF NOT EXISTS profit FLOAT DEFAULT 0.0",

        # Chat and Mill Procurement migrations
        "ALTER TABLE chatmessage ADD COLUMN IF NOT EXISTS media_type VARCHAR",
        "ALTER TABLE mill_procurement_requests ADD COLUMN IF NOT EXISTS delivery_slot_date VARCHAR",
        "ALTER TABLE mill_procurement_requests ADD COLUMN IF NOT EXISTS delivery_slot_time VARCHAR",
        "ALTER TABLE mill_procurement_requests ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR",
        "ALTER TABLE mill_procurement_requests ADD COLUMN IF NOT EXISTS vehicle_number VARCHAR",
        "ALTER TABLE mill_procurement_requests ADD COLUMN IF NOT EXISTS token_number VARCHAR",
        "ALTER TABLE manufacturer_purchases ADD COLUMN IF NOT EXISTS payment_mode VARCHAR DEFAULT 'bank_transfer'",
        
        # Performance Indexes (correct column names)
        "CREATE INDEX IF NOT EXISTS idx_mill_proc_req_mill_id ON mill_procurement_requests(mill_id)",
        "CREATE INDEX IF NOT EXISTS idx_mill_proc_req_farmer_id ON mill_procurement_requests(farmer_id)",
        "CREATE INDEX IF NOT EXISTS idx_mill_proc_req_status ON mill_procurement_requests(status)",
        "CREATE INDEX IF NOT EXISTS idx_byproducts_batch_id ON by_products(batch_id)",
        "CREATE INDEX IF NOT EXISTS idx_weighment_purchase_id ON weighment_slips(purchase_id)",
        "CREATE INDEX IF NOT EXISTS idx_load_pools_mill_id ON farmer_load_pools(preferred_mill_id)",
        "CREATE INDEX IF NOT EXISTS idx_load_pools_status ON farmer_load_pools(status)",
        "CREATE INDEX IF NOT EXISTS idx_load_pool_members_pool_id ON farmer_load_pool_members(pool_id)",
        "CREATE INDEX IF NOT EXISTS idx_load_pool_members_farmer_id ON farmer_load_pool_members(farmer_id)",
        "CREATE INDEX IF NOT EXISTS idx_farmerprofile_user_id ON farmerprofile(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_landrecord_farmer_profile_id ON landrecord(farmer_profile_id)",
        "CREATE INDEX IF NOT EXISTS idx_product_user_id ON product(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_product_category ON product(category)",
        "CREATE INDEX IF NOT EXISTS idx_product_status ON product(status)",
        "CREATE INDEX IF NOT EXISTS idx_shop_orders_shop_id ON shop_orders(shop_id)",
        "CREATE INDEX IF NOT EXISTS idx_shop_orders_farmer_id ON shop_orders(farmer_id)",
        "CREATE INDEX IF NOT EXISTS idx_shop_orders_created_at ON shop_orders(created_at)",
        "CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(status)",
        "CREATE INDEX IF NOT EXISTS idx_shop_order_items_order_id ON shop_order_items(order_id)",
        "CREATE INDEX IF NOT EXISTS idx_shop_order_items_product_id ON shop_order_items(product_id)",
        "CREATE INDEX IF NOT EXISTS idx_shop_expenses_order_id ON shop_expenses(order_id)",
        "CREATE INDEX IF NOT EXISTS idx_crop_user_id ON crop(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_crop_status ON crop(status)",
        "CREATE INDEX IF NOT EXISTS idx_cropexpense_crop_id ON cropexpense(crop_id)",
        "CREATE INDEX IF NOT EXISTS idx_cropharvest_crop_id ON cropharvest(crop_id)",
        "CREATE INDEX IF NOT EXISTS idx_cropsale_crop_id ON cropsale(crop_id)",
    ]
    async with engine.connect() as conn:
        for stmt in migration_statements:
            try:
                await conn.execute(text(stmt))
                await conn.commit()
            except Exception:
                try:
                    await conn.rollback()
                    sqlite_stmt = stmt.replace(" IF NOT EXISTS", "")
                    await conn.execute(text(sqlite_stmt))
                    await conn.commit()
                except Exception:
                    await conn.rollback()

async def get_session() -> AsyncSession:
    async with async_session_maker() as session:
        yield session

from sqlmodel import SQLModel, create_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker

import os
from dotenv import load_dotenv

load_dotenv()

# Default to SQLite if no DATABASE_URL is set
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./agrichain.db")

# Railway provides DATABASE_URL starting with postgres:// but SQLAlchemy asyncpg needs postgresql+asyncpg://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

from sqlalchemy import text

db_echo_env = os.getenv("DB_ECHO", "false")
db_echo = db_echo_env.strip().lower() in {"1", "true", "yes"}

is_sqlite = DATABASE_URL.startswith("sqlite")
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
        "ALTER TABLE farmerprofile ADD COLUMN IF NOT EXISTS phone_number VARCHAR",
        "ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR",
        "ALTER TABLE shop_profiles ADD COLUMN IF NOT EXISTS contact_number VARCHAR",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR",
        "ALTER TABLE mill_profiles ADD COLUMN IF NOT EXISTS contact_number VARCHAR",
        "ALTER TABLE chatmessage ADD COLUMN IF NOT EXISTS media_type VARCHAR",
        # Performance Indexes
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
    for stmt in migration_statements:
        try:
            async with engine.begin() as conn:
                await conn.execute(text(stmt))
        except Exception:
            try:
                sqlite_stmt = stmt.replace(" IF NOT EXISTS", "")
                async with engine.begin() as conn:
                    await conn.execute(text(sqlite_stmt))
            except Exception:
                pass

async def get_session() -> AsyncSession:
    async with async_session_maker() as session:
        yield session

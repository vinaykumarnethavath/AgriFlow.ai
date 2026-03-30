import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres:Vinay%4042@127.0.0.1:5432/agrichain"

async def migrate_product_expenses():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        try:
            print("Adding apportioned expense columns to product table...")
            await conn.execute(text("ALTER TABLE product ADD COLUMN apportioned_transport DOUBLE PRECISION DEFAULT 0.0"))
            await conn.execute(text("ALTER TABLE product ADD COLUMN apportioned_labour DOUBLE PRECISION DEFAULT 0.0"))
            await conn.execute(text("ALTER TABLE product ADD COLUMN apportioned_other DOUBLE PRECISION DEFAULT 0.0"))
            print("Successfully added columns!")
        except Exception as e:
            print(f"Error adding columns (they might already exist): {e}")

if __name__ == "__main__":
    asyncio.run(migrate_product_expenses())

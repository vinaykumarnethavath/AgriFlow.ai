import asyncio
import sys
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

DATABASE_URL = "postgresql+asyncpg://postgres:Vinay%4042@127.0.0.1:5432/agrichain"

async def check_schema():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        print("--- Table: product ---")
        res = await conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'product';"))
        for row in res:
            print(f"Column: {row[0]}, Type: {row[1]}")
            
if __name__ == "__main__":
    asyncio.run(check_schema())

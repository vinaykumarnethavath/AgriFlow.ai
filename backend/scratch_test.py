import asyncio
from sqlmodel import select
from app.database import engine, AsyncSessionLocal
from app.models import CropHarvest, CropSale

async def check_harvests():
    async with AsyncSessionLocal() as session:
        # Check harvests
        result = await session.exec(select(CropHarvest))
        harvests = result.all()
        for h in harvests:
            print(f"Harvest {h.id}: stauts={h.status}, qty={h.quantity}")
        
        # Check sales
        result = await session.exec(select(CropSale))
        sales = result.all()
        for s in sales:
            print(f"Sale {s.id}: status={s.status}, qty={s.quantity_quintals}")

asyncio.run(check_harvests())

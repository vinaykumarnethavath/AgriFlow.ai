import asyncio
import os, sys

sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine
from app.models.user import User  # Make sure models are loaded

# Import all models so metadata is complete
from app.models.farmer import FarmerProfile, LandRecord
from app.models.shop import ShopProfile
from app.models.manufacturer import MillProfile, ManufacturerPurchase, ProductionBatch, ManufacturerSale, MillProcurementRequest
from app.models.customer import CustomerProfile, Cart, CustomerOrder, CustomerOrderItem
from app.models.crop import Crop, CropExpense, CropHarvest
from app.models.trade import Product, ShopOrder, ShopOrderItem, TraceabilityEvent
from app.models.expense import ShopExpense
from app.models.shop_accounting import ShopAccountingExpense
from app.models.manufacturer_expense import ManufacturerExpense

from app.models.plot_nutrition import PlotSoilData, FertilizerApplication
from app.models.crop_health_indicator import CropHealthStatus
from app.models.farm_calendar import FarmEvent
from app.models.credit_loan import CreditLoan, LoanRepayment
from app.models.crop_insurance import CropInsurance
from app.models.crop_storage import CropStorage
from app.models.soil_profile import SoilProfile
from app.models.emergency_contact import EmergencyContact

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./agrichain.db")
if DATABASE_URL.startswith("sqlite"):
    engine = create_async_engine(DATABASE_URL, echo=False, future=True, connect_args={"check_same_thread": False})
else:
    engine = create_async_engine(DATABASE_URL, echo=False, future=True)

async def reset():
    print(f"Connecting to {DATABASE_URL} ...")
    from sqlalchemy import text
    async with engine.begin() as conn:
        print("Dropping schema public cascade...")
        await conn.execute(text("DROP SCHEMA public CASCADE"))
        print("Recreating schema public...")
        await conn.execute(text("CREATE SCHEMA public"))
        print("Recreating all tables...")
        await conn.run_sync(SQLModel.metadata.create_all)
    print("Database reset complete.")

if __name__ == "__main__":
    asyncio.run(reset())

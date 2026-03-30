"""
Migration: Add product status (draft/active) and linked_product_ids to accounting expenses.
Run: python migrate_product_status.py
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found in .env")
    exit(1)

if "postgresql+asyncpg://" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

def run_migration():
    print("Running product status migration...")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        cur = conn.cursor()

        # 1. Add status column to product table (draft | active)
        cur.execute("""
            ALTER TABLE product
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft'
        """)
        print("  ✅ Added 'status' column to product table")

        # 2. Set ALL existing products to 'active' so they don't break
        cur.execute("""
            UPDATE product SET status = 'active'
            WHERE status IS NULL OR status = 'draft'
        """)
        rows = cur.rowcount
        print(f"  ✅ Set {rows} existing products to 'active'")

        # 3. Add linked_product_ids to shop_accounting_expenses (JSON list of IDs)
        cur.execute("""
            ALTER TABLE shop_accounting_expenses
            ADD COLUMN IF NOT EXISTS linked_product_ids TEXT
        """)
        print("  ✅ Added 'linked_product_ids' column to shop_accounting_expenses")

        # 4. Also fix the 'notes' column issue — shop_accounting_expenses has 'description'
        # but products.py was incorrectly referencing 'notes'. No schema change needed;
        # we'll fix the application code to use 'description' consistently.

        cur.close()
        conn.close()
        print("\n✅ Migration complete!")
    except Exception as e:
        print(f"❌ Migration error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_migration()

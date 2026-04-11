import asyncio
import asyncpg
import os

async def main():
    conn = await asyncpg.connect('postgresql://postgres:Vinay%4042@127.0.0.1:5432/agrichain')
    
    # Drop NOT NULL constraint on optional columns in crop table
    queries = [
        "ALTER TABLE crop ALTER COLUMN expected_harvest_date DROP NOT NULL;",
        "ALTER TABLE crop ALTER COLUMN variety DROP NOT NULL;",
        "ALTER TABLE crop ALTER COLUMN notes DROP NOT NULL;",
        "ALTER TABLE crop ALTER COLUMN actual_harvest_date DROP NOT NULL;",
    ]
    
    for q in queries:
        try:
            await conn.execute(q)
            print(f"Executed: {q}")
        except Exception as e:
            print(f"Error executing {q}: {e}")

    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())

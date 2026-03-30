import asyncio
import asyncpg
from urllib.parse import urlparse, unquote

async def run():
    # Database URL from .env (hardcoded for this script)
    db_url = "postgresql+asyncpg://postgres:Vinay%4042@127.0.0.1:5432/agrichain"
    
    # Parse URL
    parsed = urlparse(db_url.replace("postgresql+asyncpg", "postgresql"))
    user = parsed.username
    password = unquote(parsed.password)
    host = parsed.hostname
    port = parsed.port
    database = parsed.path.lstrip('/')

    # Connect to 'postgres' database to check if 'agrichain' exists
    try:
        conn = await asyncpg.connect(user=user, password=password, host=host, port=port, database="postgres")
        
        # Check if database exists
        databases = await conn.fetch("SELECT datname FROM pg_database WHERE datname = $1", database)
        
        if not databases:
            print(f"Database {database} does not exist. Creating...")
            await conn.execute(f'CREATE DATABASE "{database}"')
            print(f"Database {database} created.")
        else:
            print(f"Database {database} already exists.")
            
        await conn.close()
    except Exception as e:
        print(f"Error checking/creating database: {e}")

if __name__ == "__main__":
    asyncio.run(run())

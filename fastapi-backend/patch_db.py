import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from sqlalchemy import text
from src.config.database import engine

def patch_db():
    with engine.begin() as conn:
        print("Executing raw ALTER TABLE statements...")
        conn.execute(text("ALTER TABLE subscription_plans DROP COLUMN IF EXISTS price CASCADE;"))
        conn.execute(text("ALTER TABLE subscription_plans ADD COLUMN price JSONB;"))
        
        conn.execute(text("ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 500;"))
        
        conn.execute(text("ALTER TABLE subscription_plans DROP COLUMN IF EXISTS features CASCADE;"))
        conn.execute(text("ALTER TABLE subscription_plans ADD COLUMN features JSONB;"))
        
        conn.execute(text("ALTER TABLE subscription_plans DROP COLUMN IF EXISTS duration_days CASCADE;"))
        
        print("Updating price column constraint...")
        conn.execute(text("UPDATE subscription_plans SET price = '{}'::jsonb WHERE price IS NULL;"))
        conn.execute(text("ALTER TABLE subscription_plans ALTER COLUMN price SET NOT NULL;"))
        
    print("Done!")

if __name__ == "__main__":
    patch_db()

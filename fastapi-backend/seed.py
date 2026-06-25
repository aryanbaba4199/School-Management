import sys
import os

# Ensure the app can import 'src'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.main import app # Load all models into SQLAlchemy metadata

from sqlalchemy.orm import Session
from src.config.database import SessionLocal
from src.modules.user.models import User, UserRoleEnum
from src.common.utils.security import get_password_hash

def create_superadmin():
    db: Session = SessionLocal()
    try:
        email = "aryanbaba4199@gmail.com"
        password = "727798"
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"User {email} already exists!")
            return
            
        hashed_password = get_password_hash(password)
        
        new_user = User(
            name="Aryan Dubey",
            email=email,
            password=hashed_password,
            user_code="SA-0001",
            role=UserRoleEnum.SUPER_ADMIN,
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"Super Admin user created successfully with ID: {new_user.id}")
        
    except Exception as e:
        db.rollback()
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_superadmin()

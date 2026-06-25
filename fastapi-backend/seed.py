import sys
import os

# Ensure the app can import 'src'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.main import app # Load all models into SQLAlchemy metadata

from sqlalchemy.orm import Session
from src.config.database import SessionLocal
from src.modules.user.models import User, UserRoleEnum
from src.common.utils.security import get_password_hash

def seed_users():
    db: Session = SessionLocal()
    try:
        users_to_seed = [
            {"email": "testsuperadmin@gmail.com", "name": "Test Super Admin", "role": UserRoleEnum.SUPER_ADMIN},
            {"email": "testadmin@gmail.com", "name": "Test School Admin", "role": UserRoleEnum.SCHOOL_ADMIN},
            {"email": "testteacher@gmail.com", "name": "Test Teacher", "role": UserRoleEnum.TEACHER},
            {"email": "testparent@gmail.com", "name": "Test Parent", "role": UserRoleEnum.PARENT},
            {"email": "teststudent@gmail.com", "name": "Test Student", "role": UserRoleEnum.STUDENT},
        ]
        
        password = "123456"
        hashed_password = get_password_hash(password)

        for i, u in enumerate(users_to_seed):
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                new_user = User(
                    name=u["name"],
                    email=u["email"],
                    password=hashed_password,
                    user_code=f"SEED-00{i}",
                    role=u["role"],
                    is_active=True
                )
                db.add(new_user)
                print(f"Created {u['role'].value}: {u['email']}")
            else:
                # Update password just in case
                existing.password = hashed_password
                print(f"Updated {u['role'].value}: {u['email']}")
                
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"An error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_users()

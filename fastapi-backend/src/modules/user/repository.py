from typing import Optional
from sqlalchemy.orm import Session
from src.common.repository import CRUDBase
from .models import User
from .schemas import UserCreate, UserUpdate
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()
        
    def get_by_user_code(self, db: Session, *, user_code: str, school_id: str) -> Optional[User]:
        return db.query(User).filter(User.user_code == user_code, User.school_id == school_id).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        obj_in_data = obj_in.model_dump()
        obj_in_data["password"] = pwd_context.hash(obj_in_data["password"])
        db_obj = User(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

user = CRUDUser(User)

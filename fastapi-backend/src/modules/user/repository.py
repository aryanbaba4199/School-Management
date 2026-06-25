from typing import Optional
from sqlalchemy.orm import Session
from src.common.repository import CRUDBase
from .models import User
from src.modules.subject.models import Subject
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
        subject_ids = obj_in_data.pop("subject_ids", [])
        children_ids = obj_in_data.pop("children_ids", [])
        
        obj_in_data["password"] = pwd_context.hash(obj_in_data["password"])
        db_obj = User(**obj_in_data)
        db.add(db_obj)
        
        if subject_ids:
            subjects = db.query(Subject).filter(Subject.id.in_(subject_ids)).all()
            db_obj.subjects = subjects
            
        if children_ids:
            children = db.query(User).filter(User.id.in_(children_ids)).all()
            db_obj.children = children
            
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: User, obj_in: UserUpdate | dict) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
            
        subject_ids = update_data.pop("subject_ids", None)
        children_ids = update_data.pop("children_ids", None)
        
        if "password" in update_data and update_data["password"]:
            update_data["password"] = pwd_context.hash(update_data["password"])
            
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        if subject_ids is not None:
            if not subject_ids:
                db_obj.subjects = []
            else:
                db_obj.subjects = db.query(Subject).filter(Subject.id.in_(subject_ids)).all()
                
        if children_ids is not None:
            if not children_ids:
                db_obj.children = []
            else:
                db_obj.children = db.query(User).filter(User.id.in_(children_ids)).all()
                
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

user = CRUDUser(User)

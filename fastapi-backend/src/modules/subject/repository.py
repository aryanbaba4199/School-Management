from sqlalchemy.orm import Session
from src.common.repository import CRUDBase
from src.modules.user.models import User
from .models import Subject
from .schemas import SubjectCreate, SubjectUpdate

class CRUDSubject(CRUDBase[Subject, SubjectCreate, SubjectUpdate]):
    def create(self, db: Session, *, obj_in: SubjectCreate) -> Subject:
        obj_in_data = obj_in.model_dump()
        teacher_ids = obj_in_data.pop("teacher_ids", [])
        
        db_obj = Subject(**obj_in_data)
        
        if teacher_ids:
            teachers = db.query(User).filter(User.id.in_(teacher_ids)).all()
            db_obj.users.extend(teachers)
            
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: Subject, obj_in: SubjectUpdate | dict) -> Subject:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
            
        teacher_ids = update_data.pop("teacher_ids", None)
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        if teacher_ids is not None:
            db_obj.users.clear() # removes old associations
            if teacher_ids:
                teachers = db.query(User).filter(User.id.in_(teacher_ids)).all()
                db_obj.users.extend(teachers)
                
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

subject = CRUDSubject(Subject)

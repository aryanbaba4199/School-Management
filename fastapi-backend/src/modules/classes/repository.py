from sqlalchemy.orm import Session
from src.common.repository import CRUDBase
from .models import Class, ClassSchedule, Section
from .schemas import (
    ClassCreate, ClassUpdate,
    ClassScheduleCreate, ClassScheduleUpdate,
    SectionCreate, SectionUpdate
)

class CRUDClass(CRUDBase[Class, ClassCreate, ClassUpdate]):
    def create(self, db: Session, *, obj_in: ClassCreate) -> Class:
        obj_in_data = obj_in.model_dump()
        sections = obj_in_data.pop("sections", [])
        schedule = obj_in_data.pop("schedule", [])
        
        db_obj = Class(**obj_in_data)
        db.add(db_obj)
        db.flush() # get id
        
        if sections:
            for sec_name in sections:
                sec = Section(name=sec_name, class_id=db_obj.id, school_id=db_obj.school_id)
                db.add(sec)
                
        if schedule:
            for sch in schedule:
                # sch is a dict if model_dump was called on obj_in
                new_sch = ClassSchedule(
                    class_id=db_obj.id,
                    subject_id=sch["subject_id"],
                    teacher_id=sch["teacher_id"],
                    start_time=sch["start_time"],
                    end_time=sch["end_time"]
                )
                db.add(new_sch)
                
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, *, db_obj: Class, obj_in: ClassUpdate | dict) -> Class:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
            
        sections = update_data.pop("sections", None)
        schedule = update_data.pop("schedule", None)
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        if sections is not None:
            # Delete old sections and create new ones (simplistic sync)
            db.query(Section).filter(Section.class_id == db_obj.id).delete()
            for sec_name in sections:
                sec = Section(name=sec_name, class_id=db_obj.id, school_id=db_obj.school_id)
                db.add(sec)
                
        if schedule is not None:
            db.query(ClassSchedule).filter(ClassSchedule.class_id == db_obj.id).delete()
            for sch in schedule:
                new_sch = ClassSchedule(
                    class_id=db_obj.id,
                    subject_id=sch["subject_id"],
                    teacher_id=sch["teacher_id"],
                    start_time=sch["start_time"],
                    end_time=sch["end_time"]
                )
                db.add(new_sch)
                
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

class CRUDClassSchedule(CRUDBase[ClassSchedule, ClassScheduleCreate, ClassScheduleUpdate]):
    pass

class CRUDSection(CRUDBase[Section, SectionCreate, SectionUpdate]):
    pass

class_repo = CRUDClass(Class)
class_schedule = CRUDClassSchedule(ClassSchedule)
section = CRUDSection(Section)

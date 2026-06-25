from typing import Optional
from uuid import UUID
from pydantic import BaseModel, model_validator
from typing import Optional, Any
from src.common.schemas import CoreSchema

class ClassBase(BaseModel):
    name: str
    school_id: UUID
    is_active: bool = True
    class_teacher_id: Optional[UUID] = None
    monthly_fee: Optional[int] = None
    yearly_fee: Optional[int] = None

class ClassScheduleBase(BaseModel):
    subject_id: UUID
    teacher_id: UUID
    start_time: str
    end_time: str

class ClassCreate(ClassBase):
    sections: Optional[list[str]] = []
    schedule: Optional[list[ClassScheduleBase]] = []

class ClassUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    class_teacher_id: Optional[UUID] = None
    monthly_fee: Optional[int] = None
    yearly_fee: Optional[int] = None
    sections: Optional[list[str]] = None
    schedule: Optional[list[ClassScheduleBase]] = None

class ClassResponse(CoreSchema):
    name: str
    school_id: Optional[Any] = None
    is_active: bool = True
    class_teacher_id: Optional[Any] = None
    monthly_fee: Optional[int] = None
    yearly_fee: Optional[int] = None
    
    sections: Optional[list[Any]] = []
    schedule: Optional[list[Any]] = []
    
    @model_validator(mode='before')
    @classmethod
    def format_response(cls, data: Any) -> Any:
        if isinstance(data, dict): return data
        if isinstance(data, list): return data
        
        result = {
            "id": data.id,
            "created_at": data.created_at,
            "updated_at": data.updated_at,
            "name": data.name,
            "is_active": data.is_active,
            "monthly_fee": data.monthly_fee,
            "yearly_fee": data.yearly_fee
        }
        
        if hasattr(data, 'school') and data.school:
            result["school_id"] = {
                "id": str(data.school.id),
                "name": data.school.name,
                "code": data.school.code
            }
        else:
            result["school_id"] = str(data.school_id) if data.school_id else None
            
        if hasattr(data, 'class_teacher') and data.class_teacher:
            result["class_teacher_id"] = {
                "id": str(data.class_teacher.id),
                "name": data.class_teacher.name,
                "email": data.class_teacher.email
            }
        else:
            result["class_teacher_id"] = str(data.class_teacher_id) if data.class_teacher_id else None
            
        if hasattr(data, 'sections'):
            result["sections"] = [
                {
                    "id": str(sec.id),
                    "name": sec.name,
                    "class_id": str(sec.class_id),
                    "school_id": str(sec.school_id),
                    "is_active": True
                } for sec in data.sections
            ]
            
        if hasattr(data, 'schedules'):
            result["schedule"] = [
                {
                    "id": str(sch.id),
                    "start_time": sch.start_time,
                    "end_time": sch.end_time,
                    "subject_id": str(sch.subject_id),
                    "teacher_id": str(sch.teacher_id),
                    "class_id": str(sch.class_id)
                } for sch in data.schedules
            ]
            
        return result

# Base schedules already defined above

class ClassScheduleCreate(ClassScheduleBase):
    class_id: UUID

class ClassScheduleUpdate(BaseModel):
    subject_id: Optional[UUID] = None
    teacher_id: Optional[UUID] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class ClassScheduleResponse(CoreSchema, ClassScheduleBase):
    pass

class SectionBase(BaseModel):
    name: str
    class_id: UUID
    school_id: UUID

class SectionCreate(SectionBase):
    pass

class SectionUpdate(BaseModel):
    name: Optional[str] = None

class SectionResponse(CoreSchema, SectionBase):
    pass

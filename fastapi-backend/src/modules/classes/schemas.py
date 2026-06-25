from typing import Optional
from uuid import UUID
from pydantic import BaseModel
from src.common.schemas import CoreSchema

class ClassBase(BaseModel):
    name: str
    school_id: UUID
    is_active: bool = True
    class_teacher_id: Optional[UUID] = None
    monthly_fee: Optional[int] = None
    yearly_fee: Optional[int] = None

class ClassCreate(ClassBase):
    pass

class ClassUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    class_teacher_id: Optional[UUID] = None
    monthly_fee: Optional[int] = None
    yearly_fee: Optional[int] = None

class ClassResponse(CoreSchema, ClassBase):
    pass

class ClassScheduleBase(BaseModel):
    class_id: UUID
    subject_id: UUID
    teacher_id: UUID
    start_time: str
    end_time: str

class ClassScheduleCreate(ClassScheduleBase):
    pass

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

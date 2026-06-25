from typing import Optional
from uuid import UUID
from datetime import date
from pydantic import BaseModel
from src.common.schemas import CoreSchema
from .models import AttendanceStatusEnum

class AttendanceRecordBase(BaseModel):
    school_id: UUID
    user_id: UUID
    date: date
    status: AttendanceStatusEnum
    remarks: Optional[str] = None
    marked_by: Optional[UUID] = None

class AttendanceRecordCreate(AttendanceRecordBase):
    pass

class AttendanceRecordUpdate(BaseModel):
    status: Optional[AttendanceStatusEnum] = None
    remarks: Optional[str] = None

class AttendanceRecordResponse(CoreSchema, AttendanceRecordBase):
    pass

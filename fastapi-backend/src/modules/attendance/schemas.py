from typing import Optional, Any, List
from uuid import UUID
from datetime import date
from pydantic import BaseModel, model_validator
from src.common.schemas import CoreSchema
from .models import AttendanceStatusEnum, CorrectionStatusEnum

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

class AttendanceRecordResponse(CoreSchema):
    school_id: UUID
    user_id: Any
    date: date
    status: AttendanceStatusEnum
    remarks: Optional[str] = None
    marked_by: Optional[Any] = None

    @model_validator(mode='before')
    @classmethod
    def format_response(cls, data: Any) -> Any:
        if isinstance(data, dict): return data
        result = {
            "id": data.id, "created_at": data.created_at, "updated_at": data.updated_at,
            "school_id": data.school_id, "date": data.date, "status": data.status,
            "remarks": data.remarks
        }
        
        if hasattr(data, 'user') and data.user:
            result["user_id"] = {"id": str(data.user.id), "name": data.user.name, "user_code": getattr(data.user, 'user_code', '')}
        else: result["user_id"] = str(data.user_id)
        
        if hasattr(data, 'marker') and data.marker:
            result["marked_by"] = {"id": str(data.marker.id), "name": data.marker.name}
        else: result["marked_by"] = str(data.marked_by) if data.marked_by else None
        
        return result

class StudentAttendanceEntry(BaseModel):
    student_id: UUID
    status: AttendanceStatusEnum
    remarks: Optional[str] = None

class BulkStudentAttendanceCreate(BaseModel):
    school_id: Optional[UUID] = None
    class_id: UUID
    section_id: UUID
    date: date
    records: List[StudentAttendanceEntry]

class TeacherAttendanceEntry(BaseModel):
    teacher_id: UUID
    status: AttendanceStatusEnum
    remarks: Optional[str] = None

class BulkTeacherAttendanceCreate(BaseModel):
    school_id: Optional[UUID] = None
    date: date
    records: List[TeacherAttendanceEntry]

class AttendanceSettingsBase(BaseModel):
    school_id: UUID
    school_start_time: str = "08:00"
    school_end_time: str = "14:00"
    late_threshold_minutes: int = 15
    half_day_threshold_minutes: int = 120
    enable_rfid: str = "false"
    enable_biometric: str = "false"
    auto_absent_time: str = "10:00"

class AttendanceSettingsCreate(AttendanceSettingsBase):
    pass

class AttendanceSettingsUpdate(BaseModel):
    school_start_time: Optional[str] = None
    school_end_time: Optional[str] = None
    late_threshold_minutes: Optional[int] = None
    half_day_threshold_minutes: Optional[int] = None
    enable_rfid: Optional[str] = None
    enable_biometric: Optional[str] = None
    auto_absent_time: Optional[str] = None

class AttendanceSettingsResponse(CoreSchema, AttendanceSettingsBase):
    pass

class RfidCardBase(BaseModel):
    school_id: UUID
    user_id: UUID
    rfid_number: str
    is_active: str = "true"
    assigned_date: Optional[date] = None

class RfidCardCreate(RfidCardBase):
    pass

class RfidCardUpdate(BaseModel):
    rfid_number: Optional[str] = None
    is_active: Optional[str] = None

class RfidCardResponse(CoreSchema, RfidCardBase):
    pass

class AttendanceCorrectionRequestBase(BaseModel):
    school_id: UUID
    user_id: UUID
    attendance_record_id: UUID
    requested_date: date
    original_status: AttendanceStatusEnum
    requested_status: AttendanceStatusEnum
    reason: str

class AttendanceCorrectionRequestCreate(AttendanceCorrectionRequestBase):
    pass

class ResolveCorrectionDto(BaseModel):
    action: CorrectionStatusEnum
    reason: Optional[str] = None

class AttendanceCorrectionRequestResponse(CoreSchema, AttendanceCorrectionRequestBase):
    status: CorrectionStatusEnum
    resolved_by: Optional[UUID] = None
    resolved_at: Optional[date] = None
    
    user: Optional[Any] = None
    resolver: Optional[Any] = None
    
    @model_validator(mode='before')
    @classmethod
    def format_response(cls, data: Any) -> Any:
        if isinstance(data, dict): return data
        result = {
            "id": data.id, "created_at": data.created_at, "updated_at": data.updated_at,
            "school_id": data.school_id, "user_id": data.user_id, "attendance_record_id": data.attendance_record_id,
            "requested_date": data.requested_date, "original_status": data.original_status,
            "requested_status": data.requested_status, "reason": data.reason, "status": data.status,
            "resolved_by": data.resolved_by, "resolved_at": data.resolved_at
        }
        
        if hasattr(data, 'user') and data.user:
            result["user"] = {"id": str(data.user.id), "name": data.user.name, "user_code": getattr(data.user, 'user_code', '')}
        if hasattr(data, 'resolver') and data.resolver:
            result["resolver"] = {"id": str(data.resolver.id), "name": data.resolver.name}
            
        return result

class RfidScanDto(BaseModel):
    card_uid: str

from typing import Optional
from uuid import UUID
from datetime import date
from pydantic import BaseModel
from src.common.schemas import CoreSchema
from .models import ExamTermEnum, ExamStatusEnum

class ExamBase(BaseModel):
    school_id: UUID
    name: str
    academic_year: str
    term: ExamTermEnum
    start_date: date
    end_date: date
    status: ExamStatusEnum = ExamStatusEnum.DRAFT
    created_by: Optional[UUID] = None

class ExamCreate(ExamBase):
    pass

class ExamUpdate(BaseModel):
    name: Optional[str] = None
    academic_year: Optional[str] = None
    term: Optional[ExamTermEnum] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[ExamStatusEnum] = None

class ExamResponse(CoreSchema, ExamBase):
    pass

class ExamScheduleBase(BaseModel):
    school_id: UUID
    exam_id: UUID
    class_id: UUID
    section_id: UUID
    subject_id: UUID
    exam_date: date
    start_time: str
    end_time: str
    room: Optional[str] = None
    max_marks: float
    pass_marks: float

class ExamScheduleCreate(ExamScheduleBase):
    pass

class ExamScheduleUpdate(BaseModel):
    exam_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    room: Optional[str] = None
    max_marks: Optional[float] = None
    pass_marks: Optional[float] = None

class ExamScheduleResponse(CoreSchema, ExamScheduleBase):
    pass

class StudentExamMarkBase(BaseModel):
    school_id: UUID
    exam_id: UUID
    exam_schedule_id: UUID
    student_id: UUID
    class_id: UUID
    section_id: UUID
    subject_id: UUID
    obtained_marks: Optional[float] = None
    max_marks: float
    grade: Optional[str] = None
    remarks: Optional[str] = None
    attendance_status: str = "PRESENT"
    entered_by: Optional[UUID] = None

class StudentExamMarkCreate(StudentExamMarkBase):
    pass

class StudentExamMarkUpdate(BaseModel):
    obtained_marks: Optional[float] = None
    grade: Optional[str] = None
    remarks: Optional[str] = None
    attendance_status: Optional[str] = None

class StudentExamMarkResponse(CoreSchema, StudentExamMarkBase):
    pass

class GradeConfigBase(BaseModel):
    school_id: UUID
    grade: str
    min_percentage: float
    max_percentage: float
    remarks: Optional[str] = None

class GradeConfigCreate(GradeConfigBase):
    pass

class GradeConfigUpdate(BaseModel):
    grade: Optional[str] = None
    min_percentage: Optional[float] = None
    max_percentage: Optional[float] = None
    remarks: Optional[str] = None

class GradeConfigResponse(CoreSchema, GradeConfigBase):
    pass

class ReportCardBase(BaseModel):
    school_id: UUID
    exam_id: UUID
    student_id: UUID
    class_id: UUID
    section_id: UUID
    total_marks: float
    obtained_marks: float
    percentage: float
    grade: Optional[str] = None
    rank: Optional[int] = None
    result: str

class ReportCardCreate(ReportCardBase):
    pass

class ReportCardUpdate(BaseModel):
    pass

class ReportCardResponse(CoreSchema, ReportCardBase):
    pass

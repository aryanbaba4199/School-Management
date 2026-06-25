from typing import Optional, Any
from uuid import UUID
from datetime import date
from pydantic import BaseModel, model_validator
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

class ExamResponse(CoreSchema):
    school_id: UUID
    name: str
    academic_year: str
    term: ExamTermEnum
    start_date: date
    end_date: date
    status: ExamStatusEnum
    created_by: Optional[Any] = None
    
    @model_validator(mode='before')
    @classmethod
    def format_response(cls, data: Any) -> Any:
        if isinstance(data, dict): return data
        if isinstance(data, list): return data
        result = {
            "id": data.id, "created_at": data.created_at, "updated_at": data.updated_at,
            "school_id": data.school_id, "name": data.name, "academic_year": data.academic_year,
            "term": data.term, "start_date": data.start_date, "end_date": data.end_date,
            "status": data.status
        }
        if hasattr(data, 'creator') and data.creator:
            result["created_by"] = {"id": str(data.creator.id), "name": data.creator.name}
        else:
            result["created_by"] = str(data.created_by) if data.created_by else None
        return result

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

class ExamScheduleResponse(CoreSchema):
    school_id: UUID
    exam_id: UUID
    class_id: Any
    section_id: Any
    subject_id: Any
    exam_date: date
    start_time: str
    end_time: str
    room: Optional[str] = None
    max_marks: float
    pass_marks: float
    
    @model_validator(mode='before')
    @classmethod
    def format_response(cls, data: Any) -> Any:
        if isinstance(data, dict): return data
        if isinstance(data, list): return data
        result = {
            "id": data.id, "created_at": data.created_at, "updated_at": data.updated_at,
            "school_id": data.school_id, "exam_id": data.exam_id,
            "exam_date": data.exam_date, "start_time": data.start_time, "end_time": data.end_time,
            "room": data.room, "max_marks": data.max_marks, "pass_marks": data.pass_marks
        }
        if hasattr(data, 'class_') and data.class_:
            result["class_id"] = {"id": str(data.class_.id), "name": data.class_.name}
        else: result["class_id"] = str(data.class_id)
        
        if hasattr(data, 'section') and data.section:
            result["section_id"] = {"id": str(data.section.id), "name": data.section.name}
        else: result["section_id"] = str(data.section_id)
        
        if hasattr(data, 'subject') and data.subject:
            result["subject_id"] = {"id": str(data.subject.id), "name": data.subject.name, "code": data.subject.code}
        else: result["subject_id"] = str(data.subject_id)
        
        return result

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

class StudentExamMarkResponse(CoreSchema):
    school_id: UUID
    exam_id: UUID
    exam_schedule_id: UUID
    student_id: Any
    class_id: UUID
    section_id: UUID
    subject_id: Any
    obtained_marks: Optional[float] = None
    max_marks: float
    grade: Optional[str] = None
    remarks: Optional[str] = None
    attendance_status: str
    entered_by: Optional[UUID] = None

    @model_validator(mode='before')
    @classmethod
    def format_response(cls, data: Any) -> Any:
        if isinstance(data, dict): return data
        if isinstance(data, list): return data
        result = {
            "id": data.id, "created_at": data.created_at, "updated_at": data.updated_at,
            "school_id": data.school_id, "exam_id": data.exam_id, "exam_schedule_id": data.exam_schedule_id,
            "class_id": data.class_id, "section_id": data.section_id,
            "obtained_marks": data.obtained_marks, "max_marks": data.max_marks,
            "grade": data.grade, "remarks": data.remarks, "attendance_status": data.attendance_status,
            "entered_by": data.entered_by
        }
        
        if hasattr(data, 'student') and data.student:
            result["student_id"] = {"id": str(data.student.id), "name": data.student.name, "user_code": getattr(data.student, 'user_code', '')}
        else: result["student_id"] = str(data.student_id)
        
        if hasattr(data, 'subject') and data.subject:
            result["subject_id"] = {"id": str(data.subject.id), "name": data.subject.name, "code": data.subject.code}
        else: result["subject_id"] = str(data.subject_id)
        
        return result

class StudentMarkEntry(BaseModel):
    student_id: UUID
    obtained_marks: Optional[float] = None
    remarks: Optional[str] = None
    attendance_status: str = "PRESENT"

class BulkStudentExamMarkCreate(BaseModel):
    school_id: Optional[UUID] = None
    exam_id: UUID
    exam_schedule_id: UUID
    class_id: UUID
    section_id: UUID
    subject_id: UUID
    max_marks: float
    marks_data: list[StudentMarkEntry]

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

class ReportCardResponse(CoreSchema):
    school_id: UUID
    exam_id: Any
    student_id: Any
    class_id: Any
    section_id: Any
    total_marks: float
    obtained_marks: float
    percentage: float
    grade: Optional[str] = None
    rank: Optional[int] = None
    result: str
    
    @model_validator(mode='before')
    @classmethod
    def format_response(cls, data: Any) -> Any:
        if isinstance(data, dict): return data
        if isinstance(data, list): return data
        res = {
            "id": data.id, "created_at": data.created_at, "updated_at": data.updated_at,
            "school_id": data.school_id, "total_marks": data.total_marks, "obtained_marks": data.obtained_marks,
            "percentage": data.percentage, "grade": data.grade, "rank": data.rank, "result": getattr(data, 'result', '')
        }
        
        if hasattr(data, 'exam') and data.exam:
            res["exam_id"] = {"id": str(data.exam.id), "name": data.exam.name, "academic_year": data.exam.academic_year, "term": data.exam.term.value if hasattr(data.exam.term, 'value') else data.exam.term}
        else: res["exam_id"] = str(data.exam_id)
        
        if hasattr(data, 'student') and data.student:
            res["student_id"] = {"id": str(data.student.id), "name": data.student.name, "user_code": getattr(data.student, 'user_code', ''), "profile_picture": getattr(data.student, 'profile_picture', None)}
        else: res["student_id"] = str(data.student_id)
        
        if hasattr(data, 'class_') and data.class_:
            res["class_id"] = {"id": str(data.class_.id), "name": data.class_.name}
        else: res["class_id"] = str(data.class_id)
        
        if hasattr(data, 'section') and data.section:
            res["section_id"] = {"id": str(data.section.id), "name": data.section.name}
        else: res["section_id"] = str(data.section_id)
        
        return res

class GenerateResultsRequest(BaseModel):
    exam_id: UUID
    class_id: UUID
    section_id: UUID

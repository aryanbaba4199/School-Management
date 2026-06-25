from typing import Optional, Any
from uuid import UUID
from datetime import date
from pydantic import BaseModel, model_validator
from src.common.schemas import CoreSchema
from .models import HomeworkStatusEnum, SubmissionStatusEnum

class HomeworkBase(BaseModel):
    school_id: UUID
    class_id: UUID
    section_id: UUID
    subject_id: UUID
    title: str
    description: Optional[str] = None
    due_date: date
    attachments: Optional[list[Any]] = []
    max_marks: Optional[int] = None
    status: HomeworkStatusEnum = HomeworkStatusEnum.DRAFT
    teacher_id: Optional[UUID] = None

class HomeworkCreate(HomeworkBase):
    pass

class HomeworkUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    attachments: Optional[list[Any]] = None
    max_marks: Optional[int] = None
    status: Optional[HomeworkStatusEnum] = None

class HomeworkResponse(CoreSchema):
    school_id: UUID
    class_id: Any
    section_id: Any
    subject_id: Any
    title: str
    description: Optional[str] = None
    due_date: date
    attachments: Optional[list[Any]] = []
    max_marks: Optional[int] = None
    status: HomeworkStatusEnum
    teacher_id: Any
    
    @model_validator(mode='before')
    @classmethod
    def format_response(cls, data: Any) -> Any:
        if isinstance(data, dict): return data
        result = {
            "id": data.id, "created_at": data.created_at, "updated_at": data.updated_at,
            "school_id": data.school_id, "title": data.title, "description": data.description,
            "due_date": data.due_date, "attachments": data.attachments or [], "max_marks": data.max_marks,
            "status": data.status
        }
        
        if hasattr(data, 'class_') and data.class_:
            result["class_id"] = {"id": str(data.class_.id), "name": data.class_.name}
        else: result["class_id"] = str(data.class_id)
        
        if hasattr(data, 'section') and data.section:
            result["section_id"] = {"id": str(data.section.id), "name": data.section.name}
        else: result["section_id"] = str(data.section_id)
        
        if hasattr(data, 'subject') and data.subject:
            result["subject_id"] = {"id": str(data.subject.id), "name": data.subject.name, "code": getattr(data.subject, 'code', '')}
        else: result["subject_id"] = str(data.subject_id)
        
        if hasattr(data, 'teacher') and data.teacher:
            result["teacher_id"] = {"id": str(data.teacher.id), "name": data.teacher.name}
        else: result["teacher_id"] = str(data.teacher_id) if data.teacher_id else None
            
        return result

class HomeworkSubmissionBase(BaseModel):
    homework_id: UUID
    student_id: UUID
    submission_text: Optional[str] = None
    attachments: Optional[list[Any]] = []
    status: SubmissionStatusEnum = SubmissionStatusEnum.PENDING
    submission_date: Optional[date] = None
    obtained_marks: Optional[int] = None
    teacher_feedback: Optional[str] = None
    graded_by: Optional[UUID] = None
    graded_at: Optional[date] = None

class HomeworkSubmissionCreate(HomeworkSubmissionBase):
    pass

class HomeworkSubmissionUpdate(BaseModel):
    submission_text: Optional[str] = None
    attachments: Optional[list[Any]] = None
    status: Optional[SubmissionStatusEnum] = None
    obtained_marks: Optional[int] = None
    teacher_feedback: Optional[str] = None

class HomeworkSubmissionResponse(CoreSchema):
    homework_id: Any
    student_id: Any
    submission_text: Optional[str] = None
    attachments: Optional[list[Any]] = []
    status: SubmissionStatusEnum
    submission_date: Optional[date] = None
    obtained_marks: Optional[int] = None
    teacher_feedback: Optional[str] = None
    graded_by: Any
    graded_at: Optional[date] = None
    
    @model_validator(mode='before')
    @classmethod
    def format_response(cls, data: Any) -> Any:
        if isinstance(data, dict): return data
        result = {
            "id": data.id, "created_at": data.created_at, "updated_at": data.updated_at,
            "homework_id": data.homework_id, "submission_text": data.submission_text,
            "attachments": data.attachments or [], "status": data.status,
            "submission_date": data.submission_date, "obtained_marks": data.obtained_marks,
            "teacher_feedback": data.teacher_feedback, "graded_at": data.graded_at
        }
        
        if hasattr(data, 'student') and data.student:
            result["student_id"] = {"id": str(data.student.id), "name": data.student.name, "user_code": getattr(data.student, 'user_code', '')}
        else: result["student_id"] = str(data.student_id)
        
        if hasattr(data, 'evaluator') and data.evaluator:
            result["graded_by"] = {"id": str(data.evaluator.id), "name": data.evaluator.name}
        else: result["graded_by"] = str(data.graded_by) if data.graded_by else None
        
        if hasattr(data, 'homework') and data.homework:
            result["homework_id"] = {
                "id": str(data.homework.id),
                "title": data.homework.title,
                "due_date": data.homework.due_date,
                "subject_id": str(data.homework.subject_id)
            }
        else:
            result["homework_id"] = str(data.homework_id)
        
        return result

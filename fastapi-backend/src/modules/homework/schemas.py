from typing import Optional
from uuid import UUID
from datetime import date
from pydantic import BaseModel
from src.common.schemas import CoreSchema
from .models import HomeworkStatusEnum

class HomeworkBase(BaseModel):
    school_id: UUID
    class_id: UUID
    section_id: UUID
    subject_id: UUID
    title: str
    description: Optional[str] = None
    due_date: date
    attachment_url: Optional[str] = None
    status: HomeworkStatusEnum = HomeworkStatusEnum.DRAFT
    created_by: Optional[UUID] = None

class HomeworkCreate(HomeworkBase):
    pass

class HomeworkUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    attachment_url: Optional[str] = None
    status: Optional[HomeworkStatusEnum] = None

class HomeworkResponse(CoreSchema, HomeworkBase):
    pass

class HomeworkSubmissionBase(BaseModel):
    homework_id: UUID
    student_id: UUID
    submission_text: Optional[str] = None
    attachment_url: Optional[str] = None
    grade: Optional[str] = None
    teacher_feedback: Optional[str] = None
    evaluated_by: Optional[UUID] = None

class HomeworkSubmissionCreate(HomeworkSubmissionBase):
    pass

class HomeworkSubmissionUpdate(BaseModel):
    submission_text: Optional[str] = None
    attachment_url: Optional[str] = None
    grade: Optional[str] = None
    teacher_feedback: Optional[str] = None

class HomeworkSubmissionResponse(CoreSchema, HomeworkSubmissionBase):
    pass

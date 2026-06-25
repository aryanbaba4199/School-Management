from sqlalchemy import Column, String, ForeignKey, Date, Enum
from src.common.models.base import CoreModel
import enum

class HomeworkStatusEnum(str, enum.Enum):
    PUBLISHED = "PUBLISHED"
    DRAFT = "DRAFT"

class Homework(CoreModel):
    __tablename__ = "homeworks"
    
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    class_id = Column(ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    section_id = Column(ForeignKey("sections.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String, nullable=False)
    description = Column(String)
    due_date = Column(Date, nullable=False)
    attachment_url = Column(String)
    
    status = Column(Enum(HomeworkStatusEnum, name="homework_status_enum", create_type=False), default=HomeworkStatusEnum.DRAFT)
    created_by = Column(ForeignKey("users.id", ondelete="SET NULL"))

class HomeworkSubmission(CoreModel):
    __tablename__ = "homework_submissions"
    
    homework_id = Column(ForeignKey("homeworks.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    submission_text = Column(String)
    attachment_url = Column(String)
    
    grade = Column(String)
    teacher_feedback = Column(String)
    evaluated_by = Column(ForeignKey("users.id", ondelete="SET NULL"))

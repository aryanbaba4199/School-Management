from sqlalchemy import Column, String, ForeignKey, Date, Enum, Integer
from sqlalchemy.orm import relationship
from src.common.models.base import CoreModel
import enum

class HomeworkStatusEnum(str, enum.Enum):
    PUBLISHED = "PUBLISHED"
    DRAFT = "DRAFT"

class SubmissionStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    SUBMITTED = "SUBMITTED"
    GRADED = "GRADED"
    LATE = "LATE"
    CORRECTION_REQUIRED = "CORRECTION_REQUIRED"

class Homework(CoreModel):
    __tablename__ = "homeworks"
    
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    class_id = Column(ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    section_id = Column(ForeignKey("sections.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String, nullable=False)
    description = Column(String)
    due_date = Column(Date, nullable=False)
    
    from sqlalchemy.dialects.postgresql import JSONB
    attachments = Column(JSONB, nullable=True) # JSON array of {url, name, type}
    max_marks = Column(Integer, nullable=True)
    
    status = Column(Enum(HomeworkStatusEnum, name="homework_status_enum", create_type=False), default=HomeworkStatusEnum.DRAFT)
    teacher_id = Column(ForeignKey("users.id", ondelete="SET NULL"))
    
    school = relationship("School")
    class_ = relationship("Class")
    section = relationship("Section")
    subject = relationship("Subject")
    teacher = relationship("User", foreign_keys=[teacher_id])

class HomeworkSubmission(CoreModel):
    __tablename__ = "homework_submissions"
    
    homework_id = Column(ForeignKey("homeworks.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    submission_text = Column(String)
    from sqlalchemy.dialects.postgresql import JSONB
    attachments = Column(JSONB, nullable=True)
    
    status = Column(Enum(SubmissionStatusEnum, name="submission_status_enum", create_type=True), default=SubmissionStatusEnum.PENDING)
    submission_date = Column(Date, nullable=True)
    
    obtained_marks = Column(Integer, nullable=True)
    teacher_feedback = Column(String)
    graded_by = Column(ForeignKey("users.id", ondelete="SET NULL"))
    graded_at = Column(Date, nullable=True)
    
    homework = relationship("Homework")
    student = relationship("User", foreign_keys=[student_id])
    evaluator = relationship("User", foreign_keys=[graded_by])

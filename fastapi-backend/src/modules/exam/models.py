from sqlalchemy import Column, String, Integer, Float, ForeignKey, Date, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from src.common.models.base import CoreModel
import enum

class ExamTermEnum(str, enum.Enum):
    MONTHLY = "MONTHLY"
    QUARTERLY = "QUARTERLY"
    MID_TERM = "MID_TERM"
    FINAL = "FINAL"

class ExamStatusEnum(str, enum.Enum):
    DRAFT = "DRAFT"
    SCHEDULED = "SCHEDULED"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"

class Exam(CoreModel):
    __tablename__ = "exams"
    
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    academic_year = Column(String, nullable=False)
    term = Column(Enum(ExamTermEnum, name="exam_term_enum", create_type=False), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(Enum(ExamStatusEnum, name="exam_status_enum", create_type=False), default=ExamStatusEnum.DRAFT)
    created_by = Column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    school = relationship("School")
    creator = relationship("User")

class ExamSchedule(CoreModel):
    __tablename__ = "exam_schedules"
    
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    exam_id = Column(ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    class_id = Column(ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    section_id = Column(ForeignKey("sections.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    
    school = relationship("School")
    exam = relationship("Exam")
    class_ = relationship("Class")
    section = relationship("Section")
    subject = relationship("Subject")
    
    exam_date = Column(Date, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    room = Column(String)
    
    max_marks = Column(Float, nullable=False)
    pass_marks = Column(Float, nullable=False)

class StudentExamMark(CoreModel):
    __tablename__ = "student_exam_marks"
    
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    exam_id = Column(ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    exam_schedule_id = Column(ForeignKey("exam_schedules.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    class_id = Column(ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    section_id = Column(ForeignKey("sections.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    
    school = relationship("School")
    exam = relationship("Exam")
    schedule = relationship("ExamSchedule")
    student = relationship("User", foreign_keys=[student_id])
    class_ = relationship("Class")
    section = relationship("Section")
    subject = relationship("Subject")
    
    obtained_marks = Column(Float)
    max_marks = Column(Float, nullable=False)
    grade = Column(String)
    remarks = Column(String)
    attendance_status = Column(String, default="PRESENT")
    
    entered_by = Column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    entered_by_user = relationship("User", foreign_keys=[entered_by])
    
    __table_args__ = (
        UniqueConstraint('exam_schedule_id', 'student_id', name='uq_student_exam_schedule'),
    )

class GradeConfig(CoreModel):
    __tablename__ = "grade_configs"
    
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    grade = Column(String, nullable=False)
    min_percentage = Column(Float, nullable=False)
    max_percentage = Column(Float, nullable=False)
    remarks = Column(String)

class ReportCard(CoreModel):
    __tablename__ = "report_cards"
    
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    exam_id = Column(ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    class_id = Column(ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    section_id = Column(ForeignKey("sections.id", ondelete="CASCADE"), nullable=False)
    
    school = relationship("School")
    exam = relationship("Exam")
    student = relationship("User")
    class_ = relationship("Class")
    section = relationship("Section")
    
    total_marks = Column(Float, nullable=False)
    obtained_marks = Column(Float, nullable=False)
    percentage = Column(Float, nullable=False)
    grade = Column(String)
    rank = Column(Integer)
    result = Column(String, nullable=False) # 'PASS' or 'FAIL'
    generated_at = Column(Date)

    __table_args__ = (
        UniqueConstraint('exam_id', 'student_id', name='uq_student_exam_report'),
    )

from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.common.models.base import CoreModel

class_subjects_association = Table(
    'class_subjects',
    CoreModel.metadata,
    Column('class_id', UUID(as_uuid=True), ForeignKey('classes.id', ondelete="CASCADE"), primary_key=True),
    Column('subject_id', UUID(as_uuid=True), ForeignKey('subjects.id', ondelete="CASCADE"), primary_key=True)
)

class Class(CoreModel):
    __tablename__ = "classes"
    
    name = Column(String, nullable=False, index=True)
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    
    class_teacher_id = Column(ForeignKey("users.id", ondelete="SET NULL", use_alter=True), nullable=True)
    monthly_fee = Column(Integer)
    yearly_fee = Column(Integer)
    
    subjects = relationship("Subject", secondary=class_subjects_association, backref="classes")
    schedules = relationship("ClassSchedule", back_populates="cls", cascade="all, delete-orphan")

class ClassSchedule(CoreModel):
    __tablename__ = "class_schedules"
    
    class_id = Column(ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    teacher_id = Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    
    cls = relationship("Class", back_populates="schedules")

class Section(CoreModel):
    __tablename__ = "sections"
    
    name = Column(String, nullable=False)
    class_id = Column(ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True)
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)

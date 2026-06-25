from sqlalchemy import Column, String, ForeignKey, Date, Enum, UniqueConstraint, Integer
from sqlalchemy.orm import relationship
from src.common.models.base import CoreModel
import enum

class AttendanceStatusEnum(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"
    HALF_DAY = "HALF_DAY"

class CorrectionStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class AttendanceRecord(CoreModel):
    __tablename__ = "attendance_records"
    
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True) # Can be Student or Teacher
    
    school = relationship("School")
    user = relationship("User", foreign_keys=[user_id])
    marker = relationship("User", foreign_keys="[AttendanceRecord.marked_by]")
    
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatusEnum, name="attendance_status_enum", create_type=False), nullable=False)
    
    remarks = Column(String)
    marked_by = Column(ForeignKey("users.id", ondelete="SET NULL"))
    
    __table_args__ = (
        UniqueConstraint('user_id', 'date', name='uq_user_daily_attendance'),
    )

class AttendanceSettings(CoreModel):
    __tablename__ = "attendance_settings"
    
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Timing configurations
    school_start_time = Column(String, default="08:00")
    school_end_time = Column(String, default="14:00")
    late_threshold_minutes = Column(Integer, default=15)
    half_day_threshold_minutes = Column(Integer, default=120)
    
    # Feature toggles
    enable_rfid = Column(String, default="false")
    enable_biometric = Column(String, default="false")
    auto_absent_time = Column(String, default="10:00")

class RfidCard(CoreModel):
    __tablename__ = "rfid_cards"
    
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    rfid_number = Column(String, nullable=False, unique=True)
    is_active = Column(String, default="true")
    assigned_date = Column(Date)
    
    user = relationship("User")
    school = relationship("School")

class AttendanceCorrectionRequest(CoreModel):
    __tablename__ = "attendance_correction_requests"
    
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    attendance_record_id = Column(ForeignKey("attendance_records.id", ondelete="CASCADE"), nullable=False)
    
    requested_date = Column(Date, nullable=False)
    original_status = Column(Enum(AttendanceStatusEnum, name="attendance_status_enum", create_type=False), nullable=False)
    requested_status = Column(Enum(AttendanceStatusEnum, name="attendance_status_enum", create_type=False), nullable=False)
    reason = Column(String, nullable=False)
    
    status = Column(Enum(CorrectionStatusEnum, name="correction_status_enum", create_type=False), default=CorrectionStatusEnum.PENDING)
    resolved_by = Column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolved_at = Column(Date, nullable=True)
    
    user = relationship("User", foreign_keys=[user_id])
    resolver = relationship("User", foreign_keys=[resolved_by])
    attendance_record = relationship("AttendanceRecord")

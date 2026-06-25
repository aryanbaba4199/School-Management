from sqlalchemy import Column, String, ForeignKey, Date, Enum, UniqueConstraint
from src.common.models.base import CoreModel
import enum

class AttendanceStatusEnum(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"
    HALF_DAY = "HALF_DAY"

class AttendanceRecord(CoreModel):
    __tablename__ = "attendance_records"
    
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True) # Can be Student or Teacher
    
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatusEnum, name="attendance_status_enum", create_type=False), nullable=False)
    
    remarks = Column(String)
    marked_by = Column(ForeignKey("users.id", ondelete="SET NULL"))
    
    __table_args__ = (
        UniqueConstraint('user_id', 'date', name='uq_user_daily_attendance'),
    )

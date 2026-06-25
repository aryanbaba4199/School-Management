from sqlalchemy import Column, String, Float, ForeignKey, Date, Enum
from src.common.models.base import CoreModel
import enum

class FeeStatusEnum(str, enum.Enum):
    PAID = "PAID"
    UNPAID = "UNPAID"
    OVERDUE = "OVERDUE"
    PARTIAL = "PARTIAL"

class FeeRecord(CoreModel):
    __tablename__ = "fee_records"
    
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    amount = Column(Float, nullable=False)
    due_date = Column(Date, nullable=False)
    
    status = Column(Enum(FeeStatusEnum, name="fee_status_enum", create_type=False), default=FeeStatusEnum.UNPAID)
    
    description = Column(String)

class FeeTransaction(CoreModel):
    __tablename__ = "fee_transactions"
    
    fee_record_id = Column(ForeignKey("fee_records.id", ondelete="CASCADE"), nullable=False, index=True)
    amount_paid = Column(Float, nullable=False)
    payment_date = Column(Date, nullable=False)
    payment_method = Column(String) # CASH, CARD, UPI
    transaction_reference = Column(String)
    collected_by = Column(ForeignKey("users.id", ondelete="SET NULL"))

from typing import Optional
from uuid import UUID
from datetime import date
from pydantic import BaseModel
from src.common.schemas import CoreSchema
from .models import FeeStatusEnum

class FeeRecordBase(BaseModel):
    school_id: UUID
    student_id: UUID
    amount: float
    due_date: date
    status: FeeStatusEnum = FeeStatusEnum.UNPAID
    description: Optional[str] = None

class FeeRecordCreate(FeeRecordBase):
    pass

class FeeRecordUpdate(BaseModel):
    amount: Optional[float] = None
    due_date: Optional[date] = None
    status: Optional[FeeStatusEnum] = None
    description: Optional[str] = None

class FeeRecordResponse(CoreSchema, FeeRecordBase):
    pass

class FeeTransactionBase(BaseModel):
    fee_record_id: UUID
    amount_paid: float
    payment_date: date
    payment_method: Optional[str] = None
    transaction_reference: Optional[str] = None
    collected_by: Optional[UUID] = None

class FeeTransactionCreate(FeeTransactionBase):
    pass

class FeeTransactionUpdate(BaseModel):
    pass

class FeeTransactionResponse(CoreSchema, FeeTransactionBase):
    pass

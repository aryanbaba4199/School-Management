from typing import Optional, Any
from uuid import UUID
from datetime import date
from pydantic import BaseModel, model_validator
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

class BulkFeeGenerateRequest(BaseModel):
    school_id: Optional[UUID] = None
    class_id: UUID
    amount: float
    due_date: date
    description: Optional[str] = None

class FeeRecordResponse(CoreSchema):
    school_id: UUID
    student_id: Any
    amount: float
    due_date: date
    status: FeeStatusEnum
    description: Optional[str] = None
    
    @model_validator(mode='before')
    @classmethod
    def format_response(cls, data: Any) -> Any:
        if isinstance(data, dict): return data
        result = {
            "id": data.id, "created_at": data.created_at, "updated_at": data.updated_at,
            "school_id": data.school_id, "amount": data.amount, "due_date": data.due_date,
            "status": data.status, "description": data.description
        }
        
        if hasattr(data, 'student') and data.student:
            result["student_id"] = {"id": str(data.student.id), "name": data.student.name, "user_code": getattr(data.student, 'user_code', '')}
        else: result["student_id"] = str(data.student_id)
        
        return result

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

class FeeTransactionResponse(CoreSchema):
    fee_record_id: UUID
    amount_paid: float
    payment_date: date
    payment_method: Optional[str] = None
    transaction_reference: Optional[str] = None
    collected_by: Any
    
    @model_validator(mode='before')
    @classmethod
    def format_response(cls, data: Any) -> Any:
        if isinstance(data, dict): return data
        result = {
            "id": data.id, "created_at": data.created_at, "updated_at": data.updated_at,
            "fee_record_id": data.fee_record_id, "amount_paid": data.amount_paid,
            "payment_date": data.payment_date, "payment_method": data.payment_method,
            "transaction_reference": data.transaction_reference
        }
        
        if hasattr(data, 'collector') and data.collector:
            result["collected_by"] = {"id": str(data.collector.id), "name": data.collector.name}
        else: result["collected_by"] = str(data.collected_by) if data.collected_by else None
        
        return result

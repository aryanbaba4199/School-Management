from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import date

from src.common.dependencies import get_db, RoleChecker, get_current_user
from src.modules.user.models import User
from .models import FeeStatusEnum
from . import schemas, repository

router = APIRouter()

# --- Transactions ---
@router.get("/transactions", response_model=List[schemas.FeeTransactionResponse])
def read_transactions(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT"]))
) -> Any:
    # To properly filter transactions by school, we'd join FeeRecord.
    # For now, just generic multi logic
    return repository.fee_transaction.get_multi(db, skip=skip, limit=limit)

@router.post("/pay-receipt", response_model=schemas.FeeTransactionResponse)
def process_payment(
    transaction_in: schemas.FeeTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT"]))
) -> Any:
    # 1. Update FeeRecord status if fully paid
    fee_record = repository.fee_record.get(db, id=transaction_in.fee_record_id)
    if not fee_record:
        raise HTTPException(status_code=404, detail="Fee record not found")
        
    # Auto mark paid if amount >= fee amount (simplified logic)
    if transaction_in.amount_paid >= fee_record.amount:
        repository.fee_record.update(db, db_obj=fee_record, obj_in={"status": FeeStatusEnum.PAID})
    elif transaction_in.amount_paid > 0:
        repository.fee_record.update(db, db_obj=fee_record, obj_in={"status": FeeStatusEnum.PARTIAL})

    transaction_in.collected_by = current_user.id
    return repository.fee_transaction.create(db, obj_in=transaction_in)

# --- Fee Generation ---
@router.post("/generate", response_model=schemas.FeeRecordResponse)
def generate_fee(
    fee_in: schemas.FeeRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    if current_user.role.value == "SCHOOL_ADMIN" and fee_in.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return repository.fee_record.create(db, obj_in=fee_in)

@router.post("/generate-bulk")
def generate_bulk_fee(
    # Takes school_id, year, month, etc.
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    # Bulk logic placeholder
    return {"message": "Bulk fee generation initiated"}

# --- Specific Retrievals ---
@router.get("/student/{student_id}", response_model=List[schemas.FeeRecordResponse])
def get_student_fees(
    student_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Students can view their own, Parents their child's, Admins view any.
    if current_user.role.value == "STUDENT" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Needs a custom repo method or filter
    return db.query(repository.fee_record.model).filter(
        repository.fee_record.model.student_id == student_id
    ).all()

@router.get("/cycle/{year}/{month}", response_model=List[schemas.FeeRecordResponse])
def get_cycle_fees(
    year: int, month: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    # Dummy logic for now
    return []

# --- Status Updates ---
@router.put("/{id}/pay", response_model=schemas.FeeRecordResponse)
def mark_fee_paid(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT"]))
) -> Any:
    fee = repository.fee_record.get(db, id=id)
    if not fee:
        raise HTTPException(status_code=404, detail="Fee not found")
    if current_user.role.value != "SUPER_ADMIN" and fee.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return repository.fee_record.update(db, db_obj=fee, obj_in={"status": FeeStatusEnum.PAID})

@router.put("/{id}/mark-due", response_model=schemas.FeeRecordResponse)
def mark_fee_due(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "ACCOUNTANT"]))
) -> Any:
    fee = repository.fee_record.get(db, id=id)
    if not fee:
        raise HTTPException(status_code=404, detail="Fee not found")
    if current_user.role.value != "SUPER_ADMIN" and fee.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return repository.fee_record.update(db, db_obj=fee, obj_in={"status": FeeStatusEnum.UNPAID})

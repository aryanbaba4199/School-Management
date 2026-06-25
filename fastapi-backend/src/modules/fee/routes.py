from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import date

from src.common.dependencies import get_db, RoleChecker, get_current_user
from src.common.schemas import PaginatedResponse
from src.modules.user.models import User
from .models import FeeStatusEnum
from . import schemas, repository

router = APIRouter()

# --- Transactions ---
@router.get("/transactions", response_model=PaginatedResponse[schemas.FeeTransactionResponse])
def get_fee_transactions(
    page: int = 1, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Need to filter by school if not super admin
    # This involves a join with FeeRecord which is a bit complex for base get_multi, so stubbing
    skip = (page - 1) * limit
    records, total_count = repository.fee_transaction.get_multi(db, skip=skip, limit=limit)
    return {
        "data": records,
        "pagination": {
            "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "total_count": total_count,
            "current_page": page,
            "limit": limit
        }
    }

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
    bulk_in: schemas.BulkFeeGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    school_id = bulk_in.school_id or current_user.school_id
    if not school_id:
        raise HTTPException(status_code=400, detail="School ID is required")
        
    # Get students for the class
    students = db.query(User).filter(User.class_id == bulk_in.class_id, User.role == "STUDENT").all()
    count = 0
    for student in students:
        record = repository.fee_record.model(
            school_id=school_id,
            student_id=student.id,
            amount=bulk_in.amount,
            due_date=bulk_in.due_date,
            description=bulk_in.description
        )
        db.add(record)
        count += 1
    db.commit()
    return {"message": f"Bulk fee generated for {count} students"}

# --- Specific Retrievals ---
@router.get("/student/{student_id}", response_model=PaginatedResponse[schemas.FeeRecordResponse])
def get_student_fees(
    student_id: UUID,
    page: int = 1, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Security check: if role=PARENT, must verify student_id is their child
    # If role=STUDENT, student_id must be self
    if current_user.role.value == "STUDENT" and student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Can only view own fees")
        
    skip = (page - 1) * limit
    records, total_count = repository.fee_record.get_multi(db, skip=skip, limit=limit)
    filtered_records = [r for r in records if r.student_id == student_id]
    filtered_total = len(filtered_records)
    
    return {
        "data": filtered_records,
        "pagination": {
            "total_pages": (filtered_total + limit - 1) // limit if limit > 0 else 1,
            "total_count": filtered_total,
            "current_page": page,
            "limit": limit
        }
    }

@router.get("/cycle/{year}/{month}", response_model=PaginatedResponse[schemas.FeeRecordResponse])
def get_cycle_fees(
    year: int, month: int,
    page: int = 1, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    skip = (page - 1) * limit
    
    # Very basic date filter - could be improved based on exact month logic
    from sqlalchemy import extract
    query = db.query(repository.fee_record.model)
    if school_id:
        query = query.filter(repository.fee_record.model.school_id == school_id)
    query = query.filter(
        extract('year', repository.fee_record.model.due_date) == year,
        extract('month', repository.fee_record.model.due_date) == month
    )
    
    total_count = query.count()
    records = query.offset(skip).limit(limit).all()
    
    return {
        "data": records,
        "pagination": {
            "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "total_count": total_count,
            "current_page": page,
            "limit": limit
        }
    }

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

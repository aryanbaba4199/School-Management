from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import date

from src.common.dependencies import get_db, RoleChecker, get_current_user
from src.modules.user.models import User
from . import schemas, repository

router = APIRouter()

# --- Student Attendance ---
@router.post("/students/mark", response_model=schemas.AttendanceRecordResponse)
def mark_student_attendance(
    record_in: schemas.AttendanceRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]))
) -> Any:
    if current_user.role.value != "SUPER_ADMIN" and record_in.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Cannot mark attendance for another school")
    record_in.marked_by = current_user.id
    return repository.attendance_record.create(db, obj_in=record_in)

@router.post("/students/bulk", response_model=List[schemas.AttendanceRecordResponse])
def bulk_mark_student_attendance(
    records_in: List[schemas.AttendanceRecordCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]))
) -> Any:
    results = []
    for record_in in records_in:
        if current_user.role.value != "SUPER_ADMIN" and record_in.school_id != current_user.school_id:
            continue
        record_in.marked_by = current_user.id
        results.append(repository.attendance_record.create(db, obj_in=record_in))
    return results

@router.get("/students", response_model=List[schemas.AttendanceRecordResponse])
def get_student_attendance(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    # Add proper role filtering logic here for users checking their own records
    return repository.attendance_record.get_multi(db, skip=skip, limit=limit, school_id=school_id)

@router.put("/students/{id}", response_model=schemas.AttendanceRecordResponse)
def update_student_attendance(
    id: UUID,
    record_in: schemas.AttendanceRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]))
) -> Any:
    record = repository.attendance_record.get(db, id=id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    if current_user.role.value != "SUPER_ADMIN" and record.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return repository.attendance_record.update(db, db_obj=record, obj_in=record_in)

# --- Teacher Attendance ---
@router.post("/teachers/mark", response_model=schemas.AttendanceRecordResponse)
def mark_teacher_attendance(
    record_in: schemas.AttendanceRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    if current_user.role.value != "SUPER_ADMIN" and record_in.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Cannot mark attendance for another school")
    record_in.marked_by = current_user.id
    return repository.attendance_record.create(db, obj_in=record_in)

@router.post("/teachers/bulk", response_model=List[schemas.AttendanceRecordResponse])
def bulk_mark_teacher_attendance(
    records_in: List[schemas.AttendanceRecordCreate],
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    results = []
    for record_in in records_in:
        if current_user.role.value != "SUPER_ADMIN" and record_in.school_id != current_user.school_id:
            continue
        record_in.marked_by = current_user.id
        results.append(repository.attendance_record.create(db, obj_in=record_in))
    return results

@router.get("/teachers", response_model=List[schemas.AttendanceRecordResponse])
def get_teacher_attendance(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]))
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    return repository.attendance_record.get_multi(db, skip=skip, limit=limit, school_id=school_id)

@router.put("/teachers/{id}", response_model=schemas.AttendanceRecordResponse)
def update_teacher_attendance(
    id: UUID,
    record_in: schemas.AttendanceRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    record = repository.attendance_record.get(db, id=id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    if current_user.role.value != "SUPER_ADMIN" and record.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return repository.attendance_record.update(db, db_obj=record, obj_in=record_in)

# --- Reports ---
@router.get("/reports/daily", response_model=List[schemas.AttendanceRecordResponse])
def get_daily_report(
    query_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    # Dummy logic to be updated later
    return []

@router.get("/reports/monthly", response_model=List[schemas.AttendanceRecordResponse])
def get_monthly_report(
    year: int, month: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    # Dummy logic to be updated later
    return []

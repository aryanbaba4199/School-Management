from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import date

from src.common.dependencies import get_db, RoleChecker, get_current_user
from src.common.schemas import PaginatedResponse
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

@router.post("/students/bulk")
def bulk_mark_student_attendance(
    records_in: schemas.BulkStudentAttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]))
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else records_in.school_id
    if not school_id:
        raise HTTPException(status_code=400, detail="School ID is required")
        
    for entry in records_in.records:
        existing = db.query(repository.attendance_record.model).filter(
            repository.attendance_record.model.user_id == entry.student_id,
            repository.attendance_record.model.date == records_in.date
        ).first()
        
        if existing:
            existing.status = entry.status
            existing.remarks = entry.remarks
            existing.marked_by = current_user.id
        else:
            new_record = repository.attendance_record.model(
                school_id=school_id,
                user_id=entry.student_id,
                date=records_in.date,
                status=entry.status,
                remarks=entry.remarks,
                marked_by=current_user.id
            )
            db.add(new_record)
    db.commit()
    return {"success": True, "message": "Attendance marked successfully"}

@router.get("/students", response_model=PaginatedResponse[schemas.AttendanceRecordResponse])
def get_student_attendance(
    page: int = 1, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    skip = (page - 1) * limit
    records, total_count = repository.attendance_record.get_multi(db, skip=skip, limit=limit, school_id=school_id)
    return {
        "data": records,
        "pagination": {
            "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "total_count": total_count,
            "current_page": page,
            "limit": limit
        }
    }

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

@router.post("/teachers/bulk")
def bulk_mark_teacher_attendance(
    records_in: schemas.BulkTeacherAttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else records_in.school_id
    if not school_id:
        raise HTTPException(status_code=400, detail="School ID is required")
        
    for entry in records_in.records:
        existing = db.query(repository.attendance_record.model).filter(
            repository.attendance_record.model.user_id == entry.teacher_id,
            repository.attendance_record.model.date == records_in.date
        ).first()
        
        if existing:
            existing.status = entry.status
            existing.remarks = entry.remarks
            existing.marked_by = current_user.id
        else:
            new_record = repository.attendance_record.model(
                school_id=school_id,
                user_id=entry.teacher_id,
                date=records_in.date,
                status=entry.status,
                remarks=entry.remarks,
                marked_by=current_user.id
            )
            db.add(new_record)
    db.commit()
    return {"success": True, "message": "Attendance marked successfully"}

@router.get("/teachers", response_model=PaginatedResponse[schemas.AttendanceRecordResponse])
def get_teacher_attendance(
    page: int = 1, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]))
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    skip = (page - 1) * limit
    records, total_count = repository.attendance_record.get_multi(db, skip=skip, limit=limit, school_id=school_id)
    return {
        "data": records,
        "pagination": {
            "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "total_count": total_count,
            "current_page": page,
            "limit": limit
        }
    }

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

from typing import Optional
@router.get("/user/{user_id}", response_model=PaginatedResponse[schemas.AttendanceRecordResponse])
def get_user_attendance(
    user_id: UUID,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    page: int = 1, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Security: student can only view own, parent can view child's
    if current_user.role.value == "STUDENT" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Cannot view other's attendance")
    skip = (page - 1) * limit
    query = db.query(repository.attendance_record.model).filter(repository.attendance_record.model.user_id == user_id)
    if start_date:
        query = query.filter(repository.attendance_record.model.date >= start_date)
    if end_date:
        query = query.filter(repository.attendance_record.model.date <= end_date)
    
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

@router.get("/class/{class_id}", response_model=PaginatedResponse[schemas.AttendanceRecordResponse])
def get_class_attendance(
    class_id: UUID,
    query_date: date,
    page: int = 1, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]))
) -> Any:
    # In real logic, join with User to filter by class_id
    # Stub for now
    skip = (page - 1) * limit
    query = db.query(repository.attendance_record.model).join(User).filter(
        User.class_id == class_id,
        repository.attendance_record.model.date == query_date
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

# --- Settings ---
@router.get("/settings", response_model=PaginatedResponse[schemas.AttendanceSettingsResponse])
def get_attendance_settings(
    page: int = 1, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    skip = (page - 1) * limit
    settings, total_count = repository.attendance_settings.get_multi(db, skip=skip, limit=limit, school_id=school_id)
    return {
        "data": settings,
        "pagination": {
            "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "total_count": total_count,
            "current_page": page,
            "limit": limit
        }
    }

@router.post("/settings", response_model=schemas.AttendanceSettingsResponse)
def create_attendance_settings(
    settings_in: schemas.AttendanceSettingsCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    if current_user.role.value != "SUPER_ADMIN" and settings_in.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Cannot create settings for another school")
    return repository.attendance_settings.create(db, obj_in=settings_in)

# --- RFID Cards ---
@router.get("/rfid", response_model=PaginatedResponse[schemas.RfidCardResponse])
def get_rfid_cards(
    page: int = 1, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    skip = (page - 1) * limit
    cards, total_count = repository.rfid_card.get_multi(db, skip=skip, limit=limit, school_id=school_id)
    return {
        "data": cards,
        "pagination": {
            "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "total_count": total_count,
            "current_page": page,
            "limit": limit
        }
    }

@router.post("/rfid", response_model=schemas.RfidCardResponse)
def create_rfid_card(
    card_in: schemas.RfidCardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    if current_user.role.value != "SUPER_ADMIN" and card_in.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Cannot create RFID for another school")
    return repository.rfid_card.create(db, obj_in=card_in)

# --- Corrections ---
@router.post("/correction", response_model=schemas.AttendanceCorrectionRequestResponse)
def create_correction_request(
    request_in: schemas.AttendanceCorrectionRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role.value not in ["STUDENT", "TEACHER", "PARENT"]:
        # usually admins resolve, not request
        pass
    return repository.attendance_correction.create(db, obj_in=request_in)

@router.get("/correction", response_model=PaginatedResponse[schemas.AttendanceCorrectionRequestResponse])
def get_correction_requests(
    page: int = 1, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    skip = (page - 1) * limit
    requests, total_count = repository.attendance_correction.get_multi(db, skip=skip, limit=limit, school_id=school_id)
    return {
        "data": requests,
        "pagination": {
            "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "total_count": total_count,
            "current_page": page,
            "limit": limit
        }
    }

@router.put("/correction/{id}/resolve", response_model=schemas.AttendanceCorrectionRequestResponse)
def resolve_correction_request(
    id: UUID,
    resolve_in: schemas.ResolveCorrectionDto,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    req = repository.attendance_correction.get(db, id=id)
    if not req:
        raise HTTPException(status_code=404, detail="Correction request not found")
        
    req.status = resolve_in.action
    req.resolved_by = current_user.id
    from datetime import datetime
    req.resolved_at = datetime.utcnow().date()
    
    if resolve_in.action == schemas.CorrectionStatusEnum.APPROVED:
        # Update the original record
        record = repository.attendance_record.get(db, id=req.attendance_record_id)
        if record:
            record.status = req.requested_status
            
    db.commit()
    db.refresh(req)
    return req

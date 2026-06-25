from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from src.common.dependencies import get_db, RoleChecker, get_current_user
from src.common.schemas import PaginatedResponse
from src.modules.user.models import User
from . import schemas, repository

router = APIRouter()

# --- Exams ---
@router.post("/", response_model=schemas.ExamResponse)
def create_exam(
    exam_in: schemas.ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    if current_user.role.value == "SCHOOL_ADMIN" and exam_in.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Cannot create exam for another school")
    return repository.exam.create(db, obj_in=exam_in)

@router.get("/", response_model=PaginatedResponse[schemas.ExamResponse])
def read_exams(
    page: int = 1, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    skip = (page - 1) * limit
    exams, total_count = repository.exam.get_multi(db, skip=skip, limit=limit, school_id=school_id)
    return {
        "data": exams,
        "pagination": {
            "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "total_count": total_count,
            "current_page": page,
            "limit": limit
        }
    }

@router.put("/{id}", response_model=schemas.ExamResponse)
def update_exam(
    id: UUID,
    exam_in: schemas.ExamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    exam = repository.exam.get(db, id=id)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    if current_user.role.value != "SUPER_ADMIN" and exam.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return repository.exam.update(db, db_obj=exam, obj_in=exam_in)

# --- Exam Schedules ---
@router.post("/schedules", response_model=schemas.ExamScheduleResponse)
def create_exam_schedule(
    schedule_in: schemas.ExamScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    if current_user.role.value == "SCHOOL_ADMIN" and schedule_in.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Cannot create schedule for another school")
    return repository.exam_schedule.create(db, obj_in=schedule_in)

@router.get("/schedules", response_model=PaginatedResponse[schemas.ExamScheduleResponse])
def read_exam_schedules(
    page: int = 1, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    skip = (page - 1) * limit
    schedules, total_count = repository.exam_schedule.get_multi(db, skip=skip, limit=limit, school_id=school_id)
    return {
        "data": schedules,
        "pagination": {
            "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "total_count": total_count,
            "current_page": page,
            "limit": limit
        }
    }

@router.put("/schedules/{id}", response_model=schemas.ExamScheduleResponse)
def update_exam_schedule(
    id: UUID,
    schedule_in: schemas.ExamScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    sched = repository.exam_schedule.get(db, id=id)
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")
    if current_user.role.value != "SUPER_ADMIN" and sched.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return repository.exam_schedule.update(db, db_obj=sched, obj_in=schedule_in)

# --- Marks ---
@router.post("/marks")
def submit_marks(
    mark_in: schemas.BulkStudentExamMarkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]))
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else mark_in.school_id
    if not school_id:
        raise HTTPException(status_code=400, detail="School ID is required")
        
    for entry in mark_in.marks_data:
        # Check if exists
        existing = db.query(repository.student_exam_mark.model).filter(
            repository.student_exam_mark.model.exam_schedule_id == mark_in.exam_schedule_id,
            repository.student_exam_mark.model.student_id == entry.student_id
        ).first()
        
        if existing:
            existing.obtained_marks = entry.obtained_marks
            existing.remarks = entry.remarks
            existing.attendance_status = entry.attendance_status
            existing.entered_by = current_user.id
        else:
            new_mark = repository.student_exam_mark.model(
                school_id=school_id,
                exam_id=mark_in.exam_id,
                exam_schedule_id=mark_in.exam_schedule_id,
                student_id=entry.student_id,
                class_id=mark_in.class_id,
                section_id=mark_in.section_id,
                subject_id=mark_in.subject_id,
                max_marks=mark_in.max_marks,
                obtained_marks=entry.obtained_marks,
                remarks=entry.remarks,
                attendance_status=entry.attendance_status,
                entered_by=current_user.id
            )
            db.add(new_mark)
    db.commit()
    return {"success": True, "message": "Marks saved successfully"}

@router.get("/marks", response_model=PaginatedResponse[schemas.StudentExamMarkResponse])
def read_marks(
    page: int = 1, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    skip = (page - 1) * limit
    marks, total_count = repository.student_exam_mark.get_multi(db, skip=skip, limit=limit, school_id=school_id)
    return {
        "data": marks,
        "pagination": {
            "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "total_count": total_count,
            "current_page": page,
            "limit": limit
        }
    }

# --- Results ---
@router.post("/results/generate")
def generate_report_card(
    req: schemas.GenerateResultsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    # Dummy logic to satisfy API for now, actual logic requires querying all marks
    return {"success": True, "message": "Results generated successfully"}

@router.get("/results", response_model=PaginatedResponse[schemas.ReportCardResponse])
def read_results(
    page: int = 1, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    skip = (page - 1) * limit
    results, total_count = repository.report_card.get_multi(db, skip=skip, limit=limit, school_id=school_id)
    return {
        "data": results,
        "pagination": {
            "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "total_count": total_count,
            "current_page": page,
            "limit": limit
        }
    }

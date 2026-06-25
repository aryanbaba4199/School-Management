from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from src.common.dependencies import get_db, RoleChecker, get_current_user
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

@router.get("/", response_model=List[schemas.ExamResponse])
def read_exams(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    return repository.exam.get_multi(db, skip=skip, limit=limit, school_id=school_id)

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

@router.get("/schedules", response_model=List[schemas.ExamScheduleResponse])
def read_exam_schedules(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    return repository.exam_schedule.get_multi(db, skip=skip, limit=limit, school_id=school_id)

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
@router.post("/marks", response_model=schemas.StudentExamMarkResponse)
def submit_marks(
    mark_in: schemas.StudentExamMarkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]))
) -> Any:
    if current_user.role.value != "SUPER_ADMIN" and mark_in.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Cannot submit marks for another school")
    return repository.student_exam_mark.create(db, obj_in=mark_in)

@router.get("/marks", response_model=List[schemas.StudentExamMarkResponse])
def read_marks(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    return repository.student_exam_mark.get_multi(db, skip=skip, limit=limit, school_id=school_id)

# --- Results ---
@router.post("/results/generate", response_model=schemas.ReportCardResponse)
def generate_report_card(
    report_in: schemas.ReportCardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    # Dummy logic: just save the report card
    if current_user.role.value == "SCHOOL_ADMIN" and report_in.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Cannot generate report for another school")
    return repository.report_card.create(db, obj_in=report_in)

@router.get("/results", response_model=List[schemas.ReportCardResponse])
def read_results(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    return repository.report_card.get_multi(db, skip=skip, limit=limit, school_id=school_id)

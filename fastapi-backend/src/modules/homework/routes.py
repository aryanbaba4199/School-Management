from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from src.common.dependencies import get_db, RoleChecker, get_current_user
from src.modules.user.models import User
from . import schemas, repository

router = APIRouter()

# --- Homework ---
@router.post("/", response_model=schemas.HomeworkResponse)
def create_homework(
    homework_in: schemas.HomeworkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]))
) -> Any:
    if current_user.role.value != "SUPER_ADMIN" and homework_in.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Cannot create homework for another school")
    return repository.homework.create(db, obj_in=homework_in)

@router.get("/", response_model=List[schemas.HomeworkResponse])
def read_homeworks(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    return repository.homework.get_multi(db, skip=skip, limit=limit, school_id=school_id)

@router.get("/{id}", response_model=schemas.HomeworkResponse)
def read_homework(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    hw = repository.homework.get(db, id=id)
    if not hw:
        raise HTTPException(status_code=404, detail="Homework not found")
    if current_user.role.value != "SUPER_ADMIN" and hw.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return hw

@router.put("/{id}", response_model=schemas.HomeworkResponse)
def update_homework(
    id: UUID,
    homework_in: schemas.HomeworkUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]))
) -> Any:
    hw = repository.homework.get(db, id=id)
    if not hw:
        raise HTTPException(status_code=404, detail="Homework not found")
    if current_user.role.value != "SUPER_ADMIN" and hw.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return repository.homework.update(db, db_obj=hw, obj_in=homework_in)

@router.delete("/{id}", response_model=schemas.HomeworkResponse)
def delete_homework(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]))
) -> Any:
    hw = repository.homework.get(db, id=id)
    if not hw:
        raise HTTPException(status_code=404, detail="Homework not found")
    if current_user.role.value != "SUPER_ADMIN" and hw.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return repository.homework.remove(db, id=id)

# --- Homework Submissions ---
@router.post("/{id}/submit", response_model=schemas.HomeworkSubmissionResponse)
def submit_homework(
    id: UUID,
    submission_in: schemas.HomeworkSubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["STUDENT"]))
) -> Any:
    if submission_in.homework_id != id:
        raise HTTPException(status_code=400, detail="Homework ID mismatch")
    return repository.homework_submission.create(db, obj_in=submission_in)

@router.get("/{id}/submissions", response_model=List[schemas.HomeworkSubmissionResponse])
def get_homework_submissions(
    id: UUID,
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]))
) -> Any:
    hw = repository.homework.get(db, id=id)
    if not hw:
        raise HTTPException(status_code=404, detail="Homework not found")
    if current_user.role.value != "SUPER_ADMIN" and hw.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    # Custom filtering can be done here, for now using base
    return repository.homework_submission.get_multi(db, skip=skip, limit=limit)

@router.put("/submissions/{submission_id}/grade", response_model=schemas.HomeworkSubmissionResponse)
def grade_submission(
    submission_id: UUID,
    grade_in: schemas.HomeworkSubmissionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]))
) -> Any:
    sub = repository.homework_submission.get(db, id=submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return repository.homework_submission.update(db, db_obj=sub, obj_in=grade_in)

from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from src.common.dependencies import get_db, RoleChecker, get_current_user
from src.common.schemas import PaginatedResponse
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
    homework_in.teacher_id = current_user.id
    return repository.homework.create(db, obj_in=homework_in)

@router.get("/", response_model=PaginatedResponse[schemas.HomeworkResponse])
def read_homeworks(
    page: int = 1, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    skip = (page - 1) * limit
    homeworks, total_count = repository.homework.get_multi(db, skip=skip, limit=limit, school_id=school_id)
    return {
        "data": homeworks,
        "pagination": {
            "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "total_count": total_count,
            "current_page": page,
            "limit": limit
        }
    }

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

@router.get("/{id}/submissions", response_model=PaginatedResponse[schemas.HomeworkSubmissionResponse])
def read_homework_submissions(
    id: UUID,
    page: int = 1, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"]))
) -> Any:
    skip = (page - 1) * limit
    submissions, total_count = repository.homework_submission.get_multi(db, skip=skip, limit=limit)
    # We should add logic to filter by homework_id to the repo, for now this is just a stub logic update
    # Note: Phase 5 will align the models and we can fix queries there
    filtered_submissions = [s for s in submissions if s.homework_id == id]
    filtered_total = len(filtered_submissions)
    
    return {
        "data": filtered_submissions,
        "pagination": {
            "total_pages": (filtered_total + limit - 1) // limit if limit > 0 else 1,
            "total_count": filtered_total,
            "current_page": page,
            "limit": limit
        }
    }

@router.get("/student/dashboard", response_model=PaginatedResponse[schemas.HomeworkResponse])
def get_student_dashboard(
    page: int = 1, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["STUDENT"]))
) -> Any:
    # Get homeworks for the student's class and section
    skip = (page - 1) * limit
    
    query = db.query(repository.homework.model).filter(
        repository.homework.model.class_id == current_user.class_id,
        repository.homework.model.section_id == current_user.section_id
    )
    total_count = query.count()
    homeworks = query.offset(skip).limit(limit).all()
    
    return {
        "data": homeworks,
        "pagination": {
            "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "total_count": total_count,
            "current_page": page,
            "limit": limit
        }
    }

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
        
    grade_in_dict = grade_in.model_dump(exclude_unset=True)
    grade_in_dict["graded_by"] = current_user.id
    from datetime import datetime
    grade_in_dict["graded_at"] = datetime.utcnow().date()
    
    return repository.homework_submission.update(db, db_obj=sub, obj_in=grade_in_dict)

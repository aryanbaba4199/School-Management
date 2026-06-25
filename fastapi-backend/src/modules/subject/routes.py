from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from src.common.dependencies import get_db, RoleChecker, get_current_user
from src.modules.user.models import User
from . import schemas, repository

router = APIRouter()

@router.post("/", response_model=schemas.SubjectResponse)
def create_subject(
    subject_in: schemas.SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    if current_user.role.value == "SCHOOL_ADMIN" and subject_in.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Cannot create subject for another school")
    return repository.subject.create(db, obj_in=subject_in)

@router.get("/", response_model=List[schemas.SubjectResponse])
def read_subjects(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    items, _ = repository.subject.get_multi(db, skip=skip, limit=limit, school_id=school_id)
    return items

@router.get("/{id}", response_model=schemas.SubjectResponse)
def read_subject_by_id(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    sub = repository.subject.get(db, id=id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
    if current_user.role.value != "SUPER_ADMIN" and sub.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return sub

@router.put("/{id}", response_model=schemas.SubjectResponse)
def update_subject(
    id: UUID,
    subject_in: schemas.SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    sub = repository.subject.get(db, id=id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
    if current_user.role.value != "SUPER_ADMIN" and sub.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return repository.subject.update(db, db_obj=sub, obj_in=subject_in)

@router.delete("/{id}", response_model=schemas.SubjectResponse)
def delete_subject(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    sub = repository.subject.get(db, id=id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subject not found")
    if current_user.role.value != "SUPER_ADMIN" and sub.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return repository.subject.remove(db, id=id)

from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from src.common.dependencies import get_db, RoleChecker
from src.modules.user.models import User
from . import schemas, repository

router = APIRouter()

# --- School Drafts ---
@router.post("/drafts", response_model=schemas.SchoolDraftResponse)
def create_school_draft(
    draft_in: schemas.SchoolDraftCreate,
    db: Session = Depends(get_db)
) -> Any:
    # Public route for registration flow
    existing = repository.school_draft.get_by_email(db, email=draft_in.email)
    if existing:
        return repository.school_draft.update(db, db_obj=existing, obj_in=draft_in)
    return repository.school_draft.create(db, obj_in=draft_in)

@router.get("/drafts/{email}", response_model=schemas.SchoolDraftResponse)
def get_school_draft(
    email: str,
    db: Session = Depends(get_db)
) -> Any:
    draft = repository.school_draft.get_by_email(db, email=email)
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    return draft

# --- Schools ---
@router.post("/", response_model=schemas.SchoolResponse)
def create_school(
    school_in: schemas.SchoolCreate,
    db: Session = Depends(get_db)
) -> Any:
    # Could be public (during registration) or SUPER_ADMIN only
    if repository.school.get_by_subdomain(db, subdomain=school_in.subdomain):
        raise HTTPException(status_code=400, detail="Subdomain already exists")
    if repository.school.get_by_code(db, code=school_in.code):
        raise HTTPException(status_code=400, detail="School code already exists")
    return repository.school.create(db, obj_in=school_in)

@router.get("/", response_model=List[schemas.SchoolResponse])
def read_schools(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN"]))
) -> Any:
    return repository.school.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=schemas.SchoolResponse)
def read_school_by_id(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    # Ensure SCHOOL_ADMIN can only access their own school
    if current_user.role.value == "SCHOOL_ADMIN" and current_user.school_id != id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    school = repository.school.get(db, id=id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    return school

@router.put("/{id}", response_model=schemas.SchoolResponse)
def update_school(
    id: UUID,
    school_in: schemas.SchoolUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    if current_user.role.value == "SCHOOL_ADMIN" and current_user.school_id != id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    school = repository.school.get(db, id=id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    return repository.school.update(db, db_obj=school, obj_in=school_in)

@router.patch("/{id}/deactivate", response_model=schemas.SchoolResponse)
def deactivate_school(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN"]))
) -> Any:
    school = repository.school.get(db, id=id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    return repository.school.update(db, db_obj=school, obj_in={"is_deactive": not school.is_deactive})

@router.delete("/{id}", response_model=schemas.SchoolResponse)
def delete_school(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN"]))
) -> Any:
    school = repository.school.get(db, id=id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    return repository.school.remove(db, id=id)

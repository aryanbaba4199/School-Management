from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from src.common.dependencies import get_db, RoleChecker, get_current_user
from src.modules.user.models import User
from . import schemas, repository

router = APIRouter()

# --- Classes ---
@router.post("/", response_model=schemas.ClassResponse)
def create_class(
    class_in: schemas.ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    # Ensure School Admin is creating class for their own school
    if current_user.role.value == "SCHOOL_ADMIN" and class_in.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Cannot create class for another school")
    return repository.class_repo.create(db, obj_in=class_in)

@router.get("/", response_model=List[schemas.ClassResponse])
def read_classes(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    return repository.class_repo.get_multi(db, skip=skip, limit=limit, school_id=school_id)

@router.get("/{id}", response_model=schemas.ClassResponse)
def read_class_by_id(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    cls = repository.class_repo.get(db, id=id)
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    if current_user.role.value != "SUPER_ADMIN" and cls.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return cls

@router.put("/{id}", response_model=schemas.ClassResponse)
def update_class(
    id: UUID,
    class_in: schemas.ClassUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    cls = repository.class_repo.get(db, id=id)
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    if current_user.role.value != "SUPER_ADMIN" and cls.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return repository.class_repo.update(db, db_obj=cls, obj_in=class_in)

@router.delete("/{id}", response_model=schemas.ClassResponse)
def delete_class(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    cls = repository.class_repo.get(db, id=id)
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    if current_user.role.value != "SUPER_ADMIN" and cls.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return repository.class_repo.remove(db, id=id)

# --- Sections ---
@router.post("/sections", response_model=schemas.SectionResponse)
def create_section(
    section_in: schemas.SectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    if current_user.role.value == "SCHOOL_ADMIN" and section_in.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return repository.section.create(db, obj_in=section_in)

@router.get("/sections", response_model=List[schemas.SectionResponse])
def read_sections(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    return repository.section.get_multi(db, skip=skip, limit=limit, school_id=school_id)

@router.put("/sections/{id}", response_model=schemas.SectionResponse)
def update_section(
    id: UUID,
    section_in: schemas.SectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    sec = repository.section.get(db, id=id)
    if not sec:
        raise HTTPException(status_code=404, detail="Section not found")
    if current_user.role.value != "SUPER_ADMIN" and sec.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return repository.section.update(db, db_obj=sec, obj_in=section_in)

@router.delete("/sections/{id}", response_model=schemas.SectionResponse)
def delete_section(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    sec = repository.section.get(db, id=id)
    if not sec:
        raise HTTPException(status_code=404, detail="Section not found")
    if current_user.role.value != "SUPER_ADMIN" and sec.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return repository.section.remove(db, id=id)

# --- Class Schedules ---
@router.post("/schedules", response_model=schemas.ClassScheduleResponse)
def create_schedule(
    schedule_in: schemas.ClassScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    return repository.class_schedule.create(db, obj_in=schedule_in)

@router.get("/schedules", response_model=List[schemas.ClassScheduleResponse])
def read_schedules(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    return repository.class_schedule.get_multi(db, skip=skip, limit=limit)

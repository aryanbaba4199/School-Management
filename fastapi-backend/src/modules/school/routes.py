from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from src.common.dependencies import get_db, RoleChecker
from src.common.schemas import PaginatedResponse
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
        
    # Extract admin data
    admin_name = school_in.admin_name
    admin_email = school_in.admin_email
    admin_password = school_in.admin_password
    
    # Create school without admin fields
    school_data = school_in.model_dump(exclude={"admin_name", "admin_email", "admin_password"})
    school = repository.school.create(db, obj_in=schemas.SchoolBase(**school_data))
    
    # Create admin user if credentials provided
    if admin_email and admin_password:
        from src.modules.user.models import UserRoleEnum
        from src.common.utils.security import get_password_hash
        hashed_pw = get_password_hash(admin_password)
        new_user = User(
            name=admin_name or "School Admin",
            email=admin_email,
            password=hashed_pw,
            user_code=f"ADM-{school.code}",
            role=UserRoleEnum.SCHOOL_ADMIN,
            school_id=school.id,
            is_active=True
        )
        db.add(new_user)
        db.commit()
        
    return school

from typing import Optional
@router.get("/", response_model=PaginatedResponse[schemas.SchoolResponse])
def read_schools(
    search: Optional[str] = None,
    page: int = 1, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN"]))
) -> Any:
    skip = (page - 1) * limit
    
    query = db.query(repository.school.model)
    if search:
        from sqlalchemy import or_
        query = query.filter(
            or_(
                repository.school.model.name.ilike(f"%{search}%"),
                repository.school.model.code.ilike(f"%{search}%")
            )
        )
        
    total_count = query.count()
    schools = query.offset(skip).limit(limit).all()
    return {
        "data": schools,
        "pagination": {
            "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "total_count": total_count,
            "current_page": page,
            "limit": limit
        }
    }

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

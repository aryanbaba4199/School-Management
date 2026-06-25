from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from uuid import UUID
import csv
import io

from src.common.dependencies import get_db, get_current_user, RoleChecker
from src.common.schemas import PaginatedResponse, PaginationMeta
from src.common.utils.security import verify_password, create_access_token, get_password_hash
from . import schemas, repository, models

router = APIRouter()

# --- Auth APIs ---

@router.post("/login")
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = repository.user.get_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
        "user": schemas.UserResponse.model_validate(user)
    }

@router.get("/profile", response_model=schemas.UserResponse)
def read_user_me(
    current_user: models.User = Depends(get_current_user)
) -> Any:
    return current_user

@router.put("/profile", response_model=schemas.UserResponse)
def update_user_me(
    user_in: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Any:
    # Cannot change password through this endpoint
    user_in.password = None
    user = repository.user.update(db, db_obj=current_user, obj_in=user_in)
    return user

class PasswordUpdate(schemas.BaseModel):
    current_password: str
    new_password: str

@router.put("/profile/password", response_model=schemas.UserResponse)
def update_password_me(
    pass_in: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Any:
    if not verify_password(pass_in.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    hashed_pass = get_password_hash(pass_in.new_password)
    user = repository.user.update(db, db_obj=current_user, obj_in={"password": hashed_pass})
    return user

# --- User Management APIs ---

@router.post("/", response_model=schemas.UserResponse)
def create_user(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    user = repository.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    user = repository.user.create(db, obj_in=user_in)
    return user

@router.get("/", response_model=PaginatedResponse[schemas.UserResponse])
def read_users(
    page: int = 1,
    limit: int = 100,
    role: Optional[str] = None,
    classId: Optional[UUID] = None,
    sectionId: Optional[UUID] = None,
    schoolId: Optional[UUID] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    # If not super admin, strictly filter by school
    s_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else schoolId
    skip = (page - 1) * limit
    
    query = db.query(repository.user.model)
    if s_id:
        query = query.filter(repository.user.model.school_id == s_id)
    if role:
        query = query.filter(repository.user.model.role == role)
    if classId:
        query = query.filter(repository.user.model.class_id == classId)
    if sectionId:
        query = query.filter(repository.user.model.section_id == sectionId)
        
    total_count = query.count()
    users = query.offset(skip).limit(limit).all()
    
    return {
        "data": users,
        "pagination": {
            "total_pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "total_count": total_count,
            "current_page": page,
            "limit": limit
        }
    }

@router.get("/{id}", response_model=schemas.UserResponse)
def read_user_by_id(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    user = repository.user.get(db, id=id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{id}", response_model=schemas.UserResponse)
def update_user(
    id: UUID,
    user_in: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    user = repository.user.get(db, id=id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user_in.password:
        user_in.password = get_password_hash(user_in.password)
    user = repository.user.update(db, db_obj=user, obj_in=user_in)
    return user

@router.patch("/{id}/status", response_model=schemas.UserResponse)
def toggle_user_status(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    user = repository.user.get(db, id=id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user = repository.user.update(db, db_obj=user, obj_in={"is_active": not user.is_active})
    return user

@router.delete("/{id}", response_model=schemas.UserResponse)
def delete_user(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    user = repository.user.get(db, id=id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user = repository.user.remove(db, id=id)
    return user

@router.post("/generate-code", response_model=schemas.GenerateCodeResponse)
def generate_user_code(
    role: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    prefix = role[:3].upper()
    count = db.query(models.User).filter(models.User.role == role).count()
    code = f"{prefix}-{(count+1):04d}"
    return {"code": code}

@router.get("/{id}/audit-log", response_model=List[schemas.UserAuditLogResponse])
def read_user_audit_log(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    return db.query(models.UserAuditLog).filter(models.UserAuditLog.user_id == id).all()

class BulkImportRequest(schemas.BaseModel):
    csvData: str

@router.post("/bulk-import", response_model=schemas.BulkImportResponse)
def bulk_import_users(
    req: BulkImportRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    f = io.StringIO(req.csvData)
    reader = csv.DictReader(f)
    success = 0
    failed = 0
    errors = []
    
    for row in reader:
        try:
            # Minimal parsing for stub
            email = row.get("email")
            if not email:
                failed += 1
                continue
            if repository.user.get_by_email(db, email=email):
                failed += 1
                errors.append(f"Email {email} already exists")
                continue
            
            hashed_pw = get_password_hash(row.get("password", "password123"))
            user_in = schemas.UserCreate(
                name=row.get("name", "Unknown"),
                email=email,
                password=hashed_pw,
                user_code=row.get("user_code", "U-0000"),
                role=row.get("role", "STUDENT"),
                school_id=current_user.school_id
            )
            repository.user.create(db, obj_in=user_in)
            success += 1
        except Exception as e:
            failed += 1
            errors.append(str(e))
            
    return {"success_count": success, "failed_count": failed, "errors": errors}

@router.get("/export")
def export_users(
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    query = db.query(models.User)
    if current_user.role.value != "SUPER_ADMIN":
        query = query.filter(models.User.school_id == current_user.school_id)
    if role:
        query = query.filter(models.User.role == role)
        
    users = query.all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Name", "Email", "Role", "User Code"])
    for u in users:
        writer.writerow([str(u.id), u.name, u.email, u.role.value, u.user_code])
        
    return Response(content=output.getvalue(), media_type="text/csv")

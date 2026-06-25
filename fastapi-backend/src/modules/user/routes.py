from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from uuid import UUID

from src.common.dependencies import get_db, get_current_user, RoleChecker
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

@router.get("/", response_model=List[schemas.UserResponse])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(RoleChecker(["SUPER_ADMIN", "SCHOOL_ADMIN"]))
) -> Any:
    # If not super admin, strictly filter by school
    school_id = current_user.school_id if current_user.role.value != "SUPER_ADMIN" else None
    users = repository.user.get_multi(db, skip=skip, limit=limit, school_id=school_id)
    return users

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

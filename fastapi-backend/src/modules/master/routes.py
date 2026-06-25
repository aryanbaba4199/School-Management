from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from src.common.dependencies import get_db, RoleChecker
from src.modules.user.models import User
from . import schemas, repository

router = APIRouter()

# --- Countries ---
@router.post("/countries", response_model=schemas.CountryResponse)
def create_country(
    country_in: schemas.CountryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN"]))
) -> Any:
    return repository.country.create(db, obj_in=country_in)

@router.get("/countries", response_model=List[schemas.CountryResponse])
def read_countries(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> Any:
    items, _ = repository.country.get_multi(db, skip=skip, limit=limit)
    return items

# --- States ---
@router.post("/states", response_model=schemas.StateResponse)
def create_state(
    state_in: schemas.StateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN"]))
) -> Any:
    return repository.state.create(db, obj_in=state_in)

@router.get("/states", response_model=List[schemas.StateResponse])
def read_states(
    countryId: Optional[UUID] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> Any:
    query = db.query(repository.state.model)
    if countryId:
        query = query.filter(repository.state.model.country_id == countryId)
    items = query.offset(skip).limit(limit).all()
    return items

# --- Districts ---
@router.post("/districts", response_model=schemas.DistrictResponse)
def create_district(
    district_in: schemas.DistrictCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN"]))
) -> Any:
    return repository.district.create(db, obj_in=district_in)

@router.get("/districts", response_model=List[schemas.DistrictResponse])
def read_districts(
    stateId: Optional[UUID] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> Any:
    query = db.query(repository.district.model)
    if stateId:
        query = query.filter(repository.district.model.state_id == stateId)
    items = query.offset(skip).limit(limit).all()
    return items

# --- Cities ---
@router.post("/cities", response_model=schemas.CityResponse)
def create_city(
    city_in: schemas.CityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN"]))
) -> Any:
    return repository.city.create(db, obj_in=city_in)

@router.get("/cities", response_model=List[schemas.CityResponse])
def read_cities(
    stateId: Optional[UUID] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> Any:
    query = db.query(repository.city.model)
    if stateId:
        query = query.filter(repository.city.model.state_id == stateId)
    items = query.offset(skip).limit(limit).all()
    return items

# --- Board Types ---
@router.post("/board-types", response_model=schemas.BoardTypeResponse)
def create_board_type(
    board_in: schemas.BoardTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN"]))
) -> Any:
    return repository.board_type.create(db, obj_in=board_in)

@router.get("/board-types", response_model=List[schemas.BoardTypeResponse])
def read_board_types(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> Any:
    items, _ = repository.board_type.get_multi(db, skip=skip, limit=limit)
    return items

# --- Subscription Plans ---
@router.post("/subscription-plans", response_model=schemas.SubscriptionPlanResponse)
def create_subscription_plan(
    plan_in: schemas.SubscriptionPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN"]))
) -> Any:
    return repository.subscription_plan.create(db, obj_in=plan_in)

@router.get("/subscription-plans", response_model=List[schemas.SubscriptionPlanResponse])
def read_subscription_plans(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> Any:
    items, _ = repository.subscription_plan.get_multi(db, skip=skip, limit=limit)
    return items

@router.put("/subscription-plans/{id}", response_model=schemas.SubscriptionPlanResponse)
def update_subscription_plan(
    id: UUID,
    plan_in: schemas.SubscriptionPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN"]))
) -> Any:
    plan = repository.subscription_plan.get(db, id=id)
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")
    return repository.subscription_plan.update(db, db_obj=plan, obj_in=plan_in)

@router.delete("/subscription-plans/{id}", response_model=schemas.SubscriptionPlanResponse)
def delete_subscription_plan(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["SUPER_ADMIN"]))
) -> Any:
    plan = repository.subscription_plan.get(db, id=id)
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")
    return repository.subscription_plan.remove(db, id=id)

from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel
from src.common.schemas import CoreSchema

# Country
class CountryBase(BaseModel):
    name: str
    code: str

class CountryCreate(CountryBase):
    pass

class CountryUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None

class CountryResponse(CoreSchema, CountryBase):
    pass

# State
class StateBase(BaseModel):
    name: str
    country_id: UUID

class StateCreate(StateBase):
    pass

class StateUpdate(BaseModel):
    name: Optional[str] = None
    country_id: Optional[UUID] = None

class StateResponse(CoreSchema, StateBase):
    pass

# District
class DistrictBase(BaseModel):
    name: str
    state_id: UUID

class DistrictCreate(DistrictBase):
    pass

class DistrictUpdate(BaseModel):
    name: Optional[str] = None
    state_id: Optional[UUID] = None

class DistrictResponse(CoreSchema, DistrictBase):
    pass

# City
class CityBase(BaseModel):
    name: str
    state_id: UUID

class CityCreate(CityBase):
    pass

class CityUpdate(BaseModel):
    name: Optional[str] = None
    state_id: Optional[UUID] = None

class CityResponse(CoreSchema, CityBase):
    pass

# BoardType
class BoardTypeBase(BaseModel):
    name: str
    code: str

class BoardTypeCreate(BoardTypeBase):
    pass

class BoardTypeUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None

class BoardTypeResponse(CoreSchema, BoardTypeBase):
    pass

# SubscriptionPlan
class SubscriptionPlanBase(BaseModel):
    name: str
    code: str
    price: Dict[str, float]
    max_students: int = 500
    features: Optional[Dict[str, Any]] = None
    is_active: bool = True

class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass

class SubscriptionPlanUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    price: Optional[Dict[str, float]] = None
    max_students: Optional[int] = None
    features: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class SubscriptionPlanResponse(CoreSchema, SubscriptionPlanBase):
    pass

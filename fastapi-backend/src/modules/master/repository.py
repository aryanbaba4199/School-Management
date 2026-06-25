from sqlalchemy.orm import Session
from src.common.repository import CRUDBase
from .models import Country, State, District, City, BoardType, SubscriptionPlan
from .schemas import (
    CountryCreate, CountryUpdate,
    StateCreate, StateUpdate,
    DistrictCreate, DistrictUpdate,
    CityCreate, CityUpdate,
    BoardTypeCreate, BoardTypeUpdate,
    SubscriptionPlanCreate, SubscriptionPlanUpdate
)

class CRUDCountry(CRUDBase[Country, CountryCreate, CountryUpdate]):
    pass

class CRUDState(CRUDBase[State, StateCreate, StateUpdate]):
    pass

class CRUDDistrict(CRUDBase[District, DistrictCreate, DistrictUpdate]):
    pass

class CRUDCity(CRUDBase[City, CityCreate, CityUpdate]):
    pass

class CRUDBoardType(CRUDBase[BoardType, BoardTypeCreate, BoardTypeUpdate]):
    pass

class CRUDSubscriptionPlan(CRUDBase[SubscriptionPlan, SubscriptionPlanCreate, SubscriptionPlanUpdate]):
    pass

country = CRUDCountry(Country)
state = CRUDState(State)
district = CRUDDistrict(District)
city = CRUDCity(City)
board_type = CRUDBoardType(BoardType)
subscription_plan = CRUDSubscriptionPlan(SubscriptionPlan)

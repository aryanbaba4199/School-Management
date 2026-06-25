from typing import Optional
from uuid import UUID
from datetime import date
from pydantic import BaseModel, EmailStr
from src.common.schemas import CoreSchema
from .models import UserRoleEnum

class UserBase(BaseModel):
    name: str
    email: EmailStr
    user_code: str
    role: UserRoleEnum
    school_id: Optional[UUID] = None
    phone: Optional[str] = None
    is_active: bool = True
    
    address_street: Optional[str] = None
    address_city_id: Optional[UUID] = None
    address_state_id: Optional[UUID] = None
    address_district_id: Optional[UUID] = None
    address_pincode: Optional[int] = None
    
    class_id: Optional[UUID] = None
    joined_class_id: Optional[UUID] = None
    section_id: Optional[UUID] = None
    
    reg_date: Optional[date] = None
    start_date: Optional[date] = None
    leave_date: Optional[date] = None
    fee_cycle: str = "MONTHLY"
    wallet_bal: int = 0

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[UserRoleEnum] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None
    address_street: Optional[str] = None
    address_city_id: Optional[UUID] = None
    address_state_id: Optional[UUID] = None
    address_district_id: Optional[UUID] = None
    address_pincode: Optional[int] = None
    class_id: Optional[UUID] = None
    joined_class_id: Optional[UUID] = None
    section_id: Optional[UUID] = None
    fee_cycle: Optional[str] = None
    wallet_bal: Optional[int] = None

class UserResponse(CoreSchema, UserBase):
    pass

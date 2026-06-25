from typing import Optional, Dict, Any
from uuid import UUID
from datetime import date
from pydantic import BaseModel
from src.common.schemas import CoreSchema

class SchoolSettings(BaseModel):
    attendanceEnabled: bool = True
    onlineExamEnabled: bool = False
    aiAnalyticsEnabled: bool = False
    parentAppEnabled: bool = True

class SchoolBase(BaseModel):
    name: str
    code: str
    subdomain: str
    email: str
    phone: str
    country_code: str = "+91"
    address: Optional[str] = None
    district_id: Optional[UUID] = None
    state_id: Optional[UUID] = None
    country_id: UUID
    pincode: Optional[int] = None
    logo: Optional[str] = None
    website: Optional[str] = None
    board_type_id: UUID
    subscription_plan_id: UUID
    billing_cycle: str
    subscription_start_date: Optional[date] = None
    subscription_end_date: Optional[date] = None
    max_students: int = 500
    total_teacher: int = 0
    total_student: int = 0
    is_active: bool = True
    is_deactive: bool = False
    shift: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    admission_fee: int = 0
    settings: Optional[SchoolSettings] = None

class SchoolCreate(SchoolBase):
    pass

class SchoolUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    subdomain: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    country_code: Optional[str] = None
    address: Optional[str] = None
    district_id: Optional[UUID] = None
    state_id: Optional[UUID] = None
    country_id: Optional[UUID] = None
    pincode: Optional[int] = None
    logo: Optional[str] = None
    website: Optional[str] = None
    board_type_id: Optional[UUID] = None
    subscription_plan_id: Optional[UUID] = None
    billing_cycle: Optional[str] = None
    subscription_start_date: Optional[date] = None
    subscription_end_date: Optional[date] = None
    max_students: Optional[int] = None
    is_active: Optional[bool] = None
    is_deactive: Optional[bool] = None
    shift: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    admission_fee: Optional[int] = None
    settings: Optional[SchoolSettings] = None

class SchoolResponse(CoreSchema, SchoolBase):
    pass

class SchoolDraftBase(BaseModel):
    email: str
    data: Dict[str, Any]

class SchoolDraftCreate(SchoolDraftBase):
    pass

class SchoolDraftUpdate(BaseModel):
    data: Optional[Dict[str, Any]] = None

class SchoolDraftResponse(CoreSchema, SchoolDraftBase):
    pass

from typing import Optional, Dict, Any
from uuid import UUID
from datetime import date
from pydantic import BaseModel, model_validator
from src.common.schemas import CoreSchema
from src.modules.master.schemas import CountryResponse, StateResponse, DistrictResponse, BoardTypeResponse, SubscriptionPlanResponse

class SchoolSettingsDto(BaseModel):
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
    admission_fee: Optional[int] = 0
    settings: Optional[SchoolSettingsDto] = None

class SchoolCreate(SchoolBase):
    admin_name: Optional[str] = None
    admin_email: Optional[str] = None
    admin_password: Optional[str] = None

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
    settings: Optional[SchoolSettingsDto] = None

class SchoolResponse(CoreSchema, SchoolBase):
    district_id: Optional[Any] = None
    state_id: Optional[Any] = None
    country_id: Optional[Any] = None
    board_type_id: Optional[Any] = None
    subscription_plan_id: Optional[Any] = None
    
    district: Optional[Any] = None
    state: Optional[Any] = None
    country: Optional[Any] = None
    board_type: Optional[Any] = None
    subscription_plan: Optional[Any] = None
    
    @model_validator(mode='before')
    @classmethod
    def format_response(cls, data: Any) -> Any:
        if isinstance(data, dict): return data
        if isinstance(data, list): return data
        
        result = {
            "id": data.id,
            "created_at": data.created_at,
            "updated_at": data.updated_at,
            "name": data.name,
            "code": data.code,
            "subdomain": data.subdomain,
            "email": data.email,
            "phone": data.phone,
            "country_code": data.country_code,
            "address": data.address,
            "pincode": data.pincode,
            "logo": data.logo,
            "website": data.website,
            "billing_cycle": data.billing_cycle,
            "subscription_start_date": data.subscription_start_date,
            "subscription_end_date": data.subscription_end_date,
            "max_students": data.max_students,
            "total_teacher": data.total_teacher,
            "total_student": data.total_student,
            "is_active": data.is_active,
            "is_deactive": data.is_deactive,
            "shift": data.shift,
            "start_time": data.start_time,
            "end_time": data.end_time,
            "admission_fee": data.admission_fee,
        }
        
        if hasattr(data, 'country') and data.country:
            result["country"] = {"id": str(data.country.id), "name": data.country.name, "code": data.country.code}
            result["country_id"] = str(data.country.id)
        else:
            result["country"] = str(data.country_id) if data.country_id else None
            result["country_id"] = str(data.country_id) if data.country_id else None
            
        if hasattr(data, 'state') and data.state:
            result["state"] = {"id": str(data.state.id), "name": data.state.name}
            result["state_id"] = str(data.state.id)
        else:
            result["state"] = str(data.state_id) if data.state_id else None
            result["state_id"] = str(data.state_id) if data.state_id else None
            
        if hasattr(data, 'district') and data.district:
            result["district"] = {"id": str(data.district.id), "name": data.district.name}
            result["district_id"] = str(data.district.id)
        else:
            result["district"] = str(data.district_id) if data.district_id else None
            result["district_id"] = str(data.district_id) if data.district_id else None
            
        if hasattr(data, 'board_type') and data.board_type:
            result["board_type"] = {"id": str(data.board_type.id), "name": data.board_type.name, "acronym": getattr(data.board_type, 'acronym', '')}
            result["board_type_id"] = str(data.board_type.id)
        else:
            result["board_type"] = str(data.board_type_id) if data.board_type_id else None
            result["board_type_id"] = str(data.board_type_id) if data.board_type_id else None
            
        if hasattr(data, 'subscription_plan') and data.subscription_plan:
            result["subscription_plan"] = {
                "id": str(data.subscription_plan.id),
                "name": data.subscription_plan.name,
                "code": getattr(data.subscription_plan, 'code', '')
            }
            result["subscription_plan_id"] = str(data.subscription_plan.id)
        else:
            result["subscription_plan"] = str(data.subscription_plan_id)
            result["subscription_plan_id"] = str(data.subscription_plan_id)
            
        if hasattr(data, 'settings') and data.settings:
            result["settings"] = data.settings if isinstance(data.settings, dict) else data.settings.model_dump()
            
        return result

class SchoolDraftBase(BaseModel):
    email: str
    data: Dict[str, Any]

class SchoolDraftCreate(SchoolDraftBase):
    pass

class SchoolDraftUpdate(BaseModel):
    data: Optional[Dict[str, Any]] = None

class SchoolDraftResponse(CoreSchema, SchoolDraftBase):
    pass

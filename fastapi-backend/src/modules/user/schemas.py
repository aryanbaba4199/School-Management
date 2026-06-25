from typing import Optional
from uuid import UUID
from datetime import date
from pydantic import BaseModel, EmailStr, model_validator
from typing import Optional, Any
from src.common.schemas import CoreSchema
from .models import UserRoleEnum
from src.modules.subject.schemas import SubjectResponse

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
    
    subject_ids: Optional[list[UUID]] = []
    class_ids: Optional[list[UUID]] = []
    children_ids: Optional[list[UUID]] = []
    
    @model_validator(mode='before')
    @classmethod
    def flatten_nested_payload(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if 'role' in data and isinstance(data['role'], dict):
                data['role'] = data['role'].get('name')
            if 'address' in data and isinstance(data['address'], dict):
                addr = data['address']
                if 'street' in addr: data['address_street'] = addr['street']
                if 'city_id' in addr: data['address_city_id'] = addr['city_id']
                if 'state_id' in addr: data['address_state_id'] = addr['state_id']
                if 'district_id' in addr: data['address_district_id'] = addr['district_id']
                if 'pincode' in addr: data['address_pincode'] = addr['pincode']
            if 'subjects' in data and isinstance(data['subjects'], list):
                data['subject_ids'] = data['subjects']
            if 'classIds' in data and isinstance(data['classIds'], list):
                data['class_ids'] = data['classIds']
        return data
    
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
    
    subject_ids: Optional[list[UUID]] = None
    class_ids: Optional[list[UUID]] = None
    children_ids: Optional[list[UUID]] = None
    
    @model_validator(mode='before')
    @classmethod
    def flatten_nested_payload(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if 'role' in data and isinstance(data['role'], dict):
                data['role'] = data['role'].get('name')
            if 'address' in data and isinstance(data['address'], dict):
                addr = data['address']
                if 'street' in addr: data['address_street'] = addr['street']
                if 'city_id' in addr: data['address_city_id'] = addr['city_id']
                if 'state_id' in addr: data['address_state_id'] = addr['state_id']
                if 'district_id' in addr: data['address_district_id'] = addr['district_id']
                if 'pincode' in addr: data['address_pincode'] = addr['pincode']
            if 'subjects' in data and isinstance(data['subjects'], list):
                data['subject_ids'] = data['subjects']
            if 'classIds' in data and isinstance(data['classIds'], list):
                data['class_ids'] = data['classIds']
        return data
    fee_cycle: Optional[str] = None
    wallet_bal: Optional[int] = None

class AddressResponse(BaseModel):
    street: Optional[str] = None
    city: Optional[Any] = None
    state: Optional[Any] = None
    district: Optional[Any] = None
    pincode: Optional[int] = None

class UserRoleResponse(BaseModel):
    name: str
    access: list = []

class UserResponse(CoreSchema):
    name: str
    email: EmailStr
    user_code: str
    role: UserRoleResponse
    school_id: Optional[Any] = None
    phone: Optional[str] = None
    is_active: bool = True
    
    address: Optional[AddressResponse] = None
    
    class_id: Optional[UUID] = None
    joined_class_id: Optional[UUID] = None
    section_id: Optional[UUID] = None
    
    parentId: Optional[Any] = None
    classIds: Optional[list[Any]] = []
    childrenIds: Optional[list[Any]] = []
    
    subjects: Optional[list[SubjectResponse]] = []
    
    reg_date: Optional[date] = None
    start_date: Optional[date] = None
    leave_date: Optional[date] = None
    fee_cycle: str = "MONTHLY"
    wallet_bal: int = 0
    
    @model_validator(mode='before')
    @classmethod
    def format_response(cls, data: Any) -> Any:
        if isinstance(data, dict): return data
        
        result = {
            "id": data.id,
            "created_at": data.created_at,
            "updated_at": data.updated_at,
            "name": data.name,
            "email": data.email,
            "user_code": data.user_code,
            "phone": data.phone,
            "is_active": data.is_active,
            "class_id": data.class_id,
            "joined_class_id": data.joined_class_id,
            "section_id": data.section_id,
            "reg_date": data.reg_date,
            "start_date": data.start_date,
            "leave_date": data.leave_date,
            "fee_cycle": data.fee_cycle,
            "wallet_bal": data.wallet_bal,
        }
        
        has_addr = any([data.address_street, data.address_city_id, data.address_state_id, data.address_district_id, data.address_pincode])
        if has_addr:
            result["address"] = AddressResponse(
                street=data.address_street,
                city={"id": str(data.city.id), "name": data.city.name} if hasattr(data, 'city') and data.city else data.address_city_id,
                state={"id": str(data.state.id), "name": data.state.name} if hasattr(data, 'state') and data.state else data.address_state_id,
                district={"id": str(data.district.id), "name": data.district.name} if hasattr(data, 'district') and data.district else data.address_district_id,
                pincode=data.address_pincode
            )
        else:
            result["address"] = None
            
        if hasattr(data, 'role'):
            result["role"] = UserRoleResponse(name=data.role.value, access=[])
            
        if hasattr(data, 'subjects'):
            result["subjects"] = data.subjects
            
        if hasattr(data, 'classes') and data.classes:
            result["classIds"] = [{"id": str(c.id), "name": c.name} for c in data.classes]
        else:
            result["classIds"] = []
            
        if hasattr(data, 'parents') and data.parents:
            result["parentId"] = str(data.parents[0].id)
        else:
            result["parentId"] = None
            
        if hasattr(data, 'children') and data.children:
            result["childrenIds"] = [
                {"id": str(child.id), "name": child.name, "userCode": child.user_code, "email": child.email}
                for child in data.children
            ]
        else:
            result["childrenIds"] = []
            
        if hasattr(data, 'school') and data.school:
            result["school_id"] = {
                "id": str(data.school.id),
                "name": data.school.name,
                "code": data.school.code
            }
        else:
            result["school_id"] = str(data.school_id) if data.school_id else None
            
        return result

class UserAuditLogResponse(CoreSchema):
    school_id: Optional[UUID] = None
    user_id: UUID
    changed_by: Optional[UUID] = None
    action: str
    previous_data: Optional[Any] = None
    new_data: Optional[Any] = None
    reason: Optional[str] = None

class BulkImportResponse(BaseModel):
    success_count: int
    failed_count: int
    errors: list[str] = []

class GenerateCodeResponse(BaseModel):
    code: str

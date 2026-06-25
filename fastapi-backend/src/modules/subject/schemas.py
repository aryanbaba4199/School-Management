from typing import Optional, Any
from uuid import UUID
from pydantic import BaseModel, model_validator
from src.common.schemas import CoreSchema

class SubjectBase(BaseModel):
    name: str
    school_id: UUID
    is_active: bool = True

class SubjectCreate(SubjectBase):
    teacher_ids: Optional[list[UUID]] = []

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    teacher_ids: Optional[list[UUID]] = None

class SubjectResponse(CoreSchema):
    name: str
    school_id: Optional[Any] = None
    is_active: bool = True
    teacher_ids: Optional[list[Any]] = []
    
    @model_validator(mode='before')
    @classmethod
    def format_response(cls, data: Any) -> Any:
        if isinstance(data, dict): return data
        
        result = {
            "id": data.id,
            "created_at": data.created_at,
            "updated_at": data.updated_at,
            "name": data.name,
            "is_active": data.is_active,
        }
        
        if hasattr(data, 'school') and data.school:
            result["school_id"] = {
                "id": str(data.school.id),
                "name": data.school.name,
                "code": data.school.code
            }
        else:
            result["school_id"] = str(data.school_id) if data.school_id else None
            
        if hasattr(data, 'users'):
            result["teacher_ids"] = [
                {
                    "id": str(t.id),
                    "name": t.name,
                    "email": t.email
                } for t in data.users
            ]
            
        return result

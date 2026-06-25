from typing import Optional
from uuid import UUID
from pydantic import BaseModel
from src.common.schemas import CoreSchema

class SubjectBase(BaseModel):
    name: str
    school_id: UUID
    is_active: bool = True

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None

class SubjectResponse(CoreSchema, SubjectBase):
    pass

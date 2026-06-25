from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict
from typing import Generic, TypeVar, List

T = TypeVar("T")

class PaginationMeta(BaseModel):
    total_pages: int
    total_count: int
    current_page: int
    limit: int

class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T]
    pagination: PaginationMeta

class CoreSchema(BaseModel):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

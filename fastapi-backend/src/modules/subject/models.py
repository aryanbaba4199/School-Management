from sqlalchemy import Column, String, Boolean, ForeignKey
from src.common.models.base import CoreModel

class Subject(CoreModel):
    __tablename__ = "subjects"
    
    name = Column(String, nullable=False, index=True)
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    is_active = Column(Boolean, default=True)

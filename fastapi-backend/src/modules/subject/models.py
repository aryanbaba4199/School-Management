from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from src.common.models.base import CoreModel

class Subject(CoreModel):
    __tablename__ = "subjects"
    
    name = Column(String, nullable=False, index=True)
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True)
    school = relationship("School")
    is_active = Column(Boolean, default=True)

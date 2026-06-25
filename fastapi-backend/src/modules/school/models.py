from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Date
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from src.common.models.base import CoreModel

class School(CoreModel):
    __tablename__ = "schools"
    
    name = Column(String, nullable=False, index=True)
    code = Column(String, unique=True, nullable=False, index=True)
    subdomain = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    country_code = Column(String, default="+91")
    address = Column(String)
    
    district_id = Column(ForeignKey("districts.id", ondelete="SET NULL"), nullable=True)
    state_id = Column(ForeignKey("states.id", ondelete="SET NULL"), nullable=True)
    country_id = Column(ForeignKey("countries.id", ondelete="RESTRICT"), nullable=False)
    pincode = Column(Integer)
    logo = Column(String)
    website = Column(String)
    
    board_type_id = Column(ForeignKey("board_types.id", ondelete="RESTRICT"), nullable=False)
    subscription_plan_id = Column(ForeignKey("subscription_plans.id", ondelete="RESTRICT"), nullable=False)
    billing_cycle = Column(String, nullable=False) # 'MONTHLY', 'YEARLY'
    subscription_start_date = Column(Date)
    subscription_end_date = Column(Date)
    
    max_students = Column(Integer, default=500)
    total_teacher = Column(Integer, default=0)
    total_student = Column(Integer, default=0)
    
    is_active = Column(Boolean, default=True)
    is_deactive = Column(Boolean, default=False)
    
    shift = Column(String)
    start_time = Column(String)
    end_time = Column(String)
    admission_fee = Column(Integer, default=0)
    
    settings = Column(JSONB, default={
        "attendanceEnabled": True,
        "onlineExamEnabled": False,
        "aiAnalyticsEnabled": False,
        "parentAppEnabled": True
    })

class SchoolDraft(CoreModel):
    __tablename__ = "school_drafts"
    
    email = Column(String, unique=True, nullable=False, index=True)
    data = Column(JSONB, nullable=False)

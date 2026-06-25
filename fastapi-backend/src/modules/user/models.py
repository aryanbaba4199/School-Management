from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Date, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from src.common.models.base import CoreModel
import enum

class UserRoleEnum(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    SCHOOL_ADMIN = "SCHOOL_ADMIN"
    TEACHER = "TEACHER"
    STUDENT = "STUDENT"
    PARENT = "PARENT"

user_children_association = Table(
    'user_children',
    CoreModel.metadata,
    Column('parent_id', UUID(as_uuid=True), ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('child_id', UUID(as_uuid=True), ForeignKey('users.id', ondelete="CASCADE"), primary_key=True)
)

user_subjects_association = Table(
    'user_subjects',
    CoreModel.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('subject_id', UUID(as_uuid=True), ForeignKey('subjects.id', ondelete="CASCADE"), primary_key=True)
)

class User(CoreModel):
    __tablename__ = "users"
    
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    user_code = Column(String, nullable=False)
    
    role = Column(Enum(UserRoleEnum, name="user_role_enum", create_type=False), nullable=False)
    
    school_id = Column(ForeignKey("schools.id", ondelete="CASCADE"), nullable=True, index=True)
    phone = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Flattened Address
    address_street = Column(String)
    address_city_id = Column(ForeignKey("cities.id", ondelete="SET NULL"), nullable=True)
    address_state_id = Column(ForeignKey("states.id", ondelete="SET NULL"), nullable=True)
    address_district_id = Column(ForeignKey("districts.id", ondelete="SET NULL"), nullable=True)
    address_pincode = Column(Integer)
    
    class_id = Column(ForeignKey("classes.id", ondelete="SET NULL"), nullable=True)
    joined_class_id = Column(ForeignKey("classes.id", ondelete="SET NULL"), nullable=True)
    section_id = Column(ForeignKey("sections.id", ondelete="SET NULL"), nullable=True)
    
    # Association for Parent -> Children
    children = relationship(
        "User", 
        secondary=user_children_association,
        primaryjoin="User.id == user_children.c.parent_id",
        secondaryjoin="User.id == user_children.c.child_id",
        backref="parents"
    )
    
    # Association for Subjects
    subjects = relationship("Subject", secondary=user_subjects_association, backref="users")
    
    reg_date = Column(Date)
    start_date = Column(Date)
    leave_date = Column(Date)
    fee_cycle = Column(String, default="MONTHLY")
    wallet_bal = Column(Integer, default=0)
    
    last_login_at = Column(Date)
    password_changed_at = Column(Date)

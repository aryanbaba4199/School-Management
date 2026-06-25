from sqlalchemy import Column, String, Float, Boolean, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from src.common.models.base import CoreModel

class Country(CoreModel):
    __tablename__ = "countries"
    
    name = Column(String, unique=True, nullable=False, index=True)
    code = Column(String, unique=True, nullable=False, index=True)
    
    states = relationship("State", back_populates="country", cascade="all, delete-orphan")

class State(CoreModel):
    __tablename__ = "states"
    
    name = Column(String, nullable=False, index=True)
    country_id = Column(ForeignKey("countries.id", ondelete="CASCADE"), nullable=False)
    
    country = relationship("Country", back_populates="states")
    districts = relationship("District", back_populates="state", cascade="all, delete-orphan")
    cities = relationship("City", back_populates="state", cascade="all, delete-orphan")

class District(CoreModel):
    __tablename__ = "districts"
    
    name = Column(String, nullable=False, index=True)
    state_id = Column(ForeignKey("states.id", ondelete="CASCADE"), nullable=False)
    
    state = relationship("State", back_populates="districts")

class City(CoreModel):
    __tablename__ = "cities"
    
    name = Column(String, nullable=False, index=True)
    state_id = Column(ForeignKey("states.id", ondelete="CASCADE"), nullable=False)
    
    state = relationship("State", back_populates="cities")

class BoardType(CoreModel):
    __tablename__ = "board_types"
    
    name = Column(String, unique=True, nullable=False, index=True)
    code = Column(String, unique=True, nullable=False)

class SubscriptionPlan(CoreModel):
    __tablename__ = "subscription_plans"
    
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=False)
    price = Column(JSON, nullable=False) # Store { monthly, yearly }
    max_students = Column(Integer, default=500)
    features = Column(JSON) # Store feature toggles
    is_active = Column(Boolean, default=True)

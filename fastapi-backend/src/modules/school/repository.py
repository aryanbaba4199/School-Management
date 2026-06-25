from sqlalchemy.orm import Session
from typing import Optional
from src.common.repository import CRUDBase
from .models import School, SchoolDraft
from .schemas import SchoolCreate, SchoolUpdate, SchoolDraftCreate, SchoolDraftUpdate

class CRUDSchool(CRUDBase[School, SchoolCreate, SchoolUpdate]):
    def get_by_subdomain(self, db: Session, *, subdomain: str) -> Optional[School]:
        return db.query(School).filter(School.subdomain == subdomain).first()
        
    def get_by_code(self, db: Session, *, code: str) -> Optional[School]:
        return db.query(School).filter(School.code == code).first()

class CRUDSchoolDraft(CRUDBase[SchoolDraft, SchoolDraftCreate, SchoolDraftUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[SchoolDraft]:
        return db.query(SchoolDraft).filter(SchoolDraft.email == email).first()

school = CRUDSchool(School)
school_draft = CRUDSchoolDraft(SchoolDraft)

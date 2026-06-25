from src.common.repository import CRUDBase
from .models import Subject
from .schemas import SubjectCreate, SubjectUpdate

class CRUDSubject(CRUDBase[Subject, SubjectCreate, SubjectUpdate]):
    pass

subject = CRUDSubject(Subject)

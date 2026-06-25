from src.common.repository import CRUDBase
from .models import Class, ClassSchedule, Section
from .schemas import (
    ClassCreate, ClassUpdate,
    ClassScheduleCreate, ClassScheduleUpdate,
    SectionCreate, SectionUpdate
)

class CRUDClass(CRUDBase[Class, ClassCreate, ClassUpdate]):
    pass

class CRUDClassSchedule(CRUDBase[ClassSchedule, ClassScheduleCreate, ClassScheduleUpdate]):
    pass

class CRUDSection(CRUDBase[Section, SectionCreate, SectionUpdate]):
    pass

class_repo = CRUDClass(Class)
class_schedule = CRUDClassSchedule(ClassSchedule)
section = CRUDSection(Section)

from src.common.repository import CRUDBase
from .models import AttendanceRecord
from .schemas import AttendanceRecordCreate, AttendanceRecordUpdate

class CRUDAttendanceRecord(CRUDBase[AttendanceRecord, AttendanceRecordCreate, AttendanceRecordUpdate]):
    pass

attendance_record = CRUDAttendanceRecord(AttendanceRecord)

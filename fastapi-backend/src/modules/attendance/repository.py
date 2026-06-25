from src.common.repository import CRUDBase
from . import models
from . import schemas

class CRUDAttendanceRecord(CRUDBase[models.AttendanceRecord, schemas.AttendanceRecordCreate, schemas.AttendanceRecordUpdate]):
    pass

class CRUDAttendanceSettings(CRUDBase[models.AttendanceSettings, schemas.AttendanceSettingsCreate, schemas.AttendanceSettingsUpdate]):
    pass

class CRUDRfidCard(CRUDBase[models.RfidCard, schemas.RfidCardCreate, schemas.RfidCardUpdate]):
    pass

class CRUDAttendanceCorrectionRequest(CRUDBase[models.AttendanceCorrectionRequest, schemas.AttendanceCorrectionRequestCreate, schemas.AttendanceCorrectionRequestCreate]):
    pass

attendance_record = CRUDAttendanceRecord(models.AttendanceRecord)
attendance_settings = CRUDAttendanceSettings(models.AttendanceSettings)
rfid_card = CRUDRfidCard(models.RfidCard)
attendance_correction = CRUDAttendanceCorrectionRequest(models.AttendanceCorrectionRequest)

from src.common.repository import CRUDBase
from .models import Exam, ExamSchedule, StudentExamMark, GradeConfig, ReportCard
from .schemas import (
    ExamCreate, ExamUpdate,
    ExamScheduleCreate, ExamScheduleUpdate,
    StudentExamMarkCreate, StudentExamMarkUpdate,
    GradeConfigCreate, GradeConfigUpdate,
    ReportCardCreate, ReportCardUpdate
)

class CRUDExam(CRUDBase[Exam, ExamCreate, ExamUpdate]):
    pass

class CRUDExamSchedule(CRUDBase[ExamSchedule, ExamScheduleCreate, ExamScheduleUpdate]):
    pass

class CRUDStudentExamMark(CRUDBase[StudentExamMark, StudentExamMarkCreate, StudentExamMarkUpdate]):
    pass

class CRUDGradeConfig(CRUDBase[GradeConfig, GradeConfigCreate, GradeConfigUpdate]):
    pass

class CRUDReportCard(CRUDBase[ReportCard, ReportCardCreate, ReportCardUpdate]):
    pass

exam = CRUDExam(Exam)
exam_schedule = CRUDExamSchedule(ExamSchedule)
student_exam_mark = CRUDStudentExamMark(StudentExamMark)
grade_config = CRUDGradeConfig(GradeConfig)
report_card = CRUDReportCard(ReportCard)

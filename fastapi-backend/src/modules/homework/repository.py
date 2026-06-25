from src.common.repository import CRUDBase
from .models import Homework, HomeworkSubmission
from .schemas import HomeworkCreate, HomeworkUpdate, HomeworkSubmissionCreate, HomeworkSubmissionUpdate

class CRUDHomework(CRUDBase[Homework, HomeworkCreate, HomeworkUpdate]):
    pass

class CRUDHomeworkSubmission(CRUDBase[HomeworkSubmission, HomeworkSubmissionCreate, HomeworkSubmissionUpdate]):
    pass

homework = CRUDHomework(Homework)
homework_submission = CRUDHomeworkSubmission(HomeworkSubmission)

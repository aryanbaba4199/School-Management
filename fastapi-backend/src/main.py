from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config.settings import settings
from src.modules.user.routes import router as user_router
from src.modules.master.routes import router as master_router
from src.modules.school.routes import router as school_router
from src.modules.classes.routes import router as classes_router
from src.modules.subject.routes import router as subject_router
from src.modules.exam.routes import router as exam_router
from src.modules.homework.routes import router as homework_router
from src.modules.fee.routes import router as fee_router
from src.modules.attendance.routes import router as attendance_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}

app.include_router(user_router, prefix="/api/users", tags=["user"])
app.include_router(master_router, prefix="/api/masters", tags=["master"])
app.include_router(school_router, prefix="/api/schools", tags=["school"])
app.include_router(classes_router, prefix="/api/classes", tags=["class"])
app.include_router(subject_router, prefix="/api/subjects", tags=["subject"])
app.include_router(exam_router, prefix="/api/exams", tags=["exam"])
app.include_router(homework_router, prefix="/api/homework", tags=["homework"])
app.include_router(fee_router, prefix="/api/fees", tags=["fee"])
app.include_router(attendance_router, prefix="/api/attendance", tags=["attendance"])

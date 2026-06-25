import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import uuid4

from src.main import app
from src.common.dependencies import get_db
from src.config.database import Base
from src.config.settings import settings
from src.common.utils.security import create_access_token, get_password_hash

from src.modules.user.models import User, UserRoleEnum
from src.modules.school.models import School, SchoolDraft
from src.modules.master.models import Country, State, District, City, SubscriptionPlan, BoardType
from src.modules.classes.models import Class, Section
from src.modules.subject.models import Subject
from src.modules.exam.models import Exam, ExamSchedule, StudentExamMark, GradeConfig, ReportCard
from src.modules.homework.models import Homework, HomeworkSubmission
from src.modules.fee.models import FeeRecord, FeeTransaction
from src.modules.attendance.models import AttendanceRecord

# --- SQLite Compatibility Override for PostgreSQL JSONB ---
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB

@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"
# --------------------------------------------------------

from sqlalchemy.pool import StaticPool

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db() -> Generator:
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture(scope="function")
def client(db) -> Generator:
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def superadmin_user(db):
    user = User(
        id=uuid4(),
        email="superadmin@test.com",
        password=get_password_hash("password123"),
        name="Super Admin",
        user_code="SA001",
        role=UserRoleEnum.SUPER_ADMIN,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@pytest.fixture(scope="function")
def superadmin_token_headers(superadmin_user):
    token = create_access_token(subject=str(superadmin_user.id))
    return {"Authorization": f"Bearer {token}"}

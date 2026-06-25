# Comprehensive Plan to Migrate School Management Backend to FastAPI & PostgreSQL

## Overview
This document outlines the phased strategy to migrate the existing Express/TypeScript backend of the **School Management** project to a modern Python-based **FastAPI** architecture, utilizing **PostgreSQL** as the primary database. The structure will meticulously preserve the existing domain-driven design (modules) while adopting Pythonic best practices. **Pytest** will be heavily utilized to ensure zero regressions during the migration.

## Estimated APIs to Migrate: 93
Based on the current modular structure, exactly **93 API endpoints** across 9 distinct modules must be migrated.

---

## Detailed List of APIs to Migrate

Below is the exhaustive list of every API endpoint that must be built in the FastAPI backend, mapped directly from the existing Express routes.

### 1. User & Authentication Module (`/api/user`) - 14 APIs
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/login` | Authenticate user & return JWT |
| `GET`  | `/profile` | Get logged-in user profile |
| `PUT`  | `/profile` | Update user profile details |
| `PUT`  | `/profile/password` | Change user password |
| `POST` | `/generate-code` | Generate unique code for registration |
| `POST` | `/bulk-import` | Import users via CSV/Excel |
| `GET`  | `/export` | Export users to CSV/Excel |
| `POST` | `/` | Register a single new user |
| `GET`  | `/` | List all users (with filters) |
| `GET`  | `/:id` | Get specific user by ID |
| `GET`  | `/:id/audit-log` | Get audit logs for a specific user |
| `PUT`  | `/:id` | Update specific user |
| `PATCH`| `/:id/status` | Toggle user status (Active/Inactive) |
| `DELETE`| `/:id` | Delete user |

### 2. School Module (`/api/school`) - 8 APIs
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Register a new school |
| `GET`  | `/` | List all schools |
| `GET`  | `/drafts/:email` | Get school registration draft |
| `POST` | `/drafts` | Save a school registration draft |
| `GET`  | `/:id` | Get school details by ID |
| `PUT`  | `/:id` | Update school details |
| `PATCH`| `/:id/deactivate` | Deactivate/Activate a school |
| `DELETE`| `/:id` | Delete school entirely |

### 3. Class Module (`/api/class`) - 6 APIs
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Create a new class |
| `GET`  | `/` | List all classes |
| `GET`  | `/sections` | List all sections across classes |
| `GET`  | `/:id` | Get class details by ID |
| `PUT`  | `/:id` | Update class details |
| `DELETE`| `/:id` | Delete a class |

### 4. Subject Module (`/api/subject`) - 5 APIs
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Create a new subject |
| `GET`  | `/` | List all subjects |
| `GET`  | `/:id` | Get subject by ID |
| `PUT`  | `/:id` | Update a subject |
| `DELETE`| `/:id` | Delete a subject |

### 5. Exam Module (`/api/exam`) - 10 APIs
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/` | Create a new exam |
| `PUT`  | `/:id` | Update an existing exam |
| `GET`  | `/` | List all exams |
| `POST` | `/schedules` | Create an exam schedule |
| `PUT`  | `/schedules/:id` | Update an exam schedule |
| `GET`  | `/schedules` | List all exam schedules |
| `POST` | `/marks` | Save/Submit student marks |
| `GET`  | `/marks` | Fetch submitted student marks |
| `POST` | `/results/generate` | Trigger report card generation |
| `GET`  | `/results` | Get generated report cards |

### 6. Homework Module (`/api/homework`) - 8 APIs
| Method | Endpoint | Description |
|---|---|---|
| `GET`  | `/student/dashboard` | Get homework dashboard for student |
| `POST` | `/:id/submit` | Submit a homework assignment |
| `POST` | `/` | Create a new homework |
| `GET`  | `/` | Get all homework assignments |
| `GET`  | `/:id` | Get homework details by ID |
| `DELETE`| `/:id` | Delete a homework assignment |
| `GET`  | `/:id/submissions` | Get all submissions for a homework |
| `PUT`  | `/submissions/:submissionId/grade` | Grade/Evaluate a student's submission |

### 7. Fee Module (`/api/fee`) - 8 APIs
| Method | Endpoint | Description |
|---|---|---|
| `GET`  | `/transactions` | Get all fee transactions |
| `GET`  | `/student/:studentId` | Get fee details for a specific student |
| `POST` | `/generate` | Generate fees for a student |
| `POST` | `/generate-bulk` | Generate fees globally for a school |
| `GET`  | `/cycle/:year/:month` | Get details of a specific fee cycle |
| `POST` | `/pay-receipt` | Process a fee payment and generate receipt |
| `PUT`  | `/:id/pay` | Mark a specific fee as paid |
| `PUT`  | `/:id/mark-due` | Mark a specific fee as due |

### 8. Attendance Module (`/api/attendance`) - 20 APIs
| Method | Endpoint | Description |
|---|---|---|
| `GET`  | `/students` | Get student attendance |
| `POST` | `/students/bulk` | Bulk mark student attendance |
| `POST` | `/students/mark` | Mark individual student attendance |
| `PUT`  | `/students/:id` | Update student attendance record |
| `GET`  | `/teachers` | Get teacher attendance |
| `POST` | `/teachers/bulk` | Bulk mark teacher attendance |
| `POST` | `/teachers/mark` | Mark individual teacher attendance |
| `PUT`  | `/teachers/:id` | Update teacher attendance record |
| `GET`  | `/settings` | Get attendance global settings |
| `PUT`  | `/settings` | Update attendance global settings |
| `GET`  | `/rfid/cards` | List registered RFID cards |
| `POST` | `/rfid/cards` | Assign a new RFID card |
| `PUT`  | `/rfid/cards/:id` | Update RFID card assignment |
| `DELETE`| `/rfid/cards/:id` | Delete an RFID card |
| `POST` | `/rfid/scan` | Register attendance via RFID scan |
| `GET`  | `/reports/daily` | Get daily attendance report |
| `GET`  | `/reports/monthly` | Get monthly attendance report |
| `POST` | `/corrections` | File an attendance correction request |
| `GET`  | `/corrections/pending` | Fetch pending correction requests |
| `POST` | `/corrections/:id/resolve` | Approve/Reject correction request |

### 9. Master Data Module (`/api/master`) - 14 APIs
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/countries` | Create a country |
| `GET`  | `/countries` | Get list of countries |
| `POST` | `/board-types` | Create a board type (e.g., CBSE) |
| `GET`  | `/board-types` | Get list of board types |
| `POST` | `/states` | Create a state |
| `GET`  | `/states` | Get list of states |
| `POST` | `/districts` | Create a district |
| `GET`  | `/districts` | Get list of districts |
| `POST` | `/cities` | Create a city |
| `GET`  | `/cities` | Get list of cities |
| `POST` | `/subscription-plans` | Create a SaaS subscription plan |
| `GET`  | `/subscription-plans` | Get all subscription plans |
| `PUT`  | `/subscription-plans/:id` | Update subscription plan |
| `DELETE`| `/subscription-plans/:id`| Delete subscription plan |

---

## Phase 1: Project Initialization & Core Architecture Setup
- **Objective:** Bootstrap the FastAPI application and configure the PostgreSQL connection and testing environment.
- **Tasks:**
  - Create a Python virtual environment (`venv`).
  - Install dependencies: `fastapi`, `uvicorn`, `sqlalchemy`, `alembic`, `psycopg2-binary`, `pydantic`, `pytest`, `pytest-asyncio`, `python-jose` (for JWT), `passlib` (for passwords).
  - Initialize Alembic for database migrations.
  - Configure `pytest.ini` for asynchronous testing and fixture management.
  - Setup core database engine and session factory (`SessionLocal`).

### Target Folder Structure
The structure will strictly mirror the current `backend/src/` modular layout, swapping TypeScript conventions for Python conventions.

```text
backend/
├── alembic/                      # Database migrations folder
├── alembic.ini                   # Alembic config
├── pytest.ini                    # Pytest configuration
├── requirements.txt              # Python dependencies
├── src/
│   ├── main.py                   # Entry point (Replaces index.ts/server.ts)
│   ├── common/                   # Shared logic
│   │   ├── middleware/           # auth.py, roles.py, school_injector.py
│   │   ├── utils/                # helpers, constants
│   │   ├── errors/               # custom HTTP exceptions
│   │   └── dependencies.py       # FastAPI Depends() components
│   └── modules/                  # Domain modules (matching current structure)
│       ├── attendance/
│       │   ├── models.py         # SQLAlchemy Models
│       │   ├── schemas.py        # Pydantic DTOs (Replaces /dto/)
│       │   ├── routes.py         # FastAPI APIRouter (Replaces .routes.ts)
│       │   ├── services.py       # Business logic
│       │   └── tests/            # Pytest test files for this module
│       ├── class/
│       ├── exam/
│       ├── fee/
│       ├── homework/
│       ├── master/
│       ├── school/
│       ├── subject/
│       └── user/
```

## Phase 2: Database Modeling & Migrations
- **Objective:** Translate existing database models to relational SQLAlchemy ORM models.
- **Tasks:**
  - Define `Base` declarative model.
  - Create PostgreSQL relational tables emphasizing multi-tenancy (every table linked to `school_id` where applicable).
  - **Key Tables:** 
    - `users` (Super Admin, School Admin, Teacher, Student, Parent)
    - `schools`, `classes`, `sections`, `subjects`
    - `exams`, `exam_schedules`, `marks`
    - `homework`, `homework_submissions`
    - `attendance_records`, `fee_records`
  - Generate Alembic migration scripts and execute the initial schema creation.

## Phase 3: Core Infrastructure & Middlewares
- **Objective:** Port common utilities and security middlewares to FastAPI dependencies.
- **Tasks:**
  - **Authentication (`authenticate`):** Create a dependency utilizing `OAuth2PasswordBearer` to validate JWTs.
  - **Role-Based Access Control (`requireRoles`):** Implement a dependency that accepts permitted roles and checks the current user's role.
  - **Multi-tenancy (`injectSchoolId`):** Implement a dependency that strictly enforces and extracts the `school_id` from the token/request to ensure data isolation between schools.

## Phase 4: Module-by-Module API Migration
- **Objective:** Develop, test, and integrate APIs for each domain module.
- *Refer to the Detailed List of APIs above for exactly what endpoints will be constructed per module.*

## Phase 5: Pytest Implementation
- **Objective:** Guarantee absolute reliability, security, and multi-tenant isolation.
- **Tasks:**
  - Setup `conftest.py` with PostgreSQL test database fixtures (auto-rolling back transactions after each test).
  - Use `TestClient` or `httpx.AsyncClient` for route testing.
  - **Test Scenarios:**
    - **Multi-tenant isolation:** Ensure a School Admin from School A cannot access data from School B.
    - **RBAC:** Verify Teachers cannot access Super Admin routes.
    - **Data Integrity:** Validate complex flows like bulk user imports and result generation.

## Phase 6: Final CI/CD Setup
- **Tasks:**
  - Create a Dockerfile utilizing a lightweight Python image (`python:3.11-slim`).
  - Configure Github Actions to run `pytest` and `alembic upgrade head` before any deployment.

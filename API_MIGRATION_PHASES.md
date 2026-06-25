# FastAPI vs Legacy API Migration Strategy

This document provides a comprehensive overview of the discrepancies between the expected frontend API payloads (designed for a legacy MongoDB/Express backend) and the newly migrated PostgreSQL/FastAPI backend.

## Core Architectural Discrepancy

**Legacy Backend (MongoDB/Mongoose)**
- Handled deeply nested documents and arrays natively.
- Used `.populate()` to instantly expand `ObjectId` references into full JSON objects (e.g., `{ _id: "...", name: "..." }`).
- Saved array data (like `teacherIds` or `attachments`) directly inside the parent document.

**New Backend (PostgreSQL/FastAPI/SQLAlchemy)**
- Strictly relational. Pydantic schemas mirror flat database tables.
- Drops any undocumented arrays sent by the frontend (e.g., `sections: []`, `schedule: []`).
- By default, returns raw UUID strings for foreign keys instead of populated objects, causing the React datatables to crash when trying to access properties like `row.schoolId.name`.

---

## Migration Action Plan

To fix the 90+ APIs without completely rewriting the React frontend, we must apply a standardized patch to every module:
1. **Schema Updates (Inbound)**: Update Pydantic `Create`/`Update` schemas to accept `Optional[list[Any]]` arrays.
2. **Repository Overrides (Persistence)**: Intercept these arrays in the CRUD repositories and manually write them to junction tables or child records.
3. **Response Validators (Outbound)**: Use `@model_validator(mode='before')` to dynamically intercept SQLAlchemy objects and manually package their relationships into the `{id, name}` dictionaries the frontend expects.

---

## Migration Phases

### Phase 1: Foundational Relationships (Completed)
**Status**: Completed
These are the core dependencies required by all other modules.

- [x] **Users API (`/api/users`)**: 
  - *Fixed*: Nested `address` and `role` objects are now flattened on input and packaged on output. Added logic to handle `subject_ids` arrays.
- [x] **Classes API (`/api/classes`)**: 
  - *Fixed*: Added support for submitting `sections` and `schedule` arrays. Returns packaged `{id, name}` for `school_id` and `class_teacher_id`.
- [x] **Subjects API (`/api/subjects`)**: 
  - *Fixed*: Updated `SubjectCreate` schema to accept `teacher_ids`. Overrode repository to populate the `user_subjects_association` table. Updated `SubjectResponse` to return populated `{id, name, email}` dictionaries.
- [x] **Schools API (`/api/schools`)**:
  - *Fixed*: Added dynamic format_response validator to fully package `country`, `state`, `district`, `board_type`, and `subscription_plan` relations.

### Phase 2: Academic Core (Exams & Results) (Completed)
**Status**: Completed

- [x] **Exams API (`/api/exams`)**:
  - *Fixed*: Added `relationship()` properties to all SQLAlchemy models. Updated `ExamScheduleResponse` to unpack SQLAlchemy joins into dictionaries for `class_id`, `section_id`, and `subject_id`.
- [x] **Marks & Report Cards (`/api/exams/marks`, `/api/exams/results`)**:
  - *Fixed*: Added `relationship()` mapping to `StudentExamMark` and `ReportCard`. Implemented `@model_validator(mode='before')` to dynamically map `student_id`, `subject_id`, `exam_id` into dictionaries to fulfill frontend interfaces `IStudentExamMark` and `IReportCard`.

### Phase 3: Operational Core (Attendance) (Completed)
**Status**: Completed

- [x] **Attendance API (`/api/attendance`)**:
  - *Fixed*: Designed and implemented `BulkStudentAttendanceCreate` and `BulkTeacherAttendanceCreate` schemas for the bulk `/students/bulk` and `/teachers/bulk` POST endpoints. Rewrote the route logic to loop through and elegantly upsert records into PostgreSQL, maintaining the `user_id` and `date` unique constraint. Updated `AttendanceRecordResponse` to package the user into a `{id, name, user_code}` dictionary.
- [x] **Attendance Settings & RFID**:
  - *Fixed*: Successfully mapped flattened schemas for `IAttendanceSettings` and `IRfidCard` to backend models with automated validation for hardware compatibility.

### Phase 4: Extended Modules (Homework & Fees) (Completed)
**Status**: Completed

- [x] **Homework API (`/api/homework`)**:
  - *Fixed*: Added `relationship()` mappings to `Homework` and `HomeworkSubmission`. Wrote Pydantic `@model_validator`s to dynamically resolve `class_id`, `section_id`, `subject_id`, and `student_id` back to dictionary maps matching `IHomework` frontend expectations.
- [x] **Fees API (`/api/fees`)**:
  - *Fixed*: Updated `FeeRecord` and `FeeTransaction` relationships to `student_id` and `collected_by`. Pydantic models automatically package IDs into complete representations matching `IFeeType` and `IFeeInvoice`. Add response validators for relationships.

### Phase 5: Master Data & References (Completed)
**Status**: Completed

- [x] **Master Data API (`/api/master`)**:
  - *Fixed*: Master data APIs correctly return flat relational identifiers matching `ICountry`, `IState`, `IDistrict`, ensuring global dropdowns in the frontend seamlessly populate without encountering Cyclic Serialization Exceptions. `state_id` foreign keys are correctly parsed during POST requests and packaged (if expected) during GET requests.

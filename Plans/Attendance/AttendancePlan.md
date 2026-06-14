# Attendance Module Plan

## 1. Goal

Build a production-ready attendance system for the School Management platform.

The attendance module must support:

- Student attendance
- Teacher/staff attendance
- Manual marking
- RFID-based attendance
- Future camera/face recognition attendance
- Daily and monthly reports
- Absence alerts to parents/admins
- Multi-school data isolation
- Role-based access control
- Audit history for changes

This module should be designed as a core school operation feature, not just a simple present/absent table.

---

## 2. Users And Access

### Super Admin

Can:

- View attendance across all schools
- Filter by school, class, section, date, month
- View attendance analytics
- Audit attendance changes
- Configure global attendance settings if needed

Should not:

- Accidentally mark attendance without selecting a school context

### School Admin

Can:

- View all student and teacher attendance for their school
- Mark or update attendance
- Approve corrections
- Configure school attendance rules
- View daily/monthly reports
- Export attendance reports
- Manage RFID devices/cards

### Teacher

Can:

- Mark student attendance for assigned classes/sections
- View attendance for assigned classes
- Request corrections or update attendance depending on school settings
- View student attendance summary

Should not:

- Access attendance for unrelated schools
- Access teacher payroll-style attendance unless allowed

### Student

Can:

- View own attendance
- View monthly summary
- See absence/late records

Should not:

- Mark or edit attendance

### Parent

Can:

- View attendance of linked children
- Receive absence alerts
- View monthly summary

Should not:

- Mark or edit attendance

---

## 3. Attendance Types

### Student Attendance

Statuses:

- `PRESENT`
- `ABSENT`
- `LATE`
- `HALF_DAY`
- `EXCUSED`

Marking modes:

- Manual
- RFID
- Bulk import
- Future face recognition

### Teacher Attendance

Statuses:

- `PRESENT`
- `ABSENT`
- `LATE`
- `HALF_DAY`
- `ON_LEAVE`

Marking modes:

- Manual by school admin
- RFID
- Future biometric/camera

---

## 4. Backend Folder Structure

Create a new backend module:

```text
backend/src/modules/attendance/
  attendance.module.ts
  attendance.routes.ts
  attendance.controller.ts
  attendance.service.ts
  attendance.model.ts
  attendance.test.ts
  dto/
    create-attendance.dto.ts
    update-attendance.dto.ts
    attendance-query.dto.ts
    bulk-attendance.dto.ts
    rfid-attendance.dto.ts
  types/
    attendance.types.ts
  utils/
    attendance-summary.util.ts
    attendance-permission.util.ts
```

Later, if RFID becomes large, split it:

```text
backend/src/modules/rfid/
  rfid-device.model.ts
  rfid-card.model.ts
  rfid.controller.ts
  rfid.service.ts
  rfid.routes.ts
```

For MVP, RFID can live inside attendance.

---

## 5. Backend Module Registration

Add module initialization in:

```text
backend/src/app.ts
```

Expected pattern:

```ts
import { AttendanceModule } from './modules/attendance/attendance.module';

AttendanceModule.init(app);
```

Expected route prefix:

```text
/api/attendance
```

---

## 6. Database Models

### AttendanceRecord

Use one collection for both student and teacher attendance, separated by `personType`.

```ts
AttendanceRecord {
  _id: ObjectId;

  schoolId: ObjectId;

  personType: 'STUDENT' | 'TEACHER';
  personId: ObjectId;

  classId?: ObjectId;
  sectionId?: ObjectId;

  date: Date;
  academicYear?: string;

  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED' | 'ON_LEAVE';

  source: 'MANUAL' | 'RFID' | 'IMPORT' | 'FACE_RECOGNITION' | 'SYSTEM';

  checkInTime?: Date;
  checkOutTime?: Date;

  markedBy?: ObjectId;
  updatedBy?: ObjectId;

  remarks?: string;

  isLocked: boolean;

  createdAt: Date;
  updatedAt: Date;
}
```

Important indexes:

```ts
{ schoolId: 1, personType: 1, personId: 1, date: 1 } unique
{ schoolId: 1, classId: 1, sectionId: 1, date: 1 }
{ schoolId: 1, date: 1 }
{ schoolId: 1, personType: 1, date: 1 }
```

Why unique index matters:

- One person should not have duplicate attendance for the same date.
- Updates should modify the existing record.

### AttendanceAuditLog

Track all edits.

```ts
AttendanceAuditLog {
  _id: ObjectId;
  schoolId: ObjectId;
  attendanceId: ObjectId;
  changedBy: ObjectId;
  previousStatus?: string;
  newStatus: string;
  previousData?: object;
  newData?: object;
  reason?: string;
  createdAt: Date;
}
```

### AttendanceSettings

School-level settings.

```ts
AttendanceSettings {
  _id: ObjectId;
  schoolId: ObjectId;

  studentAttendanceMode: 'MANUAL' | 'RFID' | 'HYBRID';
  teacherAttendanceMode: 'MANUAL' | 'RFID' | 'HYBRID';

  lateAfterTime?: string;
  halfDayAfterTime?: string;
  autoAbsentAfterTime?: string;

  allowTeacherCorrection: boolean;
  requireAdminApprovalForCorrection: boolean;

  notifyParentsOnAbsent: boolean;
  notifyParentsOnLate: boolean;

  createdAt: Date;
  updatedAt: Date;
}
```

### RfidCard

For RFID phase.

```ts
RfidCard {
  _id: ObjectId;
  schoolId: ObjectId;
  cardUid: string;
  personType: 'STUDENT' | 'TEACHER';
  personId: ObjectId;
  isActive: boolean;
  issuedAt?: Date;
  blockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

Important index:

```ts
{ schoolId: 1, cardUid: 1 } unique
```

---

## 7. API Design

Base URL:

```text
/api/attendance
```

### Student Attendance APIs

```text
GET    /api/attendance/students
POST   /api/attendance/students/mark
POST   /api/attendance/students/bulk
PUT    /api/attendance/students/:id
GET    /api/attendance/students/summary
GET    /api/attendance/students/:studentId
```

### Teacher Attendance APIs

```text
GET    /api/attendance/teachers
POST   /api/attendance/teachers/mark
POST   /api/attendance/teachers/bulk
PUT    /api/attendance/teachers/:id
GET    /api/attendance/teachers/summary
GET    /api/attendance/teachers/:teacherId
```

### Reports APIs

```text
GET    /api/attendance/reports/daily
GET    /api/attendance/reports/monthly
GET    /api/attendance/reports/person/:personId
GET    /api/attendance/reports/class/:classId
GET    /api/attendance/reports/export
```

### RFID APIs

```text
POST   /api/attendance/rfid/scan
POST   /api/attendance/rfid/cards
GET    /api/attendance/rfid/cards
PUT    /api/attendance/rfid/cards/:id
DELETE /api/attendance/rfid/cards/:id
```

### Settings APIs

```text
GET    /api/attendance/settings
PUT    /api/attendance/settings
```

---

## 8. API Request Examples

### Mark Single Student

```json
{
  "studentId": "objectId",
  "classId": "objectId",
  "sectionId": "objectId",
  "date": "2026-06-13",
  "status": "PRESENT",
  "remarks": "Marked during morning attendance"
}
```

### Bulk Student Attendance

```json
{
  "classId": "objectId",
  "sectionId": "objectId",
  "date": "2026-06-13",
  "records": [
    {
      "studentId": "objectId",
      "status": "PRESENT"
    },
    {
      "studentId": "objectId",
      "status": "ABSENT",
      "remarks": "No prior notice"
    }
  ]
}
```

### RFID Scan

```json
{
  "cardUid": "RFID_CARD_UID",
  "deviceId": "GATE_01",
  "timestamp": "2026-06-13T09:00:00.000Z"
}
```

---

## 9. Access Control Matrix

| Feature | Super Admin | School Admin | Teacher | Student | Parent |
|---|---:|---:|---:|---:|---:|
| View all school attendance | Yes | Own school | Assigned only | No | No |
| View own attendance | No | Yes | Yes | Yes | No |
| View child attendance | No | No | No | No | Yes |
| Mark student attendance | With school context | Yes | Assigned class | No | No |
| Mark teacher attendance | With school context | Yes | No | No | No |
| Edit attendance | With school context | Yes | Limited | No | No |
| View reports | Yes | Yes | Assigned class | Own | Children |
| Export reports | Yes | Yes | Limited | No | No |
| Manage RFID cards | Yes | Yes | No | No | No |
| Attendance settings | Yes | Yes | No | No | No |

Important:

- `SUPER_ADMIN` must provide a `schoolId` query/body value for school-specific operations.
- `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`, and `PARENT` should use `req.schoolId` from JWT.
- Never trust frontend role checks alone.

---

## 10. Backend Permission Rules

Create a helper:

```text
backend/src/modules/attendance/utils/attendance-permission.util.ts
```

Responsibilities:

- Resolve school context
- Check teacher assigned classes
- Check parent-child relationship
- Prevent cross-school access
- Prevent student/parent mutation
- Restrict super admin mutation unless schoolId is explicit

Rules:

- School admin can access only their school.
- Teacher can mark only assigned class/section.
- Parent can view only linked children.
- Student can view only own records.
- Super admin can view all, but mutations must include selected `schoolId`.

---

## 11. Frontend Folder Structure

Create:

```text
frontend/src/api/attendanceApi.ts

frontend/src/features/attendance/
  index.ts
  pages/
    StudentAttendancePage.tsx
    TeacherAttendancePage.tsx
    RfidAttendancePage.tsx
    AttendanceReportsPage.tsx
    AttendanceSettingsPage.tsx
  components/
    AttendanceToolbar.tsx
    AttendanceStatusChip.tsx
    StudentAttendanceTable.tsx
    TeacherAttendanceTable.tsx
    BulkAttendanceGrid.tsx
    AttendanceSummaryCards.tsx
    AttendanceCalendar.tsx
    RfidCardTable.tsx
    RfidCardFormDialog.tsx
    AttendanceCorrectionDialog.tsx
    AttendanceExportButton.tsx
  hooks/
    useAttendanceFilters.ts
    useStudentAttendance.ts
    useTeacherAttendance.ts
    useAttendanceSummary.ts
  schema/
    attendance.schema.ts
    rfid.schema.ts
  types/
    attendance.types.ts
```

Current placeholder pages already exist. Replace them step by step with real pages.

---

## 12. Frontend API Slice

Create:

```text
frontend/src/api/attendanceApi.ts
```

Endpoints:

```ts
getStudentAttendance
markStudentAttendance
bulkMarkStudentAttendance
updateStudentAttendance
getTeacherAttendance
markTeacherAttendance
bulkMarkTeacherAttendance
updateTeacherAttendance
getDailyAttendanceReport
getMonthlyAttendanceReport
scanRfidAttendance
getRfidCards
createRfidCard
updateRfidCard
deleteRfidCard
getAttendanceSettings
updateAttendanceSettings
```

Add tag types:

```text
Attendance
AttendanceSummary
AttendanceSettings
RfidCard
```

Update:

```text
frontend/src/api/tagTypes.ts
```

---

## 13. Frontend Pages

### StudentAttendancePage

Purpose:

- Mark/view student attendance by class and section.

Filters:

- School, only for super admin
- Class
- Section
- Date
- Status

Main UI:

- Summary cards
- Class/section/date selector
- Student attendance grid
- Bulk mark buttons
- Save button
- Export button

Actions:

- Mark present
- Mark absent
- Mark late
- Mark half day
- Add remarks
- Save bulk attendance

### TeacherAttendancePage

Purpose:

- Mark/view teacher attendance.

Filters:

- School, only for super admin
- Date
- Status

Main UI:

- Teacher attendance table
- Check-in/check-out display
- Manual status update
- Export button

### RfidAttendancePage

Purpose:

- Manage RFID scans and RFID card assignment.

Sections:

- Recent scans
- Registered cards
- Assign card dialog
- Block/unblock card action

Actions:

- Assign card to student/teacher
- Deactivate card
- Trigger test scan in development

### AttendanceReportsPage

Purpose:

- Daily/monthly reporting.

Reports:

- Daily class attendance
- Monthly class attendance
- Student-wise attendance
- Teacher-wise attendance
- Absence list
- Late list

Export:

- CSV first
- PDF later

### AttendanceSettingsPage

Purpose:

- Configure school attendance behavior.

Settings:

- Attendance mode
- Late threshold
- Half-day threshold
- Parent notifications
- Teacher correction permissions

---

## 14. Navigation

Menu:

```text
Attendance
  Student Attendance
  Teacher Attendance
  RFID Attendance
  Attendance Reports
  Attendance Settings
```

Routes:

```text
/attendance/students
/attendance/teachers
/attendance/rfid
/attendance/reports
/attendance/settings
```

Role visibility:

- Student Attendance: Super Admin, School Admin, Teacher, Student, Parent
- Teacher Attendance: Super Admin, School Admin, Teacher
- RFID Attendance: Super Admin, School Admin
- Attendance Reports: Super Admin, School Admin, Teacher, Parent
- Attendance Settings: Super Admin, School Admin

---

## 15. Core Workflows

### Manual Student Attendance

1. User opens Student Attendance.
2. Select class, section, and date.
3. System loads students for selected class/section.
4. System loads existing attendance for that date.
5. UI defaults empty students to `PRESENT` or blank depending on settings.
6. Teacher/admin marks statuses.
7. User saves.
8. Backend upserts records.
9. Backend writes audit logs.
10. Backend triggers absent/late notifications if enabled.

### Manual Teacher Attendance

1. School admin opens Teacher Attendance.
2. Select date.
3. System loads active teachers.
4. Admin marks status and optional check-in/check-out.
5. Backend upserts teacher attendance.
6. Audit logs are written.

### RFID Attendance

1. RFID reader sends `cardUid` to backend.
2. Backend finds active RFID card in same school.
3. Backend resolves student/teacher.
4. Backend checks attendance settings.
5. Backend creates or updates attendance record.
6. If scan is after late threshold, status becomes `LATE`.
7. System stores check-in time.
8. Parent notification can be triggered for student attendance.

### Attendance Reports

1. User selects report type.
2. User selects date/month/class/section/person.
3. Backend aggregates attendance.
4. Frontend displays summary cards and table.
5. User exports CSV/PDF.

---

## 16. Notification Rules

Parent notifications should be handled later through a notification module, but attendance should emit events.

Events:

```text
attendance.student.absent
attendance.student.late
attendance.student.present
attendance.teacher.absent
```

Event payload:

```json
{
  "schoolId": "objectId",
  "studentId": "objectId",
  "parentIds": ["objectId"],
  "date": "2026-06-13",
  "status": "ABSENT"
}
```

MVP can log notification events. Later connect to push/SMS/WhatsApp.

---

## 17. Validation Rules

Use Zod DTO validation.

Rules:

- `date` is required for manual marking.
- `personId` must be a valid ObjectId.
- Student attendance requires `classId` and `sectionId`.
- Teacher attendance should not require class/section.
- Status must match allowed status for person type.
- Cannot update locked attendance unless school admin/super admin.
- Future date marking should be blocked unless allowed by settings.
- Bulk records cannot be empty.
- Bulk records must not contain duplicate student IDs.

---

## 18. Reporting Calculations

Student monthly summary:

```text
totalWorkingDays
presentDays
absentDays
lateDays
halfDays
excusedDays
attendancePercentage
```

Suggested formula:

```text
attendancePercentage = ((presentDays + halfDays * 0.5 + excusedDays) / totalWorkingDays) * 100
```

Teacher monthly summary:

```text
totalWorkingDays
presentDays
absentDays
lateDays
halfDays
leaveDays
attendancePercentage
```

Important:

- Decide whether `EXCUSED` counts as present for student reports.
- Decide whether `ON_LEAVE` counts separately for teachers.
- Keep calculation in backend utility, not frontend.

---

## 19. Production Concerns

### Multi-Tenancy

Every attendance query must include `schoolId`.

For super admin:

- Read APIs may allow no schoolId for global analytics.
- Mutation APIs must require explicit `schoolId`.

### Auditability

Every create/update should store:

- Who marked it
- Who updated it
- Old value
- New value
- Timestamp
- Optional reason

### Performance

Use indexes for:

- school + date
- school + class + section + date
- school + person + date

Avoid fetching all students/records across school without pagination.

### Idempotency

Bulk attendance save should be safely repeatable.

Use upsert:

```text
schoolId + personType + personId + date
```

### Locking

After a configurable number of days, attendance can become locked.

Example:

- Teacher can edit same-day attendance only.
- School admin can edit old attendance.
- Super admin can audit but should not casually edit.

### Time Zone

Store timestamps in UTC.

For attendance date, normalize by school timezone.

India default:

```text
Asia/Kolkata
```

Do not compare dates using raw JavaScript local date without normalizing.

---

## 20. Tests

Backend tests:

```text
attendance.test.ts
```

Test cases:

- School admin can mark student attendance.
- Teacher can mark assigned class attendance.
- Teacher cannot mark unrelated class attendance.
- Student cannot mark attendance.
- Parent cannot mark attendance.
- Parent can view own child attendance.
- School admin cannot access another school.
- Super admin mutation requires explicit schoolId.
- Bulk attendance prevents duplicates.
- RFID scan creates attendance.
- RFID scan with unknown card returns 404.
- Attendance update creates audit log.
- Monthly summary calculation is correct.

Frontend tests:

- Attendance menu renders by role.
- Student attendance page loads filters.
- Bulk mark interaction updates UI state.
- Save calls correct API payload.
- Parent sees read-only child attendance.
- Unauthorized route redirects.

---

## 21. Implementation Phases

### Phase 1: Manual Student Attendance

Build:

- Attendance model
- Student mark APIs
- Student attendance frontend page
- Class/section/date filters
- Bulk save
- Basic daily report

Outcome:

- School admin/teacher can mark student attendance.

### Phase 2: Teacher Attendance

Build:

- Teacher attendance APIs
- Teacher attendance page
- Teacher monthly report

Outcome:

- School admin can maintain staff attendance.

### Phase 3: Reports

Build:

- Daily report
- Monthly report
- Person report
- CSV export
- Summary cards

Outcome:

- Admin and teachers can analyze attendance.

### Phase 4: RFID

Build:

- RFID card model
- Card assignment UI
- Scan API
- Recent scan list
- Late threshold logic

Outcome:

- RFID attendance can run in school gate/classroom mode.

### Phase 5: Notifications And Locking

Build:

- Absence event emission
- Parent alert integration
- Attendance locking rules
- Correction workflow

Outcome:

- Production-grade operational attendance.

### Phase 6: Future Camera Attendance

Build later:

- Face recognition provider integration
- Consent and privacy rules
- Manual review queue
- Confidence score handling

Outcome:

- Camera attendance can be added without changing the core attendance model.

---

## 22. Recommended Build Order

1. Create backend attendance module files.
2. Create `AttendanceRecord` and `AttendanceAuditLog` models.
3. Create DTO schemas.
4. Create student manual attendance APIs.
5. Add tests for student manual attendance.
6. Create frontend `attendanceApi.ts`.
7. Replace `StudentAttendancePage` placeholder with real filters/table.
8. Add bulk save.
9. Add reports API.
10. Add teacher attendance.
11. Add settings.
12. Add RFID cards and scan API.
13. Add notifications.
14. Add exports.
15. Add locking/correction workflow.

---

## 23. Definition Of Done

Attendance module is production-ready when:

- All attendance records are tenant-safe.
- Role permissions are enforced in backend.
- Student and teacher attendance work independently.
- Bulk attendance is idempotent.
- Reports are accurate and exportable.
- Audit logs exist for all edits.
- Parent/student views are read-only.
- RFID scans are supported or cleanly feature-flagged.
- Tests cover permission and reporting edge cases.
- Frontend build passes.
- Backend tests pass.
- No route is visible without matching backend permission.

---

## 24. Current Implementation Checklist

Status meaning:

- `[x]` Completed
- `[~]` Partially completed
- `[ ]` Not completed

### Backend Structure

- `[x]` Attendance backend module folder exists at `backend/src/modules/attendance`.
- `[x]` `attendance.module.ts` exists and registers routes under `/api/attendance`.
- `[x]` Attendance module is added in `backend/src/app.ts`.
- `[x]` `attendance.routes.ts` exists.
- `[x]` `attendance.controller.ts` exists.
- `[x]` `attendance.service.ts` exists.
- `[x]` `attendance.model.ts` exists.
- `[~]` DTO folder exists, but DTOs are combined into one `attendance.dto.ts` instead of separate files from the plan.
- `[ ]` `types/attendance.types.ts` backend folder is not implemented.
- `[~]` `utils/attendance-permission.util.ts` exists.
- `[ ]` `attendance-summary.util.ts` is not implemented.

### Backend Models

- `[x]` `AttendanceRecord` model exists.
- `[x]` `AttendanceAuditLog` model exists.
- `[x]` `AttendanceSettings` model exists.
- `[x]` `RfidCard` model exists.
- `[x]` Unique attendance index exists for `schoolId + personType + personId + date`.
- `[x]` Query indexes exist for school/date/class/person attendance lookups.
- `[x]` RFID unique card index exists for `schoolId + cardUid`.
- `[~]` Model structure follows the plan, but school timezone is hardcoded later in service instead of stored/configured per school.

### Backend APIs

- `[x]` `GET /api/attendance/students` exists.
- `[ ]` `POST /api/attendance/students/mark` single student API is not implemented.
- `[x]` `POST /api/attendance/students/bulk` exists.
- `[ ]` `PUT /api/attendance/students/:id` is not implemented.
- `[ ]` `GET /api/attendance/students/summary` is not implemented.
- `[ ]` `GET /api/attendance/students/:studentId` is not implemented.
- `[x]` `GET /api/attendance/teachers` exists.
- `[ ]` `POST /api/attendance/teachers/mark` single teacher API is not implemented.
- `[x]` `POST /api/attendance/teachers/bulk` exists.
- `[ ]` `PUT /api/attendance/teachers/:id` is not implemented.
- `[ ]` `GET /api/attendance/teachers/summary` is not implemented.
- `[ ]` `GET /api/attendance/teachers/:teacherId` is not implemented.
- `[x]` `GET /api/attendance/reports/daily` exists.
- `[x]` `GET /api/attendance/reports/monthly` exists.
- `[ ]` `GET /api/attendance/reports/person/:personId` is not implemented.
- `[ ]` `GET /api/attendance/reports/class/:classId` is not implemented.
- `[ ]` `GET /api/attendance/reports/export` is not implemented.
- `[x]` `POST /api/attendance/rfid/scan` exists.
- `[x]` `POST /api/attendance/rfid/cards` exists.
- `[x]` `GET /api/attendance/rfid/cards` exists.
- `[x]` `PUT /api/attendance/rfid/cards/:id` exists.
- `[x]` `DELETE /api/attendance/rfid/cards/:id` exists.
- `[x]` `GET /api/attendance/settings` exists.
- `[x]` `PUT /api/attendance/settings` exists.

### Backend Functionality

- `[x]` Manual bulk student attendance is implemented.
- `[x]` Manual bulk teacher attendance is implemented.
- `[x]` Attendance upsert behavior is implemented.
- `[x]` Audit logs are created for bulk student/teacher updates.
- `[~]` Locked attendance is checked during bulk updates, but no locking workflow/settings are implemented yet.
- `[x]` RFID card assignment is implemented.
- `[x]` RFID active/block state is implemented.
- `[x]` RFID scan creates attendance/check-in and updates checkout on second scan.
- `[~]` RFID late detection exists, but timezone is hardcoded to `Asia/Kolkata`.
- `[ ]` RFID scan does not create audit log entries.
- `[ ]` Absence/late notification events are not implemented.
- `[ ]` Parent alert integration is not implemented.
- `[ ]` Correction approval workflow is not implemented.
- `[ ]` Future face recognition is not implemented, only reserved as enum/source.
- `[~]` Daily report exists with counts.
- `[~]` Monthly report exists, but returns raw records instead of backend-calculated summary.
- `[ ]` Backend monthly percentage/summary utility is not implemented.

### Backend Access Control

- `[x]` Routes use authentication.
- `[x]` Routes use role middleware.
- `[x]` School context helper exists.
- `[~]` Super admin read context is supported through optional `schoolId`.
- `[ ]` Super admin mutation handling has a bug: controllers call `validateMutationSchoolContext(req)` without passing `req.body.schoolId`, so super admin mutations will fail even if `schoolId` is provided.
- `[ ]` Teacher assigned-class permission is not implemented.
- `[ ]` Parent-child access restriction is not implemented.
- `[ ]` Student self-only access restriction is not implemented.
- `[ ]` Backend does not yet prevent teachers from reading all teacher attendance if route role allows them.
- `[ ]` Backend does not verify that marked students/teachers belong to the target school.
- `[ ]` Backend does not verify that student attendance class/section matches the actual student.

### Frontend Structure

- `[x]` `frontend/src/api/attendanceApi.ts` exists.
- `[x]` `frontend/src/features/attendance/index.ts` exists.
- `[x]` `StudentAttendancePage.tsx` exists.
- `[x]` `TeacherAttendancePage.tsx` exists.
- `[x]` `RfidAttendancePage.tsx` exists.
- `[x]` `AttendanceReportsPage.tsx` exists.
- `[x]` `AttendanceSettingsPage.tsx` exists.
- `[x]` `components/StudentAttendanceTable.tsx` exists.
- `[ ]` `AttendanceToolbar.tsx` is not implemented.
- `[ ]` `AttendanceStatusChip.tsx` is not implemented.
- `[ ]` `TeacherAttendanceTable.tsx` is not implemented as a separate reusable component.
- `[ ]` `BulkAttendanceGrid.tsx` is not implemented.
- `[ ]` `AttendanceSummaryCards.tsx` is not implemented as a separate reusable component.
- `[ ]` `AttendanceCalendar.tsx` is not implemented.
- `[ ]` `RfidCardTable.tsx` is not implemented as a separate reusable component.
- `[ ]` `RfidCardFormDialog.tsx` is not implemented as a separate reusable component.
- `[ ]` `AttendanceCorrectionDialog.tsx` is not implemented.
- `[ ]` `AttendanceExportButton.tsx` is not implemented as a separate reusable component.
- `[ ]` Attendance hooks folder is not implemented.
- `[ ]` Attendance schema folder is not implemented.
- `[x]` Frontend attendance types file exists.

### Frontend Pages And UX

- `[x]` Student Attendance page can filter by class, section, and date.
- `[x]` Student Attendance page can load students.
- `[x]` Student Attendance page can load existing attendance.
- `[x]` Student Attendance page can bulk save student statuses.
- `[~]` Student Attendance defaults unmarked students to `PRESENT`; useful, but should become configurable through settings.
- `[ ]` Student Attendance page does not support super-admin school selection.
- `[ ]` Student Attendance page is not read-only for student/parent roles.
- `[ ]` Student Attendance page does not enforce teacher assigned-class restrictions in UI.
- `[x]` Teacher Attendance page can filter by date.
- `[x]` Teacher Attendance page can load teachers.
- `[x]` Teacher Attendance page can bulk save teacher statuses.
- `[x]` Teacher Attendance page supports check-in/check-out times.
- `[ ]` Teacher Attendance page does not support super-admin school selection.
- `[x]` RFID page can list registered cards.
- `[x]` RFID page can create/register cards.
- `[x]` RFID page can block/unblock cards.
- `[x]` RFID page can delete cards.
- `[x]` RFID page has scanner simulator.
- `[ ]` RFID page does not support super-admin school selection.
- `[x]` Reports page has daily report UI.
- `[x]` Reports page has monthly report UI.
- `[x]` Reports page has CSV export in frontend.
- `[~]` Monthly report percentage is calculated in frontend, but plan recommends backend calculation.
- `[ ]` Reports page does not support super-admin school selection.
- `[x]` Settings page exists.
- `[x]` Settings page can update attendance modes and notification/correction flags.
- `[ ]` Settings page does not include `autoAbsentAfterTime` field even though backend model supports it.

### Frontend API Coverage

- `[x]` `getStudentAttendance` exists.
- `[x]` `bulkMarkStudentAttendance` exists.
- `[x]` `getTeacherAttendance` exists.
- `[x]` `bulkMarkTeacherAttendance` exists.
- `[x]` `getAttendanceSettings` exists.
- `[x]` `updateAttendanceSettings` exists.
- `[x]` `getRfidCards` exists.
- `[x]` `createRfidCard` exists.
- `[x]` `updateRfidCard` exists.
- `[x]` `deleteRfidCard` exists.
- `[x]` `scanRfid` exists.
- `[x]` `getDailyReport` exists.
- `[x]` `getMonthlyReport` exists.
- `[ ]` Single mark/update API hooks are not implemented because backend APIs are missing.
- `[ ]` Person/class/export report hooks are not implemented because backend APIs are missing.
- `[ ]` API calls do not consistently support `schoolId` for super-admin context.

### Navigation

- `[x]` Attendance menu exists.
- `[x]` Student Attendance route exists.
- `[x]` Teacher Attendance route exists.
- `[x]` RFID Attendance route exists.
- `[x]` Attendance Reports route exists.
- `[x]` Attendance Settings route exists.
- `[~]` Frontend route visibility exists, but backend permission details are not fully aligned with plan-level access rules.

### Plan Compliance Summary

- `[x]` Core attendance module foundation is created.
- `[x]` Manual student bulk attendance is mostly implemented.
- `[x]` Manual teacher bulk attendance is mostly implemented.
- `[x]` RFID MVP is implemented.
- `[~]` Reports are partially implemented.
- `[~]` Settings are partially implemented.
- `[~]` Audit logging is partially implemented.
- `[ ]` Production-grade role/relationship permissions are not complete.
- `[ ]` Parent/student read-only flows are not complete.
- `[ ]` Notification events are not implemented.
- `[ ]` Correction approval workflow is not implemented.
- `[ ]` Export API is not implemented.
- `[ ]` Backend-calculated monthly summary is not implemented.
- `[ ]` Super-admin school-context mutation flow needs fixing.

### Overall Current Status

The Attendance module is **partially implemented**.

Approximate completion against this plan:

```text
Backend foundation:        65%
Frontend foundation:       60%
Core manual attendance:    60%
RFID MVP:                  65%
Reports:                   40%
Settings:                  50%
Production permissions:    25%
Notifications/workflows:   0%

Overall Attendance Plan:   45-50%
```

Main next fixes before calling it reliable:

1. ✔️ Fix super-admin mutation school context.
2. ✔️ Add backend checks for teacher assigned classes, parent children, and student self-only reads.
3. ✔️ Verify marked users belong to the target school and class/section.
4. ✔️ Move monthly summary calculation to backend.
5. ✔️ Add missing single update APIs and correction workflow.
6. ✔️ Add notification event hooks for absent/late attendance.
7. ✔️ Add super-admin school selectors in frontend Attendance pages.

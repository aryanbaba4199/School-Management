# User Management Module Plan

## 1. Goal

Build a production-ready user management system for the School Management platform.

The user module must support:

- Multi-role user accounts (Super Admin, School Admin, Teacher, Student, Parent)
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Multi-school tenant isolation
- User CRUD for all roles
- User profile management (self-service)
- Password management (create, update, reset, forgot)
- Student-parent linking workflow
- Teacher class and subject assignment
- Student class and section allocation
- Guardian details and document uploads
- User code auto-generation
- Bulk import/export of users
- User search and advanced filtering
- Audit history for user changes
- User avatar/photo upload
- Session management (token refresh, expiry)
- Email verification (future)

This module is the foundational identity layer on which every other module depends.

---

## 2. Users And Access

### Super Admin

Can:

- View all users across all schools
- Create/update/delete users in any school (with explicit `schoolId`)
- Manage School Admin accounts
- View user analytics across schools
- Audit user changes
- Configure global user settings
- Manage subscription plans and school onboarding

Should not:

- Accidentally mutate users without selecting a school context
- Be listed under any school's user directory

### School Admin

Can:

- View all users within their school
- Create/update/delete Teachers, Students, Parents for their school
- Toggle user active/inactive status
- Manage student class/section allocation
- Manage teacher subject/class assignment
- Link students to parents
- Reset passwords for school users
- Export user lists
- View user audit logs for their school

Should not:

- Access users from other schools
- Create Super Admin or School Admin accounts (only Super Admin can)
- Delete their own account

### Teacher

Can:

- View own profile
- Update own profile (limited fields: name, phone, address, password)
- View students in assigned classes/sections
- View parent contact info for their students

Should not:

- Create/update/delete other users
- Access users outside their assigned classes
- View other teachers' profiles (unless school policy allows)

### Student

Can:

- View own profile
- Update limited profile info (password only)
- View own parent/guardian details

Should not:

- View other students
- View teachers' personal info
- Create/update/delete users

### Parent

Can:

- View own profile
- Update own profile (limited fields: name, phone, address, password)
- View linked children's profiles

Should not:

- View other parents or unrelated students
- Create/update/delete users
- Access teacher personal details

---

## 3. User Types And Roles

### Role Definitions

```ts
type UserRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
```

### Role Hierarchy

```text
SUPER_ADMIN > SCHOOL_ADMIN > TEACHER > STUDENT / PARENT
```

### Role-Specific Fields

Student-only:
- `classId` (current class)
- `joinedClassId` (class at time of admission)
- `sectionId`
- `parentId`
- `regDate`
- `feeCycle`
- `walletBal`

Teacher-only:
- `subjects` (array of Subject IDs)
- `classIds` (array of assigned Class IDs — NOT YET IMPLEMENTED)
- `startDate`
- `leaveDate`

Parent-only:
- `childrenIds` (array of Student User IDs)

School Admin-only:
- `schoolId` (mandatory)

Super Admin:
- `schoolId` is undefined (unrestricted)

---

## 4. Backend Folder Structure

Current structure:

```text
backend/src/modules/user/
  user.module.ts
  user.routes.ts
  user.controller.ts
  user.service.ts
  user.model.ts
  user.test.ts
  dto/
    create-user.dto.ts
```

Planned target structure:

```text
backend/src/modules/user/
  user.module.ts
  user.routes.ts
  user.controller.ts
  user.service.ts
  user.model.ts
  user.test.ts
  dto/
    create-user.dto.ts
    update-user.dto.ts
    user-query.dto.ts
    bulk-import.dto.ts
    password-reset.dto.ts
  types/
    user.types.ts
  utils/
    user-permission.util.ts
    user-code-generator.util.ts
    user-audit.util.ts
```

---

## 5. Backend Module Registration

Module initialized in:

```text
backend/src/app.ts
```

Current pattern:

```ts
import { UserModule } from './modules/user/user.module';

UserModule.init(app);
```

Current route prefix:

```text
/api/users
```

---

## 6. Database Model

### User Model

Current schema (already implemented):

```ts
User {
  _id: ObjectId;

  name: string;
  email: string;           // unique, lowercase, indexed
  password: string;         // hashed, select: false
  userCode: string;         // uppercase, compound unique with schoolId

  role: {
    name: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
    access: string[];
  };

  schoolId?: ObjectId;      // ref: School, indexed

  phone?: string;
  isActive: boolean;

  address?: {
    street?: string;
    city?: ObjectId;        // ref: City
    state?: ObjectId;       // ref: State
    district?: ObjectId;    // ref: District
    pincode?: number;
  };

  parentId?: ObjectId;      // ref: User (for students)
  childrenIds?: ObjectId[]; // ref: User (for parents)

  classId?: ObjectId;       // ref: Class (current class)
  joinedClassId?: ObjectId; // ref: Class (admission class)
  sectionId?: ObjectId;     // ref: Section

  subjects?: ObjectId[];    // ref: Subject (for teachers)

  regDate?: Date;
  startDate?: Date;
  leaveDate?: Date;

  feeCycle?: 'MONTHLY' | 'YEARLY';
  walletBal?: number;

  createdAt: Date;
  updatedAt: Date;
}
```

Current indexes:

```ts
{ email: 1 }                    // unique
{ schoolId: 1, userCode: 1 }   // compound unique
{ schoolId: 1 }                // query index
{ parentId: 1 }                // parent lookup
{ classId: 1 }                 // class filter
{ sectionId: 1 }               // section filter
{ subjects: 1 }                // teacher-subject lookup
{ childrenIds: 1 }             // parent-children lookup
{ address.city: 1 }            // geography lookup
```

### Planned additions to User model

```ts
  // --- New fields to add ---
  avatar?: string;            // URL to profile photo (S3/R2)
  
  classIds?: ObjectId[];      // ref: Class (for teachers — assigned classes)
  
  guardianDetails?: {
    fatherName?: string;
    motherName?: string;
    emergencyContact?: string;
    relationship?: string;
  };

  documents?: {
    type: string;             // e.g. 'BIRTH_CERTIFICATE', 'TRANSFER_CERT', 'AADHAR'
    url: string;
    uploadedAt: Date;
  }[];

  lastLoginAt?: Date;
  passwordChangedAt?: Date;
```

### UserAuditLog (NEW — not yet implemented)

Track all user profile changes.

```ts
UserAuditLog {
  _id: ObjectId;
  schoolId?: ObjectId;
  userId: ObjectId;           // the user whose record was modified
  changedBy: ObjectId;        // the user who made the change
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_TOGGLE' | 'PASSWORD_RESET';
  previousData?: object;
  newData?: object;
  reason?: string;
  createdAt: Date;
}
```

### PasswordResetToken (NEW — not yet implemented)

For forgot password flow.

```ts
PasswordResetToken {
  _id: ObjectId;
  userId: ObjectId;
  token: string;              // hashed reset token
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}
```

---

## 7. API Design

Base URL:

```text
/api/users
```

### Authentication APIs

```text
POST   /api/users/login                       ✅ Implemented
POST   /api/users/logout                      ❌ Not implemented
POST   /api/users/refresh-token               ❌ Not implemented
POST   /api/users/forgot-password             ❌ Not implemented
POST   /api/users/reset-password              ❌ Not implemented
```

### Profile APIs

```text
GET    /api/users/profile                     ✅ Implemented
PUT    /api/users/profile                     ❌ Not implemented (self-update)
PUT    /api/users/profile/password            ❌ Not implemented (self password change)
POST   /api/users/profile/avatar              ❌ Not implemented
```

### User CRUD APIs

```text
POST   /api/users                             ✅ Implemented (create)
GET    /api/users                             ✅ Implemented (list with filters)
GET    /api/users/:id                         ✅ Implemented (get by ID)
PUT    /api/users/:id                         ✅ Implemented (update)
PATCH  /api/users/:id/status                  ✅ Implemented (toggle active)
DELETE /api/users/:id                         ✅ Implemented
```

### Bulk APIs

```text
POST   /api/users/bulk-import                 ❌ Not implemented
GET    /api/users/export                      ❌ Not implemented
```

### Relationship APIs

```text
POST   /api/users/:studentId/link-parent      ❌ Not implemented
DELETE /api/users/:studentId/unlink-parent     ❌ Not implemented
GET    /api/users/:parentId/children           ❌ Not implemented
```

### Admin APIs

```text
POST   /api/users/:id/reset-password          ❌ Not implemented (admin reset)
GET    /api/users/:id/audit-log               ❌ Not implemented
GET    /api/users/stats                       ❌ Not implemented (role counts, active/inactive)
POST   /api/users/generate-code               ❌ Not implemented (auto user code)
```

---

## 8. API Request Examples

### Login

```json
{
  "email": "admin@school.edu.in",
  "password": "password123"
}
```

### Create Student

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@school.edu.in",
  "password": "Student@123",
  "userCode": "ST-2026-001",
  "role": { "name": "STUDENT", "access": [] },
  "schoolId": "objectId",
  "phone": "9876543210",
  "classId": "objectId",
  "sectionId": "objectId",
  "parentId": "objectId",
  "regDate": "2026-04-01",
  "feeCycle": "MONTHLY",
  "address": {
    "street": "123 Main St",
    "city": "objectId",
    "state": "objectId",
    "district": "objectId",
    "pincode": 560001
  }
}
```

### Create Teacher

```json
{
  "name": "Priya Verma",
  "email": "priya@school.edu.in",
  "password": "Teacher@123",
  "userCode": "T-2026-005",
  "role": { "name": "TEACHER", "access": [] },
  "schoolId": "objectId",
  "phone": "9123456780",
  "subjects": ["objectId", "objectId"],
  "startDate": "2026-06-01",
  "address": {
    "street": "45 Park Avenue",
    "city": "objectId",
    "state": "objectId",
    "district": "objectId",
    "pincode": 110001
  }
}
```

### Link Parent To Student

```json
{
  "parentId": "objectId"
}
```

### Bulk Import

```json
{
  "role": "STUDENT",
  "classId": "objectId",
  "sectionId": "objectId",
  "users": [
    {
      "name": "Student A",
      "email": "a@school.edu.in",
      "userCode": "ST-001",
      "phone": "9000000001"
    },
    {
      "name": "Student B",
      "email": "b@school.edu.in",
      "userCode": "ST-002",
      "phone": "9000000002"
    }
  ]
}
```

---

## 9. Access Control Matrix

| Feature | Super Admin | School Admin | Teacher | Student | Parent |
|---|---:|---:|---:|---:|---:|
| View all users | All schools | Own school | No | No | No |
| View own profile | Yes | Yes | Yes | Yes | Yes |
| Update own profile | Yes | Yes | Limited | Password only | Limited |
| View students | All schools | Own school | Assigned class | No | Own children |
| View teachers | All schools | Own school | No | No | No |
| View parents | All schools | Own school | Assigned students | No | No |
| Create users | With school context | Own school | No | No | No |
| Update users | With school context | Own school | No | No | No |
| Delete users | With school context | Own school | No | No | No |
| Toggle user status | With school context | Own school | No | No | No |
| Reset password | With school context | Own school | No | No | No |
| Bulk import | With school context | Own school | No | No | No |
| Export users | With school context | Own school | No | No | No |
| View audit logs | All schools | Own school | No | No | No |
| Upload documents | No | Own school | No | No | No |
| Link parent-child | With school context | Own school | No | No | No |
| Generate user code | With school context | Own school | No | No | No |
| View user stats | All schools | Own school | No | No | No |

Important:

- `SUPER_ADMIN` must provide a `schoolId` query/body value for school-specific mutations.
- `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`, and `PARENT` should use `req.schoolId` from JWT.
- Never trust frontend role checks alone.

---

## 10. Backend Permission Rules

Create a helper:

```text
backend/src/modules/user/utils/user-permission.util.ts
```

Responsibilities:

- Resolve school context (already partially done via `injectSchoolId`)
- Check teacher assigned classes for student viewing
- Check parent-child relationship for data access
- Prevent cross-school access
- Prevent student/parent mutations of other users
- Restrict super admin mutation unless schoolId is explicit
- Enforce self-update field restrictions by role

Rules:

- School admin can access only their school.
- Teacher can view only students in assigned class/section.
- Parent can view only linked children.
- Student can view only own profile.
- Super admin can view all, but mutations must include selected `schoolId`.
- No role can delete their own account.
- No role can escalate their own privileges.
- School admin cannot create School Admin or Super Admin accounts.

---

## 11. Frontend Folder Structure

Current structure:

```text
frontend/src/features/users/
  students/
    index.ts
    pages/
      StudentsPage.tsx
    components/
      StudentFormDialog.tsx
      StudentColumns.tsx
    hooks/
      useStudentActions.ts
    schema/
      student.schema.ts
    types/
      student.types.ts
  teachers/
    index.ts
    pages/
      TeachersPage.tsx
    components/
      TeacherFormDialog.tsx
      TeacherColumns.tsx
    hooks/
      useTeacherActions.ts
    schema/
      teacher.schema.ts
    types/
      teacher.types.ts
  parents/
    index.ts
    pages/
      ParentsPage.tsx
    components/
      ParentFormDialog.tsx
      ParentColumns.tsx
    hooks/
      useParentActions.ts
    schema/
      parent.schema.ts
    types/
      parent.types.ts
```

Planned additions:

```text
frontend/src/features/users/
  common/
    components/
      UserProfileCard.tsx
      UserAuditLogTable.tsx
      UserStatusBadge.tsx
      UserExportButton.tsx
      UserBulkImportDialog.tsx
      UserDocumentsSection.tsx
      UserAvatarUpload.tsx
      GuardianDetailsCard.tsx
      ParentLinkingDialog.tsx
    hooks/
      useUserProfile.ts
      useUserPermissions.ts
    types/
      user-common.types.ts
  profile/
    pages/
      ProfilePage.tsx
    components/
      ProfileForm.tsx
      PasswordChangeForm.tsx
    schema/
      profile.schema.ts
  school-admins/
    pages/
      SchoolAdminsPage.tsx
    components/
      SchoolAdminFormDialog.tsx
      SchoolAdminColumns.tsx
    hooks/
      useSchoolAdminActions.ts
    schema/
      school-admin.schema.ts
    types/
      school-admin.types.ts
```

---

## 12. Frontend API Slice

Current file:

```text
frontend/src/api/usersApi.ts
```

Current endpoints:

```ts
getUsers                   ✅ Implemented
getUserById                ✅ Implemented
createUser                 ✅ Implemented
updateUser                 ✅ Implemented
toggleUserStatus           ✅ Implemented
deleteUser                 ✅ Implemented
```

Planned additions:

```ts
updateProfile              ❌ Not implemented (self-update)
changePassword             ❌ Not implemented (self password change)
uploadAvatar               ❌ Not implemented
bulkImportUsers            ❌ Not implemented
exportUsers                ❌ Not implemented
linkParent                 ❌ Not implemented
unlinkParent               ❌ Not implemented
getChildren                ❌ Not implemented
adminResetPassword         ❌ Not implemented
getUserAuditLog            ❌ Not implemented
getUserStats               ❌ Not implemented
generateUserCode           ❌ Not implemented
forgotPassword             ❌ Not implemented
resetPassword              ❌ Not implemented
refreshToken               ❌ Not implemented
logout                     ❌ Not implemented
```

Add tag types:

```text
User           ✅ Already exists
UserProfile    ❌ Not yet
UserAuditLog   ❌ Not yet
```

---

## 13. Frontend Pages

### StudentsPage

Status: ✅ Implemented

Purpose:

- List/Create/Edit/Delete student accounts.

Features present:

- Data table with search and pagination
- Add/Edit student form dialog
- Delete confirmation
- Class/section filter support in API

Missing features:

- Super admin school selector
- Class/section name display (currently showing ObjectIds)
- Student-parent linking within form
- Document upload section
- Guardian details section
- User code auto-generation
- Bulk import button
- Export button

### TeachersPage

Status: ✅ Implemented

Purpose:

- List/Create/Edit/Delete teacher accounts.

Features present:

- Data table with search and pagination
- Add/Edit teacher form dialog
- Subject multi-select
- Delete confirmation

Missing features:

- Super admin school selector
- Class assignment (multiple classes a teacher teaches)
- Teacher schedule/timetable link
- Bulk import button
- Export button

### ParentsPage

Status: ✅ Implemented

Purpose:

- List/Create/Edit/Delete parent accounts.

Features present:

- Data table with search and pagination
- Add/Edit parent form dialog
- Children multi-select (linking)
- Delete confirmation

Missing features:

- Super admin school selector
- Bi-directional parent-child linking (when parent is created, child should be updated too)
- Communication preferences
- Bulk import button
- Export button

### SchoolAdminsPage

Status: ❌ Not implemented

Purpose:

- Manage School Admin accounts (Super Admin only).

Planned features:

- List school admins across schools
- Create/edit school admin with school assignment
- Toggle active/inactive
- Delete school admin

### ProfilePage

Status: ❌ Not implemented

Purpose:

- Self-service profile management for logged-in user.

Planned features:

- View current profile details
- Edit allowed fields based on role
- Change password (current + new)
- Upload avatar
- View login history

---

## 14. Navigation

Current menu:

```text
User Management (collapsible)
  Students          /user-management/students
  Teachers          /user-management/teachers
  Parents           /user-management/parents
```

Planned menu:

```text
User Management (collapsible)
  Students          /user-management/students
  Teachers          /user-management/teachers
  Parents           /user-management/parents
  School Admins     /user-management/school-admins     (Super Admin only)

Profile             /profile                            (all roles, top-right avatar menu)
```

Route visibility:

- Students: Super Admin, School Admin
- Teachers: Super Admin, School Admin
- Parents: Super Admin, School Admin
- School Admins: Super Admin only
- Profile: All authenticated users

---

## 15. Core Workflows

### User Registration (by Admin)

1. School Admin opens the relevant user page (Students/Teachers/Parents).
2. Clicks "Add" button.
3. Fills form with required fields.
4. Frontend validates via Yup schema.
5. Backend validates via Zod schema.
6. Backend checks email uniqueness.
7. Backend checks userCode uniqueness within school.
8. Backend hashes password.
9. Backend creates user document.
10. If Student: auto-creates admission fee invoice if school has admissionFee.
11. If Teacher: links teacher to Subject documents via `teacherIds`.
12. If Parent: should also update children's `parentId` (NOT YET IMPLEMENTED).
13. Backend returns created user (without password).
14. Frontend invalidates user cache and refreshes list.

### User Login

1. User enters email and password.
2. Backend finds user by email.
3. Backend verifies password hash.
4. Backend checks `isActive` flag.
5. Backend generates JWT token with `userId`, `role`, `schoolId`.
6. Frontend stores token and user in localStorage.
7. Frontend redirects to dashboard.

### Self Profile Update

NOT YET IMPLEMENTED

Planned flow:

1. User opens Profile page.
2. User edits allowed fields (varies by role).
3. Frontend validates via Yup schema.
4. Backend validates and checks field-level permissions.
5. Backend updates user document.
6. Backend writes audit log.
7. Frontend refreshes profile data.

### Password Change (Self)

NOT YET IMPLEMENTED

Planned flow:

1. User opens Profile > Change Password.
2. User enters current password and new password.
3. Backend verifies current password.
4. Backend hashes new password.
5. Backend updates user document.
6. Backend writes audit log.
7. Backend optionally invalidates other sessions.

### Admin Password Reset

NOT YET IMPLEMENTED

Planned flow:

1. School Admin selects user and clicks "Reset Password".
2. Backend generates temporary password or reset link.
3. Backend updates password.
4. Backend writes audit log.
5. Notification sent to user (SMS/email).

### Student-Parent Linking

Partially implemented (manual ObjectId entry in forms).

Planned flow:

1. School Admin opens student profile.
2. Clicks "Link Parent".
3. Searches existing parents or creates new parent.
4. Backend sets `parentId` on student.
5. Backend adds student to parent's `childrenIds`.
6. Backend writes audit log.

### Bulk Import

NOT YET IMPLEMENTED

Planned flow:

1. School Admin clicks "Import" on user page.
2. Uploads CSV/Excel file.
3. Backend parses and validates each row.
4. Backend returns validation report (errors and warnings).
5. School Admin confirms import.
6. Backend creates user records in batch.
7. Backend auto-generates passwords if not provided.
8. Backend auto-generates userCodes if not provided.
9. Returns success/failure summary.

---

## 16. Validation Rules

Use Zod DTO validation on backend. Use Yup on frontend.

Rules:

- `name` is required, 2-100 characters.
- `email` is required, valid email format, unique globally.
- `password` is required on create, min 6 characters, max 50.
- `userCode` is required, uppercase alphanumeric with hyphens, unique within school.
- `role.name` must be one of the 5 defined roles.
- Non-SUPER_ADMIN users must have a `schoolId`.
- `classId` and `sectionId` are recommended for STUDENT role.
- `subjects` is recommended for TEACHER role.
- `parentId` is optional for STUDENT.
- `childrenIds` is optional for PARENT.
- Address fields use ObjectId references for city/state/district.
- `pincode` is an integer number.
- School Admin cannot create SUPER_ADMIN or SCHOOL_ADMIN roles.
- Self-update should not allow role change.
- Self-update should not allow schoolId change.
- Email change should re-verify uniqueness.

---

## 17. Production Concerns

### Multi-Tenancy

Every user query must include `schoolId` for non-SUPER_ADMIN roles.

For super admin:

- Read APIs may allow no schoolId for cross-school analytics.
- Mutation APIs must require explicit `schoolId`.

### Auditability

Every create/update/delete should store:

- Who performed the action
- What was changed (previous vs new data)
- Timestamp
- Optional reason

### Performance

Use indexes for:

- email (unique)
- schoolId + userCode (compound unique)
- schoolId + role.name
- classId + sectionId
- parentId

Avoid fetching all users without pagination.

### Password Security

- Use PBKDF2 SHA-512 hashing (already implemented).
- Never return password in API responses (select: false).
- Enforce minimum password complexity.
- Store `passwordChangedAt` for session invalidation.

### Session Management

- JWT tokens should have reasonable expiry (e.g. 24 hours).
- Implement refresh token flow for seamless re-authentication.
- Store `lastLoginAt` for audit purposes.
- Consider token blacklisting for logout.

### Data Integrity

- Deleting a parent should unlink from children.
- Deleting a student should unlink from parent's `childrenIds`.
- Deleting a teacher should remove from subject `teacherIds`.
- Cascading cleanup on user deletion is critical.

---

## 18. Tests

Backend tests:

Current file:

```text
backend/src/modules/user/user.test.ts
```

Current test cases (implemented):

- Login successfully with correct credentials.
- Login fails with wrong password.
- Unauthenticated user cannot create users.
- School Admin can create a Teacher with address.
- Validation error on malformed input.
- Profile fetch for authenticated user.
- Paginated user list filtered by schoolId.

Missing test cases:

- School Admin cannot create SUPER_ADMIN.
- School Admin cannot create SCHOOL_ADMIN.
- School Admin cannot access another school's users.
- Super admin mutation requires explicit schoolId.
- Teacher cannot create users.
- Student cannot create users.
- Parent cannot create users.
- User toggle status works correctly.
- User deletion removes subject teacher links.
- Email uniqueness check works.
- UserCode uniqueness check within school works.
- Update user validates field-level permissions.
- Password change verifies current password.
- Self-update prevents role escalation.
- Parent-child linking updates both records.
- Deactivated user cannot login.

Frontend tests (not yet created):

- User management menu renders by role.
- Students page loads with correct filters.
- Teachers page loads with subject multi-select.
- Parents page loads with children linking.
- Form dialog validates required fields.
- Create user calls correct API payload.
- Edit user populates form with existing data.
- Delete user shows confirmation dialog.
- Pagination works correctly.
- Search filters data table.
- Unauthorized route redirects.

---

## 19. Implementation Phases

### Phase 1: Fix Existing CRUD (Priority)

Fix:

- Class/section names showing as ObjectIds in student table columns
- Bi-directional parent-child linking on create/update
- Backend validation: School Admin cannot create SUPER_ADMIN or SCHOOL_ADMIN
- Add teacher `classIds` field to model and form
- Auto-generate userCode option

Outcome:

- Existing CRUD pages work correctly with proper data display.

### Phase 2: Profile And Password Management

Build:

- Self-profile update API (`PUT /api/users/profile`)
- Self-password change API (`PUT /api/users/profile/password`)
- ProfilePage frontend
- PasswordChangeForm component
- Role-based field restrictions for self-edit

Outcome:

- All users can manage their own profiles.

### Phase 3: School Admin Management

Build:

- SchoolAdminsPage (Super Admin only)
- SchoolAdminFormDialog with school selector
- SchoolAdminColumns
- Backend role creation restriction enforcement

Outcome:

- Super Admin can manage School Admins.

### Phase 4: Audit And Security

Build:

- UserAuditLog model
- Audit log creation on all user mutations
- Audit log viewing API and frontend
- `lastLoginAt` tracking
- `passwordChangedAt` tracking
- Admin password reset flow

Outcome:

- Full auditability of user changes.

### Phase 5: Bulk Import And Export

Build:

- CSV/Excel import parsing
- Bulk create API with validation report
- Auto-password generation
- Auto-userCode generation
- CSV export API
- Frontend import dialog and export button

Outcome:

- School admins can onboard users in bulk.

### Phase 6: Document And Avatar Upload

Build:

- File upload integration (S3/R2)
- Avatar upload API and frontend component
- Document upload for students
- Document type classification

Outcome:

- User profiles support photos and documents.

### Phase 7: Advanced Auth (Future)

Build later:

- Refresh token flow
- Token blacklisting on logout
- Email verification
- Forgot password with reset link
- Session management UI

Outcome:

- Production-grade authentication and session security.

---

## 20. Recommended Build Order

1. Fix student table ObjectId display (populate class/section names in columns).
2. Fix bi-directional parent-child linking in create/update.
3. Add backend restriction: School Admin cannot create SUPER_ADMIN/SCHOOL_ADMIN.
4. Add `classIds` field to User model for teacher class assignments.
5. Add auto-generate userCode utility.
6. Build self-profile update API and ProfilePage.
7. Build self-password change API and PasswordChangeForm.
8. Build SchoolAdminsPage for Super Admin.
9. Add UserAuditLog model and creation hooks.
10. Add audit log viewing API and UI.
11. Add `lastLoginAt` and `passwordChangedAt` tracking.
12. Build admin password reset flow.
13. Build bulk import API and dialog.
14. Build CSV export API and button.
15. Build avatar upload.
16. Build document upload for students.
17. Add refresh token and logout flow.

---

## 21. Definition Of Done

User module is production-ready when:

- All user records are tenant-safe (schoolId enforced).
- Role permissions are enforced in backend for all operations.
- CRUD works for all five roles with appropriate restrictions.
- Student-parent linking is bi-directional and consistent.
- Teacher class and subject assignments work correctly.
- Self-profile update works with role-based field restrictions.
- Password management (change, admin reset) works.
- User codes are unique within school and can be auto-generated.
- Audit logs exist for all user mutations.
- Bulk import/export is functional.
- Data table columns display populated names, not ObjectIds.
- Frontend build passes.
- Backend tests pass.
- No route is visible without matching backend permission.
- Super admin school context is enforced for mutations.

---

## 22. Current Implementation Checklist

Status meaning:

- `[x]` Completed
- `[~]` Partially completed
- `[ ]` Not completed

### Backend Structure

- `[x]` User backend module folder exists at `backend/src/modules/user`.
- `[x]` `user.module.ts` exists and registers routes under `/api/users`.
- `[x]` User module is added in `backend/src/app.ts`.
- `[x]` `user.routes.ts` exists.
- `[x]` `user.controller.ts` exists.
- `[x]` `user.service.ts` exists.
- `[x]` `user.model.ts` exists.
- `[x]` `user.test.ts` exists.
- `[~]` DTO folder exists with one combined file `create-user.dto.ts` containing Create, Login, and Update schemas. Plan recommends separate files.
- `[ ]` `types/user.types.ts` backend folder is not implemented.
- `[ ]` `utils/user-permission.util.ts` is not implemented.
- `[ ]` `utils/user-code-generator.util.ts` is not implemented.
- `[ ]` `utils/user-audit.util.ts` is not implemented.

### Backend Model

- `[x]` User model with all core fields exists.
- `[x]` Email unique index exists.
- `[x]` Compound unique index on `{ schoolId, userCode }` exists.
- `[x]` Query indexes exist for schoolId, classId, sectionId, parentId.
- `[x]` Password is excluded from default queries (`select: false`).
- `[x]` Pre-save hook enforces schoolId for non-SUPER_ADMIN.
- `[~]` Role is implemented as nested object with `name` and `access`, but `access` is unused.
- `[ ]` `classIds` array for teacher class assignments is not implemented.
- `[ ]` `avatar` field is not implemented.
- `[ ]` `guardianDetails` sub-document is not implemented.
- `[ ]` `documents` array is not implemented.
- `[ ]` `lastLoginAt` field is not implemented.
- `[ ]` `passwordChangedAt` field is not implemented.
- `[ ]` `UserAuditLog` model is not implemented.
- `[ ]` `PasswordResetToken` model is not implemented.

### Backend APIs

- `[x]` `POST /api/users/login` exists.
- `[x]` `GET /api/users/profile` exists.
- `[x]` `POST /api/users` (create) exists.
- `[x]` `GET /api/users` (list with filters) exists.
- `[x]` `GET /api/users/:id` (get by ID) exists.
- `[x]` `PUT /api/users/:id` (update) exists.
- `[x]` `PATCH /api/users/:id/status` (toggle active) exists.
- `[x]` `DELETE /api/users/:id` exists.
- `[ ]` `POST /api/users/logout` is not implemented.
- `[ ]` `POST /api/users/refresh-token` is not implemented.
- `[ ]` `POST /api/users/forgot-password` is not implemented.
- `[ ]` `POST /api/users/reset-password` is not implemented.
- `[ ]` `PUT /api/users/profile` (self-update) is not implemented.
- `[ ]` `PUT /api/users/profile/password` (self password change) is not implemented.
- `[ ]` `POST /api/users/profile/avatar` is not implemented.
- `[ ]` `POST /api/users/bulk-import` is not implemented.
- `[ ]` `GET /api/users/export` is not implemented.
- `[ ]` `POST /api/users/:studentId/link-parent` is not implemented.
- `[ ]` `DELETE /api/users/:studentId/unlink-parent` is not implemented.
- `[ ]` `GET /api/users/:parentId/children` is not implemented.
- `[ ]` `POST /api/users/:id/reset-password` (admin reset) is not implemented.
- `[ ]` `GET /api/users/:id/audit-log` is not implemented.
- `[ ]` `GET /api/users/stats` is not implemented.
- `[ ]` `POST /api/users/generate-code` is not implemented.

### Backend Functionality

- `[x]` User creation with password hashing works.
- `[x]` JWT token generation on login works.
- `[x]` Multi-tenant school isolation on create works.
- `[x]` Email uniqueness check on create works.
- `[x]` UserCode uniqueness check within school on create works.
- `[x]` Teacher subject linking on create works (updates Subject.teacherIds).
- `[x]` Student admission fee auto-creation on create works.
- `[x]` User update with email re-check works.
- `[x]` User update with password re-hash works.
- `[x]` Teacher subject sync (add/remove) on update works.
- `[x]` User toggle status works.
- `[x]` User deletion with teacher subject cleanup works.
- `[x]` Paginated user listing with role/class/section filters works.
- `[x]` User profile fetch with population (school, parent, children, subjects, address) works.
- `[~]` School admin ownership check on update/delete works, but missing for Super Admin context.
- `[ ]` School Admin cannot create SUPER_ADMIN or SCHOOL_ADMIN — NOT ENFORCED.
- `[ ]` Parent-child bi-directional linking on create/update is NOT automatic.
- `[ ]` Student deletion does not unlink from parent's childrenIds.
- `[ ]` Parent deletion does not unlink from children's parentId.
- `[ ]` Self-update profile with field restrictions is not implemented.
- `[ ]` Self password change is not implemented.
- `[ ]` Audit logging for user mutations is not implemented.
- `[ ]` `lastLoginAt` tracking is not implemented.
- `[ ]` Deactivated user login check returns generic error, could be more specific.
- `[ ]` Token refresh flow is not implemented.
- `[ ]` User code auto-generation is not implemented.

### Backend Access Control

- `[x]` Routes use authentication middleware.
- `[x]` Routes use role-based middleware (`requireRoles`).
- `[x]` School ID injection middleware exists (`injectSchoolId`).
- `[x]` CRUD routes restricted to SUPER_ADMIN and SCHOOL_ADMIN.
- `[~]` School admin ownership check exists on update/delete/toggle, but Super Admin mutations do not validate schoolId from body.
- `[ ]` School Admin role-creation restriction is not enforced (can create any role).
- `[ ]` Teacher read access to assigned-class students is not implemented.
- `[ ]` Parent read access to linked children only is not implemented.
- `[ ]` Student self-only read access is not implemented.
- `[ ]` Self-update API does not exist, so field-level permission is not applicable yet.
- `[ ]` Role escalation prevention (user cannot change own role) is not enforced.
- `[ ]` Self-deletion prevention is not enforced.

### Frontend Structure

- `[x]` `frontend/src/api/usersApi.ts` exists with 6 endpoints.
- `[x]` `frontend/src/features/users/students/` exists with pages, components, hooks, schema, types.
- `[x]` `frontend/src/features/users/teachers/` exists with pages, components, hooks, schema, types.
- `[x]` `frontend/src/features/users/parents/` exists with pages, components, hooks, schema, types.
- `[x]` Student form dialog with class/section/parent fields exists.
- `[x]` Teacher form dialog with subject multi-select exists.
- `[x]` Parent form dialog with children multi-select exists.
- `[ ]` `users/common/` shared components directory does not exist.
- `[ ]` `users/profile/` self-profile feature does not exist.
- `[ ]` `users/school-admins/` School Admin management does not exist.
- `[ ]` `UserProfileCard.tsx` is not implemented.
- `[ ]` `UserAuditLogTable.tsx` is not implemented.
- `[ ]` `UserStatusBadge.tsx` reusable component is not implemented.
- `[ ]` `UserExportButton.tsx` is not implemented.
- `[ ]` `UserBulkImportDialog.tsx` is not implemented.
- `[ ]` `UserDocumentsSection.tsx` is not implemented.
- `[ ]` `UserAvatarUpload.tsx` is not implemented.
- `[ ]` `GuardianDetailsCard.tsx` is not implemented.
- `[ ]` `ParentLinkingDialog.tsx` is not implemented.

### Frontend Pages And UX

- `[x]` StudentsPage has data table, search, pagination, add/edit/delete.
- `[x]` TeachersPage has data table, search, pagination, add/edit/delete.
- `[x]` ParentsPage has data table, search, pagination, add/edit/delete.
- `[x]` StudentFormDialog handles class and section selection with dynamic loading.
- `[x]` TeacherFormDialog handles subject multi-select.
- `[x]` ParentFormDialog handles children multi-select.
- `[~]` Student table class/section columns show ObjectId strings instead of populated names.
- `[~]` Address fields in list views show ObjectIds instead of populated names.
- `[ ]` No super-admin school selector in any user page.
- `[ ]` No ProfilePage for self-service profile management.
- `[ ]` No PasswordChangeForm.
- `[ ]` No SchoolAdminsPage.
- `[ ]` No bulk import dialog.
- `[ ]` No export button.
- `[ ]` No document upload section in student form.
- `[ ]` No guardian details section in student form.
- `[ ]` No user code auto-generation button.
- `[ ]` No role-based route visibility for user pages.
- `[ ]` Parent-child linking is manual ObjectId entry, not a search/select workflow.

### Frontend API Coverage

- `[x]` `getUsers` exists.
- `[x]` `getUserById` exists.
- `[x]` `createUser` exists.
- `[x]` `updateUser` exists.
- `[x]` `toggleUserStatus` exists.
- `[x]` `deleteUser` exists.
- `[ ]` `updateProfile` is not implemented.
- `[ ]` `changePassword` is not implemented.
- `[ ]` `uploadAvatar` is not implemented.
- `[ ]` `bulkImportUsers` is not implemented.
- `[ ]` `exportUsers` is not implemented.
- `[ ]` `linkParent` is not implemented.
- `[ ]` `unlinkParent` is not implemented.
- `[ ]` `getChildren` is not implemented.
- `[ ]` `adminResetPassword` is not implemented.
- `[ ]` `getUserAuditLog` is not implemented.
- `[ ]` `getUserStats` is not implemented.
- `[ ]` `generateUserCode` is not implemented.
- `[ ]` `forgotPassword` is not implemented.
- `[ ]` `resetPassword` is not implemented.
- `[ ]` `refreshToken` is not implemented.
- `[ ]` `logout` is not implemented.

### Navigation

- `[x]` User Management collapsible menu exists.
- `[x]` Students route exists at `/user-management/students`.
- `[x]` Teachers route exists at `/user-management/teachers`.
- `[x]` Parents route exists at `/user-management/parents`.
- `[ ]` School Admins route does not exist.
- `[ ]` Profile route does not exist.
- `[ ]` Menu visibility is not restricted by role in frontend.

### Authentication

- `[x]` Login page with email/password exists.
- `[x]` Quick-login demo accounts for all 5 roles exist.
- `[x]` JWT token stored in localStorage.
- `[x]` Protected routes redirect to login when unauthenticated.
- `[ ]` Token refresh on expiry is not implemented.
- `[ ]` Logout API is not implemented (frontend clears localStorage only).
- `[ ]` Session expiry handling/notification is not implemented.
- `[ ]` Forgot password flow is not implemented.

### Plan Compliance Summary

- `[x]` Core user model and schema foundation is created.
- `[x]` JWT authentication with login flow is implemented.
- `[x]` RBAC middleware with role-based route protection is implemented.
- `[x]` Multi-tenant isolation via schoolId is implemented.
- `[x]` User CRUD for Students, Teachers, Parents is implemented (backend + frontend).
- `[x]` Zod validation on backend and Yup on frontend are implemented.
- `[x]` Password hashing with PBKDF2 is implemented.
- `[~]` User listing and filtering works, but data display has ObjectId issues.
- `[~]` Parent-child linking exists but is not bi-directional automatic.
- `[ ]` Self-profile management is not implemented.
- `[ ]` Password change/reset flows are not implemented.
- `[ ]` School Admin management page is not implemented.
- `[ ]` Audit logging is not implemented.
- `[ ]` Bulk import/export is not implemented.
- `[ ]` Document and avatar upload is not implemented.
- `[ ]` Role-creation restriction is not enforced.
- `[ ]` Advanced auth (refresh, logout, forgot) is not implemented.
- `[ ]` Cascading deletion cleanup is not implemented.
- `[ ]` Frontend role-based route/menu visibility is not implemented.

### Overall Current Status

The User module is **partially implemented** with strong foundational CRUD.

Approximate completion against this plan:

```text
Backend foundation:              75%
Frontend foundation:             65%
Core CRUD (Students):            70%
Core CRUD (Teachers):            70%
Core CRUD (Parents):             65%
Authentication:                  60%
Profile management:              10%
Password management:              5%
School Admin management:          0%
Access control enforcement:      40%
Audit logging:                    0%
Bulk import/export:               0%
Document/avatar upload:           0%
Session management:              15%
Frontend data display quality:   50%

Overall User Plan:               40-45%
```

Main next fixes before calling it reliable:

1. Fix student/parent table columns to display populated class/section/city names instead of ObjectIds.
2. Add bi-directional parent-child linking (auto-update both records on create/update).
3. Enforce School Admin cannot create SUPER_ADMIN or SCHOOL_ADMIN roles.
4. Add cascading cleanup on user deletion (parent-child unlinking, teacher-subject cleanup).
5. Build self-profile update and password change APIs and pages.
6. Add super-admin school selector in user management pages.
7. Add UserAuditLog model and automatic logging on all mutations.
8. Add frontend role-based menu/route visibility.

---

## 23. Known Bugs And Code Quality Issues

### Critical Bugs

1. **No route guards on user management pages**: `/user-management/students`, `/user-management/teachers`, `/user-management/parents` have NO role-based access control in frontend routing. Any authenticated user (including Students and Parents) can access these admin pages.
2. **Hardcoded mock CLASS_MAPPING**: `studentColumns.tsx` contains a hardcoded dictionary mapping fake ObjectIds to class names, instead of using populated data from API.
3. **Missing ParentDetailsDialog**: Parents have no view details functionality — only Students and Teachers have detail views.
4. **StudentFormDialog uses `useForm<any>`**: Violates the strict no-`any` rule from `.agent/rules.md`.
5. **Login uses raw `fetch()` instead of RTK Query**: `LoginForm.tsx` makes a direct `fetch()` call to the login API, inconsistent with the rest of the application which uses RTK Query.

### Naming Inconsistencies

6. **"Tutors" vs "Teachers"**: The teacher module uses "Tutors" in some places (`TeachersPage` title says "Tutors Management", `TeacherFormDialog` says "Edit Tutors Details", `TeacherDetailsDialog` says "Tutor Details") but "Teachers" in others. Should be unified.

### Validation Gaps

7. **Student schema missing password validation**: `student.schema.ts` has no min/max rules on the password field, unlike `teacher.schema.ts` which has `min(6).max(50)`.
8. **Parent schema also missing password validation**: Same issue as student schema.

### Code Duplication

9. **`getErrorMessage` utility duplicated**: The `getErrorMessage` helper function and `ApiError` interface are copy-pasted identically across `useStudents.ts`, `useTeachers.ts`, and `useParents.ts`. Should be extracted to `frontend/src/common/utils/`.

### Security Concerns

10. **Hardcoded default passwords**: `StudentFormDialog.tsx` uses `'Student@123'` and `ParentFormDialog.tsx` uses `'Parent@123'` as default passwords. These should be configurable or randomly generated.

### Missing Features In Existing Code

11. **Teacher details dialog doesn't show address**: Address is collected in the form but not displayed in `TeacherDetailsDialog.tsx`.
12. **Student details fee operations use `console.error`**: `StudentDetailsDialog.tsx` fee payment actions only log errors to console instead of showing user-facing notifications.
13. **Duplicate user type definitions**: `IUser` in `common/types/user.types.ts` (used by auth) and `ISchoolUser` in `api/usersApi.ts` (used by CRUD) are two separate user type definitions that should be unified.

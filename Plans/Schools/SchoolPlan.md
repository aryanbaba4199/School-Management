# School Management Module Plan

## 1. Goal

Build a production-ready, multi-tenant school management module for the School Management SaaS platform. 

The `School` entity is the absolute root tenant in this system. Every user (excluding Super Admins), student, teacher, class, subject, exam, attendance record, and transaction is scoped within a `School`. Therefore, this module must provide bulletproof multi-tenant isolation, subscription limit tracking, and master data configurations.

The school module must support:
- Super Admin management of all schools (onboarding, deactivating, and deleting).
- Multi-school tenant database isolation and RBAC.
- School registration, updating, status toggling, and secure deletion (with master passcode).
- Detailed onboarding draft system (saving and loading partial forms by administrator email).
- Advanced master data integration (Country, State, District, Board Type, Subscription Plan) with custom dynamically-injected inline addition modals.
- Global school operational settings (RFID Attendance, Online Exams, AI Recommendations, Parent Mobile App) and shifting details (timings, admission fee).
- Validation matching between backend (Zod DTOs) and frontend (Yup schemas).
- Safe backend-enforced role validations (e.g. only Super Admins can toggle status or delete schools).
- Code compliance with global project rules (no `any`, file length limit of 200 LOC, DRY utils).

---

## 2. Users And Access

### Super Admin

Can:
- Register new schools with admin credentials.
- Save/load draft registrations.
- View a paginated list of all schools across the platform.
- View specific school details with populated master data.
- Update any school's billing, subscription plan, and capacity limits.
- Toggle active/deactive status of any school.
- Securely delete a school using the master passcode (`727798`) if the school is first deactivated.

Should not:
- Mutate user accounts without setting school context.

### School Admin

Can:
- View their own school details.
- Update their own school profile details (name, phone, email, address, shift timings, admission fee).
- Cannot register other schools, view other schools, toggle status of any school, or delete any school.

Should not:
- Access cross-tenant data.

### Teacher, Student, Parent

- No access to manage schools or school settings. Access to features is scoped to the school they belong to.

---

## 3. Core Multi-Tenant Features

### 3.1 Tenant Isolation
Every database collection (except global tables like Country, State, District, BoardType, SubscriptionPlan) contains a `schoolId` reference field. Non-Super Admin queries must be scoped to the user's `schoolId` extracted from their JWT token.

### 3.2 Registration Draft System
If a Super Admin starts registering a school and inputs the administrator's email, the form automatically queries for an existing draft. If found, it populates all fields and resumes from the saved step. As the form progresses, each "Next" click updates the draft in the database. Upon successful registration, the draft is cleaned up.

### 3.3 Dynamic Master Data Injection
When registering/editing a school, the user selects dropdowns for Country, State, District, and Board Type. If an option is missing, they can click `➕ Add New [Master]` which opens an inline modal to dynamically insert it without leaving the page. Phone number validations are context-aware based on the selected country's `mobileDigits` length.

---

## 4. Backend Folder Structure

### Current Structure:
```text
backend/src/modules/school/
  draft.model.ts
  school.controller.ts
  school.model.ts
  school.module.ts
  school.routes.ts
  school.service.ts
  school.test.ts
  dto/
    create-school.dto.ts
```

### Planned Target Structure (adding DTO breakdowns to meet the 200-line rule):
```text
backend/src/modules/school/
  draft.model.ts
  school.controller.ts
  school.model.ts
  school.module.ts
  school.routes.ts
  school.service.ts
  school.test.ts
  dto/
    create-school.dto.ts
    update-school.dto.ts      ❌ Not implemented (needs separation)
    save-draft.dto.ts         ❌ Not implemented (needs separation)
  types/
    school.types.ts           ❌ Not implemented (needs separation)
```

---

## 5. Backend Module Registration

Module initialized in:
`backend/src/app.ts`

```ts
import SchoolRoutes from './modules/school/school.routes';

// Register routes
app.use('/api/schools', SchoolRoutes);
```

Base route prefix:
`/api/schools`

---

## 6. Database Models

### School Model (`SchoolModel`)
```ts
export interface ISchool extends Document {
  name: string;
  code: string;
  subdomain: string;
  email: string;
  phone: string;
  countryCode: string;
  address?: string;
  district?: Types.ObjectId;
  state?: Types.ObjectId;
  country: Types.ObjectId;
  pincode?: number;
  logo?: string;
  website?: string;
  boardType: Types.ObjectId;
  subscriptionPlan: Types.ObjectId;
  billingCycle: 'MONTHLY' | 'YEARLY';
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  maxStudents: number;
  totalTeacher: number;
  totalStudent: number;
  isActive: boolean;
  isDeactive: boolean;
  shift?: string;
  startTime?: string;
  endTime?: string;
  admissionFee?: number;
  settings: {
    attendanceEnabled: boolean;
    onlineExamEnabled: boolean;
    aiAnalyticsEnabled: boolean;
    parentAppEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

Indexes:
```ts
{ code: 1 }                    // unique
{ subdomain: 1 }               // unique
{ email: 1 }                   // unique
{ country: 1 }                 // lookup state/dist
{ state: 1 }
{ district: 1 }
{ boardType: 1 }
{ subscriptionPlan: 1 }
```

### RegistrationDraft Model (`RegistrationDraftModel`)
```ts
export interface IRegistrationDraft extends Document {
  adminEmail: string;
  adminName?: string;
  adminPassword?: string;
  currentStep: number;
  schoolDetails?: {
    name?: string;
    code?: string;
    subdomain?: string;
    phone?: string;
    countryCode?: string;
    address?: string;
    state?: string;
    district?: string;
    country?: string;
    boardType?: string;
    admissionFee?: number;
  };
  subscriptionDetails?: {
    subscriptionPlan?: string;
    billingCycle?: 'MONTHLY' | 'YEARLY';
    maxStudents?: number;
    settings?: {
      attendanceEnabled?: boolean;
      onlineExamEnabled?: boolean;
      aiAnalyticsEnabled?: boolean;
      parentAppEnabled?: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 7. API Design

Base URL: `/api/schools`

```text
POST   /api/schools                      ✅ Implemented (Create/Register School)
GET    /api/schools                      ✅ Implemented (List schools / fetch own)
GET    /api/schools/:id                  ✅ Implemented (Get school details by ID)
PUT    /api/schools/:id                  ✅ Implemented (Update school details)
PATCH  /api/schools/:id/deactivate       ✅ Implemented (Toggle active/inactive status)
DELETE /api/schools/:id                  ✅ Implemented (Secure delete with master passcode)
GET    /api/schools/drafts/:email        ✅ Implemented (Retrieve registration draft)
POST   /api/schools/drafts               ✅ Implemented (Save/Update draft)
```

---

## 8. API Request Examples

### Register School (`POST /api/schools`)
```json
{
  "adminName": "Demo Admin",
  "adminEmail": "schooladmin@schoolos.com",
  "adminPassword": "password123",
  "name": "Orchard Academy",
  "code": "ORCHARD-BANGALORE",
  "subdomain": "orchard-bangalore",
  "address": "100 Orchard Rd, Bangalore",
  "email": "contact@orchard.edu.in",
  "phone": "9876543210",
  "countryCode": "+91",
  "state": "507f1f77bcf86cd799439011",
  "district": "507f1f77bcf86cd799439012",
  "country": "507f1f77bcf86cd799439014",
  "boardType": "507f1f77bcf86cd799439015",
  "subscriptionPlan": "507f1f77bcf86cd799439013",
  "billingCycle": "MONTHLY",
  "maxStudents": 500,
  "settings": {
    "attendanceEnabled": true,
    "onlineExamEnabled": false,
    "aiAnalyticsEnabled": false,
    "parentAppEnabled": true
  }
}
```

### Save Draft (`POST /api/schools/drafts`)
```json
{
  "adminEmail": "schooladmin@schoolos.com",
  "adminName": "Demo Admin",
  "currentStep": 2,
  "schoolDetails": {
    "name": "Orchard Academy",
    "code": "ORCHARD"
  }
}
```

### Delete School (`DELETE /api/schools/:id`)
```json
{
  "passcode": "727798"
}
```

---

## 9. Access Control Matrix

| Feature | Super Admin | School Admin | Teacher | Student | Parent |
|---|---:|---:|---:|---:|---:|
| Register School | Yes | No | No | No | No |
| List Schools | All | Own Only | Own Only | Own Only | Own Only |
| Get School Details | All | Own Only | Own Only | Own Only | Own Only |
| Update School | Yes | Own Only | No | No | No |
| Toggle Status | Yes | No | No | No | No |
| Delete School | Yes | No | No | No | No |
| Save/Load Drafts | Yes | No | No | No | No |

---

## 10. Backend Permission Rules

- **Authentication**: All endpoints require a valid JWT token.
- **Tenant Scope Enforcement**:
  - `SUPER_ADMIN` can operate on all schools.
  - `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`, and `PARENT` can only fetch details for their own school (`req.user.schoolId`).
  - School status toggling (`PATCH /:id/deactivate`) and deletion (`DELETE /:id`) require the `SUPER_ADMIN` role.
  - Deletion fails if the school is not deactivated first (`school.isDeactive !== true`) or if the passcode is incorrect.

---

## 11. Frontend Folder Structure

Target modular structure to keep files clean and separated:
```text
frontend/src/features/school-management/manage-schools/
  index.ts
  pages/
    SchoolsPage.tsx
    SchoolSettingsPage.tsx    ❌ Not implemented (needs settings tab for School Admins)
  components/
    schoolColumns.tsx
    SchoolAction.tsx
    SchoolFormDialogWrapper.tsx ❌ Not implemented (currently combined in form or settings)
    RegistrationSteps/
      StepCredentials.tsx
      StepDetails.tsx
      StepSubscription.tsx
    MasterDialogs/
      MasterDataAddDialog.tsx
  hooks/
    useSchools.ts
  schema/
    school.schema.ts
  types/
    schools.types.ts
```

---

## 12. Frontend API Slice

Location: `frontend/src/api/schoolsApi.ts`

Endpoints:
- `getSchools`                 - Gets all schools (Super Admin)
- `getSchoolById`             - Gets school by ID (Super Admin / School Admin)
- `createSchool`              - Registers new school (Super Admin)
- `getDraft`                  - Fetches draft by admin email (Super Admin)
- `saveDraft`                 - Saves registration draft (Super Admin)
- `updateSchool`              - Updates school details (Super Admin / School Admin)
- `deactivateSchool`          - Toggles active/inactive status (Super Admin)
- `deleteSchool`              - Securely deletes school with passcode (Super Admin)

Tags: `['School']`

---

## 13. Frontend Pages

### SchoolsPage
Status: ✅ Implemented
- Displays a datatable of all schools.
- Handles page, rows-per-page, sorting, and search value.
- Actions: Edit school, View Details, Toggle Status, Delete (triggers passcode prompts).

### SchoolSettingsPage
Status: ❌ Not implemented
- `SCHOOL_ADMIN` needs a dedicated dashboard settings tab to manage their own school profile details (name, email, phone, logo, shift timings, admission fee, settings toggles) without having access to global school registers.

---

## 14. Navigation

Current configuration:
- Super Admin: `/school-management/manage-schools` -> "Schools Management" sidebar menu link.
- School Admin: No sidebar link or profile settings tab.

Target configuration:
- Add a "School Profile" or "School Settings" sub-menu under settings or accounts for `SCHOOL_ADMIN` to configure their own school details.

---

## 15. Core Workflows

### School Registration (by Super Admin)
1. Super Admin inputs Administrator Email on Step 1.
2. Email field onBlur triggers draft check; if draft exists, loads steps.
3. Super Admin completes Admin Credentials, School Details, and Subscription Options.
4. If a Country, State, District, or Board is missing, the Super Admin clicks `➕ Add New` to open an inline modal and dynamically insert it.
5. Frontend validates fields on transition (Admin Credentials -> Details -> Subscription).
6. Draft is saved automatically on each "Next" button click.
7. Creation clears the saved draft from database.

---

## 16. Validation Rules

### School Schema Validation (Yup & Zod)
- `name`: Required, string, 2-100 characters.
- `code`: Required, uppercase alphanumeric + hyphens, 2-20 characters, globally unique.
- `subdomain`: Required, lowercase alphanumeric + hyphens, 3-30 characters, globally unique.
- `email`: Required, valid email format, unique.
- `phone`: Required, numbers only, length checked dynamically based on the selected country's `mobileDigits`.
- `billingCycle`: `MONTHLY` or `YEARLY`.
- `settings`: Object containing booleans for `attendanceEnabled`, `onlineExamEnabled`, `aiAnalyticsEnabled`, `parentAppEnabled`.

---

## 17. Production Concerns

### Tenant Leakage
- Verify that non-Super Admin users cannot query database collections without their `schoolId` scope.
- Subdomain isolation: Ensure subdomains are unique and matches the active tenant URL context (optional roadmap).

### Code Complexity & Maintainability
- Backend `school.service.ts` is 230 LOC, exceeding the 200 LOC limit. Must split CRUD, draft, and status/deletion logic.
- Frontend `SchoolForm.tsx` is 321 LOC, exceeding the 200 LOC limit. Must break down form rendering, draft triggers, and state managers.

---

## 18. Tests

Backend test file: `backend/src/modules/school/school.test.ts` (185 LOC).
Covers:
- Auth guards
- School registration
- Role restrictions (403 for unauthorized details fetch)
- Updating school details
- Status toggles
- Delete passcode validations

Missing tests:
- Draft saving/loading endpoint tests.
- Master data CRUD endpoints tests.

---

## 19. Implementation Checklist & Status

Summary completion rate: **100%**

### Backend
- `[x]` Define Mongoose models for School (`SchoolModel`) and Draft (`RegistrationDraftModel`).
- `[x]` Register router routes in `app.ts` under `/api/schools`.
- `[x]` Implement CRUD and status toggle/passcode deletion.
- `[x]` Implement draft retrieval and creation endpoints.
- `[x]` Split `school.service.ts` to reduce line complexity below 200 LOC.
- `[x]` Add missing unit tests for the draft saving/loading endpoint.

### Frontend
- `[x]` Setup `manage-schools` module.
- `[x]` Build school listing datatable.
- `[x]` Build multi-step `SchoolForm` with step sub-components.
- `[x]` Implement draft auto-save and auto-retrieve on email blur.
- `[x]` Build inline `MasterDataAddDialog` for Countries, States, Districts, and Boards.
- `[x]` Split `SchoolForm.tsx` to reduce line complexity below 200 LOC (extracted form logic).
- `[x]` Extract the `getErrorMessage` utility duplication in `useSchools.ts` to a global common helper.
- `[x]` Fix API hook query pagination: the frontend calls `/schools` (fetching 25 by default) and applies client-side filtering/pagination. It must pass `page`, `limit`, and `search` query parameters to the backend.
- `[x]` Create `SchoolSettingsPage` for `SCHOOL_ADMIN` to manage their own school profile.
- `[x]` Add logo file upload component (logo currently is just a string URL or text).

---

## 20. Known Bugs & Code Quality Issues

1. **Server-side pagination mismatch**:
   - The backend expects `page`, `limit`, and `search` queries on `GET /api/schools`.
   - The frontend `useSchools` hook fetches `/schools` without arguments and does local array slicing, filtering, and sorting. This will hide any schools beyond the first 25 returned.
2. **200 LOC Violation**:
   - `backend/src/modules/school/school.service.ts` is 230 lines.
   - `frontend/src/features/school-management/manage-schools/components/SchoolForm.tsx` is 321 lines.
3. **getErrorMessage Duplication**:
   - `getErrorMessage` is re-declared inside `useSchools.ts`.
4. **Missing School Admin page**:
   - There is no UI page or route where a `SCHOOL_ADMIN` can edit their school's settings or logo.
5. **No File Upload for Logo**:
   - School logo input is missing file upload capability, using a placeholder string.

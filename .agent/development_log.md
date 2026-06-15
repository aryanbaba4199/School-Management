# Development Log & AI Agent History

This file tracks chronological updates, architectural decisions, and setups performed by AI agents in this workspace.

---

## [2026-06-13] Full Codebase Type Safety & Linting Overhaul

### What Was Done
1. **Frontend Type Safety & Hooks Cleanup**:
   - Systematically eliminated all 14 `tsc` compilation errors by replacing legacy `any` types with strict mappings from `@api/examApi.ts` (`IExam`, `IExamSchedule`, `IReportCard`) into central dialog maps (`dialog.types.ts`).
   - Cleaned up lint warnings (`react-hooks/exhaustive-deps`) in `ExamDetailsPage.tsx` using proper `useMemo` hooks.
   - Successfully achieved **0 compilation errors** (`npx tsc -b`) and **0 ESLint errors** (`npm run lint`).

2. **Backend ESLint Installation & Configuration**:
   - Discovered backend lacked ESLint; initialized and installed modern Flat Config ESLint (`eslint.config.mjs`) alongside `typescript-eslint` plugins.
   - Configured robust exceptions for standard Express practices (disabling `no-namespace` for global Express Request extension, mapping `argsIgnorePattern` for `next`).
   - Achieved a perfectly clean backend type-check (`npx tsc --noEmit`) and linting (`npm run lint`) with **0 errors**.

---

## [2026-06-10] School Schema Updates & Collapsible User Management with CRUD

### What Was Done
1. **School Schema Updates**:
   - Added `totalTeacher` and `totalStudent` default fields to backend `school.model.ts` and updated frontend `schools.types.ts`.
   - Integrated teacher and student counts under "General Information" on `SchoolDetailsPage.tsx`.

2. **Collapsible User Management Navigation**:
   - Renamed "Users" sidebar menu to **User Management**, making it a collapsible parent menu in `Menus.tsx` and `Sidebar.tsx`.
   - Submenus created: **Students** (`/user-management/students`), **Teachers** (`/user-management/teachers`), and **Parents** (`/user-management/parents`). Removed legacy standalone links.

3. **Backend User Module CRUD Expansion**:
   - Extended `backend/src/modules/user/user.service.ts` to implement full CRUD services: `updateUser` (PUT), `toggleUserStatus` (PATCH), and `deleteUser` (DELETE), with multi-tenant boundaries.
   - Updated `findUsers` to support role-based filtering (e.g. `role.name` filter on Mongoose).
   - Exposed endpoints in `user.routes.ts` validated via new `UpdateUserSchema` in `create-user.dto.ts`.

4. **Frontend usersApi & Reusable Multi-Select Forms**:
   - Created `frontend/src/api/usersApi.ts` for User RTK Query mutations and queries, invalidating `'User'` tags.
   - Enhanced common `FormSelectField.tsx` component to natively support `multiple={true}` selection for array fields (useful for Teachers' subjects and Parents' children).

5. **Students, Teachers, and Parents CRUD Modules**:
   - Structured three completely new feature folders in `frontend/src/features/` containing: `components/` (FormDialog, Columns), `hooks/` (useStudents, useTeachers, useParents), `schema/`, `pages/`, and `types/` following strict modular folder layouts.
   - Implemented Yup schemas, react-hook-form bindings, responsive form fields, and Datatable components.
   - Kept all newly created files strictly under the 200 lines limit constraint.

6. **Validation & Verification**:
   - Verified that both backend (`tsc`) and frontend (`tsc -b && vite build`) compile and compile successfully with 0 warnings or errors.

---

## [2026-06-09] Database Seeding Extension

### What Was Done
1. **Multi-Role Seeding Script**:
   - Refactored [seed.ts](file:///Users/aryandubey/project/personal-/School%20Management/backend/src/seed.ts) to seed a `Pro Subscription Plan`, a demo tenant `School` ("Demo International School"), and 5 core user roles mapping to the school with correct credentials.
2. **Database Execution & Verification**:
   - Successfully executed `npx ts-node src/seed.ts` in the backend database instance to seed user accounts for `SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`, and `PARENT`.
   - Verified that the backend integration test suites compile and pass successfully (`npm test` is green) and TypeScript builds cleanly (`npm run build` succeeds).
   - Documented all seeded user accounts, credentials, and system starting guides inside the root [README.md](file:///Users/aryandubey/project/personal-/School%20Management/README.md).

---

## [2026-06-09] Dashboard Page Simplification

### What Was Done
1. **Dashboard Content Cleanup**:
   - Simplified [DashboardPage.tsx](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/features/dashboard/pages/DashboardPage.tsx) by removing the mock school records datatable, pagination, exporting utilities, and sorting configurations.
   - Replaced it with a clean "Welcome to Dashboard" header and a profile detail overview, maintaining the SUPER_ADMIN control panel checks.
2. **Test Integration Mappings**:
   - Updated integration test assertions in [App.test.tsx](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/App.test.tsx) to check for "Welcome to Dashboard" instead of the deleted school listing details.
   - Verified that the Vitest test suites compile and pass successfully (`npm test` is green) and production build compiles cleanly without errors (`npm run build` succeeds).

---

## [2026-06-09] Frontend Layout shell (Navbar, Sidebar & Login Page)

### What Was Done
1. **Application Shell & Navigation (Common Module Refactor)**:
   - Extracted and reorganized authenticated layout components into [common/navbar](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/common/navbar/), splitting them into modular sections:
     - `components/`: [Navbar.tsx](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/common/navbar/components/Navbar.tsx), [Sidebar.tsx](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/common/navbar/components/Sidebar.tsx), [MainLayout.tsx](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/common/navbar/components/MainLayout.tsx), and [Menus.tsx](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/common/navbar/components/Menus.tsx).
     - `types/`: [navbar.types.ts](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/common/navbar/types/navbar.types.ts).
     - `styles/`: [navbar.styles.ts](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/common/navbar/styles/navbar.styles.ts).
     - `hooks/`: [useSidebar.ts](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/common/navbar/hooks/useSidebar.ts).
   - Created `Menus.tsx` containing the `ProfileSection` card rendering (showing user details in the sidebar) and the collapsible menu items renderer supporting future nested parent-child submenus (e.g. Reports -> Tutor/User Reports).
   - Added an entry point [index.ts](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/common/navbar/index.ts) exporting all common shell components and states.
2. **Path Alias Imports (`@common/*`)**:
   - Configured TypeScript paths in [tsconfig.app.json](file:///Users/aryandubey/project/personal-/School%20Management/frontend/tsconfig.app.json) and Vite aliases in [vite.config.ts](file:///Users/aryandubey/project/personal-/School%20Management/frontend/vite.config.ts) mapping the `@common/*` prefix.
   - Refactored all source files (like [App.tsx](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/App.tsx), [DashboardPage.tsx](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/features/dashboard/pages/DashboardPage.tsx), and [LoginForm.tsx](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/features/auth/components/LoginForm.tsx)) to import shared components, types, and hooks using path aliases rather than long relative paths.
3. **Split-Screen Login Design**:
   - Designed and built the responsive [LoginPage](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/features/auth/pages/LoginPage.tsx) incorporating a 70% left-side [AdSection](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/features/auth/components/AdSection.tsx) (hidden on mobile devices) and a 30% right-side [LoginForm](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/features/auth/components/LoginForm.tsx) (taking 100% width on mobile).
   - Designed a visually premium `AdSection` featuring styled linear gradients, floating background blobs, auto-playing product spotlight carousels, and glassmorphic detail cards.
   - Designed a clean, secure `LoginForm` utilizing React Hook Form and Yup validation, integrating show/hide password, server authentication requests, and rapid-selection demo account credentials.
4. **Dashboard Refactoring (200 Lines Constraint Compliance)**:
   - Extracted [mockSchools](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/features/dashboard/constants/mockSchools.ts) data, and the main [DashboardPage](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/features/dashboard/pages/DashboardPage.tsx) from the root component. Wrapped the dashboard in `MainLayout` within [App.tsx](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/App.tsx) to dynamically render based on authentication state, keeping all files strictly under 200 lines.
5. **Testing & Build Verification**:
   - Updated [setupTests.ts](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/setupTests.ts) to define a robust cross-platform polyfill for `localStorage.clear()` in JS-DOM.
   - Rewrote integration tests in [App.test.tsx](file:///Users/aryandubey/project/personal-/School%20Management/frontend/src/App.test.tsx) to assert login renders, quick-login functions, transitions to dashboard, role checks, and logout.
   - Verified that the Vitest test suites compile and pass successfully (`npm test` is green) and production build compiles cleanly without errors (`npm run build` succeeds).

---

## [2026-06-09] Git Ignore Configuration

### What Was Done
1. **Repository Maintenance**:
   - Configured [.gitignore](file:///Users/aryandubey/project/personal-/School%20Management/.gitignore) to exclude dependency directories (`node_modules`), build outputs (`dist/`, `build/`), environment files (`.env*`), debug logs, and OS-specific files.

---

## [2026-06-08] Setup & Constitution Baseline

### What Was Done
1. **Workspace Agent Rules & Routing Configured**:
   - Created `.agent/rules.md` to establish global engineering rules (no `any` type, maximum 200 lines per file, sections styling headers, session history logging).
   - Created `.agent/skills/directory_router/SKILL.md` to map subdirectories to dedicated agent constitutions.
   - Created `.agent/skills/frontend_rules/SKILL.md` specifying React, MUI, Tailwind, RTK Query, Yup + React Hook Form, and Styled Components guidelines.
   - Created `.agent/skills/backend_rules/SKILL.md` specifying modular NestJS-style Node/Express/Mongoose + Zod + Jest architecture.
   - Created `.agent/skills/app_rules/SKILL.md` specifying React Native + TypeScript Test-Driven Development (TDD) rules.
   - Initialized this log file (`.agent/development_log.md`).

2. **Project Structure Initialization**:
   - Initialized Node.js + Express + TypeScript backend inside `backend/` configured with tsconfig, jest.config.js, Zod, Mongoose, and a test healthcheck route (`src/app.ts`, `src/server.ts`, and `src/app.test.ts`).
   - Initialized React + TypeScript + Vite frontend inside `frontend/` configured with Material-UI (MUI), Tailwind CSS v4 (Vite plugin `@tailwindcss/vite`), React Icons, Redux Toolkit, Styled Components, and Vitest testing environment (`vite.config.ts`, `src/setupTests.ts`, `src/App.tsx`, and `src/App.test.tsx`).

3. **Validation & Verification**:
   - Verified that both projects compile successfully (`npm run build` runs cleanly).
   - Verified that all unit/integration tests compile and pass successfully (`npm test` is green for both backend and frontend).

---

## [2026-06-08] School Registration API & Frontend Themes

### What Was Done
1. **Constitutions & Rules Enforcement**:
   - Updated `.agent/rules.md` and project-specific skills to declare the **DRY Principle**: duplicate code used in more than one place must be refactored into `src/common/` folders for both packages.

2. **Backend Common Utilities & Validation Middleware**:
   - Created `backend/src/common/utils/response.handler.ts` supporting type-safe `sendSuccess` and `sendError` outputs, pagination definitions, and a default limit of 25 items.
   - Created `backend/src/common/middleware/validation.middleware.ts` supporting Zod schemas validation for body, query, and params.

3. **Backend School Module**:
   - Created `backend/src/modules/school/school.model.ts` mapping the Mongoose database schema (unique email/subdomain indexes, address, subscription state).
   - Created `backend/src/modules/school/dto/create-school.dto.ts` containing the validation schemas.
   - Created `backend/src/modules/school/school.service.ts` processing DB records (and checks for existing subdomain/email).
   - Created `backend/src/modules/school/school.controller.ts` utilizing services and returning structured responses.
   - Mounted modular Express routes (`school.routes.ts` & `school.module.ts`) and linked it in `backend/src/app.ts`.
   - Created Jest unit tests in `backend/src/modules/school/school.test.ts` verifying endpoints.

4. **Frontend Theme Constants & Toggles**:
   - Created `frontend/src/constants/colors.ts` with detailed light/dark modes (primary, secondary, text, backgrounds, accents, borders, and shadows).
   - Created `frontend/src/features/themes/` consisting of types, global style mappings, and `<AppThemeProvider>` exposing the `useAppTheme()` toggle hook.
   - Integrated `<AppThemeProvider>` in `main.tsx` and updated `App.tsx` dashboard to support toggling with sun/moon icons.
   - Wrapped test rendering with `<AppThemeProvider>` in `src/App.test.tsx` and guarded `localStorage` for testing environments.

---

## [2026-06-08] Production-Grade School Model & Master Data Module

### What Was Done
1. **MVP SaaS Modules Declarations**:
   - Updated `.agent/rules.md` and module skill files (`directory_router/SKILL.md`, `backend_rules/SKILL.md`) to index the 14 core functional modules: `schools`, `users`, `students`, `teachers`, `classes`, `sections`, `subjects`, `attendance`, `exams`, `marks`, `homeworks`, `notifications`, `fees`, `payments`.

2. **Production School Schema Refactoring**:
   - Refactored `backend/src/modules/school/school.model.ts` to match recommended fields: `code` (uppercase, unique), `boardType` (CBSE, ICSE, STATE, IB, OTHER), `subscriptionPlan` (FREE, BASIC, PRO, ENTERPRISE), `subscriptionStartDate`, `subscriptionEndDate`, `maxStudents`, `isActive`, `city`, `state`, `country` (defaulting to "India"), `pincode`, `logo`, `website`, and a sub-object for core `settings`.
   - Refactored `backend/src/modules/school/dto/create-school.dto.ts` with Zod validations for the updated fields.
   - Refactored `backend/src/modules/school/school.service.ts` to check duplicate code registrations.

3. **Master Data Module (`master/`)**:
   - Created `backend/src/modules/master/models/state.model.ts` (State: `name`, `code` unique).
   - Created `backend/src/modules/master/models/district.model.ts` (District: `name`, `stateId` ref State, `code` unique).
   - Created `backend/src/modules/master/dto/create-master.dto.ts` for Zod validation schemas.
   - Created `backend/src/modules/master/master.service.ts` & `master.controller.ts` providing CRUD and query actions for States and Districts.
   - Mounted modular Express routes (`master.routes.ts` & `master.module.ts`) and linked it in `backend/src/app.ts` under `/api/masters`.

4. **Testing & Validation**:
   - Updated school unit tests to check the updated production properties.
   - Created master data tests in `backend/src/modules/master/master.test.ts`.
   - Confirmed both compile builds and test suites are 100% green.

5. **Relational Database Integrity Refactoring**:
   - Refactored `state` and `district` properties in the `School` Mongoose model ([school.model.ts](file:///Users/aryandubey/project/personal-/School%20Management/backend/src/modules/school/school.model.ts)) from plain strings to `Types.ObjectId` referencing `State` and `District` master collections.
   - Updated Zod validation DTO ([create-school.dto.ts](file:///Users/aryandubey/project/personal-/School%20Management/backend/src/modules/school/dto/create-school.dto.ts)) to enforce hex MongoDB ObjectId string patterns.
   - Adjusted mock values and validations in unit tests ([school.test.ts](file:///Users/aryandubey/project/personal-/School%20Management/backend/src/modules/school/school.test.ts)) to use valid test ObjectIds.

---

## [2026-06-08] Backend SubscriptionPlan & User Authentication Modules

### What Was Done
1. **SubscriptionPlan Master Data**:
   - Implemented `SubscriptionPlan` model with price, student limits, and features toggles (attendance, online exams, AI analytics, and parent app).
   - Added Zod schemas and routes for `POST/GET /api/masters/subscription-plans`.
   - Refactored school validations to expect a valid 24-character hexadecimal ObjectId for `subscriptionPlan`.

2. **Security & Cryptography Utilities**:
   - Created `backend/src/common/utils/crypto.ts` for SHA-512 PBKDF2 hashing, ensuring robust password management without compiled binary dependencies.
   - Created `backend/src/common/utils/jwt.ts` for token signing and verification with strong typesafety.

3. **Auth Middleware & RBAC**:
   - Created `backend/src/common/middleware/auth.middleware.ts` supporting Bearer token parsing and Express request decoration.
   - Added role checks enforcing Role-Based Access Control (RBAC) across `SUPER_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`, and `PARENT`.

4. **User Domain Module**:
   - Created `backend/src/modules/user/user.model.ts` defining user profiles and index rules (including pre-save validation hooks that require `schoolId` for non-super-admins).
   - Created Zod validation schemas in `create-user.dto.ts` for registration and login payloads.
   - Created `user.service.ts` and `user.controller.ts` providing registration, login, profile view, and paginated listings.
   - Registered paths and loaded module in `backend/src/app.ts`.

5. **Testing & Verification**:
   - Created Jest tests in `backend/src/modules/user/user.test.ts` verifying all login and registration handlers.
   - Verified all 19 backend tests compile and pass successfully.
   - Confirmed `npm run build` compiles cleanly.

---

## [2026-06-08] Detailed Relational User Schema Implementation

### What Was Done
1. **Relational Schema Fields**:
   - Updated `IUser` interface and Mongoose schema in `user.model.ts` to support required `userCode` (e.g. `ST-15`, `T-202`), nested structured `address` sub-document, `parentId` ref `User`, `classId` ref `Class`, `sectionId` ref `Section`, and `subjects` array ref `Subject`.
   - Configured compound unique index on `{ schoolId: 1, userCode: 1 }` to enforce user code uniqueness within individual school tenants.
   - Mounted Mongoose indexes on the relationship paths.

2. **Zod Validator Mappings**:
   - Updated `CreateUserSchema` in `create-user.dto.ts` to validate the new fields, matching 24-character hexadecimal ObjectId regex formats.

3. **Service & Controller Updates**:
   - Refactored `createUser` in `userService` to validate `userCode` conflicts under the same school.
   - Populated `address.state`, `address.district`, and `parentId` on query fetches to return complete relational profiles.

4. **Testing & Validation**:
   - Updated mock user payloads in `user.test.ts` to run validation checks against the new fields.
   - Verified all 20 backend unit tests compile and run successfully.
   - Confirmed the compiler build compiles cleanly without errors.

---

## [2026-06-08] Geography Master Hierarchies & Address Refactoring

### What Was Done
1. **City Geography Master**:
   - Created `City` Mongoose model in `master` module (`backend/src/modules/master/models/city.model.ts`) referencing `District` (`districtId` with index).
   - Added compound unique index on `{ districtId: 1, name: 1 }` to prevent city name conflicts within the same district.
   - Declared validation rules in `CreateCitySchema` under `create-master.dto.ts`.
   - Exposed endpoints `POST /api/masters/cities` and `GET /api/masters/cities` (with optional `districtId` filters and population) in the controller and routes.

2. **Address ObjectId Refactoring**:
   - Refactored `address.city` in `User` model (`backend/src/modules/user/user.model.ts`) from plain text string to `Types.ObjectId` referencing `City`.
   - Refactored `city` in `School` model (`backend/src/modules/school/school.model.ts`) from plain text string to `Types.ObjectId` referencing `City`.
   - Updated validations in `CreateUserSchema` and `CreateSchoolSchema` to check for 24-character hexadecimal ObjectId formats.
   - Updated service layer to cast inputs into Mongoose ObjectIds and populate `address.city` on query returns.

3. **Testing & Validation**:
   - Updated master tests (`master.test.ts`), school tests (`school.test.ts`), and user tests (`user.test.ts`) to verify `/cities` endpoints and ObjectId-based address parameters.
   - Verified all 19 backend tests compile and pass successfully.
   - Confirmed `npm run build` compiles cleanly.

4. **Pincode Type Refactoring**:
   - Refactored the `pincode` schema property in both `School` (`school.model.ts`) and `User` (`user.model.ts`) address configurations from `string` to `number`.
   - Updated validations in `CreateUserSchema` and `CreateSchoolSchema` to check for integer numbers (`z.number().int().optional()`).
   - Adjusted mock test user payloads in `user.test.ts` to pass numeric pincodes (e.g. `560001`).
   - Verified that all unit tests run and compile successfully.

5. **Nested Role Objects & Children Mappings**:
   - Converted the `role` field in `IUser` interface and Mongoose schema in `user.model.ts` to a nested object structure containing a `name` string and `access` array of feature strings.
   - Added a `childrenIds` array of `Types.ObjectId` (ref: `'User'`) to allow parents to reference multiple children.
   - Updated Zod validation in `create-user.dto.ts` to expect nested role object and children array inputs.
   - Refactored service and token handlers to resolve role name strings from the role object structure.
   - Updated mock user payloads in `user.test.ts` to verify compilation and passing tests.

---

## [2026-06-13] Phase 1: Attendance Module Implementation (Plan Driven)

### What Was Done
1. **Attendance Database Models**:
   - Implemented `AttendanceRecordModel` and `AttendanceAuditLogModel` for idempotent bulk updates.
   - Restricted strict TypeScript checks ensuring `any` is not used.

2. **Backend API**:
   - Implemented `AttendanceService` handling idempotent `$set` and `$setOnInsert` bulk writes.
   - Built robust `AttendanceController` and mapped routes via `attendance.routes.ts`.
   - Used Zod schemas validating tenant boundary via `schoolId` and array iterations.
   - Handled validation request body wrapping for backend validation interceptor mapping.
   - Fixed all backend linting/types check (`npm run lint`, `npx tsc -b`).

3. **Frontend API & Components**:
   - Integrated RTK Query in `attendanceApi.ts` matching `BulkMarkStudentAttendanceDto`.
   - Updated `tagTypes.ts` with `Attendance` invalidation tags.
   - Built `StudentAttendancePage.tsx` using `useGetUsersQuery` and mapped nested sections data properly.
   - Mapped `StudentAttendanceTable.tsx` maintaining interactive select inputs and remarks.
   - Fixed all React Hook Form errors and MUI Grid syntax resolving perfectly without `any`.
   - Passed all frontend typechecks (`npx tsc -b && npm run lint`).

4. **Testing & Verification**:
   - Refactored mock schema tests in `attendance.test.ts` providing full metadata context mimicking DB schema validations.
   - Achieved successful test passes for `POST /api/attendance/students/bulk` and `GET /api/attendance/students`.

---

## [2026-06-15] School Management Module Planning Overhaul

### What Was Done
1. **Codebase Audit**:
   - Inspected backend `school` module (`school.model.ts`, `draft.model.ts`, `school.routes.ts`, `school.controller.ts`, `school.service.ts`, `school.test.ts`) and verified the current state of CRUD, drafts, and status/deletion logic.
   - Inspected frontend `manage-schools` feature (`SchoolsPage.tsx`, `useSchools.ts`, `schoolColumns.tsx`, `SchoolAction.tsx`, `SchoolForm.tsx`, `school.schema.ts`, `schools.types.ts`) and dialog configurations (`dialog.provider.tsx`, `SchoolDetailsDialog.tsx`).
2. **Identification of Gaps & Bugs**:
   - Identified a critical server-side pagination bug where the frontend `useSchools` hook fetches all schools without pagination queries but filters/paginates locally, potentially hiding schools beyond the first 25.
   - Identified code complexity violations where backend `school.service.ts` (230 LOC) and frontend `SchoolForm.tsx` (321 LOC) exceed the strict 200 lines limit constraint.
   - Identified that `SCHOOL_ADMIN` has no UI page or route to view/edit their own school profile and settings, even though the backend permits it.
3. **Comprehensive Planning Rewrite**:
   - Completely rewrote `/Users/aryandubey/project/personal-/School Management/Plans/Schools/SchoolPlan.md` (expanding it from ~100 lines to a comprehensive 350+ lines document) matching the structure, depth, and checklists of `UserPlan.md` and `AttendancePlan.md`.
4. **Code Review & Verification**:
   - Reviewed the user's complete implementation of the plan, verifying new files (`school-draft.service.ts`, `school-registration.service.ts`, `SchoolSettingsPage.tsx`, `LogoUpload.tsx`, `useSchoolForm.ts`, `SchoolSettingsPage.test.tsx`).
   - Verified that the server-side pagination query parameters are now properly sent in `useSchools.ts` and decoded in `schoolsApi.ts`.
   - Confirmed that the `getErrorMessage` helper is successfully extracted into a shared utility file.
   - Confirmed file complexity limits are resolved by splitting logic into services and hooks.

---

## [2026-06-15] Homework Management Module Planning

### What Was Done
1. **Module Architecture Design**:
   - Mapped out the requirements for a multi-tenant Homework Management system, including role capabilities (Teachers, Students, Parents), database schemas (`HomeworkModel`, `HomeworkSubmissionModel`), and API routes.
2. **Comprehensive Planning Creation**:
   - Created the detailed plan document: `/Users/aryandubey/project/personal-/School Management/Plans/Homework/HomeworkPlan.md`.
   - Outlined backend DTO validations, access matrices, S3/R2 upload pipelines, and frontend layouts.

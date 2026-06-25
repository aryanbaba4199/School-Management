# Comprehensive Cypress Testing Plan for School Management Frontend

## Overview
This document outlines a phased strategy for integrating **Cypress** into the React Web frontend (`frontend/` directory) of the School Management project. The goal is to establish robust end-to-end (E2E) test coverage across all major features, mapping directly to the domain-driven feature architecture located in `frontend/src/features`.

## 1. Setup and Initialization
*   **Installation**: `npm install cypress --save-dev`
*   **Initialization**: `npx cypress open`
*   **Configuration (`cypress.config.ts`)**: `baseUrl: 'http://localhost:5173'`, set viewports, configure environment variables for API mocking or staging backends.
*   **Custom Commands (`cypress/support/commands.ts`)**:
    *   `cy.login(role)`: Automates login and token injection.
    *   `cy.mockApi()`: Intercepts network calls to provide fixture data for isolated UI testing.

---

## 2. Exhaustive Feature Testing Flows

Based on the application's feature structure, we will implement the following distinct E2E flows:

### 2.1 Authentication (`features/auth`)
*   **Login Flow (`LoginPage`)**: 
    *   Test successful login with valid credentials (Admin, Teacher, Student).
    *   Test validation errors on empty inputs or incorrect passwords.
    *   Test routing redirection to the Dashboard upon success.

### 2.2 Dashboard (`features/dashboard`)
*   **Overview Layout (`DashboardPage`)**: 
    *   Test that widgets (total students, pending fees) render correctly.
    *   Verify role-based conditional rendering (e.g., Teachers don't see financial summaries meant for Admins).

### 2.3 School Management (`features/school-management`)
*   **Schools & Settings (`SchoolsPage`, `SchoolSettingsPage`)**:
    *   *Super Admin*: Test creation of a new school draft and approval.
    *   *School Admin*: Test editing specific school configurations.
*   **Classes (`ClassesPage`)**:
    *   Test creating a new Class and associating Sections.
    *   Test assigning a Class Teacher.
*   **Subjects (`SubjectsPage`)**:
    *   Test adding new Subjects and assigning Teachers to them.

### 2.4 User Management (`features/users`)
*   **CRUD by Role (`SchoolAdminsPage`, `TeachersPage`, `StudentsPage`, `ParentsPage`)**:
    *   Test creating a new user entity via the standard form.
    *   Test the Bulk Import flow (CSV upload -> error handling/success table).
    *   Test toggling Active/Inactive status.
*   **Profile (`ProfilePage`)**:
    *   Test user updating their personal information and changing passwords.

### 2.5 Attendance (`features/attendance`)
*   **Daily Attendance (`StudentAttendancePage`, `TeacherAttendancePage`)**:
    *   Test navigating to a specific date/class and toggling Present/Absent grid states.
    *   Test bulk submission of the attendance grid.
*   **RFID Systems (`RfidAttendancePage`)**:
    *   Test assigning an RFID card to a user.
*   **Reports & Settings (`AttendanceReportsPage`, `AttendanceSettingsPage`)**:
    *   Test report generation filtering.
    *   Test updating global attendance time thresholds.

### 2.6 Homework Management (`features/homework-management`)
*   **Teacher Flow (`AssignmentsPage`, `HomeworkPage`)**:
    *   Test creating an assignment, setting a due date, and attaching files.
*   **Student Flow (`HomeworkSubmissionsPage`)**:
    *   Test viewing pending homework, uploading a submission, and verifying status change.
*   **Grading Flow**:
    *   Test Teacher opening a submission, assigning marks/remarks, and transitioning status to `GRADED`.

### 2.7 Exams (`features/exams`)
*   **Setup (`ExamMasterPage`, `ExamDetailsPage`)**:
    *   Test creating an Exam term (e.g., Mid-Term) and scheduling specific subject periods.
*   **Grading & Results (`ExamResultsPage`, `PrintReportCardPage`)**:
    *   Test bulk entry of student marks for an exam schedule.
    *   Test the generation trigger for report cards and verify the rendered view/print layout.

### 2.8 Account Management & Fees (`features/account-management`)
*   **Fees Setup (`FeesPage`, `FeeDetailsPage`)**:
    *   Test bulk generation of fee invoices (e.g., generating monthly fees for Class X).
*   **Transactions (`PaymentsPage`, `ReceiptsPage`, `TransactionsPage`)**:
    *   Test the payment flow: selecting a pending invoice, marking it as paid (Cash/Online).
    *   Verify the invoice transitions to `PAID` and a receipt is generated.

### 2.9 Timetable (`features/timetable`)
*   **Scheduling (`ClassTimetablePage`, `TeacherTimetablePage`)**:
    *   Test drag-and-drop or form-based allocation of teachers to class periods.

### 2.10 Communication (`features/communication`)
*   **Broadcasts (`AlertsPage`, `NotificationsPage`, `AnnouncementsPage`)**:
    *   Test creating an announcement targeted at a specific Class/Section and verify its appearance.

### 2.11 App Management & Settings (`features/app-management`, `features/settings`)
*   **Subscriptions (`PlansPage`)**: 
    *   Test managing SaaS subscription tiers (Super Admin).
*   **Global/Regional (`GlobalSettingsPage`, `RegionalLanguagesPage`)**:
    *   Test updating app-wide configurations.

### 2.12 AI & Learning (`features/ai-learning`, `features/learning`)
*   **Specialized Modules**:
    *   Test loading and navigating complex UI views (Videos, Quizzes, Smart Classroom, OCR Evaluation). Ensures these heavy dynamic routes don't crash.

---

## 3. Execution Strategy & CI/CD
*   **Mocked Environment**: Create exhaustive JSON fixtures corresponding to backend schemas. This allows testing frontend states without relying on a running database.
*   **CI Pipeline**: Configure GitHub Actions to run `cypress run` headless on every PR.

**Next Step**: Initiate Phase 1 (Setup and Auth flows) upon approval.

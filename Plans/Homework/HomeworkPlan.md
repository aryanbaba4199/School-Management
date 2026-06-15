# Homework Management Module Plan

## 1. Goal

Build a production-ready, multi-tenant Homework Management system for the School Management platform. This module allows teachers to assign tasks, distribute digital learning resources, track student submissions, and provide grades/feedback, while allowing students to view and submit assignments, and parents to monitor homework status.

The homework module must support:
- Teacher creation of homework assignments with description, due date, subject, class/section targeting, and multiple file attachments.
- Student submission workflow with file uploads and text remarks.
- Teacher grading panel with score/grade entry, feedback, and submission state updates.
- Real-time homework notifications and alerts for parents and students.
- Multi-school tenant data isolation and RBAC.
- Access restrictions ensuring teachers can only assign/grade homework for their assigned classes.
- Full audit logs for submission status changes.
- Clean code architecture strictly adhering to the 200 lines limit per file.

---

## 2. Users And Access

### Super Admin
Can:
- View homework statistics across all schools.
- Audit homework and submission activities.
- Configure global attachment storage limits per school.

Should not:
- Create or submit homework directly (not associated with a school class context).

### School Admin
Can:
- View all homework assignments and submissions within their school.
- Monitor teacher assignment metrics.
- Assist in deleting orphaned assignments or resetting submissions if necessary.

Should not:
- Submit homework on behalf of students.

### Teacher
Can:
- Create new homework assignments for their assigned classes and sections.
- Edit or delete homework assignments they created.
- View all student submissions for a specific assignment.
- Grade student submissions, enter marks/remarks, and request corrections.
- Download student submission attachments.

Should not:
- Create assignments for classes or subjects they do not teach.
- Grade homework created by other teachers (unless co-assigned).

### Student
Can:
- View all active (pending) and historical (completed/past due) homework assigned to their class and section.
- Download homework resources/attachments.
- Submit homework by uploading attachments and notes before the due date.
- View teacher grades, feedback, and grading status.

Should not:
- View or edit other students' homework submissions.
- Create, modify, or delete homework assignments.

### Parent
Can:
- View homework assigned to their linked children.
- Track submission status (Pending, Submitted, Graded, Late) for their children.
- View grades and feedback received by their children.

Should not:
- Submit homework or alter submission records.

---

## 3. Core Database Models

### Homework Model (`HomeworkModel`)
Stores the assignment details created by teachers.

```typescript
import { Schema, model, Document, Types } from 'mongoose';

export interface IHomework extends Document {
  schoolId: Types.ObjectId;
  classId: Types.ObjectId;
  sectionId: Types.ObjectId;
  subjectId: Types.ObjectId;
  teacherId: Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  attachments: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number; // in bytes
  }[];
  maxMarks?: number;
  createdAt: Date;
  updatedAt: Date;
}

const HomeworkSchema = new Schema<IHomework>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    attachments: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: { type: String, required: true },
        fileSize: { type: Number, required: true },
      },
    ],
    maxMarks: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for rapid student and teacher lookups
HomeworkSchema.index({ schoolId: 1, classId: 1, sectionId: 1, dueDate: 1 });
HomeworkSchema.index({ schoolId: 1, teacherId: 1, createdAt: -1 });

export const HomeworkModel = model<IHomework>('Homework', HomeworkSchema);
```

### HomeworkSubmission Model (`HomeworkSubmissionModel`)
Tracks individual student submissions.

```typescript
export interface IHomeworkSubmission extends Document {
  schoolId: Types.ObjectId;
  homeworkId: Types.ObjectId;
  studentId: Types.ObjectId;
  submissionDate?: Date;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE' | 'CORRECTION_REQUIRED';
  attachments: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }[];
  studentNotes?: string;
  teacherFeedback?: string;
  obtainedMarks?: number;
  gradedBy?: Types.ObjectId;
  gradedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HomeworkSubmissionSchema = new Schema<IHomeworkSubmission>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    homeworkId: {
      type: Schema.Types.ObjectId,
      ref: 'Homework',
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    submissionDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUBMITTED', 'GRADED', 'LATE', 'CORRECTION_REQUIRED'],
      default: 'PENDING',
      required: true,
      index: true,
    },
    attachments: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: { type: String, required: true },
        fileSize: { type: Number, required: true },
      },
    ],
    studentNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    teacherFeedback: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    obtainedMarks: {
      type: Number,
      min: 0,
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    gradedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a student has only one submission record per homework assignment
HomeworkSubmissionSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });
HomeworkSubmissionSchema.index({ schoolId: 1, studentId: 1, status: 1 });

export const HomeworkSubmissionModel = model<IHomeworkSubmission>('HomeworkSubmission', HomeworkSubmissionSchema);
```

---

## 4. Backend Folder Structure

We will implement a clean, modular structure. Every file must remain strictly under 200 lines of code.

```text
backend/src/modules/homework/
  homework.module.ts              // Registers module routes and hooks
  homework.routes.ts              // Mapped HTTP routes
  homework.controller.ts          // Request handler parsing inputs (under 200 lines)
  homework.service.ts             // Query and base assignment management (under 200 lines)
  submission.service.ts           // Student submission & grading logic (under 200 lines)
  homework.model.ts               // Mongoose schemas and interfaces
  homework.test.ts                // Integration test suites
  dto/
    create-homework.dto.ts        // Zod validation schemas
    submit-homework.dto.ts        // Zod submission validations
    grade-homework.dto.ts         // Zod grading validations
```

---

## 5. Backend Module Registration

Registered in `backend/src/app.ts`:

```typescript
import HomeworkRoutes from './modules/homework/homework.routes';

app.use('/api/homework', HomeworkRoutes);
```

Base URL Route Prefix:
`/api/homework`

---

## 6. API Design

### Homework Management (Teachers / Admins)
- `POST   /api/homework`
  - Create a new assignment.
- `GET    /api/homework`
  - List all assignments (filters: `classId`, `sectionId`, `subjectId`, `teacherId`, `dueDate`). Paginated.
- `GET    /api/homework/:id`
  - Get detailed homework card (including a populated list of submissions for the creator).
- `PUT    /api/homework/:id`
  - Update homework details (forbidden if students have already submitted work).
- `DELETE /api/homework/:id`
  - Delete homework and cascade delete all submission documents.

### Student Submissions & Grading
- `GET    /api/homework/student/dashboard`
  - Fetch active homework assignments for the logged-in student, including their submission status.
- `POST   /api/homework/:id/submit`
  - Student uploads submission files and comments. Updates or inserts a submission record.
- `GET    /api/homework/:id/submission`
  - Student views their own submission details for a specific homework.
- `PUT    /api/homework/submissions/:submissionId/grade`
  - Teacher enters grades/marks and feedback for a student submission.

---

## 7. API Request Examples

### Create Homework (`POST /api/homework`)
```json
{
  "classId": "60f7c223405c102c98d6c820",
  "sectionId": "60f7c223405c102c98d6c830",
  "subjectId": "60f7c223405c102c98d6c840",
  "title": "Solve Chapter 3 Linear Equations",
  "description": "Please solve problems 1 to 15 on page 45 of your textbook and submit a scanned PDF of your answers.",
  "dueDate": "2026-06-20T23:59:59.000Z",
  "maxMarks": 50,
  "attachments": [
    {
      "fileName": "linear_equations_guide.pdf",
      "fileUrl": "https://storage.schoolos.com/school123/homework/linear_equations_guide.pdf",
      "fileType": "application/pdf",
      "fileSize": 1542000
    }
  ]
}
```

### Submit Homework (`POST /api/homework/:id/submit`)
```json
{
  "studentNotes": "Here are my completed answers. I found problem 12 slightly challenging.",
  "attachments": [
    {
      "fileName": "rahul_homework_ch3.pdf",
      "fileUrl": "https://storage.schoolos.com/school123/submissions/rahul_homework_ch3.pdf",
      "fileType": "application/pdf",
      "fileSize": 3204000
    }
  ]
}
```

### Grade Submission (`PUT /api/homework/submissions/:submissionId/grade`)
```json
{
  "obtainedMarks": 45,
  "teacherFeedback": "Excellent work! Your step-by-step layout for solving the equations is correct. Keep it up.",
  "status": "GRADED"
}
```

---

## 8. Access Control Matrix

| Feature | Super Admin | School Admin | Teacher | Student | Parent |
|---|---:|---:|---:|---:|---:|
| Create Assignment | No | No | Yes (Assigned Class) | No | No |
| Edit/Delete Assignment | No | Yes | Yes (Creator Only) | No | No |
| View All Assignments | Yes | Yes (School) | Yes (Assigned) | Yes (Own Class) | Yes (Children Class) |
| Submit Homework | No | No | No | Yes (Own account) | No |
| Grade Submissions | No | No | Yes (Assigned Class) | No | No |
| View All Submissions | Yes | Yes (School) | Yes (Assigned) | No | No |
| View Own Submission | No | No | No | Yes | Yes (Child's) |

---

## 9. Backend Permission Rules

Create helper checks inside `backend/src/common/middleware/auth.middleware.ts` or in the services:
- **Tenant Boundary check**: Compare the target homework/submission's `schoolId` with the token's `req.user.schoolId`. Disallow cross-school requests.
- **Teacher Assignment check**: Ensure a teacher's `classIds` or assigned subjects allow them to create/read homework in the requested `classId`/`subjectId` context.
- **Student Class check**: Verify that a student's `classId` and `sectionId` match the homework's targeted scope.
- **Parent-Child Link check**: Verify the student's ID is present in the parent's `childrenIds` array before allowing parent access to submission details.

---

## 10. Frontend Folder Structure

```text
frontend/src/features/homework-management/
  index.ts
  pages/
    HomeworkPage.tsx              // Dashboard routing & role dispatcher
    TeacherHomeworkDashboard.tsx // Teacher list view of assignments
    StudentHomeworkDashboard.tsx // Student homework checklist
    HomeworkSubmissionsPage.tsx  // Submissions list & grading hub
  components/
    HomeworkFormDialog.tsx       // Stepper/Form for creating homework
    SubmissionDialog.tsx         // Modal for student to submit homework
    GradingDialog.tsx            // Teacher grading details form
    HomeworkColumns.tsx          // Datatable columns config
    SubmissionColumns.tsx        // Student list datatable columns config
    AttachmentList.tsx           // Files renderer
  hooks/
    useHomework.ts               // Queries, mutations, and pagination hooks
    useSubmissions.ts            // Submissions query & grading triggers
  schema/
    homework.schema.ts           // Yup schema validations
```

---

## 11. Frontend API Slice

Expose RTK Query hooks in `frontend/src/api/homeworkApi.ts`:

- `getHomework`: Paginated query returning homework assignments.
- `getHomeworkById`: Fetches details of a single assignment.
- `createHomework`: Mutation to save a new assignment.
- `updateHomework`: Modifies an assignment.
- `deleteHomework`: Deletes an assignment.
- `getStudentHomeworkDashboard`: Fetches student assignments and completion states.
- `submitHomework`: Mutation uploading submission notes and links.
- `getSubmissionById`: Fetches details of a submission.
- `gradeSubmission`: Mutation updating score and teacher feedback.

---

## 12. Frontend Pages

### TeacherHomeworkDashboard
- Lists assignments created by the logged-in teacher.
- Shows metrics per homework: `Submitted Count / Total Students`.
- Action buttons: Add Homework, Edit, Delete, View Submissions.

### StudentHomeworkDashboard
- Renders two tab panels: "Pending Homework" (unsubmitted, sorted by closest due date) and "Completed/Past Due" (graded or submitted).
- Details view showing descriptions and attachments.
- Action: "Submit Assignment" opening `SubmissionDialog`.

### HomeworkSubmissionsPage (Grading Hub)
- Datatable listing all students in the class.
- Shows columns: Student Name, Submission Status, Submission Date, Obtained Marks, Actions.
- Clicking an active submission opens `GradingDialog` side-by-side with file previews.

---

## 13. Navigation

Replace the placeholders in the sidebar navigation:

```text
Homework (collapsible parent menu)
  Assignments    -> /homework/assignments  (Accessible to Teachers, Admins)
  My Tasks       -> /homework              (Accessible to Students, Parents)
```

---

## 14. Core Workflows

### Workflow 1: Teacher Assigns Homework
1. Teacher clicks "Add Homework" -> Opens `HomeworkFormDialog`.
2. Teacher selects Class, Section, Subject (filtered based on teacher's assignments).
3. Teacher inputs Title, Description, Max Marks, Due Date.
4. Teacher uploads resource files (triggering attachment upload pipeline).
5. Frontend validates fields using `homework.schema.ts`.
6. Submit -> Backend validates Zod DTO -> Creates `Homework` document.
7. Backend automatically creates empty `HomeworkSubmission` documents with status `PENDING` for all active students in the target class/section (pre-initializing the grading list).
8. Triggers push/email notification alert to students and linked parents.

### Workflow 2: Student Submits Homework
1. Student logs in, navigates to "My Tasks", and selects the homework card.
2. Clicks "Upload Submission" -> Opens `SubmissionDialog`.
3. Student uploads homework files (PDFs, images) and types notes.
4. Submits -> backend saves file details.
5. Backend updates the pre-initialized `HomeworkSubmission` status to `SUBMITTED` or `LATE` (if submitted after `dueDate`), recording `submissionDate`.
6. Refreshes student checklist.

### Workflow 3: Teacher Grades Submission
1. Teacher opens assignment submissions table.
2. Selects a student's submission -> Opens `GradingDialog`.
3. Renders preview links of student attachments.
4. Teacher inputs score, writes text feedback, and clicks "Grade".
5. Backend verifies obtainedMarks <= maxMarks, updates status to `GRADED`, sets `gradedBy` and `gradedAt`.
6. Triggers notification alert to the student and their parents.

---

## 15. Validation Rules

### Homework Assignment Schema
- `title`: Required, string, 5-150 characters.
- `description`: Required, string, 10-2000 characters.
- `dueDate`: Required, date, must be in the future.
- `classId`/`sectionId`/`subjectId`: Required, 24-character hexadecimal ObjectId.
- `maxMarks`: Optional, numeric, must be >= 0.

### Homework Submission Schema
- `attachments`: Must have at least 1 file if `studentNotes` is empty.
- `studentNotes`: Optional, string, max 1000 characters.

### Grading Schema
- `obtainedMarks`: Required, numeric, must satisfy `0 <= obtainedMarks <= maxMarks`.
- `teacherFeedback`: Required, string, 5-1000 characters.

---

## 16. Production Concerns

### Upload Pipeline & Storage
- Homework files (scans, PDFs) can be large. Do not upload raw base64 files directly to MongoDB.
- Integrate a file upload middleware (e.g. `multer`) on backend route configurations.
- Upload files asynchronously to an S3 or Cloudflare R2 bucket and store the public secure URLs in the database model.

### Pre-populating Submissions
- When homework is created, pre-generating `PENDING` submission documents for every student in the class is crucial. This guarantees that teachers see a complete class list when grading, even for students who haven't submitted anything (showing them as `PENDING`/`ABSENT`).

---

## 17. Tests

### Backend (`homework.test.ts`)
- Verify authentication guards block unauthenticated requests.
- Verify teachers cannot assign homework to classes they are not assigned to.
- Verify students can only query their own class's homework.
- Test student homework submission updates status to `SUBMITTED`.
- Test submission after due date automatically flags status as `LATE`.
- Test obtainedMarks validation fails if it exceeds `maxMarks`.
- Verify cascading deletion: deleting homework deletes all associated submissions.

### Frontend
- Test that `HomeworkFormDialog` validates fields correctly.
- Test student dashboard tab switching ("Pending" vs "Completed").
- Verify that student cannot grade submissions or access the grading panel.
- Test that the search filter on the submissions list correctly filters students.

---

## 18. Implementation Checklist & Status

Summary completion rate: **5%** (Only basic placeholder routes and layout slots exist).

### Backend
- `[ ]` Create `homework.model.ts` defining Mongoose schemas and compound indexes.
- `[ ]` Add input schemas `create-homework.dto.ts`, `submit-homework.dto.ts`, and `grade-homework.dto.ts` using Zod.
- `[ ]` Implement `homework.service.ts` for assignment CRUD and filter queries.
- `[ ]` Implement `submission.service.ts` for submission management and grading calculations.
- `[ ]` Implement `homework.controller.ts` with RBAC validations.
- `[ ]` Register routes in `homework.routes.ts` and import into `app.ts`.
- `[ ]` Add comprehensive Jest tests in `homework.test.ts`.

### Frontend
- `[ ]` Setup `homeworkApi.ts` RTK Query slice.
- `[ ]` Implement `TeacherHomeworkDashboard.tsx` container and datatable.
- `[ ]` Implement `StudentHomeworkDashboard.tsx` with "Pending" and "Completed" tabs.
- `[ ]` Build `HomeworkSubmissionsPage.tsx` displaying the class submission records.
- `[ ]` Implement `HomeworkFormDialog.tsx` with file upload controls.
- `[ ]` Implement `SubmissionDialog.tsx` for students.
- `[ ]` Implement `GradingDialog.tsx` with feedback input.
- `[ ]` Add sidebar links and configure role-based visibility in `Menus.tsx` and `AppRoutes.tsx`.

---

## 19. Recommended Build Order

1. **Database Schema Setup**: Implement models and indexes (`homework.model.ts`).
2. **DTO & Validator Setup**: Create Zod validators.
3. **Backend Core Services**: Implement `HomeworkService` and `SubmissionService`.
4. **Backend REST Handlers**: Implement routes, controller, and link to `app.ts`.
5. **Backend Integration Tests**: Run Jest test suites for CRUD and RBAC.
6. **Frontend RTK Query Slice**: Declare queries and mutations.
7. **Teacher UI Components**: Build `TeacherHomeworkDashboard.tsx` and creation dialog.
8. **Student UI Components**: Build `StudentHomeworkDashboard.tsx` and submission controls.
9. **Grading UI Page**: Connect `HomeworkSubmissionsPage.tsx` and `GradingDialog.tsx`.
10. **File Attachment Pipeline**: Implement AWS S3 or Cloudflare R2 file upload integration.

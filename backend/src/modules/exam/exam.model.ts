import { Schema, model, Document, Types } from 'mongoose';

/*------------- Exam Document Interfaces -------------*/

export interface IExam extends Document {
  schoolId: Types.ObjectId;
  name: string;
  academicYear: string;
  term: 'MONTHLY' | 'QUARTERLY' | 'MID_TERM' | 'FINAL';
  startDate: Date;
  endDate: Date;
  status: 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED';
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExamSchedule extends Document {
  schoolId: Types.ObjectId;
  examId: Types.ObjectId;
  classId: Types.ObjectId;
  sectionId: Types.ObjectId;
  subjectId: Types.ObjectId;
  examDate: Date;
  startTime: string;
  endTime: string;
  room?: string;
  maxMarks: number;
  passMarks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentExamMark extends Document {
  schoolId: Types.ObjectId;
  examId: Types.ObjectId;
  examScheduleId: Types.ObjectId;
  studentId: Types.ObjectId;
  classId: Types.ObjectId;
  sectionId: Types.ObjectId;
  subjectId: Types.ObjectId;
  obtainedMarks?: number;
  maxMarks: number;
  grade?: string;
  remarks?: string;
  attendanceStatus: 'PRESENT' | 'ABSENT';
  enteredBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGradeConfig extends Document {
  schoolId: Types.ObjectId;
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  remarks?: string;
}

export interface IReportCard extends Document {
  schoolId: Types.ObjectId;
  examId: Types.ObjectId;
  studentId: Types.ObjectId;
  classId: Types.ObjectId;
  sectionId: Types.ObjectId;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade?: string;
  rank?: number;
  result: 'PASS' | 'FAIL';
  generatedAt: Date;
}

/*------------- Exam Schemas Definition -------------*/

const ExamSchema = new Schema<IExam>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    name: { type: String, required: true },
    academicYear: { type: String, required: true },
    term: { type: String, enum: ['MONTHLY', 'QUARTERLY', 'MID_TERM', 'FINAL'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['DRAFT', 'SCHEDULED', 'ONGOING', 'COMPLETED'], default: 'DRAFT' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const ExamScheduleSchema = new Schema<IExamSchedule>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    examDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String },
    maxMarks: { type: Number, required: true },
    passMarks: { type: Number, required: true },
  },
  { timestamps: true }
);

const StudentExamMarkSchema = new Schema<IStudentExamMark>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    examScheduleId: { type: Schema.Types.ObjectId, ref: 'ExamSchedule', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    obtainedMarks: { type: Number },
    maxMarks: { type: Number, required: true },
    grade: { type: String },
    remarks: { type: String },
    attendanceStatus: { type: String, enum: ['PRESENT', 'ABSENT'], default: 'PRESENT' },
    enteredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Compound index for marks to ensure a student only has one mark entry per schedule
StudentExamMarkSchema.index({ examScheduleId: 1, studentId: 1 }, { unique: true });

const GradeConfigSchema = new Schema<IGradeConfig>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    grade: { type: String, required: true },
    minPercentage: { type: Number, required: true },
    maxPercentage: { type: Number, required: true },
    remarks: { type: String },
  }
);

const ReportCardSchema = new Schema<IReportCard>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    totalMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    grade: { type: String },
    rank: { type: Number },
    result: { type: String, enum: ['PASS', 'FAIL'], required: true },
    generatedAt: { type: Date, default: Date.now },
  }
);

// Prevent multiple report cards for the same exam per student
ReportCardSchema.index({ examId: 1, studentId: 1 }, { unique: true });

export const Exam = model<IExam>('Exam', ExamSchema);
export const ExamSchedule = model<IExamSchedule>('ExamSchedule', ExamScheduleSchema);
export const StudentExamMark = model<IStudentExamMark>('StudentExamMark', StudentExamMarkSchema);
export const GradeConfig = model<IGradeConfig>('GradeConfig', GradeConfigSchema);
export const ReportCard = model<IReportCard>('ReportCard', ReportCardSchema);

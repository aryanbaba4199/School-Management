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
    fileSize: number;
  }[];
  maxMarks?: number;
  createdAt: Date;
  updatedAt: Date;
}

const HomeworkSchema = new Schema<IHomework>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    dueDate: { type: Date, required: true, index: true },
    attachments: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: { type: String, required: true },
        fileSize: { type: Number, required: true },
      },
    ],
    maxMarks: { type: Number, min: 0 },
  },
  { timestamps: true }
);

HomeworkSchema.index({ schoolId: 1, classId: 1, sectionId: 1, dueDate: 1 });
HomeworkSchema.index({ schoolId: 1, teacherId: 1, createdAt: -1 });

export const HomeworkModel = model<IHomework>('Homework', HomeworkSchema);

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
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    homeworkId: { type: Schema.Types.ObjectId, ref: 'Homework', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    submissionDate: { type: Date },
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
    studentNotes: { type: String, trim: true, maxlength: 1000 },
    teacherFeedback: { type: String, trim: true, maxlength: 1000 },
    obtainedMarks: { type: Number, min: 0 },
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    gradedAt: { type: Date },
  },
  { timestamps: true }
);

HomeworkSubmissionSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });
HomeworkSubmissionSchema.index({ schoolId: 1, studentId: 1, status: 1 });

export const HomeworkSubmissionModel = model<IHomeworkSubmission>('HomeworkSubmission', HomeworkSubmissionSchema);

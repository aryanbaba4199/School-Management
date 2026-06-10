import { Schema, model, Document, Types } from 'mongoose';

/*------------- Subject Document Interface -------------*/

export interface ISubject extends Document {
  name: string;
  code: string;
  schoolId: Types.ObjectId;
  teacherIds: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/*------------- Subject Schema Definition -------------*/

const SubjectSchema = new Schema<ISubject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    teacherIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique subject code per school tenant
SubjectSchema.index({ schoolId: 1, code: 1 }, { unique: true });

export const SubjectModel = model<ISubject>('Subject', SubjectSchema);

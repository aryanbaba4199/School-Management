import { Schema, model, Document, Types } from 'mongoose';

/*------------- Class Document Interface -------------*/

export interface IClass extends Document {
  name: string;
  schoolId: Types.ObjectId;
  isActive: boolean;
  classTeacherId?: Types.ObjectId;
  schedule?: {
    startTime: string;
    endTime: string;
    subjectId: Types.ObjectId;
    teacherId: Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

/*------------- Class Schema Definition -------------*/

const ClassSchema = new Schema<IClass>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    classTeacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    schedule: [
      {
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
        teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      }
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

// Compound index to ensure unique class names within a school tenant
ClassSchema.index({ schoolId: 1, name: 1 }, { unique: true });

export const ClassModel = model<IClass>('Class', ClassSchema);

import { Schema, model, Document, Types } from 'mongoose';

/*------------- Section Document Interface -------------*/

export interface ISection extends Document {
  name: string;
  classId: Types.ObjectId;
  schoolId: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/*------------- Section Schema Definition -------------*/

const SectionSchema = new Schema<ISection>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique section names per class
SectionSchema.index({ classId: 1, name: 1 }, { unique: true });

export const SectionModel = model<ISection>('Section', SectionSchema);

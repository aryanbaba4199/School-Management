import { Schema, model, Document, Types } from 'mongoose';

/*------------- Class Document Interface -------------*/

export interface IClass extends Document {
  name: string;
  schoolId: Types.ObjectId;
  isActive: boolean;
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

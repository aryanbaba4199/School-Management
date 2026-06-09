import { Schema, model, Document, Types } from 'mongoose';

/*------------- District Document Interface -------------*/

export interface IDistrict extends Document {
  name: string;
  stateId: Types.ObjectId;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

/*------------- District Schema Definition -------------*/

const DistrictSchema = new Schema<IDistrict>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    stateId: {
      type: Schema.Types.ObjectId,
      ref: 'State',
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: compound index to enforce unique district names within a single state
DistrictSchema.index({ name: 1, stateId: 1 }, { unique: true });

export const DistrictModel = model<IDistrict>('District', DistrictSchema);

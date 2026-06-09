import { Schema, model, Document, Types } from 'mongoose';

/*------------- City Document Interface -------------*/

export interface ICity extends Document {
  name: string;
  districtId: Types.ObjectId;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

/*------------- City Schema Definition -------------*/

const CitySchema = new Schema<ICity>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    districtId: {
      type: Schema.Types.ObjectId,
      ref: 'District',
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

// Compound unique index to enforce unique city names within a single district
CitySchema.index({ districtId: 1, name: 1 }, { unique: true });

export const CityModel = model<ICity>('City', CitySchema);

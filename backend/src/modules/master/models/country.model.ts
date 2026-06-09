import { Schema, model, Document } from 'mongoose';

export interface ICountry extends Document {
  name: string;
  code: string;
  dialCode: string;
  mobileDigits: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const CountrySchema = new Schema<ICountry>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    dialCode: {
      type: String,
      required: true,
      trim: true,
    },
    mobileDigits: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CountryModel = model<ICountry>('Country', CountrySchema);

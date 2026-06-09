import { Schema, model, Document, Types } from 'mongoose';

export interface IBoardType extends Document {
  name: string;
  acronym: string;
  countryId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BoardTypeSchema = new Schema<IBoardType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    acronym: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    countryId: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const BoardTypeModel = model<IBoardType>('BoardType', BoardTypeSchema);

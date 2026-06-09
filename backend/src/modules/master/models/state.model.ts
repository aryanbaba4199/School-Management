import { Schema, model, Document } from 'mongoose';

/*------------- State Document Interface -------------*/

export interface IState extends Document {
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

/*------------- State Schema Definition -------------*/

const StateSchema = new Schema<IState>(
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
  },
  {
    timestamps: true,
  }
);

export const StateModel = model<IState>('State', StateSchema);

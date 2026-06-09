import { Schema, model, Document } from 'mongoose';

/*------------- Mongoose Document Interface -------------*/

export interface IRegistrationDraft extends Document {
  adminEmail: string;
  adminName?: string;
  adminPassword?: string;
  currentStep: number;
  schoolDetails?: {
    name?: string;
    code?: string;
    subdomain?: string;
    phone?: string;
    countryCode?: string;
    address?: string;
    state?: string;
    district?: string;
    boardType?: string;
  };
  subscriptionDetails?: {
    subscriptionPlan?: string;
    maxStudents?: number;
    settings?: {
      attendanceEnabled: boolean;
      onlineExamEnabled: boolean;
      aiAnalyticsEnabled: boolean;
      parentAppEnabled: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

/*------------- Mongoose Schema Definition -------------*/

const RegistrationDraftSchema = new Schema<IRegistrationDraft>(
  {
    adminEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    adminName: {
      type: String,
      trim: true,
    },
    adminPassword: {
      type: String,
    },
    currentStep: {
      type: Number,
      required: true,
      default: 1,
    },
    schoolDetails: {
      name: { type: String, trim: true },
      code: { type: String, trim: true, uppercase: true },
      subdomain: { type: String, trim: true, lowercase: true },
      phone: { type: String, trim: true },
      countryCode: { type: String, default: '+91' },
      address: { type: String, trim: true },
      state: { type: String },
      district: { type: String },
      boardType: { type: String, enum: ['CBSE', 'ICSE', 'STATE', 'IB', 'OTHER'] },
    },
    subscriptionDetails: {
      subscriptionPlan: { type: String },
      maxStudents: { type: Number, default: 500 },
      settings: {
        attendanceEnabled: { type: Boolean, default: true },
        onlineExamEnabled: { type: Boolean, default: false },
        aiAnalyticsEnabled: { type: Boolean, default: false },
        parentAppEnabled: { type: Boolean, default: true },
      },
    },
  },
  {
    timestamps: true,
  }
);

export const RegistrationDraftModel = model<IRegistrationDraft>('RegistrationDraft', RegistrationDraftSchema);

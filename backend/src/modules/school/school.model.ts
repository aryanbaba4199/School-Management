import { Schema, model, Document, Types } from 'mongoose';

/*------------- Mongoose Document Interface -------------*/

export interface ISchool extends Document {
  name: string;
  code: string;
  subdomain: string;
  email: string;
  phone: string;
  countryCode: string;
  address?: string;
  district?: Types.ObjectId;
  state?: Types.ObjectId;
  country: Types.ObjectId;
  pincode?: number;
  logo?: string;
  website?: string;
  boardType: Types.ObjectId;
  subscriptionPlan: Types.ObjectId;
  billingCycle: 'MONTHLY' | 'YEARLY';
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  maxStudents: number;
  totalTeacher: number;
  totalStudent: number;
  isActive: boolean;
  isDeactive: boolean;
  shift?: string;
  startTime?: string;
  endTime?: string;
  admissionFee?: number;
  settings: {
    attendanceEnabled: boolean;
    onlineExamEnabled: boolean;
    aiAnalyticsEnabled: boolean;
    parentAppEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

/*------------- Mongoose Schema Definition -------------*/

const SchoolSchema = new Schema<ISchool>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    subdomain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    countryCode: {
      type: String,
      default: '+91',
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    district: {
      type: Schema.Types.ObjectId,
      ref: 'District',
      index: true,
    },
    state: {
      type: Schema.Types.ObjectId,
      ref: 'State',
      index: true,
    },
    country: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
      index: true,
    },
    pincode: {
      type: Number,
    },
    logo: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    boardType: {
      type: Schema.Types.ObjectId,
      ref: 'BoardType',
      required: true,
      index: true,
    },
    subscriptionPlan: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      required: true,
      index: true,
    },
    billingCycle: {
      type: String,
      enum: ['MONTHLY', 'YEARLY'],
      required: true,
    },
    subscriptionStartDate: {
      type: Date,
    },
    subscriptionEndDate: {
      type: Date,
    },
    maxStudents: {
      type: Number,
      default: 500,
    },
    totalTeacher: {
      type: Number,
      default: 0,
    },
    totalStudent: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeactive: {
      type: Boolean,
      default: false,
    },
    shift: {
      type: String,
      trim: true,
    },
    startTime: {
      type: String,
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
    },
    admissionFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    settings: {
      attendanceEnabled: {
        type: Boolean,
        default: true,
      },
      onlineExamEnabled: {
        type: Boolean,
        default: false,
      },
      aiAnalyticsEnabled: {
        type: Boolean,
        default: false,
      },
      parentAppEnabled: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const SchoolModel = model<ISchool>('School', SchoolSchema);

import { Schema, model, Document } from 'mongoose';

/*------------- SubscriptionPlan Document Interface -------------*/

export interface ISubscriptionPlan extends Document {
  name: string;
  code: string;
  price: {
    monthly: number;
    yearly: number;
  };
  maxStudents: number;
  features: {
    attendanceEnabled: boolean;
    onlineExamEnabled: boolean;
    aiAnalyticsEnabled: boolean;
    parentAppEnabled: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/*------------- SubscriptionPlan Schema Definition -------------*/

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
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
    price: {
      monthly: {
        type: Number,
        required: true,
        min: 0,
      },
      yearly: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    maxStudents: {
      type: Number,
      default: 500,
      min: 1,
    },
    features: {
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SubscriptionPlanModel = model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema);

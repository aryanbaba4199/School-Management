import mongoose, { Schema, Document } from 'mongoose';

export interface IFeeInvoice extends Document {
  studentId: mongoose.Types.ObjectId;
  schoolId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  amount: number;
  type: 'ADMISSION' | 'MONTHLY' | 'YEARLY' | 'EXAMINATION' | 'OTHER';
  month?: number; // 1-12, required if type is MONTHLY
  year: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  dueDate?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const feeInvoiceSchema = new Schema<IFeeInvoice>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'SchoolUser', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ['ADMISSION', 'MONTHLY', 'YEARLY', 'EXAMINATION', 'OTHER'],
      required: true,
    },
    month: { type: Number },
    year: { type: Number, required: true },
    status: { type: String, enum: ['PAID', 'PENDING', 'OVERDUE'], default: 'PENDING' },
    dueDate: { type: Date },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export const FeeInvoice = mongoose.model<IFeeInvoice>('FeeInvoice', feeInvoiceSchema);

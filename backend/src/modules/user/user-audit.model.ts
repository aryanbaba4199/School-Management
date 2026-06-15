import { Schema, model, Document, Types } from 'mongoose';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_TOGGLE' | 'PASSWORD_CHANGE';

export interface IUserAuditLog extends Document {
  schoolId?: Types.ObjectId;
  userId: Types.ObjectId;
  changedBy: Types.ObjectId;
  action: AuditAction;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  reason?: string;
  createdAt: Date;
}

const userAuditLogSchema = new Schema<IUserAuditLog>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { 
      type: String, 
      enum: ['CREATE', 'UPDATE', 'DELETE', 'STATUS_TOGGLE', 'PASSWORD_CHANGE'],
      required: true 
    },
    previousData: { type: Schema.Types.Mixed },
    newData: { type: Schema.Types.Mixed },
    reason: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need when it was created
    collection: 'user_audit_logs',
  }
);

// Indexes for fast lookup
userAuditLogSchema.index({ schoolId: 1, createdAt: -1 });
userAuditLogSchema.index({ userId: 1, createdAt: -1 });

export const UserAuditLogModel = model<IUserAuditLog>('UserAuditLog', userAuditLogSchema);

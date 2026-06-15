import { UserAuditLogModel, AuditAction } from './user-audit.model';
import { Types } from 'mongoose';

interface CreateAuditLogInput {
  schoolId?: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  changedBy: string | Types.ObjectId;
  action: AuditAction;
  previousData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  reason?: string;
}

export class UserAuditService {
  /**
   * Logs a user action. Fails silently if logging fails to prevent breaking the main transaction.
   */
  static async logAction(input: CreateAuditLogInput): Promise<void> {
    try {
      await UserAuditLogModel.create({
        schoolId: input.schoolId ? new Types.ObjectId(input.schoolId) : undefined,
        userId: new Types.ObjectId(input.userId),
        changedBy: new Types.ObjectId(input.changedBy),
        action: input.action,
        previousData: input.previousData,
        newData: input.newData,
        reason: input.reason,
      });
    } catch (error) {
      console.error('Failed to write user audit log:', error);
    }
  }

  /**
   * Fetches audit logs for a specific user, with optional school restriction.
   */
  static async getUserLogs(userId: string, schoolIdOverride?: string) {
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
    if (schoolIdOverride) {
      filter.schoolId = new Types.ObjectId(schoolIdOverride);
    }

    return await UserAuditLogModel.find(filter)
      .sort({ createdAt: -1 })
      .populate('changedBy', 'name email role')
      .lean();
  }
}

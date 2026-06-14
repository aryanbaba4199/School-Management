import { Request } from 'express';
import { Types } from 'mongoose';

import { ClassModel } from '../../class/class.model';

/**
 * Resolves the schoolId from the request context.
 * 
 * If the user is a SUPER_ADMIN, they can optionally provide a schoolId in the query or body.
 * If they don't, they query across all schools (or it's an error for mutations).
 * 
 * For all other roles, the schoolId is strictly forced to their token's schoolId.
 */
export function resolveSchoolIdContext(req: Request): Types.ObjectId | undefined {
  if (req.user?.role === 'SUPER_ADMIN') {
    const rawSchoolId = req.query.schoolId || req.body.schoolId;
    if (rawSchoolId && typeof rawSchoolId === 'string' && Types.ObjectId.isValid(rawSchoolId)) {
      return new Types.ObjectId(rawSchoolId);
    }
    return undefined; // Unrestricted context
  }

  // Extracted by injectSchoolId middleware
  if (req.schoolId && Types.ObjectId.isValid(req.schoolId)) {
    return new Types.ObjectId(req.schoolId);
  }

  throw new Error('School context is missing or invalid for a non-admin role.');
}

/**
 * Validates if the mutation target schoolId matches the user's allowed context.
 */
export function validateMutationSchoolContext(req: Request, targetSchoolId?: Types.ObjectId | string): Types.ObjectId {
  const resolvedId = resolveSchoolIdContext(req);
  const finalSchoolId = targetSchoolId || resolvedId;
  
  if (!finalSchoolId) {
    if (req.user?.role === 'SUPER_ADMIN') {
      throw new Error('SUPER_ADMIN must explicitly provide a schoolId for attendance mutations.');
    }
    throw new Error('Forbidden: No valid school context found for user.');
  }

  return new Types.ObjectId(finalSchoolId);
}

/**
 * Helper to check if a teacher is assigned to a specific class as class teacher or subject teacher.
 */
export async function checkTeacherClassAssignment(
  schoolId: Types.ObjectId,
  teacherId: Types.ObjectId,
  classId: Types.ObjectId
): Promise<boolean> {
  const count = await ClassModel.countDocuments({
    _id: classId,
    schoolId,
    $or: [
      { classTeacherId: teacherId },
      { 'schedule.teacherId': teacherId }
    ]
  }).exec();
  return count > 0;
}

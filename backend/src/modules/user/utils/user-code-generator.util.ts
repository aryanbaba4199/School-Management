import { UserModel } from '../user.model';
import { Types } from 'mongoose';

/**
 * Generates a unique user code for a specific role and school.
 * Format: [PREFIX]-[YEAR]-[SEQUENCE]
 * Example: ST-2026-001
 */
export const generateUserCode = async (roleName: string, schoolId?: string): Promise<string> => {
  const year = new Date().getFullYear().toString();
  let prefix = 'U';

  switch (roleName) {
    case 'STUDENT': prefix = 'ST'; break;
    case 'TEACHER': prefix = 'T'; break;
    case 'PARENT': prefix = 'P'; break;
    case 'SCHOOL_ADMIN': prefix = 'SA'; break;
    case 'SUPER_ADMIN': prefix = 'SU'; break;
  }

  const baseCode = `${prefix}-${year}-`;
  
  const filter: Record<string, unknown> = { userCode: { $regex: `^${baseCode}` } };
  if (schoolId) {
    filter.schoolId = new Types.ObjectId(schoolId);
  }

  // Find the highest sequence number for this prefix and year
  const lastUser = await UserModel.findOne(filter)
    .sort({ userCode: -1 })
    .select('userCode')
    .lean();

  let nextSeq = 1;
  if (lastUser && lastUser.userCode) {
    const parts = lastUser.userCode.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    }
  }

  const seqString = nextSeq.toString().padStart(3, '0');
  return `${baseCode}${seqString}`;
};

import { UserModel, IUser } from './user.model';
import { SubjectModel } from '../subject/subject.model';
import { SchoolModel } from '../school/school.model';
import { hashPassword } from '../../common/utils/crypto';
import { generateUserCode } from './utils/user-code-generator.util';
import { Types } from 'mongoose';
import { UserAuditService } from './user-audit.service';
import Papa from 'papaparse';

export class UserBulkService {
  /**
   * Bulk import users from CSV string.
   */
  async importUsers(csvData: string, schoolId: string, roleName: string, changedBy: string) {
    const { data, errors } = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    if (errors.length > 0) {
      throw new Error('Invalid CSV format. Please ensure the file is properly formatted.');
    }

    const results = {
      successCount: 0,
      failedCount: 0,
      errors: [] as { row: number; email: string; reason: string }[],
    };

    const school = await SchoolModel.findById(schoolId);
    if (!school) throw new Error('School not found.');

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as Record<string, string>;
      const rowIndex = i + 1; // 1-based index for human readability
      const email = row.email?.trim().toLowerCase();
      const name = row.name?.trim();
      const phone = row.phone?.trim();
      
      if (!email || !name) {
        results.failedCount++;
        results.errors.push({ row: rowIndex, email: email || 'Unknown', reason: 'Email and Name are required.' });
        continue;
      }

      // Check for existing email
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        results.failedCount++;
        results.errors.push({ row: rowIndex, email, reason: 'Email already registered.' });
        continue;
      }

      try {
        let userCode = row.userCode?.trim();
        if (!userCode) {
          userCode = await generateUserCode(roleName, schoolId);
        } else {
          // Check if provided userCode is unique
          const existingCode = await UserModel.findOne({ userCode: userCode.toUpperCase(), schoolId });
          if (existingCode) {
            results.failedCount++;
            results.errors.push({ row: rowIndex, email, reason: `User Code '${userCode}' already exists.` });
            continue;
          }
        }

        const defaultPassword = row.password?.trim() || `${roleName.charAt(0).toUpperCase() + roleName.slice(1).toLowerCase()}@123`;

        const user = new UserModel({
          name,
          email,
          phone,
          userCode: userCode.toUpperCase(),
          password: hashPassword(defaultPassword),
          role: { name: roleName, access: [] },
          schoolId: new Types.ObjectId(schoolId),
          isActive: true,
        });

        const savedUser = await user.save();

        await UserAuditService.logAction({
          schoolId,
          userId: savedUser._id,
          changedBy,
          action: 'CREATE',
          newData: { email, name, userCode, source: 'BULK_IMPORT' },
        });

        results.successCount++;
      } catch (err) {
        results.failedCount++;
        results.errors.push({ row: rowIndex, email, reason: err instanceof Error ? err.message : 'Unknown error.' });
      }
    }

    return results;
  }

  /**
   * Export users as CSV string.
   */
  async exportUsers(schoolId?: string, role?: string, classId?: string, sectionId?: string) {
    const filter: Record<string, unknown> = {};
    if (schoolId) filter.schoolId = new Types.ObjectId(schoolId);
    if (role) filter['role.name'] = role;
    if (classId) filter.classId = new Types.ObjectId(classId);
    if (sectionId) filter.sectionId = new Types.ObjectId(sectionId);

    const users = await UserModel.find(filter)
      .populate('schoolId', 'name')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .lean();

    const exportData = users.map(u => ({
      'User Code': u.userCode,
      'Name': u.name,
      'Email': u.email,
      'Phone': u.phone || '',
      'Role': u.role.name,
      'Status': u.isActive ? 'Active' : 'Inactive',
      'School': typeof u.schoolId === 'object' ? (u.schoolId as any).name : '',
      'Class': typeof u.classId === 'object' && u.classId ? (u.classId as any).name : '',
      'Section': typeof u.sectionId === 'object' && u.sectionId ? (u.sectionId as any).name : '',
      'Registration Date': u.regDate ? new Date(u.regDate).toLocaleDateString() : '',
    }));

    return Papa.unparse(exportData);
  }
}

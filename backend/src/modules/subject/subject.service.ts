import { Types } from 'mongoose';
import { SubjectModel, ISubject } from './subject.model';
import { UserModel } from '../user/user.model';

/*------------- Subject Service Implementation -------------*/

export class SubjectService {
  /**
   * Creates a new Subject document and updates assigned teachers.
   */
  async createSubject(input: {
    name: string;
    code: string;
    schoolId: string;
    teacherIds?: string[];
  }): Promise<ISubject> {
    const teacherObjectIds = input.teacherIds?.map((id) => new Types.ObjectId(id)) || [];

    const subject = new SubjectModel({
      name: input.name,
      code: input.code,
      schoolId: input.schoolId,
      teacherIds: teacherObjectIds,
    });

    const savedSubject = await subject.save();

    if (teacherObjectIds.length > 0) {
      await UserModel.updateMany(
        { _id: { $in: teacherObjectIds } },
        { $addToSet: { subjects: savedSubject._id } }
      );
    }

    return savedSubject;
  }

  /**
   * Finds subjects, optionally filtering by schoolId and searching name/code.
   */
  async findSubjects(schoolId?: string, search?: string): Promise<ISubject[]> {
    const filter: any = {};
    if (schoolId) filter.schoolId = schoolId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }
    return SubjectModel.find(filter).sort({ name: 1 }).populate('teacherIds', 'name email userCode');
  }

  /**
   * Finds a subject by ID and schoolId.
   */
  async findSubjectById(id: string, schoolId?: string): Promise<ISubject | null> {
    const filter: any = { _id: id };
    if (schoolId) filter.schoolId = schoolId;
    return SubjectModel.findOne(filter).populate('teacherIds', 'name email userCode');
  }

  /**
   * Updates a subject's name, code, and assigned teachers.
   */
  async updateSubject(
    id: string,
    input: { name?: string; code?: string; teacherIds?: string[] },
    schoolId?: string
  ): Promise<ISubject> {
    const filter: any = { _id: id };
    if (schoolId) filter.schoolId = schoolId;

    const subject = await SubjectModel.findOne(filter);
    if (!subject) throw new Error('Subject not found');

    if (input.name) subject.name = input.name;
    if (input.code) subject.code = input.code;

    if (input.teacherIds !== undefined) {
      const oldTeachers = subject.teacherIds.map((t) => t.toString());
      const newTeachers = input.teacherIds;

      const added = newTeachers.filter((t) => !oldTeachers.includes(t));
      const removed = oldTeachers.filter((t) => !newTeachers.includes(t));

      subject.teacherIds = newTeachers.map((t) => new Types.ObjectId(t));

      if (removed.length > 0) {
        await UserModel.updateMany(
          { _id: { $in: removed.map((t) => new Types.ObjectId(t)) } },
          { $pull: { subjects: subject._id } }
        );
      }

      if (added.length > 0) {
        await UserModel.updateMany(
          { _id: { $in: added.map((t) => new Types.ObjectId(t)) } },
          { $addToSet: { subjects: subject._id } }
        );
      }
    }

    return subject.save();
  }

  /**
   * Deletes a subject and removes references from users.
   */
  async deleteSubject(id: string, schoolId?: string): Promise<void> {
    const filter: any = { _id: id };
    if (schoolId) filter.schoolId = schoolId;

    const subject = await SubjectModel.findOne(filter);
    if (!subject) throw new Error('Subject not found');

    await UserModel.updateMany(
      { subjects: subject._id },
      { $pull: { subjects: subject._id } }
    );

    await SubjectModel.deleteOne({ _id: subject._id });
  }
}

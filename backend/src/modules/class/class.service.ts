import { Types } from 'mongoose';
import { ClassModel } from './class.model';
import { SectionModel } from './section.model';

/*------------- Class Service Implementation -------------*/

export class ClassService {
  /**
   * Creates a class and its associated sections.
   */
  async createClass(input: {
    name: string;
    schoolId: string;
    sections?: string[];
    classTeacherId?: string;
    monthlyFee?: number;
    yearlyFee?: number;
    subjects?: string[];
    schedule?: { startTime: string; endTime: string; subjectId: string; teacherId: string }[];
  }): Promise<any> {
    const cls = new ClassModel({
      name: input.name,
      schoolId: input.schoolId,
      classTeacherId: input.classTeacherId ? new Types.ObjectId(input.classTeacherId) : undefined,
      schedule: input.schedule?.map((s) => ({
        startTime: s.startTime,
        endTime: s.endTime,
        subjectId: new Types.ObjectId(s.subjectId),
        teacherId: new Types.ObjectId(s.teacherId),
      })),
      monthlyFee: input.monthlyFee,
      yearlyFee: input.yearlyFee,
      subjects: input.subjects?.map(s => new Types.ObjectId(s)),
    });
    await cls.save();

    const sections = input.sections || ['A'];
    const createdSections = [];
    for (const secName of sections) {
      if (secName.trim()) {
        const sec = new SectionModel({
          name: secName.trim(),
          classId: cls._id,
          schoolId: input.schoolId,
        });
        await sec.save();
        createdSections.push(sec);
      }
    }

    const populatedCls = await ClassModel.findById(cls._id)
      .populate('classTeacherId', 'name email')
      .populate('schedule.subjectId', 'name code')
      .populate('schedule.teacherId', 'name email')
      .populate('subjects', 'name code');

    return { ...(populatedCls?.toObject() || cls.toObject()), sections: createdSections };
  }

  /**
   * Finds classes belonging to a specific school tenant, optionally matching a search query.
   */
  async findClasses(schoolId?: string, search?: string): Promise<any[]> {
    const filter: any = {};
    if (schoolId) {
      filter.schoolId = schoolId;
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const classes = await ClassModel.find(filter)
      .sort({ name: 1 })
      .populate('classTeacherId', 'name email')
      .populate('schedule.subjectId', 'name code')
      .populate('schedule.teacherId', 'name email')
      .populate('subjects', 'name code');

    const results = [];

    for (const cls of classes) {
      const sections = await SectionModel.find({ classId: cls._id }).sort({ name: 1 });
      results.push({
        ...cls.toObject(),
        sections,
      });
    }

    return results;
  }

  /**
   * Finds a class by ID and tenant, populating its sections.
   */
  async findClassById(id: string, schoolId?: string): Promise<any> {
    const filter: any = { _id: id };
    if (schoolId) filter.schoolId = schoolId;

    const cls = await ClassModel.findOne(filter)
      .populate('classTeacherId', 'name email')
      .populate('schedule.subjectId', 'name code')
      .populate('schedule.teacherId', 'name email')
      .populate('subjects', 'name code');

    if (!cls) return null;

    const sections = await SectionModel.find({ classId: cls._id }).sort({ name: 1 });
    return { ...cls.toObject(), sections };
  }

  /**
   * Updates a class name and reconciles its associated sections list.
   */
  async updateClass(
    id: string,
    input: {
      name?: string;
      sections?: string[];
      classTeacherId?: string;
      monthlyFee?: number;
      yearlyFee?: number;
      subjects?: string[];
      schedule?: { startTime: string; endTime: string; subjectId: string; teacherId: string }[];
    },
    schoolId?: string
  ): Promise<any> {
    const filter: any = { _id: id };
    if (schoolId) filter.schoolId = schoolId;

    const cls = await ClassModel.findOne(filter);
    if (!cls) throw new Error('Class not found');

    if (input.name) {
      cls.name = input.name;
    }
    if (input.classTeacherId !== undefined) {
      cls.classTeacherId = input.classTeacherId ? new Types.ObjectId(input.classTeacherId) : undefined;
    }
    if (input.schedule !== undefined) {
      cls.schedule = input.schedule?.map((s) => ({
        startTime: s.startTime,
        endTime: s.endTime,
        subjectId: new Types.ObjectId(s.subjectId),
        teacherId: new Types.ObjectId(s.teacherId),
      }));
    }
    if (input.monthlyFee !== undefined) {
      cls.monthlyFee = input.monthlyFee;
    }
    if (input.yearlyFee !== undefined) {
      cls.yearlyFee = input.yearlyFee;
    }
    if (input.subjects !== undefined) {
      cls.subjects = input.subjects.map(s => new Types.ObjectId(s));
    }
    await cls.save();

    if (input.sections) {
      const targetSecNames = input.sections.map((s) => s.trim()).filter(Boolean);
      const existingSecs = await SectionModel.find({ classId: cls._id });
      const existingSecNames = existingSecs.map((s) => s.name);

      // Create new sections
      for (const name of targetSecNames) {
        if (!existingSecNames.includes(name)) {
          const sec = new SectionModel({
            name,
            classId: cls._id,
            schoolId: cls.schoolId,
          });
          await sec.save();
        }
      }

      // Delete sections not present in the update input list
      for (const sec of existingSecs) {
        if (!targetSecNames.includes(sec.name)) {
          await SectionModel.deleteOne({ _id: sec._id });
        }
      }
    }

    const populatedCls = await ClassModel.findById(cls._id)
      .populate('classTeacherId', 'name email')
      .populate('schedule.subjectId', 'name code')
      .populate('schedule.teacherId', 'name email')
      .populate('subjects', 'name code');

    const sections = await SectionModel.find({ classId: cls._id }).sort({ name: 1 });
    return { ...(populatedCls?.toObject() || cls.toObject()), sections };
  }

  /**
   * Deletes a class and all associated sections.
   */
  async deleteClass(id: string, schoolId?: string): Promise<void> {
    const filter: any = { _id: id };
    if (schoolId) filter.schoolId = schoolId;

    const cls = await ClassModel.findOne(filter);
    if (!cls) throw new Error('Class not found');

    await ClassModel.deleteOne({ _id: cls._id });
    await SectionModel.deleteMany({ classId: cls._id });
  }

  /**
   * Finds sections, optionally filtering by schoolId and classId.
   */
  async findSections(schoolId?: string, classId?: string): Promise<any[]> {
    const filter: any = {};
    if (schoolId) filter.schoolId = schoolId;
    if (classId) filter.classId = classId;

    return SectionModel.find(filter).sort({ name: 1 });
  }
}

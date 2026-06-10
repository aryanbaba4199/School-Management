import { ClassModel } from './class.model';
import { SectionModel } from './section.model';

/*------------- Class Service Implementation -------------*/

export class ClassService {
  /**
   * Creates a class and its associated sections.
   */
  async createClass(input: { name: string; schoolId: string; sections?: string[] }): Promise<any> {
    const cls = new ClassModel({
      name: input.name,
      schoolId: input.schoolId,
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

    return { ...cls.toObject(), sections: createdSections };
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

    const classes = await ClassModel.find(filter).sort({ name: 1 });
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

    const cls = await ClassModel.findOne(filter);
    if (!cls) return null;

    const sections = await SectionModel.find({ classId: cls._id }).sort({ name: 1 });
    return { ...cls.toObject(), sections };
  }

  /**
   * Updates a class name and reconciles its associated sections list.
   */
  async updateClass(id: string, input: { name?: string; sections?: string[] }, schoolId?: string): Promise<any> {
    const filter: any = { _id: id };
    if (schoolId) filter.schoolId = schoolId;

    const cls = await ClassModel.findOne(filter);
    if (!cls) throw new Error('Class not found');

    if (input.name) {
      cls.name = input.name;
      await cls.save();
    }

    if (input.sections) {
      const targetSecNames = input.sections.map(s => s.trim()).filter(Boolean);
      const existingSecs = await SectionModel.find({ classId: cls._id });
      const existingSecNames = existingSecs.map(s => s.name);

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

    const sections = await SectionModel.find({ classId: cls._id }).sort({ name: 1 });
    return { ...cls.toObject(), sections };
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

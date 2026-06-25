import { HomeworkModel, IHomework } from './homework.model';
import { CreateHomeworkInput, UpdateHomeworkInput } from './dto/create-homework.dto';
import { Types } from 'mongoose';
import { SubmissionService } from './submission.service';

export class HomeworkService {
  /**
   * Create a new homework assignment and initialize PENDING submissions.
   */
  async createHomework(
    schoolId: string,
    teacherId: string,
    data: CreateHomeworkInput
  ): Promise<IHomework> {
    const homework = new HomeworkModel({
      schoolId: new Types.ObjectId(schoolId),
      teacherId: new Types.ObjectId(teacherId),
      classId: new Types.ObjectId(data.classId),
      sectionId: new Types.ObjectId(data.sectionId),
      subjectId: new Types.ObjectId(data.subjectId),
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      attachments: data.attachments,
      maxMarks: data.maxMarks,
    });

    const savedHomework = await homework.save();

    // Initialize empty submissions for all students in the targeted class and section
    await SubmissionService.initializeSubmissions(
      schoolId,
      savedHomework._id.toString(),
      data.classId,
      data.sectionId
    );

    return savedHomework;
  }

  /**
   * Get all homework with pagination and optional filters.
   */
  async findAllHomework(
    schoolId: string,
    page: number,
    limit: number,
    filters: { classId?: string; sectionId?: string; subjectId?: string; teacherId?: string }
  ) {
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { schoolId: new Types.ObjectId(schoolId) };
    if (filters.classId) query.classId = new Types.ObjectId(filters.classId);
    if (filters.sectionId) query.sectionId = new Types.ObjectId(filters.sectionId);
    if (filters.subjectId) query.subjectId = new Types.ObjectId(filters.subjectId);
    if (filters.teacherId) query.teacherId = new Types.ObjectId(filters.teacherId);

    const [homeworkList, totalCount] = await Promise.all([
      HomeworkModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('classId', 'name')
        .populate('sectionId', 'name')
        .populate('subjectId', 'name')
        .populate('teacherId', 'profile.firstName profile.lastName')
        .exec(),
      HomeworkModel.countDocuments(query).exec(),
    ]);

    return { homeworks: homeworkList, totalCount };
  }

  /**
   * Get homework details by ID.
   */
  async getHomeworkById(schoolId: string, id: string): Promise<IHomework | null> {
    return HomeworkModel.findOne({
      _id: new Types.ObjectId(id),
      schoolId: new Types.ObjectId(schoolId),
    })
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name')
      .populate('teacherId', 'profile.firstName profile.lastName')
      .exec();
  }

  /**
   * Update a homework assignment.
   */
  async updateHomework(
    schoolId: string,
    id: string,
    data: UpdateHomeworkInput
  ): Promise<IHomework | null> {
    const updatePayload: Record<string, unknown> = { ...data };
    if (data.dueDate) {
      updatePayload.dueDate = new Date(data.dueDate);
    }

    return HomeworkModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), schoolId: new Types.ObjectId(schoolId) },
      { $set: updatePayload },
      { new: true }
    ).exec();
  }

  /**
   * Delete a homework assignment and its cascading submissions.
   */
  async deleteHomework(schoolId: string, id: string): Promise<boolean> {
    const deletedHomework = await HomeworkModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      schoolId: new Types.ObjectId(schoolId),
    }).exec();

    if (!deletedHomework) {
      return false;
    }

    // Cascade delete submissions
    await SubmissionService.deleteSubmissionsByHomework(schoolId, id);
    return true;
  }
}

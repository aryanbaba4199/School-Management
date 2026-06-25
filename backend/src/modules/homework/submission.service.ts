import { HomeworkSubmissionModel, IHomeworkSubmission } from './homework.model';
import { SubmitHomeworkInput, GradeHomeworkInput } from './dto/submission.dto';
import { Types } from 'mongoose';
import { UserModel } from '../user/user.model';
import { HomeworkModel } from './homework.model';

export class SubmissionService {
  /**
   * Pre-initializes empty submissions for all students in the assigned class and section.
   * This ensures the teacher has a complete list of students to grade or track, even if they haven't submitted.
   */
  static async initializeSubmissions(
    schoolId: string,
    homeworkId: string,
    classId: string,
    sectionId: string
  ): Promise<void> {
    // 1. Fetch all active students in this class and section
    const students = await UserModel.find({
      schoolId: new Types.ObjectId(schoolId),
      roleId: new Types.ObjectId('000000000000000000000003'), // STUDENT role ID
      classId: new Types.ObjectId(classId),
      sectionId: new Types.ObjectId(sectionId),
      status: 'ACTIVE',
    }).select('_id').exec();

    if (students.length === 0) return;

    // 2. Prepare submission records
    const submissions = students.map((student) => ({
      schoolId: new Types.ObjectId(schoolId),
      homeworkId: new Types.ObjectId(homeworkId),
      studentId: student._id,
      status: 'PENDING',
      attachments: [],
    }));

    // 3. Bulk insert submissions
    await HomeworkSubmissionModel.insertMany(submissions, { ordered: false }).catch((err) => {
      // Ignore duplicate key errors if some submissions already exist
      if (err.code !== 11000) {
        throw err;
      }
    });
  }

  /**
   * Delete all submissions associated with a homework assignment.
   */
  static async deleteSubmissionsByHomework(schoolId: string, homeworkId: string): Promise<void> {
    await HomeworkSubmissionModel.deleteMany({
      schoolId: new Types.ObjectId(schoolId),
      homeworkId: new Types.ObjectId(homeworkId),
    }).exec();
  }

  /**
   * Student submitting their homework.
   */
  async submitHomework(
    schoolId: string,
    studentId: string,
    homeworkId: string,
    data: SubmitHomeworkInput
  ): Promise<IHomeworkSubmission | null> {
    const homework = await HomeworkModel.findOne({
      _id: new Types.ObjectId(homeworkId),
      schoolId: new Types.ObjectId(schoolId),
    }).exec();

    if (!homework) {
      throw new Error('Homework not found');
    }

    const now = new Date();
    const isLate = now > homework.dueDate;

    return HomeworkSubmissionModel.findOneAndUpdate(
      {
        homeworkId: new Types.ObjectId(homeworkId),
        studentId: new Types.ObjectId(studentId),
        schoolId: new Types.ObjectId(schoolId),
      },
      {
        $set: {
          submissionDate: now,
          status: isLate ? 'LATE' : 'SUBMITTED',
          attachments: data.attachments,
          studentNotes: data.studentNotes,
        },
      },
      { new: true, upsert: true } // Upsert in case the student joined late and wasn't initialized
    ).exec();
  }

  /**
   * Teacher grading a submission.
   */
  async gradeSubmission(
    schoolId: string,
    teacherId: string,
    submissionId: string,
    data: GradeHomeworkInput
  ): Promise<IHomeworkSubmission | null> {
    return HomeworkSubmissionModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(submissionId),
        schoolId: new Types.ObjectId(schoolId),
      },
      {
        $set: {
          obtainedMarks: data.obtainedMarks,
          teacherFeedback: data.teacherFeedback,
          status: data.status,
          gradedBy: new Types.ObjectId(teacherId),
          gradedAt: new Date(),
        },
      },
      { new: true }
    ).exec();
  }

  /**
   * List all submissions for a specific homework (Teacher view).
   */
  async getSubmissionsByHomework(schoolId: string, homeworkId: string) {
    return HomeworkSubmissionModel.find({
      homeworkId: new Types.ObjectId(homeworkId),
      schoolId: new Types.ObjectId(schoolId),
    })
      .populate('studentId', 'profile.firstName profile.lastName profile.admissionNumber')
      .populate('gradedBy', 'profile.firstName profile.lastName')
      .exec();
  }

  /**
   * Get student's dashboard: their assigned homework and submission status.
   */
  async getStudentDashboard(schoolId: string, studentId: string) {
    // We query the submissions table to find all assignments mapped to this student.
    return HomeworkSubmissionModel.find({
      schoolId: new Types.ObjectId(schoolId),
      studentId: new Types.ObjectId(studentId),
    })
      .populate({
        path: 'homeworkId',
        populate: [
          { path: 'subjectId', select: 'name' },
          { path: 'teacherId', select: 'profile.firstName profile.lastName' },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();
  }
}

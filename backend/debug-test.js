const request = require('supertest');
const app = require('./src/app').default;
const { generateToken } = require('./src/common/utils/jwt');
const { Exam, ExamSchedule, StudentExamMark, ReportCard, GradeConfig } = require('./src/modules/exam/exam.model');

jest.mock('./src/modules/exam/exam.model');

async function run() {
  const schoolAdminToken = generateToken({
    userId: 'admin123',
    role: 'SCHOOL_ADMIN',
    schoolId: 'school1',
  });

  Exam.findOne.mockResolvedValue({ _id: 'exam1', name: 'Finals', schoolId: 'school1' });
  ExamSchedule.find.mockResolvedValue([
    { _id: 'sched1', subjectId: 'sub1', maxMarks: 100, passMarks: 40 },
    { _id: 'sched2', subjectId: 'sub2', maxMarks: 50, passMarks: 20 },
  ]);
  StudentExamMark.find.mockResolvedValue([
    { studentId: 'student1', examScheduleId: 'sched1', obtainedMarks: 85, attendanceStatus: 'PRESENT' },
    { studentId: 'student1', examScheduleId: 'sched2', obtainedMarks: 40, attendanceStatus: 'PRESENT' },
  ]);
  GradeConfig.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
  ReportCard.deleteMany.mockResolvedValue({});
  ReportCard.insertMany.mockResolvedValue([]);

  const response = await request(app)
    .post('/api/exams/results/generate')
    .set('Authorization', `Bearer ${schoolAdminToken}`)
    .send({ examId: 'exam1', classId: 'class1', sectionId: 'section1' });

  console.log('Status:', response.status);
  console.log('Body:', response.body);
}

run();

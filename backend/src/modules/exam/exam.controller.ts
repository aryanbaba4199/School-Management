import { Request, Response } from 'express';
import { Exam, ExamSchedule, StudentExamMark, ReportCard, GradeConfig } from './exam.model';

export const createExam = async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId;
    const { name, academicYear, term, startDate, endDate, status } = req.body;

    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID is required' });
    }

    if (!name || !academicYear || !term || !startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const newExam = await Exam.create({
      schoolId,
      name,
      academicYear,
      term,
      startDate,
      endDate,
      status: status || 'DRAFT',
      createdBy: req.user?.userId,
    });

    res.status(201).json({ success: true, data: newExam });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateExam = async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId;
    const { id } = req.params;
    const { name, academicYear, term, startDate, endDate, status } = req.body;

    if (!schoolId) return res.status(400).json({ success: false, error: 'School ID is required' });

    const exam = await Exam.findOne({ _id: id, schoolId });
    if (!exam) return res.status(404).json({ success: false, error: 'Exam not found' });

    if (name) exam.name = name;
    if (academicYear) exam.academicYear = academicYear;
    if (term) exam.term = term;
    if (startDate) exam.startDate = startDate;
    if (endDate) exam.endDate = endDate;
    if (status) exam.status = status;

    await exam.save();

    res.status(200).json({ success: true, data: exam });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllExams = async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId;
    
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID is required' });
    }

    const exams = await Exam.find({ schoolId })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: exams });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createExamSchedule = async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId;
    const { examId, classId, sectionId, subjectId, examDate, startTime, endTime, room, maxMarks, passMarks } = req.body;

    if (!schoolId) return res.status(400).json({ success: false, error: 'School ID is required' });
    if (!examId || !classId || !sectionId || !subjectId || !examDate || !startTime || !endTime || maxMarks === undefined || passMarks === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const newSchedule = await ExamSchedule.create({
      schoolId,
      examId,
      classId,
      sectionId,
      subjectId,
      examDate,
      startTime,
      endTime,
      room,
      maxMarks,
      passMarks,
    });

    res.status(201).json({ success: true, data: newSchedule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateExamSchedule = async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId;
    const { id } = req.params;
    const { subjectId, examDate, startTime, endTime, room, maxMarks, passMarks } = req.body;

    if (!schoolId) return res.status(400).json({ success: false, error: 'School ID is required' });

    const schedule = await ExamSchedule.findOne({ _id: id, schoolId });
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Exam Schedule not found' });
    }

    if (subjectId) schedule.subjectId = subjectId;
    if (examDate) schedule.examDate = examDate;
    if (startTime) schedule.startTime = startTime;
    if (endTime) schedule.endTime = endTime;
    if (room !== undefined) schedule.room = room;
    if (maxMarks !== undefined) schedule.maxMarks = maxMarks;
    if (passMarks !== undefined) schedule.passMarks = passMarks;

    await schedule.save();

    res.status(200).json({ success: true, data: schedule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getExamSchedules = async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId;
    const { examId, classId, sectionId } = req.query;

    if (!schoolId) return res.status(400).json({ success: false, error: 'School ID is required' });
    if (!examId) return res.status(400).json({ success: false, error: 'examId is required' });

    const query: any = { schoolId, examId };
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;

    const schedules = await ExamSchedule.find(query)
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name code')
      .sort({ examDate: 1, startTime: 1 });

    res.status(200).json({ success: true, data: schedules });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const saveStudentMarks = async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId;
    const { examId, examScheduleId, classId, sectionId, subjectId, maxMarks, marksData } = req.body;

    if (!schoolId) return res.status(400).json({ success: false, error: 'School ID is required' });
    if (!examId || !examScheduleId || !classId || !sectionId || !subjectId || maxMarks === undefined || !Array.isArray(marksData)) {
      return res.status(400).json({ success: false, error: 'Missing required fields or marksData is not an array' });
    }

    // Upsert each mark
    const operations = marksData.map((data: any) => ({
      updateOne: {
        filter: { examScheduleId, studentId: data.studentId },
        update: {
          $set: {
            schoolId,
            examId,
            classId,
            sectionId,
            subjectId,
            maxMarks,
            obtainedMarks: data.obtainedMarks,
            remarks: data.remarks,
            attendanceStatus: data.attendanceStatus,
            enteredBy: req.user?.userId,
          }
        },
        upsert: true,
      }
    }));

    if (operations.length > 0) {
      await StudentExamMark.bulkWrite(operations as any);
    }

    res.status(200).json({ success: true, message: 'Marks saved successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStudentMarks = async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId;
    const { examId, examScheduleId, classId, sectionId, studentId } = req.query;

    if (!schoolId) return res.status(400).json({ success: false, error: 'School ID is required' });

    const query: any = { schoolId };
    if (examId) query.examId = examId;
    if (examScheduleId) query.examScheduleId = examScheduleId;
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    if (studentId) query.studentId = studentId;

    const marks = await StudentExamMark.find(query)
      .populate('studentId', 'name userCode')
      .populate('subjectId', 'name code');

    res.status(200).json({ success: true, data: marks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const generateResults = async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId;
    const { examId, classId, sectionId } = req.body;

    if (!schoolId) return res.status(400).json({ success: false, error: 'School ID is required' });
    if (!examId || !classId || !sectionId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // 1. Fetch all marks for this class & section & exam
    const marks = await StudentExamMark.find({ schoolId, examId, classId, sectionId });
    if (marks.length === 0) {
      return res.status(404).json({ success: false, error: 'No marks found to generate results' });
    }

    // 2. Fetch all schedules for passMarks
    const schedules = await ExamSchedule.find({ schoolId, examId, classId, sectionId });
    const scheduleMap = new Map(schedules.map(s => [s._id.toString(), s]));

    // 3. Group marks by student
    const studentMarksMap = new Map<string, any[]>();
    marks.forEach(m => {
      const sId = m.studentId.toString();
      if (!studentMarksMap.has(sId)) studentMarksMap.set(sId, []);
      studentMarksMap.get(sId)!.push(m);
    });

    // 4. Fetch grade configurations
    const gradeConfigs = await GradeConfig.find({ schoolId }).sort({ minPercentage: -1 });

    const reportCardsData: any[] = [];

    studentMarksMap.forEach((studentMarks, studentId) => {
      let totalMarks = 0;
      let obtainedMarks = 0;
      let hasFailedSubject = false;

      studentMarks.forEach(m => {
        const schedule = scheduleMap.get(m.examScheduleId.toString());
        if (schedule) {
          totalMarks += schedule.maxMarks;
          const marksEarned = m.obtainedMarks || 0;
          obtainedMarks += marksEarned;
          
          if (marksEarned < schedule.passMarks || m.attendanceStatus === 'ABSENT') {
            hasFailedSubject = true;
          }
        }
      });

      const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
      const result = hasFailedSubject ? 'FAIL' : 'PASS';

      // Determine Grade
      let grade = '';
      if (gradeConfigs.length > 0) {
        const matchedGrade = gradeConfigs.find(g => percentage >= g.minPercentage && percentage <= g.maxPercentage);
        if (matchedGrade) grade = matchedGrade.grade;
      } else {
        // Fallback standard grading
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';
        else if (percentage >= 50) grade = 'D';
        else grade = 'F';
      }

      reportCardsData.push({
        studentId,
        totalMarks,
        obtainedMarks,
        percentage,
        grade,
        result
      });
    });

    // 5. Sort by percentage to calculate rank
    reportCardsData.sort((a, b) => b.percentage - a.percentage);
    
    let currentRank = 1;
    reportCardsData.forEach((rc, index) => {
      // Handle ties (same percentage = same rank)
      if (index > 0 && rc.percentage === reportCardsData[index - 1].percentage) {
        rc.rank = reportCardsData[index - 1].rank;
      } else {
        rc.rank = currentRank;
      }
      currentRank++;
    });

    // 6. Bulk Write Report Cards
    const operations = reportCardsData.map(data => ({
      updateOne: {
        filter: { schoolId, examId, studentId: data.studentId },
        update: {
          $set: {
            classId,
            sectionId,
            totalMarks: data.totalMarks,
            obtainedMarks: data.obtainedMarks,
            percentage: data.percentage,
            grade: data.grade,
            rank: data.rank,
            result: data.result,
            generatedAt: new Date()
          }
        },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await ReportCard.bulkWrite(operations);
    }

    res.status(200).json({ success: true, message: 'Results generated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getReportCards = async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId;
    const { examId, classId, sectionId } = req.query;

    if (!schoolId) return res.status(400).json({ success: false, error: 'School ID is required' });
    if (!examId) return res.status(400).json({ success: false, error: 'examId is required' });

    const query: any = { schoolId, examId };
    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;

    const reportCards = await ReportCard.find(query)
      .populate('studentId', 'name userCode profilePicture')
      .populate('classId', 'name')
      .populate('sectionId', 'name')
      .populate('examId', 'name academicYear term')
      .sort({ rank: 1 });

    res.status(200).json({ success: true, data: reportCards });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};


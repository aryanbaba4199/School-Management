import { Request, Response } from 'express';
import { FeeInvoice } from './fee.model';
import { UserModel } from '../user/user.model';
import { ClassModel } from '../class/class.model';
import { Types } from 'mongoose';

export const getStudentFees = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    if (!studentId || !Types.ObjectId.isValid(studentId as string)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }

    const fees = await FeeInvoice.find({ studentId }).sort({ year: -1, month: -1 });

    res.status(200).json({ success: true, data: fees });
  } catch (error: any) {
    console.error('Error fetching student fees:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    // SchoolId is injected by the injectSchoolId middleware
    const schoolId = req.schoolId;

    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID is required to fetch transactions' });
    }

    const fees = await FeeInvoice.find({ schoolId })
      .populate('studentId', 'name userCode email phone')
      .populate('classId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: fees });
  } catch (error: any) {
    console.error('Error fetching all transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const generateStudentFees = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.body;

    if (!studentId || !Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, error: 'Invalid student ID' });
    }

    const student = await UserModel.findById(studentId).populate('schoolId').populate('classId');
    if (!student || student.role?.name !== 'STUDENT') {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const school: any = student.schoolId;
    const classObj: any = student.classId;

    if (!school || !classObj) {
      return res.status(400).json({ success: false, error: 'Student must be assigned to a school and class' });
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Check if admission fee exists
    const existingAdmissionFee = await FeeInvoice.findOne({ studentId, type: 'ADMISSION' });
    if (!existingAdmissionFee && school.admissionFee > 0) {
      await FeeInvoice.create({
        studentId,
        schoolId: school._id,
        classId: classObj._id,
        amount: school.admissionFee,
        type: 'ADMISSION',
        year: currentYear,
        status: 'PENDING',
      });
    }

    // Generate monthly or yearly fee based on feeCycle
    const feeCycle = student.feeCycle || 'MONTHLY';

    if (feeCycle === 'MONTHLY') {
      const existingMonthlyFee = await FeeInvoice.findOne({ studentId, type: 'MONTHLY', month: currentMonth, year: currentYear });
      if (!existingMonthlyFee && classObj.monthlyFee > 0) {
        await FeeInvoice.create({
          studentId,
          schoolId: school._id,
          classId: classObj._id,
          amount: classObj.monthlyFee,
          type: 'MONTHLY',
          month: currentMonth,
          year: currentYear,
          status: 'PENDING',
          dueDate: new Date(currentYear, currentMonth - 1, 15), // Due on 15th of month
        });
      }
    } else if (feeCycle === 'YEARLY') {
      const existingYearlyFee = await FeeInvoice.findOne({ studentId, type: 'YEARLY', year: currentYear });
      if (!existingYearlyFee && classObj.yearlyFee > 0) {
        await FeeInvoice.create({
          studentId,
          schoolId: school._id,
          classId: classObj._id,
          amount: classObj.yearlyFee,
          type: 'YEARLY',
          year: currentYear,
          status: 'PENDING',
          dueDate: new Date(currentYear, 3, 15), // Due e.g. April 15th
        });
      }
    }

    res.status(200).json({ success: true, message: 'Fees generated successfully' });
  } catch (error: any) {
    console.error('Error generating fees:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const generateGlobalFees = async (req: Request, res: Response) => {
  try {
    const schoolId = req.schoolId;
    const { type, month, year, classId } = req.body;

    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }

    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    // Fetch students
    const query: any = { schoolId, 'role.name': 'STUDENT', isActive: true };
    if (classId) query.classId = classId;
    
    const students = await UserModel.find(query).populate('schoolId').populate('classId');

    let count = 0;

    for (const student of students) {
      const school: any = student.schoolId;
      const classObj: any = student.classId;

      if (!school || !classObj) continue;

      if (type === 'ADMISSION') {
        const existing = await FeeInvoice.findOne({ studentId: student._id, type: 'ADMISSION' });
        if (!existing && school.admissionFee > 0) {
          await FeeInvoice.create({
            studentId: student._id,
            schoolId: school._id,
            classId: classObj._id,
            amount: school.admissionFee,
            type: 'ADMISSION',
            year: currentYear,
            status: 'PENDING',
          });
          count++;
        }
      } else if (type === 'MONTHLY') {
        const existing = await FeeInvoice.findOne({ studentId: student._id, type: 'MONTHLY', month: currentMonth, year: currentYear });
        if (!existing && classObj.monthlyFee > 0) {
          await FeeInvoice.create({
            studentId: student._id,
            schoolId: school._id,
            classId: classObj._id,
            amount: classObj.monthlyFee,
            type: 'MONTHLY',
            month: currentMonth,
            year: currentYear,
            status: 'PENDING',
            dueDate: new Date(currentYear, currentMonth - 1, 15),
          });
          count++;
        }
      }
    }

    res.status(200).json({ success: true, count, message: `Generated ${count} invoices successfully` });
  } catch (error: any) {
    console.error('Error generating global fees:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const payFee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || !Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ success: false, error: 'Invalid fee ID' });
    }

    const fee = await FeeInvoice.findById(id);
    if (!fee) {
      return res.status(404).json({ success: false, error: 'Fee invoice not found' });
    }

    if (fee.status === 'PAID') {
      return res.status(400).json({ success: false, error: 'Fee is already paid' });
    }

    fee.status = 'PAID';
    fee.paidAt = new Date();
    await fee.save();

    res.status(200).json({ success: true, data: fee });
  } catch (error: any) {
    console.error('Error paying fee:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const markFeeDue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || !Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ success: false, error: 'Invalid fee ID' });
    }

    const fee = await FeeInvoice.findById(id);
    if (!fee) {
      return res.status(404).json({ success: false, error: 'Fee invoice not found' });
    }

    fee.status = 'PENDING';
    fee.paidAt = undefined;
    await fee.save();

    res.status(200).json({ success: true, data: fee });
  } catch (error: any) {
    console.error('Error marking fee as due:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

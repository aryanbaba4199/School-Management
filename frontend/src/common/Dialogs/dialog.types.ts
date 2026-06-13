import type { SchoolFormData } from '../../features/school-management/manage-schools/schema/school.schema';
import type { PlanFormData } from '../../features/app-management/plan-management/schema/plan.schema';
import type { ISubscriptionPlan } from '../../features/app-management/plan-management/types/plans.types';
import type { IReportCard, IExam, IExamSchedule } from '@api/examApi';

import type { ISchoolUser } from '@api/usersApi';

/*------------- Dialog Types Definitions -------------*/

export type DialogType = 
  | 'CONFIRMATION' 
  | 'SCHOOL_FORM' 
  | 'PLAN_FORM' 
  | 'PASSCODE_PROMPT'
  | 'STUDENT_FORM'
  | 'TEACHER_FORM'
  | 'PARENT_FORM'
  | 'CLASS_FORM'
  | 'SUBJECT_FORM'
  | 'CLASS_DETAILS'
  | 'TEACHER_DETAILS'
  | 'USER_DETAILS' 
  | 'SCHOOL_DETAILS' 
  | 'STUDENT_DETAILS'
  | 'EXAM_FORM'
  | 'SCHEDULE_SUBJECT_FORM'
  | 'REPORT_CARD_VIEW'
  | null;

export interface DialogPropsMap {
  USER_DETAILS: { userId: string };
  SCHOOL_DETAILS: { schoolId: string };
  CLASS_DETAILS: { classId: string };
  TEACHER_DETAILS: { userId: string };
  STUDENT_DETAILS: { userId: string };
  CONFIRMATION: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
  };
  SCHOOL_FORM: {
    schoolId?: string;
    onSubmit: (data: SchoolFormData) => void | Promise<void>;
  };
  PLAN_FORM: {
    plan?: ISubscriptionPlan | null;
    onSubmit: (data: PlanFormData) => void | Promise<void>;
  };
  PASSCODE_PROMPT: {
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: (passcode: string) => void | Promise<void>;
  };
  STUDENT_FORM: {
    userId?: string;
    onSubmit: (data: Partial<ISchoolUser> & { password?: string }) => void | Promise<void>;
  };
  TEACHER_FORM: {
    userId?: string;
    onSubmit: (data: Partial<ISchoolUser> & { password?: string }) => void | Promise<void>;
  };
  PARENT_FORM: {
    userId?: string;
    onSubmit: (data: Partial<ISchoolUser> & { password?: string }) => void | Promise<void>;
  };
  CLASS_FORM: {
    classId?: string;
    onSubmit: (data: {
      name: string;
      sections: string[];
      schoolId?: string;
      classTeacherId?: string;
      schedule?: { startTime: string; endTime: string; subjectId: string; teacherId: string }[];
    }) => void | Promise<void>;
  };
  SUBJECT_FORM: {
    subjectId?: string;
    onSubmit: (data: { name: string; code: string; teacherIds?: string[]; schoolId?: string }) => void | Promise<void>;
  };
  EXAM_FORM: {
    examId?: string;
    exam?: IExam;
    onSubmit?: (data: unknown) => void | Promise<void>;
  };
  SCHEDULE_SUBJECT_FORM: {
    examId: string;
    classId: string;
    sectionId: string;
    schedule?: IExamSchedule;
  };
  REPORT_CARD_VIEW: {
    reportCard: IReportCard;
  };
}

export interface DialogState<T extends DialogType = DialogType> {
  type: T;
  props: T extends keyof DialogPropsMap ? DialogPropsMap[T] : null;
}

import type { ISection, IClass } from '../../../../api/classesApi';

export type { ISection, IClass };

export interface PeriodScheduleInput {
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
}

export interface ClassFormData {
  name: string;
  sections: string; // Comma-separated section names entered in the form
  schoolId?: string;
  classTeacherId?: string;
  schedule?: PeriodScheduleInput[];
  monthlyFee?: number;
  yearlyFee?: number;
}

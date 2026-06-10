import type { SchoolFormData } from '../../features/school-management/manage-schools/schema/school.schema';
import type { PlanFormData } from '../../features/app-management/plan-management/schema/plan.schema';
import type { ISubscriptionPlan } from '../../features/app-management/plan-management/types/plans.types';
import type { ISchool } from '../../features/school-management/manage-schools/types/schools.types';

import type { ISchoolUser } from '../../api/usersApi';
import type { IClass } from '../../api/classesApi';
import type { ISubject } from '../../api/subjectsApi';

/*------------- Dialog Types Definitions -------------*/

export type DialogType = 
  | 'USER_DETAILS' 
  | 'SCHOOL_DETAILS' 
  | 'CONFIRMATION' 
  | 'SCHOOL_FORM' 
  | 'PLAN_FORM' 
  | 'PASSCODE_PROMPT'
  | 'STUDENT_FORM'
  | 'TEACHER_FORM'
  | 'PARENT_FORM'
  | 'CLASS_FORM'
  | 'SUBJECT_FORM'
  | null;

export interface DialogPropsMap {
  USER_DETAILS: { userId: string };
  SCHOOL_DETAILS: { schoolId: string };
  CONFIRMATION: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
  };
  SCHOOL_FORM: {
    school?: ISchool | null;
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
    user?: ISchoolUser | null;
    onSubmit: (data: Partial<ISchoolUser> & { password?: string }) => void | Promise<void>;
  };
  TEACHER_FORM: {
    user?: ISchoolUser | null;
    onSubmit: (data: Partial<ISchoolUser> & { password?: string }) => void | Promise<void>;
  };
  PARENT_FORM: {
    user?: ISchoolUser | null;
    onSubmit: (data: Partial<ISchoolUser> & { password?: string }) => void | Promise<void>;
  };
  CLASS_FORM: {
    classObj?: IClass | null;
    onSubmit: (data: { name: string; sections: string[]; schoolId?: string }) => void | Promise<void>;
  };
  SUBJECT_FORM: {
    subject?: ISubject | null;
    onSubmit: (data: { name: string; code: string; teacherIds?: string[]; schoolId?: string }) => void | Promise<void>;
  };
}

export interface DialogState<T extends DialogType = DialogType> {
  type: T;
  props: T extends keyof DialogPropsMap ? DialogPropsMap[T] : null;
}

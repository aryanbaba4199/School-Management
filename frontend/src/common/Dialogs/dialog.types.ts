import type { SchoolFormData } from '../../features/schools/schema/school.schema';
import type { PlanFormData } from '../../features/app-management/plan-management/schema/plan.schema';
import type { ISubscriptionPlan } from '../../features/app-management/plan-management/types/plans.types';
import type { ISchool } from '../../features/schools/types/schools.types';

/*------------- Dialog Types Definitions -------------*/

export type DialogType = 
  | 'USER_DETAILS' 
  | 'SCHOOL_DETAILS' 
  | 'CONFIRMATION' 
  | 'SCHOOL_FORM' 
  | 'PLAN_FORM' 
  | 'PASSCODE_PROMPT'
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
}

export interface DialogState<T extends DialogType = DialogType> {
  type: T;
  props: T extends keyof DialogPropsMap ? DialogPropsMap[T] : null;
}

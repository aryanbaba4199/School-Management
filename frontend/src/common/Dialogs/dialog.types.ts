/*------------- Dialog Types Definitions -------------*/

export type DialogType = 'USER_DETAILS' | 'SCHOOL_DETAILS' | 'CONFIRMATION' | null;

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
}

export interface DialogState<T extends DialogType = DialogType> {
  type: T;
  props: T extends keyof DialogPropsMap ? DialogPropsMap[T] : null;
}

/* eslint-disable react-refresh/only-export-components */
import { useState, useMemo, useCallback, Suspense } from 'react';
import type { ReactNode } from 'react';
import { Dialog } from '@mui/material';
import { DialogContext, useDialog } from './dialog.context';
export { useDialog };
import type { DialogType, DialogPropsMap, DialogState } from './dialog.types';

/*------------- Lazy Loaded Dialog Components -------------*/

import UserDetailsDialog from '../components/UserDetailsDialog';
import SchoolDetailsDialog from '../components/SchoolDetailsDialog';
import ConfirmationDialog from '../components/ConfirmationDialog';
import SchoolFormDialogWrapper from './SchoolFormDialogWrapper';
import { PlanFormDialog } from '../../features/app-management/plan-management/components/PlanFormDialog';
import PasscodeDialog from '../components/PasscodeDialog';
import { StudentFormDialog } from '../../features/users/students/components/StudentFormDialog';
import { TeacherFormDialog } from '../../features/users/teachers/components/TeacherFormDialog';
import { ParentFormDialog } from '../../features/users/parents/components/ParentFormDialog';
import { ClassFormDialog } from '../../features/school-management/classes/components/ClassFormDialog';
import { SubjectFormDialog } from '../../features/school-management/subjects/components/SubjectFormDialog';
import ClassDetailsDialog from '../../features/school-management/classes/components/ClassDetailsDialog';
import TeacherDetailsDialog from '../../features/users/teachers/components/TeacherDetailsDialog';

/*------------- Dialog Provider Component -------------*/

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    props: null,
  });

  const openDialog = useCallback(<T extends DialogType>(
    type: T,
    props: T extends keyof DialogPropsMap ? DialogPropsMap[T] : null
  ) => {
    setDialogState({ type, props } as DialogState);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState({ type: null, props: null });
  }, []);

  const contextValue = useMemo(() => ({
    dialogState,
    openDialog,
    closeDialog,
  }), [dialogState, openDialog, closeDialog]);

  // Dynamically resolve and render the open dialog component inside a Suspense fallback
  const renderOpenDialog = () => {
    const { type, props } = dialogState;
    if (!type || !props) return null;

    switch (type) {
      case 'USER_DETAILS':
        return <UserDetailsDialog {...(props as DialogPropsMap['USER_DETAILS'])} onClose={closeDialog} />;
      case 'SCHOOL_DETAILS':
        return <SchoolDetailsDialog {...(props as DialogPropsMap['SCHOOL_DETAILS'])} onClose={closeDialog} />;
      case 'CONFIRMATION':
        return <ConfirmationDialog {...(props as DialogPropsMap['CONFIRMATION'])} onClose={closeDialog} />;
      case 'SCHOOL_FORM':
        return <SchoolFormDialogWrapper {...(props as DialogPropsMap['SCHOOL_FORM'])} onClose={closeDialog} />;
      case 'PLAN_FORM':
        return <PlanFormDialog {...(props as DialogPropsMap['PLAN_FORM'])} onClose={closeDialog} />;
      case 'PASSCODE_PROMPT':
        return <PasscodeDialog {...(props as DialogPropsMap['PASSCODE_PROMPT'])} onClose={closeDialog} />;
      case 'STUDENT_FORM':
        return <StudentFormDialog {...(props as DialogPropsMap['STUDENT_FORM'])} onClose={closeDialog} />;
      case 'TEACHER_FORM':
        return <TeacherFormDialog {...(props as DialogPropsMap['TEACHER_FORM'])} onClose={closeDialog} />;
      case 'PARENT_FORM':
        return <ParentFormDialog {...(props as DialogPropsMap['PARENT_FORM'])} onClose={closeDialog} />;
      case 'CLASS_FORM':
        return <ClassFormDialog {...(props as DialogPropsMap['CLASS_FORM'])} onClose={closeDialog} />;
      case 'SUBJECT_FORM':
        return <SubjectFormDialog {...(props as DialogPropsMap['SUBJECT_FORM'])} onClose={closeDialog} />;
      case 'CLASS_DETAILS':
        return <ClassDetailsDialog {...(props as DialogPropsMap['CLASS_DETAILS'])} onClose={closeDialog} />;
      case 'TEACHER_DETAILS':
        return <TeacherDetailsDialog {...(props as DialogPropsMap['TEACHER_DETAILS'])} onClose={closeDialog} />;
      default:
        return null;
    }
  };

  const getMaxWidth = () => {
    const { type } = dialogState;
    if (type === 'CONFIRMATION') return 'xs';
    if (type === 'PLAN_FORM') return 'sm';
    return 'md';
  };

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      <Dialog
        open={dialogState.type !== null}
        onClose={closeDialog}
        maxWidth={getMaxWidth()}
        fullWidth
        scroll="paper"
        slotProps={{
          paper: {
            style: {
              backgroundColor: 'var(--color-background-paper)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-default)',
              boxShadow: 'var(--shadow-lg)',
            },
          },
        }}
      >
        <Suspense fallback={null}>
          {renderOpenDialog()}
        </Suspense>
      </Dialog>
    </DialogContext.Provider>
  );
}

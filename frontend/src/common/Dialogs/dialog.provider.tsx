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
import { PlanFormDialog } from '../../features/plans/components/PlanFormDialog';
import PasscodeDialog from '../components/PasscodeDialog';

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

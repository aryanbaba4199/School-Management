import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { Dialog } from '@mui/material';
import { DialogContext, useDialog } from './dialog.context';
export { useDialog };
import type { DialogType, DialogPropsMap, DialogState } from './dialog.types';

/*------------- Lazy Loaded Dialog Components -------------*/

const UserDetailsDialog = lazy(() => import('../components/UserDetailsDialog'));
const SchoolDetailsDialog = lazy(() => import('../components/SchoolDetailsDialog'));
const ConfirmationDialog = lazy(() => import('../components/ConfirmationDialog'));

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
      default:
        return null;
    }
  };

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      <Dialog
        open={dialogState.type !== null}
        onClose={closeDialog}
        maxWidth="md"
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

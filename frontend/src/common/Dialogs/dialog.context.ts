import { createContext, useContext } from 'react';
import type { DialogType, DialogPropsMap, DialogState } from './dialog.types';

/*------------- Dialog Context Interface -------------*/

export interface DialogContextProps {
  dialogState: DialogState;
  openDialog: <T extends DialogType>(type: T, props: T extends keyof DialogPropsMap ? DialogPropsMap[T] : null) => void;
  closeDialog: () => void;
}

export const DialogContext = createContext<DialogContextProps | undefined>(undefined);

/*------------- Custom useDialog Hook -------------*/

export function useDialog(): DialogContextProps {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}

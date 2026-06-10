/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';

/*------------- Notifier Types -------------*/

export type AlertSeverity = 'success' | 'error' | 'warning' | 'info';

export interface NotifierContextProps {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const NotifierContext = createContext<NotifierContextProps | undefined>(undefined);

/*------------- Notifier Provider Component -------------*/

interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertSeverity;
}

export function NotifierProvider({ children }: { children: ReactNode }) {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showNotification = useCallback((message: string, severity: AlertSeverity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  }, []);

  const showSuccess = useCallback((msg: string) => showNotification(msg, 'success'), [showNotification]);
  const showError = useCallback((msg: string) => showNotification(msg, 'error'), [showNotification]);
  const showWarning = useCallback((msg: string) => showNotification(msg, 'warning'), [showNotification]);
  const showInfo = useCallback((msg: string) => showNotification(msg, 'info'), [showNotification]);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <NotifierContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: '100%',
            fontWeight: 500,
            borderRadius: '8px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </NotifierContext.Provider>
  );
}

/*------------- Custom useNotifier Hook -------------*/

export function useNotifier(): NotifierContextProps {
  const context = useContext(NotifierContext);
  if (!context) {
    throw new Error('useNotifier must be used within a NotifierProvider');
  }
  return context;
}

import { DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

/*------------- Confirmation Dialog Component -------------*/

interface ConfirmationDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export default function ConfirmationDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (err) {
      console.error('Confirmation action failed:', err);
    } finally {
      onClose();
    }
  };

  return (
    <>
      <DialogTitle style={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText style={{ color: 'var(--color-text-secondary)' }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions style={{ padding: '16px' }}>
        <Button onClick={onClose} style={{ color: 'var(--color-text-secondary)' }}>
          {cancelLabel}
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="error">
          {confirmLabel}
        </Button>
      </DialogActions>
    </>
  );
}

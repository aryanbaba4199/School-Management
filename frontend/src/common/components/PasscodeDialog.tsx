import { useState } from 'react';
import { 
  DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Box 
} from '@mui/material';

interface PasscodeDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: (passcode: string) => void | Promise<void>;
  onClose: () => void;
}

export default function PasscodeDialog({ 
  title, 
  message, 
  confirmLabel = 'Confirm', 
  onConfirm, 
  onClose 
}: PasscodeDialogProps) {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length !== 6 || !/^\d+$/.test(passcode)) {
      setErrorMsg('Please enter a valid 6-digit numeric passcode.');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onConfirm(passcode);
    } catch (err: unknown) {
      const msg = (err && typeof err === 'object' && 'data' in err)
        ? (err.data as { message?: string })?.message 
        : 'Passcode verification failed';
      setErrorMsg(msg || 'Passcode verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle sx={{ fontWeight: 800, color: 'var(--color-text-primary)', pt: 3, px: 3 }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 2, pt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {message}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TextField
            label="6-Digit Passcode"
            type="password"
            variant="outlined"
            fullWidth
            autoFocus
            value={passcode}
            onChange={(e) => {
              setPasscode(e.target.value.slice(0, 6));
              if (errorMsg) setErrorMsg(null);
            }}
            error={!!errorMsg}
            helperText={errorMsg}
            slotProps={{
              htmlInput: {
                maxLength: 6,
                style: { letterSpacing: '0.5em', textAlign: 'center', fontWeight: 'bold' }
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button onClick={onClose} variant="outlined" color="secondary" sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          color="error" 
          disabled={isSubmitting || passcode.length !== 6}
          sx={{ textTransform: 'none' }}
        >
          {isSubmitting ? 'Deleting...' : confirmLabel}
        </Button>
      </DialogActions>
    </form>
  );
}

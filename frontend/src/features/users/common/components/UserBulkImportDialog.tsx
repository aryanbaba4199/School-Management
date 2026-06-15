import { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  Typography, Box, Alert, IconButton, CircularProgress 
} from '@mui/material';
import { FaTimes, FaUpload, FaFileCsv } from 'react-icons/fa';
import { useBulkImportUsersMutation } from '@api/usersApi';

interface UserBulkImportDialogProps {
  open: boolean;
  onClose: () => void;
  role: string;
  schoolId?: string;
  onSuccess?: () => void;
}

export function UserBulkImportDialog({ open, onClose, role, schoolId, onSuccess }: UserBulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [bulkImport, { isLoading }] = useBulkImportUsersMutation();
  const [result, setResult] = useState<{ successCount: number; failedCount: number; errors: { row: number; email: string; reason: string }[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
      setErrorMsg(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      const text = await file.text();
      const res = await bulkImport({ csvData: text, role, schoolId }).unwrap();
      setResult(res.data);
      if (res.data.successCount > 0 && onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      setErrorMsg(error?.data?.message || error?.message || 'Failed to import users.');
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Bulk Import {role.charAt(0) + role.slice(1).toLowerCase()}s</Typography>
        <IconButton onClick={handleClose} size="small" disabled={isLoading}><FaTimes /></IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Upload a CSV file to bulk import users. The CSV must contain `name` and `email` columns. 
          Optional columns: `phone`, `userCode`, `password`.
        </Typography>

        <Box sx={{ p: 3, border: '2px dashed var(--color-border-default)', borderRadius: 2, textAlign: 'center', mb: 3 }}>
          <FaFileCsv size={40} color="var(--color-primary-main)" style={{ marginBottom: 8 }} />
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
            {file ? file.name : 'Select a CSV file to upload'}
          </Typography>
          <Button variant="outlined" component="label" disabled={isLoading}>
            Choose File
            <input type="file" hidden accept=".csv" onChange={handleFileChange} />
          </Button>
        </Box>

        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

        {result && (
          <Box>
            <Alert severity={result.failedCount === 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
              Successfully imported {result.successCount} users. Failed: {result.failedCount}.
            </Alert>
            {result.errors.length > 0 && (
              <Box sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'var(--color-bg-subtle)', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Error Details:</Typography>
                {result.errors.map((err, idx) => (
                  <Typography key={idx} variant="body2" color="error.main" sx={{ mb: 0.5 }}>
                    Row {err.row} ({err.email}): {err.reason}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isLoading}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleImport} 
          disabled={!file || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <FaUpload />}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
}

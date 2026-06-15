import { Button, CircularProgress } from '@mui/material';
import { FaDownload } from 'react-icons/fa';
import { useLazyExportUsersQuery } from '@api/usersApi';

interface UserExportButtonProps {
  role: string;
  schoolId?: string;
  classId?: string;
  sectionId?: string;
}

export function UserExportButton({ role, schoolId, classId, sectionId }: UserExportButtonProps) {
  const [triggerExport, { isFetching }] = useLazyExportUsersQuery();

  const handleExport = async () => {
    try {
      const csvString = await triggerExport({ role, schoolId, classId, sectionId }).unwrap();
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `export_${role.toLowerCase()}s_${new Date().getTime()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export users:', err);
    }
  };

  return (
    <Button 
      variant="outlined" 
      color="primary" 
      startIcon={isFetching ? <CircularProgress size={16} /> : <FaDownload />}
      onClick={handleExport}
      disabled={isFetching}
      sx={{ textTransform: 'none', fontWeight: 600 }}
    >
      Export
    </Button>
  );
}

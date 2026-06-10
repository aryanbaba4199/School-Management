import { DialogTitle, DialogContent } from '@mui/material';
import { SchoolForm } from '../../features/school-management/manage-schools/components/SchoolForm';
import type { SchoolFormData } from '../../features/school-management/manage-schools/schema/school.schema';


interface SchoolFormDialogWrapperProps {
  schoolId?: string;
  onSubmit: (data: SchoolFormData) => void;
  onClose: () => void;
}

export default function SchoolFormDialogWrapper({ schoolId, onSubmit, onClose }: SchoolFormDialogWrapperProps) {
  return (
    <>
      <DialogTitle sx={{ fontWeight: 800, color: 'var(--color-text-primary)', px: 3, pt: 3, pb: 1 }}>
        {schoolId ? 'Edit School' : 'Register New School'}
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 3, pt: 3 }}>
        <SchoolForm schoolId={schoolId} onSubmit={onSubmit} onCancel={onClose} />
      </DialogContent>
    </>
  );
}

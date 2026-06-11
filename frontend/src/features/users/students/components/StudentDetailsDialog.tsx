import { 
  Box, Typography, Grid, Chip, CircularProgress, 
  Divider, IconButton, DialogTitle, DialogContent 
} from '@mui/material';
import { FaTimes, FaCalendarAlt } from 'react-icons/fa';
import { useGetUserByIdQuery } from '../../../../api/usersApi';
import { useGetClassByIdQuery } from '../../../../api/classesApi';

interface StudentDetailsDialogProps {
  userId: string;
  onClose: () => void;
}

export default function StudentDetailsDialog({ userId, onClose }: StudentDetailsDialogProps) {
  const { data: res, isLoading, error } = useGetUserByIdQuery(userId, { skip: !userId });

  const studentData = res?.data;

  // Fetch class to show class/section details nicely
  const { data: classRes } = useGetClassByIdQuery(studentData?.classId || '', { skip: !studentData?.classId });
  const classData = classRes?.data;
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, minHeight: 300, alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !res?.success || !studentData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Failed to load student details.</Typography>
      </Box>
    );
  }

  const sectionObj = classData?.sections?.find(s => s._id === studentData.sectionId);

  return (
    <>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-default)' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Student Profile</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={studentData.isActive ? 'Active' : 'Inactive'} 
            color={studentData.isActive ? 'success' : 'default'} 
            size="small" 
            sx={{ fontWeight: 600 }} 
          />
          <IconButton onClick={onClose} size="small">
            <FaTimes />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, minWidth: { md: 600 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{studentData.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Admission No.</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{studentData.userCode}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Email</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{studentData.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Phone</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{studentData.phone || '-'}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Parent / Guardian</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {studentData.parentId && typeof studentData.parentId === 'object' && 'name' in studentData.parentId
                      ? `${(studentData.parentId as { name: string }).name}`
                      : '-'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Class & Section</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {classData?.name || 'Unassigned'} {sectionObj ? `(Sec ${sectionObj.name})` : ''}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaCalendarAlt /> Admission & Accounting Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Registration Date</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {studentData.regDate ? new Date(studentData.regDate).toLocaleDateString() : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Start Date</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {studentData.startDate ? new Date(studentData.startDate).toLocaleDateString() : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Leave Date</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {studentData.leaveDate ? new Date(studentData.leaveDate).toLocaleDateString() : '-'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

          </Grid>
        </Grid>
      </DialogContent>
    </>
  );
}

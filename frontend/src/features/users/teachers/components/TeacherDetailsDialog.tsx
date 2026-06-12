import { 
  Box, Typography, Grid, Chip, CircularProgress, 
  Divider, IconButton, DialogTitle, DialogContent 
} from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import { useGetUserByIdQuery } from '@api/usersApi';

interface TeacherDetailsDialogProps {
  userId: string;
  onClose: () => void;
}

export default function TeacherDetailsDialog({ userId, onClose }: TeacherDetailsDialogProps) {
  const { data: res, isLoading, error } = useGetUserByIdQuery(userId, { skip: !userId });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, minHeight: 300, alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !res?.success || !res.data) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Failed to load tutor details.</Typography>
      </Box>
    );
  }

  const teacherData = res.data;

  return (
    <>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-default)' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Tutor Details</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={teacherData.isActive ? 'Active' : 'Inactive'} 
            color={teacherData.isActive ? 'success' : 'default'} 
            size="small" 
            sx={{ fontWeight: 600 }} 
          />
          <IconButton onClick={onClose} size="small">
            <FaTimes />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {teacherData.name}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                    Employee ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {teacherData.userCode}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {teacherData.email}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                    Phone
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {teacherData.phone || '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                    Institute
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {teacherData.schoolId && typeof teacherData.schoolId === 'object' && 'name' in teacherData.schoolId
                      ? `${(teacherData.schoolId as { name: string }).name}`
                      : 'Default Institute'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Subjects Taught
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {teacherData.subjects && teacherData.subjects.length > 0 ? (
                  teacherData.subjects.map((sub: { _id: string; name: string } | string) => (
                    <Chip 
                      key={typeof sub === 'object' ? sub._id : sub as string} 
                      label={typeof sub === 'object' ? sub.name : sub} 
                      color="primary" 
                      variant="outlined" 
                    />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>No subjects assigned</Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </>
  );
}

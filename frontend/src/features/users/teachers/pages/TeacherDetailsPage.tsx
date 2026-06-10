import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Chip, Button, CircularProgress, 
  Divider, IconButton
} from '@mui/material';
import { FaArrowLeft } from 'react-icons/fa';
import { useGetUserByIdQuery } from '../../../../api/usersApi';

export function TeacherDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: res, isLoading, error } = useGetUserByIdQuery(id || '', { skip: !id });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !res?.success || !res.data) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Failed to load tutor details.</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }} variant="outlined">
          Go Back
        </Button>
      </Box>
    );
  }

  const teacherData = res.data;

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate(-1)} size="small">
          <FaArrowLeft />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>
          Tutor Details
        </Typography>
        <Chip 
          label={teacherData.isActive ? 'Active' : 'Inactive'} 
          color={teacherData.isActive ? 'success' : 'default'} 
          size="small" 
          sx={{ fontWeight: 600, ml: 'auto' }} 
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                  Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {teacherData.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                  Employee ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {teacherData.userCode}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {teacherData.email}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                  Phone
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {teacherData.phone || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                  Institute
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {teacherData.schoolId && typeof teacherData.schoolId === 'object' && 'name' in teacherData.schoolId
                    ? `${(teacherData.schoolId as any).name}`
                    : 'Default Institute'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Subjects Taught
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {teacherData.subjects && teacherData.subjects.length > 0 ? (
                teacherData.subjects.map((sub: any) => (
                  <Chip 
                    key={sub._id || sub} 
                    label={typeof sub === 'object' ? sub.name : sub} 
                    color="primary" 
                    variant="outlined" 
                  />
                ))
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>No subjects assigned</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

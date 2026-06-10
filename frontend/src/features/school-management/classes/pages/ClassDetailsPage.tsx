import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Chip, Button, CircularProgress, 
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Divider, IconButton
} from '@mui/material';
import { FaArrowLeft } from 'react-icons/fa';
import { useGetClassByIdQuery } from '../../../../api/classesApi';

export function ClassDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: res, isLoading, error } = useGetClassByIdQuery(id || '', { skip: !id });

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
        <Typography color="error">Failed to load class details.</Typography>
        <Button onClick={() => navigate('/school-management/classes')} sx={{ mt: 2 }} variant="outlined">
          Go Back
        </Button>
      </Box>
    );
  }

  const classData = res.data;

  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/school-management/classes')} size="small">
          <FaArrowLeft />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>
          {classData.name} Details
        </Typography>
        <Chip 
          label={classData.isActive ? 'Active' : 'Inactive'} 
          color={classData.isActive ? 'success' : 'default'} 
          size="small" 
          sx={{ fontWeight: 600, ml: 'auto' }} 
        />
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                Class Name
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {classData.name}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                Class Teacher
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {classData.classTeacherId && typeof classData.classTeacherId === 'object' && 'name' in classData.classTeacherId 
                  ? `${(classData.classTeacherId as any).name} (${(classData.classTeacherId as any).email})` 
                  : 'Not Assigned'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                Institute
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {classData.schoolId && typeof classData.schoolId === 'object' && 'name' in classData.schoolId
                  ? `${(classData.schoolId as any).name}`
                  : 'Default Institute'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block', mb: 0.5 }}>
                Sections
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {classData.sections && classData.sections.length > 0 ? (
                  classData.sections.map((sec: any) => (
                    <Chip key={sec._id} label={sec.name} size="small" variant="outlined" />
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>No sections</Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Timetable / Schedule */}
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Class Schedule
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {classData.schedule && classData.schedule.length > 0 ? (
              <TableContainer component={Paper} elevation={0} variant="outlined">
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'var(--color-bg-secondary)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Teacher</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {classData.schedule.map((period: any, index: number) => {
                      const subjectName = typeof period.subjectId === 'object' && period.subjectId?.name ? period.subjectId.name : '-';
                      const teacherName = typeof period.teacherId === 'object' && period.teacherId?.name ? period.teacherId.name : '-';
                      return (
                        <TableRow key={period._id || index} hover>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {period.startTime} - {period.endTime}
                          </TableCell>
                          <TableCell>
                            <Chip label={subjectName} size="small" color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{teacherName}</Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Typography variant="body2">No schedule has been configured for this class yet.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

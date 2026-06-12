import { 
  Box, Typography, Grid, Chip, CircularProgress, 
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Divider, IconButton, DialogTitle, DialogContent, Paper
} from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import { useGetClassByIdQuery } from '@api/classesApi';

interface ClassDetailsDialogProps {
  classId: string;
  onClose: () => void;
}

export default function ClassDetailsDialog({ classId, onClose }: ClassDetailsDialogProps) {
  const { data: res, isLoading, error } = useGetClassByIdQuery(classId, { skip: !classId });

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
        <Typography color="error">Failed to load class details.</Typography>
      </Box>
    );
  }

  const classData = res.data;

  return (
    <>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-default)' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>{classData.name} Details</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={classData.isActive ? 'Active' : 'Inactive'} 
            color={classData.isActive ? 'success' : 'default'} 
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
          {/* Basic Information */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
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
                    ? `${(classData.classTeacherId as { name: string; email: string }).name} (${(classData.classTeacherId as { name: string; email: string }).email})` 
                    : 'Not Assigned'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                  Institute
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {classData.schoolId && typeof classData.schoolId === 'object' && 'name' in classData.schoolId
                    ? `${(classData.schoolId as { name: string }).name}`
                    : 'Default Institute'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block', mb: 0.5 }}>
                  Sections
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {classData.sections && classData.sections.length > 0 ? (
                    classData.sections.map((sec: { _id: string; name: string }) => (
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
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
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
                      {classData.schedule.map((period: { _id?: string; subjectId: { name?: string } | string; teacherId: { name?: string } | string; startTime: string; endTime: string }, index: number) => {
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
      </DialogContent>
    </>
  );
}

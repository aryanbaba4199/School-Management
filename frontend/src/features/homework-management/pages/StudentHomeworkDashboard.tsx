import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useGetStudentDashboardQuery } from '../../../api/homeworkApi';
import type { IHomework } from '../../../api/homeworkApi';
import { PageWrapper } from '../../../common/Datatable';
import { useDialog } from '../../../common/Dialogs/dialog.provider';
import { format } from 'date-fns';
import { PageTabs, StatusChip } from '../../../common/components';

export const StudentHomeworkDashboard: React.FC = () => {
  const { data: dashboardData, isLoading } = useGetStudentDashboardQuery();
  const { openDialog } = useDialog();
  const [tabIndex, setTabIndex] = useState(0);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const submissions = dashboardData?.data || [];
  
  const pendingTasks = submissions.filter((sub) => sub.status === 'PENDING' || sub.status === 'CORRECTION_REQUIRED');
  const completedTasks = submissions.filter((sub) => sub.status === 'SUBMITTED' || sub.status === 'GRADED' || sub.status === 'LATE');

  const displayTasks = tabIndex === 0 ? pendingTasks : completedTasks;

  return (
    <PageWrapper title="My Tasks">
      <PageTabs
        tabs={[
          { label: 'Pending', count: pendingTasks.length },
          { label: 'Completed', count: completedTasks.length },
        ]}
        value={tabIndex}
        onChange={setTabIndex}
        ariaLabel="homework tabs"
      />

      {displayTasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            {tabIndex === 0 ? 'Hooray! No pending homework.' : 'No completed homework yet.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {displayTasks.map((sub) => {
            const hw = sub.homeworkId as IHomework;
            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={sub._id}>
                <Card
                  elevation={3}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    borderTop: `4px solid ${
                      sub.status === 'PENDING' ? '#ffa726' : sub.status === 'GRADED' ? '#66bb6a' : '#29b6f6'
                    }`,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip
                        label={typeof hw.subjectId === 'object' ? hw.subjectId.name : 'Subject'}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <StatusChip status={sub.status} />
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 'bold' }} gutterBottom>
                      {hw.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, height: 60, overflow: 'hidden' }}>
                      {hw.description}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography variant="caption" sx={{ color: 'error.main' }}>
                        Due: {format(new Date(hw.dueDate), 'MMM dd, h:mm a')}
                      </Typography>
                      {sub.status === 'GRADED' && (
                        <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                          Marks: {sub.obtainedMarks} / {hw.maxMarks || '-'}
                        </Typography>
                      )}
                    </Box>

                    {sub.teacherFeedback && (
                      <Box sx={{ mt: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                          Teacher Feedback:
                        </Typography>
                        <Typography variant="caption">{sub.teacherFeedback}</Typography>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant={tabIndex === 0 ? 'contained' : 'outlined'}
                      onClick={() => openDialog('SUBMISSION_FORM', { homeworkId: hw._id })}
                      disabled={sub.status === 'GRADED'}
                    >
                      {sub.status === 'PENDING' || sub.status === 'CORRECTION_REQUIRED'
                        ? 'Submit Assignment'
                        : sub.status === 'GRADED'
                        ? 'Viewed'
                        : 'Update Submission'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </PageWrapper>
  );
};

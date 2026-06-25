import React, { useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { gradeHomeworkSchema } from '../forms/homework.schema';
import type { GradeHomeworkFormValues } from '../forms/homework.schema';
import { useGradeSubmissionMutation } from '../../../api/homeworkApi';
import type { IHomeworkSubmission } from '../../../api/homeworkApi';
import { FormTextField, FormSelectField } from '../../../common/Forms';
import { useNotifier } from '../../../common/Notifier/NotifierProvider';

interface GradingDialogProps {
  submission: IHomeworkSubmission;
  maxMarks?: number;
  onClose: () => void;
}

export const GradingDialog: React.FC<GradingDialogProps> = ({ submission, maxMarks, onClose }) => {
  const { showSuccess, showError } = useNotifier();
  const [gradeSubmission, { isLoading: isGrading }] = useGradeSubmissionMutation();

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<GradeHomeworkFormValues>({
    resolver: yupResolver(gradeHomeworkSchema) as Resolver<GradeHomeworkFormValues>,
    defaultValues: {
      obtainedMarks: 0,
      teacherFeedback: '',
      status: 'GRADED',
    },
  });

  useEffect(() => {
    if (submission) {
      reset({
        obtainedMarks: submission.obtainedMarks || 0,
        teacherFeedback: submission.teacherFeedback || '',
        status: submission.status === 'CORRECTION_REQUIRED' ? 'CORRECTION_REQUIRED' : 'GRADED',
      });
    }
  }, [submission, reset]);

  const onSubmit = async (data: GradeHomeworkFormValues) => {
    if (!submission) return;

    if (maxMarks && data.obtainedMarks > maxMarks) {
      showError(`Marks cannot exceed the maximum of ${maxMarks}`);
      return;
    }

    try {
      await gradeSubmission({
        submissionId: submission._id,
        data,
      }).unwrap();
      showSuccess('Submission graded successfully');
      reset();
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      showError(error?.data?.message || 'Failed to grade submission');
    }
  };

  const statusOptions = [
    { label: 'Graded / Complete', value: 'GRADED' },
    { label: 'Correction Required', value: 'CORRECTION_REQUIRED' },
  ];

  if (!submission) return null;

  return (
    <>
      <DialogTitle>Grade Submission</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Student Notes:
          </Typography>
          <Typography variant="body1">
            {submission.studentNotes || 'No notes provided by the student.'}
          </Typography>
        </Box>

        <Box sx={{ mt: 1 }}>
          <form noValidate>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  name="obtainedMarks"
                  control={control}
                  label={`Marks (Max: ${maxMarks || 'N/A'})`}
                  type="number"
                  disabled={isGrading}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelectField
                  name="status"
                  control={control}
                  label="Status"
                  options={statusOptions}
                  disabled={isGrading}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormTextField
                  name="teacherFeedback"
                  control={control}
                  label="Feedback"
                  multiline
                  rows={4}
                  disabled={isGrading}
                />
              </Grid>
            </Grid>
          </form>
        </Box>
    </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isGrading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={isGrading}>
          {isGrading ? 'Saving...' : 'Save Grade'}
        </Button>
      </DialogActions>
    </>
  );
};

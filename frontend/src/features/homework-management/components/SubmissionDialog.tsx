import React from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { submitHomeworkSchema } from '../forms/homework.schema';
import type { SubmitHomeworkFormValues } from '../forms/homework.schema';
import { useSubmitHomeworkMutation } from '../../../api/homeworkApi';
import { AttachmentList } from '../../../common/components';
import { FormTextField } from '../../../common/Forms';
import { useNotifier } from '../../../common/Notifier/NotifierProvider';

interface SubmissionDialogProps {
  homeworkId: string;
  onClose: () => void;
}

export const SubmissionDialog: React.FC<SubmissionDialogProps> = ({ homeworkId, onClose }) => {
  const { showSuccess, showError } = useNotifier();
  const [submitHomework, { isLoading: isSubmitting }] = useSubmitHomeworkMutation();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<SubmitHomeworkFormValues>({
    resolver: yupResolver(submitHomeworkSchema) as Resolver<SubmitHomeworkFormValues>,
    defaultValues: {
      studentNotes: '',
      attachments: [],
    },
  });

  const attachments = watch('attachments') || [];

  const onSubmit = async (data: SubmitHomeworkFormValues) => {
    try {
      await submitHomework({ homeworkId, data }).unwrap();
      showSuccess('Homework submitted successfully');
      reset();
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      showError(error?.data?.message || 'Failed to submit homework');
    }
  };

  return (
    <>
      <DialogTitle>Submit Homework</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mt: 1 }}>
          <form noValidate>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FormTextField
                  name="studentNotes"
                  control={control}
                  label="Notes for Teacher (Optional)"
                  multiline
                  rows={4}
                  disabled={isSubmitting}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <AttachmentList
                  attachments={attachments}
                  onChange={(val) => setValue('attachments', val)}
                />
              </Grid>
            </Grid>
          </form>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
        </Button>
      </DialogActions>
    </>
  );
};

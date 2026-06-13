import { useEffect } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useCreateExamMutation, useUpdateExamMutation } from '@api/examApi';
import type { IExam } from '@api/examApi';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { FormTextField, FormSelectField } from '@common/Forms';

interface CreateExamDialogProps {
  onClose: () => void;
  exam?: IExam;
  onSubmit?: (data: unknown) => void;
}

interface ExamFormData {
  name: string;
  academicYear: string;
  term: 'MONTHLY' | 'QUARTERLY' | 'MID_TERM' | 'FINAL';
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED';
}

import dayjs from 'dayjs';

export function CreateExamDialog({ onClose, exam }: CreateExamDialogProps) {
  const { showSuccess, showError } = useNotifier();
  const [createExam, { isLoading: isCreating }] = useCreateExamMutation();
  const [updateExam, { isLoading: isUpdating }] = useUpdateExamMutation();
  const isLoading = isCreating || isUpdating;

  const { control, handleSubmit, reset } = useForm<ExamFormData>({
    defaultValues: {
      name: '',
      academicYear: '2024-2025',
      term: 'MONTHLY',
      startDate: '',
      endDate: '',
      status: 'DRAFT',
    },
  });

  // Reset form when dialog mounts
  useEffect(() => {
    if (exam) {
      reset({
        name: exam.name,
        academicYear: exam.academicYear,
        term: exam.term,
        startDate: dayjs(exam.startDate).format('YYYY-MM-DD'),
        endDate: dayjs(exam.endDate).format('YYYY-MM-DD'),
        status: exam.status,
      });
    } else {
      reset({
        name: '',
        academicYear: '2024-2025',
        term: 'MONTHLY',
        startDate: '',
        endDate: '',
        status: 'DRAFT',
      });
    }
  }, [reset, exam]);

  const onSubmitForm = async (data: ExamFormData) => {
    if (!data.name || !data.startDate || !data.endDate) {
      showError('Please fill all required fields');
      return;
    }
    try {
      if (exam) {
        await updateExam({ id: exam._id, body: data }).unwrap();
        showSuccess('Examination updated successfully');
      } else {
        await createExam(data).unwrap();
        showSuccess('Examination created successfully');
      }
      onClose();
    } catch (err: unknown) {
      showError((err as { data?: { error?: string } })?.data?.error || 'Failed to create examination');
    }
  };

  const termOptions = [
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Quarterly', value: 'QUARTERLY' },
    { label: 'Mid Term', value: 'MID_TERM' },
    { label: 'Final Exam', value: 'FINAL' },
  ];

  const statusOptions = [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Scheduled', value: 'SCHEDULED' },
  ];

  return (
    <>
      <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid var(--color-border-default)', pb: 2 }}>
        {exam ? 'Edit Examination' : 'Create New Examination'}
      </DialogTitle>
      <DialogContent sx={{ pt: 10, pb: 2 }}>
        <Grid container sx={{
          paddingTop: 2,
        }} spacing={2.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="name"
              control={control}
              label="Exam Name (e.g. Unit Test 1, Half Yearly)"
              required
              disabled={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="academicYear"
              control={control}
              label="Academic Year"
              required
              disabled={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormSelectField
              name="term"
              control={control}
              label="Type"
              options={termOptions}
              required
              disabled={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="startDate"
              control={control}
              label="Start Date"
              type="date"
              required
              disabled={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="endDate"
              control={control}
              label="End Date"
              type="date"
              required
              disabled={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormSelectField
              name="status"
              control={control}
              label="Status"
              options={statusOptions}
              disabled={isLoading}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid var(--color-border-default)', pt: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmitForm)} variant="contained" color="primary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          {isLoading ? 'Saving...' : exam ? 'Update Exam' : 'Create Exam'}
        </Button>
      </DialogActions>
    </>
  );
}

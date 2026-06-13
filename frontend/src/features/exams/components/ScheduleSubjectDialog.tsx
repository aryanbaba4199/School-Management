import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { DialogTitle, DialogContent, DialogActions, Button, Grid } from '@mui/material';
import { FormTextField, FormAutocompleteField } from '@common/Forms';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { useCreateExamScheduleMutation, useUpdateExamScheduleMutation } from '@api/examApi';
import type { IExamSchedule } from '@api/examApi';
import { useGetSubjectsQuery } from '@api/subjectsApi';
import dayjs from 'dayjs';

interface ScheduleSubjectDialogProps {
  onClose: () => void;
  examId: string;
  classId: string;
  sectionId: string;
  schedule?: IExamSchedule;
}

interface ScheduleFormData {
  subjectId: string;
  examDate: string;
  startTime: string;
  endTime: string;
  maxMarks: number;
  passMarks: number;
  room?: string;
}

export function ScheduleSubjectDialog({ onClose, examId, classId, sectionId, schedule }: ScheduleSubjectDialogProps) {
  const { showSuccess, showError } = useNotifier();
  const [createSchedule, { isLoading: isCreating }] = useCreateExamScheduleMutation();
  const [updateSchedule, { isLoading: isUpdating }] = useUpdateExamScheduleMutation();
  const isLoading = isCreating || isUpdating;
  const { data: subjectsRes, isLoading: subjectsLoading } = useGetSubjectsQuery();

  const subjects = subjectsRes?.data || [];
  const subjectOptions = subjects.map(s => ({
    label: `${s.name} (${s.code})`,
    value: s._id,
  }));

  const { control, handleSubmit, reset } = useForm<ScheduleFormData>({
    defaultValues: {
      subjectId: '',
      examDate: '',
      startTime: '',
      endTime: '',
      maxMarks: 100,
      passMarks: 40,
      room: '',
    },
  });

  useEffect(() => {
    if (schedule) {
      reset({
        subjectId: schedule.subjectId._id,
        examDate: dayjs(schedule.examDate).format('YYYY-MM-DD'),
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        maxMarks: schedule.maxMarks,
        passMarks: schedule.passMarks,
        room: schedule.room || '',
      });
    } else {
      reset({
        subjectId: '',
        examDate: '',
        startTime: '',
        endTime: '',
        maxMarks: 100,
        passMarks: 40,
        room: '',
      });
    }
  }, [reset, schedule]);

  const onSubmitForm = async (data: ScheduleFormData) => {
    try {
      if (schedule) {
        await updateSchedule({
          id: schedule._id,
          body: { ...data } as unknown as Partial<IExamSchedule>,
        }).unwrap();
        showSuccess('Subject schedule updated successfully');
      } else {
        await createSchedule({
          examId,
          classId: classId,
          sectionId: sectionId,
          ...data,
        } as unknown as Record<string, unknown>).unwrap();
        showSuccess('Subject scheduled successfully');
      }
      onClose();
    } catch (err: unknown) {
      showError((err as { data?: { error?: string } })?.data?.error || 'Failed to save subject schedule');
    }
  };

  return (
    <>
      <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid var(--color-border-default)', pb: 2 }}>
        {schedule ? 'Update Subject Schedule' : 'Schedule Subject'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12 }}>
            <FormAutocompleteField
              name="subjectId"
              control={control}
              label="Select Subject"
              options={subjectOptions}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="examDate"
              control={control}
              label="Exam Date"
              type="date"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="startTime"
              control={control}
              label="Start Time"
              type="time"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="endTime"
              control={control}
              label="End Time"
              type="time"
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="maxMarks"
              control={control}
              label="Max Marks"
              type="number"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="passMarks"
              control={control}
              label="Passing Marks"
              type="number"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormTextField
              name="room"
              control={control}
              label="Room / Hall"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid var(--color-border-default)', pt: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmitForm)} variant="contained" color="primary" sx={{ textTransform: 'none' }} disabled={isLoading || subjectsLoading}>
          {isLoading ? 'Saving...' : schedule ? 'Update' : 'Schedule'}
        </Button>
      </DialogActions>
    </>
  );
}

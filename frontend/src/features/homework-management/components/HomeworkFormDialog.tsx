import React, { useEffect } from 'react';
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
import { homeworkSchema } from '../forms/homework.schema';
import type { HomeworkFormValues } from '../forms/homework.schema';
import { useGetClassesQuery } from '../../../api/classesApi';
import { useGetSubjectsQuery } from '../../../api/subjectsApi';
import { useCreateHomeworkMutation } from '../../../api/homeworkApi';
import { AttachmentList } from '../../../common/components';
import { FormTextField, FormSelectField } from '../../../common/Forms';
import { useNotifier } from '../../../common/Notifier/NotifierProvider';

interface HomeworkFormDialogProps {
  onClose: () => void;
}

export const HomeworkFormDialog: React.FC<HomeworkFormDialogProps> = ({ onClose }) => {
  const { showSuccess, showError } = useNotifier();
  const { data: classesData, isLoading: isLoadingClasses } = useGetClassesQuery();
  const { data: subjectsData, isLoading: isLoadingSubjects } = useGetSubjectsQuery();
  const [createHomework, { isLoading: isCreating }] = useCreateHomeworkMutation();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
  } = useForm<HomeworkFormValues>({
    resolver: yupResolver(homeworkSchema) as Resolver<HomeworkFormValues>,
    defaultValues: {
      classId: '',
      sectionId: '',
      subjectId: '',
      title: '',
      description: '',
      dueDate: '',
      attachments: [],
    },
  });

  const selectedClassId = watch('classId');
  const selectedClass = classesData?.data?.find((c) => c._id === selectedClassId);

  useEffect(() => {
    setValue('sectionId', '');
  }, [selectedClassId, setValue]);

  const onSubmit = async (data: HomeworkFormValues) => {
    try {
      await createHomework(data).unwrap();
      showSuccess('Homework created successfully');
      reset();
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      showError(error?.data?.message || 'Failed to create homework');
    }
  };

  const classOptions = (classesData?.data || []).map((c) => ({ label: c.name, value: c._id }));
  const sectionOptions = (selectedClass?.sections || []).map((s) => ({ label: s.name, value: s._id }));
  const subjectOptions = (subjectsData?.data || []).map((s) => ({ label: s.name, value: s._id }));
  const attachments = watch('attachments') || [];

  return (
    <>
      <DialogTitle>Create Homework</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mt: 1 }}>
          <form noValidate>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormSelectField
                  name="classId"
                  control={control}
                  label="Class"
                  options={classOptions}
                  disabled={isLoadingClasses || isCreating}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormSelectField
                  name="sectionId"
                  control={control}
                  label="Section"
                  options={sectionOptions}
                  disabled={!selectedClass || isCreating}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormSelectField
                  name="subjectId"
                  control={control}
                  label="Subject"
                  options={subjectOptions}
                  disabled={isLoadingSubjects || isCreating}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormTextField
                  name="title"
                  control={control}
                  label="Title"
                  disabled={isCreating}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormTextField
                  name="description"
                  control={control}
                  label="Description / Instructions"
                  multiline
                  rows={4}
                  disabled={isCreating}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  name="dueDate"
                  control={control}
                  label="Due Date"
                  type="datetime-local"
                  disabled={isCreating}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  name="maxMarks"
                  control={control}
                  label="Max Marks (Optional)"
                  type="number"
                  disabled={isCreating}
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
        <Button onClick={onClose} disabled={isCreating}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create Homework'}
        </Button>
      </DialogActions>
    </>
  );
};

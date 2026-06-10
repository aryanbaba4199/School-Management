import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DialogTitle, DialogContent, DialogActions, Button, Grid, Box, CircularProgress } from '@mui/material';
import { FormTextField, FormSelectField } from '@common/Forms';
import { useGetUsersQuery } from '../../../../api/usersApi';
import { useGetSchoolsQuery } from '../../../../api/schoolsApi';
import { useAuth } from '@common/hooks/useAuth';
import { subjectSchema } from '../schema/subject.schema';
import { useGetSubjectByIdQuery } from '../../../../api/subjectsApi';
import type { SubjectFormData } from '../types/subjects.types';

interface SubjectFormDialogProps {
  onClose: () => void;
  onSubmit: (data: { name: string; code: string; teacherIds?: string[]; schoolId?: string }) => void;
  subjectId?: string;
  isLoading?: boolean;
}

export function SubjectFormDialog({ onClose, onSubmit, subjectId, isLoading = false }: SubjectFormDialogProps) {
  const { data: subjectRes, isLoading: isSubjectLoading } = useGetSubjectByIdQuery(subjectId!, { skip: !subjectId });
  const subject = subjectRes?.success ? subjectRes.data : null;

  const { user } = useAuth();
  const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';

  const { data: teachersRes } = useGetUsersQuery({ role: 'TEACHER', limit: 100 });
  const teacherOptions = (teachersRes?.success ? teachersRes.data : []).map((t) => ({
    value: t._id,
    label: `${t.name} (${t.userCode})`,
  }));

  const { data: schoolsRes } = useGetSchoolsQuery(undefined, { skip: !isSuperAdmin });
  const schoolOptions = (schoolsRes?.success ? schoolsRes.data : []).map((s) => ({
    value: s._id,
    label: `${s.name} (${s.code})`,
  }));

  const { handleSubmit, control, reset } = useForm<SubjectFormData>({
    resolver: yupResolver(subjectSchema) as unknown as Resolver<SubjectFormData>,
    defaultValues: {
      name: '',
      code: '',
      teacherIds: [],
      schoolId: '',
    },
  });

  useEffect(() => {
    if (subject) {
      reset({
        name: subject.name,
        code: subject.code,
        teacherIds: subject.teacherIds?.map((t) => (typeof t === 'object' ? t._id : t)) || [],
        schoolId: typeof subject.schoolId === 'object' ? (subject.schoolId as { _id: string })._id : subject.schoolId || '',
      });
    }
  }, [subject, reset]);

  const onFormSubmit = (formData: SubjectFormData) => {
    onSubmit({
      name: formData.name,
      code: formData.code.toUpperCase(),
      teacherIds: formData.teacherIds || [],
      ...(isSuperAdmin && formData.schoolId ? { schoolId: formData.schoolId } : {}),
    });
  };

  if (isSubjectLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, minHeight: 300, alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid var(--color-border-default)', pb: 2 }}>
        {subjectId ? 'Edit Subject Details' : 'Add New Subject'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2.5}>
            {isSuperAdmin && (
              <Grid size={{ xs: 12 }}>
                <FormSelectField
                  name="schoolId"
                  control={control}
                  label="School *"
                  options={schoolOptions}
                  disabled={isLoading}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <FormTextField name="name" control={control} label="Subject Name (e.g. Mathematics)" required disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormTextField name="code" control={control} label="Subject Code (e.g. MATH101)" required disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormSelectField name="teacherIds" control={control} label="Assigned Teachers" options={teacherOptions} multiple disabled={isLoading} />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid var(--color-border-default)', pt: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onFormSubmit)} variant="contained" color="primary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          {subjectId ? 'Save Changes' : 'Add Subject'}
        </Button>
      </DialogActions>
    </>
  );
}

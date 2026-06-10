import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DialogTitle, DialogContent, DialogActions, Button, Grid, Box } from '@mui/material';

import { FormTextField, FormSelectField } from '@common/Forms';
import { useGetSchoolsQuery } from '../../../../api/schoolsApi';
import { useAuth } from '@common/hooks/useAuth';
import { classSchema } from '../schema/class.schema';
import type { ClassFormData, IClass } from '../types/classes.types';

interface ClassFormDialogProps {
  onClose: () => void;
  onSubmit: (data: { name: string; sections: string[]; schoolId?: string }) => void;
  classObj?: IClass | null;
  isLoading?: boolean;
}

export function ClassFormDialog({ onClose, onSubmit, classObj, isLoading = false }: ClassFormDialogProps) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';

  const { data: schoolsRes } = useGetSchoolsQuery(undefined, { skip: !isSuperAdmin });
  const schoolOptions = (schoolsRes?.success ? schoolsRes.data : []).map((s) => ({
    value: s._id,
    label: `${s.name} (${s.code})`,
  }));

  const { handleSubmit, control, reset } = useForm<ClassFormData>({
    resolver: yupResolver(classSchema) as unknown as Resolver<ClassFormData>,
    defaultValues: {
      name: '',
      sections: 'A',
      schoolId: '',
    },
  });

  useEffect(() => {
    if (classObj) {
      reset({
        name: classObj.name,
        sections: classObj.sections?.map((s) => s.name).join(', ') || '',
        schoolId: typeof classObj.schoolId === 'object' ? (classObj.schoolId as { _id: string })._id : classObj.schoolId || '',
      });
    }
  }, [classObj, reset]);

  const onFormSubmit = (formData: ClassFormData) => {
    const sectionList = formData.sections
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onSubmit({
      name: formData.name,
      sections: sectionList,
      ...(isSuperAdmin && formData.schoolId ? { schoolId: formData.schoolId } : {}),
    });
  };

  return (
    <>
      <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid var(--color-border-default)', pb: 2 }}>
        {classObj ? 'Edit Class Details' : 'Add New Class'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2.5}>
            {isSuperAdmin && (
              <Grid size={{ xs: 12 }}>
                <FormSelectField
                  name="schoolId"
                  control={control}
                  label="Institute *"
                  options={schoolOptions}
                  disabled={isLoading}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <FormTextField name="name" control={control} label="Class Name (e.g. Class 10)" required disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormTextField name="sections" control={control} label="Sections (comma-separated, e.g. A, B, C)" required disabled={isLoading} />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid var(--color-border-default)', pt: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onFormSubmit)} variant="contained" color="primary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          {classObj ? 'Save Changes' : 'Add Class'}
        </Button>
      </DialogActions>
    </>
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DialogTitle, DialogContent, DialogActions, Button, Grid, Box } from '@mui/material';
import { FormTextField, FormSelectField } from '@common/Forms';
import { useGetStatesQuery, useGetDistrictsQuery } from '../../../../api/masterApi';
import { useGetSubjectsQuery } from '../../../../api/subjectsApi';
import { useGetSchoolsQuery } from '../../../../api/schoolsApi';
import { useAuth } from '@common/hooks/useAuth';
import { teacherSchema, type TeacherFormData } from '../schema/teacher.schema';
import type { ISchoolUser } from '../../../../api/usersApi';

interface TeacherFormDialogProps {
  onClose: () => void;
  onSubmit: (data: Partial<ISchoolUser> & { password?: string }) => void;
  user?: ISchoolUser | null;
  isLoading?: boolean;
}

export function TeacherFormDialog({ onClose, onSubmit, user, isLoading = false }: TeacherFormDialogProps) {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role?.name === 'SUPER_ADMIN';

  const { data: schoolsRes } = useGetSchoolsQuery(undefined, { skip: !isSuperAdmin });
  const schoolOptions = (schoolsRes?.success ? schoolsRes.data : []).map((s) => ({
    value: s._id,
    label: `${s.name} (${s.code})`,
  }));

  const { handleSubmit, control, watch, reset } = useForm<TeacherFormData>({
    resolver: yupResolver(teacherSchema) as unknown as Resolver<TeacherFormData>,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      userCode: '',
      phone: '',
      subjects: [],
      schoolId: '',
      address: {
        street: '',
        state: '',
        district: '',
        pincode: undefined,
      },
    },
  });

  const selectedState = watch('address.state');

  const { data: statesRes } = useGetStatesQuery('');
  const states = statesRes?.success ? statesRes.data : [];

  const { data: districtsRes } = useGetDistrictsQuery(selectedState || '');
  const districts = districtsRes?.success ? districtsRes.data : [];

  const { data: subjectsRes } = useGetSubjectsQuery();
  const subjectOptions = (subjectsRes?.success ? subjectsRes.data : []).map((s) => ({
    value: s._id,
    label: `${s.name} (${s.code})`,
  }));

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        userCode: user.userCode,
        phone: user.phone || '',
        subjects: user.subjects?.map((s) => (typeof s === 'object' ? s._id : s)) || [],
        schoolId: typeof user.schoolId === 'object' ? user.schoolId?._id : user.schoolId || '',
        address: {
          street: user.address?.street || '',
          state: typeof user.address?.state === 'object' ? user.address.state._id : user.address?.state || '',
          district: typeof user.address?.district === 'object' ? user.address.district._id : user.address?.district || '',
          pincode: user.address?.pincode || undefined,
        },
      });
    }
  }, [user, reset]);

  const mapToOpts = (items: { _id: string; name: string }[]) => items.map((i) => ({ value: i._id, label: i.name }));

  const onFormSubmit = (formData: TeacherFormData) => {
    const submitPayload: Partial<ISchoolUser> & { password?: string } = {
      name: formData.name,
      email: formData.email,
      userCode: formData.userCode,
      phone: formData.phone || undefined,
      subjects: formData.subjects || undefined,
      schoolId: isSuperAdmin && formData.schoolId ? formData.schoolId : undefined,
      address: formData.address
        ? {
            street: formData.address.street || undefined,
            state: formData.address.state || undefined,
            district: formData.address.district || undefined,
            pincode: formData.address.pincode || undefined,
          }
        : undefined,
      role: {
        name: 'TEACHER',
        access: [],
      },
    };
    if (formData.password) {
      submitPayload.password = formData.password;
    }
    onSubmit(submitPayload);
  };

  return (
    <>
      <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid var(--color-border-default)', pb: 2 }}>
        {user ? 'Edit Tutors Details' : 'Add New Teacher'}
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="name" control={control} label="Teacher Name" required disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="email" control={control} label="Email Address" required disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="password" control={control} label={user ? 'Password (Leave blank to keep same)' : 'Password'} type="password" required={!user} disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="userCode" control={control} label="Employee ID" required disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="phone" control={control} label="Phone Number" disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormSelectField name="subjects" control={control} label="Subjects" options={subjectOptions} multiple disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 12 }}>
              <FormTextField name="address.street" control={control} label="Street Address" disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormSelectField name="address.state" control={control} label="State" options={mapToOpts(states)} disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormSelectField name="address.district" control={control} label="District" options={mapToOpts(districts)} disabled={!selectedState || isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormTextField name="address.pincode" control={control} label="Pincode" type="number" disabled={isLoading} />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid var(--color-border-default)', pt: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onFormSubmit)} variant="contained" color="primary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          {user ? 'Save Changes' : 'Add Teacher'}
        </Button>
      </DialogActions>
    </>
  );
}

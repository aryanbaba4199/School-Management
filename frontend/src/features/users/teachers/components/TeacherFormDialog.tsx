import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DialogTitle, DialogContent, DialogActions, Button, Grid, Box } from '@mui/material';
import { FormTextField, FormSelectField } from '@common/Forms';
import { useGetStatesQuery, useGetDistrictsQuery } from '../../../../api/masterApi';
import { teacherSchema, type TeacherFormData } from '../schema/teacher.schema';
import { SUBJECT_MAPPING } from './teacherColumns';
import type { ISchoolUser } from '../../../../api/usersApi';

interface TeacherFormDialogProps {
  onClose: () => void;
  onSubmit: (data: Partial<ISchoolUser> & { password?: string }) => void;
  user?: ISchoolUser | null;
  isLoading?: boolean;
}

const SUBJECT_OPTIONS = Object.entries(SUBJECT_MAPPING).map(([value, label]) => ({ value, label }));

export function TeacherFormDialog({ onClose, onSubmit, user, isLoading = false }: TeacherFormDialogProps) {
  const { handleSubmit, control, watch, reset } = useForm<TeacherFormData>({
    resolver: yupResolver(teacherSchema) as unknown as Resolver<TeacherFormData>,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      userCode: '',
      phone: '',
      subjects: [],
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

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        userCode: user.userCode,
        phone: user.phone || '',
        subjects: user.subjects || [],
        address: {
          street: user.address?.street || '',
          state: typeof user.address?.state === 'object' ? user.address.state._id : user.address?.state || '',
          district: typeof user.address?.district === 'object' ? user.address.district._id : user.address?.district || '',
          pincode: user.address?.pincode || undefined,
        },
      });
    }
  }, [user, reset]);

  const mapToOpts = (items: { _id: string; name: string }[]) => items.map(i => ({ value: i._id, label: i.name }));

  const onFormSubmit = (formData: TeacherFormData) => {
    const submitPayload: Partial<ISchoolUser> & { password?: string } = {
      name: formData.name,
      email: formData.email,
      userCode: formData.userCode,
      phone: formData.phone || undefined,
      subjects: formData.subjects || undefined,
      address: formData.address ? {
        street: formData.address.street || undefined,
        state: formData.address.state || undefined,
        district: formData.address.district || undefined,
        pincode: formData.address.pincode || undefined,
      } : undefined,
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
        {user ? 'Edit Teacher Details' : 'Add New Teacher'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2.5}>
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
              <FormSelectField name="subjects" control={control} label="Subjects" options={SUBJECT_OPTIONS} multiple disabled={isLoading} />
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

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DialogTitle, DialogContent, DialogActions, Button, Grid, Box, CircularProgress } from '@mui/material';
import { FormTextField, FormSelectField } from '@common/Forms';
import { useGetUsersQuery, useGetUserByIdQuery } from '@api/usersApi';
import { useGetStatesQuery, useGetDistrictsQuery } from '@api/masterApi';
import { parentSchema, type ParentFormData } from '../schema/parent.schema';
import type { ISchoolUser } from '@api/usersApi';

interface ParentFormDialogProps {
  onClose: () => void;
  onSubmit: (data: Partial<ISchoolUser> & { password?: string }) => void;
  userId?: string;
  isLoading?: boolean;
}

export function ParentFormDialog({ onClose, onSubmit, userId, isLoading = false }: ParentFormDialogProps) {
  const { data: userRes, isLoading: isUserLoading } = useGetUserByIdQuery(userId!, { skip: !userId });
  const user = userRes?.success ? userRes.data : null;
  const { data: studentsRes } = useGetUsersQuery({ role: 'STUDENT' });
  const students = studentsRes?.success ? studentsRes.data : [];

  const { handleSubmit, control, watch, reset } = useForm<ParentFormData>({
    resolver: yupResolver(parentSchema) as unknown as Resolver<ParentFormData>,
    defaultValues: {
      name: '',
      email: '',
      password: '',
      userCode: '',
      phone: '',
      childrenIds: [],
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
        childrenIds: user.childrenIds?.map(c => typeof c === 'object' ? c._id : String(c)) || [],
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

  const onFormSubmit = (formData: ParentFormData) => {
    const submitPayload: Partial<ISchoolUser> & { password?: string } = {
      name: formData.name,
      email: formData.email,
      userCode: formData.userCode,
      phone: formData.phone || undefined,
      childrenIds: formData.childrenIds || undefined,
      address: formData.address ? {
        street: formData.address.street || undefined,
        state: formData.address.state || undefined,
        district: formData.address.district || undefined,
        pincode: formData.address.pincode || undefined,
      } : undefined,
      role: {
        name: 'PARENT',
        access: [],
      },
    };
    if (formData.password) {
      submitPayload.password = formData.password;
    }
    onSubmit(submitPayload);
  };

  if (isUserLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, minHeight: 300, alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid var(--color-border-default)', pb: 2 }}>
        {userId ? 'Edit Parent Details' : 'Add New Parent'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="name" control={control} label="Parent/Guardian Name" required disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="email" control={control} label="Email Address" required disabled={isLoading} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="password" control={control} label={userId ? 'Password (Leave blank)' : 'Password'} type="password" disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="userCode" control={control} label="Guardian ID" required disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="phone" control={control} label="Phone Number" disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormSelectField name="childrenIds" control={control} label="Linked Children (Students)" options={students.map(s => ({ value: s._id, label: `${s.name} (${s.userCode})` }))} multiple disabled={isLoading} />
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
          {userId ? 'Save Changes' : 'Add Parent'}
        </Button>
      </DialogActions>
    </>
  );
}

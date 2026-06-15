import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DialogTitle, DialogContent, DialogActions, Button, Box, CircularProgress } from '@mui/material';
import { FormTextField, FormAutocompleteField } from '@common/Forms';
import { useGetUserByIdQuery } from '@api/usersApi';
import { useGetStatesQuery, useGetDistrictsQuery } from '@api/masterApi';
import { useGetSchoolsQuery } from '@api/schoolsApi';
import { schoolAdminSchema, type SchoolAdminFormData } from '../schema/school-admin.schema';
import type { ISchoolUser } from '@api/usersApi';

interface SchoolAdminFormDialogProps {
  onClose: () => void;
  onSubmit: (data: Partial<ISchoolUser> & { password?: string }) => void;
  userId?: string;
  isLoading?: boolean;
}

export function SchoolAdminFormDialog({ onClose, onSubmit, userId, isLoading = false }: SchoolAdminFormDialogProps) {
  const { data: userRes, isLoading: isUserLoading } = useGetUserByIdQuery(userId!, { skip: !userId });
  const user = userRes?.success ? userRes.data : null;

  const { handleSubmit, control, watch, reset } = useForm<SchoolAdminFormData>({
    resolver: yupResolver(schoolAdminSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      userCode: '',
      phone: '',
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

  const { data: schoolsRes } = useGetSchoolsQuery();
  const schools = schoolsRes?.success ? schoolsRes.data : [];

  const { data: statesRes } = useGetStatesQuery('');
  const states = statesRes?.success ? statesRes.data : [];

  const { data: districtsRes } = useGetDistrictsQuery(selectedState || '');
  const districts = districtsRes?.success ? districtsRes.data : [];

  const mapToOpts = (items: { _id: string; name: string }[]) => items.map(i => ({ value: i._id, label: i.name }));

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        userCode: user.userCode,
        phone: user.phone || '',
        schoolId: typeof user.schoolId === 'object' ? user.schoolId._id : user.schoolId || '',
        address: {
          street: user.address?.street || '',
          state: typeof user.address?.state === 'object' ? user.address.state._id : user.address?.state || '',
          district: typeof user.address?.district === 'object' ? user.address.district._id : user.address?.district || '',
          pincode: user.address?.pincode || undefined,
        },
      });
    }
  }, [user, reset]);

  const onFormSubmit = (formData: SchoolAdminFormData) => {
    const submitPayload: Partial<ISchoolUser> & { password?: string } = {
      name: formData.name,
      email: formData.email,
      userCode: formData.userCode,
      phone: formData.phone || undefined,
      schoolId: formData.schoolId,
      address: formData.address ? {
        street: formData.address.street || undefined,
        state: formData.address.state || undefined,
        district: formData.address.district || undefined,
        pincode: formData.address.pincode || undefined,
      } : undefined,
      role: {
        name: 'SCHOOL_ADMIN',
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
        {userId ? 'Edit School Admin' : 'Add New School Admin'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2.5 }}>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <FormTextField name="name" control={control} label="Full Name" required disabled={isLoading} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <FormTextField name="email" control={control} label="Email Address" required disabled={isLoading} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <FormTextField name="userCode" control={control} label="Admin Code" required disabled={isLoading} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <FormTextField name="phone" control={control} label="Phone Number" disabled={isLoading} />
            </Box>
            <Box sx={{ gridColumn: 'span 12' }}>
              <FormAutocompleteField
                name="schoolId"
                control={control}
                label="Assign to School"
                options={mapToOpts(schools)}
                required
                disabled={isLoading}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <FormTextField name="address.street" control={control} label="Street Address" disabled={isLoading} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <FormAutocompleteField name="address.state" control={control} label="State" options={mapToOpts(states)} disabled={isLoading} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <FormAutocompleteField name="address.district" control={control} label="District" options={mapToOpts(districts)} disabled={!selectedState || isLoading} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
              <FormTextField name="address.pincode" control={control} label="Pincode" type="number" disabled={isLoading} />
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid var(--color-border-default)', pt: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onFormSubmit)} variant="contained" color="primary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          {userId ? 'Save Changes' : 'Add Admin'}
        </Button>
      </DialogActions>
    </>
  );
}

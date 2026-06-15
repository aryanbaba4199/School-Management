import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Typography } from '@mui/material';
import { FormTextField, FormAutocompleteField } from '@common/Forms';
import { profileSchema, type ProfileFormData } from '../schema/profile.schema';
import { useGetStatesQuery, useGetDistrictsQuery } from '@api/masterApi';
import type { ISchoolUser } from '@api/usersApi';

interface ProfileFormProps {
  user: ISchoolUser;
  onSubmit: (data: ProfileFormData) => void;
  isLoading?: boolean;
}

export function ProfileForm({ user, onSubmit, isLoading }: ProfileFormProps) {
  const { handleSubmit, control, watch, reset } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
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

  const mapToOpts = (items: { _id: string; name: string }[]) => items.map(i => ({ value: i._id, label: i.name }));

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          state: typeof user.address?.state === 'object' ? user.address.state._id : user.address?.state || '',
          district: typeof user.address?.district === 'object' ? user.address.district._id : user.address?.district || '',
          pincode: user.address?.pincode || undefined,
        },
      });
    }
  }, [user, reset]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Personal Information</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
        <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
          <FormTextField name="name" control={control} label="Full Name" disabled={isLoading} required />
        </Box>
        <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
          <FormTextField name="email" control={control} label="Email Address" disabled={isLoading} required />
        </Box>

        <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
          <FormTextField name="phone" control={control} label="Phone Number" disabled={isLoading} />
        </Box>
        <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
          <FormTextField name="address.street" control={control} label="Street Address" disabled={isLoading} />
        </Box>

        <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
          <FormAutocompleteField name="address.state" control={control} label="State" options={mapToOpts(states)} disabled={isLoading} />
        </Box>
        <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
          <FormAutocompleteField name="address.district" control={control} label="District" options={mapToOpts(districts)} disabled={!selectedState || isLoading} />
        </Box>
        
        <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
          <FormTextField name="address.pincode" control={control} label="Pincode" type="number" disabled={isLoading} />
        </Box>
      </Box>
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}

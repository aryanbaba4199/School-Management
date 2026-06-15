import { useEffect } from 'react';
import { Box, Typography, Button, Paper, Divider, Alert, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { FormTextField, FormSelectField } from '@common/Forms';
import { LogoUpload } from '../components/LogoUpload';
import { useGetSchoolByIdQuery, useUpdateSchoolMutation } from '@api/schoolsApi';
import { useAuth } from '@common/hooks/useAuth';
import { useNotifier } from '@common/Notifier/NotifierProvider';

export function SchoolSettingsPage() {
  const { user } = useAuth();
  const schoolId = typeof user?.schoolId === 'object' ? (user.schoolId as { _id: string })._id : user?.schoolId;
  const { data: schoolRes, isLoading } = useGetSchoolByIdQuery(schoolId!, { skip: !schoolId });
  const [updateSchool, { isLoading: isUpdating }] = useUpdateSchoolMutation();
  const notifier = useNotifier();

  const school = schoolRes?.success ? schoolRes.data : null;

  const { handleSubmit, control, reset, watch, setValue } = useForm({
    defaultValues: {
      name: '', email: '', phone: '', address: '', logo: '',
      shift: '', startTime: '', endTime: '', admissionFee: undefined as number | undefined
    }
  });

  useEffect(() => {
    if (school) {
      reset({
        name: school.name || '',
        email: school.email || '',
        phone: school.phone || '',
        address: school.address || '',
        logo: school.logo || '',
        shift: school.shift || '',
        startTime: school.startTime || '',
        endTime: school.endTime || '',
        admissionFee: school.admissionFee,
      });
    }
  }, [school, reset]);

  const onSubmit = async (data: Record<string, unknown>) => {
    if (!schoolId) return;
    try {
      await updateSchool({ id: schoolId, body: data }).unwrap();
      notifier.showSuccess('School profile updated successfully!');
    } catch (err: unknown) {
      notifier.showError((err as { data?: { message?: string } })?.data?.message || 'Failed to update school profile.');
    }
  };

  const logoValue = watch('logo');

  if (isLoading) {
    return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
  }

  if (!school) {
    return <Alert severity="error">Failed to load school profile or unauthorized.</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>School Profile Settings</Typography>

      <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid var(--color-border-default)', boxShadow: 'none' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ mb: 4 }}>
            <LogoUpload 
              logoUrl={logoValue} 
              onChange={(val) => setValue('logo', val, { shouldDirty: true })} 
              disabled={isUpdating} 
            />
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>General Information</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <FormTextField name="name" control={control} label="School Name" disabled={isUpdating} required />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <FormTextField name="email" control={control} label="School Email" disabled={isUpdating} required />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <FormTextField name="phone" control={control} label="Phone Number" disabled={isUpdating} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
              <FormTextField name="address" control={control} label="Address" disabled={isUpdating} />
            </Box>
          </Box>

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, mt: 4 }}>Operations & Timings</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
              <FormSelectField 
                name="shift" 
                control={control} 
                label="Shift Type" 
                options={[
                  { value: 'Morning Shift', label: 'Morning Shift' },
                  { value: 'Day Shift', label: 'Day Shift' },
                  { value: 'Evening Shift', label: 'Evening Shift' }
                ]}
                disabled={isUpdating} 
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
              <FormTextField name="startTime" control={control} label="Start Time" type="time" disabled={isUpdating} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
              <FormTextField name="endTime" control={control} label="End Time" type="time" disabled={isUpdating} />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 4' } }}>
              <FormTextField name="admissionFee" control={control} label="Admission Fee Amount" type="number" disabled={isUpdating} />
            </Box>
          </Box>

          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isUpdating}
              startIcon={isUpdating && <CircularProgress size={16} />}
            >
              Save Changes
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, Typography } from '@mui/material';
import { FormTextField } from '@common/Forms';
import { passwordChangeSchema, type PasswordChangeFormData } from '../schema/profile.schema';

interface PasswordChangeFormProps {
  onSubmit: (data: PasswordChangeFormData) => void;
  isLoading?: boolean;
}

export function PasswordChangeForm({ onSubmit, isLoading }: PasswordChangeFormProps) {
  const { handleSubmit, control, reset } = useForm<PasswordChangeFormData>({
    resolver: yupResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleFormSubmit = (data: PasswordChangeFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Change Password</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          <FormTextField name="currentPassword" control={control} label="Current Password" type="password" disabled={isLoading} required />
        </Box>
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          <FormTextField name="newPassword" control={control} label="New Password" type="password" disabled={isLoading} required />
        </Box>
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          <FormTextField name="confirmPassword" control={control} label="Confirm Password" type="password" disabled={isLoading} required />
        </Box>
      </Box>
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
          Update Password
        </Button>
      </Box>
    </Box>
  );
}

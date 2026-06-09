import type { Control, FieldErrors } from 'react-hook-form';
import { Grid, Typography, Box } from '@mui/material';
import { FormTextField } from '@common/Forms';
import type { SchoolFormData } from '../../schema/school.schema';
import { useLazyGetDraftQuery } from '../../../../api/schoolsApi';
import { useNotifier } from '@common/Notifier/NotifierProvider';

interface StepCredentialsProps {
  control: Control<SchoolFormData>;
  errors: FieldErrors<SchoolFormData>;
  onDraftLoaded: (draftData: any) => void;
}

export function StepCredentials({ control, errors, onDraftLoaded }: StepCredentialsProps) {
  const [triggerGetDraft, { isFetching }] = useLazyGetDraftQuery();
  const notifier = useNotifier();

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value.trim();
    if (!email || errors.adminEmail) return;

    try {
      const res = await triggerGetDraft(email).unwrap();
      if (res.success && res.data) {
        notifier.showSuccess('A saved draft was found for this email. Resuming your progress.');
        onDraftLoaded(res.data);
      }
    } catch (err) {
      // Ignore errors silently as it just means no draft was found
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        Step 1: Administrator Credentials
      </Typography>
      <Grid container spacing={2}>
        <Grid size={12}>
          <FormTextField
            name="adminName"
            control={control}
            label="Administrator Name"
            required
          />
        </Grid>
        <Grid size={12}>
          <FormTextField
            name="adminEmail"
            control={control}
            label="Administrator Email Address"
            type="email"
            required
            onBlur={handleEmailBlur}
            disabled={isFetching}
          />
        </Grid>
        <Grid size={12}>
          <FormTextField
            name="adminPassword"
            control={control}
            label="Administrator Password"
            type="password"
            required
          />
        </Grid>
      </Grid>
    </Box>
  );
}

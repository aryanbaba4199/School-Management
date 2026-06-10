import { useWatch, type Control } from 'react-hook-form';
import { Grid, Typography, Box } from '@mui/material';
import { FormSelectField, FormTextField, FormCheckboxField } from '@common/Forms';
import type { SchoolFormData } from '../../schema/school.schema';
import type { ISubscriptionPlan } from '../../../../app-management/plan-management/types/plans.types';

interface StepSubscriptionProps {
  control: Control<SchoolFormData>;
  plans: ISubscriptionPlan[];
}

export function StepSubscription({ control, plans }: StepSubscriptionProps) {
  const mapToOptions = (opts: ISubscriptionPlan[]) => opts.map(o => ({ value: o._id, label: o.name }));
  
  const selectedPlanId = useWatch({ control, name: 'subscriptionPlan' });
  const selectedPlan = plans.find(p => p._id === selectedPlanId);

  const getBillingOptions = () => {
    if (!selectedPlan || !selectedPlan.price) {
      return [
        { value: 'MONTHLY', label: 'Monthly' },
        { value: 'YEARLY', label: 'Yearly' }
      ];
    }
    return [
      { value: 'MONTHLY', label: `Monthly (₹${selectedPlan.price.monthly.toLocaleString('en-IN')}/mo)` },
      { value: 'YEARLY', label: `Yearly (₹${selectedPlan.price.yearly.toLocaleString('en-IN')}/yr)` }
    ];
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        Step 3: Subscription & Feature Setup
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormSelectField name="subscriptionPlan" control={control} label="Plan" options={mapToOptions(plans)} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormSelectField 
            name="billingCycle" 
            control={control} 
            label="Billing Cycle" 
            options={getBillingOptions()} 
            required 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField name="maxStudents" control={control} label="Capacity Limit" type="number" required />
        </Grid>
        <Grid size={12}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Enable Features
          </Typography>
          <Grid container spacing={1}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormCheckboxField name="settings.attendanceEnabled" control={control} label="RFID Attendance" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormCheckboxField name="settings.onlineExamEnabled" control={control} label="Online Exams" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormCheckboxField name="settings.aiAnalyticsEnabled" control={control} label="AI Recommendations" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <FormCheckboxField name="settings.parentAppEnabled" control={control} label="Parent Mobile App" />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

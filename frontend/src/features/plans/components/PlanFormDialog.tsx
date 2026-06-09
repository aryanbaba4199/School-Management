import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DialogTitle, DialogContent, DialogActions, Button, Grid, Box } from '@mui/material';
import { FormTextField, FormCheckboxField } from '@common/Forms';
import { planSchema, type PlanFormData } from '../schema/plan.schema';
import type { ISubscriptionPlan } from '../types/plans.types';

interface PlanFormDialogProps {
  onClose: () => void;
  onSubmit: (data: PlanFormData) => void;
  plan?: ISubscriptionPlan | null;
  isLoading?: boolean;
}

export function PlanFormDialog({ onClose, onSubmit, plan, isLoading = false }: PlanFormDialogProps) {
  const { handleSubmit, control, reset } = useForm<PlanFormData>({
    resolver: yupResolver(planSchema),
    defaultValues: {
      name: '',
      code: '',
      price: 0,
      maxStudents: 500,
      features: {
        attendanceEnabled: true,
        onlineExamEnabled: false,
        aiAnalyticsEnabled: false,
        parentAppEnabled: true,
      },
      isActive: true,
    },
  });

  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name,
        code: plan.code,
        price: plan.price,
        maxStudents: plan.maxStudents,
        features: {
          attendanceEnabled: plan.features?.attendanceEnabled ?? true,
          onlineExamEnabled: plan.features?.onlineExamEnabled ?? false,
          aiAnalyticsEnabled: plan.features?.aiAnalyticsEnabled ?? false,
          parentAppEnabled: plan.features?.parentAppEnabled ?? true,
        },
        isActive: plan.isActive,
      });
    } else {
      reset({
        name: '',
        code: '',
        price: 0,
        maxStudents: 500,
        features: {
          attendanceEnabled: true,
          onlineExamEnabled: false,
          aiAnalyticsEnabled: false,
          parentAppEnabled: true,
        },
        isActive: true,
      });
    }
  }, [plan, reset]);

  return (
    <>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem', borderBottom: '1px solid var(--color-border-default)', pb: 2 }}>
        {plan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="name" control={control} label="Plan Name" required disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="code" control={control} label="Plan Code" required disabled={!!plan || isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="price" control={control} label="Price (INR)" type="number" required disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="maxStudents" control={control} label="Capacity Limit (Students)" type="number" required disabled={isLoading} />
            </Grid>
            
            <Grid size={12}>
              <Box sx={{ fontWeight: 600, mb: 1, mt: 1, color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                Included Features
              </Box>
              <Grid container spacing={1}>
                <Grid size={6}>
                  <FormCheckboxField name="features.attendanceEnabled" control={control} label="Attendance tracking" disabled={isLoading} />
                </Grid>
                <Grid size={6}>
                  <FormCheckboxField name="features.onlineExamEnabled" control={control} label="Online Exams" disabled={isLoading} />
                </Grid>
                <Grid size={6}>
                  <FormCheckboxField name="features.aiAnalyticsEnabled" control={control} label="AI Analytics" disabled={isLoading} />
                </Grid>
                <Grid size={6}>
                  <FormCheckboxField name="features.parentAppEnabled" control={control} label="Parent App Access" disabled={isLoading} />
                </Grid>
              </Grid>
            </Grid>

            <Grid size={12}>
              <FormCheckboxField name="isActive" control={control} label="Active Status" disabled={isLoading} />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid var(--color-border-default)', pt: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained" color="primary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          {plan ? 'Save Changes' : 'Create Plan'}
        </Button>
      </DialogActions>
    </>
  );
}

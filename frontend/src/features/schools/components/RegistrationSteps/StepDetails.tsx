import type { Control, FieldErrors } from 'react-hook-form';
import { Grid, Typography, Box } from '@mui/material';
import { FormTextField, FormSelectField } from '@common/Forms';
import type { SchoolFormData } from '../../schema/school.schema';
import { type MasterOption } from '../../types/schools.types';

interface StepDetailsProps {
  control: Control<SchoolFormData>;
  errors: FieldErrors<SchoolFormData>;
  states: MasterOption[];
  districts: MasterOption[];
  cities: MasterOption[];
  selectedState?: string;
  selectedDistrict?: string;
}

export function StepDetails({
  control,
  errors,
  states,
  districts,
  cities,
  selectedState,
  selectedDistrict,
}: StepDetailsProps) {
  const mapToOptions = (opts: MasterOption[]) => opts.map(o => ({ value: o._id, label: o.name }));
  const boardOptions = ['CBSE', 'ICSE', 'STATE', 'IB', 'OTHER'].map(b => ({ value: b, label: b }));

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        Step 2: School Details
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="name" control={control} label="School Name" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormTextField name="code" control={control} label="School Code" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormTextField name="subdomain" control={control} label="Subdomain" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="email" control={control} label="Email Address" type="email" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="phone" control={control} label="Phone Number" required />
        </Grid>
        <Grid size={12}>
          <FormTextField name="address" control={control} label="Street Address" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormSelectField name="state" control={control} label="State" options={mapToOptions(states)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormSelectField name="district" control={control} label="District" options={mapToOptions(districts)} disabled={!selectedState} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormSelectField name="city" control={control} label="City" options={mapToOptions(cities)} disabled={!selectedDistrict} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelectField name="boardType" control={control} label="Board Type" options={boardOptions} required />
        </Grid>
      </Grid>
    </Box>
  );
}

import type { Control } from 'react-hook-form';
import { Grid, Typography, Box, Button } from '@mui/material';
import { FormTextField, FormSelectField } from '@common/Forms';
import type { SchoolFormData } from '../../schema/school.schema';
import { type MasterOption } from '../../types/schools.types';
import { FaPlus } from 'react-icons/fa';

interface StepDetailsProps {
  control: Control<SchoolFormData>;
  states: MasterOption[];
  districts: MasterOption[];
  selectedState?: string;
  onAddState: () => void;
  onAddDistrict: () => void;
}

export function StepDetails({
  control,
  states,
  districts,
  selectedState,
  onAddState,
  onAddDistrict,
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
          <FormTextField name="phone" control={control} label="Phone Number (+91)" required />
        </Grid>
        <Grid size={12}>
          <FormTextField name="address" control={control} label="Street Address" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <FormSelectField name="state" control={control} label="State" options={mapToOptions(states)} />
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={onAddState}
              sx={{ minWidth: '40px', height: '40px', p: 0, mt: 0.5 }}
              title="Add State"
            >
              <FaPlus size={12} />
            </Button>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <FormSelectField name="district" control={control} label="District" options={mapToOptions(districts)} disabled={!selectedState} />
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={onAddDistrict}
              disabled={!selectedState}
              sx={{ minWidth: '40px', height: '40px', p: 0, mt: 0.5 }}
              title="Add District"
            >
              <FaPlus size={12} />
            </Button>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelectField name="boardType" control={control} label="Board Type" options={boardOptions} required />
        </Grid>
      </Grid>
    </Box>
  );
}

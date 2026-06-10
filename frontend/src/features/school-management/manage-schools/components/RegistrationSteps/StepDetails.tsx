import type { Control } from 'react-hook-form';
import { Grid, Typography, Box } from '@mui/material';
import { FormTextField, FormSelectField } from '@common/Forms';
import type { SchoolFormData } from '../../schema/school.schema';
import { type MasterOption } from '../../types/schools.types';

interface StepDetailsProps {
  control: Control<SchoolFormData>;
  countries: MasterOption[];
  states: MasterOption[];
  districts: MasterOption[];
  boards: MasterOption[];
  selectedCountry?: string;
  selectedState?: string;
  onAddCountry: () => void;
  onAddState: () => void;
  onAddDistrict: () => void;
  onAddBoard: () => void;
}

export function StepDetails({
  control,
  countries,
  states,
  districts,
  boards,
  selectedCountry,
  selectedState,
  onAddCountry,
  onAddState,
  onAddDistrict,
  onAddBoard,
}: StepDetailsProps) {
  const mapToOptions = (opts: MasterOption[]) => opts.map(o => ({ value: o._id, label: o.name }));

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
        <Grid size={12}>
          <FormTextField name="address" control={control} label="Street Address" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelectField 
            name="country" 
            control={control} 
            label="Country" 
            options={mapToOptions(countries)} 
            onAddClick={onAddCountry}
            addLabel="➕ Add New Country"
            required 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelectField 
            name="state" 
            control={control} 
            label="State" 
            options={mapToOptions(states)} 
            disabled={!selectedCountry}
            onAddClick={onAddState}
            addLabel="➕ Add New State"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelectField 
            name="district" 
            control={control} 
            label="District" 
            options={mapToOptions(districts)} 
            disabled={!selectedState}
            onAddClick={onAddDistrict}
            addLabel="➕ Add New District"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelectField 
            name="boardType" 
            control={control} 
            label="Board Type" 
            options={mapToOptions(boards)} 
            disabled={!selectedCountry}
            onAddClick={onAddBoard}
            addLabel="➕ Add New Board"
            required 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="email" control={control} label="Email Address" type="email" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField name="phone" control={control} label="Phone Number" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormSelectField
            name="shift"
            control={control}
            label="Operational Shift"
            options={[
              { value: 'Morning Shift', label: 'Morning Shift' },
              { value: 'Evening Shift', label: 'Evening Shift' },
              { value: 'Full Day', label: 'Full Day' },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormTextField
            name="startTime"
            control={control}
            label="Operational Start Time"
            type="time"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormTextField
            name="endTime"
            control={control}
            label="Operational End Time"
            type="time"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormTextField
            name="admissionFee"
            control={control}
            label="Admission Fee"
            type="number"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

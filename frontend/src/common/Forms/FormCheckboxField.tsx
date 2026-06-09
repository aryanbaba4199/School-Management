import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { FormControlLabel, Checkbox, FormHelperText, FormControl } from '@mui/material';

/*------------- FormCheckboxField Interface -------------*/

interface FormCheckboxFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues, any, any>;
  label: string;
  disabled?: boolean;
}

/*------------- FormCheckboxField Component -------------*/

export function FormCheckboxField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  disabled = false,
}: FormCheckboxFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, ...field }, fieldState: { error } }) => (
        <FormControl error={!!error} component="fieldset" sx={{ mb: 1, display: 'block' }}>
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                sx={{
                  color: 'var(--color-border-default)',
                  '&.Mui-checked': {
                    color: 'var(--color-primary-main)',
                  },
                }}
              />
            }
            label={label}
            slotProps={{
              typography: {
                style: { color: 'var(--color-text-primary)' },
              },
            }}
          />
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}

import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { TextField } from '@mui/material';

/*------------- FormTextField Interface -------------*/

interface FormTextFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
}

/*------------- FormTextField Component -------------*/

export function FormTextField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  type = 'text',
  placeholder,
  disabled = false,
  required = false,
  multiline = false,
  rows = 1,
}: FormTextFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          type={type}
          label={label}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          multiline={multiline}
          rows={rows}
          fullWidth
          error={!!error}
          helperText={error ? error.message : null}
          variant="outlined"
          slotProps={{
            inputLabel: {
              shrink: true,
              style: { color: 'var(--color-text-secondary)' },
            },
            htmlInput: {
              style: { color: 'var(--color-text-primary)' },
            },
          }}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'var(--color-border-default)' },
              '&:hover fieldset': { borderColor: 'var(--color-primary-main)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--color-primary-main)' },
            },
          }}
        />
      )}
    />
  );
}

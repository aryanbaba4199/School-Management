import { Controller } from 'react-hook-form';
import type { FieldValues, Path } from 'react-hook-form';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

/*------------- Option Interface -------------*/

export interface SelectOption {
  value: string | number;
  label: string;
}

/*------------- FormSelectField Interface -------------*/

interface FormSelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: any;
  label: string;
  options: SelectOption[];
  disabled?: boolean;
  required?: boolean;
  onAddClick?: () => void;
  addLabel?: string;
  multiple?: boolean;
}

/*------------- FormSelectField Component -------------*/

export function FormSelectField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  options,
  disabled = false,
  required = false,
  onAddClick,
  addLabel = '➕ Add New...',
  multiple = false,
}: FormSelectFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl
          fullWidth
          error={!!error}
          disabled={disabled}
          required={required}
          variant="outlined"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'var(--color-border-default)' },
              '&:hover fieldset': { borderColor: 'var(--color-primary-main)' },
              '&.Mui-focused fieldset': { borderColor: 'var(--color-primary-main)' },
            },
          }}
        >
          <InputLabel shrink id={`${name}-label`} style={{ color: 'var(--color-text-secondary)' }}>
            {label}
          </InputLabel>
          <Select
            {...field}
            multiple={multiple}
            onChange={(e) => {
              if (multiple) {
                field.onChange(e.target.value);
                return;
              }
              if ((e.target.value as string) === '__ADD_NEW__') {
                if (onAddClick) onAddClick();
                return; // Do not update field value
              }
              field.onChange(e);
            }}
            labelId={`${name}-label`}
            label={label}
            notched
            value={field.value ?? (multiple ? [] : '')}
            style={{ color: 'var(--color-text-primary)' }}
          >
            {options.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
            {onAddClick && !multiple && (
              <MenuItem value="__ADD_NEW__" sx={{ color: 'var(--color-primary-main)', fontWeight: 600 }}>
                {addLabel}
              </MenuItem>
            )}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}

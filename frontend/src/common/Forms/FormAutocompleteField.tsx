import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Autocomplete, TextField } from '@mui/material';
import type { SelectOption } from './FormSelectField';

/*------------- FormAutocompleteField Interface -------------*/

interface FormAutocompleteFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  options: SelectOption[];
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  multiple?: boolean;
}

/*------------- FormAutocompleteField Component -------------*/

export function FormAutocompleteField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  options,
  disabled = false,
  required = false,
  placeholder,
  multiple = false,
}: FormAutocompleteFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        let selectedOption: SelectOption | SelectOption[] | null = null;
        if (multiple) {
          const valArray = Array.isArray(value) ? value : [];
          selectedOption = valArray
            .map((v) => options.find((o) => String(o.value) === String(v)))
            .filter(Boolean) as SelectOption[];
        } else {
          selectedOption = options.find((o) => String(o.value) === String(value)) || null;
        }

        return (
          <Autocomplete
            id={`${name}-autocomplete`}
            options={options}
            multiple={multiple}
            getOptionLabel={(option) => option?.label ? String(option.label) : ''}
            isOptionEqualToValue={(option, val) => {
              if (!option || !val) return false;
              return String(option.value) === String(val.value);
            }}
            value={selectedOption}
            onChange={(_, newValue) => {
              if (multiple) {
                const newArray = newValue as SelectOption[];
                onChange(newArray.map(n => n.value));
              } else {
                const singleVal = newValue as SelectOption | null;
                onChange(singleVal ? singleVal.value : '');
              }
            }}
            disabled={disabled}
            fullWidth
            sx={{ mb: 2 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                placeholder={placeholder}
                required={required}
                error={!!error}
                helperText={error ? error.message : null}
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiInputLabel-root': {
                    color: 'var(--color-text-secondary)',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'var(--color-border-default)' },
                    '&:hover fieldset': { borderColor: 'var(--color-primary-main)' },
                    '&.Mui-focused fieldset': { borderColor: 'var(--color-primary-main)' },
                    color: 'var(--color-text-primary)',
                    minHeight: 56,
                  },
                  '& .MuiAutocomplete-inputRoot': {
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    paddingLeft: '14px',
                  },
                }}
              />
            )}
          />
        );
      }}
    />
  );
}

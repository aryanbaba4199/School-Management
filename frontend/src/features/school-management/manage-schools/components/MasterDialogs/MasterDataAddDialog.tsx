import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { FormTextField, FormSelectField } from '@common/Forms';
import { Currencies } from '@common/constants/Currency';
import { useGetCountriesQuery, useGetStatesQuery } from '@api/masterApi';

export interface MasterDataPayload {
  name: string;
  code?: string;
  dialCode?: string;
  mobileDigits?: number;
  currency?: string;
  acronym?: string;
  countryId?: string;
  stateId?: string;
}

type MasterType = 'COUNTRY' | 'STATE' | 'DISTRICT' | 'BOARD';

interface MasterDataAddDialogProps {
  open: boolean;
  type: MasterType;
  onClose: () => void;
  onSubmit: (data: MasterDataPayload) => Promise<void>;
  isLoading?: boolean;
  parentCountryId?: string;
  parentStateId?: string;
}

export function MasterDataAddDialog({ open, type, onClose, onSubmit, isLoading, parentCountryId, parentStateId }: MasterDataAddDialogProps) {
  const { control, handleSubmit, reset, watch } = useForm<MasterDataPayload>({
    defaultValues: {
      name: '',
      code: '',
      dialCode: '',
      mobileDigits: 10,
      currency: 'INR',
      acronym: '',
      countryId: parentCountryId || '',
      stateId: parentStateId || '',
    }
  });

  const selectedCountryId = watch('countryId');

  const { data: countriesRes } = useGetCountriesQuery(undefined, { skip: (type !== 'STATE' && type !== 'DISTRICT' && type !== 'BOARD') });
  const countries = countriesRes?.success ? countriesRes.data : [];

  const { data: statesRes } = useGetStatesQuery(selectedCountryId || '', { skip: type !== 'DISTRICT' || !selectedCountryId });
  const states = statesRes?.success ? statesRes.data : [];

  const countryOptions = countries.map(c => ({ value: c._id, label: c.name }));
  const stateOptions = states.map(s => ({ value: s._id, label: s.name }));

  const getTitle = () => {
    switch (type) {
      case 'COUNTRY': return 'Add New Country';
      case 'STATE': return 'Add New State';
      case 'DISTRICT': return 'Add New District';
      case 'BOARD': return 'Add New Board Type';
      default: return 'Add Master Data';
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const submitWrapper = async (data: MasterDataPayload) => {
    await onSubmit(data);
    reset();
  };

  const currencyOptions = Currencies.map(c => ({
    value: c.code,
    label: `${c.name} (${c.symbol}) - ${c.code}`
  }));

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid var(--color-border-default)', pb: 2 }}>
        {getTitle()}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            
            {/* Common Name Field */}
            <Grid size={12}>
              <FormTextField name="name" control={control} label="Name" required disabled={isLoading} />
            </Grid>

            {/* Code Field (Country, State, District) */}
            {(type === 'COUNTRY' || type === 'STATE' || type === 'DISTRICT') && (
              <Grid size={12}>
                <FormTextField name="code" control={control} label="Code (e.g., IN, KA, BLR)" required disabled={isLoading} />
              </Grid>
            )}

            {/* Board Acronym */}
            {type === 'BOARD' && (
              <Grid size={12}>
                <FormTextField name="acronym" control={control} label="Acronym / Pronounce (e.g., CBSE)" required disabled={isLoading} />
              </Grid>
            )}

            {/* Parent Country Selection */}
            {(type === 'STATE' || type === 'DISTRICT' || type === 'BOARD') && (
              <Grid size={12}>
                <FormSelectField 
                  name="countryId" 
                  control={control} 
                  label="Country" 
                  options={countryOptions} 
                  required 
                  disabled={isLoading || !!parentCountryId} 
                />
              </Grid>
            )}

            {/* Parent State Selection */}
            {type === 'DISTRICT' && (
              <Grid size={12}>
                <FormSelectField 
                  name="stateId" 
                  control={control} 
                  label="State" 
                  options={stateOptions} 
                  required 
                  disabled={isLoading || !!parentStateId} 
                />
              </Grid>
            )}

            {/* Country Specific Fields */}
            {type === 'COUNTRY' && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormTextField name="dialCode" control={control} label="Dial Code (e.g., +91)" required disabled={isLoading} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormTextField name="mobileDigits" control={control} label="Mobile Digits Length" type="number" required disabled={isLoading} />
                </Grid>
                <Grid size={12}>
                  <FormSelectField name="currency" control={control} label="Currency" options={currencyOptions} required disabled={isLoading} />
                </Grid>
              </>
            )}

          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid var(--color-border-default)', pt: 2 }}>
        <Button onClick={handleClose} variant="outlined" color="secondary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(submitWrapper)} variant="contained" color="primary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          Save {type.charAt(0) + type.slice(1).toLowerCase()}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

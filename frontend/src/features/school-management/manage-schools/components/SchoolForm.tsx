import { useState } from 'react';
import { Stepper, Step, StepLabel, Box, Button, CircularProgress } from '@mui/material';
import { type SchoolFormData } from '../schema/school.schema';
import { useSchoolForm } from '../hooks/useSchoolForm';
import { StepCredentials } from './RegistrationSteps/StepCredentials';
import { StepDetails } from './RegistrationSteps/StepDetails';
import { StepSubscription } from './RegistrationSteps/StepSubscription';
import { useSaveDraftMutation, useGetSchoolByIdQuery } from '@api/schoolsApi';
import type { ISchoolDraft } from '../types/schools.types';
import {
  useGetSubscriptionPlansQuery,
  useGetCountriesQuery,
  useGetBoardTypesQuery,
  useGetStatesQuery,
  useGetDistrictsQuery,
  useCreateCountryMutation,
  useCreateBoardTypeMutation,
  useCreateStateMutation,
  useCreateDistrictMutation,
} from '@api/masterApi';
import { MOCK_PLANS, MOCK_STATES, MOCK_DISTRICTS } from '../types/schools.types';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { MasterDataAddDialog } from './MasterDialogs/MasterDataAddDialog';
import type { MasterDataPayload } from './MasterDialogs/MasterDataAddDialog';

interface SchoolFormProps {
  schoolId?: string;
  onSubmit: (data: SchoolFormData) => void;
  onCancel: () => void;
}

const STEP_FIELDS: (keyof SchoolFormData | string)[][] = [
  ['adminName', 'adminEmail', 'adminPassword'],
  ['name', 'code', 'subdomain', 'email', 'phone', 'countryCode', 'boardType', 'state', 'district', 'address', 'shift', 'startTime', 'endTime'],
  ['subscriptionPlan', 'billingCycle', 'maxStudents', 'settings.attendanceEnabled', 'settings.onlineExamEnabled', 'settings.aiAnalyticsEnabled', 'settings.parentAppEnabled'],
];

export function SchoolForm({ schoolId, onSubmit, onCancel }: SchoolFormProps) {
  const { data: schoolRes, isLoading: isSchoolLoading } = useGetSchoolByIdQuery(schoolId!, { skip: !schoolId });
  const school = schoolRes?.success ? schoolRes.data : null;

  const steps = schoolId ? ['School Details', 'Subscription & Features'] : ['Admin Credentials', 'School Details', 'Subscription & Features'];
  const [activeStep, setActiveStep] = useState(0);
  const [saveDraft, { isLoading: isSavingDraft }] = useSaveDraftMutation();
  const [createCountry] = useCreateCountryMutation();
  const [createBoardType] = useCreateBoardTypeMutation();
  const [createState] = useCreateStateMutation();
  const [createDistrict] = useCreateDistrictMutation();
  const notifier = useNotifier();

  const [dialogType, setDialogType] = useState<'COUNTRY' | 'STATE' | 'DISTRICT' | 'BOARD' | null>(null);

  const { data: countriesRes } = useGetCountriesQuery();
  const countries = countriesRes?.success ? countriesRes.data : [];

  const { handleSubmit, control, watch, trigger, getValues, loadDraft } = useSchoolForm(school, countries);

  const selectedCountry = watch('country');
  const selectedState = watch('state');

  const { data: plansRes } = useGetSubscriptionPlansQuery();
  const { data: boardsRes } = useGetBoardTypesQuery(selectedCountry || '', { skip: !selectedCountry });
  const { data: statesRes } = useGetStatesQuery(selectedCountry || '', { skip: !selectedCountry });
  const { data: districtsRes } = useGetDistrictsQuery(selectedState || '', { skip: !selectedState });

  const plans = plansRes?.success ? plansRes.data : MOCK_PLANS;
  const boards = boardsRes?.success ? boardsRes.data : [];
  const states = statesRes?.success ? statesRes.data : MOCK_STATES;
  const districts = (selectedState && districtsRes?.success) ? districtsRes.data : (selectedState ? (MOCK_DISTRICTS[selectedState] || []) : []);

  const handleAddMasterData = async (data: MasterDataPayload) => {
    try {
      if (dialogType === 'COUNTRY') {
        await createCountry(data as unknown as { name: string; code: string; dialCode: string; mobileDigits: number; currency: string; }).unwrap();
        notifier.showSuccess('Country added successfully!');
      } else if (dialogType === 'BOARD') {
        await createBoardType(data as unknown as { name: string; acronym: string; countryId: string; }).unwrap();
        notifier.showSuccess('Board Type added successfully!');
      } else if (dialogType === 'STATE') {
        await createState(data as unknown as { name: string; code: string; countryId: string; }).unwrap();
        notifier.showSuccess('State added successfully!');
      } else if (dialogType === 'DISTRICT') {
        await createDistrict(data as unknown as { name: string; code: string; stateId: string; }).unwrap();
        notifier.showSuccess('District added successfully!');
      }
      setDialogType(null);
    } catch (err: unknown) {
      const msg = (err && typeof err === 'object' && 'data' in err)
        ? (err.data as { message?: string })?.message 
        : `Failed to add ${dialogType}`;
      notifier.showError(msg || `Failed to add ${dialogType}`);
    }
  };

  const handleDraftLoaded = (draft: ISchoolDraft) => {
    loadDraft(draft);
    notifier.showSuccess('Draft loaded successfully!');
    if (draft.currentStep) {
      setActiveStep(Math.max(0, draft.currentStep - 1));
    }
  };

  const handleNext = async () => {
    const fieldsToValidate = schoolId ? STEP_FIELDS[activeStep + 1] : STEP_FIELDS[activeStep];
    const isValid = await trigger(fieldsToValidate as (keyof SchoolFormData)[]);
    if (!isValid) return;

    if (activeStep < steps.length - 1) {
      if (!schoolId) {
        try {
          const values = getValues();
          await saveDraft({
            adminEmail: values.adminEmail,
            adminName: values.adminName,
            adminPassword: values.adminPassword,
            currentStep: activeStep + 2,
            schoolDetails: {
              name: values.name,
              code: values.code,
              subdomain: values.subdomain,
              email: values.email,
              phone: values.phone,
              countryCode: values.countryCode || '+91',
              address: values.address,
              country: values.country,
              state: values.state,
              district: values.district,
              boardType: values.boardType,
            },
            subscriptionDetails: {
              subscriptionPlan: values.subscriptionPlan,
              billingCycle: values.billingCycle,
              maxStudents: Number(values.maxStudents),
              settings: values.settings,
            }
          }).unwrap();
        } catch {
          // continue even if auto-save fails
        }
      }
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => Math.max(0, prev - 1));

  const renderStepContent = () => {
    const stepToShow = schoolId ? activeStep + 1 : activeStep;
    if (stepToShow === 0) {
      return (
        <StepCredentials control={control} errors={control._formState.errors} onDraftLoaded={handleDraftLoaded} />
      );
    }
    if (stepToShow === 1) {
      return (
        <StepDetails
          control={control}
          countries={countries}
          states={states}
          districts={districts}
          boards={boards}
          selectedCountry={selectedCountry}
          selectedState={selectedState}
          onAddCountry={() => setDialogType('COUNTRY')}
          onAddState={() => setDialogType('STATE')}
          onAddDistrict={() => setDialogType('DISTRICT')}
          onAddBoard={() => setDialogType('BOARD')}
        />
      );
    }
    if (stepToShow === 2) {
      return (
        <StepSubscription control={control} plans={plans} />
      );
    }
    return null;
  };

  if (isSchoolLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, minHeight: 300, alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: '260px', mb: 3 }}>
        {renderStepContent()}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button onClick={onCancel} variant="outlined" color="secondary" sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} variant="outlined" sx={{ textTransform: 'none' }}>
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button onClick={handleNext} variant="contained" disabled={isSavingDraft} sx={{ textTransform: 'none' }}>
            {isSavingDraft ? <CircularProgress size={24} /> : 'Next'}
          </Button>
        ) : (
          <Button onClick={handleSubmit(onSubmit, (errs) => console.log('Validation Errors:', errs))} variant="contained" color="primary" sx={{ textTransform: 'none' }}>
            {schoolId ? 'Save Changes' : 'Create School'}
          </Button>
        )}
      </Box>

      {dialogType && (
        <MasterDataAddDialog
          open={!!dialogType}
          type={dialogType}
          onClose={() => setDialogType(null)}
          onSubmit={handleAddMasterData}
          parentCountryId={selectedCountry}
          parentStateId={selectedState}
        />
      )}
    </Box>
  );
}


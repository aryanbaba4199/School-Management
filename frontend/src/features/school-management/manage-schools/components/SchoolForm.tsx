import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { DefaultValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stepper, Step, StepLabel, Box, Button, CircularProgress } from '@mui/material';
import { schoolSchema, type SchoolFormData } from '../schema/school.schema';
import { StepCredentials } from './RegistrationSteps/StepCredentials';
import { StepDetails } from './RegistrationSteps/StepDetails';
import { StepSubscription } from './RegistrationSteps/StepSubscription';
import { useSaveDraftMutation } from '../../../../api/schoolsApi';
import type { ISchool, ISchoolDraft } from '../types/schools.types';
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
} from '../../../../api/masterApi';
import { MOCK_PLANS, MOCK_STATES, MOCK_DISTRICTS } from '../types/schools.types';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { MasterDataAddDialog } from './MasterDialogs/MasterDataAddDialog';
import type { MasterDataPayload } from './MasterDialogs/MasterDataAddDialog';

interface SchoolFormProps {
  school?: ISchool | null;
  onSubmit: (data: SchoolFormData) => void;
  onCancel: () => void;
}



const STEP_FIELDS: (keyof SchoolFormData | string)[][] = [
  ['adminName', 'adminEmail', 'adminPassword'],
  ['name', 'code', 'subdomain', 'email', 'phone', 'countryCode', 'boardType', 'state', 'district', 'address'],
  ['subscriptionPlan', 'billingCycle', 'maxStudents', 'settings.attendanceEnabled', 'settings.onlineExamEnabled', 'settings.aiAnalyticsEnabled', 'settings.parentAppEnabled'],
];

export function SchoolForm({ school = null, onSubmit, onCancel }: SchoolFormProps) {
  const steps = school ? ['School Details', 'Subscription & Features'] : ['Admin Credentials', 'School Details', 'Subscription & Features'];
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

  const { handleSubmit, control, watch, trigger, getValues, reset } = useForm<SchoolFormData>({
    resolver: async (data, context, options) => {
      const selectedCountryId = data.country;
      const selectedCountryObj = countries.find(c => c._id === selectedCountryId);
      const mobileDigits = selectedCountryObj?.mobileDigits || 10;
      const configuredResolver = yupResolver(schoolSchema, { context: { mobileDigits } });
      return configuredResolver(
        data as unknown as Parameters<typeof configuredResolver>[0],
        context,
        options as unknown as Parameters<typeof configuredResolver>[2]
      );
    },
    defaultValues: (school ? {
      adminName: 'Edit Mode',
      adminEmail: school.email,
      adminPassword: 'password123',
      name: school.name,
      code: school.code,
      subdomain: school.subdomain,
      email: school.email,
      phone: school.phone,
      countryCode: school.countryCode || '+91',
      address: school.address || '',
      state: typeof school.state === 'object' ? school.state?._id : school.state || '',
      district: typeof school.district === 'object' ? school.district?._id : school.district || '',
      country: typeof school.country === 'object' ? school.country?._id : school.country || '',
      boardType: typeof school.boardType === 'object' ? school.boardType?._id : school.boardType || '',
      maxStudents: school.maxStudents,
      subscriptionPlan: typeof school.subscriptionPlan === 'object' ? school.subscriptionPlan._id : school.subscriptionPlan || '',
      billingCycle: school.billingCycle || 'MONTHLY',
      pincode: school.pincode,
      settings: {
        attendanceEnabled: school.settings?.attendanceEnabled ?? true,
        onlineExamEnabled: school.settings?.onlineExamEnabled ?? false,
        aiAnalyticsEnabled: school.settings?.aiAnalyticsEnabled ?? false,
        parentAppEnabled: school.settings?.parentAppEnabled ?? true,
      }
    } : {
      adminName: '', adminEmail: '', adminPassword: '',
      name: '', code: '', subdomain: '', email: '', phone: '', countryCode: '+91', address: '',
      boardType: '60f7c223405c102c98d6c830', country: '60f7c223405c102c98d6c840', maxStudents: 500, subscriptionPlan: '60f7c223405c102c98d6c810', billingCycle: 'MONTHLY',
      state: '', district: '', pincode: undefined,
      settings: { attendanceEnabled: true, onlineExamEnabled: false, aiAnalyticsEnabled: false, parentAppEnabled: true }
    }) as DefaultValues<SchoolFormData>
  });

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
    reset({
      adminEmail: draft.adminEmail || '',
      adminName: draft.adminName || '',
      adminPassword: draft.adminPassword || '',
      name: draft.schoolDetails?.name || '',
      code: draft.schoolDetails?.code || '',
      subdomain: draft.schoolDetails?.subdomain || '',
      email: draft.schoolDetails?.email || '',
      phone: draft.schoolDetails?.phone || '',
      countryCode: draft.schoolDetails?.countryCode || '+91',
      address: draft.schoolDetails?.address || '',
      country: draft.schoolDetails?.country || '',
      state: draft.schoolDetails?.state || '',
      district: draft.schoolDetails?.district || '',
      boardType: draft.schoolDetails?.boardType || '',
      subscriptionPlan: draft.subscriptionDetails?.subscriptionPlan || '60f7c223405c102c98d6c810',
      billingCycle: draft.subscriptionDetails?.billingCycle || 'MONTHLY',
      maxStudents: draft.subscriptionDetails?.maxStudents || 500,
      settings: draft.subscriptionDetails?.settings || {
        attendanceEnabled: true,
        onlineExamEnabled: false,
        aiAnalyticsEnabled: false,
        parentAppEnabled: true,
      },
    });
    if (draft.currentStep) {
      setActiveStep(Math.max(0, draft.currentStep - 1));
    }
  };

  const handleNext = async () => {
    const fieldsToValidate = school ? STEP_FIELDS[activeStep + 1] : STEP_FIELDS[activeStep];
    const isValid = await trigger(fieldsToValidate as (keyof SchoolFormData)[]);
    if (!isValid) return;

    if (activeStep < steps.length - 1) {
      if (!school) {
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
    const stepToShow = school ? activeStep + 1 : activeStep;
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
            {school ? 'Save Changes' : 'Create School'}
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


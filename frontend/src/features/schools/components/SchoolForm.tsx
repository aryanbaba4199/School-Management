import { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stepper, Step, StepLabel, Box, Button, CircularProgress } from '@mui/material';
import { schoolSchema, type SchoolFormData } from '../schema/school.schema';
import { StepCredentials } from './RegistrationSteps/StepCredentials';
import { StepDetails } from './RegistrationSteps/StepDetails';
import { StepSubscription } from './RegistrationSteps/StepSubscription';
import { useSaveDraftMutation } from '../../../api/schoolsApi';
import type { ISchool, ISchoolDraft } from '../types/schools.types';
import {
  useGetSubscriptionPlansQuery,
  useGetStatesQuery,
  useGetDistrictsQuery,
  useCreateStateMutation,
  useCreateDistrictMutation,
} from '../../../api/masterApi';
import { MOCK_PLANS, MOCK_STATES, MOCK_DISTRICTS } from '../types/schools.types';
import { useNotifier } from '@common/Notifier/NotifierProvider';

interface SchoolFormProps {
  school?: ISchool | null;
  onSubmit: (data: SchoolFormData) => void;
  onCancel: () => void;
}

const STEPS = ['Admin Credentials', 'School Details', 'Subscription & Features'];

const STEP_FIELDS: (keyof SchoolFormData | string)[][] = [
  ['adminName', 'adminEmail', 'adminPassword'],
  ['name', 'code', 'subdomain', 'email', 'phone', 'countryCode', 'boardType', 'state', 'district', 'address'],
  ['subscriptionPlan', 'billingCycle', 'maxStudents', 'settings.attendanceEnabled', 'settings.onlineExamEnabled', 'settings.aiAnalyticsEnabled', 'settings.parentAppEnabled'],
];

export function SchoolForm({ school = null, onSubmit, onCancel }: SchoolFormProps) {
  const steps = school ? ['School Details', 'Subscription & Features'] : ['Admin Credentials', 'School Details', 'Subscription & Features'];
  const [activeStep, setActiveStep] = useState(0);
  const [saveDraft, { isLoading: isSavingDraft }] = useSaveDraftMutation();
  const [createState] = useCreateStateMutation();
  const [createDistrict] = useCreateDistrictMutation();
  const notifier = useNotifier();

  const { handleSubmit, control, watch, trigger, getValues, reset } = useForm<SchoolFormData>({
    resolver: yupResolver(schoolSchema) as unknown as Resolver<SchoolFormData>,
    defaultValues: school ? {
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
      state: typeof school.state === 'object' ? school.state._id : school.state || '',
      district: typeof school.district === 'object' ? school.district._id : school.district || '',
      boardType: school.boardType,
      maxStudents: school.maxStudents,
      subscriptionPlan: typeof school.subscriptionPlan === 'object' ? school.subscriptionPlan._id : school.subscriptionPlan || '',
      billingCycle: school.billingCycle || 'MONTHLY',
      settings: {
        attendanceEnabled: school.settings?.attendanceEnabled ?? true,
        onlineExamEnabled: school.settings?.onlineExamEnabled ?? false,
        aiAnalyticsEnabled: school.settings?.aiAnalyticsEnabled ?? false,
        parentAppEnabled: school.settings?.parentAppEnabled ?? true,
      }
    } : {
      adminName: '', adminEmail: '', adminPassword: '',
      name: '', code: '', subdomain: '', email: '', phone: '', countryCode: '+91', address: '',
      boardType: 'CBSE', maxStudents: 500, subscriptionPlan: '60f7c223405c102c98d6c810', billingCycle: 'MONTHLY',
      settings: { attendanceEnabled: true, onlineExamEnabled: false, aiAnalyticsEnabled: false, parentAppEnabled: true }
    }
  });

  const selectedState = watch('state');

  const { data: plansRes } = useGetSubscriptionPlansQuery();
  const { data: statesRes } = useGetStatesQuery();
  const { data: districtsRes } = useGetDistrictsQuery(selectedState || '', { skip: !selectedState });

  const plans = plansRes?.success ? plansRes.data : MOCK_PLANS;
  const states = statesRes?.success ? statesRes.data : MOCK_STATES;
  const districts = (selectedState && districtsRes?.success) ? districtsRes.data : (selectedState ? (MOCK_DISTRICTS[selectedState] || []) : []);

  const handleAddState = async () => {
    const name = window.prompt('Enter new State Name:');
    if (!name) return;
    const code = window.prompt('Enter new State Code (e.g. KA, MH):');
    if (!code) return;
    try {
      await createState({ name, code: code.toUpperCase() }).unwrap();
      notifier.showSuccess('State added successfully!');
    } catch (err: unknown) {
      const msg = (err && typeof err === 'object' && 'data' in err)
        ? (err.data as { message?: string })?.message 
        : 'Failed to add State';
      notifier.showError(msg || 'Failed to add State');
    }
  };

  const handleAddDistrict = async () => {
    if (!selectedState) return;
    const name = window.prompt('Enter new District Name:');
    if (!name) return;
    const code = window.prompt('Enter new District Code (e.g. BLR, MHM):');
    if (!code) return;
    try {
      await createDistrict({ name, code: code.toUpperCase(), stateId: selectedState }).unwrap();
      notifier.showSuccess('District added successfully!');
    } catch (err: unknown) {
      const msg = (err && typeof err === 'object' && 'data' in err)
        ? (err.data as { message?: string })?.message 
        : 'Failed to add District';
      notifier.showError(msg || 'Failed to add District');
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
      state: draft.schoolDetails?.state || '',
      district: draft.schoolDetails?.district || '',
      boardType: draft.schoolDetails?.boardType || 'CBSE',
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
        } catch (err) {
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
          states={states}
          districts={districts}
          selectedState={selectedState}
          onAddState={handleAddState}
          onAddDistrict={handleAddDistrict}
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
    </Box>
  );
}


import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stepper, Step, StepLabel, Box, Button, CircularProgress } from '@mui/material';
import { schoolSchema, type SchoolFormData } from '../schema/school.schema';
import { StepCredentials } from './RegistrationSteps/StepCredentials';
import { StepDetails } from './RegistrationSteps/StepDetails';
import { StepSubscription } from './RegistrationSteps/StepSubscription';
import { useSaveDraftMutation } from '../../../api/schoolsApi';
import {
  useGetSubscriptionPlansQuery,
  useGetStatesQuery,
  useGetDistrictsQuery,
  useGetCitiesQuery,
} from '../../../api/masterApi';
import { MOCK_PLANS, MOCK_STATES, MOCK_DISTRICTS, MOCK_CITIES } from '../types/schools.types';

interface SchoolFormProps {
  onSubmit: (data: SchoolFormData) => void;
  onCancel: () => void;
}

const STEPS = ['Admin Credentials', 'School Details', 'Subscription & Features'];

const STEP_FIELDS: (keyof SchoolFormData | string)[][] = [
  ['adminName', 'adminEmail', 'adminPassword'],
  ['name', 'code', 'subdomain', 'email', 'phone', 'boardType', 'state', 'district', 'city', 'address'],
  ['subscriptionPlan', 'maxStudents', 'settings.attendanceEnabled', 'settings.onlineExamEnabled', 'settings.aiAnalyticsEnabled', 'settings.parentAppEnabled'],
];

export function SchoolForm({ onSubmit, onCancel }: SchoolFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [saveDraft, { isLoading: isSavingDraft }] = useSaveDraftMutation();

  const { handleSubmit, control, watch, trigger, getValues, reset } = useForm<SchoolFormData>({
    resolver: yupResolver(schoolSchema),
    defaultValues: {
      adminName: '', adminEmail: '', adminPassword: '',
      name: '', code: '', subdomain: '', email: '', phone: '', address: '',
      boardType: 'CBSE', maxStudents: 500, subscriptionPlan: '60f7c223405c102c98d6c810',
      settings: { attendanceEnabled: true, onlineExamEnabled: false, aiAnalyticsEnabled: false, parentAppEnabled: true }
    }
  });

  const selectedState = watch('state');
  const selectedDistrict = watch('district');

  const { data: plansRes } = useGetSubscriptionPlansQuery();
  const { data: statesRes } = useGetStatesQuery();
  const { data: districtsRes } = useGetDistrictsQuery(selectedState || '', { skip: !selectedState });
  const { data: citiesRes } = useGetCitiesQuery(selectedDistrict || '', { skip: !selectedDistrict });

  const plans = plansRes?.success ? plansRes.data : MOCK_PLANS;
  const states = statesRes?.success ? statesRes.data : MOCK_STATES;
  const districts = (selectedState && districtsRes?.success) ? districtsRes.data : (selectedState ? (MOCK_DISTRICTS[selectedState] || []) : []);
  const cities = (selectedDistrict && citiesRes?.success) ? citiesRes.data : (selectedDistrict ? (MOCK_CITIES[selectedDistrict] || []) : []);

  const handleDraftLoaded = (draft: any) => {
    reset({
      adminEmail: draft.adminEmail || '',
      adminName: draft.adminName || '',
      adminPassword: draft.adminPassword || '',
      name: draft.schoolDetails?.name || '',
      code: draft.schoolDetails?.code || '',
      subdomain: draft.schoolDetails?.subdomain || '',
      email: draft.schoolDetails?.email || '',
      phone: draft.schoolDetails?.phone || '',
      address: draft.schoolDetails?.address || '',
      state: draft.schoolDetails?.state || '',
      district: draft.schoolDetails?.district || '',
      city: draft.schoolDetails?.city || '',
      boardType: draft.schoolDetails?.boardType || 'CBSE',
      subscriptionPlan: draft.subscriptionDetails?.subscriptionPlan || '60f7c223405c102c98d6c810',
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
    const isValid = await trigger(STEP_FIELDS[activeStep] as any);
    if (!isValid) return;

    if (activeStep < STEPS.length - 1) {
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
            address: values.address,
            state: values.state,
            district: values.district,
            city: values.city,
            boardType: values.boardType,
          },
          subscriptionDetails: {
            subscriptionPlan: values.subscriptionPlan,
            maxStudents: Number(values.maxStudents),
            settings: values.settings,
          }
        }).unwrap();
      } catch (err) {
        // continue even if auto-save fails
      }
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => Math.max(0, prev - 1));

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: '260px', mb: 3 }}>
        {activeStep === 0 && (
          <StepCredentials control={control} errors={control._formState.errors} onDraftLoaded={handleDraftLoaded} />
        )}
        {activeStep === 1 && (
          <StepDetails
            control={control}
            errors={control._formState.errors}
            states={states}
            districts={districts}
            cities={cities}
            selectedState={selectedState}
            selectedDistrict={selectedDistrict}
          />
        )}
        {activeStep === 2 && (
          <StepSubscription control={control} plans={plans} />
        )}
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
        {activeStep < STEPS.length - 1 ? (
          <Button onClick={handleNext} variant="contained" disabled={isSavingDraft} sx={{ textTransform: 'none' }}>
            {isSavingDraft ? <CircularProgress size={24} /> : 'Next'}
          </Button>
        ) : (
          <Button onClick={handleSubmit(onSubmit)} variant="contained" color="primary" sx={{ textTransform: 'none' }}>
            Create School
          </Button>
        )}
      </Box>
    </Box>
  );
}

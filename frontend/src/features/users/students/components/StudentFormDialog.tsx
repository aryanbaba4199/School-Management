import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DialogTitle, DialogContent, DialogActions, Button, Grid, Box, CircularProgress, Stepper, Step, StepLabel, Typography, Divider } from '@mui/material';
import { FormTextField, FormSelectField, FormAutocompleteField } from '@common/Forms';
import { useGetUsersQuery, useGetUserByIdQuery } from '../../../../api/usersApi';
import { useGetStatesQuery, useGetDistrictsQuery } from '../../../../api/masterApi';
import { useGetClassesQuery } from '../../../../api/classesApi';
import { useGetSchoolByIdQuery } from '../../../../api/schoolsApi';
import { useAuth } from '@common/hooks/useAuth';
import { studentSchema, type StudentFormData } from '../schema/student.schema';
import type { ISchoolUser } from '../../../../api/usersApi';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { parseISO } from 'date-fns';

interface StudentFormDialogProps {
  onClose: () => void;
  onSubmit: (data: Partial<ISchoolUser> & { password?: string }) => void;
  userId?: string;
  isLoading?: boolean;
}

const STEPS = ['Personal Details', 'Fees & Admission'];

export function StudentFormDialog({ onClose, onSubmit, userId, isLoading = false }: StudentFormDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const { user: authUser } = useAuth();
  
  const { data: userRes, isLoading: isUserLoading } = useGetUserByIdQuery(userId!, { skip: !userId });
  const user = userRes?.success ? userRes.data : null;
  
  const { data: parentsRes } = useGetUsersQuery({ role: 'PARENT' });
  const parents = parentsRes?.success ? parentsRes.data : [];

  const { handleSubmit, control, watch, reset, trigger } = useForm<any>({
    resolver: yupResolver(studentSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      userCode: '',
      phone: '',
      classId: '',
      sectionId: '',
      parentId: '',
      address: {
        street: '',
        state: '',
        district: '',
        pincode: undefined,
      },
      regDate: new Date().toISOString(),
      startDate: new Date().toISOString(),
      leaveDate: undefined,
      feeCycle: 'MONTHLY',
    },
  });

  const selectedState = watch('address.state');
  const selectedClassId = watch('classId');
  const selectedFeeCycle = watch('feeCycle');

  const mapToOpts = (items: { _id: string; name: string }[]) => items.map(i => ({ value: i._id, label: i.name }));

  const { data: classesRes } = useGetClassesQuery();
  const classes = classesRes?.success ? classesRes.data : [];
  const classOptions = mapToOpts(classes);

  const selectedClass = classes.find(c => c._id === selectedClassId);
  const sectionOptions = selectedClass ? mapToOpts(selectedClass.sections) : [];

  const { data: statesRes } = useGetStatesQuery('');
  const states = statesRes?.success ? statesRes.data : [];

  const { data: districtsRes } = useGetDistrictsQuery(selectedState || '');
  const districts = districtsRes?.success ? districtsRes.data : [];

  // Get active school ID (from populated object or string)
  const activeSchoolId = typeof authUser?.schoolId === 'object' ? authUser.schoolId._id : authUser?.schoolId;
  const { data: schoolRes } = useGetSchoolByIdQuery(activeSchoolId || '', { skip: !activeSchoolId });
  const activeSchool = schoolRes?.data;

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        userCode: user.userCode,
        phone: user.phone || '',
        classId: user.classId || '',
        sectionId: user.sectionId || '',
        parentId: typeof user.parentId === 'object' ? user.parentId._id : user.parentId || '',
        address: {
          street: user.address?.street || '',
          state: typeof user.address?.state === 'object' ? user.address.state._id : user.address?.state || '',
          district: typeof user.address?.district === 'object' ? user.address.district._id : user.address?.district || '',
          pincode: user.address?.pincode || undefined,
        },
        regDate: user.regDate || new Date().toISOString(),
        startDate: user.startDate || new Date().toISOString(),
        feeCycle: user.feeCycle || 'MONTHLY',
      });
    }
  }, [user, reset]);

  const onFormSubmit = (formData: StudentFormData) => {
    const submitPayload: Partial<ISchoolUser> & { password?: string } = {
      name: formData.name,
      email: formData.email,
      userCode: formData.userCode,
      phone: formData.phone || undefined,
      classId: formData.classId || undefined,
      sectionId: formData.sectionId || undefined,
      parentId: formData.parentId || undefined,
      address: formData.address ? {
        street: formData.address.street || undefined,
        state: formData.address.state || undefined,
        district: formData.address.district || undefined,
        pincode: formData.address.pincode || undefined,
      } : undefined,
      regDate: formData.regDate,
      startDate: formData.startDate,
      leaveDate: formData.leaveDate,
      feeCycle: formData.feeCycle,
      role: {
        name: 'STUDENT',
        access: [],
      },
    };
    if (!userId) {
      submitPayload.password = 'Student@123';
    } else if (formData.password) {
      submitPayload.password = formData.password;
    }
    onSubmit(submitPayload);
  };

  const handleNext = async () => {
    const isValid = await trigger(['name', 'email', 'password', 'userCode', 'phone', 'parentId', 'address']);
    if (isValid) setActiveStep(1);
  };

  const handleBack = () => {
    setActiveStep(0);
  };

  if (isUserLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, minHeight: 300, alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid var(--color-border-default)', pb: 2 }}>
        {userId ? 'Edit Student' : 'Add New Student'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
          
        <Box component="form" noValidate sx={{ mt: 1 }}>
          {activeStep === 0 && (
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormTextField name="name" control={control} label="Student Name" required disabled={isLoading} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormTextField name="email" control={control} label="Email Address" required disabled={isLoading} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormTextField name="userCode" control={control} label="Admission Number" required disabled={isLoading} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormTextField name="phone" control={control} label="Phone Number" disabled={isLoading} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormAutocompleteField
                  name="parentId"
                  control={control}
                  label="Parent/Guardian"
                  options={parents.map(p => ({ value: p._id, label: `${p.name} (${p.userCode})` }))}
                  disabled={isLoading}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormTextField name="address.street" control={control} label="Street Address" disabled={isLoading} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormAutocompleteField name="address.state" control={control} label="State" options={mapToOpts(states)} disabled={isLoading} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormAutocompleteField name="address.district" control={control} label="District" options={mapToOpts(districts)} disabled={!selectedState || isLoading} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormTextField name="address.pincode" control={control} label="Pincode" type="number" disabled={isLoading} />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormSelectField
                  name="classId"
                  control={control}
                  label="Class"
                  options={classOptions}
                  required
                  disabled={isLoading}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormSelectField
                  name="sectionId"
                  control={control}
                  label="Section"
                  options={sectionOptions}
                  required
                  disabled={!selectedClassId || sectionOptions.length === 0}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormSelectField
                  name="feeCycle"
                  control={control}
                  label="Fee Cycle"
                  options={[
                    { value: 'MONTHLY', label: 'Monthly' },
                    { value: 'YEARLY', label: 'Yearly' },
                  ]}
                  disabled={isLoading}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="regDate"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      label="Registration Date"
                      value={value ? parseISO(value) : null}
                      onChange={(date) => onChange(date ? date.toISOString() : undefined)}
                      sx={{ width: '100%', mb: 2 }}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true, 
                          sx: { 
                            '& .MuiOutlinedInput-root': { 
                              '& fieldset': { borderColor: 'var(--color-border-default)' },
                              '&:hover fieldset': { borderColor: 'var(--color-primary-main)' },
                              '&.Mui-focused fieldset': { borderColor: 'var(--color-primary-main)' },
                            } 
                          } 
                        } 
                      }}
                      disabled={isLoading}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      label="Start Date"
                      value={value ? parseISO(value) : null}
                      onChange={(date) => onChange(date ? date.toISOString() : undefined)}
                      sx={{ width: '100%', mb: 2 }}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true, 
                          sx: { 
                            '& .MuiOutlinedInput-root': { 
                              '& fieldset': { borderColor: 'var(--color-border-default)' },
                              '&:hover fieldset': { borderColor: 'var(--color-primary-main)' },
                              '&.Mui-focused fieldset': { borderColor: 'var(--color-primary-main)' },
                            } 
                          } 
                        } 
                      }}
                      disabled={isLoading}
                    />
                  )}
                />
              </Grid>



              {/* Admission Info */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ 
                  p: 3, 
                  bgcolor: 'var(--color-bg-subtle)', 
                  borderRadius: '16px', 
                  border: '1px solid var(--color-border-default)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'var(--color-text-primary)', mb: 2 }}>Fees Summary</Typography>
                  <Divider sx={{ mb: 3, borderColor: 'var(--color-border-subtle)' }} />
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ p: 2, bgcolor: 'var(--color-bg-primary)', borderRadius: '12px', border: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admission Fee</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>₹ {activeSchool?.admissionFee || 0}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ p: 2, bgcolor: 'var(--color-bg-primary)', borderRadius: '12px', border: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Class {selectedFeeCycle === 'YEARLY' ? 'Yearly' : 'Monthly'} Fee</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>₹ {selectedFeeCycle === 'YEARLY' ? (selectedClass?.yearlyFee || 0) : (selectedClass?.monthlyFee || 0)}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box sx={{ p: 2, bgcolor: 'var(--color-primary-main)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: 0.5, color: 'white', boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>Total Due Now</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          ₹ {(activeSchool?.admissionFee || 0) + (selectedFeeCycle === 'YEARLY' ? (selectedClass?.yearlyFee || 0) : (selectedClass?.monthlyFee || 0))}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

            </Grid>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid var(--color-border-default)', pt: 2 }}>
        {activeStep === 0 ? (
          <>
            <Button onClick={onClose} variant="outlined" color="secondary" sx={{ textTransform: 'none' }} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleNext} variant="contained" color="primary" sx={{ textTransform: 'none' }} disabled={isLoading}>
              Next
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleBack} variant="outlined" color="secondary" sx={{ textTransform: 'none' }} disabled={isLoading}>
              Back
            </Button>
            <Button onClick={handleSubmit(onFormSubmit)} variant="contained" color="primary" sx={{ textTransform: 'none' }} disabled={isLoading}>
              {userId ? 'Save Changes' : 'Add Student'}
            </Button>
          </>
        )}
      </DialogActions>
    </LocalizationProvider>
  );
}

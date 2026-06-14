/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MdSave as Save, MdSettings as SettingsIcon } from 'react-icons/md';

import { useAppTheme } from '../../../features/themes/components/AppThemeProvider';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { FormSelectField, FormTextField } from '@common/Forms';
import { useGetAttendanceSettingsQuery, useUpdateAttendanceSettingsMutation } from '../../../api/attendanceApi';
import { useAuth } from '@common/hooks/useAuth';
import { useGetSchoolsQuery } from '@api/schoolsApi';

const settingsSchema = yup.object({
  studentAttendanceMode: yup.string().oneOf(['MANUAL', 'RFID', 'HYBRID']).required('Mode is required'),
  teacherAttendanceMode: yup.string().oneOf(['MANUAL', 'RFID', 'HYBRID']).required('Mode is required'),
  lateAfterTime: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Must be in HH:MM format').required('Required'),
  halfDayAfterTime: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Must be in HH:MM format').required('Required'),
  autoAbsentAfterTime: yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Must be in HH:MM format').required('Required'),
  allowTeacherCorrection: yup.boolean().required(),
  requireAdminApprovalForCorrection: yup.boolean().required(),
  notifyParentsOnAbsent: yup.boolean().required(),
  notifyParentsOnLate: yup.boolean().required(),
});

type SettingsFormValues = yup.InferType<typeof settingsSchema>;

export default function AttendanceSettingsPage() {
  const { mode } = useAppTheme();
  const notifier = useNotifier();
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';

  // Schools for Super Admin
  const { data: schoolsRes } = useGetSchoolsQuery(undefined, { skip: !isSuperAdmin });
  const schools = schoolsRes?.success ? schoolsRes.data : [];

  const [selectedSchoolId, setSelectedSchoolId] = React.useState<string>('');

  // Set default selected school when schools load
  React.useEffect(() => {
    if (isSuperAdmin && schools.length > 0 && !selectedSchoolId) {
      setSelectedSchoolId(schools[0]._id);
    }
  }, [isSuperAdmin, schools, selectedSchoolId]);

  const { data: settings, isLoading, isError } = useGetAttendanceSettingsQuery(
    isSuperAdmin && selectedSchoolId ? { schoolId: selectedSchoolId } : undefined,
    { skip: isSuperAdmin && !selectedSchoolId }
  );
  const [updateSettings, { isLoading: isSaving }] = useUpdateAttendanceSettingsMutation();

  const methods = useForm<SettingsFormValues>({
    resolver: yupResolver(settingsSchema),
    defaultValues: {
      studentAttendanceMode: 'MANUAL',
      teacherAttendanceMode: 'MANUAL',
      lateAfterTime: '08:30',
      halfDayAfterTime: '12:00',
      autoAbsentAfterTime: '14:00',
      allowTeacherCorrection: true,
      requireAdminApprovalForCorrection: false,
      notifyParentsOnAbsent: false,
      notifyParentsOnLate: false,
    }
  });

  // Load values when API resolves
  React.useEffect(() => {
    if (settings) {
      methods.reset({
        studentAttendanceMode: settings.studentAttendanceMode,
        teacherAttendanceMode: settings.teacherAttendanceMode,
        lateAfterTime: settings.lateAfterTime || '08:30',
        halfDayAfterTime: settings.halfDayAfterTime || '12:00',
        autoAbsentAfterTime: settings.autoAbsentAfterTime || '14:00',
        allowTeacherCorrection: settings.allowTeacherCorrection,
        requireAdminApprovalForCorrection: settings.requireAdminApprovalForCorrection,
        notifyParentsOnAbsent: settings.notifyParentsOnAbsent,
        notifyParentsOnLate: settings.notifyParentsOnLate,
      });
    }
  }, [settings, methods]);

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      await updateSettings({
        ...values,
        ...(isSuperAdmin && selectedSchoolId ? { schoolId: selectedSchoolId } : {}),
      }).unwrap();
      notifier.showSuccess('School attendance settings saved successfully');
    } catch (err) {
      console.error(err);
      notifier.showError('Failed to save settings');
    }
  };

  if (isLoading && (!isSuperAdmin || selectedSchoolId)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">Failed to load attendance settings. Please try again later.</Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Attendance Settings
      </Typography>

      {isSuperAdmin && schools.length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Select School:
          </Typography>
          <FormControl sx={{ minWidth: 300 }} size="small">
            <InputLabel id="school-select-label">School</InputLabel>
            <Select
              labelId="school-select-label"
              id="school-select"
              value={selectedSchoolId}
              label="School"
              onChange={(e) => setSelectedSchoolId(e.target.value as string)}
            >
              {schools.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name} ({s.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {(!isSuperAdmin || selectedSchoolId) && (
        <Paper sx={{ p: 4, borderRadius: 3, background: mode === 'dark' ? '#1E1E1E' : '#FFF', maxWidth: 800 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <SettingsIcon color="#7C3AED" /> School Rules Configuration
          </Typography>

          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormSelectField
                    name="studentAttendanceMode"
                    label="Student Attendance Mode (Locked)"
                    control={methods.control}
                    disabled={true}
                    options={[
                      { label: 'Manual Classroom Check', value: 'MANUAL' },
                    ]}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormSelectField
                    name="teacherAttendanceMode"
                    label="Teacher Attendance Mode (Locked)"
                    control={methods.control}
                    disabled={true}
                    options={[
                      { label: 'Manual Admin Entry', value: 'MANUAL' },
                    ]}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <FormTextField
                    name="lateAfterTime"
                    label="Mark Late Threshold (HH:MM)"
                    placeholder="e.g. 08:30"
                    control={methods.control}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <FormTextField
                    name="halfDayAfterTime"
                    label="Half Day Threshold (HH:MM)"
                    placeholder="e.g. 12:00"
                    control={methods.control}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <FormTextField
                    name="autoAbsentAfterTime"
                    label="Auto Absent Threshold (HH:MM)"
                    placeholder="e.g. 14:00"
                    control={methods.control}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                    Parent Alerts & Notifications
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={methods.watch('notifyParentsOnAbsent')}
                            onChange={(e) => methods.setValue('notifyParentsOnAbsent', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="SMS/Alert Parents if Student is Absent"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={methods.watch('notifyParentsOnLate')}
                            onChange={(e) => methods.setValue('notifyParentsOnLate', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="SMS/Alert Parents if Student is Late"
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                    Attendance Correction Privileges
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={methods.watch('allowTeacherCorrection')}
                            onChange={(e) => methods.setValue('allowTeacherCorrection', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Allow Teachers to Modify Attendance"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={methods.watch('requireAdminApprovalForCorrection')}
                            onChange={(e) => methods.setValue('requireAdminApprovalForCorrection', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Require Admin Approval for Corrections"
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Save />}
                    disabled={isSaving}
                    sx={{ py: 1.2, px: 4, borderRadius: 2 }}
                  >
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </FormProvider>
        </Paper>
      )}
    </Box>
  );
}

/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  Card,
  CardContent,
  FormControl,
  InputLabel,
} from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MdSave as Save, MdPeople as People, MdCheckCircle as PresentIcon, MdCancel as AbsentIcon, MdHourglassEmpty as PendingIcon } from 'react-icons/md';
import dayjs from 'dayjs';

import { useAppTheme } from '../../../features/themes/components/AppThemeProvider';
import { FormTextField } from '@common/Forms';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { useGetUsersQuery } from '@api/usersApi';
import { useGetTeacherAttendanceQuery, useBulkMarkTeacherAttendanceMutation } from '../../../api/attendanceApi';
import type { AttendanceStatus } from '../types/attendance.types';
import { useAuth } from '@common/hooks/useAuth';
import { useGetSchoolsQuery } from '@api/schoolsApi';

const filterSchema = yup.object({
  date: yup.date().required('Date is required'),
});

type FilterFormValues = yup.InferType<typeof filterSchema>;

const statusOptions = [
  { value: 'PRESENT', label: 'Present', color: 'success.main' },
  { value: 'ABSENT', label: 'Absent', color: 'error.main' },
  { value: 'LATE', label: 'Late', color: 'warning.main' },
  { value: 'HALF_DAY', label: 'Half Day', color: 'info.main' },
  { value: 'ON_LEAVE', label: 'On Leave', color: 'secondary.main' },
];

export default function TeacherAttendancePage() {
  const { mode } = useAppTheme();
  const notifier = useNotifier();
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';

  // Schools for Super Admin
  const { data: schoolsRes } = useGetSchoolsQuery(undefined, { skip: !isSuperAdmin });
  const schools = schoolsRes?.success ? schoolsRes.data : [];

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');

  // Set default selected school when schools load
  React.useEffect(() => {
    if (isSuperAdmin && schools.length > 0 && !selectedSchoolId) {
      setSelectedSchoolId(schools[0]._id);
    }
  }, [isSuperAdmin, schools, selectedSchoolId]);

  const [activeDate, setActiveDate] = useState<string | null>(null);

  const methods = useForm<FilterFormValues>({
    resolver: yupResolver(filterSchema),
    defaultValues: {
      date: new Date(),
    },
  });

  // Reset filters and active date when school changes
  React.useEffect(() => {
    setActiveDate(null);
    methods.reset({
      date: new Date(),
    });
  }, [selectedSchoolId, methods]);

  // Fetch all teachers
  const { data: usersRes, isFetching: isFetchingTeachers } = useGetUsersQuery(
    { 
      role: 'TEACHER',
      ...(isSuperAdmin && selectedSchoolId ? { schoolId: selectedSchoolId } : {})
    },
    { skip: !activeDate }
  );
  const teachersData = usersRes?.success ? usersRes.data : [];

  // Fetch existing attendance records
  const { data: attendanceData, isFetching: isFetchingAttendance } = useGetTeacherAttendanceQuery(
    { 
      date: activeDate || '',
      ...(isSuperAdmin && selectedSchoolId ? { schoolId: selectedSchoolId } : {})
    },
    { skip: !activeDate }
  );

  const [bulkMark, { isLoading: isSaving }] = useBulkMarkTeacherAttendanceMutation();

  const [attendanceState, setAttendanceState] = useState<
    Record<string, { status: AttendanceStatus; checkInTime: string; checkOutTime: string; remarks: string }>
  >({});

  // Initialize state
  React.useEffect(() => {
    if (teachersData && attendanceData && activeDate) {
      const newState: typeof attendanceState = {};

      teachersData.forEach((teacher) => {
        const existing = attendanceData.find(
          (a) => typeof a.personId === 'object' && a.personId._id === teacher._id
        );

        if (existing) {
          newState[teacher._id] = {
            status: existing.status,
            checkInTime: existing.checkInTime ? dayjs(existing.checkInTime).format('HH:mm') : '',
            checkOutTime: existing.checkOutTime ? dayjs(existing.checkOutTime).format('HH:mm') : '',
            remarks: existing.remarks || '',
          };
        } else {
          newState[teacher._id] = {
            status: 'PRESENT',
            checkInTime: '08:30',
            checkOutTime: '15:30',
            remarks: '',
          };
        }
      });

      setAttendanceState(newState);
    }
  }, [teachersData, attendanceData, activeDate]);

  const onSubmitFilters = (values: FilterFormValues) => {
    setActiveDate(dayjs(values.date).format('YYYY-MM-DD'));
  };

  const handleStatusChange = (teacherId: string, status: AttendanceStatus) => {
    setAttendanceState((prev) => ({
      ...prev,
      [teacherId]: { ...prev[teacherId], status },
    }));
  };

  const handleFieldChange = (teacherId: string, field: 'checkInTime' | 'checkOutTime' | 'remarks', value: string) => {
    setAttendanceState((prev) => ({
      ...prev,
      [teacherId]: { ...prev[teacherId], [field]: value },
    }));
  };

  const handleBulkSetStatus = (status: AttendanceStatus) => {
    setAttendanceState((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = { ...updated[id], status };
      });
      return updated;
    });
  };

  const handleSaveAttendance = async () => {
    if (!activeDate || !teachersData) return;

    try {
      const records = teachersData.map((teacher) => {
        const state = attendanceState[teacher._id] || {
          status: 'PRESENT' as AttendanceStatus,
          checkInTime: '',
          checkOutTime: '',
          remarks: '',
        };

        // Construct complete datetime ISO strings
        const checkInTime = state.checkInTime ? `${activeDate}T${state.checkInTime}:00` : undefined;
        const checkOutTime = state.checkOutTime ? `${activeDate}T${state.checkOutTime}:00` : undefined;

        return {
          teacherId: teacher._id,
          status: state.status,
          checkInTime,
          checkOutTime,
          remarks: state.remarks,
        };
      });

      await bulkMark({
        date: activeDate,
        records,
        ...(isSuperAdmin && selectedSchoolId ? { schoolId: selectedSchoolId } : {}),
      }).unwrap();

      notifier.showSuccess('Teacher attendance saved successfully');
    } catch (err) {
      console.error(err);
      notifier.showError('Failed to save teacher attendance');
    }
  };

  // Compute metrics
  const stats = React.useMemo(() => {
    if (!teachersData || Object.keys(attendanceState).length === 0) return null;
    const total = teachersData.length;
    const present = Object.values(attendanceState).filter((r) => r.status === 'PRESENT' || r.status === 'LATE' || r.status === 'HALF_DAY').length;
    const absent = Object.values(attendanceState).filter((r) => r.status === 'ABSENT').length;
    const leave = Object.values(attendanceState).filter((r) => r.status === 'ON_LEAVE').length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, leave, pct };
  }, [teachersData, attendanceState]);

  const isFetching = isFetchingTeachers || isFetchingAttendance;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Teacher Attendance
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
        <>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3, background: mode === 'dark' ? '#1E1E1E' : '#FFF' }}>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmitFilters)}>
                <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <FormTextField
                      name="date"
                      label="Select Attendance Date"
                      type="date"
                      control={methods.control}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      sx={{ py: 1.5, borderRadius: 2 }}
                    >
                      Load Staff List
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </FormProvider>
          </Paper>

          {activeDate && stats && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main', display: 'flex' }}>
                      <People size={24} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Total Staff</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{stats.total}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.light', color: 'success.main', display: 'flex' }}>
                      <PresentIcon size={24} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Present</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{stats.present}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'error.light', color: 'error.main', display: 'flex' }}>
                      <AbsentIcon size={24} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Absent</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{stats.absent}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.main', display: 'flex' }}>
                      <PendingIcon size={24} />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">On Leave</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{stats.leave}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeDate && (
            <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', background: mode === 'dark' ? '#1E1E1E' : '#FFF' }}>
              {isFetching ? (
                <Box sx={{ p: 5, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              ) : teachersData && teachersData.length > 0 ? (
                <Box>
                  <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 1.5, flexWrap: 'wrap', bgcolor: mode === 'dark' ? '#2A2A2A' : '#F9F9F9' }}>
                    <Typography variant="subtitle2" sx={{ alignSelf: 'center', mr: 2, fontWeight: 'bold' }}>
                      Bulk Status Actions:
                    </Typography>
                    <Button variant="outlined" color="success" size="small" onClick={() => handleBulkSetStatus('PRESENT')}>
                      Mark All Present
                    </Button>
                    <Button variant="outlined" color="error" size="small" onClick={() => handleBulkSetStatus('ABSENT')}>
                      Mark All Absent
                    </Button>
                  </Box>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell width="12%"><strong>Staff Code</strong></TableCell>
                          <TableCell width="22%"><strong>Name</strong></TableCell>
                          <TableCell width="18%"><strong>Status</strong></TableCell>
                          <TableCell width="14%"><strong>Check In</strong></TableCell>
                          <TableCell width="14%"><strong>Check Out</strong></TableCell>
                          <TableCell width="20%"><strong>Remarks</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {teachersData.map((teacher) => {
                          const state = attendanceState[teacher._id] || {
                            status: 'PRESENT',
                            checkInTime: '',
                            checkOutTime: '',
                            remarks: '',
                          };

                          return (
                            <TableRow key={teacher._id} hover>
                              <TableCell>{teacher.userCode}</TableCell>
                              <TableCell>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                  {teacher.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {teacher.email}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Select
                                  size="small"
                                  fullWidth
                                  value={state.status}
                                  onChange={(e) => handleStatusChange(teacher._id, e.target.value as AttendanceStatus)}
                                  sx={{
                                    '& .MuiSelect-select': {
                                      color: statusOptions.find((o) => o.value === state.status)?.color,
                                      fontWeight: 'bold',
                                    },
                                  }}
                                >
                                  {statusOptions.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </TableCell>
                              <TableCell>
                                <TextField
                                  type="time"
                                  size="small"
                                  fullWidth
                                  value={state.checkInTime}
                                  onChange={(e) => handleFieldChange(teacher._id, 'checkInTime', e.target.value)}
                                  disabled={state.status === 'ABSENT' || state.status === 'ON_LEAVE'}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  type="time"
                                  size="small"
                                  fullWidth
                                  value={state.checkOutTime}
                                  onChange={(e) => handleFieldChange(teacher._id, 'checkOutTime', e.target.value)}
                                  disabled={state.status === 'ABSENT' || state.status === 'ON_LEAVE'}
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  placeholder="Optional remarks"
                                  size="small"
                                  fullWidth
                                  value={state.remarks}
                                  onChange={(e) => handleFieldChange(teacher._id, 'remarks', e.target.value)}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<Save />}
                      onClick={handleSaveAttendance}
                      disabled={isSaving}
                      sx={{ borderRadius: 2, px: 4 }}
                    >
                      {isSaving ? 'Saving...' : 'Save Teacher Attendance'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ p: 5 }}>
                  <Alert severity="info">No teachers found in the system.</Alert>
                </Box>
              )}
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}

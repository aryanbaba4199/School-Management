/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
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
import { MdSave as Save } from 'react-icons/md';
import dayjs from 'dayjs';

import { useAppTheme } from '../../../features/themes/components/AppThemeProvider';
import { FormSelectField, FormTextField } from '@common/Forms';
import { useNotifier } from '@common/Notifier/NotifierProvider';

import { useClasses } from '../../school-management/classes/hooks/useClasses';
import { useGetUsersQuery } from '@api/usersApi';
import { useGetStudentAttendanceQuery, useBulkMarkStudentAttendanceMutation } from '../../../api/attendanceApi';
import type { AttendanceStatus } from '../types/attendance.types';
import { StudentAttendanceTable } from '../components/StudentAttendanceTable';
import { useAuth } from '@common/hooks/useAuth';
import { useGetSchoolsQuery } from '@api/schoolsApi';

const filterSchema = yup.object({
  classId: yup.string().required('Class is required'),
  sectionId: yup.string().required('Section is required'),
  date: yup.date().required('Date is required'),
});

type FilterFormValues = yup.InferType<typeof filterSchema>;

export default function StudentAttendancePage() {
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

  const [activeFilters, setActiveFilters] = useState<{
    classId: string;
    sectionId: string;
    date: string;
  } | null>(null);

  const methods = useForm<FilterFormValues>({
    resolver: yupResolver(filterSchema),
    defaultValues: {
      date: new Date(),
    },
  });

  // Reset filters and form when school changes
  React.useEffect(() => {
    setActiveFilters(null);
    methods.reset({
      classId: '',
      sectionId: '',
      date: new Date(),
    });
  }, [selectedSchoolId, methods]);

  const { classes: classesData, isLoading: isLoadingClasses } = useClasses(
    isSuperAdmin && selectedSchoolId ? selectedSchoolId : undefined
  );
  
  const selectedClassId = methods.watch('classId');
  
  const filteredSections = useMemo(() => {
    if (!classesData || !selectedClassId) return [];
    const selectedClass = classesData.find(c => c._id === selectedClassId);
    return selectedClass?.sections || [];
  }, [classesData, selectedClassId]);

  const { data: usersRes, isFetching: isFetchingStudents } = useGetUsersQuery(
    { 
      role: 'STUDENT', 
      classId: activeFilters?.classId, 
      sectionId: activeFilters?.sectionId,
      ...(isSuperAdmin && selectedSchoolId ? { schoolId: selectedSchoolId } : {})
    },
    { skip: !activeFilters }
  );

  const studentsData = usersRes?.success ? usersRes.data : [];

  // Fetch existing attendance for the class/section/date
  const { data: attendanceData, isFetching: isFetchingAttendance } = useGetStudentAttendanceQuery(
    activeFilters
      ? { ...activeFilters, ...(isSuperAdmin && selectedSchoolId ? { schoolId: selectedSchoolId } : {}) }
      : { classId: '', sectionId: '', date: '' },
    { skip: !activeFilters }
  );

  const [bulkMark, { isLoading: isSaving }] = useBulkMarkStudentAttendanceMutation();

  const [attendanceState, setAttendanceState] = useState<Record<string, { status: AttendanceStatus; remarks?: string }>>({});

  // Initialize attendance state when data arrives
  React.useEffect(() => {
    if (studentsData && attendanceData && activeFilters) {
      const newState: Record<string, { status: AttendanceStatus; remarks?: string }> = {};
      
      studentsData.forEach(student => {
        // Find existing record
        const existing = attendanceData.find(a => 
          typeof a.personId === 'object' && a.personId._id === student._id
        );
        
        if (existing) {
          newState[student._id] = { status: existing.status, remarks: existing.remarks };
        } else {
          // Default to PRESENT for unmarked
          newState[student._id] = { status: 'PRESENT' };
        }
      });
      
      setAttendanceState(newState);
    }
  }, [studentsData, attendanceData, activeFilters]);

  const onSubmitFilters = (values: FilterFormValues) => {
    setActiveFilters({
      classId: values.classId,
      sectionId: values.sectionId,
      date: dayjs(values.date).format('YYYY-MM-DD'),
    });
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks }
    }));
  };

  const handleSaveAttendance = async () => {
    if (!activeFilters || !studentsData) return;

    try {
      const records = studentsData.map(student => {
        const state = attendanceState[student._id] || { status: 'PRESENT' as AttendanceStatus };
        return {
          studentId: student._id,
          status: state.status,
          remarks: state.remarks,
        };
      });

      await bulkMark({
        classId: activeFilters.classId,
        sectionId: activeFilters.sectionId,
        date: activeFilters.date,
        records,
        ...(isSuperAdmin && selectedSchoolId ? { schoolId: selectedSchoolId } : {}),
      }).unwrap();

      notifier.showSuccess('Attendance saved successfully');
    } catch (err) {
      console.error(err);
      notifier.showError('Failed to save attendance');
    }
  };

  const isFetching = isFetchingStudents || isFetchingAttendance;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Student Attendance
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
                <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <FormSelectField
                      name="classId"
                      label="Select Class"
                      control={methods.control}
                      options={classesData?.map((c: any) => ({ label: c.name, value: c._id })) || []}
                      disabled={isLoadingClasses}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <FormSelectField
                      name="sectionId"
                      label="Select Section"
                      control={methods.control}
                      options={filteredSections.map((s: any) => ({ label: s.name, value: s._id }))}
                      disabled={!selectedClassId}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormTextField
                      name="date"
                      label="Attendance Date"
                      type="date"
                      control={methods.control}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 2 }}>
                    <Box sx={{ mt: 1 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ py: 1.5, borderRadius: 2 }}
                      >
                        Load Students
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </FormProvider>
          </Paper>

          {activeFilters && (
            <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', background: mode === 'dark' ? '#1E1E1E' : '#FFF' }}>
              {isFetching ? (
                <Box sx={{ p: 5, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              ) : studentsData && studentsData.length > 0 ? (
                <Box>
                  <StudentAttendanceTable
                    students={studentsData}
                    attendanceState={attendanceState}
                    onStatusChange={handleStatusChange}
                    onRemarksChange={handleRemarksChange}
                  />
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
                      {isSaving ? 'Saving...' : 'Save Attendance'}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ p: 5 }}>
                  <Alert severity="info">No students found for the selected class and section.</Alert>
                </Box>
              )}
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}

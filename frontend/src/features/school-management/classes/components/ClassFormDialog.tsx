import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { FaTrash, FaPlus, FaInfoCircle } from 'react-icons/fa';

import { FormTextField, FormSelectField, FormAutocompleteField } from '@common/Forms';

import { useGetSchoolsQuery, useGetSchoolByIdQuery } from '../../../../api/schoolsApi';
import { useGetUsersQuery } from '../../../../api/usersApi';
import { useGetClassByIdQuery } from '../../../../api/classesApi';
import { useGetSubjectsQuery } from '../../../../api/subjectsApi';
import { useAuth } from '@common/hooks/useAuth';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { classSchema } from '../schema/class.schema';
import type { ClassFormData } from '../types/classes.types';

interface ClassFormDialogProps {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    sections: string[];
    schoolId?: string;
    classTeacherId?: string;
    subjects?: string[];
    monthlyFee?: number;
    yearlyFee?: number;
    schedule?: { startTime: string; endTime: string; subjectId: string; teacherId: string }[];
  }) => void;
  classId?: string;
  isLoading?: boolean;
}

function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function formatMinutesToHours(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs} hr ${mins} min`;
}
export function ClassFormDialog({ onClose, onSubmit, classId, isLoading = false }: ClassFormDialogProps) {
  const { data: classRes, isLoading: isClassLoading } = useGetClassByIdQuery(classId!, { skip: !classId });
  const classItem = classRes?.success ? classRes.data : null;

  const { user } = useAuth();
  const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';
  const notifier = useNotifier();

  const { data: schoolsRes } = useGetSchoolsQuery(undefined, { skip: !isSuperAdmin });
  const schoolOptions = (schoolsRes?.success ? schoolsRes.data : []).map((s) => ({
    value: s._id,
    label: `${s.name} (${s.code})`,
  }));

  const { handleSubmit, control, reset, watch } = useForm<ClassFormData>({
    resolver: yupResolver(classSchema) as unknown as Resolver<ClassFormData>,
    defaultValues: {
      name: '',
      sections: 'A',
      schoolId: '',
      classTeacherId: '',
      subjects: [],
      monthlyFee: 0,
      yearlyFee: 0,
      schedule: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'schedule',
  });

  const watchedSchoolId = watch('schoolId');
  const activeSchoolId = isSuperAdmin ? watchedSchoolId : user?.schoolId;

  // Fetch School Details for timings
  const { data: activeSchoolRes } = useGetSchoolByIdQuery(activeSchoolId || '', { skip: !activeSchoolId });
  const schoolStart = activeSchoolRes?.data?.startTime || '08:00';
  const schoolEnd = activeSchoolRes?.data?.endTime || '13:00';
  const schoolShift = activeSchoolRes?.data?.shift || 'Morning Shift';
  const schoolStartMin = parseTimeToMinutes(schoolStart);
  const schoolEndMin = parseTimeToMinutes(schoolEnd);
  const schoolDurationMin = Math.max(0, schoolEndMin - schoolStartMin);

  // Fetch Teachers and Subjects for dropdowns
  const { data: teachersRes } = useGetUsersQuery({ role: 'TEACHER', limit: 100 });
  const teacherOptions = (teachersRes?.success ? teachersRes.data : []).map((t) => ({
    value: t._id,
    label: t.name,
  }));

  const { data: subjectsRes } = useGetSubjectsQuery();
  const subjectOptions = (subjectsRes?.success ? subjectsRes.data : []).map((s) => ({
    value: s._id,
    label: `${s.name} (${s.code})`,
  }));

  // Watch schedule to calculate total scheduled time
  const watchedSchedule = watch('schedule') || [];
  const totalScheduledMinutes = watchedSchedule.reduce((sum, period) => {
    const start = parseTimeToMinutes(period.startTime);
    const end = parseTimeToMinutes(period.endTime);
    return sum + Math.max(0, end - start);
  }, 0);

  useEffect(() => {
    if (classItem) {
      reset({
        name: classItem.name,
        sections: classItem.sections ? classItem.sections.map((s: any) => s.name).join(', ') : 'A',
        schoolId: typeof classItem.schoolId === 'object' ? (classItem.schoolId as { _id: string })._id : classItem.schoolId || '',
        classTeacherId: typeof classItem.classTeacherId === 'object' ? (classItem.classTeacherId as { _id: string })._id : classItem.classTeacherId || '',
        subjects: classItem.subjects?.map((s: any) => typeof s === 'object' ? s._id : s) || [],
        monthlyFee: classItem.monthlyFee || 0,
        yearlyFee: classItem.yearlyFee || 0,
        schedule: classItem.schedule?.map((s: any) => ({
          startTime: s.startTime,
          endTime: s.endTime,
          subjectId: typeof s.subjectId === 'object' ? s.subjectId._id : s.subjectId,
          teacherId: typeof s.teacherId === 'object' ? s.teacherId._id : s.teacherId,
        })) || [],
      });
    }
  }, [classItem, reset]);

  const onFormSubmit = (formData: ClassFormData) => {
    const sectionList = formData.sections
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Operational timings validation
    if (activeSchoolId && schoolDurationMin > 0) {
      let currentSum = 0;
      for (let i = 0; i < (formData.schedule || []).length; i++) {
        const period = formData.schedule![i];
        const start = parseTimeToMinutes(period.startTime);
        const end = parseTimeToMinutes(period.endTime);

        if (end <= start) {
          notifier.showError(`Period #${i + 1}: End time must be after start time.`);
          return;
        }

        if (start < schoolStartMin || end > schoolEndMin) {
          notifier.showError(
            `Period #${i + 1}: Timing (${period.startTime} - ${period.endTime}) must fit within school operational hours (${schoolStart} - ${schoolEnd}).`
          );
          return;
        }

        currentSum += end - start;
      }

      if (currentSum !== schoolDurationMin) {
        notifier.showError(
          `The sum of all period durations (${formatMinutesToHours(currentSum)}) must equal the school's operational duration (${formatMinutesToHours(schoolDurationMin)}).`
        );
        return;
      }
    }

    onSubmit({
      name: formData.name,
      sections: sectionList,
      classTeacherId: formData.classTeacherId || undefined,
      subjects: formData.subjects,
      monthlyFee: formData.monthlyFee || 0,
      yearlyFee: formData.yearlyFee || 0,
      schedule: formData.schedule || undefined,
      ...(isSuperAdmin && formData.schoolId ? { schoolId: formData.schoolId } : {}),
    });
  };

  if (isClassLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, minHeight: 300, alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid var(--color-border-default)', pb: 2 }}>
        {classId ? 'Edit Class Details' : 'Add New Class'}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2, minWidth: { md: 650 } }}>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={2.5}>
            {isSuperAdmin && (
              <Grid size={{ xs: 12 }}>
                <FormSelectField
                  name="schoolId"
                  control={control}
                  label="Institute *"
                  options={schoolOptions}
                  disabled={isLoading}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="name" control={control} label="Class Name (e.g. Class 10)" required disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="sections" control={control} label="Sections (comma-separated, e.g. A, B, C)" required disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormSelectField
                name="classTeacherId"
                control={control}
                label="Class Teacher"
                options={teacherOptions}
                disabled={isLoading}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormAutocompleteField
                name="subjects"
                control={control}
                label="Subjects"
                options={subjectOptions}
                multiple
                disabled={isLoading}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="monthlyFee" type="number" control={control} label="Monthly Fee (₹)" disabled={isLoading} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="yearlyFee" type="number" control={control} label="Yearly Fee (₹)" disabled={isLoading} />
            </Grid>

            {/* School Timing Banner */}
            {activeSchoolId && activeSchoolRes?.data && (
              <Grid size={{ xs: 12 }}>
                <Alert severity={totalScheduledMinutes === schoolDurationMin ? 'success' : 'info'} sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    School Shift: {schoolShift} ({schoolStart} - {schoolEnd})
                  </Typography>
                  <Typography variant="caption" display="block">
                    Operational Duration: <strong>{formatMinutesToHours(schoolDurationMin)}</strong> | Scheduled: <strong>{formatMinutesToHours(totalScheduledMinutes)}</strong>
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Timetable schedule array fields */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Class Periods Timing Schedule
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<FaPlus />}
                  onClick={() => append({ startTime: '08:00', endTime: '09:00', subjectId: '', teacherId: '' })}
                  disabled={isLoading || !activeSchoolId}
                  sx={{ textTransform: 'none', borderRadius: '6px' }}
                >
                  Add Period
                </Button>
              </Box>

              {fields.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', color: 'var(--color-text-secondary)', borderStyle: 'dashed' }}>
                  {activeSchoolId ? 'No timetable periods configured yet. Click "Add Period" to start.' : 'Please select an Institute to configure timing periods.'}
                </Paper>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Start</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>End</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            Teacher
                            <Tooltip title="Only selected subject teacher will show here, you can update teacher subject if any teacher missing here" arrow>
                              <IconButton size="small" sx={{ p: 0, color: 'var(--color-text-secondary)' }}>
                                <FaInfoCircle size={13} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, width: 50 }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fields.map((field, index) => {
                        const periodSubjectId = watch(`schedule.${index}.subjectId`);

                        const rowTeacherOptions = (teachersRes?.success ? teachersRes.data : [])
                          .filter((t) => {
                            if (!periodSubjectId) return true;
                            return t.subjects?.some((s) => {
                              const id = typeof s === 'object' ? s._id : s;
                              return id === periodSubjectId;
                            });
                          })
                          .map((t) => ({
                            value: t._id,
                            label: t.name,
                          }));

                        return (
                          <TableRow key={field.id}>
                            <TableCell sx={{ py: 1 }}>
                              <FormTextField
                                name={`schedule.${index}.startTime`}
                                control={control}
                                label=""
                                type="time"
                                disabled={isLoading}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 1 }}>
                              <FormTextField
                                name={`schedule.${index}.endTime`}
                                control={control}
                                label=""
                                type="time"
                                disabled={isLoading}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 1, minWidth: 150 }}>
                              <FormSelectField
                                name={`schedule.${index}.subjectId`}
                                control={control}
                                label=""
                                options={subjectOptions}
                                disabled={isLoading}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 1, minWidth: 180 }}>
                              <FormSelectField
                                name={`schedule.${index}.teacherId`}
                                control={control}
                                label=""
                                options={rowTeacherOptions}
                                disabled={isLoading || !periodSubjectId}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1 }}>
                              <IconButton color="error" size="small" onClick={() => remove(index)} disabled={isLoading}>
                                <FaTrash size={14} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid var(--color-border-default)', pt: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onFormSubmit)} variant="contained" color="primary" sx={{ textTransform: 'none' }} disabled={isLoading}>
          {classId ? 'Save Changes' : 'Add Class'}
        </Button>
      </DialogActions>
    </>
  );
}

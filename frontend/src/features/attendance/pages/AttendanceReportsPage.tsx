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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { MdDownload as Download, MdDateRange as CalendarIcon, MdToday as DailyIcon } from 'react-icons/md';
import dayjs from 'dayjs';

import { useAppTheme } from '../../../features/themes/components/AppThemeProvider';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { useClasses } from '../../school-management/classes/hooks/useClasses';
import { useGetDailyReportQuery, useGetMonthlyReportQuery } from '../../../api/attendanceApi';
import { useAuth } from '@common/hooks/useAuth';
import { useGetSchoolsQuery } from '@api/schoolsApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AttendanceReportsPage() {
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

  const [tabValue, setTabValue] = useState(0);

  // Daily Report filters
  const [dailyDate, setDailyDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [dailyPersonType, setDailyPersonType] = useState<'STUDENT' | 'TEACHER'>('STUDENT');

  // Monthly Report filters
  const [monthlyYear, setMonthlyYear] = useState(dayjs().year());
  const [monthlyMonth, setMonthlyMonth] = useState(dayjs().month() + 1);
  const [monthlyPersonType, setMonthlyPersonType] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [monthlyClassId, setMonthlyClassId] = useState('');
  const [monthlySectionId, setMonthlySectionId] = useState('');

  // Reset filters when school changes
  React.useEffect(() => {
    setDailyDate(dayjs().format('YYYY-MM-DD'));
    setMonthlyClassId('');
    setMonthlySectionId('');
  }, [selectedSchoolId]);

  const { classes: classesData } = useClasses(
    isSuperAdmin && selectedSchoolId ? selectedSchoolId : undefined
  );

  const filteredSections = React.useMemo(() => {
    if (!classesData || !monthlyClassId) return [];
    const selectedClass = classesData.find(c => c._id === monthlyClassId);
    return selectedClass?.sections || [];
  }, [classesData, monthlyClassId]);

  // Daily Report API Query
  const { data: dailyReport, isFetching: isFetchingDaily } = useGetDailyReportQuery(
    {
      date: dailyDate,
      personType: dailyPersonType,
      ...(isSuperAdmin && selectedSchoolId ? { schoolId: selectedSchoolId } : {})
    },
    { skip: isSuperAdmin && !selectedSchoolId }
  );

  // Monthly Report API Query
  const { data: monthlyRecords, isFetching: isFetchingMonthly } = useGetMonthlyReportQuery(
    {
      year: monthlyYear,
      month: monthlyMonth,
      classId: monthlyClassId || undefined,
      sectionId: monthlySectionId || undefined,
      personType: monthlyPersonType,
      ...(isSuperAdmin && selectedSchoolId ? { schoolId: selectedSchoolId } : {})
    },
    { skip: isSuperAdmin && !selectedSchoolId }
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Compile monthly user metrics directly from backend precalculated stats
  const monthlyStats = React.useMemo(() => {
    return monthlyRecords?.stats || [];
  }, [monthlyRecords]);

  // CSV Export helper
  const handleExportDaily = () => {
    if (!dailyReport || dailyReport.records.length === 0) {
      notifier.showError('No records available to export.');
      return;
    }

    const headers = ['User Code', 'Name', 'Role', 'Status', 'Check In', 'Check Out', 'Remarks'];
    const rows = dailyReport.records.map(r => {
      const name = typeof r.personId === 'object' ? r.personId.name : '';
      const code = typeof r.personId === 'object' ? r.personId.userCode : '';
      return [
        code,
        name,
        r.personType,
        r.status,
        r.checkInTime ? dayjs(r.checkInTime).format('HH:mm') : 'N/A',
        r.checkOutTime ? dayjs(r.checkOutTime).format('HH:mm') : 'N/A',
        r.remarks || ''
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Daily_Attendance_${dailyPersonType}_${dailyDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notifier.showSuccess('Daily CSV exported successfully');
  };

  const handleExportMonthly = () => {
    if (monthlyStats.length === 0) {
      notifier.showError('No records available to export.');
      return;
    }

    const headers = ['User Code', 'Name', 'Present Days', 'Absent Days', 'Late Days', 'Half Days', 'Leave Days', 'Total Logged', 'Attendance %'];
    const rows = monthlyStats.map(s => [
      s.userCode || '',
      s.name,
      s.present,
      s.absent,
      s.late,
      s.halfDay,
      s.leave,
      s.totalLogged,
      `${s.attendancePct}%`
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Monthly_Attendance_Summary_${monthlyPersonType}_${monthlyYear}_${monthlyMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notifier.showSuccess('Monthly CSV exported successfully');
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Attendance Analytics & Reports
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
        <Paper sx={{ background: mode === 'dark' ? '#1E1E1E' : '#FFF', borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Daily Attendance Breakdown" icon={<DailyIcon style={{ marginRight: 6 }} />} iconPosition="start" />
              <Tab label="Monthly Summary Analytics" icon={<CalendarIcon style={{ marginRight: 6 }} />} iconPosition="start" />
            </Tabs>
          </Box>

          <Box sx={{ px: 3 }}>
            {/* TAB 1: Daily Report */}
            <CustomTabPanel value={tabValue} index={0}>
              {/* Filter bar */}
              <Grid container spacing={2} sx={{ mb: 4, alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    type="date"
                    label="Select Date"
                    fullWidth
                    value={dailyDate}
                    onChange={(e) => setDailyDate(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Role Context</InputLabel>
                    <Select
                      value={dailyPersonType}
                      label="Role Context"
                      onChange={(e) => setDailyPersonType(e.target.value as 'STUDENT' | 'TEACHER')}
                    >
                      <MenuItem value="STUDENT">Student Attendance</MenuItem>
                      <MenuItem value="TEACHER">Teacher/Staff Attendance</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Download />}
                    onClick={handleExportDaily}
                    disabled={!dailyReport || dailyReport.records.length === 0}
                    sx={{ py: 1.5, borderRadius: 2 }}
                  >
                    Export Daily to CSV
                  </Button>
                </Grid>
              </Grid>

              {/* Metrics */}
              {dailyReport && dailyReport.counts.total > 0 && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Total Logged</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{dailyReport.counts.total}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                    <Card variant="outlined" sx={{ borderRadius: 2, borderLeft: '4px solid green' }}>
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Present</Typography>
                        <Typography variant="h5" color="success.main" sx={{ fontWeight: 'bold' }}>{dailyReport.counts.PRESENT}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                    <Card variant="outlined" sx={{ borderRadius: 2, borderLeft: '4px solid red' }}>
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Absent</Typography>
                        <Typography variant="h5" color="error.main" sx={{ fontWeight: 'bold' }}>{dailyReport.counts.ABSENT}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                    <Card variant="outlined" sx={{ borderRadius: 2, borderLeft: '4px solid orange' }}>
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Late</Typography>
                        <Typography variant="h5" color="warning.main" sx={{ fontWeight: 'bold' }}>{dailyReport.counts.LATE}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                    <Card variant="outlined" sx={{ borderRadius: 2, borderLeft: '4px solid cyan' }}>
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Half Day</Typography>
                        <Typography variant="h5" color="info.main" sx={{ fontWeight: 'bold' }}>{dailyReport.counts.HALF_DAY}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                    <Card variant="outlined" sx={{ borderRadius: 2, borderLeft: '4px solid purple' }}>
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">On Leave</Typography>
                        <Typography variant="h5" color="secondary.main" sx={{ fontWeight: 'bold' }}>{dailyReport.counts.ON_LEAVE + dailyReport.counts.EXCUSED}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* List */}
              {isFetchingDaily ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                  <CircularProgress />
                </Box>
              ) : dailyReport && dailyReport.records.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>User Code</strong></TableCell>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Check-In</strong></TableCell>
                        <TableCell><strong>Check-Out</strong></TableCell>
                        <TableCell><strong>Source</strong></TableCell>
                        <TableCell><strong>Remarks</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dailyReport.records.map((rec) => {
                        const person = typeof rec.personId === 'object' ? rec.personId : { name: 'Unknown', userCode: '' };
                        return (
                          <TableRow key={rec._id} hover>
                            <TableCell sx={{ fontWeight: 'medium' }}>{person.userCode || 'N/A'}</TableCell>
                            <TableCell>{person.name}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={rec.status}
                                color={
                                  rec.status === 'PRESENT' ? 'success' :
                                  rec.status === 'ABSENT' ? 'error' :
                                  rec.status === 'LATE' ? 'warning' :
                                  rec.status === 'HALF_DAY' ? 'info' : 'secondary'
                                }
                              />
                            </TableCell>
                            <TableCell>{rec.checkInTime ? dayjs(rec.checkInTime).format('hh:mm A') : '--'}</TableCell>
                            <TableCell>{rec.checkOutTime ? dayjs(rec.checkOutTime).format('hh:mm A') : '--'}</TableCell>
                            <TableCell><Chip variant="outlined" size="small" label={rec.source} /></TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{rec.remarks || '--'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">No attendance logs found for the selected date.</Alert>
              )}
            </CustomTabPanel>

            {/* TAB 2: Monthly Summary */}
            <CustomTabPanel value={tabValue} index={1}>
              <Grid container spacing={2} sx={{ mb: 4, alignItems: 'center' }}>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Year</InputLabel>
                    <Select value={monthlyYear} label="Year" onChange={(e) => setMonthlyYear(Number(e.target.value))}>
                      <MenuItem value={2026}>2026</MenuItem>
                      <MenuItem value={2025}>2025</MenuItem>
                      <MenuItem value={2024}>2024</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Month</InputLabel>
                    <Select value={monthlyMonth} label="Month" onChange={(e) => setMonthlyMonth(Number(e.target.value))}>
                      {Array.from({ length: 12 }).map((_, idx) => (
                        <MenuItem key={idx + 1} value={idx + 1}>
                          {dayjs().month(idx).format('MMMM')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Role Type</InputLabel>
                    <Select value={monthlyPersonType} label="Role Type" onChange={(e) => {
                      setMonthlyPersonType(e.target.value as 'STUDENT' | 'TEACHER');
                      setMonthlyClassId('');
                      setMonthlySectionId('');
                    }}>
                      <MenuItem value="STUDENT">Students</MenuItem>
                      <MenuItem value="TEACHER">Teachers</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {monthlyPersonType === 'STUDENT' && (
                  <>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>Class</InputLabel>
                        <Select value={monthlyClassId} label="Class" onChange={(e) => {
                          setMonthlyClassId(e.target.value);
                          setMonthlySectionId('');
                        }}>
                          <MenuItem value="">All Classes</MenuItem>
                          {classesData?.map((c: any) => (
                            <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                      <FormControl fullWidth disabled={!monthlyClassId}>
                        <InputLabel>Section</InputLabel>
                        <Select value={monthlySectionId} label="Section" onChange={(e) => setMonthlySectionId(e.target.value)}>
                          <MenuItem value="">All Sections</MenuItem>
                          {filteredSections.map((s: any) => (
                            <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}

                <Grid size={{ xs: 12, md: monthlyPersonType === 'TEACHER' ? 6 : 2 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Download />}
                    onClick={handleExportMonthly}
                    disabled={monthlyStats.length === 0}
                    sx={{ py: 1.5, borderRadius: 2 }}
                  >
                    Export Summary
                  </Button>
                </Grid>
              </Grid>

              {isFetchingMonthly ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                  <CircularProgress />
                </Box>
              ) : monthlyStats.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Member Code</strong></TableCell>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell align="center"><strong>Present</strong></TableCell>
                        <TableCell align="center"><strong>Absent</strong></TableCell>
                        <TableCell align="center"><strong>Late</strong></TableCell>
                        <TableCell align="center"><strong>Half Day</strong></TableCell>
                        <TableCell align="center"><strong>Leave</strong></TableCell>
                        <TableCell align="center"><strong>Total Logs</strong></TableCell>
                        <TableCell align="center"><strong>Attendance %</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monthlyStats.map((stat) => (
                        <TableRow key={stat.userId} hover>
                          <TableCell sx={{ fontWeight: 'medium' }}>{stat.userCode || 'N/A'}</TableCell>
                          <TableCell>{stat.name}</TableCell>
                          <TableCell align="center" sx={{ color: 'success.main', fontWeight: 'bold' }}>{stat.present}</TableCell>
                          <TableCell align="center" sx={{ color: 'error.main', fontWeight: 'bold' }}>{stat.absent}</TableCell>
                          <TableCell align="center" sx={{ color: 'warning.main' }}>{stat.late}</TableCell>
                          <TableCell align="center" sx={{ color: 'info.main' }}>{stat.halfDay}</TableCell>
                          <TableCell align="center" sx={{ color: 'secondary.main' }}>{stat.leave}</TableCell>
                          <TableCell align="center">{stat.totalLogged}</TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={`${stat.attendancePct}%`}
                              color={
                                stat.attendancePct >= 90 ? 'success' :
                                stat.attendancePct >= 75 ? 'warning' : 'error'
                              }
                              sx={{ fontWeight: 'bold' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">No monthly summary data found for the selected options.</Alert>
              )}
            </CustomTabPanel>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

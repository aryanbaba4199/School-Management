/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
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
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import { MdDelete as Delete, MdAdd as Add, MdCellTower as ScanIcon, MdCardMembership as CardIcon } from 'react-icons/md';

import { useAppTheme } from '../../../features/themes/components/AppThemeProvider';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { useGetUsersQuery } from '@api/usersApi';
import {
  useGetRfidCardsQuery,
  useCreateRfidCardMutation,
  useUpdateRfidCardMutation,
  useDeleteRfidCardMutation,
  useScanRfidMutation
} from '../../../api/attendanceApi';
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
      id={`rfid-tabpanel-${index}`}
      aria-labelledby={`rfid-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function RfidAttendancePage() {
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

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [newCardUid, setNewCardUid] = useState('');
  const [assigneeType, setAssigneeType] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [selectedPersonId, setSelectedPersonId] = useState('');

  // Simulator State
  const [simUid, setSimUid] = useState('');
  const [scanLogs, setScanLogs] = useState<{ id: string; time: string; uid: string; msg: string; success: boolean }[]>([]);

  // Fetch registered cards
  const { data: cards, isFetching: isFetchingCards } = useGetRfidCardsQuery(
    isSuperAdmin && selectedSchoolId ? { schoolId: selectedSchoolId } : undefined
  );
  
  // Fetch users for assignment dropdown
  const { data: usersRes, isFetching: isFetchingUsers } = useGetUsersQuery({
    role: assigneeType,
    ...(isSuperAdmin && selectedSchoolId ? { schoolId: selectedSchoolId } : {})
  });
  const usersList = usersRes?.success ? usersRes.data : [];

  const [createCard, { isLoading: isAssigning }] = useCreateRfidCardMutation();
  const [updateCard] = useUpdateRfidCardMutation();
  const [deleteCard] = useDeleteRfidCardMutation();
  const [scanCard, { isLoading: isScanning }] = useScanRfidMutation();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateCard({
        id,
        isActive: !currentStatus,
        ...(isSuperAdmin && selectedSchoolId ? { schoolId: selectedSchoolId } : {})
      }).unwrap();
      notifier.showSuccess(`Card status updated to ${!currentStatus ? 'Active' : 'Blocked'}`);
    } catch (err) {
      notifier.showError('Failed to update card status');
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!window.confirm('Are you sure you want to unregister and delete this RFID card?')) return;
    try {
      await deleteCard({
        id,
        ...(isSuperAdmin && selectedSchoolId ? { schoolId: selectedSchoolId } : {})
      }).unwrap();
      notifier.showSuccess('RFID Card unregistered successfully');
    } catch (err) {
      notifier.showError('Failed to delete RFID card');
    }
  };

  const handleAssignCardSubmit = async () => {
    if (!newCardUid.trim()) {
      notifier.showError('Please enter a card UID.');
      return;
    }
    if (!selectedPersonId) {
      notifier.showError('Please select a person to assign.');
      return;
    }

    try {
      await createCard({
        cardUid: newCardUid,
        personType: assigneeType,
        personId: selectedPersonId,
        ...(isSuperAdmin && selectedSchoolId ? { schoolId: selectedSchoolId } : {})
      }).unwrap();

      notifier.showSuccess('RFID Card assigned successfully');
      setOpenDialog(false);
      setNewCardUid('');
      setSelectedPersonId('');
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to assign card';
      notifier.showError(msg);
    }
  };

  const handleSimulateScan = async () => {
    if (!simUid.trim()) {
      notifier.showError('Please enter a Card UID to simulate.');
      return;
    }

    try {
      const res = await scanCard({
        cardUid: simUid,
        ...(isSuperAdmin && selectedSchoolId ? { schoolId: selectedSchoolId } : {})
      }).unwrap();
      const personName = typeof res.personId === 'object' ? res.personId.name : 'Unknown User';
      const personRole = res.personType;
      
      const newLog = {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        uid: simUid,
        msg: `Scan successful! ${personName} (${personRole}) checked in. Status: ${res.status}.`,
        success: true
      };
      setScanLogs(prev => [newLog, ...prev]);
      setSimUid('');
      notifier.showSuccess('RFID scan simulated successfully');
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Scan failed (UID not found/active)';
      const newLog = {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        uid: simUid,
        msg: `Scan failed: ${msg}`,
        success: false
      };
      setScanLogs(prev => [newLog, ...prev]);
      notifier.showError(msg);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        RFID Attendance Management
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
          <Paper sx={{ background: mode === 'dark' ? '#1E1E1E' : '#FFF', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Registered Cards" icon={<CardIcon style={{ marginRight: 6 }} />} iconPosition="start" />
            <Tab label="Scanner Simulator" icon={<ScanIcon style={{ marginRight: 6 }} />} iconPosition="start" />
          </Tabs>
        </Box>

        <Box sx={{ px: 3 }}>
          {/* TAB 1: Registered Cards */}
          <CustomTabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
              <Typography variant="h6">Registered RFID Cards</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenDialog(true)}
                sx={{ borderRadius: 2 }}
              >
                Register & Assign Card
              </Button>
            </Box>

            {isFetchingCards ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : cards && cards.length > 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Card UID</strong></TableCell>
                      <TableCell><strong>Assigned User</strong></TableCell>
                      <TableCell><strong>User Role</strong></TableCell>
                      <TableCell><strong>Code / Email</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cards.map((card) => {
                      const person = typeof card.personId === 'object' ? card.personId : { name: 'Unknown', userCode: '' };
                      return (
                        <TableRow key={card._id} hover>
                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{card.cardUid}</TableCell>
                          <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {person.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={card.personType}
                              color={card.personType === 'TEACHER' ? 'secondary' : 'primary'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{person.userCode || 'N/A'}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Switch
                                size="small"
                                checked={card.isActive}
                                onChange={() => handleToggleStatus(card._id, card.isActive)}
                              />
                              <Chip
                                size="small"
                                label={card.isActive ? 'Active' : 'Blocked'}
                                color={card.isActive ? 'success' : 'error'}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton color="error" onClick={() => handleDeleteCard(card._id)}>
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">No RFID cards registered yet.</Alert>
            )}
          </CustomTabPanel>

          {/* TAB 2: Scanner Simulator */}
          <CustomTabPanel value={tabValue} index={1}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 3, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScanIcon color="#7C3AED" /> RFID Scanner Hardware Emulator
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Simulate a swipe from an RFID reader at a school gateway. Swiping a registered, active card will record immediate attendance.
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <TextField
                        label="RFID Card UID"
                        placeholder="e.g. 104F34A9"
                        variant="outlined"
                        fullWidth
                        value={simUid}
                        onChange={(e) => setSimUid(e.target.value)}
                        slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontWeight: 'bold' } } }}
                      />

                      <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        startIcon={<ScanIcon />}
                        onClick={handleSimulateScan}
                        disabled={isScanning}
                        sx={{ py: 1.5, borderRadius: 2 }}
                      >
                        {isScanning ? 'Processing swipe...' : 'Swipe Card'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 7 }}>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 3, minHeight: 300, display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom>
                      Scanner Live Activity Feed
                    </Typography>

                    <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 260, mt: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, bgcolor: mode === 'dark' ? '#121212' : '#FAFAFA' }}>
                      {scanLogs.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 180 }}>
                          <Typography variant="body2" color="text.secondary">No swipes detected. Use the emulator to simulate card entries.</Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {scanLogs.map((log) => (
                            <Box
                              key={log.id}
                              sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                borderLeft: '4px solid',
                                borderColor: log.success ? 'success.main' : 'error.main',
                                bgcolor: mode === 'dark' ? '#1E1E1E' : '#FFF',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                  UID: {log.uid}
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                  {log.time}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ color: log.success ? 'text.primary' : 'error.main' }}>
                                {log.msg}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CustomTabPanel>
        </Box>
      </Paper>

      {/* dialog register/assign card */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register & Assign RFID Card</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              label="RFID Card UID"
              placeholder="e.g. 104F34A9"
              variant="outlined"
              fullWidth
              value={newCardUid}
              onChange={(e) => setNewCardUid(e.target.value)}
              slotProps={{ htmlInput: { style: { fontFamily: 'monospace', fontWeight: 'bold' } } }}
            />

            <FormControl fullWidth>
              <InputLabel>Assignee Type</InputLabel>
              <Select
                value={assigneeType}
                label="Assignee Type"
                onChange={(e) => {
                  setAssigneeType(e.target.value as 'STUDENT' | 'TEACHER');
                  setSelectedPersonId('');
                }}
              >
                <MenuItem value="STUDENT">Student</MenuItem>
                <MenuItem value="TEACHER">Teacher/Staff</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={isFetchingUsers}>
              <InputLabel>Select Member</InputLabel>
              <Select
                value={selectedPersonId}
                label="Select Member"
                onChange={(e) => setSelectedPersonId(e.target.value as string)}
              >
                {isFetchingUsers ? (
                  <MenuItem value="">Loading...</MenuItem>
                ) : usersList.length > 0 ? (
                  usersList.map((user: any) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name} ({user.userCode || 'No Code'})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">No active users found</MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleAssignCardSubmit}
            variant="contained"
            disabled={isAssigning}
          >
            {isAssigning ? 'Saving...' : 'Register & Assign'}
          </Button>
        </DialogActions>
      </Dialog>
        </>
      )}
    </Box>
  );
}

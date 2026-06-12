import { 
  Box, Typography, Grid, Chip, CircularProgress, 
  Divider, IconButton, DialogTitle, DialogContent 
} from '@mui/material';
import { FaTimes, FaCalendarAlt } from 'react-icons/fa';
import { useGetUserByIdQuery } from '@api/usersApi';
import { useGetClassByIdQuery } from '@api/classesApi';
import { useGetStudentFeesQuery, usePayFeeMutation, useMarkFeeDueMutation } from '@api/feesApi';

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button
} from '@mui/material';

interface StudentDetailsDialogProps {
  userId: string;
  onClose: () => void;
}

export default function StudentDetailsDialog({ userId, onClose }: StudentDetailsDialogProps) {
  const { data: res, isLoading, error } = useGetUserByIdQuery(userId, { skip: !userId });

  const studentData = res?.data;

  // Fetch class to show class/section details nicely
  const { data: classRes } = useGetClassByIdQuery(studentData?.classId || '', { skip: !studentData?.classId });
  const classData = classRes?.data;
  
  const { data: feesRes, isLoading: isFeesLoading } = useGetStudentFeesQuery(userId, { skip: !userId });
  const feesData = feesRes?.data || [];
  
  const [payFee, { isLoading: isPaying }] = usePayFeeMutation();
  const [markFeeDue, { isLoading: isMarkingDue }] = useMarkFeeDueMutation();
  
  const handlePayFee = async (feeId: string) => {
    try {
      await payFee(feeId).unwrap();
    } catch (err) {
      console.error('Failed to pay fee:', err);
    }
  };

  const handleMarkDue = async (feeId: string) => {
    try {
      await markFeeDue(feeId).unwrap();
    } catch (err) {
      console.error('Failed to mark fee as due:', err);
    }
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, minHeight: 300, alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !res?.success || !studentData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Failed to load student details.</Typography>
      </Box>
    );
  }

  const sectionObj = classData?.sections?.find(s => s._id === studentData.sectionId);
  const admissionFee = feesData.find(f => f.type === 'ADMISSION');
  const totalDue = feesData.filter(f => f.status !== 'PAID').reduce((sum, f) => sum + f.amount, 0);

  return (
    <>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-default)' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Student Profile</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={studentData.isActive ? 'Active' : 'Inactive'} 
            color={studentData.isActive ? 'success' : 'default'} 
            size="small" 
            sx={{ fontWeight: 600 }} 
          />
          <IconButton onClick={onClose} size="small">
            <FaTimes />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, minWidth: { md: 600 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid var(--color-border-subtle)', borderRadius: '12px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{studentData.name}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Admission No.</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{studentData.userCode}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Email</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{studentData.email}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Phone</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{studentData.phone || '-'}</Typography>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Parent / Guardian</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {studentData.parentId && typeof studentData.parentId === 'object' && 'name' in studentData.parentId
                      ? `${(studentData.parentId as { name: string }).name}`
                      : '-'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Class & Section</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {classData?.name || 'Unassigned'} {sectionObj ? `(Sec ${sectionObj.name})` : ''}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, mb: 2, border: '1px solid var(--color-border-subtle)', borderRadius: '12px' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaCalendarAlt /> Admission & Accounting Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Registration Date</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {studentData.regDate ? new Date(studentData.regDate).toLocaleDateString() : '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Start Date</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {studentData.startDate ? new Date(studentData.startDate).toLocaleDateString() : '-'}
                  </Typography>
                </Grid>
                
                {studentData.leaveDate && (
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Leave Date</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {new Date(studentData.leaveDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Admission Fee</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    {admissionFee ? `₹ ${admissionFee.amount}` : '-'}
                    {admissionFee && (
                      <Chip 
                        label={admissionFee.status} 
                        size="small" 
                        color={admissionFee.status === 'PAID' ? 'success' : admissionFee.status === 'OVERDUE' ? 'error' : 'warning'} 
                        sx={{ fontWeight: 700, fontSize: '0.65rem', height: '18px' }} 
                      />
                    )}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>Total Due Amount</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: totalDue > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
                    ₹ {totalDue}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaCalendarAlt /> Billing History (Last 12 Months)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid var(--color-border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'var(--color-bg-subtle)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>Month/Type</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isFeesLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}><CircularProgress size={24} /></TableCell>
                      </TableRow>
                    ) : feesData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'var(--color-text-secondary)' }}>No billing records found.</TableCell>
                      </TableRow>
                    ) : (
                      feesData.slice(0, 12).map((fee) => {
                        const isPaid = fee.status === 'PAID';
                        const isOverdue = fee.status === 'OVERDUE';
                        const monthName = fee.month ? new Date(fee.year, fee.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' }) : `${fee.year}`;
                        
                        return (
                          <TableRow key={fee._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell sx={{ fontWeight: 500 }}>
                              {fee.type === 'ADMISSION' ? 'Admission Fee' : fee.type === 'YEARLY' ? `Yearly Fee (${fee.year})` : monthName}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>₹ {fee.amount}</TableCell>
                            <TableCell>
                              <Chip 
                                label={fee.status} 
                                size="small" 
                                color={isPaid ? 'success' : isOverdue ? 'error' : 'warning'} 
                                sx={{ fontWeight: 700, fontSize: '0.7rem', height: '20px' }} 
                              />
                            </TableCell>
                            <TableCell align="right">
                              {!isPaid ? (
                                <Button 
                                  variant="contained" 
                                  size="small" 
                                  color="primary" 
                                  disabled={isPaying || isMarkingDue}
                                  onClick={() => handlePayFee(fee._id)}
                                  sx={{ textTransform: 'none', px: 2, py: 0.5, minWidth: '70px' }}
                                >
                                  Pay
                                </Button>
                              ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                  {fee.paidAt && (
                                    <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                                      Paid on {new Date(fee.paidAt).toLocaleDateString()}
                                    </Typography>
                                  )}
                                  <Button 
                                    variant="outlined" 
                                    size="small" 
                                    color="error" 
                                    disabled={isPaying || isMarkingDue}
                                    onClick={() => handleMarkDue(fee._id)}
                                    sx={{ textTransform: 'none', px: 1, py: 0.25, fontSize: '0.7rem', minWidth: '70px' }}
                                  >
                                    Mark Due
                                  </Button>
                                </Box>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

          </Grid>
        </Grid>
      </DialogContent>
    </>
  );
}

import { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, 
  Button, Typography, Box, Grid, TextField, Chip,
  CircularProgress, IconButton, Avatar, Divider,
  Paper, Alert, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { 
  useGetStudentFeesQuery, 
  usePayMoneyReceiptMutation 
} from '@api/feesApi';
import { useGetUserByIdQuery } from '@api/usersApi';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { FaReceipt, FaTimes, FaWallet, FaUserGraduate, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

interface MoneyReceiptDialogProps {
  open: boolean;
  onClose: () => void;
  student: {
    _id: string;
    name: string;
    userCode: string;
    className: string;
  };
}

export function MoneyReceiptDialog({ open, onClose, student }: MoneyReceiptDialogProps) {
  const { showSuccess, showError, showWarning, showInfo } = useNotifier();
  
  const { data: feesData, isLoading } = useGetStudentFeesQuery(student._id, { skip: !open });
  const { data: studentRes } = useGetUserByIdQuery(student._id, { skip: !open });
  const walletBal = studentRes?.data?.walletBal || 0;

  const [payReceipt, { isLoading: isPaying }] = usePayMoneyReceiptMutation();

  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [payableAmount, setPayableAmount] = useState<number | string>('');
  const [paymentMode, setPaymentMode] = useState<string>('CASH');
  const [paymentMessage, setPaymentMessage] = useState<string>('');
  
  // Unpaid invoices
  const pendingInvoices = (feesData?.data || []).filter(fee => fee.status === 'PENDING' || fee.status === 'OVERDUE');
  const totalDues = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Auto-select all unpaid cycles when data loads
  useEffect(() => {
    if (feesData?.data && studentRes?.data !== undefined) {
      const pending = feesData.data.filter(fee => fee.status === 'PENDING' || fee.status === 'OVERDUE');
      const pendingIds = pending.map(fee => fee._id);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedInvoices(pendingIds);
      const total = pending.reduce((sum, inv) => sum + inv.amount, 0);
      setPayableAmount(Math.max(total - walletBal, 0));
    }
  }, [feesData, studentRes?.data, walletBal]);

  const toggleInvoice = (id: string) => {
    setSelectedInvoices(prev => {
      const newSelected = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      const sum = pendingInvoices
        .filter(inv => newSelected.includes(inv._id))
        .reduce((s, inv) => s + inv.amount, 0);
      setPayableAmount(Math.max(sum - walletBal, 0));
      return newSelected;
    });
  };

  const handleAmountChange = (val: string) => {
    setPayableAmount(val);
    const numVal = Number(val);
    if (!isNaN(numVal) && numVal >= 0) {
      let sum = 0;
      const effectiveAmount = numVal + walletBal;
      const newSelected: string[] = [];
      for (const inv of pendingInvoices) {
        if (sum + inv.amount <= effectiveAmount) {
          sum += inv.amount;
          newSelected.push(inv._id);
        }
      }
      setSelectedInvoices(newSelected);
    } else {
      setSelectedInvoices([]);
    }
  };

  const handlePay = async () => {
    if (!payableAmount || Number(payableAmount) <= 0) {
      showWarning('Please enter a valid amount');
      return;
    }
    if (selectedInvoices.length === 0) {
      showWarning('Please select at least one fee cycle');
      return;
    }

    try {
      const res = await payReceipt({
        studentId: student._id,
        invoiceIds: selectedInvoices,
        paidAmount: Number(payableAmount),
        paymentMode,
        paymentMessage
      }).unwrap();

      showSuccess(res.message || 'Payment processed successfully');
      
      const walletData = res.data as { walletAdded?: number; walletUsed?: number };
      if (walletData?.walletAdded && walletData.walletAdded > 0) {
        showInfo(`₹${walletData.walletAdded} added to student wallet`);
      } else if (walletData?.walletUsed && walletData.walletUsed > 0) {
        showInfo(`₹${walletData.walletUsed} used from student wallet`);
      }

      onClose();
    } catch (error: unknown) {
      showError((error as { data?: { error?: string } })?.data?.error || 'Failed to process payment');
    }
  };

  const selectedTotal = pendingInvoices
    .filter(inv => selectedInvoices.includes(inv._id))
    .reduce((sum, inv) => sum + inv.amount, 0);
  
  const effectivePaidAmount = Number(payableAmount) + walletBal;
  const isDeficient = effectivePaidAmount < selectedTotal && selectedTotal > 0;
  const isExcess = effectivePaidAmount > selectedTotal;
  const excessAmount = isExcess ? effectivePaidAmount - selectedTotal : 0;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden'
          }
        }
      }}
    >
      <Box sx={{ 
        background: 'linear-gradient(135deg, var(--color-primary-main), var(--color-primary-dark))',
        color: 'white',
        px: 3,
        py: 2.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FaReceipt size={24} style={{ opacity: 0.9 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
            Process Money Receipt
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
          <FaTimes />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, bgcolor: 'var(--color-background-default)' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 8, gap: 2 }}>
            <CircularProgress size={40} thickness={4} />
            <Typography color="text.secondary">Loading fee details...</Typography>
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
              {walletBal > 0 && (
                <Alert icon={<FaWallet />} severity="info" sx={{ borderRadius: 2, mb: 3 }}>
                  Student has a wallet balance of <strong>₹{walletBal.toLocaleString()}</strong>. This will be automatically applied to the payment.
                </Alert>
              )}

              {/* Student Profile Card */}
            <Paper elevation={0} sx={{ 
              p: 2.5, 
              mb: 3, 
              borderRadius: 2, 
              border: '1px solid var(--color-border-default)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: 'linear-gradient(to right, rgba(25, 118, 210, 0.02), rgba(25, 118, 210, 0.05))'
            }}>
              <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                <FaUserGraduate size={24} />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                  {student.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 0.5, color: 'text.secondary' }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>ID:</Box> {student.userCode}
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>Class:</Box> {student.className}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Grid container spacing={3}>
              {/* Unpaid Fee Cycles */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Select Unpaid Cycles
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600, bgcolor: 'error.lighter', px: 1, py: 0.5, borderRadius: 1 }}>
                    Total Dues: ₹{totalDues.toLocaleString()}
                  </Typography>
                </Box>
                
                {pendingInvoices.length === 0 ? (
                  <Alert icon={<FaCheckCircle />} severity="success" sx={{ borderRadius: 2 }}>
                    This student has no pending dues!
                  </Alert>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {pendingInvoices.map((inv) => {
                      const isSelected = selectedInvoices.includes(inv._id);
                      const monthName = inv.type === 'MONTHLY' 
                        ? `${new Date(inv.year, (inv.month || 1) - 1).toLocaleString('default', { month: 'short' })} ${inv.year}`
                        : `${inv.type} ${inv.year}`;

                      return (
                        <Chip
                          key={inv._id}
                          label={`${monthName} - ₹${inv.amount.toLocaleString()}`}
                          color={isSelected ? 'primary' : 'default'}
                          onClick={() => toggleInvoice(inv._id)}
                          variant={isSelected ? 'filled' : 'outlined'}
                          sx={{ 
                            fontWeight: 600, 
                            py: 2.5, 
                            px: 1,
                            borderRadius: 2,
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease',
                            borderWidth: isSelected ? 0 : 1,
                            boxShadow: isSelected ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: isSelected ? '0 6px 16px rgba(25, 118, 210, 0.4)' : '0 4px 8px rgba(0,0,0,0.05)',
                            }
                          }}
                          icon={isSelected ? <FaCheckCircle style={{ color: 'white', marginLeft: 8 }} /> : undefined}
                        />
                      );
                    })}
                  </Box>
                )}
              </Grid>

              {/* Payment Section */}
              <Grid size={{ xs: 12 }}>
                  <Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
                        Payment Details
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            fullWidth
                            label="Amount Receiving (₹)"
                            type="number"
                            value={payableAmount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                            disabled={isPaying}
                            autoFocus
                            slotProps={{
                              input: {
                                sx: { 
                                  fontSize: '1.25rem', 
                                  fontWeight: 700,
                                  borderRadius: 2,
                                  color: isDeficient ? 'error.main' : 'primary.main',
                                  bgcolor: 'background.paper'
                                }
                              }
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <FormControl fullWidth>
                            <InputLabel id="payment-mode-label">Payment Mode</InputLabel>
                            <Select
                              labelId="payment-mode-label"
                              value={paymentMode}
                              label="Payment Mode"
                              onChange={(e) => setPaymentMode(e.target.value)}
                              disabled={isPaying}
                              sx={{ borderRadius: 2, bgcolor: 'background.paper', height: '100%' }}
                            >
                              <MenuItem value="CASH">Cash</MenuItem>
                              <MenuItem value="ONLINE">Online / UPI</MenuItem>
                              <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                              <MenuItem value="CHEQUE">Cheque</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            label="Transaction ID / Note"
                            placeholder="Optional tracking info"
                            value={paymentMessage}
                            onChange={(e) => setPaymentMessage(e.target.value)}
                            disabled={isPaying}
                            slotProps={{
                              input: {
                                sx: { borderRadius: 2, bgcolor: 'background.paper' }
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                      
                      {/* Dynamic Helper Alerts */}
                      <Box sx={{ mt: 2, minHeight: 48 }}>
                        {isDeficient ? (
                          <Alert icon={<FaExclamationCircle />} severity="error" sx={{ borderRadius: 2 }}>
                            Amount is less than total selected (₹{selectedTotal.toLocaleString()}). Transaction will be rejected.
                          </Alert>
                        ) : isExcess ? (
                          <Alert icon={<FaWallet />} severity="info" sx={{ borderRadius: 2, bgcolor: 'info.lighter' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Excess payment detected!
                              </Typography>
                              <Typography variant="body2">
                                ₹{excessAmount.toLocaleString()} will be automatically added to the student's Wallet Balance.
                              </Typography>
                            </Box>
                          </Alert>
                        ) : null}
                      </Box>
                      </Box>
                  </Box>
              </Grid>

            </Grid>
          </Box>
        )}
      </DialogContent>
      
      <Box sx={{ p: 3, pt: 2, bgcolor: 'var(--color-background-default)', borderTop: '1px solid var(--color-border-default)' }}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button 
            onClick={onClose} 
            color="inherit" 
            disabled={isPaying}
            sx={{ fontWeight: 600, px: 3, borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePay} 
            variant="contained" 
            color="primary" 
            size="large"
            disabled={isPaying || pendingInvoices.length === 0 || selectedInvoices.length === 0 || isDeficient}
            sx={{ 
              fontWeight: 700, 
              px: 4, 
              borderRadius: 2,
              boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.6)',
              }
            }}
          >
            {isPaying ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

import { useState } from 'react';
import { PageWrapper, Datatable, DatatableHeader, DatatableFooter } from '@common/Datatable';
import { transactionColumns } from '../../transactions/components/transactionColumns';
import { 
  useGetAllTransactionsQuery, 
  usePayFeeMutation, 
  useMarkFeeDueMutation,
  useGenerateStudentFeesMutation 
} from '../../../../api/feesApi';
import type { IFeeInvoice } from '../../../../api/feesApi';
import { Box, Typography, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { FaCheckCircle, FaUndo, FaPlusCircle } from 'react-icons/fa';

export function FeesPage() {
  const { data: res, isLoading, error } = useGetAllTransactionsQuery();
  const [payFee] = usePayFeeMutation();
  const [markDue] = useMarkFeeDueMutation();
  const [generateFees, { isLoading: isGenerating }] = useGenerateStudentFeesMutation();

  const transactions = res?.data || [];

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generateType, setGenerateType] = useState<'MONTHLY' | 'ADMISSION'>('MONTHLY');
  const [generateMonth, setGenerateMonth] = useState(new Date().getMonth() + 1);

  const filteredTransactions = transactions.filter((t) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const student = t.studentId as any;
    const studentName = student?.name?.toLowerCase() || '';
    const userCode = student?.userCode?.toLowerCase() || '';
    return studentName.includes(searchLower) || userCode.includes(searchLower);
  });

  const paginatedTransactions = filteredTransactions.slice((page - 1) * limit, page * limit);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handlePay = async (fee: IFeeInvoice) => {
    try {
      await payFee(fee._id).unwrap();
    } catch (err) {
      console.error('Failed to pay fee:', err);
    }
  };

  const handleMarkDue = async (fee: IFeeInvoice) => {
    try {
      await markDue(fee._id).unwrap();
    } catch (err) {
      console.error('Failed to mark due:', err);
    }
  };

  const handleGenerateFees = async () => {
    try {
      await generateFees({
        type: generateType,
        month: generateType === 'MONTHLY' ? generateMonth : undefined,
        year: new Date().getFullYear(),
      }).unwrap();
      setGenerateDialogOpen(false);
    } catch (err) {
      console.error('Failed to generate fees:', err);
    }
  };

  const actions = [
    {
      label: 'Mark as Paid',
      icon: <FaCheckCircle />,
      color: 'success' as const,
      onClick: handlePay,
    },
    {
      label: 'Mark as Due',
      icon: <FaUndo />,
      color: 'warning' as const,
      onClick: handleMarkDue,
    }
  ];

  return (
    <PageWrapper title="Fees Management">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flexGrow: 1, minWidth: 300 }}>
          <DatatableHeader 
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search fees by student name or code..."
          />
        </Box>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<FaPlusCircle />}
          onClick={() => setGenerateDialogOpen(true)}
          sx={{ height: 40 }}
        >
          Generate Fees
        </Button>
      </Box>
      
      {error ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error">Failed to load fees</Typography>
        </Box>
      ) : (
        <Datatable<IFeeInvoice>
          columns={transactionColumns}
          data={paginatedTransactions}
          loading={isLoading}
          tableName="fees"
          actions={actions}
        />
      )}

      <DatatableFooter
        pagination={{
          page,
          limit,
          total: filteredTransactions.length,
          totalPages: Math.ceil(filteredTransactions.length / limit)
        }}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Fees</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Fee Type</InputLabel>
              <Select
                value={generateType}
                label="Fee Type"
                onChange={(e) => setGenerateType(e.target.value as 'MONTHLY' | 'ADMISSION')}
              >
                <MenuItem value="MONTHLY">Monthly</MenuItem>
                <MenuItem value="ADMISSION">Admission</MenuItem>
              </Select>
            </FormControl>

            {generateType === 'MONTHLY' && (
              <FormControl fullWidth>
                <InputLabel>Month</InputLabel>
                <Select
                  value={generateMonth}
                  label="Month"
                  onChange={(e) => setGenerateMonth(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <MenuItem key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setGenerateDialogOpen(false)} color="inherit" disabled={isGenerating}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateFees} 
            variant="contained" 
            color="primary"
            disabled={isGenerating}
            startIcon={isGenerating ? <CircularProgress size={20} /> : null}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
}

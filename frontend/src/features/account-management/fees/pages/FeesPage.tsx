import { useState, useMemo } from 'react';
import { PageWrapper, Datatable, DatatableHeader, DatatableFooter } from '@common/Datatable';
import { getFeeSummaryColumns } from '../components/feeColumns';
import type { IFeeSummary } from '../components/feeColumns';
import { useNavigate } from 'react-router-dom';
import { 
  useGetAllTransactionsQuery, 
  useGenerateGlobalFeesMutation 
} from '@api/feesApi';
import { useGetUsersQuery } from '@api/usersApi';
import { Box, Typography, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, Tooltip, IconButton, Divider } from '@mui/material';
import { FaPlusCircle, FaInfoCircle } from 'react-icons/fa';
import { useNotifier } from '@common/Notifier/NotifierProvider';

export function FeesPage() {
  const notifier = useNotifier();
  const { data: res, isLoading, error } = useGetAllTransactionsQuery();
  const [generateFees, { isLoading: isGenerating }] = useGenerateGlobalFeesMutation();
  const { data: studentsData } = useGetUsersQuery({ role: 'STUDENT', limit: 10000 });
  const navigate = useNavigate();

  const students = studentsData?.data || [];
  const activeStudents = students.filter(s => s.isActive).length;
  const deactiveStudents = students.filter(s => !s.isActive).length;
  const totalStudents = students.length;

  const transactions = useMemo(() => res?.data || [], [res?.data]);

  const summaries = useMemo(() => {
    const map = new Map<string, IFeeSummary>();
    
    transactions.forEach(fee => {
      let key;
      let monthName;
      
      if (fee.type === 'MONTHLY') {
        key = `MONTHLY-${fee.year}-${fee.month}`;
        monthName = `Monthly (${new Date(fee.year, (fee.month || 1) - 1).toLocaleString('default', { month: 'short' })} ${fee.year})`;
      } else {
        key = `${fee.type}-${fee.year}`;
        monthName = `${fee.type.charAt(0) + fee.type.slice(1).toLowerCase()} (${fee.year})`;
      }

      const existing = map.get(key) || {
        _id: key,
        monthName,
        generatedDate: fee.createdAt,
        totalAmount: 0,
        collected: 0,
        due: 0,
        status: 'PENDING'
      };

      existing.totalAmount += fee.amount;
      if (fee.status === 'PAID') {
        existing.collected += fee.amount;
      } else {
        existing.due += fee.amount;
      }
      
      if (new Date(fee.createdAt) < new Date(existing.generatedDate)) {
        existing.generatedDate = fee.createdAt;
      }
      
      if (existing.due === 0 && existing.totalAmount > 0) {
        existing.status = 'PAID';
      } else {
        existing.status = 'PENDING';
      }

      map.set(key, existing);
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime());
  }, [transactions]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [generateType, setGenerateType] = useState<'MONTHLY' | 'ADMISSION'>('MONTHLY');
  const [generateMonth, setGenerateMonth] = useState(new Date().getMonth() + 1);

  const filteredSummaries = summaries.filter((s) => {
    if (!search) return true;
    return s.monthName.toLowerCase().includes(search.toLowerCase());
  });

  const paginatedSummaries = filteredSummaries.slice((page - 1) * limit, page * limit);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleGenerateFees = async () => {
    try {
      const res = await generateFees({
        type: generateType,
        month: generateType === 'MONTHLY' ? generateMonth : undefined,
        year: new Date().getFullYear(),
      }).unwrap();
      notifier.showSuccess(res.message || 'Fees generated successfully');
      setGenerateDialogOpen(false);
    } catch (err) {
      console.error('Failed to generate fees:', err);
      notifier.showError('Failed to generate fees');
    }
  };

  const pageActions = [
    {
      label: 'Generate Bill',
      icon: <FaPlusCircle />,
      onClick: () => setGenerateDialogOpen(true),
      variant: 'contained' as const,
      color: 'primary' as const,
    }
  ];

  const handleViewDetails = (row: IFeeSummary) => {
    navigate(`/account-management/fees/${row._id}`);
  };

  return (
    <PageWrapper title="Fees Management" actions={pageActions}>
      <Box sx={{ mb: 2 }}>
        <DatatableHeader 
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by fee cycle..."
        />
      </Box>
      
      {error ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error">Failed to load fees</Typography>
        </Box>
      ) : (
        <Datatable<IFeeSummary>
          columns={getFeeSummaryColumns(handleViewDetails)}
          data={paginatedSummaries}
          loading={isLoading}
          tableName="fees_summary"
        />
      )}

      <DatatableFooter
        page={page - 1} // MUI TablePagination is 0-indexed
        rowsPerPage={limit}
        totalCount={filteredSummaries.length}
        onChangePage={(newPage) => handlePageChange(newPage + 1)} // Re-adjust to 1-indexed state
        onChangeRowsPerPage={handleLimitChange}
      />

      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Generate Fees
          <Tooltip title="Bills will only be generated for active students" placement="right">
            <IconButton size="small" sx={{ color: 'var(--color-text-secondary)' }}>
              <FaInfoCircle size={16} />
            </IconButton>
          </Tooltip>
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 2, bgcolor: 'var(--color-background-default)', borderRadius: 2, mb: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">Total Students</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{totalStudents}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">Active</Typography>
              <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>{activeStudents}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">Deactive</Typography>
              <Typography variant="h6" color="error.main" sx={{ fontWeight: 700 }}>{deactiveStudents}</Typography>
            </Box>
          </Box>

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

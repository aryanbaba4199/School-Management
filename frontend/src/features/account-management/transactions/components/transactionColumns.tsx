import { Chip, Typography } from '@mui/material';
import type { Column } from '@common/Datatable';
import { IFeeInvoice } from '../../../../api/feesApi';

export const transactionColumns: Column<IFeeInvoice>[] = [
  {
    id: 'studentName',
    label: 'Student Name',
    sortable: false,
    render: (row) => {
      const student = row.studentId as any;
      return (
        <div>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {student?.name || 'Unknown'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
            {student?.userCode || ''}
          </Typography>
        </div>
      );
    },
  },
  {
    id: 'classId',
    label: 'Class',
    sortable: false,
    render: (row) => {
      const classObj = row.classId as any;
      return <Typography variant="body2">{classObj?.name || 'N/A'}</Typography>;
    },
  },
  {
    id: 'type',
    label: 'Fee Type',
    sortable: true,
    render: (row) => {
      const isMonthly = row.type === 'MONTHLY';
      const monthName = row.month ? new Date(row.year, row.month - 1).toLocaleString('default', { month: 'short' }) : '';
      const label = isMonthly ? `Monthly (${monthName} ${row.year})` : row.type.replace('_', ' ');
      
      return (
        <Chip 
          label={label} 
          size="small" 
          sx={{ 
            bgcolor: 'var(--color-bg-subtle)', 
            color: 'var(--color-text-primary)', 
            fontWeight: 500, 
            textTransform: 'capitalize' 
          }} 
        />
      );
    },
  },
  {
    id: 'amount',
    label: 'Amount (₹)',
    sortable: true,
    render: (row) => (
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        ₹ {row.amount}
      </Typography>
    ),
  },
  {
    id: 'status',
    label: 'Status',
    sortable: true,
    render: (row) => {
      const isPaid = row.status === 'PAID';
      const isOverdue = row.status === 'OVERDUE';
      
      return (
        <Chip 
          label={row.status} 
          size="small" 
          color={isPaid ? 'success' : isOverdue ? 'error' : 'warning'} 
          sx={{ fontWeight: 700, fontSize: '0.7rem', height: '20px' }} 
        />
      );
    },
  },
  {
    id: 'paidAt',
    label: 'Payment Date',
    sortable: true,
    render: (row) => (
      <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
        {row.paidAt ? new Date(row.paidAt).toLocaleDateString() : '-'}
      </Typography>
    ),
  },
];

import { Typography, Chip } from '@mui/material';
import type { Column } from '@common/Datatable';

export interface IFeeSummary {
  _id: string;
  monthName: string;
  generatedDate: string;
  totalAmount: number;
  collected: number;
  due: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

import { IconButton, Tooltip } from '@mui/material';
import { FaEye } from 'react-icons/fa';

export const getFeeSummaryColumns = (onViewDetails: (row: IFeeSummary) => void): Column<IFeeSummary>[] => [
  {
    id: 'monthName',
    label: 'Fee Cycle / Month',
    sortable: true,
    render: (row) => (
      <Typography 
        variant="body2" 
        sx={{ fontWeight: 600, color: 'primary.main', cursor: 'pointer', textDecoration: 'underline' }}
        onClick={() => onViewDetails(row)}
      >
        {row.monthName}
      </Typography>
    ),
  },
  {
    id: 'generatedDate',
    label: 'Generated Date',
    sortable: true,
    render: (row) => (
      <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
        {new Date(row.generatedDate).toLocaleDateString()}
      </Typography>
    ),
  },
  {
    id: 'totalAmount',
    label: 'Total Amount (₹)',
    sortable: true,
    render: (row) => (
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        ₹ {row.totalAmount.toLocaleString()}
      </Typography>
    ),
  },
  {
    id: 'collected',
    label: 'Collected (₹)',
    sortable: true,
    render: (row) => (
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-success-main)' }}>
        ₹ {row.collected.toLocaleString()}
      </Typography>
    ),
  },
  {
    id: 'due',
    label: 'Due (₹)',
    sortable: true,
    render: (row) => (
      <Typography variant="body2" sx={{ fontWeight: 600, color: row.due > 0 ? 'var(--color-error-main)' : 'inherit' }}>
        ₹ {row.due.toLocaleString()}
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
    id: 'actions',
    label: 'Action',
    sortable: false,
    render: (row) => (
      <Tooltip title="View Details">
        <IconButton size="small" onClick={() => onViewDetails(row)} color="primary">
          <FaEye />
        </IconButton>
      </Tooltip>
    ),
  },
];

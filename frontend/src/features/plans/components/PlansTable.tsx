import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Tooltip, Box, Typography } from '@mui/material';
import { FaEdit, FaTrash } from 'react-icons/fa';
import type { ISubscriptionPlan } from '../types/plans.types';

interface PlansTableProps {
  plans: ISubscriptionPlan[];
  onEdit: (plan: ISubscriptionPlan) => void;
  onDelete: (plan: ISubscriptionPlan) => void;
}

export function PlansTable({ plans, onEdit, onDelete }: PlansTableProps) {
  const renderFeatures = (features: ISubscriptionPlan['features']) => {
    const activeFeatures: string[] = [];
    if (features?.attendanceEnabled) activeFeatures.push('Attendance');
    if (features?.onlineExamEnabled) activeFeatures.push('Exams');
    if (features?.aiAnalyticsEnabled) activeFeatures.push('AI Analytics');
    if (features?.parentAppEnabled) activeFeatures.push('Parent App');
    
    return (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {activeFeatures.map((f) => (
          <Chip key={f} label={f} size="small" variant="outlined" sx={{ fontSize: '0.75rem', borderColor: 'var(--color-primary-main)', color: 'var(--color-primary-main)' }} />
        ))}
        {activeFeatures.length === 0 && (
          <Typography variant="caption" sx={{ color: 'var(--color-text-disabled)' }}>None</Typography>
        )}
      </Box>
    );
  };

  return (
    <TableContainer component={Paper} sx={{ bgcolor: 'var(--color-background-paper)', border: '1px solid var(--color-border-default)', borderRadius: '12px' }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--color-border-default)' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>Code</TableCell>
            <TableCell sx={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>Price (INR)</TableCell>
            <TableCell sx={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>Capacity</TableCell>
            <TableCell sx={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>Features</TableCell>
            <TableCell sx={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>Status</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: 'var(--color-text-secondary)', pr: 3 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{plan.name}</TableCell>
              <TableCell sx={{ color: 'var(--color-text-secondary)' }}>{plan.code}</TableCell>
              <TableCell sx={{ color: 'var(--color-text-primary)' }}>₹{plan.price.toLocaleString('en-IN')}</TableCell>
              <TableCell sx={{ color: 'var(--color-text-primary)' }}>{plan.maxStudents} Students</TableCell>
              <TableCell>{renderFeatures(plan.features)}</TableCell>
              <TableCell>
                <Chip
                  label={plan.isActive ? 'Active' : 'Inactive'}
                  color={plan.isActive ? 'success' : 'default'}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </TableCell>
              <TableCell align="right" sx={{ pr: 2 }}>
                <Tooltip title="Edit Plan">
                  <IconButton onClick={() => onEdit(plan)} size="small" sx={{ color: 'var(--color-text-secondary)', '&:hover': { color: 'var(--color-primary-main)' } }}>
                    <FaEdit size={16} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Plan">
                  <IconButton onClick={() => onDelete(plan)} size="small" sx={{ color: 'var(--color-text-secondary)', '&:hover': { color: 'var(--color-error-main)' } }}>
                    <FaTrash size={16} />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {plans.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'var(--color-text-secondary)' }}>
                No subscription plans registered.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

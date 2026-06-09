import { Chip, Box, Typography } from '@mui/material';
import { FaEdit, FaTrash } from 'react-icons/fa';
import type { ISubscriptionPlan } from '../types/plans.types';
import { Datatable, type Column, type ActionItem } from '@common/Datatable';

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

  const columns: Column<ISubscriptionPlan>[] = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'code', label: 'Code', sortable: true },
    { 
      id: 'price', 
      label: 'Price (Monthly / Yearly)', 
      render: (row) => `₹${row.price.monthly.toLocaleString('en-IN')} / ₹${row.price.yearly.toLocaleString('en-IN')}` 
    },
    { 
      id: 'maxStudents', 
      label: 'Capacity', 
      render: (row) => `${row.maxStudents} Students` 
    },
    { 
      id: 'features', 
      label: 'Features', 
      render: (row) => renderFeatures(row.features) 
    },
    {
      id: 'isActive',
      label: 'Status',
      render: (row) => (
        <Chip
          label={row.isActive ? 'Active' : 'Inactive'}
          color={row.isActive ? 'success' : 'default'}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      )
    }
  ];

  const actions: ActionItem<ISubscriptionPlan>[] = [
    {
      label: 'Edit',
      icon: <FaEdit size={16} />,
      onClick: onEdit,
      color: 'primary'
    },
    {
      label: 'Delete',
      icon: <FaTrash size={16} />,
      onClick: onDelete,
      color: 'error'
    }
  ];

  return <Datatable data={plans} columns={columns} actions={actions} />;
}

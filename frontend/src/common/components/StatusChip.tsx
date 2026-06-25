import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';

export interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, ...props }) => {
  const getStatusColor = (statusText: string): 'warning' | 'info' | 'success' | 'error' | 'default' => {
    const s = statusText.toUpperCase();
    
    // Success patterns
    if (['GRADED', 'ACTIVE', 'PAID', 'PRESENT', 'COMPLETED', 'APPROVED', 'SUCCESS'].includes(s)) return 'success';
    
    // Warning patterns
    if (['PENDING', 'DUE', 'PARTIAL', 'ON LEAVE'].includes(s)) return 'warning';
    
    // Error patterns
    if (['LATE', 'CORRECTION_REQUIRED', 'INACTIVE', 'UNPAID', 'ABSENT', 'FAILED', 'REJECTED'].includes(s)) return 'error';
    
    // Info patterns
    if (['SUBMITTED', 'DRAFT', 'ONGOING'].includes(s)) return 'info';
    
    return 'default';
  };

  return (
    <Chip 
      label={status} 
      color={getStatusColor(status)} 
      size={props.size || "small"} 
      {...props} 
    />
  );
};

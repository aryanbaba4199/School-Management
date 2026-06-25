import React from 'react';
import { Typography, Box, Avatar } from '@mui/material';
import { format } from 'date-fns';

/**
 * Standardized Date Cell Renderer
 */
export const renderDateCell = (dateString?: string, formatStr = 'MMM dd, yyyy h:mm a') => {
  if (!dateString) return '--';
  try {
    return format(new Date(dateString), formatStr);
  } catch {
    return dateString; // Fallback if parsing fails
  }
};

/**
 * Standardized Currency Cell Renderer
 */
export const renderCurrencyCell = (amount?: number, currencySymbol = '₹') => {
  if (amount === undefined || amount === null) return '--';
  return (
    <Typography fontWeight="bold" color="textPrimary">
      {currencySymbol}{amount.toLocaleString('en-IN')}
    </Typography>
  );
};

/**
 * Standardized User Profile Cell Renderer
 */
export const renderUserCell = (name: string, subtitle?: string, avatarUrl?: string) => {
  return (
    <Box display="flex" alignItems="center" gap={1.5}>
      {avatarUrl !== undefined && (
        <Avatar src={avatarUrl} alt={name} sx={{ width: 32, height: 32 }} />
      )}
      <Box>
        <Typography variant="subtitle2" fontWeight="bold">
          {name}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

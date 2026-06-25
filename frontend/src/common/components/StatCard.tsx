import React, { ReactNode } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: string; // Border color on the left
  footerText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'var(--color-primary-main)', footerText }) => {
  return (
    <Card 
      elevation={3} 
      sx={{ 
        borderRadius: 3, 
        borderLeft: `4px solid ${color}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="subtitle2" color="textSecondary" fontWeight="bold" textTransform="uppercase">
            {title}
          </Typography>
          {icon && (
            <Box 
              sx={{ 
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1,
                bgcolor: `${color}15`, // 15% opacity hex
                borderRadius: '50%'
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
        <Typography variant="h4" fontWeight="800" sx={{ mt: 'auto', mb: footerText ? 1 : 0 }}>
          {value}
        </Typography>
        {footerText && (
          <Typography variant="caption" color="textSecondary">
            {footerText}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

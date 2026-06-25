import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';

export interface PageTabItem {
  label: string;
  count?: number;
  icon?: React.ReactElement;
}

export interface PageTabsProps {
  tabs: PageTabItem[];
  value: number;
  onChange: (newValue: number) => void;
  ariaLabel?: string;
}

export const PageTabs: React.FC<PageTabsProps> = ({ tabs, value, onChange, ariaLabel = "page tabs" }) => {
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    onChange(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs 
        value={value} 
        onChange={handleChange} 
        aria-label={ariaLabel}
        variant="scrollable"
        scrollButtons="auto"
      >
        {tabs.map((tab, index) => (
          <Tab 
            key={index} 
            label={tab.count !== undefined ? `${tab.label} (${tab.count})` : tab.label} 
            icon={tab.icon}
            iconPosition={tab.icon ? "start" : undefined}
          />
        ))}
      </Tabs>
    </Box>
  );
};

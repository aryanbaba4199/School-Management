import { useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { Box, Typography, IconButton, Tooltip, Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { FaPlus, FaChevronDown } from 'react-icons/fa';
import styled from 'styled-components';

const Wrapper = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const HeaderContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid var(--color-border-default);
  padding-bottom: 16px;
`;

export interface PageAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  variant?: 'contained' | 'outlined' | 'text';
  disabled?: boolean;
}

interface PageWrapperProps {
  title: string;
  onCreate?: () => void;
  createLabel?: string;
  actions?: PageAction[];
  children: ReactNode;
}

export default function PageWrapper({
  title,
  onCreate,
  createLabel = 'Create New',
  actions = [],
  children,
}: PageWrapperProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (onClick: () => void) => {
    handleMenuClose();
    onClick();
  };

  return (
    <Wrapper>
      <HeaderContainer>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.5px',
          }}
        >
          {title}
        </Typography>
        {onCreate && (
          <Tooltip title={createLabel}>
            <IconButton
              color="primary"
              aria-label={createLabel}
              onClick={onCreate}
              sx={{
                backgroundColor: 'var(--color-primary-main)',
                color: '#fff',
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: 'var(--color-primary-dark)',
                },
              }}
            >
              <FaPlus size={14} />
            </IconButton>
          </Tooltip>
        )}
        {actions.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleMenuOpen}
              endIcon={<FaChevronDown size={12} />}
              sx={{ height: 40, px: 3, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'none' }}
            >
              Action
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  elevation: 2,
                  sx: {
                    mt: 1,
                    minWidth: 180,
                    borderRadius: '8px',
                    border: '1px solid var(--color-border-default)',
                    boxShadow: 'var(--shadow-md)',
                  }
                }
              }}
            >
              {actions.map((action, idx) => (
                <MenuItem 
                  key={idx} 
                  onClick={() => handleActionClick(action.onClick)}
                  disabled={action.disabled}
                  sx={{ py: 1.5, px: 2 }}
                >
                  {action.icon && (
                    <ListItemIcon sx={{ minWidth: 32, color: action.color ? `var(--color-${action.color}-main)` : 'inherit' }}>
                      {action.icon}
                    </ListItemIcon>
                  )}
                  <ListItemText 
                    primary={<Typography sx={{ fontWeight: 600, color: action.color ? `var(--color-${action.color}-main)` : 'inherit' }}>{action.label}</Typography>}
                  />
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )}
      </HeaderContainer>
      <Box>{children}</Box>
    </Wrapper>
  );
}

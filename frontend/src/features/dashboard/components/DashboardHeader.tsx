import styled from 'styled-components';
import { Box, Button, Typography } from '@mui/material';
import { FaSchool, FaSun, FaMoon, FaSignOutAlt } from 'react-icons/fa';
import { useAppTheme } from '../../themes/components/AppThemeProvider';
import { useAuth } from '../../../common/hooks/useAuth';

const HeaderWrapper = styled.header`
  border-bottom: 1px solid var(--color-border-default);
  background-color: var(--color-background-paper);
  position: sticky;
  top: 0;
  z-index: 50;
`;

export function DashboardHeader() {
  const { mode, toggleTheme } = useAppTheme();
  const { user, logout } = useAuth();

  return (
    <HeaderWrapper>
      <Box className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Box className="flex items-center gap-3">
          <FaSchool className="text-[var(--color-primary-main)]" size={32} />
          <Typography variant="h6" className="font-bold text-[var(--color-text-primary)]">
            School OS Ecosystem
          </Typography>
        </Box>
        <Box className="flex items-center gap-3">
          <Button variant="outlined" color="primary" onClick={toggleTheme}>
            {mode === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
          </Button>
          {user && (
            <Button variant="outlined" color="secondary" startIcon={<FaSignOutAlt />} onClick={logout}>
              Logout
            </Button>
          )}
        </Box>
      </Box>
    </HeaderWrapper>
  );
}

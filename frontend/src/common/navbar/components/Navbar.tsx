import { useState } from 'react';
import { Box, Typography, IconButton, Badge, Menu, MenuItem, ListItemIcon, Avatar } from '@mui/material';
import { FaBars, FaBell, FaSun, FaMoon, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useAppTheme } from '../../../features/themes/components/AppThemeProvider';
import { useAuth } from '@common/hooks/useAuth';
import { useDialog } from '@common/Dialogs/dialog.provider';
import { useUpdateSchoolMutation } from '@api/schoolsApi';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import type { NavbarProps } from '../types/navbar.types';
import { NavbarWrapper, BrandBox } from '../styles/navbar.styles';

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { mode, toggleTheme } = useAppTheme();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { openDialog, closeDialog } = useDialog();
  const [updateSchool] = useUpdateSchoolMutation();
  const notifier = useNotifier();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    logout();
  };

  const handleProfileClick = () => {
    handleMenuClose();
    if (user?.role?.name === 'SUPER_ADMIN') {
      openDialog('USER_DETAILS', { userId: user._id });
    } else if (user?.role?.name === 'SCHOOL_ADMIN' && user.schoolId) {
      const schoolId = typeof user.schoolId === 'object' ? user.schoolId._id : user.schoolId;
      openDialog('SCHOOL_FORM', {
        schoolId,
        onSubmit: async (data) => {
          try {
            await updateSchool({ id: schoolId, body: data }).unwrap();
            notifier.showSuccess('School updated successfully!');
            closeDialog();
          } catch (err: unknown) {
            const error = err as { data?: { message?: string }; message?: string };
            notifier.showError(error?.data?.message || error?.message || 'Failed to update school');
          }
        }
      });
    }
  };

  return (
    <NavbarWrapper>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton 
          onClick={onToggleSidebar} 
          edge="start" 
          sx={{ color: 'var(--color-text-primary)' }}
        >
          <FaBars size={20} />
        </IconButton>
        <BrandBox>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800, 
              color: 'var(--color-text-primary)',
              letterSpacing: '0.02em',
              display: { xs: 'none', sm: 'block' } 
            }}
          >
            School OS Ecosystem
          </Typography>
        </BrandBox>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={toggleTheme} sx={{ color: 'var(--color-text-secondary)' }}>
          {mode === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
        </IconButton>

        <IconButton sx={{ color: 'var(--color-text-secondary)' }}>
          <Badge badgeContent={3} color="error" variant="dot">
            <FaBell size={18} />
          </Badge>
        </IconButton>

        {user && (
          <>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }} data-testid="avatar-menu-button">
              <Avatar 
                sx={{ 
                  width: 38, 
                  height: 38, 
                  bgcolor: 'var(--color-primary-main)',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 600
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1.5,
                    minWidth: 180,
                    border: '1px solid var(--color-border-default)',
                    bgcolor: 'var(--color-background-paper)',
                    backgroundImage: 'none',
                    boxShadow: 'var(--color-shadow-md)',
                  }
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                  {user.role.name.replace('_', ' ')}
                </Typography>
              </Box>

              {(user.role.name === 'SUPER_ADMIN' || user.role.name === 'SCHOOL_ADMIN') && (
                <MenuItem onClick={handleProfileClick} sx={{ color: 'var(--color-text-primary)' }}>
                  <ListItemIcon sx={{ color: 'var(--color-text-secondary)', minWidth: 36 }}>
                    <FaUser size={14} />
                  </ListItemIcon>
                  Profile
                </MenuItem>
              )}

              <MenuItem onClick={handleLogoutClick} sx={{ color: 'var(--color-text-primary)' }} data-testid="logout-menu-item">
                <ListItemIcon sx={{ color: 'var(--color-text-secondary)', minWidth: 36 }}>
                  <FaSignOutAlt size={14} />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>
    </NavbarWrapper>
  );
}
export default Navbar;

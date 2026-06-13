import { useState, useEffect } from 'react';
import { Box, Drawer } from '@mui/material';
import { useLocation } from 'react-router-dom';
import type { SidebarProps } from '../types/navbar.types';
import { SidebarWrapper } from '../styles/navbar.styles';
import { ProfileSection, MenuItemsList } from './Menus';

export function Sidebar({ collapsed, mobileOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(() => {
    if (location.pathname.startsWith('/app-management')) {
      return 'App Management';
    }
    if (location.pathname.startsWith('/school-management')) {
      return 'School Management';
    }
    if (location.pathname.startsWith('/user-management')) {
      return 'User Management';
    }
    if (location.pathname.startsWith('/attendance')) {
      return 'Attendance';
    }
    if (location.pathname.startsWith('/exams')) {
      return 'Exams';
    }
    if (location.pathname.startsWith('/homework')) {
      return 'Homework';
    }
    if (location.pathname.startsWith('/communication')) {
      return 'Communication';
    }
    if (location.pathname.startsWith('/timetable')) {
      return 'Timetable';
    }
    if (location.pathname.startsWith('/account-management')) {
      return 'Account Management';
    }
    if (location.pathname.startsWith('/learning')) {
      return 'Learning';
    }
    if (location.pathname.startsWith('/ai-learning')) {
      return 'AI Learning';
    }
    if (location.pathname.startsWith('/settings')) {
      return 'Languages';
    }
    return null;
  });

  useEffect(() => {
    if (location.pathname.startsWith('/app-management')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenSubmenu('App Management');
    } else if (location.pathname.startsWith('/school-management')) {
      setOpenSubmenu('School Management');
    } else if (location.pathname.startsWith('/user-management')) {
      setOpenSubmenu('User Management');
    } else if (location.pathname.startsWith('/attendance')) {
      setOpenSubmenu('Attendance');
    } else if (location.pathname.startsWith('/exams')) {
      setOpenSubmenu('Exams');
    } else if (location.pathname.startsWith('/homework')) {
      setOpenSubmenu('Homework');
    } else if (location.pathname.startsWith('/communication')) {
      setOpenSubmenu('Communication');
    } else if (location.pathname.startsWith('/timetable')) {
      setOpenSubmenu('Timetable');
    } else if (location.pathname.startsWith('/account-management')) {
      setOpenSubmenu('Account Management');
    } else if (location.pathname.startsWith('/learning')) {
      setOpenSubmenu('Learning');
    } else if (location.pathname.startsWith('/ai-learning')) {
      setOpenSubmenu('AI Learning');
    } else if (location.pathname.startsWith('/settings')) {
      setOpenSubmenu('Languages');
    }
  }, [location.pathname]);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(prev => (prev === label ? null : label));
  };

  return (
    <>
      {/* Mobile Drawer (temporary overlay drawer) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 260,
            bgcolor: 'var(--color-background-paper)',
            backgroundImage: 'none',
            borderRight: '1px solid var(--color-border-default)'
          },
        }}
      >
        <ProfileSection collapsed={false} />
        <MenuItemsList 
          collapsed={false} 
          openSubmenu={openSubmenu} 
          toggleSubmenu={toggleSubmenu}
          onItemClick={onClose}
        />
      </Drawer>

      {/* Desktop Sidebar (collapsible sticky panel) */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <SidebarWrapper $collapsed={collapsed}>
          <ProfileSection collapsed={collapsed} />
          <MenuItemsList 
            collapsed={collapsed} 
            openSubmenu={openSubmenu} 
            toggleSubmenu={toggleSubmenu} 
          />
        </SidebarWrapper>
      </Box>
    </>
  );
}
export default Sidebar;

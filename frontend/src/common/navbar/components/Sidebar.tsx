import { useState } from 'react';
import { Box, Drawer } from '@mui/material';
import type { SidebarProps } from '../types/navbar.types';
import { SidebarWrapper } from '../styles/navbar.styles';
import { ProfileSection, MenuItemsList } from './Menus';

export function Sidebar({ collapsed, mobileOpen, onClose }: SidebarProps) {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

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

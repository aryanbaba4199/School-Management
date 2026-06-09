import { useState } from 'react';
import { useMediaQuery } from '@mui/material';

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 900px)');

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(prev => (prev === label ? null : label));
  };

  return {
    collapsed,
    mobileOpen,
    openSubmenu,
    isMobile,
    toggleSidebar,
    closeMobileSidebar,
    toggleSubmenu,
  };
}
export type UseSidebarReturn = ReturnType<typeof useSidebar>;

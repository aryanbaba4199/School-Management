import type { ReactNode } from 'react';

export interface SubMenuItemType {
  label: string;
  roles: string[];
  active?: boolean;
}

export interface MenuItemType {
  label: string;
  icon: ReactNode;
  roles: string[];
  active?: boolean;
  children?: SubMenuItemType[]; // Support parent-child navigation
}

export interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}

export interface NavbarProps {
  onToggleSidebar: () => void;
}

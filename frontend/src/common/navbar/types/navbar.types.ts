import type { ReactNode } from 'react';

export interface SubMenuItemType {
  label: string;
  roles: string[];
  disable?: string[];
  active?: boolean;
  path?: string;
}

export interface MenuItemType {
  label: string;
  icon: ReactNode;
  roles: string[];
  disable?: string[];
  active?: boolean;
  path?: string;
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

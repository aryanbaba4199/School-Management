import { 
  Box, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Typography, Collapse, Avatar, Tooltip 
} from '@mui/material';
import { 
  FaChartPie, FaSchool, FaUsers, 
  FaClipboardList, FaBook, FaUserCheck, FaFileSignature, FaBookOpen, 
  FaCreditCard, FaBell, FaChevronDown, FaChevronUp, FaCogs 
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@common/hooks/useAuth';
import type { MenuItemType } from '../types/navbar.types';
import { ActiveBar } from '../styles/navbar.styles';

const MENU_ITEMS: MenuItemType[] = [
  { label: 'Dashboard', icon: <FaChartPie size={16} />, roles: ['ALL'], path: '/' },
  {
    label: 'App Management',
    icon: <FaCogs size={16} />,
    roles: ['SUPER_ADMIN'],
    children: [
      { label: 'Plans Management', roles: ['SUPER_ADMIN'], path: '/app-management/plans' }
    ]
  },
  { label: 'Schools', icon: <FaSchool size={16} />, roles: ['SUPER_ADMIN'], path: '/schools' },
  {
    label: 'User Management',
    icon: <FaUsers size={16} />,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
    children: [
      { label: 'Students', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'], path: '/user-management/students' },
      { label: 'Teachers', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'], path: '/user-management/teachers' },
      { label: 'Parents', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'], path: '/user-management/parents' }
    ]
  },
  { label: 'Classes & Sections', icon: <FaClipboardList size={16} />, roles: ['SCHOOL_ADMIN', 'TEACHER'], path: '/classes' },
  { label: 'Subjects', icon: <FaBook size={16} />, roles: ['SCHOOL_ADMIN', 'TEACHER'], path: '/subjects' },
  { label: 'Attendance', icon: <FaUserCheck size={16} />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'], path: '/attendance' },
  { label: 'Exams & Marks', icon: <FaFileSignature size={16} />, roles: ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'], path: '/exams' },
  { label: 'Homeworks', icon: <FaBookOpen size={16} />, roles: ['TEACHER', 'STUDENT', 'PARENT'], path: '/homeworks' },
  { label: 'Fees & Payments', icon: <FaCreditCard size={16} />, roles: ['SCHOOL_ADMIN', 'PARENT'], path: '/fees' },
  { label: 'Notifications', icon: <FaBell size={16} />, roles: ['ALL'], path: '/notifications' },
];

export function ProfileSection({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth();
  if (!user) return null;
  const initials = user.name.charAt(0).toUpperCase();

  if (collapsed) {
    return (
      <Tooltip title={`${user.name} (${user.role.name})`} placement="right">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.5, borderBottom: '1px solid var(--color-border-default)' }}>
          <Avatar sx={{ width: 38, height: 38, bgcolor: 'var(--color-primary-main)' }}>{initials}</Avatar>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ p: 2.5, borderBottom: '1px solid var(--color-border-default)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 44, height: 44, bgcolor: 'var(--color-primary-main)' }}>{initials}</Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{user.name}</Typography>
          <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block', textTransform: 'capitalize' }}>
            {user.role.name.toLowerCase().replace('_', ' ')}
          </Typography>
          <Typography variant="caption" sx={{ color: 'var(--color-text-disabled)', fontFamily: 'monospace' }}>{user.userCode}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

interface MenuItemsListProps {
  collapsed: boolean;
  openSubmenu: string | null;
  toggleSubmenu: (label: string) => void;
  onItemClick?: () => void;
}

export function MenuItemsList({ collapsed, openSubmenu, toggleSubmenu, onItemClick }: MenuItemsListProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = user?.role?.name || '';

  const allowedItems = MENU_ITEMS.filter(item => item.roles.includes('ALL') || item.roles.includes(userRole));

  return (
    <List sx={{ py: 1 }}>
      {allowedItems.map((item, idx) => {
        const hasChildren = item.children && item.children.length > 0;
        const isSubmenuOpen = openSubmenu === item.label;
        const isActive = item.path === '/' 
          ? location.pathname === '/' 
          : (item.path 
              ? location.pathname.startsWith(item.path) 
              : (item.children ? item.children.some(c => c.path && location.pathname.startsWith(c.path)) : false));

        return (
          <ListItem key={idx} disablePadding sx={{ display: 'block', position: 'relative' }}>
            <ActiveBar $active={isActive} />
            
            {hasChildren ? (
              <>
                <ListItemButton
                  onClick={() => {
                    toggleSubmenu(item.label);
                    if (onItemClick && collapsed) onItemClick();
                  }}
                  sx={{
                    minHeight: 48, justifyContent: collapsed ? 'center' : 'initial', px: 2.5, py: 1.5,
                    color: isActive ? 'var(--color-primary-main)' : 'var(--color-text-secondary)',
                    '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.03)', color: 'var(--color-primary-main)' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 'auto' : 3, justifyContent: 'center', color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <>
                      <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: 500 }}>{item.label}</Typography>} />
                      {isSubmenuOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </>
                  )}
                </ListItemButton>

                {!collapsed && (
                  <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 2 }}>
                      {item.children!.map((child, cIdx) => {
                        const isChildActive = child.path ? location.pathname === child.path : false;
                        return (
                          <ListItemButton
                            key={cIdx}
                            onClick={() => {
                              if (child.path) navigate(child.path);
                              if (onItemClick) onItemClick();
                            }}
                            sx={{
                              minHeight: 40, pl: 5,
                              color: isChildActive ? 'var(--color-primary-main)' : 'var(--color-text-secondary)',
                              '&:hover': { color: 'var(--color-primary-main)', bgcolor: 'rgba(124, 58, 237, 0.02)' }
                            }}
                          >
                            <ListItemText primary={<Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{child.label}</Typography>} />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </>
            ) : (
              <ListItemButton
                onClick={() => {
                  if (item.path) navigate(item.path);
                  if (onItemClick) onItemClick();
                }}
                sx={{
                  minHeight: 48, justifyContent: collapsed ? 'center' : 'initial', px: 2.5, py: 1.5,
                  color: isActive ? 'var(--color-primary-main)' : 'var(--color-text-secondary)',
                  bgcolor: isActive ? 'rgba(124, 58, 237, 0.05)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(124, 58, 237, 0.03)', color: 'var(--color-primary-main)',
                    '& .MuiListItemIcon-root': { color: 'var(--color-primary-main)' }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 'auto' : 3, justifyContent: 'center', color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: isActive ? 700 : 500 }}>{item.label}</Typography>} />
                )}
              </ListItemButton>
            )}
          </ListItem>
        );
      })}
    </List>
  );
}

import { 
  Box, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Typography, Collapse, Avatar, Tooltip, tooltipClasses 
} from '@mui/material';
import { 
  FaChartPie, FaSchool, FaUsers, 
  FaUserCheck, FaFileSignature, FaBookOpen, 
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
  {
    label: 'School Management',
    icon: <FaSchool size={16} />,
    roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
    children: [
      { label: 'Manage Schools', roles: ['SUPER_ADMIN'], path: '/school-management/manage-schools' },
      { label: 'Classes', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'], path: '/school-management/classes' },
      { label: 'Subjects', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'], path: '/school-management/subjects' }
    ]
  },
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
  { label: 'Attendance', icon: <FaUserCheck size={16} />, roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'], path: '/attendance' },
  {
    label: 'Exam and Events',
    icon: <FaFileSignature size={16} />,
    roles: ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
    children: [
      { label: 'Examination', roles: ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'], path: '/exams' },
      { label: 'Results', roles: ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'], path: '/results' },
      { label: 'PTM', roles: ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'], path: '/ptm' },
      { label: 'Celebration', roles: ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'], path: '/celebration' }
    ]
  },
  { label: 'Homeworks', icon: <FaBookOpen size={16} />, roles: ['TEACHER', 'STUDENT', 'PARENT'], path: '/homeworks' },
  {
    label: 'Account Management',
    icon: <FaCreditCard size={16} />,
    roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN'],
    children: [
      { label: 'Fees Management', roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN'], path: '/account-management/fees' },
      { label: 'Transaction Management', roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN'], path: '/account-management/transactions' }
    ]
  },
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

  const allowedItems = MENU_ITEMS
    .filter(item => item.roles.includes('ALL') || item.roles.includes(userRole))
    .map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(child => child.roles.includes('ALL') || child.roles.includes(userRole))
        };
      }
      return item;
    })
    .filter(item => !(item.children && item.children.length === 0));

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
            <Tooltip
              title={
                collapsed ? (
                  hasChildren ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle2" sx={{ px: 2, py: 1.5, fontWeight: 700, borderBottom: '1px solid var(--color-border-default)', bgcolor: 'rgba(124, 58, 237, 0.05)' }}>
                        {item.label}
                      </Typography>
                      <List disablePadding>
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
                                px: 2, py: 1.2,
                                color: isChildActive ? 'var(--color-primary-main)' : 'var(--color-text-secondary)',
                                '&:hover': { color: 'var(--color-primary-main)', bgcolor: 'rgba(124, 58, 237, 0.02)' }
                              }}
                            >
                              <ListItemText primary={<Typography variant="body2" sx={{ fontWeight: isChildActive ? 600 : 400 }}>{child.label}</Typography>} />
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </Box>
                  ) : (
                    item.label
                  )
                ) : (
                  ''
                )
              }
              placement="right-start"
              disableInteractive={!hasChildren}
              disableHoverListener={!collapsed}
              slotProps={{
                popper: {
                  sx: {
                    [`& .${tooltipClasses.tooltip}`]: hasChildren ? {
                      bgcolor: 'var(--color-bg-paper)',
                      color: 'var(--color-text-primary)',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                      border: '1px solid var(--color-border-default)',
                      p: 0,
                      minWidth: 220,
                      borderRadius: 2
                    } : undefined
                  }
                }
              }}
            >
              <Box sx={{ width: '100%' }}>
                {hasChildren ? (
                  <>
                    {(() => {
                      const parentButton = (
                        <ListItemButton
                          onClick={(e) => {
                            if (item.disable?.includes(userRole)) {
                              e.preventDefault();
                              return;
                            }
                            toggleSubmenu(item.label);
                            if (onItemClick && collapsed) onItemClick();
                          }}
                          sx={{
                            minHeight: 48, justifyContent: collapsed ? 'center' : 'initial', px: 2.5, py: 1.5,
                            color: isActive ? 'var(--color-primary-main)' : 'var(--color-text-secondary)',
                            opacity: item.disable?.includes(userRole) ? 0.5 : 1,
                            cursor: item.disable?.includes(userRole) ? 'not-allowed' : 'pointer',
                            '&:hover': item.disable?.includes(userRole) ? {} : { bgcolor: 'rgba(124, 58, 237, 0.03)', color: 'var(--color-primary-main)' }
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
                      );
                      return item.disable?.includes(userRole) ? (
                        <Tooltip title="You are not authorized to access this" placement="right">
                          <Box>{parentButton}</Box>
                        </Tooltip>
                      ) : parentButton;
                    })()}

                    {!collapsed && (
                      <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {item.children!.map((child, cIdx) => {
                            const isChildActive = child.path ? location.pathname === child.path : false;
                            const isChildDisabled = child.disable?.includes(userRole);
                            const childButton = (
                              <ListItemButton
                                key={cIdx}
                                onClick={(e) => {
                                  if (isChildDisabled) {
                                    e.preventDefault();
                                    return;
                                  }
                                  if (child.path) navigate(child.path);
                                  if (onItemClick) onItemClick();
                                }}
                                sx={{
                                  minHeight: 40, pl: 9,
                                  color: isChildActive ? 'var(--color-primary-main)' : 'var(--color-text-secondary)',
                                  opacity: isChildDisabled ? 0.5 : 1,
                                  cursor: isChildDisabled ? 'not-allowed' : 'pointer',
                                  '&:hover': isChildDisabled ? {} : { color: 'var(--color-primary-main)', bgcolor: 'rgba(124, 58, 237, 0.02)' },
                                  position: 'relative',
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: 52,
                                    top: '50%',
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    bgcolor: isChildActive ? 'var(--color-primary-main)' : 'var(--color-text-disabled)',
                                    transform: 'translateY(-50%)',
                                    transition: 'all 0.2s ease-in-out'
                                  },
                                  '&:hover::before': isChildDisabled ? {} : {
                                    bgcolor: 'var(--color-primary-main)',
                                    transform: 'translateY(-50%) scale(1.2)'
                                  }
                                }}
                              >
                                <ListItemText primary={<Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: isChildActive ? 600 : 400 }}>{child.label}</Typography>} />
                              </ListItemButton>
                            );
                            
                            return isChildDisabled ? (
                              <Tooltip title="You are not authorized to access this" placement="right" key={cIdx}>
                                <Box>{childButton}</Box>
                              </Tooltip>
                            ) : childButton;
                          })}
                        </List>
                      </Collapse>
                    )}
                  </>
                ) : (
                  (() => {
                    const singleButton = (
                      <ListItemButton
                        onClick={(e) => {
                          if (item.disable?.includes(userRole)) {
                            e.preventDefault();
                            return;
                          }
                          if (item.path) navigate(item.path);
                          if (onItemClick) onItemClick();
                        }}
                        sx={{
                          minHeight: 48, justifyContent: collapsed ? 'center' : 'initial', px: 2.5, py: 1.5,
                          color: isActive ? 'var(--color-primary-main)' : 'var(--color-text-secondary)',
                          bgcolor: isActive ? 'rgba(124, 58, 237, 0.05)' : 'transparent',
                          opacity: item.disable?.includes(userRole) ? 0.5 : 1,
                          cursor: item.disable?.includes(userRole) ? 'not-allowed' : 'pointer',
                          '&:hover': item.disable?.includes(userRole) ? {} : {
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
                    );
                    return item.disable?.includes(userRole) ? (
                      <Tooltip title="You are not authorized to access this" placement="right">
                        <Box>{singleButton}</Box>
                      </Tooltip>
                    ) : singleButton;
                  })()
                )}
              </Box>
            </Tooltip>
          </ListItem>
        );
      })}
    </List>
  );
}

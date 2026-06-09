import { useState, MouseEvent, ReactNode } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { FaEllipsisV } from 'react-icons/fa';

export interface ActionMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  disabled?: boolean;
  disabledReason?: string;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
}

export function ActionMenu({ items }: ActionMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? 'action-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        aria-label="Actions"
        title="Actions"
      >
        <FaEllipsisV size={16} />
      </IconButton>
      <Menu
        id="action-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'action-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              boxShadow: 'var(--shadow-md)',
              borderRadius: 'var(--radius-md)',
              minWidth: 150,
            }
          }
        }}
      >
        {items.map((item, index) => {
          const menuItem = (
            <MenuItem 
              key={index} 
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
                handleClose(e);
              }}
              disabled={item.disabled}
              sx={{ color: item.color ? `${item.color}.main` : 'inherit' }}
            >
              {item.icon && (
                <ListItemIcon sx={{ color: 'inherit', minWidth: '36px !important' }}>
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          );

          if (item.disabled && item.disabledReason) {
            return (
              <Tooltip key={index} title={item.disabledReason} placement="left">
                <span>{menuItem}</span>
              </Tooltip>
            );
          }

          return menuItem;
        })}
      </Menu>
    </>
  );
}

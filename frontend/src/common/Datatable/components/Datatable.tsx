import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Typography,
  TableSortLabel,
} from '@mui/material';
import { FaEllipsisV } from 'react-icons/fa';
import styled from 'styled-components';
import type { Column, ActionItem } from '../types/datatable.types';


const StyledHeaderCell = styled(TableCell)`
  font-weight: 700 !important;
  color: var(--color-text-primary) !important;
  background-color: rgba(255, 255, 255, 0.02) !important;
  border-bottom: 2px solid var(--color-border-default) !important;
`;

const StyledTableRow = styled(TableRow)`
  &:hover {
    background-color: rgba(255, 255, 255, 0.02) !important;
    cursor: pointer;
  }
  transition: background-color 0.2s ease-in-out;
`;

interface DatatableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  actions?: ActionItem<T>[];
  onRowClick?: (row: T) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
}

export default function Datatable<T extends { _id: string }>({
  columns,
  data,
  loading = false,
  actions = [],
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
}: DatatableProps<T>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<T | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, row: T) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActiveRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveRow(null);
  };

  const handleActionClick = (action: ActionItem<T>) => {
    if (activeRow) {
      action.onClick(activeRow);
    }
    handleMenuClose();
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        border: '1px solid var(--color-border-default)',
        borderRadius: '8px',
        backgroundColor: 'var(--color-background-paper)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <StyledHeaderCell key={col.id} align={col.align || 'left'}>
                {col.sortable && onSort ? (
                  <TableSortLabel
                    active={sortColumn === col.id}
                    direction={sortColumn === col.id ? sortDirection : 'asc'}
                    onClick={() => onSort(col.id)}
                  >
                    {col.label}
                  </TableSortLabel>
                ) : (
                  col.label
                )}
              </StyledHeaderCell>
            ))}
            {actions.length > 0 && <StyledHeaderCell align="right">Actions</StyledHeaderCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} align="center" sx={{ py: 6 }}>
                <CircularProgress color="primary" />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (actions.length > 0 ? 1 : 0)} align="center" sx={{ py: 6 }}>
                <Typography variant="body1" color="textSecondary">
                  No records found.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <StyledTableRow key={row._id} onClick={() => onRowClick?.(row)}>
                {columns.map((col) => {
                  const cellValue = row[col.id as keyof T];
                  return (
                    <TableCell key={col.id} align={col.align || 'left'} sx={{ color: 'var(--color-text-primary)' }}>
                      {col.render ? col.render(row) : (cellValue !== null && cellValue !== undefined ? String(cellValue) : '')}
                    </TableCell>
                  );
                })}
                {actions.length > 0 && (
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)}>
                      <FaEllipsisV style={{ color: 'var(--color-text-secondary)' }} />
                    </IconButton>
                  </TableCell>
                )}
              </StyledTableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {actions.map((action, idx) => (
          <MenuItem key={idx} onClick={() => handleActionClick(action)}>
            {action.icon && <ListItemIcon>{action.icon}</ListItemIcon>}
            <ListItemText sx={{ color: action.color ? `var(--color-${action.color}-main)` : 'inherit' }}>
              {action.label}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </TableContainer>
  );
}

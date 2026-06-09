import { useState, useEffect } from 'react';
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
  Checkbox,
  Box,
  Tooltip
} from '@mui/material';
import { FaEllipsisV, FaColumns } from 'react-icons/fa';
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
  tableName?: string;
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
  tableName,
}: DatatableProps<T>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<T | null>(null);
  
  const [columnsAnchorEl, setColumnsAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(columns.map(c => c.id));

  useEffect(() => {
    if (tableName) {
      const stored = localStorage.getItem(`datatable_cols_${tableName}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setVisibleColumnIds(parsed);
          }
        } catch (err) {}
      }
    }
  }, [tableName]);

  const handleToggleColumn = (colId: string) => {
    let newIds = [...visibleColumnIds];
    if (newIds.includes(colId)) {
      newIds = newIds.filter(id => id !== colId);
      if (newIds.length === 0) return; // Prevent hiding all columns
    } else {
      newIds.push(colId);
    }
    
    // Sort newIds based on original column order
    newIds = columns.map(c => c.id).filter(id => newIds.includes(id));
    
    setVisibleColumnIds(newIds);
    if (tableName) {
      localStorage.setItem(`datatable_cols_${tableName}`, JSON.stringify(newIds));
    }
  };

  const visibleColumns = columns.filter(c => visibleColumnIds.includes(c.id));

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
      {tableName && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, borderBottom: '1px solid var(--color-border-default)' }}>
          <Tooltip title="Select Columns">
            <IconButton onClick={(e) => setColumnsAnchorEl(e.currentTarget)}>
              <FaColumns style={{ fontSize: 16, color: 'var(--color-text-secondary)' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            {visibleColumns.map((col) => (
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
              <TableCell colSpan={visibleColumns.length + (actions.length > 0 ? 1 : 0)} align="center" sx={{ py: 6 }}>
                <CircularProgress color="primary" />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleColumns.length + (actions.length > 0 ? 1 : 0)} align="center" sx={{ py: 6 }}>
                <Typography variant="body1" color="textSecondary">
                  No records found.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <StyledTableRow key={row._id} onClick={() => onRowClick?.(row)}>
                {visibleColumns.map((col) => {
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

      <Menu
        anchorEl={columnsAnchorEl}
        open={Boolean(columnsAnchorEl)}
        onClose={() => setColumnsAnchorEl(null)}
      >
        {columns.map((col) => (
          <MenuItem key={col.id} onClick={(e) => { e.stopPropagation(); handleToggleColumn(col.id); }}>
            <ListItemIcon>
              <Checkbox 
                checked={visibleColumnIds.includes(col.id)} 
                disableRipple 
                size="small" 
                sx={{ p: 0 }}
              />
            </ListItemIcon>
            <ListItemText>{col.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </TableContainer>
  );
}

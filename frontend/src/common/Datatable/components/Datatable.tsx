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
  Checkbox,
  Box,
  Tooltip
} from '@mui/material';
import { FaEllipsisV, FaColumns, FaFilter } from 'react-icons/fa';
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
  filterValues?: Record<string, unknown>;
  onFilterChange?: (columnId: string, value: unknown) => void;
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
  filterValues = {},
  onFilterChange,
}: DatatableProps<T>) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<T | null>(null);

  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [activeFilterCol, setActiveFilterCol] = useState<Column<T> | null>(null);
  
  const [columnsAnchorEl, setColumnsAnchorEl] = useState<null | HTMLElement>(null);
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() => {
    if (tableName) {
      const stored = localStorage.getItem(`datatable_cols_${tableName}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch {
          // Ignore parse errors and fall back to default columns
        }
      }
    }
    return columns.map(c => c.id);
  });

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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start' }}>
                  {col.sortable && onSort ? (
                    <TableSortLabel
                      active={sortColumn === col.id}
                      direction={sortColumn === col.id ? sortDirection : 'asc'}
                      onClick={() => onSort(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    <span>{col.label}</span>
                  )}
                  {col.filterable && (
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        setFilterAnchorEl(e.currentTarget);
                        setActiveFilterCol(col);
                      }}
                      sx={{ 
                        ml: 0.5, 
                        p: 0.5,
                        color: filterValues[col.id] ? 'primary.main' : 'var(--color-text-secondary)',
                      }}
                    >
                      <FaFilter size={12} />
                    </IconButton>
                  )}
                </Box>
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

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => {
          setFilterAnchorEl(null);
          setActiveFilterCol(null);
        }}
      >
        {activeFilterCol?.filterOptions?.map(option => (
          <MenuItem 
            key={String(option.value)} 
            selected={filterValues[activeFilterCol.id] === option.value}
            onClick={() => {
              if (onFilterChange) {
                onFilterChange(activeFilterCol.id, option.value);
              }
              setFilterAnchorEl(null);
              setActiveFilterCol(null);
            }}
          >
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Menu>
    </TableContainer>
  );
}

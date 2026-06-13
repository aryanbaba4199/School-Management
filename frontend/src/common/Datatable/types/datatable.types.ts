import type { ReactNode } from 'react';

/*------------- Datatable Types Definitions -------------*/

export interface Column<T> {
  id: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: { label: string; value: unknown }[];
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => ReactNode;
}

export interface ActionItem<T> {
  label: string;
  icon?: ReactNode;
  onClick: (row: T) => void;
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info' | 'inherit';
}

export interface DatatablePagination {
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onChangePage: (page: number) => void;
  onChangeRowsPerPage: (rowsPerPage: number) => void;
}

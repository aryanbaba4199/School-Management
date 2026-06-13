import { useState } from 'react';

export function useTransactionFilters() {
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleFilterChange = (columnId: string, value: unknown) => {
    setFilterValues((prev) => {
      const newFilters = { ...prev };
      if (value === '' || value === undefined || value === null) {
        delete newFilters[columnId];
      } else {
        newFilters[columnId] = value;
      }
      return newFilters;
    });
  };

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  return {
    filterValues,
    handleFilterChange,
    sortColumn,
    sortDirection,
    handleSort,
  };
}

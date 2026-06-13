import { useState } from 'react';
import { PageWrapper, Datatable, DatatableHeader, DatatableFooter } from '@common/Datatable';
import { transactionColumns } from '../components/transactionColumns';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import { useGetAllTransactionsQuery } from '@api/feesApi';
import type { IFeeInvoice } from '@api/feesApi';
import { Box, Typography } from '@mui/material';

export function TransactionsPage() {
  const { filterValues, handleFilterChange, sortColumn, sortDirection, handleSort } = useTransactionFilters();
  const statusFilter = filterValues['status'];

  const { data: res, isLoading, error } = useGetAllTransactionsQuery({ status: statusFilter as string | undefined });
  const transactions = res?.data || [];

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filteredTransactions = transactions.filter((t) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const student = t.studentId as unknown as { name?: string; userCode?: string };
    const studentName = student?.name?.toLowerCase() || '';
    const userCode = student?.userCode?.toLowerCase() || '';
    const paymentMsg = t.paymentMessage?.toLowerCase() || '';
    const paymentMode = t.paymentMode?.toLowerCase() || '';
    return studentName.includes(searchLower) || 
           userCode.includes(searchLower) || 
           paymentMsg.includes(searchLower) || 
           paymentMode.includes(searchLower);
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let aVal: unknown = a[sortColumn as keyof IFeeInvoice];
    let bVal: unknown = b[sortColumn as keyof IFeeInvoice];

    if (sortColumn === 'studentName') {
      aVal = (a.studentId as unknown as { name?: string })?.name || '';
      bVal = (b.studentId as unknown as { name?: string })?.name || '';
    } else if (sortColumn === 'classId') {
      aVal = (a.classId as unknown as { name?: string })?.name || '';
      bVal = (b.classId as unknown as { name?: string })?.name || '';
    }

    if ((aVal as string | number) < (bVal as string | number)) return sortDirection === 'asc' ? -1 : 1;
    if ((aVal as string | number) > (bVal as string | number)) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedTransactions = sortedTransactions.slice((page - 1) * limit, page * limit);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <PageWrapper title="Transaction Management">
      <DatatableHeader 
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search all transactions..."
      />
      
      {error ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error">Failed to load transactions</Typography>
        </Box>
      ) : (
        <Datatable<IFeeInvoice>
          columns={transactionColumns}
          data={paginatedTransactions}
          loading={isLoading}
          tableName="transactions"
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      )}

      <DatatableFooter
        page={page - 1}
        rowsPerPage={limit}
        totalCount={filteredTransactions.length}
        onChangePage={(newPage) => handlePageChange(newPage + 1)}
        onChangeRowsPerPage={handleLimitChange}
      />
    </PageWrapper>
  );
}

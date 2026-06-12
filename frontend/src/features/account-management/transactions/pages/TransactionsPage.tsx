import { useState } from 'react';
import { PageWrapper, Datatable, DatatableHeader, DatatableFooter } from '@common/Datatable';
import { transactionColumns } from '../components/transactionColumns';
import { useGetAllTransactionsQuery } from '../../../../api/feesApi';
import type { IFeeInvoice } from '../../../../api/feesApi';
import { Box, Typography } from '@mui/material';

export function TransactionsPage() {
  const { data: res, isLoading, error } = useGetAllTransactionsQuery();
  const transactions = res?.data || [];

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filteredTransactions = transactions.filter((t) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const student = t.studentId as any;
    const studentName = student?.name?.toLowerCase() || '';
    const userCode = student?.userCode?.toLowerCase() || '';
    return studentName.includes(searchLower) || userCode.includes(searchLower);
  });

  const paginatedTransactions = filteredTransactions.slice((page - 1) * limit, page * limit);

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
        search={search}
        onSearchChange={setSearch}
        title="All Transactions"
      />
      
      {error ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error">Failed to load transactions</Typography>
        </Box>
      ) : (
        <Datatable<IFeeInvoice>
          columns={transactionColumns}
          data={paginatedTransactions}
          isLoading={isLoading}
          tableName="transactions"
        />
      )}

      <DatatableFooter
        pagination={{
          page,
          limit,
          total: filteredTransactions.length,
          totalPages: Math.ceil(filteredTransactions.length / limit)
        }}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </PageWrapper>
  );
}

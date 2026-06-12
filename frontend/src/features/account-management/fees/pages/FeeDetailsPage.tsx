import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Tooltip, Chip,  } from '@mui/material';
import { FaArrowLeft, FaReceipt } from 'react-icons/fa';
import { PageWrapper, DatatableHeader, Datatable, DatatableFooter } from '@common/Datatable';
import type { Column } from '@common/Datatable';
import { useGetFeeCycleDetailsQuery } from '@api/feesApi';
import type { IFeeInvoice } from '@api/feesApi';
import { MoneyReceiptDialog } from '../components/MoneyReceiptDialog';

interface IStudentFeeRow {
  _id: string;
  studentId: string;
  studentName: string;
  userCode: string;
  className: string;
  amount: number;
  status: string;
  paidAt?: string;
  dueDate?: string;
}

export function FeeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Extract type, year, month from id
  const parts = id ? id.split('-') : [];
  const type = parts[0];
  const year = parseInt(parts[1] || '0', 10);
  const month = parseInt(parts[2] || '0', 10);

  const { data: res, isLoading } = useGetFeeCycleDetailsQuery(
    { year, month },
    { skip: !year || !month || type !== 'MONTHLY' }
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const studentsFees: IStudentFeeRow[] = useMemo(() => {
    if (!res?.data) return [];
    return res.data.map((fee: IFeeInvoice) => {
      const student = fee.studentId as unknown as { _id: string; name: string; userCode: string };
      const cls = fee.classId as unknown as { name: string };
      return {
        _id: fee._id,
        studentId: student?._id || (fee.studentId as string),
        studentName: student?.name || 'Unknown',
        userCode: student?.userCode || 'N/A',
        className: cls?.name || 'Unknown',
        amount: fee.amount,
        status: fee.status,
        paidAt: fee.paidAt,
        dueDate: fee.dueDate,
      };
    });
  }, [res]);

  const filteredData = studentsFees.filter((row) => {
    if (!search) return true;
    return (
      row.studentName.toLowerCase().includes(search.toLowerCase()) ||
      row.userCode.toLowerCase().includes(search.toLowerCase())
    );
  });

  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  const handleOpenReceipt = (row: IStudentFeeRow) => {
    setSelectedStudent({
      _id: row.studentId,
      name: row.studentName,
      userCode: row.userCode,
      className: row.className,
    });
    setReceiptDialogOpen(true);
  };

  const columns: Column<IStudentFeeRow>[] = [
    { id: 'userCode', label: 'Admission No', sortable: true },
    { id: 'studentName', label: 'Student Name', sortable: true },
    { id: 'className', label: 'Class', sortable: true },
    { 
      id: 'amount', 
      label: 'Amount (₹)', 
      sortable: true,
      render: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }}>₹ {row.amount.toLocaleString()}</Typography>
    },
    { 
      id: 'status', 
      label: 'Status', 
      sortable: true,
      render: (row) => {
        const isPaid = row.status === 'PAID';
        const isOverdue = row.status === 'OVERDUE';
        return (
          <Chip 
            label={row.status} 
            size="small" 
            color={isPaid ? 'success' : isOverdue ? 'error' : 'warning'} 
            sx={{ fontWeight: 700, fontSize: '0.7rem', height: '20px' }} 
          />
        );
      }
    },
    {
      id: 'actions',
      label: 'Action',
      sortable: false,
      render: (row) => (
        <Tooltip title="Money Receipt">
          <IconButton size="small" onClick={() => handleOpenReceipt(row)} color="secondary">
            <FaReceipt />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  const pageActions = [
    {
      label: 'Back',
      icon: <FaArrowLeft />,
      onClick: () => navigate('/account-management/fees'),
      variant: 'outlined' as const,
    }
  ];

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
  const title = type === 'MONTHLY' ? `Fee Details: ${monthName} ${year}` : `Fee Details: ${type} ${year}`;

  return (
    <PageWrapper title={title} actions={pageActions}>
      <Box sx={{ mb: 2 }}>
        <DatatableHeader 
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by student name or admission no..."
        />
      </Box>

      {type !== 'MONTHLY' ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error">Details view is currently only supported for MONTHLY fee cycles.</Typography>
        </Box>
      ) : (
        <Datatable<IStudentFeeRow>
          columns={columns}
          data={paginatedData}
          loading={isLoading}
          tableName="fee_details"
        />
      )}

      {filteredData.length > 0 && type === 'MONTHLY' && (
        <DatatableFooter
          totalCount={filteredData.length}
          page={page - 1}
          rowsPerPage={limit}
          onChangePage={(newPage) => setPage(newPage + 1)}
          onChangeRowsPerPage={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      )}

      {receiptDialogOpen && selectedStudent && (
        <MoneyReceiptDialog
          open={receiptDialogOpen}
          onClose={() => setReceiptDialogOpen(false)}
          student={selectedStudent}
        />
      )}
    </PageWrapper>
  );
}

import { useState, useEffect } from 'react';
import { Chip, Box, IconButton } from '@mui/material';
import { FaEdit, FaBan, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { PageWrapper, Datatable, DatatableHeader, DatatableFooter, type Column } from '@common/Datatable';
import { 
  useGetSchoolsQuery, 
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useDeactivateSchoolMutation,
  useDeleteSchoolMutation
} from '../../../api/schoolsApi';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { useDialog } from '@common/Dialogs/dialog.provider';
import { type ISchool, MOCK_SCHOOLS } from '../types/schools.types';
import type { SchoolFormData } from '../schema/school.schema';

export function SchoolsPage() {
  const { data: schoolsRes, isLoading, error } = useGetSchoolsQuery();
  const [createSchool] = useCreateSchoolMutation();
  const [updateSchool] = useUpdateSchoolMutation();
  const [deactivateSchool] = useDeactivateSchoolMutation();
  const [deleteSchool] = useDeleteSchoolMutation();
  const notifier = useNotifier();
  const { openDialog, closeDialog } = useDialog();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (error) {
      const msg = 'status' in error ? `Error: ${JSON.stringify(error.data)}` : error.message;
      notifier.showError(msg || 'Failed to fetch schools');
    }
  }, [error, notifier]);

  const handleSort = (columnId: string) => {
    const isAsc = sortColumn === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(columnId);
  };

  const handleCreateSchool = async (data: SchoolFormData) => {
    try {
      await createSchool(data).unwrap();
      notifier.showSuccess('School created successfully!');
      closeDialog();
    } catch (err: unknown) {
      const msg = (err && typeof err === 'object' && 'data' in err)
        ? (err.data as { message?: string })?.message 
        : 'Failed to create school';
      notifier.showError(msg || 'Failed to create school');
    }
  };

  const handleEdit = (school: ISchool) => {
    openDialog('SCHOOL_FORM', {
      school,
      onSubmit: async (data: SchoolFormData) => {
        try {
          await updateSchool({ id: school._id, body: data }).unwrap();
          notifier.showSuccess('School updated successfully!');
          closeDialog();
        } catch (err: unknown) {
          const msg = (err && typeof err === 'object' && 'data' in err)
            ? (err.data as { message?: string })?.message 
            : 'Failed to update school';
          notifier.showError(msg || 'Failed to update school');
        }
      }
    });
  };

  const handleToggleDeactivate = async (school: ISchool) => {
    try {
      await deactivateSchool(school._id).unwrap();
      notifier.showSuccess(`School ${school.isDeactive ? 'activated' : 'deactivated'} successfully!`);
    } catch (err: unknown) {
      const msg = (err && typeof err === 'object' && 'data' in err)
        ? (err.data as { message?: string })?.message 
        : 'Failed to update school status';
      notifier.showError(msg || 'Failed to update school status');
    }
  };

  const handleDelete = (school: ISchool) => {
    openDialog('PASSCODE_PROMPT', {
      title: 'Confirm Delete School',
      message: `Are you sure you want to delete ${school.name}? This action is irreversible. Enter the 6-digit master passcode to confirm.`,
      confirmLabel: 'Delete',
      onConfirm: async (passcode: string) => {
        try {
          await deleteSchool({ id: school._id, passcode }).unwrap();
          notifier.showSuccess('School deleted successfully!');
          closeDialog();
        } catch (err: unknown) {
          const msg = (err && typeof err === 'object' && 'data' in err)
            ? (err.data as { message?: string })?.message 
            : 'Failed to delete school';
          notifier.showError(msg || 'Failed to delete school');
          throw err;
        }
      }
    });
  };

  const schools = schoolsRes?.success ? schoolsRes.data : MOCK_SCHOOLS;

  // 1. Filter schools based on search query
  const filtered = schools.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.subdomain.toLowerCase().includes(search.toLowerCase())
  );

  // 2. Sort schools
  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortColumn as keyof ISchool];
    let valB = b[sortColumn as keyof ISchool];

    if (sortColumn === 'subscriptionPlan') {
      valA = typeof a.subscriptionPlan === 'object' ? a.subscriptionPlan.name : String(a.subscriptionPlan);
      valB = typeof b.subscriptionPlan === 'object' ? b.subscriptionPlan.name : String(b.subscriptionPlan);
    }

    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    const strA = String(valA);
    const strB = String(valB);
    return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
  });

  // 3. Paginate schools
  const paginated = sorted.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const columns: Column<ISchool>[] = [
    { id: 'name', label: 'School Name', sortable: true },
    { id: 'code', label: 'Code', sortable: true },
    { id: 'subdomain', label: 'Subdomain', sortable: true },
    { id: 'boardType', label: 'Board', sortable: true },
    {
      id: 'subscriptionPlan',
      label: 'Plan',
      sortable: true,
      render: (row) => typeof row.subscriptionPlan === 'object' ? row.subscriptionPlan.name : String(row.subscriptionPlan)
    },
    { id: 'maxStudents', label: 'Capacity', sortable: true },
    {
      id: 'isActive',
      label: 'Status',
      sortable: true,
      render: (row) => {
        if (row.isDeactive) {
          return (
            <Chip
              label="Deactivated"
              color="error"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          );
        }
        return (
          <Chip
            label={row.isActive ? 'Active' : 'Inactive'}
            color={row.isActive ? 'success' : 'default'}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      }
    },
    {
      id: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton 
            onClick={() => handleEdit(row)} 
            color="primary" 
            size="small"
            title="Edit School"
          >
            <FaEdit size={16} />
          </IconButton>
          <IconButton 
            onClick={() => handleToggleDeactivate(row)} 
            color={row.isDeactive ? 'success' : 'warning'} 
            size="small"
            title={row.isDeactive ? 'Activate School' : 'Deactivate School'}
          >
            {row.isDeactive ? <FaCheckCircle size={16} /> : <FaBan size={16} />}
          </IconButton>
          <IconButton 
            onClick={() => handleDelete(row)} 
            color="error" 
            size="small"
            disabled={!row.isDeactive}
            title={row.isDeactive ? 'Delete School' : 'Deactivate school first to delete'}
          >
            <FaTrash size={16} />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <PageWrapper 
      title="Schools Management" 
      onCreate={() => openDialog('SCHOOL_FORM', { onSubmit: handleCreateSchool })} 
      createLabel="Create School"
    >
      <DatatableHeader searchValue={search} onSearchChange={(val) => { setSearch(val); setPage(0); }} searchPlaceholder="Search by name, code, or subdomain..." />
      
      <Datatable
        columns={columns}
        data={paginated}
        loading={isLoading}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
      
      <DatatableFooter
        totalCount={filtered.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onChangePage={setPage}
        onChangeRowsPerPage={(rows) => { setRowsPerPage(rows); setPage(0); }}
      />
    </PageWrapper>
  );
}

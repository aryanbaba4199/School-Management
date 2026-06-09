import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Chip } from '@mui/material';
import { PageWrapper, Datatable, DatatableHeader, DatatableFooter, type Column } from '@common/Datatable';
import { useGetSchoolsQuery, useCreateSchoolMutation } from '../../../api/schoolsApi';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { SchoolForm } from '../components/SchoolForm';
import { type ISchool, MOCK_SCHOOLS } from '../types/schools.types';
import type { SchoolFormData } from '../schema/school.schema';

export function SchoolsPage() {
  const { data: schoolsRes, isLoading, error } = useGetSchoolsQuery();
  const [createSchool] = useCreateSchoolMutation();
  const notifier = useNotifier();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [dialogOpen, setDialogOpen] = useState(false);

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
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = (err && typeof err === 'object' && 'data' in err)
        ? (err.data as { message?: string })?.message 
        : 'Failed to create school';
      notifier.showError(msg || 'Failed to create school');
    }
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
      render: (row) => (
        <Chip
          label={row.isActive ? 'Active' : 'Inactive'}
          color={row.isActive ? 'success' : 'default'}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      )
    }
  ];

  return (
    <PageWrapper title="Schools Management" onCreate={() => setDialogOpen(true)} createLabel="Create School">
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

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        slotProps={{
          paper: {
            sx: {
              backgroundColor: 'var(--color-background-paper)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-default)',
              boxShadow: 'var(--shadow-lg)'
            }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: 'var(--color-text-primary)', px: 3, pt: 3, pb: 1 }}>
          Register New School
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 3, pt: 3 }}>
          <SchoolForm onSubmit={handleCreateSchool} onCancel={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}

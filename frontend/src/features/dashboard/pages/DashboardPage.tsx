import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Container, Typography, Card, CardContent, Box, Grid, Chip } from '@mui/material';
import { FaUserShield } from 'react-icons/fa';
import { useAuth } from '../../../common/hooks/useAuth';
import { useACL } from '../../../common/ACL/ACLProvider';
import { useNotifier } from '../../../common/Notifier/NotifierProvider';
import { useDialog } from '../../../common/Dialogs/dialog.provider';
import { DashboardHeader } from '../components/DashboardHeader';
import { mockSchools, type SchoolRow } from '../constants/mockSchools';
import { 
  Datatable, PageWrapper, DatatableHeader, DatatableFooter, 
  exportToCSV, exportToPDF 
} from '../../../common/Datatable';
import type { Column, ActionItem } from '../../../common/Datatable';

const AppWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-background-default);
`;

export function DashboardPage() {
  const { user } = useAuth();
  const { hasAccess } = useACL();
  const { showSuccess } = useNotifier();
  const { openDialog } = useDialog();

  const [data, setData] = useState<SchoolRow[]>(mockSchools);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortCol, setSortCol] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnId: string) => {
    const isAsc = sortCol === columnId && sortDir === 'asc';
    setSortDir(isAsc ? 'desc' : 'asc');
    setSortCol(columnId);
  };

  const filteredData = useMemo(() => {
    const result = data.filter((row) =>
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.code.toLowerCase().includes(search.toLowerCase())
    );
    result.sort((a, b) => {
      const aVal = a[sortCol as keyof SchoolRow];
      const bVal = b[sortCol as keyof SchoolRow];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });
    return result;
  }, [data, search, sortCol, sortDir]);

  const pagedData = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const columns: Column<SchoolRow>[] = [
    { id: 'name', label: 'School Name', sortable: true },
    { id: 'code', label: 'Code', sortable: true },
    { id: 'boardType', label: 'Board' },
    {
      id: 'subscriptionName',
      label: 'Plan',
      render: (row) => <Chip label={row.subscriptionName} color="secondary" size="small" variant="outlined" />,
    },
    { id: 'maxStudents', label: 'Capacity' },
    {
      id: 'isActive',
      label: 'Status',
      render: (row) => (
        <Chip
          label={row.isActive ? 'Active' : 'Inactive'}
          color={row.isActive ? 'success' : 'default'}
          size="small"
        />
      ),
    },
  ];

  const actions: ActionItem<SchoolRow>[] = [
    {
      label: 'View Details',
      onClick: (row) => openDialog('SCHOOL_DETAILS', { schoolId: row._id }),
    },
    {
      label: 'Toggle Status',
      onClick: (row) => {
        setData((prev) => prev.map((s) => (s._id === row._id ? { ...s, isActive: !s.isActive } : s)));
        showSuccess(`Toggled status for ${row.name}`);
      },
    },
    {
      label: 'Delete School',
      color: 'error',
      onClick: (row) => {
        openDialog('CONFIRMATION', {
          title: 'Delete School',
          message: `Are you sure you want to delete ${row.name}?`,
          onConfirm: () => {
            setData((prev) => prev.filter((s) => s._id !== row._id));
            showSuccess(`Successfully deleted ${row.name}`);
          },
        });
      },
    },
  ];

  return (
    <AppWrapper>
      <DashboardHeader />
      <Container component="main" className="flex-1 py-8 max-w-7xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)' }}>
            <strong>Current Profile:</strong> {user ? <span data-testid="profile-user">{user.name} ({user.role.name})</span> : <span data-testid="profile-user">Guest</span>}
          </Typography>
        </Box>

        <PageWrapper 
          title="Schools Management" 
          onCreate={() => openDialog('USER_DETAILS', { userId: 'user-1' })} 
          createLabel="View Admin User Profile"
        >
          <DatatableHeader
            searchValue={search}
            onSearchChange={setSearch}
            onExportCSV={() => exportToCSV(columns, filteredData, 'Schools_Report')}
            onExportPDF={() => exportToPDF(columns, filteredData, 'Schools List')}
          />
          <Datatable
            columns={columns}
            data={pagedData}
            actions={actions}
            onRowClick={(row) => openDialog('SCHOOL_DETAILS', { schoolId: row._id })}
            sortColumn={sortCol}
            sortDirection={sortDir}
            onSort={handleSort}
          />
          <DatatableFooter
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={filteredData.length}
            onChangePage={setPage}
            onChangeRowsPerPage={setRowsPerPage}
          />
        </PageWrapper>

        {hasAccess(['SUPER_ADMIN']) && (
          <Grid container spacing={2} sx={{ mt: 4 }}>
            <Grid size={12}>
              <Card sx={{ border: '1px dashed var(--color-primary-main)', bgcolor: 'rgba(255, 255, 255, 0.01)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FaUserShield size={28} style={{ color: 'var(--color-primary-main)' }} />
                  <Box>
                    <Typography variant="h6" color="textPrimary">Admin Control Panel</Typography>
                    <Typography variant="body2" color="textSecondary">
                      This panel is highly restricted and only rendered when checking SUPER_ADMIN access via the ACLProvider.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </AppWrapper>
  );
}

import { useState, useMemo } from 'react';
import { Container, Typography, Card, CardContent, Button, Box, Grid, Chip } from '@mui/material';
import styled from 'styled-components';
import { FaSchool, FaSun, FaMoon, FaUserShield, FaSignOutAlt } from 'react-icons/fa';
import { useAppTheme } from './features/themes/components/AppThemeProvider';

/*------------- Imports from Common Architecture -------------*/
import { AuthProvider, useAuth } from './common/hooks/useAuth';
import { ACLProvider, useACL } from './common/ACL/ACLProvider';
import { NotifierProvider, useNotifier } from './common/Notifier/NotifierProvider';
import { DialogProvider, useDialog } from './common/Dialogs/dialog.provider';
import { Datatable, PageWrapper, DatatableHeader, DatatableFooter, exportToCSV, exportToPDF } from './common/Datatable';
import type { Column, ActionItem } from './common/Datatable';
import type { IUser } from './common/types/user.types';

const AppWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-background-default);
`;

const Header = styled.header`
  border-bottom: 1px solid var(--color-border-default);
  background-color: var(--color-background-paper);
  position: sticky;
  top: 0;
  z-index: 50;
`;

interface SchoolRow {
  _id: string;
  name: string;
  code: string;
  boardType: string;
  subscriptionName: string;
  maxStudents: number;
  isActive: boolean;
}

const mockSchools: SchoolRow[] = [
  { _id: 'school-1', name: 'Greenwood International School', code: 'GWIS', boardType: 'CBSE', subscriptionName: 'Premium Plan', maxStudents: 1500, isActive: true },
  { _id: 'school-2', name: 'Saint Xavier Academy', code: 'SXAC', boardType: 'ICSE', subscriptionName: 'Standard Plan', maxStudents: 800, isActive: true },
  { _id: 'school-3', name: 'Delhi Public School', code: 'DPS', boardType: 'STATE', subscriptionName: 'Basic Plan', maxStudents: 500, isActive: false },
];

function AppContent() {
  const { mode, toggleTheme } = useAppTheme();
  const { user, login, logout } = useAuth();
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
    let result = data.filter((row) =>
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

  const mockLogin = (role: 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT') => {
    const mockUser: IUser = {
      _id: 'user-id',
      name: role === 'SUPER_ADMIN' ? 'Aryan Dubey' : role === 'TEACHER' ? 'Jane Doe' : 'Billy Kid',
      email: `${role.toLowerCase()}@schoolos.com`,
      userCode: role === 'SUPER_ADMIN' ? 'SA-01' : role === 'TEACHER' ? 'T-202' : 'ST-505',
      role: { name: role, access: role === 'SUPER_ADMIN' ? ['ALL'] : role === 'TEACHER' ? ['ATTENDANCE'] : [] },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    login('mock-jwt-token', mockUser);
    showSuccess(`Logged in as ${mockUser.name}`);
  };

  return (
    <AppWrapper>
      <Header>
        <Box className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Box className="flex items-center gap-3">
            <FaSchool className="text-[var(--color-primary-main)]" size={32} />
            <Typography variant="h6" className="font-bold text-[var(--color-text-primary)]">
              School OS Ecosystem
            </Typography>
          </Box>
          <Box className="flex items-center gap-3">
            <Button variant="outlined" color="primary" onClick={toggleTheme}>
              {mode === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
            </Button>
            {user ? (
              <Button variant="outlined" color="secondary" startIcon={<FaSignOutAlt />} onClick={logout}>
                Logout
              </Button>
            ) : (
              <Button variant="contained" color="primary" onClick={() => mockLogin('SUPER_ADMIN')}>
                Login
              </Button>
            )}
          </Box>
        </Box>
      </Header>

      <Container component="main" className="flex-1 py-8 max-w-7xl">
        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)' }}>
            <strong>Current Profile:</strong> {user ? <span data-testid="profile-user">{user.name} ({user.role.name})</span> : <span data-testid="profile-user">Guest</span>}
          </Typography>
          <Button size="small" variant="outlined" onClick={() => mockLogin('SUPER_ADMIN')}>Sign in Admin</Button>
          <Button size="small" variant="outlined" onClick={() => mockLogin('TEACHER')}>Sign in Teacher</Button>
          <Button size="small" variant="outlined" onClick={() => mockLogin('STUDENT')}>Sign in Student</Button>
        </Box>

        <PageWrapper title="Schools Management" onCreate={() => openDialog('USER_DETAILS', { userId: 'user-1' })} createLabel="View Admin User Profile">
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

function AuthDependentProviders({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <ACLProvider userRole={user?.role?.name || null} accessList={user?.role?.access || []}>
      <NotifierProvider>
        <DialogProvider>
          {children}
        </DialogProvider>
      </NotifierProvider>
    </ACLProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthDependentProviders>
        <AppContent />
      </AuthDependentProviders>
    </AuthProvider>
  );
}

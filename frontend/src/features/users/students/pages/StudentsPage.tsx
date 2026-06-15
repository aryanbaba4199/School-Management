import { PageWrapper, Datatable, DatatableHeader, DatatableFooter } from '@common/Datatable';
import { useStudents } from '../hooks/useStudents';
import { getStudentColumns } from '../components/studentColumns';
import { useAuth } from '@common/hooks/useAuth';
import { useGetSchoolsQuery } from '@api/schoolsApi';
import { Box, MenuItem, Select, Button } from '@mui/material';
import { FaUpload } from 'react-icons/fa';
import { UserExportButton } from '../../common/components/UserExportButton';
import { UserBulkImportDialog } from '../../common/components/UserBulkImportDialog';
import { useState } from 'react';

export function StudentsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';
  const { data: schoolsRes } = useGetSchoolsQuery(undefined, { skip: !isSuperAdmin });

  const {
    students,
    totalCount,
    isLoading,
    search,
    setSearch,
    schoolId,
    setSchoolId,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    sortColumn,
    sortDirection,
    handleSort,
    handleCreateStudent,
    handleEdit,
    handleToggleDeactivate,
    handleDelete,
    openDialog
  } = useStudents();

  const [importOpen, setImportOpen] = useState(false);

  const columns = getStudentColumns({
    onView: (student) => openDialog('STUDENT_DETAILS', { userId: student._id }),
    onEdit: handleEdit,
    onToggleDeactivate: handleToggleDeactivate,
    onDelete: handleDelete,
    isSuperAdmin
  });

  return (
    <PageWrapper 
      title="Students Management" 
      onCreate={() => openDialog('STUDENT_FORM', { onSubmit: handleCreateStudent })} 
      createLabel="Add Student"
    >
      <UserBulkImportDialog 
        open={importOpen} 
        onClose={() => setImportOpen(false)} 
        role="STUDENT" 
        schoolId={schoolId}
        onSuccess={() => { setImportOpen(false); setPage(0); }}
      />
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <DatatableHeader 
            searchValue={search} 
            onSearchChange={(val) => { setSearch(val); setPage(0); }} 
            searchPlaceholder="Search by name, email, or admission no..." 
          />
        </Box>
        {isSuperAdmin && (
          <Select
            value={schoolId}
            onChange={(e) => { setSchoolId(e.target.value as string); setPage(0); }}
            displayEmpty
            size="small"
            sx={{ minWidth: 200, height: 40 }}
          >
            <MenuItem value="">All Schools</MenuItem>
            {schoolsRes?.success && schoolsRes.data.map(school => (
              <MenuItem key={school._id} value={school._id}>{school.name}</MenuItem>
            ))}
          </Select>
        )}
        <Button 
          variant="outlined" 
          color="secondary" 
          startIcon={<FaUpload />} 
          onClick={() => setImportOpen(true)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Import
        </Button>
        <UserExportButton role="STUDENT" schoolId={schoolId} />
      </Box>
      
      <Datatable
        tableName="students_table"
        columns={columns}
        data={students}
        loading={isLoading}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
      
      <DatatableFooter
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onChangePage={setPage}
        onChangeRowsPerPage={(rows) => { setRowsPerPage(rows); setPage(0); }}
      />
    </PageWrapper>
  );
}
export default StudentsPage;

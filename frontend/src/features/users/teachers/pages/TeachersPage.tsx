import { PageWrapper, Datatable, DatatableHeader, DatatableFooter } from '@common/Datatable';
import { useTeachers } from '../hooks/useTeachers';
import { getTeacherColumns } from '../components/teacherColumns';
import { useAuth } from '@common/hooks/useAuth';
import { useGetSchoolsQuery } from '@api/schoolsApi';
import { Box, MenuItem, Select, Button } from '@mui/material';
import { FaUpload } from 'react-icons/fa';
import { UserExportButton } from '../../common/components/UserExportButton';
import { UserBulkImportDialog } from '../../common/components/UserBulkImportDialog';
import { useState } from 'react';

export function TeachersPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';
  const { data: schoolsRes } = useGetSchoolsQuery(undefined, { skip: !isSuperAdmin });

  const {
    teachers,
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
    handleCreateTeacher,
    handleEdit,
    handleToggleDeactivate,
    handleDelete,
    openDialog
  } = useTeachers();

  const [importOpen, setImportOpen] = useState(false);

  const columns = getTeacherColumns({
    onEdit: handleEdit,
    onToggleDeactivate: handleToggleDeactivate,
    onDelete: handleDelete,
    isSuperAdmin
  });

  return (
    <PageWrapper 
      title="Teachers Management" 
      onCreate={() => openDialog('TEACHER_FORM', { onSubmit: handleCreateTeacher })} 
      createLabel="Add Teacher"
    >
      <UserBulkImportDialog 
        open={importOpen} 
        onClose={() => setImportOpen(false)} 
        role="TEACHER" 
        schoolId={schoolId}
        onSuccess={() => { setImportOpen(false); setPage(0); }}
      />
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <DatatableHeader 
            searchValue={search} 
            onSearchChange={(val) => { setSearch(val); setPage(0); }} 
            searchPlaceholder="Search by name, email, or employee no..." 
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
        <UserExportButton role="TEACHER" schoolId={schoolId} />
      </Box>
      
      <Datatable
        tableName="teachers_table"
        columns={columns}
        data={teachers}
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
export default TeachersPage;

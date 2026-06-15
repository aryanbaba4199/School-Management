import { PageWrapper, Datatable, DatatableHeader, DatatableFooter } from '@common/Datatable';
import { useParents } from '../hooks/useParents';
import { getParentColumns } from '../components/parentColumns';
import { useAuth } from '@common/hooks/useAuth';
import { useGetSchoolsQuery } from '@api/schoolsApi';
import { Box, MenuItem, Select, Button } from '@mui/material';
import { FaUpload } from 'react-icons/fa';
import { UserExportButton } from '../../common/components/UserExportButton';
import { UserBulkImportDialog } from '../../common/components/UserBulkImportDialog';
import { useState } from 'react';

export function ParentsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';
  const { data: schoolsRes } = useGetSchoolsQuery(undefined, { skip: !isSuperAdmin });

  const {
    parents,
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
    handleCreateParent,
    handleEdit,
    handleToggleDeactivate,
    handleDelete,
    openDialog
  } = useParents();

  const [importOpen, setImportOpen] = useState(false);

  const columns = getParentColumns({
    onView: handleView,
    onEdit: handleEdit,
    onToggleDeactivate: handleToggleDeactivate,
    onDelete: handleDelete,
    isSuperAdmin
  });

  return (
    <PageWrapper 
      title="Parents Management" 
      onCreate={() => openDialog('PARENT_FORM', { onSubmit: handleCreateParent })} 
      createLabel="Add Parent"
    >
      <UserBulkImportDialog 
        open={importOpen} 
        onClose={() => setImportOpen(false)} 
        role="PARENT" 
        schoolId={schoolId}
        onSuccess={() => { setImportOpen(false); setPage(0); }}
      />
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Box sx={{ flex: 1 }}>
          <DatatableHeader 
            searchValue={search} 
            onSearchChange={(val) => { setSearch(val); setPage(0); }} 
            searchPlaceholder="Search by name, email, or guardian no..." 
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
        <UserExportButton role="PARENT" schoolId={schoolId} />
      </Box>
      
      <Datatable
        tableName="parents_table"
        columns={columns}
        data={parents}
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
export default ParentsPage;

import { PageWrapper, Datatable, DatatableHeader, DatatableFooter } from '@common/Datatable';
import { useClasses } from '../hooks/useClasses';
import { getClassColumns } from '../components/classColumns';
import { useAuth } from '@common/hooks/useAuth';

import { useNavigate } from 'react-router-dom';

/*------------- Classes Page Component -------------*/

export function ClassesPage() {
  const navigate = useNavigate();
  const {
    classes,
    totalCount,
    isLoading,
    search,
    setSearch,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    sortColumn,
    sortDirection,
    handleSort,
    handleCreateClass,
    handleEdit,
    handleDelete,
    openDialog,
  } = useClasses();

  const { user } = useAuth();
  const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';

  const columns = getClassColumns({
    onView: (classObj) => navigate(`/school-management/classes/${classObj._id}`),
    onEdit: handleEdit,
    onDelete: handleDelete,
    isSuperAdmin,
  });

  return (
    <PageWrapper 
      title="Classes Management" 
      onCreate={() => openDialog('CLASS_FORM', { onSubmit: handleCreateClass })} 
      createLabel="Create Class"
    >
      <DatatableHeader 
        searchValue={search} 
        onSearchChange={(val) => { setSearch(val); setPage(0); }} 
        searchPlaceholder="Search by class name..." 
      />
      
      <Datatable
        tableName="classes_table"
        columns={columns}
        data={classes}
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

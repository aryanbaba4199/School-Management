import { PageWrapper, Datatable, DatatableHeader, DatatableFooter } from '@common/Datatable';
import { useParents } from '../hooks/useParents';
import { getParentColumns } from '../components/parentColumns';
import { useAuth } from '@common/hooks/useAuth';

export function ParentsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';

  const {
    parents,
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
    handleCreateParent,
    handleEdit,
    handleToggleDeactivate,
    handleDelete,
    openDialog
  } = useParents();

  const columns = getParentColumns({
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
      <DatatableHeader 
        searchValue={search} 
        onSearchChange={(val) => { setSearch(val); setPage(0); }} 
        searchPlaceholder="Search by name, email, or guardian ID..." 
      />
      
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

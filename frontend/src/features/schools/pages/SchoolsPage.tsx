import { PageWrapper, Datatable, DatatableHeader, DatatableFooter } from '@common/Datatable';
import { useSchools } from '../hooks/useSchools';
import { getSchoolColumns } from '../components/schoolColumns';

export function SchoolsPage() {
  const {
    schools,
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
    handleCreateSchool,
    handleEdit,
    handleToggleDeactivate,
    handleDelete,
    openDialog
  } = useSchools();

  const columns = getSchoolColumns({
    onEdit: handleEdit,
    onToggleDeactivate: handleToggleDeactivate,
    onDelete: handleDelete
  });

  return (
    <PageWrapper 
      title="Schools Management" 
      onCreate={() => openDialog('SCHOOL_FORM', { onSubmit: handleCreateSchool })} 
      createLabel="Create School"
    >
      <DatatableHeader 
        searchValue={search} 
        onSearchChange={(val) => { setSearch(val); setPage(0); }} 
        searchPlaceholder="Search by name, code, or subdomain..." 
      />
      
      <Datatable
        columns={columns}
        data={schools}
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

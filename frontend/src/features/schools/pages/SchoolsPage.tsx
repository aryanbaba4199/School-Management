import { PageWrapper, Datatable, DatatableHeader, DatatableFooter } from '@common/Datatable';
import { useNavigate } from 'react-router-dom';
import { useSchools } from '../hooks/useSchools';
import { getSchoolColumns } from '../components/schoolColumns';

export function SchoolsPage() {
  const navigate = useNavigate();
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

  const handleView = (school: Parameters<typeof getSchoolColumns>[0]['onView'] extends (s: infer S) => void ? S : never) => {
    navigate(`/schools/${school._id}`);
  };

  const columns = getSchoolColumns({
    onView: handleView,
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
        tableName="schools_table"
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

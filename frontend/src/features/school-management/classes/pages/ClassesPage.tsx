import { PageWrapper, Datatable, DatatableHeader, DatatableFooter } from '@common/Datatable';
import { useClasses } from '../hooks/useClasses';
import { getClassColumns } from '../components/classColumns';

/*------------- Classes Page Component -------------*/

export function ClassesPage() {
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

  const columns = getClassColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
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

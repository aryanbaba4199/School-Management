import { PageWrapper, Datatable, DatatableHeader, DatatableFooter } from '@common/Datatable';
import { useSubjects } from '../hooks/useSubjects';
import { getSubjectColumns } from '../components/subjectColumns';

/*------------- Subjects Page Component -------------*/

export function SubjectsPage() {
  const {
    subjects,
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
    handleCreateSubject,
    handleEdit,
    handleDelete,
    openDialog,
  } = useSubjects();

  const columns = getSubjectColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <PageWrapper 
      title="Subjects Management" 
      onCreate={() => openDialog('SUBJECT_FORM', { onSubmit: handleCreateSubject })} 
      createLabel="Create Subject"
    >
      <DatatableHeader 
        searchValue={search} 
        onSearchChange={(val) => { setSearch(val); setPage(0); }} 
        searchPlaceholder="Search by name or code..." 
      />
      
      <Datatable
        tableName="subjects_table"
        columns={columns}
        data={subjects}
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

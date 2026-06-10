import { PageWrapper, Datatable, DatatableHeader, DatatableFooter } from '@common/Datatable';
import { useStudents } from '../hooks/useStudents';
import { getStudentColumns } from '../components/studentColumns';

export function StudentsPage() {
  const {
    students,
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
    handleCreateStudent,
    handleEdit,
    handleToggleDeactivate,
    handleDelete,
    openDialog
  } = useStudents();

  const columns = getStudentColumns({
    onEdit: handleEdit,
    onToggleDeactivate: handleToggleDeactivate,
    onDelete: handleDelete
  });

  return (
    <PageWrapper 
      title="Students Management" 
      onCreate={() => openDialog('STUDENT_FORM', { onSubmit: handleCreateStudent })} 
      createLabel="Add Student"
    >
      <DatatableHeader 
        searchValue={search} 
        onSearchChange={(val) => { setSearch(val); setPage(0); }} 
        searchPlaceholder="Search by name, email, or admission no..." 
      />
      
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

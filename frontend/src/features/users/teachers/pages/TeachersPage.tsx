import { PageWrapper, Datatable, DatatableHeader, DatatableFooter } from '@common/Datatable';
import { useTeachers } from '../hooks/useTeachers';
import { getTeacherColumns } from '../components/teacherColumns';

export function TeachersPage() {
  const {
    teachers,
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
    handleCreateTeacher,
    handleEdit,
    handleToggleDeactivate,
    handleDelete,
    openDialog
  } = useTeachers();

  const columns = getTeacherColumns({
    onEdit: handleEdit,
    onToggleDeactivate: handleToggleDeactivate,
    onDelete: handleDelete
  });

  return (
    <PageWrapper 
      title="Teachers Management" 
      onCreate={() => openDialog('TEACHER_FORM', { onSubmit: handleCreateTeacher })} 
      createLabel="Add Teacher"
    >
      <DatatableHeader 
        searchValue={search} 
        onSearchChange={(val) => { setSearch(val); setPage(0); }} 
        searchPlaceholder="Search by name, email, or employee ID..." 
      />
      
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

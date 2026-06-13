import  { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { PageWrapper, Datatable, DatatableHeader, DatatableFooter } from '@common/Datatable';
import { useGetExamsQuery } from '@api/examApi';
import { useDialog } from '@common/Dialogs/dialog.provider';
import { useNavigate } from 'react-router-dom';
import type { IExam } from '@api/examApi';
import { getExamColumns } from '../components/examColumns';

export function ExamMasterPage() {
  const { openDialog } = useDialog();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const { data: res, isLoading, error } = useGetExamsQuery();
  const exams = res?.data || [];

  const filteredExams = exams.filter((e) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(searchLower) ||
      e.academicYear.toLowerCase().includes(searchLower) ||
      e.term.toLowerCase().includes(searchLower)
    );
  });

  const paginatedExams = filteredExams.slice(page * limit, (page + 1) * limit);

  return (
    <PageWrapper 
      title="Examinations"
      onCreate={() => openDialog('EXAM_FORM', {})}
      createLabel="Create Exam"
    >
      <DatatableHeader 
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search exams by name, year, term..."
      />

      {error ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error">Failed to load examinations</Typography>
        </Box>
      ) : (
        <Datatable<IExam>
          columns={getExamColumns({ 
            onView: (exam) => navigate(`/exams/${exam._id}`),
            onEdit: (exam) => openDialog('EXAM_FORM', { exam })
          })}
          data={paginatedExams}
          loading={isLoading}
          tableName="exams"
        />
      )}

      <DatatableFooter
        totalCount={filteredExams.length}
        page={page}
        rowsPerPage={limit}
        onChangePage={setPage}
        onChangeRowsPerPage={(newLimit) => {
          setLimit(newLimit);
          setPage(0);
        }}
      />
    </PageWrapper>
  );
}

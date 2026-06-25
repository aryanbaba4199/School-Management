import React, { useMemo } from 'react';
import { Typography, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGetHomeworksQuery, useDeleteHomeworkMutation } from '../../../api/homeworkApi';
import type { IHomework } from '../../../api/homeworkApi';
import { Datatable, PageWrapper, renderDateCell } from '../../../common/Datatable';
import type { Column } from '../../../common/Datatable';
import { useDialog } from '../../../common/Dialogs/dialog.provider';
import { useNotifier } from '../../../common/Notifier/NotifierProvider';

export const TeacherHomeworkDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifier();
  const { openDialog } = useDialog();

  const { data: homeworkData, isLoading } = useGetHomeworksQuery({ page: 1, limit: 100 });
  const [deleteHomework] = useDeleteHomeworkMutation();

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this homework? All student submissions will also be deleted.')) {
      return;
    }
    try {
      await deleteHomework(id).unwrap();
      showSuccess('Homework deleted successfully');
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      showError(error?.data?.message || 'Failed to delete homework');
    }
  };

  const columns = useMemo<Column<IHomework>[]>(() => [
    {
      id: 'title',
      label: 'Title',
      sortable: true,
      render: (row) => (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {row.title}
          </Typography>
          <Typography variant="body2" color="textSecondary" noWrap sx={{ maxWidth: 250 }}>
            {row.description}
          </Typography>
        </>
      ),
    },
    {
      id: 'class',
      label: 'Class',
      render: (row) => {
        const className = typeof row.classId === 'object' ? row.classId.name : row.classId;
        const sectionName = typeof row.sectionId === 'object' ? row.sectionId.name : row.sectionId;
        return `${className} (${sectionName})`;
      },
    },
    {
      id: 'subject',
      label: 'Subject',
      render: (row) => (
        <Chip
          size="small"
          label={typeof row.subjectId === 'object' ? row.subjectId.name : row.subjectId}
          color="info"
        />
      ),
    },
    {
      id: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (row) => renderDateCell(row.dueDate),
    },
    {
      id: 'maxMarks',
      label: 'Max Marks',
      render: (row) => row.maxMarks || 'N/A',
    },
  ], []);

  const homeworks = homeworkData?.data?.homeworks || [];

  return (
    <PageWrapper
      title="Assignments"
      createLabel="Create Assignment"
      onCreate={() => openDialog('HOMEWORK_FORM', {})}
    >
      <Datatable
        columns={columns}
        data={homeworks}
        loading={isLoading}
        actions={[
          {
            label: 'View Submissions',
            onClick: (row) => navigate(`/homework/${row._id}/submissions`),
          },
          {
            label: 'Delete',
            onClick: (row) => handleDelete(row._id),
            color: 'error',
          },
        ]}
      />
    </PageWrapper>
  );
};

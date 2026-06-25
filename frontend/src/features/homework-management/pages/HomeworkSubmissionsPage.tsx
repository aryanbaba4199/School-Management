import React, { useMemo } from 'react';
import { Typography, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetHomeworkSubmissionsQuery } from '../../../api/homeworkApi';
import type { IHomeworkSubmission } from '../../../api/homeworkApi';
import { Datatable, PageWrapper, renderDateCell, renderUserCell } from '../../../common/Datatable';
import type { Column } from '../../../common/Datatable';
import { useDialog } from '../../../common/Dialogs/dialog.provider';
import { StatusChip } from '../../../common/components';
import { useNotifier } from '../../../common/Notifier/NotifierProvider';

export const HomeworkSubmissionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openDialog } = useDialog();
  const { showError } = useNotifier();

  const { data: submissionsData, isLoading } = useGetHomeworkSubmissionsQuery(id!);

  const columns = useMemo<Column<IHomeworkSubmission>[]>(() => [
    {
      id: 'studentName',
      label: 'Student Name',
      sortable: true,
      render: (row) => {
        if (typeof row.studentId === 'object') {
          return renderUserCell(
            `${row.studentId.profile.firstName} ${row.studentId.profile.lastName}`,
            row.studentId.profile.admissionNumber
          );
        }
        return 'Unknown Student';
      },
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => <StatusChip status={row.status} />
    },
    {
      id: 'submissionDate',
      label: 'Submitted On',
      sortable: true,
      render: (row) => renderDateCell(row.submissionDate),
    },
    {
      id: 'marks',
      label: 'Marks',
      render: (row) => row.status === 'GRADED' ? (
        <Typography sx={{ fontWeight: 'bold', color: 'success.main' }}>
          {row.obtainedMarks}
        </Typography>
      ) : '--',
    },
    {
      id: 'attachments',
      label: 'Attachments',
      render: (row) => row.attachments.length > 0 ? (
        <Button
          size="small"
          onClick={() => window.open(row.attachments[0].fileUrl, '_blank')}
        >
          View ({row.attachments.length})
        </Button>
      ) : 'None',
    },
  ], []);

  const submissions = submissionsData?.data || [];

  return (
    <PageWrapper
      title="Homework Submissions"
      actions={[
        {
          label: 'Back',
          onClick: () => navigate(-1),
          variant: 'outlined',
        }
      ]}
    >
      <Datatable
        columns={columns}
        data={submissions}
        loading={isLoading}
        actions={[
          {
            label: 'Grade Submission',
            onClick: (row) => {
              if (row.status === 'PENDING') {
                showError('Student has not submitted the homework yet.');
                return;
              }
              openDialog('GRADING_FORM', { submission: row });
            },
          }
        ]}
      />
    </PageWrapper>
  );
};

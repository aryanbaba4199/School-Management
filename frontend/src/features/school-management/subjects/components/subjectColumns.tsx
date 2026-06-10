/* eslint-disable react-refresh/only-export-components */
import { Box, Typography } from '@mui/material';
import { ActionMenu, type ActionMenuItem } from '@common/Datatable';
import { FaEdit, FaTrash } from 'react-icons/fa';
import type { Column } from '@common/Datatable';
import type { ISubject } from '../types/subjects.types';

interface GetSubjectColumnsProps {
  onEdit: (subject: ISubject) => void;
  onDelete: (subject: ISubject) => void;
}

export function SubjectAction({
  subject,
  onEdit,
  onDelete
}: {
  subject: ISubject;
  onEdit: (subject: ISubject) => void;
  onDelete: (subject: ISubject) => void;
}) {
  const actions: ActionMenuItem[] = [
    {
      label: 'Edit',
      icon: <FaEdit />,
      onClick: () => onEdit(subject),
      color: 'primary'
    },
    {
      label: 'Delete',
      icon: <FaTrash />,
      onClick: () => onDelete(subject),
      color: 'error'
    }
  ];

  return <ActionMenu items={actions} />;
}

export const getSubjectColumns = ({ onEdit, onDelete }: GetSubjectColumnsProps): Column<ISubject>[] => [
  {
    id: 'name',
    label: 'Subject Name',
    sortable: true,
    render: (row) => (
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
        {row.name}
      </Typography>
    )
  },
  {
    id: 'code',
    label: 'Subject Code',
    sortable: true,
    render: (row) => (
      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
        {row.code}
      </Typography>
    )
  },
  {
    id: 'teachers',
    label: 'Assigned Teachers',
    sortable: false,
    render: (row) => {
      if (!row.teacherIds || row.teacherIds.length === 0) return '-';
      return row.teacherIds
        .map((t) => (typeof t === 'object' ? t.name : t))
        .join(', ');
    }
  },
  {
    id: 'actions',
    label: 'Actions',
    sortable: false,
    align: 'right',
    render: (row) => (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <SubjectAction 
          subject={row}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </Box>
    )
  }
];

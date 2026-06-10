/* eslint-disable react-refresh/only-export-components */
import { Chip, Box, Typography } from '@mui/material';
import { ActionMenu, type ActionMenuItem } from '@common/Datatable';
import { FaEdit, FaCheckCircle, FaBan, FaTrash } from 'react-icons/fa';
import type { Column } from '@common/Datatable';
import type { ISchoolUser } from '../../../../api/usersApi';

interface GetTeacherColumnsProps {
  onEdit: (teacher: ISchoolUser) => void;
  onToggleDeactivate: (teacher: ISchoolUser) => void;
  onDelete: (teacher: ISchoolUser) => void;
}

export function TeacherAction({
  teacher,
  onEdit,
  onToggleDeactivate,
  onDelete
}: {
  teacher: ISchoolUser;
  onEdit: (teacher: ISchoolUser) => void;
  onToggleDeactivate: (teacher: ISchoolUser) => void;
  onDelete: (teacher: ISchoolUser) => void;
}) {
  const actions: ActionMenuItem[] = [
    {
      label: 'Edit',
      icon: <FaEdit />,
      onClick: () => onEdit(teacher),
      color: 'primary'
    },
    {
      label: teacher.isActive ? 'Deactivate' : 'Activate',
      icon: teacher.isActive ? <FaBan /> : <FaCheckCircle />,
      onClick: () => onToggleDeactivate(teacher),
      color: teacher.isActive ? 'warning' : 'success'
    },
    {
      label: 'Delete',
      icon: <FaTrash />,
      onClick: () => onDelete(teacher),
      color: 'error',
      disabled: teacher.isActive,
      disabledReason: teacher.isActive ? 'Deactivate user first to delete' : undefined
    }
  ];

  return <ActionMenu items={actions} />;
}

export const SUBJECT_MAPPING: Record<string, string> = {
  '60f7c223405c102c98d6c840': 'Mathematics',
  '60f7c223405c102c98d6c841': 'Physics',
  '60f7c223405c102c98d6c842': 'Chemistry',
  '60f7c223405c102c98d6c843': 'English',
  '60f7c223405c102c98d6c844': 'History'
};

export const getTeacherColumns = ({ onEdit, onToggleDeactivate, onDelete }: GetTeacherColumnsProps): Column<ISchoolUser>[] => [
  {
    id: 'name',
    label: 'Teacher Name',
    sortable: true,
    render: (row) => (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {row.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
          {row.email}
        </Typography>
      </Box>
    )
  },
  { id: 'userCode', label: 'Employee ID', sortable: true },
  { 
    id: 'subjects', 
    label: 'Subjects Taught', 
    sortable: false,
    render: (row) => {
      if (!row.subjects || row.subjects.length === 0) return '-';
      return row.subjects
        .map(s => SUBJECT_MAPPING[s] || 'Subject ' + s.substring(s.length - 4))
        .join(', ');
    }
  },
  { id: 'phone', label: 'Phone', sortable: true, render: (row) => row.phone || '-' },
  {
    id: 'isActive',
    label: 'Status',
    sortable: true,
    render: (row) => (
      <Chip
        label={row.isActive ? 'Active' : 'Inactive'}
        color={row.isActive ? 'success' : 'default'}
        size="small"
        sx={{ fontWeight: 600 }}
      />
    )
  },
  {
    id: 'actions',
    label: 'Actions',
    sortable: false,
    align: 'right',
    render: (row) => (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <TeacherAction 
          teacher={row}
          onEdit={onEdit}
          onToggleDeactivate={onToggleDeactivate}
          onDelete={onDelete}
        />
      </Box>
    )
  }
];

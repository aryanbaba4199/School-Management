/* eslint-disable react-refresh/only-export-components */
import { Chip, Box, Typography } from '@mui/material';
import { ActionMenu, type ActionMenuItem } from '@common/Datatable';
import { FaEdit, FaCheckCircle, FaBan, FaTrash } from 'react-icons/fa';
import type { Column } from '@common/Datatable';
import type { ISchoolUser } from '../../../../api/usersApi';

interface GetStudentColumnsProps {
  onView: (student: ISchoolUser) => void;
  onEdit: (student: ISchoolUser) => void;
  onToggleDeactivate: (student: ISchoolUser) => void;
  onDelete: (student: ISchoolUser) => void;
  isSuperAdmin?: boolean;
}

export function StudentAction({
  student,
  onView,
  onEdit,
  onToggleDeactivate,
  onDelete
}: {
  student: ISchoolUser;
  onView: (student: ISchoolUser) => void;
  onEdit: (student: ISchoolUser) => void;
  onToggleDeactivate: (student: ISchoolUser) => void;
  onDelete: (student: ISchoolUser) => void;
}) {
  const actions: ActionMenuItem[] = [
    {
      label: 'View',
      icon: <FaCheckCircle />, // Just using icon, maybe better to use eye icon later
      onClick: () => onView(student),
      color: 'info'
    },
    {
      label: 'Edit',
      icon: <FaEdit />,
      onClick: () => onEdit(student),
      color: 'primary'
    },
    {
      label: student.isActive ? 'Deactivate' : 'Activate',
      icon: student.isActive ? <FaBan /> : <FaCheckCircle />,
      onClick: () => onToggleDeactivate(student),
      color: student.isActive ? 'warning' : 'success'
    },
    {
      label: 'Delete',
      icon: <FaTrash />,
      onClick: () => onDelete(student),
      color: 'error',
      disabled: student.isActive,
      disabledReason: student.isActive ? 'Deactivate user first to delete' : undefined
    }
  ];

  return <ActionMenu items={actions} />;
}

// Mock mappings for Class/Section
const CLASS_MAPPING: Record<string, string> = {
  '60f7c223405c102c98d6c820': 'Class 10-A',
  '60f7c223405c102c98d6c821': 'Class 9-B',
  '60f7c223405c102c98d6c822': 'Class 8-C',
  '60f7c223405c102c98d6c823': 'Class 11-A',
  '60f7c223405c102c98d6c824': 'Class 12-B'
};

export const getStudentColumns = ({ onView, onEdit, onToggleDeactivate, onDelete, isSuperAdmin = false }: GetStudentColumnsProps): Column<ISchoolUser>[] => [
  {
    id: 'name',
    label: 'Student Name',
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
  ...(isSuperAdmin
    ? [
        {
          id: 'schoolId',
          label: 'Institute',
          sortable: false,
          render: (row: ISchoolUser) => {
            const school = row.schoolId;
            if (school && typeof school === 'object') {
              return `${school.name} (${school.code})`;
            }
            return '-';
          },
        },
      ]
    : []),
  { id: 'userCode', label: 'Admission No.', sortable: true },
  { 
    id: 'classId', 
    label: 'Class & Section', 
    sortable: true,
    render: (row) => {
      if (!row.classId) return '-';
      return CLASS_MAPPING[row.classId] || 'Class ' + row.classId.substring(row.classId.length - 4);
    }
  },
  { 
    id: 'parentId', 
    label: 'Parent/Guardian', 
    sortable: true,
    render: (row) => {
      if (!row.parentId) return '-';
      return typeof row.parentId === 'object' ? row.parentId.name : String(row.parentId);
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
        <StudentAction 
          student={row}
          onView={onView}
          onEdit={onEdit}
          onToggleDeactivate={onToggleDeactivate}
          onDelete={onDelete}
        />
      </Box>
    )
  }
];

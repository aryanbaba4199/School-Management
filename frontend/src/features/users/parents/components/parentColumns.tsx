/* eslint-disable react-refresh/only-export-components */
import { Chip, Box, Typography } from '@mui/material';
import { ActionMenu, type ActionMenuItem } from '@common/Datatable';
import { FaEdit, FaCheckCircle, FaBan, FaTrash } from 'react-icons/fa';
import type { Column } from '@common/Datatable';
import type { ISchoolUser } from '../../../../api/usersApi';

interface GetParentColumnsProps {
  onEdit: (parent: ISchoolUser) => void;
  onToggleDeactivate: (parent: ISchoolUser) => void;
  onDelete: (parent: ISchoolUser) => void;
}

export function ParentAction({
  parent,
  onEdit,
  onToggleDeactivate,
  onDelete
}: {
  parent: ISchoolUser;
  onEdit: (parent: ISchoolUser) => void;
  onToggleDeactivate: (parent: ISchoolUser) => void;
  onDelete: (parent: ISchoolUser) => void;
}) {
  const actions: ActionMenuItem[] = [
    {
      label: 'Edit',
      icon: <FaEdit />,
      onClick: () => onEdit(parent),
      color: 'primary'
    },
    {
      label: parent.isActive ? 'Deactivate' : 'Activate',
      icon: parent.isActive ? <FaBan /> : <FaCheckCircle />,
      onClick: () => onToggleDeactivate(parent),
      color: parent.isActive ? 'warning' : 'success'
    },
    {
      label: 'Delete',
      icon: <FaTrash />,
      onClick: () => onDelete(parent),
      color: 'error',
      disabled: parent.isActive,
      disabledReason: parent.isActive ? 'Deactivate user first to delete' : undefined
    }
  ];

  return <ActionMenu items={actions} />;
}

export const getParentColumns = ({ onEdit, onToggleDeactivate, onDelete }: GetParentColumnsProps): Column<ISchoolUser>[] => [
  {
    id: 'name',
    label: 'Parent/Guardian Name',
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
  { id: 'userCode', label: 'Guardian ID', sortable: true },
  { 
    id: 'childrenIds', 
    label: 'Children', 
    sortable: false,
    render: (row) => {
      if (!row.childrenIds || row.childrenIds.length === 0) return '-';
      return row.childrenIds
        .map(c => typeof c === 'object' ? c.name : String(c))
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
        <ParentAction 
          parent={row}
          onEdit={onEdit}
          onToggleDeactivate={onToggleDeactivate}
          onDelete={onDelete}
        />
      </Box>
    )
  }
];

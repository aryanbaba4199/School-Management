/* eslint-disable react-refresh/only-export-components */
import { Chip, Box, Typography } from '@mui/material';
import { ActionMenu, type ActionMenuItem } from '@common/Datatable';
import { FaEdit, FaTrash } from 'react-icons/fa';
import type { Column } from '@common/Datatable';
import type { IClass } from '../types/classes.types';

interface GetClassColumnsProps {
  onEdit: (classObj: IClass) => void;
  onDelete: (classObj: IClass) => void;
}

export function ClassAction({
  classObj,
  onEdit,
  onDelete
}: {
  classObj: IClass;
  onEdit: (classObj: IClass) => void;
  onDelete: (classObj: IClass) => void;
}) {
  const actions: ActionMenuItem[] = [
    {
      label: 'Edit',
      icon: <FaEdit />,
      onClick: () => onEdit(classObj),
      color: 'primary'
    },
    {
      label: 'Delete',
      icon: <FaTrash />,
      onClick: () => onDelete(classObj),
      color: 'error'
    }
  ];

  return <ActionMenu items={actions} />;
}

export const getClassColumns = ({ onEdit, onDelete }: GetClassColumnsProps): Column<IClass>[] => [
  {
    id: 'name',
    label: 'Class Name',
    sortable: true,
    render: (row) => (
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
        {row.name}
      </Typography>
    )
  },
  {
    id: 'sections',
    label: 'Sections',
    sortable: false,
    render: (row) => {
      const sections = row.sections || [];
      if (sections.length === 0) return '-';
      return (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {sections.map((sec) => (
            <Chip key={sec._id} label={sec.name} size="small" variant="outlined" />
          ))}
        </Box>
      );
    }
  },
  {
    id: 'actions',
    label: 'Actions',
    sortable: false,
    align: 'right',
    render: (row) => (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ClassAction 
          classObj={row}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </Box>
    )
  }
];

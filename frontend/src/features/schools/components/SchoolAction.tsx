import { ActionMenu, type ActionMenuItem } from '@common/Datatable';
import { FaEdit, FaCheckCircle, FaBan, FaTrash } from 'react-icons/fa';
import type { ISchool } from '../types/schools.types';

interface SchoolActionProps {
  school: ISchool;
  onEdit: (school: ISchool) => void;
  onToggleDeactivate: (school: ISchool) => void;
  onDelete: (school: ISchool) => void;
}

export function SchoolAction({
  school,
  onEdit,
  onToggleDeactivate,
  onDelete
}: SchoolActionProps) {
  const actions: ActionMenuItem[] = [
    {
      label: 'Edit',
      icon: <FaEdit />,
      onClick: () => onEdit(school),
      color: 'primary'
    },
    {
      label: school.isDeactive ? 'Activate' : 'Deactivate',
      icon: school.isDeactive ? <FaCheckCircle /> : <FaBan />,
      onClick: () => onToggleDeactivate(school),
      color: school.isDeactive ? 'success' : 'warning'
    },
    {
      label: 'Delete',
      icon: <FaTrash />,
      onClick: () => onDelete(school),
      color: 'error',
      disabled: !school.isDeactive,
      disabledReason: !school.isDeactive ? 'Deactivate school first to delete' : undefined
    }
  ];

  return <ActionMenu items={actions} />;
}

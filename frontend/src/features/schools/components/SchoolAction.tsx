import { ActionMenu, type ActionMenuItem } from '@common/Datatable';
import { FaEye, FaEdit, FaCheckCircle, FaBan, FaTrash } from 'react-icons/fa';
import type { ISchool } from '../types/schools.types';

interface SchoolActionProps {
  school: ISchool;
  onView: (school: ISchool) => void;
  onEdit: (school: ISchool) => void;
  onToggleDeactivate: (school: ISchool) => void;
  onDelete: (school: ISchool) => void;
}

export function SchoolAction({
  school,
  onView,
  onEdit,
  onToggleDeactivate,
  onDelete
}: SchoolActionProps) {
  const actions: ActionMenuItem[] = [
    {
      label: 'View Details',
      icon: <FaEye />,
      onClick: () => onView(school),
      color: 'primary'
    },
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

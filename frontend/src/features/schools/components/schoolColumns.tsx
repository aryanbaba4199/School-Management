import { Chip, Box } from '@mui/material';
import type { Column } from '@common/Datatable';
import type { ISchool } from '../types/schools.types';
import { SchoolAction } from './SchoolAction';

interface GetSchoolColumnsProps {
  onEdit: (school: ISchool) => void;
  onToggleDeactivate: (school: ISchool) => void;
  onDelete: (school: ISchool) => void;
}

export const getSchoolColumns = ({ onEdit, onToggleDeactivate, onDelete }: GetSchoolColumnsProps): Column<ISchool>[] => [
  { id: 'name', label: 'School Name', sortable: true },
  { id: 'code', label: 'Code', sortable: true },
  { id: 'subdomain', label: 'Subdomain', sortable: true },
  { id: 'boardType', label: 'Board', sortable: true },
  {
    id: 'subscriptionPlan',
    label: 'Plan',
    sortable: true,
    render: (row) => typeof row.subscriptionPlan === 'object' ? row.subscriptionPlan.name : String(row.subscriptionPlan)
  },
  { id: 'maxStudents', label: 'Capacity', sortable: true },
  {
    id: 'isActive',
    label: 'Status',
    sortable: true,
    render: (row) => {
      if (row.isDeactive) {
        return (
          <Chip
            label="Deactivated"
            color="error"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      }
      return (
        <Chip
          label={row.isActive ? 'Active' : 'Inactive'}
          color={row.isActive ? 'success' : 'default'}
          size="small"
          sx={{ fontWeight: 600 }}
        />
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
        <SchoolAction 
          school={row}
          onEdit={onEdit}
          onToggleDeactivate={onToggleDeactivate}
          onDelete={onDelete}
        />
      </Box>
    )
  }
];

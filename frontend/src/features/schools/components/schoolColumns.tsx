import { Chip, Box, Typography } from '@mui/material';

import type { Column } from '@common/Datatable';
import type { ISchool } from '../types/schools.types';
import { SchoolAction } from './SchoolAction';

interface GetSchoolColumnsProps {
  onEdit: (school: ISchool) => void;
  onToggleDeactivate: (school: ISchool) => void;
  onDelete: (school: ISchool) => void;
  onView: (school: ISchool) => void;
}

export const getSchoolColumns = ({ onEdit, onToggleDeactivate, onDelete, onView }: GetSchoolColumnsProps): Column<ISchool>[] => [
  {
    id: 'name',
    label: 'School Name',
    sortable: true,
    render: (row) => (
      <Typography
        variant="body2"
        onClick={(e) => { e.stopPropagation(); onView(row); }}
        sx={{
          fontWeight: 600,
          color: 'var(--color-primary-main)',
          cursor: 'pointer',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        {row.name}
      </Typography>
    )
  },
  { id: 'code', label: 'Code', sortable: true },
  { id: 'subdomain', label: 'Subdomain', sortable: true },
  { 
    id: 'country', 
    label: 'Country', 
    sortable: true,
    render: (row) => typeof row.country === 'object' ? row.country.name : String(row.country)
  },
  { 
    id: 'state', 
    label: 'State', 
    sortable: true,
    render: (row) => row.state ? (typeof row.state === 'object' ? row.state.name : String(row.state)) : '-'
  },
  { 
    id: 'district', 
    label: 'District', 
    sortable: true,
    render: (row) => row.district ? (typeof row.district === 'object' ? row.district.name : String(row.district)) : '-'
  },
  { 
    id: 'boardType', 
    label: 'Board', 
    sortable: true,
    render: (row) => typeof row.boardType === 'object' ? (row.boardType.acronym || row.boardType.name) : String(row.boardType)
  },
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
          onView={onView}
        />
      </Box>
    )
  }
];

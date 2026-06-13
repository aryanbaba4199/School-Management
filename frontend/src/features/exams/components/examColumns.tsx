import type { Column } from '@common/Datatable';
import type { IExam } from '@api/examApi';
import { Chip, Link } from '@mui/material';
import { format, parseISO } from 'date-fns';

import { ActionMenu } from '@common/Datatable';

interface GetExamColumnsProps {
  onView: (exam: IExam) => void;
  onEdit: (exam: IExam) => void;
}

export const getExamColumns = ({ onView, onEdit }: GetExamColumnsProps): Column<IExam>[] => [
  {
    id: 'name',
    label: 'Exam Name',
    render: (row: IExam) => (
      <Link 
        component="button" 
        variant="body2" 
        onClick={() => onView(row)}
        sx={{ fontWeight: 600, textAlign: 'left', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
      >
        {row.name}
      </Link>
    ),
    sortable: true,
  },
  {
    id: 'academicYear',
    label: 'Academic Year',
    sortable: true,
  },
  {
    id: 'term',
    label: 'Type',
    render: (row: IExam) => {
      const val = row.term;
      const label = val === 'FINAL' ? 'Final' : 
                    val === 'MID_TERM' ? 'Mid Term' : 
                    val === 'QUARTERLY' ? 'Quarterly' : 'Monthly';
      return label;
    },
    sortable: true,
  },
  {
    id: 'startDate',
    label: 'Start Date',
    render: (row: IExam) => row.startDate ? format(parseISO(row.startDate as unknown as string), 'dd MMM yyyy') : '-',
    sortable: true,
  },
  {
    id: 'endDate',
    label: 'End Date',
    render: (row: IExam) => row.endDate ? format(parseISO(row.endDate as unknown as string), 'dd MMM yyyy') : '-',
  },
  {
    id: 'status',
    label: 'Status',
    render: (row: IExam) => {
      const val = row.status;
      let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
      if (val === 'DRAFT') color = 'default';
      else if (val === 'SCHEDULED') color = 'info';
      else if (val === 'ONGOING') color = 'warning';
      else if (val === 'COMPLETED') color = 'success';

      return <Chip label={val} size="small" color={color} sx={{ fontWeight: 500 }} />;
    },
  },
  {
    id: 'actions',
    label: 'Actions',
    align: 'center',
    render: (row: IExam) => (
      <ActionMenu
        items={[
          { label: 'View Details', onClick: () => onView(row), color: 'primary' },
          { label: 'Edit', onClick: () => onEdit(row), color: 'primary' }
        ]}
      />
    ),
  },
];

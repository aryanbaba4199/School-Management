import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  MenuItem,
  Select,
  Paper,
} from '@mui/material';
import type { AttendanceStatus } from '../types/attendance.types';
import type { ISchoolUser } from '@api/usersApi';

interface StudentAttendanceTableProps {
  students: ISchoolUser[];
  attendanceState: Record<string, { status: AttendanceStatus; remarks?: string }>;
  onStatusChange: (studentId: string, status: AttendanceStatus) => void;
  onRemarksChange: (studentId: string, remarks: string) => void;
}

const statusOptions = [
  { value: 'PRESENT', label: 'Present', color: 'success.main' },
  { value: 'ABSENT', label: 'Absent', color: 'error.main' },
  { value: 'LATE', label: 'Late', color: 'warning.main' },
  { value: 'HALF_DAY', label: 'Half Day', color: 'info.main' },
  { value: 'EXCUSED', label: 'Excused', color: 'text.secondary' },
];

export const StudentAttendanceTable: React.FC<StudentAttendanceTableProps> = ({
  students,
  attendanceState,
  onStatusChange,
  onRemarksChange,
}) => {
  return (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width="10%"><strong>Roll No</strong></TableCell>
            <TableCell width="30%"><strong>Student Name</strong></TableCell>
            <TableCell width="25%"><strong>Status</strong></TableCell>
            <TableCell width="35%"><strong>Remarks</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student) => {
            const state = attendanceState[student._id] || { status: 'PRESENT' };

            return (
              <TableRow key={student._id} hover>
                <TableCell>{student.userCode}</TableCell>
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {student.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Select
                    size="small"
                    fullWidth
                    value={state.status}
                    onChange={(e) => onStatusChange(student._id, e.target.value as AttendanceStatus)}
                    sx={{
                      '& .MuiSelect-select': {
                        color: statusOptions.find((o) => o.value === state.status)?.color,
                        fontWeight: 'bold',
                      },
                    }}
                  >
                    {statusOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Optional remarks"
                    value={state.remarks || ''}
                    onChange={(e) => onRemarksChange(student._id, e.target.value)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

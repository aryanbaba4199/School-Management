import { useState, useEffect } from 'react';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { useDialog } from '@common/Dialogs/dialog.provider';
import { 
  useGetUsersQuery, 
  useCreateUserMutation,
  useUpdateUserMutation,
  useToggleUserStatusMutation,
  useDeleteUserMutation
} from '../../../../api/usersApi';
import type { ISchoolUser } from '../../../../api/usersApi';

interface ApiError {
  data?: { message?: string };
  message?: string;
}

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (err && typeof err === 'object') {
    const apiErr = err as ApiError;
    if (apiErr.data && apiErr.data.message) return apiErr.data.message;
    if (apiErr.message) return apiErr.message;
  }
  return fallback;
};

export function useStudents() {
  const { data: usersRes, isLoading, error } = useGetUsersQuery({ role: 'STUDENT' });
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [toggleStatus] = useToggleUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();
  
  const notifier = useNotifier();
  const { openDialog, closeDialog } = useDialog();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (error) {
      const msg = getErrorMessage(error, 'Error fetching students');
      notifier.showError(msg);
    }
  }, [error, notifier]);

  const handleSort = (columnId: string) => {
    const isAsc = sortColumn === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(columnId);
  };

  const handleCreateStudent = async (data: Partial<ISchoolUser> & { password?: string }) => {
    try {
      await createUser(data).unwrap();
      notifier.showSuccess('Student added successfully!');
      closeDialog();
    } catch (err: unknown) {
      notifier.showError(getErrorMessage(err, 'Failed to add student'));
    }
  };

  const handleEdit = (student: ISchoolUser) => {
    openDialog('STUDENT_FORM', {
      user: student,
      onSubmit: async (data: Partial<ISchoolUser> & { password?: string }) => {
        try {
          await updateUser({ id: student._id, body: data }).unwrap();
          notifier.showSuccess('Student updated successfully!');
          closeDialog();
        } catch (err: unknown) {
          notifier.showError(getErrorMessage(err, 'Failed to update student'));
        }
      }
    });
  };

  const handleToggleDeactivate = (student: ISchoolUser) => {
    const actionText = student.isActive ? 'deactivate' : 'activate';
    openDialog('CONFIRMATION', {
      title: `Confirm ${student.isActive ? 'Deactivation' : 'Activation'}`,
      message: `Are you sure you want to ${actionText} student ${student.name}?`,
      confirmLabel: student.isActive ? 'Deactivate' : 'Activate',
      onConfirm: async () => {
        try {
          await toggleStatus(student._id).unwrap();
          notifier.showSuccess(`Student ${actionText}d successfully!`);
          closeDialog();
        } catch (err: unknown) {
          notifier.showError(getErrorMessage(err, 'Failed to toggle student status'));
        }
      }
    });
  };

  const handleDelete = (student: ISchoolUser) => {
    openDialog('CONFIRMATION', {
      title: 'Confirm Delete Student',
      message: `Are you sure you want to permanently delete student ${student.name}? This action is irreversible.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await deleteUser(student._id).unwrap();
          notifier.showSuccess('Student deleted successfully!');
          closeDialog();
        } catch (err: unknown) {
          notifier.showError(getErrorMessage(err, 'Failed to delete student'));
        }
      }
    });
  };

  const students = usersRes?.success ? usersRes.data : [];

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.userCode.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortColumn as keyof ISchoolUser];
    const valB = b[sortColumn as keyof ISchoolUser];
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;
    const strA = String(valA);
    const strB = String(valB);
    return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
  });

  const paginated = sorted.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return {
    students: paginated,
    totalCount: filtered.length,
    isLoading,
    search,
    setSearch,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    sortColumn,
    sortDirection,
    handleSort,
    handleCreateStudent,
    handleEdit,
    handleToggleDeactivate,
    handleDelete,
    openDialog
  };
}

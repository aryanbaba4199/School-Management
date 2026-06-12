import { useState, useEffect } from 'react';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { useDialog } from '@common/Dialogs/dialog.provider';
import { 
  useGetUsersQuery, 
  useCreateUserMutation,
  useUpdateUserMutation,
  useToggleUserStatusMutation,
  useDeleteUserMutation
} from '@api/usersApi';
import type { ISchoolUser } from '@api/usersApi';

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

export function useTeachers() {
  const { data: usersRes, isLoading, error } = useGetUsersQuery({ role: 'TEACHER' });
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
      notifier.showError(getErrorMessage(error, 'Error fetching teachers'));
    }
  }, [error, notifier]);

  const handleSort = (columnId: string) => {
    const isAsc = sortColumn === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(columnId);
  };

  const handleCreateTeacher = async (data: Partial<ISchoolUser> & { password?: string }) => {
    try {
      await createUser(data).unwrap();
      notifier.showSuccess('Teacher added successfully!');
      closeDialog();
    } catch (err: unknown) {
      notifier.showError(getErrorMessage(err, 'Failed to add teacher'));
    }
  };

  const handleEdit = (user: ISchoolUser) => {
    openDialog('TEACHER_FORM', {
      userId: user._id,
      onSubmit: async (data: Partial<ISchoolUser> & { password?: string }) => {
        try {
          await updateUser({ id: user._id, body: data }).unwrap();
          notifier.showSuccess('Teacher updated successfully!');
          closeDialog();
        } catch (err: unknown) {
          notifier.showError(getErrorMessage(err, 'Failed to update teacher'));
        }
      }
    });
  };

  const handleToggleDeactivate = (teacher: ISchoolUser) => {
    const actionText = teacher.isActive ? 'deactivate' : 'activate';
    openDialog('CONFIRMATION', {
      title: `Confirm ${teacher.isActive ? 'Deactivation' : 'Activation'}`,
      message: `Are you sure you want to ${actionText} teacher ${teacher.name}?`,
      confirmLabel: teacher.isActive ? 'Deactivate' : 'Activate',
      onConfirm: async () => {
        try {
          await toggleStatus(teacher._id).unwrap();
          notifier.showSuccess(`Teacher ${actionText}d successfully!`);
          closeDialog();
        } catch (err: unknown) {
          notifier.showError(getErrorMessage(err, 'Failed to toggle teacher status'));
        }
      }
    });
  };

  const handleDelete = (teacher: ISchoolUser) => {
    openDialog('CONFIRMATION', {
      title: 'Confirm Delete Teacher',
      message: `Are you sure you want to permanently delete teacher ${teacher.name}? This action is irreversible.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await deleteUser(teacher._id).unwrap();
          notifier.showSuccess('Teacher deleted successfully!');
          closeDialog();
        } catch (err: unknown) {
          notifier.showError(getErrorMessage(err, 'Failed to delete teacher'));
        }
      }
    });
  };

  const teachers = usersRes?.success ? usersRes.data : [];

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    t.userCode.toLowerCase().includes(search.toLowerCase())
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
    teachers: paginated,
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
    handleCreateTeacher,
    handleEdit,
    handleToggleDeactivate,
    handleDelete,
    openDialog
  };
}

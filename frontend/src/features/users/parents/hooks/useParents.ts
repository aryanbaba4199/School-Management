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

import { getErrorMessage } from '@common/utils/apiError.util';

export function useParents() {
  const [schoolId, setSchoolId] = useState<string>('');
  const { data: usersRes, isLoading, error } = useGetUsersQuery({ role: 'PARENT', schoolId: schoolId || undefined });
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
      notifier.showError(getErrorMessage(error, 'Error fetching parents'));
    }
  }, [error, notifier]);

  const handleSort = (columnId: string) => {
    const isAsc = sortColumn === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(columnId);
  };

  const handleCreateParent = async (data: Partial<ISchoolUser> & { password?: string }) => {
    try {
      await createUser(data).unwrap();
      notifier.showSuccess('Parent added successfully!');
      closeDialog();
    } catch (err: unknown) {
      notifier.showError(getErrorMessage(err, 'Failed to add parent'));
    }
  };

  const handleEdit = (user: ISchoolUser) => {
    openDialog('PARENT_FORM', {
      userId: user._id,
      onSubmit: async (data: Partial<ISchoolUser> & { password?: string }) => {
        try {
          await updateUser({ id: user._id, body: data }).unwrap();
          notifier.showSuccess('Parent updated successfully!');
          closeDialog();
        } catch (err: unknown) {
          notifier.showError(getErrorMessage(err, 'Failed to update parent'));
        }
      }
    });
  };

  const handleView = (user: ISchoolUser) => {
    openDialog('PARENT_DETAILS', {
      userId: user._id
    });
  };

  const handleToggleDeactivate = (parent: ISchoolUser) => {
    const actionText = parent.isActive ? 'deactivate' : 'activate';
    openDialog('CONFIRMATION', {
      title: `Confirm ${parent.isActive ? 'Deactivation' : 'Activation'}`,
      message: `Are you sure you want to ${actionText} parent ${parent.name}?`,
      confirmLabel: parent.isActive ? 'Deactivate' : 'Activate',
      onConfirm: async () => {
        try {
          await toggleStatus(parent._id).unwrap();
          notifier.showSuccess(`Parent ${actionText}d successfully!`);
          closeDialog();
        } catch (err: unknown) {
          notifier.showError(getErrorMessage(err, 'Failed to toggle parent status'));
        }
      }
    });
  };

  const handleDelete = (parent: ISchoolUser) => {
    openDialog('CONFIRMATION', {
      title: 'Confirm Delete Parent',
      message: `Are you sure you want to permanently delete parent ${parent.name}? This action is irreversible.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await deleteUser(parent._id).unwrap();
          notifier.showSuccess('Parent deleted successfully!');
          closeDialog();
        } catch (err: unknown) {
          notifier.showError(getErrorMessage(err, 'Failed to delete parent'));
        }
      }
    });
  };

  const parents = usersRes?.success ? usersRes.data : [];

  const filtered = parents.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.userCode.toLowerCase().includes(search.toLowerCase())
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
    parents: paginated,
    totalCount: filtered.length,
    isLoading,
    search,
    setSearch,
    schoolId,
    setSchoolId,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    sortColumn,
    sortDirection,
    handleSort,
    handleCreateParent,
    handleView,
    handleEdit,
    handleToggleDeactivate,
    handleDelete,
    openDialog
  };
}

import { useState } from 'react';
import { Box, Typography, Button, Dialog } from '@mui/material';
import { FaPlus } from 'react-icons/fa';
import { Datatable, DatatableFooter } from '@common/Datatable';
import { SchoolAdminFormDialog } from '../components/SchoolAdminFormDialog';
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useToggleUserStatusMutation, useDeleteUserMutation, type ISchoolUser } from '@api/usersApi';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { getStudentColumns } from '../../students/components/studentColumns';

export function SchoolAdminsPage() {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | undefined>();
  const notifier = useNotifier();

  const { data, isLoading } = useGetUsersQuery({ role: 'SCHOOL_ADMIN', page, limit: rowsPerPage });
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [toggleStatus] = useToggleUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  const users = data?.success ? data.data : [];
  const pagination = data?.pagination || { totalCount: 0, totalPages: 1 };

  const handleOpenForm = (user?: ISchoolUser) => {
    setEditingUserId(user?._id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingUserId(undefined);
    setIsFormOpen(false);
  };

  const handleSubmit = async (formData: Partial<ISchoolUser> & { password?: string }) => {
    try {
      if (editingUserId) {
        await updateUser({ id: editingUserId, body: formData }).unwrap();
        notifier.showSuccess('School Admin updated successfully');
      } else {
        await createUser(formData).unwrap();
        notifier.showSuccess('School Admin added successfully');
      }
      handleCloseForm();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      notifier.showError(error?.data?.message || error?.message || 'Operation failed');
    }
  };

  const handleToggleStatus = async (user: ISchoolUser) => {
    try {
      await toggleStatus(user._id).unwrap();
      notifier.showSuccess(`School Admin ${user.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }; message?: string };
      notifier.showError(error?.data?.message || error?.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (user: ISchoolUser) => {
    if (window.confirm(`Are you sure you want to delete school admin ${user.name}?`)) {
      try {
        await deleteUser(user._id).unwrap();
        notifier.showSuccess('School Admin deleted successfully');
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string };
        notifier.showError(error?.data?.message || error?.message || 'Failed to delete school admin');
      }
    }
  };

  // Using student columns temporarily, we'll need a specific column definition later or just adapt it
  const columns = getStudentColumns({
    onView: handleOpenForm,
    onEdit: handleOpenForm,
    onToggleDeactivate: handleToggleStatus,
    onDelete: handleDelete,
    isSuperAdmin: true,
  }).filter(col => !['classId', 'parentId'].includes(col.id)); // remove irrelevant columns

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>
          School Admins
        </Typography>
        <Button
          variant="contained"
          startIcon={<FaPlus />}
          onClick={() => handleOpenForm()}
        >
          Add School Admin
        </Button>
      </Box>

      <Datatable
        tableName="school_admins_table"
        columns={columns}
        data={users}
        loading={isLoading}
      />
      <DatatableFooter
        totalCount={pagination.totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onChangePage={setPage}
        onChangeRowsPerPage={(rows) => { setRowsPerPage(rows); setPage(0); }}
      />

      <Dialog 
        open={isFormOpen} 
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
      >
        <SchoolAdminFormDialog
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          userId={editingUserId}
          isLoading={isCreating || isUpdating}
        />
      </Dialog>
    </Box>
  );
}

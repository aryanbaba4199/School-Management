import { useState, useEffect } from 'react';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { useDialog } from '@common/Dialogs/dialog.provider';
import { 
  useGetSchoolsQuery, 
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useDeactivateSchoolMutation,
  useDeleteSchoolMutation
} from '../../../../api/schoolsApi';
import { type ISchool, MOCK_SCHOOLS } from '../types/schools.types';
import type { SchoolFormData } from '../schema/school.schema';

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

export function useSchools() {
  const { data: schoolsRes, isLoading, error } = useGetSchoolsQuery();
  const [createSchool] = useCreateSchoolMutation();
  const [updateSchool] = useUpdateSchoolMutation();
  const [deactivateSchool] = useDeactivateSchoolMutation();
  const [deleteSchool] = useDeleteSchoolMutation();
  const notifier = useNotifier();
  const { openDialog, closeDialog } = useDialog();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (error) {
      const msg = getErrorMessage(error, 'Error fetching schools');
      notifier.showError(msg || 'Failed to fetch schools');
    }
  }, [error, notifier]);

  const handleSort = (columnId: string) => {
    const isAsc = sortColumn === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(columnId);
  };

  const handleCreateSchool = async (data: SchoolFormData) => {
    try {
      await createSchool(data).unwrap();
      notifier.showSuccess('School created successfully!');
      closeDialog();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to create school');
      notifier.showError(msg);
    }
  };

  const handleEdit = (school: ISchool) => {
    openDialog('SCHOOL_FORM', {
      schoolId: school._id,
      onSubmit: async (data: SchoolFormData) => {
        try {
          await updateSchool({ id: school._id, body: data }).unwrap();
          notifier.showSuccess('School updated successfully!');
          closeDialog();
        } catch (err: unknown) {
          const msg = getErrorMessage(err, 'Failed to update school');
          notifier.showError(msg);
        }
      }
    });
  };

  const handleToggleDeactivate = (school: ISchool) => {
    const isActivating = school.isDeactive;
    const actionText = isActivating ? 'activate' : 'deactivate';
    
    let message = `Are you sure you want to ${actionText} ${school.name}?`;
    if (!isActivating && school.subscriptionPlan) {
      message += ` This school has an active subscription which may be affected.`;
    }

    openDialog('CONFIRMATION', {
      title: `Confirm ${isActivating ? 'Activation' : 'Deactivation'}`,
      message,
      confirmLabel: isActivating ? 'Activate' : 'Deactivate',
      onConfirm: async () => {
        try {
          await deactivateSchool(school._id).unwrap();
          notifier.showSuccess(`School ${actionText}d successfully!`);
          closeDialog();
        } catch (err: unknown) {
          const msg = getErrorMessage(err, 'Failed to update school status');
          notifier.showError(msg);
          throw err;
        }
      }
    });
  };

  const handleDelete = (school: ISchool) => {
    openDialog('PASSCODE_PROMPT', {
      title: 'Confirm Delete School',
      message: `Are you sure you want to delete ${school.name}? This action is irreversible. Enter the 6-digit master passcode to confirm.`,
      confirmLabel: 'Delete',
      onConfirm: async (passcode: string) => {
        try {
          await deleteSchool({ id: school._id, passcode }).unwrap();
          notifier.showSuccess('School deleted successfully!');
          closeDialog();
        } catch (err: unknown) {
          const msg = getErrorMessage(err, 'Failed to delete school');
          notifier.showError(msg);
          throw err;
        }
      }
    });
  };

  const schools = schoolsRes?.success ? schoolsRes.data : MOCK_SCHOOLS;

  const filtered = schools.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.subdomain.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortColumn as keyof ISchool];
    let valB = b[sortColumn as keyof ISchool];

    if (sortColumn === 'subscriptionPlan') {
      valA = typeof a.subscriptionPlan === 'object' ? a.subscriptionPlan.name : String(a.subscriptionPlan);
      valB = typeof b.subscriptionPlan === 'object' ? b.subscriptionPlan.name : String(b.subscriptionPlan);
    }

    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    const strA = String(valA);
    const strB = String(valB);
    return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
  });

  const paginated = sorted.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return {
    schools: paginated,
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
    handleCreateSchool,
    handleEdit,
    handleToggleDeactivate,
    handleDelete,
    openDialog
  };
}

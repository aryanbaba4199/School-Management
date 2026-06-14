import { useState, useEffect } from 'react';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { useDialog } from '@common/Dialogs/dialog.provider';
import {
  useGetClassesQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} from '@api/classesApi';
import type { IClass } from '../types/classes.types';

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

export function useClasses(schoolId?: string) {
  const { data: classesRes, isLoading, error } = useGetClassesQuery(schoolId ? { schoolId } : undefined);
  const [createClass] = useCreateClassMutation();
  const [updateClass] = useUpdateClassMutation();
  const [deleteClass] = useDeleteClassMutation();
  const notifier = useNotifier();
  const { openDialog, closeDialog } = useDialog();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (error) {
      const msg = getErrorMessage(error, 'Error fetching classes');
      notifier.showError(msg);
    }
  }, [error, notifier]);

  const handleSort = (columnId: string) => {
    const isAsc = sortColumn === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(columnId);
  };

  const handleCreateClass = async (data: {
    name: string;
    sections: string[];
    schoolId?: string;
    classTeacherId?: string;
    schedule?: { startTime: string; endTime: string; subjectId: string; teacherId: string }[];
  }) => {
    try {
      await createClass(data).unwrap();
      notifier.showSuccess('Class created successfully!');
      closeDialog();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to create class');
      notifier.showError(msg);
    }
  };

  const handleEdit = (classObj: IClass) => {
    openDialog('CLASS_FORM', {
      classId: classObj._id,
      onSubmit: async (data: {
        name: string;
        sections: string[];
        schoolId?: string;
        classTeacherId?: string;
        schedule?: { startTime: string; endTime: string; subjectId: string; teacherId: string }[];
      }) => {
        try {
          await updateClass({ id: classObj._id, body: data }).unwrap();
          notifier.showSuccess('Class updated successfully!');
          closeDialog();
        } catch (err: unknown) {
          const msg = getErrorMessage(err, 'Failed to update class');
          notifier.showError(msg);
        }
      },
    });
  };

  const handleDelete = (classObj: IClass) => {
    openDialog('CONFIRMATION', {
      title: 'Confirm Delete Class',
      message: `Are you sure you want to delete ${classObj.name}? This will also delete all associated sections.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await deleteClass(classObj._id).unwrap();
          notifier.showSuccess('Class deleted successfully!');
          closeDialog();
        } catch (err: unknown) {
          const msg = getErrorMessage(err, 'Failed to delete class');
          notifier.showError(msg);
        }
      },
    });
  };

  const classes = classesRes?.success ? classesRes.data : [];

  const filtered = classes.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const valA = String(a[sortColumn as keyof IClass] || '');
    const valB = String(b[sortColumn as keyof IClass] || '');
    return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const paginated = sorted.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return {
    classes: paginated,
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
    handleCreateClass,
    handleEdit,
    handleDelete,
    openDialog,
  };
}

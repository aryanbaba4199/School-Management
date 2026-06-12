import { useState, useEffect } from 'react';
import { useNotifier } from '@common/Notifier/NotifierProvider';
import { useDialog } from '@common/Dialogs/dialog.provider';
import {
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} from '@api/subjectsApi';
import type { ISubject } from '../types/subjects.types';

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

export function useSubjects() {
  const { data: subjectsRes, isLoading, error } = useGetSubjectsQuery();
  const [createSubject] = useCreateSubjectMutation();
  const [updateSubject] = useUpdateSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();
  const notifier = useNotifier();
  const { openDialog, closeDialog } = useDialog();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (error) {
      const msg = getErrorMessage(error, 'Error fetching subjects');
      notifier.showError(msg);
    }
  }, [error, notifier]);

  const handleSort = (columnId: string) => {
    const isAsc = sortColumn === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(columnId);
  };

  const handleCreateSubject = async (data: { name: string; code: string; teacherIds?: string[]; schoolId?: string }) => {
    try {
      await createSubject(data).unwrap();
      notifier.showSuccess('Subject created successfully!');
      closeDialog();
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to create subject');
      notifier.showError(msg);
    }
  };

  const handleEdit = (subject: ISubject) => {
    openDialog('SUBJECT_FORM', {
      subjectId: subject._id,
      onSubmit: async (data: { name: string; code: string; teacherIds?: string[]; schoolId?: string }) => {
        try {
          await updateSubject({ id: subject._id, body: data }).unwrap();
          notifier.showSuccess('Subject updated successfully!');
          closeDialog();
        } catch (err: unknown) {
          const msg = getErrorMessage(err, 'Failed to update subject');
          notifier.showError(msg);
        }
      },
    });
  };

  const handleDelete = (subject: ISubject) => {
    openDialog('CONFIRMATION', {
      title: 'Confirm Delete Subject',
      message: `Are you sure you want to delete ${subject.name} (${subject.code})?`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await deleteSubject(subject._id).unwrap();
          notifier.showSuccess('Subject deleted successfully!');
          closeDialog();
        } catch (err: unknown) {
          const msg = getErrorMessage(err, 'Failed to delete subject');
          notifier.showError(msg);
        }
      },
    });
  };

  const subjects = subjectsRes?.success ? subjectsRes.data : [];

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const valA = String(a[sortColumn as keyof ISubject] || '');
    const valB = String(b[sortColumn as keyof ISubject] || '');
    return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const paginated = sorted.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return {
    subjects: paginated,
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
    handleCreateSubject,
    handleEdit,
    handleDelete,
    openDialog,
  };
}

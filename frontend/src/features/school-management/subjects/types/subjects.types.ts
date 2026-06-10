import type { ISubject } from '../../../../api/subjectsApi';

export type { ISubject };

export interface SubjectFormData {
  name: string;
  code: string;
  teacherIds?: string[];
  schoolId?: string;
}

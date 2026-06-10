import type { ISection, IClass } from '../../../../api/classesApi';

export type { ISection, IClass };

export interface ClassFormData {
  name: string;
  sections: string; // Comma-separated section names entered in the form
  schoolId?: string;
}

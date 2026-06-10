import * as yup from 'yup';

export const classSchema = yup.object({
  name: yup
    .string()
    .required('Class name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  sections: yup
    .string()
    .required('At least one section is required')
    .test('valid-sections', 'Sections must be comma-separated list of values (e.g. A, B, C)', (val) => {
      if (!val) return false;
      return val.split(',').map(s => s.trim()).filter(Boolean).length > 0;
    }),
  schoolId: yup.string().optional(),
  classTeacherId: yup.string().optional(),
  schedule: yup.array().of(
    yup.object({
      startTime: yup.string().required('Start time is required'),
      endTime: yup.string().required('End time is required'),
      subjectId: yup.string().required('Subject is required'),
      teacherId: yup.string().required('Teacher is required'),
    })
  ).optional(),
}).required();

import * as yup from 'yup';

export const subjectSchema = yup.object({
  name: yup
    .string()
    .required('Subject name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  code: yup
    .string()
    .required('Subject code is required')
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code cannot exceed 20 characters')
    .matches(/^[A-Z0-9-]+$/, 'Code must be uppercase alphanumeric (hyphens allowed)'),
  teacherIds: yup
    .array()
    .of(yup.string().required())
    .optional(),
}).required();

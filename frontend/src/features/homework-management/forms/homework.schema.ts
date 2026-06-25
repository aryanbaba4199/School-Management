import * as yup from 'yup';

export const homeworkSchema = yup.object().shape({
  classId: yup.string().required('Class is required'),
  sectionId: yup.string().required('Section is required'),
  subjectId: yup.string().required('Subject is required'),
  title: yup
    .string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(150, 'Title cannot exceed 150 characters'),
  description: yup
    .string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  dueDate: yup.string().required('Due date is required'),
  maxMarks: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .min(0, 'Marks cannot be negative')
    .optional(),
  attachments: yup
    .array()
    .of(
      yup.object().shape({
        fileName: yup.string().required(),
        fileUrl: yup.string().url().required(),
        fileType: yup.string().required(),
        fileSize: yup.number().required(),
      })
    )
    .optional()
    .default([]),
});

export const submitHomeworkSchema = yup.object().shape({
  studentNotes: yup.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  attachments: yup
    .array()
    .of(
      yup.object().shape({
        fileName: yup.string().required(),
        fileUrl: yup.string().url().required(),
        fileType: yup.string().required(),
        fileSize: yup.number().required(),
      })
    )
    .optional()
    .default([]),
});

export const gradeHomeworkSchema = yup.object().shape({
  obtainedMarks: yup
    .number()
    .required('Marks are required')
    .min(0, 'Marks cannot be negative'),
  teacherFeedback: yup
    .string()
    .required('Feedback is required')
    .min(5, 'Feedback must be at least 5 characters')
    .max(1000, 'Feedback cannot exceed 1000 characters'),
  status: yup.string().oneOf(['GRADED', 'CORRECTION_REQUIRED']).required('Status is required'),
});

export type HomeworkFormValues = yup.InferType<typeof homeworkSchema>;
export type SubmitHomeworkFormValues = yup.InferType<typeof submitHomeworkSchema>;
export type GradeHomeworkFormValues = yup.InferType<typeof gradeHomeworkSchema>;

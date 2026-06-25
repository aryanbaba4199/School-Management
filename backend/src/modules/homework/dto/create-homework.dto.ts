import { z } from 'zod';

export const createHomeworkSchema = z.object({
  body: z.object({
    classId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid class ID'),
    sectionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid section ID'),
    subjectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid subject ID'),
    title: z.string().min(5, 'Title must be at least 5 characters').max(150, 'Title cannot exceed 150 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
    dueDate: z.string().datetime({ message: 'Invalid due date format' }),
    maxMarks: z.number().min(0, 'Max marks cannot be negative').optional(),
    attachments: z
      .array(
        z.object({
          fileName: z.string().min(1, 'File name is required'),
          fileUrl: z.string().url('Invalid file URL'),
          fileType: z.string().min(1, 'File type is required'),
          fileSize: z.number().min(0, 'File size cannot be negative'),
        })
      )
      .optional()
      .default([]),
  }),
});

export type CreateHomeworkInput = z.infer<typeof createHomeworkSchema>['body'];

export const updateHomeworkSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(150).optional(),
    description: z.string().min(10).max(2000).optional(),
    dueDate: z.string().datetime().optional(),
    maxMarks: z.number().min(0).optional(),
    attachments: z
      .array(
        z.object({
          fileName: z.string().min(1),
          fileUrl: z.string().url(),
          fileType: z.string().min(1),
          fileSize: z.number().min(0),
        })
      )
      .optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid homework ID'),
  }),
});

export type UpdateHomeworkInput = z.infer<typeof updateHomeworkSchema>['body'];

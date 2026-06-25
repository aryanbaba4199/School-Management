import { z } from 'zod';

export const submitHomeworkSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid homework ID'),
  }),
  body: z.object({
    studentNotes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
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
  }).refine((data) => data.studentNotes || data.attachments.length > 0, {
    message: 'Either student notes or at least one attachment must be provided to submit',
    path: ['attachments'],
  }),
});

export type SubmitHomeworkInput = z.infer<typeof submitHomeworkSchema>['body'];

export const gradeHomeworkSchema = z.object({
  params: z.object({
    submissionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid submission ID'),
  }),
  body: z.object({
    obtainedMarks: z.number().min(0, 'Obtained marks cannot be negative'),
    teacherFeedback: z.string().min(5, 'Feedback must be at least 5 characters').max(1000, 'Feedback cannot exceed 1000 characters'),
    status: z.enum(['GRADED', 'CORRECTION_REQUIRED']).default('GRADED'),
  }),
});

export type GradeHomeworkInput = z.infer<typeof gradeHomeworkSchema>['body'];

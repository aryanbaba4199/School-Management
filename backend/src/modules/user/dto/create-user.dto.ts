import { z } from 'zod';

/*------------- Zod Input Validation Schemas -------------*/

const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format (must be a 24-character hex string)');

export const CreateUserSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Name must be a string' })
      .min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name cannot exceed 100 characters'),

    email: z.string({ message: 'Email must be a string' })
      .email('Invalid email address format'),

    password: z.string({ message: 'Password must be a string' })
      .min(6, 'Password must be at least 6 characters long')
      .max(50, 'Password cannot exceed 50 characters'),

    userCode: z.string({ message: 'User code is required' })
      .min(2, 'User code must be at least 2 characters')
      .max(30, 'User code cannot exceed 30 characters')
      .regex(/^[A-Z0-9-]+$/, 'User code must be uppercase alphanumeric (hyphens allowed)'),

    role: z.object({
      name: z.enum(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'], {
        message: 'Role name must be one of SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, or PARENT',
      }),
      access: z.array(z.string()).default([]),
    }),

    schoolId: ObjectIdSchema.optional(),

    phone: z.string().max(15, 'Phone number cannot exceed 15 characters').optional(),

    address: z.object({
      street: z.string().max(150).optional(),
      city: ObjectIdSchema.optional(),
      state: ObjectIdSchema.optional(),
      district: ObjectIdSchema.optional(),
      pincode: z.number().int().optional(),
    }).optional(),

    parentId: ObjectIdSchema.optional(),
    childrenIds: z.array(ObjectIdSchema).optional(),
    classId: ObjectIdSchema.optional(),
    sectionId: ObjectIdSchema.optional(),
    subjects: z.array(ObjectIdSchema).optional(),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.string({ message: 'Email must be a string' })
      .email('Invalid email address format'),

    password: z.string({ message: 'Password must be a string' })
      .min(6, 'Password must be at least 6 characters long'),
  }),
});

/*------------- TypeScript Type Inferences -------------*/

export type CreateUserInput = z.infer<typeof CreateUserSchema>['body'];
export type LoginInput = z.infer<typeof LoginSchema>['body'];

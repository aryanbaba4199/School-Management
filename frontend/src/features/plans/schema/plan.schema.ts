import * as yup from 'yup';

export const planSchema = yup.object({
  name: yup
    .string()
    .required('Plan name is required')
    .min(2, 'Plan name must be at least 2 characters')
    .max(50, 'Plan name cannot exceed 50 characters'),
  code: yup
    .string()
    .required('Plan code is required')
    .min(2, 'Plan code must be at least 2 characters')
    .max(20, 'Plan code cannot exceed 20 characters')
    .matches(/^[A-Z0-9_-]+$/, 'Plan code must be uppercase alphanumeric (hyphens/underscores allowed)'),
  price: yup.object({
    monthly: yup.number().typeError('Monthly price must be a number').required('Monthly price is required').min(0, 'Monthly price cannot be negative'),
    yearly: yup.number().typeError('Yearly price must be a number').required('Yearly price is required').min(0, 'Yearly price cannot be negative'),
  }),
  maxStudents: yup
    .number()
    .typeError('Capacity limit must be a number')
    .integer('Capacity limit must be an integer')
    .required('Capacity limit is required')
    .min(1, 'Capacity limit must be at least 1')
    .default(500),
  features: yup.object({
    attendanceEnabled: yup.boolean().default(true),
    onlineExamEnabled: yup.boolean().default(false),
    aiAnalyticsEnabled: yup.boolean().default(false),
    parentAppEnabled: yup.boolean().default(true),
  }),
  isActive: yup.boolean().default(true),
}).required();

export type PlanFormData = yup.InferType<typeof planSchema>;

import * as yup from 'yup';

export interface TeacherFormData {
  name: string;
  email: string;
  password?: string;
  userCode: string;
  phone?: string;
  subjects?: string[];
  address?: {
    street?: string;
    state?: string;
    district?: string;
    pincode?: number;
  };
}

export const teacherSchema = yup.object({
  name: yup
    .string()
    .required('Teacher name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address format'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password cannot exceed 50 characters')
    .optional(),
  userCode: yup
    .string()
    .required('Employee ID is required')
    .min(2, 'Employee ID must be at least 2 characters')
    .max(30, 'Employee ID cannot exceed 30 characters')
    .matches(/^[A-Z0-9-]+$/, 'Employee ID must be uppercase alphanumeric (hyphens allowed)'),
  phone: yup
    .string()
    .optional()
    .matches(/^[0-9]*$/, 'Phone number must contain only digits'),
  subjects: yup.array().of(yup.string().required()).optional(),
  address: yup.object({
    street: yup.string().max(150).optional(),
    state: yup.string().optional(),
    district: yup.string().optional(),
    pincode: yup.number().typeError('Pincode must be a number').integer('Pincode must be an integer').optional(),
  }).optional(),
}).required();

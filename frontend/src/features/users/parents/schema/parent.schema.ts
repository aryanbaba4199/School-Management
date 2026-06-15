import * as yup from 'yup';

export interface ParentFormData {
  name: string;
  email: string;
  password?: string;
  userCode: string;
  phone?: string;
  childrenIds?: string[];
  address?: {
    street?: string;
    state?: string;
    district?: string;
    pincode?: number;
  };
}

export const parentSchema = yup.object({
  name: yup
    .string()
    .required('Parent/Guardian name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address format'),
  password: yup
    .string()
    .optional()
    .test('min', 'Password must be at least 6 characters', (val) => !val || val.length >= 6)
    .test('max', 'Password cannot exceed 50 characters', (val) => !val || val.length <= 50),

  userCode: yup
    .string()
    .required('Guardian ID is required')
    .min(2, 'Guardian ID must be at least 2 characters')
    .max(30, 'Guardian ID cannot exceed 30 characters')
    .matches(/^[A-Z0-9-]+$/, 'Guardian ID must be uppercase alphanumeric (hyphens allowed)'),
  phone: yup
    .string()
    .optional()
    .matches(/^[0-9]*$/, 'Phone number must contain only digits'),
  childrenIds: yup.array().of(yup.string().required()).optional(),
  address: yup.object({
    street: yup.string().max(150).optional(),
    state: yup.string().optional(),
    district: yup.string().optional(),
    pincode: yup.number().typeError('Pincode must be a number').integer('Pincode must be an integer').optional(),
  }).optional(),
}).required();

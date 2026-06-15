import * as yup from 'yup';

export interface SchoolAdminFormData {
  name: string;
  email: string;
  password?: string;
  userCode: string;
  phone?: string;
  schoolId: string;
  address?: {
    street?: string;
    state?: string;
    district?: string;
    pincode?: number;
  };
}

export const schoolAdminSchema = yup.object({
  name: yup.string().required('Name is required').min(2).max(100),
  email: yup.string().required('Email is required').email('Invalid email address'),
  password: yup.string().optional(),
  userCode: yup.string().required('User Code is required').matches(/^[A-Z0-9-]+$/, 'Must be uppercase alphanumeric'),
  phone: yup.string().optional().matches(/^[0-9]*$/, 'Digits only'),
  schoolId: yup.string().required('School assignment is required'),
  address: yup.object({
    street: yup.string().max(150).optional(),
    state: yup.string().optional(),
    district: yup.string().optional(),
    pincode: yup.number().typeError('Pincode must be a number').integer('Pincode must be an integer').optional(),
  }).optional(),
}).required();

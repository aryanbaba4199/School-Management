import * as yup from 'yup';

export interface ProfileFormData {
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    state?: string;
    district?: string;
    pincode?: number;
  };
}

export const profileSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address format'),
  phone: yup
    .string()
    .optional()
    .matches(/^[0-9]*$/, 'Phone number must contain only digits'),
  address: yup.object({
    street: yup.string().max(150).optional(),
    state: yup.string().optional(),
    district: yup.string().optional(),
    pincode: yup.number().typeError('Pincode must be a number').integer('Pincode must be an integer').optional(),
  }).optional(),
}).required();

export interface PasswordChangeFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const passwordChangeSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password cannot exceed 50 characters'),
  confirmPassword: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
}).required();

import * as yup from 'yup';

const IdRegex = /^([0-9a-fA-F]{24}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/i;

export const schoolSchema = yup.object({
  adminName: yup
    .string()
    .required('Admin name is required')
    .min(2, 'Admin name must be at least 2 characters')
    .max(100, 'Admin name cannot exceed 100 characters'),
  adminEmail: yup
    .string()
    .required('Admin email is required')
    .email('Invalid admin email address format'),
  adminPassword: yup
    .string()
    .required('Admin password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password cannot exceed 50 characters'),
  name: yup
    .string()
    .required('School name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  code: yup
    .string()
    .required('School code is required')
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code cannot exceed 20 characters')
    .matches(/^[A-Z0-9-]+$/, 'Code must be uppercase alphanumeric (hyphens allowed)'),
  subdomain: yup
    .string()
    .required('Subdomain is required')
    .min(3, 'Subdomain must be at least 3 characters')
    .max(30, 'Subdomain cannot exceed 30 characters')
    .matches(/^[a-z0-9-]+$/, 'Subdomain must be lowercase alphanumeric (hyphens allowed)'),
  email: yup
    .string()
    .required('Email address is required')
    .email('Invalid email address format'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9]+$/, 'Phone number must contain only digits')
    .test('len', 'Invalid phone number length', function (val) {
      const mobileDigits = this.options.context?.mobileDigits;
      if (!val || !mobileDigits) return true;
      return val.length === mobileDigits;
    }),
  country: yup
    .string()
    .required('Country is required')
    .matches(IdRegex, 'Invalid Country ID'),
  countryCode: yup
    .string()
    .default('+91'),
  address: yup.string().max(250, 'Address cannot exceed 250 characters').optional(),
  state: yup
    .string()
    .matches(IdRegex, { message: 'Invalid State ID', excludeEmptyString: true })
    .optional(),
  district: yup
    .string()
    .matches(IdRegex, { message: 'Invalid District ID', excludeEmptyString: true })
    .optional(),
  pincode: yup
    .number()
    .typeError('Pincode must be a number')
    .integer('Pincode must be an integer')
    .optional(),
  boardType: yup
    .string()
    .required('Board Type is required')
    .matches(IdRegex, 'Invalid Board Type ID'),
  subscriptionPlan: yup
    .string()
    .required('Subscription plan is required')
    .matches(IdRegex, 'Invalid Subscription Plan ID'),
  billingCycle: yup
    .string()
    .oneOf(['MONTHLY', 'YEARLY'], 'Invalid billing cycle')
    .required('Billing cycle is required'),
  maxStudents: yup
    .number()
    .typeError('Capacity must be a number')
    .integer('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1')
    .default(500),
  shift: yup.string().optional(),
  startTime: yup.string().optional(),
  endTime: yup.string().optional(),
  admissionFee: yup
    .number()
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? undefined : value))
    .typeError('Admission fee must be a number')
    .min(0, 'Admission fee cannot be negative')
    .optional(),
  settings: yup.object({
    attendanceEnabled: yup.boolean().default(true),
    onlineExamEnabled: yup.boolean().default(false),
    aiAnalyticsEnabled: yup.boolean().default(false),
    parentAppEnabled: yup.boolean().default(true),
  }),
}).required();

export type SchoolFormData = yup.InferType<typeof schoolSchema>;

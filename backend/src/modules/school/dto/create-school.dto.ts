import { z } from 'zod';

/*------------- Zod Input Validation Schema -------------*/

export const CreateSchoolSchema = z.object({
  body: z.object({
    adminName: z.string({ message: 'Admin name must be a string' })
      .min(2, 'Admin name must be at least 2 characters long')
      .max(100, 'Admin name cannot exceed 100 characters'),

    adminEmail: z.string({ message: 'Admin email must be a string' })
      .email('Invalid admin email address format'),

    adminPassword: z.string({ message: 'Admin password must be a string' })
      .min(6, 'Admin password must be at least 6 characters long')
      .max(50, 'Admin password cannot exceed 50 characters'),

    name: z.string({ message: 'School name must be a string' })
      .min(2, 'School name must be at least 2 characters long')
      .max(100, 'School name cannot exceed 100 characters'),

    code: z.string({ message: 'School code must be a string' })
      .min(2, 'School code must be at least 2 characters long')
      .max(20, 'School code cannot exceed 20 characters')
      .regex(/^[A-Z0-9-]+$/, 'School code must only contain uppercase alphanumeric characters and hyphens'),

    subdomain: z.string({ message: 'Subdomain must be a string' })
      .min(3, 'Subdomain must be at least 3 characters long')
      .max(30, 'Subdomain cannot exceed 30 characters')
      .regex(/^[a-z0-9-]+$/, 'Subdomain must only contain lowercase alphanumeric characters and hyphens'),

    email: z.string({ message: 'Email must be a string' })
      .email('Invalid email address format'),

    phone: z.string({ message: 'Phone number must be a string' })
      .regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),

    countryCode: z.string().default('+91').optional(),

    address: z.string().max(250, 'Address cannot exceed 250 characters').optional(),
    
    district: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid District ID format (must be a 24-character hex string)')
      .optional(),
      
    state: z.string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid State ID format (must be a 24-character hex string)')
      .optional(),
      
    country: z.string().max(100, 'Country name cannot exceed 100 characters').default('India').optional(),
    pincode: z.number().int().optional(),
    logo: z.string().url('Logo must be a valid URL').or(z.string().max(250)).optional(),
    website: z.string().url('Website must be a valid URL').or(z.string().max(250)).optional(),

    boardType: z.enum(['CBSE', 'ICSE', 'STATE', 'IB', 'OTHER']).default('CBSE').optional(),
    
    subscriptionPlan: z.string({ message: 'Subscription Plan ID is required' })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Subscription Plan ID format (must be a 24-character hex string)'),
      
    subscriptionStartDate: z.string().datetime().or(z.date()).optional(),
    subscriptionEndDate: z.string().datetime().or(z.date()).optional(),
    maxStudents: z.number().int().min(1, 'Max students must be at least 1').default(500).optional(),
    isActive: z.boolean().default(true).optional(),

    settings: z.object({
      attendanceEnabled: z.boolean().default(true).optional(),
      onlineExamEnabled: z.boolean().default(false).optional(),
      aiAnalyticsEnabled: z.boolean().default(false).optional(),
      parentAppEnabled: z.boolean().default(true).optional(),
    }).default({}).optional(),
  }),
});

/*------------- TypeScript Type Inference -------------*/

export type CreateSchoolInput = z.infer<typeof CreateSchoolSchema>['body'];

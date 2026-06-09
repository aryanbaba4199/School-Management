import { z } from 'zod';

/*------------- State Validation Schema -------------*/

export const CreateStateSchema = z.object({
  body: z.object({
    name: z.string({ message: 'State name must be a string' })
      .min(2, 'State name must be at least 2 characters long')
      .max(100, 'State name cannot exceed 100 characters'),
      
    code: z.string({ message: 'State code must be a string' })
      .min(2, 'State code must be at least 2 characters')
      .max(5, 'State code cannot exceed 5 characters')
      .regex(/^[A-Z0-9]+$/, 'State code must be uppercase alphanumeric'),
  }),
});

/*------------- District Validation Schema -------------*/

export const CreateDistrictSchema = z.object({
  body: z.object({
    name: z.string({ message: 'District name must be a string' })
      .min(2, 'District name must be at least 2 characters long')
      .max(100, 'District name cannot exceed 100 characters'),
      
    stateId: z.string({ message: 'State ID is required' })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid State ID format (must be a 24-character hex string)'),
      
    code: z.string({ message: 'District code must be a string' })
      .min(2, 'District code must be at least 2 characters')
      .max(10, 'District code cannot exceed 10 characters')
      .regex(/^[A-Z0-9-]+$/, 'District code must only contain uppercase alphanumeric characters and hyphens'),
  }),
});

/*------------- City Validation Schema -------------*/

export const CreateCitySchema = z.object({
  body: z.object({
    name: z.string({ message: 'City name must be a string' })
      .min(2, 'City name must be at least 2 characters long')
      .max(100, 'City name cannot exceed 100 characters'),

    districtId: z.string({ message: 'District ID is required' })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid District ID format (must be a 24-character hex string)'),

    code: z.string({ message: 'City code must be a string' })
      .min(2, 'City code must be at least 2 characters')
      .max(10, 'City code cannot exceed 10 characters')
      .regex(/^[A-Z0-9-]+$/, 'City code must only contain uppercase alphanumeric characters and hyphens'),
  }),
});

/*------------- SubscriptionPlan Validation Schema -------------*/

export const CreateSubscriptionPlanSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Plan name must be a string' })
      .min(2, 'Plan name must be at least 2 characters long')
      .max(50, 'Plan name cannot exceed 50 characters'),
      
    code: z.string({ message: 'Plan code must be a string' })
      .min(2, 'Plan code must be at least 2 characters')
      .max(20, 'Plan code cannot exceed 20 characters')
      .regex(/^[A-Z0-9_-]+$/, 'Plan code must be uppercase alphanumeric (hyphens/underscores allowed)'),
      
    price: z.number({ message: 'Price is required' })
      .min(0, 'Price cannot be negative'),
      
    maxStudents: z.number().int().min(1).default(500).optional(),
    
    features: z.object({
      attendanceEnabled: z.boolean().default(true).optional(),
      onlineExamEnabled: z.boolean().default(false).optional(),
      aiAnalyticsEnabled: z.boolean().default(false).optional(),
      parentAppEnabled: z.boolean().default(true).optional(),
    }).default({}).optional(),
    
    isActive: z.boolean().default(true).optional(),
  }),
});

/*------------- TypeScript Type Inferences -------------*/

export type CreateStateInput = z.infer<typeof CreateStateSchema>['body'];
export type CreateDistrictInput = z.infer<typeof CreateDistrictSchema>['body'];
export type CreateCityInput = z.infer<typeof CreateCitySchema>['body'];
export type CreateSubscriptionPlanInput = z.infer<typeof CreateSubscriptionPlanSchema>['body'];

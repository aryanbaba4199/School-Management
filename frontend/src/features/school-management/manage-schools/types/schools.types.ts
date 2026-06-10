export interface ISchoolSettings {
  attendanceEnabled: boolean;
  onlineExamEnabled: boolean;
  aiAnalyticsEnabled: boolean;
  parentAppEnabled: boolean;
}

export interface ISchool {
  _id: string;
  name: string;
  code: string;
  subdomain: string;
  email: string;
  phone: string;
  countryCode: string;
  address?: string;
  district?: { _id: string; name: string; code: string } | string;
  state?: { _id: string; name: string; code: string } | string;
  country: { _id: string; name: string; code: string } | string;
  pincode?: number;
  logo?: string;
  website?: string;
  boardType: { _id: string; name: string; acronym: string } | string;
  subscriptionPlan: { _id: string; name: string; code: string } | string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  maxStudents: number;
  totalTeacher?: number;
  totalStudent?: number;
  isActive: boolean;
  isDeactive: boolean;
  shift?: string;
  startTime?: string;
  endTime?: string;
  settings: ISchoolSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ISchoolDraft {
  adminEmail?: string;
  adminName?: string;
  adminPassword?: string;
  currentStep?: number;
  schoolDetails?: {
    name?: string;
    code?: string;
    subdomain?: string;
    email?: string;
    phone?: string;
    countryCode?: string;
    address?: string;
    state?: string;
    district?: string;
    country?: string;
    boardType?: string;
  };
  subscriptionDetails?: {
    subscriptionPlan?: string;
    billingCycle?: 'MONTHLY' | 'YEARLY';
    maxStudents?: number;
    settings?: {
      attendanceEnabled?: boolean;
      onlineExamEnabled?: boolean;
      aiAnalyticsEnabled?: boolean;
      parentAppEnabled?: boolean;
    };
  };
}

export interface MasterOption {
  _id: string;
  name: string;
  code?: string;
  mobileDigits?: number;
  dialCode?: string;
}

import type { ISubscriptionPlan } from '../../../app-management/plan-management/types/plans.types';

export const MOCK_PLANS: ISubscriptionPlan[] = [
  { _id: '60f7c223405c102c98d6c810', name: 'Pro Plan', code: 'PRO', price: { monthly: 999, yearly: 9999 }, maxStudents: 1000, features: { attendanceEnabled: true, onlineExamEnabled: true, aiAnalyticsEnabled: true, parentAppEnabled: true }, isActive: true },
  { _id: '60f7c223405c102c98d6c811', name: 'Basic Plan', code: 'BASIC', price: { monthly: 499, yearly: 4999 }, maxStudents: 500, features: { attendanceEnabled: true, onlineExamEnabled: false, aiAnalyticsEnabled: false, parentAppEnabled: true }, isActive: true }
];

export const MOCK_STATES = [
  { _id: '60f7c223405c102c98d6c820', name: 'Karnataka' },
  { _id: '60f7c223405c102c98d6c821', name: 'Delhi' }
];

export const MOCK_DISTRICTS: Record<string, MasterOption[]> = {
  '60f7c223405c102c98d6c820': [{ _id: '60f7c223405c102c98d6c830', name: 'Bangalore' }],
  '60f7c223405c102c98d6c821': [{ _id: '60f7c223405c102c98d6c831', name: 'New Delhi' }],
};

export const MOCK_SCHOOLS: ISchool[] = [
  {
    _id: '60f7c223405c102c98d6c801',
    name: 'Greenwood International School',
    code: 'GWIS',
    subdomain: 'greenwood',
    email: 'info@greenwood.edu',
    phone: '9876543210',
    countryCode: '+91',
    boardType: 'CBSE',
    subscriptionPlan: { _id: '60f7c223405c102c98d6c810', name: 'Pro Plan', code: 'PRO' },
    billingCycle: 'YEARLY',
    maxStudents: 1500,
    totalTeacher: 45,
    totalStudent: 1200,
    isActive: true,
    isDeactive: false,
    country: 'India',
    settings: { attendanceEnabled: true, onlineExamEnabled: true, aiAnalyticsEnabled: true, parentAppEnabled: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '60f7c223405c102c98d6c802',
    name: 'Saint Xavier Academy',
    code: 'SXAC',
    subdomain: 'stxaviers',
    email: 'contact@stxaviers.org',
    phone: '8765432109',
    countryCode: '+91',
    boardType: 'ICSE',
    subscriptionPlan: { _id: '60f7c223405c102c98d6c811', name: 'Basic Plan', code: 'BASIC' },
    billingCycle: 'MONTHLY',
    maxStudents: 800,
    totalTeacher: 25,
    totalStudent: 650,
    isActive: true,
    isDeactive: false,
    country: 'India',
    settings: { attendanceEnabled: true, onlineExamEnabled: false, aiAnalyticsEnabled: false, parentAppEnabled: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

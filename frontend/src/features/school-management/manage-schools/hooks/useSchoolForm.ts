import { useEffect } from 'react';
import { useForm, type DefaultValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { schoolSchema, type SchoolFormData } from '../../schema/school.schema';
import type { ISchoolDraft } from '../../types/schools.types';
import type { ISchool } from '@api/schoolsApi';

export function useSchoolForm(school: ISchool | null, countries: { _id: string; mobileDigits?: number }[]) {
  const { handleSubmit, control, watch, trigger, getValues, reset } = useForm<SchoolFormData>({
    resolver: async (data, context, options) => {
      const selectedCountryId = data.country;
      const selectedCountryObj = countries.find(c => c._id === selectedCountryId);
      const mobileDigits = selectedCountryObj?.mobileDigits || 10;
      const configuredResolver = yupResolver(schoolSchema, { context: { mobileDigits } });
      return configuredResolver(
        data as unknown as Parameters<typeof configuredResolver>[0],
        context,
        options as unknown as Parameters<typeof configuredResolver>[2]
      );
    },
    defaultValues: {
      adminName: '', adminEmail: '', adminPassword: '',
      name: '', code: '', subdomain: '', email: '', phone: '', countryCode: '+91', address: '',
      boardType: '60f7c223405c102c98d6c830', country: '60f7c223405c102c98d6c840', maxStudents: 500, subscriptionPlan: '60f7c223405c102c98d6c810', billingCycle: 'MONTHLY',
      state: '', district: '', pincode: undefined, admissionFee: undefined,
      shift: 'Morning Shift',
      startTime: '08:00',
      endTime: '13:00',
      settings: { attendanceEnabled: true, onlineExamEnabled: false, aiAnalyticsEnabled: false, parentAppEnabled: true }
    } as DefaultValues<SchoolFormData>
  });

  useEffect(() => {
    if (school) {
      reset({
        adminName: 'Edit Mode',
        adminEmail: school.email,
        adminPassword: 'password123',
        name: school.name,
        code: school.code,
        subdomain: school.subdomain,
        email: school.email,
        phone: school.phone,
        countryCode: school.countryCode || '+91',
        address: school.address || '',
        state: typeof school.state === 'object' ? school.state?._id : school.state || '',
        district: typeof school.district === 'object' ? school.district?._id : school.district || '',
        country: typeof school.country === 'object' ? school.country?._id : school.country || '',
        boardType: typeof school.boardType === 'object' ? school.boardType?._id : school.boardType || '',
        maxStudents: school.maxStudents,
        subscriptionPlan: typeof school.subscriptionPlan === 'object' ? school.subscriptionPlan._id : school.subscriptionPlan || '',
        billingCycle: school.billingCycle || 'MONTHLY',
        pincode: school.pincode,
        admissionFee: school.admissionFee,
        shift: school.shift || '',
        startTime: school.startTime || '',
        endTime: school.endTime || '',
        settings: {
          attendanceEnabled: school.settings?.attendanceEnabled ?? true,
          onlineExamEnabled: school.settings?.onlineExamEnabled ?? false,
          aiAnalyticsEnabled: school.settings?.aiAnalyticsEnabled ?? false,
          parentAppEnabled: school.settings?.parentAppEnabled ?? true,
        }
      } as DefaultValues<SchoolFormData>);
    }
  }, [school, reset]);

  const loadDraft = (draft: ISchoolDraft) => {
    reset({
      adminEmail: draft.adminEmail || '',
      adminName: draft.adminName || '',
      adminPassword: draft.adminPassword || '',
      name: draft.schoolDetails?.name || '',
      code: draft.schoolDetails?.code || '',
      subdomain: draft.schoolDetails?.subdomain || '',
      email: draft.schoolDetails?.email || '',
      phone: draft.schoolDetails?.phone || '',
      countryCode: draft.schoolDetails?.countryCode || '+91',
      address: draft.schoolDetails?.address || '',
      state: draft.schoolDetails?.state || '',
      district: draft.schoolDetails?.district || '',
      country: draft.schoolDetails?.country || '60f7c223405c102c98d6c840',
      boardType: draft.schoolDetails?.boardType || '60f7c223405c102c98d6c830',
      admissionFee: draft.schoolDetails?.admissionFee || undefined,
      subscriptionPlan: draft.subscriptionDetails?.subscriptionPlan || '60f7c223405c102c98d6c810',
      billingCycle: draft.subscriptionDetails?.billingCycle || 'MONTHLY',
      maxStudents: draft.subscriptionDetails?.maxStudents || 500,
      shift: draft.schoolDetails?.shift || 'Morning Shift',
      startTime: draft.schoolDetails?.startTime || '08:00',
      endTime: draft.schoolDetails?.endTime || '13:00',
      settings: draft.subscriptionDetails?.settings || {
        attendanceEnabled: true,
        onlineExamEnabled: false,
        aiAnalyticsEnabled: false,
        parentAppEnabled: true,
      }
    } as DefaultValues<SchoolFormData>);
  };

  return {
    handleSubmit,
    control,
    watch,
    trigger,
    getValues,
    reset,
    loadDraft,
  };
}

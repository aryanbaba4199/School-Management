import { baseApi } from './baseApi';
import type { MasterOption } from '../features/school-management/manage-schools/types/schools.types';
import type { ISubscriptionPlan } from '../features/app-management/plan-management/types/plans.types';
import type { PlanFormData } from '../features/app-management/plan-management/schema/plan.schema';

export const masterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<{ success: boolean; data: ISubscriptionPlan[] }, void>({
      query: () => '/masters/subscription-plans',
      providesTags: ['SubscriptionPlan'],
    }),
    getCountries: builder.query<{ success: boolean; data: MasterOption[] }, void>({
      query: () => '/masters/countries',
      providesTags: ['Country'],
    }),
    getBoardTypes: builder.query<{ success: boolean; data: MasterOption[] }, string>({
      query: (countryId) => `/masters/board-types?countryId=${countryId}`,
      providesTags: ['BoardType'],
    }),
    getStates: builder.query<{ success: boolean; data: MasterOption[] }, string>({
      query: (countryId) => `/masters/states?countryId=${countryId}`,
      providesTags: ['State'],
    }),
    getDistricts: builder.query<{ success: boolean; data: MasterOption[] }, string>({
      query: (stateId) => `/masters/districts?stateId=${stateId}`,
      providesTags: ['District'],
    }),
    createCountry: builder.mutation<{ success: boolean; data: MasterOption }, { name: string; code: string; dialCode: string; mobileDigits: number; currency: string }>({
      query: (body) => ({
        url: '/masters/countries',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Country'],
    }),
    createBoardType: builder.mutation<{ success: boolean; data: MasterOption }, { name: string; acronym: string; countryId: string }>({
      query: (body) => ({
        url: '/masters/board-types',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['BoardType'],
    }),
    createState: builder.mutation<{ success: boolean; data: MasterOption }, { name: string; code: string; countryId: string }>({
      query: (body) => ({
        url: '/masters/states',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['State'],
    }),
    createDistrict: builder.mutation<{ success: boolean; data: MasterOption }, { name: string; code: string; stateId: string }>({
      query: (body) => ({
        url: '/masters/districts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['District'],
    }),
    createSubscriptionPlan: builder.mutation<{ success: boolean; data: ISubscriptionPlan }, PlanFormData>({
      query: (body) => ({
        url: '/masters/subscription-plans',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SubscriptionPlan'],
    }),
    updateSubscriptionPlan: builder.mutation<{ success: boolean; data: ISubscriptionPlan }, { id: string; body: PlanFormData }>({
      query: ({ id, body }) => ({
        url: `/masters/subscription-plans/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['SubscriptionPlan'],
    }),
    deleteSubscriptionPlan: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/masters/subscription-plans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubscriptionPlan'],
    }),
  }),  overrideExisting: true,
});

export const {
  useGetSubscriptionPlansQuery,
  useGetCountriesQuery,
  useGetBoardTypesQuery,
  useGetStatesQuery,
  useGetDistrictsQuery,
  useCreateCountryMutation,
  useCreateBoardTypeMutation,
  useCreateStateMutation,
  useCreateDistrictMutation,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
} = masterApi;

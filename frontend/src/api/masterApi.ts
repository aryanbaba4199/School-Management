import { baseApi } from './baseApi';
import type { MasterOption } from '../features/schools/types/schools.types';
import type { ISubscriptionPlan } from '../features/plans/types/plans.types';
import type { PlanFormData } from '../features/plans/schema/plan.schema';

export const masterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<{ success: boolean; data: ISubscriptionPlan[] }, void>({
      query: () => '/masters/subscription-plans',
      providesTags: ['SubscriptionPlan'],
    }),
    getStates: builder.query<{ success: boolean; data: MasterOption[] }, void>({
      query: () => '/masters/states',
      providesTags: ['State'],
    }),
    getDistricts: builder.query<{ success: boolean; data: MasterOption[] }, string>({
      query: (stateId) => `/masters/districts?stateId=${stateId}`,
      providesTags: ['District'],
    }),
    createState: builder.mutation<{ success: boolean; data: MasterOption }, { name: string; code: string }>({
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
  }),
});

export const {
  useGetSubscriptionPlansQuery,
  useGetStatesQuery,
  useGetDistrictsQuery,
  useCreateStateMutation,
  useCreateDistrictMutation,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
} = masterApi;

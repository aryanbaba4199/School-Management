import { baseApi } from './baseApi';
import type { MasterOption } from '../features/schools/types/schools.types';

export const masterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<{ success: boolean; data: MasterOption[] }, void>({
      query: () => '/masters/subscription-plans',
    }),
    getStates: builder.query<{ success: boolean; data: MasterOption[] }, void>({
      query: () => '/masters/states',
    }),
    getDistricts: builder.query<{ success: boolean; data: MasterOption[] }, string>({
      query: (stateId) => `/masters/districts?stateId=${stateId}`,
    }),
    getCities: builder.query<{ success: boolean; data: MasterOption[] }, string>({
      query: (districtId) => `/masters/cities?districtId=${districtId}`,
    }),
  }),
});

export const {
  useGetSubscriptionPlansQuery,
  useGetStatesQuery,
  useGetDistrictsQuery,
  useGetCitiesQuery,
} = masterApi;

import { baseApi } from './baseApi';
import type { ISchool } from '../features/schools/types/schools.types';
import type { SchoolFormData } from '../features/schools/schema/school.schema';

export const schoolsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSchools: builder.query<{ success: boolean; data: ISchool[] }, void>({
      query: () => '/schools',
      providesTags: ['School'],
    }),
    createSchool: builder.mutation<{ success: boolean; data: ISchool }, SchoolFormData>({
      query: (newSchool) => ({
        url: '/schools',
        method: 'POST',
        body: newSchool,
      }),
      invalidatesTags: ['School'],
    }),
    getDraft: builder.query<{ success: boolean; data: any }, string>({
      query: (email) => `/schools/drafts/${encodeURIComponent(email)}`,
    }),
    saveDraft: builder.mutation<{ success: boolean; data: any }, any>({
      query: (draft) => ({
        url: '/schools/drafts',
        method: 'POST',
        body: draft,
      }),
    }),
  }),
});

export const { 
  useGetSchoolsQuery, 
  useCreateSchoolMutation,
  useGetDraftQuery,
  useLazyGetDraftQuery,
  useSaveDraftMutation
} = schoolsApi;

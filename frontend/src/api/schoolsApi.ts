import { baseApi } from './baseApi';
import type { ISchool, ISchoolDraft } from '../features/school-management/manage-schools/types/schools.types';
import type { SchoolFormData } from '../features/school-management/manage-schools/schema/school.schema';

export const schoolsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSchools: builder.query<{ success: boolean; data: ISchool[]; pagination: { totalPages: number; totalCount: number; currentPage: number; limit: number } }, void>({
      query: () => '/schools',
      providesTags: ['School'],
    }),
    getSchoolById: builder.query<{ success: boolean; data: ISchool }, string>({
      query: (id) => `/schools/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'School', id }],
    }),
    createSchool: builder.mutation<{ success: boolean; data: ISchool }, SchoolFormData>({
      query: (newSchool) => ({
        url: '/schools',
        method: 'POST',
        body: newSchool,
      }),
      invalidatesTags: ['School'],
    }),
    getDraft: builder.query<{ success: boolean; data: ISchoolDraft }, string>({
      query: (email) => `/schools/drafts/${encodeURIComponent(email)}`,
    }),
    saveDraft: builder.mutation<{ success: boolean; data: ISchoolDraft }, ISchoolDraft>({
      query: (draft) => ({
        url: '/schools/drafts',
        method: 'POST',
        body: draft,
      }),
    }),
    updateSchool: builder.mutation<{ success: boolean; data: ISchool }, { id: string; body: Partial<SchoolFormData> }>({
      query: ({ id, body }) => ({
        url: `/schools/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['School'],
    }),
    deactivateSchool: builder.mutation<{ success: boolean; data: ISchool }, string>({
      query: (id) => ({
        url: `/schools/${id}/deactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: ['School'],
    }),
    deleteSchool: builder.mutation<{ success: boolean; message?: string }, { id: string; passcode: string }>({
      query: ({ id, passcode }) => ({
        url: `/schools/${id}`,
        method: 'DELETE',
        body: { passcode },
      }),
      invalidatesTags: ['School'],
    }),
  }),
});

export const { 
  useGetSchoolsQuery, 
  useGetSchoolByIdQuery,
  useCreateSchoolMutation,
  useGetDraftQuery,
  useLazyGetDraftQuery,
  useSaveDraftMutation,
  useUpdateSchoolMutation,
  useDeactivateSchoolMutation,
  useDeleteSchoolMutation
} = schoolsApi;

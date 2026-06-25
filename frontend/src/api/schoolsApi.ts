import { baseApi } from './baseApi';
import type { ISchool, ISchoolDraft } from '../features/school-management/manage-schools/types/schools.types';
import type { SchoolFormData } from '../features/school-management/manage-schools/schema/school.schema';

export const schoolsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSchools: builder.query<{ success: boolean; data: ISchool[]; pagination: { totalPages: number; totalCount: number; currentPage: number; limit: number } }, { page?: number; limit?: number; search?: string } | void>({
      query: (params) => {
        if (!params) return '/schools';
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.limit) query.append('limit', params.limit.toString());
        if (params.search) query.append('search', params.search);
        const qString = query.toString();
        return `/schools${qString ? `?${qString}` : ''}`;
      },
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
      transformResponse: (response: any) => {
        if (response?.data?.data) {
          return { success: true, data: response.data.data };
        }
        return response;
      }
    }),
    saveDraft: builder.mutation<{ success: boolean; data: ISchoolDraft }, ISchoolDraft>({
      query: (draft) => {
        return {
          url: '/schools/drafts',
          method: 'POST',
          body: {
            email: draft.adminEmail || draft.schoolDetails?.email || 'draft@temp.com',
            data: draft
          },
        };
      },
      transformResponse: (response: any) => {
        if (response?.data?.data) {
          return { success: true, data: response.data.data };
        }
        return response;
      }
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
  overrideExisting: true,
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

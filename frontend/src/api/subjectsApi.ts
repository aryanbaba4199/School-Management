import { baseApi } from './baseApi';

/*------------- Subjects Interface -------------*/

export interface ISubject {
  _id: string;
  name: string;
  code: string;
  schoolId: string;
  isActive: boolean;
  teacherIds?: ({ _id: string; name: string } | string)[];
}

/*------------- RTK Query Slice Injection -------------*/

export const subjectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubjects: builder.query<{ success: boolean; data: ISubject[] }, { search?: string } | void>({
      query: (params) => ({
        url: '/subjects',
        params: params || undefined,
      }),
      providesTags: ['Subject'],
    }),
    createSubject: builder.mutation<{ success: boolean; data: ISubject }, { name: string; code: string; teacherIds?: string[]; schoolId?: string }>({
      query: (body) => ({
        url: '/subjects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subject', 'User'],
    }),
    updateSubject: builder.mutation<{ success: boolean; data: ISubject }, { id: string; body: { name: string; code: string; teacherIds?: string[]; schoolId?: string } }>({
      query: ({ id, body }) => ({
        url: `/subjects/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Subject', 'User'],
    }),
    deleteSubject: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/subjects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subject', 'User'],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectsApi;

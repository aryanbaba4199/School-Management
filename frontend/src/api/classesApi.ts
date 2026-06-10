import { baseApi } from './baseApi';

/*------------- Classes and Sections Interfaces -------------*/

export interface ISection {
  _id: string;
  name: string;
  classId: string;
  schoolId: string;
  isActive: boolean;
}

export interface IClass {
  _id: string;
  name: string;
  schoolId: string;
  isActive: boolean;
  sections: ISection[];
}

/*------------- RTK Query Slice Injection -------------*/

export const classesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClasses: builder.query<{ success: boolean; data: IClass[] }, { search?: string } | void>({
      query: (params) => ({
        url: '/classes',
        params: params || undefined,
      }),
      providesTags: ['Class'],
    }),
    createClass: builder.mutation<{ success: boolean; data: IClass }, { name: string; sections: string[]; schoolId?: string }>({
      query: (body) => ({
        url: '/classes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Class', 'Section'],
    }),
    updateClass: builder.mutation<{ success: boolean; data: IClass }, { id: string; body: { name: string; sections: string[]; schoolId?: string } }>({
      query: ({ id, body }) => ({
        url: `/classes/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Class', 'Section'],
    }),
    deleteClass: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/classes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Class', 'Section'],
    }),
    getSections: builder.query<{ success: boolean; data: ISection[] }, { classId?: string } | void>({
      query: (params) => ({
        url: '/classes/sections',
        params: params || undefined,
      }),
      providesTags: ['Section'],
    }),
  }),
});

export const {
  useGetClassesQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useGetSectionsQuery,
} = classesApi;

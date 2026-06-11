import { baseApi } from './baseApi';

/*------------- Classes and Sections Interfaces -------------*/

export interface ISection {
  _id: string;
  name: string;
  classId: string;
  schoolId: string;
  isActive: boolean;
}

export interface IPeriodSchedule {
  startTime: string;
  endTime: string;
  subjectId: string | { _id: string; name: string; code: string };
  teacherId: string | { _id: string; name: string; email: string };
}

export interface IClass {
  _id: string;
  name: string;
  schoolId: string;
  isActive: boolean;
  sections: ISection[];
  classTeacherId?: string | { _id: string; name: string; email: string };
  monthlyFee?: number;
  yearlyFee?: number;
  schedule?: IPeriodSchedule[];
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
    getClassById: builder.query<{ success: boolean; data: IClass }, string>({
      query: (id) => `/classes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Class', id }],
    }),
    createClass: builder.mutation<{ success: boolean; data: IClass }, { name: string; sections: string[]; schoolId?: string; classTeacherId?: string; monthlyFee?: number; yearlyFee?: number; schedule?: { startTime: string; endTime: string; subjectId: string; teacherId: string }[] }>({
      query: (body) => ({
        url: '/classes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Class', 'Section'],
    }),
    updateClass: builder.mutation<{ success: boolean; data: IClass }, { id: string; body: { name: string; sections: string[]; schoolId?: string; classTeacherId?: string; monthlyFee?: number; yearlyFee?: number; schedule?: { startTime: string; endTime: string; subjectId: string; teacherId: string }[] } }>({
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
  useGetClassByIdQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useGetSectionsQuery,
} = classesApi;

import { baseApi } from './baseApi';

export interface ISchoolUser {
  _id: string;
  name: string;
  email: string;
  userCode: string;
  role: {
    name: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
    access: string[];
  };
  schoolId?: string | { _id: string; name: string; code: string };
  phone?: string;
  isActive: boolean;
  address?: {
    street?: string;
    city?: { _id: string; name: string } | string;
    state?: { _id: string; name: string } | string;
    district?: { _id: string; name: string } | string;
    pincode?: number;
  };
  parentId?: { _id: string; name: string; userCode: string; email: string } | string;
  childrenIds?: ({ _id: string; name: string; userCode: string; email: string } | string)[];
  classId?: string;
  joinedClassId?: string;
  sectionId?: string;
  subjects?: ({ _id: string; name: string; code: string } | string)[];
  regDate?: string;
  startDate?: string;
  leaveDate?: string;
  feeCycle?: 'MONTHLY' | 'YEARLY';
  walletBal?: number;
  createdAt: string;
  updatedAt: string;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<{ success: boolean; data: ISchoolUser[]; pagination: { totalPages: number; totalCount: number; currentPage: number; limit: number } }, { role?: string; page?: number; limit?: number; classId?: string; sectionId?: string; schoolId?: string } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.role) queryParams.append('role', params.role);
        if (params?.page) queryParams.append('page', String(params.page));
        if (params?.limit) queryParams.append('limit', String(params.limit));
        if (params?.classId) queryParams.append('classId', params.classId);
        if (params?.sectionId) queryParams.append('sectionId', params.sectionId);
        if (params?.schoolId) queryParams.append('schoolId', params.schoolId);
        const queryString = queryParams.toString();
        return `/users${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['User'],
    }),
    getUserById: builder.query<{ success: boolean; data: ISchoolUser }, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),
    createUser: builder.mutation<{ success: boolean; data: ISchoolUser }, Partial<ISchoolUser> & { password?: string }>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<{ success: boolean; data: ISchoolUser }, { id: string; body: Partial<ISchoolUser> & { password?: string } }>({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    toggleUserStatus: builder.mutation<{ success: boolean; data: ISchoolUser }, string>({
      query: (id) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<{ success: boolean; data: null }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useToggleUserStatusMutation,
  useDeleteUserMutation,
} = usersApi;

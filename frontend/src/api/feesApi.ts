import { baseApi } from './baseApi';

export interface IFeeInvoice {
  _id: string;
  studentId: string;
  schoolId: string;
  classId: string;
  amount: number;
  type: 'ADMISSION' | 'MONTHLY' | 'YEARLY' | 'EXAMINATION' | 'OTHER';
  month?: number;
  year: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface FeesResponse {
  success: boolean;
  data: IFeeInvoice[];
}

export const feesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllTransactions: builder.query<FeesResponse, void>({
      query: () => '/fees/transactions',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Fee' as const, id: _id })),
              { type: 'Fee', id: 'LIST' },
            ]
          : [{ type: 'Fee', id: 'LIST' }],
    }),
    getStudentFees: builder.query<FeesResponse, string>({
      query: (studentId) => `/fees/student/${studentId}`,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Fee' as const, id: _id })),
              { type: 'Fee', id: 'LIST' },
            ]
          : [{ type: 'Fee', id: 'LIST' }],
    }),
    payFee: builder.mutation<{ success: boolean; data: IFeeInvoice }, string>({
      query: (id) => ({
        url: `/fees/${id}/pay`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Fee', id }],
    }),
    markFeeDue: builder.mutation<{ success: boolean; data: IFeeInvoice }, string>({
      query: (id) => ({
        url: `/fees/${id}/mark-due`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Fee', id }, { type: 'Fee', id: 'LIST' }],
    }),
    generateGlobalFees: builder.mutation<{ success: boolean; count: number; message: string }, { classId?: string; type: 'MONTHLY' | 'ADMISSION'; month?: number; year: number }>({
      query: (body) => ({
        url: '/fees/generate-bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Fee', id: 'LIST' }],
    }),
  }),
});

export const { useGetStudentFeesQuery, useGetAllTransactionsQuery, usePayFeeMutation, useMarkFeeDueMutation, useGenerateGlobalFeesMutation } = feesApi;

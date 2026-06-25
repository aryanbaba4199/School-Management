import { baseApi } from './baseApi';
import type { 
  IAttendanceRecord, 
  BulkMarkStudentAttendanceDto, 
  GetStudentAttendanceQueryDto,
  IAttendanceSettings,
  IRfidCard,
  CreateRfidCardDto,
  DailyAttendanceReport,
  BulkMarkTeacherAttendanceDto,
  MonthlyReportResponse,
  CreateCorrectionRequestDto,
  ResolveCorrectionRequestDto,
  UpdateStudentAttendanceDto,
  UpdateTeacherAttendanceDto,
  IAttendanceCorrectionRequest
} from '../features/attendance/types/attendance.types';

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentAttendance: builder.query<IAttendanceRecord[], GetStudentAttendanceQueryDto>({
      query: (params) => ({
        url: '/attendance/students',
        method: 'GET',
        params,
      }),
      transformResponse: (response: { data: IAttendanceRecord[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Attendance' as const, id: _id })),
              { type: 'Attendance', id: 'LIST' },
            ]
          : [{ type: 'Attendance', id: 'LIST' }],
    }),
    bulkMarkStudentAttendance: builder.mutation<{ modifiedCount: number; upsertedCount: number }, BulkMarkStudentAttendanceDto>({
      query: (body) => ({
        url: '/attendance/students/bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'LIST' }],
    }),
    
    getTeacherAttendance: builder.query<IAttendanceRecord[], { date?: string; schoolId?: string }>({
      query: (params) => ({
        url: '/attendance/teachers',
        method: 'GET',
        params,
      }),
      transformResponse: (response: { data: IAttendanceRecord[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Attendance' as const, id: _id })),
              { type: 'Attendance', id: 'LIST' },
            ]
          : [{ type: 'Attendance', id: 'LIST' }],
    }),
    bulkMarkTeacherAttendance: builder.mutation<{ modifiedCount: number; upsertedCount: number }, BulkMarkTeacherAttendanceDto>({
      query: (body) => ({
        url: '/attendance/teachers/bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'LIST' }],
    }),

    getAttendanceSettings: builder.query<IAttendanceSettings, { schoolId?: string } | void>({
      query: (params) => ({
        url: '/attendance/settings',
        method: 'GET',
        params: params || undefined,
      }),
      transformResponse: (response: { data: IAttendanceSettings }) => response.data,
      providesTags: ['AttendanceSettings'],
    }),
    updateAttendanceSettings: builder.mutation<IAttendanceSettings, Partial<IAttendanceSettings> & { schoolId?: string }>({
      query: (body) => ({
        url: '/attendance/settings',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AttendanceSettings'],
    }),

    getRfidCards: builder.query<IRfidCard[], { schoolId?: string } | void>({
      query: (params) => ({
        url: '/attendance/rfid/cards',
        method: 'GET',
        params: params || undefined,
      }),
      transformResponse: (response: { data: IRfidCard[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'RfidCard' as const, id: _id })),
              { type: 'RfidCard', id: 'LIST' },
            ]
          : [{ type: 'RfidCard', id: 'LIST' }],
    }),
    createRfidCard: builder.mutation<IRfidCard, CreateRfidCardDto>({
      query: (body) => ({
        url: '/attendance/rfid/cards',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'RfidCard', id: 'LIST' }],
    }),
    updateRfidCard: builder.mutation<IRfidCard, { id: string; isActive: boolean; schoolId?: string }>({
      query: ({ id, isActive, schoolId }) => ({
        url: `/attendance/rfid/cards/${id}`,
        method: 'PUT',
        body: { isActive, schoolId },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'RfidCard', id }, { type: 'RfidCard', id: 'LIST' }],
    }),
    deleteRfidCard: builder.mutation<IRfidCard, { id: string; schoolId?: string }>({
      query: ({ id, schoolId }) => ({
        url: `/attendance/rfid/cards/${id}`,
        method: 'DELETE',
        params: schoolId ? { schoolId } : undefined,
      }),
      invalidatesTags: [{ type: 'RfidCard', id: 'LIST' }],
    }),
    scanRfid: builder.mutation<IAttendanceRecord, { cardUid: string; timestamp?: string; schoolId?: string }>({
      query: (body) => ({
        url: '/attendance/rfid/scan',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'LIST' }],
    }),

    getDailyReport: builder.query<DailyAttendanceReport, { date?: string; personType?: 'STUDENT' | 'TEACHER'; schoolId?: string }>({
      query: (params) => ({
        url: '/attendance/reports/daily',
        method: 'GET',
        params,
      }),
      transformResponse: (response: { data: DailyAttendanceReport }) => response.data,
      providesTags: [{ type: 'Attendance', id: 'LIST' }],
    }),
    getMonthlyReport: builder.query<MonthlyReportResponse, { year: number; month: number; classId?: string; sectionId?: string; personType?: 'STUDENT' | 'TEACHER'; schoolId?: string }>({
      query: (params) => ({
        url: '/attendance/reports/monthly',
        method: 'GET',
        params,
      }),
      transformResponse: (response: { data: MonthlyReportResponse }) => response.data,
      providesTags: [{ type: 'Attendance', id: 'LIST' }],
    }),

    // Single record update endpoints
    updateStudentAttendance: builder.mutation<IAttendanceRecord, { id: string; body: UpdateStudentAttendanceDto }>({
      query: ({ id, body }) => ({
        url: `/attendance/students/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'LIST' }],
    }),
    updateTeacherAttendance: builder.mutation<IAttendanceRecord, { id: string; body: UpdateTeacherAttendanceDto }>({
      query: ({ id, body }) => ({
        url: `/attendance/teachers/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'LIST' }],
    }),

    // Correction Request endpoints
    createCorrectionRequest: builder.mutation<IAttendanceCorrectionRequest, CreateCorrectionRequestDto>({
      query: (body) => ({
        url: '/attendance/corrections',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'LIST' }],
    }),
    getPendingCorrectionRequests: builder.query<IAttendanceCorrectionRequest[], { schoolId?: string } | void>({
      query: (params) => ({
        url: '/attendance/corrections/pending',
        method: 'GET',
        params: params || undefined,
      }),
      transformResponse: (response: { data: IAttendanceCorrectionRequest[] }) => response.data,
      providesTags: [{ type: 'Attendance', id: 'LIST' }],
    }),
    resolveCorrectionRequest: builder.mutation<IAttendanceCorrectionRequest, { id: string; body: ResolveCorrectionRequestDto }>({
      query: ({ id, body }) => ({
        url: `/attendance/corrections/${id}/resolve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'LIST' }],
    }),
  }),  overrideExisting: true,
});

export const {
  useGetStudentAttendanceQuery,
  useBulkMarkStudentAttendanceMutation,
  useGetTeacherAttendanceQuery,
  useBulkMarkTeacherAttendanceMutation,
  useGetAttendanceSettingsQuery,
  useUpdateAttendanceSettingsMutation,
  useGetRfidCardsQuery,
  useCreateRfidCardMutation,
  useUpdateRfidCardMutation,
  useDeleteRfidCardMutation,
  useScanRfidMutation,
  useGetDailyReportQuery,
  useGetMonthlyReportQuery,
  useUpdateStudentAttendanceMutation,
  useUpdateTeacherAttendanceMutation,
  useCreateCorrectionRequestMutation,
  useGetPendingCorrectionRequestsQuery,
  useResolveCorrectionRequestMutation,
} = attendanceApi;

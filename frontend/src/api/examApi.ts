import { baseApi } from './baseApi';

export interface IExam {
  _id: string;
  name: string;
  academicYear: string;
  term: 'MONTHLY' | 'QUARTERLY' | 'MID_TERM' | 'FINAL';
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED';
  createdBy?: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface ExamsResponse {
  success: boolean;
  data: IExam[];
}

export interface ExamResponse {
  success: boolean;
  data: IExam;
}

export interface CreateExamDto {
  name: string;
  academicYear: string;
  term: 'MONTHLY' | 'QUARTERLY' | 'MID_TERM' | 'FINAL';
  startDate: string;
  endDate: string;
  status?: 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED';
}

export interface IExamSchedule {
  _id: string;
  examId: string;
  classId: { _id: string; name: string };
  sectionId: { _id: string; name: string };
  subjectId: { _id: string; name: string; code: string };
  examDate: string;
  startTime: string;
  endTime: string;
  room?: string;
  maxMarks: number;
  passMarks: number;
}

export interface IStudentExamMark {
  _id: string;
  examScheduleId: string;
  studentId: { _id: string; name: string; userCode: string };
  subjectId: { _id: string; name: string; code: string };
  obtainedMarks?: number;
  maxMarks: number;
  remarks?: string;
  attendanceStatus: 'PRESENT' | 'ABSENT';
}

export interface IReportCard {
  _id: string;
  examId: { _id: string; name: string; academicYear: string; term: string };
  studentId: { _id: string; name: string; userCode: string; profilePicture?: string };
  classId: { _id: string; name: string };
  sectionId: { _id: string; name: string };
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade?: string;
  rank?: number;
  result: 'PASS' | 'FAIL';
  generatedAt: string;
}

export const examApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExams: builder.query<ExamsResponse, void>({
      query: () => '/exams',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Exam' as const, id: _id })),
              { type: 'Exam', id: 'LIST' },
            ]
          : [{ type: 'Exam', id: 'LIST' }],
    }),
    createExam: builder.mutation<ExamResponse, CreateExamDto>({
      query: (data) => ({
        url: '/exams',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Exam', id: 'LIST' }],
    }),
    updateExam: builder.mutation<ExamResponse, { id: string; body: Partial<CreateExamDto> }>({
      query: ({ id, body }) => ({
        url: `/exams/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'Exam', id: 'LIST' }],
    }),
    getExamSchedules: builder.query<{ success: boolean; data: IExamSchedule[] }, { examId: string; classId?: string; sectionId?: string }>({
      query: (params) => ({
        url: '/exams/schedules',
        params,
      }),
      providesTags: ['ExamSchedule'],
    }),
    createExamSchedule: builder.mutation<{ success: boolean; data: IExamSchedule }, Partial<IExamSchedule>>({
      query: (body) => ({
        url: '/exams/schedules',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ExamSchedule'],
    }),
    updateExamSchedule: builder.mutation<{ success: boolean; data: IExamSchedule }, { id: string; body: Partial<IExamSchedule> }>({
      query: ({ id, body }) => ({
        url: `/exams/schedules/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ExamSchedule'],
    }),
    getStudentMarks: builder.query<{ success: boolean; data: IStudentExamMark[] }, { examId?: string; studentId?: string; examScheduleId?: string; classId?: string; sectionId?: string }>({
      query: (params) => ({
        url: '/exams/marks',
        params,
      }),
      providesTags: ['StudentExamMark'],
    }),
    saveStudentMarks: builder.mutation<{ success: boolean }, { examId: string; examScheduleId: string; classId: string; sectionId: string; subjectId: string; maxMarks: number; marksData: unknown[] }>({
      query: (data) => ({
        url: '/exams/marks',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['StudentExamMark', 'ReportCard'],
    }),
    generateResults: builder.mutation<{ success: boolean; message: string }, { examId: string; classId: string; sectionId: string }>({
      query: (body) => ({
        url: '/exams/results/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ReportCard'],
    }),
    getReportCards: builder.query<{ success: boolean; data: IReportCard[] }, { examId: string; classId: string; sectionId: string }>({
      query: (params) => ({
        url: '/exams/results',
        params,
      }),
      providesTags: ['ReportCard'],
    }),
  }),
});

export const { 
  useGetExamsQuery, 
  useCreateExamMutation,
  useUpdateExamMutation,
  useGetExamSchedulesQuery,
  useCreateExamScheduleMutation,
  useUpdateExamScheduleMutation,
  useGetStudentMarksQuery,
  useSaveStudentMarksMutation,
  useGenerateResultsMutation,
  useGetReportCardsQuery
} = examApi;

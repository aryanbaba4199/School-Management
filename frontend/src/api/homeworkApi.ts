import { baseApi } from './baseApi';
import type { IFileAttachment } from '../common/components/AttachmentList';

export interface IHomework {
  _id: string;
  schoolId: string;
  classId: string | { _id: string; name: string };
  sectionId: string | { _id: string; name: string };
  subjectId: string | { _id: string; name: string };
  teacherId: string | { _id: string; profile: { firstName: string; lastName: string } };
  title: string;
  description: string;
  dueDate: string;
  attachments: IFileAttachment[];
  maxMarks?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IHomeworkSubmission {
  _id: string;
  schoolId: string;
  homeworkId: string | IHomework;
  studentId: string | { _id: string; profile: { firstName: string; lastName: string; admissionNumber: string } };
  submissionDate?: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE' | 'CORRECTION_REQUIRED';
  attachments: IFileAttachment[];
  studentNotes?: string;
  teacherFeedback?: string;
  obtainedMarks?: number;
  gradedBy?: string | { _id: string; profile: { firstName: string; lastName: string } };
  gradedAt?: string;
}

export interface HomeworkListResponse {
  success: boolean;
  data: {
    homeworks: IHomework[];
    totalCount: number;
  };
}

export interface SubmissionListResponse {
  success: boolean;
  data: IHomeworkSubmission[];
}

export interface SingleHomeworkResponse {
  success: boolean;
  data: IHomework;
}

export interface SingleSubmissionResponse {
  success: boolean;
  data: IHomeworkSubmission;
}

export const homeworkApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Teacher / Admin: Create Homework
    createHomework: builder.mutation<SingleHomeworkResponse, Partial<IHomework>>({
      query: (body) => ({
        url: '/homework',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Homework'],
    }),

    // Teacher / Admin: List Homework
    getHomeworks: builder.query<
      HomeworkListResponse,
      { page?: number; limit?: number; classId?: string; sectionId?: string; subjectId?: string; teacherId?: string }
    >({
      query: (params) => ({
        url: '/homework',
        method: 'GET',
        params,
      }),
      providesTags: ['Homework'],
    }),

    // Get specific Homework details
    getHomeworkById: builder.query<SingleHomeworkResponse, string>({
      query: (id) => ({
        url: `/homework/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'Homework', id }],
    }),

    // Teacher / Admin: Delete Homework
    deleteHomework: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/homework/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Homework'],
    }),

    // Student: Get their dashboard/assignments
    getStudentDashboard: builder.query<SubmissionListResponse, void>({
      query: () => ({
        url: '/homework/student/dashboard',
        method: 'GET',
      }),
      providesTags: ['HomeworkSubmission'],
    }),

    // Student: Submit Homework
    submitHomework: builder.mutation<SingleSubmissionResponse, { homeworkId: string; data: { studentNotes?: string; attachments: IFileAttachment[] } }>({
      query: ({ homeworkId, data }) => ({
        url: `/homework/${homeworkId}/submit`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['HomeworkSubmission'],
    }),

    // Teacher: List Submissions for a specific Homework
    getHomeworkSubmissions: builder.query<SubmissionListResponse, string>({
      query: (homeworkId) => ({
        url: `/homework/${homeworkId}/submissions`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'HomeworkSubmission', id }],
    }),

    // Teacher: Grade a Submission
    gradeSubmission: builder.mutation<SingleSubmissionResponse, { submissionId: string; data: { obtainedMarks: number; teacherFeedback: string; status: 'GRADED' | 'CORRECTION_REQUIRED' } }>({
      query: ({ submissionId, data }) => ({
        url: `/homework/submissions/${submissionId}/grade`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { submissionId }) => [{ type: 'HomeworkSubmission', id: submissionId }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateHomeworkMutation,
  useGetHomeworksQuery,
  useGetHomeworkByIdQuery,
  useDeleteHomeworkMutation,
  useGetStudentDashboardQuery,
  useSubmitHomeworkMutation,
  useGetHomeworkSubmissionsQuery,
  useGradeSubmissionMutation,
} = homeworkApi;

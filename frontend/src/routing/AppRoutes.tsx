import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../common/hooks/useAuth';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { SchoolsPage } from '../features/school-management/manage-schools';
import { SchoolSettingsPage } from '../features/school-management/manage-schools/pages/SchoolSettingsPage';
import { ClassesPage } from '../features/school-management/classes';
import { SubjectsPage } from '../features/school-management/subjects';
import { PlansPage } from '../features/app-management/plan-management/pages/PlansPage';
import { StudentsPage } from '../features/users/students';
import { TeachersPage } from '../features/users/teachers';
import { ParentsPage } from '../features/users/parents';
import { SchoolAdminsPage } from '../features/users/school-admins/pages/SchoolAdminsPage';
import { ProfilePage } from '../features/users/profile/pages/ProfilePage';
import { FeesPage } from '../features/account-management/fees';
import { FeeDetailsPage } from '../features/account-management/fees/pages/FeeDetailsPage';
import { TransactionsPage } from '../features/account-management/transactions';
import { PaymentsPage } from '../features/account-management/payments';
import { ReceiptsPage } from '../features/account-management/receipts';
import { ExamMasterPage, ExamResultsPage, WeeklyTestsPage, QuestionPapersPage } from '../features/exams';
import { ExamDetailsPage } from '../features/exams/pages/ExamDetailsPage';
import { PrintReportCardPage } from '../features/exams/pages/PrintReportCardPage';
import { MainLayout } from '@common/navbar';
import { StudentAttendancePage, TeacherAttendancePage, RfidAttendancePage, AttendanceReportsPage, AttendanceSettingsPage } from '../features/attendance';
import { HomeworkPage, AssignmentsPage } from '../features/homework-management';
import { AnnouncementsPage, AlertsPage, NotificationsPage } from '../features/communication';
import { ClassTimetablePage, TeacherTimetablePage } from '../features/timetable';
import { RecommendationsPage, VideosPage, QuizzesPage, PracticePage } from '../features/learning';
import { WeaknessDetectionPage, AiAssistantPage, OcrEvaluationPage, SimulationLabsPage, SmartClassroomPage } from '../features/ai-learning';
import { SupportPage } from '../features/support';
import { AnalyticsPage } from '../features/analytics';
import { GlobalSettingsPage, RegionalLanguagesPage } from '../features/settings';

export function AppRoutes() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role.name === 'SUPER_ADMIN';
  const isSchoolAdmin = user?.role.name === 'SCHOOL_ADMIN';
  const isTeacher = user?.role.name === 'TEACHER';
  const isStudent = user?.role.name === 'STUDENT';
  const isParent = user?.role.name === 'PARENT';
  const isSchoolStaff = isSuperAdmin || isSchoolAdmin;
  const canUseExams = isSuperAdmin || isSchoolAdmin || isTeacher || isStudent || isParent;
  const canUseLearning = isSchoolAdmin || isTeacher || isStudent || isParent;

  // If user is not authenticated, display the split login page
  if (!user) {
    return <LoginPage />;
  }

  // If authenticated, display the main School OS dashboard page within MainLayout
  return (
    <Routes>
      <Route path="/print/report-card" element={<PrintReportCardPage />} />
      <Route path="*" element={
        <MainLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
        <Route
          path="/school-management/manage-schools"
          element={user.role.name === 'SUPER_ADMIN' ? <SchoolsPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/settings/school-profile"
          element={user.role.name === 'SCHOOL_ADMIN' ? <SchoolSettingsPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/school-management/classes"
          element={
            user.role.name === 'SUPER_ADMIN' || user.role.name === 'SCHOOL_ADMIN'
              ? <ClassesPage />
              : <Navigate to="/" replace />
          }
        />
        <Route
          path="/school-management/subjects"
          element={
            user.role.name === 'SUPER_ADMIN' || user.role.name === 'SCHOOL_ADMIN'
              ? <SubjectsPage />
              : <Navigate to="/" replace />
          }
        />
        <Route
          path="/app-management/plans"
          element={user.role.name === 'SUPER_ADMIN' ? <PlansPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/app-management/support"
          element={isSuperAdmin ? <SupportPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/app-management/analytics"
          element={isSuperAdmin ? <AnalyticsPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/app-management/settings"
          element={isSuperAdmin ? <GlobalSettingsPage /> : <Navigate to="/" replace />}
        />
        <Route path="/user-management/school-admins" element={isSuperAdmin ? <SchoolAdminsPage /> : <Navigate to="/" replace />} />
        <Route path="/user-management/students" element={isSchoolStaff ? <StudentsPage /> : <Navigate to="/" replace />} />
        <Route path="/user-management/teachers" element={isSchoolStaff ? <TeachersPage /> : <Navigate to="/" replace />} />
        <Route path="/user-management/parents" element={isSchoolStaff ? <ParentsPage /> : <Navigate to="/" replace />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/attendance/students" element={<StudentAttendancePage />} />
        <Route
          path="/attendance/teachers"
          element={isSuperAdmin || isSchoolAdmin || isTeacher ? <TeacherAttendancePage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/attendance/rfid"
          element={isSchoolStaff ? <RfidAttendancePage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/attendance/reports"
          element={isSuperAdmin || isSchoolAdmin || isTeacher || isParent ? <AttendanceReportsPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/attendance/settings"
          element={isSchoolStaff ? <AttendanceSettingsPage /> : <Navigate to="/" replace />}
        />
        <Route path="/attendance" element={<Navigate to="/attendance/students" replace />} />
        <Route
          path="/homework"
          element={isSchoolAdmin || isTeacher || isStudent || isParent ? <HomeworkPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/homework/assignments"
          element={isSchoolAdmin || isTeacher || isStudent || isParent ? <AssignmentsPage /> : <Navigate to="/" replace />}
        />
        <Route path="/communication/announcements" element={<AnnouncementsPage />} />
        <Route
          path="/communication/alerts"
          element={isSchoolAdmin || isTeacher || isParent ? <AlertsPage /> : <Navigate to="/" replace />}
        />
        <Route path="/communication/notifications" element={<NotificationsPage />} />
        <Route
          path="/timetable/classes"
          element={canUseExams ? <ClassTimetablePage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/timetable/teachers"
          element={isSuperAdmin || isSchoolAdmin || isTeacher ? <TeacherTimetablePage /> : <Navigate to="/" replace />}
        />
        <Route path="/account-management/fees" element={
          user.role.name === 'SUPER_ADMIN' || user.role.name === 'SCHOOL_ADMIN' 
            ? <FeesPage /> 
            : <Navigate to="/" replace />
        } />
        <Route path="/account-management/fees/:id" element={
          user.role.name === 'SUPER_ADMIN' || user.role.name === 'SCHOOL_ADMIN' 
            ? <FeeDetailsPage /> 
            : <Navigate to="/" replace />
        } />
        <Route path="/account-management/payments" element={
          isSuperAdmin || isSchoolAdmin || isParent
            ? <PaymentsPage /> 
            : <Navigate to="/" replace />
        } />
        <Route path="/account-management/receipts" element={
          isSuperAdmin || isSchoolAdmin || isParent
            ? <ReceiptsPage /> 
            : <Navigate to="/" replace />
        } />
        <Route path="/account-management/transactions" element={
          user.role.name === 'SUPER_ADMIN' || user.role.name === 'SCHOOL_ADMIN' 
            ? <TransactionsPage /> 
            : <Navigate to="/" replace />
        } />
        <Route path="/exams/results" element={
          canUseExams ? <ExamResultsPage /> : <Navigate to="/" replace />
        } />
        <Route path="/exams/weekly-tests" element={
          isSchoolAdmin || isTeacher || isStudent ? <WeeklyTestsPage /> : <Navigate to="/" replace />
        } />
        <Route path="/exams/question-papers" element={
          isSchoolAdmin || isTeacher ? <QuestionPapersPage /> : <Navigate to="/" replace />
        } />
        <Route path="/exams" element={
          ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'].includes(user.role.name)
            ? <ExamMasterPage /> 
            : <Navigate to="/" replace />
        } />
        <Route path="/exams/:id" element={
          ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'].includes(user.role.name)
            ? <ExamDetailsPage /> 
            : <Navigate to="/" replace />
        } />
        <Route path="/learning/recommendations" element={
          canUseLearning ? <RecommendationsPage /> : <Navigate to="/" replace />
        } />
        <Route path="/learning/videos" element={
          isTeacher || isStudent || isParent ? <VideosPage /> : <Navigate to="/" replace />
        } />
        <Route path="/learning/quizzes" element={
          isTeacher || isStudent ? <QuizzesPage /> : <Navigate to="/" replace />
        } />
        <Route path="/learning/practice" element={
          isStudent || isParent ? <PracticePage /> : <Navigate to="/" replace />
        } />
        <Route path="/ai-learning/weakness-detection" element={
          canUseLearning ? <WeaknessDetectionPage /> : <Navigate to="/" replace />
        } />
        <Route path="/ai-learning/assistant" element={
          isTeacher || isStudent || isParent ? <AiAssistantPage /> : <Navigate to="/" replace />
        } />
        <Route path="/ai-learning/ocr-evaluation" element={
          isSuperAdmin || isSchoolAdmin || isTeacher ? <OcrEvaluationPage /> : <Navigate to="/" replace />
        } />
        <Route path="/ai-learning/simulations" element={
          isSchoolAdmin || isTeacher || isStudent ? <SimulationLabsPage /> : <Navigate to="/" replace />
        } />
        <Route path="/ai-learning/smart-classroom" element={
          isSchoolAdmin || isTeacher ? <SmartClassroomPage /> : <Navigate to="/" replace />
        } />
        <Route path="/settings/languages" element={
          isSchoolStaff ? <RegionalLanguagesPage /> : <Navigate to="/" replace />
        } />
        <Route path="/support" element={
          isSchoolAdmin || isTeacher || isStudent || isParent ? <SupportPage /> : <Navigate to="/" replace />
        } />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      } />
    </Routes>
  );
}

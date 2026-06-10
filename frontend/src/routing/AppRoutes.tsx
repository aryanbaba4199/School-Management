import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../common/hooks/useAuth';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { SchoolsPage, SchoolDetailsPage } from '../features/school-management/manage-schools';
import { ClassesPage, ClassDetailsPage } from '../features/school-management/classes';
import { SubjectsPage } from '../features/school-management/subjects';
import { PlansPage } from '../features/app-management/plan-management/pages/PlansPage';
import { StudentsPage } from '../features/users/students';
import { TeachersPage, TeacherDetailsPage } from '../features/users/teachers';
import { ParentsPage } from '../features/users/parents';
import { MainLayout } from '@common/navbar';

export function AppRoutes() {
  const { user } = useAuth();

  // If user is not authenticated, display the split login page
  if (!user) {
    return <LoginPage />;
  }

  // If authenticated, display the main School OS dashboard page within MainLayout
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route
          path="/school-management/manage-schools"
          element={user.role.name === 'SUPER_ADMIN' ? <SchoolsPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/school-management/manage-schools/:id"
          element={user.role.name === 'SUPER_ADMIN' ? <SchoolDetailsPage /> : <Navigate to="/" replace />}
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
          path="/school-management/classes/:id"
          element={
            user.role.name === 'SUPER_ADMIN' || user.role.name === 'SCHOOL_ADMIN'
              ? <ClassDetailsPage />
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
        <Route path="/user-management/students" element={<StudentsPage />} />
        <Route path="/user-management/teachers" element={<TeachersPage />} />
        <Route path="/user-management/teachers/:id" element={<TeacherDetailsPage />} />
        <Route path="/user-management/parents" element={<ParentsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

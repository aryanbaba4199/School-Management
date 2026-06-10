import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../common/hooks/useAuth';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { SchoolsPage } from '../features/school-management/manage-schools';
import { ClassesPage } from '../features/school-management/classes';
import { SubjectsPage } from '../features/school-management/subjects';
import { PlansPage } from '../features/app-management/plan-management/pages/PlansPage';
import { StudentsPage } from '../features/users/students';
import { TeachersPage } from '../features/users/teachers';
import { ParentsPage } from '../features/users/parents';
import { FeesPage } from '../features/account-management/fees';
import { TransactionsPage } from '../features/account-management/transactions';
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
        <Route path="/user-management/students" element={<StudentsPage />} />
        <Route path="/user-management/teachers" element={<TeachersPage />} />
        <Route path="/user-management/parents" element={<ParentsPage />} />
        <Route path="/account-management/fees" element={
          user.role.name === 'SUPER_ADMIN' || user.role.name === 'SCHOOL_ADMIN' 
            ? <FeesPage /> 
            : <Navigate to="/" replace />
        } />
        <Route path="/account-management/transactions" element={
          user.role.name === 'SUPER_ADMIN' || user.role.name === 'SCHOOL_ADMIN' 
            ? <TransactionsPage /> 
            : <Navigate to="/" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

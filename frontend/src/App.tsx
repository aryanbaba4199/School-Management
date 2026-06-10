import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './api/store';
import { AuthProvider, useAuth } from './common/hooks/useAuth';
import { ACLProvider } from './common/ACL/ACLProvider';
import { NotifierProvider } from './common/Notifier/NotifierProvider';
import { DialogProvider } from './common/Dialogs/dialog.provider';
import { LoginPage } from './features/auth/pages/LoginPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { SchoolsPage, SchoolDetailsPage } from './features/schools';
import { PlansPage } from './features/app-management/plan-management/pages/PlansPage';
import { MainLayout } from '@common/navbar';

/*------------- Conditional App Shell -------------*/

function AppContent() {
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
        <Route path="/schools" element={<SchoolsPage />} />
        <Route path="/schools/:id" element={<SchoolDetailsPage />} />
        <Route path="/app-management/plans" element={user.role.name === 'SUPER_ADMIN' ? <PlansPage /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

/*------------- Providers Wrapper -------------*/

function AuthDependentProviders({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <ACLProvider userRole={user?.role?.name || null} accessList={user?.role?.access || []}>
      <NotifierProvider>
        <DialogProvider>
          {children}
        </DialogProvider>
      </NotifierProvider>
    </ACLProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <AuthDependentProviders>
            <AppContent />
          </AuthDependentProviders>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
}

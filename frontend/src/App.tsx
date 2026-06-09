import { AuthProvider, useAuth } from './common/hooks/useAuth';
import { ACLProvider } from './common/ACL/ACLProvider';
import { NotifierProvider } from './common/Notifier/NotifierProvider';
import { DialogProvider } from './common/Dialogs/dialog.provider';
import { LoginPage } from './features/auth/pages/LoginPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
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
      <DashboardPage />
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
    <AuthProvider>
      <AuthDependentProviders>
        <AppContent />
      </AuthDependentProviders>
    </AuthProvider>
  );
}

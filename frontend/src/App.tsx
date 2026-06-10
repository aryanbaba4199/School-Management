import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './api/store';
import { AuthProvider, useAuth } from './common/hooks/useAuth';
import { ACLProvider } from './common/ACL/ACLProvider';
import { NotifierProvider } from './common/Notifier/NotifierProvider';
import { DialogProvider } from './common/Dialogs/dialog.provider';
import { AppRoutes } from './routing';

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
            <AppRoutes />
          </AuthDependentProviders>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
}

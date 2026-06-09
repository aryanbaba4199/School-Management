import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';
import { AppThemeProvider } from './features/themes/components/AppThemeProvider';

/*------------- Global Fetch Stub -------------*/

const fetchStub = vi.fn((_url: string, options?: RequestInit) => {
  try {
    const body = options?.body ? JSON.parse(options.body as string) : {};
    const email = body.email || 'superadmin@schoolos.com';
    const roleName = email.includes('admin') ? 'SUPER_ADMIN' : email.includes('teacher') ? 'TEACHER' : 'STUDENT';
    const label = email.includes('admin') ? 'Admin' : email.includes('teacher') ? 'Teacher' : 'Student';

    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: {
            _id: 'mock-user-id',
            name: `Demo ${label}`,
            email: email,
            userCode: roleName === 'SUPER_ADMIN' ? 'SA-01' : roleName === 'TEACHER' ? 'T-202' : 'ST-505',
            role: { name: roleName, access: roleName === 'SUPER_ADMIN' ? ['ALL'] : ['READ'] },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }
      })
    } as Response);
  } catch (error) {
    return Promise.reject(error);
  }
});

vi.stubGlobal('fetch', fetchStub);

/*------------- Integration Tests -------------*/

describe('App Authentication and Dashboard Lifecycle', () => {
  beforeEach(() => {
    localStorage.clear();
    fetchStub.mockClear();
  });

  it('renders login page by default and allows logging in via Admin demo credentials', async () => {
    render(
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    );

    // 1. Verify Login Page is rendered
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Access your school management dashboard')).toBeInTheDocument();
    expect(screen.queryByText('School OS Ecosystem')).not.toBeInTheDocument();
    expect(screen.queryByText('Schools Management')).not.toBeInTheDocument();

    // 2. Select Admin demo login
    const adminDemoChip = screen.getByText('Admin');
    fireEvent.click(adminDemoChip);

    // Verify input gets filled
    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
    expect(emailInput.value).toBe('superadmin@schoolos.com');

    // 3. Submit the Login form
    const loginButton = screen.getByRole('button', { name: 'Log In' });
    fireEvent.click(loginButton);

    // 4. Verify transition to Dashboard
    await waitFor(() => {
      expect(screen.getByText('School OS Ecosystem')).toBeInTheDocument();
    });

    expect(screen.getByText('Welcome to Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('profile-user')).toHaveTextContent('Demo Admin (SUPER_ADMIN)');
    expect(screen.getByText('Admin Control Panel')).toBeInTheDocument();

    // 5. Test Logout functionality
    const avatarBtn = screen.getByTestId('avatar-menu-button');
    fireEvent.click(avatarBtn);

    const logoutItem = screen.getByTestId('logout-menu-item');
    fireEvent.click(logoutItem);

    // Verify redirected back to Login
    await waitFor(() => {
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
    expect(screen.queryByText('School OS Ecosystem')).not.toBeInTheDocument();
  });
});

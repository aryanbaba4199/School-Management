import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import { AppThemeProvider } from '../features/themes/components/AppThemeProvider';
import { store } from '../api/store';
import { baseApi } from '../api/baseApi';
import { fetchStub, resetMockSchools } from './mockFetch';

describe('App Authentication and Dashboard Lifecycle', () => {
  beforeEach(() => {
    localStorage.clear();
    fetchStub.mockClear();
    resetMockSchools();
    store.dispatch(baseApi.util.resetApiState());
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

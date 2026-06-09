import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { AppThemeProvider } from './features/themes/components/AppThemeProvider';

/*------------- Frontend Unit Tests -------------*/

describe('App Component', () => {
  it('renders the School OS dashboard with Schools Management datatable', () => {
    render(
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    );
    // Verify the main header title
    expect(screen.getByText('School OS Ecosystem')).toBeInTheDocument();
    
    // Verify that the Datatable title renders
    expect(screen.getByText('Schools Management')).toBeInTheDocument();

    // Verify mock schools appear in the datatable
    expect(screen.getByText('Greenwood International School')).toBeInTheDocument();
    expect(screen.getByText('Saint Xavier Academy')).toBeInTheDocument();
  });

  it('updates the current profile and displays admin panel upon clicking login', async () => {
    render(
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    );

    // Initial state: Guest profile
    expect(screen.getByTestId('profile-user')).toHaveTextContent('Guest');
    expect(screen.queryByText('Admin Control Panel')).not.toBeInTheDocument();

    // Click on Sign in Admin
    const adminLoginBtn = screen.getByText('Sign in Admin');
    fireEvent.click(adminLoginBtn);

    // Wait for the UI update to show Admin profile and Admin Control Panel
    await waitFor(() => {
      expect(screen.getByTestId('profile-user')).toHaveTextContent('Aryan Dubey (SUPER_ADMIN)');
    });
    
    expect(screen.getByText('Admin Control Panel')).toBeInTheDocument();
  });
});

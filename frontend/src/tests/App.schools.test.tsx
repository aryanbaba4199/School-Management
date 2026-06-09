import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import { AppThemeProvider } from '../features/themes/components/AppThemeProvider';
import { store } from '../api/store';
import { baseApi } from '../api/baseApi';
import { fetchStub, resetMockSchools } from './mockFetch';

describe('App Schools Navigation and Registration', () => {
  beforeEach(() => {
    localStorage.clear();
    fetchStub.mockClear();
    resetMockSchools();
    store.dispatch(baseApi.util.resetApiState());
  });

  it('allows super admin to navigate to schools page and register a new school', async () => {
    render(
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    );

    // 1. Login as Super Admin
    fireEvent.click(screen.getByText('Admin'));
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(screen.getByText('School OS Ecosystem')).toBeInTheDocument();
    });

    // 2. Click on Schools tab in sidebar
    const schoolsTab = screen.getAllByText('Schools')[0];
    fireEvent.click(schoolsTab);

    // Verify schools page loaded
    await waitFor(() => {
      expect(screen.getByText('Schools Management')).toBeInTheDocument();
    });

    // Verify mock schools display
    await waitFor(() => {
      expect(screen.getByText('Greenwood International School')).toBeInTheDocument();
      expect(screen.getByText('Saint Xavier Academy')).toBeInTheDocument();
    });

    // 3. Click Create School to open dialog
    fireEvent.click(screen.getByRole('button', { name: 'Create School' }));
    
    // Verify dialog opened
    expect(screen.getByText('Register New School')).toBeInTheDocument();

    // 4. Fill in Step 1 (Admin Credentials)
    fireEvent.change(screen.getByLabelText('Administrator Name *'), { target: { value: 'Demo Admin' } });
    fireEvent.change(screen.getByLabelText('Administrator Email Address *'), { target: { value: 'schooladmin@schoolos.com' } });
    fireEvent.change(screen.getByLabelText('Administrator Password *'), { target: { value: 'password123' } });
    
    // Click Next
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    // 5. Fill in Step 2 (School Details)
    await waitFor(() => {
      expect(screen.getByLabelText('School Name *')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText('School Name *'), { target: { value: 'New Test School' } });
    fireEvent.change(screen.getByLabelText('School Code *'), { target: { value: 'NTSC' } });
    fireEvent.change(screen.getByLabelText('Subdomain *'), { target: { value: 'ntsc' } });
    fireEvent.change(screen.getByLabelText('Email Address *'), { target: { value: 'test@schoolos.com' } });
    fireEvent.change(screen.getByLabelText('Phone Number *'), { target: { value: '1234567890' } });

    // Click Next
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    // 6. Step 3 (Subscription)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Create School' })).toBeInTheDocument();
    });

    // Submit
    const createBtn = screen.getByRole('button', { name: 'Create School' });
    fireEvent.click(createBtn);

    // Verify school is added to list
    await waitFor(() => {
      expect(screen.getByText('New Test School')).toBeInTheDocument();
    });
  });
});

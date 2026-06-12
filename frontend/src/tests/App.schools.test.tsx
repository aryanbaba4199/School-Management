import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import { AppThemeProvider } from '../features/themes/components/AppThemeProvider';
import { store } from '@api/store';
import { baseApi } from '@api/baseApi';
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
    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'aryan@schoolos.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(screen.getByText('School OS Ecosystem')).toBeInTheDocument();
    });

    // 2. Click on School Management and then Manage Schools tab in sidebar
    const schoolManagementMenu = screen.getAllByText('School Management')[0];
    fireEvent.click(schoolManagementMenu);
    const manageSchoolsTab = screen.getAllByText('Manage Schools')[0];
    fireEvent.click(manageSchoolsTab);

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
    
    await waitFor(() => {
      expect(screen.getByText('Register New School')).toBeInTheDocument();
    });

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
  }, 20000);

  it('allows super admin to edit, deactivate, and delete a school', async () => {
    render(
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    );

    // 1. Login as Super Admin
    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'aryan@schoolos.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(screen.getByText('School OS Ecosystem')).toBeInTheDocument();
    });

    // 2. Click on School Management and then Manage Schools tab in sidebar
    const schoolManagementMenu = screen.getAllByText('School Management')[0];
    fireEvent.click(schoolManagementMenu);
    const manageSchoolsTab = screen.getAllByText('Manage Schools')[0];
    fireEvent.click(manageSchoolsTab);

    // Verify schools page loaded
    await waitFor(() => {
      expect(screen.getByText('Schools Management')).toBeInTheDocument();
    });

    // Verify mock schools display
    await waitFor(() => {
      expect(screen.getByText('Greenwood International School')).toBeInTheDocument();
    });

    // 3. Edit School: click the Actions icon button for Greenwood International School
    const actionMenus = screen.getAllByTitle('Actions');
    expect(actionMenus.length).toBeGreaterThan(0);
    fireEvent.click(actionMenus[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Edit'));

    // Verify edit dialog opens (starts at Step 1 of Edit mode, which is "School Details")
    await waitFor(() => {
      expect(screen.getByText('Edit School')).toBeInTheDocument();
      expect(screen.getByLabelText('School Name *')).toBeInTheDocument();
    });

    // Change name
    fireEvent.change(screen.getByLabelText('School Name *'), { target: { value: 'Greenwood Edited' } });
    
    // Click Next to go to subscription step
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    // Click Save Changes
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    // Verify updated school name appears in the table
    await waitFor(() => {
      expect(screen.getByText('Greenwood Edited')).toBeInTheDocument();
      expect(screen.getByText('Greenwood Edited')).toBeInTheDocument();
    });

    // 4. Deactivate School: click deactivate icon button
    const actionMenus2 = screen.getAllByTitle('Actions');
    fireEvent.click(actionMenus2[0]);
    await waitFor(() => {
      expect(screen.getByText('Deactivate')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Deactivate'));

    // Verify confirmation dialog opens
    await waitFor(() => {
      expect(screen.getByText('Confirm Deactivation')).toBeInTheDocument();
      expect(screen.getByText(/This school has an active subscription/)).toBeInTheDocument();
    });

    // Click confirm
    fireEvent.click(screen.getByRole('button', { name: 'Deactivate' }));

    // Verify status changes to Deactivated (a Deactivated chip appears)
    await waitFor(() => {
      expect(screen.getByText('Deactivated')).toBeInTheDocument();
    });

    // 5. Delete School: click the delete button (which should now be enabled since the school is deactivated)
    const actionMenus3 = screen.getAllByTitle('Actions');
    fireEvent.click(actionMenus3[0]);
    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Delete'));

    // Verify passcode dialog opens
    await waitFor(() => {
      expect(screen.getByText('Confirm Delete School')).toBeInTheDocument();
    });

    // Fill in incorrect passcode
    const passcodeField = screen.getByLabelText('6-Digit Passcode') as HTMLInputElement;
    fireEvent.change(passcodeField, { target: { value: '111111' } });
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    // Verify error message
    await waitFor(() => {
      expect(screen.getAllByText('Invalid master passcode').length).toBeGreaterThan(0);
    });

    // Fill in correct passcode
    fireEvent.change(passcodeField, { target: { value: '727798' } });
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    // Verify school is deleted and removed from document
    await waitFor(() => {
      expect(screen.queryByText('Greenwood Edited')).not.toBeInTheDocument();
    });
  }, 25000);
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import { AppThemeProvider } from '../features/themes/components/AppThemeProvider';
import { store } from '@api/store';
import { baseApi } from '@api/baseApi';
import { fetchStub, resetMockSchools } from './mockFetch';

describe('App Attendance Module and Settings', () => {
  beforeEach(() => {
    localStorage.clear();
    fetchStub.mockClear();
    resetMockSchools();
    store.dispatch(baseApi.util.resetApiState());
  });

  it('allows super admin to navigate to attendance settings, select a school, and modify threshold timings', async () => {
    render(
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    );

    // 1. Log in as Super Admin
    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'aryan@schoolos.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(screen.getByText('School OS Ecosystem')).toBeInTheDocument();
    });

    // 2. Open Attendance sidebar menu
    const attendanceMenu = screen.getAllByText('Attendance')[0];
    fireEvent.click(attendanceMenu);

    // 3. Open Attendance Settings
    const settingsTab = screen.getAllByText('Attendance Settings')[0];
    fireEvent.click(settingsTab);

    // 4. Verify Attendance Settings loaded
    await waitFor(() => {
      expect(screen.getByText('School Rules Configuration')).toBeInTheDocument();
    });

    // 5. Verify school selector is rendered for super admin
    await waitFor(() => {
      expect(screen.getByText('Select School:')).toBeInTheDocument();
    });

    // 6. Verify auto-absent threshold and settings form renders
    await waitFor(() => {
      expect(screen.getByLabelText('Mark Late Threshold (HH:MM)')).toBeInTheDocument();
      expect(screen.getByLabelText('Half Day Threshold (HH:MM)')).toBeInTheDocument();
      expect(screen.getByLabelText('Auto Absent Threshold (HH:MM)')).toBeInTheDocument();
    });

    // 7. Change the thresholds
    const lateInput = screen.getByLabelText('Mark Late Threshold (HH:MM)') as HTMLInputElement;
    const halfDayInput = screen.getByLabelText('Half Day Threshold (HH:MM)') as HTMLInputElement;
    const autoAbsentInput = screen.getByLabelText('Auto Absent Threshold (HH:MM)') as HTMLInputElement;

    fireEvent.change(lateInput, { target: { value: '08:45' } });
    fireEvent.change(halfDayInput, { target: { value: '11:30' } });
    fireEvent.change(autoAbsentInput, { target: { value: '14:30' } });

    // 8. Submit settings form
    const saveButton = screen.getByRole('button', { name: 'Save Settings' });
    fireEvent.click(saveButton);

    // 9. Verify success notification or call dispatched
    await waitFor(() => {
      expect(fetchStub).toHaveBeenCalled();
    });
  }, 25000);

  it('allows super admin to view attendance reports and export monthly analytics', async () => {
    render(
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    );

    // 1. Log in as Super Admin
    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'aryan@schoolos.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(screen.getByText('School OS Ecosystem')).toBeInTheDocument();
    });

    // 2. Open Attendance sidebar menu
    const attendanceMenu = screen.getAllByText('Attendance')[0];
    fireEvent.click(attendanceMenu);

    // 3. Open Attendance Reports
    const reportsTab = screen.getAllByText('Attendance Reports')[0];
    fireEvent.click(reportsTab);

    // 4. Verify Reports page loads
    await waitFor(() => {
      expect(screen.getByText('Attendance Analytics & Reports')).toBeInTheDocument();
    });

    // 5. Verify super admin selector is rendered
    await waitFor(() => {
      expect(screen.getByText('Select School:')).toBeInTheDocument();
    });

    // 6. Switch to Monthly Summary Analytics tab
    const monthlyTabBtn = screen.getByText('Monthly Summary Analytics');
    fireEvent.click(monthlyTabBtn);

    // 7. Verify precalculated student stats are displayed in the summary table
    await waitFor(() => {
      expect(screen.getByText('Aryan Student')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    // 8. Export monthly analytics
    const exportBtn = screen.getByRole('button', { name: 'Export Summary' });
    expect(exportBtn).toBeInTheDocument();
    expect(exportBtn).not.toBeDisabled();
  }, 25000);
});

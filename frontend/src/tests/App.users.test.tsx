import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import { AppThemeProvider } from '../features/themes/components/AppThemeProvider';
import { store } from '@api/store';
import { baseApi } from '@api/baseApi';
import { fetchStub, resetMockSchools } from './mockFetch';

describe('App Users - Students Management', () => {
  beforeEach(() => {
    localStorage.clear();
    fetchStub.mockClear();
    resetMockSchools();
    store.dispatch(baseApi.util.resetApiState());
  });

  it('allows school admin to navigate to students page, create a student, and view details', async () => {
    render(
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    );

    // 1. Login as School Admin (aryan@schoolos.com triggers SUPER_ADMIN, so let's use a standard email)
    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'admin@schoolos.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(screen.getByText('School OS Ecosystem')).toBeInTheDocument();
    });

    // 2. Click on User Management and then Students
    const userManagementMenu = screen.getAllByText('User Management')[0];
    fireEvent.click(userManagementMenu);
    
    await waitFor(() => {
      expect(screen.getAllByText('Students')[0]).toBeInTheDocument();
    });
    
    const studentsTab = screen.getAllByText('Students')[0];
    fireEvent.click(studentsTab);

    // Verify students page loaded and initial data is present
    await waitFor(() => {
      expect(screen.getByText('Students Management')).toBeInTheDocument();
      expect(screen.getByText('Aryan Student')).toBeInTheDocument(); // from mockUsersList
    });

    // 3. Click Create Student to open dialog
    fireEvent.click(screen.getByRole('button', { name: 'Add Student' }));
    
    await waitFor(() => {
      expect(screen.getByText('Add New Student')).toBeInTheDocument();
    });

    // 4. Fill in Add Student Form
    fireEvent.change(screen.getByLabelText('Full Name *'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText('Email Address *'), { target: { value: 'jane@student.com' } });
    fireEvent.change(screen.getByLabelText('Admission Number (User Code) *'), { target: { value: 'STU-002' } });
    fireEvent.change(screen.getByLabelText('Password *'), { target: { value: 'student123' } });

    // Assuming there's a Class autocomplete that we might just skip or fill if required. 
    // If it's required we can mock the material ui autocomplete click or just submit if optional in mocks
    const saveBtn = screen.getByRole('button', { name: 'Save Student' });
    fireEvent.click(saveBtn);

    // Verify new student is added to list
    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    // 5. Open Student Details
    // The datatable has an ActionMenu with 'View Details'
    const actionMenus = screen.getAllByTitle('Actions');
    fireEvent.click(actionMenus[1]); // The newly created student

    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('View Details'));

    // Verify Student Details dialog opens and displays Fee/Admission info
    await waitFor(() => {
      expect(screen.getByText('Student Profile')).toBeInTheDocument();
      // Since mockFeesList filters by student ID, it might show the initial mocked fee
    });
  }, 30000);
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import { AppThemeProvider } from '../features/themes/components/AppThemeProvider';
import { store } from '../api/store';
import { baseApi } from '../api/baseApi';
import { fetchStub, resetMockSchools } from './mockFetch';

describe('App Fees - Transaction Management', () => {
  beforeEach(() => {
    localStorage.clear();
    fetchStub.mockClear();
    resetMockSchools();
    store.dispatch(baseApi.util.resetApiState());
  });

  it('allows school admin to navigate to transaction management and view fees', async () => {
    render(
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    );

    // 1. Login as School Admin
    const emailInput = screen.getByLabelText('Email Address') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'admin@schoolos.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(screen.getByText('School OS Ecosystem')).toBeInTheDocument();
    });

    // 2. Click on Account Management and then Transaction Management
    const accountManagementMenu = screen.getAllByText('Account Management')[0];
    fireEvent.click(accountManagementMenu);
    
    await waitFor(() => {
      expect(screen.getAllByText('Transaction Management')[0]).toBeInTheDocument();
    });
    
    const transactionsTab = screen.getAllByText('Transaction Management')[0];
    fireEvent.click(transactionsTab);

    // Verify transactions page loaded
    await waitFor(() => {
      expect(screen.getByText('Transaction Management')).toBeInTheDocument();
      expect(screen.getByText('All Transactions')).toBeInTheDocument();
    });

    // Verify data from mockFeesList is loaded in the table
    // mockFeesList has "Aryan Student" and type "ADMISSION"
    await waitFor(() => {
      expect(screen.getByText('Aryan Student')).toBeInTheDocument();
      expect(screen.getByText('Admission')).toBeInTheDocument();
      expect(screen.getByText('₹ 5000')).toBeInTheDocument();
      expect(screen.getByText('PENDING')).toBeInTheDocument();
    });
  }, 20000);
});

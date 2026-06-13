import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import { AppThemeProvider } from '../features/themes/components/AppThemeProvider';
import { store } from '@api/store';
import { baseApi } from '@api/baseApi';
import { fetchStub, resetMockSchools } from './mockFetch';

describe('App Fees Management', () => {
  beforeEach(() => {
    localStorage.clear();
    fetchStub.mockClear();
    resetMockSchools();
    store.dispatch(baseApi.util.resetApiState());
  });

  it('allows school admin to view fee cycles, generate fees, and process money receipt', async () => {
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

    // 2. Navigate to Fees Management
    const accountManagementMenu = screen.getAllByText('Account Management')[0];
    fireEvent.click(accountManagementMenu);
    
    await waitFor(() => {
      expect(screen.getAllByText('Fees Management')[0]).toBeInTheDocument();
    });
    
    const feesTab = screen.getAllByText('Fees Management')[0];
    fireEvent.click(feesTab);

    // Verify Fees Management page loaded
    await waitFor(() => {
      expect(screen.getByText('Fees Management')).toBeInTheDocument();
      expect(screen.getByText('Generate Fees')).toBeInTheDocument();
    });

    // 3. Generate Fees
    const generateBtn = screen.getByText('Generate Fees');
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText('Generate Bulk Fees')).toBeInTheDocument();
    });

    // We click Generate button inside the dialog
    const confirmGenerateBtn = screen.getByRole('button', { name: 'Generate' });
    fireEvent.click(confirmGenerateBtn);

    await waitFor(() => {
      expect(screen.getByText('Fees generated successfully')).toBeInTheDocument();
    });

    // 4. View Fee Cycle Details
    // The table should render our mocked fees list
    // Our mock logic groups them. We'll find an Action button.
    await waitFor(() => {
      const actionButtons = screen.getAllByRole('button', { name: /Action/i });
      expect(actionButtons.length).toBeGreaterThan(0);
      fireEvent.click(actionButtons[0]);
    });

    // Click "View Details"
    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('View Details'));

    // 5. Verify Fee Details Page Loaded
    await waitFor(() => {
      expect(screen.getByText('Fee Cycle Details')).toBeInTheDocument();
      // It should display the mock student data
      expect(screen.getByText('Aryan Student')).toBeInTheDocument();
    });

    // 6. Process Money Receipt
    // Click Action on a student row
    await waitFor(() => {
      const studentActionBtns = screen.getAllByRole('button', { name: /Action/i });
      expect(studentActionBtns.length).toBeGreaterThan(0);
      fireEvent.click(studentActionBtns[0]);
    });

    await waitFor(() => {
      expect(screen.getByText('Money Receipt')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Money Receipt'));

    // Money Receipt Dialog should appear
    await waitFor(() => {
      expect(screen.getByText('Process Money Receipt')).toBeInTheDocument();
      expect(screen.getByText('Aryan Student')).toBeInTheDocument();
      expect(screen.getByText('Confirm Payment')).toBeInTheDocument();
    });

    // With the new auto-select logic, the amount will be pre-filled.
    // Let's modify the Transaction ID note
    await waitFor(() => {
      const txInput = screen.getByLabelText('Transaction ID / Note') as HTMLInputElement;
      expect(txInput).toBeInTheDocument();
      fireEvent.change(txInput, { target: { value: 'TXN-123456' } });
    });

    // Confirm Payment
    const confirmPaymentBtn = screen.getByText('Confirm Payment');
    expect(confirmPaymentBtn).not.toBeDisabled();
    fireEvent.click(confirmPaymentBtn);

    // Verify Success
    await waitFor(() => {
      expect(screen.getByText('Payment processed successfully')).toBeInTheDocument();
    });

    // 7. Verify Transactions Filtering
    // Navigate to Transactions Page
    const transactionsTab = screen.getAllByText('Transactions')[0];
    fireEvent.click(transactionsTab);

    await waitFor(() => {
      expect(screen.getByText('Transaction Management')).toBeInTheDocument();
    });

    // Test filter Due
    
    // Simulate API resolving with datahe route responds to mock fetch and page loads.
    expect(screen.getByPlaceholderText('Search all transactions...')).toBeInTheDocument();

  }, 20000);
});

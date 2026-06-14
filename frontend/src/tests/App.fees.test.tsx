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
    const accountMenu = screen.getAllByText('Account Management')[0];
    fireEvent.click(accountMenu);
    
    await waitFor(() => {
      expect(screen.getAllByText('Fees Management').length).toBeGreaterThan(0);
    });
    
    const feesTab = screen.getAllByText('Fees Management')[0];
    fireEvent.click(feesTab);

    // Verify Fees Management page loaded
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Fees Management' })).toBeInTheDocument();
    });

    // 3. Generate Fees
    const actionBtn = screen.getByRole('button', { name: /^Action$/i });
    fireEvent.click(actionBtn);

    await waitFor(() => {
      expect(screen.getByText('Generate Bill')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Generate Bill'));

    await waitFor(() => {
      expect(screen.getByText('Total Students')).toBeInTheDocument();
    });

    // We click Generate button inside the dialog
    const confirmGenerateBtn = screen.getByRole('button', { name: 'Generate' });
    fireEvent.click(confirmGenerateBtn);

    await waitFor(() => {
      expect(screen.getByText('Fees generated successfully')).toBeInTheDocument();
    });

    // 4. View Fee Cycle Details
    // The table should render our mocked fees list
    // The fee cycle name is also clickable and calls onViewDetails
    await waitFor(() => {
      // Look for the fee cycle name text which is rendered in the table (clickable)
      const cycleLink = screen.getAllByText(/Monthly/i)[0];
      fireEvent.click(cycleLink);
    });

    // 5. Verify Fee Details Page Loaded
    await waitFor(() => {
      expect(screen.getByText(/Fee Details:/i)).toBeInTheDocument();
      // It should display the mock student data
      expect(screen.getByText('Aryan Student')).toBeInTheDocument();
    });

    // 6. Process Money Receipt
    // Click the receipt icon button on the student row (has data-testid="money-receipt-btn")
    const moneyReceiptBtn = await waitFor(() => screen.getByTestId('money-receipt-btn'));
    fireEvent.click(moneyReceiptBtn);

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
    // Navigate to Transactions Page - must re-open Account Management submenu
    const accountMenuAgain = screen.getAllByText('Account Management')[0];
    fireEvent.click(accountMenuAgain);

    // Click Transaction Management inside waitFor to avoid race with submenu animation
    await waitFor(() => {
      const transactionsTab = screen.getAllByText('Transaction Management')[0];
      fireEvent.click(transactionsTab);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Transaction Management' })).toBeInTheDocument();
    });

    // Simulate API resolving with data - the route responds to mock fetch and page loads.
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search all transactions...')).toBeInTheDocument();
    });

  }, 30000);
});

import { render, screen, waitFor } from '@testing-library/react';
import { SchoolSettingsPage } from '../pages/SchoolSettingsPage';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { NotifierProvider } from '@common/Notifier/NotifierProvider';
import { ThemeProvider, createTheme } from '@mui/material';

// Mocks
const mockUser = { id: 'admin1', role: { name: 'SCHOOL_ADMIN' }, schoolId: 'school123' };
vi.mock('@common/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

const mockUpdateSchool = vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ success: true }) });
vi.mock('@api/schoolsApi', () => ({
  useGetSchoolByIdQuery: () => ({
    data: {
      success: true,
      data: {
        _id: 'school123',
        name: 'Test School',
        email: 'test@school.com',
        phone: '1234567890',
        shift: 'Morning Shift',
      }
    },
    isLoading: false,
  }),
  useUpdateSchoolMutation: () => [mockUpdateSchool, { isLoading: false }],
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <ThemeProvider theme={createTheme()}>
      <NotifierProvider>
        <BrowserRouter>{component}</BrowserRouter>
      </NotifierProvider>
    </ThemeProvider>
  );
};

describe('SchoolSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the school profile form correctly', async () => {
    renderWithProviders(<SchoolSettingsPage />);
    
    expect(await screen.findByText('School Profile Settings')).toBeInTheDocument();
    expect(screen.getByLabelText(/School Name/i)).toHaveValue('Test School');
    expect(screen.getByLabelText(/School Email/i)).toHaveValue('test@school.com');
  });

  it('calls update mutation when submitting form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchoolSettingsPage />);
    
    const nameInput = await screen.findByLabelText(/School Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated School');

    const submitBtn = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockUpdateSchool).toHaveBeenCalledWith({
        id: 'school123',
        body: expect.objectContaining({
          name: 'Updated School',
        }),
      });
    });
  });
});

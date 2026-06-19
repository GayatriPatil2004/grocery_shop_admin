import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from '../features/auth/Login';
import { useAuth } from '../shared/hooks/useAuth';
import toast from 'react-hot-toast';

// Mock the useAuth hook
vi.mock('../shared/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin,
    });
  });

  it('renders login components correctly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText('SUPER MART')).toBeInTheDocument();
    expect(screen.getByText('ADMINISTRATOR CONTROL')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Secure Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Access Admin Dashboard/i })).toBeInTheDocument();
  });

  it('allows user to input email and password', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('email@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    fireEvent.change(emailInput, { target: { value: 'admin@grocery.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });

    expect(emailInput.value).toBe('admin@grocery.com');
    expect(passwordInput.value).toBe('admin123');
  });

  it('toggles password visibility when eye icon is clicked', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput.type).toBe('password');

    // Toggle button is the Lucide icon wrapper button
    const toggleButton = screen.getByRole('button', { name: '' });
    fireEvent.click(toggleButton);

    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('calls login function and navigates on successful form submission', async () => {
    mockLogin.mockResolvedValueOnce({ email: 'admin@grocery.com' });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('email@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Access Admin Dashboard/i });

    fireEvent.change(emailInput, { target: { value: 'admin@grocery.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@grocery.com', 'admin123');
      expect(toast.success).toHaveBeenCalledWith('Access Granted. Welcome Admin!');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays toast error message if login credentials are invalid', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid password'));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('email@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Access Admin Dashboard/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@grocery.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('wrong@grocery.com', 'wrongpass');
      expect(toast.error).toHaveBeenCalledWith('Invalid password');
    });
  });
});

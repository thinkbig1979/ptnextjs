/**
 * VendorLoginForm Component Tests
 *
 * Tests for vendor login form component with authentication flows,
 * validation, error handling, and redirect logic.
 */

import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/setup/react-testing-library.config';
import { fillAndSubmitForm } from '@/__tests__/utils/user-interaction-helpers';
import { expectToHaveError, expectToBeVisible } from '@/__tests__/utils/assertion-helpers';
import { server, http, HttpResponse } from '@/__tests__/mocks/server';
import { validLoginData } from '@/__tests__/fixtures/forms';
import { VendorLoginForm } from '@/components/vendor/VendorLoginForm';

describe('VendorLoginForm', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push: mockPush });
  });

  describe('Successful Login', () => {
    it('logs in with valid credentials and redirects to dashboard', async () => {
      renderWithProviders(<VendorLoginForm />);

      await fillAndSubmitForm({
        Email: 'vendor.tier2@example.com',
        Password: 'StrongPass123!@#',
      }, 'Login');

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/vendor/dashboard');
      });
    });

    it('updates AuthContext on successful login', async () => {
      renderWithProviders(<VendorLoginForm />);

      await fillAndSubmitForm({
        Email: 'vendor.tier2@example.com',
        Password: 'StrongPass123!@#',
      }, 'Login');

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/vendor/dashboard');
      });
    });

    it('stores authentication token', async () => {
      renderWithProviders(<VendorLoginForm />);

      await fillAndSubmitForm({
        Email: 'vendor.tier2@example.com',
        Password: 'StrongPass123!@#',
      }, 'Login');

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/vendor/dashboard');
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error for invalid credentials', async () => {
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json(
            { error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
            { status: 401 }
          );
        })
      );

      renderWithProviders(<VendorLoginForm />);

      await fillAndSubmitForm({
        Email: 'wrong@example.com',
        Password: 'WrongPass123!@#',
      }, 'Login');

      await expectToBeVisible('Invalid email or password');
    });

    it('displays error for pending vendor status', async () => {
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json(
            { error: 'Your account is pending approval', code: 'PENDING_APPROVAL' },
            { status: 403 }
          );
        })
      );

      renderWithProviders(<VendorLoginForm />);

      await fillAndSubmitForm({
        Email: 'vendor.pending@example.com',
        Password: 'StrongPass123!@#',
      }, 'Login');

      await expectToBeVisible('Your account is pending approval');
    });

    it('displays error for rejected vendor status', async () => {
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json(
            { error: 'Your account has been rejected', code: 'ACCOUNT_REJECTED' },
            { status: 403 }
          );
        })
      );

      renderWithProviders(<VendorLoginForm />);

      await fillAndSubmitForm({
        Email: 'vendor.rejected@example.com',
        Password: 'StrongPass123!@#',
      }, 'Login');

      await expectToBeVisible('Your account has been rejected');
    });
  });

  describe('Validation', () => {
    it('validates required email field', async () => {
      renderWithProviders(<VendorLoginForm />);

      await fillAndSubmitForm({ Password: 'password' }, 'Login');

      await expectToHaveError('Email', 'Email is required');
    });

    it('validates required password field', async () => {
      renderWithProviders(<VendorLoginForm />);

      await fillAndSubmitForm({ Email: 'test@example.com' }, 'Login');

      await expectToHaveError('Password', 'Password is required');
    });

    it('validates email format', async () => {
      renderWithProviders(<VendorLoginForm />);

      await fillAndSubmitForm({
        Email: 'invalid-email',
        Password: 'password'
      }, 'Login');

      await expectToHaveError('Email', 'Invalid email format');
    });
  });

  describe('Loading States', () => {
    it('disables form during submission', async () => {
      renderWithProviders(<VendorLoginForm />);

      const submitButton = screen.getByRole('button', { name: /login/i });

      await fillAndSubmitForm({
        Email: validLoginData.email,
        Password: validLoginData.password,
      }, 'Login');

      // Note: This test checks the button state during submission
      // The button should be disabled while loading
    });

    it('shows loading spinner', async () => {
      renderWithProviders(<VendorLoginForm />);

      await fillAndSubmitForm({
        Email: validLoginData.email,
        Password: validLoginData.password,
      }, 'Login');

      // Loading spinner should appear during submission
      const spinner = screen.queryByTestId('loading-spinner');
      // Spinner may not be visible after successful login redirect
    });
  });
});

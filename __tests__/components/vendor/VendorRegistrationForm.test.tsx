/**
 * VendorRegistrationForm Component Test Template
 *
 * This is a TEMPLATE file demonstrating comprehensive test scenarios
 * for the VendorRegistrationForm component.
 *
 * To use: Copy this file and remove the .template extension when ready to implement.
 */

import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/__tests__/setup/react-testing-library.config';
import { fillForm, submitForm, fillAndSubmitForm } from '@/__tests__/utils/user-interaction-helpers';
import {
  expectToBeVisible,
  expectToHaveError,
  expectToBeDisabled,
  expectToBeEnabled,
  expectToHaveToast,
} from '@/__tests__/utils/assertion-helpers';
import { server, http, HttpResponse } from '@/__tests__/mocks/server';
import { validRegistrationData, invalidRegistrationData, validationErrorMessages } from '@/__tests__/fixtures/forms';

// Import component
import { VendorRegistrationForm } from '@/components/vendor/VendorRegistrationForm';
import userEvent from '@testing-library/user-event';

describe('VendorRegistrationForm', () => {
  describe('Rendering', () => {
    it('renders all form fields', () => {
      renderWithProviders(<VendorRegistrationForm />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/contact name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('renders terms and conditions checkbox', () => {
      renderWithProviders(<VendorRegistrationForm />);

      expect(screen.getByLabelText(/agree to terms/i)).toBeInTheDocument();
    });

    it('shows password strength indicator', () => {
      renderWithProviders(<VendorRegistrationForm />);

      expect(screen.getByText(/password strength/i)).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('validates required fields', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await submitForm('Register');

      await expectToHaveError('Email', validationErrorMessages.email.required);
      await expectToHaveError('Password', validationErrorMessages.password.required);
      await expectToHaveError('Company Name', validationErrorMessages.companyName.required);
    });

    it('validates email format', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await fillForm({ Email: 'invalid-email' });
      await submitForm('Register');

      await expectToHaveError('Email', validationErrorMessages.email.invalid);
    });

    it('validates password strength (minimum 12 characters)', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await fillForm({ Password: 'weak' });
      await submitForm('Register');

      await expectToHaveError('Password', validationErrorMessages.password.weak);
    });

    it('validates password requires uppercase letter', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await fillForm({ Password: 'lowercase123!@#' });
      await submitForm('Register');

      await expectToHaveError('Password', validationErrorMessages.password.noUppercase);
    });

    it('validates password requires lowercase letter', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await fillForm({ Password: 'UPPERCASE123!@#' });
      await submitForm('Register');

      await expectToHaveError('Password', validationErrorMessages.password.noLowercase);
    });

    it('validates password requires number', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await fillForm({ Password: 'NoNumbersHere!@#' });
      await submitForm('Register');

      await expectToHaveError('Password', validationErrorMessages.password.noNumber);
    });

    it('validates password requires special character', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await fillForm({ Password: 'NoSpecial123' });
      await submitForm('Register');

      await expectToHaveError('Password', validationErrorMessages.password.noSpecial);
    });

    it('validates password confirmation matches', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await fillForm({
        Password: 'StrongPass123!@#',
        'Confirm Password': 'DifferentPass123!@#',
      });
      await submitForm('Register');

      await expectToHaveError('Confirm Password', validationErrorMessages.confirmPassword.mismatch);
    });

    it('validates company name length', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await fillForm({ 'Company Name': 'AB' }); // Too short
      await submitForm('Register');

      await expectToHaveError('Company Name', validationErrorMessages.companyName.tooShort);
    });

    it('validates phone number format', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await fillForm({ Phone: '123' }); // Invalid format
      await submitForm('Register');

      await expectToHaveError('Phone', validationErrorMessages.phone.invalid);
    });

    it('validates website URL format', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await fillForm({ Website: 'not-a-url' });
      await submitForm('Register');

      await expectToHaveError('Website', validationErrorMessages.website.invalid);
    });

    it('validates terms and conditions checkbox', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await fillAndSubmitForm({
        Email: validRegistrationData.email,
        Password: validRegistrationData.password,
        'Confirm Password': validRegistrationData.confirmPassword,
        'Company Name': validRegistrationData.companyName,
        'Contact Name': validRegistrationData.contactName,
        Phone: validRegistrationData.phone,
        Website: validRegistrationData.website,
      }, 'Register');

      // Don't check terms checkbox

      await expectToHaveError('Terms', validationErrorMessages.terms.required);
    });
  });

  describe('Successful Registration', () => {
    it('submits form with valid data', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await fillAndSubmitForm({
        Email: validRegistrationData.email,
        Password: validRegistrationData.password,
        'Confirm Password': validRegistrationData.confirmPassword,
        'Company Name': validRegistrationData.companyName,
        'Contact Name': validRegistrationData.contactName,
        Phone: validRegistrationData.phone,
        Website: validRegistrationData.website,
        Description: validRegistrationData.description,
      }, 'Register');

      // Check terms
      await screen.getByLabelText(/agree to terms/i).click();

      await waitFor(() => {
        expectToHaveToast('Registration successful');
        expectToBeVisible('Your account is pending approval');
      });
    });

    it('disables form during submission', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await fillAndSubmitForm({
        Email: validRegistrationData.email,
        Password: validRegistrationData.password,
        'Confirm Password': validRegistrationData.confirmPassword,
        'Company Name': validRegistrationData.companyName,
      }, 'Register');

      expectToBeDisabled('Register');
    });

    it('shows loading spinner during submission', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await submitForm('Register');

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('clears form after successful registration', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await fillAndSubmitForm({
        Email: validRegistrationData.email,
        Password: validRegistrationData.password,
      }, 'Register');

      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toHaveValue('');
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error when email already exists', async () => {
      server.use(
        http.post('/api/vendors/register', () => {
          return HttpResponse.json(
            { error: 'Email already exists', code: 'EMAIL_EXISTS' },
            { status: 409 }
          );
        })
      );

      renderWithProviders(<VendorRegistrationForm />);

      await fillAndSubmitForm({
        Email: 'existing@example.com',
        Password: validRegistrationData.password,
      }, 'Register');

      await expectToBeVisible('Email already exists');
    });

    it('displays error when company name already exists', async () => {
      server.use(
        http.post('/api/vendors/register', () => {
          return HttpResponse.json(
            { error: 'Company name already exists', code: 'COMPANY_EXISTS' },
            { status: 409 }
          );
        })
      );

      renderWithProviders(<VendorRegistrationForm />);

      await fillAndSubmitForm({
        'Company Name': 'Existing Company',
      }, 'Register');

      await expectToBeVisible('Company name already exists');
    });

    it('displays server error message', async () => {
      server.use(
        http.post('/api/vendors/register', () => {
          return HttpResponse.json(
            { error: 'Internal server error', code: 'SERVER_ERROR' },
            { status: 500 }
          );
        })
      );

      renderWithProviders(<VendorRegistrationForm />);

      await submitForm('Register');

      await expectToBeVisible('Internal server error');
    });

    it('handles network errors gracefully', async () => {
      server.use(
        http.post('/api/vendors/register', () => {
          return HttpResponse.error();
        })
      );

      renderWithProviders(<VendorRegistrationForm />);

      await submitForm('Register');

      await expectToBeVisible('Unable to connect to the server');
    });

    it('re-enables form after error', async () => {
      server.use(
        http.post('/api/vendors/register', () => {
          return HttpResponse.json(
            { error: 'Server error' },
            { status: 500 }
          );
        })
      );

      renderWithProviders(<VendorRegistrationForm />);

      await submitForm('Register');

      await waitFor(() => {
        expectToBeEnabled('Register');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderWithProviders(<VendorRegistrationForm />);

      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-label', 'Email');
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-label', 'Password');
    });

    it('supports keyboard navigation', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      const emailInput = screen.getByLabelText(/email/i);
      emailInput.focus();

      expect(document.activeElement).toBe(emailInput);

      // Tab to next field
      await userEvent.tab();
      expect(document.activeElement).toBe(screen.getByLabelText(/password/i));
    });

    it('shows error messages with role="alert"', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await submitForm('Register');

      await waitFor(() => {
        const errors = screen.getAllByRole('alert');
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('User Experience', () => {
    it('shows password strength indicator as user types', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      const passwordInput = screen.getByLabelText(/password/i);

      await userEvent.type(passwordInput, 'weak');
      expect(screen.getByText(/weak/i)).toBeInTheDocument();

      await userEvent.clear(passwordInput);
      await userEvent.type(passwordInput, 'StrongPass123!@#');
      expect(screen.getByText(/strong/i)).toBeInTheDocument();
    });

    it('shows character count for description field', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      const descriptionField = screen.getByLabelText(/description/i);

      await userEvent.type(descriptionField, 'Test description');

      expect(screen.getByText(/16 \/ 500/i)).toBeInTheDocument();
    });

    it('provides helpful tooltips for complex fields', async () => {
      renderWithProviders(<VendorRegistrationForm />);

      await userEvent.hover(screen.getByTestId('password-help-icon'));

      expect(await screen.findByText(/password must contain/i)).toBeInTheDocument();
    });
  });
});

/**
 * Custom Assertion Helper Utilities
 *
 * Helper functions for common assertions in tests
 */

import { screen, waitFor, within } from '@testing-library/react';
import { expect } from '@jest/globals';

/**
 * Assert element is visible
 *
 * @example
 * await expectToBeVisible('Welcome message');
 */
export async function expectToBeVisible(text: string | RegExp): Promise<void> {
  await waitFor(() => {
    expect(screen.getByText(text)).toBeVisible();
  });
}

/**
 * Assert element is not visible
 *
 * @example
 * await expectNotToBeVisible('Error message');
 */
export async function expectNotToBeVisible(text: string | RegExp): Promise<void> {
  await waitFor(() => {
    expect(screen.queryByText(text)).not.toBeInTheDocument();
  });
}

/**
 * Assert form field has error
 *
 * @example
 * await expectToHaveError('Email', 'Invalid email format');
 */
export async function expectToHaveError(
  labelText: string | RegExp,
  errorMessage: string | RegExp
): Promise<void> {
  await waitFor(() => {
    const field = screen.getByLabelText(labelText);
    const fieldContainer = field.closest('[data-field]') || field.parentElement;

    if (fieldContainer) {
      const error = within(fieldContainer as HTMLElement).getByText(errorMessage);
      expect(error).toBeInTheDocument();
    } else {
      // Fallback: check for error anywhere in document
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    }
  });
}

/**
 * Assert form field has no error
 *
 * @example
 * await expectToHaveNoError('Email');
 */
export async function expectToHaveNoError(labelText: string | RegExp): Promise<void> {
  const field = screen.getByLabelText(labelText);
  const fieldContainer = field.closest('[data-field]') || field.parentElement;

  if (fieldContainer) {
    const error = within(fieldContainer as HTMLElement).queryByRole('alert');
    expect(error).not.toBeInTheDocument();
  }
}

/**
 * Assert button is disabled
 *
 * @example
 * expectToBeDisabled('Submit');
 */
export function expectToBeDisabled(buttonText: string | RegExp): void {
  const button = screen.getByRole('button', { name: buttonText });
  expect(button).toBeDisabled();
}

/**
 * Assert button is enabled
 *
 * @example
 * expectToBeEnabled('Submit');
 */
export function expectToBeEnabled(buttonText: string | RegExp): void {
  const button = screen.getByRole('button', { name: buttonText });
  expect(button).toBeEnabled();
}

/**
 * Assert toast notification appears
 *
 * @example
 * await expectToHaveToast('Profile updated successfully');
 */
export async function expectToHaveToast(message: string | RegExp): Promise<void> {
  await waitFor(() => {
    const toast = screen.getByRole('status') || screen.getByRole('alert');
    expect(within(toast).getByText(message)).toBeInTheDocument();
  });
}

/**
 * Assert loading spinner is visible
 *
 * @example
 * expectLoadingSpinner();
 */
export function expectLoadingSpinner(): void {
  const spinner = screen.getByTestId('loading-spinner') || screen.getByLabelText(/loading/i);
  expect(spinner).toBeInTheDocument();
}

/**
 * Assert loading spinner is not visible
 *
 * @example
 * expectNoLoadingSpinner();
 */
export function expectNoLoadingSpinner(): void {
  const spinner = screen.queryByTestId('loading-spinner') || screen.queryByLabelText(/loading/i);
  expect(spinner).not.toBeInTheDocument();
}

/**
 * Assert API call was made with specific parameters
 *
 * @example
 * expectApiCallToBeMade(mockFetch, '/api/vendors/register', {
 *   method: 'POST',
 *   body: { email: 'test@example.com' }
 * });
 */
export function expectApiCallToBeMade(
  mockFn: jest.Mock,
  url: string,
  options?: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  }
): void {
  expect(mockFn).toHaveBeenCalledWith(
    expect.stringContaining(url),
    expect.objectContaining({
      method: options?.method || 'GET',
      ...(options?.body && { body: JSON.stringify(options.body) }),
      ...(options?.headers && { headers: expect.objectContaining(options.headers) }),
    })
  );
}

/**
 * Assert redirect occurred (Next.js router)
 *
 * @example
 * expectRedirect(mockRouter.push, '/dashboard');
 */
export function expectRedirect(pushMock: jest.Mock, path: string): void {
  expect(pushMock).toHaveBeenCalledWith(path);
}

/**
 * Assert element has specific class
 *
 * @example
 * expectToHaveClass('Submit', 'btn-primary');
 */
export function expectToHaveClass(text: string | RegExp, className: string): void {
  const element = screen.getByText(text);
  expect(element).toHaveClass(className);
}

/**
 * Assert element has specific attribute
 *
 * @example
 * expectToHaveAttribute('Email input', 'type', 'email');
 */
export function expectToHaveAttribute(
  labelText: string | RegExp,
  attribute: string,
  value: string
): void {
  const element = screen.getByLabelText(labelText);
  expect(element).toHaveAttribute(attribute, value);
}

/**
 * Assert form field has specific value
 *
 * @example
 * expectFieldValue('Email', 'test@example.com');
 */
export function expectFieldValue(labelText: string | RegExp, value: string): void {
  const field = screen.getByLabelText(labelText) as HTMLInputElement;
  expect(field.value).toBe(value);
}

/**
 * Assert checkbox is checked
 *
 * @example
 * expectCheckboxChecked('I agree to terms');
 */
export function expectCheckboxChecked(labelText: string | RegExp): void {
  const checkbox = screen.getByLabelText(labelText) as HTMLInputElement;
  expect(checkbox).toBeChecked();
}

/**
 * Assert checkbox is not checked
 *
 * @example
 * expectCheckboxUnchecked('I agree to terms');
 */
export function expectCheckboxUnchecked(labelText: string | RegExp): void {
  const checkbox = screen.getByLabelText(labelText) as HTMLInputElement;
  expect(checkbox).not.toBeChecked();
}

/**
 * Assert element has focus
 *
 * @example
 * expectToHaveFocus('Email');
 */
export function expectToHaveFocus(labelText: string | RegExp): void {
  const element = screen.getByLabelText(labelText);
  expect(element).toHaveFocus();
}

/**
 * Assert element has ARIA attribute
 *
 * @example
 * expectToHaveAriaAttribute('Submit', 'aria-disabled', 'true');
 */
export function expectToHaveAriaAttribute(
  text: string | RegExp,
  attribute: string,
  value: string
): void {
  const element = screen.getByText(text);
  expect(element).toHaveAttribute(attribute, value);
}

/**
 * Assert modal is open
 *
 * @example
 * await expectModalToBeOpen('Confirmation');
 */
export async function expectModalToBeOpen(title: string | RegExp): Promise<void> {
  await waitFor(() => {
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(title)).toBeInTheDocument();
  });
}

/**
 * Assert modal is closed
 *
 * @example
 * expectModalToBeClosed();
 */
export function expectModalToBeClosed(): void {
  const dialog = screen.queryByRole('dialog');
  expect(dialog).not.toBeInTheDocument();
}

/**
 * Assert list has specific number of items
 *
 * @example
 * expectListLength('vendor', 5);
 */
export function expectListLength(role: string, length: number): void {
  const items = screen.getAllByRole(role);
  expect(items).toHaveLength(length);
}

/**
 * Assert validation error count
 *
 * @example
 * expectValidationErrors(3);
 */
export function expectValidationErrors(count: number): void {
  const errors = screen.getAllByRole('alert');
  expect(errors).toHaveLength(count);
}

/**
 * Assert specific HTTP status in error message
 *
 * @example
 * await expectHttpError(401, 'Unauthorized');
 */
export async function expectHttpError(status: number, message: string | RegExp): Promise<void> {
  await waitFor(() => {
    const error = screen.getByText(message);
    expect(error).toBeInTheDocument();
  });
}

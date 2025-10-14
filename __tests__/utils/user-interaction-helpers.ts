/**
 * User Interaction Helper Utilities
 *
 * Helper functions for simulating user interactions in tests
 */

import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

/**
 * Fill a form field by label
 *
 * @example
 * await fillFormField('Email', 'test@example.com');
 */
export async function fillFormField(labelText: string | RegExp, value: string): Promise<void> {
  const input = screen.getByLabelText(labelText);
  await userEvent.clear(input);
  await userEvent.type(input, value);
}

/**
 * Fill multiple form fields
 *
 * @example
 * await fillForm({
 *   'Email': 'test@example.com',
 *   'Password': 'password123'
 * });
 */
export async function fillForm(fields: Record<string, string>): Promise<void> {
  for (const [label, value] of Object.entries(fields)) {
    await fillFormField(label, value);
  }
}

/**
 * Submit a form
 *
 * @example
 * await submitForm('Register');
 */
export async function submitForm(buttonText: string | RegExp = /submit/i): Promise<void> {
  const submitButton = screen.getByRole('button', { name: buttonText });
  await userEvent.click(submitButton);
}

/**
 * Fill form and submit
 *
 * @example
 * await fillAndSubmitForm({
 *   'Email': 'test@example.com',
 *   'Password': 'password123'
 * }, 'Login');
 */
export async function fillAndSubmitForm(
  fields: Record<string, string>,
  buttonText?: string | RegExp
): Promise<void> {
  await fillForm(fields);
  await submitForm(buttonText);
}

/**
 * Click a button by text
 *
 * @example
 * await clickButton('Save');
 */
export async function clickButton(buttonText: string | RegExp): Promise<void> {
  const button = screen.getByRole('button', { name: buttonText });
  await userEvent.click(button);
}

/**
 * Click a link by text
 *
 * @example
 * await clickLink('Go to Dashboard');
 */
export async function clickLink(linkText: string | RegExp): Promise<void> {
  const link = screen.getByRole('link', { name: linkText });
  await userEvent.click(link);
}

/**
 * Select an option from a dropdown
 *
 * @example
 * await selectOption('Tier', 'tier2');
 */
export async function selectOption(labelText: string | RegExp, value: string): Promise<void> {
  const select = screen.getByLabelText(labelText);
  await userEvent.selectOptions(select, value);
}

/**
 * Check a checkbox
 *
 * @example
 * await checkCheckbox('I agree to terms');
 */
export async function checkCheckbox(labelText: string | RegExp): Promise<void> {
  const checkbox = screen.getByLabelText(labelText);
  if (!checkbox.querySelector('input')?.checked) {
    await userEvent.click(checkbox);
  }
}

/**
 * Uncheck a checkbox
 *
 * @example
 * await uncheckCheckbox('I agree to terms');
 */
export async function uncheckCheckbox(labelText: string | RegExp): Promise<void> {
  const checkbox = screen.getByLabelText(labelText);
  if (checkbox.querySelector('input')?.checked) {
    await userEvent.click(checkbox);
  }
}

/**
 * Upload a file to an input
 *
 * @example
 * const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
 * await uploadFile('Upload Document', file);
 */
export async function uploadFile(labelText: string | RegExp, file: File): Promise<void> {
  const input = screen.getByLabelText(labelText) as HTMLInputElement;
  await userEvent.upload(input, file);
}

/**
 * Clear an input field
 *
 * @example
 * await clearField('Email');
 */
export async function clearField(labelText: string | RegExp): Promise<void> {
  const input = screen.getByLabelText(labelText);
  await userEvent.clear(input);
}

/**
 * Type into a field with delay (simulates slow typing)
 *
 * @example
 * await typeWithDelay('Email', 'test@example.com', 50);
 */
export async function typeWithDelay(
  labelText: string | RegExp,
  value: string,
  delay: number = 50
): Promise<void> {
  const input = screen.getByLabelText(labelText);
  await userEvent.type(input, value, { delay });
}

/**
 * Wait for button to be enabled
 *
 * Useful when waiting for form validation or async operations
 *
 * @example
 * await waitForButtonToBeEnabled('Submit');
 */
export async function waitForButtonToBeEnabled(buttonText: string | RegExp): Promise<void> {
  await waitFor(() => {
    const button = screen.getByRole('button', { name: buttonText });
    expect(button).toBeEnabled();
  });
}

/**
 * Wait for button to be disabled
 *
 * @example
 * await waitForButtonToBeDisabled('Submit');
 */
export async function waitForButtonToBeDisabled(buttonText: string | RegExp): Promise<void> {
  await waitFor(() => {
    const button = screen.getByRole('button', { name: buttonText });
    expect(button).toBeDisabled();
  });
}

/**
 * Hover over an element
 *
 * @example
 * await hoverElement('Tooltip Trigger');
 */
export async function hoverElement(text: string | RegExp): Promise<void> {
  const element = screen.getByText(text);
  await userEvent.hover(element);
}

/**
 * Unhover from an element
 *
 * @example
 * await unhoverElement('Tooltip Trigger');
 */
export async function unhoverElement(text: string | RegExp): Promise<void> {
  const element = screen.getByText(text);
  await userEvent.unhover(element);
}

/**
 * Tab to next element (keyboard navigation)
 *
 * @example
 * await tabToNextElement();
 */
export async function tabToNextElement(): Promise<void> {
  await userEvent.tab();
}

/**
 * Shift+Tab to previous element
 *
 * @example
 * await tabToPreviousElement();
 */
export async function tabToPreviousElement(): Promise<void> {
  await userEvent.tab({ shift: true });
}

/**
 * Press Enter key
 *
 * @example
 * await pressEnter();
 */
export async function pressEnter(): Promise<void> {
  await userEvent.keyboard('{Enter}');
}

/**
 * Press Escape key
 *
 * @example
 * await pressEscape();
 */
export async function pressEscape(): Promise<void> {
  await userEvent.keyboard('{Escape}');
}

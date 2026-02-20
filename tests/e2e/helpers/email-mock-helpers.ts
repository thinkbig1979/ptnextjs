/**
 * Email Mock Helpers for E2E Tests
 *
 * Provides Playwright route interception for Resend email API calls.
 * This ensures no actual emails are sent during tests while still
 * allowing verification that email triggers fire with correct data.
 *
 * Usage:
 *   const emailMock = new EmailMock(page);
 *   await emailMock.setup();
 *   // ... perform actions that trigger emails ...
 *   const emails = emailMock.getEmails();
 *   expect(emails).toHaveLength(1);
 *   expect(emails[0].to).toBe('admin@example.com');
 *   await emailMock.teardown();
 */

import { Page, Route, Request } from '@playwright/test';

/**
 * Captured email data from mocked Resend API calls
 */
interface CapturedEmail {
  id: string;
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  timestamp: Date;
  /** Raw request body for detailed assertions */
  rawBody: Record<string, unknown>;
}

/**
 * Email type classification based on subject/content patterns
 */
type EmailType =
  | 'vendor-registered'
  | 'vendor-approved'
  | 'vendor-rejected'
  | 'profile-published'
  | 'profile-submitted-admin'
  | 'profile-submitted-vendor'
  | 'tier-upgrade-requested'
  | 'tier-upgrade-approved'
  | 'tier-upgrade-rejected'
  | 'tier-downgrade-requested'
  | 'tier-downgrade-approved'
  | 'tier-downgrade-rejected'
  | 'user-approved'
  | 'user-rejected'
  | 'unknown';

/**
 * Mock configuration options
 */
interface EmailMockOptions {
  /** Whether to log captured emails to console */
  verbose?: boolean;
  /** Custom response delay in ms (simulates network latency) */
  responseDelay?: number;
  /** Whether to simulate failures (for error handling tests) */
  simulateFailure?: boolean;
  /** Custom error message when simulating failure */
  failureMessage?: string;
}

/**
 * EmailMock - Intercepts Resend API calls during E2E tests
 *
 * Captures all email sending attempts without actually sending emails,
 * allowing tests to verify email triggers and content.
 */
export class EmailMock {
  private page: Page;
  private emails: CapturedEmail[] = [];
  private options: EmailMockOptions;
  private isSetup = false;
  private emailCounter = 0;

  constructor(page: Page, options: EmailMockOptions = {}) {
    this.page = page;
    this.options = {
      verbose: false,
      responseDelay: 0,
      simulateFailure: false,
      failureMessage: 'Simulated email failure',
      ...options,
    };
  }

  /**
   * Set up route interception for Resend API
   * Must be called before navigating to pages that trigger emails
   */
  async setup(): Promise<void> {
    if (this.isSetup) {
      return;
    }

    // Intercept Resend API calls
    await this.page.route('**/api.resend.com/emails', async (route: Route) => {
      await this.handleEmailRequest(route);
    });

    // Also intercept any local email API that might proxy to Resend
    await this.page.route('**/api/email/**', async (route: Route) => {
      // Let local API calls through but capture them if they're POST
      if (route.request().method() === 'POST') {
        await this.handleLocalEmailRequest(route);
      } else {
        await route.continue();
      }
    });

    this.isSetup = true;

    if (this.options.verbose) {
      console.log('[EmailMock] Setup complete - intercepting Resend API calls');
    }
  }

  /**
   * Handle intercepted Resend API requests
   */
  private async handleEmailRequest(route: Route): Promise<void> {
    const request = route.request();

    if (request.method() !== 'POST') {
      await route.continue();
      return;
    }

    try {
      const body = request.postDataJSON() as Record<string, unknown>;

      // Capture the email
      const captured: CapturedEmail = {
        id: `mock-email-${++this.emailCounter}`,
        from: (body.from as string) || '',
        to: body.to as string | string[],
        subject: (body.subject as string) || '',
        html: body.html as string | undefined,
        text: body.text as string | undefined,
        timestamp: new Date(),
        rawBody: body,
      };

      this.emails.push(captured);

      if (this.options.verbose) {
        console.log('[EmailMock] Captured email:', {
          to: captured.to,
          subject: captured.subject,
          type: this.classifyEmail(captured),
        });
      }

      // Simulate delay if configured
      if (this.options.responseDelay && this.options.responseDelay > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.options.responseDelay)
        );
      }

      // Return mock response
      if (this.options.simulateFailure) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              message: this.options.failureMessage,
              name: 'internal_server_error',
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: captured.id,
            from: captured.from,
            to: captured.to,
          }),
        });
      }
    } catch (error) {
      // If we can't parse the request, let it through
      console.error('[EmailMock] Error processing request:', error);
      await route.continue();
    }
  }

  /**
   * Handle local email API proxy requests
   */
  private async handleLocalEmailRequest(route: Route): Promise<void> {
    // For local API calls, we continue the request but could capture if needed
    await route.continue();
  }

  /**
   * Classify email type based on subject patterns
   */
  classifyEmail(email: CapturedEmail): EmailType {
    const subject = email.subject.toLowerCase();

    if (subject.includes('new vendor registration')) return 'vendor-registered';
    if (subject.includes('vendor registration') && subject.includes('approved'))
      return 'vendor-approved';
    if (subject.includes('vendor registration') && subject.includes('update'))
      return 'vendor-rejected';
    if (subject.includes('profile is now published')) return 'profile-published';
    if (subject.includes('profile submitted') && !subject.includes('review'))
      return 'profile-submitted-vendor';
    if (subject.includes('profile submitted for review'))
      return 'profile-submitted-admin';
    if (subject.includes('tier upgrade request:'))
      return 'tier-upgrade-requested';
    if (subject.includes('tier upgrade has been approved'))
      return 'tier-upgrade-approved';
    if (subject.includes('tier upgrade request update'))
      return 'tier-upgrade-rejected';
    if (subject.includes('tier downgrade request:'))
      return 'tier-downgrade-requested';
    if (subject.includes('tier downgrade has been approved'))
      return 'tier-downgrade-approved';
    if (subject.includes('tier downgrade request update'))
      return 'tier-downgrade-rejected';
    if (
      subject.includes('account has been approved') ||
      subject.includes('your account')
    )
      return 'user-approved';
    if (subject.includes('account status update')) return 'user-rejected';

    return 'unknown';
  }

  /**
   * Get all captured emails
   */
  getEmails(): CapturedEmail[] {
    return [...this.emails];
  }

  /**
   * Get emails filtered by type
   */
  getEmailsByType(type: EmailType): CapturedEmail[] {
    return this.emails.filter((email) => this.classifyEmail(email) === type);
  }

  /**
   * Get emails filtered by recipient
   */
  getEmailsByRecipient(recipient: string): CapturedEmail[] {
    return this.emails.filter((email) => {
      const to = Array.isArray(email.to) ? email.to : [email.to];
      return to.some((r) => r.toLowerCase() === recipient.toLowerCase());
    });
  }

  /**
   * Get the most recent email
   */
  getLastEmail(): CapturedEmail | undefined {
    return this.emails[this.emails.length - 1];
  }

  /**
   * Get email count
   */
  getEmailCount(): number {
    return this.emails.length;
  }

  /**
   * Clear all captured emails
   */
  clear(): void {
    this.emails = [];
    this.emailCounter = 0;
    if (this.options.verbose) {
      console.log('[EmailMock] Cleared captured emails');
    }
  }

  /**
   * Wait for a specific number of emails to be captured
   * Useful when email sending is async
   */
  async waitForEmails(
    count: number,
    timeout: number = 5000
  ): Promise<CapturedEmail[]> {
    const startTime = Date.now();

    while (this.emails.length < count) {
      if (Date.now() - startTime > timeout) {
        throw new Error(
          `Timeout waiting for ${count} emails. Only received ${this.emails.length}.`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return this.getEmails();
  }

  /**
   * Wait for an email of a specific type
   */
  async waitForEmailType(
    type: EmailType,
    timeout: number = 5000
  ): Promise<CapturedEmail> {
    const startTime = Date.now();

    while (true) {
      const matching = this.getEmailsByType(type);
      if (matching.length > 0) {
        return matching[matching.length - 1];
      }

      if (Date.now() - startTime > timeout) {
        throw new Error(
          `Timeout waiting for email of type '${type}'. Received types: ${this.emails.map((e) => this.classifyEmail(e)).join(', ') || 'none'}`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  /**
   * Assert that an email was sent with specific properties
   */
  assertEmailSent(expectations: {
    to?: string;
    subject?: string | RegExp;
    type?: EmailType;
    containsHtml?: string;
  }): CapturedEmail {
    const { to, subject, type, containsHtml } = expectations;

    let candidates = this.emails;

    if (to) {
      candidates = candidates.filter((email) => {
        const recipients = Array.isArray(email.to) ? email.to : [email.to];
        return recipients.some((r) => r.toLowerCase() === to.toLowerCase());
      });
    }

    if (subject) {
      candidates = candidates.filter((email) => {
        if (subject instanceof RegExp) {
          return subject.test(email.subject);
        }
        return email.subject.toLowerCase().includes(subject.toLowerCase());
      });
    }

    if (type) {
      candidates = candidates.filter(
        (email) => this.classifyEmail(email) === type
      );
    }

    if (containsHtml) {
      candidates = candidates.filter(
        (email) => email.html && email.html.includes(containsHtml)
      );
    }

    if (candidates.length === 0) {
      const allEmails = this.emails
        .map(
          (e) =>
            `- To: ${e.to}, Subject: "${e.subject}", Type: ${this.classifyEmail(e)}`
        )
        .join('\n');

      throw new Error(
        `No email found matching expectations:\n` +
          `  to: ${to || 'any'}\n` +
          `  subject: ${subject || 'any'}\n` +
          `  type: ${type || 'any'}\n` +
          `\nCaptured emails:\n${allEmails || '  (none)'}`
      );
    }

    return candidates[0];
  }

  /**
   * Assert that no emails were sent
   */
  assertNoEmailsSent(): void {
    if (this.emails.length > 0) {
      const emailList = this.emails
        .map(
          (e) =>
            `- To: ${e.to}, Subject: "${e.subject}", Type: ${this.classifyEmail(e)}`
        )
        .join('\n');

      throw new Error(`Expected no emails, but found:\n${emailList}`);
    }
  }

  /**
   * Clean up route interception
   */
  async teardown(): Promise<void> {
    // Playwright automatically cleans up routes when the page closes,
    // but we can clear our state
    this.emails = [];
    this.isSetup = false;

    if (this.options.verbose) {
      console.log('[EmailMock] Teardown complete');
    }
  }

  /**
   * Configure failure simulation (for error handling tests)
   */
  setSimulateFailure(
    simulate: boolean,
    message: string = 'Simulated email failure'
  ): void {
    this.options.simulateFailure = simulate;
    this.options.failureMessage = message;
  }
}

/**
 * Convenience function to create and setup an email mock
 */
export async function setupEmailMock(
  page: Page,
  options?: EmailMockOptions
): Promise<EmailMock> {
  const mock = new EmailMock(page, options);
  await mock.setup();
  return mock;
}

/**
 * Test fixture helper for consistent email mock setup/teardown
 */
function createEmailMockFixture(options?: EmailMockOptions) {
  return async ({ page }: { page: Page }, use: (mock: EmailMock) => Promise<void>) => {
    const mock = new EmailMock(page, options);
    await mock.setup();
    await use(mock);
    await mock.teardown();
  };
}

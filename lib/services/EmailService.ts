/**
 * EmailService - Email notification management using Resend
 *
 * Provides:
 * - Email sending for vendor registration and approval flows
 * - Email notifications for tier upgrade requests
 * - Template rendering with placeholder replacement
 * - Error handling with logging (best-effort delivery)
 *
 * Uses:
 * - Resend email API (https://resend.com)
 * - HTML email templates from lib/email-templates/*.html
 * - Environment variables for configuration
 *
 * Security:
 * - All email operations use try/catch (no thrown errors)
 * - Logs failures for debugging but never blocks
 * - Validates required environment variables on initialization
 */

import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

/**
 * Email operation result
 */
export interface EmailResult {
  success: boolean;
  error?: string;
}

/**
 * Data for vendor registration/approval emails
 */
export interface VendorEmailData {
  companyName: string;
  contactEmail: string;
  tier: string;
  vendorId: string;
  userId?: string;
}

/**
 * Data for user approval/rejection emails (when admin approves/rejects user account)
 */
export interface UserEmailData {
  email: string;
  vendorName?: string;
  rejectionReason?: string;
}

/**
 * Data for profile submission emails (when vendor submits profile for review)
 */
export interface ProfileSubmissionEmailData {
  companyName: string;
  contactEmail: string;
  vendorId: string;
  submissionDate?: string;
}

/**
 * Data for tier upgrade request emails
 */
export interface TierUpgradeEmailData {
  companyName: string;
  contactEmail: string;
  currentTier: string;
  requestedTier: string;
  vendorNotes?: string;
  rejectionReason?: string;
  requestId: string;
  vendorId: string;
}

/**
 * Tier features mapping for email templates
 */
interface TierFeatures {
  tier: string;
  features: string[];
  description: string;
}

/**
 * Check if emails should be sent
 *
 * Returns false if:
 * - DISABLE_EMAILS environment variable is set to 'true'
 * - E2E_TEST environment variable is set (Playwright sets this)
 * - Running in test environment with NODE_ENV=test
 *
 * This prevents test runs from sending real emails.
 */
function shouldSendEmails(): boolean {
  // Explicit disable flag
  if (process.env.DISABLE_EMAILS === 'true') {
    return false;
  }

  // E2E test environment (Playwright)
  if (process.env.E2E_TEST === 'true' || process.env.PLAYWRIGHT_TEST === 'true') {
    return false;
  }

  // Jest/Vitest test environment
  if (process.env.NODE_ENV === 'test') {
    return false;
  }

  return true;
}

/**
 * Initialize Resend client with API key
 */
function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(apiKey);
}

/**
 * Validate required email configuration
 *
 * Also checks if emails are disabled for testing.
 * Returns skipped=true if emails should not be sent.
 */
function validateEmailConfig(): {
  valid: boolean;
  errors: string[];
  skipped?: boolean;
} {
  // Check if emails are disabled (test environment)
  if (!shouldSendEmails()) {
    return {
      valid: false,
      errors: ['Emails disabled in test environment'],
      skipped: true,
    };
  }

  const errors: string[] = [];

  if (!process.env.RESEND_API_KEY) {
    errors.push('RESEND_API_KEY is not configured');
  }

  if (!process.env.EMAIL_FROM_ADDRESS) {
    errors.push('EMAIL_FROM_ADDRESS is not configured');
  }

  if (!process.env.ADMIN_EMAIL_ADDRESS) {
    errors.push('ADMIN_EMAIL_ADDRESS is not configured');
  }

  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    errors.push('NEXT_PUBLIC_BASE_URL is not configured');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Load HTML template from file
 * @param templateName - Name of template file (without .html extension)
 * @returns HTML template content
 */
function loadTemplate(templateName: string): string {
  try {
    const templatePath = path.join(
      process.cwd(),
      'lib/email-templates',
      `${templateName}.html`
    );
    return fs.readFileSync(templatePath, 'utf-8');
  } catch (error) {
    console.error(`Failed to load email template ${templateName}:`, error);
    return '';
  }
}

/**
 * Render template by replacing {{PLACEHOLDER}} variables with data values
 * @param template - HTML template with {{PLACEHOLDER}} variables
 * @param data - Object with values to replace
 * @returns Rendered HTML with placeholders replaced
 */
function renderTemplate(
  template: string,
  data: Record<string, string | undefined>
): string {
  let rendered = template;

  // Replace all {{VARIABLE}} placeholders with corresponding data values
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(placeholder, value || '');
  });

  return rendered;
}

/**
 * Get tier features for display in emails
 * @param tier - Tier name (free, tier1, tier2, tier3)
 * @returns Tier features object
 */
export function getTierFeatures(tier: string): TierFeatures {
  const tierFeaturesMap: Record<string, TierFeatures> = {
    free: {
      tier: 'Free',
      description: 'Basic vendor profile',
      features: [
        'Basic profile listing',
        'Contact information display',
      ],
    },
    tier1: {
      tier: 'Tier 1',
      description: 'Enhanced vendor profile',
      features: [
        'Enhanced profile',
        'Social media links',
        'Certifications & Awards',
        'Team members',
      ],
    },
    tier2: {
      tier: 'Tier 2',
      description: 'Full featured profile',
      features: [
        'Full product management',
        'Multiple locations',
        'Featured in category',
        'Advanced analytics',
      ],
    },
    tier3: {
      tier: 'Tier 3',
      description: 'Premium vendor profile',
      features: [
        'Premium promotion',
        'Homepage banner',
        'Priority placement',
        'Sponsored content',
      ],
    },
  };

  return (
    tierFeaturesMap[tier] || {
      tier: 'Unknown',
      description: 'Vendor profile',
      features: [],
    }
  );
}

/**
 * Send email notification when a new vendor registers
 * Notifies admin of new registration
 *
 * @param vendorData - Vendor information
 * @returns Email operation result
 */
export async function sendVendorRegisteredEmail(
  vendorData: VendorEmailData
): Promise<EmailResult> {
  try {
    const config = validateEmailConfig();
    if (!config.valid) {
      // If skipped due to test environment, return success
      if (config.skipped) {
        return { success: true };
      }
      console.error('Email configuration invalid:', config.errors);
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const resend = getResendClient();
    const template = loadTemplate('vendor-registered');

    if (!template) {
      throw new Error('Unable to load vendor-registered template');
    }

    // Link to user approval page (not vendor profile) since admin needs to approve user account first
    const adminReviewUrl = vendorData.userId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/admin/collections/users/${vendorData.userId}`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/admin/collections/users`;

    const html = renderTemplate(template, {
      COMPANY_NAME: vendorData.companyName,
      CONTACT_EMAIL: vendorData.contactEmail,
      VENDOR_ID: vendorData.vendorId,
      TIER: vendorData.tier,
      ADMIN_REVIEW_URL: adminReviewUrl,
      CURRENT_YEAR: new Date().getFullYear().toString(),
    });

    const subject = `New Vendor Registration: ${vendorData.companyName}`;

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'notifications@resend.dev',
      to: process.env.ADMIN_EMAIL_ADDRESS || '',
      subject,
      html,
    });

    if (result.error) {
      console.error('Failed to send vendor registered email:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending vendor registered email:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send email notification when a vendor's profile is published (made visible to public)
 * Notifies vendor that their profile is now live on the site
 *
 * @param vendorData - Vendor information
 * @returns Email operation result
 */
export async function sendProfilePublishedEmail(
  vendorData: VendorEmailData
): Promise<EmailResult> {
  try {
    const config = validateEmailConfig();
    if (!config.valid) {
      // If skipped due to test environment, return success
      if (config.skipped) {
        return { success: true };
      }
      console.error('Email configuration invalid:', config.errors);
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const resend = getResendClient();
    const template = loadTemplate('profile-published-vendor');

    if (!template) {
      throw new Error('Unable to load profile-published-vendor template');
    }

    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/vendor/dashboard`;
    const tierFeatures = getTierFeatures(vendorData.tier);

    const html = renderTemplate(template, {
      COMPANY_NAME: vendorData.companyName,
      VENDOR_ID: vendorData.vendorId,
      TIER: tierFeatures.tier,
      TIER_DESCRIPTION: tierFeatures.description,
      DASHBOARD_URL: dashboardUrl,
      CURRENT_YEAR: new Date().getFullYear().toString(),
    });

    const subject = 'Your Profile is Now Published - Paul Thames';

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'notifications@resend.dev',
      to: vendorData.contactEmail,
      subject,
      html,
    });

    if (result.error) {
      console.error('Failed to send profile published email:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending profile published email:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send email notification when a vendor registration is rejected
 * Notifies vendor of rejection with optional reason
 *
 * @param vendorData - Vendor information
 * @param reason - Optional rejection reason
 * @returns Email operation result
 */
export async function sendVendorRejectedEmail(
  vendorData: VendorEmailData,
  reason?: string
): Promise<EmailResult> {
  try {
    const config = validateEmailConfig();
    if (!config.valid) {
      // If skipped due to test environment, return success
      if (config.skipped) {
        return { success: true };
      }
      console.error('Email configuration invalid:', config.errors);
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const resend = getResendClient();
    const template = loadTemplate('vendor-rejected');

    if (!template) {
      throw new Error('Unable to load vendor-rejected template');
    }

    const html = renderTemplate(template, {
      COMPANY_NAME: vendorData.companyName,
      VENDOR_ID: vendorData.vendorId,
      REJECTION_REASON: reason || 'Your registration did not meet our requirements.',
      SUPPORT_EMAIL: process.env.ADMIN_EMAIL_ADDRESS || 'support@paulthames.com',
      CURRENT_YEAR: new Date().getFullYear().toString(),
    });

    const subject = 'Vendor Registration Update - Paul Thames';

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'notifications@resend.dev',
      to: vendorData.contactEmail,
      subject,
      html,
    });

    if (result.error) {
      console.error('Failed to send vendor rejected email:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending vendor rejected email:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send email notification when a vendor requests tier upgrade
 * Notifies admin of upgrade request requiring review
 *
 * @param requestData - Tier upgrade request information
 * @returns Email operation result
 */
export async function sendTierUpgradeRequestedEmail(
  requestData: TierUpgradeEmailData
): Promise<EmailResult> {
  try {
    const config = validateEmailConfig();
    if (!config.valid) {
      // If skipped due to test environment, return success
      if (config.skipped) {
        return { success: true };
      }
      console.error('Email configuration invalid:', config.errors);
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const resend = getResendClient();
    const template = loadTemplate('tier-upgrade-requested');

    if (!template) {
      throw new Error('Unable to load tier-upgrade-requested template');
    }

    const adminQueueUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/tier-requests/pending`;
    const currentTierFeatures = getTierFeatures(requestData.currentTier);
    const requestedTierFeatures = getTierFeatures(requestData.requestedTier);

    const html = renderTemplate(template, {
      COMPANY_NAME: requestData.companyName,
      VENDOR_ID: requestData.vendorId,
      REQUEST_ID: requestData.requestId,
      CURRENT_TIER: currentTierFeatures.tier,
      REQUESTED_TIER: requestedTierFeatures.tier,
      VENDOR_NOTES: requestData.vendorNotes || 'No additional notes provided',
      ADMIN_QUEUE_URL: adminQueueUrl,
      CURRENT_YEAR: new Date().getFullYear().toString(),
    });

    const subject = `Tier Upgrade Request: ${requestData.companyName} (${currentTierFeatures.tier} → ${requestedTierFeatures.tier})`;

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'notifications@resend.dev',
      to: process.env.ADMIN_EMAIL_ADDRESS || '',
      subject,
      html,
    });

    if (result.error) {
      console.error('Failed to send tier upgrade requested email:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending tier upgrade requested email:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send email notification when a tier upgrade request is approved
 * Notifies vendor of approval and new tier status
 *
 * @param requestData - Tier upgrade request information
 * @returns Email operation result
 */
export async function sendTierUpgradeApprovedEmail(
  requestData: TierUpgradeEmailData
): Promise<EmailResult> {
  try {
    const config = validateEmailConfig();
    if (!config.valid) {
      // If skipped due to test environment, return success
      if (config.skipped) {
        return { success: true };
      }
      console.error('Email configuration invalid:', config.errors);
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const resend = getResendClient();
    const template = loadTemplate('tier-upgrade-approved');

    if (!template) {
      throw new Error('Unable to load tier-upgrade-approved template');
    }

    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/vendor/dashboard`;
    const requestedTierFeatures = getTierFeatures(requestData.requestedTier);

    const featuresList = requestedTierFeatures.features
      .map((feature) => `<div style="margin: 8px 0;">- ${feature}</div>`)
      .join('');

    const html = renderTemplate(template, {
      COMPANY_NAME: requestData.companyName,
      VENDOR_ID: requestData.vendorId,
      REQUEST_ID: requestData.requestId,
      NEW_TIER: requestedTierFeatures.tier,
      TIER_DESCRIPTION: requestedTierFeatures.description,
      NEW_TIER_FEATURES: featuresList,
      DASHBOARD_URL: dashboardUrl,
      CURRENT_YEAR: new Date().getFullYear().toString(),
    });

    const subject = 'Your Tier Upgrade Has Been Approved - Paul Thames';

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'notifications@resend.dev',
      to: requestData.contactEmail,
      subject,
      html,
    });

    if (result.error) {
      console.error('Failed to send tier upgrade approved email:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending tier upgrade approved email:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send email notification when a tier upgrade request is rejected
 * Notifies vendor of rejection with reason
 *
 * @param requestData - Tier upgrade request information
 * @param reason - Rejection reason (required)
 * @returns Email operation result
 */
export async function sendTierUpgradeRejectedEmail(
  requestData: TierUpgradeEmailData,
  reason: string
): Promise<EmailResult> {
  try {
    const config = validateEmailConfig();
    if (!config.valid) {
      // If skipped due to test environment, return success
      if (config.skipped) {
        return { success: true };
      }
      console.error('Email configuration invalid:', config.errors);
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const resend = getResendClient();
    const template = loadTemplate('tier-upgrade-rejected');

    if (!template) {
      throw new Error('Unable to load tier-upgrade-rejected template');
    }

    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/vendor/dashboard`;
    const currentTierFeatures = getTierFeatures(requestData.currentTier);
    const requestedTierFeatures = getTierFeatures(requestData.requestedTier);

    const html = renderTemplate(template, {
      COMPANY_NAME: requestData.companyName,
      VENDOR_ID: requestData.vendorId,
      REQUEST_ID: requestData.requestId,
      CURRENT_TIER: currentTierFeatures.tier,
      REQUESTED_TIER: requestedTierFeatures.tier,
      REJECTION_REASON: reason,
      DASHBOARD_URL: dashboardUrl,
      SUPPORT_EMAIL: process.env.ADMIN_EMAIL_ADDRESS || 'support@paulthames.com',
      CURRENT_YEAR: new Date().getFullYear().toString(),
    });

    const subject = 'Tier Upgrade Request Update - Paul Thames';

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'notifications@resend.dev',
      to: requestData.contactEmail,
      subject,
      html,
    });

    if (result.error) {
      console.error('Failed to send tier upgrade rejected email:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending tier upgrade rejected email:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send email notification when a vendor requests tier downgrade
 * Notifies admin of downgrade request requiring review
 *
 * @param requestData - Tier downgrade request information
 * @returns Email operation result
 */
export async function sendTierDowngradeRequestedEmail(
  requestData: TierUpgradeEmailData
): Promise<EmailResult> {
  try {
    const config = validateEmailConfig();
    if (!config.valid) {
      // If skipped due to test environment, return success
      if (config.skipped) {
        return { success: true };
      }
      console.error('Email configuration invalid:', config.errors);
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const resend = getResendClient();
    const template = loadTemplate('tier-downgrade-requested');

    if (!template) {
      throw new Error('Unable to load tier-downgrade-requested template');
    }

    const adminQueueUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/tier-requests/pending`;
    const currentTierFeatures = getTierFeatures(requestData.currentTier);
    const requestedTierFeatures = getTierFeatures(requestData.requestedTier);

    const html = renderTemplate(template, {
      COMPANY_NAME: requestData.companyName,
      VENDOR_ID: requestData.vendorId,
      REQUEST_ID: requestData.requestId,
      CURRENT_TIER: currentTierFeatures.tier,
      REQUESTED_TIER: requestedTierFeatures.tier,
      VENDOR_NOTES: requestData.vendorNotes || 'No additional notes provided',
      CONTACT_EMAIL: requestData.contactEmail,
      ADMIN_REVIEW_URL: adminQueueUrl,
      SUPPORT_EMAIL: process.env.ADMIN_EMAIL_ADDRESS || 'support@paulthames.com',
      CURRENT_YEAR: new Date().getFullYear().toString(),
    });

    const subject = `Tier Downgrade Request: ${requestData.companyName} (${currentTierFeatures.tier} → ${requestedTierFeatures.tier})`;

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'notifications@resend.dev',
      to: process.env.ADMIN_EMAIL_ADDRESS || '',
      subject,
      html,
    });

    if (result.error) {
      console.error('Failed to send tier downgrade requested email:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending tier downgrade requested email:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send email notification when a tier downgrade request is approved
 * Notifies vendor of approval and new tier status
 *
 * @param requestData - Tier downgrade request information
 * @returns Email operation result
 */
export async function sendTierDowngradeApprovedEmail(
  requestData: TierUpgradeEmailData
): Promise<EmailResult> {
  try {
    const config = validateEmailConfig();
    if (!config.valid) {
      // If skipped due to test environment, return success
      if (config.skipped) {
        return { success: true };
      }
      console.error('Email configuration invalid:', config.errors);
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const resend = getResendClient();
    const template = loadTemplate('tier-downgrade-approved');

    if (!template) {
      throw new Error('Unable to load tier-downgrade-approved template');
    }

    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/vendor/dashboard`;
    const currentTierFeatures = getTierFeatures(requestData.currentTier);
    const requestedTierFeatures = getTierFeatures(requestData.requestedTier);

    const featuresList = requestedTierFeatures.features
      .map((feature) => `<div style="margin: 8px 0;">- ${feature}</div>`)
      .join('');

    const html = renderTemplate(template, {
      COMPANY_NAME: requestData.companyName,
      VENDOR_ID: requestData.vendorId,
      REQUEST_ID: requestData.requestId,
      PREVIOUS_TIER: currentTierFeatures.tier,
      NEW_TIER: requestedTierFeatures.tier,
      REQUESTED_TIER: requestedTierFeatures.tier,
      NEW_TIER_FEATURES: featuresList,
      DASHBOARD_URL: dashboardUrl,
      SUPPORT_EMAIL: process.env.ADMIN_EMAIL_ADDRESS || 'support@paulthames.com',
      CURRENT_YEAR: new Date().getFullYear().toString(),
    });

    const subject = 'Your Tier Downgrade Has Been Approved - Paul Thames';

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'notifications@resend.dev',
      to: requestData.contactEmail,
      subject,
      html,
    });

    if (result.error) {
      console.error('Failed to send tier downgrade approved email:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending tier downgrade approved email:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send email notification when a tier downgrade request is rejected
 * Notifies vendor of rejection with reason
 *
 * @param requestData - Tier downgrade request information
 * @param reason - Rejection reason (required)
 * @returns Email operation result
 */
export async function sendTierDowngradeRejectedEmail(
  requestData: TierUpgradeEmailData,
  reason: string
): Promise<EmailResult> {
  try {
    const config = validateEmailConfig();
    if (!config.valid) {
      // If skipped due to test environment, return success
      if (config.skipped) {
        return { success: true };
      }
      console.error('Email configuration invalid:', config.errors);
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const resend = getResendClient();
    const template = loadTemplate('tier-downgrade-rejected');

    if (!template) {
      throw new Error('Unable to load tier-downgrade-rejected template');
    }

    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/vendor/dashboard`;
    const currentTierFeatures = getTierFeatures(requestData.currentTier);
    const requestedTierFeatures = getTierFeatures(requestData.requestedTier);

    const html = renderTemplate(template, {
      COMPANY_NAME: requestData.companyName,
      VENDOR_ID: requestData.vendorId,
      REQUEST_ID: requestData.requestId,
      CURRENT_TIER: currentTierFeatures.tier,
      REQUESTED_TIER: requestedTierFeatures.tier,
      REJECTION_REASON: reason,
      DASHBOARD_URL: dashboardUrl,
      SUPPORT_EMAIL: process.env.ADMIN_EMAIL_ADDRESS || 'support@paulthames.com',
      CURRENT_YEAR: new Date().getFullYear().toString(),
    });

    const subject = 'Tier Downgrade Request Update - Paul Thames';

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'notifications@resend.dev',
      to: requestData.contactEmail,
      subject,
      html,
    });

    if (result.error) {
      console.error('Failed to send tier downgrade rejected email:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending tier downgrade rejected email:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send email notification when a user account is approved
 * Notifies the user that their account is now active
 *
 * @param userData - User information
 * @returns Email operation result
 */
export async function sendUserApprovedEmail(
  userData: UserEmailData
): Promise<EmailResult> {
  try {
    const config = validateEmailConfig();
    if (!config.valid) {
      // If skipped due to test environment, return success
      if (config.skipped) {
        return { success: true };
      }
      console.error('Email configuration invalid:', config.errors);
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const resend = getResendClient();
    const template = loadTemplate('user-approved');

    if (!template) {
      throw new Error('Unable to load user-approved template');
    }

    const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/vendor/login`;

    const html = renderTemplate(template, {
      loginUrl,
      CURRENT_YEAR: new Date().getFullYear().toString(),
    });

    const subject = 'Your Account Has Been Approved - Paul Thames';

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'notifications@resend.dev',
      to: userData.email,
      subject,
      html,
    });

    if (result.error) {
      console.error('Failed to send user approved email:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending user approved email:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send email notification when a user account is rejected
 * Notifies the user that their account application was not approved
 *
 * @param userData - User information including rejection reason
 * @returns Email operation result
 */
export async function sendUserRejectedEmail(
  userData: UserEmailData
): Promise<EmailResult> {
  try {
    const config = validateEmailConfig();
    if (!config.valid) {
      // If skipped due to test environment, return success
      if (config.skipped) {
        return { success: true };
      }
      console.error('Email configuration invalid:', config.errors);
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const resend = getResendClient();
    const template = loadTemplate('user-rejected');

    if (!template) {
      throw new Error('Unable to load user-rejected template');
    }

    const contactUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/contact`;

    const html = renderTemplate(template, {
      vendorName: userData.vendorName || 'Valued Applicant',
      rejectionReason:
        userData.rejectionReason ||
        'Your application did not meet our current requirements.',
      contactUrl,
      CURRENT_YEAR: new Date().getFullYear().toString(),
    });

    const subject = 'Account Status Update - Paul Thames';

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'notifications@resend.dev',
      to: userData.email,
      subject,
      html,
    });

    if (result.error) {
      console.error('Failed to send user rejected email:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending user rejected email:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send email notification to admin when a vendor submits their profile for review
 * Triggered when profileSubmitted is set to true
 *
 * @param profileData - Profile submission information
 * @returns Email operation result
 */
export async function sendProfileSubmittedAdminEmail(
  profileData: ProfileSubmissionEmailData
): Promise<EmailResult> {
  try {
    const config = validateEmailConfig();
    if (!config.valid) {
      // If skipped due to test environment, return success
      if (config.skipped) {
        return { success: true };
      }
      console.error('Email configuration invalid:', config.errors);
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const resend = getResendClient();
    const template = loadTemplate('profile-submitted-admin');

    if (!template) {
      throw new Error('Unable to load profile-submitted-admin template');
    }

    const adminUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/admin/collections/vendors/${profileData.vendorId}`;
    const submissionDate =
      profileData.submissionDate ||
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

    const html = renderTemplate(template, {
      vendorName: profileData.companyName,
      vendorEmail: profileData.contactEmail,
      submissionDate,
      adminUrl,
      CURRENT_YEAR: new Date().getFullYear().toString(),
    });

    const subject = `Profile Submitted for Review: ${profileData.companyName}`;

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'notifications@resend.dev',
      to: process.env.ADMIN_EMAIL_ADDRESS || '',
      subject,
      html,
    });

    if (result.error) {
      console.error(
        'Failed to send profile submitted admin email:',
        result.error
      );
      return {
        success: false,
        error: result.error.message,
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending profile submitted admin email:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send email notification to vendor when they submit their profile for review
 * Confirms receipt of profile submission
 *
 * @param profileData - Profile submission information
 * @returns Email operation result
 */
export async function sendProfileSubmittedVendorEmail(
  profileData: ProfileSubmissionEmailData
): Promise<EmailResult> {
  try {
    const config = validateEmailConfig();
    if (!config.valid) {
      // If skipped due to test environment, return success
      if (config.skipped) {
        return { success: true };
      }
      console.error('Email configuration invalid:', config.errors);
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const resend = getResendClient();
    const template = loadTemplate('profile-submitted-vendor');

    if (!template) {
      throw new Error('Unable to load profile-submitted-vendor template');
    }

    const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/vendor/dashboard`;

    const html = renderTemplate(template, {
      vendorName: profileData.companyName,
      loginUrl,
      CURRENT_YEAR: new Date().getFullYear().toString(),
    });

    const subject = 'Profile Submitted for Review - Paul Thames';

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || 'notifications@resend.dev',
      to: profileData.contactEmail,
      subject,
      html,
    });

    if (result.error) {
      console.error(
        'Failed to send profile submitted vendor email:',
        result.error
      );
      return {
        success: false,
        error: result.error.message,
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      'Error sending profile submitted vendor email:',
      errorMessage
    );
    return {
      success: false,
      error: errorMessage,
    };
  }
}

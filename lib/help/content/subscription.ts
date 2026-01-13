import type { SectionHelp } from '../types';

/**
 * Help content for subscription management
 */
export const subscriptionHelp: SectionHelp = {
  sectionId: 'subscription',
  title: 'Subscription Management',
  description: 'Manage your subscription plan and billing information',
  fields: [
    {
      fieldName: 'currentPlan',
      tooltip: {
        text: 'Your current subscription tier and its included features.',
        title: 'Current Plan',
      },
    },
    {
      fieldName: 'billingCycle',
      tooltip: {
        text: 'Choose between monthly or annual billing. Annual plans include a discount.',
        title: 'Billing Cycle',
      },
    },
    {
      fieldName: 'upgradePlan',
      tooltip: {
        text: 'Upgrade to a higher tier to unlock additional features and visibility.',
        title: 'Upgrade Options',
        learnMoreUrl: '/tiers',
      },
    },
    {
      fieldName: 'downgradePlan',
      tooltip: {
        text: 'Downgrading takes effect at the end of your current billing period.',
        title: 'Downgrade Options',
      },
    },
    {
      fieldName: 'cancelSubscription',
      tooltip: {
        text: 'Cancel your subscription. Your profile will revert to the free tier at the end of the billing period.',
        title: 'Cancel Subscription',
      },
    },
    {
      fieldName: 'paymentMethod',
      tooltip: {
        text: 'Your saved payment method for recurring subscription charges.',
        title: 'Payment Method',
      },
    },
    {
      fieldName: 'invoiceHistory',
      tooltip: {
        text: 'View and download past invoices for your records.',
        title: 'Invoice History',
      },
    },
  ],
};

export default subscriptionHelp;

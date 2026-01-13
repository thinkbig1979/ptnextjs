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

/**
 * FAQ content for subscription management
 */
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const subscriptionFAQ: FAQItem[] = [
  {
    id: 'upgrade-approval-time',
    question: 'How long does upgrade approval take?',
    answer: 'Usually within 1-2 business days. Our team reviews each upgrade request to ensure the best fit for your business needs. You will receive an email notification once your request is processed.',
  },
  {
    id: 'downgrade-consequences',
    question: 'What happens when I downgrade?',
    answer: 'Features are archived, not deleted. When you downgrade, content that exceeds your new tier limits (like extra locations or products) will be hidden from public view but preserved in your account. If you upgrade again later, your content will be restored.',
  },
  {
    id: 'cancel-pending-request',
    question: 'Can I cancel a pending request?',
    answer: 'Yes, contact support. If you have a pending upgrade or downgrade request that you wish to cancel, please reach out to our support team and they will assist you with cancelling the request.',
  },
  {
    id: 'data-on-downgrade',
    question: 'Will I lose my data on downgrade?',
    answer: 'Data is preserved but hidden. Your content, including products, locations, team members, and media are not deleted when you downgrade. They are simply hidden from public view until you upgrade to a tier that supports them again.',
  },
  {
    id: 'upgrade-process',
    question: 'How does the upgrade process work?',
    answer: 'Submit a request, get reviewed, then activated. After you submit an upgrade request, our team will review it within 1-2 business days. Once approved, your new tier features will be immediately available, and you can start adding more products, locations, and content.',
  },
  {
    id: 'downgrade-timing',
    question: 'When does a downgrade take effect?',
    answer: 'Immediately upon approval. Unlike billing-based subscriptions, tier changes on this platform take effect as soon as they are approved by our team. Make sure you are prepared for the feature limitations before requesting a downgrade.',
  },
];

export default subscriptionHelp;

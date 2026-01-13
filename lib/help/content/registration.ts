import type { SectionHelp } from '../types';

/**
 * Help content for the vendor registration form
 */
export const registrationHelp: SectionHelp = {
  sectionId: 'registration',
  title: 'Vendor Registration',
  description: 'Create your vendor account to join the Paul Thames network',
  fields: [
    {
      fieldName: 'email',
      tooltip: {
        text: 'Business email for account login and notifications.',
        title: 'Email',
      },
      placeholder: 'vendor@company.com',
    },
    {
      fieldName: 'password',
      tooltip: {
        text: '12+ characters with uppercase, lowercase, number, and special character.',
        title: 'Password Requirements',
      },
    },
    {
      fieldName: 'confirmPassword',
      tooltip: {
        text: 'Re-enter your password to confirm.',
        title: 'Confirm Password',
      },
    },
    {
      fieldName: 'companyName',
      tooltip: {
        text: 'Your official business name as it will appear on your profile.',
        title: 'Company Name',
      },
      placeholder: 'Your Company Name',
      characterLimits: {
        min: 2,
        max: 100,
      },
    },
  ],
};

export default registrationHelp;

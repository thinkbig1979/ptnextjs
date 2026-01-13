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
        text: 'Your business email will be used for account verification and communications.',
        title: 'Business Email',
      },
      placeholder: 'vendor@company.com',
    },
    {
      fieldName: 'password',
      tooltip: {
        text: 'Choose a strong password with at least 8 characters.',
        title: 'Password',
      },
    },
    {
      fieldName: 'companyName',
      tooltip: {
        text: 'Enter your company\'s official business name as registered.',
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

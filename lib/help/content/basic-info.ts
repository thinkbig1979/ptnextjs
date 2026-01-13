import type { SectionHelp } from '../types';

/**
 * Help content for the vendor basic information section
 */
export const basicInfoHelp: SectionHelp = {
  sectionId: 'basic-info',
  title: 'Basic Information',
  description: 'Core details about your company that will appear on your profile',
  fields: [
    {
      fieldName: 'companyName',
      tooltip: {
        text: 'Your company name as it should appear on your public profile.',
        title: 'Company Name',
      },
      placeholder: 'Your Company Name',
      characterLimits: {
        min: 2,
        max: 100,
      },
    },
    {
      fieldName: 'description',
      tooltip: {
        text: 'A brief overview of your company and services. This appears in search results.',
        title: 'Company Description',
      },
      placeholder: 'Describe your company and the services you provide...',
      characterLimits: {
        min: 50,
        max: 500,
      },
    },
    {
      fieldName: 'website',
      tooltip: {
        text: 'Your company website URL. Include the full URL with https://.',
        title: 'Website',
      },
      placeholder: 'https://www.yourcompany.com',
    },
    {
      fieldName: 'phone',
      tooltip: {
        text: 'Primary contact phone number for your business.',
        title: 'Phone Number',
      },
      placeholder: '+1 (555) 123-4567',
    },
    {
      fieldName: 'email',
      tooltip: {
        text: 'Primary business contact email for customer inquiries.',
        title: 'Contact Email',
      },
      placeholder: 'contact@yourcompany.com',
    },
  ],
};

export default basicInfoHelp;

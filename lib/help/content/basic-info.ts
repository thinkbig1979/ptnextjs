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
        text: 'Your official business name as customers will see it.',
        title: 'Company Name',
      },
      placeholder: 'e.g., Acme Marine Services',
      characterLimits: {
        min: 2,
        max: 100,
      },
    },
    {
      fieldName: 'slug',
      tooltip: {
        text: 'Your unique URL path. This cannot be changed after creation and is used to identify your company in web addresses.',
        title: 'URL Slug',
      },
      placeholder: 'your-company-name',
      examples: ['/vendors/your-company-name'],
    },
    {
      fieldName: 'description',
      tooltip: {
        text: 'Brief summary shown in search results and profile header. Make it compelling to attract customers.',
        title: 'Company Description',
      },
      placeholder: 'Describe your company and the services you provide...',
      characterLimits: {
        min: 10,
        max: 500,
      },
    },
    {
      fieldName: 'logoUrl',
      tooltip: {
        text: 'Direct link to your company logo image. For best results, use a square image (recommended: 400x400px PNG or JPG).',
        title: 'Logo URL',
      },
      placeholder: 'https://example.com/your-logo.png',
    },
    {
      fieldName: 'contactEmail',
      tooltip: {
        text: 'Public email displayed on your profile for customer inquiries. This will be visible to all visitors.',
        title: 'Contact Email',
      },
      placeholder: 'contact@yourcompany.com',
    },
    {
      fieldName: 'contactPhone',
      tooltip: {
        text: 'Business phone for customer inquiries. This field is optional but recommended for better accessibility.',
        title: 'Contact Phone',
      },
      placeholder: '+1 (555) 123-4567',
    },
  ],
};

export default basicInfoHelp;

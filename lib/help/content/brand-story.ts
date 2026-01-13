import type { SectionHelp } from '../types';

/**
 * Help content for the vendor brand story section
 */
export const brandStoryHelp: SectionHelp = {
  sectionId: 'brand-story',
  title: 'Brand Story',
  description: 'Tell your company story and build trust with potential customers',
  fields: [
    {
      fieldName: 'headline',
      tooltip: {
        text: 'A compelling headline that captures your company\'s essence. This appears prominently on your profile.',
        title: 'Brand Headline',
      },
      placeholder: 'Excellence in Yacht Services Since 1995',
      characterLimits: {
        min: 10,
        max: 100,
      },
    },
    {
      fieldName: 'story',
      tooltip: {
        text: 'Share your company\'s history, mission, and what sets you apart. Be authentic and engaging.',
        title: 'Company Story',
      },
      placeholder: 'Tell your company story...',
      characterLimits: {
        min: 100,
        max: 2000,
      },
    },
    {
      fieldName: 'mission',
      tooltip: {
        text: 'Your company\'s mission statement or core purpose.',
        title: 'Mission Statement',
      },
      placeholder: 'Our mission is to...',
      characterLimits: {
        max: 300,
      },
    },
    {
      fieldName: 'values',
      tooltip: {
        text: 'Key values that guide your business practices and customer relationships.',
        title: 'Core Values',
      },
      examples: ['Quality', 'Integrity', 'Innovation', 'Customer Focus'],
    },
    {
      fieldName: 'yearFounded',
      tooltip: {
        text: 'The year your company was established.',
        title: 'Year Founded',
      },
      placeholder: '1995',
    },
    {
      fieldName: 'teamSize',
      tooltip: {
        text: 'Approximate number of employees or team members.',
        title: 'Team Size',
      },
    },
    {
      fieldName: 'certifications',
      tooltip: {
        text: 'Industry certifications, accreditations, or memberships that demonstrate your expertise.',
        title: 'Certifications & Accreditations',
      },
      examples: ['ISO 9001', 'ABYC Certified', 'IYBA Member'],
    },
  ],
};

export default brandStoryHelp;

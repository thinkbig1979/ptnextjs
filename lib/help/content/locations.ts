import type { SectionHelp } from '../types';

/**
 * Help content for vendor locations management
 */
export const locationsHelp: SectionHelp = {
  sectionId: 'locations',
  title: 'Business Locations',
  description: 'Manage your business locations to help customers find you',
  fields: [
    {
      fieldName: 'locationName',
      tooltip: {
        text: 'A descriptive name for this location (e.g., "Main Office", "Fort Lauderdale Marina").',
        title: 'Location Name',
      },
      placeholder: 'Main Office',
      characterLimits: {
        max: 100,
      },
    },
    {
      fieldName: 'address',
      tooltip: {
        text: 'Full street address including suite/unit number if applicable.',
        title: 'Street Address',
      },
      placeholder: '123 Marina Blvd, Suite 100',
    },
    {
      fieldName: 'city',
      tooltip: {
        text: 'City where this location is situated.',
        title: 'City',
      },
      placeholder: 'Fort Lauderdale',
    },
    {
      fieldName: 'state',
      tooltip: {
        text: 'State or province for this location.',
        title: 'State/Province',
      },
      placeholder: 'Florida',
    },
    {
      fieldName: 'country',
      tooltip: {
        text: 'Country where this location operates.',
        title: 'Country',
      },
      placeholder: 'United States',
    },
    {
      fieldName: 'postalCode',
      tooltip: {
        text: 'Postal or ZIP code for this location.',
        title: 'Postal Code',
      },
      placeholder: '33316',
    },
    {
      fieldName: 'isPrimary',
      tooltip: {
        text: 'Mark this as your primary business location. This will be shown prominently on your profile.',
        title: 'Primary Location',
      },
    },
  ],
};

export default locationsHelp;

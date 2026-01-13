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
        text: 'Full street address for accurate geocoding and customer visits. Include suite/unit number if applicable.',
        title: 'Street Address',
      },
      placeholder: '123 Marina Blvd, Suite 100',
    },
    {
      fieldName: 'city',
      tooltip: {
        text: 'City name - required for map display and search filters.',
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
        text: 'Country - required for regional search and filtering.',
        title: 'Country',
      },
      placeholder: 'United States',
    },
    {
      fieldName: 'postalCode',
      tooltip: {
        text: 'Postal/ZIP code - helps with local search results.',
        title: 'Postal Code',
      },
      placeholder: '33316',
    },
    {
      fieldName: 'isHQ',
      tooltip: {
        text: 'Mark one location as your headquarters. This appears as your primary location on your profile.',
        title: 'Headquarters',
      },
    },
    {
      fieldName: 'geocoding',
      tooltip: {
        text: 'Converts your address to map coordinates. Enter a complete address first, then click to verify location on map.',
        title: 'Find Coordinates',
      },
    },
    {
      fieldName: 'tierLimits',
      tooltip: {
        text: 'Location limits by tier: Free/Tier 1 allows 1 location (HQ only), Tier 2 allows up to 5 locations, Tier 3 allows unlimited locations.',
        title: 'Location Limits',
      },
    },
  ],
};

export default locationsHelp;

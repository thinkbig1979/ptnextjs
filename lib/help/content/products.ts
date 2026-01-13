import type { SectionHelp } from '../types';

/**
 * Help content for vendor products management
 */
export const productsHelp: SectionHelp = {
  sectionId: 'products',
  title: 'Products & Services',
  description: 'Showcase your products and services to potential customers',
  fields: [
    {
      fieldName: 'productName',
      tooltip: {
        text: 'The name of your product or service as it will appear in listings.',
        title: 'Product Name',
      },
      placeholder: 'Premium Yacht Detailing',
      characterLimits: {
        min: 3,
        max: 100,
      },
    },
    {
      fieldName: 'productDescription',
      tooltip: {
        text: 'Detailed description of your product or service, including key features and benefits.',
        title: 'Product Description',
      },
      placeholder: 'Describe your product or service in detail...',
      characterLimits: {
        min: 50,
        max: 1000,
      },
    },
    {
      fieldName: 'category',
      tooltip: {
        text: 'Select the category that best describes this product or service.',
        title: 'Category',
      },
    },
    {
      fieldName: 'price',
      tooltip: {
        text: 'Base price for this product or service. Leave blank for "Contact for pricing".',
        title: 'Price',
      },
      placeholder: '0.00',
    },
    {
      fieldName: 'productImage',
      tooltip: {
        text: 'Upload a high-quality image of your product. Recommended size: 800x600 pixels.',
        title: 'Product Image',
      },
    },
  ],
};

export default productsHelp;

import type { SectionHelp } from '../types';

/**
 * Help content for vendor products management
 * Covers all 8 sections of the EnhancedProductForm
 */
export const productsHelp: SectionHelp = {
  sectionId: 'products',
  title: 'Products & Services',
  description: 'Showcase your products and services to potential customers',
  fields: [
    // === Basic Information Section ===
    {
      fieldName: 'name',
      tooltip: {
        text: 'Clear, descriptive name customers will search for. Use specific terms that describe your product.',
        title: 'Product Name',
      },
      formDescription: 'The name as it will appear in search results and listings.',
      placeholder: 'Premium Marine Navigation System X5',
      characterLimits: {
        min: 3,
        max: 255,
      },
    },
    {
      fieldName: 'description',
      tooltip: {
        text: 'Comprehensive description including key features, benefits, and use cases. Rich formatting is supported.',
        title: 'Full Description',
      },
      formDescription: 'Detailed description shown on the product page.',
      placeholder: 'Describe your product in detail including features, specifications, and benefits...',
    },
    {
      fieldName: 'shortDescription',
      tooltip: {
        text: 'Appears in product cards and search results. Keep it concise and impactful.',
        title: 'Short Description',
      },
      formDescription: 'Brief summary for listings and search results (max 500 characters).',
      placeholder: 'A brief, compelling summary of your product...',
      characterLimits: {
        max: 500,
      },
    },
    {
      fieldName: 'slug',
      tooltip: {
        text: 'URL path for this product. Auto-generated from the name but can be customized. Use lowercase letters, numbers, and hyphens only.',
        title: 'URL Slug',
      },
      formDescription: 'Auto-generated from product name. Edit to customize the URL.',
      placeholder: 'premium-marine-navigation-system-x5',
      characterLimits: {
        max: 255,
      },
    },

    // === Pricing Section ===
    {
      fieldName: 'price',
      tooltip: {
        text: 'Display text for pricing. Can include currency symbols, ranges, or "Contact for Quote" for custom pricing.',
        title: 'Price Display',
      },
      formDescription: 'How the price appears on your product page.',
      placeholder: 'From $12,500 or Contact for Quote',
      characterLimits: {
        max: 100,
      },
    },
    {
      fieldName: 'pricing.subtitle',
      tooltip: {
        text: 'Additional context like "Installed price", "Starting from", or "Per unit".',
        title: 'Pricing Subtitle',
      },
      formDescription: 'Optional additional context for the price.',
      placeholder: 'Installed price includes commissioning',
      characterLimits: {
        max: 200,
      },
    },
    {
      fieldName: 'pricing.currency',
      tooltip: {
        text: 'Select the currency for your product pricing.',
        title: 'Currency',
      },
      formDescription: 'Currency for this product.',
    },
    {
      fieldName: 'pricing.showContactForm',
      tooltip: {
        text: 'Enable to display a contact form for pricing inquiries and custom quotes.',
        title: 'Contact Form',
      },
      formDescription: 'Show a contact form for customers to request quotes.',
    },

    // === Images Section ===
    {
      fieldName: 'images',
      tooltip: {
        text: 'First image becomes the main product image. Recommended: 1200x800px, JPEG or PNG format. Use high-quality images for best results.',
        title: 'Product Images',
      },
      formDescription: 'Add multiple product images. Click the star to set the main image.',
    },
    {
      fieldName: 'images.altText',
      tooltip: {
        text: 'Describe the image for screen readers and search engines. Good alt text improves accessibility and SEO.',
        title: 'Alt Text',
      },
      formDescription: 'Brief description for accessibility.',
      placeholder: 'Marine navigation system mounted on yacht bridge',
    },
    {
      fieldName: 'images.caption',
      tooltip: {
        text: 'Optional caption displayed below the image in galleries.',
        title: 'Image Caption',
      },
      placeholder: 'X5 Navigation System - Bridge Installation',
    },

    // === Specifications Section ===
    {
      fieldName: 'specifications',
      tooltip: {
        text: 'Technical details displayed as label-value pairs. Include dimensions, weight, power requirements, and other specs customers need.',
        title: 'Technical Specifications',
      },
      formDescription: 'Add technical details like dimensions, weight, and requirements.',
      examples: ['Display Size: 15 inches', 'Weight: 12.5 kg', 'Power: 12-24V DC'],
    },
    {
      fieldName: 'specifications.label',
      tooltip: {
        text: 'The specification name or property.',
        title: 'Specification Label',
      },
      placeholder: 'Display Size',
      characterLimits: {
        max: 100,
      },
    },
    {
      fieldName: 'specifications.value',
      tooltip: {
        text: 'The specification value including units where applicable.',
        title: 'Specification Value',
      },
      placeholder: '15 inches',
      characterLimits: {
        max: 500,
      },
    },

    // === Features Section ===
    {
      fieldName: 'features',
      tooltip: {
        text: 'Key features and benefits that set your product apart. Add icons for visual appeal.',
        title: 'Key Features',
      },
      formDescription: 'Highlight capabilities and benefits with optional icons.',
    },
    {
      fieldName: 'features.title',
      tooltip: {
        text: 'Short, compelling feature headline.',
        title: 'Feature Title',
      },
      placeholder: 'Real-time GPS Tracking',
      characterLimits: {
        max: 200,
      },
    },
    {
      fieldName: 'features.description',
      tooltip: {
        text: 'Brief explanation of the feature and its benefit to the customer.',
        title: 'Feature Description',
      },
      placeholder: 'Track vessel position with sub-meter accuracy in real-time...',
      characterLimits: {
        max: 1000,
      },
    },
    {
      fieldName: 'features.icon',
      tooltip: {
        text: 'Optional icon to visually represent this feature.',
        title: 'Feature Icon',
      },
    },

    // === Action Buttons Section ===
    {
      fieldName: 'actionButtons',
      tooltip: {
        text: 'Call-to-action buttons displayed on the product page. Common options include Contact, Request Quote, Download Brochure, and Watch Video.',
        title: 'Action Buttons',
      },
      formDescription: 'Add buttons for contact, quotes, downloads, and external links.',
    },
    {
      fieldName: 'actionButtons.label',
      tooltip: {
        text: 'The text displayed on the button. Keep it short and action-oriented.',
        title: 'Button Label',
      },
      placeholder: 'Request Quote',
      characterLimits: {
        max: 100,
      },
    },
    {
      fieldName: 'actionButtons.type',
      tooltip: {
        text: 'Visual style of the button. Primary for main action, Secondary/Outline for alternatives.',
        title: 'Button Style',
      },
    },
    {
      fieldName: 'actionButtons.action',
      tooltip: {
        text: 'What happens when the button is clicked: Contact opens email, Quote shows form, Download/Link opens URL.',
        title: 'Button Action',
      },
    },
    {
      fieldName: 'actionButtons.actionData',
      tooltip: {
        text: 'URL for download, external link, or video actions.',
        title: 'Action URL',
      },
      placeholder: 'https://example.com/brochure.pdf',
    },

    // === Badges Section ===
    {
      fieldName: 'badges',
      tooltip: {
        text: "Visual labels highlighting certifications, awards, or status indicators like 'New', 'Sale', or 'Popular'.",
        title: 'Quality Badges',
      },
      formDescription: 'Add badges for certifications, awards, and status indicators.',
    },
    {
      fieldName: 'badges.label',
      tooltip: {
        text: 'The text displayed in the badge.',
        title: 'Badge Text',
      },
      placeholder: 'ISO 9001 Certified',
      characterLimits: {
        max: 100,
      },
    },
    {
      fieldName: 'badges.type',
      tooltip: {
        text: 'Badge color style: Success (green) for certifications, Info (blue) for features, Warning (yellow) for notices.',
        title: 'Badge Style',
      },
    },

    // === Categories & Tags Section ===
    {
      fieldName: 'categories',
      tooltip: {
        text: 'Select categories that best describe your product. Multiple categories improve discoverability.',
        title: 'Product Categories',
      },
      formDescription: 'Help customers find your product by selecting relevant categories.',
    },
    {
      fieldName: 'tags',
      tooltip: {
        text: 'Add tags for specific features, use cases, or keywords customers might search for.',
        title: 'Product Tags',
      },
      formDescription: 'Add searchable keywords and labels.',
    },

    // === SEO Section ===
    {
      fieldName: 'seo.metaTitle',
      tooltip: {
        text: 'Appears in browser tabs and search engine results. Keep under 60 characters for full display in Google.',
        title: 'Meta Title',
      },
      formDescription: 'Leave empty to use product name. Recommended: 50-60 characters.',
      placeholder: 'Premium Navigation System X5 | Marine Electronics',
      characterLimits: {
        max: 100,
      },
    },
    {
      fieldName: 'seo.metaDescription',
      tooltip: {
        text: 'The description shown in Google search results. Make it compelling to encourage clicks. Keep under 155 characters for full display.',
        title: 'Meta Description',
      },
      formDescription: 'Description for search engine results. Recommended: 150-160 characters.',
      placeholder: 'Professional-grade marine navigation with GPS, AIS, and radar integration. Trusted by superyacht captains worldwide.',
      characterLimits: {
        max: 300,
      },
    },
    {
      fieldName: 'seo.keywords',
      tooltip: {
        text: 'Comma-separated keywords for search optimization. Include terms customers use when searching.',
        title: 'SEO Keywords',
      },
      formDescription: 'Comma-separated keywords for search engines.',
      placeholder: 'marine navigation, GPS, yacht electronics, AIS, radar',
      characterLimits: {
        max: 500,
      },
    },
  ],
};

/**
 * Helper function to get field help by name
 */
export function getProductFieldHelp(fieldName: string) {
  return productsHelp.fields.find((f) => f.fieldName === fieldName);
}

export default productsHelp;

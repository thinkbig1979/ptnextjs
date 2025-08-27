import { defineConfig } from "tinacms";

// Category Collection (Reference Data)
const categoryCollection = {
  name: "category",
  label: "Categories",
  path: "content/categories",
  format: "md" as const,
  
  fields: [
    {
      type: "string" as const,
      name: "name",
      label: "Category Name",
      isTitle: true,
      required: true,
      description: "Display name for the category (e.g., 'Navigation Systems')",
    },
    {
      type: "string" as const,
      name: "slug",
      label: "URL Slug",
      required: true,
      description: "URL-friendly version (e.g., 'navigation-systems')",
    },
    {
      type: "string" as const,
      name: "description",
      label: "Description",
      required: true,
      ui: {
        component: "textarea",
      },
      description: "Brief description of the category",
    },
    {
      type: "string" as const,
      name: "icon",
      label: "Icon Identifier",
      description: "Icon name or URL for category display",
    },
    {
      type: "string" as const,
      name: "color",
      label: "Brand Color",
      ui: {
        component: "color",
      },
      description: "Hex color code for category theming",
    },
    {
      type: "number" as const,
      name: "order",
      label: "Display Order",
      description: "Sort order for category listings",
    },
  ],
  
  ui: {
    filename: {
      readonly: false,
      slugify: (values: any) => values.slug,
    },
  },
};

// Tag Collection (Reference Data)
const tagCollection = {
  name: "tag",
  label: "Tags", 
  path: "content/tags",
  format: "md" as const,
  
  fields: [
    {
      type: "string" as const,
      name: "name",
      label: "Tag Name",
      isTitle: true,
      required: true,
      description: "Display name for the tag (e.g., 'Radar Technology')",
    },
    {
      type: "string" as const,
      name: "slug",
      label: "URL Slug",
      required: true,
      description: "URL-friendly version (e.g., 'radar-technology')",
    },
    {
      type: "string" as const,
      name: "description",
      label: "Description",
      ui: {
        component: "textarea",
      },
      description: "Optional description of the tag",
    },
    {
      type: "string" as const,
      name: "color",
      label: "Color",
      ui: {
        component: "color",
      },
      description: "Hex color for tag display",
    },
    {
      type: "number" as const,
      name: "usage_count",
      label: "Usage Count",
      ui: {
        component: "number",
        parse: (value: any) => Number(value),
        format: (value: any) => value?.toString(),
      },
      description: "Automatic count of tag usage (computed field)",
    },
  ],
  
  ui: {
    filename: {
      readonly: false,
      slugify: (values: any) => values.slug,
    },
  },
};

// Blog Category Collection
const blogCategoryCollection = {
  name: "blogCategory",
  label: "Blog Categories",
  path: "content/blog/categories", 
  format: "md" as const,
  
  fields: [
    {
      type: "string" as const,
      name: "name",
      label: "Category Name",
      isTitle: true,
      required: true,
      description: "Blog category name (e.g., 'Technology Trends')",
    },
    {
      type: "string" as const,
      name: "slug",
      label: "URL Slug",
      required: true,
      description: "URL-friendly version (e.g., 'technology-trends')",
    },
    {
      type: "string" as const,
      name: "description",
      label: "Description",
      ui: {
        component: "textarea",
      },
      description: "Category description for blog organization",
    },
    {
      type: "string" as const,
      name: "color",
      label: "Color",
      ui: {
        component: "color",
      },
      description: "Hex color for category theming",
    },
    {
      type: "number" as const,
      name: "order",
      label: "Display Order",
      description: "Sort order for category listings",
    },
  ],
  
  ui: {
    filename: {
      readonly: false,
      slugify: (values: any) => values.slug,
    },
  },
};

// SEO Component (reusable)
const seoFields = [
  {
    type: "string" as const,
    name: "meta_title",
    label: "Meta Title",
    description: "Custom page title for search engines",
  },
  {
    type: "string" as const,
    name: "meta_description",
    label: "Meta Description",
    ui: {
      component: "textarea",
    },
    description: "Page description for search results (150-160 characters)",
  },
  {
    type: "string" as const,
    name: "keywords",
    label: "Keywords",
    description: "Comma-separated keywords for SEO",
  },
  {
    type: "image" as const,
    name: "og_image",
    label: "Social Share Image",
    description: "Image for social media sharing (1200x630px recommended)",
  },
  {
    type: "string" as const,
    name: "canonical_url",
    label: "Canonical URL",
    description: "Canonical URL if different from default",
  },
  {
    type: "boolean" as const,
    name: "no_index",
    label: "No Index",
    description: "Prevent search engines from indexing this page",
  },
];

// Partner Collection (Main Content)
const partnerCollection = {
  name: "partner",
  label: "Partners",
  path: "content/partners",
  format: "md" as const,
  
  fields: [
    {
      type: "string" as const,
      name: "name",
      label: "Company Name",
      isTitle: true,
      required: true,
      description: "Full company name (e.g., 'Raymarine (Teledyne FLIR)')",
    },
    {
      type: "string" as const,
      name: "slug",
      label: "URL Slug", 
      required: true,
      description: "URL-friendly identifier (e.g., 'raymarine-teledyne-flir')",
    },
    {
      type: "rich-text" as const,
      name: "description",
      label: "Company Description",
      required: true,
      description: "Detailed description of the company and their services",
    },
    {
      type: "image" as const,
      name: "logo",
      label: "Company Logo",
      description: "Company logo image (recommended: 400x200px)",
    },
    {
      type: "image" as const,
      name: "image",
      label: "Company Overview Image",
      description: "Hero/feature image for company profile",
    },
    {
      type: "string" as const,
      name: "website",
      label: "Website URL",
      description: "Company website URL (including https://)",
    },
    {
      type: "number" as const,
      name: "founded",
      label: "Founded Year",
      ui: {
        component: "number",
        parse: (value: any) => Number(value),
        format: (value: any) => value?.toString(),
      },
      description: "Year the company was founded",
    },
    {
      type: "string" as const,
      name: "location",
      label: "Company Location",
      description: "Primary location or headquarters (e.g., 'Portsmouth, UK')",
    },
    {
      type: "boolean" as const,
      name: "featured",
      label: "Featured Partner",
      description: "Mark as featured partner for homepage display",
    },
    
    // Relationships
    {
      type: "reference" as const,
      name: "category",
      label: "Primary Category",
      collections: ["category"],
      description: "Main technology category for this partner",
    },
    {
      type: "reference" as const,
      name: "tags",
      label: "Technology Tags",
      collections: ["tag"],
      list: true,
      description: "Relevant technology tags for this partner",
    },
    
    // SEO Component
    {
      type: "object" as const,
      name: "seo",
      label: "SEO Settings",
      description: "Search engine optimization settings",
      fields: seoFields,
    },
  ],
  
  ui: {
    filename: {
      readonly: false,
      slugify: (values: any) => values.slug,
    },
  },
};

// Product Collection (Main Content)
const productCollection = {
  name: "product",
  label: "Products",
  path: "content/products",
  format: "md" as const,
  
  fields: [
    {
      type: "string" as const,
      name: "name",
      label: "Product Name",
      isTitle: true,
      required: true,
      description: "Full product name (e.g., 'Axiom Multifunction Display')",
    },
    {
      type: "string" as const,
      name: "slug",
      label: "URL Slug",
      description: "URL-friendly identifier (auto-generated if empty)",
    },
    {
      type: "rich-text" as const,
      name: "description",
      label: "Product Description",
      required: true,
      description: "Detailed product description and capabilities",
    },
    {
      type: "string" as const,
      name: "price",
      label: "Price Information",
      description: "Pricing details or 'Contact for pricing'",
    },
    
    // Primary Relationships
    {
      type: "reference" as const,
      name: "partner",
      label: "Partner Company",
      collections: ["partner"],
      required: true,
      description: "The partner company that offers this product",
    },
    {
      type: "reference" as const,
      name: "category",
      label: "Product Category",
      collections: ["category"],
      description: "Primary category for this product",
    },
    {
      type: "reference" as const,
      name: "tags",
      label: "Product Tags",
      collections: ["tag"],
      list: true,
      description: "Relevant tags for this product",
    },
    
    // Product Images Component
    {
      type: "object" as const,
      name: "product_images",
      label: "Product Images",
      list: true,
      description: "Multiple images for product gallery",
      fields: [
        {
          type: "image" as const,
          name: "image",
          label: "Image",
          required: true,
          description: "Product image file",
        },
        {
          type: "string" as const,
          name: "alt_text",
          label: "Alt Text",
          description: "Alternative text for accessibility",
        },
        {
          type: "boolean" as const,
          name: "is_main",
          label: "Main Image",
          description: "Use as primary product image",
        },
        {
          type: "string" as const,
          name: "caption",
          label: "Caption",
          description: "Optional caption for the image",
        },
        {
          type: "number" as const,
          name: "order",
          label: "Display Order",
          ui: {
            component: "number",
            parse: (value: any) => Number(value),
            format: (value: any) => value?.toString(),
          },
          description: "Sort order for image gallery",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: item?.alt_text || item?.caption || "Product Image",
        }),
      },
    },
    
    // Product Features Component
    {
      type: "object" as const,
      name: "features",
      label: "Product Features",
      list: true,
      description: "Key features and capabilities",
      fields: [
        {
          type: "string" as const,
          name: "title",
          label: "Feature Title",
          required: true,
          description: "Brief feature title",
        },
        {
          type: "string" as const,
          name: "description",
          label: "Feature Description",
          ui: {
            component: "textarea",
          },
          description: "Detailed feature description",
        },
        {
          type: "string" as const,
          name: "icon",
          label: "Feature Icon",
          description: "Icon identifier or URL",
        },
        {
          type: "number" as const,
          name: "order",
          label: "Display Order",
          ui: {
            component: "number",
            parse: (value: any) => Number(value),
            format: (value: any) => value?.toString(),
          },
          description: "Sort order for feature list",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: item?.title || "Product Feature",
        }),
      },
    },
    
    // SEO Component
    {
      type: "object" as const,
      name: "seo",
      label: "SEO Settings",
      description: "Search engine optimization settings",
      fields: seoFields.slice(0, 4), // Only include first 4 SEO fields for products
    },
  ],
  
  ui: {
    filename: {
      readonly: false,
      slugify: (values: any) => values.slug || values.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    },
  },
};

// Blog Post Collection
const blogPostCollection = {
  name: "blogPost",
  label: "Blog Posts",
  path: "content/blog/posts",
  format: "md" as const,
  
  fields: [
    {
      type: "string" as const,
      name: "title",
      label: "Post Title",
      isTitle: true,
      required: true,
      description: "Blog post title",
    },
    {
      type: "string" as const,
      name: "slug",
      label: "URL Slug",
      required: true,
      description: "URL-friendly identifier",
    },
    {
      type: "string" as const,
      name: "excerpt",
      label: "Post Excerpt",
      required: true,
      ui: {
        component: "textarea",
      },
      description: "Brief summary for post listings and SEO",
    },
    {
      type: "rich-text" as const,
      name: "content",
      label: "Post Content",
      required: true,
      isBody: true,
      description: "Main blog post content",
    },
    {
      type: "string" as const,
      name: "author",
      label: "Author Name",
      required: true,
      description: "Post author name",
    },
    {
      type: "datetime" as const,
      name: "published_at",
      label: "Publication Date",
      required: true,
      description: "When the post should be published",
    },
    {
      type: "boolean" as const,
      name: "featured",
      label: "Featured Post",
      description: "Mark as featured for homepage display",
    },
    {
      type: "string" as const,
      name: "read_time",
      label: "Estimated Read Time",
      description: "Reading time estimate (e.g., '5 min read')",
    },
    {
      type: "image" as const,
      name: "image",
      label: "Featured Image",
      description: "Hero image for the blog post",
    },
    
    // Relationships
    {
      type: "reference" as const,
      name: "blog_category",
      label: "Blog Category",
      collections: ["blogCategory"],
      description: "Primary category for blog organization",
    },
    {
      type: "reference" as const,
      name: "tags",
      label: "Tags",
      collections: ["tag"],
      list: true,
      description: "Relevant tags for this post",
    },
    
    // SEO Component
    {
      type: "object" as const,
      name: "seo",
      label: "SEO Settings",
      description: "Search engine optimization settings",
      fields: seoFields.slice(0, 4), // Only include first 4 SEO fields for blog posts
    },
  ],
  
  ui: {
    filename: {
      readonly: false,
      slugify: (values: any) => values.slug,
    },
  },
};

// Team Member Collection
const teamMemberCollection = {
  name: "teamMember",
  label: "Team Members",
  path: "content/team",
  format: "md" as const,
  
  fields: [
    {
      type: "string" as const,
      name: "name",
      label: "Full Name",
      isTitle: true,
      required: true,
      description: "Team member's full name",
    },
    {
      type: "string" as const,
      name: "role",
      label: "Job Title",
      required: true,
      description: "Current role or job title",
    },
    {
      type: "rich-text" as const,
      name: "bio",
      label: "Biography",
      required: true,
      isBody: true,
      description: "Professional biography and background",
    },
    {
      type: "image" as const,
      name: "image",
      label: "Profile Photo",
      description: "Professional headshot (square format recommended)",
    },
    {
      type: "string" as const,
      name: "email",
      label: "Email Address",
      description: "Professional email address",
    },
    {
      type: "string" as const,
      name: "linkedin",
      label: "LinkedIn Profile",
      description: "LinkedIn profile URL",
    },
    {
      type: "number" as const,
      name: "order",
      label: "Display Order",
      ui: {
        component: "number",
        parse: (value: any) => Number(value),
        format: (value: any) => value?.toString(),
      },
      description: "Sort order for team member listings",
    },
  ],
  
  ui: {
    filename: {
      readonly: false,
      slugify: (values: any) => values.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    },
  },
};

// Company Info Collection (Single-Type)
const companyInfoCollection = {
  name: "companyInfo",
  label: "Company Information",
  path: "content/company",
  format: "json" as const,
  
  ui: {
    allowedActions: {
      create: false,
      delete: false,
    },
    global: true,
    filename: {
      readonly: true,
      slugify: () => "info",
    },
  },
  
  fields: [
    {
      type: "string" as const,
      name: "name",
      label: "Company Name",
      required: true,
      description: "Full legal company name",
    },
    {
      type: "string" as const,
      name: "tagline",
      label: "Company Tagline",
      required: true,
      description: "Brief company tagline or slogan",
    },
    {
      type: "rich-text" as const,
      name: "description",
      label: "Company Description",
      required: true,
      description: "Detailed company description for about page",
    },
    {
      type: "number" as const,
      name: "founded",
      label: "Founded Year",
      required: true,
      ui: {
        component: "number",
        parse: (value: any) => Number(value),
        format: (value: any) => value?.toString(),
      },
      description: "Year the company was founded",
    },
    {
      type: "string" as const,
      name: "location",
      label: "Location",
      required: true,
      description: "Primary business location",
    },
    {
      type: "string" as const,
      name: "address",
      label: "Physical Address",
      required: true,
      ui: {
        component: "textarea",
      },
      description: "Complete physical address",
    },
    {
      type: "string" as const,
      name: "phone",
      label: "Phone Number",
      required: true,
      description: "Primary contact phone number",
    },
    {
      type: "string" as const,
      name: "email",
      label: "Contact Email",
      required: true,
      description: "Primary contact email address",
    },
    {
      type: "rich-text" as const,
      name: "story",
      label: "Company Story",
      required: true,
      description: "Extended company story and background",
    },
    {
      type: "image" as const,
      name: "logo",
      label: "Company Logo",
      description: "Primary company logo",
    },
    
    // Social Media Component
    {
      type: "object" as const,
      name: "social_media",
      label: "Social Media Links",
      description: "Company social media profiles",
      fields: [
        {
          type: "string" as const,
          name: "facebook",
          label: "Facebook URL",
          description: "Complete Facebook profile URL",
        },
        {
          type: "string" as const,
          name: "twitter",
          label: "Twitter URL", 
          description: "Complete Twitter profile URL",
        },
        {
          type: "string" as const,
          name: "linkedin",
          label: "LinkedIn URL",
          description: "Complete LinkedIn company page URL",
        },
        {
          type: "string" as const,
          name: "instagram",
          label: "Instagram URL",
          description: "Complete Instagram profile URL",
        },
        {
          type: "string" as const,
          name: "youtube",
          label: "YouTube URL",
          description: "Complete YouTube channel URL",
        },
      ],
    },
    
    // SEO Component
    {
      type: "object" as const,
      name: "seo",
      label: "SEO Settings",
      description: "Global SEO settings",
      fields: seoFields.slice(0, 4), // Only include first 4 SEO fields for company
    },
  ],
};

export default defineConfig({
  branch: "main",
  clientId: process.env.TINA_CLIENT_ID || null, // Allow local development without credentials
  token: process.env.TINA_TOKEN || null,
  
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  
  media: {
    tina: {
      mediaRoot: "public/media",
      publicFolder: "public",
    },
  },
  
  schema: {
    collections: [
      // Utility Collections (Reference Data)
      categoryCollection,
      blogCategoryCollection,
      tagCollection,
      
      // Main Content Collections
      partnerCollection,
      productCollection,
      blogPostCollection,
      teamMemberCollection,
      
      // Single-Type Collection
      companyInfoCollection,
    ],
  },
});
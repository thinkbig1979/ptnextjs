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

// Vendor Collection (Main Content) - Updated path to content/vendors
const vendorCollection = {
  name: "vendor",
  label: "Vendors",
  path: "content/vendors",
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
      label: "Featured Vendor",
      description: "Mark as featured vendor for homepage display",
    },
    {
      type: "boolean" as const,
      name: "partner",
      label: "Is Partner",
      description: "Indicates if this vendor is also a strategic partner (true for existing partners, false for suppliers-only)",
    },
    
    // Services Component
    {
      type: "object" as const,
      name: "services",
      label: "Services & Support",
      list: true,
      description: "Services and support offered by this vendor",
      fields: [
        {
          type: "string" as const,
          name: "service",
          label: "Service Name",
          required: true,
          description: "Name of the service or support offering",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: item?.service || "Service",
        }),
      },
    },
    
    // Company Mission
    {
      type: "rich-text" as const,
      name: "mission",
      label: "Company Mission Statement",
      description: "Company-specific mission statement (if different from global company mission)",
    },
    
    // Company Statistics Component
    {
      type: "object" as const,
      name: "statistics",
      label: "Company Statistics",
      list: true,
      description: "Key company metrics and statistics to display",
      fields: [
        {
          type: "string" as const,
          name: "label",
          label: "Statistic Label",
          required: true,
          description: "Label for the statistic (e.g., 'Years in Business', 'Global Installations')",
        },
        {
          type: "string" as const,
          name: "value",
          label: "Statistic Value",
          required: true,
          description: "Value for the statistic (e.g., '25+', '2,500+', '150+')",
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
          description: "Sort order for statistics display",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: `${item?.label || "Statistic"}: ${item?.value || ""}`,
        }),
      },
    },
    
    // Company Achievements Component  
    {
      type: "object" as const,
      name: "achievements",
      label: "Why Choose Us - Key Achievements",
      list: true,
      description: "Company achievements and differentiators for 'Why Choose Us' section",
      fields: [
        {
          type: "string" as const,
          name: "title",
          label: "Achievement Title",
          required: true,
          description: "Brief title for the achievement (e.g., 'Industry Leader', 'Quality Certified')",
        },
        {
          type: "string" as const,
          name: "description",
          label: "Achievement Description",
          required: true,
          ui: {
            component: "textarea",
          },
          description: "Detailed description of the achievement or differentiator",
        },
        {
          type: "string" as const,
          name: "icon",
          label: "Icon Identifier",
          description: "Lucide icon name (e.g., 'Award', 'Users', 'CheckCircle', 'Lightbulb')",
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
          description: "Sort order for achievements display",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: item?.title || "Achievement",
        }),
      },
    },
    
    // Relationships
    {
      type: "reference" as const,
      name: "category",
      label: "Primary Category",
      collections: ["category"],
      description: "Main technology category for this vendor",
    },
    {
      type: "object" as const,
      name: "tags",
      label: "Technology Tags",
      list: true,
      description: "Relevant technology tags for this vendor",
      fields: [
        {
          type: "reference" as const,
          name: "tag",
          label: "Tag",
          collections: ["tag"],
          required: true,
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: item?.tag?.name || "Select Tag",
        }),
      },
    },
    
    // Enhanced Profile Components for Platform Vision
    {
      type: "object" as const,
      name: "certifications",
      label: "Certifications",
      list: true,
      description: "Company certifications and accreditations",
      fields: [
        {
          type: "string" as const,
          name: "name",
          label: "Certification Name",
          required: true,
          description: "Name of the certification (e.g., 'ISO 9001:2015')",
        },
        {
          type: "string" as const,
          name: "issuer",
          label: "Issuing Organization",
          required: true,
          description: "Organization that issued the certification (e.g., 'Lloyd's Register')",
        },
        {
          type: "number" as const,
          name: "year",
          label: "Year Obtained",
          ui: {
            component: "number",
            parse: (value: any) => Number(value),
            format: (value: any) => value?.toString(),
            validate: (value: any) => {
              if (value && (value < 1800 || value > new Date().getFullYear())) {
                return `Year must be between 1800 and ${new Date().getFullYear()}`
              }
            }
          },
          description: "Year the certification was obtained",
        },
        {
          type: "datetime" as const,
          name: "expiryDate",
          label: "Expiry Date",
          description: "When the certification expires (if applicable)",
        },
        {
          type: "string" as const,
          name: "certificateUrl",
          label: "Certificate URL",
          description: "Link to certificate document or verification page",
          ui: {
            validate: (value: any) => {
              if (value && typeof value === 'string' && !value.match(/^https?:\/\/.+/)) {
                return "Must be a valid HTTP(S) URL"
              }
            }
          }
        },
        {
          type: "image" as const,
          name: "logo",
          label: "Certification Logo",
          description: "Logo or badge for the certification",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: `${item?.name || "Certification"} - ${item?.issuer || ""}`,
        }),
      },
    },
    {
      type: "object" as const,
      name: "awards",
      label: "Awards & Recognition",
      list: true,
      description: "Awards and industry recognition received",
      fields: [
        {
          type: "string" as const,
          name: "title",
          label: "Award Title",
          required: true,
          description: "Title of the award (e.g., 'Best Electrical Integrator 2024')",
        },
        {
          type: "number" as const,
          name: "year",
          label: "Year Received",
          required: true,
          ui: {
            component: "number",
            parse: (value: any) => Number(value),
            format: (value: any) => value?.toString(),
            validate: (value: any) => {
              if (value && (value < 1800 || value > new Date().getFullYear())) {
                return `Year must be between 1800 and ${new Date().getFullYear()}`
              }
            }
          },
          description: "Year the award was received",
        },
        {
          type: "string" as const,
          name: "organization",
          label: "Awarding Organization",
          description: "Organization that presented the award",
        },
        {
          type: "string" as const,
          name: "category",
          label: "Award Category",
          description: "Category or type of award",
        },
        {
          type: "rich-text" as const,
          name: "description",
          label: "Award Description",
          description: "Description of the award and achievement",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: `${item?.title || "Award"} (${item?.year || ""})`,
        }),
      },
    },
    {
      type: "object" as const,
      name: "socialProof",
      label: "Social Proof",
      description: "Social proof metrics and customer information",
      fields: [
        {
          type: "number" as const,
          name: "followers",
          label: "Social Media Followers",
          ui: {
            component: "number",
            parse: (value: any) => Number(value),
            format: (value: any) => value?.toString(),
            validate: (value: any) => {
              if (value && (value < 0 || value > 100000000)) {
                return "Followers must be between 0 and 100,000,000"
              }
            }
          },
          description: "Total social media followers across platforms",
        },
        {
          type: "number" as const,
          name: "projectsCompleted",
          label: "Projects Completed",
          ui: {
            component: "number",
            parse: (value: any) => Number(value),
            format: (value: any) => value?.toString(),
            validate: (value: any) => {
              if (value && (value < 0 || value > 100000)) {
                return "Projects completed must be between 0 and 100,000"
              }
            }
          },
          description: "Total number of projects completed",
        },
        {
          type: "number" as const,
          name: "yearsInBusiness",
          label: "Years in Business",
          ui: {
            component: "number",
            parse: (value: any) => Number(value),
            format: (value: any) => value?.toString(),
            validate: (value: any) => {
              if (value && (value < 0 || value > 200)) {
                return "Years in business must be between 0 and 200"
              }
            }
          },
          description: "Number of years in business",
        },
        {
          type: "string" as const,
          name: "customerList",
          label: "Notable Customers",
          list: true,
          description: "List of notable customers (can be anonymized)",
        },
      ],
    },
    {
      type: "object" as const,
      name: "videoIntroduction",
      label: "Video Introduction",
      description: "Company video introduction or showcase",
      fields: [
        {
          type: "string" as const,
          name: "videoUrl",
          label: "Video URL",
          description: "URL to company introduction video (YouTube, Vimeo, etc.)",
          ui: {
            validate: (value: any) => {
              if (value && typeof value === 'string' && !value.match(/^https?:\/\/.+/)) {
                return "Must be a valid HTTP(S) URL"
              }
            }
          }
        },
        {
          type: "image" as const,
          name: "thumbnailImage",
          label: "Video Thumbnail",
          description: "Custom thumbnail image for the video",
        },
        {
          type: "string" as const,
          name: "title",
          label: "Video Title",
          description: "Title for the video section",
        },
        {
          type: "string" as const,
          name: "description",
          label: "Video Description",
          description: "Brief description of the video content",
        },
      ],
    },
    {
      type: "object" as const,
      name: "caseStudies",
      label: "Case Studies",
      list: true,
      description: "Detailed project case studies",
      fields: [
        {
          type: "string" as const,
          name: "title",
          label: "Case Study Title",
          required: true,
          description: "Title of the case study project",
        },
        {
          type: "string" as const,
          name: "slug",
          label: "URL Slug",
          required: true,
          description: "URL-friendly identifier for the case study",
        },
        {
          type: "string" as const,
          name: "client",
          label: "Client Name",
          description: "Client name (can be anonymized)",
        },
        {
          type: "rich-text" as const,
          name: "challenge",
          label: "Challenge",
          required: true,
          description: "Description of the challenge or problem faced",
        },
        {
          type: "rich-text" as const,
          name: "solution",
          label: "Solution",
          required: true,
          description: "Description of the solution implemented",
        },
        {
          type: "rich-text" as const,
          name: "results",
          label: "Results",
          description: "Outcomes and results achieved",
        },
        {
          type: "image" as const,
          name: "images",
          label: "Case Study Images",
          list: true,
          description: "Images showcasing the project",
        },
        {
          type: "string" as const,
          name: "technologies",
          label: "Technologies Used",
          list: true,
          description: "Technologies and systems used in the project",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: item?.title || "Case Study",
        }),
      },
    },
    {
      type: "object" as const,
      name: "innovationHighlights",
      label: "Innovation Highlights",
      list: true,
      description: "Technologies and unique approaches that set the company apart",
      fields: [
        {
          type: "string" as const,
          name: "technology",
          label: "Technology/Innovation",
          required: true,
          description: "Name of the technology or innovation",
        },
        {
          type: "rich-text" as const,
          name: "description",
          label: "Description",
          description: "Detailed description of the innovation",
        },
        {
          type: "string" as const,
          name: "uniqueApproach",
          label: "Unique Approach",
          description: "What makes this approach unique",
        },
        {
          type: "string" as const,
          name: "benefitsToClients",
          label: "Benefits to Clients",
          list: true,
          description: "List of benefits this innovation provides to clients",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: item?.technology || "Innovation",
        }),
      },
    },
    {
      type: "object" as const,
      name: "teamMembers",
      label: "Team Members",
      list: true,
      description: "Key team members for interactive organizational chart",
      fields: [
        {
          type: "string" as const,
          name: "name",
          label: "Full Name",
          required: true,
          description: "Team member's full name",
        },
        {
          type: "string" as const,
          name: "position",
          label: "Position/Title",
          required: true,
          description: "Job title or position",
        },
        {
          type: "rich-text" as const,
          name: "bio",
          label: "Biography",
          description: "Professional biography",
        },
        {
          type: "image" as const,
          name: "photo",
          label: "Profile Photo",
          description: "Professional headshot",
        },
        {
          type: "string" as const,
          name: "linkedinUrl",
          label: "LinkedIn Profile",
          description: "LinkedIn profile URL",
          ui: {
            validate: (value: any) => {
              if (value && typeof value === 'string' && !value.match(/^https?:\/\/.+/)) {
                return "Must be a valid HTTP(S) URL"
              }
            }
          }
        },
        {
          type: "string" as const,
          name: "expertise",
          label: "Areas of Expertise",
          list: true,
          description: "List of expertise areas",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: `${item?.name || "Team Member"} - ${item?.position || ""}`,
        }),
      },
    },
    {
      type: "object" as const,
      name: "yachtProjects",
      label: "Yacht Projects Portfolio",
      list: true,
      description: "Portfolio of yacht projects showing systems supplied",
      fields: [
        {
          type: "string" as const,
          name: "yachtName",
          label: "Yacht Name",
          required: true,
          description: "Name of the yacht project",
        },
        {
          type: "string" as const,
          name: "systems",
          label: "Systems Supplied",
          list: true,
          required: true,
          description: "List of systems supplied (AV, IT, Security, Lighting, etc.)",
        },
        {
          type: "number" as const,
          name: "projectYear",
          label: "Project Year",
          ui: {
            component: "number",
            parse: (value: any) => Number(value),
            format: (value: any) => value?.toString(),
            validate: (value: any) => {
              if (value && (value < 1900 || value > new Date().getFullYear() + 5)) {
                return `Project year must be between 1900 and ${new Date().getFullYear() + 5}`
              }
            }
          },
          description: "Year the project was completed",
        },
        {
          type: "string" as const,
          name: "role",
          label: "Role in Project",
          description: "Company's role in the project (primary contractor, subcontractor, etc.)",
        },
        {
          type: "string" as const,
          name: "description",
          label: "Project Description",
          description: "Brief description of the project and involvement",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: `${item?.yachtName || "Yacht Project"} (${item?.projectYear || ""})`,
        }),
      },
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
      name: "vendor",
      label: "Vendor Company",
      collections: ["vendor"],
      required: true,
      description: "The vendor company that offers this product",
    },
    {
      type: "reference" as const,
      name: "category",
      label: "Product Category",
      collections: ["category"],
      description: "Primary category for this product",
    },
    {
      type: "object" as const,
      name: "tags",
      label: "Product Tags",
      list: true,
      description: "Relevant tags for this product",
      fields: [
        {
          type: "reference" as const,
          name: "tag",
          label: "Tag",
          collections: ["tag"],
          required: true,
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: item?.tag?.name || "Select Tag",
        }),
      },
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
    
    // Product Specifications Component
    {
      type: "object" as const,
      name: "specifications",
      label: "Technical Specifications",
      list: true,
      description: "Technical specifications for the product",
      fields: [
        {
          type: "string" as const,
          name: "label",
          label: "Specification Label",
          required: true,
          description: "Label for the specification (e.g., 'Power Rating', 'Operating Voltage')",
        },
        {
          type: "string" as const,
          name: "value",
          label: "Specification Value",
          required: true,
          description: "Value for the specification (e.g., '50-100kW', '12V/24V DC')",
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
          description: "Sort order for specifications display",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: `${item?.label || "Specification"}: ${item?.value || ""}`,
        }),
      },
    },
    
    // Product Benefits Component
    {
      type: "object" as const,
      name: "benefits",
      label: "Product Benefits",
      list: true,
      description: "Key benefits and advantages of the product",
      fields: [
        {
          type: "string" as const,
          name: "benefit",
          label: "Benefit Description",
          required: true,
          description: "Description of the product benefit",
        },
        {
          type: "string" as const,
          name: "icon",
          label: "Benefit Icon",
          description: "Lucide icon name for the benefit (e.g., 'CheckCircle', 'Zap', 'Shield')",
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
          description: "Sort order for benefits display",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: item?.benefit || "Product Benefit",
        }),
      },
    },
    
    // Product Services Component
    {
      type: "object" as const,
      name: "services",
      label: "Installation & Support Services",
      list: true,
      description: "Services offered with this product",
      fields: [
        {
          type: "string" as const,
          name: "title",
          label: "Service Title",
          required: true,
          description: "Title of the service (e.g., 'Professional Installation', 'Ongoing Support')",
        },
        {
          type: "string" as const,
          name: "description",
          label: "Service Description",
          required: true,
          ui: {
            component: "textarea",
          },
          description: "Detailed description of the service",
        },
        {
          type: "string" as const,
          name: "icon",
          label: "Service Icon",
          description: "Lucide icon name for the service (e.g., 'Wrench', 'Zap', 'Shield')",
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
          description: "Sort order for services display",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: item?.title || "Product Service",
        }),
      },
    },
    
    // Product Pricing Component
    {
      type: "object" as const,
      name: "pricing",
      label: "Pricing Configuration",
      description: "Pricing display configuration for the product",
      fields: [
        {
          type: "string" as const,
          name: "display_text",
          label: "Display Text",
          description: "Text to display (e.g., 'Contact for Pricing', 'Starting from $1,999')",
        },
        {
          type: "string" as const,
          name: "subtitle",
          label: "Subtitle",
          description: "Optional subtitle text (e.g., 'Custom quotes available', 'Volume discounts available')",
        },
        {
          type: "boolean" as const,
          name: "show_contact_form",
          label: "Show Contact Form",
          description: "Whether to show contact/quote form for this product",
        },
        {
          type: "string" as const,
          name: "currency",
          label: "Currency",
          description: "Currency symbol or code if showing actual price",
        },
      ],
    },
    
    // Product Action Buttons Component
    {
      type: "object" as const,
      name: "action_buttons",
      label: "Action Buttons",
      list: true,
      description: "Configurable action buttons for the product",
      fields: [
        {
          type: "string" as const,
          name: "label",
          label: "Button Label",
          required: true,
          description: "Text to display on the button",
        },
        {
          type: "string" as const,
          name: "type",
          label: "Button Type",
          required: true,
          options: [
            { value: "primary", label: "Primary" },
            { value: "secondary", label: "Secondary" },
            { value: "outline", label: "Outline" },
          ],
          description: "Visual style of the button",
        },
        {
          type: "string" as const,
          name: "action",
          label: "Action Type",
          required: true,
          options: [
            { value: "contact", label: "Contact Form" },
            { value: "quote", label: "Request Quote" },
            { value: "download", label: "Download Resource" },
            { value: "external_link", label: "External Link" },
            { value: "video", label: "Demo Video" },
          ],
          description: "Type of action when button is clicked",
        },
        {
          type: "string" as const,
          name: "action_data",
          label: "Action Data",
          description: "Additional data for the action (e.g., download URL, external link)",
        },
        {
          type: "string" as const,
          name: "icon",
          label: "Icon",
          description: "Lucide icon name for the button (e.g., 'Phone', 'Mail', 'Download')",
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
          description: "Sort order for buttons display",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: `${item?.label || "Button"} (${item?.type || "primary"})`,
        }),
      },
    },
    
    // Product Badges Component
    {
      type: "object" as const,
      name: "badges",
      label: "Product Badges",
      list: true,
      description: "Quality badges and certifications for the product",
      fields: [
        {
          type: "string" as const,
          name: "label",
          label: "Badge Label",
          required: true,
          description: "Text to display on the badge",
        },
        {
          type: "string" as const,
          name: "type",
          label: "Badge Type",
          required: true,
          options: [
            { value: "secondary", label: "Secondary" },
            { value: "outline", label: "Outline" },
            { value: "success", label: "Success" },
            { value: "warning", label: "Warning" },
            { value: "info", label: "Info" },
          ],
          description: "Visual style of the badge",
        },
        {
          type: "string" as const,
          name: "icon",
          label: "Badge Icon",
          description: "Lucide icon name for the badge",
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
          description: "Sort order for badges display",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: `${item?.label || "Badge"} (${item?.type || "secondary"})`,
        }),
      },
    },

    // Product Comparison Metrics Component
    {
      type: "object" as const,
      name: "comparison_metrics",
      label: "Comparison Metrics",
      description: "Metrics for product comparison matrices",
      fields: [
        {
          type: "object" as const,
          name: "performance",
          label: "Performance Metrics",
          list: true,
          description: "Performance-related metrics for comparison",
          fields: [
            {
              type: "string" as const,
              name: "metric_id",
              label: "Metric ID",
              required: true,
              description: "Unique identifier for the metric (e.g., 'power-consumption', 'accuracy')",
            },
            {
              type: "string" as const,
              name: "name",
              label: "Metric Name",
              required: true,
              description: "Display name for the metric (e.g., 'Power Consumption', 'Positioning Accuracy')",
            },
            {
              type: "number" as const,
              name: "value",
              label: "Metric Value",
              required: true,
              ui: {
                component: "number",
                parse: (value: any) => Number(value),
                format: (value: any) => value?.toString(),
              },
              description: "Numeric value for the metric",
            },
            {
              type: "string" as const,
              name: "unit",
              label: "Unit",
              description: "Unit of measurement (e.g., 'W', '%', 'ms', 'kg')",
            },
            {
              type: "string" as const,
              name: "category",
              label: "Metric Category",
              options: [
                { value: "performance", label: "Performance" },
                { value: "efficiency", label: "Efficiency" },
                { value: "reliability", label: "Reliability" },
                { value: "physical", label: "Physical Specifications" },
                { value: "environmental", label: "Environmental" },
              ],
              description: "Category for grouping metrics",
            },
            {
              type: "number" as const,
              name: "weight",
              label: "Comparison Weight",
              ui: {
                component: "number",
                parse: (value: any) => Number(value),
                format: (value: any) => value?.toString(),
              },
              description: "Weight for comparison ranking (0.0 - 1.0)",
            },
            {
              type: "object" as const,
              name: "tolerance",
              label: "Tolerance Range",
              description: "Acceptable range for the metric",
              fields: [
                {
                  type: "number" as const,
                  name: "min",
                  label: "Minimum Value",
                  ui: {
                    component: "number",
                    parse: (value: any) => Number(value),
                    format: (value: any) => value?.toString(),
                  },
                },
                {
                  type: "number" as const,
                  name: "max",
                  label: "Maximum Value",
                  ui: {
                    component: "number",
                    parse: (value: any) => Number(value),
                    format: (value: any) => value?.toString(),
                  },
                },
              ],
            },
            {
              type: "number" as const,
              name: "benchmark_value",
              label: "Benchmark Value",
              ui: {
                component: "number",
                parse: (value: any) => Number(value),
                format: (value: any) => value?.toString(),
              },
              description: "Industry benchmark for comparison",
            },
          ],
          ui: {
            itemProps: (item: any) => ({
              label: `${item?.name || "Metric"}: ${item?.value || ""} ${item?.unit || ""}`,
            }),
          },
        },
      ],
    },

    // Integration Compatibility Component
    {
      type: "object" as const,
      name: "integration_compatibility",
      label: "Integration Compatibility",
      description: "System compatibility and integration information",
      fields: [
        {
          type: "string" as const,
          name: "supported_protocols",
          label: "Supported Protocols",
          list: true,
          description: "Communication protocols and standards supported",
        },
        {
          type: "object" as const,
          name: "system_requirements",
          label: "System Requirements",
          description: "Technical requirements for installation",
          fields: [
            {
              type: "string" as const,
              name: "power_supply",
              label: "Power Supply",
              description: "Power requirements (e.g., '12V DC / 24V DC')",
            },
            {
              type: "string" as const,
              name: "mounting",
              label: "Mounting Requirements",
              description: "Physical mounting specifications",
            },
            {
              type: "string" as const,
              name: "operating_temp",
              label: "Operating Temperature",
              description: "Temperature range (e.g., '-20°C to +70°C')",
            },
            {
              type: "string" as const,
              name: "certification",
              label: "Certifications",
              description: "Safety and compliance certifications",
            },
            {
              type: "string" as const,
              name: "ip_rating",
              label: "IP Rating",
              description: "Ingress protection rating (e.g., 'IP67')",
            },
          ],
        },
        {
          type: "object" as const,
          name: "compatibility_matrix",
          label: "Compatibility Matrix",
          list: true,
          description: "Detailed compatibility with other systems",
          fields: [
            {
              type: "string" as const,
              name: "system",
              label: "System Name",
              required: true,
              description: "Name of the compatible system",
            },
            {
              type: "string" as const,
              name: "compatibility",
              label: "Compatibility Level",
              required: true,
              options: [
                { value: "full", label: "Full Compatibility" },
                { value: "partial", label: "Partial Compatibility" },
                { value: "adapter", label: "Requires Adapter" },
                { value: "none", label: "Not Compatible" },
              ],
              description: "Level of compatibility with this system",
            },
            {
              type: "string" as const,
              name: "notes",
              label: "Compatibility Notes",
              ui: {
                component: "textarea",
              },
              description: "Additional notes about compatibility",
            },
            {
              type: "string" as const,
              name: "requirements",
              label: "Additional Requirements",
              list: true,
              description: "Additional hardware or software requirements",
            },
            {
              type: "string" as const,
              name: "complexity",
              label: "Installation Complexity",
              options: [
                { value: "simple", label: "Simple" },
                { value: "moderate", label: "Moderate" },
                { value: "complex", label: "Complex" },
              ],
              description: "Complexity of integration setup",
            },
            {
              type: "string" as const,
              name: "estimated_cost",
              label: "Estimated Integration Cost",
              description: "Cost estimate for integration (e.g., '$500-1000')",
            },
          ],
          ui: {
            itemProps: (item: any) => ({
              label: `${item?.system || "System"} (${item?.compatibility || "unknown"})`,
            }),
          },
        },
      ],
    },

    // Owner Reviews Component
    {
      type: "object" as const,
      name: "owner_reviews",
      label: "Owner Reviews",
      list: true,
      description: "Customer reviews and testimonials",
      fields: [
        {
          type: "string" as const,
          name: "review_id",
          label: "Review ID",
          required: true,
          description: "Unique identifier for the review",
        },
        {
          type: "string" as const,
          name: "owner_name",
          label: "Owner Name",
          required: true,
          description: "Name of the yacht owner or captain",
        },
        {
          type: "string" as const,
          name: "yacht_name",
          label: "Yacht Name",
          description: "Name of the yacht",
        },
        {
          type: "string" as const,
          name: "yacht_length",
          label: "Yacht Length",
          description: "Length of the yacht (e.g., '45m', '150ft')",
        },
        {
          type: "number" as const,
          name: "rating",
          label: "Rating",
          required: true,
          ui: {
            component: "number",
            parse: (value: any) => Number(value),
            format: (value: any) => value?.toString(),
          },
          description: "Rating out of 5 stars",
        },
        {
          type: "string" as const,
          name: "title",
          label: "Review Title",
          required: true,
          description: "Title of the review",
        },
        {
          type: "string" as const,
          name: "review",
          label: "Review Content",
          required: true,
          ui: {
            component: "textarea",
          },
          description: "Full review text",
        },
        {
          type: "string" as const,
          name: "pros",
          label: "Pros",
          list: true,
          description: "Positive aspects mentioned in review",
        },
        {
          type: "string" as const,
          name: "cons",
          label: "Cons",
          list: true,
          description: "Negative aspects mentioned in review",
        },
        {
          type: "datetime" as const,
          name: "installation_date",
          label: "Installation Date",
          description: "When the product was installed",
        },
        {
          type: "boolean" as const,
          name: "verified",
          label: "Verified Purchase",
          description: "Whether this is a verified purchase",
        },
        {
          type: "number" as const,
          name: "helpful",
          label: "Helpful Votes",
          ui: {
            component: "number",
            parse: (value: any) => Number(value),
            format: (value: any) => value?.toString(),
          },
          description: "Number of helpful votes received",
        },
        {
          type: "image" as const,
          name: "images",
          label: "Review Images",
          list: true,
          description: "Images uploaded with the review",
        },
        {
          type: "string" as const,
          name: "use_case",
          label: "Use Case",
          options: [
            { value: "commercial_charter", label: "Commercial Charter" },
            { value: "private_use", label: "Private Use" },
            { value: "racing", label: "Racing" },
            { value: "expedition", label: "Expedition" },
            { value: "day_sailing", label: "Day Sailing" },
          ],
          description: "How the product is being used",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: `${item?.owner_name || "Review"} - ${item?.rating || 0} stars`,
        }),
      },
    },

    // Visual Demo Component
    {
      type: "object" as const,
      name: "visual_demo",
      label: "Visual Demo",
      description: "360° images, 3D models, and interactive demonstrations",
      fields: [
        {
          type: "string" as const,
          name: "type",
          label: "Demo Type",
          required: true,
          options: [
            { value: "360-image", label: "360° Image" },
            { value: "3d-model", label: "3D Model" },
            { value: "video", label: "Video Demo" },
            { value: "interactive", label: "Interactive Demo" },
          ],
          description: "Type of visual demonstration",
        },
        {
          type: "string" as const,
          name: "title",
          label: "Demo Title",
          required: true,
          description: "Title for the visual demo",
        },
        {
          type: "string" as const,
          name: "description",
          label: "Demo Description",
          ui: {
            component: "textarea",
          },
          description: "Description of what the demo shows",
        },
        {
          type: "image" as const,
          name: "image_url",
          label: "360° Image",
          description: "360° product image file",
        },
        {
          type: "string" as const,
          name: "model_url",
          label: "3D Model URL",
          description: "URL to 3D model file (.glb, .gltf)",
        },
        {
          type: "string" as const,
          name: "video_url",
          label: "Video URL",
          description: "URL to demo video",
        },
        {
          type: "object" as const,
          name: "hotspots",
          label: "Interactive Hotspots",
          list: true,
          description: "Interactive points on 360° images",
          fields: [
            {
              type: "object" as const,
              name: "position",
              label: "Position",
              required: true,
              fields: [
                {
                  type: "number" as const,
                  name: "x",
                  label: "X Position",
                  ui: {
                    component: "number",
                    parse: (value: any) => Number(value),
                    format: (value: any) => value?.toString(),
                  },
                },
                {
                  type: "number" as const,
                  name: "y",
                  label: "Y Position",
                  ui: {
                    component: "number",
                    parse: (value: any) => Number(value),
                    format: (value: any) => value?.toString(),
                  },
                },
              ],
            },
            {
              type: "string" as const,
              name: "title",
              label: "Hotspot Title",
              required: true,
            },
            {
              type: "string" as const,
              name: "description",
              label: "Hotspot Description",
            },
            {
              type: "string" as const,
              name: "action",
              label: "Hotspot Action",
              options: [
                { value: "highlight", label: "Highlight Feature" },
                { value: "zoom", label: "Zoom to Detail" },
                { value: "info", label: "Show Information" },
                { value: "navigate", label: "Navigate to View" },
              ],
            },
          ],
          ui: {
            itemProps: (item: any) => ({
              label: item?.title || "Hotspot",
            }),
          },
        },
        {
          type: "string" as const,
          name: "animations",
          label: "Available Animations",
          list: true,
          description: "Available animations for 3D models",
        },
        {
          type: "object" as const,
          name: "camera_positions",
          label: "Camera Positions",
          list: true,
          description: "Predefined camera positions for 3D models",
          fields: [
            {
              type: "string" as const,
              name: "name",
              label: "Position Name",
              required: true,
            },
            {
              type: "object" as const,
              name: "position",
              label: "Camera Position",
              fields: [
                {
                  type: "number" as const,
                  name: "x",
                  label: "X",
                  ui: {
                    component: "number",
                    parse: (value: any) => Number(value),
                    format: (value: any) => value?.toString(),
                  },
                },
                {
                  type: "number" as const,
                  name: "y",
                  label: "Y",
                  ui: {
                    component: "number",
                    parse: (value: any) => Number(value),
                    format: (value: any) => value?.toString(),
                  },
                },
                {
                  type: "number" as const,
                  name: "z",
                  label: "Z",
                  ui: {
                    component: "number",
                    parse: (value: any) => Number(value),
                    format: (value: any) => value?.toString(),
                  },
                },
              ],
            },
          ],
          ui: {
            itemProps: (item: any) => ({
              label: item?.name || "Camera Position",
            }),
          },
        },
      ],
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
      type: "object" as const,
      name: "tags",
      label: "Tags",
      list: true,
      description: "Relevant tags for this post",
      fields: [
        {
          type: "reference" as const,
          name: "tag",
          label: "Tag",
          collections: ["tag"],
          required: true,
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: item?.tag?.name || "Select Tag",
        }),
      },
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

// Yacht Collection (Platform Vision)
const yachtCollection = {
  name: "yacht",
  label: "Yachts",
  path: "content/yachts",
  format: "md" as const,

  fields: [
    {
      type: "string" as const,
      name: "name",
      label: "Yacht Name",
      isTitle: true,
      required: true,
      description: "Full yacht name (e.g., 'M/Y Eclipse', 'S/Y Black Pearl')",
    },
    {
      type: "string" as const,
      name: "slug",
      label: "URL Slug",
      required: true,
      description: "URL-friendly identifier (e.g., 'my-eclipse', 'sy-black-pearl')",
    },
    {
      type: "rich-text" as const,
      name: "description",
      label: "Yacht Description",
      required: true,
      description: "Detailed description of the yacht and its features",
    },
    {
      type: "image" as const,
      name: "image",
      label: "Main Yacht Image",
      description: "Primary hero image for yacht profile",
    },
    {
      type: "image" as const,
      name: "images",
      label: "Gallery Images",
      list: true,
      description: "Additional images for yacht gallery",
    },

    // Basic Yacht Specifications
    {
      type: "number" as const,
      name: "length",
      label: "Length (meters)",
      ui: {
        component: "number",
        parse: (value: any) => Number(value),
        format: (value: any) => value?.toString(),
      },
      description: "Overall length in meters",
    },
    {
      type: "number" as const,
      name: "beam",
      label: "Beam (meters)",
      ui: {
        component: "number",
        parse: (value: any) => Number(value),
        format: (value: any) => value?.toString(),
      },
      description: "Maximum beam in meters",
    },
    {
      type: "number" as const,
      name: "draft",
      label: "Draft (meters)",
      ui: {
        component: "number",
        parse: (value: any) => Number(value),
        format: (value: any) => value?.toString(),
      },
      description: "Maximum draft in meters",
    },
    {
      type: "number" as const,
      name: "displacement",
      label: "Displacement (tons)",
      ui: {
        component: "number",
        parse: (value: any) => Number(value),
        format: (value: any) => value?.toString(),
      },
      description: "Displacement in tons",
    },
    {
      type: "string" as const,
      name: "builder",
      label: "Builder/Shipyard",
      description: "Name of the shipyard that built the yacht",
    },
    {
      type: "string" as const,
      name: "designer",
      label: "Designer",
      description: "Naval architect or design studio",
    },
    {
      type: "number" as const,
      name: "launchYear",
      label: "Launch Year",
      ui: {
        component: "number",
        parse: (value: any) => Number(value),
        format: (value: any) => value?.toString(),
        validate: (value: any) => {
          if (value && (value < 1800 || value > new Date().getFullYear() + 5)) {
            return `Year must be between 1800 and ${new Date().getFullYear() + 5}`
          }
        }
      },
      description: "Year the yacht was launched",
    },
    {
      type: "number" as const,
      name: "deliveryYear",
      label: "Delivery Year",
      ui: {
        component: "number",
        parse: (value: any) => Number(value),
        format: (value: any) => value?.toString(),
        validate: (value: any) => {
          if (value && (value < 1800 || value > new Date().getFullYear() + 5)) {
            return `Year must be between 1800 and ${new Date().getFullYear() + 5}`
          }
        }
      },
      description: "Year the yacht was delivered to owner",
    },
    {
      type: "string" as const,
      name: "homePort",
      label: "Home Port",
      description: "Primary home port or registration location",
    },
    {
      type: "string" as const,
      name: "flag",
      label: "Flag State",
      description: "Flag state/country of registration",
    },
    {
      type: "string" as const,
      name: "classification",
      label: "Classification",
      description: "Classification society (e.g., 'Lloyd's Register', 'ABS')",
    },

    // Performance Specifications
    {
      type: "number" as const,
      name: "cruisingSpeed",
      label: "Cruising Speed (knots)",
      ui: {
        component: "number",
        parse: (value: any) => Number(value),
        format: (value: any) => value?.toString(),
      },
      description: "Typical cruising speed in knots",
    },
    {
      type: "number" as const,
      name: "maxSpeed",
      label: "Maximum Speed (knots)",
      ui: {
        component: "number",
        parse: (value: any) => Number(value),
        format: (value: any) => value?.toString(),
      },
      description: "Maximum speed in knots",
    },
    {
      type: "number" as const,
      name: "range",
      label: "Range (nautical miles)",
      ui: {
        component: "number",
        parse: (value: any) => Number(value),
        format: (value: any) => value?.toString(),
      },
      description: "Range in nautical miles",
    },

    // Accommodation
    {
      type: "number" as const,
      name: "guests",
      label: "Guest Capacity",
      ui: {
        component: "number",
        parse: (value: any) => Number(value),
        format: (value: any) => value?.toString(),
      },
      description: "Maximum number of guests",
    },
    {
      type: "number" as const,
      name: "crew",
      label: "Crew Capacity",
      ui: {
        component: "number",
        parse: (value: any) => Number(value),
        format: (value: any) => value?.toString(),
      },
      description: "Maximum number of crew members",
    },

    // Status and Display
    {
      type: "boolean" as const,
      name: "featured",
      label: "Featured Yacht",
      description: "Mark as featured yacht for homepage display",
    },

    // Yacht Timeline
    {
      type: "object" as const,
      name: "timeline",
      label: "Yacht Timeline",
      list: true,
      description: "Key events in the yacht's history",
      fields: [
        {
          type: "datetime" as const,
          name: "date",
          label: "Event Date",
          required: true,
          description: "Date of the event",
        },
        {
          type: "string" as const,
          name: "event",
          label: "Event Name",
          required: true,
          description: "Name of the event (e.g., 'Keel Laying', 'Launch', 'Delivery')",
        },
        {
          type: "string" as const,
          name: "description",
          label: "Event Description",
          ui: {
            component: "textarea",
          },
          description: "Detailed description of the event",
        },
        {
          type: "string" as const,
          name: "category",
          label: "Event Category",
          required: true,
          options: [
            { value: "launch", label: "Launch" },
            { value: "delivery", label: "Delivery" },
            { value: "refit", label: "Refit" },
            { value: "milestone", label: "Milestone" },
            { value: "service", label: "Service" },
          ],
          description: "Category of the event",
        },
        {
          type: "string" as const,
          name: "location",
          label: "Event Location",
          description: "Location where the event took place",
        },
        {
          type: "image" as const,
          name: "images",
          label: "Event Images",
          list: true,
          description: "Images from the event",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: `${item?.event || "Event"} (${item?.date ? new Date(item.date).getFullYear() : ""})`,
        }),
      },
    },

    // Supplier Map
    {
      type: "object" as const,
      name: "supplierMap",
      label: "Supplier Map",
      list: true,
      description: "Vendors and contractors involved in the yacht project",
      fields: [
        {
          type: "reference" as const,
          name: "vendor",
          label: "Vendor",
          collections: ["vendor"],
          required: true,
          description: "Vendor/contractor reference",
        },
        {
          type: "string" as const,
          name: "discipline",
          label: "Discipline",
          required: true,
          description: "Area of expertise (e.g., 'Electronics', 'Lighting', 'Security')",
        },
        {
          type: "string" as const,
          name: "systems",
          label: "Systems Supplied",
          list: true,
          required: true,
          description: "List of systems supplied by this vendor",
        },
        {
          type: "string" as const,
          name: "role",
          label: "Role",
          required: true,
          options: [
            { value: "primary", label: "Primary Contractor" },
            { value: "subcontractor", label: "Subcontractor" },
            { value: "consultant", label: "Consultant" },
          ],
          description: "Role in the project",
        },
        {
          type: "string" as const,
          name: "projectPhase",
          label: "Project Phase",
          description: "Phase of the project when vendor was involved",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: `${item?.vendor?.name || "Vendor"} - ${item?.discipline || ""}`,
        }),
      },
    },

    // Sustainability Score
    {
      type: "object" as const,
      name: "sustainabilityScore",
      label: "Sustainability Metrics",
      description: "Environmental impact and sustainability metrics",
      fields: [
        {
          type: "number" as const,
          name: "co2Emissions",
          label: "CO₂ Emissions (kg equivalent)",
          ui: {
            component: "number",
            parse: (value: any) => Number(value),
            format: (value: any) => value?.toString(),
          },
          description: "Annual CO₂ emissions in kg equivalent",
        },
        {
          type: "number" as const,
          name: "energyEfficiency",
          label: "Energy Efficiency (kWh/nm)",
          ui: {
            component: "number",
            parse: (value: any) => Number(value),
            format: (value: any) => value?.toString(),
          },
          description: "Energy consumption in kWh per nautical mile",
        },
        {
          type: "string" as const,
          name: "wasteManagement",
          label: "Waste Management",
          options: [
            { value: "excellent", label: "Excellent" },
            { value: "good", label: "Good" },
            { value: "fair", label: "Fair" },
            { value: "poor", label: "Poor" },
          ],
          description: "Waste management rating",
        },
        {
          type: "string" as const,
          name: "waterConservation",
          label: "Water Conservation",
          options: [
            { value: "excellent", label: "Excellent" },
            { value: "good", label: "Good" },
            { value: "fair", label: "Fair" },
            { value: "poor", label: "Poor" },
          ],
          description: "Water conservation rating",
        },
        {
          type: "string" as const,
          name: "materialSustainability",
          label: "Material Sustainability",
          options: [
            { value: "excellent", label: "Excellent" },
            { value: "good", label: "Good" },
            { value: "fair", label: "Fair" },
            { value: "poor", label: "Poor" },
          ],
          description: "Sustainable material usage rating",
        },
        {
          type: "number" as const,
          name: "overallScore",
          label: "Overall Score (1-100)",
          ui: {
            component: "number",
            parse: (value: any) => Number(value),
            format: (value: any) => value?.toString(),
            validate: (value: any) => {
              if (value && (value < 1 || value > 100)) {
                return "Score must be between 1 and 100"
              }
            }
          },
          description: "Overall sustainability score out of 100",
        },
        {
          type: "string" as const,
          name: "certifications",
          label: "Sustainability Certifications",
          list: true,
          description: "Environmental certifications held by the yacht",
        },
      ],
    },

    // Customizations
    {
      type: "object" as const,
      name: "customizations",
      label: "Customizations",
      list: true,
      description: "Custom features and modifications",
      fields: [
        {
          type: "string" as const,
          name: "category",
          label: "Category",
          required: true,
          description: "Category of customization (e.g., 'Interior', 'Technology', 'Exterior')",
        },
        {
          type: "string" as const,
          name: "description",
          label: "Description",
          required: true,
          ui: {
            component: "textarea",
          },
          description: "Description of the customization",
        },
        {
          type: "string" as const,
          name: "vendor",
          label: "Vendor",
          description: "Vendor responsible for the customization",
        },
        {
          type: "image" as const,
          name: "images",
          label: "Images",
          list: true,
          description: "Images of the customization",
        },
        {
          type: "string" as const,
          name: "cost",
          label: "Cost",
          description: "Cost of the customization (if disclosed)",
        },
        {
          type: "datetime" as const,
          name: "completedDate",
          label: "Completion Date",
          description: "Date when the customization was completed",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: `${item?.category || "Customization"}: ${item?.description?.substring(0, 50) || ""}...`,
        }),
      },
    },

    // Maintenance History
    {
      type: "object" as const,
      name: "maintenanceHistory",
      label: "Maintenance History",
      list: true,
      description: "Maintenance and service records",
      fields: [
        {
          type: "datetime" as const,
          name: "date",
          label: "Service Date",
          required: true,
          description: "Date of the maintenance/service",
        },
        {
          type: "string" as const,
          name: "type",
          label: "Maintenance Type",
          required: true,
          options: [
            { value: "routine", label: "Routine Maintenance" },
            { value: "repair", label: "Repair" },
            { value: "upgrade", label: "Upgrade" },
            { value: "inspection", label: "Inspection" },
          ],
          description: "Type of maintenance performed",
        },
        {
          type: "string" as const,
          name: "system",
          label: "System",
          required: true,
          description: "System that was serviced (e.g., 'Engine', 'Navigation', 'Electronics')",
        },
        {
          type: "string" as const,
          name: "description",
          label: "Description",
          required: true,
          ui: {
            component: "textarea",
          },
          description: "Description of the work performed",
        },
        {
          type: "string" as const,
          name: "vendor",
          label: "Service Vendor",
          description: "Vendor who performed the maintenance",
        },
        {
          type: "string" as const,
          name: "cost",
          label: "Cost",
          description: "Cost of the maintenance (if disclosed)",
        },
        {
          type: "datetime" as const,
          name: "nextService",
          label: "Next Service Due",
          description: "Date when next service is due",
        },
        {
          type: "string" as const,
          name: "status",
          label: "Status",
          required: true,
          options: [
            { value: "completed", label: "Completed" },
            { value: "in-progress", label: "In Progress" },
            { value: "scheduled", label: "Scheduled" },
          ],
          description: "Current status of the maintenance",
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: `${item?.type || "Maintenance"} - ${item?.system || ""} (${item?.date ? new Date(item.date).getFullYear() : ""})`,
        }),
      },
    },

    // Relationships
    {
      type: "reference" as const,
      name: "category",
      label: "Yacht Category",
      collections: ["category"],
      description: "Yacht category (motor yacht, sailing yacht, etc.)",
    },
    {
      type: "object" as const,
      name: "tags",
      label: "Yacht Tags",
      list: true,
      description: "Relevant tags for this yacht",
      fields: [
        {
          type: "reference" as const,
          name: "tag",
          label: "Tag",
          collections: ["tag"],
          required: true,
        },
      ],
      ui: {
        itemProps: (item: any) => ({
          label: item?.tag?.name || "Select Tag",
        }),
      },
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
      type: "rich-text" as const,
      name: "mission",
      label: "Company Mission Statement",
      required: true,
      description: "Company mission statement displayed on vendor/partner pages",
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
      mediaRoot: "media",
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
      // @ts-ignore - TinaCMS type issue with fields vs templates
      vendorCollection,
      // @ts-ignore - TinaCMS type issue with fields vs templates
      productCollection,
      // @ts-ignore - TinaCMS type issue with fields vs templates
      yachtCollection,
      // @ts-ignore - TinaCMS type issue with fields vs templates
      blogPostCollection,
      teamMemberCollection,
      
      // Single-Type Collection
      companyInfoCollection,
    ],
  },
});
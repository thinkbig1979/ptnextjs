"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var payload_1 = require("payload");
var db_sqlite_1 = require("@payloadcms/db-sqlite");
exports.default = (0, payload_1.buildConfig)({
    // Basic configuration
    secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
    // Database configuration with SQLite
    db: (0, db_sqlite_1.sqliteAdapter)({
        client: {
            url: process.env.DATABASE_URL || "file:".concat(process.cwd(), "/payload.db"),
        },
    }),
    // Admin configuration
    admin: {
        user: 'users',
    },
    // Collections configuration
    collections: [
        // Users collection for authentication
        {
            slug: 'users',
            auth: true,
            admin: {
                useAsTitle: 'email',
            },
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'role',
                    type: 'select',
                    options: [
                        { label: 'Admin', value: 'admin' },
                        { label: 'Editor', value: 'editor' },
                        { label: 'Author', value: 'author' },
                    ],
                    defaultValue: 'editor',
                    required: true,
                },
            ],
        },
        // Blog Posts collection
        {
            slug: 'blog-posts',
            admin: {
                useAsTitle: 'title',
                defaultColumns: ['title', 'author', 'category', 'publishedAt', 'featured'],
            },
            access: {
                read: function () { return true; }, // Public read access
            },
            fields: [
                {
                    name: 'title',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'slug',
                    type: 'text',
                    required: true,
                    unique: true,
                    admin: {
                        description: 'URL-friendly version of the title',
                    },
                },
                {
                    name: 'excerpt',
                    type: 'textarea',
                    required: true,
                    admin: {
                        description: 'Brief summary of the blog post',
                    },
                },
                {
                    name: 'content',
                    type: 'richText',
                    required: true,
                },
                {
                    name: 'author',
                    type: 'relationship',
                    relationTo: 'authors',
                    required: true,
                },
                {
                    name: 'publishedAt',
                    type: 'date',
                    required: true,
                    admin: {
                        date: {
                            pickerAppearance: 'dayAndTime',
                        },
                    },
                },
                {
                    name: 'category',
                    type: 'relationship',
                    relationTo: 'categories',
                    required: true,
                },
                {
                    name: 'tags',
                    type: 'array',
                    fields: [
                        {
                            name: 'tag',
                            type: 'text',
                        },
                    ],
                },
                {
                    name: 'image',
                    type: 'upload',
                    relationTo: 'media',
                    admin: {
                        description: 'Featured image for the blog post',
                    },
                },
                {
                    name: 'featured',
                    type: 'checkbox',
                    defaultValue: false,
                    admin: {
                        description: 'Display this post in featured sections',
                    },
                },
                {
                    name: 'readTime',
                    type: 'text',
                    admin: {
                        description: 'Estimated reading time (e.g., "5 min read")',
                    },
                },
            ],
            timestamps: true,
            versions: {
                drafts: true,
            },
        },
        // Partners collection
        {
            slug: 'partners',
            admin: {
                useAsTitle: 'name',
                defaultColumns: ['name', 'category', 'location', 'featured'],
            },
            access: {
                read: function () { return true; }, // Public read access
            },
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'category',
                    type: 'relationship',
                    relationTo: 'categories',
                    required: true,
                },
                {
                    name: 'description',
                    type: 'textarea',
                    required: true,
                },
                {
                    name: 'logo',
                    type: 'upload',
                    relationTo: 'media',
                    admin: {
                        description: 'Partner company logo',
                    },
                },
                {
                    name: 'website',
                    type: 'text',
                    admin: {
                        description: 'Partner website URL',
                    },
                },
                {
                    name: 'founded',
                    type: 'number',
                    admin: {
                        description: 'Year the company was founded',
                    },
                },
                {
                    name: 'location',
                    type: 'text',
                    admin: {
                        description: 'Company headquarters location',
                    },
                },
                {
                    name: 'tags',
                    type: 'array',
                    fields: [
                        {
                            name: 'tag',
                            type: 'text',
                        },
                    ],
                },
                {
                    name: 'featured',
                    type: 'checkbox',
                    defaultValue: false,
                    admin: {
                        description: 'Display this partner in featured sections',
                    },
                },
            ],
            timestamps: true,
            versions: {
                drafts: true,
            },
        },
        // Products collection
        {
            slug: 'products',
            admin: {
                useAsTitle: 'name',
                defaultColumns: ['name', 'partner', 'category', 'price'],
            },
            access: {
                read: function () { return true; }, // Public read access
            },
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'partner',
                    type: 'relationship',
                    relationTo: 'partners',
                    required: true,
                    admin: {
                        description: 'The partner company that provides this product',
                    },
                },
                {
                    name: 'category',
                    type: 'relationship',
                    relationTo: 'categories',
                    required: true,
                },
                {
                    name: 'description',
                    type: 'textarea',
                    required: true,
                },
                {
                    name: 'image',
                    type: 'upload',
                    relationTo: 'media',
                    admin: {
                        description: 'Product featured image',
                    },
                },
                {
                    name: 'features',
                    type: 'array',
                    fields: [
                        {
                            name: 'feature',
                            type: 'text',
                        },
                    ],
                    admin: {
                        description: 'Key product features and capabilities',
                    },
                },
                {
                    name: 'price',
                    type: 'text',
                    admin: {
                        description: 'Price information (e.g., "Starting from $50,000" or "Contact for pricing")',
                    },
                },
                {
                    name: 'tags',
                    type: 'array',
                    fields: [
                        {
                            name: 'tag',
                            type: 'text',
                        },
                    ],
                },
            ],
            timestamps: true,
            versions: {
                drafts: true,
            },
        },
        // Categories collection
        {
            slug: 'categories',
            admin: {
                useAsTitle: 'name',
                defaultColumns: ['name', 'type', 'description'],
            },
            access: {
                read: function () { return true; }, // Public read access
            },
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'slug',
                    type: 'text',
                    required: true,
                    unique: true,
                    admin: {
                        description: 'URL-friendly version of the category name',
                    },
                },
                {
                    name: 'description',
                    type: 'textarea',
                    admin: {
                        description: 'Brief description of this category',
                    },
                },
                {
                    name: 'type',
                    type: 'select',
                    options: [
                        { label: 'Blog Category', value: 'blog' },
                        { label: 'Product Category', value: 'product' },
                        { label: 'Partner Category', value: 'partner' },
                    ],
                    required: true,
                    admin: {
                        description: 'What type of content this category applies to',
                    },
                },
                {
                    name: 'color',
                    type: 'text',
                    admin: {
                        description: 'Hex color code for category display (e.g., #3B82F6)',
                    },
                },
            ],
            timestamps: true,
        },
        // Authors collection
        {
            slug: 'authors',
            admin: {
                useAsTitle: 'name',
                defaultColumns: ['name', 'role', 'email'],
            },
            access: {
                read: function () { return true; }, // Public read access
            },
            fields: [
                {
                    name: 'name',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'role',
                    type: 'text',
                    required: true,
                    admin: {
                        description: 'Job title or role (e.g., "CEO & Founder", "Technology Writer")',
                    },
                },
                {
                    name: 'bio',
                    type: 'textarea',
                    required: true,
                    admin: {
                        description: 'Brief professional biography',
                    },
                },
                {
                    name: 'image',
                    type: 'upload',
                    relationTo: 'media',
                    admin: {
                        description: 'Author profile photo',
                    },
                },
                {
                    name: 'email',
                    type: 'email',
                    admin: {
                        description: 'Contact email address',
                    },
                },
                {
                    name: 'linkedin',
                    type: 'text',
                    admin: {
                        description: 'LinkedIn profile URL',
                    },
                },
                {
                    name: 'twitter',
                    type: 'text',
                    admin: {
                        description: 'Twitter/X handle (without @)',
                    },
                },
            ],
            timestamps: true,
        },
        // Media collection for file uploads
        {
            slug: 'media',
            upload: {
                staticDir: 'media',
                imageSizes: [
                    {
                        name: 'thumbnail',
                        width: 400,
                        height: 300,
                        position: 'centre',
                    },
                    {
                        name: 'card',
                        width: 768,
                        height: 1024,
                        position: 'centre',
                    },
                    {
                        name: 'tablet',
                        width: 1024,
                        height: undefined,
                        position: 'centre',
                    },
                ],
                adminThumbnail: 'thumbnail',
                mimeTypes: ['image/*', 'application/pdf'],
            },
            fields: [
                {
                    name: 'alt',
                    type: 'text',
                    admin: {
                        description: 'Alternative text for accessibility',
                    },
                },
                {
                    name: 'caption',
                    type: 'text',
                    admin: {
                        description: 'Image caption or description',
                    },
                },
            ],
            access: {
                read: function () { return true; }, // Public read access for media
            },
        },
    ],
    // Server configuration
    serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
    // TypeScript configuration
    typescript: {
        outputFile: './payload-types.ts',
    },
});

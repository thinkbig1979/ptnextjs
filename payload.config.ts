import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';

// Import collection schemas
import Users from './payload/collections/Users';
import Media from './payload/collections/Media';
import Vendors from './payload/collections/Vendors';
import Products from './payload/collections/Products';
import Categories from './payload/collections/Categories';
import BlogPosts from './payload/collections/BlogPosts';
import TeamMembers from './payload/collections/TeamMembers';
import CompanyInfo from './payload/collections/CompanyInfo';
import Tags from './payload/collections/Tags';
import Yachts from './payload/collections/Yachts';
import TierUpgradeRequests from './payload/collections/TierUpgradeRequests';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // Server URL configuration
  // In development, use the actual port Next.js is running on
  // In production, use NEXT_PUBLIC_SERVER_URL environment variable
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL ||
    (process.env.NODE_ENV === 'development'
      ? `http://localhost:${process.env.PORT || 3000}`
      : 'http://localhost:3000'),

  // Admin user configuration
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Marine Technology Platform',
    },
    components: {
      // Add custom logout button to the admin panel navigation
      afterNavLinks: ['@/payload/components/LogoutButton#LogoutButton'],
    },
  },

  // Database adapter configuration
  // SQLite for all environments (zero-configuration, file-based)
  // Note: For production PostgreSQL deployment, update this configuration
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./data/payload.db',
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    push: true, // Auto-push schema changes to create tables
  }),

  // Rich Text Editor configuration
  editor: lexicalEditor({}),

  // Collections registration
  collections: [
    Users,
    Media,
    Vendors,
    Products,
    Categories,
    BlogPosts,
    TeamMembers,
    CompanyInfo,
    Tags,
    Yachts,
    TierUpgradeRequests,
  ],

  // TypeScript configuration
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // GraphQL configuration (optional)
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },

  // CORS configuration for API routes
  cors: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ].filter(Boolean),

  // CSRF protection
  csrf: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ].filter(Boolean),

  // Secret key for JWT authentication
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key-here-minimum-32-characters',

  // Upload configuration (local filesystem storage)
  upload: {
    limits: {
      fileSize: 5000000, // 5MB max file size
    },
  },

  // Localization (future enhancement)
  localization: false,

  // Telemetry (can disable for privacy)
  telemetry: false,

  // Debug mode (only in development)
  debug: process.env.NODE_ENV === 'development',
});

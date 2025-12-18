import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';

// Conditionally import SQLite adapter only when needed
// This prevents bundling SQLite native modules in PostgreSQL production builds
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqliteAdapter: any = null;
if (process.env.USE_POSTGRES !== 'true') {
  try {
    // Dynamic require to avoid bundling when USE_POSTGRES=true
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sqliteAdapter = require('@payloadcms/db-sqlite').sqliteAdapter;
  } catch {
    // SQLite adapter not available (expected in PostgreSQL-only builds)
    console.log('SQLite adapter not available - using PostgreSQL only');
  }
}

// SECURITY: Validate PAYLOAD_SECRET at startup
if (!process.env.PAYLOAD_SECRET) {
  throw new Error(
    'PAYLOAD_SECRET environment variable is required but not set.\n' +
    'Please set it in your .env file:\n' +
    '  PAYLOAD_SECRET=your-secret-key-here\n\n' +
    'Generate a secure secret with:\n' +
    '  openssl rand -base64 32\n\n' +
    'SECURITY WARNING: Never commit this secret to version control.'
  );
}

if (process.env.PAYLOAD_SECRET.length < 32) {
  console.warn(
    'WARNING: PAYLOAD_SECRET is shorter than recommended minimum of 32 characters.\n' +
    'Generate a secure secret with: openssl rand -base64 32'
  );
}

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
import ImportHistory from './payload/collections/ImportHistory';
import AuditLogs from './payload/collections/AuditLogs';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Database adapter configuration
// USE_POSTGRES=true -> PostgreSQL (required for production Docker deployment)
// USE_POSTGRES=false or unset -> SQLite (quick local development only)
const usePostgres = process.env.USE_POSTGRES === 'true';

// Determine which database adapter to use
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbAdapter: any;

if (usePostgres) {
  // PostgreSQL adapter for production and production-like development
  dbAdapter = postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || 'postgresql://ptnextjs:ptnextjs_dev_password@localhost:5432/ptnextjs',
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    push: true,
  });
} else if (sqliteAdapter) {
  // SQLite adapter for quick local development (only if available)
  dbAdapter = sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./data/payload.db',
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    push: true,
  });
} else {
  // Fallback error if neither adapter is available
  throw new Error(
    'No database adapter available. Either:\n' +
    '  1. Set USE_POSTGRES=true and provide DATABASE_URL for PostgreSQL, or\n' +
    '  2. Ensure @payloadcms/db-sqlite is installed for SQLite development'
  );
}

// Log which database is being used
if (process.env.NODE_ENV === 'development') {
  console.log(`📦 Database: ${usePostgres ? 'PostgreSQL' : 'SQLite'}`);
}

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

  // Database adapter (configured above based on USE_POSTGRES env var)
  db: dbAdapter,

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
    ImportHistory,
    AuditLogs,
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

  // Secret key for JWT authentication (validated at startup)
  secret: process.env.PAYLOAD_SECRET,

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

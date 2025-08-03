
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'

export default buildConfig({
  // Basic configuration
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
  
  // Database configuration with SQLite
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || './payload.db',
    },
  }),

  // Admin configuration
  admin: {
    user: 'users',
  },

  // Basic collections (we'll expand these in Step 2)
  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          required: true,
        },
      ],
    },
  ],

  // Server configuration
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
  
  // TypeScript configuration
  typescript: {
    outputFile: './payload-types.ts',
  },
})

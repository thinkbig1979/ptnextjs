
/**
 * Development-only Payload CMS startup script (JavaScript version)
 * This script starts Payload CMS only during development mode
 * It runs alongside the Next.js dev server on port 3001
 * Updated for Step 4: Admin UI integration at /admin
 */

const express = require('express')
const cors = require('cors')
const path = require('path')

// Environment check - only run in development
if (process.env.NODE_ENV !== 'development') {
  console.log('🚫 Payload CMS startup skipped (not in development mode)')
  process.exit(0)
}

console.log('🚀 Starting Payload CMS in development mode...')
console.log('🔗 Integration: Admin UI accessible via Next.js at http://localhost:3000/admin')

const app = express()

// Configure CORS for Next.js integration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Function to start Payload CMS
const startPayloadCMS = async () => {
  try {
    // Dynamic import for ESM payload
    const payload = (await import('payload')).default
    const { buildConfig } = await import('payload')
    const { sqliteAdapter } = await import('@payloadcms/db-sqlite')

    // Payload configuration
    const payloadConfig = buildConfig({
      secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
      db: sqliteAdapter({
        client: {
          url: process.env.DATABASE_URL || `file:${path.resolve(process.cwd(), 'payload.db')}`,
        },
      }),
      admin: {
        user: 'users',
      },
      collections: [
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
      ],
      serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001',
      typescript: {
        outputFile: path.resolve(__dirname, '../cms/payload-types.ts'),
      },
    })
    
    // Initialize Payload with the Express app
    await payload.init({
      config: payloadConfig,
      express: app,
      onInit: async () => {
        payload.logger.info(`✅ Payload CMS initialized successfully`)
        payload.logger.info(`📊 Admin Panel (Direct): ${payload.getAdminURL()}`)
        payload.logger.info(`🔌 API Endpoint (Direct): ${payload.getAdminURL().replace('/admin', '/api')}`)
        payload.logger.info(`🌐 Admin Panel (via Next.js): http://localhost:3000/admin`)
        payload.logger.info(`🔗 API Endpoint (via Next.js): http://localhost:3000/api/payload`)
        
        // Seed initial admin user if not exists
        try {
          const users = await payload.find({
            collection: 'users',
            limit: 1,
          })
          
          if (users.totalDocs === 0) {
            console.log('👤 Creating initial admin user...')
            await payload.create({
              collection: 'users',
              data: {
                email: 'admin@paulthamessuperyachttechnology.com',
                password: 'admin123',
                name: 'Admin User',
                role: 'admin',
              },
            })
            console.log('✅ Initial admin user created')
            console.log('📧 Email: admin@paulthamessuperyachttechnology.com')
            console.log('🔑 Password: admin123')
          }
        } catch (error) {
          console.log('ℹ️  Admin user setup: ', error.message)
        }
      },
    })

    // Set the port (default to 3001 to avoid conflict with Next.js on 3000)
    const port = process.env.PAYLOAD_PORT || process.env.PORT || 3001
    
    // Start the server
    app.listen(port, () => {
      console.log('🎯 Payload CMS Development Server Started')
      console.log(`📍 Direct Server: http://localhost:${port}`)
      console.log(`🛠️  Direct Admin Panel: http://localhost:${port}/admin`)
      console.log(`🔗 Direct API: http://localhost:${port}/api`)
      console.log('')
      console.log('🌟 INTEGRATED ACCESS (Recommended):')
      console.log(`🎨 Admin Panel: http://localhost:3000/admin`)
      console.log(`📡 API Access: http://localhost:3000/api/payload`)
      console.log('')
      console.log('📝 Note: This server runs only in development mode')
      console.log('🔄 Restart this script if you make changes to CMS config')
      console.log('🔐 Default Login: admin@paulthamessuperyachttechnology.com / admin123')
    })

  } catch (error) {
    console.error('❌ Failed to start Payload CMS:', error)
    console.error('💡 Make sure the CMS configuration is valid and dependencies are installed')
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Payload CMS development server...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Payload CMS development server...')
  process.exit(0)
})

// Start the CMS
startPayloadCMS().catch((error) => {
  console.error('💥 Critical error starting Payload CMS:', error)
  process.exit(1)
})

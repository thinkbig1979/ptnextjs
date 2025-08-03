
/**
 * Simplified Payload CMS startup script
 * This script starts Payload CMS using the original configuration
 */

const express = require('express')
const cors = require('cors')

// Environment check
if (process.env.NODE_ENV !== 'development') {
  console.log('🚫 Payload CMS startup skipped (not in development mode)')
  process.exit(0)
}

console.log('🚀 Starting Payload CMS in development mode...')

const app = express()

// Basic CORS setup
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}))

// Function to start Payload CMS
const startPayloadCMS = async () => {
  try {
    const payload = (await import('payload')).default
    
    // Initialize Payload with minimal config
    await payload.init({
      secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
      express: app,
      onInit: async () => {
        console.log('✅ Payload CMS initialized successfully')
        console.log(`📊 Admin Panel: ${payload.getAdminURL()}`)
        console.log(`🔌 API Endpoint: ${payload.getAdminURL().replace('/admin', '/api')}`)
        console.log(`🌐 Next.js Integration: http://localhost:3000/admin`)
        
        // Try to create admin user if needed
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
              },
            })
            console.log('✅ Initial admin user created')
          }
        } catch (error) {
          console.log('ℹ️  User creation info:', error.message)
        }
      },
    })

    const port = 3001
    app.listen(port, () => {
      console.log(`🎯 Payload CMS running on http://localhost:${port}`)
      console.log(`🛠️  Admin Panel: http://localhost:${port}/admin`)
      console.log(`🔗 API: http://localhost:${port}/api`)
      console.log(`🌟 Via Next.js: http://localhost:3000/admin`)
    })

  } catch (error) {
    console.error('❌ Failed to start Payload CMS:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...')
  process.exit(0)
})

// Start the CMS
startPayloadCMS()

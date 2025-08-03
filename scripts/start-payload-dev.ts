
/**
 * Development-only Payload CMS startup script
 * This script starts Payload CMS only during development mode
 * It runs alongside the Next.js dev server on port 3001
 */

import express from 'express'
import payload from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

// Environment check - only run in development
if (process.env.NODE_ENV !== 'development') {
  console.log('🚫 Payload CMS startup skipped (not in development mode)')
  process.exit(0)
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to CMS configuration
const CMS_CONFIG_PATH = path.resolve(__dirname, '../cms/payload.config.ts')

console.log('🚀 Starting Payload CMS in development mode...')

const app = express()

// Function to start Payload CMS
const startPayloadCMS = async () => {
  try {
    // Import the CMS configuration dynamically
    const { default: payloadConfig } = await import(CMS_CONFIG_PATH)
    
    // Initialize Payload with the Express app
    await payload.init({
      ...payloadConfig,
      express: app,
      onInit: async () => {
        payload.logger.info(`✅ Payload CMS initialized successfully`)
        payload.logger.info(`📊 Admin Panel: ${payload.getAdminURL()}`)
        payload.logger.info(`🔌 API Endpoint: ${payload.getAdminURL().replace('/admin', '/api')}`)
      },
    })

    // Set the port (default to 3001 to avoid conflict with Next.js on 3000)
    const port = process.env.PAYLOAD_PORT || process.env.PORT || 3001
    
    // Start the server
    app.listen(port, () => {
      console.log('🎯 Payload CMS Development Server Started')
      console.log(`📍 Server: http://localhost:${port}`)
      console.log(`🛠️  Admin Panel: http://localhost:${port}/admin`)
      console.log(`🔗 API: http://localhost:${port}/api`)
      console.log('📝 Note: This server runs only in development mode')
      console.log('🔄 Restart this script if you make changes to CMS config')
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

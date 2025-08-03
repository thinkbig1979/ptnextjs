
import express from 'express'
import payload from 'payload'

const app = express()

// Initialize Payload
const start = async () => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
    express: app,
    onInit: () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
    },
  })

  const port = process.env.PORT || 3001
  
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
    console.log(`Admin panel: http://localhost:${port}/admin`)
  })
}

start().catch((error) => {
  console.error('Failed to start server:', error)
})

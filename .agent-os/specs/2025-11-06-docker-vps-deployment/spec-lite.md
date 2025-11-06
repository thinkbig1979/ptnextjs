# Spec Summary (Lite)

Create a production-ready Docker Compose stack for deploying the Next.js + Payload CMS application to a VPS server, designed to operate behind an existing reverse proxy via shared Docker networking. The stack uses SQLite with persistent volumes, includes deployment automation scripts (deploy, update, stop, backup), and provides health check endpoints for monitoring. The implementation includes a multi-stage Dockerfile for optimized image size, environment variable management with .env templates, and comprehensive documentation for VPS deployment.

# Tech Stack

## Context

Global tech stack defaults for Agent OS projects, overridable in project-specific `.agent-os/product/tech-stack.md`.

- App Framework: Nextjs latest stable
- Language; TypeScript
- Primary Database: PostgreSQL 17+
- ORM: Active Record
- JavaScript Framework: React latest stable
- Build Tool: Vite
- Import Strategy: Node.js modules
- Package Manager: pnpm
- Node Version: 22 LTS
- CSS Framework: TailwindCSS 4.0+
- UI Components: shadcdn latest
- Font Provider: Google Fonts
- Font Loading: Self-hosted for performance
- Icons: Lucide React components
- Application Hosting: Self Hosted Docker Compose Stacks
- Hosting Region: Primary region based on user base
- Database Hosting: Digital Ocean Managed PostgreSQL
- Database Backups: Daily automated
- Asset Storage: Amazon S3
- CDN: CloudFront
- Asset Access: Private with signed URLs
- CI/CD Platform: GitHub Actions
- CI/CD Trigger: Push to main/staging branches
- Tests: Run before deployment
- Production Environment: main branch
- Staging Environment: staging branch

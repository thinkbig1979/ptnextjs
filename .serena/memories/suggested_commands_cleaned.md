# Development Commands - TinaCMS Only

## Development
```bash
# Start TinaCMS development server with Next.js
npm run dev:tinacms

# Regular Next.js development (no CMS editing)
npm run dev
```

## Build and Deploy
```bash
# Build static site with TinaCMS content
npm run build

# Preview production build
npm start

# TinaCMS specific commands
npm run tina:build    # Build TinaCMS
npm run tina:setup    # Initialize TinaCMS
```

## Notes
- **Only TinaCMS** is supported for content management
- No fallback data sources
- No Payload CMS integration  
- Build will fail if TinaCMS content is malformed
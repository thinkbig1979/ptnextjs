# Essential Development Commands - CORRECTED

## Understanding the App
This app works in **TWO MODES**:

### Mode 1: Static Data Only (Default Development)
```bash
npm run dev
```
- Next.js runs on port 3000
- Uses static data from `lib/data.ts` 
- No CMS connection needed
- **This is the normal way to run the app**

### Mode 2: With CMS Integration
```bash
# Option A: Both services
./scripts/dev-with-cms.sh

# Option B: Enable CMS with environment variable
USE_PAYLOAD_CMS=true npm run dev
```

## Access Points

### Static Mode (Default)
- **App**: http://localhost:3000 (works with static data)

### CMS Mode (Optional)
- **App**: http://localhost:3000 (fetches from CMS, falls back to static)
- **CMS Admin**: http://localhost:3001/admin 
- **CMS API**: http://localhost:3001/api

## CMS Details
- **Email**: admin@paulthamessuperyachttechnology.com
- **Password**: admin123

## Build Commands
```bash
npm run build    # Build for production
npm start        # Start production server
npm run lint     # ESLint checking
```

## Key Insight
The app is designed to work perfectly **without** the CMS running. The CMS is optional enhancement, not a requirement.
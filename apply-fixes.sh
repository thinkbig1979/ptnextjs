#!/bin/bash
set -e

cd /home/edwin/development/ptnextjs

# Fix 1: Seed API - Remove double hashing
echo "Fixing seed API double-hashing..."
sed -i 's/const hashedPassword = await authService.hashPassword(vendorData.password);/\/\/ Validate password strength (will be hashed by Payload CMS)\n        try {\n          await authService.hashPassword(vendorData.password);\n        } catch (validationError) {\n          errors[`vendor_${i}_${vendorData.companyName}`] = validationError instanceof Error ? validationError.message : "Invalid password";\n          continue;\n        }/' app/api/test/vendors/seed/route.ts

# Replace hashed password with plain password in payload.create call
sed -i 's/password: hashedPassword,/password: vendorData.password, \/\/ Plain password - Payload CMS will hash it/' app/api/test/vendors/seed/route.ts

echo "✓ Seed API fixed"

# Fix 2: Add logging to login endpoint
echo "Fixing login endpoint..."
sed -i 's/const message = error instanceof Error ? error.message : '\''Authentication failed'\'';/const message = error instanceof Error ? error.message : "Authentication failed";\n\n    \/\/ Log authentication failures for debugging\n    console.error("[Login] Authentication error:", {\n      email: body?.email || "unknown",\n      error: message,\n      timestamp: new Date().toISOString(),\n    });/' app/api/auth/login/route.ts

echo "✓ Login endpoint fixed"

echo "Done! All fixes applied."

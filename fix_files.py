#!/usr/bin/env python3
"""Fix authentication issues in the codebase"""
import os
import re

# Fix 1: Seed API - remove double hashing
print("Fixing seed API...")
seed_file = "/home/edwin/development/ptnextjs/app/api/test/vendors/seed/route.ts"
with open(seed_file, 'r') as f:
    content = f.read()

# Replace the hashing section
old_pattern = r"        // Hash password\n        const hashedPassword = await authService\.hashPassword\(vendorData\.password\);\n        // Generate slug"

new_code = """        // Validate password strength first (but don't hash - Payload CMS will do that)
        try {
          await authService.hashPassword(vendorData.password); // This just validates password strength
        } catch (validationError) {
          errors[`vendor_${i}_${vendorData.companyName}`] = validationError instanceof Error ? validationError.message : 'Invalid password';
          continue;
        }

        // Generate slug"""

content = re.sub(old_pattern, new_code, content)

# Replace password field
old_password = r"            password: hashedPassword,"
new_password = r"            password: vendorData.password, // Plain password - Payload CMS will hash it"
content = re.sub(old_password, new_password, content)

with open(seed_file, 'w') as f:
    f.write(content)

print("✓ Seed API fixed")

# Fix 2: Login endpoint - add logging
print("Fixing login endpoint...")
login_file = "/home/edwin/development/ptnextjs/app/api/auth/login/route.ts"
with open(login_file, 'r') as f:
    content = f.read()

# Add logging after error message is created
old_pattern = r"  } catch \(error\) \{\n    const message = error instanceof Error \? error\.message : 'Authentication failed';"

new_code = """  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';

    // Log authentication failures for debugging
    console.error('[Login] Authentication error:', {
      email: body?.email || 'unknown',
      error: message,
      timestamp: new Date().toISOString(),
    });"""

content = re.sub(old_pattern, new_code, content)

with open(login_file, 'w') as f:
    f.write(content)

print("✓ Login endpoint fixed")

print("All fixes applied successfully!")

/**
 * Admin Authentication Standardization Test
 *
 * Verifies that all admin vendor routes use the standardized
 * authenticateAdmin utility from lib/utils/admin-auth.ts
 *
 * Task: ptnextjs-2m1s
 */

import fs from 'fs';
import path from 'path';

describe('Admin API Authentication Standardization', () => {
  const rootDir = path.join(__dirname, '../..');

  const adminVendorRoutes = [
    'app/api/admin/vendors/[id]/approve/route.ts',
    'app/api/admin/vendors/[id]/reject/route.ts',
    'app/api/admin/vendors/[id]/tier/route.ts',
    'app/api/admin/vendors/pending/route.ts',
    'app/api/admin/vendors/approval/route.ts',
  ];

  describe('Import Standardization', () => {
    adminVendorRoutes.forEach((routePath) => {
      it(`${routePath} should import authenticateAdmin from lib/utils/admin-auth`, () => {
        const fullPath = path.join(rootDir, routePath);
        const content = fs.readFileSync(fullPath, 'utf8');

        // Should have the new import
        expect(content).toContain("import { authenticateAdmin } from '@/lib/utils/admin-auth'");

        // Should NOT have the old import
        expect(content).not.toContain("import { authService } from '@/lib/services/auth-service'");
      });
    });
  });

  describe('Function Standardization', () => {
    adminVendorRoutes.forEach((routePath) => {
      it(`${routePath} should NOT have local extractAdminUser function`, () => {
        const fullPath = path.join(rootDir, routePath);
        const content = fs.readFileSync(fullPath, 'utf8');

        // Should NOT have extractAdminUser function
        expect(content).not.toMatch(/function extractAdminUser\(/);
      });

      it(`${routePath} should use authenticateAdmin with proper error handling`, () => {
        const fullPath = path.join(rootDir, routePath);
        const content = fs.readFileSync(fullPath, 'utf8');

        // Should call authenticateAdmin
        expect(content).toMatch(/const auth = await authenticateAdmin\(request\)/);

        // Should have error handling
        expect(content).toMatch(/if \('error' in auth\)/);
        expect(content).toMatch(/return NextResponse\.json\(/);
      });
    });
  });

  describe('Authentication Pattern Consistency', () => {
    it('All admin vendor routes should follow the same authentication pattern', () => {
      const patterns = adminVendorRoutes.map((routePath) => {
        const fullPath = path.join(rootDir, routePath);
        const content = fs.readFileSync(fullPath, 'utf8');

        // Extract the authentication block
        const authMatch = content.match(
          /const auth = await authenticateAdmin\(request\);[\s\S]*?if \('error' in auth\) \{[\s\S]*?\}/
        );

        return authMatch ? authMatch[0] : null;
      });

      // All should have auth pattern
      patterns.forEach((pattern, index) => {
        expect(pattern).not.toBeNull();
        expect(pattern).toContain('const auth = await authenticateAdmin(request)');
        expect(pattern).toContain("if ('error' in auth)");
      });
    });
  });

  describe('Backward Compatibility', () => {
    it('authenticateAdmin utility should support both cookie types', () => {
      const utilPath = path.join(rootDir, 'lib/utils/admin-auth.ts');
      const content = fs.readFileSync(utilPath, 'utf8');

      // Should support payload-token
      expect(content).toContain("request.cookies.get('payload-token')");

      // Should support access_token for backward compatibility
      expect(content).toContain("request.cookies.get('access_token')");

      // Should support Authorization header
      expect(content).toContain("request.headers.get('authorization')");
    });
  });

  describe('Error Response Standardization', () => {
    adminVendorRoutes.forEach((routePath) => {
      it(`${routePath} should use structured error responses`, () => {
        const fullPath = path.join(rootDir, routePath);
        const content = fs.readFileSync(fullPath, 'utf8');

        // Should return error with proper structure
        const errorPattern = /return NextResponse\.json\(\s*\{ error: auth\.message \},\s*\{ status: auth\.status \}/;
        expect(content).toMatch(errorPattern);
      });
    });
  });

  describe('No Redundant Error Handling', () => {
    adminVendorRoutes.forEach((routePath) => {
      it(`${routePath} should not have redundant auth error handling in catch blocks`, () => {
        const fullPath = path.join(rootDir, routePath);
        const content = fs.readFileSync(fullPath, 'utf8');

        // These error checks are now redundant since authenticateAdmin handles them
        // The file might still have generic error handling, but not these specific checks
        const catchBlock = content.match(/catch \(error\) \{[\s\S]*?\}/);

        if (catchBlock) {
          // Should not have these specific string checks in the catch block
          // since auth errors are handled before we get to the try block
          const hasRedundantAuthCheck = /message\.includes\('Authentication required'\)/.test(catchBlock[0]);
          const hasRedundantAdminCheck = /message\.includes\('Admin access required'\)/.test(catchBlock[0]);

          expect(hasRedundantAuthCheck).toBe(false);
          expect(hasRedundantAdminCheck).toBe(false);
        }
      });
    });
  });
});

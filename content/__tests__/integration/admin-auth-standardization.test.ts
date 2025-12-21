/**
 * Admin Authentication Standardization Test
 *
 * Verifies that all admin vendor routes use the unified
 * @/lib/auth module for authentication.
 *
 * Task: ptnextjs-21ib (updated for @/lib/auth migration)
 */

import fs from 'fs';
import path from 'path';

describe('Admin API Authentication Standardization', () => {
  const rootDir = path.join(__dirname, '../../..');

  const adminVendorRoutes = [
    'app/api/admin/vendors/[id]/approve/route.ts',
    'app/api/admin/vendors/[id]/reject/route.ts',
    'app/api/admin/vendors/[id]/tier/route.ts',
    'app/api/admin/vendors/pending/route.ts',
    'app/api/admin/vendors/approval/route.ts',
  ];

  describe('Import Standardization', () => {
    adminVendorRoutes.forEach((routePath) => {
      it(`${routePath} should import requireAdmin from @/lib/auth`, () => {
        const fullPath = path.join(rootDir, routePath);
        const content = fs.readFileSync(fullPath, 'utf8');

        // Should have the new unified auth import
        expect(content).toContain("import { requireAdmin } from '@/lib/auth'");

        // Should NOT have the deprecated imports
        expect(content).not.toContain("import { authService } from '@/lib/services/auth-service'");
        expect(content).not.toContain("import { authenticateAdmin } from '@/lib/utils/admin-auth'");
      });
    });
  });

  describe('Function Standardization', () => {
    adminVendorRoutes.forEach((routePath) => {
      it(`${routePath} should NOT have local extractAdminUser function`, () => {
        const fullPath = path.join(rootDir, routePath);
        const content = fs.readFileSync(fullPath, 'utf8');

        // Should NOT have inline authentication functions
        expect(content).not.toMatch(/function extractAdminUser\(/);
      });

      it(`${routePath} should use requireAdmin with proper error handling`, () => {
        const fullPath = path.join(rootDir, routePath);
        const content = fs.readFileSync(fullPath, 'utf8');

        // Should call requireAdmin
        expect(content).toMatch(/const auth = await requireAdmin\(request\)/);

        // Should have success-based error handling
        expect(content).toMatch(/if \(!auth\.success\)/);
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
          /const auth = await requireAdmin\(request\);[\s\S]*?if \(!auth\.success\) \{[\s\S]*?\}/
        );

        return authMatch ? authMatch[0] : null;
      });

      // All should have auth pattern
      patterns.forEach((pattern) => {
        expect(pattern).not.toBeNull();
        expect(pattern).toContain('const auth = await requireAdmin(request)');
        expect(pattern).toContain('if (!auth.success)');
      });
    });
  });

  describe('Unified Auth Module', () => {
    it('@/lib/auth should export requireAdmin function', () => {
      const authPath = path.join(rootDir, 'lib/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf8');

      // Should export requireAdmin
      expect(content).toContain('export async function requireAdmin');
    });

    it('@/lib/auth should support Authorization header', () => {
      const authPath = path.join(rootDir, 'lib/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf8');

      // Should support Authorization header
      expect(content).toContain("headers.get('authorization')");
    });

    it('@/lib/auth should support access_token cookie', () => {
      const authPath = path.join(rootDir, 'lib/auth/index.ts');
      const content = fs.readFileSync(authPath, 'utf8');

      // Should support access_token cookie
      expect(content).toContain("cookies.get('access_token')");
    });
  });

  describe('Error Response Standardization', () => {
    adminVendorRoutes.forEach((routePath) => {
      it(`${routePath} should use structured error responses from auth result`, () => {
        const fullPath = path.join(rootDir, routePath);
        const content = fs.readFileSync(fullPath, 'utf8');

        // Should return error from auth result
        expect(content).toMatch(/error: auth\.error/);
        expect(content).toMatch(/status: auth\.status/);
      });
    });
  });

  describe('No Deprecated Auth Patterns', () => {
    adminVendorRoutes.forEach((routePath) => {
      it(`${routePath} should not use deprecated auth patterns`, () => {
        const fullPath = path.join(rootDir, routePath);
        const content = fs.readFileSync(fullPath, 'utf8');

        // Should not have deprecated imports
        expect(content).not.toContain('@/lib/utils/admin-auth');
        expect(content).not.toContain('@/lib/services/auth-service');
        expect(content).not.toContain('@/lib/middleware/auth-middleware');

        // Should not have inline token validation
        expect(content).not.toContain('authService.validateToken');
        expect(content).not.toContain("cookies.get('access_token')?.value");
      });
    });
  });
});

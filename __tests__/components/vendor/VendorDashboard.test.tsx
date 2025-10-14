/**
 * VendorDashboard Component Test
 *
 * Tests for vendor dashboard component with authentication flows,
 * tier-based UI, navigation, and route protection.
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/__tests__/setup/react-testing-library.config';
import VendorDashboard from '@/app/vendor/dashboard/page';

// Mock Next.js navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/vendor/dashboard',
}));

describe('VendorDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication and Route Protection', () => {
    it('redirects to login if not authenticated', async () => {
      // Render without authentication
      renderWithProviders(<VendorDashboard />, {
        authContext: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          role: null,
          tier: null,
          login: jest.fn(),
          logout: jest.fn(),
          refreshUser: jest.fn(),
        },
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/vendor/login');
      });
    });

    it('shows loading state while checking authentication', () => {
      renderWithProviders(<VendorDashboard />, {
        authContext: {
          user: null,
          isAuthenticated: false,
          isLoading: true,
          error: null,
          role: null,
          tier: null,
          login: jest.fn(),
          logout: jest.fn(),
          refreshUser: jest.fn(),
        },
      });

      expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
    });
  });

  describe('Dashboard Rendering', () => {
    it('renders dashboard layout with vendor information', () => {
      const mockUser = {
        id: 'vendor-001',
        email: 'vendor@example.com',
        role: 'vendor' as const,
        tier: 'tier2' as const,
      };

      renderWithProviders(<VendorDashboard />, {
        authContext: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          role: 'vendor',
          tier: 'tier2',
          login: jest.fn(),
          logout: jest.fn(),
          refreshUser: jest.fn(),
        },
      });

      // Check welcome header displays email username
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/welcome/i);
      expect(screen.getByText(/vendor/i)).toBeInTheDocument();
    });

    it('displays profile status card', () => {
      const mockUser = {
        id: 'vendor-001',
        email: 'vendor@example.com',
        role: 'vendor' as const,
        tier: 'tier2' as const,
      };

      renderWithProviders(<VendorDashboard />, {
        authContext: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          role: 'vendor',
          tier: 'tier2',
          login: jest.fn(),
          logout: jest.fn(),
          refreshUser: jest.fn(),
        },
      });

      expect(screen.getByText(/profile status/i)).toBeInTheDocument();
      expect(screen.getByText(/profile completion/i)).toBeInTheDocument();
      expect(screen.getByText(/approval status/i)).toBeInTheDocument();
    });
  });

  describe('Tier Badge Display', () => {
    it('displays tier 2 badge for tier2 vendors', () => {
      const mockUser = {
        id: 'vendor-002',
        email: 'vendor.tier2@example.com',
        role: 'vendor' as const,
        tier: 'tier2' as const,
      };

      renderWithProviders(<VendorDashboard />, {
        authContext: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          role: 'vendor',
          tier: 'tier2',
          login: jest.fn(),
          logout: jest.fn(),
          refreshUser: jest.fn(),
        },
      });

      expect(screen.getByText(/tier 2/i)).toBeInTheDocument();
    });

    it('displays free tier badge for free tier vendors', () => {
      const mockUser = {
        id: 'vendor-003',
        email: 'vendor.free@example.com',
        role: 'vendor' as const,
        tier: 'free' as const,
      };

      renderWithProviders(<VendorDashboard />, {
        authContext: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          role: 'vendor',
          tier: 'free',
          login: jest.fn(),
          logout: jest.fn(),
          refreshUser: jest.fn(),
        },
      });

      expect(screen.getByText(/free tier/i)).toBeInTheDocument();
    });
  });

  describe('Tier-Based UI Features', () => {
    it('shows product management link for tier2 vendors', () => {
      const mockUser = {
        id: 'vendor-tier2',
        email: 'vendor.tier2@example.com',
        role: 'vendor' as const,
        tier: 'tier2' as const,
      };

      renderWithProviders(<VendorDashboard />, {
        authContext: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          role: 'vendor',
          tier: 'tier2',
          login: jest.fn(),
          logout: jest.fn(),
          refreshUser: jest.fn(),
        },
      });

      expect(screen.getByRole('button', { name: /view products/i })).toBeInTheDocument();
    });

    it('hides product management link for free tier vendors', () => {
      const mockUser = {
        id: 'vendor-free',
        email: 'vendor.free@example.com',
        role: 'vendor' as const,
        tier: 'free' as const,
      };

      renderWithProviders(<VendorDashboard />, {
        authContext: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          role: 'vendor',
          tier: 'free',
          login: jest.fn(),
          logout: jest.fn(),
          refreshUser: jest.fn(),
        },
      });

      expect(screen.queryByRole('button', { name: /view products/i })).not.toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('displays edit profile button', () => {
      const mockUser = {
        id: 'vendor-001',
        email: 'vendor@example.com',
        role: 'vendor' as const,
        tier: 'tier2' as const,
      };

      renderWithProviders(<VendorDashboard />, {
        authContext: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          role: 'vendor',
          tier: 'tier2',
          login: jest.fn(),
          logout: jest.fn(),
          refreshUser: jest.fn(),
        },
      });

      expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
    });

    it('displays contact support button', () => {
      const mockUser = {
        id: 'vendor-001',
        email: 'vendor@example.com',
        role: 'vendor' as const,
        tier: 'tier2' as const,
      };

      renderWithProviders(<VendorDashboard />, {
        authContext: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          role: 'vendor',
          tier: 'tier2',
          login: jest.fn(),
          logout: jest.fn(),
          refreshUser: jest.fn(),
        },
      });

      expect(screen.getByRole('button', { name: /contact support/i })).toBeInTheDocument();
    });

    it('navigates to profile page when edit profile clicked', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: 'vendor-001',
        email: 'vendor@example.com',
        role: 'vendor' as const,
        tier: 'tier2' as const,
      };

      renderWithProviders(<VendorDashboard />, {
        authContext: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          role: 'vendor',
          tier: 'tier2',
          login: jest.fn(),
          logout: jest.fn(),
          refreshUser: jest.fn(),
        },
      });

      await user.click(screen.getByRole('button', { name: /edit profile/i }));

      expect(mockPush).toHaveBeenCalledWith('/vendor/dashboard/profile');
    });
  });

  describe('Approval Status Display', () => {
    it('displays pending approval message for pending vendors', () => {
      const mockUser = {
        id: 'vendor-pending',
        email: 'vendor.pending@example.com',
        role: 'vendor' as const,
        tier: 'free' as const,
      };

      renderWithProviders(<VendorDashboard />, {
        authContext: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          role: 'vendor',
          tier: 'free',
          login: jest.fn(),
          logout: jest.fn(),
          refreshUser: jest.fn(),
        },
      });

      expect(screen.getByText(/pending approval/i)).toBeInTheDocument();
    });

    it('does not display pending message for approved vendors', () => {
      const mockUser = {
        id: 'vendor-approved',
        email: 'vendor.tier2@example.com',
        role: 'vendor' as const,
        tier: 'tier2' as const,
      };

      renderWithProviders(<VendorDashboard />, {
        authContext: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          role: 'vendor',
          tier: 'tier2',
          login: jest.fn(),
          logout: jest.fn(),
          refreshUser: jest.fn(),
        },
      });

      // Should not have the yellow banner
      const pendingBanner = screen.queryByText(/your account is pending approval/i);
      expect(pendingBanner).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      const mockUser = {
        id: 'vendor-001',
        email: 'vendor@example.com',
        role: 'vendor' as const,
        tier: 'tier2' as const,
      };

      renderWithProviders(<VendorDashboard />, {
        authContext: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          role: 'vendor',
          tier: 'tier2',
          login: jest.fn(),
          logout: jest.fn(),
          refreshUser: jest.fn(),
        },
      });

      // Check h1 exists
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('has proper ARIA labels on interactive elements', () => {
      const mockUser = {
        id: 'vendor-001',
        email: 'vendor@example.com',
        role: 'vendor' as const,
        tier: 'tier2' as const,
      };

      renderWithProviders(<VendorDashboard />, {
        authContext: {
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          role: 'vendor',
          tier: 'tier2',
          login: jest.fn(),
          logout: jest.fn(),
          refreshUser: jest.fn(),
        },
      });

      expect(screen.getByRole('button', { name: /edit profile/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /view products/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /contact support/i })).toHaveAttribute('aria-label');
    });
  });
});

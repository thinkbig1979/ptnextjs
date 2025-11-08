import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TierGate } from '@/components/shared/TierGate';

// Mock dependencies
jest.mock('@/lib/context/AuthContext', () => ({
  useAuth: jest.fn()
}));

const { useAuth } = require('@/lib/context/AuthContext');

describe('TierGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock: non-admin user with tier2
    useAuth.mockReturnValue({
      tier: 'tier2',
      role: 'user',
      isAuthenticated: true
    });
  });

  describe('Tier 0 (Free) Access Control', () => {
    it('blocks content for free tier vendors', () => {
      useAuth.mockReturnValue({
        tier: 'free',
        role: 'user',
        isAuthenticated: true
      });

      render(
        <TierGate requiredTier="tier2">
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('shows fallback for free tier vendors', () => {
      useAuth.mockReturnValue({
        tier: 'free',
        role: 'user',
        isAuthenticated: true
      });

      render(
        <TierGate
          requiredTier="tier2"
          fallback={<div>Upgrade Required</div>}
        >
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.getByText('Upgrade Required')).toBeInTheDocument();
    });
  });

  describe('Tier 1 Access Control', () => {
    it('blocks tier2 content for tier1 vendors', () => {
      useAuth.mockReturnValue({
        tier: 'tier1',
        role: 'user',
        isAuthenticated: true
      });

      render(
        <TierGate requiredTier="tier2">
          <div>Tier 2 Content</div>
        </TierGate>
      );

      expect(screen.queryByText('Tier 2 Content')).not.toBeInTheDocument();
    });

    it('allows tier1 content for tier1 vendors', () => {
      useAuth.mockReturnValue({
        tier: 'tier1',
        role: 'user',
        isAuthenticated: true
      });

      render(
        <TierGate requiredTier="tier1">
          <div>Tier 1 Content</div>
        </TierGate>
      );

      expect(screen.getByText('Tier 1 Content')).toBeInTheDocument();
    });
  });

  describe('Tier 2 Access Control', () => {
    it('allows tier2 content for tier2 vendors', () => {
      useAuth.mockReturnValue({
        tier: 'tier2',
        role: 'user',
        isAuthenticated: true
      });

      render(
        <TierGate requiredTier="tier2">
          <div>Tier 2 Content</div>
        </TierGate>
      );

      expect(screen.getByText('Tier 2 Content')).toBeInTheDocument();
    });

    it('allows tier1 content for tier2 vendors', () => {
      useAuth.mockReturnValue({
        tier: 'tier2',
        role: 'user',
        isAuthenticated: true
      });

      render(
        <TierGate requiredTier="tier1">
          <div>Tier 1 Content</div>
        </TierGate>
      );

      expect(screen.getByText('Tier 1 Content')).toBeInTheDocument();
    });

    it('blocks tier3 content for tier2 vendors', () => {
      useAuth.mockReturnValue({
        tier: 'tier2',
        role: 'user',
        isAuthenticated: true
      });

      render(
        <TierGate requiredTier="tier3">
          <div>Tier 3 Content</div>
        </TierGate>
      );

      expect(screen.queryByText('Tier 3 Content')).not.toBeInTheDocument();
    });
  });

  describe('Admin Access Control', () => {
    it('allows all content for admin users regardless of tier', () => {
      useAuth.mockReturnValue({
        tier: 'free',
        role: 'admin',
        isAuthenticated: true
      });

      render(
        <TierGate requiredTier="tier3">
          <div>Premium Content</div>
        </TierGate>
      );

      expect(screen.getByText('Premium Content')).toBeInTheDocument();
    });
  });

  describe('Fallback Rendering', () => {
    it('renders custom fallback when provided', () => {
      useAuth.mockReturnValue({
        tier: 'free',
        role: 'user',
        isAuthenticated: true
      });

      const fallback = <div data-testid="custom-fallback">Custom Upgrade Message</div>;

      render(
        <TierGate requiredTier="tier1" fallback={fallback}>
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('renders default upgrade message when no fallback provided', () => {
      useAuth.mockReturnValue({
        tier: 'free',
        role: 'user',
        isAuthenticated: true
      });

      render(
        <TierGate requiredTier="tier1">
          <div>Protected Content</div>
        </TierGate>
      );

      // Check for upgrade alert is displayed
      expect(screen.getByText(/premium feature/i)).toBeInTheDocument();
      // Should NOT show the protected content
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('renders nothing when showUpgradeMessage is false and no fallback provided', () => {
      useAuth.mockReturnValue({
        tier: 'free',
        role: 'user',
        isAuthenticated: true
      });

      const { container } = render(
        <TierGate requiredTier="tier1" showUpgradeMessage={false}>
          <div>Protected Content</div>
        </TierGate>
      );

      // When nothing is rendered, container should have no content
      expect(container.firstChild).toBeNull();
    });
  });

  describe('CSS Classes', () => {
    it('applies custom className to wrapper', () => {
      useAuth.mockReturnValue({
        tier: 'tier2',
        role: 'user',
        isAuthenticated: true
      });

      const { container } = render(
        <TierGate requiredTier="tier1" className="custom-class">
          <div>Protected Content</div>
        </TierGate>
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });
  });
});

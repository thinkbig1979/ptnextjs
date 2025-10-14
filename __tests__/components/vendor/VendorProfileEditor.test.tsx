/**
 * VendorProfileEditor Component Test
 * Tests tier-based restrictions and profile editing
 */

import { renderWithTier } from '@/__tests__/setup/react-testing-library.config';
import { screen, waitFor } from '@testing-library/react';
import { fillAndSubmitForm, expectToHaveError, expectToBeVisible } from '@/__tests__/utils/user-interaction-helpers';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';

import { VendorProfileEditor } from '@/components/vendor/VendorProfileEditor';

describe('VendorProfileEditor', () => {
  describe('Tier Restrictions', () => {
    it('allows free tier users to edit basic fields', async () => {
      renderWithTier(<VendorProfileEditor />, 'free');

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/company name/i)).toBeEnabled();
      expect(screen.getByLabelText(/description/i)).toBeEnabled();
      expect(screen.getByLabelText(/contact email/i)).toBeEnabled();
      expect(screen.getByLabelText(/contact phone/i)).toBeEnabled();
    });

    it('restricts tier1 fields for free tier users', async () => {
      renderWithTier(<VendorProfileEditor />, 'free');

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      });

      // Tier 1+ fields should not be visible to free tier users
      expect(screen.queryByLabelText(/^website$/i)).not.toBeInTheDocument();

      // Should see upgrade message
      await expectToBeVisible(/upgrade to tier 1/i);
    });

    it('allows tier2 users to edit all fields', async () => {
      renderWithTier(<VendorProfileEditor />, 'tier2');

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      });

      // Basic fields
      expect(screen.getByLabelText(/company name/i)).toBeEnabled();
      expect(screen.getByLabelText(/description/i)).toBeEnabled();

      // Tier 1+ fields
      expect(screen.getByLabelText(/^website$/i)).toBeEnabled();
      expect(screen.getByLabelText(/certifications/i)).toBeEnabled();
      expect(screen.getByLabelText(/linkedin/i)).toBeEnabled();
      expect(screen.getByLabelText(/twitter/i)).toBeEnabled();
    });
  });

  describe('Profile Update', () => {
    it('saves profile successfully', async () => {
      // Mock successful update
      server.use(
        http.patch('/api/vendors/:id', () => {
          return HttpResponse.json({
            success: true,
            data: {
              vendor: {
                id: '1',
                companyName: 'Updated Company',
                description: 'Updated description',
              },
              message: 'Vendor profile updated successfully',
            },
          });
        })
      );

      renderWithTier(<VendorProfileEditor />, 'tier2');

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      });

      await fillAndSubmitForm({
        'Company Name': 'Updated Company',
        Description: 'Updated description',
      }, 'Save Profile');

      await waitFor(() => {
        expect(screen.getByText(/profile updated/i)).toBeInTheDocument();
      });
    });

    it('handles validation errors', async () => {
      // Mock validation error
      server.use(
        http.patch('/api/vendors/:id', () => {
          return HttpResponse.json(
            {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input data',
                fields: {
                  website: 'Invalid URL format',
                },
              },
            },
            { status: 400 }
          );
        })
      );

      renderWithTier(<VendorProfileEditor />, 'tier2');

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      });

      await fillAndSubmitForm({
        Website: 'invalid-url',
      }, 'Save Profile');

      await expectToHaveError('Website', 'Invalid URL format');
    });

    it('handles tier restriction errors', async () => {
      server.use(
        http.patch('/api/vendors/:id', () => {
          return HttpResponse.json(
            {
              success: false,
              error: {
                code: 'FORBIDDEN',
                message: 'Tier restriction: Fields website require tier1 or higher. Current tier: free',
              }
            },
            { status: 403 }
          );
        })
      );

      renderWithTier(<VendorProfileEditor />, 'free');

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      });

      // Free tier should see upgrade message for tier1 fields
      await expectToBeVisible(/upgrade to tier 1/i);
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner while fetching profile', async () => {
      renderWithTier(<VendorProfileEditor />, 'free');

      // Should show loading spinner initially
      expect(screen.getByText(/loading profile data/i)).toBeInTheDocument();

      // Wait for form to load
      await waitFor(() => {
        expect(screen.queryByText(/loading profile data/i)).not.toBeInTheDocument();
      });
    });

    it('disables form during save operation', async () => {
      server.use(
        http.patch('/api/vendors/:id', async () => {
          // Add delay to simulate slow network
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({
            success: true,
            data: {
              vendor: { id: '1' },
              message: 'Updated successfully',
            },
          });
        })
      );

      renderWithTier(<VendorProfileEditor />, 'tier2');

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      });

      await fillAndSubmitForm({
        'Company Name': 'Test Company',
      }, 'Save Profile');

      // Should show saving state
      await waitFor(() => {
        expect(screen.getByText(/saving/i)).toBeInTheDocument();
      });

      // Wait for save to complete
      await waitFor(() => {
        expect(screen.queryByText(/saving/i)).not.toBeInTheDocument();
      });
    });
  });
});

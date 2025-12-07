/**
 * @file ImportExecutionService.geocoding.test.ts
 * @description Unit tests for geocoding functionality in ImportExecutionService
 * Tests geocodeAddress method and HQ location geocoding during Excel import
 */

import { ImportExecutionService } from '@/lib/services/ImportExecutionService';
import type { RowValidationResult } from '@/lib/services/ImportValidationService';
import type { Vendor } from '@/lib/types';

// Mock Payload CMS
jest.mock('payload', () => ({
  __esModule: true,
  default: {
    findByID: jest.fn(),
    update: jest.fn(),
    create: jest.fn()
  }
}));

import payload from 'payload';

// Mock global fetch
global.fetch = jest.fn();

describe('ImportExecutionService - Geocoding', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default Payload mock implementations
    (payload.findByID as jest.Mock).mockResolvedValue({
      id: 'vendor-1',
      name: 'Test Vendor',
      locations: []
    });
    (payload.update as jest.Mock).mockImplementation((options) =>
      Promise.resolve(options.data)
    );
    (payload.create as jest.Mock).mockResolvedValue({ id: 'history-123' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('geocodeAddress', () => {
    it('should return coordinates for valid address', async () => {
      // Mock Photon API response with GeoJSON format [lng, lat]
      const mockPhotonResponse = {
        features: [
          {
            geometry: {
              coordinates: [-80.137314, 26.122439] // [longitude, latitude]
            }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPhotonResponse
      });

      // We need to test the private method indirectly through the public execute method
      const row: RowValidationResult = {
        rowNumber: 2,
        valid: true,
        errors: [],
        warnings: [],
        data: {
          hqAddress: '123 Marina Way',
          hqCity: 'Fort Lauderdale',
          hqCountry: 'USA'
        }
      };

      await ImportExecutionService.execute([row], {
        vendorId: 'vendor-1',
        userId: 'user-1',
        overwriteExisting: true,
        filename: 'test.xlsx'
      });

      // Verify fetch was called with correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://photon.komoot.io/api/?q='),
        expect.objectContaining({
          headers: { 'User-Agent': 'PaulThamesSuperyacht/1.0' }
        })
      );

      // Verify the vendor update includes coordinates
      const updateCall = (payload.update as jest.Mock).mock.calls[0][0];
      const updatedLocations = updateCall.data.locations;

      expect(updatedLocations).toHaveLength(1);
      expect(updatedLocations[0]).toMatchObject({
        address: '123 Marina Way',
        city: 'Fort Lauderdale',
        country: 'USA',
        isHQ: true,
        latitude: 26.122439, // Correctly swapped from GeoJSON [lng, lat]
        longitude: -80.137314
      });
    });

    it('should return null on API error', async () => {
      // Mock API error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const row: RowValidationResult = {
        rowNumber: 2,
        valid: true,
        errors: [],
        warnings: [],
        data: {
          hqAddress: '123 Marina Way',
          hqCity: 'Fort Lauderdale',
          hqCountry: 'USA'
        }
      };

      const result = await ImportExecutionService.execute([row], {
        vendorId: 'vendor-1',
        userId: 'user-1',
        overwriteExisting: true,
        filename: 'test.xlsx'
      });

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ImportExecution] Geocoding API error:',
        500
      );

      // Verify import still succeeded with null coordinates
      expect(result.success).toBe(true);
      const updateCall = (payload.update as jest.Mock).mock.calls[0][0];
      const updatedLocations = updateCall.data.locations;

      expect(updatedLocations[0].latitude).toBeNull();
      expect(updatedLocations[0].longitude).toBeNull();

      consoleSpy.mockRestore();
    });

    it('should return null when fetch throws exception', async () => {
      // Mock fetch to throw error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const row: RowValidationResult = {
        rowNumber: 2,
        valid: true,
        errors: [],
        warnings: [],
        data: {
          hqAddress: '123 Marina Way',
          hqCity: 'Fort Lauderdale',
          hqCountry: 'USA'
        }
      };

      const result = await ImportExecutionService.execute([row], {
        vendorId: 'vendor-1',
        userId: 'user-1',
        overwriteExisting: true,
        filename: 'test.xlsx'
      });

      // Verify error was logged but didn't throw
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ImportExecution] Geocoding failed:',
        expect.any(Error)
      );

      // Verify import still succeeded
      expect(result.success).toBe(true);

      consoleSpy.mockRestore();
    });

    it('should return null for empty address without making API call', async () => {
      const row: RowValidationResult = {
        rowNumber: 2,
        valid: true,
        errors: [],
        warnings: [],
        data: {
          hqAddress: '',
          hqCity: '',
          hqCountry: ''
        }
      };

      await ImportExecutionService.execute([row], {
        vendorId: 'vendor-1',
        userId: 'user-1',
        overwriteExisting: true,
        filename: 'test.xlsx'
      });

      // Verify fetch was NOT called for empty address
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return null when Photon API returns no results', async () => {
      // Mock Photon API response with no features
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ features: [] })
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const row: RowValidationResult = {
        rowNumber: 2,
        valid: true,
        errors: [],
        warnings: [],
        data: {
          hqAddress: 'Nonexistent Address 999',
          hqCity: 'Nowhere',
          hqCountry: 'Atlantis'
        }
      };

      await ImportExecutionService.execute([row], {
        vendorId: 'vendor-1',
        userId: 'user-1',
        overwriteExisting: true,
        filename: 'test.xlsx'
      });

      // Verify warning was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ImportExecution] No geocoding results for address:',
        'Nonexistent Address 999, Nowhere, Atlantis'
      );

      // Verify coordinates are null
      const updateCall = (payload.update as jest.Mock).mock.calls[0][0];
      const updatedLocations = updateCall.data.locations;
      expect(updatedLocations[0].latitude).toBeNull();
      expect(updatedLocations[0].longitude).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('buildHQLocationChange - new HQ', () => {
    it('should include coordinates for new HQ location', async () => {
      // Mock successful geocoding
      const mockPhotonResponse = {
        features: [
          {
            geometry: {
              coordinates: [-80.137314, 26.122439] // [lng, lat]
            }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPhotonResponse
      });

      const row: RowValidationResult = {
        rowNumber: 2,
        valid: true,
        errors: [],
        warnings: [],
        data: {
          hqAddress: '123 Marina Way',
          hqCity: 'Fort Lauderdale',
          hqCountry: 'USA'
        }
      };

      await ImportExecutionService.execute([row], {
        vendorId: 'vendor-1',
        userId: 'user-1',
        overwriteExisting: true,
        filename: 'test.xlsx'
      });

      const updateCall = (payload.update as jest.Mock).mock.calls[0][0];
      const newHQ = updateCall.data.locations[0];

      // Verify new HQ has all expected fields including geocoded coordinates
      expect(newHQ).toEqual({
        address: '123 Marina Way',
        city: 'Fort Lauderdale',
        country: 'USA',
        isHQ: true,
        latitude: 26.122439,
        longitude: -80.137314
      });
    });

    it('should create HQ with null coordinates when geocoding fails', async () => {
      // Mock geocoding failure
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API down'));

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const row: RowValidationResult = {
        rowNumber: 2,
        valid: true,
        errors: [],
        warnings: [],
        data: {
          hqAddress: '456 Port Street',
          hqCity: 'Miami',
          hqCountry: 'USA'
        }
      };

      const result = await ImportExecutionService.execute([row], {
        vendorId: 'vendor-1',
        userId: 'user-1',
        overwriteExisting: true,
        filename: 'test.xlsx'
      });

      // Verify import succeeded despite geocoding failure
      expect(result.success).toBe(true);

      const updateCall = (payload.update as jest.Mock).mock.calls[0][0];
      const newHQ = updateCall.data.locations[0];

      // Verify HQ was created with null coordinates
      expect(newHQ).toEqual({
        address: '456 Port Street',
        city: 'Miami',
        country: 'USA',
        isHQ: true,
        latitude: null,
        longitude: null
      });

      consoleSpy.mockRestore();
    });
  });

  describe('buildHQLocationChange - update existing HQ', () => {
    it('should update coordinates when address changes', async () => {
      // Setup existing vendor with HQ location
      const existingVendor: Partial<Vendor> = {
        id: 'vendor-1',
        name: 'Test Vendor',
        locations: [
          {
            id: 'loc-1',
            address: 'Old Address',
            city: 'Old City',
            country: 'Old Country',
            isHQ: true,
            latitude: 25.0,
            longitude: -80.0
          }
        ]
      };

      (payload.findByID as jest.Mock).mockResolvedValue(existingVendor);

      // Mock new geocoding result
      const mockPhotonResponse = {
        features: [
          {
            geometry: {
              coordinates: [-80.137314, 26.122439] // New coordinates
            }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPhotonResponse
      });

      const row: RowValidationResult = {
        rowNumber: 2,
        valid: true,
        errors: [],
        warnings: [],
        data: {
          hqAddress: 'New Address',
          hqCity: 'Fort Lauderdale',
          hqCountry: 'USA'
        }
      };

      await ImportExecutionService.execute([row], {
        vendorId: 'vendor-1',
        userId: 'user-1',
        overwriteExisting: true,
        filename: 'test.xlsx'
      });

      const updateCall = (payload.update as jest.Mock).mock.calls[0][0];
      const updatedHQ = updateCall.data.locations[0];

      // Verify HQ was updated with new address and coordinates
      expect(updatedHQ).toMatchObject({
        address: 'New Address',
        city: 'Fort Lauderdale',
        country: 'USA',
        isHQ: true,
        latitude: 26.122439, // New coordinates
        longitude: -80.137314
      });
    });

    it('should preserve old coordinates when address unchanged', async () => {
      // Setup existing vendor with HQ location
      const existingVendor: Partial<Vendor> = {
        id: 'vendor-1',
        name: 'Test Vendor',
        locations: [
          {
            id: 'loc-1',
            address: '123 Marina Way',
            city: 'Fort Lauderdale',
            country: 'USA',
            isHQ: true,
            latitude: 26.122439,
            longitude: -80.137314
          }
        ]
      };

      (payload.findByID as jest.Mock).mockResolvedValue(existingVendor);

      const row: RowValidationResult = {
        rowNumber: 2,
        valid: true,
        errors: [],
        warnings: [],
        data: {
          hqAddress: '123 Marina Way',
          hqCity: 'Fort Lauderdale',
          hqCountry: 'USA'
        }
      };

      await ImportExecutionService.execute([row], {
        vendorId: 'vendor-1',
        userId: 'user-1',
        overwriteExisting: true,
        filename: 'test.xlsx'
      });

      // Verify fetch was NOT called since address didn't change
      expect(global.fetch).not.toHaveBeenCalled();

      // Verify no update was made (no changes detected)
      expect(payload.update).not.toHaveBeenCalled();
    });

    it('should update coordinates when city changes but address same', async () => {
      // Setup existing vendor with HQ location
      const existingVendor: Partial<Vendor> = {
        id: 'vendor-1',
        name: 'Test Vendor',
        locations: [
          {
            id: 'loc-1',
            address: '123 Main Street',
            city: 'Old City',
            country: 'USA',
            isHQ: true,
            latitude: 25.0,
            longitude: -80.0
          }
        ]
      };

      (payload.findByID as jest.Mock).mockResolvedValue(existingVendor);

      // Mock new geocoding result
      const mockPhotonResponse = {
        features: [
          {
            geometry: {
              coordinates: [-81.0, 27.0]
            }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPhotonResponse
      });

      const row: RowValidationResult = {
        rowNumber: 2,
        valid: true,
        errors: [],
        warnings: [],
        data: {
          hqAddress: '123 Main Street',
          hqCity: 'New City',
          hqCountry: 'USA'
        }
      };

      await ImportExecutionService.execute([row], {
        vendorId: 'vendor-1',
        userId: 'user-1',
        overwriteExisting: true,
        filename: 'test.xlsx'
      });

      // Verify geocoding was called for updated address
      expect(global.fetch).toHaveBeenCalled();

      const updateCall = (payload.update as jest.Mock).mock.calls[0][0];
      const updatedHQ = updateCall.data.locations[0];

      // Verify coordinates were updated
      expect(updatedHQ.latitude).toBe(27.0);
      expect(updatedHQ.longitude).toBe(-81.0);
    });
  });

  describe('Import resilience', () => {
    it('should continue import if geocoding fails', async () => {
      // Mock geocoding to fail
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Service unavailable'));

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const row: RowValidationResult = {
        rowNumber: 2,
        valid: true,
        errors: [],
        warnings: [],
        data: {
          name: 'Updated Name',
          hqAddress: '123 Marina Way',
          hqCity: 'Fort Lauderdale',
          hqCountry: 'USA'
        }
      };

      const result = await ImportExecutionService.execute([row], {
        vendorId: 'vendor-1',
        userId: 'user-1',
        overwriteExisting: true,
        filename: 'test.xlsx'
      });

      // Verify import succeeded despite geocoding failure
      expect(result.success).toBe(true);
      expect(result.successfulRows).toBe(1);
      expect(result.failedRows).toBe(0);

      // Verify vendor was updated
      expect(payload.update).toHaveBeenCalled();
      const updateCall = (payload.update as jest.Mock).mock.calls[0][0];

      // Verify name was updated
      expect(updateCall.data.name).toBe('Updated Name');

      // Verify HQ location was created with null coordinates
      expect(updateCall.data.locations[0]).toMatchObject({
        address: '123 Marina Way',
        city: 'Fort Lauderdale',
        country: 'USA',
        isHQ: true,
        latitude: null,
        longitude: null
      });

      consoleSpy.mockRestore();
    });

    it('should not throw error when geocoding fails for multiple rows', async () => {
      // Mock geocoding to always fail
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Service down'));

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const rows: RowValidationResult[] = [
        {
          rowNumber: 2,
          valid: true,
          errors: [],
          warnings: [],
          data: {
            hqAddress: 'Address 1',
            hqCity: 'City 1',
            hqCountry: 'Country 1'
          }
        },
        {
          rowNumber: 3,
          valid: true,
          errors: [],
          warnings: [],
          data: {
            hqAddress: 'Address 2',
            hqCity: 'City 2',
            hqCountry: 'Country 2'
          }
        }
      ];

      const result = await ImportExecutionService.execute(rows, {
        vendorId: 'vendor-1',
        userId: 'user-1',
        overwriteExisting: true,
        filename: 'test.xlsx'
      });

      // Verify all rows succeeded despite geocoding failures
      expect(result.success).toBe(true);
      expect(result.successfulRows).toBe(2);
      expect(result.failedRows).toBe(0);

      // Verify geocoding was attempted for each row
      expect(global.fetch).toHaveBeenCalledTimes(2);

      consoleSpy.mockRestore();
    });
  });

  describe('Address formatting', () => {
    it('should construct full address from all HQ fields', async () => {
      const mockPhotonResponse = {
        features: [
          {
            geometry: {
              coordinates: [-80.137314, 26.122439]
            }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPhotonResponse
      });

      const row: RowValidationResult = {
        rowNumber: 2,
        valid: true,
        errors: [],
        warnings: [],
        data: {
          hqAddress: '123 Marina Way',
          hqCity: 'Fort Lauderdale',
          hqCountry: 'USA'
        }
      };

      await ImportExecutionService.execute([row], {
        vendorId: 'vendor-1',
        userId: 'user-1',
        overwriteExisting: true,
        filename: 'test.xlsx'
      });

      // Verify fetch was called with properly formatted address
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          encodeURIComponent('123 Marina Way, Fort Lauderdale, USA')
        ),
        expect.any(Object)
      );
    });

    it('should handle partial address fields', async () => {
      const mockPhotonResponse = {
        features: [
          {
            geometry: {
              coordinates: [-80.137314, 26.122439]
            }
          }
        ]
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockPhotonResponse
      });

      const row: RowValidationResult = {
        rowNumber: 2,
        valid: true,
        errors: [],
        warnings: [],
        data: {
          hqCity: 'Fort Lauderdale',
          hqCountry: 'USA'
          // No hqAddress
        }
      };

      await ImportExecutionService.execute([row], {
        vendorId: 'vendor-1',
        userId: 'user-1',
        overwriteExisting: true,
        filename: 'test.xlsx'
      });

      // Verify fetch was called with only available fields
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          encodeURIComponent('Fort Lauderdale, USA')
        ),
        expect.any(Object)
      );
    });
  });
});

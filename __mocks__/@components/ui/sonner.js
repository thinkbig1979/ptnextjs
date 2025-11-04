/**
 * Jest mock for @/components/ui/sonner
 * Provides mock implementations for toast notifications in tests
 */

module.exports = {
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
  Toaster: () => null,
};

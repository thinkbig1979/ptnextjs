/**
 * Mock for Payload CMS
 * Used in Jest tests to avoid importing the actual Payload package
 */

module.exports = {
  spawn: jest.fn(),
  getPayload: jest.fn(),
  buildConfig: jest.fn((config) => config), // Pass through config
  // Add other payload exports as needed
};

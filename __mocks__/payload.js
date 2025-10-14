/**
 * Mock for Payload CMS
 * Used in Jest tests to avoid importing the actual Payload package
 */

module.exports = {
  spawn: jest.fn(),
  getPayload: jest.fn(),
  // Add other payload exports as needed
};

/**
 * Mock for Payload CMS
 * Used in Jest tests to avoid importing the actual Payload package
 */

const payloadMock = {
  spawn: jest.fn(),
  getPayload: jest.fn(),
  buildConfig: jest.fn((config) => config),
  find: jest.fn(),
  findByID: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

module.exports = payloadMock;
module.exports.default = payloadMock;

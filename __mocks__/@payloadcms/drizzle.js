/**
 * Mock for @payloadcms/drizzle
 * Used in Jest tests to avoid importing the actual package
 */

module.exports = {
  beginTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
  updateMany: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
  count: jest.fn(),
  // Add other drizzle exports as needed
};

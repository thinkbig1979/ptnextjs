/**
 * Mock for @payloadcms/db-sqlite
 * Used in Jest tests to avoid importing the actual package
 */

module.exports = {
  sqliteAdapter: jest.fn(() => ({
    name: 'sqlite',
  })),
};

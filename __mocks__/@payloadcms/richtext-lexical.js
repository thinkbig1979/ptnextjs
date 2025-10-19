/**
 * Mock for @payloadcms/richtext-lexical
 * Used in Jest tests to avoid importing the actual Lexical package
 */

module.exports = {
  lexicalEditor: jest.fn(() => ({})),
  // Add other exports as needed
};

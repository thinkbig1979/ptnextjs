// Mock for marked library
const marked = jest.fn((text) => {
  // Simple mock that returns basic HTML structure
  return `<p>${text}</p>`;
});

marked.parse = jest.fn((text) => `<p>${text}</p>`);
marked.setOptions = jest.fn();
marked.use = jest.fn();

module.exports = { marked };
module.exports.marked = marked;
module.exports.default = marked;

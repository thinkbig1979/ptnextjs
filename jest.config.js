const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^marked$': '<rootDir>/__mocks__/marked.js',
    '^payload$': '<rootDir>/__mocks__/payload.js',
    '^@payloadcms/db-sqlite$': '<rootDir>/__mocks__/@payloadcms/db-sqlite.js',
    '^@payloadcms/db-postgres$': '<rootDir>/__mocks__/@payloadcms/db-postgres.js',
    '^@payloadcms/drizzle$': '<rootDir>/__mocks__/@payloadcms/drizzle.js',
    '^@payloadcms/richtext-lexical$': '<rootDir>/__mocks__/@payloadcms/richtext-lexical.js',
  },
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/e2e/',  // Exclude Playwright E2E tests
    '<rootDir>/e2e/',         // Exclude any other Playwright tests
    '\\.spec\\.(ts|tsx|js|jsx)$',  // Exclude all .spec.* files (Playwright convention)
  ],
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)',
    '**/*.(test|spec).(ts|tsx|js|jsx)',
    '!**/__tests__/fixtures/**',     // Exclude fixture files
    '!**/__tests__/utils/**',        // Exclude utility files
    '!**/__tests__/docs/**',         // Exclude documentation templates
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-three/fiber|react-pdf|react-player|three|@react-three/drei|msw|@mswjs|until-async)/)'
  ],
  testTimeout: 15000,
  maxWorkers: 2,
};

module.exports = createJestConfig(customJestConfig);

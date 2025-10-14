const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFiles: ['<rootDir>/test-polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/test-setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^marked$': '<rootDir>/__mocks__/marked.js',
    '^payload$': '<rootDir>/__mocks__/payload.js',
    '^@payloadcms/db-sqlite$': '<rootDir>/__mocks__/@payloadcms/db-sqlite.js',
    '^@payloadcms/drizzle$': '<rootDir>/__mocks__/@payloadcms/drizzle.js',
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
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-three/fiber|react-pdf|react-player|three|@react-three/drei|msw|@mswjs|until-async)/)'
  ],
  testTimeout: 15000,
  maxWorkers: 2,
};

module.exports = createJestConfig(customJestConfig);

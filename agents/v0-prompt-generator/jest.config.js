const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  projects: [
    {
      displayName: 'unit',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testEnvironment: 'jsdom',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      testMatch: [
        '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
        '!<rootDir>/src/**/*.integration.{test,spec}.{js,jsx,ts,tsx}',
      ],
      collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/app/layout.tsx',
        '!src/app/globals.css',
        '!src/__tests__/setup/**',
      ],
    },
    {
      displayName: 'integration',
      setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js',
        '<rootDir>/src/__tests__/setup/integration-test-setup.ts',
      ],
      testEnvironment: 'jsdom',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      testMatch: ['<rootDir>/src/**/*.integration.{test,spec}.{js,jsx,ts,tsx}'],
      testTimeout: 30000, // 30 seconds for integration tests
      collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/app/layout.tsx',
        '!src/app/globals.css',
        '!src/__tests__/setup/**',
      ],
    },
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);

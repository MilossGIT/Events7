module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^axios$': require.resolve('axios'),
  },
  transformIgnorePatterns: ['node_modules/(?!(axios)/)'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};

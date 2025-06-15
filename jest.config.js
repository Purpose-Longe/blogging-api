module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: [],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: false,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 30000 // 30 seconds
};
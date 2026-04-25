module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  clearMocks: true,
  verbose: true,
  setupFiles: ['./tests/setEnvVars.js'],
  setupFilesAfterEnv: ['./tests/setup.js']
};

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.js'],
  clearMocks: true,
  collectCoverageFrom: [
    'src/modules/financial-calendar/**/*.js',
    '!src/**/__tests__/**'
  ]
};

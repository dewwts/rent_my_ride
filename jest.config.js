module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    // Maps imports starting with @/ to the src/ directory
    '^@/(.*)$': '<rootDir>/$1',
  },
};
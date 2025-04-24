module.exports = {
    preset: 'ts-jest/presets/js-with-ts',
    testEnvironment: 'jsdom',
    transformIgnorePatterns: [
      '/node_modules/(?!axios)',
    ],
    moduleNameMapper: {
      '^axios$': require.resolve('axios'),
    },
  };
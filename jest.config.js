module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
      babelConfig: true,
      diagnostics: false,
    },
  },
  transform: {
    '^.+\\.(js|ts)$': 'ts-jest',
  },
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.(test|spec).(js|ts)'],
}

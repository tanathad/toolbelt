module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:jest/all',
  ],
  plugins: [],
  env: {
    node: true,
  },
  rules: {
    'implicit-arrow-linebreak': 0,
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          'scripts/*.js',
          'test/**/*.js'
        ]
      },
    ],
    'jest/no-hooks': 0,
    'jest/no-standalone-expect': 0,
    'no-console': 0,
    'no-param-reassign': 0,
  },
};

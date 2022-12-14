module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings'
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      modules: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['babel'],
  rules: {
    'no-console': 0,
    'no-mixed-spaces-and-tabs': 1,
    'comma-dangle': 0,
    'no-param-reassign': ['warn', { props: false }],
    'no-unused-vars': 1,
    eqeqeq: [2, 'smart'],
    'no-useless-concat': 2,
    'default-case': 2,
    'no-self-compare': 2,
    'prefer-const': 2,
    'object-shorthand': 1,
    'array-callback-return': 2,
    'valid-typeof': 2,
    'arrow-body-style': 2,
    'require-await': 2,
    'no-var': 2,
    'linebreak-style': [2, 'unix'],
    semi: [1, 'always'],
    'prefer-destructuring': [
      'error',
      { array: true, object: true },
      { enforceForRenamedProperties: false }
    ],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
    'import/no-unresolved': [2, { commonjs: true, amd: true }],
    'import/named': 2,
    'import/namespace': 2,
    'import/default': 2,
    'import/export': 2,
    'import/first': 2,
    'no-underscore-dangle': 'warn',
    'max-len': ['warn', { code: 120 }],
    'import/order': ['error'],
    'import/no-named-as-default': 'warn',
    'import/prefer-default-export': 'off'
  }
};

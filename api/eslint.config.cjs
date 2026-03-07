const tsPlugin = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')
const importPlugin = require('eslint-plugin-import')

module.exports = [
  {
    ignores: [ 'dist/**', 'node_modules/**', 'eslint.config.cjs' ],
  },
  {
    files: [ '*.ts', '**/*.ts' ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
    },
    rules: {
      semi: [ 'warn', 'never' ],
      'no-multi-spaces': ['warn', { ignoreEOLComments: true }],
      indent: [ 'warn', 'tab', { ignoredNodes: [ 'ClassBody > PropertyDefinition[decorators.length > 0] > .key' ] } ],
      quotes: [ 'warn', 'single' ],
      'comma-spacing': [ 'warn', { before: false, after: true } ],
      'key-spacing': [ 'warn', { beforeColon: false, afterColon: true } ],
      'object-curly-spacing': [ 'warn', 'always', { arraysInObjects: true } ],
      'array-bracket-spacing': [ 'warn', 'always' ],
      'keyword-spacing': [ 'warn', { before: true, after: true } ],
      'space-infix-ops': 'warn',
      'space-before-blocks': 'warn',
      'no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 0, maxBOF: 0 }],
      '@typescript-eslint/no-unused-vars': [ 'warn', { argsIgnorePattern: '^_' } ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
]
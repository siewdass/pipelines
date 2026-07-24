import tseslint from 'typescript-eslint'

const rules = {
	semi: ['warn', 'never'],
	'no-multi-spaces': 'error',
	indent: ['warn', 'tab'],
	quotes: ['warn', 'single'],
	'space-in-parens': ['warn', 'never'],
	'comma-spacing': ['warn', { before: false, after: true }],
	'key-spacing': ['warn', { beforeColon: false, afterColon: true }],
	'object-curly-spacing': ['warn', 'always', { arraysInObjects: true }],
	'array-bracket-spacing': ['warn', 'always'],
	'keyword-spacing': ['warn', { before: true, after: true }],
	'space-infix-ops': 'warn',
	'space-before-blocks': 'warn',
	'no-multiple-empty-lines': 'warn',
}

export default tseslint.config(
	{
		ignores: [
			'**/node_modules/**',
			'**/dist/**',
			'**/studio/**',
			'**/.opencode/**',
		]
	},
	...tseslint.configs.recommended,
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
				ecmaFeatures: { jsx: true }
			}
		},
		rules: {
			...rules,
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
		}
	}
)

import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

/**
 * @see https://eslint.org/docs/user-guide/configuring
 * @type {import("eslint").Linter.Config}
 */
export default [
  js.configs.recommended,
  eslintPluginPrettierRecommended,
  importPlugin.flatConfigs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
  },
  {
    rules: {
      'import/no-unresolved': 'off',
      'prettier/prettier': 'warn',
      'no-console': 'off',
      'prefer-object-spread': 'warn',
      'prefer-spread': 'warn',
      'prefer-const': 'error',
      'no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],
      'no-useless-escape': 'off',
      camelcase: ['warn', { properties: 'never' }],
      'no-new': 'warn',
      'new-cap': ['error', { newIsCap: true, capIsNew: false }],
      'no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
      ],
    },
  },
];

import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

const sharedJs = {
  languageOptions: {
    ecmaVersion: 2024,
  },
  linterOptions: {
    reportUnusedDisableDirectives: 'error',
  },
};

export default [
  {
    ignores: ['node_modules/**', 'data/**', '.cursor/**', '.claude/**', 'package-lock.json'],
  },
  js.configs.recommended,
  eslintConfigPrettier,
  {
    ...sharedJs,
    files: ['server.js', 'api/**/*.js', 'test/**/*.js'],
    languageOptions: {
      ...sharedJs.languageOptions,
      globals: globals.node,
      sourceType: 'commonjs',
    },
  },
  {
    ...sharedJs,
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      ...sharedJs.languageOptions,
      globals: globals.node,
      sourceType: 'module',
    },
  },
  {
    ...sharedJs,
    files: ['js/**/*.js'],
    languageOptions: {
      ...sharedJs.languageOptions,
      globals: {
        ...globals.browser,
      },
      sourceType: 'script',
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
    },
  },
];

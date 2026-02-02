import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  {
    files: ['.vite/deps/**', '**/.vite/deps/**'],
    linterOptions: {
      noInlineConfig: true,
    },
    rules: {},
  },
  {
    ignores: ['.vite/**', '**/.vite/**', '**/.vite/deps/**', '.vite/deps/**'],
  },
  {
    ignores: ['.vite/**', '**/.vite/**', '**/.vite/deps/**'],
  },
  globalIgnores([
    'dist',
    '.vite',
    '.vite/**',
    '**/.vite',
    '**/.vite/**',
    '**/.vite/deps/**',
    '**/node_modules/**',
    '**/.*',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'react-hooks/set-state-in-effect': 'error',
      'react-refresh/only-export-components': 'error',
    },
  },
  {
    files: ['src/components/workflow/DecisionConfigModal.tsx'],
    rules: {
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
  {
    files: ['src/pages/ToolPlaygroundPage.tsx'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['src/contexts/ApiKeyContext.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])

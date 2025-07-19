import { defineConfig } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import js from '@eslint/js';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    extends: ['js/recommended', prettierConfig],
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js, perfectionist, prettier },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: { globals: globals.browser },
  },
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    settings: { react: { version: '19.0' } },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    ignores: ['**/*.styled.tsx'], // ignore .styled.tsx for perfectionist rules
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          customGroups: {
            value: {
              'mui-material': '^@mui/material/(?!styles)',
              'mui-styles': '@mui/material/styles',
              'react-router-dom': 'react-router-dom',
            },
          },
          groups: [
            ['builtin', 'external'],
            'react-router-dom',
            'mui-styles',
            'mui-material',
            'internal-type',
            'internal',
            ['parent-type', 'sibling-type', 'index-type'],
            ['parent', 'sibling', 'index'],
            'type',
          ],
          ignoreCase: true,
          order: 'asc',
          specialCharacters: 'remove',
          type: 'alphabetical',
        },
      ],
      'perfectionist/sort-objects': 'error',
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    files: ['**/*.styled.tsx'], // just for .styled.tsx files
    rules: {
      // disable perfectionist sorting rules for .styled.tsx files
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-objects': 'off',
    },
  },
]);

import globals from 'globals';
import js from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginJest from 'eslint-plugin-jest';

export default [
  js.configs.recommended,
  pluginReact.configs.flat.recommended,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  {
    files: ['test/**/*.js'],

    plugins: {
      jest: pluginJest,
    },

    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
  },
];

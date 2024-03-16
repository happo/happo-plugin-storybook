import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['./**/*.mdx', './**/*.stories.@(js|jsx|ts|tsx)'],

  addons: process.env.DISABLE_ADDONS
    ? []
    : [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        './local-preset.js',
      ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};
export default config;

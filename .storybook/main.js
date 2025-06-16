const result = {
  stories: ['./**/*.stories.js'],
  staticDirs: ['../public'],

  addons: [
    'storybook/actions',
    '../preset.js',
    '@storybook/addon-webpack5-compiler-babel',
  ],

  docs: {
    autodocs: true,
  },
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
};

module.exports = result;

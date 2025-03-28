const result = {
  stories: ['./**/*.stories.js'],
  staticDirs: ['../public'],
  core: {
    channelOptions: {
      allowFunction: true,
    },
  },

  addons: process.env.DISABLE_ADDONS
    ? []
    : [
        '@storybook/addon-actions',
        '@storybook/addon-interactions',
        '../preset.js',
        '@storybook/addon-webpack5-compiler-babel',
      ],

  docs: {
    autodocs: true,
  },
};

if (process.env.DISABLE_REACT_WEBPACK5_FRAMEWORK) {
  result.framework = '@storybook/react';
} else {
  result.framework = {
    name: '@storybook/react-webpack5',
    options: {},
  };
}

module.exports = result;

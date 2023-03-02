const result = {
  features: {
    storyStoreV7: process.env.USE_STORYSTORE_V7 !== 'false',
  },
  stories: ['./**/*.stories.js'],
  staticDirs: ['../public'],
  addons: process.env.DISABLE_ADDONS
    ? []
    : [
        '@storybook/addon-actions',
        '@storybook/addon-interactions',
        '../preset.js',
      ],
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

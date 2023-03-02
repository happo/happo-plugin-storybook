const framework = process.env.DISABLE_REACT_WEBPACK5_FRAMEWORK
  ? '@storybook/react'
  : {
      name: '@storybook/react-webpack5',
      options: {},
    };

module.exports = {
  features: {
    storyStoreV7: process.env.USE_STORYSTORE_V7 !== 'false',
  },
  stories: ['./**/*.stories.js'],
  addons: process.env.DISABLE_ADDONS
    ? []
    : [
        '@storybook/addon-actions',
        '@storybook/addon-interactions',
        '../preset.js',
      ],
  framework,
};

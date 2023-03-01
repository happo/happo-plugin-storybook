const framework = process.env.DISABLE_REACT_WEBPACK5_FRAMEWORK
  ? undefined
  : {
      name: '@storybook/react-webpack5',
      options: {},
    };

module.exports = {
  features: {
    storyStoreV7: process.env.USE_STORYSTORE_V7 !== 'false',
  },
  stories: ['./**/*.stories.js'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-interactions',
    '../preset.js',
  ],
  framework,
};

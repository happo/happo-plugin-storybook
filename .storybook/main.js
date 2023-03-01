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
  framework: {
    name: process.env.DISABLE_REACT_WEBPACK5_FRAMEWORK
      ? '@storybook/react'
      : '@storybook/react-webpack5',
    options: {},
  },
};

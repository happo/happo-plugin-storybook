module.exports = {
  features: {
    storyStoreV7: process.env.USE_STORYSTORE_V7 !== 'false',
  },
  stories: ['./*.stories.js'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-interactions',
    '../preset.js',
  ],
};

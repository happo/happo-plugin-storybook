module.exports = {
  features: {
    storyStoreV7: process.env.STORYBOOK_VERSION === '6',
  },
  stories: ['./*.stories.js'],
  addons: process.env.STORYBOOK_VERSION === '6' ? [
    '@storybook/addon-actions',
    '@storybook/addon-interactions',
    '../preset.js',
  ] : [],
};

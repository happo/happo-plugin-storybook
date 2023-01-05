module.exports = {
  features: {
    storyStoreV7: process.env.STORYBOOK_VERSION === '6',
  },
  stories: ['./*.stories.js'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-interactions',
    process.env.STORYBOOK_VERSION === '6' ? '../preset.js' : undefined,
  ].filter(Boolean),
};

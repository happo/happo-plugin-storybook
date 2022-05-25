module.exports = {
  features: {
    storyStoreV7: process.env.STORYBOOK_VERSION === '6',
  },
  stories: ['./*.stories.js'],
  addons: ['@storybook/addon-interactions'],
};

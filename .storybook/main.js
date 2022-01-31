const { STORYBOOK_VERSION } = process.env;

module.exports = {
  features: {
    storyStoreV7: STORYBOOK_VERSION === '6',
  },
  stories: ['./*.stories.js'],
};

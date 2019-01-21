const path = require('path');

const { RemoteBrowserTarget } = require('happo.io');

const happoPluginStorybook = require('.');

module.exports = {
  targets: {
    chrome: new RemoteBrowserTarget('chrome', { viewport: '800x600' }),
  },
  plugins: [happoPluginStorybook({ configDir: '.storybook', outputDir: '.happo-out' })],
  stylesheets: [path.resolve(__dirname, 'test.css')],
};

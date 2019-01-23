const path = require('path');

const { RemoteBrowserTarget } = require('happo.io');

const happoPluginStorybook = require('.');

module.exports = {
  targets: {
    chrome: new RemoteBrowserTarget('chrome', { viewport: '800x600' }),
    firefox: new RemoteBrowserTarget('firefox', { viewport: '800x600' }),
    edge: new RemoteBrowserTarget('edge', { viewport: '800x600' }),
    safari: new RemoteBrowserTarget('safari', { viewport: '800x600' }),
    ie: new RemoteBrowserTarget('internet explorer', { viewport: '800x600' }),
    iosSafari: new RemoteBrowserTarget('ios-safari', { viewport: '375x600' }),
  },
  plugins: [happoPluginStorybook({ configDir: '.storybook', outputDir: '.happo-out' })],
  stylesheets: [path.resolve(__dirname, 'test.css')],
};

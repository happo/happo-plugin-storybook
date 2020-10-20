const path = require('path');

const { RemoteBrowserTarget } = require('happo.io');

const happoPluginStorybook = require('.');

module.exports = {
  targets: {
    chrome: new RemoteBrowserTarget('chrome', {
      viewport: '800x600',
      chunks: 4,
    }),
    firefox: new RemoteBrowserTarget('firefox', {
      viewport: '800x600',
      chunks: 2,
    }),
    edge: new RemoteBrowserTarget('edge', { viewport: '800x600', chunks: 1 }),
    safari: new RemoteBrowserTarget('safari', {
      viewport: '800x600',
      chunks: 2,
    }),
    ie: new RemoteBrowserTarget('internet explorer', {
      viewport: '800x600',
      chunks: 2,
    }),
    iosSafari: new RemoteBrowserTarget('ios-safari', {
      viewport: '375x600',
      chunks: 2,
    }),
  },
  plugins: [
    happoPluginStorybook({
      configDir: '.storybook',
      outputDir: '.happo-out',
      staticDir: 'public',
      usePrebuiltPackage: !!process.env.HAPPO_USE_PREBUILT_PACKAGE,
    }),
  ],
  stylesheets: [path.resolve(__dirname, 'test.css')],
};

const path = require('path');

const { RemoteBrowserTarget } = require('happo.io');

const happoPluginStorybook = require('.');

module.exports = {
  project: process.env.HAPPO_PROJECT,
  targets: {
    chrome: new RemoteBrowserTarget('chrome', {
      viewport: '800x600',
      chunks: 4,
      allowPointerEvents: true,
    }),
    firefox: new RemoteBrowserTarget('firefox', {
      viewport: '800x600',
      chunks: 2,
      allowPointerEvents: true,
    }),
    edge: new RemoteBrowserTarget('edge', {
      viewport: '800x600',
      chunks: 1,
      allowPointerEvents: true,
    }),
    safari: new RemoteBrowserTarget('safari', {
      viewport: '800x600',
      chunks: 2,
      allowPointerEvents: true,
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
      usePrebuiltPackage: !!process.env.HAPPO_USE_PREBUILT_PACKAGE,
    }),
  ],
  stylesheets: [path.resolve(__dirname, 'test.css')],
};

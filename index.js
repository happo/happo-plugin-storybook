const path = require('path');

const defaultStorybookConfig = require('@storybook/core/dist/server/config/defaults/webpack.config.js');
const webpack = require('webpack');

module.exports = function happoStorybookPlugin() {
  return {
    customizeWebpackConfig: config => {
      const storybookWebpackConfig = require(path.resolve(
        process.cwd(),
        '.storybook',
        'webpack.config.js',
      ));
      if (typeof storybookWebpackConfig === 'function') {
        // full control mode
        return storybookWebpackConfig(config, 'DEVELOPMENT', defaultStorybookConfig);
      }
      config.module.rules.push(...storybookWebpackConfig.module.rules);
      return config;
    },

    pathToExamplesFile: path.resolve(__dirname, 'happoExamples.js'),
  };
}

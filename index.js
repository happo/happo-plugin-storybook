const path = require('path');
const fs = require('fs');
const defaultStorybookConfig = require('@storybook/core/dist/server/config/defaults/webpack.config.js');
const webpack = require('webpack');

module.exports = function happoPluginStorybook({ configDir = '.storybook', ignoredStories = [] } = {}) {
  return {
    customizeWebpackConfig: config => {
      config.plugins.push(
        new webpack.DefinePlugin({
          HAPPO_STORYBOOK_CONFIG_FILE: JSON.stringify(
            path.resolve(process.cwd(), configDir, 'config.js'),
          ),
          HAPPO_STORYBOOK_IGNORED_STORIES: JSON.stringify(ignoredStories),
        }),
      );
      const pathToStorybookConfig = path.resolve(
        process.cwd(),
        configDir,
        'webpack.config.js',
      );

      if (!fs.existsSync(pathToStorybookConfig)) {
        return config;
      }

      const storybookWebpackConfig = require(pathToStorybookConfig);
      if (typeof storybookWebpackConfig === 'function') {
        // full control mode
        return storybookWebpackConfig(config, 'DEVELOPMENT', defaultStorybookConfig(config));
      }
      config.module.rules.push(...storybookWebpackConfig.module.rules);
      return config;
    },

    pathToExamplesFile: path.resolve(__dirname, 'happoExamples.js'),
  };
};

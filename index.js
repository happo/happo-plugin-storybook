const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

function getDefaultStorybookWebpackConfig() {
  try {
    // storybook@3
    return require('@storybook/core/dist/server/config/defaults/webpack.config.js');
  } catch (e) {
    // storybook@<4.1.0
    try {
      return require('@storybook/core/dist/server/config/webpack.config.default');
    } catch (err) {
      // storybook@>4.1.0, storybook@5
      return require('@storybook/core/dist/server/preview/base-webpack.config.js')
    }
  }
}

module.exports = function happoPluginStorybook({
  configDir = '.storybook',
  ignoredStories = [],
} = {}) {
  return {
    customizeWebpackConfig: config => {
      config.plugins.push(
        new webpack.DefinePlugin({
          HAPPO: true,
          HAPPO_STORYBOOK_CONFIG_FILE: JSON.stringify(
            path.resolve(process.cwd(), configDir, 'config.js'),
          ),
          HAPPO_STORYBOOK_IGNORED_STORIES: JSON.stringify(ignoredStories),
        }),
      );
      const pathToStorybookConfig = path.resolve(process.cwd(), configDir, 'webpack.config.js');

      if (!fs.existsSync(pathToStorybookConfig)) {
        return config;
      }

      let storybookWebpackConfig = require(pathToStorybookConfig);
      if (typeof storybookWebpackConfig === 'function') {
        // full control mode
        const baseConfig = getDefaultStorybookWebpackConfig().createDefaultWebpackConfig(config);
        storybookWebpackConfig = storybookWebpackConfig(
          baseConfig,
          'DEVELOPMENT',
          baseConfig,
        );
      }
      config.module.rules.push(...storybookWebpackConfig.module.rules);
      return config;
    },

    pathToExamplesFile: path.resolve(__dirname, 'happoExamples.js'),
  };
};

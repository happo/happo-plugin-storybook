const path = require('path');

module.exports = args => {
  const config = args.config || args; // storybook@v4 v5 compat
  config.resolve.extensions = ['.tsx', '.ts', '.js', '.jsx'];
  const babelLoader = config.module.rules.find(({ use }) => {
    return use && /babel-loader/.test(use[0].loader);
  });
  if (babelLoader && babelLoader.exclude) {
    if (babelLoader.exclude instanceof RegExp) {
      babelLoader.exclude = [babelLoader.exclude];
    }
    babelLoader.exclude.push(path.resolve(__dirname, '../register.js'));
    babelLoader.exclude.push(path.resolve(__dirname, '../addon.js'));
    babelLoader.exclude.push(path.resolve(__dirname, '../preset.js'));
    babelLoader.exclude.push(path.resolve(__dirname, '../decorator.js'));
  }

  if (config.module.rules.some(({ loader }) => /file-loader/.test(loader))) {
    return config;
  }
  config.module.rules.push({
    test: /\.(jpg|png|otf|ttf|woff|woff2|eot|pdf)$/,
    loader: require.resolve('file-loader'),
    options: {
      name: 'static/media/[name].[hash:8].[ext]',
      publicPath: '/',
    },
  });
  return config;
};

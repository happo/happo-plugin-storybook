const path = require('path');

module.exports = (args) => {
  const config = args.config || args; // storybook@v4 v5 compat
  config.resolve.extensions = ['.tsx', '.ts', '.js', '.jsx'];
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

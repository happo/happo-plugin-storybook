const path = require('path');

const result = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(jpg|png|otf|ttf|woff|woff2|eot|pdf)$/,
        loader: require.resolve('file-loader'),
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
          publicPath: '/',
        },
      },
    ],
  },
};

module.exports = result;
// module.exports = {};

const path = require('path');

const srcPath = path.resolve(__dirname, 'src');

const cssRules = [
  {
    loader: "style-loader",
  },
  {
    loader: "css-loader",
    options: {
      importLoaders: 1,
      localIdentName: "[folder]--[local]--[hash:base64:6]",
    },
  },
  {
    loader: "postcss-loader",
    options: {
      ident: "postcss",
      plugins: () => [
        require("postcss-flexbugs-fixes"), // eslint-disable-line global-require
        autoprefixer({
          browsers: [
            ">1%",
            "last 4 versions",
            "Firefox ESR",
            "not ie < 9", // React doesn't support IE8 anyway
          ],
          flexbox: "no-2009",
        }),
      ],
    },
  },
];

const rules = [
  {
    test: /\.scss$/,
    use: [
      ...cssRules,
      {
        loader: "sass-loader",
      },
    ],
  },
  {
    test: /\.css$/,
    use: cssRules,
  },
  {
    test: /\.(jpg|png|otf|ttf|woff|woff2|eot|pdf)$/,
    loader: require.resolve("file-loader"),
    options: {
      name: "static/media/[name].[hash:8].[ext]",
      publicPath: "/",
    },
  },
  {
    test: /\.svg$/,
    use: {
      loader: require.resolve("raw-loader"),
    },
  },
];




const result = (storybookBaseConfig, configType) => {
  return {
    ...storybookBaseConfig,
    entry: { polyfill: "@babel/polyfill", main: storybookBaseConfig.entry },
    devtool:
      configType === "PRODUCTION"
        ? storybookBaseConfig.devtool
        : "eval-source-map",
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".jsx"],
      modules: [path.resolve(__dirname, '..', 'node_modules'), srcPath],
      alias: { "@assets": path.resolve(__dirname, '../test/static') },
    },
    module: {
      rules: [...storybookBaseConfig.module.rules, ...rules],
    },
  };
};

module.exports = result;
// module.exports = {};

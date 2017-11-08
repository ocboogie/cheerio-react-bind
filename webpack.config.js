const path = require("path");

const CleanWebpackPlugin = require("clean-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const UnminifiedWebpackPlugin = require("unminified-webpack-plugin");

const plugins = [];

if (process.env.NODE_ENV !== "development") {
  plugins.push(
    new UglifyJsPlugin(),
    new UnminifiedWebpackPlugin(),
    new CleanWebpackPlugin(["lib"])
  );
}

module.exports = {
  devtool: "source-map",
  entry: path.join(__dirname, "src/index.js"),
  output: {
    path: path.join(__dirname, "lib"),
    libraryTarget: "umd",
    filename: `cheerio-react-bind${
      process.env.NODE_ENV === "development" ? "" : ".min"
    }.js`,
    library: `cheerioReactBind.js`,
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: ["babel-loader", "eslint-loader"]
      }
    ]
  },
  resolve: {
    extensions: [".json", ".js"]
  },
  plugins
};

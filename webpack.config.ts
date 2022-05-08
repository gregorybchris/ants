const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const PORT = 3000;

module.exports = {
  entry: {
    index: path.resolve(__dirname, "./src/index.tsx"),
  },
  devServer: {
    // allowedHosts: [".chrisgregory.me"],
    historyApiFallback: true,
    hot: true,
    open: true,
    port: PORT,
    static: {
      directory: path.resolve(__dirname, "dist"),
    },
  },
  output: {
    publicPath: "auto",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    fallback: {
      stream: require.resolve("stream-browserify"),
      http: false,
      https: false,
      url: false,
      buffer: false,
      timers: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.(css|s[ac]ss)$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader", "sass-loader"],
      },
      {
        test: /\.(jpg|png|svg)$/,
        use: "url-loader",
      },
      {
        test: /\.(ts|tsx)$/,
        use: "ts-loader",
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].bundle.css",
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./public/index.html"),
    }),
  ],
};

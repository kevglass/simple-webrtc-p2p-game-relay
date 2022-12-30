const path = require('path');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  },
  plugins: [
  ],
  resolve: {
    plugins: [new TsConfigPathsPlugin({})],
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: 'eval-source-map',
  output: {
    globalObject: 'this',
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: "server-library",
    libraryTarget: 'umd'
  },
  target: 'node'
};

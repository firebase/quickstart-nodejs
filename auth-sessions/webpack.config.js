const webpack = require('webpack');

module.exports = {
  entry: './script.js',
  mode: 'none',
  output: {
    filename: './public/bundle.js',
    path: __dirname,
  },
  optimization: {
    minimize: true
  }
}


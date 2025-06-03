const path = require('path');
module.exports = {
  entry: './src/app.jsx',
 output: {
  path: path.resolve(__dirname, 'dist'),
  filename: '[name].[contenthash].js',
  chunkFilename: '[name].[contenthash].chunk.js',
},
optimization: {
  splitChunks: { chunks: 'all' },
},
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
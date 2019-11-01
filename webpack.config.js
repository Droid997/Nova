const path = require('path');

module.exports = {
  entry: './src/nova.core.ts',
  resolve: {
    extensions: ['.ts','.js']
  },
  watch: false,
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'nova.min.js'
  },
  devServer: {
    contentBase: path.join(__dirname, "/dist/"),
    port: 9000
},
  module: {
    rules: [
      { 
        test: /\.ts?$/, 
        loader: 'awesome-typescript-loader'
      }
    ]
  }
}
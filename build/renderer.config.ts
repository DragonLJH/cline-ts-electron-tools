import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Configuration } from 'webpack';
import { createBaseConfig } from './base.config';

const renderer: Configuration & { devServer?: any } = {
  ...createBaseConfig(),
  mode: 'development',
  entry: './src/index.tsx',
  target: 'web',
  output: {
    ...createBaseConfig().output,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      ...createBaseConfig().module.rules,
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }),
  ],
  devServer: {
    compress: true,
    port: 3000,
    historyApiFallback: true, // 支持SPA路由
    open: false, // 不自动打开浏览器
  },
};

export default renderer;
